> Tracker ID: TRK-01 · Generated: 2026-10-15 · Status: **📝 draft, Komol-এর অনুমোদনের অপেক্ষায়** · Source: `study/` বিদ্যমান কনটেন্ট স্ক্যান

# Plan: System Design + Coding Design Patterns ট্র্যাক

## ০. লক্ষ্য

দুটো আলাদা স্কিল, দুটো আলাদা ইন্টারভিউ রাউন্ড:

| | **System Design (HLD)** | **Design Patterns + LLD** |
|---|---|---|
| প্রশ্ন | "Design a notification service for 10M users" | "Design a parking lot / LRU cache, class দিয়ে কোড করো" · "Strategy আর State-এর পার্থক্য কী?" |
| আউটপুট | বক্স-অ্যারো ডায়াগ্রাম + trade-off | class diagram + **চলমান কোড** |
| মাপে | scale, bottleneck, trade-off বিচার | OOP, SOLID, extensibility, clean code |

**শেষে যা পারবে:**
- যেকোনো HLD প্রশ্ন ৪৫ মিনিটের ফ্রেমওয়ার্কে জোরে বলা + আঁকা, প্রতিটা সিদ্ধান্তে trade-off
- ১৬টা GoF pattern + ৮টা architecture pattern: প্রতিটার সমস্যা, কোড (TypeScript), Laravel/Sokrio-তে কোথায় আছে, কখন **ব্যবহার করবে না**
- ৬টা LLD প্রবলেম ৪৫ মিনিটে চলমান কোডে

---

## ১. যা আগে থেকে আছে: পুনরায় লিখব না, লিংক করব

| বিদ্যমান | কভার করে | ফাঁক |
|---|---|---|
| `4-library/cs/01-oop-design-pattern/` (notes + cheatsheet + ২০ Q deep-dive) | OOP, SOLID, Factory, Strategy, Observer, Repository, Singleton, Facade, Decorator | চলমান কোড নেই; Builder, Adapter, Proxy, Command, State, Chain ইত্যাদি নেই; LLD প্র্যাকটিস নেই |
| `4-library/cs/07-system-design-bd/` | ৫টা BD সিনারিও (order/stock, ticket, report job, CSV, failed job) | ফান্ডামেন্টাল কনসেপ্ট আর ফ্রেমওয়ার্ক নেই |
| `4-library/cs/08-kafka-redis-rabbitmq/` | queue, cache, delivery guarantee | ভালো, এটাই SD-এর queue/cache অধ্যায় হবে |
| `4-library/fieldnation/system-design/` | FN-14 dispatch, FN-15 PHP→Node | কেস হিসেবে রাখব |
| `4-library/fieldnation/research/backend-system-design-study-plan.md` | ১৩-ফেজের বিস্তৃত backend প্ল্যান | FN-কেন্দ্রিক, টপিক লিস্ট নেব |

---

## ২. ফোল্ডার স্ট্রাকচার (প্রস্তাব)

নতুন টপ-লেভেল **`5-tracks/`** = দীর্ঘমেয়াদি স্টাডি ট্র্যাক। একটা ট্র্যাকের পড়া + প্র্যাকটিস + অগ্রগতি **এক ফোল্ডারে** থাকে, যাতে আগের মতো তিন জায়গায় ছড়িয়ে না যায়।

```
5-tracks/
├── 00-plan.md                       ← এই ফাইল
│
├── system-design/                   (ID: SD-xx)
│   ├── 00-roadmap.md                ← অধ্যায় লিস্ট + চেকবক্স + self-rating
│   ├── 01-framework.md              ← ৪৫-মিনিট ফ্রেমওয়ার্ক + back-of-envelope estimation চিটশিট
│   ├── concepts/                    ← বিল্ডিং ব্লক (১০টা)
│   ├── cases/                       ← কেস স্টাডি (১২টা)
│   └── drills.md                    ← টাইমড প্র্যাকটিস লগ (তারিখ, কেস, সময়, স্কোর, ভুল)
│
└── design-patterns/                 (ID: DP-xx)
    ├── 00-roadmap.md
    ├── 01-principles.md             ← SOLID/DRY/KISS/YAGNI/composition (cs/01-এর ওপর ১ পাতার রিভিশন + লিংক)
    ├── creational/  structural/  behavioral/  architectural/   ← প্রতি pattern = ১ ফাইল
    ├── lld/                         ← machine-coding প্রবলেম (প্রতিটা = ১ ফাইল)
    └── code/                        ← চলমান TypeScript (`npx tsx code/strategy.ts`)
```

---

## ৩. System Design: কনটেন্ট

### ৩.১ Concepts (বিল্ডিং ব্লক)

