> Tracker ID: FN-07 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 3 + `_memory/story-bank.md` S1, S3

# PHP/Laravel Delta — Field Nation-এর প্রসঙ্গে

> এটা **delta** ডক — জেনেরিক Laravel কনটেন্ট (`01-cse-fundamentals/theory/09-laravel-backend/`)-এ আছে, এখানে শুধু **Field Nation-specific framing**। "Backend built with PHP and MySQL, increasingly transitioning to Node.js" — মানে তারা তোমাকে ঠিক এই তুলনাটাই জিজ্ঞেস করবে।

---

## Q1. PHP-FPM per-request model vs Node-এর long-running process — ক্লাসিক তুলনা প্রশ্ন

- **PHP-FPM:** প্রতিটা request-এ একটা নতুন (বা pooled) worker process, request শেষ হলে মেমরি ক্লিন হয়ে যায় (shared-nothing)। Bug/memory leak এক request-এ পরের request-কে প্রভাবিত করে না — কিন্তু concurrency বাড়াতে বেশি process/worker লাগে (heavier)।
- **Node:** একটা single event-loop, সব request একই প্রসেসে চলে (non-blocking I/O)। মেমরি/স্টেট request-এর বাইরে persist করতে পারে (ভালো ও খারাপ দুটোই) — memory leak হলে পুরো process-কে প্রভাবিত করে, কিন্তু I/O-bound কাজে (যেমন অনেক concurrent API call) কম রিসোর্সে বেশি concurrency দেয়।

**"কেন company PHP থেকে Node-এ সরায়, কী PHP-তেই রাখবে?"** — Field Nation-এর real decision, তোমার নিজের অভিজ্ঞতা দিয়েই উত্তর দাও (নিচে S1)।

🔗 Sokrio link: S1 — Laravel monolith থেকে Node-স্টাইল সার্ভিস (RabbitMQ-connected) সরানোর সরাসরি অভিজ্ঞতা।

---

## Q2. "কেন PHP থেকে Node-এ সরাবে?" — নিজের মাইগ্রেশন গল্প দিয়ে উত্তর

Sokrio-তে Laravel 8 + Vue.js 2 monolith ছিল। কোর API Laravel-এই রাখা হয়েছে (auth, tenant resolution, main CRUD — কারণ এখানে Laravel-এর ecosystem/maturity ভালো কাজ করে), কিন্তু **Report, Notification, SOP** সার্ভিস আলাদা করে RabbitMQ দিয়ে যুক্ত করা হয়েছে (কারণ এগুলো async, event-driven, independently scale করা দরকার ছিল)।

**সাধারণ নীতি:** যেটা request-response, ACID transaction-heavy, দ্রুত ডেভেলপ করতে হবে — PHP/Laravel-এই রাখো। যেটা event-driven, I/O-heavy, independently scale করতে হবে, বা টিম নতুন স্ট্যাক শিখতে চায় — Node-এ সরাও। **Big-bang rewrite না, স্ট্র্যাংলার-ফিগ প্যাটার্নে piece-by-piece।**

🔗 Sokrio link: S1 — "core API + আলাদা Report/Notification/SOP সার্ভিস, RabbitMQ, দুই সিস্টেম প্যারালালে চালিয়ে zero-downtime cutover, সার্ভার লোড ~২০% কম।"

---

## Q3. Multi-tenant landlord/tenant DB switching — Laravel-depth flagship story

- **Landlord DB** — platform-level ডেটা (organization, billing, central entity)
- **Tenant DB** — প্রতি ক্লায়েন্টের নিজস্ব ডেটা (order, user, product, report), সম্পূর্ণ isolated
- Request আসলে middleware tenant resolve করে, `TenantManager::tenant($org)->reconnect()` দিয়ে DB connection সুইচ হয়, রেসপন্সের পর `DB::setDefaultConnection(landlord)`-এ ফেরত
- Cache key, queued job payload — সবকিছুতে tenant/territory scope বহন করতে হয়, নাহলে cross-tenant leak

এটা "data modelling" বা "security" প্রশ্নের সবচেয়ে শক্তিশালী উত্তর — ১০০+ টেন্যান্টে সত্যিকারের প্রোডাকশন-স্কেল multi-tenancy।

🔗 Sokrio link: S3 — "প্রতিটা ক্লায়েন্টের নিজস্ব tenant DB, landlord DB-র পেছনে। Request tenant resolve করে, connection সুইচ হয়, প্রতিটা cache key ও queued job tenant scope বহন করে। ১০০+ টেন্যান্টে শূন্য cross-tenant leak।"

---

## দ্রুত রিভিশন বুলেট (গভীর ব্যাখ্যা `01-cse-fundamentals/theory/09-laravel-backend/`-এ)

- **Eloquent N+1** — `with()`/eager loading দিয়ে ঠিক করা (S2-এ সরাসরি প্রমাণ আছে)
- **Queue** — retry, backoff, `failed_jobs`, priority job, dead-letter queue (S2)
- **Locking** — `lockForUpdate()` pessimistic; version-column optimistic (এখনো MySQL FN-05-এ কভার করা)
- **Service container / facades / middleware pipeline** — জেনেরিক Laravel ডকে বিস্তারিত

## দ্রুত রিভিশন চেকলিস্ট
- [ ] PHP-FPM vs Node তুলনা ৩০ সেকেন্ডে বলতে পারি
- [ ] "কেন সরাবে, কী রাখবে" প্রশ্নে নিজের S1 গল্প দিয়ে উত্তর দিতে পারি
- [ ] Multi-tenant DB switching request-থেকে-response পুরো ফ্লো মুখে বলতে পারি
