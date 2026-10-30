# 10 · Glossary

> **Snapshot:** `sokrio-server` @ `master` · HEAD `d14c0ebb2` · written 2026-10-26 (`master` = `bf223a126`, no messaging changes). No new code was read for this file; every Sokrio fact is reused from sections 00–09 and `_plan/MEMORY.md`.
> One line per term. `→ 04 §4.3` means "explained in file `04-…md`, section 4.3". Tags: `[CODE]` Sokrio app code · `[LIB]` vendor code · `[LAB]` reproduced in `labs/` · `[GENERAL]` industry knowledge · `[INFERENCE]` / `[ASSUMPTION]` as in the sections. A term with no tag is a `[GENERAL]` definition.

**How to use this file:** look a term up here when a section uses it without explaining it. §10.1 is the tag legend, §10.2 general terms A–Z, §10.3 Sokrio components and config names, §10.4 every id used in the deep dive (F, D, R, AL, A, L, B, P/C, Q).

---

## 10.1 Tags and markers

- **`[CODE]`** — verified in Sokrio app code at `d14c0ebb2`, with a `path:line` ref.
- **`[LIB]`** — verified in installed vendor code (`longlang/phpkafka` v1.2.5, Laravel 9.52.22, predis 1.1.10).
- **`[LAB]`** — reproduced in T9 with the scripts in `labs/`. `[LAB-T4]` / `[LAB-T5]` = reproduced in the T4 / T5 scratch labs.
- **`[NOTES]`** — taken from Komol's notes (`README.md`, `README_2.md`, `old-resource/`); the code wins on conflict (see D-ids).
- **`[HIST]`** — read from a file that exists only in git history (e.g. `557e63d68^:docker-compose.prod.yml`).
- **`[GENERAL]`** — industry knowledge, not Sokrio-specific.
- **`[INFERENCE]`** — follows from code (and labs), not observed in prod.
- **`[ASSUMPTION]`** — best guess; tracked as an A-id until Komol confirms.
- **🟢 / 🟡 / 🔴** — finding severity: low / medium / high blast radius.
- **`### ✅ Quality check`** — the done-criteria list at the end of every section.

---

## 10.2 General terms (A–Z)

### A
- **ACID** — atomicity, consistency, isolation, durability: the guarantees of a DB transaction. → 08a §8.2
- **ACK (message)** — consumer tells the broker "done, don't redeliver". RabbitMQ `basic.ack`; Laravel deletes the job from `:reserved`. → 03 §3.2, 08b §8.5
- **acks (producer)** — how many replicas must confirm a write: `0` = none (fire and forget), `1` = leader only, `all` = every in-sync replica. Sokrio runs `acks=0` (F5). → 02 §2.1
- **ACL** — access-control list (Kafka topic/group permissions, Redis 6 users). → 06 §6.4
- **Aggregate** — DDD unit of consistency; the natural partition/ordering key (e.g. an order). → 08d §8.9
- **allkeys-lru / allkeys-lfu** — Redis eviction policies that may evict *any* key, queue lists included. Right for a pure cache node, wrong for queues. `[LAB]` → 04 §4.9, 09 L7
- **AMQP** — Advanced Message Queuing Protocol (0-9-1), RabbitMQ's wire protocol: exchanges, bindings, queues. → 03 §3.2
- **AOF** — Redis append-only file persistence (`appendfsync everysec` ≈ ≤1 s loss). Not configured anywhere in Sokrio's repos. → 04 §4.9
- **APM** — application performance monitoring (Datadog traces/profiler in Sokrio). → 06 §6.9
- **at-least-once / at-most-once / exactly-once** — delivery semantics: may duplicate / may lose / neither (only within a closed system like Kafka EOS). Sokrio = "consumer at-least-once, pipeline best-effort". → 02 §2.6, 08a §8.2
- **auto.offset.reset** — Kafka consumer setting for a group with no valid offset (`earliest`/`latest`). phpkafka has none (F6). → 02 §2.3
- **autoCommit** — consumer commits offsets on a timer. Sokrio sets it `false` and commits per flush (D8). → 02 §2.3
- **AZ** — AWS availability zone; Multi-AZ = replicas across zones. → 06 §6.4–6.5

### B
- **Backoff** — wait time between retries (fixed, linear, exponential + jitter). Laravel job `$backoff`. → 05 §5.3, 08a §8.2
- **Backpressure** — slowing producers when consumers can't keep up (bounded queues, 429/503, RabbitMQ flow control). → 08a §8.1
- **Batch layer / speed layer** — Lambda architecture halves; Sokrio has only the batch layer (hourly summaries + daily resync). → 08c §8.8
- **BLMOVE / BRPOP / BLPOP** — blocking Redis list pops; Laravel uses `block_for` (null in Sokrio → `--sleep` polling). → 04 §4.2
- **Bootstrap servers** — initial broker list a Kafka client connects to (`KAFKA_BROKERS`). → 00 §0.9
- **Broker** — a Kafka (or RabbitMQ) server process that stores and serves messages. → 08a §8.3
- **Bulkhead** — isolate resources per workload/tenant so one can't starve the rest (separate queues/workers). → 08c, R18

