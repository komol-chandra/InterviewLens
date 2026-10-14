> Tracker ID: TRK-02 · Generated: 2026-10-15 · Source: `5-tracks/00-plan.md` (TRK-01) · Status: ✅ সব উত্তর জেনারেট হয়েছে (৩০/৩০ + বোনাস) · এখন বাকি: পড়া + জোরে বলা

# System Design + Design Patterns: প্রশ্নের তালিকা

> **কীভাবে ব্যবহার করবে:** প্রতিটা প্রশ্নের উত্তর আলাদা ডকে জেনারেট হবে (Answer ফাইল কলামে path বসবে)। প্রশ্ন ইংরেজিতে, কারণ ইন্টারভিউ ইংরেজিতে। ক্রম = সহজ থেকে কঠিন, ওপর থেকে পড়ো।
> Type: **C** = Concept (ধারণা) · **D** = Design case (পুরো সিস্টেম আঁকো) · **S** = Sokrio-র নিজের গল্প · **Code** = কোড লিখে দেখাও

---

## A) System Design: ১৫টা প্রশ্ন

| # | Question (English) | Type | কী যাচাই করে | Answer ফাইল | Status |
|---|---|---|---|---|---|
| SD-Q01 | How do you approach a system design question in 45 minutes? Walk me through your steps. | C | কাঠামো: requirements → estimation → API → data model → HLD → deep dive → wrap-up | `system-design/01-framework.md` (আছে) | ✅ |
| SD-Q02 | How would you scale a web app from 1,000 to 1 million users? | C | Vertical vs horizontal scaling, load balancer, stateless server, read replica, CDN | `system-design/concepts/02-scaling.md` | ✅ |
| SD-Q03 | Where would you add a cache, and how do you keep it correct? (invalidation, stampede, hot key) | C | Cache-aside vs write-through, TTL, cache stampede, Redis | `system-design/concepts/03-caching.md` | ✅ |
| SD-Q04 | One MySQL server is not enough anymore. What do you do? | C | Index → replication → partitioning → sharding, shard key বাছাই | `system-design/concepts/04-db-scaling.md` | ✅ |
| SD-Q05 | SQL or NoSQL? When do you choose each? | C | ACID vs flexible schema, access pattern, MySQL vs MongoDB | `system-design/concepts/05-sql-vs-nosql.md` | ✅ |
| SD-Q06 | Explain CAP and consistency. When is eventual consistency OK? | C | Strong vs eventual consistency, read-your-writes, real উদাহরণ | `system-design/concepts/06-cap-consistency.md` | ✅ |
| SD-Q07 | When and why would you use a message queue? How do you handle failures in it? | C | Async কাজ, Kafka vs RabbitMQ, retry, dead-letter queue, idempotent consumer | `system-design/concepts/07-queues.md` | ✅ |
| SD-Q08 | Design a URL shortener (like bit.ly). | D | Estimation, ID generation (base62), read-heavy → cache | `system-design/cases/08-url-shortener.md` | ✅ |
| SD-Q09 | Design a rate limiter for an API. | D | Token bucket vs sliding window, Redis-এ distributed counter | `system-design/cases/09-rate-limiter.md` | ✅ |
| SD-Q10 | Design a notification service (SMS, email, push). | D | Queue, retry, provider fallback, duplicate পাঠানো আটকানো | `system-design/cases/10-notification.md` | ✅ |
| SD-Q11 | Design a payment flow. How do you stop a customer from being charged twice? | D | Idempotency key, transaction, reconciliation, Outbox | `system-design/cases/11-payment.md` | ✅ |
| SD-Q12 | Design order + inventory for a distribution company. How do you prevent overselling? | D | Locking (optimistic vs pessimistic), stock reservation, consistency | `system-design/cases/12-order-inventory.md` | ✅ |
| SD-Q13 | Design a work-order dispatch system that matches jobs to nearby technicians. | D | Geo search, matching, state machine, real-time update (Field Nation-ধরনের) | `system-design/cases/13-dispatch.md` (+ FN-14) | ✅ |
| SD-Q14 | Design a multi-tenant SaaS. Database per tenant or shared database? Why? | S | Isolation vs cost, tenant routing, migration সব টেন্যান্টে | `system-design/cases/23-multi-tenant-saas.md` (আছে) | ✅ |
| SD-Q15 | Heavy reports are slow and time out. Design a reporting pipeline that stays fast as data grows. | S | Pre-aggregated summary (MongoDB), cache, async export, queue | `system-design/cases/15-reporting-pipeline.md` | ✅ |

