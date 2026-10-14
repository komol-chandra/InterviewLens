> Tracker ID: FN-13 · Generated: 2026-09-28 · Source: backend-system-design-study-plan.md Phase 9, story-bank.md S4 (weak-areas.md-এ এই টপিকে self-rating সবচেয়ে বেশি — ৩)

# Observability + SLI/SLO — Q&A

> এটা Komol-এর সবচেয়ে শক্তিশালী টপিক (weak-areas.md rating ৩) — তাই এখানে গভীরে যাওয়া, আত্মবিশ্বাসী টোনে বলা।

## ১. Observability-র তিন স্তম্ভ কী কী?

- **Logs:** কী ঘটেছে, বিস্তারিত — structured JSON (key-value), request-এর সাথে একটা `correlation_id`/`trace_id` জুড়ে দেওয়া, যাতে একই রিকোয়েস্টের সব লগ এক সাথে খোঁজা যায়।
- **Metrics:** সংখ্যা, সময়ের সাথে (latency, error rate, throughput) — অ্যাগ্রিগেটেড, ড্যাশবোর্ড/অ্যালার্টের ভিত্তি।
- **Traces:** একটা রিকোয়েস্ট একাধিক সার্ভিস পার হয়ে কোথায় কতটা সময় নিলো — distributed tracing (OpenTelemetry), span-এর ট্রি।

🔗 Sokrio link: S4 — APM, Grafana/Prometheus, CloudWatch, Laravel Telescope, structured logging — ছয়টা প্রোডাকশন অ্যাপ জুড়ে ব্যবহৃত।

## ২. SLI, SLO, SLA, Error Budget — পার্থক্য কী?

- **SLI (Indicator):** মাপা মেট্রিক — যেমন "% রিকোয়েস্ট যা ৩০০ms-এর নিচে রেসপন্স দিলো"।
- **SLO (Objective):** টার্গেট — "৯৯% রিকোয়েস্ট ৩০ দিনে ৩০০ms-এর নিচে"।
- **SLA (Agreement):** কাস্টমারের সাথে চুক্তি, না মানলে পেনাল্টি (SLO-র চেয়ে আলগা টার্গেট রাখা হয়, বাফার রাখার জন্য)।
- **Error Budget:** SLO-র "অনুমোদিত ব্যর্থতার পরিমাণ" — যেমন ৯৯.৯% আপটাইম SLO মানে মাসে ~৪৩ মিনিট ডাউনটাইম "budget"। বাজেট শেষ হয়ে গেলে নতুন ফিচার রিলিজ থামিয়ে স্ট্যাবিলিটিতে ফোকাস — এইভাবে টিমের রিলিজ ভেলোসিটি আর রিলায়াবিলিটির মধ্যে ভারসাম্য তৈরি হয়।

🔗 Sokrio link: S4 — "SLI/SLO ট্র্যাক (৯৯.৯% রিপোর্ট availability, API latency, error rate)", "SLO-ভিত্তিক alert"।

## ৩. Golden Signals / RED / USE method

- **Golden signals:** Latency, Traffic, Errors, Saturation।
- **RED (সার্ভিসের জন্য):** Rate (req/sec), Errors (error rate), Duration (latency)।
- **USE (রিসোর্সের জন্য):** Utilization, Saturation, Errors — CPU/মেমরি/ডিস্কের মতো রিসোর্সে।

## ৪. p50/p95/p99 কেন গড়ের (average) চেয়ে ভালো?

গড় আউটলায়ার দিয়ে সহজে বিভ্রান্ত হয় (একটা খুব ধীর রিকোয়েস্ট গড়কে টেনে ধরে না ফেলতেও পারে যদি বাকিগুলো দ্রুত হয়)। p95/p99 বলে "৫% বা ১% সবচেয়ে খারাপ ইউজার-এর এক্সপেরিয়েন্স আসলে কেমন" — যেটা real user experience-এর কাছাকাছি প্রতিনিধিত্ব করে, বিশেষ করে বড় স্কেলে যেখানে ১% মানেই হাজার হাজার ইউজার।

**সম্ভাব্য প্রশ্ন:** "p99 latency স্পাইক করেছে কিন্তু average ঠিক আছে — কী হতে পারে?"
উত্তর: সমস্যাটা সব রিকোয়েস্টে না, একটা নির্দিষ্ট সাবসেটে (যেমন একটা নির্দিষ্ট query pattern, একটা নির্দিষ্ট টেন্যান্ট/শার্ড, cold cache hit, GC pause, একটা স্লো downstream dependency)। গড় এই আউটলায়ারদের ডাইলিউট করে দেখায় বলে সমস্যা লুকিয়ে যায়।

## ৫. অ্যালার্টিং — symptom-এ, cause-এ না; alert fatigue কী

