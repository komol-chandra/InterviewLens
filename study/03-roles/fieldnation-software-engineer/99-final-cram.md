> Tracker ID: FN-21 · Generated: 2026-09-28 · Source: `_memory/story-bank.md`, `_memory/weak-areas.md`, `00-plan/01-fieldnation-se-14-day-plan.md`, backend-system-design-study-plan.md

# Final Cram Sheet — Day 14

> স্ক্যান করার জন্য, পড়ার জন্য না। ইন্টারভিউর আগের রাতে/সকালে চোখ বুলাও।

## ১. Work-Order Lifecycle
`Draft → Published → Routed/Requested → Assigned → Confirmed → Checked-in → Checked-out → Work Done → Approved → Paid`
(+ `Cancelled`, `On Hold`, `Problem Reported` — যেকোনো অবস্থা থেকে যেতে পারে)

## ২. Accept Race Condition — ৩টা সমাধান
1. **Conditional UPDATE:** `UPDATE work_orders SET provider_id=?, status='assigned' WHERE id=? AND status='published'` → `affected_rows === 1` চেক (সবচেয়ে সহজ, ডিফল্ট উত্তর)
2. **Pessimistic:** `SELECT … FOR UPDATE` ট্রানজ্যাকশনের ভেতরে
3. **Optimistic:** `version` কলাম, mismatch হলে retry

## ৩. Laravel → NestJS ম্যাপিং
| Laravel | NestJS |
|---|---|
| Service container / providers | DI container / providers |
| FormRequest | DTO + ValidationPipe |
| Middleware / Policies | Middleware / Guards |
| Resources (API transformers) | Interceptors / serialization |
| Exception Handler | Exception Filters |
| Queued Jobs | BullMQ / RabbitMQ consumers |
| Eloquent | TypeORM / Prisma |

## ৪. JD Topic Checklist — Self-Rating Gate
> `_memory/weak-areas.md`-এ যেকোনো **🔴 must/strong** টপিকের `Now` রেটিং যদি এখনো ০–১ থাকে, ওটাই প্রথমে রিভাইজ করো — বাকি সব পরে।

🔴 **Must/Strong:** JavaScript/ES6 · TypeScript · Node.js core · NestJS · PHP/Laravel · MySQL advanced · REST API + webhooks · React + hooks · Redux Toolkit · DSA in TypeScript (live) · Behavioral/STAR delivery
🟠 **Listed:** HTML/CSS/SASS · Git · Linux · Docker · Kubernetes · AWS
🟡 **Plus:** Microservices · RabbitMQ · Kafka · Observability/SLI/SLO · React Native · System design (spoken)

## ৫. ৯টা স্টোরি — এক লাইনে (ইংরেজি, ২ মিনিটের ভার্সনের সিড)

- **S1:** "I led the move from a Laravel/Vue monolith to a core API plus separate Report, Notification and SOP services talking over RabbitMQ. We ran old and new in parallel and cut over with zero downtime. Server load dropped by about 20%."
- **S2:** "Our heaviest reports ran over millions of rows. I profiled them with EXPLAIN, added composite indexes, removed N+1s, moved the heavy reads to MongoDB aggregations behind queued jobs, and cached the results in Redis. Load time dropped by up to 85%."
- **S3:** "Each client gets its own tenant database behind a landlord DB. The request resolves the tenant, the connection switches, and every cache key and queued job carries the tenant scope. Across 100+ tenants we've had zero cross-tenant leaks."
- **S4:** "I'm the primary on-call for six production apps. We defined SLOs, for example 99.9% report-generation availability, and alert on them instead of on raw CPU. Resolution time came down by 65%."
- **S5:** "Every webhook is HMAC-verified and every payment request carries an idempotency key, so retries and duplicate callbacks can't double-charge. A reconciliation job catches anything that drifts."
- **S6:** "I led the rewrite of our tenant frontend from Vue to React, Next.js, Redux Toolkit and TypeScript, working from Figma with UX and product to nail the core user journeys, and set the component and code-review standards the team adopted. User engagement went up about 30%." *(Say-it লাইন story-bank-এ নেই, এখানে ফ্যাক্ট থেকে তৈরি — [Komol যাচাই করবে])*
- **S7:** "I've built and supported REST and SOAP integrations for legacy enterprise clients, working async in English with offshore teams over Slack, Jira, PRs and docs to debug integration issues directly with client teams." *([Komol যাচাই করবে])*
- **S8:** "I run a set of named agents, one each for DB, backend, frontend and tests, with project rules they have to follow. I still review every diff myself, and tests are a required phase, so AI speeds me up without lowering the bar."
- **S9:** "I built the field-force modules — Task Manager, Van Sales, Vehicle Feedback, Van Attendance — syncing in real time with the core platform, including GPS-spoofing fraud detection, and contributed to about 27% revenue growth." *([Komol যাচাই করবে — contribution-এর সঠিক ভাষা])*

## ৬. CV সংখ্যা — ডিফেন্ড করো
| সংখ্যা | কোন স্টোরি | ডিফেন্ড লাইন রেডি? |
|-------|-----------|---------------------|
| ৮৫% | S2 (report load time) | story-bank দেখো |
| ৬৫% | S4 (resolution time) | story-bank দেখো |
| ২৭% | S9 (revenue) | "contributed to", কারণ না বলা |
| ২০% | S1 (server load) | কোন মেট্রিক দিয়ে মাপা — `[Komol পূরণ করবে]` |
| ৯৯.৯% | S4 (report availability) | story-bank দেখো |
| ৩০% | S6 (engagement) | কীভাবে মাপা — `[Komol পূরণ করবে]` |
| ৪০% | *কোন স্টোরির?* | `[Komol পূরণ করবে: story-bank-এ এই সংখ্যার সোর্স নোট নেই — CV থেকে চেক করো]` |

## ৭. লজিস্টিক চেকলিস্ট
- [ ] ল্যাপটপ চার্জ + চার্জার হাতের কাছে
- [ ] ইন্টারনেট ব্যাকআপ (মোবাইল হটস্পট রেডি)
- [ ] ক্যামেরা/মাইক টেস্ট
- [ ] Uttara 12 রুট + সময় (হাইব্রিড হলে) চেক করা
- [ ] `weak-areas.md`-এর সব ০–১ রেটিং রিভাইজ হয়েছে
- [ ] S1–S9 প্রতিটা ২ মিনিটে ইংরেজিতে বলে দেখা হয়েছে
