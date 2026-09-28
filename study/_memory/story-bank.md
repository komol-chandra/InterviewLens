---
type: story
updated: 2026-09-28
source: 03-roles/fieldnation-software-engineer/00-research/Komol_CV_FieldNation_Software_Engineer.docx
---

# Story Bank — Sokrio STAR স্টোরি

প্রতিটা স্টোরির **ফ্যাক্ট শুধু CV থেকে নেওয়া**। `[Komol পূরণ করবে]` মানে CV-তে নেই। ইন্টারভিউয়ার ঠিক এই জায়গাগুলোতেই খোঁচাবে, তাই Day 1–3-এর মধ্যে ভরাট করো। মূল বাক্যগুলো ইংরেজিতে, কারণ ইন্টারভিউতে এগুলোই বলবে।

**রিহার্সাল স্ট্যাটাস:** ⬜ লেখা হয়নি · 🟡 স্কেলেটন (নিচের মতো) · 🔵 ডিটেইল ভরাট · ✅ ২ মিনিটে জোরে বলতে পারি

## ইনডেক্স — কোন প্রশ্নে কোন স্টোরি

| ID | স্টোরি | যে প্রশ্নের উত্তরে লাগে | FN JD-র সাথে মিল | Status |
|----|--------|--------------------------|-------------------|--------|
| S1 | Monolith → event-driven microservices | "Biggest project", "technical decision", "migrate PHP to Node safely?" | Node microservices, RabbitMQ, Docker | 🟡 |
| S2 | Reports ৮৫% দ্রুত | "Performance problem you solved", "SQL optimisation", "caching" | MySQL, queues, Redis | 🟡 |
| S3 | Multi-tenant isolation, শূন্য লিক | "Security", "data modelling", "a bug that could have been bad" | SaaS, MySQL | 🟡 |
| S4 | On-call + SLO, ৬৫% দ্রুত রেজোলিউশন | "Production incident", "observability", "pressure" | SLI/SLO, monitoring | 🟡 |
| S5 | Payment gateway: webhook, HMAC, idempotency | "API design", "reliability", "handling failures" | REST, integrations | 🟡 |
| S6 | Vue → React/TS রিরাইট ২ মাসে | "Leadership", "set standards", "work with UX/product" | React, Redux, TS | 🟡 |
| S7 | Client integration troubleshooting (SOAP/REST) | "Difficult stakeholder", "communication", "offshore/client work" | Customers, REST, communication | 🟡 |
| S8 | AI-assisted engineering setup | "How do you use AI?", "productivity", "learning" | Team productivity | 🟡 |
| S9 | Field-force modules + GPS-spoofing detection | "Feature you're proud of", "business impact", "why FN?" | **Work-order/technician ডোমেইন** | 🟡 |
| S10 | Disagreement with a teammate/manager | "A time you disagreed", "conflict" | Teamwork | ⬜ |
| S11 | Mistake / failure + system fix | "A mistake you made", "failure" | Ownership | ⬜ |

**বাকি থাকা behavioral টাইপ, যার স্টোরি এখনো নেই:** failure/mistake, disagreement with a teammate or manager, missed deadline। Day 13-এর আগে S10–S12 যোগ করো `[Komol পূরণ করবে]`।

---

## S1 — Monolith → Event-driven Microservices

- **Situation:** Sokrio ছিল একটা Laravel 8 + Vue.js 2 monolith। `[Komol পূরণ করবে: কী ব্যথা ছিল? স্লো deploy? লোড? টিমের সাইজ?]`
- **Task:** মাইগ্রেশন লিড করা, ডাউনটাইম ছাড়া।
- **Action (CV):** Laravel core REST API + আলাদা React tenant ও admin অ্যাপ + Report, Notification ও SOP সার্ভিস, **RabbitMQ** দিয়ে কমিউনিকেশন, MongoDB + Redis। **দুই সিস্টেম প্যারালালে চালিয়ে** zero-downtime cutover।
- **Result (CV):** সার্ভার লোড ~২০% কমেছে।
- **Defend:** ২০% কীভাবে মাপা হয়েছিল? `[CPU? request/sec? কোন ড্যাশবোর্ড?]` · সার্ভিস বাউন্ডারি কীভাবে ঠিক করেছিলে? · প্যারালাল রানে ডেটা সিঙ্ক কীভাবে হতো?
- **Say it (EN):** "I led the move from a Laravel/Vue monolith to a core API plus separate Report, Notification and SOP services talking over RabbitMQ. We ran old and new in parallel and cut over with zero downtime. Server load dropped by about 20%."

