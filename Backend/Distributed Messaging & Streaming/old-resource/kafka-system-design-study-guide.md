# Kafka at Sokrio — System Design & DevOps Study Guide

> For new devs joining `sokrio-server`. This is not Kafka-in-general theory —
> it's how *we* use it, why it looks the way it does, and the real production
> incidents that shaped it. Written 2026-09-08, reconstructed entirely from
> `git log` on `sokrio-server` (branch history, not GitHub PR metadata — `gh`
> CLI isn't available in this environment and the GitHub API needs a token we
> don't have here; every commit hash below is checkable with
> `git show <hash>`).

---

## 1. Why Kafka exists in this codebase at all

Sokrio is a multi-tenant Laravel monolith. Most things happen synchronously
inside an HTTP request or a scheduled batch job (`app/Console/Kernel.php` is
full of `dailyAt()`/`hourlyAt()` cron entries dispatching queue jobs). That's
fine for CRUD, but it breaks down for two kinds of work:

1. **High-frequency, low-value-per-event data** (GPS tracking pings from
   field reps) — writing every point synchronously in the request would be
   wasteful and slow the mobile app down for no user-visible benefit.
2. **Data that should reflect near-real-time but is currently only
   correct after an hourly/nightly batch job** — e.g. primary order/delivery
   summaries today only fully update once an hour (see the companion plan
   `primary-order-delivery-kafka-plan.md` in this folder for a concrete
   example of this problem).

Kafka gives us a durable, ordered (per-partition), replayable buffer between
"something happened" (a producer, usually inside a request) and "go do the
expensive/slow part" (a consumer, running as its own long-lived process,
decoupled from request latency and from the cron schedule).

**This is not a general pub/sub bus for everything.** As of today only one
topic has a live end-to-end consumer (`tracking`) — see §3. Two more
(`order_summaries`, `delivery_summaries`) are scaffolded but their publish
calls are still commented out. Don't assume "it's in `TopicRegistry`" means
"it's live" — check `ConsumeCommand::HANDLERS`.

---

## 2. The mental model (Kafka 101, our vocabulary)

| Concept | What it means here |
|---|---|
| **Topic** | A named stream, e.g. `tracking.events.v1`. One per business event type. Defined in `TopicRegistry::TOPICS`, auto-suffixed with the environment outside production (`tracking.events.v1.staging`) so environments never cross-pollinate on a shared broker. |
| **Partition** | A topic is split into N partitions (`KAFKA_AUTO_CREATE_PARTITIONS=3` by default) for parallelism. Kafka only guarantees message *order within a partition*, not across the whole topic. |
| **Partition key** | We publish with `key = tenant_id` (`KafkaProducer::publish()`, defaults `partitionKey ?? (string)$tenantId`). Same key → same partition → **all of one tenant's events arrive in order**. This is the whole reason tenant-scoped ordering works without a global lock. |
| **Producer** | Whatever writes an event — usually a request-time Controller or a model Observer. Synchronous, short timeouts (1s), never blocks the response on a broker outage (see §5). |
| **Consumer** | A long-running `php artisan kafka:consume {topic}` process (one per topic), supervised, not a queue worker — it's not backed by Redis/DB queue tables, it's backed by the broker's own offset tracking. |
| **Consumer group** | All consumer processes reading the same topic with the same `group_id` (`KAFKA_GROUP`, default `sokrio-group`) share the partitions between them and get a *rebalance* when one joins/leaves. We currently run `numprocs=1` per topic (see §7), so rebalancing mostly matters for restarts, not horizontal scale-out — but the group membership plumbing (§4.5) had to be got right regardless. |
| **Offset** | Per-partition read cursor. Committing an offset says "everything up to here is done" — on restart the consumer resumes from the last committed offset, not from zero. |
| **Delivery semantics** | We commit offsets *after* the handler runs on a flush, but the handler is written to **never throw** — a tenant that fails 3x is logged and the batch still commits. Net effect: **at-most-once** for the failing subset, not at-least-once, despite manual offset control. This is a deliberate trade-off (see §4.4) — know it before you build a handler that assumes "if it's in Kafka, it will eventually land." |

---

## 3. The actual pieces, file by file

