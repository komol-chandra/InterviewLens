# Sokrio Distributed Message Queue: Deep Knowledge Builder

> **What this file is:** A master prompt for Claude in VS Code (Claude Code). Put this file (and `interview-questions.md`) in the root of the Sokrio workspace, open Claude, and say:
>
> **"Read README.md and start Phase 0."**
>
> Claude will study the real Sokrio codebase and my notes, then build a set of knowledge files that explain how Sokrio uses Kafka, RabbitMQ and Redis, how it runs on AWS, where it breaks, and how to fix it. The goal is deep, interview-ready knowledge based on real production code, not textbook theory.

---

## 1. Who I am and what I need

I am a full-stack engineer at Sokrio (Laravel/PHP backend, React/TypeScript frontend). Sokrio is a multi-tenant SaaS distribution and order management platform serving 100+ enterprise clients.

I need to:

1. Understand **exactly how Sokrio uses distributed messaging** (Kafka, RabbitMQ, Redis): every producer, consumer, topic, queue, job and config, traced through real code.
2. Be able to **build and change** this system myself with confidence.
3. Know **how it runs on AWS** and what AWS manages vs what we manage.
4. Know **every breaking point**: what fails, how I would notice, and how to fix it.
5. Be **interview-ready**: answer senior-level Kafka / RabbitMQ / Redis / distributed systems questions using Sokrio as my real example.

---

## 2. Resources you must use

### My existing notes (read these first)

| File | What it is |
|---|---|
| `/home/kiri2ka/code/sokrio/blog/03-event-driven-systems-and-kafka.md` | My notes on event-driven systems and Kafka |
| `/home/kiri2ka/code/sokrio/blog/04-kafka-in-production-multi-tenant-laravel.md` | My notes on Kafka in production with multi-tenant Laravel |
| `/home/kiri2ka/code/sokrio/blog/Kafka/order_summary/PR-5094-breakdown.md` | Breakdown of PR-5094 (order summary via Kafka) |
| `interview-questions.md` (same folder as this README) | My 81-question bank on Kafka / RabbitMQ / Redis / streaming |

### Codebases

- The Sokrio code lives under `/home/kiri2ka/code/sokrio/`. Main repos: `sokrio-server` (Laravel) and `sokrio-app-frontend` (React). **Discover the actual folder layout yourself**; do not assume paths.
- Also look for any related services, infra or deployment repos in that folder (Docker, Terraform, CloudFormation, CDK, Helm, Kubernetes, CI/CD, Supervisor configs).

---

## 3. Rules you must follow

1. **Code is the source of truth.** Every claim about Sokrio must point to real code as `path/to/file.php:LINE`. If my blog notes disagree with the code, say so and trust the code.
2. **Label every statement** with one of these tags:
   - `[CODE]` — verified in the codebase (with file path)
   - `[NOTES]` — from my blog/PR notes only, not yet verified in code
   - `[GENERAL]` — general industry knowledge, not Sokrio-specific
   - `[ASSUMPTION]` — your best guess; explain why and how I can verify it
3. **Never invent** topics, queue names, configs or AWS services. If something is not found, write: `Not found in codebase. Searched: <what you searched>.`
4. **Never copy secrets.** Do not put passwords, API keys, broker credentials, hostnames from `.env`, or tokens into any file. Write `<redacted>` and name the env variable instead.
5. **Do not modify application code.** Only create files inside `docs/messaging-knowledge/` (create it if missing).
6. **Work phase by phase.** After each phase, stop, show a short summary of what you wrote and what you could not find, and wait for me to say "next".
7. **Explain like a senior engineer teaching a mid-level engineer.** Short paragraphs, real code snippets (trimmed to the important lines), sequence diagrams in Mermaid where flows are involved.
8. If a file gets too long (over ~600 lines), split it into parts.

---

## 4. The phases

### Phase 0 — Discovery and inventory

Search the codebase and build a complete map before explaining anything. Search at least for:

- **Kafka:** `rdkafka`, `RdKafka`, `kafka`, `KafkaProducer`, `KafkaConsumer`, `mateusjunges/laravel-kafka`, `topic`, `bootstrap.servers`, `group.id`, `auto.offset.reset`, `enable.auto.commit`, `acks`, `librdkafka`
- **RabbitMQ:** `amqp`, `php-amqplib`, `vladimir-yuldashev/laravel-queue-rabbitmq`, `rabbitmq`, `exchange`, `routing_key`, `basic_publish`, `basic_consume`, `prefetch`, `x-dead-letter-exchange`
- **Redis:** `Redis::`, `predis`, `phpredis`, `QUEUE_CONNECTION`, `config/queue.php`, `config/database.php` (redis section), `config/horizon.php`, `Cache::`, `Cache::lock`, `RateLimiter`, `Redis::publish`, `Redis::subscribe`, `xadd`, `throttle`, `funnel`
- **Laravel queue system:** classes implementing `ShouldQueue`, `dispatch(`, `->onQueue(`, `->onConnection(`, `afterCommit`, `$tries`, `$timeout`, `$backoff`, `retryUntil`, `failed(`, `failed_jobs`, `job_batches`, `Bus::chain`, `Bus::batch`, events/listeners that queue
- **Long-running processes:** artisan commands that consume (`while (true)`, `consume`, `listen`), `supervisor*.conf`, `Procfile`, Docker `CMD`/`command`, Horizon supervisors, cron/scheduler entries
- **Multi-tenancy:** how tenant/company ID travels inside messages, tenant DB switching in consumers
- **Infra / AWS:** `MSK`, `msk`, `amazonmq`, `elasticache`, `memorydb`, `sqs`, `sns`, `eventbridge`, Terraform/CloudFormation/CDK files, `docker-compose*.yml`, Kubernetes/ECS task definitions, CI/CD pipelines
- **Outbox / idempotency:** `outbox`, `idempotency`, `message_id`, `event_id`, `processed_messages`, unique constraints used for dedup

**Output:** `docs/messaging-knowledge/00-inventory.md` containing:
- Table of every producer: what it sends, to where (topic/queue/channel), message format, file:line
- Table of every consumer/worker: what it reads, what it does, how it is run, file:line
- Table of every topic / queue / exchange / Redis key pattern with its purpose
- List of packages and versions (`composer.json`) related to messaging
- List of config files and the env variable **names** they use
- A Mermaid diagram of the whole messaging landscape
- "Not found" list (what you searched for and did not find)

---

### Phase 1 — Big picture: why Sokrio needs a distributed message queue

**Output:** `docs/messaging-knowledge/01-architecture-overview.md`

- Which business problems in Sokrio are solved with messaging (order summary, reports, notifications, sync, etc.), linked to real code
- Why each technology was chosen for each job (Kafka vs RabbitMQ vs Redis), or why it *should* have been if the reason is not documented
- End-to-end Mermaid sequence diagram for the 3 most important flows
- Compare what my blog notes say vs what the code actually does

---

### Phase 2 — Kafka in Sokrio (deep dive)

**Output:** `docs/messaging-knowledge/02-kafka-in-sokrio.md`

Using real code, explain:

1. **Producer side:** where messages are produced, the producer config (acks, idempotence, retries, compression, batching), message key choice and why it matters for ordering and partition balance, serialization format, error handling when publish fails
2. **Dual-write risk:** does Sokrio write to DB then publish? Is there an outbox? If not, show exactly where an event could be lost and propose a fix
3. **Consumer side:** how consumers run (artisan command, Supervisor, container), consumer group IDs, offset commit strategy (auto vs manual, before vs after processing), batch size, how tenant context is set per message, graceful shutdown on SIGTERM, memory leak protection in long-running PHP
4. **PR-5094 walkthrough:** read my breakdown, then trace the actual code changes line by line. Explain each design decision and what could go wrong
5. **Topic design:** partitions, replication factor, retention, compaction (from config or infra code)
6. **Delivery guarantees:** what guarantee Sokrio actually gets today (at-most-once / at-least-once), and the proof in code
7. **Idempotency:** are consumers idempotent? If a message is processed twice, what happens to the data?
8. **Ordering:** is per-order or per-tenant ordering guaranteed? Where can it break?
9. **Retry and DLQ:** how failed messages are handled; is there a retry topic or DLQ?

