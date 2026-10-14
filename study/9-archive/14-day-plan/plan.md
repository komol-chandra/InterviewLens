# Field Nation — Software Engineer: ১৪-দিনের প্ল্যান

> **রোল:** Software Engineer · Dhaka (Uttara 12), hybrid · 1 PM–10 PM · BDT 80k–120k
> **সময়:** ২০২৬-০৯-২৯ (মঙ্গল) → ২০২৬-১০-১২ (সোম) · সপ্তাহের দিন ~৩–৪ ঘণ্টা, শুক্র/শনি ~৬ ঘণ্টা
> **সোর্স:** `../../Interview Field Nation/job-post/software-enginner.txt`, `../03-roles/fieldnation-software-engineer/00-research/`
> **Created:** 2026-09-28 · প্রতিদিনের টিক-বক্স → `TODO.md`

---

## ১. মূল কৌশল — কেন এই অর্ডার

SE পোস্টটা **"strong" চায় TypeScript + ES6**, আর বাকি সবকিছু "knowledge"/"plus"। তাই:

1. **প্রথম সপ্তাহ = মূল চাহিদা:** JS/TS → Node → MySQL → REST → React। এগুলো প্রায় নিশ্চিতভাবে জিজ্ঞেস করা হবে, লাইভ কোডিংসহ।
2. **দ্বিতীয় সপ্তাহ = "plus" + ডিজাইন + মক:** microservices, event-driven, Docker/K8s, observability — এখানে তোমার Sokrio অভিজ্ঞতা বেশিরভাগ SE ক্যান্ডিডেটের চেয়ে গভীর। তাই এগুলো **স্টোরি দিয়ে জেতার** জায়গা, মুখস্থ করার না।
3. **প্রতিদিন:** ২টা DSA (TypeScript-এ) + ১টা STAR স্টোরি জোরে বলা। শেষ মুহূর্তে একসাথে করা যায় না, রোজ অল্প করে করতে হয়।

**তোমার এক লাইনের pitch (ইংরেজিতে মুখস্থ):**
> "At Sokrio I build a multi-tenant field-force and order platform used by 100+ enterprise clients — check-ins, GPS, tasks, payments, integrations — and I led its move from a monolith to event-driven services. Field Nation's work-order marketplace is the same shape of problem."

---

## ২. সম্ভাব্য ইন্টারভিউ প্রসেস

HR screen (২০–৩০ মিনিট) → অনলাইন টেস্ট/টেক-হোম → টেকনিক্যাল ১ (JS/TS, React, PHP/Node, SQL, REST, লাইভ কোডিং) → টেকনিক্যাল ২ / ছোট ডিজাইন → ম্যানেজার/কালচার → অফার।

> ⚠️ এটা অনুমান। HR কল এলে **রাউন্ডের সংখ্যা আর ফরম্যাট জিজ্ঞেস করো** → `_memory/interview-log.md`-এ লেখো → সেই অনুযায়ী এই প্ল্যান অ্যাডজাস্ট করো (`_memory/decisions.md`-এ কারণ লিখে)।

---

## ৩. দৈনিক অভ্যাস (প্রতিদিন, ~৪০ মিনিট — দিনের প্ল্যানের বাইরে)

| অভ্যাস | কোথা থেকে | সময় |
|--------|-----------|------|
| ২টা DSA প্রবলেম **TypeScript-এ**, টাইমার চালিয়ে (easy ১৫ মিনিট, medium ২৫ মিনিট) | `01-cse-fundamentals/practical/<pattern>/` — দিনের টেবিলে প্যাটার্ন দেওয়া | ~৩০ মিনিট |
| ১টা STAR স্টোরি জোরে বলো, ২ মিনিটের মধ্যে | `_memory/story-bank.md` (S1→S9 ঘুরিয়ে) | ~৫ মিনিট |
| মেমরি আপডেট: weak-areas রেটিং + handoff | `_memory/` | ~৫ মিনিট |

