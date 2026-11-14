# study/ — Interview Study Workspace

সব স্টাডি কনটেন্ট, প্ল্যান, ট্র্যাকার আর প্রেপ-মেমরি এক জায়গায়। **বর্তমান টার্গেট:** Field Nation — Software Engineer (Dhaka, hybrid, 1–10 PM, BDT 80k–120k)। প্ল্যান: ১৪ দিন, ২০২৬-০৯-২৯ → ২০২৬-১০-১২।

```
study/
├── CLAUDE.md                ← Claude-এর সেশন প্রোটোকল + ডক জেনারেশনের নিয়ম
├── README.md                ← এই ফাইল (ম্যাপ)
├── TODO.md                  ← মাস্টার রোলআপ — সব ফোল্ডারের অবস্থা এক নজরে
│
├── 00-plan/                 ← "কী, কবে" — অ্যাক্টিভ প্ল্যান ও ট্র্যাকিং
│   ├── 01-fieldnation-se-14-day-plan.md   ← দিন-ভিত্তিক বিস্তারিত প্ল্যান
│   ├── TODO.md                            ← দৈনিক চেকলিস্ট (প্রতিদিন টিক দাও)
│   └── doc-tracker.md                     ← প্রতিটা জেনারেটেড ডকের রেজিস্টার + স্ট্যাটাস
│
├── _memory/                 ← "আমি কে, কী জানি, কোথায় দুর্বল" — টাইপ-ভিত্তিক প্রেপ মেমরি
│   ├── MEMORY.md            ← ইনডেক্স
│   ├── profile.md           ← (profile) Komol-এর প্রোফাইল ও সীমাবদ্ধতা
│   ├── story-bank.md        ← (story) Sokrio STAR স্টোরি S1–S9
│   ├── weak-areas.md        ← (gap) ০–৩ self-rating, প্রতি সেশনে আপডেট
│   ├── interview-log.md     ← (log) আসল ইন্টারভিউতে আসা প্রশ্ন
│   ├── decisions.md         ← (decision) রোল/স্যালারি/প্ল্যান সিদ্ধান্ত ও কারণ
│   └── handoff.md           ← (handoff) শেষ সেশনের অবস্থা → পরের সেশন এখান থেকে শুরু
│
├── 01-cse-fundamentals/     ← জেনেরিক CS: theory/ (১৫ টপিক) + practical/ (১৪ DSA প্যাটার্ন)
├── 02-problem-solving/      ← ৭-দিনের DSA PDF সিরিজ (Day1–Day7)
│
└── 03-roles/                ← রোল-নির্দিষ্ট প্রেপ (প্রতি কোম্পানি-রোল = এক ফোল্ডার)
    ├── fieldnation-software-engineer/          ← 🎯 অ্যাক্টিভ
    │   ├── 00-research/     ← job research, prep hub HTML, desk PDF, backend plan, টেইলর্ড CV
    │   ├── 01-domain/       ← Field Nation work-order ডোমেইন
    │   ├── 02-topics/       ← JD-ভিত্তিক টপিক নোট (Node/TS, MySQL, React ...)
    │   ├── 03-system-design/← FN-স্টাইল ডিজাইন কেস
    │   ├── 04-behavioral/   ← pitch, HR উত্তর, প্রশ্ন জিজ্ঞেস করার লিস্ট
    │   └── 05-mocks/        ← মক ইন্টারভিউ রেকর্ড + fix list
    └── fieldnation-senior-software-engineer/   ← ⏸ পার্কড
```

## প্রতিদিন কীভাবে ব্যবহার করবে

1. Claude Code-এ বলো: **"আজকের স্টাডি শুরু করো"** → Claude `CLAUDE.md`-এর প্রোটোকল মেনে handoff + আজকের TODO পড়বে
2. আজকের দিনের ডক না থাকলে: **"FN-05 জেনারেট করো"** (ID `00-plan/doc-tracker.md` থেকে)
3. পড়া/প্র্যাকটিস শেষে: **"সেশন শেষ — weak-areas আপডেট করো, আমার রেটিং: MySQL 2, TS 3"**
4. আসল ইন্টারভিউর পর: **"interview-log-এ Round 1 যোগ করো"** তারপর যা মনে আছে বলো

## কোথায় কী রাখবে

| জিনিস | জায়গা |
|------|-------|
| জেনেরিক টপিক (SQL, OOP, Node core) | `01-cse-fundamentals/theory/` |
| DSA প্রবলেম | `01-cse-fundamentals/practical/<pattern>/` |
| Field Nation-নির্দিষ্ট নোট | `03-roles/fieldnation-software-engineer/<subfolder>/` |
| নতুন কোম্পানি | `03-roles/<company>-<role>/` — একই ৬টা সাবফোল্ডার কপি করো |
| CV / cover letter (ক্যানোনিক্যাল) | `../04-resume-cover-letter/current/` |