| ID | অধ্যায় | মূল প্রশ্ন | Sokrio link |
|---|---|---|---|
| SD-01 | ফ্রেমওয়ার্ক + estimation | Requirements → Estimate → API → Data model → HLD → Deep dive → Trade-offs | — |
| SD-02 | Scaling + Load balancing | vertical vs horizontal, stateless, L4/L7, sticky session | S1 |
| SD-03 | Caching | cache-aside/write-through, invalidation, stampede, TTL | S2, A2 (TTL 600→10800s) |
| SD-04 | DB: replication, sharding, partitioning | read replica, shard key, hot partition | S3 (per-tenant DB = এক ধরনের sharding) |
| SD-05 | SQL vs NoSQL, indexing | কখন MySQL, কখন Mongo | S2, A5 (Task Manager MySQL বেছে নেওয়া) |
| SD-06 | CAP, consistency, transactions | strong vs eventual, isolation, distributed tx | — |
| SD-07 | Queues, streams, async | → `4-library/cs/08-kafka-redis-rabbitmq/` লিংক + delta | S1, Kafka observer |
| SD-08 | API design + rate limiting | REST/pagination/idempotency, token bucket | S5 |
| SD-09 | ID generation, hashing, consistent hashing | Snowflake, UUID, ring | — |
| SD-10 | Storage, CDN, search, geo | blob, CDN, Elasticsearch, geohash | S9 (GPS) |
| SD-11 | Reliability + observability | retry/backoff, circuit breaker, SLO | S4, A3 |

### ৩.২ Cases (কেস স্টাডি)

প্রতিটা কেস একই ৭-ধাপের ছাঁচে (FN-14-এর মতো), শেষে "**Sokrio-এ যা করেছি vs এখানে নতুন**"।

| ID | কেস | কেন |
|---|---|---|
| SD-20 | URL shortener | ক্লাসিক ওয়ার্ম-আপ: ID gen, cache, read-heavy |
| SD-21 | Rate limiter (distributed) | Redis, algorithm, প্রায়ই আসে |
| SD-22 | Notification service (push/SMS/email) | queue, retry, fan-out; Sokrio-র SOP/notification-এর সাথে মিল |
| SD-23 | Multi-tenant SaaS platform | **তোমার সবচেয়ে শক্তিশালী কেস** (A1), নিজের সিস্টেম হিসেবে বলবে |
| SD-24 | Reporting / analytics pipeline | **A2**: rollups, fan-out, cache |
| SD-25 | Chat / real-time messaging | WebSocket, presence, ordering |
| SD-26 | News feed / timeline | fan-out on write vs read |
| SD-27 | File upload + processing (CSV import) | presigned URL, async job (BD সিনারিও ৪ রিইউজ) |
| SD-28 | Payment / wallet | idempotency, ledger, reconciliation (S5) |
| SD-29 | Order + inventory (oversell প্রতিরোধ) | locking, reservation (BD সিনারিও ১ রিইউজ) |
| SD-30 | Ride / technician matching | geo + dispatch → FN-14 লিংক |
| SD-31 | Distributed job scheduler | cron at scale, Sokrio scheduled job |

---

## ৪. Design Patterns + LLD: কনটেন্ট

### ৪.১ প্রতিটা pattern ফাইলের ছাঁচ

```
## Problem: কোন ব্যথা দূর করে (১ প্যারা, বাস্তব উদাহরণ)
## Structure: ছোট mermaid class diagram
## Code: TypeScript (code/-এ চলমান ফাইল), আগে "ছাড়া" → পরে "সহ"
## In the wild: Laravel-এ কোথায় (যেমন Pipeline = Chain of Responsibility) + Sokrio কোডে কোথায়
## When NOT to use: over-engineering-এর লক্ষণ
## Interview Qs: ৩টা প্রশ্ন + ছোট উত্তর · 🔗 Sokrio link
```

### ৪.২ Pattern লিস্ট (ইন্টারভিউ-প্রাসঙ্গিকতা অনুযায়ী, ২৩টা GoF-এর সব না)

| গ্রুপ | Patterns | Laravel / Sokrio উদাহরণ (যাচাই করে লিখব) |
|---|---|---|
| Creational (DP-10…) | Singleton, Factory Method, Abstract Factory, Builder | Service container singleton, `Manager` ক্লাস (driver factory), Query Builder |
| Structural (DP-20…) | Adapter, Decorator, Facade, Proxy, Composite | Laravel Facades, cache/filesystem driver adapter, middleware decorator |
| Behavioral (DP-30…) | Strategy, Observer, Command, State, Template Method, Chain of Responsibility, Iterator | Kafka observer (`PublishesKafkaMessage`), queued Job = Command, middleware pipeline = Chain, work-order lifecycle = State |
| Architectural (DP-40…) | Repository + Service layer, DI/IoC, CQRS, Event sourcing (হালকা), Saga, Outbox, Circuit breaker, Strangler fig | Sokrio service layer, QA Test Lab journal, FN-15 strangler |

