# Distributed Messaging & Streaming: Study + Interview Question Bank

Kafka · RabbitMQ · Redis · Message Queues · Event Streaming · Stream Processing

> **How to use this list:** Work section by section. For every question, try to answer out loud in 2–3 minutes *before* reading the "Key points". If you can't draw it on a whiteboard, you don't know it yet.
>
> Difficulty: 🟢 Core · 🟡 Intermediate · 🔴 Advanced / Senior-level

---

## Table of Contents

1. [Foundations of Messaging](#1-foundations-of-messaging)
2. [Delivery Guarantees & Correctness](#2-delivery-guarantees--correctness)
3. [Apache Kafka — Internals](#3-apache-kafka--internals)
4. [Apache Kafka — Producers, Consumers & Operations](#4-apache-kafka--producers-consumers--operations)
5. [RabbitMQ](#5-rabbitmq)
6. [Redis (Cache, Pub/Sub, Streams, Locks)](#6-redis-cache-pubsub-streams-locks)
7. [Kafka vs RabbitMQ vs Redis — Comparison Questions](#7-kafka-vs-rabbitmq-vs-redis--comparison-questions)
8. [Stream Processing](#8-stream-processing)
9. [Distributed Systems Patterns](#9-distributed-systems-patterns)
10. [Laravel / PHP Context (for a Laravel engineer)](#10-laravel--php-context)
11. [System Design Scenarios](#11-system-design-scenarios)
12. [Debugging & Production Incidents](#12-debugging--production-incidents)
13. [Study Roadmap](#13-study-roadmap)

---

## 1. Foundations of Messaging

**Q1. 🟢 Why use a message queue at all? What problems does it solve, and what new problems does it introduce?**
- Key points: decoupling, async processing, load leveling (absorbing spikes), fan-out, retry/resilience.
- New problems: eventual consistency, duplicates, ordering, debugging difficulty, extra infra to operate.

**Q2. 🟢 Explain point-to-point (queue) vs publish/subscribe (topic). Give a real use case for each.**
- Queue: one message → one consumer (work distribution, e.g. sending emails).
- Pub/sub: one message → many subscribers (e.g. `OrderPlaced` → inventory, billing, notification).

**Q3. 🟡 What is the difference between a message *broker* and an event *log*? Why does that difference matter?**
- Broker (RabbitMQ): message is deleted after ack; broker tracks delivery state.
- Log (Kafka): append-only, retained by time/size; consumers track their own position (offset); messages can be replayed.

**Q4. 🟡 Push vs pull consumption models. What are the trade-offs?**
- Push (RabbitMQ): low latency, but broker must handle flow control (prefetch).
- Pull (Kafka): consumer controls rate, natural batching, easy replay; can add latency with long polling.

**Q5. 🟡 What is backpressure, and how does each system (Kafka, RabbitMQ, Redis Streams) handle a slow consumer?**
- Kafka: consumer lag grows, data retained on disk; no harm to producer until retention expires.
- RabbitMQ: queues grow in memory → memory/disk alarms → producers get blocked (flow control).
- Redis: memory pressure; with Pub/Sub, slow subscribers get disconnected (output buffer limits).

---

## 2. Delivery Guarantees & Correctness

**Q6. 🟢 Explain at-most-once, at-least-once, and exactly-once delivery. Which one is "default" in practice and why?**
- At-least-once is the practical default; design consumers to be idempotent.

**Q7. 🔴 "Exactly-once delivery is impossible." Is this true? How does Kafka claim exactly-once semantics (EOS)?**
- Exactly-once *delivery* over a network is impossible (Two Generals); exactly-once *processing* is achievable.
- Kafka: idempotent producer (PID + sequence numbers) + transactions (atomic writes across partitions + offset commit inside the transaction) + `isolation.level=read_committed`.
- Only holds end-to-end within Kafka (read-process-write). Side effects to external systems still need idempotency.

**Q8. 🟡 What is an idempotent consumer? Show 3 ways to implement one.**
- Dedup table with unique `message_id` (insert-if-not-exists in the same DB transaction as the business change).
- Natural idempotency (`SET status = 'paid'` instead of `balance = balance + 100`).
- Version / conditional updates (`UPDATE ... WHERE version = ?`).

**Q9. 🔴 How do you guarantee message ordering? Where does ordering break?**
- Kafka: ordered only within a partition → use a key (e.g. `order_id`).
- Breaks with: multiple partitions, retries with `max.in.flight > 1` without idempotence, parallel consumers, DLQ retries, rebalances.
- RabbitMQ: ordered per queue with a single consumer; breaks with multiple consumers, requeue, or prefetch > 1.

**Q10. 🔴 Explain the dual-write problem. Why is "save to DB then publish to Kafka" dangerous, and how does the Transactional Outbox pattern fix it?**
- App crashes between DB commit and publish → event lost (or published but DB rolled back).
- Outbox: write the event to an `outbox` table in the same DB transaction; a relay (poller or CDC like Debezium) publishes it.
- Follow-up: outbox relay itself is at-least-once → consumers must still be idempotent.

**Q11. 🟡 What is a poison message? How do you handle it without blocking the whole queue/partition?**
- Retry with limit → dead-letter queue (DLQ) → alert + manual/auto replay.
- Kafka specific: a bad message blocks the partition; use retry topics (`orders.retry.5s`, `orders.retry.1m`, `orders.dlq`).

---

## 3. Apache Kafka — Internals

**Q12. 🟢 Explain the Kafka architecture: broker, topic, partition, segment, offset, replica, leader, follower.**

**Q13. 🔴 Why is Kafka so fast? Explain at least 4 reasons.**
- Sequential disk I/O (append-only log), OS page cache, zero-copy (`sendfile`), batching + compression, partitions for parallelism, simple broker (consumer tracks offsets).

**Q14. 🔴 Explain ISR (In-Sync Replicas). How do `acks`, `replication.factor`, and `min.insync.replicas` work together to prevent data loss?**
- Classic safe config: `replication.factor=3`, `min.insync.replicas=2`, `acks=all`.
- Explain what happens when only 1 replica is in sync (producer gets `NotEnoughReplicas`).

**Q15. 🔴 What is unclean leader election? What's the trade-off between availability and durability?**
- `unclean.leader.election.enable=true` → an out-of-sync replica can become leader → data loss but stays available.

**Q16. 🟡 What is the High Watermark (HW) and Log End Offset (LEO)? Why can't consumers read beyond the HW?**

**Q17. 🟡 ZooKeeper vs KRaft. What changed and why did Kafka remove ZooKeeper?**
- KRaft: metadata stored in an internal Raft-based quorum; simpler ops, faster controller failover, supports more partitions.

**Q18. 🟡 Explain log retention vs log compaction. Give a use case for a compacted topic.**
- Compaction keeps the latest value per key → good for changelog / current state (user profile, config, KTable backing).
- Tombstones (`null` value) delete keys.

**Q19. 🔴 How many partitions should a topic have? What are the costs of too many partitions?**
- Partitions = max consumer parallelism in a group.
- Too many: more open file handles, slower leader election/failover, more memory on clients, longer rebalances.
- You can increase partitions but not decrease — and increasing breaks key→partition mapping (ordering!).

---

## 4. Apache Kafka — Producers, Consumers & Operations

**Q20. 🟡 Walk through the full path of a message from `producer.send()` to being stored on disk.**
- Serializer → partitioner → record accumulator (batch) → sender thread → leader broker → page cache/log → followers replicate → ack.
- Know `linger.ms`, `batch.size`, `compression.type`, `buffer.memory`.

**Q21. 🟡 How does the default partitioner choose a partition? What happens with a `null` key? What is a "hot partition"?**
- Key → murmur2 hash mod partitions. Null key → sticky partitioner (batch-level).
- Hot partition: one key with heavy traffic (e.g. one big client/tenant) → skew. Fix: key salting, better key choice.

**Q22. 🔴 Explain consumer groups and rebalancing. What triggers a rebalance, and why is it bad?**
- Triggers: consumer join/leave, crash, `max.poll.interval.ms` exceeded, partition count change.
- Eager rebalancing = stop-the-world. Cooperative/incremental rebalancing (`CooperativeStickyAssignor`) and static membership (`group.instance.id`) reduce impact.

**Q23. 🔴 Auto-commit vs manual commit. Describe a scenario where auto-commit causes data loss and one where it causes duplicates.**
- Loss: offset committed before processing finishes, then crash.
- Duplicates: processed, crash before commit → reprocessed.
- Best practice: manual commit *after* processing (at-least-once) + idempotent processing.

**Q24. 🟡 What is consumer lag? How do you monitor it, and what are 5 possible causes of increasing lag?**
- Causes: slow processing, too few consumers/partitions, rebalance storms, GC pauses, slow downstream DB, hot partition.
- Tools: Burrow, `kafka-consumer-groups.sh --describe`, Prometheus exporters.

**Q25. 🟡 What happens if a consumer takes longer than `max.poll.interval.ms` to process a batch?**
- Kicked out of the group → rebalance → partitions reassigned → same records reprocessed → possible infinite loop.

**Q26. 🔴 How do you reprocess (replay) data in Kafka from 3 days ago without affecting the current production consumers?**
- New consumer group + `offsetsForTimes` / `--reset-offsets --to-datetime`; ensure retention covers 3 days; make side effects idempotent.

**Q27. 🟡 What is Schema Registry? Explain backward vs forward vs full compatibility with an example.**
- Avro/Protobuf/JSON Schema. Backward: new consumer reads old data (add field with default). Forward: old consumer reads new data.

**Q28. 🟡 What is Kafka Connect? What is CDC and how does Debezium work?**
- Debezium reads the DB transaction log (MySQL binlog / Postgres WAL) → change events into Kafka.

---

## 5. RabbitMQ

**Q29. 🟢 Explain the AMQP model: producer → exchange → binding → queue → consumer. Why doesn't the producer publish directly to a queue?**

**Q30. 🟡 Explain the 4 exchange types (direct, fanout, topic, headers) with a real example for each.**
- Topic routing keys: `order.*.created`, `order.#`.

**Q31. 🟡 Explain `ack`, `nack`, `reject`, and `requeue`. What happens if a consumer crashes before acking?**
- Unacked messages are redelivered (`redelivered=true`). `nack` with `requeue=true` on a poison message → infinite loop.

**Q32. 🔴 What is prefetch (`basic.qos`)? How does it affect throughput, fairness, and memory?**
- Prefetch 1 = fair dispatch but slow. Too high = one consumer hoards messages, uneven load, memory pressure.

**Q33. 🟡 Publisher confirms vs transactions. How do you make sure a message actually reached RabbitMQ?**
- Confirms (async) are much faster than AMQP transactions. Also: `mandatory` flag + return handler for unroutable messages.

**Q34. 🟡 How do you implement delayed retries with exponential backoff in RabbitMQ?**
- DLX + TTL retry queues (`retry.5s`, `retry.30s`, `retry.5m`), or the delayed-message-exchange plugin.

**Q35. 🔴 Classic queues vs Quorum queues vs Streams. When would you use each?**
- Quorum queues: Raft-replicated, durable, recommended for HA (mirrored classic queues are deprecated/removed).
- RabbitMQ Streams: append-only log with replay — RabbitMQ's answer to Kafka-like use cases.

**Q36. 🔴 What happens in a RabbitMQ cluster during a network partition? Explain partition handling strategies.**
- `pause_minority`, `autoheal`, `ignore`. Quorum queues need a majority to stay available.

**Q37. 🟡 What are lazy queues / memory alarms / flow control, and why did your producers suddenly block?**

---

## 6. Redis (Cache, Pub/Sub, Streams, Locks)

**Q38. 🟢 Why is Redis fast even though it is (mostly) single-threaded?**
- In-memory, I/O multiplexing (epoll), no lock contention, efficient data structures. Redis 6+ uses I/O threads for network, command execution still single-threaded.

**Q39. 🟡 RDB vs AOF persistence. What can you lose in each? What does `appendfsync everysec` mean?**

**Q40. 🟡 Redis Pub/Sub vs Redis Streams vs Redis List (`LPUSH`/`BRPOP`) as a queue. Compare them.**
- Pub/Sub: fire-and-forget, no persistence — offline subscriber loses messages.
- List: simple queue, no consumer groups, message lost if worker crashes after `BRPOP` (use `LMOVE`/`BLMOVE` reliable queue pattern).
- Streams: persistent, consumer groups, acks, Pending Entries List (PEL), `XCLAIM`/`XAUTOCLAIM`.

**Q41. 🔴 Explain Redis Streams consumer groups: `XADD`, `XREADGROUP`, `XACK`, `XPENDING`, `XAUTOCLAIM`. How do you recover messages from a dead consumer?**

**Q42. 🔴 Cache problems: explain cache penetration, cache breakdown (hot key expiry / stampede), and cache avalanche. Give a fix for each.**
- Penetration: Bloom filter, cache nulls.
- Stampede: mutex/single-flight, early refresh, logical expiry.
- Avalanche: random TTL jitter, multi-level cache, HA.

**Q43. 🟡 Cache-aside vs write-through vs write-behind. How do you keep cache and DB consistent?**
- Common answer: update DB, then delete cache (not update). Discuss race conditions and delayed double delete.

**Q44. 🔴 How do you implement a distributed lock in Redis? What is wrong with a naive `SETNX` + `EXPIRE`? What is Redlock and why is it controversial?**
- Use `SET key value NX PX 30000` atomically, unique value, release via Lua (compare-and-delete).
- Problems: GC pause / clock drift → lock expires while still "held". Fencing tokens. Martin Kleppmann vs antirez debate.

**Q45. 🟡 Redis eviction policies. What's the difference between `allkeys-lru`, `volatile-lru`, `allkeys-lfu`, `noeviction`?**

**Q46. 🔴 Redis Sentinel vs Redis Cluster. How does Cluster shard data (hash slots), and what are the limits of multi-key operations?**
- 16384 hash slots, hash tags `{user:1}` to keep related keys together. Async replication → possible write loss on failover.

**Q47. 🟡 How would you build a rate limiter with Redis? Compare fixed window, sliding window log, sliding window counter, and token bucket.**

---

## 7. Kafka vs RabbitMQ vs Redis — Comparison Questions

**Q48. 🟡 Kafka vs RabbitMQ: when would you choose each? Give a decision framework, not just a feature list.**

| Aspect | Kafka | RabbitMQ | Redis Streams |
|---|---|---|---|
| Model | Distributed log | Smart broker, routing | In-memory log |
| Retention / replay | Yes, by time/size | No (except Streams) | Yes, limited by memory |
| Ordering | Per partition | Per queue (single consumer) | Per stream |
| Routing | Topic + key only | Rich (exchanges) | Minimal |
| Throughput | Very high | High | Very high, memory-bound |
| Best for | Event streaming, analytics, CDC, event sourcing | Task queues, complex routing, RPC, per-message ack | Lightweight queues, when Redis already exists |

**Q49. 🔴 Your team wants to use Kafka as a job queue (e.g. "send this email"). What problems will you hit?**
- No per-message ack/delay/priority, head-of-line blocking per partition, parallelism capped by partitions, retries are hard.
- (Kafka "Share Groups"/queues-for-Kafka work is changing this — check current status.)

**Q50. 🟡 Can Redis replace Kafka? At what point does it stop being a good idea?**
- Memory cost, durability guarantees, retention size, ecosystem (Connect, Streams, Schema Registry).

---

## 8. Stream Processing

**Q51. 🟢 Batch vs stream processing. What is the Lambda vs Kappa architecture?**

**Q52. 🔴 Event time vs processing time vs ingestion time. Why does it matter? What is a watermark?**
- Late/out-of-order events; watermark = "I believe no events older than T will arrive"; allowed lateness.

**Q53. 🟡 Explain window types: tumbling, hopping (sliding), session windows. Give a business example for each.**
- Tumbling: orders per minute. Hopping: 5-min avg updated every 1 min. Session: user activity sessions.

**Q54. 🔴 Stateful stream processing: how does Kafka Streams store state (RocksDB + changelog topic)? How is state recovered after a crash?**

**Q55. 🟡 KStream vs KTable vs GlobalKTable. What is stream-table duality?**

**Q56. 🔴 Stream-stream join vs stream-table join. Why do joins require co-partitioning?**

**Q57. 🔴 Kafka Streams vs Apache Flink vs Spark Structured Streaming. How do they achieve fault tolerance (checkpointing/exactly-once)?**
- Flink: distributed snapshots (Chandy-Lamport), barriers.

---

## 9. Distributed Systems Patterns

**Q58. 🔴 Explain the Saga pattern. Choreography vs orchestration. How do compensating transactions work?**
- Example: Order → Payment → Inventory → Shipping; payment fails → cancel order.

**Q59. 🔴 Event sourcing + CQRS. What are the benefits, and what are the real-world pain points?**
- Pain: schema evolution of events, snapshots, eventual consistency in read models, rebuild time.

**Q60. 🟡 Event notification vs event-carried state transfer. Which one should `OrderUpdated` be?**

**Q61. 🔴 Explain CAP and PACELC. Where do Kafka, RabbitMQ (quorum queues), and Redis Cluster sit?**

**Q62. 🟡 What is the Competing Consumers pattern? What is the Claim Check pattern (for large payloads)?**
- Claim check: store large file in S3/object storage, send only reference in the message (Kafka default max message ~1 MB).

**Q63. 🔴 How do you handle multi-tenancy in a message system? One topic per tenant vs shared topic with tenant key — trade-offs.**
- Noisy neighbor, partition skew from big tenants, ACLs, quotas, per-tenant replay.

---

## 10. Laravel / PHP Context

**Q64. 🟡 How do Laravel queues work under the hood with the Redis driver? What happens on `php artisan queue:work`?**
- Jobs are serialized into Redis lists; delayed jobs in sorted sets; reserved jobs tracked with timeout → re-queued if worker dies (`retry_after`).

**Q65. 🔴 What is the relationship between `retry_after` and a job's `timeout`? What happens if `timeout >= retry_after`?**
- Job gets picked up by a second worker while still running → duplicate processing.

**Q66. 🟡 Laravel Horizon: what does it give you? How do you size workers, balance queues, and prioritize (`high,default,low`)?**

**Q67. 🔴 Why is PHP traditionally awkward for Kafka consumers? How would you run a long-lived Kafka consumer in a Laravel app?**
- Request-per-process model; need `rdkafka` extension, long-running process (Supervisor), memory leaks, graceful shutdown on SIGTERM, Octane/Swoole options.

**Q68. 🟡 How do you dispatch a job only after the DB transaction commits (`afterCommit`)? Why does it matter?**
- Otherwise worker may process the job before the row exists → "model not found".

---

## 11. System Design Scenarios

Answer each with: requirements → API/events → topics/queues → partitioning key → failure handling → scaling → monitoring.

**Q69. 🔴 Design an order processing pipeline for a multi-tenant distribution/order-management SaaS (100+ enterprise clients, field sales reps placing orders from mobile, sometimes offline).**
- Think: offline sync + idempotency keys, tenant-aware partitioning, outbox, inventory reservation saga, reporting via stream processing.

**Q70. 🔴 Design a notification system (SMS, email, push) handling 10M notifications/day with retries, rate limits per provider, and user preferences.**

**Q71. 🔴 Design a real-time dashboard showing sales per region per minute with late-arriving data.**

**Q72. 🔴 Design an activity/audit log for all entity changes across services, searchable and replayable (CDC + Kafka + Elasticsearch/ClickHouse).**

**Q73. 🔴 Design a flight/hotel booking system where seat inventory must never be double-booked, using queues for async confirmation from external suppliers.**

**Q74. 🔴 Design a delayed job / scheduler system (e.g. "send reminder in 3 days") at scale. Why is this hard with Kafka?**

**Q75. 🔴 You need to migrate from Laravel Redis queues to Kafka/RabbitMQ with zero downtime. What's your plan?**

---

## 12. Debugging & Production Incidents

**Q76. 🔴 Consumer lag on one partition is 2M messages while others are near 0. Walk through your investigation.**
- Hot key, stuck consumer, poison message, slow downstream call for specific tenant.

**Q77. 🔴 Customers report receiving the same email 3 times. Where are the possible sources of duplication, and how do you fix it end to end?**

**Q78. 🔴 Your consumer group is in an endless rebalance loop. What are the likely causes?**
- Processing > `max.poll.interval.ms`, heartbeat issues, pods restarting (OOM/K8s liveness), too large `max.poll.records`.

**Q79. 🟡 Redis memory suddenly hits 100% and writes fail. What do you check?**
- Big keys (`--bigkeys`, `MEMORY USAGE`), missing TTLs, unbounded streams (no `MAXLEN`), client output buffers, fragmentation.

**Q80. 🟡 RabbitMQ queue keeps growing and producers are being blocked. What do you check and how do you recover?**

**Q81. 🔴 A broker in your 3-node Kafka cluster died. What happens to producers with `acks=1` vs `acks=all`? What happens when it comes back?**

---

## 13. Study Roadmap

| Week | Focus | Hands-on task |
|---|---|---|
| 1 | Foundations + delivery guarantees (Sec 1–2) | Write an idempotent consumer with a dedup table |
| 2 | Kafka internals + producer/consumer (Sec 3–4) | Run a 3-broker Kafka (KRaft) in Docker; kill a broker; observe ISR & lag |
| 3 | RabbitMQ (Sec 5) | Build retry queues with DLX + TTL; test prefetch values |
| 4 | Redis (Sec 6) | Redis Streams consumer group + `XAUTOCLAIM` recovery; distributed lock with Lua release |
| 5 | Stream processing (Sec 8) | Kafka Streams or Flink: windowed count with late events |
| 6 | Patterns + Laravel (Sec 9–10) | Implement transactional outbox in Laravel + Debezium or a poller |
| 7 | System design + incidents (Sec 11–12) | Do 2 design questions per day on a whiteboard, timed (45 min) |

### Recommended resources
- *Designing Data-Intensive Applications* — Martin Kleppmann (Chapters 5, 7, 8, 9, 11 are essential)
- *Kafka: The Definitive Guide* (2nd ed.)
- Confluent Developer courses (free) — Kafka internals, Kafka Streams
- RabbitMQ official docs: reliability guide, quorum queues
- Redis docs: Streams intro, distributed locks page
- Martin Kleppmann's blog post "How to do distributed locking"

### Most frequently asked in interviews (prioritize these)
Q6, Q7, Q9, Q10, Q13, Q14, Q22, Q23, Q40, Q42, Q44, Q48, Q49, Q58, Q77

---

*Tip: for each question, write your answer in your own words in a separate file (e.g. `answers/q07-exactly-once.md`). Explaining it in writing is the fastest way to find gaps.*