**Symptom-based alerting:** "ইউজার কি প্রভাবিত হচ্ছে?" (high error rate, high latency) — এটার ওপর অ্যালার্ট করো। **Cause-based** (high CPU, disk almost full) সবসময় ইউজার-ইমপ্যাক্টিং না — এসবের ওপর সরাসরি পেজ করলে অকারণে মানুষ জাগানো হয়, আর বারবার হলে "alert fatigue" — লোকে অ্যালার্ট ইগনোর করতে শুরু করে, আসল ইনসিডেন্টও miss হয়ে যায়। Burn-rate alert (error budget কত দ্রুত খরচ হচ্ছে) একটা ভালো middle-ground — ধীরে খরচ হলে টিকিট, দ্রুত খরচ হলে পেজ।

## ৬. Incident response flow

Detect (অ্যালার্ট/মনিটরিং থেকে) → Mitigate (আগে ইউজার-ইমপ্যাক্ট কমানো — rollback, feature flag off, স্কেল আপ — root cause এখনই বের করার দরকার নেই) → Resolve (আসল কারণ ঠিক করা) → **Blameless postmortem** (কী ভাঙল, কেন সিস্টেম সেটা প্রিভেন্ট করেনি, কী অ্যাকশন আইটেম — ব্যক্তির দোষ খোঁজা না, প্রসেস/সিস্টেমের গ্যাপ খোঁজা)।

🔗 Sokrio link: S4 — "৬টা প্রোডাকশন অ্যাপের প্রাইমারি ২৪/৭ on-call"। নির্দিষ্ট একটা ইনসিডেন্টের গল্প (কী ভাঙল, root cause, প্রিভেনশন) `[Komol পূরণ করবে]`।

## ৭. Field Nation-স্টাইল উদাহরণ SLO টেবিল (মুখস্থ রাখো)

| সার্ভিস | SLI | SLO |
|---|---|---|
| Work Order API | `GET /work-orders`-এর % রিকোয়েস্ট ৩০০ms-এর নিচে | ৩০ দিনে ৯৯% |
| Work Order API | % non-5xx রেসপন্স | ৯৯.৯% (~৪৩ মিনিট error budget/মাস) |
| Check-in | % check-in সফলভাবে রেকর্ড হলো | ৯৯.৯৫% |
| Webhooks | % ৬০ সেকেন্ডের মধ্যে ডেলিভার হলো | ৯৯% |
| Payouts | % নির্ধারিত তারিখে প্রসেস হলো | ৯৯.৯% |

## ৮. একটা রিকোয়েস্ট ৪টা মাইক্রোসার্ভিস পার হয়েছে — কীভাবে ট্রেস করবে?

প্রতিটা রিকোয়েস্টের শুরুতে (গেটওয়ে/প্রথম সার্ভিসে) একটা `trace_id` জেনারেট, প্রতিটা ডাউনস্ট্রিম কলে header হিসেবে propagate (`traceparent` — W3C Trace Context)। প্রতিটা সার্ভিস নিজের কাজের জন্য একটা `span` তৈরি করে ওই trace_id-র ভেতরে। OpenTelemetry collector সব span একত্র করে একটা backend-এ (Jaeger/Tempo/Datadog) পাঠায়, যেখানে পুরো রিকোয়েস্টের ওয়াটারফল টাইমলাইন দেখা যায় — কোন সার্ভিসে কত সময় গেছে।

## ৯. Health check বনাম dependency check

Health check: "এই সার্ভিস প্রসেস চালু আছে কি?" (K8s liveness-এর সাথে যুক্ত)। Dependency check: "এই সার্ভিস তার dependency (DB, cache, downstream API) দিয়ে কাজ করতে পারছে কি?" (readiness-এর সাথে যুক্ত)। দুটো গুলিয়ে ফেললে সমস্যা: dependency down থাকলেও সার্ভিস "healthy" দেখাবে (liveness pass), কিন্তু আসলে কাজ করতে পারছে না।

## ১০. Check-in ফিচারের জন্য একটা SLO ডিজাইন করো — কীসের ওপর অ্যালার্ট করবে?

SLI: "% check-in ইভেন্ট যা সফলভাবে সার্ভারে রেকর্ড হয়ে ৫ সেকেন্ডের মধ্যে কনফার্মেশন পেয়েছে"। SLO: ৯৯.৯৫% (৩০ দিন)। অ্যালার্ট: burn-rate ভিত্তিক — যদি error budget স্বাভাবিকের চেয়ে ১৪x দ্রুত খরচ হচ্ছে (short window) → পেজ; ধীরে খরচ হলে (long window) → টিকিট, পরের দিন রিভিউ। সরাসরি "check-in API 500 error" গুনে অ্যালার্ট না করে, ইউজার-বিহেভিয়ার (সফল কনফার্মেশন রেট)-এর ওপর অ্যালার্ট করা — কারণ এটাই আসল বিজনেস ইমপ্যাক্ট মাপে।
