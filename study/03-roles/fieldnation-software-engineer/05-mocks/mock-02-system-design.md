> Tracker ID: FN-20 · Generated: 2026-09-28 · Source: `_memory/story-bank.md`, `04-behavioral/01-pitch-why-fieldnation.md`, `04-behavioral/02-hr-answers.md`, `03-system-design/01-work-order-dispatch.md`, `03-system-design/02-php-to-node-migration.md`, backend-system-design-study-plan.md Phase 12 Case 2

> 📌 2026-09-29: Renamed from `mock-02-full-loop.md` → this is now **Mock 2 of 5 (System Design)** in the new series (D8). The behavioral part moved to `mock-01-cv-behavioral.md`; focus on §২–৩ here.
>
> Mock 2 prompt: "Let's begin **Mock Interview 2: System Design & Architecture**. Focus on distributed systems, microservices, caching (Redis), message queues (RabbitMQ), database scaling (MySQL/MongoDB aggregations), and cloud deployment (AWS/Docker). Challenge my architectural choices and ask follow-ups on performance bottlenecks and high availability. Ask one question at a time."

# Mock 2 — System Design (was Full Loop, ৯০ মিনিট)

> এটাও একটা **টেমপ্লেট** (Day 13-এ চালানোর জন্য), ফলাফল আগে থেকে বানানো না। রেকর্ড করো, স্কোর দাও, নিচের Fix list ভরাট করো।

## টাইম বক্স

| সময় | সেকশন |
|-----|-------|
| ২০ মিনিট | Behavioral |
| ৪০ মিনিট | Coding (২টা DSA + ১টা backend design-in-code) |
| ৩০ মিনিট | System Design — Technician Matching/Routing |

---

## ১. Behavioral (২০ মিনিট — প্রতিটা ≤২ মিনিট)

1. "Tell me about your biggest project." → S1 (monolith → event-driven microservices)
2. "Tell me about a production incident you handled." → S4 (on-call + SLO, ৬৫% দ্রুত রেজোলিউশন)
3. "Why Field Nation?" → `04-behavioral/01-pitch-why-fieldnation.md`-এর "Why FN" উত্তর (কেন্দ্রে S9)
4. (ঐচ্ছিক ৪র্থ, সময় থাকলে) "A time you disagreed with a teammate/manager" → story-bank-এ এখনো নেই, `[Komol পূরণ করবে: S10 হিসেবে যোগ করো Day 13-এর আগে]`

---

## ২. Coding (৪০ মিনিট)

**DSA #১ (~১৫ মিনিট) — Trees প্যাটার্ন**
> একটা বাইনারি ট্রি দেওয়া আছে; level-order traversal-এ প্রতিটা লেভেলের গড় মান রিটার্ন করো (TypeScript-এ)।

**DSA #২ (~১৫ মিনিট) — Graphs BFS প্যাটার্ন**
> একটা adjacency list হিসেবে technician-দের "একই region"-এ থাকা গ্রাফ দেওয়া আছে; BFS দিয়ে একটা নির্দিষ্ট technician থেকে ৩-হপের মধ্যে সবাইকে বের করো।

**Backend design-in-code (~১০ মিনিট)**
> Work Order status-কে TypeScript discriminated union দিয়ে মডেল করো (`draft | published | assigned | checked_in | checked_out | approved | paid | cancelled`), আর একটা `transition(current, next)` ফাংশন লেখো যেটা অবৈধ ট্রানজিশনে একটা কাস্টম error (409-সমতুল্য) থ্রো করে।
> 🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই এই ঠিক ফর্মে — এভাবে বলো: "Sokrio-তে order/task status-এর মতো state machine সামলেছি Eloquent lifecycle hooks দিয়ে; TS discriminated union একই আইডিয়া, কম্পাইল-টাইমে চেক করে দেয়।"

---

## ৩. System Design — Technician Matching / Routing (৩০ মিনিট)

**প্রম্পট:** "একটা নতুন Work Order পোস্ট হলে, তার আশেপাশের সেরা ২০ জন যোগ্য technician খুঁজে বের করে নোটিফাই করো।"

**Requirements clarify করো:** skill/certification filter, distance radius, availability, rating, একই buyer-এর সাথে আগের কাজ, blocked list।

**Deep dives (অন্তত ২টা বেছে বলো):**
- Geo filtering: geohash vs Redis `GEOADD`/`GEOSEARCH` vs MySQL spatial index vs OpenSearch geo query — কোনটা কখন
- Ranking score: precompute vs per-request compute; fairness (একই technician-কে বারবার পিং না করা)
- Async flow: `WorkOrderPublished` event → matching worker → `ProvidersNotified` (এখানে S1-এর RabbitMQ অভিজ্ঞতা টানো)

🔗 Sokrio link: S1 (event-driven pipeline), S9 (technician/field-force ডোমেইন পরিচিতি) — কিন্তু বড়-স্কেল geo-matching নতুন টপিক, সততার সাথে স্বীকার করো।

---

## স্কোরিং রুব্রিক (০–৩, `weak-areas.md`-এর স্কেলের সাথে মিলিয়ে)

| মাপকাঠি | ০ | ১ | ২ | ৩ |
|---------|---|---|---|---|
| Clarity | এলোমেলো | মূল পয়েন্ট আছে কিন্তু গোছানো না | পরিষ্কার, মাঝে মাঝে থামে | শুরু থেকে শেষ পর্যন্ত গোছানো |
| Correctness | ভুল | আংশিক সঠিক | সঠিক, ছোট গ্যাপ | সম্পূর্ণ সঠিক |
| Trade-off reasoning | বলেইনি | ১টা trade-off বলেছে | ২টা+ trade-off, তুলনা করেছে | trade-off + কখন ভিন্ন সিদ্ধান্ত নিত সেটাও বলেছে |
| Communication (English) | থেমে থেমে | বোঝা যায় কিন্তু slow | flowing, occasional pause | interview-ready pace |

---

## Fix List (মক চালানোর পর ভরাট করো)

| তারিখ | কোন প্রশ্নে/সেকশনে আটকেছি | স্কোর | ফিক্স অ্যাকশন | বন্ধ? |
|-------|---------------------------|-------|---------------|-------|
| | | | | |