### C
- **Cache-aside** — read cache, on miss load from DB and store (`Cache::remember`). → 04 §4.4
- **Cache penetration** — repeated lookups of keys that never exist; `remember()` never caches `null`, so every miss hits the DB `[LIB]`. → 08c §8.6
- **Cache stampede (dog-pile)** — many requests rebuild one expired key at once; only `MatrixAggregator` is protected. → 04 §4.4, R16
- **CAP / PACELC** — under a partition choose consistency or availability; PACELC adds "else, latency vs consistency". → 08a §8.1
- **CDC** — change data capture: stream DB changes from the binlog (Debezium). Not used in Sokrio. → 02 §2.2, D19
- **Choreography / orchestration** — sagas driven by events between services vs by a central coordinator. → 08d §8.9
- **Circuit breaker** — stop calling a failing dependency for a while, then probe. → 08d §8.9
- **cleanup.policy** — Kafka topic `delete` (time/size retention) or `compact` (keep last value per key). → 02 §2.5
- **Compacted topic** — keeps the latest record per key; deletes need a tombstone. Departments is the ideal candidate. → 02 §2.5, 08a §8.3
- **Competing consumers** — many workers pull from one queue; each message goes to one of them (Laravel `queue:work` × N). → 08a §8.1
- **Consumer group** — Kafka consumers sharing a `group.id`; each partition is owned by one member. → 02 §2.3
- **Consumer lag** — log-end offset minus committed offset (or time behind). Not monitored in Sokrio (AL1). → 06 §6.9
- **Cooperative rebalancing** — incremental rebalance (KIP-429) that doesn't stop the whole group. → 08b §8.4
- **Co-partitioning** — two topics with the same key/partition count so joins line up; breaks across clients with different partitioners (crc32 vs murmur2). → 08c §8.8
- **CQRS** — separate write model and read model; Sokrio has CQRS (MySQL → Mongo summaries) without event sourcing. → 08d §8.9
- **crc32 partitioner** — phpkafka's `crc32(key) % N`; Java clients use murmur2, so the same key can land on different partitions. `[LIB]` → 02 §2.5
- **CROSSSLOT** — Redis Cluster error for multi-key commands across hash slots. → 08c §8.6

### D
- **Dead-man's switch** — alert when an expected heartbeat stops (`->thenPing()`); missing in Sokrio (AL7). → 06 §6.9
- **Debezium** — open-source CDC connector on Kafka Connect. → 02 §2.2, 08b Q28
- **Delayed job** — Laravel job with `->delay()`; on Redis it sits in the `:delayed` sorted set until due. → 04 §4.2, B7
- **Delivery tag** — RabbitMQ per-channel id used to ack/nack. → 08b §8.5
- **DelaySeconds** — SQS per-message delay, max 900 s (F22). → 06 §6.8
- **DLQ / DLX / DLT** — dead-letter queue / RabbitMQ dead-letter exchange / Kafka dead-letter topic. Sokrio has none for Kafka; `failed_jobs` plays the role for jobs. → 02 §2.9, 03 §3.4
- **Dual write** — writing DB and broker separately without a shared transaction; one can succeed without the other. → 02 §2.2, R6

### E
- **ECST** — event-carried state transfer: events carry the full state (fat payload), like department events. → 08d §8.9
- **EINTR** — "interrupted system call": a signal (e.g. Datadog SIGPROF) breaks a blocking `select`; handled by `InterruptResilientStreamSocket`. → 07a R23
- **ELR** — eligible leader replicas (KIP-966), safer unclean-election alternative in newer Kafka. → 08a §8.3
- **EOS** — Kafka exactly-once semantics: idempotent producer + transactions + `read_committed`. → 08a §8.2
- **Event sourcing** — state = fold over an append-only event log; not used in Sokrio. → 08d §8.9
- **EventBridge (Scheduler)** — AWS event bus / one-off scheduled invocations; proposed for delayed approvals (F22). → 06 §6.8
- **Eviction** — Redis removing keys when `maxmemory` is hit, per `maxmemory-policy`. → 04 §4.9, R11
- **Exchange (direct / topic / fanout / headers)** — RabbitMQ router that copies messages to bound queues. → 03 §3.2

### F
- **Fan-out** — one message/trigger to many consumers or one job per tenant (`BaseCommand` → job per org). → 01 §1.6
- **Fat vs thin event** — full state in the payload vs just an id to look up. Tracking/departments are fat, the planned order events thin. → 00 §0.4
- **Fencing** — rejecting a stale member/leader by epoch or id (`FENCED_INSTANCE_ID`). → 07a R22
- **FIFO queue** — SQS ordered queue with `MessageGroupId`; Laravel 9.52 SqsQueue can't set it. `[LIB]` → 06 §6.8

### G–H
- **group.instance.id** — Kafka static membership id; Sokrio sets `""` → static, not dynamic (D1). → 02 §2.3
- **Hash slot** — Redis Cluster key → one of 16384 slots (CRC16). → 08c §8.6
- **Head-of-line (HOL) blocking** — one stuck message blocks everything behind it in the same partition/queue (poison message). → 07a R4
- **Heartbeat** — consumer liveness signal to the group coordinator; phpkafka sends it only on fetch outside Swoole (F9). → 02 §2.3
- **High watermark (HW)** — highest offset replicated to all ISR; consumers read up to it. → 08a §8.3
- **Horizon** — Laravel's Redis-queue dashboard/supervisor; not installed in Sokrio. → 00 §0.13

