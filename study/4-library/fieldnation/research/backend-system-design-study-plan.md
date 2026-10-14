# Backend & System Design Study Plan: Field Nation Software Engineer

**Target role:** Software Engineer, Field Nation (Dhaka, hybrid, 1 PM – 10 PM, BDT 80k–120k)
**Focus:** Backend engineering and system design, with each topic mapped to the job post
**Created:** 2026-09-27
**Pace:** about 5 weeks at 3–4 hrs/day on weekdays and 6 hrs/day on weekends. A **2-week fast track** is in Section 3.

---

## 0. Know the Domain First

Every answer is stronger if you speak Field Nation's language. Learn this model before anything else.

| Concept | What it means | Sokrio parallel you can mention |
|---|---|---|
| **Buyer / Client** | A company that needs on-site work done (IT, POS, networking, telecom installs) | Enterprise tenant |
| **Provider / Technician** | A freelance field tech who takes work orders | Field-force user / sales rep |
| **Work Order (WO)** | The core entity: scope, location, schedule, pay, deliverables, status | Order / Task Manager task |
| **Routing / Dispatch** | Sending a WO to the right techs (by skills, distance, rating, availability) | Territory-scoped assignment |
| **Check-in / Check-out** | GPS and time-stamped arrival and departure on site | Van attendance, check-ins, GPS-spoofing detection |
| **Deliverables** | Photos, signatures, documents uploaded as proof of work | Vehicle feedback uploads |
| **Approval → Payment** | Buyer approves the work, then the platform pays the provider | Payment gateway + reconciliation |
| **Ratings** | Buyer ↔ provider quality scores that drive future routing | Performance reports |
| **Integrations** | Buyers connect their ticketing tools through a REST API and webhooks | SOAP/REST sync for legacy clients |

**Work-order lifecycle (memorise it):**
`Draft → Published → Routed/Requested → Assigned → Confirmed → Checked-in → Checked-out → Work Done → Approved → Paid` (plus `Cancelled`, `On Hold`, `Problem Reported`)

**Stack from the post:** PHP + MySQL (legacy core) → **Node.js microservices** (the migration target), REST APIs, React/Redux, Docker + **Kubernetes** on **AWS**, **SLI/SLO observability**, RabbitMQ/Kafka (plus).

> 🎯 Your one-line pitch: *"At Sokrio I built a multi-tenant field-force and order platform (check-ins, GPS, tasks, payments, integrations) and led its move from a monolith to event-driven microservices. That is the same shape of problem Field Nation is solving."*

---

## 1. Phase Map

| Phase | Topic | Days | Priority |
|---|---|---|---|
| 1 | HTTP and REST API design | 2 | 🔴 Must |
| 2 | Node.js + TypeScript backend | 4 | 🔴 Must |
| 3 | PHP/Laravel depth (the legacy core) | 1 | 🟡 Review |
| 4 | MySQL deep dive | 4 | 🔴 Must |
| 5 | Caching and Redis | 2 | 🟠 High |
| 6 | Async, queues and event-driven design | 3 | 🟠 High |
| 7 | Microservices architecture | 3 | 🔴 Must |
| 8 | Docker, Kubernetes and AWS | 3 | 🟠 High |
| 9 | Observability and reliability (SLI/SLO) | 2 | 🟠 High |
| 10 | Backend testing and TDD | 2 | 🟠 High |
| 11 | System design fundamentals | 3 | 🔴 Must |
| 12 | System design case studies (Field Nation style) | 5 | 🔴 Must |
| 13 | Mock interviews and revision | 2 | 🔴 Must |

**Running project:** build one small **`fn-lite`** service throughout the phases, adding a piece in each one. By the end you have a GitHub repo to show and real stories to tell.

```
fn-lite/
├── work-order-service/   (Node.js + TS, NestJS or Express, MySQL)
├── notification-service/ (Node.js, consumes RabbitMQ events)
├── docker-compose.yml    (mysql, redis, rabbitmq, services)
└── k8s/                  (deployment, service, configmap, probes)
```

