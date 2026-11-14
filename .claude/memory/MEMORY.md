# InterviewLens — স্টাডি মেমরি ইনডেক্স

Claude প্রতি সেশনের শুরুতে (`/study-start`) এখান থেকে পড়ে, আর শেষে (`/study-end`) এখানে লেখে। প্রতিটা ফাইলের একটা **type** আছে, তাই কোন তথ্য কোথায় যাবে তা নিয়ে সন্দেহ থাকে না।

> Claude-এর auto-memory (`~/.claude/projects/.../memory/`) রাখে **স্থায়ী তথ্য** (কে, লক্ষ্য, নিয়ম)। এই ফোল্ডার রাখে **স্টাডি স্টেট** (আজ কোথায়, কী দুর্বল, কোন রাউন্ডে কী হলো)। মাস্টার প্ল্যান: [`../../MASTER-PLAN.md`](../../MASTER-PLAN.md)।

| Type | ফাইল | কী রাখে | কে আপডেট করে | কখন |
|------|------|---------|--------------|-----|
| `profile` | [profile.md](profile.md) | Komol কে, অভিজ্ঞতা, শক্তি, লক্ষ্য, সময় | Claude (Komol বললে) | কিছু বদলালে |
| `decision` | [decisions.md](decisions.md) | প্ল্যান/স্ট্রাকচার/রোলের সিদ্ধান্ত: কী ও কেন | Claude (Komol-এর অনুমোদনে) | সিদ্ধান্ত হলে |
| `gap` | [weak-areas.md](weak-areas.md) | জেনেরিক SE টপিকের ০–৩ রেটিং + history | Komol রেটিং দেয় | প্রতি সেশন/মক শেষে |
| `log` | [interview-log.md](interview-log.md) | আসল রাউন্ডের প্রশ্ন, উত্তর, শিক্ষা | Komol বলে, Claude লেখে | রাউন্ডের ২৪ ঘণ্টার মধ্যে (`/log-interview`) |
| `handoff` | [handoff.md](handoff.md) | শেষ সেশনের অবস্থা + পরের প্রথম কাজ | Claude | প্রতি সেশনের শেষে (ওভাররাইট) |

**স্টোরি ব্যাংক** স্টাডি কনটেন্ট, মেমরি না। Work 04-এর পরে এটা থাকবে `10-behavioral-leadership/story-bank.md`-এ (এখন আছে `_Resume/1-me/story-bank.md`-এ)।

## কোন তথ্য কোথায়? (দ্রুত সিদ্ধান্ত)

- "আমি MySQL indexing-এ এখন ২" → `gap`
- "ইন্টারভিউয়ার outbox pattern জিজ্ঞেস করেছিল, আটকে গেছি" → `log` + `gap`-এর নিচের টেবিলে
- "AI Engineer রোলেও অ্যাপ্লাই করব" → `decision`
- "notice period ৬০ দিন" → `profile`
- "কাল Two Pointers hard.md থেকে শুরু" → `handoff`
- "Report pipeline-এ আসলে ৩ মাস লেগেছিল" → story bank (মেমরি না)

## নিয়ম

- **Public-safe (D7):** এখানেও কোম্পানির নাম না লিখে "DistroSaaS" লেখো। ক্লায়েন্ট, টিমমেটের নাম, host, secret কিছুই না।
- পুরনো সিদ্ধান্ত মুছবে না, ~~স্ট্রাইক~~ করে কারণসহ নতুনটা লেখো।
- পুরনো (Field Nation যুগের, ২০২৬-০৯/১০) মেমরি: `_Resume/1-me/`। Work 04-এর পরে যাবে `99-archive/fieldnation-2026-10/`-এ।
