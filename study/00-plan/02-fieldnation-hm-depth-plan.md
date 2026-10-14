> Tracker ID: FN-26 · Generated: 2026-10-14 · Source: Komol-এর উত্তর (২০২৬-১০-১৪), `_memory/*`, Sokrio কোডবেস + git history, FN SE job post
> Decision: D9 (`_memory/decisions.md`) · Q-bank: FN-27 (`03-roles/fieldnation-software-engineer/04-behavioral/04-hm-technical-depth-qbank.md`)

# Field Nation — Hiring Manager / Tech Team রাউন্ড: ৮-দিনের "Technical Depth" প্ল্যান

## ০. এই রাউন্ডটা কী, আর কী না

| | Technical রাউন্ড (আগেরটা) | **Hiring Manager / Tech Team রাউন্ড (এটা)** |
|---|---|---|
| প্রশ্ন | "Event loop কী?" "এই প্রবলেম কোড করো" | "Walk me through something you built. **Why** that way? What broke? What would you change?" |
| মাপে | সঠিক উত্তর জানো কি না | **গভীরতা, মালিকানা (I vs we), trade-off বিচার, সততা, কমিউনিকেশন** |
| কে | Engineer | **US-side Engineering Manager + ১–২ জন engineer (panel)**, ইংরেজিতে ভিডিও কল |
| কীভাবে খোঁড়ে | চওড়া (অনেক টপিক) | **লম্বা (একটা প্রজেক্টে ৪–৫ লেভেল নিচে)**, প্রতিবার "why?" জিজ্ঞেস করে |

**Depth Ladder: প্রতিটা প্রজেক্টে ইন্টারভিউয়ার এই সিঁড়ি বেয়ে নামবে:**

```
L1 WHAT     — কী বানিয়েছিলে? (৩০ সেকেন্ড, বড় ছবি)
L2 HOW      — ভেতরে কীভাবে কাজ করে? (ডেটা ফ্লো, কম্পোনেন্ট)
L3 WHY      — কেন এভাবে? কী কী বিকল্প ছিল, কেন বাদ দিলে?
L4 BREAK    — কোথায় ভাঙে? স্কেল ১০x হলে? কী ভুল হয়েছিল?
L5 REFLECT  — আজ আবার করলে কী বদলাতে? তোমার নিজের অংশ ঠিক কোনটা?
```

> যেকোনো প্রজেক্টে **L4–L5 পর্যন্ত** কনফিডেন্টলি নামতে পারলে এই রাউন্ড জেতা যায়। বেশিরভাগ ক্যান্ডিডেট L2-তে আটকে যায়।

**US ম্যানেজারের সাথে কমিউনিকেশন নিয়ম:**
1. **BLUF (Bottom Line Up Front):** আগে উত্তর, পরে ব্যাখ্যা। "The short answer is X. Here's why…"
2. **"I" vs "we" পরিষ্কার রাখো:** "The team owned X; **I** designed Y and wrote Z."
3. **সংখ্যার সাথে সবসময় পদ্ধতি বলো:** "~85% faster, measured as p50 load time on the `<report>`, `<X>s → <Y>s`" (আসল সংখ্যা Receipt Card থেকে)। পদ্ধতি না জানলে সংখ্যা বলবে না।
4. **"I don't know" + reasoning** বানানো উত্তরের চেয়ে অনেক ভালো: "I haven't run that in production. Here's how I'd reason about it…"
5. প্রতিটা উত্তর **৯০ সেকেন্ডের মধ্যে**, তারপর থামো: "Want me to go deeper on any part?"

---

## ১. 🔴 সবার আগে: Truth Audit (কোডবেস থেকে পাওয়া ঝুঁকি)

২০২৬-১০-১৪-এ লোকাল Sokrio রিপো (`sokrio-server`, দুই frontend, mobile, benchmark-python, benchmark) স্ক্যান করে পাওয়া গেছে:

| CV-র দাবি | কোডে কী পাওয়া গেল | ঝুঁকি | কী করবে |
|---|---|---|---|
| Monolith → microservices, **RabbitMQ** দিয়ে | কোনো রিপোতে `rabbitmq`/`amqp` নেই। Event bus = **Kafka** (`app/Contracts/Kafka/*`, `KafkaServiceProvider`, `PublishesKafkaMessage` observer) | 🔴 খুব বেশি: "RabbitMQ exchange type কী ছিল?" জিজ্ঞেস করলেই ধরা পড়বে | RabbitMQ কি অন্য রিপোতে (Notification/SOP service) আছে, যা লোকালে নেই? **থাকলে** রিপোর নাম আর তোমার অংশ লেখো। **না থাকলে** উত্তর আর CV-র লাইন বদলাও: "event-driven over a message broker (Kafka)" |
| Kafka: "basics" | Kafka producer/consumer, consumer-group isolation fix, dynamic group ID + retry, consumer max runtime 6h। **git author: টিমমেট (Rakib), ২০২৫-১০ → ১২** | 🟡 মাঝারি | তোমার সম্পর্ক কী: review করেছ? ব্যবহার করেছ? on-call-এ debug করেছ? `[Komol পূরণ করবে]`। সৎ ফ্রেম: "A teammate built our Kafka layer; I work with it daily, e.g. …" |
| Node.js / Express services | কোনো রিপোতে Node backend নেই (`express`/`@nestjs/core`/`fastify` নেই) | 🔴 বেশি: FN Node-এর দিকে যাচ্ছে, তাই অবশ্যই জিজ্ঞেস করবে | Node কাজটা কোথায় হয়েছিল (SoftArch? Am Coders? সাইড প্রজেক্ট?) `[Komol পূরণ করবে]`। প্রমাণ বানাতে `fn-lite` NestJS রিপো |
| ২০%, ৬৫%, ৮৫%, ২৭%, ৯৯.৯% | মাপার পদ্ধতি কোথাও লেখা নেই (handoff-এও খোলা ঝুঁকি) | 🔴 বেশি | প্রতিটার জন্য Receipt Card (§৩, Day 1) |
| Laravel version | কোড: **Laravel 8** (`laravel/framework: ^8.0`) | 🟢 কম | "Laravel 10" বলবে না |

**✅ কোড থেকে পাওয়া নতুন, যাচাইযোগ্য তথ্য (নিরাপদে বলা যায়):**
- `sokrio-server`-এ ১১,৫৬১ commit-এর মধ্যে **১,৬৬১টা তোমার (~১৪%)**, ২০২৩-০৮-২৮ থেকে
- Multi-tenant: subdomain → `EnsureTenantAccess` → `TenantManager::reconnect()` একসাথে MySQL **আর** MongoDB সুইচ করে (একই db নাম)। Org lookup ৭ দিন cache করা থাকে। Read-replica connection আছে।
- **গভীর gotcha (L4-এর সোনা):** `ScopeCacheToTenant` শুধু HTTP request-এ cache prefix দেয়, queue job-এ দেয় না। তাই job request-এর লেখা key দেখতে পায় না।
- Market-benchmark optimization: all-tenant fan-out (`gather_tenants`)-কে root cause হিসেবে ধরা, adaptive concurrency `[8, 24]` (~প্রতি ৫ টেন্যান্টে ১ স্লট), TTL 600s → 10800s (**১৮× কম recompute**), lookback ৩ মাস → ডিফল্ট ১, index-check স্ক্রিপ্ট
- Monthly rollups (`order_rollups_monthly`, per-tenant), scheduled job, event-driven না। **কেন:** `order_summaries` লেখে Laravel, তাই event hook লাগলে অন্য সার্ভিসে কাপলিং বাড়ত।
- Structured JSON-lines logging: `{tenant, level, duration_ms, cache_hit, error_code, request_id}`
- Task Manager ডিজাইন: MongoDB-র বদলে MySQL (relational join), নতুন `user_supervisors` টেবিল (audit করে নিশ্চিত হয়ে), one-way `achievement_locked_at`
- QA Test Lab (২০২৬-১০): write-ahead journal (pending → applied, পুরো `before` row সহ), reverse-order revert, local-only write guard
- **একটা আসল revert:** `ReportTooLargeException` + stock-details report পরিবর্তন (২০২৬-০৮-১৩), দুই দিন পর revert (০৮-১৫)। এটা S11 (mistake) স্টোরি হতে পারে, যদি তোমার মনে থাকে কেন revert করা হয়েছিল।