### ৪.৩ LLD / Machine coding

| ID | প্রবলেম | যে pattern প্র্যাকটিস হবে |
|---|---|---|
| DP-50 | LRU cache | data structure + interface design |
| DP-51 | Parking lot | ক্লাসিক OOP modeling, Strategy (pricing) |
| DP-52 | Rate limiter (class level) | Strategy (algorithm বদল) |
| DP-53 | Work-order lifecycle (FN!) | **State** + Observer (event) |
| DP-54 | Notification dispatcher | Factory + Strategy + Decorator (retry) |
| DP-55 | Elevator / vending machine | State |
| DP-56 | Splitwise / expense sharing | modeling + Command |

---

## ৫. সময়সূচি

> ⚠️ **HM রাউন্ড (D-0 ≈ ১০-২৩) আগে।** এই ট্র্যাক ওই প্ল্যানকে সরাবে না। তাই দুই ফেজ:

### Phase 0: HM sprint চলাকালীন (১০-১৫ → ১০-২৩), দিনে সর্বোচ্চ ৩০ মিনিট
শুধু যেগুলো HM রাউন্ডেও কাজে লাগবে:
1. SD-01 ফ্রেমওয়ার্ক (panel "sketch it" বললে কাঠামো লাগবে)
2. SD-23 Multi-tenant SaaS = A1-কে কেস-ফরম্যাটে
3. Sokrio কোডে যে pattern আছে (Strategy, Observer, Repository, Command/Job, Chain/middleware) তার ১ পাতার তালিকা → "Why X not Y" কার্ডে সরাসরি কাজে লাগবে

### Phase 1–4: HM রাউন্ডের পর, ৪ সপ্তাহ, দিনে ~১.৫–২ ঘণ্টা

| সপ্তাহ | System Design | Design Patterns | শুক্র/শনি |
|---|---|---|---|
| ১ | SD-02…SD-06 | 01-principles + Creational (৪) + Structural (৫) | SD-20 URL shortener (টাইমড) |
| ২ | SD-07…SD-11 | Behavioral (৭) | SD-21 rate limiter + DP-50 LRU |
| ৩ | SD-22, SD-24…SD-27 | Architectural (৮) + DP-51, DP-52 | ১টা HLD মক + ১টা LLD মক |
| ৪ | SD-28…SD-31 | DP-53…DP-56 | ২টা পূর্ণ মক (HLD + LLD), রিভিশন |

**প্রতিদিনের ছন্দ:** ৪০ মিনিট পড়া → ৪০ মিনিট নিজে আঁকা/কোড করা (ডক না দেখে) → ১০ মিনিট জোরে ব্যাখ্যা (ইংরেজি) → `00-roadmap.md`-এ টিক + ০–৩ রেটিং।

---

## ৬. কীভাবে জেনারেট হবে

- **কনটেন্ট সপ্তাহ ধরে ধরে**, একসাথে সব না (আগের ২১টা FN ডক একসাথে বানানো হয়েছিল, পড়া হয়নি: সেই ভুল আর না)। প্রতি সপ্তাহের শুরুতে সেই সপ্তাহের ডক।
- ভাষা: বাংলা + ইংরেজি টার্ম, মুখে বলার লাইন আর কোড-কমেন্ট ইংরেজিতে (CLAUDE.md নিয়ম)
- Sokrio উদাহরণ: **শুধু কোডে যাচাই করে**, বানানো নয় (Honesty Rule)
- কোড: TypeScript (FN-এর স্ট্যাক + DSA-ও TS-এ), প্রতিটা ফাইল `npx tsx` দিয়ে চলবে
- `tracker.md`-এ নতুন সেকশন "৫. Tracks" (SD-xx, DP-xx); `START-HERE.md`-এ শুধু ছোট একটা লাইন, HM টেবিল অপরিবর্তিত

---

## ৭. ✋ তোমার সিদ্ধান্ত দরকার

| # | প্রশ্ন | আমার সুপারিশ |
|---|---|---|
| Q1 | Phase 0 এখনই শুরু করব, নাকি সব HM রাউন্ডের পরে? | **Phase 0 এখনই** (৩টা ছোট জিনিস, HM-এও কাজে লাগে) |
| Q2 | কোডের ভাষা | **TypeScript**, প্রয়োজনে PHP/Laravel স্নিপেট পাশে |
| Q3 | দৈনিক সময় (HM-এর পরে) | ~১.৫–২ ঘণ্টা → ৪ সপ্তাহ। কম হলে ৬ সপ্তাহে ছড়াব |
| Q4 | কেস/pattern লিস্টে কিছু যোগ/বাদ? | যেমন আছে |
| Q5 | `5-tracks/` নাম/জায়গা ঠিক আছে? | হ্যাঁ |