### I–K
- **Idempotency** — applying the same message twice has the same effect as once (upsert, unique key, dedupe table). → 02 §2.7, 09 L5
- **Idempotency-Key** — client-supplied request id for safe HTTP retries; only Task Manager has it in Sokrio. → 08e §8.13
- **Idempotent producer** — Kafka producer id + sequence numbers dedupe broker-side retries; phpkafka uses `producerId=-1` (off). `[LIB]` → 02 §2.1
- **Inbox pattern** — consumer stores processed message ids to dedupe. → 03 §3.4, 08a §8.2
- **ISR** — in-sync replicas: followers caught up with the leader. → 08a §8.3
- **Key (message)** — decides partition and thus ordering; Sokrio keys by `user_id` / `department_id`, not tenant (D4). → 02 §2.5
- **Kinesis** — AWS managed stream (shards), Kafka's closest AWS-native analog. → 06 §6.8
- **KIP** — Kafka Improvement Proposal (e.g. KIP-500 KRaft, KIP-848 new rebalance protocol, KIP-932 share groups). → 08a §8.3
- **KRaft** — Kafka's built-in Raft metadata quorum replacing ZooKeeper (KIP-500). Labs use 3 KRaft brokers. → 08a §8.3, 09 §9.2
- **KTable / GlobalKTable** — Kafka Streams table views of a topic; departments = KTable, `Org` = GlobalKTable candidate. → 08c §8.8

### L
- **Lambda / Kappa architecture** — batch + speed layers vs stream-only with replay. → 08c §8.8
- **Leader / follower** — partition replica roles; producers and consumers talk to the leader. → 08a §8.3
- **Lease (visibility timeout)** — a reserved message is hidden for N seconds, then redelivered. Laravel Redis = `retry_after`; SQS = VisibilityTimeout. → 04 §4.2
- **LEO** — log end offset: next offset to be written on a replica. → 08a §8.3
- **linger.ms / batch.size** — producer batching knobs (Java client); phpkafka batches per `sendBatch` call. → 02 §2.1
- **LocalStack** — local AWS emulator; used by the unrun L13. → 09 L13
- **Lock (distributed)** — mutual exclusion across processes; Laravel `Cache::lock` = Redis `SET NX EX` + owner-checked Lua release. → 04 §4.5
- **LSO** — last stable offset: `read_committed` consumers stop before open transactions. → 08a §8.2

### M
- **max.poll.interval.ms** — max gap between polls before the member is kicked (Java, default 5 min); in phpkafka the effective budget is `session_timeout` 30 s (F9). → 07a R3
- **maxmemory / maxmemory-policy** — Redis memory cap and what happens at it (`noeviction`, `*-lru`, `*-lfu`, `volatile-ttl`). → 04 §4.9
- **min.insync.replicas** — with `acks=all`, the minimum ISR size to accept a write (usually 2 with RF=3). → 07a R1
- **MSK** — Amazon Managed Streaming for Apache Kafka (provisioned / Serverless). phpkafka can't do its IAM/SCRAM auth (F21). → 06 §6.4
- **MemoryDB / ElastiCache** — AWS managed Redis: durable (multi-AZ log) vs cache-grade. → 06 §6.5
- **murmur2** — the Java Kafka client's default partitioner hash. → 08b §8.4

### N–O
- **NACK / requeue** — RabbitMQ negative ack; Laravel analog = `release($delay)`. → 03 §3.2
- **noeviction** — Redis refuses writes at `maxmemory` (`OOM command not allowed`); the right policy for a queue node. `[LAB]` → 09 L7
- **Noisy neighbor** — one tenant's load degrades others (shared queue, global export lane). → 07b R18, F24
- **Offset** — a record's position in a partition; committed offset = where the group resumes. → 02 §2.3
- **OFFSET_OUT_OF_RANGE** — committed offset no longer exists (retention) or is past the end; phpkafka resets to `latest − 1` (F6, F25). → 07a R27
- **onOneServer()** — Laravel scheduler lock so only one box runs a task; Sokrio relies on `RUN_SCHEDULER` instead. → 05 §5.1
- **OOM** — out of memory: Redis `OOM command not allowed`, or the kernel killing a PHP worker. → R11, R8
- **Ordering guarantee** — Kafka orders per partition only; Laravel queues give no ordering across workers. → 02 §2.8, R7
- **Outbox pattern** — write the event to a DB table in the same transaction, relay it to the broker later. Fixes dual write. → 02 §2.2, 08d §8.9

