---
description: Run scripts/health.py and refresh 00-start/health-report.md (stubs, missing READMEs/frontmatter, broken links, spaces, "sokrio" leaks)
argument-hint: "[folder to focus on, optional]"
---

# Health check

Focus: $ARGUMENTS (খালি হলে পুরো রিপো)

1. চালাও: `python3 scripts/health.py` (ফোকাস থাকলে `python3 scripts/health.py --folder <folder>`)।
   স্ক্রিপ্ট না থাকলে: থামো, বলো "`scripts/health.py` এখনো নেই — MASTER-PLAN Work 04 Step 5-এ বানানো হবে", আর হাতে বানাবে না।
2. স্ক্রিপ্ট `00-start/health-report.md` লেখে। সেটা পড়ো।
3. Komol-কে দেখাও, গুরুত্ব অনুযায়ী:
   1. 🔴 `sokrio` হিট `.claude/` আর `99-archive/`-এর বাইরে (public-safe লঙ্ঘন) — ফাইল:লাইন
   2. 🔴 broken links
   3. 🟠 README বা frontmatter নেই এমন ফোল্ডার/ফাইল
   4. 🟠 স্পেসওয়ালা path (`99-archive/`-এর বাইরে)
   5. 🟡 stub (< ১৫০ শব্দ) — রোডম্যাপের চলতি টপিকের সাথে মিলে এমনগুলো আগে
   6. খালি ফোল্ডার (`find . -type d -empty -not -path './.git/*'`)
4. প্রতিটা গ্রুপে প্রস্তাবিত ফিক্স এক লাইনে। **নিজে থেকে ঠিক করবে না** — Komol "fix" বললে, আর কোনো ফাইল মোছার আগে দেখিয়ে নেবে।
5. `DASHBOARD.md`-এর content-health টেবিল রিপোর্টের সংখ্যা দিয়ে আপডেট করো।
