---
id: ps-dp-hard
title: "12 — Dynamic Programming — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, dp]
updated: 2026-11-14
---

# 12 — Dynamic Programming — Hard

> **Pattern চেনার সংকেত:** দুটো string + "minimum operations / match?" → 2-D DP `dp[i][j]` = প্রথম i আর প্রথম j অক্ষর। "range-এর ভেতরে শেষে কোনটা" (balloon, matrix chain, merge stones) → **interval DP** `dp[l][r]`, দৈর্ঘ্য বাড়িয়ে বাড়িয়ে।
> **DP লেখার ৫ ধাপ (মুখে বলো):** state → transition → base case → iteration order → উত্তর কোথায়।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Edit Distance ⭐ | LC 72 | ⬜ | — | — |
| 2 | Regular Expression Matching | LC 10 | ⬜ | — | — |
| 3 | Burst Balloons (interval DP) | LC 312 | ⬜ | — | — |
| 4 | Longest Valid Parentheses | LC 32 *(stack সমাধান [05 hard](../05-stack-queue/hard.md)-এ)* | ⬜ | — | — |
| 5 | Best Time to Buy and Sell Stock IV | LC 188 *(state: day, transactions, holding)* | ⬜ | — | — |
| 6 | Word Break II | LC 140 *(memo, [07 hard](../07-recursion-backtracking/hard.md))* | ⬜ | — | — |

---

## 1. Edit Distance  ·  LC 72

**Problem:** `word1` থেকে `word2` বানাতে সর্বনিম্ন কয়টা অপারেশন (insert, delete, replace একটা অক্ষর)?
**Example:** `"horse","ros" → 3` · `"intention","execution" → 5`
**Constraints:** দৈর্ঘ্য ≤ 500।

**Pattern:** 2-D DP — `dp[i][j]` = `word1[:i]` → `word2[:j]`-এর খরচ।

**Approach:**
1. Brute force: প্রতিটা অবস্থানে ৩ option recursive — O(3^(m+n))।
2. Transition: অক্ষর সমান → `dp[i-1][j-1]`; নইলে `1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace))`। Base: `dp[i][0]=i`, `dp[0][j]=j`। দুটো row রাখলেই চলে।

**PHP:**
```php
<?php
function minDistance(string $a, string $b): int
{
    $m = strlen($a); $n = strlen($b);
    $prev = range(0, $n);                    // dp[0][j] = j inserts
    for ($i = 1; $i <= $m; $i++) {
        $cur = [$i];                         // dp[i][0] = i deletes
        for ($j = 1; $j <= $n; $j++) {
            $cur[$j] = $a[$i - 1] === $b[$j - 1]
                ? $prev[$j - 1]
                : 1 + min($prev[$j], $cur[$j - 1], $prev[$j - 1]);   // delete, insert, replace
        }
        $prev = $cur;
    }
    return $prev[$n];
}

assert(minDistance('horse', 'ros') === 3);
assert(minDistance('intention', 'execution') === 5);
assert(minDistance('', 'abc') === 3);
assert(minDistance('same', 'same') === 0);
```

**Python:**
```python
def min_distance(a: str, b: str) -> int:
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[-1]

assert min_distance("horse", "ros") == 3 and min_distance("intention", "execution") == 5
```

**Complexity:** Time O(m·n) · Space O(n)।

**Mistakes / edge cases:**
- base row/column ভুলে যাওয়া (খালি string)।
- `dp` index 1-based (`i` অক্ষর) কিন্তু string 0-based → `a[i-1]`।

🎤 **Say this while coding:** "dp of i, j is the cost to turn the first i characters into the first j. If the last characters match it's free; otherwise I take one plus the best of delete, insert, or replace."

🔗 DistroSaaS: fuzzy name matching (outlet/product নামের বানান ভিন্নতা) — **[Komol পূরণ করবে: duplicate outlet/SKU মেলানোর কাজ থাকলে স্টোরি ID]**।

---

## 2. Regular Expression Matching  ·  LC 10

**Problem:** `s` আর pattern `p` (`.` = যেকোনো এক অক্ষর, `*` = আগের অক্ষর ০ বা বেশিবার); **পুরো** `s` মেলে কি?
**Example:** `"aa","a" → false` · `"aa","a*" → true` · `"ab",".*" → true` · `"aab","c*a*b" → true`
**Constraints:** `|s| ≤ 20`, `|p| ≤ 20`

**Pattern:** 2-D DP — `dp[i][j]` = `s[:i]` আর `p[:j]` মেলে কি।

**Approach:**
1. `p[j-1]` সাধারণ অক্ষর বা `.` → `dp[i][j] = dp[i-1][j-1] && match(s[i-1], p[j-1])`।
2. `p[j-1] == '*'` → দুই option: `x*` শূন্যবার (`dp[i][j-2]`), অথবা এক বা বেশিবার (`match(s[i-1], p[j-2]) && dp[i-1][j]`)।
3. Base: `dp[0][0] = true`; `dp[0][j]` true হতে পারে `a*b*`-এর মতো pattern-এ।