---

## ২. সময়সূচি (তারিখ ঠিক না, তাই D-8 → D-0)

ডিফল্ট শুরু: **বৃহঃ ২০২৬-১০-১৫ = D-8**। তারিখ জানলে D-0 বসিয়ে পেছনে গুনে নাও। সপ্তাহের দিনে ~৩–৪ ঘণ্টা, শুক্র/শনিতে ~৬ ঘণ্টা।

| দিন | ডিফল্ট তারিখ | ফোকাস | আউটপুট (শেষে কী থাকবে) |
|---|---|---|---|
| **D-8** | বৃহঃ ১০-১৫ | 🔴 Truth Audit + Receipt Cards | §১-এর প্রতিটা 🔴 সারি resolved; ৬টা Receipt Card |
| **D-7** | শুক্র ১০-১৬ (৬ ঘণ্টা) | Anchor Projects A1–A3 → Depth Ladder | ৩টা প্রজেক্ট L1–L5 লেখা + জোরে বলা (রেকর্ড) |
| **D-6** | শনি ১০-১৭ (৬ ঘণ্টা) | Anchor Projects A4–A6 + আর্কিটেকচার আঁকা | ৩টা প্রজেক্ট L1–L5 + Sokrio-র ১-পাতার ডায়াগ্রাম মুখস্থ |
| **D-5** | রবি ১০-১৮ | Architecture "Why X not Y" কার্ড | Q-bank §B-এর ১০টা কার্ড, প্রতিটা ৯০ সেকেন্ডে |
| **D-4** | সোম ১০-১৯ | Incidents, Debugging, Ownership | S4 incident + S11 mistake + S10 disagreement পুরো ভরাট; debugging walkthrough |
| **D-3** | মঙ্গল ১০-২০ | Gaps: Node / NestJS / K8s / Kafka + Field Nation-এর জায়গায় নিজেকে বসানো | "Honest Bridge" উত্তর ×৪; FN-এর সমস্যায় Sokrio অভিজ্ঞতা ম্যাপ করা |
| **D-2** | বুধ ১০-২১ | 🎤 Live Mock HM-1 (৬০ মিনিট, panel স্টাইল) | Fix list → `weak-areas.md` |
| **D-1** | বৃহঃ ১০-২২ | Fix list + Mock HM-2 (৩০ মিনিট, শুধু L4–L5 প্রশ্ন) + ম্যানেজারকে করার প্রশ্ন | সব fix বন্ধ; ৫টা প্রশ্ন রেডি |
| **D-0** | ইন্টারভিউর দিন | হালকা: Receipt Cards + pitch একবার, সেটআপ চেক | — |

**প্রতিদিনের অভ্যাস (~৩০ মিনিট):** ১টা anchor project জোরে বলা (২ মিনিট L1–L2, তারপর নিজেকে "why?" ৩ বার) · ১টা DSA (TypeScript) যাতে হাত না জমে · দিনের শেষে `handoff.md` আপডেট।

---

## ৩. দিন-ভিত্তিক বিস্তারিত

### D-8 — Truth Audit + Receipt Cards 🔴