```
app/Contracts/Kafka/
  MessageProducerInterface.php     — publish()/publishBatch() contract
  MessageConsumerInterface.php     — consume($topic, callable $handler, $maxRuntime)
  KafkaMessageHandlerInterface.php — handle() [deprecated] + handleBatch()
  TopicRegistryInterface.php
  ConsumerFactoryInterface.php     — testing seam around Consumer construction
  TopicProvisionerInterface.php    — auto-creates a missing topic

app/Services/Kafka/
  KafkaProducer.php        — the only class that talks to the broker on the write side
  KafkaConsumer.php        — the only class that talks to the broker on the read side
  TopicRegistry.php        — topic-key → topic-name + event-type constants
  TopicProvisioner.php     — creates topics on first use (dev/staging convenience)
  Signal/ShutdownFlag.php  — process-wide flag set by SIGTERM/SIGINT handlers
  Socket/InterruptResilientStreamSocket.php — EINTR-safe socket (see §4.2)
  Handlers/
    TrackingMessageHandler.php     — the one live, proven handler

app/Console/Commands/Kafka/ConsumeCommand.php  — `kafka:consume {topic}`, HANDLERS dispatch table
app/Observers/Concerns/PublishesKafkaMessage.php — shared try/catch/log/publish trait for Observers
app/Observers/{Order,Delivery,DepartmentChange}Observer.php — publish call sites (Order/Delivery: commented out)
app/Providers/AppServiceProvider.php  — observer registration
config/kafka.php                       — every tunable, see §7
```

**Data flow for the one live pilot (Tracking):**

```
Mobile app
   │  POST /trackings  (single) or /v2/trackings (bulk)
   ▼
TrackingController::store()
   │  1. writes MySQL (Tracking) + Mongo (TrackingReport) synchronously — unchanged
   │  2. ALSO calls MessageProducerInterface::publish()/publishBatch()
   ▼                                                  KafkaProducer
   │  builds envelope {event_id, event_type, tenant_id, occurred_at, payload}
   │  key = tenant_id → same-tenant events land on the same partition
   ▼
Kafka topic: tracking.events.v1[.env]
   ▲
   │  long-running process, Supervisor-managed
kafka:consume tracking  (ConsumeCommand)
   │  resolves TrackingMessageHandler via HANDLERS map
   ▼
KafkaConsumer::consume()
   │  owns its own poll loop (NOT the library's Consumer::start())
   │  buffers decoded messages until batch_size (200) or batch_interval (1.0s)
   │  hands the whole buffer to handler->handleBatch($buffer)
   │  commits offsets once per partition per flush (not per message)
   ▼
TrackingMessageHandler::handleBatch()
   │  groups by tenant_id
   │  per tenant: TenantManager::tenant($org)->reconnect(), then ONE
   │  WriteBulkTrackingActions() call for the whole tenant slice
   │  retries 3x on failure, then degrades to per-point writes
   │  never throws out of handleBatch — logs and moves on
   ▼
Tracking (MySQL) + TrackingReport (Mongo) — same tables the sync path writes
```

Note the synchronous write in step 1 was **never removed** — today Kafka is
a *parallel/shadow signal* for Tracking, not (yet) the source of truth. The
consumer writing to the same tables the sync path already writes to means a
duplicate-write is theoretically possible; this hasn't been fully cut over
(worth confirming current status with the team before assuming otherwise).

---

## 4. Reliability engineering: the real incident history

This is the most valuable part of this doc. Kafka here went through **two
full reverts** and a long tail of hardening commits before it was trustworthy
enough to run unsupervised in production. Reading these in order teaches you
more about operating Kafka-on-PHP than any tutorial will.

### 4.1 — The false starts (2026, early attempts)

```
dcc8984e8  add-kafka                           — first experiment
c01fe1905  partition-added-in-kafka            — reverted immediately (0598abcd6)
22e866c83  kafka-implementation-for-order-summary   — merged as PR #4044...
ad4aa8aa7  Revert "Kafka implementation for order summary master"  — ...then reverted (PR #5112)
d85dcb4bc  Add Kafka producer/consumer and tracking pipeline       — merged as #5113...
2b0587fd0  Revert "Add Kafka producer/consumer and tracking pipeline"  — ...reverted (#5115)...
                                                                        — ...then re-merged (#5116)
```

**Lesson:** two independent "let's add Kafka" attempts (order-summary first,
then a from-scratch tracking pipeline) got merged and reverted before the
current design stuck. If you're about to design v1 of a new Kafka consumer,
assume you will get the failure modes wrong the first time — build in a
cheap rollback path (a feature-flaggable publish call, a consumer that can
be stopped without data loss because the sync write path still exists) the
same way `d85dcb4bc` kept the synchronous Tracking write alongside the new
Kafka publish.

