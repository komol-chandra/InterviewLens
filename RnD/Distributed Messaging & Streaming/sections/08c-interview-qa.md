# 08c · Interview Q&A — Redis, Comparisons, Stream Processing (Q38–Q57)

> **Snapshot:** `sokrio-server` @ `master` · HEAD `d14c0ebb2` · written 2026-10-26.
> Paths are relative to `sokrio-server/`. Framework paths are shortened to `vendor/…/X` = `vendor/laravel/framework/src/Illuminate/X` (Laravel 9.52.22).
> Tags: `[CODE]` verified in app code · `[LIB]` verified in vendored code · `[GENERAL]` industry knowledge · `[INFERENCE]` reasoned, needs a lab · `[ASSUMPTION]` best guess plus how to verify.
> Questions come from `../interview-questions.md` §6–§8 (wording unchanged). Sokrio examples reuse facts from sections 00–07. Finding ids (F1–F24), conflicts (D1–D20), assumptions (A1–A11) and runbooks (R1–R35) point back to those sections.

**How to use this file:** Q38–Q47 are Redis, and this is where Sokrio is richest: Redis does seven jobs there (T4 §4.11), so every textbook answer has a real story attached. Q48–Q50 are the "which broker" questions; answer with a decision framework and use Sokrio's actual split (Kafka for streams, Redis for jobs, no RabbitMQ) as the worked example. Q51–Q57 are stream processing, which Sokrio **does not do**: it runs hourly batch summaries. Say that plainly, then show what the streaming version would look like and what would have to change first.

---

## 8.6 Redis — cache, pub/sub, streams, locks (Q38–Q47)

### Q38. Why is Redis fast even though it is (mostly) single-threaded?

**Short answer (30 seconds):**
Everything lives in memory, so a command is a few hundred nanoseconds of CPU, not a disk seek. One thread runs commands from an event loop (epoll/kqueue), so there are no locks, no context switches between workers, and every command is atomic for free. The data structures are tuned for memory (listpacks, intsets, skiplists). Since Redis 6, optional I/O threads handle socket reads and writes, but command execution is still one thread. The bottleneck is usually the network or one slow command, not the CPU.

**Deep answer:**
- **Why single-threaded works:** a typical command is O(1) or O(log n) on in-memory structures. At that cost, the overhead of locking would be bigger than the work. One thread also gives you serializability: a `MULTI`/`EXEC` block or a Lua script runs with nobody else in between.
- **I/O multiplexing:** one thread watches thousands of sockets with epoll and handles whichever is ready. Pipelining amortizes round trips (many commands per network packet).
- **What isn't single-threaded:** RDB snapshots and AOF rewrites run in a `fork()`ed child, `UNLINK`/lazy-free runs on background threads, and Redis 6+ I/O threads parse requests and write replies.
- **The flip side:** one slow command blocks **every** client. `KEYS *` on a big keyspace, `LRANGE 0 -1` on a huge list, `DEL` on a million-member set, or a long Lua script all freeze the server. Use `SCAN`, ranges in chunks, `UNLINK`, and short scripts. `SLOWLOG GET` shows the culprits.
- **Scaling out:** more CPU means more instances (Cluster, Q46), not more threads. `[GENERAL]` Forks like KeyDB and Dragonfly are multi-threaded; Valkey 8 widened I/O threading. Mention them only as "options exist".

**Sokrio example:**
- `[LIB]` Laravel's Redis queue depends on the single-threaded guarantee. `pop` is a Lua script that moves a job from the list to the `:reserved` sorted set and bumps its attempt count atomically (`vendor/…/Queue/RedisQueue.php:275-286`). Two workers can never pop the same job, and no lock is needed, because nothing else runs while the script runs.
- `[CODE]` The team already avoids the classic blocker: the feature-tracking flusher iterates keys with `SCAN … COUNT 50`, not `KEYS` (`app/Jobs/Analytics/FlushFeatureEventsJob.php:68`), and reads buffers in chunks of 500 (§4.7). (That `SCAN` call has its own bug under phpredis, F14 / R30.)
- `[CODE]` One instance serves queues (DB 0), cache (DB 1, `config/database.php:202-219`) and the Python benchmark cache (also DB 0, F20). Numbered databases share **one thread**. A slow command from the Python side delays job pops in Laravel. Separate instances are the only real isolation (T6 §6.12).

**Follow-up questions the interviewer may ask:**
- If it's single-threaded, how does it use a 16-core box? (Run several instances or Cluster shards; I/O threads help only with network-heavy loads.)
- What happens during `BGSAVE` on a box with little free RAM? (Copy-on-write can double memory for write-heavy loads. The fork itself can pause big instances for milliseconds to seconds.)
- Why is a Lua script atomic, and what's the risk? (It runs on the one thread. A slow script blocks everyone; `lua-time-limit` / `busy-reply-threshold` only lets you kill it, not preempt it.)

**Common mistakes to avoid:**
- Saying "Redis is single-threaded" as if nothing runs in the background. Persistence and lazy-free don't.
- Treating numbered databases as isolation. They share memory, CPU and `maxmemory`.
- Forgetting network round trips. Without pipelining, a loop of 10 000 `GET`s is slow because of latency, not Redis.

---

### Q39. RDB vs AOF persistence. What can you lose in each? What does `appendfsync everysec` mean?

**Short answer (30 seconds):**
RDB is a point-in-time snapshot written by a forked child on a schedule ("save after 60 s if 10 000 keys changed"). It restarts fast and is compact, but you lose everything since the last snapshot, often minutes. AOF logs every write command. With `appendfsync everysec`, Redis calls `fsync` once a second from a background thread, so a crash loses about **one second** of writes (up to two in the worst case). `always` fsyncs every write (safest, slowest) and `no` leaves it to the OS (about 30 s). Production usually runs AOF `everysec`, often with RDB as well for backups.

**Deep answer:**
- **RDB:**
  - Pros: compact file, fast restart, easy to ship off-box for backups.
  - Cons: the loss window is the gap between snapshots. `fork()` on a large dataset costs memory (copy-on-write) and can pause the server.
- **AOF:**
  - Appends every write. It grows, so Redis rewrites it in the background (`BGREWRITEAOF`, auto-triggered by size).
  - Redis 7 uses a multi-part AOF (a base file plus incremental files) instead of one ever-growing file.
  - `aof-use-rdb-preamble yes` (the default since 5): the rewritten base is an RDB snapshot, and the tail is commands. You get a fast load and a small loss window.
- **The three fsync policies:**

  | `appendfsync` | Loss on a power cut | Cost |
  |---|---|---|
  | `always` | ~0 (each write is fsynced before the reply) | Much slower, bounded by disk latency |
  | `everysec` | ~1 s (≤ 2 s if the disk stalls) | The usual choice |
  | `no` | Whatever the OS hadn't flushed (~30 s on Linux) | Fastest |

- **Replication isn't persistence:** replicas are asynchronous. A primary that crashes before replicating loses writes even with AOF on the replica. `WAIT n ms` lets a client wait for replicas when it matters.
- **Restart with neither:** an empty dataset. That's fine for a pure cache and a disaster for a queue.

**Sokrio example:**
- `[ASSUMPTION]` (A9) The prod Redis config is unknown: there's no `redis.conf`, `appendonly` or `maxmemory` anywhere in the monorepo. `[HIST]` The deleted prod compose ran `redis:alpine` with a `./data/redis` volume (T6 §6.2). `[GENERAL]` A stock image with no config file keeps the default RDB save points and AOF off, so the likely loss window on a crash is "since the last snapshot".
- `[CODE]` What that window costs (T4 §4.9, R12):
  - Ready jobs in `queues:*` are lost. Summaries heal on the next hourly run because they're idempotent upserts (`app/Models/MongoDB/SummariesQuery.php:229-238`).
  - **Delayed order approvals in `queues:*:delayed` are lost for good.** The orders stay pending, and nothing sweeps them (`Order::approveAfter`, `app/Models/Order/Order.php:240-243`).
  - Jobs in `:reserved` aren't retried, and an export can leave the global lane stuck (F24 / R34).
