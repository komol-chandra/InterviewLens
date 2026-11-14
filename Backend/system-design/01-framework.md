> Tracker ID: SD-01 · Generated: 2026-10-15 · Track: TRK-01 Phase 0 · Status: ✅ generated

# SD-01: ৪৫-মিনিট System Design ফ্রেমওয়ার্ক + Estimation চিটশিট

> **এক লাইনে:** ইন্টারভিউয়ার "সঠিক ডিজাইন" খোঁজে না। সে দেখে তুমি **কাঠামো ধরে** এগোও কি না, আর প্রতিটা সিদ্ধান্তের **trade-off** মুখে বলো কি না।
> HM রাউন্ডে প্যানেল "can you sketch it?" বললে এই ৭ ধাপই চলবে, শুধু সময় ছোট করে (নিচে §৪)।

---

## ১. ৭ ধাপ: সময় ভাগ (৪৫ মিনিট)

| # | ধাপ | মিনিট | আউটপুট (বোর্ডে যা থাকবে) | ফাঁদ |
|---|---|---|---|---|
| 1 | **Requirements** | ৫ | Functional ৩–৫টা বুলেট · Non-functional (scale, latency, consistency, availability) · **Out of scope** | না জিজ্ঞেস করে আঁকা শুরু |
| 2 | **Estimation** | ৩–৫ | QPS (avg + peak), storage/বছর, read:write অনুপাত | ১০ মিনিট অঙ্কে আটকে থাকা: শুধু ক্রম (order of magnitude) দরকার |
| 3 | **API** | ৩–৫ | ৩–৫টা endpoint: method, path, মূল ফিল্ড, pagination, idempotency key | সব CRUD লেখা: শুধু core flow |
| 4 | **Data model** | ৫ | মূল entity + key field + **access pattern** → SQL না NoSQL, index, shard key | টেবিল আঁকা কিন্তু "কোন query চলবে" না বলা |
| 5 | **High-level design** | ১০ | Client → LB → service(s) → cache → DB → queue → worker; একটা request-এর পুরো পথ | ১৫টা বক্স, কোনোটার কারণ নেই |
| 6 | **Deep dive** | ১০–১২ | ১–২টা কঠিন অংশ: bottleneck, hot key, fan-out, consistency, failure | নিজে বেছে না নেওয়া: ইন্টারভিউয়ারকে জিজ্ঞেস করো "which part should we go deeper on?" |
| 7 | **Wrap-up** | ৩ | Bottleneck, failure mode, monitoring, "আরো সময় পেলে কী করতাম" | চুপ করে শেষ করা |

**মুখস্থ সূত্র:** **R-E-A-D-H-D-W** → "**R**eally **E**very **A**rchitect **D**raws **H**igh-level **D**esigns **W**ell"

---

## ২. প্রতিটা ধাপে মুখে বলার লাইন (English)

**1. Requirements**
- "Before I draw anything, let me clarify scope. Who are the users, and what are the 3 core actions?"
- "Is this read-heavy or write-heavy? What latency do users expect, under 200 ms?"
- "Do we need strong consistency here, or is a few seconds of staleness OK?"
- "I'll keep X and Y out of scope unless you want them in."

**2. Estimation**
- "Let me do a quick back-of-envelope so the design matches the scale, order of magnitude only."
- "So roughly 1K writes/sec and 20K reads/sec at peak. That tells me reads need caching and one DB primary can still take the writes."

**3. API**
- "Here are the core endpoints. I'll add an idempotency key on the create call so retries don't double-write."

**4. Data model**
- "The main access pattern is *get X by user, newest first*, so I'll index on (user_id, created_at)."
- "I'll choose SQL here because we need transactions across A and B. If it were mostly append-only events with flexible shape, I'd consider a document store."

**5. HLD**
- "Let me walk one request end to end." (একটা request-এর পথ আঙুল দিয়ে দেখাও)
- "Services are stateless so we can scale horizontally behind the load balancer."