**বোনাস:** How do you make a system reliable? (timeout, retry with backoff, circuit breaker, monitoring/alert) → ✅ `system-design/concepts/11-reliability.md`

> ✅ **System Design অংশ সম্পূর্ণ (১৫/১৫ + বোনাস), 2026-10-15।**

---

## B) Design Patterns: ১৫টা প্রশ্ন

| # | Question (English) | Type | কী যাচাই করে | Answer ফাইল | Status |
|---|---|---|---|---|---|
| DP-Q01 | What is a design pattern? When does using one make code worse? | C | Pattern = পরিচিত সমাধান; over-engineering চেনা; SOLID-এর সাথে সম্পর্ক | `design-patterns/01-principles.md` | ✅ |
| DP-Q02 | Which design patterns have you used in your own project? Show me where. | S | Sokrio কোডে আসল উদাহরণ (Strategy, Observer, Command, Middleware) | `design-patterns/02-sokrio-pattern-map.md` (আছে) | ✅ |
| DP-Q03 | You have many `if/else` blocks for different discount or payment types. How do you clean this up? | Code | **Strategy** pattern, Open/Closed principle | `design-patterns/behavioral/03-strategy.md` | ✅ |
| DP-Q04 | Factory Method vs Abstract Factory: what is the difference? When do you use each? | Code | **Factory**: object তৈরি এক জায়গায় (যেমন report exporter: Excel/PDF/CSV) | `design-patterns/creational/04-factory.md` | ✅ |
| DP-Q05 | An object needs many optional fields to build. How do you avoid a constructor with 10 parameters? | Code | **Builder** pattern, Laravel Query Builder | `design-patterns/creational/05-builder.md` | ✅ |
| DP-Q06 | Why is Singleton often called an anti-pattern? What do you use instead? | C | Global state, টেস্ট কঠিন, Dependency Injection, Laravel service container | `design-patterns/creational/06-singleton.md` | ✅ |
| DP-Q07 | You must support three SMS providers with different APIs. How do you design it so switching is easy? | Code | **Adapter** pattern, interface-এর পেছনে provider | `design-patterns/structural/07-adapter.md` | ✅ |
| DP-Q08 | Add caching and logging to a service without changing its code. How? Decorator vs Proxy? | Code | **Decorator** vs **Proxy**: পার্থক্য আর কখন কোনটা | `design-patterns/structural/08-decorator-proxy.md` | ✅ |
| DP-Q09 | When an order is placed, you need to send SMS, update stock and write a log. How do you keep these decoupled? | Code | **Observer**, Laravel Events/Listeners, sync vs queued listener | `design-patterns/behavioral/09-observer.md` | ✅ |
| DP-Q10 | How do Laravel middleware work? Which pattern is it? | C | **Chain of Responsibility**, pipeline | `design-patterns/behavioral/10-chain.md` | ✅ |
| DP-Q11 | How would you model an action so it can be queued, retried or undone? | Code | **Command** pattern, Laravel Jobs, undo (QA Test Lab-এর revert) | `design-patterns/behavioral/11-command.md` | ✅ |
| DP-Q12 | An order moves through Pending → Approved → Shipped → Delivered. How do you avoid status `if/else` everywhere? | Code | **State** pattern, allowed transition, invalid transition আটকানো | `design-patterns/behavioral/12-state.md` | ✅ |
| DP-Q13 | Several reports share the same steps but differ in one part. How do you avoid copy-paste? | Code | **Template Method** vs Strategy: inheritance vs composition | `design-patterns/behavioral/13-template-method.md` | ✅ |
| DP-Q14 | Is the Repository pattern useful on top of Eloquent? Argue both sides. | C | Repository + Service layer, testability vs অতিরিক্ত layer | `design-patterns/architectural/14-repository.md` | ✅ |
| DP-Q15 | Explain CQRS, Saga, Outbox and Circuit Breaker. When would you use each one? | C | Architecture pattern: microservice-এ data consistency আর failure handling | `design-patterns/architectural/15-distributed-patterns.md` | ✅ |

**বোনাস, Machine coding (৪৫ মিনিটে কোড লেখো):** LRU cache · Parking lot · Rate limiter class · Work-order lifecycle (State pattern) → ✅ `design-patterns/machine-coding/README.md` + ৪টা চলমান `.ts` (নিজস্ব assert টেস্ট সহ)

> ✅ **Design Patterns অংশ সম্পূর্ণ (১৫/১৫ + ৪ machine coding), 2026-10-15।** প্রতিটা DP উত্তরের পাশে চলমান কোড `design-patterns/code/<name>.ts` (সব strict `tsc` পাস)।