### 4.2 — The shadow-write validation window, then its removal

`d85dcb4bc` (the tracking pipeline that stuck) originally wrote consumed
messages to a **temporary shadow Mongo collection** (`TrackingNew`/
`tracking_reports_new`) instead of the real `TrackingReport` collection —
explicitly so the Kafka-driven values could be diffed against the trusted
synchronous path before anyone trusted the new pipe.

```
d32d99105  Remove TrackingNew and re-enable consumer writes

  End the shadow-write validation window: delete the temporary TrackingNew
  model and re-enable the Kafka tracking consumer to persist to Tracking
  (MySQL) and TrackingReport (Mongo). Update TrackingController to publish
  the Kafka event and return HTTP 202 with the validated payload.
```

**Lesson:** when you don't fully trust a new async write path yet, give it a
shadow collection with the exact same shape as the real one, run it in
parallel for a validation window, diff the two, *then* delete the shadow
model and cut the consumer over to the real collection. Don't skip straight
to writing the real table from an unproven pipeline — this is why the
companion plan for Primary Order/Delivery reuses the *existing, already-
proven* `SummariesQuery` mapping logic rather than writing a second,
independent field-mapping implementation that could quietly drift.

### 4.3 — EINTR: the pure-PHP client doesn't handle interrupted syscalls

```
fb2b932eb  Make Kafka resilient to signal-interrupted syscalls; isolate its logs

  The pure-PHP longlang/phpkafka client's stream_select()/stream_socket_client()
  have no EINTR handling. In production the Datadog profiler's timer signals
  interrupt them constantly, surfacing as `Kafka publish failed` (ErrorException
  on the FPM path) and `Could not read N bytes from stream (not readable)` on
  the consumer, which also crashed the kafka:consume command mid-poll.
```

Root cause: the Datadog **continuous profiler** sends timer signals at
~100 Hz to sample the call stack. Any blocking syscall the pure-PHP Kafka
client makes (`stream_select`, `stream_socket_client`) can get interrupted
by one of those signals (`EINTR`), and PHP's socket layer doesn't retry
automatically the way a C client with `SA_RESTART` would.

Fix: `InterruptResilientStreamSocket` — retries an EINTR-interrupted
select()/connect() against a monotonic deadline instead of propagating the
spurious error. Wired into both producer and consumer via
`ProducerConfig`/`ConsumerConfig::setSocket()`.

**Operational consequence:** `DD_PROFILING_ENABLED=false` and
`DD_TRACE_CLI_ENABLED=false` are set **only** on the Kafka consumer's
Supervisor program (`environment=` line, not container-wide) — see §7. This
was a deliberate choice, not a workaround left in by accident: the profiler
adds retry churn with zero value on a process that already runs forever.

**Lesson:** if you're debugging a Kafka error that looks like a random,
transient socket failure under load in production but never reproduces
locally — check whether APM/profiling signal delivery is in play before
assuming it's a network issue.

### 4.4 — Static vs dynamic consumer group membership (KIP-345)

```
de9b53f38  Disable static group membership and handle Kafka errors
d1cbf7c54  Enable dynamic Kafka group ID and retry errors
```

Two commits, going in what looks like opposite directions — worth
understanding why. Kafka's KIP-345 lets a consumer register a *static*
group-instance-id so a brief restart doesn't trigger a full group rebalance.
We tried setting `groupInstanceId` to `null` to disable it, which crashed
the join-group handshake (`GroupManager::syncGroup()`/`heartbeat()` in this
client version have a **non-nullable** `string $groupInstanceId` param). The
fix wasn't "turn static membership back on" — it was "explicitly set it to
`''` (empty string)", which the library treats as *dynamic* (non-static)
membership without hitting the type error `null` caused.

Both commits also extended error handling for
`longlang\phpkafka\Exception\KafkaErrorException` — broker-side handshake
failures like `FENCED_INSTANCE_ID` (82) that happen when a stale/duplicate
group member shows up — treating them as transient and retrying the
join/reconnect instead of crashing the whole consumer process.

**Lesson:** don't assume a library default that "looks like" the right
setting (`null` for "off") behaves the way the Kafka protocol spec
describes — check the client's actual type signature. And: broker-side
group-coordination errors are a normal, expected transient condition for a
long-running consumer, not something to let crash the process — always ask
"is this the broker telling me to just retry the handshake?" before treating
a Kafka exception as fatal.

