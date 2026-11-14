---
id: ps-monotonic-stack-easy
title: "18 — Monotonic Stack — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, monotonic-stack]
updated: 2026-11-14
---

# 18 — Monotonic Stack — Easy

> **Pattern চেনার সংকেত:** "প্রতিটার ডানে প্রথম বড়/ছোট (বা সমান)" → monotonic stack, pop-এর মুহূর্তে উত্তর।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Next Greater Element I ⭐ | LC 496 | ⬜ | — | — |
| 2 | Final Prices With a Special Discount | LC 1475 | ⬜ | — | — |
| 3 | Daily Temperatures | LC 739 *(worked in [05 medium](../05-stack-queue/medium.md))* | ⬜ | — | — |

---

## 1. Next Greater Element I  ·  LC 496

**Problem:** `nums1` হলো `nums2`-এর subset (সব আলাদা)। `nums1`-এর প্রতিটা `x`-এর জন্য `nums2`-এ `x`-এর ডানে প্রথম বড় সংখ্যা (না থাকলে −1)।
**Example:** `nums1=[4,1,2], nums2=[1,3,4,2] → [-1,3,-1]`

**Pattern:** `nums2`-তে monotonic stack দিয়ে সবার next greater একটা map-এ, তারপর `nums1` lookup।

**PHP:**
```php
<?php
function nextGreaterElement(array $nums1, array $nums2): array
{
    $next = []; $stack = [];
    foreach ($nums2 as $x) {
        while ($stack && end($stack) < $x) $next[array_pop($stack)] = $x;   // values are unique: key by value
        $stack[] = $x;
    }
    return array_map(fn($x) => $next[$x] ?? -1, $nums1);
}

assert(nextGreaterElement([4, 1, 2], [1, 3, 4, 2]) === [-1, 3, -1]);
assert(nextGreaterElement([2, 4], [1, 2, 3, 4]) === [3, -1]);
```

**Python:**
```python
def next_greater_element(nums1: list[int], nums2: list[int]) -> list[int]:
    nxt, stack = {}, []
    for x in nums2:
        while stack and stack[-1] < x:
            nxt[stack.pop()] = x
        stack.append(x)
    return [nxt.get(x, -1) for x in nums1]

assert next_greater_element([4, 1, 2], [1, 3, 4, 2]) == [-1, 3, -1]
```

**Complexity:** Time O(n + m) · Space O(n)।
**Mistakes:** `nums1`-এর প্রতিটার জন্য আলাদা স্ক্যান (O(n·m)) — চলে, কিন্তু optimise চাইবে।

🎤 **Say this while coding:** "I precompute the next greater for every value in nums2 with a decreasing stack — values are unique so I can key a map by value — then each query is a lookup."

---

## 2. Final Prices With a Special Discount  ·  LC 1475

**Problem:** `prices[i]`-এ discount = ডানে প্রথম `j` যার `prices[j] ≤ prices[i]`; final = `prices[i] − prices[j]` (না থাকলে পুরো দাম)।
**Example:** `[8,4,6,2,3] → [4,2,4,2,3]`

**Pattern:** Next smaller-**or-equal** — increasing stack, `>=` হলে pop।

**PHP:**
```php
<?php
function finalPrices(array $prices): array
{
    $res = $prices; $stack = [];
    foreach ($prices as $i => $p) {
        while ($stack && $prices[end($stack)] >= $p) {
            $res[array_pop($stack)] -= $p;      // p is the first price <= it on the right
        }
        $stack[] = $i;
    }
    return $res;
}

assert(finalPrices([8, 4, 6, 2, 3]) === [4, 2, 4, 2, 3]);
assert(finalPrices([1, 2, 3, 4, 5]) === [1, 2, 3, 4, 5]);
assert(finalPrices([10, 1, 1, 6]) === [9, 0, 1, 6]);
```

**Python:**
```python
def final_prices(prices: list[int]) -> list[int]:
    res, stack = prices[:], []
    for i, p in enumerate(prices):
        while stack and prices[stack[-1]] >= p:
            res[stack.pop()] -= p
        stack.append(i)
    return res

assert final_prices([10, 1, 1, 6]) == [9, 0, 1, 6]
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** `>` দিলে সমান দামের discount বাদ পড়ে (`[10,1,1,6]`-এ দ্বিতীয় 1)।

🎤 **Say this while coding:** "It's next smaller-or-equal, so I keep an increasing stack of indices and pop with greater-or-equal; the price that pops an index is its discount."
