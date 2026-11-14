---
id: ps-dp-easy
title: "12 — Dynamic Programming — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, dp]
updated: 2026-11-14
---

# 12 — Dynamic Programming — Easy

> Part of the DP pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Climbing Stairs — LC 70 → *worked below*
- [ ] Fibonacci (DP) — LC 509 ⭐ *(see the recursion-backtracking pattern for the full memo→iterative build)*
- [ ] Min Cost Climbing Stairs — LC 746 → *worked below*
- [ ] Maximum Subarray — LC 53 *(Kadane, see the arrays pattern)*
- [ ] Pascal's Triangle — LC 118 → *worked below*
- [ ] Is Subsequence — LC 392 → *worked below*

---

## Worked Solutions

### Climbing Stairs — LC 70  *(Fibonacci in disguise)*
```php
function climbStairs(int $n): int {
    if ($n < 3) return $n;
    $a = 1; $b = 2;                          // ways to reach step 1 and step 2
    for ($i = 3; $i <= $n; $i++) [$a, $b] = [$b, $a + $b];
    return $b;
}
// climbStairs(5) -> 8 | O(n) / O(1) — reach step i from i-1 or i-2
```

> **Pattern চেনার সংকেত:** "কতভাবে", "minimum cost", "max" + প্রতিটা ধাপের উত্তর আগের ১–২টা ধাপ থেকে আসে → 1-D DP। লেখার ক্রম: **state** (`dp[i]` মানে কী) → **transition** → **base case** → **উত্তর কোথায়** → space কমানো যায়?

### Min Cost Climbing Stairs  ·  LC 746

**Problem:** `cost[i]` = i-তম সিঁড়িতে পা রাখার খরচ; একবারে ১ বা ২ ধাপ; index 0 বা 1 থেকে শুরু; উপরে (n) পৌঁছানোর সর্বনিম্ন খরচ।
**Example:** `[10,15,20] → 15` · `[1,100,1,1,1,100,1,1,100,1] → 6`

**Pattern:** 1-D DP — `dp[i]` = i-তে পৌঁছানোর খরচ = `min(dp[i-1]+cost[i-1], dp[i-2]+cost[i-2])`।

**PHP:**
```php
<?php
function minCostClimbingStairs(array $cost): int
{
    $prev2 = 0; $prev1 = 0;                     // dp[0] = dp[1] = 0 (free start)
    for ($i = 2; $i <= count($cost); $i++) {
        $cur = min($prev1 + $cost[$i - 1], $prev2 + $cost[$i - 2]);
        [$prev2, $prev1] = [$prev1, $cur];
    }
    return $prev1;
}

assert(minCostClimbingStairs([10, 15, 20]) === 15);
assert(minCostClimbingStairs([1, 100, 1, 1, 1, 100, 1, 1, 100, 1]) === 6);
assert(minCostClimbingStairs([0, 0]) === 0);
```

**Python:**
```python
def min_cost_climbing_stairs(cost: list[int]) -> int:
    prev2 = prev1 = 0
    for i in range(2, len(cost) + 1):
        prev2, prev1 = prev1, min(prev1 + cost[i - 1], prev2 + cost[i - 2])
    return prev1

assert min_cost_climbing_stairs([10, 15, 20]) == 15
```

**Complexity:** Time O(n) · Space O(1)।
**Mistakes:** উপর = index `n` (শেষ সিঁড়ি না) — loop `<= n` পর্যন্ত।

🎤 **Say this while coding:** "dp of i is the cheapest way to stand on step i; it only depends on the previous two, so I keep two variables instead of an array."

### Pascal's Triangle  ·  LC 118

**Problem:** প্রথম `numRows` সারি তৈরি করো।
**Example:** `5 → [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]`

**Pattern:** 2-D DP টেবিল — প্রতিটা ভেতরের মান = উপরের দুটোর যোগ।

**PHP:**
```php
<?php
function generate(int $numRows): array
{
    $rows = [];
    for ($r = 0; $r < $numRows; $r++) {
        $row = array_fill(0, $r + 1, 1);
        for ($c = 1; $c < $r; $c++) {
            $row[$c] = $rows[$r - 1][$c - 1] + $rows[$r - 1][$c];
        }
        $rows[] = $row;
    }
    return $rows;
}

assert(generate(5) === [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]]);
assert(generate(1) === [[1]]);
```

**Python:**
```python
def generate(num_rows: int) -> list[list[int]]:
    rows = []
    for r in range(num_rows):
        row = [1] * (r + 1)
        for c in range(1, r):
            row[c] = rows[r - 1][c - 1] + rows[r - 1][c]
        rows.append(row)
    return rows

assert generate(5)[-1] == [1, 4, 6, 4, 1]
```

**Complexity:** Time O(n²) · Space O(n²) output।

🎤 **Say this while coding:** "Each inner value is the sum of the two values above it, so I build row by row from the previous one."

### Is Subsequence  ·  LC 392

**Problem:** `s` কি `t`-এর subsequence (ক্রম ঠিক রেখে, মাঝে ফাঁক চলে)?
**Example:** `"abc", "ahbgdc" → true` · `"axc", "ahbgdc" → false`

**Pattern:** Two pointers (greedy) — DP-এর সবচেয়ে সহজ রূপ। Follow-up (অনেক `s`, একই `t`): `t`-এর প্রতিটা অক্ষরের index list + binary search।

**PHP:**
```php
<?php
function isSubsequence(string $s, string $t): bool
{
    $i = 0;
    for ($j = 0; $j < strlen($t) && $i < strlen($s); $j++) {
        if ($s[$i] === $t[$j]) $i++;       // greedily match the earliest possible char
    }
    return $i === strlen($s);
}

assert(isSubsequence('abc', 'ahbgdc') === true);
assert(isSubsequence('axc', 'ahbgdc') === false);
assert(isSubsequence('', 'abc') === true);
```

**Python:**
```python
def is_subsequence(s: str, t: str) -> bool:
    it = iter(t)
    return all(ch in it for ch in s)   # `in` on an iterator consumes it

assert is_subsequence("abc", "ahbgdc")
assert not is_subsequence("axc", "ahbgdc")
assert is_subsequence("", "abc")
```

**Complexity:** Time O(|t|) · Space O(1)।
**Mistakes:** খালি `s` → সবসময় true।

🎤 **Say this while coding:** "Matching each character of s at the earliest possible position in t is always safe, so a single pass with two pointers is enough."
