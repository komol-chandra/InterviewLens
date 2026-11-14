---
id: ps-binary-search-on-answer-hard
title: "22 — Binary Search on Answer — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, binary-search-on-answer]
updated: 2026-11-14
---

# 22 — Binary Search on Answer — Hard

> **Pattern চেনার সংকেত:** "k ভাগে ভাগ করো, সবচেয়ে বড় ভাগের যোগফল minimize" → minimax = binary search on that max + greedy ভাগ গোনা। "k-th smallest" যেখানে সব মান বানানো যায় না → binary search on value + "≤ x কয়টা" গোনা।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Split Array Largest Sum ⭐ | LC 410 | ⬜ | — | — |
| 2 | Kth Smallest Number in Multiplication Table | LC 668 | ⬜ | — | — |
| 3 | Find K-th Smallest Pair Distance | LC 719 *(worked in [08 hard](../08-sorting-searching/hard.md))* | ⬜ | — | — |
| 4 | Median of Two Sorted Arrays | LC 4 *(partition-এর ওপর binary search, [01 hard](../01-arrays/hard.md))* | ⬜ | — | — |
| 5 | Minimize Max Distance to Gas Station | LC 774 *(real-valued: নির্দিষ্ট সংখ্যক রাউন্ড)* | ⬜ | — | — |

---

## 1. Split Array Largest Sum  ·  LC 410

**Problem:** `nums` (non-negative) কে `k` টা non-empty **contiguous** অংশে ভাগ করো যাতে সবচেয়ে বড় অংশের যোগফল সবচেয়ে ছোট হয়। সেই মান দাও।
**Example:** `[7,2,5,10,8], k=2 → 18` (`[7,2,5] | [10,8]`) · `[1,2,3,4,5], k=2 → 9`
**Constraints:** `n ≤ 1000`, `k ≤ min(50, n)`

**Pattern:** Binary search on the max sum — feasible(limit) = greedy: যতক্ষণ যোগফল limit ছাড়ায় না, একই অংশে রাখো; ছাড়ালে নতুন অংশ; অংশ সংখ্যা ≤ k হলে true। (LC 1011-এর মতোই, শুধু গল্প ভিন্ন।)

**Approach:**
1. DP বিকল্প: `dp[i][j]` = প্রথম i উপাদান j ভাগে — O(k·n²)।
2. Binary search: `lo = max(nums)`, `hi = sum(nums)` — O(n log sum)।

**PHP:**
```php
<?php
function splitArray(array $nums, int $k): int
{
    $pieces = function (int $limit) use ($nums): int {
        $count = 1; $sum = 0;
        foreach ($nums as $x) {
            if ($sum + $x > $limit) { $count++; $sum = 0; }
            $sum += $x;
        }
        return $count;
    };
    $lo = max($nums); $hi = array_sum($nums);
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($pieces($mid) <= $k) $hi = $mid;    // fewer pieces is fine: we can always split more
        else $lo = $mid + 1;
    }
    return $lo;
}

assert(splitArray([7, 2, 5, 10, 8], 2) === 18);
assert(splitArray([1, 2, 3, 4, 5], 2) === 9);
assert(splitArray([1, 4, 4], 3) === 4);
assert(splitArray([0, 0, 0], 2) === 0);
```

**Python:**
```python
def split_array(nums: list[int], k: int) -> int:
    def pieces(limit: int) -> int:
        count, s = 1, 0
        for x in nums:
            if s + x > limit:
                count += 1
                s = 0
            s += x
        return count

    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if pieces(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo

assert split_array([7, 2, 5, 10, 8], 2) == 18 and split_array([1, 4, 4], 3) == 4
```

**Complexity:** Time O(n · log(sum)) · Space O(1)।
**Mistakes:** শর্ত `== k` লেখা — কম অংশে হলে আরো ভাঙা যায় (non-negative বলে max বাড়ে না), তাই `<= k`।

🎤 **Say this while coding:** "I binary search the largest allowed part sum. For a limit, greedily packing elements gives the fewest parts; if that's at most k I can always split further, so the limit is feasible, and feasibility is monotonic in the limit."

---

## 2. Kth Smallest Number in Multiplication Table  ·  LC 668

**Problem:** m×n গুণের টেবিল (`table[i][j] = i·j`, 1-indexed); k-তম ছোট মান।
**Example:** `m=3, n=3, k=5 → 3` (1,2,2,3,3,4,6,6,9) · `m=2, n=3, k=6 → 6`
**Constraints:** `m, n ≤ 3·10⁴`, `k ≤ m·n` → টেবিল ৯·10⁸ ঘর, বানানো অসম্ভব।

**Pattern:** Binary search on value + গোনা — `count(x)` = টেবিলে ≤ x কয়টা = `Σ_{i=1..m} min(x / i, n)` (row i-তে i, 2i, … , n·i)। প্রথম x যেখানে `count(x) ≥ k`।

**PHP:**
```php
<?php
function findKthNumber(int $m, int $n, int $k): int
{
    $countLE = function (int $x) use ($m, $n): int {
        $c = 0;
        for ($i = 1; $i <= $m; $i++) $c += min(intdiv($x, $i), $n);   // multiples of i up to x in row i
        return $c;
    };
    $lo = 1; $hi = $m * $n;
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($countLE($mid) >= $k) $hi = $mid; else $lo = $mid + 1;
    }
    return $lo;    // the first value reaching count k is always an actual table entry
}

assert(findKthNumber(3, 3, 5) === 3);
assert(findKthNumber(2, 3, 6) === 6);
assert(findKthNumber(1, 1, 1) === 1);
assert(findKthNumber(45, 12, 471) === 312);
```

**Python:**
```python
def find_kth_number(m: int, n: int, k: int) -> int:
    def count_le(x: int) -> int:
        return sum(min(x // i, n) for i in range(1, m + 1))

    lo, hi = 1, m * n
    while lo < hi:
        mid = (lo + hi) // 2
        if count_le(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo

assert find_kth_number(3, 3, 5) == 3 and find_kth_number(45, 12, 471) == 312
# brute-force cross-check on small tables
for m in range(1, 7):
    for n in range(1, 7):
        vals = sorted(i * j for i in range(1, m + 1) for j in range(1, n + 1))
        assert all(find_kth_number(m, n, k) == vals[k - 1] for k in range(1, m * n + 1))
```

**Complexity:** Time O(m · log(m·n)) · Space O(1)। (`m > n` হলে swap করো যাতে loop ছোট মাত্রায়।)
**Mistakes:** "ফেরত দেওয়া মান টেবিলে আছে তো?" — ইন্টারভিউয়ার জিজ্ঞেস করবে: সবচেয়ে ছোট x যার count ≥ k, সেটা টেবিলে না থাকলে `x−1`-এর count একই হতো, তাহলে x সবচেয়ে ছোট হতো না।

🎤 **Say this while coding:** "I can't build the table, but I can count how many entries are at most x row by row in O(m). The k-th smallest is the smallest x whose count reaches k, and that x must actually appear in the table, otherwise x minus one would have the same count."