---

## 2. Phases in Detail

### Phase 1: HTTP and REST API Design (2 days)

**Why:** The post says "exposed via REST API" and "troubleshoot integration issues" with customers. Field Nation clients integrate through its public API and webhooks.

**Topics**
- [ ] HTTP methods and safety/idempotency (GET, PUT and DELETE are idempotent; POST is not)
- [ ] Status codes that matter: 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500, 503
- [ ] Resource naming: `/work-orders/{id}/assignments`, not `/assignWorkOrder`
- [ ] Pagination: offset vs **cursor/keyset**; filtering and sorting conventions
- [ ] Versioning: URL (`/v2/`) vs header
- [ ] **Idempotency keys** on POST (for payments and WO creation from client retries)
- [ ] Auth: API keys vs OAuth2 client credentials vs JWT; access vs refresh tokens
- [ ] Rate limiting (`429` + `Retry-After`)
- [ ] **Webhooks:** delivery, retries with backoff, HMAC signatures, replay protection, ordering
- [ ] Error format (RFC 7807 `problem+json`), consistent error envelopes
- [ ] CORS, HTTPS/TLS basics, caching headers (ETag, Cache-Control)

**Field Nation context:** a buyer's ticketing system creates WOs through the API and receives a `workorder.status_changed` webhook. What happens if that webhook fails or arrives twice?

**Hands-on (fn-lite):** design the OpenAPI spec for `POST /work-orders`, `GET /work-orders?status=&cursor=`, `POST /work-orders/{id}/assign`, `POST /work-orders/{id}/check-in`.

**Interview questions**
1. PUT vs PATCH? Is PATCH idempotent?
2. A client's POST timed out and they retried. Now there are two work orders. How do you prevent that?
3. How would you design webhooks so a client can trust and deduplicate them?
4. Why is offset pagination slow on 10M rows? How does a cursor fix it?
5. 401 vs 403? 400 vs 422?

**Done when:** you can design a clean REST API for any entity on a whiteboard in 10 minutes.

---

### Phase 2: Node.js + TypeScript Backend (4 days)

**Why:** "Increasingly transitioning to Node.js microservices" and "strong understanding of TypeScript and ES6" in the post. **This is your biggest gap.**

**Topics**
- [ ] **Event loop:** call stack, libuv, phases (timers → pending → poll → check → close), microtasks (`Promise`, `queueMicrotask`) vs macrotasks, `process.nextTick`
- [ ] Non-blocking I/O; why CPU-heavy work blocks everything (fix with worker_threads or a separate service)
- [ ] async/await error handling, unhandled rejections, `Promise.all` / `allSettled` / `race`
- [ ] Streams and backpressure (for large CSV exports or imports)
- [ ] Modules: CommonJS vs ESM
- [ ] TypeScript: types vs interfaces, generics, `unknown` vs `any`, utility types, discriminated unions (good for the WO status state machine), `strict` mode
- [ ] **Express:** middleware chain, error middleware, routers
- [ ] **NestJS:** modules, controllers, providers, **dependency injection**, DTOs + `class-validator`, pipes, guards, interceptors, exception filters, the full request lifecycle
- [ ] ORM: TypeORM or Prisma, migrations, transactions
- [ ] Config and secrets (`@nestjs/config`, env validation)
- [ ] Graceful shutdown (SIGTERM, which matters for K8s), health endpoints
- [ ] Scaling Node: the cluster module vs more pods behind a load balancer

**Map from Laravel (use this in interviews):**

| Laravel | NestJS |
|---|---|
| Service container / providers | DI container / providers |
| FormRequest | DTO + ValidationPipe |
| Middleware / Policies | Middleware / Guards |
| Resources (API transformers) | Interceptors / serialization |
| Exception Handler | Exception Filters |
| Queued Jobs | BullMQ / RabbitMQ consumers |
| Eloquent | TypeORM / Prisma |

**Hands-on (fn-lite):** build `work-order-service` in NestJS + TypeORM + MySQL with CRUD, a **status state machine** (reject invalid transitions with `409`), validation, a global error filter, and `/health`.