- Recommendation (T4 §4.10 #6): a queue+locks instance with AOF `everysec` and `noeviction`; a cache instance with no persistence and `allkeys-lru`.

**Follow-up questions the interviewer may ask:**
- Does AOF `everysec` make Redis as durable as a database? (No: one second of loss, async replication, and no multi-key transactions with rollback. Fine for queues if the producer can tolerate a small loss or a sweeper repairs it.)
- What happens if the AOF is truncated by a crash? (Redis can load it while ignoring a truncated tail, `aof-load-truncated yes`; for corruption, run `redis-check-aof --fix`.)
- How would you back up Redis? (Copy RDB snapshots off-box on a schedule; on ElastiCache, use automatic snapshots.)

**Common mistakes to avoid:**
- Saying "`everysec` means at most one second of loss, always". A stalled disk can stretch it to two seconds, and async replication can lose more on failover.
- Running AOF `always` "to be safe" on a busy queue without measuring latency.
- Forgetting that the delayed sorted set is data, too. Delayed jobs are often the most valuable thing in a Laravel Redis.

---

### Q40. Redis Pub/Sub vs Redis Streams vs Redis List (`LPUSH`/`BRPOP`) as a queue. Compare them.

**Short answer (30 seconds):**
Pub/Sub is fire-and-forget broadcast: no storage, so a subscriber that is offline or slow simply misses messages. A List is a simple work queue: `LPUSH` + `BRPOP` gives each message to one worker, but a worker that crashes after `BRPOP` loses it unless you use the reliable pattern (`BLMOVE` into a processing list). Streams are an append-only log with IDs, consumer groups, per-message acks, a pending list and claim/retry. Use Pub/Sub for live notifications, Lists for simple jobs, and Streams when you need acks, replay or several consumer groups.

**Deep answer:**

| | Pub/Sub | List | Stream |
|---|---|---|---|
| Storage | None | Until popped | Until trimmed (`MAXLEN` / `MINID`) |
| Delivery | Every subscriber connected *now* | One consumer per message | One consumer per group; many groups |
| Ack / retry | No | Only with `BLMOVE` + your own cleanup | `XACK`, PEL, `XAUTOCLAIM` |
| Replay | No | No | Yes (read from any ID) |
| Ordering | Per channel, per connection | FIFO | By ID |
| Persistence | No | RDB/AOF | RDB/AOF |
| Slow consumer | Disconnected when its output buffer overflows (`client-output-buffer-limit pubsub`) | Backlog grows | Backlog grows; trim policy decides |

- **Reliable list queue:** `BLMOVE src processing RIGHT LEFT` atomically moves the item into a per-worker processing list. On success, `LREM` it; a reaper moves items from dead workers' lists back. You are building acks by hand.
- **Sharded Pub/Sub** (`SSUBSCRIBE`, Redis 7) scales Pub/Sub in Cluster mode but is still fire-and-forget.
- **Keyspace notifications** are Pub/Sub too, so they're lossy. Don't build correctness on them.

**Sokrio example:**
- `[LIB]` Laravel's Redis queue is the **reliable List pattern, done properly**. Ready jobs are a List, in-flight jobs move to a `:reserved` sorted set scored by "lease expires at" (`RedisQueue.php:275-286`), and expired reservations migrate back (`:244-249`). Delete = ack (`:305`), release = nack with delay (`:321`). The `retry_after` lease (9000 s, `config/queue.php:65`) plays the role of the reaper (08b Q31).
- `[CODE]` The feature-tracking buffer is a hand-built List queue: `RPUSH` + `LTRIM -5000` + `EXPIRE 1800` (`BufferFeatureUsageListener.php:16-46`), claimed with an atomic `RENAME buffer → flushing` and re-drained if orphaned (`FlushFeatureEventsJob.php:49-51,87-95`). That's a whole-list claim instead of per-message acks: at-least-once, and duplicates are accepted for analytics (T4 §4.7).
- `[CODE]` **No Pub/Sub anywhere.** Realtime UI goes through Pusher (`config/broadcasting.php:33-41`). The `redis` broadcaster is configured but unused (T4 §4.8). That's the right call: browser notifications need a WebSocket server, and Pub/Sub alone would lose messages for disconnected tabs anyway.

**Follow-up questions the interviewer may ask:**
- Why not use Pub/Sub for job dispatch? (No storage: a worker restart loses jobs. No load balancing: every subscriber gets every message.)
- What's the downside of `BRPOP` with many queues? (It checks keys in order, so the first queue can starve the rest. Laravel's `--queue=a,b` has the same priority behaviour.)
- When would you pick Streams over a Laravel Redis queue? (Several independent readers of the same events, replay, or per-message acks with visible pending state.)

**Common mistakes to avoid:**
- Calling Pub/Sub "a lightweight Kafka". It keeps nothing.
- Using `BRPOP` alone and claiming at-least-once delivery. A crash between pop and done loses the message.
- Forgetting to trim a Stream. It grows until `maxmemory`.

---

### Q41. Explain Redis Streams consumer groups: `XADD`, `XREADGROUP`, `XACK`, `XPENDING`, `XAUTOCLAIM`. How do you recover messages from a dead consumer?

**Short answer (30 seconds):**
`XADD` appends an entry with a time-based ID. A consumer group has a `last-delivered-id`. `XREADGROUP GROUP g c > ` hands each consumer new entries and records them in the group's **Pending Entries List (PEL)** with an owner, a delivery count and an idle time. `XACK` removes an entry from the PEL. When a consumer dies, its entries stay pending. Another consumer runs `XAUTOCLAIM` with a minimum idle time to take them over and process them again. Entries whose delivery count is too high go to a dead-letter stream.

**Deep answer:**
- **Lifecycle:**
  1. `XADD events MAXLEN ~ 100000 * field value` appends and trims approximately (cheap).
  2. `XGROUP CREATE events g $ MKSTREAM` creates the group at the tail (`0` = from the start, like a replay).
  3. `XREADGROUP GROUP g c1 COUNT 100 BLOCK 5000 STREAMS events >` reads new entries. With an ID instead of `>`, it re-reads *your own* pending entries, which is what a consumer does on restart before taking new work.
  4. `XACK events g <id…>` after the work is durably done.
  5. `XPENDING events g` gives a summary; `XPENDING events g - + 10` lists entries with owner, idle ms and delivery count.
  6. `XAUTOCLAIM events g c2 60000 0-0 COUNT 100` (Redis 6.2+) claims entries idle > 60 s from anyone and returns them to `c2`. `XCLAIM` does the same for specific IDs.
- **Dead-consumer recovery, step by step:**
  - On start, every consumer first drains its own PEL (`XREADGROUP … 0`).
  - A periodic reaper (or every consumer, between reads) runs `XAUTOCLAIM` with a min-idle time longer than the slowest normal processing.
  - If the delivery count goes past N, `XADD` the entry to `events:dlq` and `XACK` the original. That's your poison-message path.
  - `XGROUP DELCONSUMER` cleans up names of consumers that are gone for good (only after their PEL is empty or claimed).
- **Semantics:** at-least-once. A slow consumer whose entry gets claimed may finish too, so handlers must be idempotent (key on the stream ID).
- **Trimming vs pending:** `MAXLEN` can trim entries that are still pending. `XAUTOCLAIM` (Redis 7) then reports them as deleted. Size the cap for the backlog you must survive.
- **Ordering:** there are no partitions. Inside a group, entries are spread across consumers, so per-key order isn't kept. For per-key order, shard into several streams by key hash yourself.

**Sokrio example:** `[INFERENCE]` The feature-tracking buffer (T4 §4.7) is the natural Streams candidate. Today it's a List per tenant with a whole-list `RENAME` claim. As a Stream:
```php
// listener (replaces RPUSH + LTRIM + EXPIRE)
Redis::xAdd("ft:{$tenant}", '*', ['e' => json_encode($event)], 5000, true); // MAXLEN ~ 5000
// flusher (replaces SCAN + RENAME + LRANGE + DEL)
$batch = Redis::xReadGroup('flush', $worker, ["ft:{$tenant}" => '>'], 500, 5000);
insertIntoMongo($batch);                       // idempotent on the stream id
Redis::xAck("ft:{$tenant}", 'flush', array_keys($batch["ft:{$tenant}"]));
// reaper: XAUTOCLAIM ft:{tenant} flush $worker 300000 0-0 COUNT 500
```
- What you gain: per-entry acks instead of all-or-nothing, a visible PEL to alert on, and no need for the orphaned-`flushing:*` re-drain.
- `[GENERAL]` Laravel 9 has no Streams queue driver, so this would be raw `Redis::` calls. The phpredis and predis method signatures differ, which is exactly how F14 happened. Wrap the calls in one class with a test that runs on **both** clients.

