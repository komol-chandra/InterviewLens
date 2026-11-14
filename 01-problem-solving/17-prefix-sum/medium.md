---
id: ps-prefix-sum-medium
title: "17 — Prefix Sum — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, prefix-sum]
updated: 2026-11-14
---

# 17 — Prefix Sum — Medium

> **Pattern চেনার সংকেত:** "subarray sum = K / divisible by K", negative থাকতে পারে → prefix + hash map (count বা remainder)। "matrix-এর rectangle sum অনেকবার" → 2-D prefix। "অনেক range-এ +x, শেষে একবার পড়া" → difference array।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Subarray Sum Equals K ⭐ | LC 560 | ⬜ | — | — |
| 2 | Subarray Sums Divisible by K | LC 974 | ⬜ | — | — |
| 3 | Range Sum Query 2D – Immutable | LC 304 | ⬜ | — | — |
| 4 | Corporate Flight Bookings | LC 1109 *(difference array)* | ⬜ | — | — |
| 5 | Contiguous Array | LC 525 *(0 → −1, sum 0-এর longest; map-এ প্রথম index)* | ⬜ | — | — |
| 6 | Product of Array Except Self | LC 238 *(prefix × suffix, [01 medium](../01-arrays/medium.md))* | ⬜ | — | — |

---

## 1. Subarray Sum Equals K  ·  LC 560

**Problem:** কতগুলো contiguous subarray-এর যোগফল ঠিক `k`? (negative থাকতে পারে)
**Example:** `[1,1,1], 2 → 2` · `[1,2,3], 3 → 2`
**Constraints:** `n ≤ 2·10⁴`, `-1000 ≤ x ≤ 1000`

**Pattern:** Prefix sum + hash map — `P[j] − P[i] = k` ⟹ `j`-তে দাঁড়িয়ে গোনো আগে কতবার `P[j] − k` দেখা গেছে।

**Approach:**
1. Brute force: সব `(i, j)` — O(n²) (prefix দিয়ে)।
2. Optimized: map `{0: 1}`; প্রতিটা উপাদানে `sum += x`, `count += map[sum − k]`, তারপর `map[sum]++`।

**PHP:**
```php
<?php
function subarraySum(array $nums, int $k): int
{
    $seen = [0 => 1];
    $sum = $count = 0;
    foreach ($nums as $x) {
        $sum += $x;
        $count += $seen[$sum - $k] ?? 0;          // look up first...
        $seen[$sum] = ($seen[$sum] ?? 0) + 1;     // ...then record
    }
    return $count;
}

assert(subarraySum([1, 1, 1], 2) === 2);
assert(subarraySum([1, 2, 3], 3) === 2);
assert(subarraySum([1, -1, 0], 0) === 3);
assert(subarraySum([3, 4, 7, 2, -3, 1, 4, 2], 7) === 4);
```

**Python:**
```python
from collections import defaultdict

def subarray_sum(nums: list[int], k: int) -> int:
    seen = defaultdict(int, {0: 1})
    s = count = 0
    for x in nums:
        s += x
        count += seen[s - k]
        seen[s] += 1
    return count

assert subarray_sum([1, -1, 0], 0) == 3 and subarray_sum([3, 4, 7, 2, -3, 1, 4, 2], 7) == 4
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** `{0: 1}` না দেওয়া; record আগে করে look up পরে করা (`k = 0`-এ ভুল)।

🎤 **Say this while coding:** "A subarray ending here sums to k exactly when some earlier prefix equals the current prefix minus k, so I keep a count of prefixes seen so far — including the empty prefix."

🔗 DistroSaaS: "কোন টানা দিনগুলোতে বিক্রি ঠিক টার্গেট ছুঁয়েছে" ধরনের প্রশ্ন — **[Komol পূরণ করবে: target achievement রিপোর্ট থাকলে স্টোরি ID]**।

---

## 2. Subarray Sums Divisible by K  ·  LC 974

**Problem:** কতগুলো subarray-এর যোগফল `k` দিয়ে বিভাজ্য?
**Example:** `[4,5,0,-2,-3,1], 5 → 7`

**Pattern:** Prefix remainder + map — দুটো prefix-এর remainder সমান হলে মাঝের অংশ বিভাজ্য।

**PHP:**
```php
<?php
function subarraysDivByK(array $nums, int $k): int
{
    $cnt = [0 => 1];
    $sum = $res = 0;
    foreach ($nums as $x) {
        $sum += $x;
        $r = (($sum % $k) + $k) % $k;            // PHP's % keeps the sign: normalise to 0..k-1
        $res += $cnt[$r] ?? 0;
        $cnt[$r] = ($cnt[$r] ?? 0) + 1;
    }
    return $res;
}

