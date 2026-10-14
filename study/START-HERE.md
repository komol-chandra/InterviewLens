# START HERE — প্রতিদিন শুধু এই ফাইল খোলো

> **এখনকার লক্ষ্য:** Field Nation SE → **Hiring Manager / tech-team রাউন্ড** (US manager + panel, technical depth)
> **ইন্টারভিউর তারিখ:** অজানা → ডিফল্ট D-0 = শুক্র ২০২৬-১০-২৩। তারিখ জানলে নিচের টেবিলের তারিখ বদলাও।
> **পুরো প্ল্যান:** [0-now/plan.md](0-now/plan.md) · **প্রশ্ন-ব্যাংক:** [0-now/hm-qbank.md](0-now/hm-qbank.md) · **অগ্রগতি:** [tracker.md](tracker.md)

## আজ কী করব?

| দিন | তারিখ | কাজ | কোন ফাইলে লিখবে | ✔ |
|---|---|---|---|---|
| **D-8** | বৃহঃ ১০-১৫ | 🔴 Truth Audit (RabbitMQ / Node / Kafka-র সত্যি) + ৬টা Receipt Card | `1-me/decisions.md` (খোলা প্রশ্ন) · [0-now/receipt-cards.md](0-now/receipt-cards.md) | ⬜ |
| D-7 | শুক্র ১০-১৬ | Anchor A1–A3 → L1–L5 লেখা + রেকর্ড করে জোরে বলা | `0-now/hm-qbank.md` §A | ⬜ |
| D-6 | শনি ১০-১৭ | Anchor A4–A6 + Sokrio আর্কিটেকচার ২ মিনিটে আঁকা | `0-now/hm-qbank.md` §A | ⬜ |
| D-5 | রবি ১০-১৮ | ১০টা "Why X not Y" কার্ড (Context → Options → Choice → Cost → Revisit) | `0-now/hm-qbank.md` §B | ⬜ |
| D-4 | সোম ১০-১৯ | Incident (S4) + Mistake (S11) + Disagreement (S10) + debugging walkthrough | `1-me/story-bank.md` | ⬜ |
| D-3 | মঙ্গল ১০-২০ | ৪টা Honest Bridge (Node / NestJS / K8s / Kafka) + PHP→Node প্রশ্ন | `0-now/hm-qbank.md` §D · `4-library/fieldnation/system-design/02-php-to-node-migration.md` | ⬜ |
| D-2 | বুধ ১০-২১ | 🎤 Mock HM-1 (৬০ মিনিট) → fix list | `3-practice/mocks/` + `1-me/weak-areas.md` | ⬜ |
| D-1 | বৃহঃ ১০-২২ | Top-5 fix + Mock HM-2 (৩০ মিনিট, L4–L5) + ম্যানেজারকে ৫টা প্রশ্ন | `2-speak/questions-to-ask.md` | ⬜ |
| D-0 | শুক্র ১০-২৩ | হালকা: Receipt Cards + pitch একবার, ক্যামেরা/মাইক/নেট চেক | — | ⬜ |

**প্রতিদিনের ৩০ মিনিট:** ১টা anchor project জোরে বলা (নিজেকে "why?" ×৩) · ১টা DSA (TypeScript) → `tracker.md`-এ কাউন্ট · শেষে Claude-কে বলো **"সেশন শেষ"**।

## ফোল্ডার ম্যাপ: কাজের ধরন অনুযায়ী

```
study/
├── START-HERE.md   ← আজ কী করব (এই ফাইল)
├── tracker.md      ← একমাত্র অগ্রগতি রেজিস্টার: ডক স্ট্যাটাস + DSA কাউন্ট
├── CLAUDE.md       ← Claude-এর নিয়ম
│
├── 0-now/          ← 🎯 শুধু এখনকার রাউন্ড। রাউন্ড শেষ হলে 9-archive-এ যায়
├── 1-me/           ← আমার সম্পর্কে: profile, story-bank (S1–S11), weak-areas, decisions, interview-log, handoff
├── 2-speak/        ← যা মুখে ইংরেজিতে বলব: pitch, HR উত্তর, প্রশ্ন জিজ্ঞেস করা
├── 3-practice/     ← যা হাতে-কলমে করব: mocks/, dsa/ (১৪ প্যাটার্ন + PDF সিরিজ), mcq-bank
├── 4-library/      ← দরকার হলে পড়ার রেফারেন্স: cs/ (জেনেরিক টপিক), fieldnation/ (domain, topics, system-design, research)
└── 9-archive/      ← পুরনো প্ল্যান ও TODO, হাতে-লেখা নোট। শুধু পড়া, এখানে কাজ হয় না
```

| খুঁজছি… | যাও |
|---|---|
| CV-র কোনো সংখ্যার প্রমাণ | `0-now/receipt-cards.md` |
| কোন প্রশ্নে কোন স্টোরি | `1-me/story-bank.md` (উপরের ইনডেক্স) |
| Node / MySQL / React ইত্যাদি টপিক | `4-library/fieldnation/topics/` (FN-delta) → গভীরে গেলে `4-library/cs/` |
| মক চালানোর প্রম্পট | `0-now/plan.md` §D-2 · পুরনো সিরিজ `3-practice/mocks/00-series-overview.md` |
| CV / cover letter | `../04-resume-cover-letter/current/` |