### P
- **Partition** — an ordered, append-only shard of a topic; the unit of parallelism and ordering. → 08a §8.3
- **Partitioner** — function key → partition (`crc32 % N` in phpkafka). → 02 §2.5
- **PEL** — Redis Streams pending entries list: delivered but not `XACK`ed. → 08c §8.6
- **Poison message** — a message that fails every time and blocks or loops. Sokrio logs and skips malformed envelopes. → 07a R4
- **Prefetch (QoS)** — RabbitMQ `basic.qos` cap on unacked messages per consumer. → 03 §3.2
- **Publisher confirms** — RabbitMQ broker ack to the producer (≈ Kafka `acks`). → 03 §3.2
- **Pub/sub (Redis)** — fire-and-forget fan-out, no persistence; unused in Sokrio. → 04 §4.8
- **Pusher** — hosted WebSocket service behind Laravel broadcasting; the frontend uses `laravel-echo` + `pusher-js`. → 04 §4.8, B5

### Q–R
- **Quorum queue** — RabbitMQ replicated (Raft) queue type; `x-delivery-limit` gives poison protection. → 03 §3.2
- **Rate limiter (fixed / sliding window, token bucket)** — Laravel limiters are fixed-window (D20). → 04 §4.6, 08c Q47
- **RDB** — Redis point-in-time snapshot persistence (`BGSAVE`). → 04 §4.9
- **read_committed** — consumer isolation that hides aborted/open transactional records. → 08a §8.2
- **Rebalance** — reassigning partitions when members join/leave/time out. → 07a R3
- **RecordBatch** — Kafka's on-disk/wire batch of records with one `baseOffset`; phpkafka ignores it and counts records (F7). `[LIB]` → 02 §2.3, 09 L4
- **Replication factor (RF)** — copies per partition; Sokrio's auto-create default is 1 (A3, R21). → 02 §2.5
- **Retention (retention.ms / retention.bytes)** — how long Kafka keeps records (broker default 7 days). → 00 §0.6
- **retry_after** — Laravel Redis-queue lease: a reserved job not finished in N s is handed out again. Sokrio = 9000 s. → 04 §4.2, R13
- **RPO / RTO** — recovery point (data you can lose) / recovery time objective. → 06 §6.5
- **RangeAssignor** — partition assignment strategy phpkafka uses (`ConsumerConfig.php:115`). `[LIB]` → 02 §2.3

### S
- **Saga** — a long business transaction as local steps + compensations; not used in Sokrio. → 08d §8.9
- **SASL (PLAIN / SCRAM / IAM / OAUTHBEARER / GSSAPI)** — Kafka auth mechanisms; phpkafka supports PLAIN only (F21). `[LIB]` → 06 §6.4
- **SCAN** — cursor-based Redis key iteration; the cursor API differs between predis and phpredis (F14, D21). → 04 §4.7, 09 L9
- **Schema registry / schema evolution** — versioned payload contracts (Avro/Protobuf/JSON Schema); Sokrio's envelope has no version field. → 07a R10
- **Session timeout (session.timeout.ms)** — no heartbeat for this long → member evicted; 30 s in Sokrio. → 02 §2.3
- **Share groups** — queue-like Kafka consumption with per-record acks (KIP-932). → 08c, 08d
- **Sharding** — splitting data across nodes by key (Redis Cluster slots, Kafka partitions). → 08c §8.6
- **SIGTERM / SIGINT / SIGKILL / SIGALRM / SIGUSR2** — stop request / Ctrl-C / uncatchable kill / Laravel job timeout alarm / Laravel worker pause. → 07a R9, 08d §8.10
- **SNS** — AWS pub/sub topic (fan-out to SQS, HTTP, SMS). → 06 §6.8
- **SQS (standard / FIFO)** — AWS managed queue; 15-min delay cap, visibility timeout, DLQ via redrive policy. → 06 §6.8
- **Static membership** — consumer keeps its partitions across restarts via `group.instance.id`; two processes with the same id fence each other. → 02 §2.3, 07a R22
- **Sticky / cooperative-sticky assignor** — keeps assignments stable across rebalances. → 08b §8.4
- **Stream (Redis)** — append-only log type with consumer groups (`XADD`, `XREADGROUP`, `XACK`, `XAUTOCLAIM`); unused in Sokrio. → 08c §8.6
- **Stream processing** — continuous computation over events (windows, joins, state stores). → 08c §8.8
- **Supervisor** — process manager that keeps `queue:work` / `kafka:consume` running; `autorestart`, `numprocs`, `stopwaitsecs`. → 05 §5.1, 06 §6.7

### T–Z
- **Tenant / landlord** — per-org DB vs platform DB in Sokrio's multi-tenancy. → 05 §5.5
- **Tombstone** — Kafka record with a null value; deletes a key in a compacted topic. → 02 §2.5
- **Topic** — named Kafka log made of partitions. → 00 §0.6
- **Transactional producer** — atomic writes across partitions + offsets (`transactional.id`). → 08a §8.2
- **TTL** — time to live of a cache key, lock or message. → 04 §4.4
- **Unclean leader election** — electing an out-of-sync replica (data loss for availability). → 07a R1
- **Under-replicated partitions (URP)** — partitions with ISR < RF; RF=1 can't under-replicate, it just goes offline. → 06 §6.9
- **Unique job** — Laravel `ShouldBeUnique`: a cache lock keyed by class + `uniqueId()` for `uniqueFor` seconds. → 04 §4.3
- **Visibility timeout** — SQS lease; Laravel's SqsQueue never sets it per pop. `[LIB]` → 06 §6.8, F22
- **volatile-lru / volatile-ttl** — evict only keys with a TTL; queue keys survive (no TTL). `[LAB]` → 09 L7
- **Write-ahead log (WAL)** — durable append before applying a change; Kafka's log is one. → 08b, 08c
- **ZooKeeper / ZAB** — Kafka's old metadata store and its consensus protocol, removed in Kafka 4.0. → 08a §8.3