**Follow-up questions the interviewer may ask:**
- How do you choose the min-idle time for `XAUTOCLAIM`? (Above your p99 processing time, or you'll steal from live consumers and double-process.)
- How do you get exactly-once with Streams? (You don't. Make the handler idempotent: write with the stream ID as a unique key, or do the work and the `XACK` in one Lua script when the side effect is in Redis too.)
- How is this different from a Kafka consumer group? (Kafka assigns partitions and tracks one offset per partition. Streams tracks every message in the PEL, so there's no head-of-line blocking, but no per-key ordering either.)

**Common mistakes to avoid:**
- Reading with `>` on restart and never checking your own pending entries. They sit in the PEL until someone claims them.
- Acking before the side effect is durable. That turns at-least-once into at-most-once.
- Retrying a poison entry forever. Use the delivery count and a DLQ stream.

---

### Q42. Cache problems: explain cache penetration, cache breakdown (hot key expiry / stampede), and cache avalanche. Give a fix for each.

**Short answer (30 seconds):**
**Penetration:** requests for keys that don't exist anywhere, so every one misses the cache and hits the DB. Fix: cache the "not found" result for a short TTL, and put a Bloom filter or input validation in front. **Breakdown / stampede:** one hot key expires and hundreds of requests rebuild it at once. Fix: a mutex so only one request rebuilds (single-flight), early refresh before expiry, or a logical expiry that serves stale data while one worker refreshes. **Avalanche:** many keys expire at the same time, or the cache itself goes down, and the whole load lands on the DB. Fix: add jitter to TTLs, keep a local in-process cache layer, run the cache with HA, and rate-limit or degrade gracefully.

**Deep answer:**
- **Penetration:**
  - Cache a sentinel (`"__none__"`) for 30–300 s. A real value written later must delete it.
  - Bloom filter of valid IDs (RedisBloom `BF.EXISTS`, or a bitmap): false positives fall through to the DB, but there are no false negatives.
  - Validate input shape before you even look (IDs must be numeric, domains must match a pattern).
- **Breakdown (single hot key):**
  - Mutex: `SET lock:key NX PX 10000`. The winner recomputes; the others wait briefly and then re-read the cache (double-checked). Losers can also serve stale data.
  - Probabilistic early refresh ("XFetch"): refresh with increasing probability as expiry nears, so one request refreshes early and nobody sees a miss.
  - Logical expiry: store `{value, soft_expires_at}` with a long real TTL; a stale read triggers one background refresh.
- **Avalanche (many keys or the whole cache):**
  - TTL jitter: `ttl = base + random(0, base * 0.1)`.
  - Warm-up after deploy or restart; stagger scheduled cache rebuilds.
  - A circuit breaker or bulkhead on the DB, plus a cheap fallback (stale data or a "try again" response).
  - HA for the cache tier (replica + failover) and a small in-process L1 cache.

**Sokrio example:**
- **Breakdown, done right:** `[CODE]` `MatrixAggregator` checks the cache, takes `lock:{key}` (90 s), waits up to 60 s, then calls `Cache::remember` again inside the lock. The query is capped at 60 s so it finishes before the lease expires (`app/Services/Report/ProductGeographyMatrix/MatrixAggregator.php:162-174`, `:26-27`). Its versioned key means invalidation is a counter bump, not a `DEL`. It's the **only** stampede guard among ~192 `remember()` calls (T4 §4.4, R16).
- **Penetration, a framework detail:** `[LIB]` Laravel's `Cache::remember` treats `null` as a miss and never stores it (`vendor/…/Cache/Repository.php:386-397`, the `is_null` check at `:393`). So any `remember()` whose closure returns `null` (an unknown domain, a deleted record) hits the database on **every** request. `[INFERENCE]` That applies to the tenant lookups (`Org::findByDomain`, `app/Models/Core/Org.php:51-80`) for unknown domains. Fix: cache a sentinel such as `false` and translate it back.
- **Avalanche:** `[CODE]` TTLs are fixed constants (for example 3600 s in `ReportCacheMacro`, 10 080 s for Org lookups, D12), with no jitter. A deploy that flushes the cache, or a Redis restart (R12), makes every report cold at once. A Redis outage is partly handled: Org lookups fall back to the DB (`Org.php:51-80`), so tenant resolution survives.

**Follow-up questions the interviewer may ask:**
- What should waiters do while the mutex holder rebuilds? (Wait with a bounded timeout and re-read, serve stale, or return a "computing" status. MatrixAggregator waits up to 60 s.)
- How do you invalidate without a stampede? (Versioned keys, or write the new value before deleting the old one.)
- Is a Bloom filter worth it for a small table? (Usually not. Caching the null is simpler.)

**Common mistakes to avoid:**
- Using the same TTL for everything written in one batch job.
- A lock TTL shorter than the rebuild time. The lock expires and the stampede happens anyway.
- Caching `null` forever. A record created later stays invisible.

---

### Q43. Cache-aside vs write-through vs write-behind. How do you keep cache and DB consistent?

**Short answer (30 seconds):**
**Cache-aside:** the app reads the cache, on a miss reads the DB and fills the cache, and on a write updates the DB then **deletes** the cache key. **Write-through:** the app writes to the cache, and the cache (or a layer) writes to the DB synchronously, so the cache is always populated. **Write-behind:** writes go to the cache and are flushed to the DB later in batches. It's fast, but a crash loses unflushed writes. For consistency the usual answer is "update the DB, then delete the cache", with short TTLs as a safety net. A delayed second delete, or CDC-driven invalidation, closes the remaining race.

**Deep answer:**
- **Why delete, not update:** two concurrent writers can update the DB in order A, B but write the cache in order B, A, leaving the cache stale forever. A delete makes the next reader load fresh data.
- **The remaining race (cache-aside):**
  1. Reader misses and reads the **old** value from the DB.
  2. Writer updates the DB and deletes the key.
  3. Reader writes the old value into the cache. It's stale until the TTL.
  - Fixes: a **delayed double delete** (delete again ~1 s later); version or timestamp checks on fill; or CDC (Debezium reads the binlog and deletes keys after commit) so invalidation can't be skipped by a code path.
- **Delete after commit:** deleting inside the transaction lets a reader refill the cache from the pre-commit row. Delete in an after-commit hook.
- **Write-through:** good when reads must never miss (sessions, counters). It costs write latency and caches data nobody reads.
- **Write-behind:** good for high write rates where some loss is fine (analytics, counters). It needs a durable buffer or an accepted loss window, plus idempotent flushes.
- **Consistency levels to name:** "eventually consistent within TTL" is the honest default. Strong consistency needs the cache inside the transaction, which defeats the purpose.

**Sokrio example:**
- **Cache-aside everywhere:** `[CODE]` about 192 `Cache::remember` calls and 9 `rememberForever` keys that rely on explicit `forget` (T4 §4.4).
- **Invalidation can miss (F12):** `[CODE]` `Org::updated` forgets only the key in the current namespace (`app/Models/Core/Org.php:45-48`). The same org is cached under three namespaces (web tenant prefix, bare prefix, `org_by_id`). A deactivated tenant can keep passing `EnsureTenantAccess` for up to ~2.8 h (R35). That's the "two copies, one invalidation" bug in a real system.
- **Versioned keys instead of deletes:** `[CODE]` MatrixAggregator's `pgm:agg:v3:{db}:t{version}:…` keys: bump the version and the old entries just age out.
- **Write-behind:** `[CODE]` the feature-tracking buffer: events go to Redis and are flushed to Mongo in batches (§4.7). Its accepted loss window is "≤ 30 min of analytics, ≤ 5000 per tenant".
- **Not a cache:** the Mongo summary collections are **materialized views** rebuilt from MySQL (hourly and daily) with idempotent upserts. Consistency comes from recomputation, not invalidation (T1 B3).

**Follow-up questions the interviewer may ask:**
- Would you update the cache from a Kafka event instead of deleting it? (Only if events are ordered per key and carry a version, so the consumer can drop older ones. Otherwise delete.)
- How do you invalidate across services? (Publish an invalidation event, or have each service consume CDC. Keep TTLs as the backstop.)
- Why not just use very short TTLs? (Hit rate and DB load. TTLs bound staleness; they don't remove it.)

**Common mistakes to avoid:**
- "Update the cache, then the DB." A DB failure leaves the cache wrong.
- Forgetting that the cache key namespace must match between writer and reader (the F12 lesson).
- Promising strong consistency from cache-aside.

---

### Q44. How do you implement a distributed lock in Redis? What is wrong with a naive `SETNX` + `EXPIRE`? What is Redlock and why is it controversial?

**Short answer (30 seconds):**
`SET lock:key <random-token> NX PX 30000` in one command: acquire only if absent, with an expiry, and with a unique value that proves who owns it. Release with a Lua script that deletes only if the value still matches, so you never delete someone else's lock. Naive `SETNX` then `EXPIRE` is two commands: a crash between them leaves a lock that never expires. Redlock acquires the lock on a majority of N independent Redis nodes. It's controversial because no lease-based lock is safe against GC pauses, network delays or clock jumps: the holder can still be working after the lease expires. Martin Kleppmann's answer is **fencing tokens** checked by the resource itself.

**Deep answer:**
- **Correct single-instance lock:**
  ```
  SET lock:{k} {token} NX PX 30000                       -- acquire
  if redis.call('get', KEYS[1]) == ARGV[1] then          -- release (Lua)
      return redis.call('del', KEYS[1]) end return 0
  ```
- **Why the token matters:** client A's lease expires, B acquires, then A finishes and runs `DEL`. Without the compare, A deletes B's lock.
- **Lease problems that no Redis algorithm fixes:**
  - The holder pauses (GC, a stop-the-world, a slow disk, a VM migration) past the TTL and then writes anyway.
  - Async replication: the primary grants a lock, crashes before replicating, the replica is promoted, and a second client gets the same lock.
  - Clock jumps on the Redis server can expire keys early.
- **Redlock:** acquire on ≥ N/2+1 of N independent masters within a time budget, with validity = TTL − elapsed − drift. It addresses failover, not pauses.
- **The debate:**
  - Kleppmann: for **correctness** locks, Redlock depends on timing assumptions, so use fencing: the lock service hands out a monotonically increasing token, and the storage rejects writes with an older token. Redis locks don't produce such tokens.
  - antirez: Redlock is fine under reasonable assumptions, and you can use the random value as a check-and-set token.
  - **Practical line:** for **efficiency** locks (avoid duplicate work), a single-instance lease is enough. For **correctness** locks, make the protected resource enforce it: a DB unique constraint, `SELECT … FOR UPDATE`, a version column (optimistic locking), or a fenced write. Or use a consensus system (etcd, ZooKeeper).
- **Lease hygiene:** make the TTL comfortably longer than the work, put a timeout on the work that's shorter than the TTL, and renew (a "watchdog") for long jobs.

**Sokrio example:**
- `[LIB]` Laravel's `Cache::lock()` on Redis is exactly the correct single-instance version: `SET key owner EX n NX` plus a Lua compare-and-delete on release (`vendor/…/Cache/RedisLock.php:38-40`). It's a lease, not Redlock, and it has no fencing token.
- **The real-world failure is scope, not algorithm (F13):** `[CODE]` `Guest/StockUpdateController.php` takes the stock lock at `:152-153`, does a PHP read-modify-write `qty + n`, releases the lock at `:166`, but commits the transaction at `:263`. The next request gets the lock and reads the **old** quantity, because the first transaction hasn't committed yet, so one increment is lost. The atomic `increment()` is already there, commented out at `:163`. Line for the interview: *"A lock that is released before the commit protects nothing. Here the database is the real fence: an atomic increment or a row lock inside the transaction."*
- **Lease budget done right:** `[CODE]` MatrixAggregator caps its query at 60 s under a 90 s lock (`:26-27`), so the holder can't outlive the lease (Q42).
- **Lease too long:** `[CODE]` `KPISummary` holds 1800 s and waits up to 1740 s (`KPISummary.php:88-89`). A waiting job occupies a `summary` worker for up to 29 minutes (head-of-line blocking).
- **Where the DB is the guard:** `[CODE]` `MessageResendService` uses the Redis lock only to serialize a balance read; the real guard is a transaction with `lockForUpdate()` on the rows (`:111-198`). That's the pattern to copy. R17 covers "lock expires while the job is still running".

**Follow-up questions the interviewer may ask:**
- How would you add fencing to the stock update? (A `version` column: `UPDATE stocks SET qty = qty + ?, version = version + 1 WHERE id = ? AND version = ?`, and retry on 0 rows. Or just the atomic increment.)
- What happens to Laravel's lock with `CACHE_DRIVER=file` on two web boxes? (Each box has its own `flock`; they don't exclude each other at all, T4 §4.5.)
- When would you use ZooKeeper/etcd instead? (Leader election and correctness locks across services, where you need sessions and monotonic tokens.)

**Common mistakes to avoid:**
- `SETNX` then `EXPIRE` as two calls, or `DEL` without an owner check.
- Calling a lease "mutual exclusion". It's mutual exclusion **while the lease holds**.
- Locking around a write and releasing before the transaction commits.

---

### Q45. Redis eviction policies. What's the difference between `allkeys-lru`, `volatile-lru`, `allkeys-lfu`, `noeviction`?

**Short answer (30 seconds):**
When memory reaches `maxmemory`, the policy decides what happens. `noeviction` rejects writes with an OOM error and keeps everything. `allkeys-lru` evicts the least recently used key of any kind. `volatile-lru` evicts only keys that have a TTL. `allkeys-lfu` evicts the least *frequently* used key, which keeps steady hot keys better than LRU when there are bursts of one-off reads. There are also `volatile-lfu`, `allkeys-random`, `volatile-random` and `volatile-ttl`. Pure caches want `allkeys-lru` or `allkeys-lfu`; anything holding queues or locks wants `noeviction`.

**Deep answer:**
- **Approximate algorithms:** Redis samples `maxmemory-samples` keys (default 5) and evicts the best candidate from the sample. Raising it improves accuracy at some CPU cost. LFU uses a logarithmic counter with decay (`lfu-log-factor`, `lfu-decay-time`).
- **`volatile-*` traps:** if few keys have TTLs, there's little to evict, and it behaves like `noeviction` (OOM errors). If your important keys have TTLs, they're the ones that go.
- **`noeviction` is not "safe":** writes fail. In an app, that means `dispatch()` throws, a cache write throws, and a rate limiter throws, so a full Redis becomes an outage.
- **`maxmemory` is per instance,** not per numbered database. You can't give DB 0 and DB 1 different policies.
- **What counts toward memory:** data, client output buffers, replication backlog, AOF buffer. Leave headroom (`maxmemory` ≈ 70–80 % of RAM with persistence on, because of fork copy-on-write).
- **Monitoring:** `INFO memory` (`used_memory`, `mem_fragmentation_ratio`), `INFO stats` (`evicted_keys`, `rejected` errors), and alerts on used/max.

**Sokrio example:**
- `[ASSUMPTION]` (A9) Prod policy unknown, but `[CODE]` there's a regression test for `OOM command not allowed when used memory > 'maxmemory'` (`tests/Unit/Kafka/KafkaProducerTest.php:231`, commit `37840a3b5`). That error only exists under `noeviction` (or `volatile-*` with nothing evictable), so prod has likely hit the ceiling at least once.
- `[CODE]` **The design problem:** one instance holds queues (DB 0), cache (DB 1) and the Python benchmark cache (DB 0, F20). Because `maxmemory` and the policy are per instance:
  - `allkeys-lru` could evict a **queue list or a lock** → lost jobs, or two lock holders.
  - `volatile-lru` protects queue lists (no TTL) but also can't evict `rememberForever` keys, and any cache key with a TTL is fair game.
  - `noeviction` keeps queues safe but turns a cache spike into failed dispatches and 500s (R11).
- `[CODE]` The producer already treats a Redis error as a transport failure and falls back to the sync write, so tracking survives an OOM (commit `37840a3b5`; 08b Q37).
- **Fix (T4 §4.10 #6, T6 §6.5):** two instances: queues + locks with `noeviction` + AOF, and cache + sessions + limiters with `allkeys-lfu`, no persistence.

**Follow-up questions the interviewer may ask:**
- LRU or LFU for a report cache? (LFU, if a nightly export reads many one-off keys and would otherwise push out the hot dashboard keys.)
- How would you find what's using memory? (`MEMORY USAGE key`, `redis-cli --bigkeys` / `--memkeys`, which are SCAN-based and safe.)
- What's `volatile-ttl`? (It evicts the keys closest to expiring first.)

**Common mistakes to avoid:**
- Putting queues and cache in one instance with `allkeys-lru`.
- Assuming DB numbers give separate memory budgets.
- Setting `maxmemory` to 100 % of RAM with persistence on.

---

### Q46. Redis Sentinel vs Redis Cluster. How does Cluster shard data (hash slots), and what are the limits of multi-key operations?

**Short answer (30 seconds):**
Sentinel is **high availability** for one primary: Sentinel processes watch it, agree on failure by quorum, promote a replica and tell clients the new address. It doesn't shard; all data fits on one primary. Cluster is **sharding plus HA**: the keyspace is split into 16 384 hash slots (`CRC16(key) mod 16384`), each owned by a primary with replicas. Multi-key commands, transactions and Lua scripts only work when all keys are in the same slot; hash tags like `{user:1}:cart` force that. Both use async replication, so a failover can lose acknowledged writes.

**Deep answer:**
- **Sentinel:**
  - Run ≥ 3 Sentinels on separate hosts; quorum decides "objectively down" and one Sentinel leads the failover.
  - Clients must be Sentinel-aware (ask "who is the master for `mymaster`?").
  - Scale reads with replicas; writes are limited to one node.
- **Cluster:**
  - Every node knows the slot map. A client sending a key to the wrong node gets `MOVED` (permanent) or `ASK` (during resharding) and follows it. Smart clients cache the map.
  - Resharding moves slots online with `MIGRATE`.
  - Failover is built in: replicas of a failed primary hold an election.
  - Only database 0 exists in Cluster mode.
- **Multi-key limits:** `MGET`, `DEL k1 k2`, `RENAME`, `SUNIONSTORE`, `MULTI`/`EXEC` and Lua `KEYS[]` must all hash to one slot, or you get `CROSSSLOT`. Hash tags hash only the part inside `{…}`. Too many keys under one tag creates a hot slot.
- **Other Cluster costs:** `SCAN` and `KEYS` work per node (iterate every primary); Pub/Sub broadcasts to every node unless you use sharded Pub/Sub.
- **Write loss:** async replication means "acked then lost" is possible on failover. `WAIT` reduces it. `min-replicas-to-write` stops a primary isolated in a partition from accepting writes for long.

**Sokrio example:**
- `[CODE]` Sokrio runs a single instance: `config/database.php:193-220` has no `clusters` block and no Sentinel options. Likely a container with a volume (`[HIST]` T6 §6.2), so there's no failover at all (A5).
- `[LIB]` Why Cluster would hurt: Laravel's queue Lua scripts touch the queue list, `:reserved` and `:delayed` together (`RedisQueue.php:275-286`, migrate `:244-249`), and the feature flusher `RENAME`s `buffer:{t}` → `flushing:{t}` (§4.7). Both are multi-key. In Cluster every queue name would need a hash tag (`{default}`), and the buffer keys would need `{t}` tags. `SCAN` would also have to visit every node.
- **Recommendation (T6 §6.12):** on ElastiCache keep **cluster mode disabled** (one primary + a replica, Multi-AZ failover), which is the Sentinel model. Split queue and cache into two groups. Data volume doesn't need sharding.

**Follow-up questions the interviewer may ask:**
- Why 16 384 slots? (Small enough for the slot bitmap in heartbeat messages, large enough for up to ~1000 nodes.)
- How do you run a Lua script that needs keys from two users in Cluster? (Redesign the keys with one hash tag, or do it in two steps with idempotency.)
- What happens to a lock during failover? (The new primary may not have it; two holders. That's the Redlock/fencing debate from Q44.)

**Common mistakes to avoid:**
- Saying Sentinel shards data.
- Moving to Cluster "for HA" when the data fits on one node. Replicas + failover give HA without the multi-key cost.
- Putting everything under one hash tag to avoid `CROSSSLOT`, which turns one slot into a hot spot.

---

### Q47. How would you build a rate limiter with Redis? Compare fixed window, sliding window log, sliding window counter, and token bucket.

**Short answer (30 seconds):**
**Fixed window:** `INCR` a key per client per minute with an expiry. It's the cheapest, but it allows a 2× burst across a window edge. **Sliding window log:** a sorted set of request timestamps; drop the old ones, count the rest. It's exact but costs memory per request. **Sliding window counter:** weight the previous window's count by how much of it still overlaps. It's nearly exact and costs two counters. **Token bucket:** tokens refill at a fixed rate up to a capacity, and each request takes one. It allows controlled bursts and is the usual choice for APIs. In Redis, make each check atomic with a Lua script.

**Deep answer:**

| Algorithm | Redis shape | Memory | Accuracy | Bursts |
|---|---|---|---|---|
| Fixed window | `INCR` + `EXPIRE` on `rl:{id}:{minute}` | 1 key | Edge burst up to 2× | Uncontrolled at the edge |
| Sliding log | `ZADD` now, `ZREMRANGEBYSCORE` < now−W, `ZCARD` | 1 member per request | Exact | None beyond the limit |
| Sliding counter | Current + previous window counts; `prev × overlap + curr` | 2 keys | ≈ exact (assumes even spread) | Small |
| Token bucket | Hash `{tokens, last_refill}`, refill on read | 1 hash | Exact for rate + burst | Up to capacity, by design |
| Leaky bucket | Queue drained at a fixed rate | Queue | Smooths output | None (shapes traffic) |

- **Atomicity:** read-then-write from the app races. Use one Lua script (or `MULTI` with `INCR` + `EXPIRE NX`).
- **Where to key it:** per user after auth, per IP before auth, per tenant for fairness. Return `429` with `Retry-After` and `X-RateLimit-Remaining`.
- **Failure mode:** decide whether to fail open (allow traffic when Redis is down) or closed. Most APIs fail open for normal endpoints and closed for OTP or login.
- **Distributed edge:** for very high rates, keep local token buckets per instance and sync to Redis periodically.

**Sokrio example:**
- `[CODE]` Five named limiters: `api`, `auth`, `otp`, `otp-verify`, `bulk` (`app/Providers/RouteServiceProvider.php:66-150`), with values in `config/rate_limiting.php` (api 600/min, auth 8/min per identifier and 25/min per IP, OTP 2/min **and** 6/h, bulk 3/min and 20/h). They run after auth, keyed per user and tenant-scoped (`:253-270`).
- `[LIB]` They use the plain `ThrottleRequests` middleware (`app/Http/Kernel.php:136`), which calls `RateLimiter::hit` → `cache->add` + `increment` with a decay timer (`vendor/…/Cache/RateLimiter.php:110-122`). That's a **fixed window** in the default cache store (DB 1).
- `[LIB]` The Redis variant (`ThrottleRequestsWithRedis` → `DurationLimiter`) is also a fixed window, anchored at the first hit, made atomic with a Lua script (`vendor/…/Redis/Limiters/DurationLimiter.php:154-168`). It's not a sliding window (D20 corrects T4 §4.6).
- **Interview point:** layering limits (2/min **and** 6/h for OTP) is a cheap way to cap the fixed-window edge burst without the cost of a sliding log.
- **Failure mode:** `[CODE]` with `noeviction` + OOM, every throttled route throws on `INCR`, so the limiter turns a Redis problem into an API outage (T4 §4.6). There's no fail-open wrapper.

**Follow-up questions the interviewer may ask:**
- How do you stop one tenant using the whole API budget? (A per-tenant limiter on top of the per-user one; for queues, per-tenant fairness is the R18 noisy-neighbor fix.)
- What should the limiter do when Redis is down? (Fail open with a local fallback for normal endpoints; fail closed for OTP sends, which cost money.)
- How would you implement a token bucket in one Lua script? (Read `tokens` and `ts`, add `(now − ts) × rate` capped at capacity, take one if available, write both back, set a TTL.)

**Common mistakes to avoid:**
- `GET` then `INCR` from the app, which races under concurrency.
- Forgetting the expiry on the counter key.
- Naming Laravel's Redis limiter a sliding window in an interview. It's fixed-window.

---

## 8.7 Kafka vs RabbitMQ vs Redis — comparisons (Q48–Q50)

### Q48. Kafka vs RabbitMQ: when would you choose each? Give a decision framework, not just a feature list.

**Short answer (30 seconds):**
Ask what the message *is*. If it's a **fact that happened** and more than one reader may care, now or later (replay, analytics, CDC, event sourcing), use Kafka: a durable, partitioned log that consumers read at their own pace. If it's a **command or a task** for one worker, with per-message ack, retry, delay, priority or routing, use RabbitMQ: a broker that hands out work and forgets it once it's done. Then check volume, ordering needs, retention, and what your team can run. And if Redis is already there and the volume is small, a Redis queue may be enough.

**Deep answer:**
- **Decision questions, in order:**
  1. **Do you need replay or several independent readers?** Yes → log (Kafka, or Redis Streams/Kinesis at smaller scale).
  2. **Is it work for exactly one worker, with per-message settlement?** Yes → queue (RabbitMQ, SQS, a Laravel queue).
  3. **Routing:** content- or header-based routing to many queues → RabbitMQ exchanges. Kafka only routes by topic and key.
  4. **Ordering:** per-key order at scale → Kafka partitions. RabbitMQ keeps order only with one consumer per queue (or single-active-consumer).
  5. **Delays, priorities, TTL** → RabbitMQ (or the queue you already have). Kafka has none of these natively.
  6. **Throughput and retention:** sustained very high throughput with days of retention → Kafka.
  7. **Operations:** who runs it? A managed option (MSK, Amazon MQ, SQS) can decide the question for a small team.
- **Comparison table:**

  | | Kafka | RabbitMQ | Redis Streams |
  |---|---|---|---|
  | Model | Distributed log | Smart broker, routing | In-memory log |
  | Retention / replay | Yes, by time or size | No (except stream queues) | Yes, bounded by memory |
  | Ordering | Per partition | Per queue, single consumer | Per stream |
  | Routing | Topic + key only | Rich (exchanges) | Minimal |
  | Ack granularity | Offset per partition | Per message | Per message (PEL) |
  | Best for | Event streaming, analytics, CDC | Task queues, routing, RPC | Light queues when Redis exists |

- **Hybrid is normal:** an outbox publishes events to Kafka, and a consumer turns some of them into tasks on a queue.

**Sokrio example:** Sokrio's real choices fit this framework (T3 §3.6):
- **GPS tracking** is a high-volume fact stream, ordered per user (key = `user_id`) and reprocessable → **Kafka** (`TrackingController.php:62-83`). The same goes for department changes feeding Mongo, which are ideally a compacted topic (08a).
- **Summaries, exports, SMS batches, delayed approvals** are tasks for one worker, with retries and delays → **Laravel queues on Redis** (`config/queue.php`, five queues in use).
- **RabbitMQ: not used, on purpose.** Delays, retries and priority are covered by Laravel queues; the stream needs are covered by Kafka. The one case where a broker would really help is request/reply with the ERP, which today is a daily shared-database poll (T3 §3.3.4).
- **Interview line:** *"A log you read from vs a broker that hands out work. We use Kafka where we need replay and per-key order, and Redis-backed Laravel queues for jobs. A third stateful system would need a use case neither covers."*

**Follow-up questions the interviewer may ask:**
- Can RabbitMQ do replay now? (Stream queues (3.9+) and super streams give log semantics `[GENERAL]`, but the ecosystem around them is far smaller than Kafka's.)
- What would make you move a Sokrio queue to Kafka? (A second team or service that needs the same events, e.g. order events for analytics, B8.)
- What does the choice cost operationally? (Kafka: partitions, retention, lag monitoring. RabbitMQ: queue growth, memory alarms, quorum queues. Both need DLQ handling.)

**Common mistakes to avoid:**
- Listing features with no criteria. The interviewer wants the "why".
- "Kafka is faster, so use Kafka." Throughput rarely decides it at a small company.
- Forgetting the team: running Kafka well is a real cost.

---

### Q49. Your team wants to use Kafka as a job queue (e.g. "send this email"). What problems will you hit?

**Short answer (30 seconds):**
Kafka tracks one offset per partition, not one ack per message. So a slow or failing job blocks every job behind it in that partition (head-of-line blocking). Parallelism is capped by the partition count. There's no per-message retry, delay, priority or TTL, so retries need extra topics, and a poison message needs a DLQ you build yourself. A rebalance in the middle of slow jobs causes duplicates. It can work, but you rebuild a queue on top of a log. `[GENERAL]` Kafka's Share Groups (KIP-932, "queues for Kafka") add per-message acks; check their current status before relying on them.

**Deep answer:**
- **Head-of-line blocking:** you can't commit offset 101 as done while 100 is still failing without either losing 100 or blocking. Workarounds: hand off to a retry topic, or track per-message completion yourself and commit the lowest contiguous offset.
- **Parallelism:** at most one consumer per partition per group. Ten partitions = ten parallel jobs, however many workers you start. Adding partitions later remaps keys.
- **Retries and delays:** the usual pattern is retry topics with growing delays (`email.retry.1m`, `.10m`, `.1h`) plus a DLT. The consumer of each retry topic pauses until the message's due time. That's a lot of topics, consumers and logic.
- **Long jobs:** a job that takes longer than `max.poll.interval.ms` triggers a rebalance, and the batch is redelivered to another consumer, which runs the jobs twice (08b Q25).
- **No priority:** "send the password-reset email first" needs a separate topic and consumer.
- **Visibility:** there's no "how many jobs are pending/failed" view per job, only lag per partition.
- **Share Groups** `[GENERAL]`: KIP-932 introduced share groups with per-record acknowledge, release and reject plus delivery counts, and consumers beyond the partition count. They arrived as early access in Kafka 4.0. Say "check the current status" rather than quote a version as GA.

**Sokrio example:** Sokrio shows both sides:
- **They didn't do it.** Jobs (summaries, exports, SMS, delayed approvals) run on Laravel queues, which give per-job retries (`tries`, `backoff`), delays (`later`), `failed_jobs`, and queue-level priority. Kafka carries only the tracking and department streams.
- **Kafka's limits still show in the stream consumers:**
  - `[CODE]` The tracking handler retries a failing tenant group 3 times with sleeps (`TrackingMessageHandler.php:23,85-116`) while every other message in the partition waits, which is head-of-line blocking. After that it falls back to per-point writes and drops bad points, so the partition isn't blocked forever (R4).
  - `[CODE]` Real parallelism is 1: three partitions, but numprocs=1 and the static `group.instance.id=""` blocks a second process (08a, R22).
  - `[INFERENCE]` A slow flush past the 30 s session timeout evicts the consumer and replays the batch (F9, R3). As a job queue that would mean sending emails twice.
- If someone proposed "send SMS via Kafka", the answer would be no: `SmsDeliveryUnknownException` means a message may have been sent, so blind redelivery isn't safe (`app/Services/SMSSender.php:12-19`). It needs per-message state, which a queue plus a DB status row gives you.

**Follow-up questions the interviewer may ask:**
- How would you design retries on Kafka if you had to? (Main topic → retry topics with fixed delays → DLT; the consumer commits after handing off; messages carry an attempt count and the original offset.)
- Can you get more parallelism than partitions without Share Groups? (Yes: a consumer that fans out to an in-process worker pool and tracks completed offsets, as Confluent's parallel consumer does. You lose per-partition order unless you key by message key.)
- When is Kafka *fine* as a job queue? (Uniform, fast, idempotent jobs with no delays, e.g. "index this document", where lag is the only metric you need.)

**Common mistakes to avoid:**
- Saying "Kafka can't do it" without the specifics: HOL blocking, partition-capped parallelism, no delay or priority.
- Retrying in place with a sleep, which blocks the partition.
- Forgetting rebalances when jobs are slow.

---

### Q50. Can Redis replace Kafka? At what point does it stop being a good idea?

**Short answer (30 seconds):**
For small volumes, yes. Redis Streams give a log with consumer groups, acks and limited replay, and if Redis is already running you avoid a whole cluster. It stops being a good idea when the data must outlive memory (days of retention, large payloads), when losing the last second on a crash isn't acceptable, when you need many partitions with per-key ordering and rebalancing, or when you want the ecosystem: Connect, CDC, Schema Registry, Kafka Streams. Rule of thumb: Redis for a short buffer measured in minutes or hours, Kafka for a durable history.

**Deep answer:**
- **Where Redis wins:** latency (sub-millisecond), simplicity (one process you already run), cheap at low volume, and Streams cover consumer groups and acks.
- **Where it breaks:**
  - **Retention cost:** everything sits in RAM. A week of a 5 MB/s stream is ~3 TB, which is cheap on Kafka disks and absurd in RAM.
  - **Durability:** AOF `everysec` + async replication is "lose about a second, maybe more on failover". Kafka with RF=3, `acks=all` and `min.insync.replicas=2` survives a broker loss without acknowledged-write loss.
  - **Scaling a stream:** one stream lives on one node (one slot). Spreading load means sharding by key across several streams yourself, with no group rebalancing to help.
  - **Ordering + parallelism:** Kafka gives per-key order with N parallel consumers via partitions. Streams spreads entries across consumers, so per-key order needs manual sharding.
  - **Ecosystem:** connectors, CDC, schema evolution, stream processing, tiered storage.
  - **Memory pressure** competes with your cache and queues (Q45).
- **Signals to move:** retention needs beyond hours, more than one team consuming, replay used for reprocessing, or a bigger-than-RAM backlog during an outage.

**Sokrio example:**
- **Where Sokrio rightly uses Redis instead of Kafka:** the feature-tracking analytics buffer (T4 §4.7). Volume is small, a loss of up to 30 minutes is acceptable, and it's flushed to Mongo in minutes. Kafka would be overkill, and Streams would be the natural upgrade (Q41).
- **Where Redis would be wrong:** GPS tracking.
  - The value is replay: reprocessing tracking after a handler bug needs the history (T6 §6.8).
  - A consumer outage must not grow memory without bound. Today a broker-side backlog lives on Kafka disks; on Redis it would compete with queues and cache in one `maxmemory` (Q45) and could push the instance into OOM, which then fails dispatches.
  - The prod Redis likely has no AOF (A9), so a restart would lose the stream.
- **Honest caveat:** Sokrio's Kafka doesn't yet deliver Kafka-grade durability either: acks=0 (F5), RF=1 on auto-created topics (A3, R21), a single broker. Kafka's advantages only count once those are fixed (T7 Top-5 #2). *"Choosing Kafka buys you nothing if you configure it like a cache."*

**Follow-up questions the interviewer may ask:**
- How would you size a Redis Stream for a consumer outage? (Peak rate × the longest outage you must absorb × average entry size, plus headroom; then set `MAXLEN` and alert on PEL size.)
- What about Redis with persistence on flash (e.g. some managed offerings)? (It helps cost, but not the ecosystem or partitioned consumption.)
- Would you use Redis Streams for CDC? (Only as a short hop; Debezium Server can write to Redis Streams, but you lose Kafka Connect's offset and schema tooling.)

**Common mistakes to avoid:**
- "Redis Streams = Kafka in memory." Partitioning, retention and durability are different.
- Ignoring the shared-memory risk when queues and cache live in the same instance.
- Judging Kafka by its defaults. acks, RF and min ISR decide the guarantees.

---

## 8.8 Stream processing (Q51–Q57)

> Sokrio does **batch** aggregation, not stream processing: hourly jobs per tenant recompute Mongo summaries from MySQL with idempotent upserts, and a daily resync corrects them (T1 B3). Use it as the "before" picture, then describe the streaming version.

### Q51. Batch vs stream processing. What is the Lambda vs Kappa architecture?

**Short answer (30 seconds):**
Batch processes a bounded dataset on a schedule: high latency, simple, easy to rerun. Streaming processes an unbounded flow event by event or in small windows: low latency, but you have to handle state, late data and failures continuously. **Lambda** runs both: a batch layer recomputes accurate results from the full history, a speed layer gives fast approximate results, and a serving layer merges them. The cost is two codebases for the same logic. **Kappa** uses one streaming pipeline over a replayable log. To fix or change logic, you replay the log into a new version and switch over.

**Deep answer:**
- **Batch:** input is complete and known, so correctness is easy and reruns are idempotent if the output is overwritten. Latency = schedule + runtime.
- **Streaming:** results update continuously. Needs event-time handling (Q52), windows (Q53), state (Q54) and exactly-once or idempotent sinks (Q57).
- **Lambda:**
  - Pros: the batch layer fixes any mistakes in the speed layer; it's robust.
  - Cons: two implementations drift apart; double the operations.
- **Kappa:**
  - Pros: one codebase. Reprocessing = start a new consumer group or job from offset 0 (or a timestamp), write to a new output, switch readers.
  - Cons: needs long enough retention (or tiered storage) and a processor that can replay fast. Some aggregations over years of data are still easier in batch.
- **Modern blur:** engines like Flink and Spark run the same code in batch and streaming modes, and lakehouse tables (Iceberg, Delta) let streaming jobs write tables that batch jobs read.

**Sokrio example:**
- `[CODE]` Today is **batch with a correction pass**:
  - `secondary_order_summary` and `primary_order_summary_mongodb` run hourly over the previous hour (`app/Console/Kernel.php:149,152`). `BaseCommand` fans out one job per active tenant to the `summary` queue (`BaseCommand.php:50-70`).
  - A daily resync (`Kernel.php:155`) recomputes the day. That's Lambda's "batch layer fixes it" idea, with no speed layer.
  - Output is upserted with `$set` / `$setOnInsert` (`SummariesQuery.php:229-238`), so reruns are idempotent.
- **Latency:** an order placed at 10:46 shows up in summaries at about 11:45 (T1 B3).
- **What Kappa would need first:** order events. Publishing is commented out (`OrderObserver.php:23`, `DeliveryObserver.php:23`, B8), and the dual-write problem must be solved with an outbox (R6). After that, a streaming job could keep the summaries current, and "resync" becomes "replay the topic into a new collection".
- **Honest recommendation:** hourly is fine for sales dashboards. Streaming pays off only if a feature needs minutes-fresh numbers (live targets, fraud-style alerts).

**Follow-up questions the interviewer may ask:**
- How do you reprocess in Kappa without downtime? (Run v2 alongside v1 from offset 0 into a new table, compare, switch reads, stop v1.)
- What breaks Kappa? (Retention shorter than the history you need; non-deterministic logic; side effects like emails during a replay.)
- Is micro-batching streaming? (Yes, in practice: Spark Structured Streaming processes small batches, with latency in seconds.)

**Common mistakes to avoid:**
- Treating Lambda as "best practice". Most teams moved to Kappa or unified engines to avoid two codebases.
- Forgetting that replay must not repeat side effects.
- Choosing streaming when nobody needs fresher numbers.

---

### Q52. Event time vs processing time vs ingestion time. Why does it matter? What is a watermark?

**Short answer (30 seconds):**
**Event time** is when the thing happened (the device timestamp). **Ingestion time** is when it entered the system (the broker timestamp). **Processing time** is when your job sees it. They differ because of network delays, offline devices, retries and backlogs. If you window by processing time, a consumer that falls behind and catches up puts an hour of events into one minute, and your numbers are wrong. A **watermark** is the processor's statement "I believe no events older than T will still arrive". It lets a window close and emit. Events that arrive after the watermark are **late**: you allow some lateness and update the result, or send them to a side output.

**Deep answer:**
- **Out-of-order is normal:** mobile apps buffer offline, partitions are read at different speeds, and retries reorder.
- **Watermark strategies:**
  - Bounded out-of-orderness: watermark = max event time seen − X (e.g. 5 minutes).
  - Per-partition watermarks, combined by taking the minimum. An idle partition holds the watermark back unless it's marked idle.
- **Trade-off:** a watermark that's too eager drops late events; one that's too lazy delays every result.
- **Late data handling:** allowed lateness (keep window state and emit an updated result), side outputs for "too late" events, and idempotent or upsert sinks so updates overwrite earlier results.
- **Kafka timestamps:** `CreateTime` (set by the producer) or `LogAppendTime` (set by the broker) per topic, `message.timestamp.type`. Kafka Streams uses the record timestamp as event time by default, or a custom `TimestampExtractor` reading the payload.

**Sokrio example:**
- `[CODE]` The tracking payload carries the device's `created_at` (a required key, `WriteBulkTrackingActions.php:56-61`), which is event time. Field apps can send late batches through the v2 bulk endpoint after being offline (`V2/Tracking/TrackingController.php:52-78`).
- `[CODE]` The producer envelope has `occurred_at`, but the consumer's decode drops it along with `event_id` (`KafkaConsumer.php:360-364`). So downstream code can't tell envelope time from processing time.
- `[INFERENCE]` The hourly summary jobs are effectively **event-time windows with one hour of fixed lateness**: they run at :45 over the previous hour's orders. Anything whose timestamp lands in an hour that has already been summarized is only picked up by the daily resync (`Kernel.php:155`). That's "allowed lateness = until tomorrow", implemented by recomputation.
- **Streaming version:** event time = order or point `created_at`, a bounded-out-of-orderness watermark of a few minutes, allowed lateness of a day for offline field reps, and upsert sinks into the same Mongo summary documents, so a late update simply overwrites.

**Follow-up questions the interviewer may ask:**
- What do you do about device clocks that are wrong? (Clamp to ingestion time ± a bound, or store both and use ingestion time when the gap is implausible.)
- How does one idle partition stall a job? (The overall watermark is the minimum across partitions. Mark idle sources so they stop holding it back.)
- Where does the watermark come from in Kafka Streams? (It doesn't use watermarks; it uses "stream time" plus a grace period per window.)

**Common mistakes to avoid:**
- Aggregating by processing time and calling it "per hour".
- Saying watermarks guarantee completeness. They're a heuristic.
- Dropping late data silently. At least count it.

---

### Q53. Explain window types: tumbling, hopping (sliding), session windows. Give a business example for each.

**Short answer (30 seconds):**
**Tumbling** windows are fixed-size and don't overlap: each event belongs to exactly one window, e.g. orders per hour. **Hopping** windows are fixed-size but advance by a smaller step, so they overlap and an event belongs to several: a 15-minute average refreshed every minute. (Some engines also have true **sliding** windows, defined by the time difference between events.) **Session** windows group events per key separated by a gap of inactivity, so their size varies: a field rep's visit session ends after 30 minutes with no GPS points.

**Deep answer:**

| Window | Defined by | Event belongs to | Example |
|---|---|---|---|
| Tumbling | size | exactly 1 window | Orders per tenant per hour |
| Hopping | size + advance | size ÷ advance windows | Last 15 min of active reps, updated every minute |
| Sliding (Kafka Streams) | max time difference between two events | windows created as events arrive | "Two orders from the same outlet within 10 minutes" |
| Session | inactivity gap per key | 1 session, which may merge | A rep's continuous working session |
| Global + trigger | custom | 1 | Emit every 1000 events |

- **State cost:** hopping windows multiply state by size ÷ advance. Session windows merge when an event bridges two sessions, so the engine must update or retract earlier results.
- **Output:** per-window results can be emitted when the window closes (final) or on every update (suppressed or not). Downstream must handle updates (upserts).
- **Grace period / allowed lateness** applies to every window type (Q52).

**Sokrio example:**
- **Tumbling, already there in batch:** `[CODE]` the hourly secondary and primary order summaries are tumbling 1-hour windows per tenant, computed after the fact (`Kernel.php:149,152`).
- **Hopping, a natural feature:** `[INFERENCE]` "reps active in the last 15 minutes, refreshed every minute" from the tracking topic (key = `user_id`) for a live supervisor map. Today that's a query on `trackings` on demand.
- **Session, the best fit for tracking data:** `[INFERENCE]` group a rep's GPS points into working sessions with a 30-minute gap. Output: session start, end, distance and outlets visited, the input for attendance and route reports. With batch you have to re-derive sessions from raw rows every time; a session window maintains them as points arrive.
- **Sliding:** "same outlet ordered twice within 10 minutes", a duplicate-order alert.

**Follow-up questions the interviewer may ask:**
- Why can session windows change results you already emitted? (A late event can bridge two sessions and merge them into one.)
- How do you align tumbling windows to a tenant's time zone? (Offset the window start, or key by local date; engines default to UTC epoch alignment.)
- Hopping vs sliding in Kafka Streams? (Hopping windows are aligned to the epoch; sliding windows are created around actual events.)

**Common mistakes to avoid:**
- Calling every overlapping window "sliding" without defining it. Engines name these differently.
- Ignoring the state multiplication of small hops.
- Forgetting that windows are per key.

---

### Q54. Stateful stream processing: how does Kafka Streams store state (RocksDB + changelog topic)? How is state recovered after a crash?

**Short answer (30 seconds):**
Each Kafka Streams task keeps its state in a local store, RocksDB by default, one per input partition. Every write to the store is also sent to a **changelog topic** in Kafka (compacted for key-value stores). After a crash, or when a task moves to another instance, the new owner rebuilds the store by replaying the changelog from the beginning (or from its local checkpoint), then resumes processing from the committed input offsets. **Standby replicas** keep warm copies on other instances so failover doesn't wait for a full restore.

**Deep answer:**
- **Tasks:** one task per input partition (for co-partitioned inputs, per partition number). State is sharded the same way, so no task shares state.
- **Store:** RocksDB on local disk; in-memory stores are an option. A write goes to the store and to the changelog through the producer.
- **Changelog:** `<app-id>-<store>-changelog`, compacted (window stores use compact+delete). It's the source of truth for state.
- **Checkpoints:** the instance writes a `.checkpoint` file with the changelog offset it has applied, so a restart of the same instance only replays the tail.
- **Recovery:** restore from the checkpoint offset (or 0) to the end of the changelog, then start processing. With a big state this takes minutes, which is why there are:
  - `num.standby.replicas`: warm shadow copies.
  - Warm-up replicas and the high-availability task assignor (KIP-441): a task stays where it is until a new owner has caught up.
- **Exactly-once:** with `processing.guarantee=exactly_once_v2`, the input offset commit, the changelog writes and the output writes are one Kafka transaction. A crash rolls back all three together, so state and output never disagree.
- **Interactive queries:** stores can be queried from the app, and the metadata API tells you which instance owns which key.

**Sokrio example:**
- `[CODE]` Sokrio's "state" is the Mongo summary collections, and its "changelog" is MySQL: the hourly and daily jobs recompute from the source rather than restoring a store (`SummariesQuery.php:229-238`). Recovery after a failure = rerun the job. It's simple and correct because the source of truth is a database, not a stream.
- `[INFERENCE]` For a Kafka Streams version (say, sessionized tracking from Q53):
  - Input `tracking` (3 partitions, key = `user_id`), state store `rep-sessions`, changelog `…-rep-sessions-changelog`.
  - **Prerequisites from T2:** the changelog topic must not be RF=1 (R21), or one broker loss loses the state history. And `acks=0` on the input producer (F5) means events can vanish before the processor ever sees them. Exactly-once processing can't recover data that the producer never delivered.
  - It would also be a JVM service. The stack is PHP and Python today, which is the biggest practical cost.

**Follow-up questions the interviewer may ask:**
- Why compacted changelogs? (Restore time and size depend on the number of keys, not the number of updates.)
- What happens if local state is corrupted? (Delete the state directory; the task restores from the changelog.)
- How do standby replicas interact with rebalancing? (The assignor prefers instances with caught-up standbys, so failover is near-instant.)

**Common mistakes to avoid:**
- Saying the state is "in Kafka". It's local in RocksDB, backed up to Kafka.
- Ignoring restore time when sizing state.
- Using a single-replica changelog.

---

### Q55. KStream vs KTable vs GlobalKTable. What is stream-table duality?

**Short answer (30 seconds):**
A **KStream** is an unbounded sequence of independent events: every record is a new fact, like "rep 7 was at this point". A **KTable** is a changelog view where each record is the latest value for its key, an upsert, with a `null` value as a delete: "department 12's current name". A **GlobalKTable** is a KTable fully copied to every instance, not partitioned, so you can join on any field without co-partitioning. **Stream-table duality:** a stream of updates, aggregated per key, gives a table; and a table's changes, read in order, are a stream. A compacted topic is both.

**Deep answer:**
- **KStream:** `inserts`. `count()` over a stream counts every record.
- **KTable:**
  - Partitioned: each instance holds only its partitions' keys.
  - Backed by a store and usually by a compacted topic.
  - Updates replace; tombstones delete. Aggregations over a table subtract the old value and add the new one.
- **GlobalKTable:**
  - Every instance reads all partitions of the topic. That costs memory and startup time, so it's for small, slowly changing reference data.
  - Joins can use any key extracted from the stream record (no repartition).
  - It's bootstrapped fully before processing starts, but it isn't time-synchronized with the stream.
- **Duality in practice:** a database table is the result of applying its changelog (the binlog). CDC turns a table into a stream; materializing a stream turns it back into a table.

**Sokrio example:**
- **KStream:** `[CODE]` the `tracking` topic: every GPS point is a new fact, keyed by `user_id` (`TrackingController.php:62-83`).
- **KTable:** `[CODE]` the `departments` topic is a changelog of department state keyed by `department_id`, and the handler upserts each one into Mongo (`DepartmentMessageHandler.php:87-112`). The Mongo department collection is literally a materialized KTable. As 08a noted, the topic should be compacted, and deletes need tombstones. Today there's no delete event at all (the observer publishes on `created` and `updated` only, `DepartmentChangeObserver.php:26,35`).
- **GlobalKTable:** `[INFERENCE]` tenant (`Org`) metadata is small and needed by every partition's processing. Today each handler caches `Org` in process memory for up to 6 h with no `active` check (F18). A GlobalKTable of tenants (fed by Org change events) would give every instance a current copy, including deactivation.
- **Duality:** the `DepartmentSync` command, a manual full resync (F1), is "rebuild the table by re-reading the source" because the stream isn't trusted to be complete (F2: `Department::upsert` never publishes).

**Follow-up questions the interviewer may ask:**
- Why not use a KTable for the tenants instead of a GlobalKTable? (A KTable join needs the stream keyed by tenant. Tracking is keyed by `user_id`, so it would need a repartition first.)
- What happens if a GlobalKTable topic is huge? (Every instance stores all of it and must read it fully at startup. Use a partitioned KTable and repartition instead.)
- How do you delete from a KTable? (Produce a tombstone: the key with a `null` value.)

**Common mistakes to avoid:**
- Counting a KTable as if each update were a new event.
- Using a GlobalKTable for large or fast-changing data.
- Forgetting tombstones, so deleted entities live forever in the table.

---

### Q56. Stream-stream join vs stream-table join. Why do joins require co-partitioning?

**Short answer (30 seconds):**
A **stream-stream join** matches events from two streams that share a key **within a time window**, e.g. an order and its payment within 30 minutes. Both sides are buffered in windowed state. A **stream-table join** enriches each stream event with the table's current value for its key, e.g. a GPS point with the rep's department. It's a lookup, not windowed. Both require **co-partitioning** (same key, same partition count, same partitioner), because each task only sees its own partitions. Records with the same key must land on the same task, or matches are missed. A GlobalKTable join avoids this because every task has the whole table.

**Deep answer:**
- **Stream-stream:**
  - Inner, left or outer, within `JoinWindows.ofTimeDifferenceAndGrace(…)`.
  - State on both sides for the window plus grace. Output can include repeated or updated results for outer joins.
- **Stream-table:**
  - Only stream records trigger output. Table updates change future lookups but don't emit anything.
  - Timing matters: a stream record that arrives before its table row was loaded sees `null` (for a left join). Kafka Streams aligns by timestamp where it can (and has versioned stores for "as of" lookups).
- **Table-table:** joins two KTables, emitting on updates from either side. Foreign-key joins (KIP-213) handle "join on a non-key field" for tables.
- **Co-partitioning rules:**
  1. The same key (same serialized bytes).
  2. The same number of partitions.
  3. The same partitioning strategy on the producers.
  - If the keys differ, Kafka Streams repartitions: `selectKey`/`map` and then the join writes through an internal `-repartition` topic, which costs a full extra hop through Kafka.
  - Kafka Streams checks partition counts at startup but **can't** check that producers used the same partitioner.

**Sokrio example:**
- **Enrich tracking with department (stream-table):** `[INFERENCE]` `tracking` is keyed by `user_id`, and `departments` by `department_id`. They're not co-partitioned, so a direct join is impossible. Options:
  1. Re-key tracking by the user's department (a repartition topic), then join the KTable.
  2. Make departments a GlobalKTable (it's small) and join on a key extracted from each point.
- **The partitioner trap (Q21):** `[LIB]` phpkafka partitions with `crc32(key) % N` (`phpkafka/Producer/Partitioner/DefaultPartitioner.php:48-53`), while Java clients and Kafka Streams' own repartition topics use **murmur2**. If a PHP producer writes one input and a Java producer writes the other, the same key can land on different partition numbers, and the join silently misses matches. That's the "same partitioner" rule, and Kafka Streams can't detect it. Fix: repartition the PHP-produced topic inside the Streams app, or make PHP use murmur2.
- **Stream-stream:** `[INFERENCE]` order created ↔ delivery completed within N days to measure fulfilment time. It needs order and delivery events, both commented out today (B8).

**Follow-up questions the interviewer may ask:**
- What happens if you increase partitions on one side of a join? (Co-partitioning breaks; the app refuses to start or, worse, if counts still match by accident, keys move and old state is in the wrong place.)
- Why doesn't a stream-table join emit on table updates? (By design: the stream drives output. Use a table-table join if both sides should trigger.)
- How long must stream-stream state be kept? (Window + grace, on both sides.)

**Common mistakes to avoid:**
- Thinking "same key" is enough, ignoring partition count and partitioner.
- Using a GlobalKTable for a huge table to avoid repartitioning.
- Forgetting that a stream-table join reads the table *as of now*, not as of the event time.

---

### Q57. Kafka Streams vs Apache Flink vs Spark Structured Streaming. How do they achieve fault tolerance (checkpointing/exactly-once)?

**Short answer (30 seconds):**
**Kafka Streams** is a library inside your app, Kafka-in and Kafka-out. State lives in RocksDB backed by changelog topics, and exactly-once comes from Kafka transactions that commit input offsets, state changes and output together. **Flink** is a cluster engine with true event-at-a-time processing. Fault tolerance uses distributed snapshots (Chandy-Lamport style): barriers flow through the graph, each operator snapshots its state when the barrier arrives, and on failure everything rolls back to the last complete checkpoint. Sinks get end-to-end exactly-once via two-phase commit. **Spark Structured Streaming** runs micro-batches. It records the offsets of each batch in a write-ahead log and checkpoint before processing, so a failed batch is rerun deterministically; exactly-once at the sink needs an idempotent or transactional sink.

**Deep answer:**

| | Kafka Streams | Flink | Spark Structured Streaming |
|---|---|---|---|
| Deployment | Library in any JVM app | Cluster (JobManager + TaskManagers), or on K8s | Spark cluster |
| Model | Record at a time | Record at a time (pipelined) | Micro-batch (continuous mode is experimental) |
| Sources / sinks | Kafka only | Many | Many |
| State | RocksDB + changelog topics | Heap or RocksDB, snapshots to S3/HDFS | State store, checkpointed to HDFS/S3 |
| Fault tolerance | Changelog restore + Kafka transactions (EOS v2) | Barrier checkpoints (aligned or unaligned) + replayable sources | Offset WAL + state checkpoints, replay the batch |
| End-to-end EOS | Kafka → Kafka | Two-phase-commit sinks (Kafka, files) | Idempotent / transactional sinks |
| Latency | ms | ms | ~100 ms – seconds |
| Best fit | Microservices that read and write Kafka | Complex event-time pipelines, large state, many systems | Teams already on Spark, unified batch + streaming |

- **Flink checkpoints, in more detail:**
  - The JobManager injects barriers into the sources. An operator with several inputs **aligns** (waits for the barrier on all inputs) and then snapshots its state asynchronously.
  - Unaligned checkpoints (1.11+) let barriers overtake buffered data, which speeds up checkpoints under backpressure at the cost of bigger snapshots.
  - Savepoints are manual checkpoints used for upgrades and migrations.
  - Recovery restores every operator's state and rewinds the sources (Kafka offsets) to the checkpoint.
- **"Exactly-once" means exactly-once *state effects*.** Records may be processed twice internally. External side effects (HTTP calls, emails) are at-least-once unless they're idempotent.

**Sokrio example:**
- **Where Sokrio is:** `[CODE]` no stream processor; PHP consumers do per-message work with manual commits (D8) and at-least-once delivery, while the summaries are batch jobs.
- **What I'd pick if streaming became necessary:** `[INFERENCE]` Kafka Streams (or a managed Flink service on AWS) for something like sessionized tracking (Q53). Kafka Streams is lighter because there's no cluster, but either way it's a new JVM runtime for a PHP and Python team, and that's the real decision.
- **Exactly-once starts at the producer:** with `acks=0` (F5) and RF=1 (R21), events can be lost **before** any processor sees them. With the consumer decode dropping `event_id` (`KafkaConsumer.php:360-364`), nothing downstream can deduplicate either. The order of work would be:
  1. `acks=1` (or all), RF=3.
  2. Keep `event_id` and make sinks idempotent.
  3. Publish order events via an outbox (R6).
  4. Only then a stream processor.
- **Interview line:** *"EOS in Kafka Streams or Flink covers what happens inside the pipeline. It can't recover a message the producer never delivered, so I'd fix acks and replication before buying a stream processor."*

**Follow-up questions the interviewer may ask:**
- What does a Flink barrier alignment cost under backpressure? (Checkpoints take longer because aligned operators buffer input; unaligned checkpoints trade that for larger snapshots.)
- How does Kafka Streams achieve EOS with fewer producers in v2? (One transactional producer per thread instead of per task, KIP-447.)
- When would Spark be the right choice? (When the team already runs Spark for batch and second-level latency is fine.)

**Common mistakes to avoid:**
- Claiming exactly-once side effects (emails, payments) from any engine.
- Calling Spark Structured Streaming "event at a time".
- Choosing an engine before you know whether you need streaming at all.

---

### ✅ Quality check
- [x] All 20 questions (Q38–Q57) answered with the exact 5 renderer labels from `README_2.md:227-231`
- [x] Redis examples reuse verified refs (F12, F13, F14, F20, D12, A9, R11, R12, R16, R17, R35, the 9 lock sites, `RedisLock`, `RedisQueue` Lua); comparisons reuse T3 §3.6 and T6 §6.8/§6.12; stream processing says plainly that Sokrio is batch (T1 B3) and marks every streaming design `[INFERENCE]`
- [x] Two new `[LIB]` reads of vendored Laravel (read only): `Cache::remember` never caches `null` (`Repository.php:386-397`), and both Laravel rate limiters are fixed windows (`RateLimiter.php:110-122`, `DurationLimiter.php:154-168`). New conflict **D20** corrects T4 §4.6's "Lua sliding window"
- [x] Version-dependent facts tagged `[GENERAL]` (KIP-932 share groups, XAUTOCLAIM 6.2, multi-part AOF 7, sharded Pub/Sub 7, unaligned checkpoints, KIP-441/447)
- [x] `### Q<n>.` headings kept for the T11 renderer; no literal bold labels in this list
- [x] No secrets: env var names only, no hosts or IPs
