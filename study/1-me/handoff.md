---
type: handoff
updated: 2026-10-15
---

# Handoff — শেষ সেশন → পরের সেশন

> প্রতি সেশনের শেষে **পুরোটা ওভাররাইট** করো। History রাখার জায়গা এটা না।

## প্রেক্ষাপট (স্থির)

- পরের রাউন্ড: **Hiring Manager / tech team** (US manager + panel), technical depth। তারিখ অজানা; ডিফল্ট D-0 = শুক্র ১০-২৩ (`START-HERE.md`)
- প্ল্যান FN-26 `0-now/plan.md` · Q-bank FN-27 `0-now/hm-qbank.md` · Receipt cards FN-28 `0-now/receipt-cards.md` (খালি)
- স্ট্রাকচার (D10): প্রতিদিন শুধু `START-HERE.md`; অগ্রগতি শুধু `tracker.md`

## ২০২৬-১০-১৫ (বৃহঃ): কী হলো

- **TRK-02 সম্পূর্ণ: ৩০/৩০ প্রশ্নের উত্তর জেনারেট** (`5-tracks/01-question-list.md`)
  - SD ১৫/১৫ + reliability বোনাস (আগের অংশে)
  - **DP ১৫/১৫ (এই অংশে ১২টা নতুন):** `5-tracks/design-patterns/creational/` (04 Factory, 05 Builder, 06 Singleton) · `structural/` (07 Adapter, 08 Decorator vs Proxy) · `behavioral/` (09 Observer, 10 Chain/middleware, 11 Command, 12 State, 13 Template Method) · `architectural/` (14 Repository, 15 CQRS/Saga/Outbox/Circuit Breaker)
  - প্রতিটা DP-র পাশে চলমান কোড `design-patterns/code/<name>.ts` (১৩টা, সব `npx -y tsx` দিয়ে চলেছে + strict `tsc` পাস)
  - **Machine coding ×৪** (DP-16): `design-patterns/machine-coding/README.md` (৪৫-মিনিটের ছক) + `lru-cache.ts`, `parking-lot.ts`, `rate-limiter.ts`, `work-order-lifecycle.ts`, প্রতিটায় নিজস্ব assert টেস্ট (সব পাস)
- সব ডক 🟡 (পড়া হয়নি)। পড়ার ক্রম সুপারিশ: 11 Command → 13 Template → 08 Decorator (এই তিনটায় তোমার নিজের কোড আছে) → 12 State + MC-4 (FN ডোমেইন) → বাকি
- **নতুন কোড-প্রমাণ (তোমার নিজের, "I built" বলা যায়):**
  - ⭐ `sokrio-benchmark-python/app/common/timing.py` → `cached_with_timing` = logging মোড়ানো caching মোড়ানো query, DP-Q08-এর হুবহু উত্তর (একমাত্র লেখক Komol)। DP-02 ম্যাপে যোগ করা হয়েছে
  - ⭐ SMS resend named rate limiters (`RouteServiceProvider::configureSmsResendRateLimiting`, key = `name|host|user`, কারণ user id tenant জুড়ে repeat হয়) → DP-Q10, MC-3
  - ⭐ `SMSGateway::resend()` error mapping = Adapter (DP-Q07)
- **নতুন সৎ ফাঁক (বলবে না যে আছে):** কোনো Outbox নেই। `PublishesKafkaMessage` Kafka publish ব্যর্থ হলে শুধু warning log করে, `afterCommit` নেই। কোনো circuit breaker class নেই। কোনো Saga নেই। State pattern class নেই (Order-এ guard methods)। Sokrio-তে আসল SMS provider একটাই; `RetailerSMSGateway` `SMSSender` interface মানে না
- ঠিক করা: DP-02-এ job সংখ্যা ৯৭ → ১৩২
- ⚠️ ১০-১৫-এর সব বদল এখনো **git commit হয়নি** (`InterviewLens/` রিপো)

## পরের সেশনে প্রথম কাজ (D-8, পিছিয়ে আছে)

1. 🔴 **Truth Audit:** `1-me/decisions.md`-এর খোলা প্রশ্নে RabbitMQ / Node / Kafka-র নিজের অংশের সত্যি উত্তর লেখো। কোড-প্রমাণ: RabbitMQ কোড নেই; S5 payment webhook/HMAC কোড নেই (শুধু ম্যানুয়াল bKash approve, Tanmay); S9 GPS-spoofing চেক মোবাইল টিমের (অংশত comment করা); Kafka layer Rakib/sihab-এর। FN-14-এর "Sokrio-এ যা সরাসরি করেছি" টেবিলে S1 আর S5 ✅ দেখায়, যাচাইয়ের পর ঠিক করো
2. ৬টা Receipt Card → `0-now/receipt-cards.md`
3. **SMS bulk resend** গল্পটা `1-me/story-bank.md`-এ নতুন স্টোরি (S12) হিসেবে যোগ করো (SD-Q07/Q10/Q11, DP-Q07/Q10/Q11-এ ব্যবহার হয়েছে)
4. তারপর D-7: A1–A3-এর `[Komol পূরণ করবে]` ভরাট + রেকর্ড করে জোরে বলা

## ডকে ভরাট বাকি `[Komol পূরণ করবে]` (DP অংশ)

- 04: কোনো report service export factory-তে যোগ করেছ কি না · 05: নিজে fluent builder লিখেছ কি না · 06: job-এ tenant/cache prefix-এর কারণে bug পেয়েছিলে কি না · 09: কোনো listener/observer যোগ/debug করেছ কি না · 13 (= DP-01-এর পুরনো প্রশ্ন): ScenarioSeeder base আগে নাকি দুটো seeder-এর পরে · 14: repository নিয়ে টিমে তর্ক হয়েছিল কি না (S10 প্রার্থী) · 03: if/else → Strategy refactor
- আগের SD অংশের বাকিগুলো: 02 (LB/replica কে সেটআপ), 04 (`READ_DB_HOST` prod-এ আসল replica কি না), SD-23-এর ৩টা

## খোলা ঝুঁকি

- ইন্টারভিউর তারিখ অজানা। জানলে D-0 বসিয়ে প্ল্যান পেছনে গোনো
- HM প্রস্তুতি (Truth Audit, receipt cards, mock HM) ১ দিন পিছিয়ে; 5-tracks পড়া দিনে ≤৩০ মিনিটে সীমিত রাখো
- আগের রাউন্ডগুলো `interview-log.md`-এ লেখা হয়নি
- S4 / S10 / S11 খালি; S11 প্রার্থী: `ReportTooLargeException` revert (০৮-১৩ → ০৮-১৫), বা `Guest/StockUpdateController.php` lost-update bug (যাচাই + fix হলে; বিস্তারিত `cases/12-order-inventory.md`)