---

## 10.3 Sokrio components, config and runtime names

### Kafka layer `[CODE]`
- **`KafkaProducer`** — publish engine: envelope, 3 attempts, socket teardown, no acks set. `app/Services/Kafka/KafkaProducer.php` → 02 §2.1
- **`KafkaConsumer`** — poll loop, 200 msg / 1 s flush, manual per-flush commit, signal blocking, join retry. → 02 §2.3
- **`ConsumeCommand` (`kafka:consume <topic>`)** — the artisan entry point; `HANDLERS` map = tracking, departments. → 00 §0.5
- **`TopicRegistry`** — topic keys → names, `.{APP_ENV}` suffix outside production. → 00 §0.6
- **`TopicProvisioner`** — auto-creates missing topics (P=3, RF=1), cache-marks them verified for 1 day. → 02 §2.5
- **`TrackingMessageHandler`** — groups by tenant, bulk-writes MySQL `trackings` + Mongo, retries 3×, per-point fallback. → 01 §1.4
- **`DepartmentMessageHandler`** — Mongo `bulkWrite` upsert on `department_id`, per-record fallback; untested. → 01 §1.5
- **`InterruptResilientStreamSocket`** — EINTR-tolerant socket subclass. → 07a R23
- **`PublishesKafkaMessage`** — observer trait that swallows and logs publish errors. → 02 §2.2
- **`DepartmentChangeObserver`** — publishes department `created`/`updated`; no fallback, no `afterCommit`. → 01 §1.5, F8
- **Envelope** — `{event_id, event_type, tenant_id, occurred_at, payload}`; the consumer drops `event_id`/`occurred_at`. → 00 §0.4
- **`tracking.events.v1` / `departments.events.v1`** — the two live topics; `order-summaries.events.v1` / `delivery-summaries.events.v1` are planned (B8). → 00 §0.6
- **`KAFKA_GROUP` / `{KAFKA_GROUP}-{topic}`** — tracking keeps the bare legacy group; other topics get their own (D2). → 02 §2.3
- **`KAFKA_CONSUMER_MAX_RUNTIME`** — consumer recycle, 21600 s (6 h) in config, 3600 s command fallback. → 00 §0.5
- **`KAFKA_AUTO_CREATE_PARTITIONS` / `_REPLICATION_FACTOR`** — auto-create defaults 3 / 1. → 00 §0.6
- **`kafka` log channel** — daily file `kafka-YYYY-MM-DD.log` + stderr, kept out of Slack/Sentry (D16). → 06 §6.9
- **Tracking v1 / v2** — single-point `send()` vs bulk `publishBatch` endpoints; 202 on publish, sync fallback, 503 + `Retry-After: 5` (D9). → 01 §1.4
- **`WriteTrackingActions` / `WriteBulkTrackingActions`** — the synchronous fallback writers. → 01 §1.4
- **`DepartmentSync` (`tenant:department_sync_with_mongodb`)** — full Mongo resync; manual only (F1). → 01 §1.5

