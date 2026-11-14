---
description: Generate one study file from a template (topic | sd-case | aws-module | problem | mcq-bank | folder-readme), public-safe
argument-hint: "<template> <target-path> [topic / extra instructions]"
---

# Generate one study file

Input: $ARGUMENTS
(যেমন: `sd-case 03-system-design/cases/12-payment-system.md` · `problem 01-problem-solving/04-two-pointers-sliding-window/hard.md` · `aws-module 06-aws-devops/02-iam.md`)

1. **আগে আছে কি না** — `/ask`-এর মতো lens-brain `search_notes` (না থাকলে `grep -ril`) দিয়ে একই টপিক খোঁজো। থাকলে নতুন ফাইল না বানিয়ে Komol-কে দেখাও: "এটা আছে, extend করব?"
2. **টেমপ্লেট পড়ো:** `.claude/templates/<template>.md`। কাঠামো, সেকশনের ক্রম, frontmatter হুবহু রাখো। `<…>` placeholder সব ভরবে বা মুছবে; খালি placeholder রেখে দেবে না।
3. **প্রসঙ্গ পড়ো:**
   - টার্গেট ফোল্ডারের `README.md` (কী আছে, কী বাকি) আর পাশের ১টা `good`/`complete` ফাইল (স্টাইল মেলাতে)
   - `.claude/memory/weak-areas.md` — এই টপিকে Komol কোথায় আটকায়, সেখানে বেশি গভীরতা
   - `_Resume/1-me/story-bank.md` (Work 04-এর পরে `10-behavioral-leadership/story-bank.md`) — 🔗 স্টোরি ID
   - বাস্তব উদাহরণ লাগলে `~/code/sokrio/*` — **শুধু পড়া**, আইডিয়া নাও, কোড কপি না, নাম/host/টেবিল নাম জেনেরিক করো
4. **লেখো** `CLAUDE.md`-এর Answer Pattern মেনে:
   - বাংলা ব্যাখ্যা, ইংরেজি টার্ম, 🎤 লাইন ইংরেজিতে (D2)
   - problem → PHP আগে, তারপর Python (D3); AWS → লোকাল ল্যাব আগে, teardown বাধ্যতামূলক (D5)
   - frontmatter: `status: draft`, `conf: 0`, `updated: <আজ>`, ইউনিক `id`
   - কোনো সংখ্যা/ঘটনা বানাবে না; অজানা → `[Komol পূরণ করবে]`, যাচাই-না-করা infra → `[inferred]`
5. **Public-safe চেক (D7):** `grep -niE 'sokrio|\.env|password|secret|[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' <file>` → সব হিট ঠিক করো। ক্লায়েন্ট/টিমমেটের নাম নেই নিশ্চিত হও।
6. **আপডেট:** ফোল্ডারের `README.md` ফাইল টেবিলে সারি + "কী বাকি" থেকে টিক; `00-start/tracker.md`-এ সারি।
7. **রিপোর্ট:** path, কতগুলো প্রশ্ন/প্রবলেম, কোন অংশে `[Komol পূরণ করবে]` আছে। একবারে একটা ফাইল — পরেরটা Komol বললে।
