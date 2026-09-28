> Tracker ID: FN-01 · Generated: 2026-09-28 · Source: `00-research/backend-system-design-study-plan.md` §0 + `_memory/story-bank.md`

# Work-Order Domain + Lifecycle

> এই ডকটাই সবচেয়ে বেশি leverage দেয় — Field Nation-এর নিজস্ব ভাষায় কথা বলতে পারলে ইন্টারভিউয়ার তোমাকে "already speaks our language" হিসেবে দেখবে।

---

## ১. মূল Entity-গুলো

| Concept | মানে | Sokrio parallel |
|---|---|---|
| **Buyer / Client** | যে কোম্পানির অন-সাইট কাজ দরকার (IT, POS, networking, telecom install) | Enterprise tenant |
| **Provider / Technician** | ফ্রিল্যান্স field tech যে Work Order (WO) নেয় | Field-force user / sales rep |
| **Work Order (WO)** | কেন্দ্রীয় entity — scope, location, schedule, pay, deliverables, status | Order / Task Manager task |
| **Routing / Dispatch** | সঠিক tech-কে WO পাঠানো (skill, distance, rating, availability দিয়ে) | Territory-scoped assignment |
| **Check-in / Check-out** | GPS + timestamp দিয়ে সাইটে আগমন/প্রস্থান রেকর্ড | Van attendance, check-ins, GPS-spoofing detection |
| **Deliverables** | কাজের প্রমাণ হিসেবে ছবি/সিগনেচার/ডকুমেন্ট আপলোড | Vehicle feedback uploads |
| **Approval → Payment** | Buyer কাজ approve করে, তারপর platform provider-কে পে করে | Payment gateway + reconciliation |
| **Ratings** | Buyer ↔ Provider মানের স্কোর, ভবিষ্যৎ routing-কে প্রভাবিত করে | Performance reports |
| **Integrations** | Buyer-রা নিজেদের ticketing tool REST API/webhook দিয়ে কানেক্ট করে | SOAP/REST sync for legacy clients |

---

## ২. Work-Order Lifecycle (মুখস্থ করো)

```
Draft → Published → Routed/Requested → Assigned → Confirmed
     → Checked-in → Checked-out → Work Done → Approved → Paid

                    (যেকোনো ধাপ থেকে) → Cancelled
                    (যেকোনো active ধাপ থেকে) → On Hold
                    (Checked-in/Checked-out থেকে) → Problem Reported
```

- **Draft** — buyer তৈরি করছে, এখনো পাবলিশ হয়নি
- **Published** — buyer পাবলিশ করলো, routing engine active
- **Routed/Requested** — নির্দিষ্ট technician(দের)-কে অফার/নোটিফাই করা হয়েছে
- **Assigned** — একজন technician accept করেছে (এখানেই race condition — দুইজন একসাথে accept করলে কী হয়, দেখো FN-05)
- **Confirmed** — technician শিডিউল কনফার্ম করেছে
- **Checked-in** — GPS + timestamp দিয়ে সাইটে পৌঁছানো রেকর্ড হলো
- **Checked-out** — কাজ শেষ, সাইট ছাড়ার রেকর্ড
- **Work Done** — deliverables (ছবি/সিগনেচার) আপলোড হয়ে গেছে
- **Approved** — buyer কাজ রিভিউ করে অ্যাপ্রুভ করলো
- **Paid** — provider-কে পেমেন্ট গেছে

এই state machine-টা ইন্টারভিউতে TypeScript discriminated union দিয়ে মডেল করতে বলতে পারে (দেখো FN-03) — প্রতিটা invalid transition (যেমন `checked_in → approved` সরাসরি) `409 Conflict` রিটার্ন করা উচিত।

---

## ৩. Sokrio Parallel — কোন প্রশ্নে কোনটা টানবে

| FN concept | Sokrio-তে যা সরাসরি করেছি | Story |
|---|---|---|
| WO entity + status lifecycle | Task Manager (plan → approval → achievement tracking) | S9 |
| Check-in/out + GPS | Van Attendance, GPS-spoofing fraud detection | S9 |
| Routing/dispatch (territory-scoped) | Territory-scoped RBAC, tenant-scoped query | S3 |
| Approval → Payment | Payment gateway: webhook, HMAC, idempotency, reconciliation | S5 |
| Integrations (buyer's ticketing tool) | Legacy client SOAP + REST sync | S7 |
| Buyer = Enterprise tenant | Multi-tenant landlord/tenant DB isolation | S3 |

**যা নতুন (honestly বলো):** technician **routing at marketplace scale** (skill/distance/rating-based automatic matching, geo-search) — Sokrio-তে territory-scoped assignment স্ট্যাটিক/hierarchy-ভিত্তিক ছিল, Field Nation-এর মতো real-time geo-matching engine সরাসরি বানাইনি। `[Komol পূরণ করবে: territory assignment কি ম্যানুয়াল ছিল নাকি কোনো auto-matching লজিক ছিল?]`

---

## ৪. মুখস্থ Pitch (ইংরেজি)

> "At Sokrio I build a multi-tenant field-force and order platform used by 100+ enterprise clients — check-ins, GPS, tasks, payments, integrations — and I led its move from a monolith to event-driven services. Field Nation's work-order marketplace is the same shape of problem."

---

## দ্রুত রিভিশন চেকলিস্ট
- [ ] Lifecycle-টা কাগজ ছাড়া বলতে/আঁকতে পারি
- [ ] প্রতিটা WO concept-এর Sokrio parallel এক লাইনে বলতে পারি
- [ ] "যা নতুন" অংশটা honestly স্বীকার করতে পারি, defensive না হয়ে