assert(subarraysDivByK([4, 5, 0, -2, -3, 1], 5) === 7);
assert(subarraysDivByK([5], 9) === 0);
assert(subarraysDivByK([-1, 2, 9], 2) === 2);
```

**Python:**
```python
from collections import defaultdict

def subarrays_div_by_k(nums: list[int], k: int) -> int:
    cnt = defaultdict(int, {0: 1})
    s = res = 0
    for x in nums:
        s += x
        r = s % k                 # Python's % is already non-negative for k > 0
        res += cnt[r]
        cnt[r] += 1
    return res

assert subarrays_div_by_k([4, 5, 0, -2, -3, 1], 5) == 7 and subarrays_div_by_k([-1, 2, 9], 2) == 2
```

**Complexity:** Time O(n) · Space O(k)।
**Mistakes:** PHP-তে negative remainder (`-1 % 5 === -1`) — normalise না করলে `-1` আর `4` আলাদা key।

🎤 **Say this while coding:** "Two prefixes with the same remainder mod k bound a subarray divisible by k, so I count remainders — normalising negatives, since PHP keeps the sign."

---

## 3. Range Sum Query 2D – Immutable  ·  LC 304

**Problem:** matrix; অনেকবার `sumRegion(r1, c1, r2, c2)` (inclusive rectangle)।
**Example:** নিচে টেস্টে (`(2,1,4,3) → 8`)।

**Pattern:** 2-D prefix — `P[i][j]` = `(0,0)` থেকে `(i-1, j-1)` পর্যন্ত যোগফল; inclusion–exclusion।

**PHP:**
```php
<?php
final class NumMatrix
{
    private array $p;

    public function __construct(array $m)
    {
        $R = count($m); $C = count($m[0]);
        $this->p = array_fill(0, $R + 1, array_fill(0, $C + 1, 0));
        for ($i = 0; $i < $R; $i++) {
            for ($j = 0; $j < $C; $j++) {
                $this->p[$i + 1][$j + 1] = $m[$i][$j] + $this->p[$i][$j + 1] + $this->p[$i + 1][$j] - $this->p[$i][$j];
            }
        }
    }

    public function sumRegion(int $r1, int $c1, int $r2, int $c2): int
    {
        $p = $this->p;
        return $p[$r2 + 1][$c2 + 1] - $p[$r1][$c2 + 1] - $p[$r2 + 1][$c1] + $p[$r1][$c1];   // add back the double-removed corner
    }
}

$nm = new NumMatrix([[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]]);
assert($nm->sumRegion(2, 1, 4, 3) === 8);
assert($nm->sumRegion(1, 1, 2, 2) === 11);
assert($nm->sumRegion(1, 2, 2, 4) === 12);
assert($nm->sumRegion(0, 0, 0, 0) === 3);
```

**Python:**
```python
class NumMatrix:
    def __init__(self, m: list[list[int]]):
        R, C = len(m), len(m[0])
        self.p = [[0] * (C + 1) for _ in range(R + 1)]
        for i in range(R):
            for j in range(C):
                self.p[i + 1][j + 1] = m[i][j] + self.p[i][j + 1] + self.p[i + 1][j] - self.p[i][j]

    def sum_region(self, r1: int, c1: int, r2: int, c2: int) -> int:
        p = self.p
        return p[r2 + 1][c2 + 1] - p[r1][c2 + 1] - p[r2 + 1][c1] + p[r1][c1]

nm = NumMatrix([[3, 0, 1, 4, 2], [5, 6, 3, 2, 1], [1, 2, 0, 1, 5], [4, 1, 0, 1, 7], [1, 0, 3, 0, 5]])
assert nm.sum_region(2, 1, 4, 3) == 8 and nm.sum_region(1, 2, 2, 4) == 12
```

**Complexity:** build O(R·C), query O(1) · Space O(R·C)।
**Mistakes:** কোণ (`P[r1][c1]`) আবার যোগ করা ভুলে যাওয়া — দুবার বিয়োগ হয়েছে।

🎤 **Say this while coding:** "It's inclusion–exclusion: take the big rectangle, subtract the strip above and the strip to the left, and add back the corner that I subtracted twice."
