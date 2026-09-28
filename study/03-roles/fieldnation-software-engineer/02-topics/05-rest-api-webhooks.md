> Tracker ID: FN-06 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` Phase 1 + `_memory/story-bank.md` S5, S7

# REST API + Webhooks — Interview Q&A

JD-তে স্পষ্ট লেখা "exposed via REST API" এবং "troubleshoot integration issues" — Field Nation-এর buyer-রা নিজেদের ticketing system দিয়ে API-তে ইন্টিগ্রেট করে। এটা প্রায় নিশ্চিত লাইভ-ডিজাইন প্রশ্ন হবে।

---

## Q1. PUT vs PATCH — কোনটা idempotent?

`PUT` পুরো resource replace করে, বারবার একই request পাঠালে একই ফলাফল (idempotent)। `PATCH` partial update — যদি তুমি `{"count": count + 1}` টাইপ delta পাঠাও তাহলে idempotent না, কিন্তু পুরো নতুন ভ্যালু পাঠালে (`{"status": "assigned"}`) idempotent হতে পারে। `GET`, `PUT`, `DELETE`, `HEAD`, `OPTIONS` idempotent; `POST` না।

🔗 Sokrio link: S5 — payment webhook idempotency-র সাথে একই চিন্তা (duplicate call safe রাখা)।

---

## Q2. ক্লায়েন্টের POST timeout হয়ে retry করলে, দুইটা duplicate work order তৈরি হয়ে গেলে?

সমাধান: client-কে **Idempotency-Key** header পাঠাতে বলো (একটা UUID, একই retry-তে একই key)। Server সেই key আগে দেখেছে কি না চেক করে — দেখলে পুরনো response ফেরত দেয়, নতুন রেকর্ড বানায় না। Key সাধারণত Redis-এ TTL সহ store হয় (২৪ ঘণ্টা যথেষ্ট)।

```
POST /work-orders
Idempotency-Key: 8f14e45f-...
```

🔗 Sokrio link: S5 — "প্রতিটা payment request idempotency key বহন করে, তাই duplicate callback ডাবল-চার্জ করতে পারে না।"

---

## Q3. Webhook ডিজাইন — client কীভাবে trust আর deduplicate করবে?

- প্রতিটা webhook payload-এ **HMAC signature** (shared secret দিয়ে sign করা) থাকবে header-এ (যেমন `X-Signature`), client নিজে verify করবে — man-in-the-middle বা fake payload ঠেকাতে।
- প্রতিটা event-এর একটা **unique event ID** (dedupe-এর জন্য) — একই event দুবার এলে client নিজের dedupe table চেক করে skip করবে।
- Delivery fail হলে **exponential backoff + retry**, একটা নির্দিষ্ট সংখ্যার পর disable + replay UI/endpoint।
- **Ordering** guarantee করা কঠিন (retry-তে অর্ডার এলোমেলো হতে পারে), তাই প্রতিটা event-এ timestamp/version পাঠাও, client নিজে stale event বাতিল করতে পারে।

🔗 Sokrio link: S5 — HMAC signature verification + idempotency key, প্রোডাকশনে zero failed transaction।

---

## Q4. Offset pagination ১০ মিলিয়ন রো-তে স্লো কেন? Cursor pagination কীভাবে ঠিক করে?

`OFFSET 500000 LIMIT 20` করলে MySQL-কে প্রথম ৫ লাখ রো স্ক্যান করে **বাদ দিতে হয়**, তারপর ২০টা ফেরত দিতে হয় — যত বড় offset, তত স্লো। **Cursor/keyset pagination**-এ শেষ রো-র কোনো unique sortable ভ্যালু (যেমন `id` বা `created_at`) পরের request-এ পাঠানো হয়:

```sql
SELECT * FROM work_orders WHERE id > :last_id ORDER BY id LIMIT 20;
```

এখানে ইনডেক্স সরাসরি সঠিক জায়গা থেকে স্ক্যান শুরু করে, offset-এর কনস্ট্যান্ট-টাইম cost নেই।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Report API-তে large dataset-এর জন্য cursor-based pattern পছন্দ করি; Sokrio-র বড় রিপোর্টগুলো MongoDB aggregation দিয়ে পেজিনেট করা হয় (S2)।"

---

## Q5. 401 vs 403, 400 vs 422?

- **401 Unauthorized** — তুমি কে সেটাই জানা যায়নি (auth token নেই/invalid)
- **403 Forbidden** — তোমাকে চেনা গেছে, কিন্তু এই action-এর অনুমতি নেই
- **400 Bad Request** — request-এর syntax/format ভুল (malformed JSON)
- **422 Unprocessable Entity** — syntax ঠিক কিন্তু validation ভুল (business rule ভেঙেছে, যেমন required field খালি)

🔗 Sokrio link: S3 — territory-scoped RBAC-এ 403 আর tenant-resolve-না-হওয়া 401-এর পার্থক্য এভাবেই হ্যান্ডল হয়।

---

## Q6. Resource naming convention

Noun-based, verb না: `/work-orders/{id}/assignments` ঠিক, `/assignWorkOrder` ভুল। Nested resource-এর গভীরতা ২ লেভেলের বেশি না রাখা ভালো। Action যেটা pure CRUD না (যেমন "accept") সেটা sub-resource বা verb-endpoint হিসেবে গ্রহণযোগ্য: `POST /work-orders/{id}/accept`।

🔗 Sokrio link: S7 — REST + SOAP উভয় ধরনের client integration-এর অভিজ্ঞতা।

---

## Q7. Versioning — URL নাকি header?

- **URL (`/v2/work-orders`)** — সহজ, discoverable, cache-friendly, কিন্তু URL "duplicate" মনে হতে পারে
- **Header (`Accept: application/vnd.fn.v2+json`)** — cleaner URL, কিন্তু কম discoverable, ক্লায়েন্ট ভুলে যেতে পারে header পাঠাতে

Public API-তে URL versioning বেশি প্রচলিত (client ইন্টিগ্রেশনের জন্য সহজ বোঝা যায়)।

🔗 Sokrio link: S7 — legacy enterprise client-এর জন্য আলাদা SOAP endpoint বজায় রাখা, অনেকটা versioning-এর মতোই সমস্যা।

---

## Q8. Rate limiting — কীভাবে করবে?

`429 Too Many Requests` + `Retry-After` header। অ্যালগরিদম: token bucket (burst allow করে) বা sliding window (smooth). Redis-এ counter রাখা যায় (`INCR` + `EXPIRE`), key-তে client/API-key স্কোপ করতে হবে।

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: "Rate limiting সরাসরি ইমপ্লিমেন্ট করিনি, কিন্তু cache key সবসময় tenant-scoped রাখার একই নীতিতে per-client key ডিজাইন করব।"

---

## Q9. Error format — consistent envelope কেন দরকার?

RFC 7807 (`application/problem+json`)-এর মতো একটা consistent shape:
```json
{ "type": "https://api.fn.com/errors/validation", "title": "Invalid status transition", "status": 422, "detail": "Cannot move from checked_out to draft" }
```
ক্লায়েন্ট predictable ভাবে parse করতে পারে, প্রতিটা endpoint আলাদা shape দিলে integration ভঙ্গুর হয়ে যায়।

🔗 Sokrio link: S7 — client integration-এর সময় error consistency-ই সবচেয়ে বেশি জিজ্ঞেস করা সমস্যা।

---

## Q10. CORS, HTTPS, caching headers — সংক্ষেপে

- **CORS** — browser cross-origin request ব্লক করে, server `Access-Control-Allow-Origin` দিয়ে অনুমতি দেয়
- **HTTPS/TLS** — সব production traffic-এ বাধ্যতামূলক, credential/token plaintext-এ যাবে না
- **ETag/Cache-Control** — GET response cache করতে, client `If-None-Match` পাঠালে ৩০৪ ফেরত দেওয়া যায় (bandwidth বাঁচে)

🔗 Sokrio link: সরাসরি অভিজ্ঞতা নেই।

---

## fn-lite হ্যান্ডস-অন (Day 4-এর জন্য)

OpenAPI spec ডিজাইন করো: `POST /work-orders`, `GET /work-orders?status=&cursor=`, `POST /work-orders/{id}/assign`, `POST /work-orders/{id}/check-in` — প্রতিটার জন্য request/response shape, status codes, auth header।

## দ্রুত রিভিশন চেকলিস্ট
- [ ] Idempotency key-র পুরো ফ্লো মুখে বলতে পারি
- [ ] Webhook trust+dedupe+retry ৩টা পয়েন্টই বলতে পারি
- [ ] Cursor pagination কেন offset-এর চেয়ে দ্রুত, ছবি এঁকে বোঝাতে পারি