## S2 — Reports up to 85% Faster

- **Situation:** লাখ লাখ রেকর্ডের ওপর ভারী রিপোর্ট। `[কোন রিপোর্ট? আগে কত সেকেন্ড লাগত?]`
- **Action (CV):** MongoDB aggregation pipeline, Laravel queue job (retry, dead-letter queue, priority job), Redis caching; MySQL-এ composite index, EXPLAIN অ্যানালাইসিস, N+1 দূর করা; ভারী read MongoDB-তে সরানো।
- **Result (CV):** রিপোর্ট লোড টাইম সর্বোচ্চ ৮৫% কম, রিপোর্ট জেনারেশনে ৯৯.৯%+ আপটাইম।
- **Defend:** before/after সংখ্যা `[X s → Y s]` · কোন index যোগ করেছিলে, EXPLAIN-এ কী দেখেছিলে? · cache invalidation কীভাবে করতে?
- **Say it (EN):** "Our heaviest reports ran over millions of rows. I profiled them with EXPLAIN, added composite indexes, removed N+1s, moved the heavy reads to MongoDB aggregations behind queued jobs, and cached the results in Redis. Load time dropped by up to 85%."

## S3 — Multi-tenant Isolation, Zero Leakage

- **Action (CV):** landlord/tenant DB isolation, tenant-scoped query, territory-scoped RBAC, সব শুরু থেকে বানানো।
- **Result (CV):** ১০০+ টেন্যান্টে শূন্য cross-tenant data leakage।
- **Defend:** টেন্যান্ট কীভাবে রিজলভ হয় (request → DB সুইচ)? cache key-তে টেন্যান্ট স্কোপ কীভাবে? queue job-এ টেন্যান্ট কনটেক্সট কীভাবে যায়? `[একটা near-miss ঘটনা থাকলে যোগ করো]`
- **Say it (EN):** "Each client gets its own tenant database behind a landlord DB. The request resolves the tenant, the connection switches, and every cache key and queued job carries the tenant scope. Across 100+ tenants we've had zero cross-tenant leaks."

## S4 — On-call + SLOs, 65% Faster Resolution

- **Action (CV):** ৬টা প্রোডাকশন অ্যাপের প্রাইমারি ২৪/৭ on-call; SLI/SLO ট্র্যাক (৯৯.৯% রিপোর্ট availability, API latency, error rate); APM, Grafana/Prometheus, CloudWatch, Telescope, structured logging, SLO-ভিত্তিক alert।
- **Result (CV):** issue resolution time ৬৫% কম।
- **Defend:** একটা নির্দিষ্ট incident-এর গল্প `[কী ভাঙল, কীভাবে ধরলে, root cause, আবার যেন না হয় সেজন্য কী করলে]` · ৬৫% কোন মেট্রিক থেকে? (MTTR?)
- **Say it (EN):** "I'm the primary on-call for six production apps. We defined SLOs, for example 99.9% report-generation availability, and alert on them instead of on raw CPU. Resolution time came down by 65%."

## S5 — Payment Gateway Integration

- **Action (CV):** billing ও subscription-এর জন্য payment gateway: initiation, webhook, retry, auto-reconciliation, receipt; **HMAC signature verification + idempotency key**।
- **Result (CV):** প্রোডাকশনে শূন্য failed transaction।
- **Defend:** একই webhook দুবার এলে কী হয়? gateway down থাকলে? reconciliation কীভাবে mismatch ধরে? `[কোন gateway?]`
- **Say it (EN):** "Every webhook is HMAC-verified and every payment request carries an idempotency key, so retries and duplicate callbacks can't double-charge. A reconciliation job catches anything that drifts."

## S6 — Vue → React/Next/RTK/TS Rewrite in 2 Months

