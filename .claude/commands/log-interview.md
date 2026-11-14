---
description: Record a real interview round → interview-log, weak-areas, applications pipeline
argument-hint: "<company> <role> <round> [date] — then dump everything you remember"
---

# Log an interview round

Input: $ARGUMENTS

1. **তথ্য নাও** — Komol যা বলেছে সেটা থেকে ভরো; বাকিগুলো **একবারে** জিজ্ঞেস করো (একটা একটা করে না):
   - কোম্পানি, রোল (Laravel / Node / Python / AI), রাউন্ড (HR / Online test / Technical N / SD / HM), তারিখ
   - ফরম্যাট: অনলাইন/অফিস, সময়, কতজন, ধরন (MCQ / লাইভ কোডিং / SD / behavioral)
   - প্রতিটা মনে থাকা প্রশ্ন + Komol-এর উত্তর + নিজের অনুভূতি (✅ / 🟡 / ❌)
   - কোন স্টোরি ব্যবহার হলো, তারা কী নিয়ে আগ্রহী মনে হলো, পরের রাউন্ড সম্পর্কে কী জানা গেল, ফলাফল (জানা থাকলে)
2. **`.claude/memory/interview-log.md`:**
   - "রাউন্ডের সারাংশ" টেবিলে সারি (প্রথম সারি হলে "এখনো কিছু নেই" সারি মুছে দাও)
   - ফাইলের কমেন্টে থাকা ব্লক ফরম্যাটে পূর্ণ এন্ট্রি
   - 🟡/❌ প্রতিটা প্রশ্নে "ভালো উত্তর হতো:" — ২–৪ লাইন + 🎤 ইংরেজি লাইন। বানানো সংখ্যা/অভিজ্ঞতা না।
   - ইন্টারভিউয়ারের নাম লিখবে না।
3. **`.claude/memory/weak-areas.md`:** আটকে যাওয়া প্রতিটা প্রশ্ন নিচের টেবিলে (তারিখ, কোম্পানি, প্রশ্ন, টপিক)। কোনো টপিকে `Now` বদলানো উচিত মনে হলে **প্রস্তাব** করো, Komol রাজি হলে বদলাও।
4. **`12-career/applications.md`** (Work 04-এর আগে না থাকলে বলো, বানাবে না): সেই আবেদনের stage (applied → screen → tech → SD → HM → offer / rejected), তারিখ, পরের ধাপ।
5. **Follow-up:** পরের রাউন্ডের তারিখ জানা থাকলে `.claude/memory/handoff.md`-এর "অপেক্ষমাণ"-এ যোগ, আর পরের `/study-start`-এ সেটা প্রথম প্রায়োরিটি হবে।
6. **রিপোর্ট:** ৩টা শিক্ষা → ৩টা নির্দিষ্ট অ্যাকশন (ফাইল path সহ, যেমন "`03-system-design/cases/…` — idempotency deep dive যোগ")।