---

## ৪. দিন-ভিত্তিক প্ল্যান

ডক কলামের ID = `doc-tracker.md`-এর সারি। ডক না থাকলে ওই দিনের শুরুতে Claude-কে জেনারেট করতে বলো।

### সপ্তাহ ১ — মূল চাহিদা

| দিন | তারিখ | ফোকাস | কাজ | ডক | DSA প্যাটার্ন | স্টোরি |
|----|------|-------|-----|----|--------------|-------|
| 1 | মঙ্গল ০৯-২৯ | **কিকঅফ + ডোমেইন** | `weak-areas.md`-এ সব টপিকে নিজের রেটিং দাও (৩০ মিনিট)। Work-order lifecycle মুখস্থ। Pitch ইংরেজিতে ৫ বার জোরে বলো। | FN-01, FN-16 | 01 Arrays | S1 |
| 2 | বুধ ০৯-৩০ | **JavaScript / ES6** | Event loop (microtask vs macrotask), closure, `this`, hoisting/TDZ, Promise। স্ক্র্যাচ থেকে লেখো: `debounce`, `throttle`, `Promise.all`। | FN-02 | 03 Hashing | S2 |
| 3 | বৃহঃ ১০-০১ | **TypeScript** | `interface` vs `type`, generics, `unknown` vs `any`, utility types, discriminated union, narrowing। Sokrio frontend-এর একটা টাইপ রিফ্যাক্টর উদাহরণ তৈরি রাখো। | FN-03 | 04 Two Pointers | S3 |
| 4 | শুক্র ১০-০২ | **Node.js + NestJS** (৬ ঘণ্টা) | Node core রিভিশন (`theory/12-nodejs`)। **`fn-lite` শুরু:** NestJS `work-orders` module — controller, service, DTO + class-validator, TypeORM + MySQL, ১টা Jest টেস্ট। GitHub-এ পুশ। | FN-04 | 04 Sliding Window | S8 |
| 5 | শনি ১০-০৩ | **MySQL advanced** (৬ ঘণ্টা) | Composite index + leftmost prefix, `EXPLAIN` পড়া, window function, isolation level, gap lock, deadlock, N+1। `practical/14-sql` easy + medium পুরোটা। | FN-05 | 14 SQL | S2 |
| 6 | রবি ১০-০৪ | **REST + Webhook + PHP** | Status code, idempotency key, cursor pagination, versioning, rate limit, webhook (HMAC, retry, replay)। Laravel রিফ্রেশ: container, queue, Eloquent N+1। | FN-06, FN-07 | 05 Stack/Queue | S5 |
| 7 | সোম ১০-০৫ | **React + Redux Toolkit + TS** | Reconciliation/key, `memo`/`useMemo`/`useCallback`, custom hook, RTK Query, typed props। **লাইভ প্র্যাকটিস:** ৪৫ মিনিটে filterable work-order list (RTK Query + TS)। | FN-08 | 08 Sorting/Searching | S6 |

### সপ্তাহ ২ — "Plus" স্কিল, ডিজাইন, মক