### 4.5 — DB connection corruption from a signal landing mid-read

```
2df7e23b0  Harden Kafka consumer against DB reconnect issues

  This change blocks SIGTERM/SIGINT during each Kafka message so a shutdown
  signal cannot interrupt an in-flight DB read and corrupt the landlord
  connection state. When a tenant lookup hits a stale/corrupted landlord
  connection, the tracking handler now purges and reconnects the DB before
  retrying and logs the recovery.
```

This is why `KafkaConsumer::flush()` (current code) wraps the handler call
in `pcntl_sigprocmask(SIG_BLOCK, [SIGTERM, SIGINT])` / `SIG_UNBLOCK` —  an
interrupted blocking MySQL read leaves stray bytes on the wire and corrupts
the connection's protocol state for the *next* query ("Packets out of
order"), which then fails in a confusing way unrelated to the actual signal.
`TrackingMessageHandler::resolveOrg()` also self-heals: on a landlord
connection error it does `DB::purge()` + `DB::reconnect()` and retries once,
rather than propagating.

**Lesson:** signal-safety in PHP isn't just "handle SIGTERM to stop the
loop" — a signal that lands *inside* a blocking DB call can corrupt
connection state in a way that only surfaces on the next unrelated query.
Block signals around any critical section that isn't safe to interrupt.

### 4.6 — Redis/cache failures shouldn't be Kafka failures

```
37840a3b5  Harden feature tracking, flush & Kafka handling

  ... Harden Kafka paths: treat Redis/Predis cache failures as transport
  noise, avoid noisy Sentry reports by default and add opt-in config, and
  make TopicProvisioner resilient to cache errors.
```

`TopicProvisioner` uses cache to avoid re-checking "does this topic exist"
on every single publish. If Redis has a blip, that shouldn't take down
Kafka publishing — the fix treats a cache failure the same as a cache miss
(fall through to checking the broker directly) rather than propagating the
Redis error.

**Lesson:** a secondary dependency (cache) failing should degrade the
primary path's performance, not its correctness/availability. This shows up
again in `Org::findById()` (`app/Models/Core/Org.php`) — Redis-cached with a
direct-DB-query fallback on `ConnectionException`/`RedisException`.

### 4.7 — From per-message to per-batch (throughput rewrite)

```
a7e63f4bb  Kafka consumer: batch processing & graceful shutdown
e99d02a03  Add bulk tracking endpoint and Kafka batch support
```

The consumer originally processed one message at a time — one DB write, one
offset commit, per message. `a7e63f4bb` rewrote it to buffer decoded
messages and flush as a batch (`batch_size=200` or `batch_interval=1.0s`,
whichever comes first), added `handleBatch()` to the handler contract
(`handle()` kept only as a `@deprecated` single-message shim), and moved to
one offset-commit **per partition per flush** instead of per message — see
`KafkaConsumer::pollLoop()`/`flush()` in the current code for exactly how
that's implemented (§3 has the file map).

**Lesson:** if you're about to write a new consumer handler, `handleBatch()`
is the real contract — group by `tenant_id` first (one DB reconnect + one
bulk write per tenant per flush), don't process messages one by one even
though the interface still technically allows a single-message `handle()`.

### 4.8 — Tuning the periodic recycle

```
6486a0607  Increase default Kafka consumer max runtime to 6h
```

The consumer voluntarily exits cleanly every `KAFKA_CONSUMER_MAX_RUNTIME`
seconds so Supervisor restarts it fresh (bounds memory growth in a
long-lived PHP process). Started conservative (1h), raised to 6h once it was
clear the rejoin-churn cost (one full consumer-group rebalance per recycle)
wasn't worth paying that often.

**Lesson:** "periodic recycle" isn't a crash — if you see
`Kafka consumer: clean shutdown` in `kafka.log` on a schedule, that's this
working as intended, not an incident.

---

## 5. Design principles that fell out of the above (the actual rules)