**PHP:**
```php
<?php
function isMatch(string $s, string $p): bool
{
    $m = strlen($s); $n = strlen($p);
    $dp = array_fill(0, $m + 1, array_fill(0, $n + 1, false));
    $dp[0][0] = true;
    for ($j = 2; $j <= $n; $j++) {                 // empty s vs patterns like a*b*
        if ($p[$j - 1] === '*') $dp[0][$j] = $dp[0][$j - 2];
    }
    $eq = fn(string $c, string $pc): bool => $pc === '.' || $pc === $c;
    for ($i = 1; $i <= $m; $i++) {
        for ($j = 1; $j <= $n; $j++) {
            if ($p[$j - 1] === '*') {
                $dp[$i][$j] = $dp[$i][$j - 2]                                   // x* used zero times
                    || ($eq($s[$i - 1], $p[$j - 2]) && $dp[$i - 1][$j]);       // x* eats one more char
            } else {
                $dp[$i][$j] = $eq($s[$i - 1], $p[$j - 1]) && $dp[$i - 1][$j - 1];
            }
        }
    }
    return $dp[$m][$n];
}

assert(isMatch('aa', 'a') === false);
assert(isMatch('aa', 'a*') === true);
assert(isMatch('ab', '.*') === true);
assert(isMatch('aab', 'c*a*b') === true);
assert(isMatch('mississippi', 'mis*is*p*.') === false);
assert(isMatch('', 'a*b*') === true);
```

**Python:**
```python
def is_match(s: str, p: str) -> bool:
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True
    for j in range(2, n + 1):
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    eq = lambda c, pc: pc == "." or pc == c
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                dp[i][j] = dp[i][j - 2] or (eq(s[i - 1], p[j - 2]) and dp[i - 1][j])
            else:
                dp[i][j] = eq(s[i - 1], p[j - 1]) and dp[i - 1][j - 1]
    return dp[m][n]

assert is_match("aab", "c*a*b") and not is_match("mississippi", "mis*is*p*.")
assert is_match("", "a*b*")
```

**Complexity:** Time O(m·n) · Space O(m·n)।

**Mistakes / edge cases:**
- `*` আগের অক্ষরের সাথে **একটা ইউনিট** — `p[j-2]` দেখো, `p[j-1]` না।
- খালি `s` আর `a*` pattern-এর base row।
- "এক বা বেশিবার" কেসে `dp[i-1][j]` (j একই থাকে, কারণ `x*` আরো খেতে পারে)।

🎤 **Say this while coding:** "A star always pairs with the character before it, so at a star I have two choices: use the pair zero times and skip it, or, if the current character matches, let it consume one character and stay on the same pattern position."

---

## 3. Burst Balloons  ·  LC 312

**Problem:** balloon `nums[i]`; `i` ফাটালে পাও `nums[left] * nums[i] * nums[right]` (সবচেয়ে কাছের না-ফাটা প্রতিবেশী, বাইরে 1)। সর্বোচ্চ coin?
**Example:** `[3,1,5,8] → 167`
**Constraints:** `n ≤ 300`

**Pattern:** Interval DP — "কোনটা **আগে** ফাটাবো" ভাবলে প্রতিবেশী বদলে যায়; উল্টো ভাবো: `(l, r)`-এর মধ্যে কোনটা **সবার শেষে** ফাটবে। তখন তার প্রতিবেশী ঠিক `l` আর `r`।

**Approach:**
1. দুই পাশে 1 যোগ: `a = [1] + nums + [1]`।
2. `dp[l][r]` = `l` আর `r`-এর **মাঝের** (exclusive) সব ফাটিয়ে সর্বোচ্চ coin = `max over k in (l,r): dp[l][k] + a[l]*a[k]*a[r] + dp[k][r]`।
3. ক্রম: gap (r − l) ছোট থেকে বড়। উত্তর `dp[0][n+1]`।

**PHP:**
```php
<?php
function maxCoins(array $nums): int
{
    $a = array_merge([1], $nums, [1]);
    $n = count($a);
    $dp = array_fill(0, $n, array_fill(0, $n, 0));
    for ($gap = 2; $gap < $n; $gap++) {              // interval length grows
        for ($l = 0; $l + $gap < $n; $l++) {
            $r = $l + $gap;
            for ($k = $l + 1; $k < $r; $k++) {        // k = last balloon burst inside (l, r)
                $dp[$l][$r] = max($dp[$l][$r], $dp[$l][$k] + $a[$l] * $a[$k] * $a[$r] + $dp[$k][$r]);
            }
        }
    }
    return $dp[0][$n - 1];
}

assert(maxCoins([3, 1, 5, 8]) === 167);
assert(maxCoins([1, 5]) === 10);
assert(maxCoins([7]) === 7);
```

**Python:**
```python
def max_coins(nums: list[int]) -> int:
    a = [1] + nums + [1]
    n = len(a)
    dp = [[0] * n for _ in range(n)]
    for gap in range(2, n):
        for l in range(n - gap):
            r = l + gap
            dp[l][r] = max(dp[l][k] + a[l] * a[k] * a[r] + dp[k][r] for k in range(l + 1, r))
    return dp[0][n - 1]

assert max_coins([3, 1, 5, 8]) == 167 and max_coins([1, 5]) == 10
```

**Complexity:** Time O(n³) · Space O(n²) — n ≤ 300 → ~2.7·10⁷, চলে।

**Mistakes / edge cases:**
- "প্রথমে কোনটা" দিয়ে state বানালে sub-problem স্বাধীন থাকে না।
- iteration order: ছোট interval আগে, নইলে `dp[l][k]` তখনো হিসাব হয়নি।

🎤 **Say this while coding:** "If I think about which balloon to burst first, the neighbours keep changing. If I instead pick the last balloon in an interval, its neighbours are fixed as the interval's borders, and the two sides become independent subproblems."