1. **RabbitMQ প্রশ্নের নিষ্পত্তি (৩০ মিনিট):** RabbitMQ কোথায় চলত? Notification/SOP সার্ভিসের আলাদা রিপো আছে কি? সত্যিটা `decisions.md`-এ লেখো। **আসল না হলে** CV-র লাইন বদলাও (FN-এর কাছে CV আগেই গেছে, তাই ইন্টারভিউতে নিজে থেকে ঠিক করে দেওয়ার লাইনও রেডি রাখো: "On the CV I wrote RabbitMQ. To be precise, our broker today is Kafka; …")
2. **Node প্রশ্নের নিষ্পত্তি:** কোন প্রজেক্টে, কোন কোম্পানিতে, কী বানিয়েছিলে, প্রোডাকশনে গিয়েছিল কি না
3. **৬টা Receipt Card** (টেমপ্লেট নিচে), প্রতিটা CV সংখ্যার জন্য একটা: ২০% (সার্ভার লোড), ৬৫% (resolution time), ৮৫% (রিপোর্ট), ৩০% (engagement), ২৭% (রেভিনিউ), ৯৯.৯% (আপটাইম)

```
### Receipt: <সংখ্যা> — <দাবি>
- মেট্রিক: (p50 latency? CPU%? MTTR? DAU?)
- আগে → পরে: X → Y   · সময়কাল: কবে থেকে কবে মাপা
- কোথা থেকে: (Grafana / CloudWatch / Telescope / Jira টিকেটের সময় / অনুমান)
- আমার অংশ: আমি নিজে ___ করেছি; টিম ___ করেছে
- নিরাপদ বাক্য (EN): "…"
- পদ্ধতি না জানলে: "It was roughly X based on <source>. I'd want to re-measure before quoting it precisely."
```

> নিয়ম: যে সংখ্যার পদ্ধতি বলতে পারবে না, সেটা নিজে থেকে বলবে না। জিজ্ঞেস করলে "roughly" + সোর্স বলো।

### D-7 / D-6 — ৬টা Anchor Project, প্রতিটা Depth Ladder দিয়ে

প্রতিটার জন্য Q-bank (FN-27) §A-তে L1–L5 স্কেলেটন আছে। নিজের ভাষায় ভরাট করো, তারপর **রেকর্ড করে** জোরে বলো।

| # | Anchor | কেন এটা | স্টোরি ID | FN JD মিল |
|---|---|---|---|---|
| A1 | Multi-tenant architecture + cache-scope gotcha | সবচেয়ে গভীর, কোডে যাচাইযোগ্য | S3 | SaaS, MySQL |
| A2 | Report / benchmark performance (fan-out, concurrency, TTL, rollups) | সংখ্যা আছে (১৮×), আসল root-cause গল্প | S2 | MySQL, perf |
| A3 | Observability: structured logging + SLO + retry UX | JD-তে সরাসরি SLI/SLO | S4 | Observability |
| A4 | Event-driven: Kafka observers (+ RabbitMQ যদি আসল হয়) | FN-এর microservices দিক | S1 | Event-driven |
| A5 | Task Manager ডিজাইন (MySQL vs Mongo, hierarchy, lock) | "Design judgment"-এর পরিষ্কার উদাহরণ | S9 | Work-order-এর মতো approval flow |
| A6 | AI-assisted engineering + QA Test Lab (journal / revert / guard) | নতুন (২০২৬-১০), safety-first চিন্তা দেখায় | S8 | Team productivity |

**D-6 অতিরিক্ত:** Sokrio-র আর্কিটেকচার খালি কাগজে ২ মিনিটে আঁকা প্র্যাকটিস করো (clients → subdomain → middleware → Laravel → MySQL landlord/tenant + Mongo + Redis + Kafka; FastAPI read-only)। Panel প্রায়ই বলে "can you sketch it?"। সোর্স: `/.claude/_architecture/system-overview.md`।

### D-5 — "Why X not Y" কার্ড

Q-bank §B-এর ১০টা প্রশ্ন। প্রতিটার উত্তরের ছাঁচ:
> **Context** (আমাদের constraint কী ছিল) → **Options** (২–৩টা) → **Choice + why** → **Cost** (কী ছেড়ে দিলাম) → **Revisit** (কোন অবস্থায় সিদ্ধান্ত বদলাতাম)

শেষের "Revisit" অংশটাই senior-লেভেলের চিন্তা দেখায়। এটা কখনো বাদ দেবে না।

