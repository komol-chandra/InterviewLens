---
id: ps-prefix-sum-easy
title: "17 — Prefix Sum — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, prefix-sum]
updated: 2026-11-14
---

# 17 — Prefix Sum — Easy

> **Pattern চেনার সংকেত:** "অনেকবার range sum" → prefix array। "বাম যোগফল == ডান যোগফল" → মোট যোগফল জেনে, বাম দিক চলমান রাখো।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Range Sum Query – Immutable ⭐ | LC 303 | ⬜ | — | — |
| 2 | Find Pivot Index | LC 724 | ⬜ | — | — |
| 3 | Running Sum of 1d Array | LC 1480 | ⬜ | — | — |
| 4 | Left and Right Sum Differences | LC 2574 | ⬜ | — | — |

---

## 1. Range Sum Query – Immutable  ·  LC 303

**Problem:** array একবার দেওয়া; অনেকবার `sumRange(l, r)` (inclusive)।
**Example:** `[-2,0,3,-5,2,-1]`: `sumRange(0,2)=1`, `(2,5)=-1`, `(0,5)=-3`

**Pattern:** Prefix array — constructor-এ O(n), প্রতিটা query O(1)।

**PHP:**
```php
<?php
final class NumArray
{
    private array $p = [0];

    public function __construct(array $nums)
    {
        foreach ($nums as $x) $this->p[] = end($this->p) + $x;
    }

    public function sumRange(int $l, int $r): int
    {
        return $this->p[$r + 1] - $this->p[$l];
    }
}

$na = new NumArray([-2, 0, 3, -5, 2, -1]);
assert($na->sumRange(0, 2) === 1);
assert($na->sumRange(2, 5) === -1);
assert($na->sumRange(0, 5) === -3);
assert($na->sumRange(3, 3) === -5);
```

**Python:**
```python
from itertools import accumulate

class NumArray:
    def __init__(self, nums: list[int]):
        self.p = [0, *accumulate(nums)]

    def sum_range(self, l: int, r: int) -> int:
        return self.p[r + 1] - self.p[l]

na = NumArray([-2, 0, 3, -5, 2, -1])
assert na.sum_range(0, 2) == 1 and na.sum_range(2, 5) == -1
```

**Complexity:** build O(n), query O(1) · Space O(n)।
**Mistakes:** off-by-one: `P[r+1] − P[l]`, `P[r] − P[l-1]` না (l = 0-তে index −1)।

🎤 **Say this while coding:** "I pay O(n) once to build prefix sums with a leading zero, then any range is the difference of two prefixes in O(1)."

---

## 2. Find Pivot Index  ·  LC 724

**Problem:** প্রথম index যার বামের যোগফল = ডানের যোগফল (নিজে বাদ); না থাকলে −1।
**Example:** `[1,7,3,6,5,6] → 3` · `[2,1,-1] → 0`

**Pattern:** মোট যোগফল + চলমান বাম যোগফল — ডান = `total − left − nums[i]`।

**PHP:**
```php
<?php
function pivotIndex(array $nums): int
{
    $total = array_sum($nums);
    $left = 0;
    foreach ($nums as $i => $x) {
        if ($left === $total - $left - $x) return $i;
        $left += $x;
    }
    return -1;
}

assert(pivotIndex([1, 7, 3, 6, 5, 6]) === 3);
assert(pivotIndex([1, 2, 3]) === -1);
assert(pivotIndex([2, 1, -1]) === 0);
```

**Python:**
```python
def pivot_index(nums: list[int]) -> int:
    total, left = sum(nums), 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1

assert pivot_index([1, 7, 3, 6, 5, 6]) == 3 and pivot_index([2, 1, -1]) == 0
```

**Complexity:** Time O(n) · Space O(1)।
**Mistakes:** `left` আপডেট তুলনার **পরে**; index 0-তে বাম = 0।

🎤 **Say this while coding:** "With the total known, the right sum is total minus left minus the current value, so one pass with a running left sum is enough."

---

## 3. Left and Right Sum Differences  ·  LC 2574

**Problem:** প্রতিটা `i`-তে `|leftSum[i] − rightSum[i]|` (নিজে বাদ)।
**Example:** `[10,4,8,3] → [15,1,11,22]`

**PHP:**
```php
<?php
function leftRightDifference(array $nums): array
{
    $total = array_sum($nums); $left = 0; $res = [];
    foreach ($nums as $x) {
        $res[] = abs($left - ($total - $left - $x));
        $left += $x;
    }
    return $res;
}

assert(leftRightDifference([10, 4, 8, 3]) === [15, 1, 11, 22]);
assert(leftRightDifference([1]) === [0]);
```

**Python:**
```python
def left_right_difference(nums: list[int]) -> list[int]:
    total, left, res = sum(nums), 0, []
    for x in nums:
        res.append(abs(left - (total - left - x)))
        left += x
    return res

assert left_right_difference([10, 4, 8, 3]) == [15, 1, 11, 22]
```

**Complexity:** Time O(n) · Space O(1) (output বাদে)।

🎤 **Say this while coding:** "Same trick as pivot index: total minus the running left sum gives the right side without a second array."