---

### Phase 3 — RabbitMQ in Sokrio

**Output:** `docs/messaging-knowledge/03-rabbitmq-in-sokrio.md`

If RabbitMQ is used: exchanges, queues, bindings, routing keys, ack/nack handling, prefetch, publisher confirms, DLX/retry setup, how Laravel connects to it, how workers run.

If RabbitMQ is **not** used: say so clearly with proof (what you searched), then explain where in Sokrio it *would* fit better than Kafka or Redis and why, labeled `[GENERAL]`.

---

### Phase 4 — Redis in Sokrio

**Output:** `docs/messaging-knowledge/04-redis-in-sokrio.md`

Cover every role Redis plays:

- **Laravel queue driver:** which queues exist, priorities, `retry_after` vs job `$timeout` (check for the duplicate-processing bug where `timeout >= retry_after`), Horizon config, worker counts
- **Cache:** cache-aside patterns, TTLs, tenant key prefixes, invalidation strategy, stampede risk on heavy reports
- **Locks:** `Cache::lock` / atomic locks, where used, what happens if the lock expires mid-work
- **Rate limiting / throttling**
- **Pub/Sub or Streams** if used (broadcasting, websockets, etc.)
- **Persistence and eviction:** what config is expected, and what data is lost if Redis restarts

---

### Phase 5 — The Laravel implementation layer

**Output:** `docs/messaging-knowledge/05-laravel-implementation.md`

A practical "how to build it" guide based on Sokrio's existing patterns:

- How to add a **new Kafka producer and consumer** following Sokrio's conventions (step by step, using real classes as templates)
- How to add a **new queued job** the Sokrio way
- `afterCommit` usage and where it is missing
- Multi-tenant context handling inside jobs and consumers
- Testing: how existing tests fake/mock queues and Kafka; how to write tests for a new consumer
- Local development setup (Docker services needed, env variable names, how to run consumers locally)

---

### Phase 6 — How AWS handles this

**Output:** `docs/messaging-knowledge/06-aws-infrastructure.md`

First find what Sokrio actually runs (from infra code, env variable names, deployment configs). Then explain:

| Concern | Check in code | Explain |
|---|---|---|
| Kafka | Self-managed on EC2 / Docker, or Amazon MSK (provisioned / serverless)? | Brokers, AZ spread, replication, storage, auth (IAM/SASL/TLS), MSK Connect |
| RabbitMQ | Self-managed or Amazon MQ? | Cluster vs single instance, failover |
| Redis | Self-managed, ElastiCache, or MemoryDB? | Cluster mode, replicas, Multi-AZ failover, backups |
| Workers | EC2 + Supervisor, ECS, EKS, Lambda? | Scaling, deploy/restart behavior, graceful shutdown |
| Monitoring | CloudWatch, Prometheus, Grafana, Horizon, Sentry? | Which alerts exist and which are missing |
| Alternatives | SQS, SNS, EventBridge, Kinesis | Where each would fit for Sokrio and trade-offs vs current setup |

Explain what AWS manages for us vs what is still our responsibility for each service. Mark anything not found in code as `[ASSUMPTION]` or `[GENERAL]`.

---

### Phase 7 — Breaking points and runbooks

**Output:** `docs/messaging-knowledge/07-failure-modes-and-runbooks.md`

For each failure below, write a runbook entry with this exact structure:

```
### <Failure name>
- What happens:
- Where in Sokrio code this can happen: (file:line or "not applicable")
- Symptoms / how we detect it:
- Business impact (which clients/reports/orders are affected):
- Immediate fix (stop the bleeding):
- Root-cause fix (code or config change):
- How to prevent it:
- Interview angle (how to talk about it):
```

Failures to cover (add more you find in the code):