### D-4 — Incidents, Debugging, Ownership

- **S4 incident ভরাট:** একটা আসল incident: কী ভাঙল → কীভাবে জানলে (alert? client?) → প্রথম ১৫ মিনিটে কী করলে → root cause → fix → আবার যেন না হয় সেজন্য কী করলে
- **S11 mistake:** ০৮-১৩-এর `ReportTooLargeException` revert কি এটা? না হলে অন্য একটা। ফরম্যাট: "I made X mistake → impact → how I owned it → the system change so it can't recur"
- **S10 disagreement:** একটা আসল ঘটনা (যেমন ডিজাইন সিদ্ধান্তে: Task Manager-এ Mongo বনাম MySQL?)
- **Debugging walkthrough ছাঁচ** (Q-bank §C): Reproduce → Scope (কোন টেন্যান্ট/কবে থেকে/কী বদলেছে) → Hypothesis → Measure (logs/EXPLAIN/APM) → Fix → Prevent

### D-3 — Gaps + Field Nation ফিট

**Honest Bridge ফর্মুলা** (Q-bank §D), Node / NestJS / Kubernetes / Kafka প্রতিটার জন্য:
> "**Honestly**, my production depth is in X. **What transfers**: Y (concept-level, concrete). **What I've done to close it**: Z (fn-lite repo / course / reading Kafka layer). **First 30 days at FN** I'd …"

**FN-এর সমস্যায় নিজেকে বসাও** (ম্যানেজার জিজ্ঞেস করবে "How would you approach our PHP→Node migration?"): `03-system-design/02-php-to-node-migration.md` রিভিশন। কিন্তু উত্তরে **তোমার Sokrio অভিজ্ঞতা** দিয়ে শুরু করো (Laravel + FastAPI পাশাপাশি একই DB-তে = দুই-স্ট্যাক সহাবস্থানের আসল অভিজ্ঞতা)।

### D-2 — Live Mock HM-1 (৬০ মিনিট)

এই চ্যাটে Claude-কে দাও:
> "Act as a US-based Engineering Manager at Field Nation with one senior engineer on the panel. Interview me for 60 minutes on technical depth, not trivia. Pick 2 projects from my CV and drill each to L5 (what → how → why → what broke → what would you change). Challenge every number and every 'we'. Include one 'gap' question (Node/K8s/Kafka) and one 'how would you approach our problem' question. One question at a time. After the mock: score Depth / Ownership / Trade-offs / Honesty / Clarity (1–5) and list my top 5 fixes."

### D-1 — Fix + Mock HM-2 + প্রশ্ন

- D-2-এর top 5 fix প্র্যাকটিস
- Mock HM-2: ৩০ মিনিট, শুধু L4–L5 আর "push-back" প্রশ্ন
- **ম্যানেজারকে করার ৫টা প্রশ্ন** (Q-bank §F থেকে বাছো)

### D-0
Receipt Cards একবার পড়ো, pitch একবার জোরে বলো, ক্যামেরা/মাইক/নেট চেক। নতুন কিছু পড়বে না।

---

## ৪. শেষের মানদণ্ড (D-1-এ চেক)

- [ ] §১-এর সব 🔴 সারি resolved, CV-র কোনো লাইন নিয়ে ভয় নেই
- [ ] ৬টা Receipt Card: প্রতিটা সংখ্যার পদ্ধতি **অথবা** নিরাপদ "roughly" বাক্য
- [ ] A1–A6 প্রতিটা L5 পর্যন্ত, "I" vs "we" পরিষ্কার, প্রতিটা L1 ৩০ সেকেন্ডে
- [ ] ১০টা "Why X not Y" কার্ডের প্রতিটায় "Revisit" অংশ আছে
- [ ] S4, S10, S11 পুরো ভরাট (কোনো `[FILL]` নেই)
- [ ] ৪টা Honest Bridge উত্তর জোরে বলা
- [ ] Mock HM-1-এ প্রতিটা ডাইমেনশনে ≥ ৪/৫