**6. Deep dive**
- "The hardest part here is ___. Which would you like me to go deeper on: ___ or ___?"
- "Option A gives us ___ but costs ___. Option B ___. Given our requirement of ___, I'd pick A."

**7. Wrap-up**
- "The first bottleneck at 10x scale would be ___. I'd watch ___ metric and alert on ___."
- "If I had more time, I'd add ___."

> **Trade-off বাক্যের ছাঁচ (সবচেয়ে জরুরি):** "I chose **X** over **Y** because **[requirement]**. The cost is **[downside]**, which is acceptable because **[reason]**."

---

## ৩. Back-of-envelope চিটশিট

### ৩.১ মুখস্থ সংখ্যা

| জিনিস | মান |
|---|---|
| ১ দিন | ~**১০⁵ সেকেন্ড** (৮৬,৪০০) |
| ১ মাস / ১ বছর | ~২.৫ × ১০⁶ s / ~৩ × ১০⁷ s |
| ১ মিলিয়ন রিকোয়েস্ট/দিন | ≈ **১২ QPS** গড় |
| ১০০ মিলিয়ন/দিন | ≈ ১,২০০ QPS |
| Peak | গড় × **২–৩** (B2B office-hour ট্রাফিক হলে × ৩–৫) |
| KB / MB / GB / TB | ১০³ / ১০⁶ / ১০⁹ / ১০¹² bytes |

### ৩.২ Latency (ক্রম মনে রাখো, হুবহু সংখ্যা না)

| অপারেশন | মোটামুটি |
|---|---|
| L1 cache / RAM পড়া | ns (১–১০০ ns) |
| Redis GET (একই DC) | ~০.৫–১ ms |
| SSD random read | ~০.১ ms |
| Indexed DB query (একই DC) | ~১–১০ ms |
| একই DC-তে round trip | ~০.৫ ms |
| মহাদেশ পার (US ↔ Asia) | ~১৫০–২০০ ms |

**মূল কথা:** memory ≫ SSD ≫ network ≫ cross-region। তাই cache বসানো আর একই region-এ রাখা সবচেয়ে সস্তা জয়।

### ৩.৩ একটা সার্ভার কতটা নেয় (রাফ, বলার জন্য যথেষ্ট)

| কম্পোনেন্ট | মোটামুটি capacity |
|---|---|
| Stateless app server (সাধারণ API) | ~১K–৫K QPS |
| MySQL/Postgres primary (সাধারণ write) | ~১K–৫K writes/s, indexed reads আরো বেশি |
| Redis এক নোড | ~১০০K ops/s |
| Kafka partition | ~১০ MB/s |

> এগুলো **আলোচনা শুরুর অনুমান**, বেঞ্চমার্ক না। মুখে বলো "roughly", আর ইন্টারভিউয়ার অন্য সংখ্যা দিলে সেটাই নাও।

### ৩.৪ অঙ্কের ছাঁচ (৩ লাইন)

```
QPS      = DAU × (actions/user/day) ÷ 10⁵       → peak = ×3
Storage  = writes/day × size/record × 365 × years (× replication 3)
Bandwidth= QPS × payload size
```

**উদাহরণ: notification service, 10M DAU, জনপ্রতি দিনে ৫টা notification**
- Writes: 10⁷ × 5 ÷ 10⁵ = **৫০০/s** গড়, peak ~**১.৫K/s** → একটা DB primary + queue যথেষ্ট, shard লাগবে না এখনই
- Storage: 5 × 10⁷/দিন × ৫০০ B ≈ ২৫ GB/দিন → ~**৯ TB/বছর** → পুরনো ডেটা archive/TTL লাগবে
- সিদ্ধান্ত: "Writes are modest, storage grows fast, so I'll partition by time and expire old rows, not shard by user on day one."

