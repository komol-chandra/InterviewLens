---
description: End a study session — update tracker, weak areas, handoff, dashboard, auto-memory; re-index RAG
argument-hint: "[short note on how the day went]"
---

# Study end

Komol-এর নোট: $ARGUMENTS

1. **আজ কী হলো** — `00-start/today.md`-এর প্রতিটা ব্লক: ✔ / `~` (অর্ধেক + কারণ) / ✘। কিছু অস্পষ্ট হলে Komol-কে একবারে সব প্রশ্ন করো (কতগুলো প্রবলেম, MCQ স্কোর, কোন টপিকে conf বদলাল)।
2. **`00-start/tracker.md`** — নতুন/পড়া ফাইলের সারি (status, conf, তারিখ), problems E/M/H কাউন্ট, MCQ স্কোর, SD cases, AWS/AI modules।
3. **`.claude/memory/weak-areas.md`** — Komol যে টপিকে নতুন রেটিং দিল: পুরনো `Now` → `History`-তে (`MM-DD:N`), নতুন মান `Now`-এ। আটকে যাওয়া প্রশ্ন নিচের টেবিলে। Claude নিজে `Now` বদলাবে না।
4. **ফাইলের frontmatter** — আজ যেগুলো বদলাল সেগুলোর `status`, `conf`, `updated`।
5. **`DASHBOARD.md`** — frontmatter সংখ্যা (streak, problems, mcq_pct, sd_cases, aws_modules, ai_modules, applications, interviews), progress bar, xychart-এর এই সপ্তাহের মান, heat table। Body-র সংখ্যা যেন frontmatter-এর সাথে মেলে।
6. **`.claude/memory/handoff.md` ওভাররাইট:** প্রেক্ষাপট (স্থির অংশ রাখো) → আজ কী হলো → পরের সেশনে প্রথম কাজ (নির্দিষ্ট ফাইল path) → Komol-এর কাছে অপেক্ষমাণ।
7. **Auto-memory** — শুধু স্থায়ী তথ্য বদলালে (লক্ষ্য, রোল, নতুন নিয়ম, Komol-এর feedback/correction)। স্টাডি অগ্রগতি সেখানে লিখবে না (D9)। নতুন সিদ্ধান্ত হলে `decisions.md`-এ পরের D-নম্বর।
8. **RAG re-index:** `lens index` (না থাকলে: `uv run --directory tools/lens-brain lens index`)। lens-brain এখনো না বানানো থাকলে এই ধাপ বাদ, শেষে উল্লেখ করো।
9. **Public-safe চেক:** আজ বদলানো ফাইলে `grep -ni 'sokrio'` (`.claude/` আর `99-archive/` বাদে) → ০ হিট।
10. **রিপোর্ট:** ৩–৫ লাইনে আজকের সারাংশ + সাজেস্টেড commit message (`study: <what>`)। **Commit বা push করবে না** (D13)।
