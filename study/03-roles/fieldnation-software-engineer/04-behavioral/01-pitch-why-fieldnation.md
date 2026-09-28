> Tracker ID: FN-16 · Generated: 2026-09-28 · Source: `_memory/story-bank.md` (S1, S9), `00-plan/01-fieldnation-se-14-day-plan.md` §১

# Pitch + "Why Field Nation"

> নিয়ম: এই ডকের **মূল বাক্যগুলো ইংরেজিতে** — ইন্টারভিউ ইংরেজিতে হবে, তাই মুখস্থ ও রিহার্সাল ইংরেজিতেই করা উচিত। বাংলা অংশ শুধু ব্যাখ্যা/কনটেক্সটের জন্য।

## ৩০-সেকেন্ড পিচ (elevator version)

> "I'm a software engineer at Sokrio, where I build a multi-tenant field-force and order platform used by 100+ enterprise clients — check-ins, GPS tracking, tasks, payments, integrations. I led its move from a monolith to event-driven microservices. Field Nation's work-order marketplace is the same shape of problem, just with a different vertical, so I'd be productive here fast."

**কখন বলবে:** HR screen-এর একদম শুরুতে, "tell me about yourself" প্রশ্নে। ২টা বাক্যের বেশি লম্বা করবে না — এই পর্যায়ে ইন্টারভিউয়ার শুধু ফিট বুঝতে চায়।

🔗 Sokrio link: S1 (monolith → microservices), S9 (field-force/GPS)

---

## ১-মিনিট পিচ (technical round opener)

> "At Sokrio I'm one of the engineers building a multi-tenant SaaS platform for field-force and order management — think task assignment, GPS-verified check-ins, van sales, and payment reconciliation, serving 100+ enterprise clients. Two things I'm proud of: I led the migration from a Laravel/Vue monolith to a core API plus event-driven services over RabbitMQ, with a zero-downtime parallel-run cutover that cut server load by about 20%. And I built the field-force modules myself — task tracking, van attendance, and GPS-spoofing fraud detection — which directly grew a meaningful share of company revenue. Field Nation's work-order lifecycle — post, route to a technician, check-in, check-out, approve, pay — is structurally the same problem I've been solving for three years, just B2B gig-marketplace shaped instead of B2B SaaS shaped."

**কখন বলবে:** টেকনিক্যাল রাউন্ডের শুরুতে "walk me through your background" প্রশ্নে।

🔗 Sokrio link: S1, S9

---

## ২-মিনিট পিচ (hiring manager / culture round)

বেসিক কাঠামো (১-মিনিট পিচের ওপর যোগ করো):

1. **Context (৩০ সে):** ১-মিনিট পিচের প্রথম অংশ — কে, কী প্ল্যাটফর্ম, কত ক্লায়েন্ট।
2. **একটা গভীর উদাহরণ (৪৫ সে):** S1-এর মাইগ্রেশন গল্প পুরোটা — কেন করা হলো, কীভাবে (RabbitMQ, MongoDB, Redis, parallel run), ফলাফল (~২০% লোড কমা)। `[Komol পূরণ করবে: monolith-এ ঠিক কী ব্যথা ছিল — স্লো deploy? টিমের সাইজ কত ছিল?]`
3. **কেন Field Nation-এ ফিট (৩০ সে):** নিচের "Why Field Nation" সেকশন থেকে সংক্ষিপ্ত ভার্সন।
4. **ক্লোজ (১৫ সে):** "That's why I think this role is a natural next step for me, not a lateral move."

🔗 Sokrio link: S1, S9

---

## "Why Field Nation" — পূর্ণ উত্তর

> "Field Nation's work-order marketplace — buyers post work, providers get routed to it, they check in and out with location proof, upload deliverables, get approved and paid — is almost exactly the shape of what I've already built at Sokrio. My field-force modules handle task assignment, GPS-verified check-ins for van attendance, and fraud detection for spoofed locations — the same trust problem Field Nation has with its technicians. On top of that, Field Nation is moving its PHP core to Node.js microservices, and I've already led that exact kind of migration once, end to end, with production stakes and zero downtime. So this isn't me learning a new domain from scratch — it's me applying a problem I've already solved, at a company where it's the entire product instead of one module of a bigger platform."

🔗 Sokrio link: S9 (**এটাই কেন্দ্রীয় প্রমাণ** — story-bank অনুযায়ী), S1 (মাইগ্রেশন ম্যাচ)

**Defend-এর জন্য প্রস্তুত থাকো:** GPS-spoofing ঠিক কীভাবে ধরো (mock-location flag? speed/distance jump?) — `[Komol পূরণ করবে]`, story-bank S9-এ এখনো ফাঁকা।

---

## নোট: আবেদন এখনো করা হয়নি

Komol এখনো Field Nation-এ আবেদন করেনি। এই পিচগুলো দুই জায়গায় কাজে লাগবে:

1. **CV cover note / LinkedIn message-এ:** ১-মিনিট পিচের লিখিত ভার্সন (৩-৪ বাক্যে ছোট করে) — আবেদনের সময় ব্যবহার করো।
2. **আসল ইন্টারভিউতে:** ৩০-সে ও ১-মিনিট ভার্সন মুখে বলার জন্য মুখস্থ রাখো।

আবেদনের আগে এই ডকটা আরেকবার পড়ে নিজের ভাষায় সহজ করে নাও, যাতে মুখস্থ-শোনা না যায়।
