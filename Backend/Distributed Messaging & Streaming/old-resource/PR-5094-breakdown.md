# PR #5094 Breakdown — Kafka Implementation for Order Summary

**Repo:** sokrio/sokrio-server
**PR URL:** https://github.com/sokrio/sokrio-server/pull/5094
**Branch:** `kafka-implementation-for-order-summary`
**Author:** Shihab (commits under `sihab` / `shihab-143` / `Shihab Uddin`)
**Base:** `master` @ `d586de76a` (PR #5084 merge, 2026-08-12)
**Commits:** 2026-08-12 → 2026-08-13

> **How this report was built:** `gh` CLI is not installed in this
> environment and the GitHub REST API returned `404` for an anonymous
> request (private repo, no token configured), so PR-level metadata —
> description text, reviewer list, review comments, CI check status — could
> **not** be pulled from GitHub. Instead the PR was reconstructed from the
> local git remote (`github.com-office`), which does have SSH access:
> `git fetch origin refs/pull/5094/head`. The branch's tip is a "merge
> `staging` into feature branch" commit, and `staging` is far ahead of
> `master`, so a plain `git diff origin/master...pr-5094` pulls in ~180
> unrelated files from other already-merged work. The actual PR content was
> isolated as the diff between `ed9f7ecbf` (a no-op "merge master into
> feature" commit) and `fc2d46905` (the last commit before the staging
> merge) — a clean **27 files changed, +702 / −120**. Everything below is
> from that diff.

---

## 1. Summary

This PR adds a **generic Kafka consumer framework** to sokrio-server
(command, service, handler contract) and wires up the **first end-to-end
producer → consumer pilot**, but that pilot is for the **Tracking** topic,
not Order Summary.

Despite the branch name and PR title referencing "order summary," the
`OrderObserver` and `DeliveryObserver` Kafka-publish calls are explicitly
**commented out** in this PR (see §4). The `order_summaries` and
`delivery_summaries` Kafka topics exist only as registry entries with no
consumer handler — attempting to consume them fails today, by design
(covered by a test). In its current state this PR is infrastructure +
plumbing for the eventual order-summary flow, proven out end-to-end on the
lower-stakes Tracking path first.

---

## 2. Commit Log (isolated PR range)

| Commit | Author | Date | Message |
|---|---|---|---|
| `59f4f047a` | sihab | 2026-08-13 | Add Kafka consumer, handlers and registry |
| `fc2d46905` | shihab-143 | 2026-08-13 | Apply php-cs-fixer changes |

(base: `ed9f7ecbf` — "Merge branch 'master' into kafka-implementation-for-order-summary", a no-op merge off `d586de76a`)

The PR head on GitHub (`e49cf91b8`) additionally merges `staging` into the
branch, which is why the raw `git diff` against `master` looks much larger
than the actual feature — that merge just catches the branch up to
`staging`, it isn't new work from this PR.

---

## 3. File-by-File Breakdown

### New files

| File | Purpose |
|---|---|
| `app/Console/Commands/Kafka/ConsumeCommand.php` | `kafka:consume {topic}` artisan command. Maps a `TopicRegistry` key → handler class via a `HANDLERS` const array (currently only `TRACKING => TrackingMessageHandler::class`). Validates the topic key, resolves the handler from the container, and blocks on `consumer->consume()`. |
| `app/Contracts/Kafka/KafkaMessageHandlerInterface.php` | `handle(int $tenantId, string $eventType, array $payload): void` — contract every per-topic handler must implement. |
| `app/Contracts/Kafka/MessageConsumerInterface.php` | `consume(string $topic, callable $handler): void` — contract for the consumer transport (blocks until SIGTERM/SIGINT). |
| `app/Services/Kafka/KafkaConsumer.php` | Concrete consumer built on `longlang/phpkafka`. Configures brokers/client id/group id/timeouts from `config/kafka.php`, retries the join-group handshake up to 5 times on `SocketException`/`ConnectionException` (the underlying client doesn't retry transport errors itself), registers `SIGTERM`/`SIGINT` handlers via `pcntl_signal` for graceful shutdown, and decodes each message as a `{tenant_id, event_type, payload}` JSON envelope before dispatching to the handler. `autoCommit` is `true`. |
| `app/Services/Kafka/Handlers/TrackingMessageHandler.php` | The one wired-up handler. Looks up the tenant via `Org::findById`, reconnects the tenant DB via `TenantManager`, and — during this "validation window" — writes the payload into the **shadow** Mongo collection `TrackingNew` rather than the real `TrackingReport`. Retries persistence up to 3 times with a linear backoff (`sleep($attempt)`) on any `\Throwable`; after exhausting retries it logs and drops the message (message is still Kafka-acked either way, per `autoCommit`). |
| `app/Observers/Concerns/PublishesKafkaMessage.php` | New trait extracting the repeated try/catch/publish/log boilerplate previously duplicated across `DeliveryObserver`, `OrderObserver`, and (partially) `DepartmentChangeObserver`. |
| `app/Models/MongoDB/TrackingNew.php` | Shadow collection model (`tracking_reports_new`). Docblock explicitly says: delete this model and its data once the Kafka consumer path is trusted to write the real collection directly. |
| 6 test files | See §5. |

### Changed files

| File | Change |
|---|---|
| `app/Http/Controllers/Tracking/TrackingController.php` | `store()` now, in addition to the existing synchronous MySQL (`$user->trackings()->create()`) and Mongo (`TrackingReport::insertGetId()`) writes, **also publishes to Kafka synchronously in the same request** via the injected `MessageProducerInterface`, using `TopicRegistry::TRACKING_CREATED`. No write path was removed — this is additive, so the Kafka publish is currently a parallel/shadow signal, not a replacement. |
| `app/Observers/DeliveryObserver.php` | Refactored onto `PublishesKafkaMessage` trait; constructor promoted to typed-property style; **`created()`'s `$this->publishToKafka($delivery)` call is commented out** — delivery-summary events are not currently published. |
| `app/Observers/OrderObserver.php` | Same refactor as above; **`updated()`'s `$this->publishToKafka($order)` call is commented out** — order-summary events are not currently published. |
| `app/Observers/DepartmentChangeObserver.php` | Formatting/indentation cleanup and constructor promotion only; its `publishToKafka` calls were already commented out before this PR and remain so. |
| `app/Models/Core/Org.php` | New `findById(int $id): ?self` — cached lookup (`org_by_id_{id}`, 7-day TTL via `Cache::remember`) with a fallback to a direct DB query if Redis throws `ConnectionException`/`RedisException` (so tenant resolution still works during a Redis outage). Also clears the new `id`-based cache key on `updated`, alongside the existing domain-based one. Used by `TrackingMessageHandler` to resolve the tenant from the Kafka message's `tenant_id`. |
| `app/Services/Kafka/TopicRegistry.php` | Adds `TRACKING` topic key (`tracking.events.v1`) and pulls previously-inlined magic-string event names out into named constants: `TRACKING_CREATED`, `ORDER_SUMMARY_UPDATED`, `DELIVERY_SUMMARY_UPDATED`, `DEPARTMENT_CREATED`, `DEPARTMENT_UPDATED`. (Pre-existing, untouched-by-this-PR: `getTopicName()` appends the current Laravel environment as a suffix outside `production`, e.g. `tracking.events.v1.testing`.) |
| `app/Providers/KafkaProducerServiceProvider.php` → `app/Providers/KafkaServiceProvider.php` | **Renamed.** Now also binds `MessageConsumerInterface → KafkaConsumer` (singleton) alongside the existing producer and topic-registry bindings. `config/app.php`'s providers list is updated to match. |
| `app/Services/Kafka/KafkaProducer.php` | Trivial cleanup — removed an unused `RuntimeException` import and a dead commented-out `throw`. |
| `.env.example` | Adds `KAFKA_GROUP`, plus already-referenced-elsewhere `KAFKA_PRODUCE_RETRY`, `KAFKA_PRODUCE_RETRY_SLEEP`, `KAFKA_MAX_WRITE_ATTEMPTS`. |
| `config/kafka.php` | Adds `'group_id' => env('KAFKA_GROUP', 'sokrio-group')`, consumed by `KafkaConsumer`. |
| `composer.json` / `composer.lock` | Adds `ext-pcntl` as a required PHP extension (needed for the consumer's signal handling) — content-hash and platform-api-version bumped accordingly. |
| `README.md` | Documents a new Supervisor program block (`sokrio-kafka-consumer-tracking`, `php artisan kafka:consume tracking`) to run alongside the existing feature-tracking worker. |

---

## 4. Behavioral Notes for Reviewers

- **Order/Delivery Kafka publishing is still disabled.** The PR's name
  suggests order-summary Kafka support, but `OrderObserver::updated()` and
  `DeliveryObserver::created()` both have their `publishToKafka(...)` calls
  commented out. Only the Tracking producer→consumer path is live.
- **`kafka:consume order_summaries`, `delivery_summaries`, and `departments`
  fail today, on purpose** — `ConsumeCommand::HANDLERS` only maps
  `TRACKING`; the other three topics are registered in `TopicRegistry` but
  have no handler class yet. This is asserted directly by
  `ConsumeCommandTest::testUnmappedTopicKeyFailsWithoutTouchingTheConsumer`.
- **Shadow-write validation pattern.** The Tracking consumer doesn't touch
  the real `TrackingReport` Mongo collection — it writes to a parallel
  `tracking_reports_new` collection (`TrackingNew` model) so the
  Kafka-driven path can be compared against the existing synchronous writes
  before cutover. The old direct-write code is left in the handler,
  commented out, ready to be un-commented once trusted.
- **At-most-once delivery semantics.** The consumer sets `autoCommit(true)`
  and the handler retries a failed persist 3 times before giving up and
  logging — the message is Kafka-acked regardless of outcome, so a
  permanently-failing message is dropped, not retried later or sent to a
  dead-letter topic.
- **New deployment requirement:** `ext-pcntl` must be present on every PHP
  runner that will execute `kafka:consume` (and, per the platform-req bump
  in `composer.lock`, technically on any environment running
  `composer install` without `--ignore-platform-reqs`) — worth confirming
  against the Docker images used for web/worker/consumer containers.
- **Deploy step:** the service-provider rename
  (`KafkaProducerServiceProvider` → `KafkaServiceProvider`) needs a
  `config:cache` clear/rebuild on deploy, same as any provider-class rename.
- **Request-path latency:** `TrackingController::store()` now does a
  synchronous Kafka publish inside the HTTP request, in addition to the
  existing MySQL + Mongo writes. Bounded by the 1.0s connect/send/recv
  timeouts in `config/kafka.php`, and `KafkaProducer` swallows publish
  exceptions (logs and returns `null` rather than throwing), so a broker
  outage degrades to "no Kafka event" rather than a failed tracking
  request — but it's still added synchronous work on every tracking POST.

---

## 5. Test Coverage Added

| Test | Asserts |
|---|---|
| `tests/Feature/Console/Kafka/ConsumeCommandTest.php` | `kafka:consume` fails (without touching the consumer) for `departments`, `order_summaries`, `delivery_summaries` — topics with no registered handler. |
| `tests/Unit/Console/Kafka/ConsumeCommandHandlersTest.php` | Every class in `ConsumeCommand::HANDLERS` implements `KafkaMessageHandlerInterface` (reflection-based guard against a future handler being registered but not conforming to the contract). |
| `tests/Feature/Kafka/TrackingMessageHandlerTest.php` | (1) Unknown tenant → logs an error and returns without persisting. (2) Known tenant → payload lands in `TrackingNew`. (3) Persist failures retry twice then log a final error after 3 attempts, with the tenant id and attempt count in the log context. |
| `tests/Unit/Kafka/TopicRegistryTest.php` | `getTopicName()` appends the environment suffix outside production, omits it in production, and throws `InvalidArgumentException` for an unknown key. |
| `tests/Unit/Observers/Concerns/PublishesKafkaMessageTest.php` | The trait's `catch (\Throwable ...)` genuinely catches `\Error` subtypes (e.g. `\TypeError`), not just `\Exception` — logs the failure with the given context instead of letting it bubble up. |

---

## 6. Open Questions / Risks

1. **Order-summary functionality is not actually delivered by this PR** —
   confirm with the author/PM whether that's expected for this ticket, or
   whether it's a follow-up PR.
2. **No dead-letter queue** for messages that exhaust the 3 persist
   retries — currently just logged and dropped. Worth deciding if that's
   acceptable long-term for order/delivery data (higher stakes than
   tracking pings).
3. **Shadow-collection cleanup** — `TrackingNew`/`tracking_reports_new` is
   explicitly temporary; needs a tracked follow-up to remove it once the
   consumer is trusted, per the model's own docblock.
4. **GitHub-side review context wasn't available** in this environment
   (no `gh` CLI, no API token) — this report covers code content only. For
   PR description, discussion, and CI/check status, view the PR directly
   at the URL above.
