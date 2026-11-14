---
description: Start a study session — read handoff, today, weak areas, dashboard; propose the day's blocks
argument-hint: "[hours available, e.g. 6] [focus override, e.g. aws]"
---

# Study start

Input: $ARGUMENTS (খালি হলে ধরে নাও ~৭ ঘণ্টা, ফোকাস রোডম্যাপ অনুযায়ী)

1. **পড়ো** (যেটা নেই সেটা বাদ দিয়ে এগোও, শেষে বলো কোনটা পাওয়া যায়নি):
   - `.claude/memory/handoff.md` — "পরের সেশনে প্রথম কাজ"
   - `00-start/today.md` আর `00-start/roadmap.md`-এর চলতি সপ্তাহ
   - `.claude/memory/weak-areas.md` — সবচেয়ে কম `Now` (খালি হলে `Guess`) + 🔴 প্রায়োরিটি
   - `DASHBOARD.md` frontmatter — streak, এই সপ্তাহের problems/MCQ সংখ্যা
   - `12-career/applications.md` — কোনো রাউন্ড আসন্ন? (থাকলে সেটাই আজকের প্রথম প্রায়োরিটি)
2. **প্রথম সেশন হলে** (`weak-areas.md`-এর `Now` কলাম পুরো খালি): দিনের প্ল্যানের আগে Komol-কে গ্রুপ ধরে ধরে ০–৩ রেটিং জিজ্ঞেস করো, `Now` ভরো।
3. **দিনের ব্লক প্রস্তাব** — ডেইলি টেমপ্লেট (≈৭ ঘণ্টা, ঘণ্টা কম হলে আনুপাতিক কাটো, ল্যাব আর SD আগে কাটো, PS কখনো না):

   | সময় | ব্লক | কী থেকে বাছবে |
   |---|---|---|
   | 1.5 h | Problem solving | ২–৩টা প্রবলেম PHP-তে (দুর্বলতম প্যাটার্ন) + ২০টা timed MCQ |
   | 1.5 h | System design / LLD | রোডম্যাপের পরের case বা concept |
   | 2 h | মূল টপিক | রোডম্যাপের চলতি টপিক (Starter ক্রম: PS → SD → AWS) |
   | 1 h | Hands-on lab | AWS লোকাল ল্যাব / Docker / RAG / `// BUILD` প্রজেক্ট |
   | 30 m | Spoken English | একটা স্টোরি বা একটা design জোরে বলা |
   | 30 m | Applications | নতুন আবেদন, follow-up |
   | 15 m | `/study-end` | — |

   প্রতিটা ব্লকে **নির্দিষ্ট ফাইল path আর নির্দিষ্ট আউটপুট** লেখো (যেমন "`01-problem-solving/04-two-pointers-sliding-window/medium.md`: প্রবলেম ১–৩ PHP-তে সমাধান")। "Two pointers পড়ো" ধরনের অস্পষ্ট ব্লক না।
4. `00-start/today.md` **ওভাররাইট** করো আজকের তারিখ + ব্লক টেবিল + checkbox দিয়ে।
5. Komol-কে দেখাও: গতবারের ২ লাইনের সারাংশ, আজকের টেবিল, আর একটা প্রশ্ন — "কোনো বদল?" তারপর প্রথম ব্লক শুরু করো।

নিয়ম: `CLAUDE.md`-এর Answer Pattern, ভাষা (D2), public-safe (D7) মেনে চলো। MVP Work item চললে সেটাই আগে, স্টাডি ব্লক পরে।