---

## উত্তরের ফেজ প্ল্যান (প্রতি ফেজ = এক সেশন, ২–৩টা প্রশ্ন)

প্রতিটা ফেজে ১টা SD + ১–২টা DP, যাতে একঘেয়ে না হয়। Concept আগে, Design case পরে (case-এ concept-গুলো লাগে)।

| ফেজ | প্রশ্ন | Answer ফাইল | Status |
|---|---|---|---|
| **P1** | SD-Q02 scaling · SD-Q03 caching · DP-Q01 pattern কী | `system-design/concepts/02-scaling.md`, `03-caching.md` · `design-patterns/01-principles.md` | ✅ 2026-10-15 |
| **P2** | SD-Q04 MySQL scaling · SD-Q05 SQL vs NoSQL · DP-Q03 Strategy | `concepts/04-db-scaling.md`, `05-sql-vs-nosql.md` · `behavioral/03-strategy.md` (+ চলমান `code/strategy.ts`) | ✅ 2026-10-15 |
| P3 | ~~SD-Q06 CAP · SD-Q07 message queue~~ ✅ · DP-Q04 Factory | `concepts/06-cap-consistency.md`, `07-queues.md` · `creational/04-factory.md` | ✅ 2026-10-15 |
| P4 | ~~SD-Q15 reporting pipeline~~ ✅ · DP-Q05 Builder · DP-Q06 Singleton | `cases/15-reporting-pipeline.md` · `creational/05-builder.md`, `06-singleton.md` | ✅ 2026-10-15 |
| P5 | ~~SD-Q08 URL shortener~~ ✅ · DP-Q07 Adapter · DP-Q08 Decorator vs Proxy | `cases/08-url-shortener.md` · `structural/07-adapter.md`, `08-decorator-proxy.md` | ✅ 2026-10-15 |
| P6 | ~~SD-Q09 rate limiter~~ ✅ · DP-Q09 Observer · DP-Q10 Middleware/Chain | `cases/09-rate-limiter.md` · `behavioral/09-observer.md`, `10-chain.md` | ✅ 2026-10-15 |
| P7 | ~~SD-Q10 notification~~ ✅ · DP-Q11 Command · DP-Q12 State | `cases/10-notification.md` · `behavioral/11-command.md`, `12-state.md` | ✅ 2026-10-15 |
| P8 | ~~SD-Q11 payment~~ ✅ · DP-Q13 Template Method | `cases/11-payment.md` · `behavioral/13-template-method.md` | ✅ 2026-10-15 |
| P9 | ~~SD-Q12 order + inventory~~ ✅ · DP-Q14 Repository | `cases/12-order-inventory.md` · `architectural/14-repository.md` | ✅ 2026-10-15 |
| P10 | ~~SD-Q13 dispatch~~ ✅ · DP-Q15 CQRS/Saga/Outbox/CB | `cases/13-dispatch.md` · `architectural/15-distributed-patterns.md` | ✅ 2026-10-15 |
| বোনাস | ~~Reliability~~ ✅ `concepts/11-reliability.md` · ৪টা machine coding ✅ | `design-patterns/machine-coding/` (LRU, parking lot, rate limiter, work-order lifecycle) | ✅ 2026-10-15 |

> **2026-10-15:** Komol-এর অনুরোধে সব SD প্রশ্ন একসাথে শেষ, তারপর একই দিনে বাকি ১২টা DP + ৪টা machine coding। **৩০/৩০ সম্পূর্ণ।** এখন কাজ শুধু পড়া (🟡 → 🔵) আর জোরে বলা (→ ✅)।
> ⚠️ HM রাউন্ড (D-0 ≈ ১০-২৩) আগে। P2–P10 পড়া এর পাশে দিনে ≤৩০ মিনিট; HM প্রস্তুতি আগে।

---

## উত্তর জেনারেট করার সময় নিয়ম

- এক সেশনে **২–৩টা প্রশ্ন**, সব একসাথে না (আগে ২১টা ডক একসাথে বানিয়ে একটাও পড়া হয়নি)
- প্রতিটা উত্তর: সহজ ব্যাখ্যা → ডায়াগ্রাম/কোড (TypeScript, পাশে Laravel) → trade-off → মুখে বলার ইংরেজি লাইন → `🔗 Sokrio link:`
- উত্তর তৈরি হলে এই টেবিলে Answer ফাইল + Status (✅) বসাও, আর `tracker.md`-এ সারি যোগ করো

🔗 প্ল্যান: `5-tracks/00-plan.md` (TRK-01)
