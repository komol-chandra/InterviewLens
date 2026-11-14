# 08d · Interview Q&A — Patterns, Laravel, System Design, Incidents (Q58–Q81)

> **Snapshot:** `sokrio-server` @ `master` · HEAD `d14c0ebb2` · written 2026-10-26.
> Paths are relative to `sokrio-server/`. Framework paths are shortened to `vendor/…/X` = `vendor/laravel/framework/src/Illuminate/X` (Laravel 9.52.22).
> Tags: `[CODE]` verified in app code · `[LIB]` verified in vendored code · `[GENERAL]` industry knowledge · `[INFERENCE]` reasoned, needs a lab · `[ASSUMPTION]` best guess plus how to verify · `[HIST]` deleted file, read from git history.
> Questions come from `../interview-questions.md` §9–§12 (wording unchanged). Sokrio examples reuse facts from sections 00–07 and 08a–08c. Finding ids (F1–F24), conflicts (D1–D20), assumptions (A1–A11) and runbooks (R1–R35) point back to those sections.

**How to use this file:** Q58–Q63 are patterns. Sokrio is a monolith with one database per tenant, so it has no real saga or event store; say that, then point at the small versions it does have (delayed approvals, Mongo summaries as a read model, the department projection). Q64–Q68 are where Sokrio is strongest: every Laravel queue answer has a line number and a bug behind it. Q69–Q75 are system designs. Answer each in the same seven steps: **requirements → API/events → topics/queues → partition key → failure handling → scaling → monitoring**. Q69 is Sokrio itself. Q76–Q81 are incidents; each maps to a runbook in 07a/07b, so open with the first three commands you'd run.

---

## 8.9 Distributed systems patterns (Q58–Q63)

### Q58. Explain the Saga pattern. Choreography vs orchestration. How do compensating transactions work?

**Short answer (30 seconds):**
A saga replaces one distributed transaction with a chain of **local** transactions, one per service. Each step commits on its own and publishes an event or reply. If a later step fails, the saga runs **compensating** transactions for the steps that already committed: "cancel order", "refund payment", "release stock". Compensations are business undo, not rollback, so the system is briefly inconsistent and every step must be idempotent. In **choreography** each service reacts to the others' events with no central brain. In **orchestration** one coordinator tells each service what to do and tracks the state.

**Deep answer:**
- **The example:** Order → Payment → Inventory → Shipping.
  1. Order service creates the order as `PENDING` and emits `OrderCreated`.
  2. Payment charges the card and emits `PaymentCompleted`, or `PaymentFailed`.
  3. On `PaymentFailed`, the order service runs its compensation: mark the order `CANCELLED`.
  4. If Inventory fails after payment, the compensations are "refund payment" and then "cancel order", in reverse order.
- **Choreography:**
  - Good for 2–4 steps. No single point of failure, services stay decoupled.
  - Bad when it grows: the flow lives in nobody's code, cycles appear, and "where is order 123 stuck?" needs tracing across services.
- **Orchestration:**
  - One orchestrator (a state machine, often persisted: Temporal, AWS Step Functions, Camunda, or a DB table) sends commands and waits for replies.
  - Clear state per saga, easy timeouts, one place to see stuck sagas. The cost: a central service that must itself be durable and idempotent.
- **Rules for compensations:**
  - **Semantic, not physical:** you can't un-send an email. You send a "sorry, cancelled" email.
  - **Idempotent and retryable:** a compensation may run twice. "Refund payment P1" must be a no-op the second time.
  - **Pivot step:** after a certain step (for example "shipped"), you only retry forward, never compensate.
  - **Isolation is gone:** other readers can see the intermediate state. Countermeasures are semantic locks (a `PENDING` status), commutative updates and re-reading values before acting.
- **The messaging glue:** each step's "commit locally + publish event" is itself a dual write, so a saga needs an **outbox** in each service (Q10, T2 §2.2). Otherwise the saga can stall silently.

**Sokrio example:**
- `[CODE]` Sokrio has **no cross-service saga**. Orders, stock, payments and approvals all live in one tenant MySQL database and change inside local `DB::transaction` blocks, which is the simpler and better choice for a monolith.
- `[CODE]` The nearest thing is the **delayed approval**, a one-step timed saga. `Order::approveAfter` dispatches `ApproveOrder` with a delay (`app/Models/Order/Order.php:240-243`). The job re-reads the order with `pending()->find()` and does nothing if it was already approved, cancelled, or rolled back (`app/Jobs/ApproveOrder.php:53`). That `pending()` check is a semantic lock: the status is the saga state, and the guard makes the step idempotent.
- `[CODE]` The department sync is a **two-store write with no compensation**: MySQL commits, Kafka carries the change to Mongo, and if a step fails nobody undoes or repairs it automatically. The only repair is the manual full resync `tenant:department_sync_with_mongodb` (F1, R25). In saga terms, the missing piece is a reconciler that plays the compensation role.
- `[INFERENCE]` If Sokrio ever split stock into its own service, "order approved → reserve stock → (fail) → revert approval" would be the first real saga. Orchestration would fit better, because approval rules already live in one place (`ApproveOrder`).