1. Kafka broker goes down; leader election; producer with `acks=1` vs `acks=all`
2. Consumer lag growing on one partition only (hot tenant / hot key)
3. Consumer rebalance loop (`max.poll.interval.ms` exceeded by slow PHP processing)
4. Poison message blocks a partition
5. Duplicate processing (crash after processing, before offset commit)
6. Event lost between DB commit and Kafka publish (dual write)
7. Out-of-order events for the same order
8. PHP consumer memory leak / long-running process dies silently
9. Deploy restarts consumers mid-message (no graceful shutdown)
10. Schema/payload change breaks old consumers
11. Redis full / eviction removes queue jobs or cache keys
12. Redis restart: are queued jobs lost?
13. Laravel job runs twice because `timeout >= retry_after`
14. Job dispatched before DB transaction commits ("model not found")
15. `failed_jobs` table growing with nobody watching
16. Cache stampede on a heavy report after cache expiry
17. Lock expires while the job is still running
18. One big tenant floods the queue and delays all other tenants (noisy neighbor)
19. RabbitMQ memory alarm blocks producers (if RabbitMQ is used)
20. Network partition / AZ failure on AWS

End with a **Top 5 risks in Sokrio today** list, ranked, with the fix I should propose first.

---

### Phase 8 — Interview Q&A using Sokrio as the example

**Output:** `docs/messaging-knowledge/08-interview-qa.md` (split into parts if long)

Answer **every question** in `interview-questions.md`, plus at least 20 new questions you discover from the Sokrio code. For each question:

```
### Q<n>. <question>
**Short answer (30 seconds):**
**Deep answer:**
**Sokrio example:** (real code with file:line, or "Sokrio does not do this; here is how it would")
**Follow-up questions the interviewer may ask:**
**Common mistakes to avoid:**
```

Also include:
- A **2-minute "tell me about a distributed system you worked on"** answer based on Sokrio's Kafka/order-summary work (PR-5094), in STAR format
- 3 **system design** answers using Sokrio as the base (order pipeline, multi-tenant reporting, notifications)

---

### Phase 9 — Study plan and hands-on labs

**Output:** `docs/messaging-knowledge/09-study-plan-and-labs.md`

- A 4–6 week study plan that follows these files in order
- Hands-on labs that reproduce real Sokrio problems locally with Docker, for example:
  - Kill a Kafka broker and watch producer/consumer behavior
  - Force a rebalance by making a consumer slow
  - Reproduce duplicate processing and then fix it with idempotency
  - Reproduce the `retry_after` double-run bug
  - Fill Redis memory and observe eviction
- A one-page **cheat sheet** of the most important configs and commands (Kafka CLI, Redis CLI, Horizon, Supervisor)

---

## 5. Final folder structure

```
docs/messaging-knowledge/
├── 00-inventory.md
├── 01-architecture-overview.md
├── 02-kafka-in-sokrio.md
├── 03-rabbitmq-in-sokrio.md
├── 04-redis-in-sokrio.md
├── 05-laravel-implementation.md
├── 06-aws-infrastructure.md
├── 07-failure-modes-and-runbooks.md
├── 08-interview-qa.md
├── 09-study-plan-and-labs.md
└── GLOSSARY.md            (every term used, one-line definition)
```

---

## 6. Quality checklist (check before finishing each phase)

- [ ] Every Sokrio claim has a `file:line` reference or a `[NOTES]` / `[ASSUMPTION]` tag
- [ ] No secrets, hostnames or credentials copied
- [ ] Flows have Mermaid diagrams
- [ ] Code snippets are trimmed to the lines that matter
- [ ] Gaps and risks are stated honestly, not hidden
- [ ] "Not found" items list what was searched

---

## 7. How I will use this

1. `Read README.md and start Phase 0.`
2. Review `00-inventory.md`, correct anything wrong, then say `next`.
3. Continue phase by phase.
4. Anytime: `Quiz me on Phase 2` — ask me 5 questions, one at a time, and grade my answers against the code.
5. Anytime: `Explain <topic> simpler` or `Show me the code path for <flow>`.
