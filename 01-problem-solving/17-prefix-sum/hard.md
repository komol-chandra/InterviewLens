---
id: ps-prefix-sum-hard
title: "17 — Prefix Sum — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, prefix-sum]
updated: 2026-11-14
---

# 17 — Prefix Sum — Hard

> **Pattern চেনার সংকেত:** "shortest subarray sum ≥ K, negative সহ" → prefix sum + **monotonic deque** (increasing prefix)। "submatrix sum = target" → দুটো row ঠিক করে column-যোগফলকে 1-D array বানাও, তারপর 560-এর map কৌশল।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Shortest Subarray with Sum at Least K ⭐ | LC 862 | ⬜ | — | — |
| 2 | Number of Submatrices That Sum to Target | LC 1074 | ⬜ | — | — |
| 3 | Count of Range Sum | LC 327 *(prefix + merge sort, [08 hard](../08-sorting-searching/hard.md)-এর মতো)* | ⬜ | — | — |
| 4 | Max Sum of Rectangle No Larger Than K | LC 363 *(row-pair + sorted prefix set)* | ⬜ | — | — |

---

## 1. Shortest Subarray with Sum at Least K  ·  LC 862

**Problem:** সবচেয়ে ছোট non-empty subarray-এর দৈর্ঘ্য যার যোগফল ≥ K; না থাকলে −1। **negative থাকতে পারে।**
**Example:** `[2,-1,2], 3 → 3` · `[1,2], 4 → -1` · `[84,-37,32,40,95], 167 → 3`
**Constraints:** `n ≤ 10⁵`

**Pattern:** Prefix sum + monotonic deque — `P[j] − P[i] ≥ K` চাই, `j − i` সবচেয়ে ছোট।
- সামনে থেকে: `P[j] − P[front] ≥ K` হলে উত্তর আপডেট, front বাদ (পরের j-এর জন্য এটা দিয়ে আরো ছোট হবে না)।
- পেছন থেকে: `P[back] ≥ P[j]` হলে back বাদ (j পরে আর ছোট বা সমান prefix — সবসময় ভালো শুরু)।

**Approach:**
1. Sliding window — negative-এ ভাঙে।
2. Deque-এ prefix index, prefix মান increasing।

**PHP:**
```php
<?php
function shortestSubarray(array $nums, int $k): int
{
    $n = count($nums);
    $p = [0];
    foreach ($nums as $x) $p[] = end($p) + $x;
    $dq = new SplDoublyLinkedList();          // indices into $p, increasing prefix values
    $best = PHP_INT_MAX;
    for ($j = 0; $j <= $n; $j++) {
        while (!$dq->isEmpty() && $p[$j] - $p[$dq->bottom()] >= $k) {
            $best = min($best, $j - $dq->shift());     // front can't do better later
        }
        while (!$dq->isEmpty() && $p[$dq->top()] >= $p[$j]) {
            $dq->pop();                                // j is a later AND lower start: dominates
        }
        $dq->push($j);
    }
    return $best === PHP_INT_MAX ? -1 : $best;
}

assert(shortestSubarray([1], 1) === 1);
assert(shortestSubarray([1, 2], 4) === -1);
assert(shortestSubarray([2, -1, 2], 3) === 3);
assert(shortestSubarray([84, -37, 32, 40, 95], 167) === 3);
```

**Python:**
```python
from collections import deque
from itertools import accumulate

def shortest_subarray(nums: list[int], k: int) -> int:
    p = [0, *accumulate(nums)]
    dq: deque[int] = deque()
    best = float("inf")
    for j, pj in enumerate(p):
        while dq and pj - p[dq[0]] >= k:
            best = min(best, j - dq.popleft())
        while dq and p[dq[-1]] >= pj:
            dq.pop()
        dq.append(j)
    return -1 if best == float("inf") else best

assert shortest_subarray([2, -1, 2], 3) == 3 and shortest_subarray([84, -37, 32, 40, 95], 167) == 3
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** sliding window প্রয়োগ করা (`[84,-37,32,40,95]`-এ ভুল উত্তর); deque-এ মান রাখা, index না।

🎤 **Say this while coding:** "With negatives, I work on prefix sums and keep a deque of candidate start indices with increasing prefix values. A later, smaller prefix makes older larger ones useless, and once a start gives a valid sum, it can't give a shorter one later, so I pop it."

---

## 2. Number of Submatrices That Sum to Target  ·  LC 1074

**Problem:** matrix-এ কতগুলো non-empty submatrix-এর যোগফল `target`?
**Example:** `[[0,1,0],[1,1,1],[0,1,0]], 0 → 4` · `[[1,-1],[-1,1]], 0 → 5`
**Constraints:** `R, C ≤ 100`

**Pattern:** 2-D → 1-D reduction + LC 560 — উপরের row `top` আর নিচের row `bottom` ঠিক করো, প্রতিটা column-এ `top..bottom`-এর যোগফল একটা 1-D array; তাতে "subarray sum = target" গোনো।

**Approach:**
1. Brute force: সব rectangle + 2-D prefix — O(R²C²)।
2. Optimized: প্রতিটা `top`-এর জন্য `colSum` রিসেট, `bottom` বাড়াতে বাড়াতে `colSum[c] += m[bottom][c]`, তারপর 560। O(R²·C)।

**PHP:**
```php
<?php
function numSubmatrixSumTarget(array $m, int $target): int
{
    $R = count($m); $C = count($m[0]); $count = 0;
    for ($top = 0; $top < $R; $top++) {
        $col = array_fill(0, $C, 0);
        for ($bottom = $top; $bottom < $R; $bottom++) {
            for ($c = 0; $c < $C; $c++) $col[$c] += $m[$bottom][$c];   // column sums for rows top..bottom
            $seen = [0 => 1]; $sum = 0;                                   // LC 560 on $col
            foreach ($col as $x) {
                $sum += $x;
                $count += $seen[$sum - $target] ?? 0;
                $seen[$sum] = ($seen[$sum] ?? 0) + 1;
            }
        }
    }
    return $count;
}

assert(numSubmatrixSumTarget([[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0) === 4);
assert(numSubmatrixSumTarget([[1, -1], [-1, 1]], 0) === 5);
assert(numSubmatrixSumTarget([[904]], 0) === 0);
```

**Python:**
```python
from collections import defaultdict

def num_submatrix_sum_target(m: list[list[int]], target: int) -> int:
    R, C, count = len(m), len(m[0]), 0
    for top in range(R):
        col = [0] * C
        for bottom in range(top, R):
            for c in range(C):
                col[c] += m[bottom][c]
            seen, s = defaultdict(int, {0: 1}), 0
            for x in col:
                s += x
                count += seen[s - target]
                seen[s] += 1
    return count

assert num_submatrix_sum_target([[1, -1], [-1, 1]], 0) == 5
```

**Complexity:** Time O(R²·C) · Space O(C)। (C > R হলে matrix transpose করে ছোট মাত্রাকে বর্গ করো।)
**Mistakes:** প্রতিটা `(top, bottom)` জোড়ায় map রিসেট না করা।

🎤 **Say this while coding:** "Fixing a top and bottom row collapses the rectangle problem into a one-dimensional array of column sums, where I reuse the subarray-sum-equals-k hash map trick."