1. **Never let a Kafka failure break the request.** Producer timeouts are
   short (1s connect/send/recv — `config/kafka.php`'s `producer` section);
   `KafkaProducer::publish()` swallows exceptions, logs, and returns `null`.
   Callers treat a `null` return as "no event published," not an error —
   see `PublishesKafkaMessage::publishKafkaMessage()`, which itself wraps
   everything in try/catch.
2. **Never let a handler failure stop the consumer.** `handleBatch()` must
   never throw past its own boundary — catch, log to the `kafka` channel,
   `report()` if genuinely unexpected, and move on. One bad tenant/message
   should never sink the whole batch's offset commit.
3. **Consumer logs are isolated from Sentry/Slack by design** (the `kafka`
   log channel, not `stack`) — Kafka transport noise (retries, reconnects,
   the periodic clean-shutdown recycle) is expected background noise, not
   an incident signal. Only genuinely unexpected errors get `report()`ed.
4. **Partition key = tenant_id, always**, unless you have a specific reason
   not to (`publish()`'s `$partitionKey` defaults to `(string) $tenantId`).
   This is what gives per-tenant ordering without any locking.
5. **Group by tenant inside the handler, one DB reconnect per tenant per
   flush** — not per message. `TenantManager::tenant($org)->reconnect()` is
   not free; amortize it across the whole batch slice for that tenant.
6. **Cache read-side lookups that recur across a batch** (`Org::findById`
   inside `TrackingMessageHandler::$orgs`) — the same handful of tenants
   recur constantly in any real batch.
7. **Block signals around a critical DB write section**
   (`pcntl_sigprocmask`), not just around the poll loop.
8. **New handler → new topic key in `TopicRegistry`, new entry in
   `ConsumeCommand::HANDLERS`, new Supervisor program.** Nothing auto-
   discovers a handler — it's an explicit, reviewable dispatch table on
   purpose (see the reflection guard test,
   `tests/Unit/Console/Kafka/ConsumeCommandHandlersTest.php`, which asserts
   every registered handler actually implements the interface).

---

## 6. The multi-tenant twist (this is not generic Kafka)

Every envelope carries `tenant_id` (`KafkaProducer::buildEnvelope()`):
```json
{
  "event_id": "uuid-v4",
  "event_type": "tracking.created",
  "tenant_id": 123,
  "occurred_at": "2026-09-08T10:00:00+00:00",
  "payload": { "...": "..." }
}
```
The consumer decodes this envelope shape generically
(`KafkaConsumer::decode()` — malformed messages are logged and skipped, the
offset still advances so one bad message can't block the topic forever) and
hands `{tenant_id, event_type, payload}` triples to the handler. The handler
is responsible for everything tenant-specific: resolving the `Org`,
reconnecting `TenantManager` to that tenant's own DB, and only then writing.
**A consumer process is not tenant-scoped** — a single `kafka:consume`
process handles every tenant's events on whatever partitions it owns,
switching DB connections per tenant-group inside each flush.

---

## 7. DevOps — running this like a microservice inside a monolith repo

Kafka consumers here aren't queue workers (no Redis/DB-backed queue table)
and they aren't request-driven — they're **standalone long-running
processes** you deploy and supervise like a small, single-purpose service,
even though the code lives inside `sokrio-server`.

### 7.1 Supervisor (the actual production process model)

```ini
[program:sokrio-kafka-consumer-tracking]
command=php /var/www/html/artisan kafka:consume tracking
autostart=true
autorestart=true
numprocs=1
stopsignal=TERM
; stopwaitsecs must exceed kafka.consumer.session_timeout (30s) so a graceful
; SIGTERM always has time to leaveGroup() before Supervisor SIGKILLs.
stopwaitsecs=35
redirect_stderr=true
environment=DD_PROFILING_ENABLED="false",DD_TRACE_CLI_ENABLED="false"
stdout_logfile=/var/www/html/storage/logs/kafka-consumer-tracking.log
```

Key points for a new topic's consumer:
- **One program block per topic**, `command=php artisan kafka:consume <topic-key>`.
- `stopwaitsecs` must exceed `KAFKA_CONSUMER_SESSION_TIMEOUT` (30s default)
  — SIGTERM needs time to cleanly `leaveGroup()` before SIGKILL, otherwise
  every deploy causes an ungraceful rebalance.
- `environment=DD_PROFILING_ENABLED="false",DD_TRACE_CLI_ENABLED="false"` —
  **only** on this program, not container-wide (§4.3). Getting this wrong
  either reintroduces EINTR churn (if left on) or silently loses tracing
  elsewhere (if applied too broadly).
- `numprocs=1` today. Bumping this to >1 for real horizontal scale-out is
  meaningful (more partitions consumed in parallel within the same group)
  but hasn't been exercised yet in this codebase — if you do it, budget
  time to verify rebalance behavior under load, not just "it started."

### 7.2 Required runtime dependency: `ext-pcntl`

Signal handling (`pcntl_signal`, `pcntl_async_signals`, `pcntl_sigprocmask`)
needs the `pcntl` PHP extension, which is **not available under php-fpm/
mod_php** — only CLI SAPI. `composer.json`/`composer.lock` require
`ext-pcntl`. Any container image that runs `kafka:consume` (and, per the
platform-req bump, any environment running `composer install` without
`--ignore-platform-reqs`) needs it installed — verify this explicitly for
new deploy targets, it's an easy thing to discover missing only at runtime.

### 7.3 Config surface (`config/kafka.php` / `.env.example`)

All Kafka tuning is env-driven and split producer vs consumer, because
their latency budgets are opposite (producer is in the request path and
must fail fast; consumer is a background process and can afford to wait
longer for a healthy round-trip):

| Var | Default | Role |
|---|---|---|
| `KAFKA_BROKERS` | `localhost:9092` | Bootstrap servers |
| `KAFKA_GROUP` | `sokrio-group` | Consumer group id — same group across all consumer processes that should share partition ownership |
| `KAFKA_PRODUCER_CLIENT_ID` / `KAFKA_CONSUMER_CLIENT_ID` | `sokrio-producer` / `sokrio-consumer` | Distinct so broker-side metrics/quotas separate the two roles |
| `KAFKA_PRODUCER_*_TIMEOUT` | 1.0s each | Fail fast — this runs inside an HTTP request |
| `KAFKA_PRODUCE_RETRY` / `KAFKA_MAX_WRITE_ATTEMPTS` | 0 / 1 (lib-level) — `KafkaProducer` itself retries up to 3x on top (`MAX_PUBLISH_ATTEMPTS`) | Publish resilience |
| `KAFKA_CONSUMER_*_TIMEOUT` | 3-5s | More headroom — a slow coordinator round-trip shouldn't look like a dead socket |
| `KAFKA_POLL_INTERVAL` | 1.0s | Sleep between empty polls (no busy-spin) |
| `KAFKA_CONSUMER_SESSION_TIMEOUT` / `_REBALANCE_TIMEOUT` / `_HEARTBEAT` | 30s / 30s / 3s | Group coordination protocol timing |
| `KAFKA_CONSUMER_MAX_CONSECUTIVE_FAILURES` | 10 | Exit for Supervisor restart after this many mid-poll failures in a row with no success in between |
| `KAFKA_CONSUMER_RECONNECT_BACKOFF_CAP` | 30s | Cap on the backoff between reconnect attempts |
| `KAFKA_CONSUMER_BATCH_SIZE` / `_BATCH_INTERVAL` | 200 / 1.0s | Flush trigger — whichever comes first |
| `KAFKA_CONSUMER_MAX_RUNTIME` | 21600 (6h) | Periodic clean-exit recycle, `0` disables |
| `KAFKA_AUTO_CREATE_PARTITIONS` / `_REPLICATION_FACTOR` | 3 / 1 | Used when `TopicProvisioner` auto-creates a missing topic (dev/staging convenience — don't rely on this in production, pre-create topics with the ops-owned partition/replication values) |
| `KAFKA_REPORT_UNEXPECTED_PUBLISH_ERRORS` | false | Opt-in to also `report()` (Sentry) an unexpected publish failure, on top of the always-on `kafka` log channel entry |

### 7.4 Local dev — running a consumer and watching it work

```bash
# inside the container / via ./dev pa
php artisan kafka:consume tracking

# in another shell, trigger a publish by hitting the tracking endpoint
# (TrackingController::store already calls the producer)
curl -X POST https://<tenant>.sokrio-server.test/api/trackings ...

# watch it land
tail -f storage/logs/kafka.log
```

If you're building a *new* topic end-to-end locally: `TopicProvisioner`
auto-creates the topic on first publish (dev convenience — don't rely on
this in staging/prod, see above), so you don't need to manually
`kafka-topics --create` for local iteration.

### 7.5 Monitoring / what "healthy" looks like

- `storage/logs/kafka.log` (+ stderr) — the only place Kafka logs go.
  `Kafka consumer: clean shutdown` on a ~6h cadence = the periodic recycle,
  expected. Frequent `mid-poll error, reconnecting` = investigate broker/
  network health. `repeated mid-poll failures, exiting for supervisor
  restart` = a real incident, Supervisor will restart it but something's
  wrong upstream.
- Nothing here reaches Sentry/Slack by default (§4.6, §5.3) — if you need
  alerting on Kafka health, it has to be built deliberately (log-based
  alert on the `kafka` channel, or flip
  `KAFKA_REPORT_UNEXPECTED_PUBLISH_ERRORS`), it won't happen by accident.

---

## 8. Checklist — adding a brand-new topic + consumer

Use this when you're building the next pipeline (the Primary Order/Delivery
plan in this same folder is the next real example — cross-reference it):

```
[ ] Add topic key + name to TopicRegistry::TOPICS, event-type constant(s)
[ ] Producer side: publish from wherever the event actually originates
    - a request-time Controller (like TrackingController), or
    - a model Observer via the PublishesKafkaMessage trait (like Order/
      DeliveryObserver — but ship the publish call ENABLED, not commented
      out like the retail pair currently is)
    - decide thin (id only, consumer re-derives) vs fat (full payload
      inline) — see the Primary Order/Delivery plan's §3 for the tradeoff
    - partition key = tenant_id unless you have a specific reason not to
[ ] Consumer side: new class implementing KafkaMessageHandlerInterface,
    handleBatch() only (handle() is deprecated) — group by tenant_id,
    one TenantManager reconnect + one bulk write per tenant per flush,
    bounded retry, NEVER let an exception escape handleBatch()
[ ] Register the new handler in ConsumeCommand::HANDLERS
[ ] New Supervisor program block (§7.1), stopwaitsecs > session_timeout,
    DD_PROFILING_ENABLED=false / DD_TRACE_CLI_ENABLED=false on that program
[ ] Confirm ext-pcntl on whatever box/image will run this consumer
[ ] Tests: handler batch behavior (unknown tenant, success, retry-then-
    fail), TopicRegistry key coverage, ConsumeCommandHandlersTest's
    reflection guard covers interface conformance automatically once
    registered
[ ] If replacing an existing sync/batch write path: keep the old path
    running in parallel until you've validated the Kafka path (shadow
    collection if the target schema is new/different, or just watch both
    outputs converge if it's the same collection — see §4.2)
```

---

## 9. Glossary (for genuinely-new-to-Kafka readers)

- **Broker** — a Kafka server process; `KAFKA_BROKERS` points at one or more.
- **Topic** — a named, partitioned log of messages.
- **Partition** — an ordered, immutable sub-log within a topic. Order is
  only guaranteed within one partition.
- **Offset** — a partition-local sequence number; "how far has this
  consumer group read."
- **Consumer group** — a named set of consumers sharing partition
  ownership; the broker rebalances partition assignment across live group
  members.
- **Rebalance** — the protocol dance that runs when group membership
  changes (a consumer joins/leaves/restarts) — reassigns partitions,
  briefly pauses consumption for the affected partitions.
- **At-most-once / at-least-once / exactly-once** — delivery guarantees
  describing what happens on a failure between "read" and "processed."
  We're effectively **at-most-once** for a handler that exhausts its
  retries (§2's Delivery semantics row) — know this before assuming Kafka
  gives you free durability guarantees your handler didn't earn itself.
- **EINTR** — the errno a blocking syscall returns when a signal interrupts
  it before completion; see §4.3 for why this matters specifically for the
  pure-PHP Kafka client under Datadog's profiler.
- **KIP-345** — the Kafka Improvement Proposal that added static consumer
  group membership (a fixed `group.instance.id` to avoid a full rebalance
  on brief restarts); see §4.4 for why we run *dynamic* (non-static)
  membership instead.

---

## 10. Where to go next

- **Concrete next build**: `primary-order-delivery-kafka-plan.md` in this
  same folder — applies everything in this doc to a real, currently-batch
  pipeline (Primary Order/Delivery summaries), including the specific
  "thin vs fat payload" decision and why the existing `SummariesQuery`
  logic should be reused rather than reimplemented.
- **PR #5094 breakdown**: `_sprintSep/Kafka/order_summary/PR-5094-breakdown.md`
  — a snapshot of the Tracking-pilot-era code as of Aug 2026. Read it as
  history, not current state — §4.7/§4.8/§7 of this doc describe real
  changes made since then (batch processing, dynamic group membership,
  6h max runtime) that the PR breakdown predates.
- **Live source of truth**: the file map in §3 — when in doubt, the code
  is newer and more correct than any doc, including this one.