| দিন | তারিখ | ফোকাস | কাজ | ডক | DSA প্যাটার্ন | স্টোরি |
|----|------|-------|-----|----|--------------|-------|
| 8 | মঙ্গল ১০-০৬ | **HTML/CSS/SASS + React Native** | Semantic HTML, flex vs grid, specificity, BEM, SASS mixin। RN: web-এর সাথে পার্থক্য, navigation, FlatList, offline। | FN-09, FN-10 | 09 Trees | S7 |
| 9 | বুধ ১০-০৭ | **Microservices + Event-driven** | Service boundary, sync vs async, RabbitMQ vs Kafka, at-least-once, DLQ, outbox, saga, idempotent consumer। *(ঐচ্ছিক)* `fn-lite`-এ `WorkOrderAssigned` ইভেন্ট। | FN-11 | 10 Graphs BFS | S1 |
| 10 | বৃহঃ ১০-০৮ | **Docker / K8s / AWS / Linux / Git** | Multi-stage Dockerfile, compose, Pod/Deployment/Service/Ingress, probe, HPA। AWS core সার্ভিস। Linux: log, process, grep/awk। Git: rebase vs merge, conflict। `fn-lite` dockerize। | FN-12 | 10 Graphs DFS | S9 |
| 11 | শুক্র ১০-০৯ | **Observability + System Design** (৬ ঘণ্টা) | SLI/SLO/error budget, golden signals, tracing। **ডিজাইন:** "Field Nation work-order dispatch" আঁকো → ৩৫ মিনিটে জোরে বলে রেকর্ড করো। | FN-13, FN-14 | 11 Greedy | S4 |
| 12 | শনি ১০-১০ | **ডিজাইন ২ + টাইমড প্র্যাকটিস + মক ১** (৬ ঘণ্টা) | "PHP → Node migration" ডিজাইন (strangler fig)। টাইমড সেট: ৬ DSA (TS) ৯০ মিনিটে + ৫ SQL। **মক ১:** টেকনিক্যাল, ৬০ মিনিট। | FN-15, FN-19 | 12 DP (easy) | S1 |
| 13 | রবি ১০-১১ | **Behavioral + মক ২** | HR উত্তর (1–10 PM শিফট, notice period, স্যালারি, কেন FN), প্রশ্ন জিজ্ঞেস করার লিস্ট। S1–S9 সব একবার করে। **মক ২:** পূর্ণ ৯০ মিনিট (২০ behavioral + ৪০ coding + ৩০ design)। | FN-17, FN-18, FN-20 | 07 Recursion | সব |
| 14 | সোম ১০-১২ | **রিভিশন + লজিস্টিক** | `weak-areas.md`-এর যেকোনো ০–১ রেটিং আগে রিভাইস করো। ফাইনাল ক্র্যাম শিট। ল্যাপটপ/নেট/ক্যামেরা চেক। CV-র প্রতিটা সংখ্যা আরেকবার ডিফেন্ড করো। তাড়াতাড়ি ঘুমাও। | FN-21 | — (হালকা) | — |

---

## ৫. যদি ইন্টারভিউর ডেট আগে এসে যায়

বাকি দিন অনুযায়ী শুধু এই অর্ডারে করো:

1. FN-16 pitch + S1, S2, S5 স্টোরি (সবচেয়ে বেশি ওজন)
2. FN-02 JS + FN-03 TS (post-এ "strong" লেখা)
3. FN-05 MySQL + FN-06 REST
4. FN-08 React
5. FN-14 system design (একটাই)
6. FN-17 HR উত্তর

ডেট জানা মাত্র `_memory/decisions.md`-এ লেখো, তারপর Claude-কে বলো প্ল্যানটা নতুন ডেট অনুযায়ী আবার সাজাতে।

---

## ৬. শেষের মানদণ্ড (Day 14-এ চেক করো)

- [ ] `weak-areas.md`-এ কোনো **must** টপিক ১-এর নিচে নেই
- [ ] ৯টা STAR স্টোরির প্রতিটা ২ মিনিটে ইংরেজিতে বলতে পারি, সংখ্যা ডিফেন্ড করতে পারি
- [ ] TypeScript-এ easy প্রবলেম ১৫ মিনিটে, medium ৩০ মিনিটে শেষ হয়
- [ ] `fn-lite` GitHub-এ আছে, অন্তত ১টা টেস্ট আছে, README আছে
- [ ] একটা সিস্টেম ডিজাইন ৩৫ মিনিটে শুরু থেকে শেষ পর্যন্ত বলতে পারি
- [ ] ২টা মক শেষ, fix list-এর সব আইটেম বন্ধ