> লক্ষ করো: অঙ্কের শেষে **একটা ডিজাইন সিদ্ধান্ত** বলেছি। সিদ্ধান্তহীন অঙ্ক = সময় নষ্ট।

---

## ৪. ছোট ভার্সন: HM প্যানেলে "sketch it" (১০–১৫ মিনিট)

HM রাউন্ড পুরো SD রাউন্ড না। তখন:

1. **৩০ সেকেন্ড:** scope + scale এক বাক্যে ("~X tenants, mostly reads, reports must be fresh within minutes")
2. **৫ মিনিট:** HLD বক্স আঁকো + একটা request-এর পথ
3. **৫ মিনিট:** **তোমার করা** একটা কঠিন সিদ্ধান্ত + trade-off (Sokrio থেকে: A1 multi-tenant, A2 report cache)
4. **১ মিনিট:** "What I'd change at 10x"

> নিজের সিস্টেম বলার সময় **Honesty Rule**: যা তুমি নিজে বানিয়েছ আর যা টিম বানিয়েছে, আলাদা করে বলো ("I designed…" vs "our team used…")। Receipt card-এর সংখ্যার বাইরে কোনো সংখ্যা বলবে না।

---

## ৫. স্কোরিং: ইন্টারভিউয়ার যা চেক করে

| সিগন্যাল | ভালো দেখায় | খারাপ দেখায় |
|---|---|---|
| Scoping | প্রশ্ন করে, out-of-scope ঘোষণা করে | সরাসরি আঁকা |
| Trade-off | প্রতিটা বক্সে "why this, not that" | বাজওয়ার্ড (Kafka, K8s) কারণ ছাড়া |
| Depth | ১–২ জায়গায় সত্যিকারের গভীরে যায় | সব জায়গায় ভাসা-ভাসা |
| Communication | চিন্তা জোরে বলে, ইন্টারভিউয়ারকে সাথে রাখে | ৫ মিনিট চুপচাপ আঁকা |
| Pragmatism | আগে সহজ, পরে scale | প্রথম দিনেই ১০টা microservice |

---

## ৬. প্র্যাকটিস (আজ ২০ মিনিট)

1. ⬜ §১-এর টেবিল না দেখে খাতায় ৭ ধাপ + মিনিট লেখো
2. ⬜ §৩.৪-এর অঙ্ক নিজে করো: **"URL shortener, 100M নতুন URL/মাস, read:write = 100:1"** → write QPS, read QPS, ৫ বছরের storage (৫০০ B/URL)
3. ⬜ §৪-এর ছোট ভার্সনে Sokrio multi-tenant ইংরেজিতে জোরে বলো, ফোনে রেকর্ড করো (১০ মিনিট)। পরের ডক SD-23 এটাকেই পূর্ণ কেস বানাবে

<details><summary>২-এর উত্তর</summary>

- Write: 10⁸ ÷ (2.5 × 10⁶ s) ≈ **৪০/s**; peak ~১২০/s
- Read: × 100 ≈ **৪K/s**; peak ~১২K/s → cache বাধ্যতামূলক
- Storage: 10⁸ × 12 × 5 × 500 B = **৩ TB** (replication ছাড়া)
- সিদ্ধান্ত: read-heavy → Redis cache-এ hot URL; ৩ TB এক DB-তে চলে, তবে key-value store-এ shard সহজ
</details>

---

🔗 Sokrio link: §৪-এর ছোট ভার্সনে বলার মূল কেস = A1 (multi-tenant) আর A2 (report cache), `0-now/hm-qbank.md` থেকে। ফ্রেমওয়ার্কটা নিজে জেনেরিক, তাই সরাসরি কোনো স্টোরি নেই।

🔗 পরের ধাপ: `5-tracks/system-design/cases/23-multi-tenant-saas.md` (SD-23) · কেস ছাঁচের উদাহরণ: `4-library/fieldnation/system-design/` (FN-14)
