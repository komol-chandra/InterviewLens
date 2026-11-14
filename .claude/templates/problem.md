---
id: ps-<NN>-<pattern>-<easy|medium|hard>
title: <Pattern> — <Easy | Medium | Hard>
status: draft            # empty | stub | draft | good | complete
conf: 0                  # ০–৩
tier: starter
tags: [problem-solving, <pattern>]
updated: YYYY-MM-DD
---

# <Pattern> — <Easy | Medium | Hard>

> **Pattern চেনার সংকেত:** <ইনপুট/প্রশ্নে কী দেখলে এই প্যাটার্ন মনে আসবে>
> **লাইভ কোডিং স্ক্রিপ্ট:** clarify → brute force বলো → optimize → code → test (edge cases) — প্রতিটা ধাপ মুখে বলো।

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | <name> | LC <id> / HR / custom | ⬜ | — | — |

---

## 1. <Problem Name>  ·  <LC id / source>

**Problem:** <সহজ বাংলায় স্টেটমেন্ট, ১–৩ লাইন>
**Example:** `input → output`
**Constraints:** <n ≤ …>

**Pattern:** <pattern> — কারণ <সংকেতটা কোথায়>

**Approach:**
1. Brute force: <কী, O(?)> — কেন যথেষ্ট না
2. Optimized: <মূল আইডিয়া, ২–৪ ধাপে>

**PHP:**
```php
<?php
function solve(array $nums): int
{
    // ...
}

// tests
assert(solve([1, 2, 3]) === 0);
```

**Python:**
```python
def solve(nums: list[int]) -> int:
    ...
```

**Complexity:** Time O(?) · Space O(?) — <এক লাইনে কেন>

**Mistakes / edge cases:**
- empty input · single element · duplicates · negative · overflow
- <আমি যে ভুলটা করেছিলাম>

🎤 **Say this while coding:** "<English: one line explaining the key insight out loud.>"

---

## 2. ...