**Follow-up questions the interviewer may ask:**
- Why not two-phase commit? (The coordinator blocks everyone if it dies, locks are held across the network, and most brokers and SaaS APIs don't support XA.)
- What if a compensation fails? (Retry it with backoff. It must be idempotent. After N failures, alert a human; this is the saga's DLQ.)
- How do you see a stuck saga? (Orchestration: query the saga table for old non-final states. Choreography: a correlation id in every event plus tracing.)

**Common mistakes to avoid:**
- Calling compensation a "rollback". Other services may already have acted on the intermediate state.
- Forgetting the outbox. A saga built on "commit, then publish" loses steps on a crash.
- Designing a saga for steps that share one database. A local transaction is simpler and correct.

---

### Q59. Event sourcing + CQRS. What are the benefits, and what are the real-world pain points?

**Short answer (30 seconds):**
**Event sourcing** stores the sequence of events ("OrderPlaced", "ItemAdded", "OrderApproved") as the source of truth; current state is a fold over them. **CQRS** splits the write model from one or more read models that are built from those events and shaped for queries. Benefits: a full audit trail, time travel and replay, read models tuned per screen, and the write side stays small. Pain points: event schema evolution, snapshots when streams get long, eventual consistency in read models, long rebuilds, and GDPR deletes in an append-only log. CQRS without event sourcing is common and much cheaper.

**Deep answer:**
- **Benefits:**
  - Audit for free: you know *why* state changed, not only what it is.
  - Replay: fix a bug in a projection, rebuild it from event 0.
  - Several read models from one stream (search index, report table, cache).
  - Natural fit with Kafka-style logs and stream processing.
- **Pain points (the ones interviewers want):**
  - **Schema evolution:** events are forever. You need versioned events and *upcasters* that turn v1 into v2 on read. Never edit old events in place.
  - **Snapshots:** an aggregate with 50 000 events is slow to load. Store a snapshot every N events and fold only the tail.
  - **Eventual consistency:** the user saves and the list page doesn't show it yet. Fixes: read-your-writes on the write model, or return the new version and let the UI wait for that version.
  - **Rebuild time:** replaying years of events can take hours. Plan blue/green projections: build the new one beside the old one, then switch.
  - **Deletes and PII:** "right to be forgotten" in an immutable log. Use crypto-shredding (encrypt per user, delete the key) or keep PII out of events.
  - **Thinking cost:** concurrency checks on the expected version, idempotent projections, and a team that understands it.
- **When it's worth it:** domains where history *is* the product (ledgers, bookings, compliance). For most CRUD, use plain tables plus an audit log (Q72) plus CQRS read models.

**Sokrio example:**
- `[CODE]` Sokrio has **CQRS without event sourcing**. MySQL (per tenant) is the write model. Mongo `order_summaries` / `delivery_summaries` are read models rebuilt by hourly jobs, for example `SecondaryOrderSummaryJob` on the `summary` queue (`app/Console/Commands/SecondaryOrderSummary.php:33-36`, scheduler `app/Console/Kernel.php:149`).
- `[CODE]` The projections are **idempotent**, which is the property event-sourcing people care most about: `SummariesQuery` writes `updateOne` with `$set`/`$setOnInsert` and `upsert` (`app/Models/MongoDB/SummariesQuery.php:229-238`), so re-running an hour is safe. The daily resync (`Kernel.php:155`) is the "rebuild the projection" step.
- `[CODE]` The Mongo `departments` collection is a projection fed by Kafka events (`DepartmentMessageHandler.php:87-100`). It shows two classic pains at small scale:
  - **No schema version** in the envelope (`KafkaProducer.php:93-102`), and handlers branch on topic, not `event_type` (T7).
  - **Field renames linger:** the consumer `$set`s the whole payload (`:94-96`), so a renamed field leaves the old one in Mongo forever. That is the "schema evolution" pain without an upcaster.
- `[INFERENCE]` Full event sourcing for orders isn't worth it here: the business wants current state and reports, and the audit need is better met with CDC (Q72).

**Follow-up questions the interviewer may ask:**
- How do you handle a concurrent write in an event-sourced aggregate? (Append with an expected version; if the stream moved on, reload and retry or reject.)
- Is Kafka a good event store? (For the log, yes; for loading one aggregate by id, no. There's no per-key read, so you'd need a DB-backed store or compacted topics plus state stores.)
- How do you rename a field in an event? (Add a new version, write an upcaster, keep reading both. Never rewrite history.)

**Common mistakes to avoid:**
- Treating CQRS and event sourcing as one thing. Either can exist without the other.
- Promising "instant" read models. They are eventually consistent; say how stale and how you handle it in the UI.
- Using event sourcing for a CRUD admin screen.

---

### Q60. Event notification vs event-carried state transfer. Which one should `OrderUpdated` be?

**Short answer (30 seconds):**
**Event notification** is a thin event ("order 123 changed") and consumers call back to the owner for details. It's small and always fresh, but it couples consumers to the owner's API at runtime and creates call-back storms. **Event-carried state transfer (ECST)** puts the full new state (or the fields consumers need) in the event, so consumers keep their own copy and never call back. It costs bigger messages and a schema contract. For `OrderUpdated` I'd use **ECST with a full snapshot, a version number, and the order id as key**, because consumers (reporting, search, notifications) need the data, and a snapshot is idempotent and order-safe in a way a "diff" isn't.

**Deep answer:**
- **Notification works when:** the payload is huge or sensitive, consumers need it rarely, or "something happened" is all they need (invalidate a cache).
- **ECST works when:** many consumers need the data, the owner shouldn't take read load, or consumers must work when the owner is down.
- **Snapshot vs delta:**
  - A **delta** (`{status: approved}`) needs every previous delta, applied in order, exactly once.
  - A **snapshot** (the whole order + `version`) is idempotent: apply it if `version > stored_version`, ignore it otherwise. Duplicates and replays become harmless, and a compacted topic keeps the latest per key.
- **Design for `OrderUpdated`:**
  - Key = `order_id` (per-order ordering), envelope with `event_id`, `event_type`, `schema_version`, `occurred_at`, `tenant_id`.
  - Payload = order header + lines + status + `version` (a row version or `updated_at` with a tie-break).
  - Large or private parts (an attachment, a customer's full address) go by reference (claim check, Q62).
- **The middle ground:** "fat enough" events that carry what known consumers need, plus a link for the rest.

**Sokrio example:**
- `[CODE]` Departments already use **ECST**. `DepartmentChangeObserver` publishes the department's data on `created`/`updated` (`app/Observers/DepartmentChangeObserver.php:26,35`), keyed by `department_id` (D4), and the consumer upserts it into Mongo without calling back (`DepartmentMessageHandler.php:87-100`). That's why the Mongo copy can be rebuilt from the topic.
- `[CODE]` What's missing for it to be *safe* ECST: no version in the payload, so an older event replayed after a newer one wins (R7), and no tombstone on delete (08a framing: departments are the ideal compacted topic once deletes publish tombstones).
- `[CODE]` Order and delivery events are written but **commented out** (`OrderObserver.php:23`, `DeliveryObserver.php:23`). If they're turned back on, the answer above is the design: snapshot + `version`, keyed by order id, published through an outbox (F8 shows what happens without one).

**Follow-up questions the interviewer may ask:**
- How does a consumer handle out-of-order snapshots? (Keep `version` per key; drop anything not newer.)
- What about very large orders? (Cap the event size, move line items to object storage, keep totals in the event.)
- Doesn't ECST duplicate data everywhere? (Yes, on purpose. Each copy is a cache owned by its consumer, rebuilt from the topic.)

**Common mistakes to avoid:**
- Publishing deltas with no version and assuming order is kept across retries and partitions.
- Thin events that make every consumer hit the order API, which becomes the bottleneck you tried to avoid.
- Putting the whole customer record (PII) in every order event.

---

### Q61. Explain CAP and PACELC. Where do Kafka, RabbitMQ (quorum queues), and Redis Cluster sit?

**Short answer (30 seconds):**
CAP: when a **network partition** happens, a replicated system must pick **consistency** (refuse some requests) or **availability** (answer, maybe with stale or diverging data). PACELC adds the normal case: **E**lse, with no partition, you trade **latency** against **consistency**. Kafka is configurable: with `acks=all`, `min.insync.replicas=2` and unclean leader election off, it's PC/EC (refuses writes rather than lose them). RabbitMQ quorum queues use Raft, so they are CP: a minority side can't accept writes. Redis Cluster replicates asynchronously and fails over, so it's PA/EL: fast and available, and it can lose acknowledged writes.

**Deep answer:**
- **CAP, stated properly:** P isn't optional in a distributed system. The real choice is what you do *during* a partition. "CA" only describes a single node.
- **PACELC:** most of the time there's no partition, and the daily trade-off is latency vs consistency (wait for replicas or not).
- **Kafka:**

  | Setting | Behaviour |
  |---|---|
  | `acks=all`, `min.insync.replicas=2`, RF=3, `unclean.leader.election.enable=false` | Write fails with `NotEnoughReplicas` when the ISR shrinks below 2. **PC/EC** |
  | `acks=1` | Leader acks before followers copy. Leader dies → acknowledged writes lost. Leans **PA/EL** |
  | `unclean.leader.election.enable=true` | An out-of-sync replica can become leader. Availability over consistency |

  `[GENERAL]` KRaft (the metadata quorum) is Raft-based and CP; the data plane is ISR-based and tunable as above.
- **RabbitMQ quorum queues:** Raft log replicated to a majority before confirm. During a partition the minority side can't elect a leader, so publishers there get no confirms. **PC/EC**. Classic mirrored queues (deprecated, removed in 4.0) were weaker.
- **Redis Cluster:** async replication; the primary replies before replicas copy. If the primary dies, a replica with missing writes gets promoted → acknowledged writes lost. A primary on the minority side keeps accepting writes until `cluster-node-timeout`, then those writes are lost. **PA/EL**. `WAIT n ms` narrows the window but doesn't make it CP.
- **Where each matters:** a payment queue wants CP; a cache wants AP; a tracking stream can live with "AP plus a fallback".

**Sokrio example:**
- `[ASSUMPTION]` Sokrio runs **one** Kafka broker with auto-created RF=1 topics (`config/kafka.php:74-75`, A3/A4) and **one** Redis (A5). With no replicas, there's no CAP trade-off to make: a partition between the app and the node simply means "unavailable". It's consistent only because there is one copy, and that copy is also a single point of failure (R21).
- `[CODE]` The producer is `acks=0` (F5): it doesn't even wait for the leader. On the PACELC scale that's the far "L" end: lowest latency, no durability promise at all. Adding replicas without changing acks wouldn't help (T6 §6.12).
- `[CODE]` The app already picks per path: tracking prefers availability (publish, else write to MySQL directly, else 503, `Tracking/TrackingController.php:62-83`), while departments have no fallback (R25). That is a CAP-style decision made in application code.
- `[INFERENCE]` The target in T6 §6.10 is MSK RF=3, `min.insync.replicas=2`, `acks=-1`: PC/EC for tracking and departments. Redis split into a queue group (`noeviction`, Multi-AZ) and a cache group (`allkeys-lru`): the cache may be AP, the queue should lose as little as possible.

**Follow-up questions the interviewer may ask:**
- Is Kafka CP or AP? (It depends on `acks`, `min.insync.replicas` and unclean election. Give the settings, not a label.)
- Can Redis be used as a primary database then? (With AOF `always` and `WAIT`, the loss window is small but not zero; for money, no.)
- What does a partition look like in practice on AWS? (An AZ losing connectivity, a security group change, a GC pause long enough to look dead.)

**Common mistakes to avoid:**
- Saying "we chose CA". That only means "single node".
- Treating consistency in CAP as the C in ACID. CAP's C is linearizability.
- Forgetting the E in PACELC. Most systems spend their whole life in the "else" branch.

---

### Q62. What is the Competing Consumers pattern? What is the Claim Check pattern (for large payloads)?

**Short answer (30 seconds):**
**Competing consumers:** several workers read from the same queue, and each message goes to exactly one of them. Throughput scales with workers, and a slow or dead worker just takes fewer messages. You lose global ordering. In Kafka the unit of competition is the partition, so a group can't have more active consumers than partitions. **Claim check:** don't put a big payload in the message. Store it in object storage (S3), send only a reference ("the claim check"), and the consumer fetches it. That keeps brokers fast and avoids message size limits (Kafka's default max is about 1 MB).

**Deep answer:**
- **Competing consumers, by broker:**
  - **RabbitMQ / SQS / Redis lists:** per-message competition; add workers freely. Use prefetch (RabbitMQ) or the visibility timeout (SQS) to control in-flight work.
  - **Kafka:** competition per partition; extra consumers sit idle. KIP-932 share groups (`[GENERAL]` preview in Kafka 4.x) add per-message competition.
  - **What you need:** idempotent handlers (a crash after work but before ack causes redelivery), a poison-message strategy (DLQ), and no assumption about order.
- **Claim check, in steps:**
  1. Producer uploads the blob to S3 under a unique key.
  2. It publishes `{type, s3_key, size, checksum, tenant_id}`.
  3. Consumer downloads, verifies the checksum, processes.
  4. A lifecycle rule (or the consumer) deletes the blob after N days.
- **Claim check gotchas:**
  - Upload must finish before publish (or the consumer gets 404). Publish only after the upload returns.
  - The store must be reachable from every consumer. A local disk breaks it as soon as you have two machines.
  - Access control: the reference is now a way to read the data. Use scoped credentials or signed URLs.
  - Retention: the blob must outlive the message, including DLQ replays.

**Sokrio example:**
- `[CODE]` **Competing consumers** is how every Laravel worker works. Redis-queue `pop` is a Lua script that moves a job from the list to `:reserved` atomically (`vendor/…/Queue/RedisQueue.php:275-286`), so two workers never get the same job. `[HIST]` The 2024 worker config ran `numprocs=8` of `queue:work redis --tries=3`.
- `[CODE]` Kafka consumers **don't** compete today: each topic has 3 partitions but one process (numprocs=1), and the static `group.instance.id = ""` stops you adding a second one (two processes fence each other, R22). Real parallelism is 1.
- `[CODE]` **Claim check done wrong (F19):** `BulkStockController` stores the upload on the `local` disk and passes the path in the job (`BulkStockController.php:58-62,88`). `BulkStockBatchImportJob` reads it from the local disk (`BulkStockBatchImportJob.php:23,36-38`). If a worker on another VM pops the job, the file isn't there: a warning, then a silent return (`[INFERENCE]`, depends on A10). The fix is the textbook one: put the claim on S3 (already configured, `config/filesystems.php:58-65`).

**Follow-up questions the interviewer may ask:**
- How do you keep per-customer order with competing consumers? (Partition or group by key: Kafka partitions, SQS FIFO message groups, or a consistent-hash exchange in RabbitMQ.)
- Why not just raise Kafka's `max.message.bytes` to 50 MB? (Memory pressure on brokers and consumers, slow replication, and fetch sizes; 1–10 MB is the sane ceiling.)
- Who deletes the S3 object if the consumer crashes? (A lifecycle rule with a TTL longer than the longest retry or replay window.)

**Common mistakes to avoid:**
- Adding consumers to a Kafka group beyond the partition count and expecting more throughput.
- Using a local file path as the claim check.
- Publishing the reference before the upload completes.

---

### Q63. How do you handle multi-tenancy in a message system? One topic per tenant vs shared topic with tenant key — trade-offs.

**Short answer (30 seconds):**
A **shared topic** with `tenant_id` in every message scales to thousands of tenants and is easy to operate, but tenants share partitions, so a big tenant creates skew and noisy-neighbour lag, and per-tenant replay or ACLs are hard. **Topic per tenant** gives isolation, per-tenant retention, ACLs, quotas and replay, but the number of partitions explodes and every new tenant needs provisioning. Most SaaS uses a **hybrid**: shared topics for the long tail, dedicated topics (or a dedicated cluster) for the few whales, plus tenant-aware quotas and monitoring.

**Deep answer:**

| Concern | Shared topic + tenant key | Topic per tenant |
|---|---|---|
| Partition count | Fixed (e.g. 12) | Tenants × partitions (100 tenants × 6 = 600 partitions per stream) |
| Onboarding | Nothing to create | Create topic + ACLs + consumer config |
| Noisy neighbour | Big tenant fills shared partitions | Contained to its own topic |
| Ordering | Per key (tenant or entity) | Per key inside the tenant topic |
| Replay one tenant | Re-read everything and filter | Reset that topic's offsets |
| Retention / deletion | Same for everyone | Per tenant (good for contracts, GDPR) |
| Security | App-level filtering | Broker ACLs per topic |

- **Choosing the key in a shared topic:**
  - `tenant_id` → per-tenant ordering, but the biggest tenant pins one partition (hot partition).
  - `tenant_id:entity_id` → spreads load, keeps per-entity order. Usually the right default.
- **Fairness tools:** broker quotas per client id, per-tenant rate limits at the producer, separate consumer lanes (topics or queues) for heavy tenants, and per-tenant lag metrics (consumer lag by key is not built in; you need to emit it).
- **Context safety:** every consumer must switch tenant context **per message** from the message itself, never from process state. This is where most multi-tenant bugs hide.

**Sokrio example:**
- `[CODE]` Sokrio uses **shared topics**. The envelope carries `tenant_id` (`KafkaProducer.php:93-102`) but the key is `user_id` for tracking and `department_id` for departments, not the tenant (D4, `TrackingController.php:62-83`, `DepartmentChangeObserver.php:104-145`). Good spreading and per-entity order, at the cost of no per-tenant replay.
- `[CODE]` Consumers switch tenant **per slice of a batch**: group by `tenant_id` → `Org::findById` → `TenantManager::tenant($org)->reconnect()` (`TrackingMessageHandler.php:50-87`). That's the right shape. The weak spot is the Org cached for the process lifetime with no `active` check, so a deactivated tenant is still consumed for up to 6 h (F18).
- `[CODE]` Queues have the same problem in a sharper form:
  - **F16:** a tenant model passed into a job is restored on whatever tenant DB the previous job left connected → wrong tenant's user (R31).
  - **F17:** the `tenant_id` stamped into job payloads is never read on workers.
- `[CODE]` **Noisy neighbour** shows up in queues, not Kafka: one global export lane for the whole platform (`SequentialJob` is a landlord model, F24, R34) and one `summary` queue that all tenants' hourly jobs share (R18).

**Follow-up questions the interviewer may ask:**
- How would you replay one tenant from a shared topic? (Start a new consumer group, filter on `tenant_id`, write idempotently. Or keep a per-tenant archive in S3.)
- How do you stop one tenant from starving others in a shared queue? (Per-tenant concurrency caps, weighted fair queuing, or a dedicated lane for the top tenants.)
- When would you give a tenant its own cluster? (Contractual isolation, data residency, or when it's a large share of total traffic.)

**Common mistakes to avoid:**
- Keying by `tenant_id` without checking the size distribution of tenants.
- Holding tenant context in process-global state across messages.
- Creating a topic per tenant "for isolation" with no plan for partition count or provisioning.

---

## 8.10 Laravel / PHP context (Q64–Q68)

### Q64. How do Laravel queues work under the hood with the Redis driver? What happens on `php artisan queue:work`?

**Short answer (30 seconds):**
A dispatched job is serialized to JSON and `RPUSH`ed onto a Redis list `queues:{name}`. Delayed jobs go into a sorted set `queues:{name}:delayed` scored by run time. `queue:work` is a long-running PHP loop. On each pass it moves due jobs from `:delayed` and expired ones from `:reserved` back onto the list, then a Lua script pops one job and puts it into `:reserved` with score `now + retry_after`. The worker runs the job with a `pcntl_alarm` timeout. On success it removes the job from `:reserved`. On failure it releases it back (with backoff) or, after `tries`, writes it to `failed_jobs`. If the worker dies, the job sits in `:reserved` until `retry_after` passes, then another worker picks it up.

**Deep answer:**
- **Redis keys per queue:** `queues:X` (list, ready), `queues:X:delayed` (zset, score = available at), `queues:X:reserved` (zset, score = reservation expiry), `queues:X:notify` (only used with `block_for`).
- **The worker loop:**
  1. `daemon()` registers signal handlers: SIGTERM → quit after the current job, SIGUSR2 → pause.
  2. `getNextJob()` walks the comma-separated `--queue` list **in order** and takes the first job it finds. That's how priority works.
  3. `pop()` runs `migrate()` (delayed → ready, expired reserved → ready), then the Lua pop.
  4. `runJob()` sets an alarm for the job's `timeout`. When it fires, the worker process is killed (not just the job).
  5. After each job, `stopIfNecessary()` checks memory (`--memory`), `--max-time`, `--max-jobs` and the restart signal (a cache key written by `queue:restart`).
- **Attempts:** the Lua pop increments `attempts` inside the payload. `tries` and `maxExceptions` decide when it fails for good.
- **Polling:** with `block_for = null`, an empty queue means `sleep --sleep` seconds before the next poll. With `block_for` set, the worker does a `BLPOP` on `:notify` instead.
- **Why it's at-least-once:** the reservation is a lease. Any crash between "do the work" and "delete from `:reserved`" means the job runs again after `retry_after`.

**Sokrio example:**
- `[LIB]` The pieces, with lines (Laravel 9.52.22):

  | Step | Where |
  |---|---|
  | Push / delayed push | `vendor/…/Queue/RedisQueue.php:153` / `:193-196` |
  | Pop → migrate → Lua reserve | `RedisQueue.php:224`, `:244-249`, `:275-286` |
  | Delete / release | `RedisQueue.php:305`, `:321` |
  | Worker loop, signals | `vendor/…/Queue/Worker.php:128`, `:675-681` |
  | Priority by queue list | `Worker.php:339-352` (`foreach (explode(',', $queue) …)`) |
  | Timeout alarm | `Worker.php:206`, `:229-254` |
  | Stop checks (memory, time, restart key) | `Worker.php:295`, `:653-666` |

- `[CODE]` Sokrio's config: `retry_after` **9000** and `block_for` null (`config/queue.php:61-66`), queues on Redis DB 0 (`config/database.php:202-219`). Five queues are in use: `summary`, `default`, `feature-tracking`, `order-approved`, `sequential`.
- `[CODE]` Because `:delayed` lives only in Redis, a Redis restart without persistence loses every pending delayed approval, and nothing sweeps for them (R12, A9).
- `[HIST]` The 2024 worker image ran `queue:work redis --sleep=3 --tries=3 --max-time=3600` with **no `--queue`** flag, so it only consumed `default`. Which boxes consume `summary`/`order-approved`/`sequential` today is undocumented (A10).

**Follow-up questions the interviewer may ask:**
- Why a Lua script for pop? (Atomic `LPOP` + `ZADD` to `:reserved` + attempts increment; no two workers get the same job.)
- What does `queue:restart` actually do? (Writes a timestamp to the cache; each worker compares it after every job and exits so Supervisor starts fresh code.)
- What happens to `:reserved` jobs on a deploy? (If the worker exits cleanly they finish first; if killed they come back after `retry_after`.)

**Common mistakes to avoid:**
- Thinking `queue:work` reloads code. It doesn't; you must `queue:restart`.
- Saying failed jobs are retried "immediately". A crash is retried only after `retry_after`; an exception is released with `backoff`.
- Forgetting that the cache store must work on workers for `queue:restart` and unique jobs to work.

---

### Q65. What is the relationship between `retry_after` and a job's `timeout`? What happens if `timeout >= retry_after`?

**Short answer (30 seconds):**
`retry_after` (per connection) is the lease: how long a reserved job can stay in `:reserved` before Redis hands it to another worker. `timeout` (per worker or job) is how long the worker lets a job run before killing it. The job's `timeout` must be **shorter** than `retry_after`, with a margin. If `timeout >= retry_after`, a slow but healthy job is still running when its lease expires, a second worker picks it up, and the job runs twice in parallel. With `timeout = 0` (no limit) there's no protection at all.

**Deep answer:**
- **The timeline with `retry_after = 90`, job takes 120 s:**
  1. t=0 worker A reserves the job (score = now + 90).
  2. t=90 any worker's `migrate()` moves it back to the ready list.
  3. t=91 worker B pops it and starts again. Both are now running it.
  4. t=120 A finishes and deletes **its** reservation; B keeps going.
- **The rule:** `timeout` < `retry_after` by several seconds, so the alarm kills the slow job (and frees the slot) before the lease expires.
- **The other direction:** a huge `retry_after` makes crash recovery slow. A worker killed by OOM leaves its job invisible until `retry_after` passes.
- **So you usually need two connections:** a "short" one (`retry_after` 90–300) for small, latency-sensitive jobs, and a "long" one for reports.
- **Make jobs idempotent anyway.** The lease is a heuristic; clocks, network partitions and SIGKILL make double runs possible even with correct numbers.

**Sokrio example:**
- `[CODE]` `retry_after` is **9000 s** (2.5 h, `config/queue.php:65`) for every job, and five jobs set `$timeout = 0`: `GenerateAdvanceInvoicePDF`, `GenerateVisitTargetReport`, `StockReport`, `GenerateTrackingReport`, `GenerateOrderProductSummery`. A job with `timeout = 0` has no alarm, so if it runs or hangs past 2.5 h, a second worker starts it too (R13).
- `[CODE]` The other side of 9000 s: a delayed approval reserved by a worker that crashes stays invisible for 2.5 h. Primary-order approvals even run on `default` with `$timeout = 0` (F10). They're idempotent thanks to the `pending()` guard (`app/Jobs/PrimaryOrder/ApproveOrder.php:47`), so the risk is lateness, not double approval.
- `[CODE]` A trap from the code: `ApproveOrder` declares `public $retry_after` (`app/Jobs/ApproveOrder.php:26`), but Laravel reads `retry_after` only from the connection config. The property does nothing and gives a false sense of safety.
- `[INFERENCE]` The fix: a `redis-long` connection (keep 9000) for reports with real timeouts below it, and the default connection down to ~300 s for approvals and notifications (R13, T7 Top 5 #4).

**Follow-up questions the interviewer may ask:**
- Does SQS have the same problem? (Yes, as the visibility timeout. Laravel's SQS driver ignores `retry_after` and uses the queue's visibility timeout, T6 §6.8.)
- How do you run a 3-hour job safely? (Split it into chunks, or extend the lease, or run it outside the queue with a lock and a heartbeat.)
- How does Horizon handle it? (Same rule; Horizon's per-supervisor `timeout` must stay below the connection's `retry_after`.)

**Common mistakes to avoid:**
- Setting `retry_after` to "very large" to be safe. It turns every crash into a multi-hour delay.
- Setting `timeout` on the job class and assuming it's enforced without `pcntl` (no `pcntl` = no alarm).
- Fixing double runs with a bigger `retry_after` instead of idempotency.

---

### Q66. Laravel Horizon: what does it give you? How do you size workers, balance queues, and prioritize (`high,default,low`)?

**Short answer (30 seconds):**
Horizon is a Redis-only supervisor and dashboard for Laravel queues. You define worker pools in code (`config/horizon.php`) per environment, and it starts, scales and restarts the processes. It also gives you a dashboard for throughput, runtime, wait time and failed jobs, plus tags, long-wait alerts and metrics. Size each pool with **workers ≈ arrival rate × average job time** plus headroom. Prioritize either with one pool reading `high,default,low` in order (strict priority) or with separate pools per queue so low-priority work can't starve.

**Deep answer:**
- **What Horizon adds over plain `queue:work`:**
  - Config-as-code supervisors: queues, `minProcesses`/`maxProcesses`, `tries`, `timeout`, `memory`.
  - **Balancing:** `simple` (split evenly), `auto` (move processes to the queue with the most wait time, using `balanceMaxShift` / `balanceCooldown`), or `false`.
  - Metrics: jobs per minute, runtime, **wait time per queue**, failed jobs with payload and retry button, tags (e.g. by tenant).
  - `LongWaitDetected` notifications when a queue's wait passes a threshold.
  - One `horizon` process under Supervisor instead of many `queue:work` entries; `horizon:terminate` for deploys.
- **Sizing:**
  - Little's law: in-flight = rate × time. 20 jobs/s × 0.5 s = 10 busy workers; plan 15–20.
  - Long jobs get their own pool so they don't block short ones.
  - Memory: workers × peak RSS must fit the box.
- **Priority:**
  - `--queue=high,default,low` in one pool: `high` always first. Simple, but a flood of `high` starves `low`.
  - Separate pools: guaranteed capacity per queue; `auto` balancing can lend idle workers.

**Sokrio example:**
- `[CODE]` Sokrio **doesn't use Horizon** (`laravel/horizon` is not in `composer.json`). Workers are plain `queue:work` under Supervisor; only three programs are documented (`README.md:170-212`), and the workers for `summary`, `order-approved` and `sequential` aren't written down anywhere (A10).
- `[INFERENCE]` A Horizon layout for today's queues:

  | Pool | Queues | Why |
  |---|---|---|
  | `urgent` | `order-approved` | Short, user-visible, needs its own capacity and a short timeout |
  | `default` | `default,feature-tracking` | Mixed short jobs |
  | `reports` | `summary`, `sequential` | Long jobs, high timeout, on the long-`retry_after` connection (Q65) |

- `[INFERENCE]` The win for Sokrio wouldn't be scaling, it'd be **visibility**: wait time per queue and a failed-jobs view are exactly the alerts missing today (T6 §6.9: no queue age, no failed_jobs alert). Tags by tenant would also show noisy neighbours (R18).
- `[CODE]` Caveat: Horizon tags and metrics use Redis, which is the same instance as the queues and cache today (F20), so separate Redis first (T6 §6.10 phase 2/4).

**Follow-up questions the interviewer may ask:**
- Does Horizon work with SQS? (No, Redis only.)
- How do you deploy with Horizon? (`horizon:terminate`; Supervisor restarts it; in-flight jobs finish first.)
- What does `auto` balancing do when every queue is empty? (Scales each pool down to `minProcesses`.)

**Common mistakes to avoid:**
- Using strict priority for a high-volume `high` queue and wondering why `low` never runs.
- Putting a 2-hour report and a 50 ms notification in the same pool.
- Treating Horizon as a reliability feature. It supervises and shows; the job semantics (lease, retries) are unchanged.

---

### Q67. Why is PHP traditionally awkward for Kafka consumers? How would you run a long-lived Kafka consumer in a Laravel app?

**Short answer (30 seconds):**
PHP is built for short request lifetimes: memory leaks and stale state don't matter because the process dies after each request. A Kafka consumer is the opposite: one process lives for hours, must heartbeat to stay in the group, must handle SIGTERM by finishing and committing, and the standard client (`librdkafka`) needs the `rdkafka` C extension. To run one in Laravel: an artisan command under Supervisor, manual commits after processing, batching, signal handling with a clean `close()`, a max runtime or memory check so it recycles itself, and reconnect logic. Swoole or Octane can add real background timers for heartbeats.

**Deep answer:**
- **The awkward parts:**
  - **No threads:** `librdkafka` heartbeats on a background thread; a pure-PHP client can only heartbeat when your code calls into it.
  - **Leaks:** Eloquent's query log, event listeners, static caches. Over hours memory creeps up.
  - **Global state:** DB connections, auth, tenant context, container singletons live across messages.
  - **Signals:** `pcntl` must be enabled, and a signal mid-I/O can break a socket read.
- **The recipe:**
  1. `php artisan kafka:consume {topic}` with `set_time_limit(0)`.
  2. Supervisor: `autorestart=true`, `stopwaitsecs` longer than the longest flush.
  3. Poll → buffer → flush every N messages or T seconds → commit offsets after the flush.
  4. On SIGTERM: stop polling, flush, commit, `close()` (leave the group).
  5. Recycle after X hours or Y MB, exit 0, let Supervisor restart.
  6. Reset per-message state (tenant connection, auth); disable the query log.
  7. Make the handler idempotent; at-least-once is the best you get.
- **Client choices:** `rdkafka` (librdkafka, full features, background heartbeat, needs the extension) vs a pure-PHP client (easy install, fewer features). Swoole/Octane let a pure-PHP client run timers in coroutines.

**Sokrio example:**
- `[CODE]` Sokrio uses the **pure-PHP** `longlang/phpkafka` (no `rdkafka`, no Octane, MEMORY §Stack), and the consumer is a solid version of the recipe:
  - artisan command + `set_time_limit(0)` (`ConsumeCommand.php:45-46`), Supervisor programs with `stopwaitsecs=35` (`README.md:178-212`)
  - manual commit per flush, batch of 200 or 1 s (`KafkaConsumer.php:69,326-336`)
  - signals **blocked during the persist step** so SIGTERM can't tear a MySQL read in half (`KafkaConsumer.php:309-319`); flush before exit on shutdown (`:262-266`)
  - reconnect with backoff, exit after 10 failures for Supervisor (`:155-190,371-393`)
  - recycle after 6 h (`config/kafka.php:70`)
  - an EINTR-safe socket because Datadog's profiler signals broke `select()` (`InterruptResilientStreamSocket.php:36-83`, R23)
- `[LIB]` The PHP limit shows in **F9**: outside Swoole the library heartbeats only when it fetches (`KafkaUtil.php:45-53`, `Consumer.php:292-294`). A flush slower than the 30 s session timeout gets the consumer evicted, its commit fails, and the batch is replayed. "Our effective poll budget is 30 s, not 5 minutes" (08b).
- `[CODE]` Scaling is blocked by a config choice, not PHP: the static `group.instance.id = ""` means two processes fence each other (R22). The fix is a per-process id (`%(process_num)s`).

**Follow-up questions the interviewer may ask:**
- Why not consume Kafka from a queued job? (Jobs are short-lived; group membership and offsets need a long-lived process.)
- How do you know a consumer is alive? (Lag per partition, plus a heartbeat log or metric; a process that's up but not consuming shows as growing lag.)
- Would you switch to `rdkafka`? (Yes if you need idempotent producers, SASL/SCRAM or IAM (F21), or background heartbeats; the cost is a C extension in every image.)

**Common mistakes to avoid:**
- Running the consumer from `cron` every minute. Each run rejoins the group and causes a rebalance.
- Committing before processing (at-most-once by accident).
- Ignoring SIGTERM: Supervisor or ECS kills the process mid-batch and the batch replays.

---

### Q68. How do you dispatch a job only after the DB transaction commits (`afterCommit`)? Why does it matter?

**Short answer (30 seconds):**
Inside a transaction, the new or updated row isn't visible to other connections until commit. If you dispatch a job inside the transaction, a fast worker can pick it up first and get "model not found", or read old data. If the transaction then rolls back, the job runs for something that never happened. In Laravel use `->afterCommit()` on the dispatch, `public $afterCommit = true` on the job, listener or observer, or `'after_commit' => true` on the queue connection. Laravel then holds the dispatch until the outermost transaction commits and drops it on rollback.

**Deep answer:**
- **Three switches (Laravel 8.x+):**
  - per dispatch: `Job::dispatch($id)->afterCommit()`
  - per class: `public $afterCommit = true;` on a job, queued listener, or observer
  - per connection: `'after_commit' => true` in `config/queue.php`
- **How it works:** `DatabaseTransactionsManager` collects callbacks on the current transaction and runs them after the outermost commit. With no open transaction, it runs immediately.
- **What it does not fix:** "committed but never published". A crash between `COMMIT` and the dispatch loses the job. Only an **outbox** row written in the same transaction closes both gaps (Q10).
- **Testing trap:** `Queue::fake()` / `Bus::fake()` don't honour `afterCommit`, so tests can't catch a regression.

**Sokrio example:**
- `[LIB]` Laravel 9.52.22 supports all three switches (`vendor/…/Queue/Queue.php:326-337`, `Events/Dispatcher.php:526-548`; runs immediately outside a txn, `Database/DatabaseTransactionsManager.php:90-97`). `config/queue.php` sets the connection switch nowhere.
- `[CODE]` Sokrio has exactly **one** explicit `afterCommit`: `ApprovalNotifier.php:67` (D13). The audit from T5 §5.4:

  | Site | Verdict |
  |---|---|
  | `DepartmentChangeObserver` publish during `DepartmentBulkDataUpdateController.php:41-52` | 🔴 publishes inside the txn; rollback → phantom event already in Mongo (F8). Fix: `public $afterCommit = true` on the observer |
  | `SequentialJobDispatcher.php:30-56` | 🟢 dispatch inside `DB::transaction`; add `->afterCommit()` |
  | `ImportSecondaryOrderJob.php:260` `approveAfter` | ✅ safe: delayed + `pending()` guard |
  | `PromotionAction.php` | ✅ dispatches after `DB::commit()` by hand |

- `[INFERENCE]` I'd use per-site switches, not the global connection flag: flipping it changes timing for all 127 jobs at once, and the fakes would hide any regression (T5 §5.4).

**Follow-up questions the interviewer may ask:**
- Does `afterCommit` work with nested transactions? (It waits for the outermost commit; a rolled-back savepoint discards its callbacks.)
- What about Kafka events from model observers? (Same issue: set `$afterCommit` on the observer, or better, write an outbox row in the transaction.)
- How do you find all dispatches inside transactions? (Grep for dispatch calls within `DB::transaction` / `beginTransaction` blocks; add a review rule.)

**Common mistakes to avoid:**
- Believing `afterCommit` gives exactly-once publishing. It only removes the "rolled back" case.
- Adding `sleep()` or a delay to "give the transaction time".
- Turning on the global flag and not checking jobs that depend on dispatch-time ordering.

---

## 8.11 System design scenarios (Q69–Q75)

> Each answer follows the same seven steps: **requirements → API/events → topics/queues → partition key → failure handling → scaling → monitoring**. Say the steps out loud in the interview; it shows structure even when you run out of time.

### Q69. Design an order processing pipeline for a multi-tenant distribution/order-management SaaS (100+ enterprise clients, field sales reps placing orders from mobile, sometimes offline).

**Short answer (30 seconds):**
Mobile apps queue orders locally with a client-generated **idempotency key** and sync when online. The API writes the order and an **outbox** row in one tenant-DB transaction and returns 201 (or the existing order if the key was seen before). A relay publishes `OrderPlaced` to a shared `orders` topic keyed by `tenant:order_id`. Consumers handle approval, stock reservation (a small saga with compensation), notifications, and reporting (stream aggregates or batch summaries). Failures go to retry topics and a DLQ per consumer. Scale by partitions and per-tenant lanes for whales; monitor lag, outbox age and per-tenant error rates.

**Deep answer:**
1. **Requirements:** no lost orders, no duplicate orders from offline retries, per-order ordering of status changes, tenant isolation, reports within minutes, approvals that may be delayed by policy. Scale: say 100 tenants × 500 reps × 50 orders/day ≈ 2.5 M orders/day, bursty at end of day when reps reconnect.
2. **API/events:**
   - `POST /orders` with `Idempotency-Key` (UUID made on the device when the order is created offline). Unique index `(tenant, idempotency_key)`; a replay returns the first result.
   - Events: `OrderPlaced`, `OrderApproved`, `OrderRejected`, `StockReserved`, `StockReservationFailed`, `OrderDelivered`. ECST snapshots with `version` (Q60).
3. **Topics/queues:** `orders` (events), `stock` (commands/replies for reservation), retry topics `orders.retry.1m/10m`, `orders.dlq`. Notifications on a queue (per-message retries suit them better, Q70).
4. **Partition key:** `tenant_id:order_id`. Per-order order, even spread; no tenant pins a partition (Q63).
5. **Failure handling:**
   - Dual write → outbox + relay (`FOR UPDATE SKIP LOCKED`), producer `acks=all` + idempotence.
   - Consumers idempotent by `event_id` (processed-events table) or by `version`.
   - Stock saga: reserve → on failure, compensate (`OrderRejected: out of stock`) and notify the rep.
   - Clock skew from offline devices: store both device time and server receive time; reports use device time with a lateness policy (Q71).
6. **Scaling:** partitions sized for peak (e.g. 24), stateless consumers in groups, dedicated topics or consumer lanes for the biggest tenants, per-tenant rate limits on the API.
7. **Monitoring:** consumer lag per group/partition, outbox oldest-unpublished age, DLQ count, sync backlog per device (from the app), per-tenant order rate vs baseline.

**Sokrio example:**
- `[CODE]` This *is* Sokrio's domain. What exists today vs the design:

  | Design piece | Sokrio today |
  |---|---|
  | Idempotency key | Only in Task Manager (`app/Support/Concerns/HandlesIdempotency.php`); orders have none |
  | Outbox | None; order/delivery publish is commented out (`OrderObserver.php:23`, `DeliveryObserver.php:23`) |
  | Delayed approval | `approveAfter` on Redis `:delayed`, idempotent via `pending()` (`Order.php:240-243`, `ApproveOrder.php:53`) |
  | Reporting | Hourly Mongo summaries with idempotent upserts + daily resync (`Kernel.php:149-155`) |
  | Offline batching | Tracking v2 bulk endpoint (`V2/Tracking/TrackingController.php:52-78`) is the existing "sync a backlog" path |
  | Key choice | user_id / department_id, not tenant (D4) |

- `[INFERENCE]` My order of work for Sokrio: (1) idempotency key on order create, (2) outbox table + relay with `acks=1` or better (F5), (3) re-enable `OrderObserver` publishing through the outbox, (4) only then think about stream reporting. Steps 1–2 fix real risks; step 4 is a nice-to-have.

**Follow-up questions the interviewer may ask:**
- Two reps edit the same order offline. Who wins? (Optimistic concurrency with `version`; the second sync gets a conflict and the app shows a merge screen, or "server wins" by policy.)
- How do you reserve stock without a distributed transaction? (Conditional `UPDATE stock SET qty = qty - n WHERE qty >= n` in the stock service; a failed reserve triggers compensation.)
- Why not a topic per tenant? (Partition explosion at 100+ tenants; give whales a lane instead.)

**Common mistakes to avoid:**
- Generating the idempotency key on the server. Offline retries need it from the device.
- Publishing from the controller after commit with no outbox.
- Forgetting the end-of-day burst when every rep reconnects at once.

---

### Q70. Design a notification system (SMS, email, push) handling 10M notifications/day with retries, rate limits per provider, and user preferences.

**Short answer (30 seconds):**
Producers send a `NotificationRequested` event (who, template, data, dedup key). A **router** checks user preferences, quiet hours and per-user caps, renders the template, and fans out one message per channel onto **per-channel queues** (SMS, email, push). Channel workers call providers through a **per-provider token bucket**, retry transient errors with backoff, fail over to a second provider, and send permanent failures to a DLQ. A dedup key per (notification, recipient, channel) stops duplicates. 10M/day is ~120/s average; plan for 10× peaks.

**Deep answer:**
1. **Requirements:** 10M/day ≈ 116/s average, peaks ~1–2k/s (campaigns). Per-provider limits (e.g. an SMS gateway at 100/s). Preferences and opt-outs are legal requirements. At-least-once delivery with dedup; OTPs are urgent, marketing can wait.
2. **API/events:** `POST /notifications` or a `NotificationRequested` event: `{dedup_key, user_id, template, data, priority, channels?}`. Status events back: `Sent`, `Delivered`, `Failed`, `Bounced` (provider webhooks).
3. **Topics/queues:** `notifications.requested` (Kafka, for fan-in from many services) → router → queues `sms.high`, `sms.low`, `email`, `push` (SQS or Redis/RabbitMQ; per-message retry and delay fit queues better than partitions). DLQ per channel.
4. **Partition key:** `user_id` on the request topic, so per-user caps and ordering are local to one consumer.
5. **Failure handling:**
   - Dedup: insert `(dedup_key, channel)` into a table with a unique index **before** calling the provider; skip if it exists.
   - Retries: transient (5xx, timeout) → exponential backoff with jitter, max N; permanent (invalid number, unsubscribed) → no retry.
   - **Unknown outcome** (timeout after the request was sent) → don't blind-retry an SMS; query the provider or mark "unknown" (otherwise duplicates).
   - Provider down → circuit breaker → fail over to provider B.
6. **Scaling:** workers per channel sized to provider limits (more workers don't help past the token bucket), priority queues so OTPs bypass campaigns, campaign sends throttled at the router.
7. **Monitoring:** queue age per channel, provider error rate and latency, token-bucket rejections, DLQ size, delivery rate from webhooks, cost per channel.

**Sokrio example:**
- `[CODE]` Sokrio already learned the hardest lesson here: the SMS interface separates "never connected, nothing sent" (`ProviderUnavailableException`) from "connected but no answer, the SMS may have gone out" (`SmsDeliveryUnknownException`) (`app/Services/SMSSender.php:12-19`). The second one is **not safe to auto-retry**, and Sokrio doesn't: SMS has no automatic retry, only a manual resend (`MessageResendService::startResend`, claim under lock `:111-198`, own cap `sms.resend.max_retry=5`, `config/sms.php:14-15`).
- `[CODE]` Push and web notifications go through `SendApprovalNotificationJob`: it carries `Org` + plain arrays, reconnects the tenant, and wraps **each** recipient and the FCM push in its own `try` (`app/Jobs/Notification/SendApprovalNotificationJob.php:44-68`). One bad recipient doesn't fail the job, so `tries = 3` never resends to the users who already got it. It's dispatched `->afterCommit()` (`ApprovalNotifier.php:67`).
- `[CODE]` What's missing for a 10M/day design: no per-provider rate limiter (no `RateLimited` job middleware anywhere, MEMORY §Queues), no dedup table, and no channel queues (everything on `default`).

**Follow-up questions the interviewer may ask:**
- How do you enforce "max 3 marketing SMS per user per day"? (Counter per user per day in Redis with TTL, checked at the router; reject or defer.)
- How do you handle provider webhooks arriving before your "sent" record? (Upsert by provider message id; status only moves forward.)
- How do you send a 2M-user campaign without hurting OTPs? (Separate low-priority queue, router-side throttle, OTPs on their own queue and workers.)

**Common mistakes to avoid:**
- Retrying on timeout without considering that the message may have been sent.
- Checking preferences at enqueue time only (users opt out between enqueue and send; check again at send).
- One queue for all channels, so a slow email provider blocks SMS.

---

### Q71. Design a real-time dashboard showing sales per region per minute with late-arriving data.

**Short answer (30 seconds):**
Publish each sale as an event with **event time** (when the order happened), keyed by region. A stream processor groups by `(tenant, region)` into **1-minute tumbling windows on event time**, with a watermark of a few minutes and an **allowed lateness** window; late events update the old window and re-emit it. Results are upserted into a store keyed by `(tenant, region, minute)` (ClickHouse, Druid, Redis, or a SQL table), and the dashboard reads that and gets pushes via WebSocket. Events later than allowed lateness go to a side output and a nightly batch job corrects the history.

**Deep answer:**
1. **Requirements:** per-minute granularity, freshness under ~10 s, correctness for late data from offline devices, history for the last 30 days, per-tenant isolation.
2. **API/events:** `SaleRecorded {tenant_id, order_id, region_id, amount, occurred_at, received_at, version}`. Dashboard API: `GET /sales/regions?from&to` + a WebSocket channel per tenant.
3. **Topics:** `sales` (input), `sales.minute-agg` (compacted output keyed by `tenant:region:minute`), `sales.late` (side output).
4. **Partition key:** `tenant_id:region_id`, so a window's events meet in one task; watch skew from huge regions.
5. **Windowing (from 08c Q52/Q53):**
   - Tumbling 1-minute windows on **event time**, not processing time.
   - Watermark = max event time seen − 2 min (bounded out-of-orderness).
   - Allowed lateness 24 h: a late event updates the old window and emits the new total (an **upsert**, not an append).
   - Later than that → `sales.late` → batch correction.
   - Corrections and cancellations: send a negative amount or the new `version`; aggregates must handle retractions.
6. **Scaling:** stateful tasks per partition (Kafka Streams/Flink with RocksDB), store sized for tenants × regions × minutes × 30 days (pre-roll to hourly after 7 days).
7. **Monitoring:** end-to-end latency (event time → dashboard), watermark lag, late-event rate per tenant, side-output volume, consumer lag.

**Sokrio example:**
- `[CODE]` Sokrio does this in **batch**: hourly summary jobs (`Kernel.php:149,152`) and a daily resync (`:155`) upsert Mongo summaries with `$set`/`$setOnInsert` (`SummariesQuery.php:229-238`). That's the "Lambda batch layer with no speed layer" from 08c Q51. The daily resync is effectively a 24 h allowed lateness, and the idempotent upsert is exactly the "re-emit the window" behaviour.
- `[INFERENCE]` A streaming version for Sokrio needs, first: order events published at all (they're commented out, Q60), with `occurred_at` kept (the consumer currently drops it, `KafkaConsumer.php:360-364`), and a key that co-partitions sales with regions. Then a small Kafka Streams/Flink job, or simply a per-minute upsert job, could feed the dashboard. Keep the daily resync as the correction path.
- `[CODE]` The realtime push already exists: Pusher via laravel-echo (`sokrio-app-frontend/src/lib/echo.ts`), used for report progress today.

**Follow-up questions the interviewer may ask:**
- Why not just `GROUP BY minute` in the DB every minute? (Fine at small scale. It breaks when the query cost grows with history; pre-aggregation fixes that.)
- What if a device's clock is wrong by hours? (Clamp event time to `received_at` ± a bound, flag the event, and count those separately.)
- How do you show "data still arriving" in the UI? (Mark windows newer than the watermark as provisional.)

**Common mistakes to avoid:**
- Windowing on processing time and calling it "sales per minute".
- Appending late updates instead of upserting the window.
- No plan for events later than allowed lateness.

---

### Q72. Design an activity/audit log for all entity changes across services, searchable and replayable (CDC + Kafka + Elasticsearch/ClickHouse).

**Short answer (30 seconds):**
Capture changes with **CDC** (Debezium reading the MySQL binlog), not application code, so nothing can bypass it. Debezium writes row-level before/after events to Kafka topics per table. A small enrichment step adds **who** made the change (from a per-transaction context table or a request id column) and normalises events into `audit.events`. Sinks write to **ClickHouse** (cheap, fast filters and aggregates over billions of rows) or Elasticsearch (full-text search). Kafka retention (or tiered storage plus an S3 archive) makes the log replayable into new indexes.

**Deep answer:**
1. **Requirements:** every insert/update/delete on audited tables, who/when/what changed (before/after), search by entity, user and time, retention 1–7 years, tamper resistance, tenant isolation.
2. **Events:** Debezium envelope (`before`, `after`, `op`, `source.ts_ms`, `source.db`, `source.table`, binlog position) → normalised `{tenant, entity, entity_id, op, changed_fields, before, after, actor, request_id, ts}`.
3. **Topics:** raw `cdc.<server>.<db>.<table>` → `audit.events` keyed by `tenant:entity:entity_id` (per-entity order).
4. **Who did it:** binlogs don't know the app user. Options: an `updated_by` column on every table, or the app writes `(transaction id → user, request_id)` into a side table that CDC also captures and the enricher joins.
5. **Failure handling:** Debezium stores binlog offsets in Kafka; restarts resume. Sinks are idempotent (ClickHouse `ReplacingMergeTree` by event id, ES doc id = event id). Schema changes via a schema registry. Binlog retention on MySQL must outlive any connector outage.
6. **Scaling:** one connector per MySQL **server** (all DBs on it via `database.include.list`), partitions by entity key, ClickHouse partitioned by month and ordered by `(tenant, entity, entity_id, ts)`.
7. **Monitoring:** connector lag (binlog position vs head), sink lag, DLQ for unparseable rows, row counts per table per day vs source.
- **Replay:** new index = new consumer group from offset 0 (or from the S3 archive); old one stays until the new one catches up.
- **Tamper resistance:** write-only sink credentials, S3 Object Lock for the archive.

**Sokrio example:**
- `[CODE]` Sokrio has **no CDC pipeline** today; Kafka events come from model observers (`DepartmentChangeObserver`), which is exactly why some writes are invisible: `Department::upsert()` and query-builder `->update()` bypass observers (F2). An audit log built on observers would have the same holes. CDC from the binlog doesn't.
- `[GENERAL]` Correcting an earlier note (D19): Debezium's cost scales with **MySQL servers**, not tenants. The binlog is per server, and one connector covers every tenant DB on that server via `database.include.list`. For Sokrio that's one or two connectors (some tenants sit on a separate host), not 100.
- `[INFERENCE]` For "who", Sokrio would need an `updated_by` convention or a per-request context row; worker writes are a trap there, because worker auth is never reset between jobs (T5 §5.5), so `auth()->id()` inside a job can be the previous job's user.

**Follow-up questions the interviewer may ask:**
- Why not log from the application? (Bulk updates, raw SQL, migrations and other services bypass it; CDC sees everything that commits.)
- ClickHouse or Elasticsearch? (ClickHouse for filters, counts and long retention at low cost; ES when users need free-text search. Some teams run both.)
- How do you handle a GDPR delete in an audit log? (Pseudonymise user ids, keep PII in a separate store you can delete; or crypto-shred.)

**Common mistakes to avoid:**
- Building audit on ORM events and missing bulk writes.
- Forgetting MySQL binlog retention, so a long connector outage needs a full re-snapshot.
- Logging full rows with PII into a search index everyone can query.

---

### Q73. Design a flight/hotel booking system where seat inventory must never be double-booked, using queues for async confirmation from external suppliers.

**Short answer (30 seconds):**
"Never double-booked" is enforced in **one authoritative store with an atomic conditional write**, not by queues or locks. Step 1: create a **hold** with a TTL by `UPDATE inventory SET held = held + 1 WHERE id = ? AND sold + held < capacity` (or a unique row per seat). Step 2: queue an idempotent `ConfirmWithSupplier` command. Step 3: on the supplier's confirm, turn the hold into a booking; on reject or timeout, release the hold and compensate (refund). Every message carries an idempotency key so retries and duplicate supplier callbacks are harmless.

**Deep answer:**
1. **Requirements:** zero overselling, fast "you're holding seat 12A for 10 minutes" response, supplier confirmation takes seconds to minutes and can fail, payments must be refunded on failure.
2. **API/events:** `POST /holds` (sync, returns a hold id), `POST /bookings` (payment + hold id, returns `PENDING`), events `HoldCreated`, `BookingConfirmed`, `BookingFailed`, `HoldExpired`.
3. **Queues:** `supplier.confirm` (per-message retry and delay; SQS/RabbitMQ), `supplier.callbacks`, DLQ. Kafka for the booking event stream to other services.
4. **Key:** `inventory_id` (flight+seat or hotel+date+room type) so all changes to one inventory item are serialized when they go through a stream.
5. **Failure handling:**
   - Atomic hold: a conditional update or a unique constraint `(flight, seat)`. The DB says no, not a lock.
   - Hold expiry: a sweeper (or delayed message) releases holds after the TTL; the release is conditional on the hold still being `HELD`.
   - Supplier call: idempotency key = booking id; on timeout, **query** the supplier before retrying (unknown outcome).
   - Saga: payment → supplier → confirm; compensation = refund + release.
6. **Scaling:** partition inventory by flight/hotel; hot items (a popular flight) are one row, so keep the transaction tiny; use a queue in front only to smooth spikes, not for correctness.
7. **Monitoring:** holds expired vs converted, supplier latency and error rate, bookings stuck in `PENDING`, oversell check (sold > capacity alert should be impossible; alert anyway).

**Sokrio example:**
- `[CODE]` Sokrio has a small version of this bug: stock updates take a Redis lock, read `qty`, add in PHP and write back, but the lock is **released before the transaction commits** (`Guest/StockUpdateController.php:152-153` lock, `:166` release, `DB::commit()` at `:263`). Another request can read the old quantity in that gap → lost update (F13). The fix is the booking lesson: an atomic `increment()` in the DB, which is already in the file, commented out at `:163`.
- `[CODE]` A good pattern in the same codebase: delayed approvals re-check state with `pending()` before acting (`ApproveOrder.php:53`). That's the "release the hold only if it's still `HELD`" rule.
- `[INFERENCE]` One-liner for interviews: "A lock released before the commit protects nothing. The constraint has to live where the commit happens."

**Follow-up questions the interviewer may ask:**
- Why not a Redis distributed lock per seat? (Lease expiry, GC pauses and failover can let two holders in; you'd need fencing tokens checked by the DB anyway, 08c Q44.)
- How do you handle overbooking on purpose (airlines do)? (Capacity = physical × factor; the same atomic check, with a different limit.)
- What if the supplier confirms after you've released the hold? (Treat it as a new booking attempt: re-hold if possible, else cancel with the supplier and refund.)

**Common mistakes to avoid:**
- "We'll process bookings in a single-consumer queue so they can't conflict." That works until you scale or retry, and it doesn't protect against other writers.
- Read-then-write in application code without a conditional update.
- Blind retries to a supplier on timeout.

---

### Q74. Design a delayed job / scheduler system (e.g. "send reminder in 3 days") at scale. Why is this hard with Kafka?

**Short answer (30 seconds):**
Kafka has no per-message delay or visibility timeout: a consumer reads in offset order and can't skip a message that isn't due yet without blocking the partition. So delayed work needs a store ordered by **due time**. The robust design: persist each scheduled item in a DB table `(id, due_at, status, payload)` with an index on `due_at`, and run a poller that claims due rows with `FOR UPDATE SKIP LOCKED` and publishes them to a work queue. Short delays can use broker features (SQS up to 15 min, Redis sorted sets, RabbitMQ delayed exchange); long ones should use a durable scheduler (DB table, EventBridge Scheduler, Temporal).

**Deep answer:**
- **Why Kafka is awkward:**
  - Pausing on a not-yet-due message blocks everything behind it in that partition.
  - Workaround: **delay tiers** (topics `delay-1m`, `delay-1h`, `delay-1d`); each consumer sleeps until the head message is due, then forwards it. Coarse, many topics, and long delays hold retention.
  - Re-publishing "not due yet" messages in a loop burns throughput.
- **Options by delay length:**

  | Option | Max delay | Durability | Notes |
  |---|---|---|---|
  | Redis sorted set (Laravel `:delayed`) | Any | Only as good as Redis persistence | Simple; lost on restart without AOF |
  | SQS `DelaySeconds` | **15 min** | Durable | Per message; longer needs re-queueing |
  | RabbitMQ delayed-message plugin | Any | Plugin keeps a Mnesia table; not replicated | Not for millions of long delays |
  | DB table + poller | Any | Durable, queryable, cancellable | The default for days/weeks |
  | EventBridge Scheduler / Temporal | Years | Managed / durable | Per-schedule cost; great for one-off reminders |

- **Design at scale:**
  1. `scheduled_jobs(id, tenant, due_at, status, payload, attempts)`, index `(status, due_at)`.
  2. Poller every few seconds: `SELECT … WHERE status='pending' AND due_at <= now() ORDER BY due_at LIMIT 500 FOR UPDATE SKIP LOCKED` → publish → mark `dispatched`.
  3. The worker that runs it is idempotent (re-checks the business condition, like "is the reminder still wanted?").
  4. Cancellation = update status; no need to find a message in a broker.
  5. Shard the table by `due_at` bucket or tenant when it's huge; a time-wheel in memory for sub-second precision.

**Sokrio example:**
- `[CODE]` Sokrio's delayed approvals use the Redis `:delayed` sorted set (`Order::approveAfter`, `app/Models/Order/Order.php:240-243`), up to 60 minutes (`SettingRequest.php:39,45`, `max:60`). Two problems:
  - **Durability:** no persistence config is known (A9), so a Redis restart loses every pending approval, and nothing sweeps for overdue orders (R12).
  - **Migration blocker:** SQS caps delays at 900 s, so 60-minute approvals can't move to SQS as-is (F22, R33). `SqsQueue::later` passes the delay straight through (`vendor/…/Queue/SqsQueue.php:138`).
- `[CODE]` What already saves it: the job is idempotent (`pending()` guard, `ApproveOrder.php:53`), so a sweeper can safely re-dispatch.
- `[INFERENCE]` The plan (T7 Top 5 #4, T6 §6.10 phase 6): add an `orders:approve-overdue` scheduler command that finds pending orders past their approval time and dispatches `ApproveOrder` (the DB-table pattern, with the order row as the table), then move the timer to EventBridge Scheduler → SQS when infra moves to AWS.

**Follow-up questions the interviewer may ask:**
- How do you schedule 100M reminders for the same second (e.g. midnight)? (Spread with jitter, or pre-dispatch in batches; the poller claims in chunks and the work queue absorbs the burst.)
- How precise is a DB poller? (Within the poll interval; fine for reminders, not for trading.)
- How do you cancel a delayed job in Laravel's Redis queue? (You can't easily; the job must check state when it runs. That's another reason for a DB table.)

**Common mistakes to avoid:**
- Using SQS delays for anything over 15 minutes.
- Keeping the only copy of a business deadline in a cache-grade Redis.
- A consumer that `sleep()`s on a Kafka partition until a message is due.

---

### Q75. You need to migrate from Laravel Redis queues to Kafka/RabbitMQ with zero downtime. What's your plan?

**Short answer (30 seconds):**
Don't migrate everything at once; migrate **queue by queue** with a switch per job class. Make jobs idempotent first, because during the cut-over the same job may exist on both sides. Add the new connection, deploy new workers alongside the old ones, then flip one low-risk queue to dispatch to the new broker. Keep old workers running until the old queue, `:delayed` and `:reserved` are all empty. Watch, then move the next queue. Rollback = flip the switch back; both sets of workers still run. And question the goal: for **jobs**, RabbitMQ or SQS is the natural target; Kafka is a poor job queue (08c Q49).

**Deep answer:**
1. **Inventory:** list every job, its queue, delay use, timeout, tries, and whether it's idempotent. Note special features: delayed jobs, unique jobs (they use the cache store), batches/chains, `afterCommit`.
2. **Prerequisites:**
   - Idempotency for every job that will run during the overlap.
   - A target that supports what you use: per-message delay and retry (RabbitMQ, SQS ≤ 15 min) vs Kafka (no delay, no per-message retry).
   - A Laravel driver for the target (community drivers for RabbitMQ/Kafka; first-party for SQS).
3. **Dual-run:** deploy workers for the new connection while old workers keep running. Dispatch routing by config: `onConnection(config("queue.routes.{$job}"))` or a dispatcher wrapper.
4. **Flip one queue:** start with something cheap and observable (e.g. feature-tracking flushes). New dispatches go to the new broker; old workers drain what's left.
5. **Drain check:** `LLEN queues:X` = 0, `ZCARD queues:X:delayed` = 0 (or wait out the longest delay), `ZCARD queues:X:reserved` = 0. Only then stop old workers for that queue.
6. **Repeat** queue by queue, in increasing risk order. Delayed jobs last (they need the longest drain and a durable delay story).
7. **Rollback:** the routing switch, per queue, at any time. Old workers stay installed until the end.
8. **Monitoring during the move:** both brokers' depth/age, job failure rate per connection, duplicate detection (idempotency table hits).

**Sokrio example:**
- `[CODE]` What makes it hard in Sokrio specifically:
  - **127 queued jobs**, of which 119 switch tenant in `handle()` (T5 §5.3); the payload format is Laravel's and any driver must keep it.
  - **Delayed approvals** up to 60 minutes: they must drain from Redis `:delayed` or be re-created on the new side. SQS can't hold them (F22); Kafka can't delay at all.
  - **Unique jobs** keep their locks in the cache store, not the queue, so they'd still need Redis (and the prefix split F12 applies).
  - Non-idempotent jobs: tracking writes (no unique key on `trackings`, MEMORY T2), anything sending SMS (`SmsDeliveryUnknownException`).
- `[INFERENCE]` My honest answer for Sokrio: the target for jobs would be **SQS** (or stay on Redis with a managed, split Redis), not Kafka, and follow T6 §6.10's phases: split Redis (queue `noeviction` vs cache), move delayed approvals to EventBridge Scheduler → SQS first (phase 6), then other queues one by one. Kafka stays for streams (tracking, departments).
- `[CODE]` A free lesson from `retry_after = 9000`: if a drain stalls because a worker died holding a reservation, the job reappears 2.5 h later. Lower `retry_after` on the old connection before the migration (Q65).

**Follow-up questions the interviewer may ask:**
- How do you make a job idempotent cheaply? (A unique `(job_type, business_key)` row inserted at the start; skip if it exists.)
- What about chained or batched jobs mid-flight? (Let them finish on the old side; switch routing only for new chains.)
- How do you prove nothing was lost? (Count dispatches vs completions per job class on both sides during the window.)

**Common mistakes to avoid:**
- A big-bang cut-over with a flag for "all jobs".
- Stopping old workers before `:delayed` and `:reserved` are empty.
- Moving jobs to Kafka and then rebuilding delay, retry and DLQ by hand.

---

## 8.12 Debugging & production incidents (Q76–Q81)

### Q76. Consumer lag on one partition is 2M messages while others are near 0. Walk through your investigation.

**Short answer (30 seconds):**
One lagging partition means the problem is tied to that partition, not the whole group. Four suspects: (1) a **hot key** sending far more data to that partition, (2) a **stuck or slow consumer** that owns it, (3) a **poison message** it keeps retrying, (4) a **slow downstream** for the data in that partition (one tenant's DB, one big customer). First check produce rate per partition, then which consumer owns it and whether its committed offset moves at all, then that consumer's logs at the stuck offset.

**Deep answer:**
1. `kafka-consumer-groups --describe --group G`: lag, committed offset, owner (consumer id/host) per partition. Run it twice a minute apart: **is the committed offset moving?**
   - Not moving → stuck consumer or poison message.
   - Moving, but lag still grows → that partition gets more data than one consumer can handle (hot key) or its downstream is slow.
2. **Hot key:** compare log-end-offset growth per partition. Sample messages (`kafka-console-consumer --partition N`) and count keys. Fix: better key (add an entity id), split the hot key with a suffix (losing per-key order), or a dedicated topic for the whale.
3. **Stuck consumer:** the owner's logs and metrics (CPU, GC, blocked on I/O). A rebalance loop shows as moving ownership.
4. **Poison message:** the same offset in error logs again and again. Fix: skip to DLQ, deploy a fix, replay.
5. **Slow downstream:** latency per tenant or per key in the handler; one tenant's DB on a slow host.
6. **Short-term relief:** more partitions don't help an existing hot key (it still hashes to one partition). Move the hot tenant to its own lane or speed up the handler.

**Sokrio example:**
- `[CODE]` Sokrio's quirk: **one process owns all three partitions** (numprocs=1, static id `""`), so "one partition lags" can't be "one bad consumer". It's data-side: key skew or slow handling for the tenants that hash there. Keys are `user_id` (tracking) and `department_id` (departments) through `crc32(key) % 3` (`phpkafka/Producer/Partitioner/DefaultPartitioner.php:48-53`), so a hot key = one very chatty user or a bulk update of departments that all land on one partition.
- `[CODE]` Poison messages **can't** block a partition here: malformed envelopes are logged and skipped (`KafkaConsumer.php:347-365`), and handlers catch `\Throwable` per tenant and fall back per point (`TrackingMessageHandler.php:57-70,125-158`). The flip side: those messages are dropped, not parked (no DLQ, R4).
- `[CODE]` The slow-downstream case is real: each tracking flush retries with sleeps (1 s + 2 s, `TrackingMessageHandler.php:85-116`) and then writes per point. If one tenant's DB is slow, flushes for batches containing that tenant slow down, and a flush over 30 s triggers eviction and replay (F9, R3), which makes lag *worse*.
- Runbook: R2 (hot partition), R4 (poison), R3 (rebalance) in 07a.

**Follow-up questions the interviewer may ask:**
- Would adding partitions help? (Not for an existing hot key, and it remaps keys, breaking per-key order during the change.)
- How do you alert on this? (Lag per partition, not just the group total; and "committed offset unchanged for N minutes".)
- How do you find the hot key without reading 2M messages? (Sample, or add a per-key counter metric at the producer.)

**Common mistakes to avoid:**
- Scaling the consumer group when one partition is the problem.
- Looking only at total group lag.
- Restarting the consumer before capturing the stuck offset and logs.

---

### Q77. Customers report receiving the same email 3 times. Where are the possible sources of duplication, and how do you fix it end to end?

**Short answer (30 seconds):**
Walk the pipeline from the trigger to the provider: (1) the **trigger** fired 3 times (double click, three listeners, the scheduler running on three servers); (2) the **producer** retried a publish that had succeeded; (3) the **consumer/worker** was redelivered the message (crash before ack, lease expiry, rebalance); (4) the **job retried** after the email was sent but a later step failed; (5) the **provider call** timed out after sending and was retried. Exactly 3 often matches a retry count (`tries = 3`) or three servers. The fix is one idempotency key per (event, recipient) checked right before the send, plus making retries safe.

**Deep answer:**
- **Find the layer first:** do the three emails have the same message id in your logs? Same job id/UUID? Different dispatch ids?
  - Three dispatches → trigger side (listeners, scheduler, double submit).
  - One dispatch, three attempts → worker retries (`attempts` in the payload or `failed_jobs`).
  - One attempt, three provider calls → client-side retry on timeout.
- **Fixes per layer:**
  - Trigger: idempotency key on the API; `onOneServer()` + `withoutOverlapping()` on scheduled tasks; one listener per event.
  - Broker: idempotent producer (Kafka `enable.idempotence`); consumers dedup on `event_id`.
  - Worker: `tries = 1` for side-effecting jobs **or** make each step idempotent; split "send" into its own job so later failures don't resend.
  - Provider: provider idempotency key if supported; on timeout, don't retry blindly.
- **The end-to-end fix:** a `sent_notifications(dedup_key UNIQUE)` row inserted **before** calling the provider (insert fails → already sent → skip). Accept that a crash between insert and send gives "at most once" for that one message, or record "sending" then "sent" and reconcile.

**Sokrio example:**
- `[CODE]` Sokrio has every one of these layers, so it's a good map:
  - **Scheduler:** no `onOneServer()` anywhere; safe only while exactly one box has `RUN_SCHEDULER=true` (`app/Console/Kernel.php:113-117`). Turn it on in two places and every scheduled email goes out twice.
  - **Worker retries:** `[HIST]` the worker ran `--tries=3`. A job that sends then throws later would resend up to 3 times. `SendApprovalNotificationJob` avoids that by catching per recipient and per channel (`:44-68`), so its retries don't resend.
  - **Lease expiry:** `$timeout = 0` jobs running past `retry_after` 9000 run twice (R13).
  - **Kafka replay:** a slow flush → eviction → the whole batch is replayed (F9); the consumer can't dedup because it drops `event_id` (`KafkaConsumer.php:360-364`).
  - **Provider timeout:** SMS already treats "connected but no answer" as `SmsDeliveryUnknownException`, not safe to retry (`app/Services/SMSSender.php:12-19`), and has no auto-retry. That's the right instinct for email too.
- Runbooks: R5 (duplicate processing), R13 (double run).

**Follow-up questions the interviewer may ask:**
- Can exactly-once Kafka fix this? (No; EOS covers Kafka-to-Kafka. The email is an external side effect, so you need dedup at the send.)
- Where do you store the dedup key, and for how long? (A DB table with a unique index; keep it longer than the longest possible retry or replay window.)
- How do you dedup if the provider has no idempotency key? (Your own table plus a reconciliation job using the provider's sent log.)

**Common mistakes to avoid:**
- Fixing only the layer you looked at first. Duplicates often come from two layers.
- Dedup in Redis with a short TTL and no persistence.
- Lowering `tries` to 1 everywhere instead of making the send step idempotent.

---

### Q78. Your consumer group is in an endless rebalance loop. What are the likely causes?

**Short answer (30 seconds):**
A member keeps leaving or being kicked, and each change triggers a rebalance that stops everyone. Usual causes: processing a batch takes longer than `max.poll.interval.ms` (too many records per poll, or a slow downstream); heartbeats missed beyond `session.timeout.ms` (GC pauses, a blocked thread, or a client that only heartbeats on poll); members crashing and restarting (OOM, Kubernetes liveness probes, Supervisor); a poison message that crashes the consumer on the same offset every time; or two members fighting over the same static `group.instance.id`.

**Deep answer:**
- **Diagnose:** broker logs (`Preparing to rebalance group … reason: …`), the member ids joining and leaving, consumer logs around the same timestamps, and processing time per batch.
- **Causes and fixes:**

  | Cause | Signal | Fix |
  |---|---|---|
  | Batch > `max.poll.interval.ms` | "leaving group because poll timeout" | Smaller `max.poll.records`, faster handler, or move slow work async |
  | Missed heartbeats | Session timeout in broker log | Background heartbeat client, longer `session.timeout.ms`, fix GC pauses |
  | Crash loop | Process restarts, new member ids | Fix the crash (OOM, poison message), add backoff before restart |
  | Liveness probe kills a busy pod | K8s events | Probe on "making progress", not on HTTP |
  | Static id conflict | `FENCED_INSTANCE_ID` | Unique `group.instance.id` per process |
  | Deploy churn | Rebalances at deploy time | Static membership + cooperative-sticky assignor |

- **Reduce the cost of each rebalance:** cooperative incremental rebalancing (`CooperativeStickyAssignor`, or the KIP-848 protocol `[GENERAL]` in Kafka 4.0) moves only the partitions that need to move.

**Sokrio example:**
- `[LIB]` The main Sokrio cause is **F9**: outside Swoole, phpkafka heartbeats only when it fetches (`KafkaUtil.php:45-53`, `Consumer.php:292-294`). A flush that takes longer than `session_timeout` 30 s (retries with sleeps, then per-point fallback for up to 200 points) gets the member evicted. The commit after the flush fails and is swallowed (`KafkaConsumer.php:329-335`), the consumer rejoins, gets the same batch, and if the slowness is persistent (a slow tenant DB) it loops. "Our effective poll budget is 30 s, not 5 minutes."
- `[CODE]` The second cause is **R22**: the static `group.instance.id = ""` (`KafkaConsumer.php:79-95`, D1). Run two processes (numprocs=2) and they fence each other in a ping-pong, which the code comment itself describes (`:92-94`).
- `[CODE]` Third: a crash loop. After 10 failed reconnects the consumer exits for Supervisor (`KafkaConsumer.php:371-393`), and Supervisor's default `startretries` is 3, after which the program is FATAL with no alert (T7). That turns a rebalance loop into a silent stop.
- `[CODE]` The planned 6 h recycle (`config/kafka.php:70`) would cause a rebalance every 6 h with dynamic membership; static membership avoids that, which is why it was chosen.
- Runbooks: R3, R22 (07a).

**Follow-up questions the interviewer may ask:**
- Why does static membership help deploys? (A restarting member with the same id gets its partitions back without a rebalance, if it returns within `session.timeout.ms`.)
- What's the difference between `session.timeout.ms` and `max.poll.interval.ms`? (Heartbeat liveness vs processing liveness; modern Java clients heartbeat on a background thread, so the second one is what slow handlers hit.)
- How would you fix F9 without changing the library? (Smaller flushes, shorter retry sleeps, a time budget per flush, or a Swoole runtime for timer-driven heartbeats.)

**Common mistakes to avoid:**
- Raising `max.poll.interval.ms` to an hour so a stuck consumer is never detected.
- Assuming every client heartbeats in the background.
- Restarting all consumers at once to "clear it", which causes another rebalance.

---

### Q79. Redis memory suddenly hits 100% and writes fail. What do you check?

**Short answer (30 seconds):**
First, `INFO memory` and `CONFIG GET maxmemory-policy`: with `noeviction` at the limit, writes fail with `OOM command not allowed`. Then find what grew: `redis-cli --bigkeys` / `--memkeys`, `MEMORY USAGE` on suspects, `INFO keyspace` for key counts per DB, keys with no TTL, unbounded lists or streams (no `MAXLEN`), client output buffers (`CLIENT LIST`, slow Pub/Sub subscribers or replicas), and fragmentation (`mem_fragmentation_ratio`). Short term: free memory safely (delete the culprit with `UNLINK`, raise `maxmemory` if the box has room). Long term: TTLs, caps, and separate instances for data with different eviction needs.

**Deep answer:**
- **Triage order:**
  1. `INFO memory`: `used_memory`, `used_memory_rss`, `maxmemory`, `mem_fragmentation_ratio`.
  2. `INFO keyspace`: which DB grew (keys and expires per DB).
  3. `--bigkeys` / `--memkeys` (sampled, safe on production) → `MEMORY USAGE key`.
  4. `INFO clients` + `CLIENT LIST`: big `omem` = output buffers (a slow subscriber, `MONITOR`, or a replica falling behind).
  5. `SLOWLOG GET`, `LATENCY DOCTOR`.
- **Common culprits:**
  - Cache keys without TTL (`rememberForever`, `SET` with no `EX`).
  - Queue backlog: workers down, jobs pile up in lists.
  - Unbounded lists/streams (`RPUSH` with no `LTRIM`, `XADD` with no `MAXLEN`).
  - Fragmentation after many deletes (`activedefrag yes`).
  - A fork for RDB/AOF rewrite doubling RSS under copy-on-write.
- **Recovery:** `UNLINK` (non-blocking) the obvious culprit, or start workers to drain a backlog; avoid `FLUSHDB` on a DB that holds queues. Change `maxmemory-policy` only if the instance is cache-only.

**Sokrio example:**
- `[CODE]` In Sokrio this is the worst-case Redis incident because **one instance holds everything**: queues (DB 0), cache (DB 1) and the Python benchmark cache (also DB 0, F20). `maxmemory` is per instance, so the eviction policy has to suit both queues and cache, and no single policy does (08c Q45, R11):
  - `noeviction` (A9, likely): writes fail → `dispatch()` throws inside HTTP requests and tracking falls back or returns 503.
  - `allkeys-lru`: Redis silently evicts queued jobs.
- `[CODE]` Things that are already capped: feature-tracking buffers (`RPUSH` + `LTRIM 5000` + `EXPIRE 1800`, `BufferFeatureUsageListener.php:16-46`). Things that aren't: 9 `rememberForever` keys, and any `:delayed`/queue backlog if workers stop.
- `[CODE]` The Kafka producer was hardened for exactly this (`37840a3b5`): a Redis OOM during topic provisioning must not break publishing (cache failures are caught, `TopicProvisioner.php:94-124`; test at `tests/Unit/Kafka/KafkaProducerTest.php:231`). That test is the evidence that the team has seen Redis OOM before.
- `[INFERENCE]` Prevention (T6 §6.10 phase 2): move the Python cache off DB 0, split queue and cache instances, alert at 80% memory (AL list in T6 §6.9).

**Follow-up questions the interviewer may ask:**
- Why can't you just `FLUSHALL`? (It deletes queued jobs and delayed approvals too.)
- `used_memory` is fine but RSS is huge; why? (Fragmentation or a fork in progress; check `mem_fragmentation_ratio` and `INFO persistence`.)
- What does `allkeys-lru` do to a Laravel queue? (Evicts list keys like any other key; jobs vanish with no error.)

**Common mistakes to avoid:**
- Running `KEYS *` on a full production instance to look around.
- Switching to an eviction policy on an instance that holds queues.
- Treating numbered DBs as separate memory budgets.

---

### Q80. RabbitMQ queue keeps growing and producers are being blocked. What do you check and how do you recover?

**Short answer (30 seconds):**
Producers are blocked by RabbitMQ's **flow control**: when a node passes its memory high watermark (default 40% of RAM) or disk free limit, it blocks all publishing connections until it recovers. The queue grows because consumers are slower than producers: too few consumers, a low prefetch, consumers stuck or crashing (messages redelivered and unacked), or a slow downstream. Check the management UI or `rabbitmqctl` for alarms, queue depth and rates, unacked counts and consumer counts. Recover by adding or fixing consumers first, then relieving memory (lazy / quorum queues page to disk), and protect the broker with `x-max-length` and a DLX for low-value traffic.

**Deep answer:**
- **Checks:**
  1. `rabbitmq-diagnostics alarms` / UI "Memory/Disk alarm".
  2. Per queue: ready vs unacked, publish rate vs ack rate, consumer count, consumer utilisation.
  3. Unacked high + acks low → consumers hold messages but don't finish (stuck, prefetch too high, a poison message being redelivered).
  4. Consumer count 0 → consumers crashed or lost their connection.
  5. Node memory breakdown (`rabbitmq-diagnostics memory_breakdown`): queue processes, connections, binaries.
- **Recovery:**
  - Scale consumers; fix the crash; tune prefetch (e.g. 10–50).
  - Move a poison message out (reject without requeue → DLX).
  - If memory is the issue: quorum queues (or classic v2 / lazy) keep most messages on disk.
  - Shed load: `x-max-length` with `overflow=reject-publish` (backpressure to the producer) or `drop-head` (lossy, for telemetry).
  - As a last resort, raise the watermark temporarily if the host has RAM.
- **Prevention:** alerts on queue depth and message age, publisher confirms so producers notice, and producers that handle "blocked" with a timeout and fallback instead of hanging HTTP requests.

**Sokrio example:**
- `[CODE]` Sokrio **doesn't run RabbitMQ** (search re-run on `d14c0ebb2`, T3), so this runbook is "not applicable" (R19). The same failure exists on its Redis queues, which is the useful part of the answer:

  | RabbitMQ | Sokrio's Redis equivalent |
  |---|---|
  | Memory alarm blocks publishers | `maxmemory` + `noeviction` → `RPUSH` fails → `dispatch()` throws in the request (Q79) |
  | Unacked messages | `queues:X:reserved` (leased jobs) |
  | Consumer count 0 | No worker for a queue (workers for `summary`/`order-approved`/`sequential` are undocumented, A10) |
  | Queue depth alert | Missing: no queue age or depth alert (T6 §6.9) |
  | Producer fallback | Tracking has one: publish → direct MySQL write → 503 + Retry-After (`TrackingController.php:62-83`) |

- `[INFERENCE]` The Laravel-side check would be `LLEN queues:X`, `ZCARD queues:X:reserved`, `ZCARD queues:X:delayed`, plus `queue:monitor` (exists in Laravel 9, unused, F22 notes).

**Follow-up questions the interviewer may ask:**
- What's the difference between `reject-publish` and `drop-head`? (Backpressure to the publisher vs silently dropping the oldest messages.)
- Why can a high prefetch make it worse? (One slow consumer hoards thousands of unacked messages that others could process.)
- Quorum vs classic queues under memory pressure? (Quorum queues keep messages on disk and only a small in-memory window; classic v2 also pages well.)

**Common mistakes to avoid:**
- Purging the queue before you know whether the messages matter.
- Restarting the broker to clear the alarm; the backlog is still there afterwards.
- Producers with no timeout on a blocked connection, which turns a broker problem into an API outage.

---

### Q81. A broker in your 3-node Kafka cluster died. What happens to producers with `acks=1` vs `acks=all`? What happens when it comes back?

**Short answer (30 seconds):**
For partitions it led, the controller elects a new leader from the **ISR** within seconds; producers get `NOT_LEADER` errors, refresh metadata and retry to the new leader. With **`acks=1`**, any writes the dead leader had acknowledged but not yet copied to a follower are **lost**. With **`acks=all`** and `min.insync.replicas=2` (RF=3), no acknowledged write is lost; writes keep working as long as 2 replicas are in sync, and fail with `NotEnoughReplicas` if the ISR drops below 2. When the broker returns, it truncates its log to the high watermark, catches up from the leaders as a follower, rejoins the ISR, and leadership can move back (preferred leader election).

**Deep answer:**
- **During the outage:**
  - Leader election from ISR (unclean election off by default since Kafka 0.11).
  - Producers: retriable errors, metadata refresh, retries; with `enable.idempotence=true` retries don't create duplicates.
  - Consumers: partitions keep being served by the new leaders; brief pause. Group coordinator moves if the dead broker was coordinator.
  - Under-replicated partitions alert (`UnderReplicatedPartitions` > 0).
- **`acks=1` loss case:** leader acks record N → dies before followers fetched N → follower becomes leader without N → N is gone, and the producer believed it was written.
- **`acks=all` edge:** only replicas in the ISR need to ack, so `min.insync.replicas` is what turns "all" into a real guarantee. RF=3 / minISR=2 survives one broker loss for writes.
- **When it comes back:**
  1. Recovers its log (may scan segments after an unclean shutdown).
  2. Truncates to the high watermark (or leader epoch) to drop records that were never committed.
  3. Fetches from current leaders until caught up → rejoins ISR.
  4. `auto.leader.rebalance.enable` moves leadership back to preferred replicas.
- **If its disk is lost:** it re-replicates everything from leaders. That's network-heavy; throttle with replication quotas.

**Sokrio example:**
- `[ASSUMPTION]` Sokrio isn't in this scenario: it runs a **single broker** with RF=1 topics (`config/kafka.php:74-75`, A3/A4). Losing that broker means the partitions have no leader at all: no failover, writes fail until it returns, and if its disk is lost, the data is gone (R1, R21).
- `[CODE]` And the producer is `acks=0` (F5), worse than `acks=1`: it doesn't wait for even the leader, so broker-side rejections are silent (`phpkafka/Producer/Producer.php:159-163`). What happens on an outage, per path:
  - **Tracking:** publish fails at the socket → falls back to a direct MySQL write → 503 + Retry-After 5 if that also fails (`TrackingController.php:62-83`, D9).
  - **Departments:** no fallback; the event is lost and Mongo drifts until someone runs the manual resync (R25, F1).
  - **Consumers:** reconnect with backoff, exit after 10 failures for Supervisor (`KafkaConsumer.php:155-190,371-393`).
- `[CODE]` When it comes back: consumers resume from the committed offset. If the broker's data was lost or retention passed, the committed offset is out of range and the library jumps to `latest − 1` (F6, R27): the gap is skipped silently.
- `[INFERENCE]` The fix order is code first (`setAcks(1)` now, `-1` with replicas later), then infra (RF=3, minISR=2), because replicas don't help a producer that doesn't wait (T6 §6.12).

**Follow-up questions the interviewer may ask:**
- What if 2 of 3 brokers die with minISR=2? (Writes with `acks=all` fail; reads still work from the remaining leader; enabling unclean election would trade loss for availability.)
- What is the high watermark? (The highest offset copied to all ISR members; consumers can only read up to it.)
- How long does leader failover take? (Seconds with KRaft, typically; dominated by detection, i.e. `broker.session.timeout.ms`.)

**Common mistakes to avoid:**
- Saying `acks=all` alone prevents loss. Without `min.insync.replicas ≥ 2` the ISR can shrink to just the leader.
- Forgetting that a restarted broker truncates its log.
- Assuming consumers notice lost data. Lost records simply aren't there; only the producer side (or a reconciliation) can tell.

---

### ✅ Quality check
- [x] All 24 questions (Q58–Q81) answered with the exact 5 renderer labels from `README_2.md:227-231`
- [x] Pattern answers say plainly what Sokrio doesn't have (no saga, no event sourcing, no CDC, no RabbitMQ) and point at the small versions it does have (delayed approvals with the `pending()` guard, Mongo summaries as an idempotent read model, the department ECST projection)
- [x] Laravel answers cite vendored Laravel 9.52.22 lines read only (`RedisQueue.php:153/193/224/244/275/305/321`, `Worker.php:128/206/295/339-352/653-681`) and reuse T4/T5 refs (`retry_after` 9000, `$timeout = 0` jobs, ignored `$retry_after`, the afterCommit site table, F9, R22)
- [x] Every design answer (Q69–Q75) follows requirements → API/events → topics/queues → key → failure → scaling → monitoring, and marks Sokrio-specific proposals `[INFERENCE]`
- [x] Incident answers map to runbooks (R1–R5, R11–R13, R19, R21–R22, R25, R27) and reuse F5, F6, F9, F20, D9
- [x] Version-dependent facts tagged `[GENERAL]` (KIP-932, KIP-848, classic mirrored queues removed in 4.0, unclean election default)
- [x] `### Q<n>.` headings kept for the T11 renderer; no literal bold labels in this list
- [x] No secrets: env var names only, no hosts or IPs
