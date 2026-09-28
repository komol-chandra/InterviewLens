> Tracker ID: FN-19 · Generated: 2026-09-28 · Source: `02-topics/01-javascript-es6.md`, `02-topics/02-typescript.md`, `02-topics/04-mysql-advanced.md`, `02-topics/05-rest-api-webhooks.md`

> 📌 2026-09-29: Renamed from `mock-01-technical.md` → this is now **Mock 4 of 5 (DB + API)** in the new series (D8). See `00-series-overview.md`.
>
> Mock 4 prompt: "Let's begin **Mock Interview 4: Database Optimization & API Engineering**. Ask 5 scenario-based questions about schema design, slow query optimization, indexing strategies, RESTful API design, background processing pipelines, and data synchronization between systems. Ask one question at a time."

# Mock 4 — DB + API (৬০ মিনিট)

> এটা একটা **টেমপ্লেট**, রেকর্ডেড ট্রান্সক্রিপ্ট না। Day 12-এ আসলে চালাও (টাইমার নিয়ে, জোরে বলে), তারপর নিচের "Fix list" ভরাট করো।

## কীভাবে চালাবে
- একা হলে জোরে বলো + রেকর্ড করো; কেউ থাকলে তাকে interviewer বানাও।
- প্রতিটা সেকশনের টাইমার আলাদাভাবে চালাও, ওভার হলেও থামবে না — কোথায় আটকেছ সেটাই আসল ডেটা।
- **Pass মানে:** কোড কম্পাইল-লেভেলে সঠিক (সিনট্যাক্স এরর ছাড়া লজিক), *কেন* এই অ্যাপ্রোচ সেটা বলতে পারা, আর একটা ফলো-আপ "যদি X হয়?" প্রশ্নে আটকে না যাওয়া।

## টাইম বক্স

| সময় | সেকশন | সোর্স ডক |
|-----|-------|----------|
| ৫ মিনিট | ইন্ট্রো + ৩০-সেকেন্ড pitch | `04-behavioral/01-pitch-why-fieldnation.md` |
| ২০ মিনিট | JS/TS live coding (২টা প্রবলেম) | `02-topics/01-javascript-es6.md`, `02-topics/02-typescript.md` |
| ১৫ মিনিট | MySQL — index + EXPLAIN | `02-topics/04-mysql-advanced.md` |
| ১৫ মিনিট | REST/Webhook ডিজাইন প্রশ্ন | `02-topics/05-rest-api-webhooks.md` |
| ৫ মিনিট | Wrap-up + প্রশ্ন জিজ্ঞাসা | `04-behavioral/03-questions-to-ask.md` |

---

## ১. JS/TS Live Coding (২০ মিনিট)

**Q1 (~১০ মিনিট) — `debounce` টাইপড ভার্সন**
> TypeScript-এ একটা জেনেরিক `debounce<T extends (...args: any[]) => void>(fn: T, wait: number): T` লেখো। তারপর ব্যাখ্যা করো: এটা `setTimeout` আর event loop-এর macrotask queue কীভাবে ব্যবহার করে, আর `throttle`-এর সাথে পার্থক্য কী।

**Q2 (~১০ মিনিট) — জেনেরিক `groupBy`**
> `function groupBy<T, K extends string | number>(items: T[], keyFn: (item: T) => K): Record<K, T[]>` লেখো। একটা ফলো-আপ: Work Order অ্যারেকে `status`-এর ওপর group করে দেখাও। এরপর জিজ্ঞাসা করবে: `unknown` বনাম `any` কোথায় ব্যবহার করতে, generics-এর সুবিধা কী।

---

## ২. MySQL — Index + EXPLAIN (১৫ মিনিট)

**Q1 — কম্পোজিট ইনডেক্স ডিজাইন**
> এই কোয়েরিটার জন্য ইনডেক্স ডিজাইন করো (জোরে বলে, leftmost-prefix যুক্তিসহ):
> `SELECT * FROM work_orders WHERE buyer_id=? AND status=? ORDER BY scheduled_at DESC LIMIT 20`

**Q2 — Accept Race Condition**
> দুইজন technician একই মিলিসেকেন্ডে একটা Work Order-এ "Accept" ক্লিক করলে কী হয়? তিনটা সমাধান বলো (conditional UPDATE + `affected_rows` চেক, `SELECT … FOR UPDATE`, version column) — সবচেয়ে সহজটা কেন সবচেয়ে ভালো এখানে সেটাও বলো।
> 🔗 Sokrio link: S2 (MySQL/EXPLAIN গভীরতার প্রমাণ, direct race-condition experience না — সৎভাবে বলো)

---

## ৩. REST/Webhook ডিজাইন (১৫ মিনিট)

> Design করো: `workorder.status_changed` webhook একটা buyer-এর ইন্টিগ্রেশনে পাঠানো — payload shape, retry policy, HMAC signature verification, replay protection। জিজ্ঞাসা করবে: webhook দুইবার এলে কী হয়, gateway ডাউন থাকলে কী হয়।
> 🔗 Sokrio link: S5 (payment webhook HMAC + idempotency — একদম সরাসরি প্রাসঙ্গিক)

---

## Fix List (মক চালানোর পর ভরাট করো)

| তারিখ | কোন প্রশ্নে আটকেছি | কেন আটকেছি | ফিক্স অ্যাকশন | বন্ধ? |
|-------|--------------------|--------------|---------------|-------|
| | | | | |
