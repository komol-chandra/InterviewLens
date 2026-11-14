# 08b · Interview Q&A — Kafka Producers/Consumers/Ops & RabbitMQ (Q20–Q37)

> **Snapshot:** `sokrio-server` @ `master` · HEAD `d14c0ebb2` · written 2026-10-26.
> Paths are relative to `sokrio-server/`. Library paths are shortened to `phpkafka/…` = `vendor/longlang/phpkafka/src/…` (v1.2.5).
> Tags: `[CODE]` verified in app code · `[LIB]` verified in the vendored client · `[GENERAL]` industry knowledge · `[INFERENCE]` reasoned, needs a lab · `[ASSUMPTION]` best guess plus how to verify.
> Questions come from `../interview-questions.md` §4–§5 (wording unchanged). Sokrio examples reuse facts from sections 00–07. Finding ids (F1–F24), conflicts (D1–D19) and runbooks (R1–R35) point back to those sections.

**How to use this file:** Q20–Q28 are where Sokrio gives you the strongest stories (rebalance fencing, the commit change in PR-5094, heartbeats riding on fetches). Q29–Q37 are RabbitMQ, which Sokrio **does not run** (T3). For those, answer the textbook part, then show you know the Laravel-queue equivalent you actually operate. That's more convincing than pretending.

---

## 8.4 Kafka producers, consumers & operations (Q20–Q28)

### Q20. Walk through the full path of a message from `producer.send()` to being stored on disk.

**Short answer (30 seconds):**
In the Java client: `send()` runs interceptors, the serializer turns key and value into bytes, and the partitioner picks a partition. The record goes into the **record accumulator**, a per-partition batch buffer. A background **sender thread** ships full batches (or ones whose `linger.ms` has passed), grouped by leader broker. The leader appends the batch to the active log segment, which lands in the page cache. Followers fetch it, the high watermark advances, and the leader answers according to `acks`.

**Deep answer:**
- **Client side:**
  - `serializer` → `partitioner` → `RecordAccumulator` (sized by `buffer.memory`, batches up to `batch.size`, waits up to `linger.ms`).
  - Compression (`compression.type`) is applied per batch.
  - If the buffer is full, `send()` blocks for up to `max.block.ms`.
- **Network:** the sender thread builds one ProduceRequest per broker, carrying the batches for every partition that broker leads. `max.in.flight.requests.per.connection` caps unacknowledged requests (≤ 5 is safe with idempotence). `delivery.timeout.ms` bounds the whole send, including retries.
- **Broker:**
  - The leader validates the batch (CRC, size ≤ `message.max.bytes`, idempotence sequence).
  - It appends to the active `.log` segment and updates the sparse `.index` / `.timeindex`.
  - The write goes to the **page cache**. Kafka doesn't `fsync` per message by default; durability comes from replication.
- **Replication:** followers fetch, the leader moves the HW (Q16), and with `acks=all` the response waits for that. With `acks=1` it answers after the local append; with `acks=0` there is no response at all.
- **Callback:** the `Future` / callback gets the partition and offset, or an exception after retries run out.
- `[GENERAL]` Default `linger.ms` was 0 for years; Kafka 4.0 raised it to 5 ms (KIP-1030). Mention it as "small, version-dependent".

**Sokrio example:** `[CODE]` the PHP path is synchronous and much simpler. There's no accumulator and no sender thread:
1. `TrackingController.php:62-83` → `KafkaProducer::publish` (`app/Services/Kafka/KafkaProducer.php:54-68`).
2. The envelope `{event_id, event_type, tenant_id, occurred_at, payload}` is built (`:93-102`).
3. `sendWithRetry` (`:113-192`): `ensureTopicExists` (Redis-memoized, `TopicProvisioner.php:23,52-81`) → `sendBatch`. With **acks=0** the call returns right after the socket write (`phpkafka/Producer/Producer.php:159-163`, F5).
4. Batching only happens when the caller passes many messages: v2 bulk tracking sends all of a user's points in one `sendBatch` → one `RecordBatch` per partition (F7 context).
5. Uncompressed; timeouts of 1 s each (`config/kafka.php:25-27`) because the publish runs inside the HTTP request; 3 attempts on transport errors only, then the sync fallback.