### Queues, Redis, scheduler `[CODE]`
- **Queues `summary` / `default` / `feature-tracking` / `order-approved` / `sequential`** — the five named Redis queues in use. → 00 §0.7
- **`queues:{name}`, `:reserved`, `:delayed`** — Laravel's Redis list + two sorted sets per queue. `[LIB]` → 04 §4.2
- **DB0 / DB1** — Redis DB 0 = queues + `Redis::` facade (+ Python cache, F20); DB 1 = cache store. → 04 §4.1
- **`REDIS_CLIENT` (predis / phpredis)** — PHP Redis client; prod value unknown (A7) and decides F14. → 04 §4.1
- **`QUEUE_CONNECTION` / `CACHE_DRIVER`** — default `sync` / `file` in code; prod very likely `redis` (A6). → 04 §4.1
- **`RUN_SCHEDULER`** — env gate so only one box runs `schedule:run`. → 05 §5.1
- **`BaseCommand`** — summary command base: dispatch one job per active org. → 01 §1.6
- **`SummariesQuery`** — builds `updateOne` + `$set`/`$setOnInsert` upserts, so summary re-runs are idempotent. → 01 §1.6
- **`SequentialJob` / `SequentialJobDispatcher` / `sequential_jobs`** — landlord export lane, one export at a time platform-wide (F24). → 01 B6, 07b R34
- **`sequential:jobs`** — 4-hourly kick of the export lane. → 07b R34
- **`Order::approveAfter` / `ApproveOrder`** — delayed auto-approval job, idempotent via `pending()`. → 01 B7, F10
- **`BufferFeatureUsageListener` / `FlushFeatureEventsJob`** — Redis list buffer (RPUSH/LTRIM/EXPIRE) flushed every 15 min to Mongo `feature_usage_events`. → 04 §4.7
- **`ScopeCacheToTenant`** — HTTP middleware that prefixes the cache per tenant; workers don't get it (F12). → 04 §4.4
- **`EnsureTenantAccess`** — middleware that checks `Org.active` and stamps `tenant_id` into job payloads (dead on workers, F17). → 05 §5.5
- **`TenantManager::tenant($org)->reconnect()`** — switches the `tenant` connection; a no-op in `testing`. → 05 §5.5
- **`Org`** — landlord tenant model; `findById` cached `60*24*7` s ≈ 2.8 h (D12). → 04 §4.4
- **`ReportCacheMacro`** — "report already running" guard key; split by the prefix (F12 → 429). → 04 §4.4
- **`MatrixAggregator`** — the only stampede-protected cache (lock + double-checked remember). → 04 §4.5
- **`SmsResendRun`** — template for a fixed-prefix cloned cache store. → 04 §4.4
- **`ReportProgressUpdated` / `ReportNotification`** — `ShouldBroadcastNow` (sync Pusher call, F4) vs queued `ShouldBroadcast`. → 04 §4.8
- **`SendApprovalNotificationJob`** — best job template (Org + arrays, reconnect, per-step try, `->afterCommit()`). → 05 §5.3
- **`failed_jobs`** — Laravel failed-job table; no alert, no `queue:prune-failed` (R15). → 07b R15
- **Supervisor programs** — `sokrio-kafka-consumer-tracking`, `sokrio-kafka-consumer-departments`, `sokrio-feature-tracking`; numprocs=1, `stopwaitsecs=35`, DD_* off. `[NOTES]` → 06 §6.7
- **`pipeline.sh`** — server-side deploy script run over SSH by each GitHub workflow (A11). → 06 §6.1
- **Boxes: prod "all task" VM, PVM, queue-worker VM, report VM, staging** — the deploy targets in `.github/workflows`. → 06 §6.1
- **IFS / ERP shared-DB poll** — `customer_responses` / `sales_part` polled daily (05:40, 06:00). → 03 §3.3

### Labs `labs/`
- **`labs/compose.yml`** — 3 KRaft brokers `k1`–`k3` (`apache/kafka:3.7.0`) + Redis, project `-p t9lab`. → 09 §9.2
- **`labs/bin/k.sh` / `labs/bin/php.sh`** — Kafka CLI inside a broker / PHP 8.3 in `memo-phptest:jpeg` with Sokrio `vendor/` read-only. → 09 §9.2
- **`labs/laravel/artisan`** — ~10-line Laravel 9.52.22 console on Sokrio's vendor (`php artisan run <script>`). → 09 §9.2

---

## 10.4 Ids used across the deep dive

### F — findings (code defects or risks found in this deep dive)
- **F1** 🟡 `DepartmentSync` full resync is manual only; no safety net for lost department events. → 01 §1.5
- **F2** 🟡 `Department::upsert()` (ERP code sync) bypasses the observer, so `erp_code` never reaches Mongo. → 01 §1.5
- **F3** 🟢 `SecondaryOrderSummaryJob::uniqueId()` adds `rand()`, making `ShouldBeUnique` a no-op. → 01 §1.6
- **F4** 🟡 `ReportProgressUpdated` is `ShouldBroadcastNow`: Pusher latency/outage hits the export job. → 01 §1.6
- **F5** 🔴 Producer `acks=0`: "success" = socket write; broker rejections are silent. `[LAB]` → 02 §2.1, L2
- **F6** 🟡 No `auto.offset.reset`: new group starts at 0; out-of-range jumps to `latest − 1`, skipping the gap. → 02 §2.3, R27
- **F7** 🟡 phpkafka counts records and ignores `baseOffset`: mid-batch restart duplicates the head. `[LAB]` → 02 §2.3, L4
- **F8** 🟡 Bulk department update publishes inside an open transaction → phantom events on rollback. → 02 §2.2
- **F9** 🟡 Heartbeats only on fetch: a flush > 30 s → eviction → commit fails → batch replayed. `[LAB]` → 02 §2.3, L3
- **F10** 🟡 Primary-order delayed approval runs on `default` with `$timeout = 0` (idempotent via `pending()`). → 03 §3.3
- **F11** 🔴 `BulkStockImportJob` unique lock has no id and no TTL → other chunks/tenants silently dropped. `[LAB]` → 04 §4.3, R29, L8
- **F12** 🟡 Web vs worker cache prefix split: guards, unique locks and `Org` invalidation miss across processes. `[LAB-T4]` → 04 §4.4, R35, L10
- **F13** 🟡 Stock lock released before `DB::commit()` + read-modify-write → lost updates. → 04 §4.5
- **F14** 🔴-if-phpredis predis-style `Redis::scan` finds 0 keys on phpredis → feature analytics never flushed. `[LAB]` → 04 §4.7, R30, L9
- **F15** 🟢 `$candidate->lockForUpdate()` builds a query and never runs it → no row lock. → 04 §4.5
- **F16** 🔴 Tenant models in job constructors are restored from the *previous* job's tenant DB. `[LAB-T5]` → 05 §5.5, R31, L11
- **F17** 🟢 `EnsureTenantAccess` payload `tenant_id` stamp + listener exist only in HTTP → dead on workers. → 05 §5.5
- **F18** 🟢 Kafka handlers cache `Org` per process ≤6 h with no `active` check. → 05 §5.5
- **F19** 🟡 `[INFERENCE]` Stock upload on the `local` disk, job may run on another VM → silent no-op. → 06 §6.6, R32
- **F20** 🟡 Python benchmark cache shares Redis DB 0 with Laravel queues. → 06 §6.5
- **F21** 🟢 phpkafka SASL = PLAIN only → MSK IAM/SCRAM/Serverless impossible; TLS/mTLS only. → 06 §6.4
- **F22** 🟡 Approval delays up to 60 min vs SQS 15-min cap (migration blocker, not a live bug). → 06 §6.8, R33, L13
- **F23** 🟡 Deploy hygiene: unpinned `ssh-action@master`, password SSH on prod, PVM on the prod VM, no concurrency guard. → 06 §6.1
- **F24** 🟡 `[INFERENCE]` Global export lane stuck behind a dead `processing` row. → 07b R34
- **F25** 🟡→🔴 phpkafka replay loop: after a mid-batch restart the last batch is re-delivered on every poll. `[LAB]` → 09 L4

