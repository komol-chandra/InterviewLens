---
id: ps-live-coding-script
title: "Live Coding Script"
track: problem-solving
type: note
status: good
conf: 0
tier: starter
tags: [problem-solving, live-coding, interview]
updated: 2026-11-14
---

# Live Coding Script

লাইভ কোডিং-এ freeze হওয়ার মূল কারণ: মাথায় একসাথে "সমাধান খোঁজা" আর "কী বলবো" দুটো চলে। এই স্ক্রিপ্ট দ্বিতীয়টা মুখস্থ করিয়ে দেয়, যাতে মাথা শুধু সমাধানে থাকে। প্রতিটা ধাপের ইংরেজি লাইনগুলো **জোরে** প্র্যাকটিস করো।

৪৫ মিনিটের রাউন্ডের সময়-ভাগ:

| ধাপ | সময় | লক্ষ্য |
|---|---|---|
| 1. Clarify | 3–5 মিনিট | input/output/edge পরিষ্কার |
| 2. Examples | 2 মিনিট | নিজের হাতে ১টা normal + ১টা edge উদাহরণ |
| 3. Brute force | 2–3 মিনিট | মুখে বলো + complexity, কোড না |
| 4. Optimize | 5–8 মিনিট | প্যাটার্ন বেছে, ইন্টারভিউয়ারের "OK" নাও |
| 5. Code | 15–20 মিনিট | বলতে বলতে লেখো |
| 6. Test | 5 মিনিট | নিজের উদাহরণ হাতে চালাও, তারপর edge cases |
| 7. Wrap-up | 2 মিনিট | complexity + কী উন্নতি করা যেত |

---

## ধাপ ১ — Clarify

প্রশ্ন শোনার পর সরাসরি কোড শুরু করলে প্রায় সবসময় ভুল প্রবলেম সমাধান হয়। চেকলিস্ট:

- input-এর **size** (`n` কত?) → লক্ষ্য complexity ([which-pattern §১](which-pattern.md))
- **খালি** input হতে পারে? negative? duplicate? sorted?
- output: index না value? একাধিক উত্তর থাকলে যেকোনোটা?
- in-place modify চলবে?

🎤 **Say this:**
- "Before I start, can I ask a few questions? How large can the input be?"
- "Can the array be empty, and can it contain negatives or duplicates?"
- "Should I return the indices or the values? If there are multiple answers, is any one fine?"

## ধাপ ২ — Examples

নিজের একটা ছোট উদাহরণ বোর্ডে লেখো। এটা পরে টেস্টে কাজে লাগবে।

🎤 **Say this:** "Let me write a small example to make sure I understand: for `[2, 7, 11, 15]` and target 9, the answer is indices 0 and 1."

## ধাপ ৩ — Brute force (মুখে)

কোড লেখো না, শুধু বলো। এতে ইন্টারভিউয়ার দেখে তুমি অন্তত একটা সঠিক সমাধান জানো, আর তুমি একটা baseline পাও।

🎤 **Say this:** "The straightforward way is to check every pair, which is O(n²) time and O(1) space. That works, but with n up to ten to the five it will be too slow, so let me improve it."

## ধাপ ৪ — Optimize

প্রশ্ন করো: brute force-এ কোন কাজটা বারবার হচ্ছে? ([which-pattern §৪](which-pattern.md))

🎤 **Say this:**
- "The inner loop is just searching for `target - x`. If I keep a hash map of values I've already seen, that lookup becomes O(1)."
- "So overall O(n) time and O(n) space. Does that sound good before I code it?"

**আটকে গেলে** (freeze ভাঙার লাইন):
- "Let me think out loud for a moment." → তারপর ছোট উদাহরণটা হাতে চালাও।
- "Could it help if the input were sorted?" / "What if I process it from the right?"
- "Would you mind if I start with the brute force and optimize after?" — এটা বলা দুর্বলতা না; কিছু না লেখার চেয়ে অনেক ভালো।

## ধাপ ৫ — Code

- ফাংশন signature আগে, তারপর মূল loop, তারপর edge case।
- অর্থপূর্ণ নাম (`$seen`, `$left`), `$a`/`$b` না।
- প্রতিটা ব্লক লেখার সময় এক লাইনে বলো কেন।

🎤 **Say this:**
- "I'll use a map from value to index called `seen`."
- "For each number I check whether its complement is already in the map; if not, I store the current one."

## ধাপ ৬ — Test

কোড শেষ মানে কাজ শেষ না। নিজের উদাহরণটা **লাইন ধরে** হাতে চালাও, তারপর edge:

- empty / single element
- সব একই মান / duplicates
- negative, zero
- সবচেয়ে বড় input (overflow, recursion depth)

🎤 **Say this:** "Let me trace through my example… i = 0, seen is empty, store 2. i = 1, complement is 2, found — return [0, 1]. Now the edge cases: an empty array returns an empty result, and duplicates like `[3, 3]` work because I check before inserting."

## ধাপ ৭ — Wrap-up

🎤 **Say this:** "Time is O(n), space O(n) for the map. If memory were tight I could sort and use two pointers for O(1) extra space, but I'd lose the original indices."

---

## PHP-তে লাইভ কোডিং: ছোট চিটশিট

| কাজ | PHP | খেয়াল |
|---|---|---|
| stack | `$s[] = $x; array_pop($s); end($s)` | `end()` খালি array-তে `false` দেয় |
| queue | `new SplQueue()` → `enqueue/dequeue` | `array_shift` O(n) |
| min-heap | `new SplMinHeap()` → `insert/extract/top` | `[priority, value]` array দিলে প্রথম উপাদানে তুলনা হয় |
| max-heap | `new SplMaxHeap()` | |
| custom heap | `SplPriorityQueue` | ডিফল্টে **max**; min চাইলে priority-তে `-x` |
| hash set | `$set[$x] = true; isset($set[$x])` | `in_array` O(n) — ব্যবহার করো না |
| sort | `sort`, `rsort`, `usort($a, fn($x,$y) => $x <=> $y)` | `sort` keys রিসেট করে |
| integer division | `intdiv($a, $b)` | `/` float দেয় |
| string chars | `str_split($s)`, `$s[$i]`, `strlen` | multibyte হলে `mb_str_split` |
| infinity | `PHP_INT_MAX`, `INF` | |
| char ↔ code | `ord('a')`, `chr(97)` | |

## অনুশীলনের নিয়ম

- প্রতিটা প্রবলেম **টাইমার চালিয়ে** (easy 15, medium 25, hard 40 মিনিট)।
- পুরো সময় মুখে বলো, একা থাকলেও। সপ্তাহে একবার রেকর্ড করে শোনো।
- আটকে ১০ মিনিট পেরোলে সমাধান দেখো, তারপর ২ দিন পরে আবার নিজে থেকে লেখো (`Revisit` কলাম)।

🔗 DistroSaaS: সরাসরি লাইভ-কোডিং অভিজ্ঞতা নেই — এভাবে বলো: "In my day job I explain design choices in code review the same way — state the constraint, the simple option, and why I chose the optimized one."
