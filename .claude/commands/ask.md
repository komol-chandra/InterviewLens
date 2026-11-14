---
description: Search the repo's notes via the lens-brain RAG before opening many files
argument-hint: "<question, Bangla or English> [--folder 03-system-design] [--tier starter]"
---

# Ask the notes

Question: $ARGUMENTS

1. **lens-brain MCP** (প্রথম পছন্দ): `search_notes(query, k=8, folder?, tier?)`। দরকারি চাংক পেলে পুরো ফাইল লাগলে `get_doc(path)`।
2. MCP না থাকলে **CLI**: `lens search "<question>"` (বা `uv run --directory tools/lens-brain lens search "<question>"`)।
3. lens-brain এখনো না বানানো থাকলে (Work 05 বাকি) **fallback**: প্রশ্ন থেকে ২–৪টা keyword (ইংরেজি টার্ম + বাংলা শব্দ) নিয়ে `grep -rni --include='*.md'` — `99-archive/`, `assets/`, `.git/` বাদ। সেরা ৩–৫টা ফাইলের প্রাসঙ্গিক অংশই শুধু পড়ো।
4. **উত্তর:**
   - রিপোর নোট থেকে উত্তর, প্রতিটা দাবির পাশে উৎস: [file](path#heading)
   - নোটে যা নেই সেটা আলাদা করে বলো: "নোটে নেই — সাধারণ জ্ঞান থেকে: …" — আর প্রস্তাব করো কোন ফাইলে যোগ করা উচিত (`/gen-topic`)
   - একই বিষয় একাধিক ফাইলে থাকলে (ডুপ্লিকেট) সেটা উল্লেখ করো — Work 04 dedupe-এ কাজে লাগবে
5. ভাষা D2: বাংলায় ব্যাখ্যা, টার্ম ইংরেজিতে; ইন্টারভিউ প্রশ্ন হলে শেষে একটা 🎤 ইংরেজি লাইন।
