---
type: handoff
updated: 2026-10-15
---

# Handoff — শেষ সেশন → পরের সেশন

> প্রতি সেশনের শেষে **পুরোটা ওভাররাইট** করো। History রাখার জায়গা এটা না।

## শেষ সেশন: ২০২৬-১০-১৪ (মঙ্গল)

- পরের রাউন্ড: **Hiring Manager / tech team** (US manager + panel), technical depth, trivia না। তারিখ ঠিক হয়নি (৮+ দিন বাকি) → D9
- নতুন প্ল্যান **FN-26** `0-now/plan.md`: D-8 → D-0, ডিফল্ট শুরু বৃহঃ ১০-১৫
- নতুন Q-bank **FN-27** `0-now/hm-qbank.md`: ৬টা anchor project (L1–L5), ১০টা Why-X-not-Y, incidents, gap bridges, FN-specific প্রশ্ন, ম্যানেজারকে করার প্রশ্ন, push-back লাইন
- **কোড স্ক্যানে পাওয়া ঝুঁকি:** RabbitMQ আর Node backend কোনো লোকাল Sokrio রিপোতে নেই; Kafka layer-এর commit author টিমমেট (Rakib)। ভালো খবর: sokrio-server-এ ১,৬৬১/১১,৫৬১ commit তোমার

## ২০২৬-১০-১৫: স্ট্রাকচার বদল (D10)

- `study/` এখন কাজের ধরন অনুযায়ী সাজানো। প্রতিদিন শুধু **`START-HERE.md`** খোলো। অগ্রগতি থাকে শুধু **`tracker.md`**-এ।
- FN-26 → `0-now/plan.md` · FN-27 → `0-now/hm-qbank.md` · নতুন FN-28 → `0-now/receipt-cards.md` (খালি কার্ড, D-8-এ ভরাট করবে)
- ডিফল্ট D-0 = শুক্র ১০-২৩ (START-HERE-এর টেবিলে)

- নতুন **System Design + Design Patterns ট্র্যাক**-এর প্ল্যান লেখা হয়েছে: `5-tracks/00-plan.md` (TRK-01, 📝 draft)। কোনো কনটেন্ট জেনারেট হয়নি। **Komol-এর উত্তর বাকি:** §৭-এর Q1–Q5 (সুপারিশ: Phase 0 এখনই ≤৩০ মিনিট/দিন, TypeScript, HM-এর পরে ৪ সপ্তাহ × ১.৫–২ ঘণ্টা)। "approved" বললে Phase 0 শুরু: SD-01 ফ্রেমওয়ার্ক → SD-23 multi-tenant কেস → Sokrio-তে থাকা pattern-এর ১ পাতার তালিকা। অনুমোদনের পর `START-HERE.md`-এর ম্যাপে `5-tracks/` লাইন যোগ করো।
- ⚠️ ১০-১৫-এর সব বদল (রিস্ট্রাকচার + নতুন ফাইল) এখনো **git commit হয়নি** (`InterviewLens/` রিপো)।

## পরের সেশনে প্রথম কাজ (D-8)

1. **Truth Audit:** `decisions.md`-এর খোলা প্রশ্নে RabbitMQ / Node / Kafka-র নিজের অংশের সত্যি উত্তর লেখো
2. ৬টা Receipt Card → `0-now/receipt-cards.md`
3. তারপর D-7: A1–A3-এর `[Komol পূরণ করবে]` ভরাট + রেকর্ড করে জোরে বলা

## খোলা ঝুঁকি

- ইন্টারভিউর তারিখ অজানা। জানলে D-0 বসিয়ে প্ল্যান পেছনে গোনো
- আগের রাউন্ডগুলো `interview-log.md`-এ লেখা হয়নি। মনে থাকা প্রশ্নগুলো যোগ করো (ম্যানেজার একই জায়গায় খোঁড়ে)
- S4 / S10 / S11 এখনো খালি; S11-এর প্রার্থী = `ReportTooLargeException` revert (২০২৬-০৮-১৩ → ০৮-১৫)