- **Action (CV):** Vue.js থেকে React, Next.js, Redux Toolkit, TypeScript (SASS)-এ রিরাইট লিড; UX ডিজাইনার ও প্রোডাক্টের সাথে Figma থেকে মূল user journey; component, folder structure ও code review স্ট্যান্ডার্ড সেট করা, টিম গ্রহণ করেছে।
- **Result (CV):** user engagement ৩০% বেড়েছে।
- **Defend:** ২ মাসে কীভাবে? scope কীভাবে কাটছাঁট করলে? engagement কীভাবে মাপা? টিম স্ট্যান্ডার্ড মানতে না চাইলে? `[Komol পূরণ করবে]`

## S7 — Client Integration Troubleshooting

- **Action (CV):** মোবাইল field-force অ্যাপের REST API, legacy enterprise client-এর জন্য SOAP endpoint + queue-based sync; client টিমের সাথে সরাসরি integration সমস্যা সমাধান; international client ও offshore টিমের সাথে ইংরেজিতে async কাজ (Slack, Jira, PR, docs)।
- **Defend:** একটা নির্দিষ্ট কঠিন কেস `[কোন client, কী ভুল হচ্ছিল, কীভাবে debug করলে, কীভাবে কমিউনিকেট করলে]`
- **FN মিল:** JD বলছে "collaborate with customers" + "offshore teams" + "1–10 PM", মানে US ওভারল্যাপ।

## S8 — AI-assisted Engineering

- **Action (CV):** Claude Code দৈনিক — code generation, review, debugging, docs; database, backend, frontend ও test কাজের জন্য কাস্টম skill + sub-agent সেটআপ।
- **Defend:** গার্ডরেইল কী? AI-এর ভুল কীভাবে ধরো? `[একটা মাপা লাভ — সময় বাঁচানো বা বাগ ধরা]`
- **Say it (EN):** "I run a set of named agents, one each for DB, backend, frontend and tests, with project rules they have to follow. I still review every diff myself, and tests are a required phase, so AI speeds me up without lowering the bar."

## S9 — Field-force Modules + GPS-Spoofing Detection

- **Action (CV):** Task Manager (plan, approval, achievement tracking), Van Sales, Vehicle Feedback, Van Attendance, core platform-এর সাথে real-time sync; GPS-spoofing fraud detection।
- **Result (CV):** কোম্পানির ২৭% রেভিনিউ বৃদ্ধিতে অবদান।
- **Defend:** spoofing কীভাবে ধরতে (mock-location flag, speed/distance jump, …)? `[Komol পূরণ করবে]` · ২৭%-এ তোমার অংশ কতটা? (সতর্ক থাকো: "contributed to", "caused" না)
- **FN মিল:** 🎯 **এটাই "Why Field Nation" উত্তরের কেন্দ্র।** Technician check-in/check-out, GPS proof, work-order approval হুবহু একই সমস্যা।

## S10 — Disagreement (⬜ scaffold, 2026-09-29)

- **Situation/Task:** `[Komol পূরণ করবে: কার সাথে (রোল দিয়ে বলো, নাম না), কী নিয়ে — tech choice / estimate / scope / code review?]`
- **Action:** আগে তাদের যুক্তি শোনা → `[data / PoC / pros-cons লিখে দেখানো]` → `[কীভাবে একমত হলে]`
- **Result + lesson:** `[ফলাফল]` · "Disagreements get resolved faster with data than with opinions."
- **Mock:** `05-mocks/mock-01-cv-behavioral.md` D4

## S11 — Mistake / Failure (⬜ scaffold, 2026-09-29)

- **Situation:** `[Komol পূরণ করবে: কী ভুল — bad deploy / migration / ভুল estimate / prod bug? "I made a mistake when…"]`
- **Action:** `[কত দ্রুত ঠিক করলে, টিমকে খোলাখুলি জানালে]` → `[test / checklist / alert যোগ, যাতে আবার না হয়]`
- **Result + habit:** `[ফলাফল]` · "Since then I always…" `[অভ্যাস]`
- **Mock:** `05-mocks/mock-01-cv-behavioral.md` D5