**Interview questions**
1. What does this print? (`setTimeout`, `setImmediate`, `Promise.then`, `nextTick` ordering puzzles)
2. Node is single-threaded, so how does it handle 10k concurrent connections?
3. An endpoint generates a big PDF and the whole API slows down. Why, and what is the fix?
4. Explain the NestJS request lifecycle.
5. How would you model WO status transitions safely in TypeScript?

**Done when:** you can explain the event loop with a diagram, and fn-lite runs with tests passing.

---

### Phase 3: PHP / Laravel Depth, the Legacy Core (1 day)

**Why:** "Backend built with PHP and MySQL." You already have strength here, so polish how you explain it.

- [ ] PHP-FPM request lifecycle (shared-nothing per request) vs Node's long-running process. **Great comparison question.**
- [ ] Laravel service container, providers, facades, middleware pipeline
- [ ] Eloquent: N+1, `with()`, chunking, `lazy()`, transactions, locking (`lockForUpdate`)
- [ ] Queues: retries, backoff, `failed_jobs`, unique jobs, idempotency
- [ ] OPcache, PHP 8.x features (enums, readonly, match, attributes)
- [ ] Your multi-tenant story: landlord/tenant DB switching and preventing cross-tenant leaks

**Interview question:** "PHP vs Node: why would a company move services from PHP to Node, and what would you keep in PHP?"

---

### Phase 4: MySQL Deep Dive (4 days)

**Why:** "Knowledge of SQL, MySQL specifically is a plus." A WO marketplace is transaction-heavy.

**Topics**
- [ ] InnoDB storage: clustered primary key index, secondary indexes point to the PK
- [ ] **Indexes:** B-tree, composite, **leftmost prefix**, covering indexes, cardinality, when an index is NOT used (functions on columns, leading `%LIKE`, implicit type casts)
- [ ] **EXPLAIN:** `type` (const/ref/range/index/ALL), `key`, `rows`, `Extra` (Using index / filesort / temporary)
- [ ] Joins, subqueries vs joins, `GROUP BY` / `HAVING`
- [ ] **Window functions:** `ROW_NUMBER`, `RANK`, `LAG`, running totals
- [ ] CTEs (including recursive, for territory or region trees)
- [ ] **Transactions + ACID**, isolation levels (READ COMMITTED vs REPEATABLE READ, the InnoDB default), phantom reads, MVCC
- [ ] **Locking:** row locks, gap/next-key locks, `SELECT … FOR UPDATE`, deadlocks and how to avoid them (consistent lock order, short transactions)
- [ ] **Optimistic locking** (a `version` column) vs pessimistic locking
- [ ] Normalization vs denormalization for reads
- [ ] Replication (primary → read replicas, replication lag), partitioning basics
- [ ] Safe schema migrations on big tables (online DDL, expand → migrate → contract)

**Field Nation context: the key problem**
> Two technicians click "Accept" on the same work order at the same millisecond. Only one can win.

Know three solutions:
1. `UPDATE work_orders SET provider_id=?, status='assigned' WHERE id=? AND status='published'`, then check that `affected_rows = 1` (conditional update, the simplest)
2. `SELECT … FOR UPDATE` inside a transaction (pessimistic)
3. A `version` column (optimistic)

**Practice SQL (write these):**
1. Top 3 providers by completed WOs per region last month (window function)
2. Providers who have not checked in to any WO in the last 30 days
3. Average time from `published` to `assigned` per buyer
4. WOs where check-out happened before check-in (data quality check)
5. Running total of payouts per provider by week
6. Design indexes for: `WHERE buyer_id=? AND status=? ORDER BY scheduled_at DESC LIMIT 20`

**Hands-on (fn-lite):** implement "accept WO" with a conditional update, then write a test that fires 20 concurrent accepts and asserts exactly one wins.

**Done when:** you can read EXPLAIN output and design a composite index out loud, with reasons.

---