**Follow-up questions the interviewer may ask:**
- Does Kafka `fsync` every write? (No. It relies on replication and the OS flush. `flush.messages` / `flush.ms` exist but are rarely used.)
- What happens if the leader changes mid-send? (`NOT_LEADER_OR_FOLLOWER` → metadata refresh → retry. Safe with idempotence.)
- Why can a large message fail even though the producer accepted it? (Broker `message.max.bytes` or topic `max.message.bytes`. With acks=0 you'd never know: F5.)

**Common mistakes to avoid:**
- Saying "acks=1 means it's on disk". It's in the leader's page cache.
- Forgetting that `send()` is asynchronous in Java. Without checking the future or callback, failures are silent.
- Thinking every client works like Java. Sokrio's PHP client has no background thread, so the HTTP request pays the latency.

---

### Q21. How does the default partitioner choose a partition? What happens with a `null` key? What is a "hot partition"?

**Short answer (30 seconds):**
With a key, the Java client hashes the key bytes with **murmur2** and takes it modulo the partition count, so the same key always goes to the same partition. With a `null` key, modern clients use the **sticky** partitioner: fill a batch for one partition, then switch. That gives bigger batches than round-robin. A hot partition is one that gets far more traffic than the others, usually because one key (a big customer or tenant) dominates. You fix it by choosing a finer key, or salting the hot key, at the price of per-key ordering.

**Deep answer:**
- `partition = toPositive(murmur2(keyBytes)) % numPartitions`. Change `numPartitions` and keys move (Q19).
- Null key: KIP-480 (2.4) introduced sticky partitioning; KIP-794 (3.3) made it "uniform sticky", which also avoids slow brokers.
- **Hot partition symptoms:** lag on one partition only, one broker hotter than the others, one consumer at 100 % while others idle. More consumers don't help, because a partition has one owner per group.
- **Fixes:**
  1. A higher-cardinality key (`user_id` instead of `tenant_id`).
  2. Salting (`tenant_id#rand(0..7)`): you lose per-tenant order and have to merge downstream.
  3. A dedicated topic for the whale.
  4. A custom partitioner.
- **Cross-language trap:** different clients may use different hash functions. A Java producer and a librdkafka producer with default settings can map the same key to different partitions (librdkafka offers `murmur2_random` for Java compatibility).

**Sokrio example:**
- `[LIB]` phpkafka uses **`crc32(key) % N`** (`phpkafka/Producer/Partitioner/DefaultPartitioner.php:48-53`), not murmur2. If a Java or Python service ever produced to the same topic with the same keys, events for one user could land on different partitions, breaking per-user order. Pin the partitioner if you add a second producer language.
- `[CODE]` Sokrio always sets a key. The default is `tenant_id` (`KafkaProducer.php:58,76`), but tracking overrides it with `user_id` (`Tracking/TrackingController.php:62-68`) and departments with `department_id` (`DepartmentChangeObserver.php:131-138`). That's D4: the notes said "key = tenant", the code deliberately avoids a hot tenant.
- R2 angle: "Our key is user_id, not tenant_id, so a big tenant can't create a hot partition. Per-tenant ordering is gone, and tracking doesn't need it. Lag on one partition is a key-design problem; adding consumers doesn't fix it."

**Follow-up questions the interviewer may ask:**
- Can one hot *user* still be a problem? (In theory yes. In practice one rep's GPS rate is tiny.)
- How would you detect skew before it hurts? (Per-partition bytes-in and lag; a key-cardinality sample.)
- When would you write a custom partitioner? (Pinning VIP tenants, or geography-based routing.)

**Common mistakes to avoid:**
- Saying null keys are round-robin per message in modern Java clients.
- Fixing a hot partition by adding partitions. The hot key still hashes to one place.

---

### Q22. Explain consumer groups and rebalancing. What triggers a rebalance, and why is it bad?

**Short answer (30 seconds):**
A consumer group shares a topic's partitions: each partition goes to exactly one member. A rebalance re-assigns partitions when membership or metadata changes: a consumer joins, leaves or crashes, misses heartbeats or `max.poll.interval.ms`, or partitions are added. The classic "eager" protocol is stop-the-world: everyone revokes everything, so processing pauses and in-flight work is replayed. Cooperative rebalancing only moves the partitions that need to move, and static membership (`group.instance.id`) skips the rebalance when a known member restarts quickly.

**Deep answer:**
- **Protocol (classic):**
  - A broker acts as **group coordinator**.
  - Members send JoinGroup; one member (the group leader) computes the assignment with the configured assignor; SyncGroup distributes it.
  - Heartbeats keep membership alive (`session.timeout.ms`).
- **Triggers:**
  - A member joins or leaves.
  - A session timeout (crash, network problem, GC pause).
  - `max.poll.interval.ms` exceeded.
  - The subscription changes, or partitions are added to a subscribed topic.
- **Why it's bad:**
  - Paused consumption (seconds to minutes with large groups).
  - Duplicates: uncommitted work is replayed by the new owner.
  - Lost local state or caches.
  - Rebalance storms when members keep timing out.
- **Mitigations:**
  - `CooperativeStickyAssignor` (incremental, KIP-429).
  - Static membership (KIP-345): a restart within `session.timeout.ms` keeps its partitions.
  - Commit in `onPartitionsRevoked`.
  - Keep processing per poll short.
  - `[GENERAL]` KIP-848 (new consumer protocol, GA in Kafka 4.0) moves assignment to the broker and makes rebalances incremental by default.

**Sokrio example:**
- `[CODE]` Static membership is on, but with **one hard-coded id: `group.instance.id = ""`** (`app/Services/Kafka/KafkaConsumer.php:79-95`). The notes thought `''` meant dynamic membership (D1). It doesn't: it's a static member called "".
- `[CODE]` **What happened:** when all topics shared one `KAFKA_GROUP`, two consumers registered the same instance id in the same group and kept fencing each other (`FENCED_INSTANCE_ID` ping-pong, comment at `KafkaConsumer.php:92-94`). The fix was one group per topic (`ConsumeCommand.php:97-107`, commit `9d902b7e8`, D2, R22).
- `[CODE]` The join handshake is retried 5× on transport and Kafka errors (`KafkaConsumer.php:404-432`, commits `de9b53f38`/`d1cbf7c54`).
- `[LIB]` Assignor = `RangeAssignor` (`phpkafka/Consumer/ConsumerConfig.php:115`). With one process per group there's nothing to balance today. Scaling to 3 processes needs per-process instance ids first (Q19).
- R22 angle: "It's a config that's correct at N=1 and broken at N=2."

**Follow-up questions the interviewer may ask:**
- Static membership downside? (A really dead member holds its partitions until `session.timeout.ms` expires, so lag grows meanwhile.)
- How do you make rebalances safe for at-least-once? (Commit processed offsets on revoke, and keep consumers idempotent.)
- Range vs RoundRobin vs Sticky assignors? (Range co-locates the same partition numbers across topics; Sticky minimizes movement.)

**Common mistakes to avoid:**
- Saying a rebalance only happens on crashes. A slow handler causes one too (Q25).
- Reusing one `group.instance.id` across processes.

---

### Q23. Auto-commit vs manual commit. Describe a scenario where auto-commit causes data loss and one where it causes duplicates.

**Short answer (30 seconds):**
Auto-commit periodically commits the offsets the consumer has *received*, whether or not your code finished with them. **Loss:** you hand records to a background thread, the next poll auto-commits them, the process crashes before the thread writes. They're committed but never processed. **Duplicates:** you process records, crash before the next auto-commit interval, and on restart you read them again. Best practice: disable auto-commit, commit **after** processing (at-least-once), and make processing idempotent.

**Deep answer:**
- Java: `enable.auto.commit=true` (default) with `auto.commit.interval.ms=5000`. The commit happens inside `poll()` for offsets returned by the *previous* poll. So with strictly synchronous processing, auto-commit is roughly at-least-once. The **loss** case needs async processing, or a library that commits on receipt.
- **Duplicate window:** up to one interval (5 s) of processed but uncommitted records, plus whatever was in flight at a rebalance.
- **Manual options:**
  - `commitSync` after each batch: simple, adds latency.
  - `commitAsync` + a final `commitSync` on shutdown/revoke: faster.
  - Store the offset in your DB in the same transaction as the result: exactly-once into that DB.
- Committing per message is correct but slow. Per batch is the usual compromise.

**Sokrio example:** this is a real before/after (D8):
- `[NOTES]` **PR-5094** used the library's `Consumer::start()` with `autoCommit = true`. In that library the ack happened after the handler callback returned, **even when the handler had given up**, so failures were at-most-once. It also committed per message (slow).
- `[CODE]` **Today:** `autoCommit = false` (`KafkaConsumer.php:69`). Sokrio runs its own poll loop, buffers up to 200 messages or 1 s, then flushes with signals masked (`:301-339`), and only then calls `saveOffsets` for dirty partitions (`:326-336`). Commit `a7e63f4bb`.
- **Remaining gaps:**
  - The give-up path still commits after logging (`TrackingMessageHandler.php:141-157`), so a permanently failing record is skipped, not parked. That's what a DLQ fixes (T2 §2.9).
  - The cursor counts messages instead of reading record offsets (F7 `[INFERENCE]`), so a mid-batch restart could duplicate *and* skip. That needs a lab (T9).

**Follow-up questions the interviewer may ask:**
- What do you commit, the last processed offset or +1? (+1: the committed offset is "the next one to read".)
- A commit fails after processing. What now? (Log it and continue. You'll replay on rebalance, and idempotency absorbs it.)
- How does a rebalance interact with commits? (Commit in the revoke callback; otherwise the new owner replays.)

**Common mistakes to avoid:**
- Saying auto-commit always loses data. With synchronous processing it mostly duplicates.
- Committing before the side effect "to be safe". That's at-most-once.

---

### Q24. What is consumer lag? How do you monitor it, and what are 5 possible causes of increasing lag?

**Short answer (30 seconds):**
Lag is, per partition, the log end (high watermark) minus the group's committed offset: how many messages are waiting for that group. Monitor it with `kafka-consumer-groups.sh --describe`, Burrow, a Prometheus exporter, or managed metrics (MSK `MaxOffsetLag`, `EstimatedMaxTimeLag`). Alert on time lag or a lag trend, not one raw number. Common causes: slow processing (usually a slow downstream DB), too few consumers or partitions, a hot partition, rebalance storms, GC or long pauses, a dead consumer, or a traffic spike.

**Deep answer:**
- **Offset lag vs time lag:** 10,000 messages may be 2 s or 2 h behind. Time lag (age of the oldest unconsumed message) maps to the user's experience.
- **Patterns:**
  - Lag growing on **all** partitions → capacity or downstream problem.
  - On **one** partition → hot key or a stuck consumer.
  - **Sawtooth** → batching; fine.
  - **Flat but non-zero, with no new commits** → the consumer is dead or stuck. Lag is the best liveness signal.
- **Causes, with the first check for each:**
  1. Slow sink → DB latency.
  2. Too few consumers → partition count vs members.
  3. Hot key → per-partition lag.
  4. Rebalance loop → coordinator logs and join rate.
  5. Poison message with retries/sleeps → handler logs.
  6. Consumer down → group state `Empty`.
  7. A spike → producer bytes-in.

**Sokrio example:**
- `[CODE]` **No lag metric or alert exists** (T6 §6.9, AL list). It's part of Top-5 risk #5 (no alerting, T7 §7.6).
- Lag causes specific to Sokrio, all from code:
  - **Retry sleeps pause every partition:** one tenant's DB blip makes the handler sleep 1 s + 2 s (`TrackingMessageHandler.php:85-116`). Since one process owns all 3 partitions (numprocs=1), every user's tracking lags (T2 §2.8).
  - **Eviction replays:** a flush over 30 s with no heartbeat (F9) → evicted → batch replayed → lag rises *and* duplicates appear.
  - **Fetch size:** partition `maxBytes = 0` probably means about one batch per fetch (`phpkafka/Protocol/Fetch/FetchPartition.php:45`, `[INFERENCE]`), so catching up after a backlog is slow.
  - **Dead consumer:** Supervisor gives up after 3 failed starts (FATAL) with no alert (T7). The process is gone, and lag climbs silently.
- R8 angle: "Lag is the best liveness metric: it rises whether the process leaks, hangs or is gone." A cheap first alert: a scheduled `kafka-consumer-groups.sh --describe --group <group>` check, posting to Slack above a threshold.

**Follow-up questions the interviewer may ask:**
- Lag is high but CPU is low. Why? (Waiting on I/O: DB, network, sleeps. Or the consumer isn't running.)
- Should you autoscale on lag? (Yes, but only up to the partition count.)
- How do you tell "behind" from "dead"? (Whether the committed offset is moving.)

**Common mistakes to avoid:**
- Alerting on absolute lag for bursty topics (alert fatigue).
- Adding consumers beyond the partition count.

---

### Q25. What happens if a consumer takes longer than `max.poll.interval.ms` to process a batch?

**Short answer (30 seconds):**
In the Java client, a background heartbeat thread keeps the session alive, but if you don't call `poll()` again within `max.poll.interval.ms` (default 5 min), the consumer is treated as stuck. It leaves the group and a rebalance gives its partitions to someone else. When it finally tries to commit, it gets `CommitFailedException`. The new owner re-reads from the last committed offset, so the batch is processed twice. If the batch is always slow, this repeats forever: a rebalance loop.

**Deep answer:**
- Two separate timeouts: `session.timeout.ms` (heartbeats, i.e. "is the process alive?") and `max.poll.interval.ms` ("is it making progress?"). Since KIP-62, heartbeats run on their own thread, so slow processing only trips the second one.
- **Fixes:**
  1. Smaller batches (`max.poll.records`).
  2. Faster processing (bulk writes, fewer round trips).
  3. Raise `max.poll.interval.ms` to match the real worst case.
  4. Hand off to workers, but **pause** the partitions and keep polling, then commit only completed offsets.
- Idempotent processing makes the inevitable replay harmless.

**Sokrio example:** the PHP client is stricter than Java:
- `[LIB]` phpkafka has **no heartbeat thread** outside Swoole (`KafkaUtil.php:45-53` → `NoopTimer`). Heartbeats are sent **only during fetches** (`phpkafka/Consumer/Consumer.php:292-294,421-427`, F9). So the effective limit is `session_timeout` = **30 s**, not 5 minutes.
- `[CODE]` A flush can get there:
  - Tracking retries sleep 1 s + 2 s.
  - Then a per-point fallback for up to 200 points (`TrackingMessageHandler.php:85-158`).
  - Against a slow tenant DB, that passes 30 s.
- What follows: eviction → `saveOffsets` fails and is swallowed at debug level (`KafkaConsumer.php:329-335`) → the batch is replayed → **duplicate tracking rows**, because tracking isn't idempotent (Q8).
- R3 angle: "Our PHP client heartbeats only on fetch, so *any* slow write is a liveness failure. The processing budget per batch must be below the session timeout, and idempotent writes make the replay safe."
- **Fixes:**
  - Classify errors so permanent ones skip the sleeps (T2 §2.9).
  - Cap the flush time.
  - Add the unique key on `(user_id, created_at)`.
  - `ext-rdkafka` brings a real heartbeat thread.

**Follow-up questions the interviewer may ask:**
- How do you see this in logs? (`CommitFailedException` / `REBALANCE_IN_PROGRESS` / `UNKNOWN_MEMBER_ID`, plus the same offsets processed twice.)
- Why not just set the interval to an hour? (A truly stuck consumer would then hold its partitions for an hour.)

**Common mistakes to avoid:**
- Confusing `session.timeout.ms` with `max.poll.interval.ms`.
- Assuming every client library has a heartbeat thread.

---

### Q26. How do you reprocess (replay) data in Kafka from 3 days ago without affecting the current production consumers?

**Short answer (30 seconds):**
Use a **new consumer group**, so production's committed offsets are untouched. Before starting it, set its offsets to a timestamp with `kafka-consumer-groups.sh --reset-offsets --to-datetime … --execute`, or in code call `offsetsForTimes()` then `seek()`. Check first that retention still covers 3 days. Make the replay's side effects idempotent, or point them at a separate target, and throttle it so it doesn't starve the production sink.

**Deep answer:**
- **Steps:**
  1. Confirm the data exists: `retention.ms` ≥ 3 d and the earliest offset ≤ T−3d.
  2. Create the replay group id.
  3. Reset its offsets to the datetime (the group must be inactive).
  4. Run the replay consumer with the fixed code.
  5. Stop at a target offset or time.
  6. Delete the group.
- **Side effects:** writes must be upserts, version-guarded or deduplicated. External calls (emails, SMS) usually must be **disabled** in replay mode.
- **Alternatives:** re-publish a filtered slice into a `*.replay` topic; or rebuild from a compacted topic (Q18); or, beyond retention, restore from tiered storage or an archive (S3 sink).
- Resetting the **production** group is a valid recovery, but only with the consumers stopped and a written plan.

**Sokrio example:**
- `[CODE]` Group ids come from `resolveGroupId` (`app/Console/Commands/Kafka/ConsumeCommand.php:97-107`): tracking uses bare `KAFKA_GROUP`, others `{KAFKA_GROUP}-{topic}`. A replay needs a different `KAFKA_GROUP` env value for a one-off process, or a `--group` option, which doesn't exist yet.
- `[LIB]` A brand-new group starts at **offset 0**, the earliest retained (`phpkafka/Consumer/OffsetManager.php:107`, F6). So a fresh replay group replays *everything retained* (broker default 7 d, `[ASSUMPTION]`), not 3 days. Set the offsets with the CLI before the first start.
- **Safety per stream:**
  - Departments: safe, idempotent `$set` upserts (`DepartmentMessageHandler.php:87-112`).
  - Tracking: **not** safe, plain inserts. Replay into a staging table, or add the unique key first.
- The envelope drops `event_id` on decode (`KafkaConsumer.php:360-364`), so the replay can't skip what it already processed.

**Follow-up questions the interviewer may ask:**
- What if retention has already deleted the data? (Reconcile from the source of truth. For departments that's `tenant:department_sync_with_mongodb`, F1.)
- How do you avoid the replay competing with live traffic? (Throttle, run off-peak, separate DB connection pool.)
- Can you replay only one tenant? (Only by filtering in the consumer. The key is user/department, so a tenant spans all partitions.)

**Common mistakes to avoid:**
- Resetting the production group while it's running.
- Forgetting non-idempotent side effects (double notifications).

---

### Q27. What is Schema Registry? Explain backward vs forward vs full compatibility with an example.

**Short answer (30 seconds):**
A schema registry stores versioned schemas (Avro, Protobuf, JSON Schema) for each topic. Producers register or look up a schema and put its id in each message; consumers fetch the schema by id. On registration, it enforces a compatibility rule. **Backward:** new consumers can read old data (e.g. add a field *with a default*). **Forward:** old consumers can read new data (e.g. add a field old readers ignore, or remove one that had a default). **Full:** both. That lets producers and consumers deploy separately without breaking each other.

**Deep answer:**
- **Example** (`Order` v1 `{id, total}`):
  - Add `currency` with default `"BDT"` → backward compatible (new readers fill the default for old messages) and forward compatible (old readers ignore the new field) → full.
  - Rename `total` → `amount` → breaks both.
  - Add a required field with no default → breaks backward.
- **Deploy order:**
  - Backward → upgrade **consumers first**.
  - Forward → **producers first**.
  - Full → any order.
- `_TRANSITIVE` variants check against all previous versions, not just the last.
- **Wire format** (Confluent): magic byte + 4-byte schema id + payload.
- Without a registry you still need the discipline: a version field in the envelope, additive-only changes, and contract tests.

**Sokrio example:**
- `[CODE]` There's no registry and no schema version. The envelope is `{event_id, event_type, tenant_id, occurred_at, payload}` JSON (`KafkaProducer.php:93-102`). The only versioning is the `.v1` topic suffix (`TopicRegistry.php:18-24`).
- `[CODE]` What breaks today (T7 facts):
  - **Handlers ignore `event_type`** and branch on the topic only.
  - **Tracking:** requires `user_id, lat, long, address, created_at` (`WriteBulkTrackingActions.php:56-61`). A renamed key = 3 retries, then the point is dropped.
  - **Departments:** `$set` the whole payload (`DepartmentMessageHandler.php:94-96`), so a renamed field leaves the old one lingering in Mongo. Rows with no `department_id` are skipped silently (`:88-90`).
- R10 angle: "Producers and consumers deploy separately, so every change must be backward *and* forward compatible for one deploy window. Version the envelope, deploy consumers first, test the contract. A schema registry is the scaled-up form of the same rule."
- Cheapest step: add `schema_version` to the envelope and a contract test that round-trips each event type through the handler.

**Follow-up questions the interviewer may ask:**
- Avro vs Protobuf vs JSON Schema? (Avro: compact, needs the writer schema. Protobuf: field numbers, good tooling. JSON Schema: human-readable, larger, weaker evolution rules.)
- How do you make a breaking change? (New topic `.v2`, dual-publish, migrate consumers, retire `.v1`.)

**Common mistakes to avoid:**
- Mixing up backward and forward (backward = the **new reader** works on old data).
- Thinking JSON means "no schema". It means an implicit schema nobody checks.

---

### Q28. What is Kafka Connect? What is CDC and how does Debezium work?

**Short answer (30 seconds):**
Kafka Connect is a framework for moving data between Kafka and other systems with configured connectors instead of custom code. **Source** connectors pull into Kafka, **sink** connectors push out. Workers run in distributed mode and store offsets and config in Kafka topics. CDC (change data capture) streams every insert, update and delete from a database. Debezium is a set of CDC source connectors: it first snapshots the tables, then tails the database's replication log (MySQL binlog, Postgres WAL) and publishes one change event per row change, with before/after values.

**Deep answer:**
- **Connect:**
  - Tasks give parallelism.
  - Single Message Transforms (SMTs) do light reshaping.
  - Converters handle serialization (Avro / JSON).
  - Error tolerance + a DLQ topic for sink connectors.
  - Common sinks: S3, Elasticsearch, JDBC, MongoDB.
- **Debezium + MySQL:**
  - Needs `binlog_format=ROW` (+ GTIDs recommended) and a replication user.
  - It acts like a MySQL replica.
  - Events carry `op` (c/u/d/r), `before`, `after`, and source metadata (binlog file/position, transaction id).
  - Schema changes go to a schema-history topic.
- **The outbox event router SMT** turns inserts into an `outbox` table into clean domain events. This is CDC-based outbox (Q10) with no relay code.
- **Trade-offs:**
  - (+) No dual writes; catches writes that bypass the app.
  - (−) Another cluster to run; DB-level events leak table structure unless you use the outbox pattern; operating it needs binlog retention.

**Sokrio example:**
- `[GENERAL]` **Correction to T2 §2.2 (D19):** the MySQL binlog is **per server, not per database**. One Debezium connector can capture every tenant DB on the same MySQL server with a `database.include.list` regex. The cost grows with the **number of MySQL servers**, not tenants. Some tenants live on a different host (the THL tenant points at a remote server), so it would be one connector per server plus routing by database name.
- `[CODE]` **CDC would close real gaps:**
  - `Department::upsert()` and query `->update()` bypass observers, so ERP codes never reach Mongo (F2, `DepartmentErpCodeSyncJob.php:71`). Binlog capture sees every write.
  - The phantom-event bug (F8) disappears: the binlog only contains **committed** transactions.
- `[CODE]` **A Connect-shaped job Sokrio does by hand:** the IFS ERP sync polls `{ifs_database}.customer_responses` for `fetch = 0` once a day (`DepartmentErpCodeSyncJob.php:44-73`, `Kernel.php:147`). A JDBC source connector, or Debezium on the ERP DB, would make it near-real-time, but it needs the ERP team's agreement (T3 §3.3.4).
- Verdict for Sokrio today: an `afterCommit` observer + a scheduled `DepartmentSync`, then a table outbox. Debezium only once there are several event-producing tables.

**Follow-up questions the interviewer may ask:**
- What happens to Debezium when binlogs are purged before it reads them? (It must re-snapshot. Size binlog retention for the worst outage.)
- Table CDC vs outbox CDC? (Outbox gives stable domain events; table CDC couples consumers to your schema.)
- How are deletes represented? (An `op=d` event, then a tombstone for compacted topics.)

**Common mistakes to avoid:**
- Thinking CDC removes the need for idempotent consumers (Connect is at-least-once).
- Publishing raw table rows as your public event contract.

---

## 8.5 RabbitMQ (Q29–Q37)

> `[CODE]` Sokrio doesn't use RabbitMQ: no library, no connection, no AMQP code (`config/queue.php:30-72` lists only `sync`, `database`, `beanstalkd`, `sqs` stub, `redis`; T3 §3.1). Each Sokrio example below is the **Laravel-on-Redis equivalent** or "here is how it would look".

### Q29. Explain the AMQP model: producer → exchange → binding → queue → consumer. Why doesn't the producer publish directly to a queue?

**Short answer (30 seconds):**
Producers publish to an **exchange** with a routing key. **Bindings** are rules that connect exchanges to queues. The exchange copies the message to every queue whose binding matches. **Consumers** read from queues. The indirection decouples producers from the consumer topology: you can add a queue, fan out, or reroute by adding bindings, without touching producer code. Even "publish to a queue" really goes through the nameless default exchange, which routes by queue name.

**Deep answer:**
- **Objects:**
  - Connection → channels (lightweight, multiplexed).
  - Exchange (type + durability).
  - Queue (durable / exclusive / auto-delete, plus arguments like `x-dead-letter-exchange`, `x-queue-type`).
  - Binding (exchange → queue, with a binding key or header match).
- **Default exchange:** every queue is automatically bound to `""` with its own name, so `basic_publish(exchange='', routing_key='emails')` looks like publishing to a queue.
- **Why the indirection:**
  - Routing logic lives in the broker.
  - Many consumers with different filters.
  - Alternate exchanges for unroutable messages.
  - DLX policies applied without code changes.
- An unroutable message is dropped silently unless the producer sets `mandatory` (it gets a `basic.return`) or the exchange has an alternate exchange.

**Sokrio example:**
- `[CODE]` Laravel's Redis queue is the "publish directly to a queue" model. `dispatch(...)->onQueue('order-approved')` pushes onto a Redis list named after the queue (`app/Models/Order/Order.php:240-243`). There's no exchange, no routing, no fan-out. The producer must know the queue name.
- That's exactly how F10 happened: `PrimaryOrder::approveAfter` dispatches with **no** `onQueue` (`app/Models/MongoDB/PrimaryOrder/PrimaryOrder.php:199-203`), so the job lands on `default`. In AMQP, a binding would have routed `order.approve.*` to one queue regardless of which model published it.
- Where Sokrio *does* fan out, it uses Kafka consumer groups (Q2).

**Follow-up questions the interviewer may ask:**
- What happens to a message published to an exchange with no bindings? (Dropped, unless `mandatory` or an alternate exchange.)
- Why channels instead of connections? (TCP connections are expensive; channels multiplex over one.)

**Common mistakes to avoid:**
- Saying producers publish to queues.
- Forgetting the unroutable-message case.

---

### Q30. Explain the 4 exchange types (direct, fanout, topic, headers) with a real example for each.

**Short answer (30 seconds):**
**Direct:** routes on exact routing-key match, e.g. `sms.send` to the SMS workers. **Fanout:** copies to every bound queue and ignores the key, e.g. `order.placed` to inventory, billing and notifications. **Topic:** pattern match on dot-separated keys, where `*` is one word and `#` is zero or more, e.g. `order.*.created` or `tenant.42.#`. **Headers:** matches on message headers instead of the key (`x-match=all|any`), e.g. route by `region=EU` and `priority=high`.

**Deep answer:**
- **Direct:** good for work queues and severity routing (`log.error` → pager queue). Several queues can bind the same key (fan-out to those).
- **Fanout:** the fastest (no matching); broadcast and cache invalidation.
- **Topic:**
  - Hierarchical keys like `<domain>.<entity>.<event>`.
  - `#` alone = fanout. No wildcards = direct.
  - Design the key order so the common filters are prefixes.
- **Headers:** rarely needed; slower; useful when routing depends on several attributes or non-string values.
- **Extras:**
  - Exchange-to-exchange bindings (layered routing).
  - Consistent-hash exchange plugin (sharding like Kafka partitions).
  - Delayed-message exchange plugin (Q34).

**Sokrio example:** how Sokrio's flows would map (T3, "how it would look"):
- **Direct:** `order.approve` → `order-approved` workers. Today: a named Laravel queue (`Order.php:243`).
- **Fanout:** `department.changed` → Mongo sync + (future) search index. Today: Kafka topic `departments.events.v1` with one group (`DepartmentChangeObserver.php:26-46`).
- **Topic:** `tenant.<org_id>.summary.<type>` → lets a "big tenants" queue bind `tenant.42.#` for isolation (T3 §3.3.3 fairness). Today: one FIFO `summary` queue for everyone (`BaseCommand.php:50-70`).
- **Headers:** `tier=enterprise` → priority workers. Today: nothing. Laravel would use `--queue=summary-high,summary`.

**Follow-up questions the interviewer may ask:**
- Topic exchange performance with thousands of bindings? (A trie-based matcher, fine in practice. Keep keys short.)
- How would you implement multi-tenant routing? (A topic key with the tenant id; per-tier queues.)

**Common mistakes to avoid:**
- Mixing up `*` (exactly one word) and `#` (zero or more).
- Using headers exchanges where a topic key would do.

---

### Q31. Explain `ack`, `nack`, `reject`, and `requeue`. What happens if a consumer crashes before acking?

**Short answer (30 seconds):**
`ack` tells the broker "done, delete it". `reject` refuses **one** message; `nack` is RabbitMQ's extension that can refuse many at once. Both take `requeue`: `true` puts the message back in the queue, `false` drops it or dead-letters it if a DLX is set. If a consumer crashes, or its channel or connection closes, before acking, every unacked message on that channel is **requeued immediately** and redelivered with `redelivered=true`. Careful: `nack(requeue=true)` on a poison message creates an infinite hot loop.

**Deep answer:**
- **Manual ack mode** (`autoAck=false`) is what gives at-least-once. With auto-ack, the message is gone as soon as it's sent: at-most-once.
- **Requeue position:** back to its original position where possible (often near the head), so it's redelivered almost at once with no delay.
- **Poison protection:**
  - Quorum queues track delivery counts. `x-delivery-limit` dead-letters after N attempts; RabbitMQ 4.0 sets a default limit of 20.
  - Classic queues: count it yourself (`x-death`), or use DLX + TTL retry (Q34).
- **Consumer ack timeout** (`consumer_timeout`, default 30 min): a consumer that holds a message too long gets its channel closed and the message requeued.
- `multiple=true` acks or nacks everything up to that delivery tag.

**Sokrio example:** `[CODE]` the Laravel analogs, and the big difference:

| AMQP | Laravel on Redis | Sokrio ref |
|---|---|---|
| ack | job deleted after `handle()` returns | `vendor/…/Queue/RedisQueue.php:305` |
| nack requeue with delay | `$this->release($seconds)` / `backoff` | `RedisQueue.php:321` |
| reject → DLX | `$tries` exhausted → `failed()` + `failed_jobs` | `config/queue.php:82-86` |
| unacked → redelivered on crash | the reserved job is **re-delivered only after `retry_after`** | `config/queue.php:65` (= 9000 s) |

The last row is the important one. RabbitMQ notices a dead consumer when the TCP connection drops. Laravel can't tell, so it waits out the lease. A worker crash in the middle of a delayed approval makes it **2.5 h late** (R12/R13, Top-5 #4). The T3 fix: a short-`retry_after` connection for `order-approved`.

**Follow-up questions the interviewer may ask:**
- Does a redelivered message keep its order? (Roughly, but not guaranteed with multiple consumers.)
- How do you know a message is a redelivery? (The `redelivered` flag, or `x-delivery-count` on quorum queues. Use it to route to slow handling.)

**Common mistakes to avoid:**
- Using auto-ack and assuming at-least-once.
- Requeueing poison messages forever.

---

### Q32. What is prefetch (`basic.qos`)? How does it affect throughput, fairness, and memory?

**Short answer (30 seconds):**
Prefetch is the maximum number of unacked messages the broker pushes to a consumer (per consumer, or per channel with the global flag). Prefetch 1 gives fair dispatch, since a busy consumer gets nothing new, but throughput is low because every message waits for an ack round-trip. A high prefetch gives throughput, but one consumer can hoard messages (unfair, and slow messages stuck behind fast ones), uses client memory, and loses ordering across consumers. Typical values are tens to a few hundred, tuned from processing time vs network latency.

**Deep answer:**
- **Rule of thumb:** prefetch ≈ round-trip time ÷ processing time per message, plus a margin. Fast handlers → higher; slow, variable handlers → low (1–10) for fairness.
- Prefetch 0 = unlimited. That's dangerous: the broker floods the consumer and it can run out of memory.
- **Interaction with priority:** a consumer that already holds 100 low-priority messages won't see a new high-priority one until it drains them (T3 §3.3.3).
- **Quorum queues:** prefetch also bounds the redelivery burst after a consumer dies.

**Sokrio example:**
- `[CODE]` A Laravel worker is effectively **prefetch = 1**: it pops one job (Lua pop, `RedisQueue.php:275-286`), runs it, then pops the next. That's fair, and it's why one 900 s summary job holds a worker while small tenants wait. Fairness between tenants is a *queue design* problem, not a prefetch one (R18).
- `[CODE]` The Kafka consumer is the opposite: a pull-based "prefetch" of 200 messages or 1 s per flush (`KafkaConsumer.php:206-267`). That's high throughput, but one slow tenant in the batch delays every other tenant in it (Q24).
- If SMS ever moved to RabbitMQ, T3 §3.3.2 sizes prefetch from the **provider's rate limit**, not CPU.

**Follow-up questions the interviewer may ask:**
- Per-consumer vs per-channel prefetch? (`global=false` = per consumer, the RabbitMQ default meaning; `global=true` shares it across the channel's consumers.)
- What does prefetch do for a slow consumer in a group of fast ones? (Lower prefetch stops it from hoarding.)

**Common mistakes to avoid:**
- Leaving prefetch unlimited.
- Expecting priorities to work with a big prefetch.

---

### Q33. Publisher confirms vs transactions. How do you make sure a message actually reached RabbitMQ?

**Short answer (30 seconds):**
Turn on **publisher confirms** on the channel. The broker then acks each published message (asynchronously, by sequence number) once it's routed and, for durable queues, persisted or replicated. A nack means it didn't make it. AMQP transactions (`tx.select`/`commit`) do the same synchronously and are much slower, so nobody uses them for this. Also set `mandatory=true` and handle `basic.return`, because a confirm only says the broker accepted the message, not that any queue matched. Use durable queues + persistent messages, or quorum queues.

**Deep answer:**
- **Confirm modes:**
  - Sync per message: simple, slow.
  - Batch confirm: wait after N messages.
  - Async with a callback map of outstanding sequence numbers: fast, the usual choice.
- On a nack or timeout, **re-publish**. That's at-least-once, so consumers must deduplicate (use a `message_id`).
- **Full durability chain:** durable exchange + durable/quorum queue + `delivery_mode=2` + confirms + `mandatory`. For quorum queues the confirm arrives after a majority of replicas have the message.
- **The DB side:** confirms don't solve dual writes (Q10). You still need an outbox to survive a crash between the commit and the publish.

**Sokrio example:**
- `[LIB]` Kafka's equivalent of confirms is `acks`. Sokrio runs **acks=0** (F5), i.e. "publish without confirms". The publish returns after the socket write (`phpkafka/Producer/Producer.php:159-163`), so a broker-side rejection is invisible behind a 202. R26 angle: "acks=0 is fire-and-forget. It's fine for metrics, wrong for anything you report on. It was a library default nobody chose."
- `[CODE]` Laravel's Redis dispatch is synchronous: `RPUSH` returns or throws, so "reached Redis" is confirmed. But durability depends on Redis persistence (AOF unknown, A9). A Redis restart can lose jobs, including `:delayed` approvals (R12).

**Follow-up questions the interviewer may ask:**
- What does a confirm guarantee for a classic non-durable queue? (Only that it was enqueued in memory.)
- How do you correlate confirms to messages? (Channel sequence numbers / delivery tags in a map.)

**Common mistakes to avoid:**
- Thinking confirms tell you a consumer processed the message.
- Forgetting `mandatory` (unroutable messages are confirmed and then dropped).

---

### Q34. How do you implement delayed retries with exponential backoff in RabbitMQ?

**Short answer (30 seconds):**
Classic approach: a **DLX + TTL retry ladder**. On failure the consumer rejects with `requeue=false` (or publishes to a retry exchange). The message lands in `retry.5s`, a queue with a 5 s TTL and no consumers, whose dead-letter exchange points back at the work queue. Further failures go to `retry.30s`, then `retry.5m`, using the `x-death` count to pick the step, and finally to a parking-lot queue. Alternative: the delayed-message-exchange plugin with an `x-delay` header, which is simpler but has its own limits.

**Deep answer:**
- **Why one queue per delay:** per-message TTL only expires at the **head** of a queue, so a 5-minute message blocks a 5-second one behind it. Per-queue TTL (`x-message-ttl`) avoids that.
- **Counting attempts:** the `x-death` header array (queue, reason, count). On quorum queues, also `x-delivery-count`.
- **Jitter:** fixed-delay queues give none. Add a few jitter variants, or use the plugin with a computed `x-delay`.
- **Plugin caveats:**
  - Delayed messages sit on one node, not replicated.
  - Not built for millions of pending messages.
  - No mandatory or return handling while delayed.
- Retry only **transient** errors. Permanent ones go straight to the parking lot (Q11).

**Sokrio example:**
- `[CODE]` SMS today: **no automatic retry**. A user resends failed rows from the UI (`app/Services/SMS/MessageResendService.php:111-198`). The batch job has `tries=1` on purpose (`app/Jobs/SMS/ResendFailedSmsBatch.php:37-41`), with Sokrio's own cap `max_retry=5` (`config/sms.php:15`).
- **The textbook breaks on side effects:** `SmsDeliveryUnknownException` means the SMS *may* have been sent (`app/Services/SMSSender.php:12-19`). Auto-retrying it can **double-send and double-charge**. Only `ProviderUnavailableException` is safe to retry (T3 §3.3.2).
- **Cheaper Laravel design (T3):** a `SendSmsJob` on an `sms` queue with `$tries = 4` and `backoff() { return [30, 300, 1800]; }`. It calls `release()` only for provider-unavailable, and `failed()` marks the row `failed`, so the existing resend screen *is* the parking lot. Laravel's `backoff` uses the same Redis delayed sorted set as a DLX+TTL ladder.

**Follow-up questions the interviewer may ask:**
- How is this done in Kafka? (Retry topics with consumers that wait, the "Uber pattern", or a delay service. Heavier, T2 §2.9.)
- On SQS? (Change the visibility timeout on failure, or `DelaySeconds` ≤ 15 min. F22.)

**Common mistakes to avoid:**
- One retry queue with mixed per-message TTLs.
- Retrying non-idempotent side effects automatically.

---

### Q35. Classic queues vs Quorum queues vs Streams. When would you use each?

**Short answer (30 seconds):**
**Classic queues** live on one node. They're fast and fine for transient or non-critical work, and since mirroring was removed in RabbitMQ 4.0 they aren't HA. **Quorum queues** are replicated with Raft across 3 or 5 nodes and stay available while a majority is up. They're the default choice for anything you can't lose, with poison-message handling built in. **Streams** are an append-only replicated log with offsets and replay, RabbitMQ's answer to Kafka-style use cases: many readers, replay, large fan-out.

**Deep answer:**

| | Classic | Quorum | Stream |
|---|---|---|---|
| Replication | none (mirroring removed in 4.0) | Raft, majority | Raft-like, replicated log |
| Delete on ack | yes | yes | no: retention by size/time |
| Replay | no | no | yes: consumers pick an offset |
| Poison handling | manual | `x-delivery-limit` | n/a (consumer tracks offset) |
| Priorities | up to 255 levels (1–5 practical) | 2 levels (4.0+) | no |
| Non-durable / exclusive | yes | no | no |
| Best for | temp reply queues, caches, low-value work | business commands, orders, payments | event fan-out, audit, large backlogs |

- **Super streams** add partitioning (like Kafka topics with partitions).
- Quorum queues use more disk and memory per message and have higher latency than classic queues, but they're the safe default.
- `[GENERAL]` Since 3.12, classic queues store messages on disk lazily by default (v2 storage), so "lazy queues" as a separate mode are obsolete (Q37).

**Sokrio example:** how T3 would map Sokrio's work if RabbitMQ were added:
- **Quorum:** delayed approvals and SMS sends. Losing them costs money or orders (Top-5 #4).
- **Classic:** nothing important. Maybe Pusher progress fan-out.
- **Stream:** department change events, but Sokrio already has Kafka for that, so there's no reason to add one.
- The ops cost is the deciding factor: quorum queues need 3 nodes, i.e. a third stateful cluster next to Kafka and Redis on hand-run EC2 VMs (T3 §3.5, T6). Verdict: don't add it.

**Follow-up questions the interviewer may ask:**
- Why 3 or 5 nodes for quorum queues? (Majority quorum; even counts add no fault tolerance.)
- RabbitMQ Streams vs Kafka? (Streams: simpler if you already run RabbitMQ. Kafka: larger ecosystem, Connect, compaction, mature at very high scale.)

**Common mistakes to avoid:**
- Recommending mirrored classic queues (deprecated, then removed).
- Using a quorum queue as a log you want to replay.

---

### Q36. What happens in a RabbitMQ cluster during a network partition? Explain partition handling strategies.

**Short answer (30 seconds):**
When the nodes split into groups that can't see each other, each side may keep running, and classic queues and metadata can diverge (split brain). The `cluster_partition_handling` setting chooses what happens. **`ignore`** keeps both sides running (risks divergence; only for very reliable networks). **`pause_minority`** makes nodes on the minority side pause themselves, which favors consistency and is the usual recommendation with 3+ nodes. **`autoheal`** lets both sides run, then picks a winner when the network heals and restarts the losers, losing their changes. Quorum queues are safe either way: only the majority side can elect a leader and accept writes.

**Deep answer:**
- **Classic-era problem:** a mirrored queue could have a master on each side. After healing, one side's messages were thrown away.
- **Quorum queues and streams** use Raft. The minority side's replicas can't commit, so publishes to them fail or block. No divergence.
- `pause_if_all_down` pauses unless certain listed nodes are reachable (rack/AZ-aware setups).
- **Modern metadata store:** Khepri (Raft) replaces Mnesia in 4.x, which removes most metadata split-brain cases.
- **Clients:** connect through a load balancer, or list all nodes; reconnect and redeclare topology on failure; publish with confirms so a paused node shows up as a nack or timeout, not silent loss.
- **Deployment:** 3 nodes across 3 AZs. Never stretch one cluster across regions; use federation or shovel for that.

**Sokrio example:**
- Not applicable directly (no RabbitMQ). The honest analog is R20 (AZ failure on AWS). Sokrio runs **single-node** Kafka (RF=1, A3) and **single-node** Redis (A5, `[ASSUMPTION]` self-hosted). There can be no split brain because there's no second node, which also means **any** node or AZ loss is a full outage of that component.
- R20 angle: "I describe our current state honestly: single-AZ, single-node. Then the order I'd fix it in: data durability first (RF=3, AOF, sweepers), then availability (Multi-AZ), because losing data is worse than being down."

**Follow-up questions the interviewer may ask:**
- Why is `pause_minority` bad with 2 nodes? (Either side may be the "minority", so a partition can pause both.)
- How does the CAP theorem apply here? (`pause_minority` = CP, `ignore`/`autoheal` = AP.)

**Common mistakes to avoid:**
- Recommending `autoheal` for data you can't lose.
- Running an even number of nodes.

---

### Q37. What are lazy queues / memory alarms / flow control, and why did your producers suddenly block?

**Short answer (30 seconds):**
RabbitMQ protects itself from running out of memory or disk. When memory use passes `vm_memory_high_watermark`, or free disk drops below `disk_free_limit`, it raises an **alarm** and **blocks every publishing connection** cluster-wide until the alarm clears. Consumers keep running. That's why producers "suddenly hang": usually a consumer is down or slow, a queue grew, and memory hit the watermark. **Flow control** is the finer per-connection version: credit-based throttling when a publisher outruns the queue. **Lazy queues** kept messages on disk instead of RAM to delay alarms; since 3.12 classic queues behave that way by default.

**Deep answer:**
- **Diagnosis:**
  - Connections in state `blocked` / `blocking` in the management UI.
  - `rabbitmq-diagnostics alarms`.
  - Memory breakdown (`rabbitmq-diagnostics memory_breakdown`): queue bodies, connections, or the binary heap.
  - Find the queue that's growing.
- **Clients:** get a `connection.blocked` notification, which you can log or alert on. Set publish timeouts so request threads don't hang forever.
- **Fixes:**
  - Restore the consumers first.
  - Cap queues: `x-max-length` + `overflow=reject-publish` or `drop-head`, or a TTL.
  - Use quorum or classic v2 storage.
  - Size memory and disk for the backlog you must survive.
- **It's backpressure (Q5):** RabbitMQ chooses to block the producer rather than crash.

**Sokrio example:**
- `[CODE]` The equivalent in Sokrio is Redis at `maxmemory`. If the policy is `noeviction` (A9, likely given the OOM test `tests/Unit/Kafka/KafkaProducerTest.php:231`), every write fails. That includes `dispatch()`, cache writes, and the Kafka producer's topic-memo check (`TopicProvisioner.php:23`). The producer treats a Redis exception as "Kafka failed" and returns `false` (`KafkaProducer.php` catch `Predis\PredisException | RedisException`, commit `37840a3b5`), so tracking falls back to sync writes instead of hanging.
- Two Redis roles share one instance (queues DB0, cache DB1, `config/database.php:202-219`), plus the Python benchmark on DB0 (F20). A cache spike can therefore block job dispatch, the same "producers suddenly block" story with a different broker (R11).
- R19 angle: "RabbitMQ's flow control blocks producers, and Redis `noeviction` fails them. Both are backpressure. The design question is whether your request path should wait, fail, or fall back. We chose fall back for tracking."

**Follow-up questions the interviewer may ask:**
- Why are *all* publishers blocked, not just the ones feeding the big queue? (The alarm is node/cluster-wide; RabbitMQ can't tell which publisher caused it.)
- How do you avoid a consumer outage turning into a producer outage? (Queue length limits, an alert on queue depth, enough consumers, separate vhosts or clusters for critical flows.)

**Common mistakes to avoid:**
- Restarting RabbitMQ to clear the alarm. The backlog comes back, or is lost.
- Raising the watermark close to 100 % (the OS will kill the node).

---

### ✅ Quality check
- [x] All 18 questions (Q20–Q37) answered with the exact 5 renderer labels from `README_2.md:227-231`
- [x] Kafka examples reuse verified refs (F5, F6, F7, F9, D1, D2, D4, D8, R2, R3, R8, R10, R22, R26). RabbitMQ examples say plainly that Sokrio doesn't use it and give the Laravel equivalent (T3)
- [x] New conflict **D19**: T2 §2.2 said "one binlog per tenant DB". The binlog is per MySQL server; Debezium cost scales with servers, not tenants (Q28)
- [x] Version-dependent facts tagged `[GENERAL]` (linger.ms 4.0, KIP-848, mirroring removed 4.0, quorum priorities 4.0+, classic v2 3.12, Khepri)
- [x] `### Q<n>.` headings kept for the T11 renderer; no literal bold labels in this list
- [x] No secrets: env var names only, no hosts or IPs