### D — notes-vs-code conflicts (the code wins)
- **D1** `''` instance id = static membership, not dynamic. → 00 §0.12
- **D2** One group per topic (tracking legacy bare group), not one shared group. → 00 §0.12
- **D3** Departments is live too, not only tracking. → 00 §0.12
- **D4** Key = `user_id` / `department_id`, not always `tenant_id`. → 00 §0.12
- **D5** Sync write is a fallback only (202), not a shadow write. → 00 §0.12
- **D6** Department publish is enabled; the Mongo sync call is what's commented out. → 00 §0.12
- **D7** Laravel 9.52.22, not 10. → 00 §0.12
- **D8** `autoCommit=false` + per-flush manual commit, not `true`. → 00 §0.12
- **D9** Fallback failure returns 503 + `Retry-After: 5`, not always 202. → 01 §1.7
- **D10** No nightly department resync; `DepartmentSync` is manual (F1). → 01 §1.7
- **D11** Departments have no sync fallback, and `upsert` never publishes (F2). → 01 §1.7
- **D12** `Org` cache TTL ≈ 2.8 h, not a week. → 04 §4.0
- **D13** One `afterCommit` site exists (`ApprovalNotifier.php:67`). → 05 §5.0
- **D14** In-process `Org` cache (≤6 h) outlives the 2.8 h Redis TTL (F18). → 05 §5.0
- **D15** Server Docker setup and `containerization/` are gone (`557e63d68`). → 05 §5.7
- **D16** Kafka logs are daily `kafka-YYYY-MM-DD.log`, not `kafka.log`. → 05 §5.0
- **D17** The devops skill's `docker-compose.prod.yml` AWS overlay doesn't exist. → 06 §6.0
- **D18** `.docker/php/` is an empty untracked folder. → 06 §6.0
- **D19** MySQL binlog is per server, not per tenant DB (Debezium cost). → 08b Q28
- **D20** Laravel rate limiters are fixed-window, not sliding. → 08c Q47
- **D21** The "null start on both clients" SCAN fix was wrong for predis; portable fix recorded. `[LAB]` → 09 L9

### R — runbooks (8-field template)
- **R1** Broker down / leader election / `acks=1` vs `all` · **R2** Lag on one hot partition · **R3** Rebalance loop · **R4** Poison message · **R5** Duplicate after crash before commit → 07a §7.1
- **R6** Dual-write loss · **R7** Out-of-order events · **R8** Consumer memory leak / silent death · **R9** Deploy restarts consumers mid-message · **R10** Schema change breaks consumers → 07a §7.1
- **R11** Redis full / eviction · **R12** Redis restart loses jobs (`:delayed`) · **R13** Job runs twice (`timeout >= retry_after`, `$timeout = 0`) `[LAB]` · **R14** Dispatched before commit · **R15** `failed_jobs` unwatched → 07b §7.4
- **R16** Cache stampede · **R17** Lock expires mid-job · **R18** Noisy-neighbor tenant · **R19** RabbitMQ memory alarm (not applicable + Redis analog) · **R20** Network partition / AZ failure → 07b §7.4
- **R21** RF=1 auto-created topic · **R22** `FENCED_INSTANCE_ID` from group sharing · **R23** EINTR from Datadog signals · **R24** Signal mid-DB-read → 07a §7.2
- **R25** Department publish lost, no fallback · **R26** `acks=0` silent loss (F5) · **R27** Out-of-range → latest (F6) · **R28** Offset counting vs batch base (F7; now `[LAB]`, see F25) → 07a §7.2
- **R29** F11 stock chunks dropped · **R30** F14 phpredis-blind flusher · **R31** F16 wrong-tenant models · **R32** F19 local-disk handoff → 07b §7.5
- **R33** F22 SQS delay cap · **R34** F24 stuck export lane · **R35** F12 prefix split → 07b §7.5

