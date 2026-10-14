---
type: handoff
updated: 2026-10-14
---

# Handoff — শেষ সেশন → পরের সেশন

> প্রতি সেশনের শেষে **পুরোটা ওভাররাইট** করো। History রাখার জায়গা এটা না।

## শেষ সেশন: ২০২৬-১০-১৪ (মঙ্গল)

- পরের রাউন্ড: **Hiring Manager / tech team** (US manager + panel), technical depth, trivia না। তারিখ ঠিক হয়নি (৮+ দিন বাকি) → D9
- নতুন প্ল্যান **FN-26** `00-plan/02-fieldnation-hm-depth-plan.md`: D-8 → D-0, ডিফল্ট শুরু বৃহঃ ১০-১৫
- নতুন Q-bank **FN-27** `03-roles/fieldnation-software-engineer/04-behavioral/04-hm-technical-depth-qbank.md`: ৬টা anchor project (L1–L5), ১০টা Why-X-not-Y, incidents, gap bridges, FN-specific প্রশ্ন, ম্যানেজারকে করার প্রশ্ন, push-back লাইন
- **কোড স্ক্যানে পাওয়া ঝুঁকি:** RabbitMQ আর Node backend কোনো লোকাল Sokrio রিপোতে নেই; Kafka layer-এর commit author টিমমেট (Rakib)। ভালো খবর: sokrio-server-এ ১,৬৬১/১১,৫৬১ commit তোমার

## পরের সেশনে প্রথম কাজ (D-8)

1. **Truth Audit:** `decisions.md`-এর খোলা প্রশ্নে RabbitMQ / Node / Kafka-র নিজের অংশের সত্যি উত্তর লেখো
2. ৬টা Receipt Card (FN-26 §৩ টেমপ্লেট)
3. তারপর D-7: A1–A3-এর `[Komol পূরণ করবে]` ভরাট + রেকর্ড করে জোরে বলা

## খোলা ঝুঁকি

- ইন্টারভিউর তারিখ অজানা। জানলে D-0 বসিয়ে প্ল্যান পেছনে গোনো
- আগের রাউন্ডগুলো `interview-log.md`-এ লেখা হয়নি। মনে থাকা প্রশ্নগুলো যোগ করো (ম্যানেজার একই জায়গায় খোঁড়ে)
- S4 / S10 / S11 এখনো খালি; S11-এর প্রার্থী = `ReportTooLargeException` revert (২০২৬-০৮-১৩ → ০৮-১৫)