### Phase 5: Caching and Redis (2 days)

- [ ] Cache-aside, write-through, write-behind; TTL choice
- [ ] **Invalidation strategies** and stale data trade-offs
- [ ] Cache stampede / thundering herd: locking, jittered TTL, stale-while-revalidate
- [ ] Redis data structures: strings, hashes, sets, sorted sets (leaderboards, rate limits), **GEO** (nearby technicians)
- [ ] Redis for **distributed locks** (SET NX PX, the Redlock caveats), **rate limiting** (token bucket / sliding window), sessions, queues
- [ ] Cache key design with scoping. Your Sokrio rule: *always include the tenant or territory in the key*
- [ ] Redis persistence (RDB/AOF), eviction policies (allkeys-lru)

**Field Nation context:** cache a provider's profile and rating; use `GEOADD`/`GEOSEARCH` to find providers within 50 km of a WO.

**Interview questions:** How do you keep the cache consistent after an update? What happens when Redis goes down?

---

### Phase 6: Async, Queues and Event-Driven Design (3 days)

**Why:** "Event-Driven Architecture (RabbitMQ / Kafka) is a plus." You already have RabbitMQ migration experience, so go deep.

**Topics**
- [ ] Why async: decoupling, absorbing load spikes, retries, slow side effects (email, SMS, PDFs)
- [ ] **RabbitMQ:** exchanges (direct/topic/fanout), queues, bindings, routing keys, acks/nacks, prefetch, **DLX/DLQ**, TTL, durable/persistent messages
- [ ] **Kafka:** topics, partitions, offsets, consumer groups, ordering per partition key, retention and replay
- [ ] **RabbitMQ vs Kafka:** a message broker (task queue) vs a distributed log (event stream)
- [ ] Delivery semantics: at-most-once, **at-least-once**, the "exactly-once" myth
- [ ] **Idempotent consumers** (dedupe table keyed by event id)
- [ ] **Transactional outbox pattern** (the DB write and the event publish can't be one transaction, so the outbox makes them atomic)
- [ ] Retries with exponential backoff + jitter, poison messages
- [ ] Event design: event vs command, naming (`WorkOrderAssigned`), schema versioning, fat vs thin events
- [ ] Ordering problems and how to handle them

**Field Nation context:**
```
WorkOrderService --(WorkOrderAssigned)--> RabbitMQ topic exchange
    ├── NotificationService → push/SMS/email to tech + buyer
    ├── CalendarService     → block tech's schedule
    ├── AuditService        → immutable history
    └── WebhookService      → notify buyer's integration
```

**Hands-on (fn-lite):** publish `WorkOrderAssigned` through an outbox table and a relay, and consume it in `notification-service` with dedupe and a DLQ.

**Interview questions**
1. The DB commit succeeded but publishing the event failed. What happens, and how do you fix it?
2. A consumer processes the same message twice. How do you make that safe?
3. When would you choose Kafka over RabbitMQ?

---

### Phase 7: Microservices Architecture (3 days)

**Why:** "Increasingly transitioning to Node.js microservices." They are *in the middle of* a migration, and **you have led one.** This is your strongest story.

**Topics**
- [ ] Monolith vs modular monolith vs microservices: trade-offs, and when NOT to split
- [ ] **Service boundaries** with DDD bounded contexts (Work Orders, Providers, Payments, Notifications, Ratings)
- [ ] Sync (REST/gRPC) vs async (events) communication
- [ ] **API Gateway / BFF**, service discovery
- [ ] **Database per service** and the problem of shared databases
- [ ] Distributed transactions: why 2PC is avoided, **Saga** (choreography vs orchestration), compensating actions
- [ ] **Strangler fig migration** (a proxy routes piece by piece from PHP to Node)
- [ ] Resilience: timeouts, retries, **circuit breaker**, bulkhead, fallbacks
- [ ] Data consistency: eventual consistency, read models / CQRS basics
- [ ] Contract testing (Pact), API versioning between services
- [ ] Auth between services (JWT propagation, mTLS basics)

**Field Nation context: saga for "Approve & Pay"**
```
Buyer approves WO
 → PaymentService: charge buyer (or deduct prepaid funds)
 → PayoutService: schedule provider payout
 → WorkOrderService: status = Paid
 ✗ payout fails → compensate: refund/hold + status = Payment Issue + alert
```

**Your story (practise it in 3 minutes):** Laravel 8/Vue monolith → Laravel core API + React apps + Report/Notification/SOP services over RabbitMQ + MongoDB + Redis; parallel run for a zero-downtime cutover; about 20% lower server load. Cover **what went wrong and what you would do differently.**

**Interview questions**
1. How would you pull the "notifications" feature out of a PHP monolith into a Node service with no downtime?
2. What is wrong with two services sharing one MySQL database?
3. Choreography vs orchestration saga: which fits WO payment, and why?

---

### Phase 8: Docker, Kubernetes and AWS (3 days)

**Why:** "Docker containers managed by Kubernetes" and "hosted on AWS."

**Docker**
- [ ] Image vs container, layers and caching, **multi-stage builds**, small base images (alpine/distroless), `.dockerignore`
- [ ] Running as non-root, HEALTHCHECK, env config, volumes, networks
- [ ] docker-compose for local development

**Kubernetes**
- [ ] Pod, ReplicaSet, **Deployment**, **Service** (ClusterIP/NodePort/LoadBalancer), **Ingress**
- [ ] ConfigMap, Secret, namespaces
- [ ] **Liveness vs readiness vs startup probes**
- [ ] Resource requests/limits, **HPA** autoscaling
- [ ] Rolling updates, rollbacks, graceful shutdown (SIGTERM + preStop)
- [ ] Jobs/CronJobs (for scheduled reports and payouts)
- [ ] `kubectl` basics: get, describe, logs, exec, rollout

**AWS (review your existing AWS guide)**
- [ ] EC2, **EKS**/ECS, **RDS MySQL** (Multi-AZ, read replicas), S3 (deliverable photos, presigned URLs), **SQS/SNS**, ElastiCache, CloudFront, ALB
- [ ] IAM roles and least privilege, VPC, public vs private subnets, security groups
- [ ] CloudWatch logs, metrics and alarms

**Hands-on (fn-lite):** containerise both services with a multi-stage Dockerfile, then deploy to **minikube/kind** with a Deployment, Service, probes, ConfigMap and HPA.

**Interview questions**
1. A pod keeps restarting. How do you debug it? (`describe`, `logs --previous`, probes, OOMKilled)
2. Readiness vs liveness: what breaks if you mix them up?
3. How should technicians upload photos straight to S3 without sending them through your API?

---

### Phase 9: Observability and Reliability (2 days)

**Why:** "Ensure service observability, monitoring, alerts, and maintenance of SLI/SLO." You also said you're passionate about reliability, so **own this topic.**

**Topics**
- [ ] The three pillars: **logs** (structured JSON, correlation IDs), **metrics**, **traces** (distributed tracing, OpenTelemetry)
- [ ] **SLI / SLO / SLA / error budget**
- [ ] Golden signals: latency, traffic, errors, saturation. RED method (services) and USE method (resources)
- [ ] Percentiles (p50/p95/p99) vs averages
- [ ] Alerting on symptoms, not causes; alert fatigue; burn-rate alerts
- [ ] APM tools: Datadog, New Relic, Grafana/Prometheus, CloudWatch
- [ ] Incident response: detect → mitigate → resolve → **blameless postmortem**
- [ ] Health checks and dependency checks

**Field Nation example SLOs (write your own too):**

| Service | SLI | SLO |
|---|---|---|
| Work Order API | % of `GET /work-orders` requests under 300 ms | 99% over 30 days |
| Work Order API | % of non-5xx responses | 99.9% (≈ 43 min error budget/month) |
| Check-in | % of check-ins recorded successfully | 99.95% |
| Webhooks | % delivered within 60 s | 99% |
| Payouts | % processed on the scheduled date | 99.9% |

**Your story:** 24/7 on-call for 6 production apps; cut resolution time by 65% with CloudWatch, Telescope and structured logging.

**Interview questions**
1. Define an SLO for the check-in feature. What do you alert on?
2. p99 latency spiked but the average looks fine. What might be happening?
3. How do you trace one request across 4 microservices?

---

### Phase 10: Backend Testing and TDD (2 days)

- [ ] Test pyramid: unit → integration → contract → e2e
- [ ] **TDD red → green → refactor** (practise live, because interviewers love this)
- [ ] Mocks vs stubs vs fakes vs spies; don't over-mock
- [ ] Jest + Supertest (Node), PHPUnit (Laravel)
- [ ] Testing with a real DB (Testcontainers / docker MySQL) vs in-memory
- [ ] Testing queue consumers and idempotency
- [ ] Contract tests between services (Pact)
- [ ] Test data builders and factories

**Hands-on (fn-lite):** TDD the WO state machine. Write the failing test for `checked_in → approved` (invalid, expect 409) first.

---

### Phase 11: System Design Fundamentals (3 days)

**The interview framework (use it every time, about 45 min):**
1. **Clarify requirements** (5 min): functional + non-functional (scale, latency, availability, consistency)
2. **Estimate** (3 min): users, QPS, storage, bandwidth
3. **API design** (5 min)
4. **Data model** (5 min)
5. **High-level design** (10 min): boxes and arrows
6. **Deep dive** (10 min): the hardest 1–2 parts
7. **Bottlenecks and trade-offs** (5 min): failure modes, scaling, monitoring

**Topics**
- [ ] Back-of-envelope maths (1 day ≈ 86,400 s ≈ 10⁵; QPS = daily requests / 10⁵; peak ≈ 2–3× average)
- [ ] Vertical vs horizontal scaling; stateless services
- [ ] Load balancers (L4 vs L7), algorithms (round robin, least connections)
- [ ] **CAP / PACELC**, strong vs eventual consistency
- [ ] Replication (leader-follower, multi-leader), **sharding** (by key, range, hash; hot shards)
- [ ] SQL vs NoSQL choice (when MongoDB, when MySQL; you have used both)
- [ ] Caching layers (CDN → app cache → DB cache)
- [ ] Message queues for decoupling
- [ ] Rate limiting algorithms (token bucket, leaky bucket, sliding window)
- [ ] Consistent hashing
- [ ] Search (Elasticsearch/OpenSearch basics), geo-indexing (geohash, quadtree, Redis GEO, MySQL spatial)
- [ ] Blob storage + CDN; presigned uploads
- [ ] Idempotency, retries, timeouts, backpressure across the system

**Resources**
- *System Design Interview* Vol 1 by Alex Xu (chapters 1–6, plus rate limiter, notification, and chat)
- ByteByteGo / "Designing Data-Intensive Applications" ch. 5–9 (replication, partitioning, transactions, consistency)
- The Hussein Nasser YouTube channel (backend fundamentals)

---

### Phase 12: System Design Case Studies, Field Nation Style (5 days)

Do one per day. Draw it, talk it through out loud for 35–45 min, then write down its weak spots.

#### Case 1: Work Order Marketplace (the core) ⭐
*Buyers post WOs; techs are routed, accept, check in and out, upload deliverables; buyers approve and pay.*
- Entities: Buyer, Provider, WorkOrder, Assignment, CheckIn, Deliverable, Payment, Rating
- Deep dives: **accept race condition**, WO state machine, deliverable uploads (S3 presigned), approval → payment saga
- Scale: say 50k WOs/day, 200k providers, peak mornings in US time zones

#### Case 2: Technician Matching / Routing ⭐
*Find the best 20 qualified techs near a WO and notify them.*
- Filters: skills, certifications, distance, availability, rating, past work with this buyer, blocked lists
- Geo: geohash / Redis GEO / MySQL spatial index / OpenSearch geo queries
- Ranking score; precompute vs compute per request; fairness (don't always ping the same techs)
- Async: a `WorkOrderPublished` event → matching worker → `ProvidersNotified`

#### Case 3: Notification System
*Push, SMS, email and in-app notifications for status changes, schedule reminders, and new WOs nearby.*
- Fan-out via a queue, per-channel workers, templates, user preferences, quiet hours / time zones
- Retries, DLQ, dedupe, rate limits per provider (Twilio/SES/FCM)
- Scheduled reminders ("WO starts in 1 hour") with a delayed queue or scheduler

#### Case 4: Payments and Provider Payouts
*Buyer funds → platform fee → provider payout (weekly or instant).*
- Double-entry ledger table, **idempotency keys**, reconciliation job, webhooks from the payment provider
- Why you never use floats for money; handling currency
- Your Sokrio story: HMAC, idempotency, auto-reconciliation, zero failed transactions

#### Case 5: Public API + Webhooks Platform for Integrations
*Buyers' ServiceNow/Salesforce-style tools create WOs and receive status updates.*
- API keys/OAuth, per-client rate limiting, versioning
- Webhook delivery service: outbox → queue → delivery workers → exponential retries → disable after N failures → replay UI
- Debugging customer integration issues (request logs by client, correlation IDs). The job post asks for exactly this.

#### Bonus (if time allows)
- **Rate limiter** (a classic interview question)
- **GPS check-in with fraud detection** (your GPS-spoofing work, told as a design)
- **Audit log / activity history** for every WO change (append-only, event sourcing-lite)
- **Scheduling/availability calendar** for providers (overlapping time-range queries)

**For each case, write down:** requirements · estimates · API · schema · diagram · 2 deep dives · failure modes · SLOs.

---

### Phase 13: Mock Interviews and Revision (2 days)

- [ ] 2 full mocks (a friend, Pramp/interviewing.io, or AI mock with a strict interviewer prompt)
  - 30 min backend concepts (Phases 1–10)
  - 45 min system design (a random case from Phase 12)
- [ ] Record yourself and check: did you clarify requirements first? Did you talk about trade-offs?
- [ ] Revise the weakest two phases
- [ ] Re-draw Case 1 and Case 2 from memory
- [ ] Push `fn-lite` to GitHub with a clean README and an architecture diagram

---

## 3. Two-Week Fast Track (if the interview is soon)

| Day | Do |
|---|---|
| 1 | Section 0 (domain) + Phase 1 (REST) |
| 2–3 | Phase 2 (Node.js/TS event loop + NestJS basics) |
| 4–5 | Phase 4 (MySQL: indexes, EXPLAIN, transactions, the accept race) |
| 6 | Phase 6 (queues, outbox, idempotency) |
| 7 | Phase 7 (microservices + your migration story) |
| 8 | Phase 8 (Docker/K8s essentials) + Phase 9 (SLI/SLO) |
| 9 | Phase 11 (framework + fundamentals) |
| 10 | Case 1: Work Order Marketplace |
| 11 | Case 2: Technician Matching |
| 12 | Case 4: Payments + Case 5: Webhooks (lighter) |
| 13 | Mock interview + fixes |
| 14 | Light revision, rest |

---

## 4. Progress Tracker

| Phase | Status | Confidence (0–3) | Notes |
|---|---|---|---|
| 0 Domain | ☐ | | |
| 1 REST | ☐ | | |
| 2 Node/TS | ☐ | | |
| 3 PHP/Laravel | ☐ | | |
| 4 MySQL | ☐ | | |
| 5 Redis | ☐ | | |
| 6 Event-driven | ☐ | | |
| 7 Microservices | ☐ | | |
| 8 Docker/K8s/AWS | ☐ | | |
| 9 Observability | ☐ | | |
| 10 Testing/TDD | ☐ | | |
| 11 SD fundamentals | ☐ | | |
| 12 SD cases | ☐ | | |
| 13 Mocks | ☐ | | |

**Rule:** a phase is done only when you can **explain it out loud without notes** and have **one hands-on artefact** (code, diagram, or SQL) for it.