### AL — minimum alert set (T6 §6.9)
- **AL1** Kafka consumer lag (> 5 min time lag). → 06 §6.9
- **AL2** Queue depth / oldest-job age (`queue:monitor`, SQS `ApproximateAgeOfOldestMessage`). → 06 §6.9
- **AL3** `failed_jobs` count in the last hour → Slack. → 06 §6.9
- **AL4** Redis memory %, evictions, connections. → 06 §6.9
- **AL5** Broker disk, offline and under-replicated partitions. → 06 §6.9
- **AL6** Process liveness (Supervisor program state for consumers + workers). → 06 §6.9
- **AL7** Scheduler heartbeat (`->thenPing()` dead-man's switch). → 06 §6.9

### A — open assumptions (status in `_plan/MEMORY.md` §3)
- **A1** Producer acks default — resolved: `acks=0` (F5). · **A2** `auto.offset.reset` — resolved: none (F6).
- **A3** Prod topics RF=1 — open. · **A4** Kafka self-hosted on EC2, not MSK — open, leans yes. · **A5** Redis self-hosted, not ElastiCache — open, leans yes.
- **A6** Prod `QUEUE_CONNECTION=redis`, `CACHE_DRIVER=redis` — very likely. · **A7** Prod `REDIS_CLIENT` — open, urgent (decides F14), leans phpredis.
- **A8** Department observer publishes before commit — confirmed (F8). · **A9** Prod Redis `maxmemory` + `noeviction`, no AOF — open.
- **A10** Which boxes run which `--queue`s; shared `storage/app`? — open (F19). · **A11** Does `pipeline.sh` restart workers and stop consumers gracefully? — open.
- Questions for Komol: → 06 §6.11

### L — labs (09 §9.3)
- **L0** Smoke test · **L1** Kill a broker, RF=1 vs RF=3 · **L2** acks=0 swallows a rejection (F5) · **L3** Slow consumer → eviction → replay (F9)
- **L4** Counted offsets after a mid-batch restart → replay loop (F7, F25) · **L5** Duplicate, then idempotent insert · **L6** `retry_after` double run (R13)
- **L7** Redis OOM vs eviction policies (R11, A9) · **L8** Unique lock drops chunks (F11) · **L9** SCAN on two clients + corrected fix (F14, D21)
- **L10** Prefix split (F12, `[LAB-T4]`) · **L11** Wrong-tenant model restore (F16, `[LAB-T5]`) · **L12** Run Sokrio against the lab cluster · **L13** SQS delay cap with LocalStack (F22, not run)

### B — business flows (01 §1.2)
- **B1** GPS tracking (Kafka) · **B2** Department master data → Mongo (Kafka) · **B3** Sales/KPI summaries (scheduler → `summary` queue)
- **B4** Feature-usage analytics (Redis buffer) · **B5** Realtime notifications (Pusher) · **B6** Deferred exports (`sequential` lane)
- **B7** Delayed order approval (`order-approved`) · **B8** Planned order/delivery summary events (commented out)

### P / C — producers and consumers (00 §0.4–0.5)
- **P1** Tracking v1 single point · **P2** Tracking v2 bulk · **P3** `DepartmentChangeObserver` · **P4** `OrderObserver` (commented) · **P5** `DeliveryObserver` (commented)
- **C1** `kafka:consume tracking` → `TrackingMessageHandler` · **C2** `kafka:consume departments` → `DepartmentMessageHandler`

### Q — interview questions (08a–08e)
- **Q1–Q5** foundations · **Q6–Q11** delivery guarantees · **Q12–Q19** Kafka internals → 08a
- **Q20–Q28** Kafka ops · **Q29–Q37** RabbitMQ → 08b
- **Q38–Q47** Redis · **Q48–Q50** comparisons · **Q51–Q57** stream processing → 08c
- **Q58–Q63** patterns · **Q64–Q68** Laravel/PHP · **Q69–Q75** system design · **Q76–Q81** incidents → 08d
- **Q82–Q106** new Sokrio-derived questions · STAR story §8.14 · Designs 1–3 §8.15 → 08e

### T — task cards (`_plan/PLAN.md`)
- **T0** inventory · **T1** architecture · **T2** Kafka · **T3** RabbitMQ · **T4** Redis · **T5** Laravel · **T6** AWS · **T7** failure modes · **T8a–e** Q&A · **T9** study plan + labs · **T10** this glossary · **T11** HTML page · **T12** final QA

---

### ✅ Quality check
- [x] Every id family used in 00–09 is listed: F1–F25, D1–D21, R1–R35, AL1–AL7, A1–A11, L0–L13, B1–B8, P1–P5, C1–C2, Q1–Q106, T0–T12, each with the section where it lives
- [x] General terms cover the acronyms harvested from the sections (ISR, HW, LEO, LSO, KRaft, EOS, CDC, DLQ/DLX/DLT, ECST, CQRS, CAP/PACELC, URP, ELR, LRU/LFU, AOF/RDB, PEL, RPO/RTO, SASL, KIP…)
- [x] Sokrio components and config/env names point back to their section; env vars are names only
- [x] One line per entry, alphabetical within §10.2; no new code reads, so no new findings or conflicts
- [x] No secrets, hosts or IPs
