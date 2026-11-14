---
id: ps-math-bit-manipulation-hard
title: "13 — Math & Bit Manipulation — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, math-bit-manipulation]
updated: 2026-11-14
---

# 13 — Math & Bit Manipulation — Hard

> **Pattern চেনার সংকেত:** "k-তম permutation" → factorial number system (প্রতিটা অবস্থানে `(n-1)!` টা করে ব্লক)। "1..n-এ digit X কতবার" → প্রতিটা দশমিক অবস্থান আলাদাভাবে গোনো (high / cur / low)। "`*`, `/`, `%` ছাড়া ভাগ" → bit shift দিয়ে দ্বিগুণ করে বিয়োগ।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Permutation Sequence ⭐ | LC 60 | ⬜ | — | — |
| 2 | Number of Digit One | LC 233 | ⬜ | — | — |
| 3 | Divide Two Integers | LC 29 *(LC-তে medium; ইন্টারভিউতে edge case-এর জন্য hard)* | ⬜ | — | — |
| 4 | Maximum XOR of Two Numbers | LC 421 *(bit trie → [19](../19-trie/))* | ⬜ | — | — |
| 5 | Max Points on a Line | LC 149 *(gcd slope, [03 hard](../03-hashing/hard.md))* | ⬜ | — | — |

---

## 1. Permutation Sequence  ·  LC 60

**Problem:** `1..n`-এর সব permutation lexicographic ক্রমে সাজালে k-তম (1-indexed) কোনটা?
**Example:** `n=3, k=3 → "213"` · `n=4, k=9 → "2314"`
**Constraints:** `1 ≤ n ≤ 9`, `1 ≤ k ≤ n!`

**Pattern:** Factorial number system — প্রথম অঙ্ক ঠিক করলে বাকি `(n−1)!` টা permutation; তাই `(k−1) / (n−1)!` = কোন অঙ্ক।

**Approach:**
1. Brute force: k বার next permutation — O(k·n), n! = 362880 পর্যন্ত।
2. Optimized: `k--` (0-indexed); বাকি অঙ্কের list; প্রতিটা অবস্থানে `idx = k / f`, সেই অঙ্ক নাও ও list থেকে সরাও, `k %= f`, `f /= বাকি সংখ্যা`।

**PHP:**
```php
<?php
function getPermutation(int $n, int $k): string
{
    $digits = range(1, $n);
    $fact = 1;
    for ($i = 2; $i < $n; $i++) $fact *= $i;      // (n-1)!
    $k--;                                         // 0-indexed
    $out = '';
    for ($left = $n - 1; $left >= 0; $left--) {
        $idx = intdiv($k, $fact);
        $out .= $digits[$idx];
        array_splice($digits, $idx, 1);
        $k %= $fact;
        if ($left > 0) $fact = intdiv($fact, $left);
    }
    return $out;
}

assert(getPermutation(3, 3) === '213');
assert(getPermutation(4, 9) === '2314');
assert(getPermutation(3, 1) === '123');
assert(getPermutation(1, 1) === '1');
assert(getPermutation(9, 362880) === '987654321');
```

**Python:**
```python
from math import factorial

def get_permutation(n: int, k: int) -> str:
    digits = list(range(1, n + 1))
    k -= 1
    out = []
    for left in range(n - 1, -1, -1):
        f = factorial(left)
        idx, k = divmod(k, f)
        out.append(str(digits.pop(idx)))
    return "".join(out)

assert get_permutation(4, 9) == "2314" and get_permutation(9, 362880) == "987654321"
```

**Complexity:** Time O(n²) (list থেকে সরানো) · Space O(n)।

**Mistakes / edge cases:**
- `k` 1-indexed — আগে `k--` না করলে block সীমানায় ভুল।
- শেষ ধাপে `fact` 0 দিয়ে ভাগ — `left > 0` চেক।

🎤 **Say this while coding:** "Fixing the first digit leaves n minus one factorial permutations, so dividing k by that factorial tells me which remaining digit comes first; then I recurse on the remainder."

---

## 2. Number of Digit One  ·  LC 233

**Problem:** `0..n`-এর সব সংখ্যায় মোট কতগুলো `1` digit?
**Example:** `13 → 6` (1, 10, 11×2, 12, 13)
**Constraints:** `0 ≤ n ≤ 10⁹`

**Pattern:** প্রতিটা দশমিক অবস্থানে গোনা — অবস্থান `p` (1, 10, 100…) এর জন্য `high = n / (p·10)`, `cur = (n / p) % 10`, `low = n % p`।
- `cur == 0` → `high · p`
- `cur == 1` → `high · p + low + 1`
- `cur ≥ 2` → `(high + 1) · p`

**Approach:**
1. Brute force: প্রতিটা সংখ্যায় 1 গোনা — O(n log n), n = 10⁹-এ অসম্ভব।
2. Optimized: উপরের সূত্র প্রতিটা অবস্থানে — O(log n)।

**PHP:**
```php
<?php
function countDigitOne(int $n): int
{
    $count = 0;
    for ($p = 1; $p <= $n; $p *= 10) {
        $high = intdiv($n, $p * 10);
        $cur  = intdiv($n, $p) % 10;
        $low  = $n % $p;
        if ($cur === 0)      $count += $high * $p;
        elseif ($cur === 1)  $count += $high * $p + $low + 1;
        else                 $count += ($high + 1) * $p;
    }
    return $count;
}

function bruteDigitOne(int $n): int
{
    $c = 0;
    for ($i = 1; $i <= $n; $i++) $c += substr_count((string) $i, '1');
    return $c;
}

assert(countDigitOne(13) === 6);
assert(countDigitOne(0) === 0);
foreach ([1, 9, 10, 11, 99, 100, 101, 2345] as $x) assert(countDigitOne($x) === bruteDigitOne($x));
assert(countDigitOne(1000000000) === 900000001);
```

**Python:**
```python
def count_digit_one(n: int) -> int:
    count, p = 0, 1
    while p <= n:
        high, cur, low = n // (p * 10), (n // p) % 10, n % p
        if cur == 0:
            count += high * p
        elif cur == 1:
            count += high * p + low + 1
        else:
            count += (high + 1) * p
        p *= 10
    return count

assert count_digit_one(13) == 6
assert all(count_digit_one(x) == sum(str(i).count("1") for i in range(x + 1)) for x in range(300))
```

**Complexity:** Time O(log n) · Space O(1)।

**Mistakes / edge cases:**
- `cur == 1` কেসে `low + 1` (0 থেকে low পর্যন্ত সব)।
- ইন্টারভিউতে সূত্র মনে না পড়লে: ছোট n-এ brute force লিখে প্যাটার্ন খোঁজো, তারপর সাধারণীকরণ — এটা বলাটাই ভালো সংকেত।

🎤 **Say this while coding:** "I count ones position by position. For each place value, the digits above it tell me how many full cycles passed, and the current digit decides whether this cycle adds zero, a partial count, or a full p."

---

## 3. Divide Two Integers  ·  LC 29

**Problem:** `*`, `/`, `%` ছাড়া integer ভাগফল (শূন্যের দিকে কাটা)। 32-bit সীমা: ফল `2³¹−1`-এর বেশি হলে `2³¹−1`।
**Example:** `10 / 3 → 3` · `7 / -3 → -2` · `-2147483648 / -1 → 2147483647`

**Pattern:** Bit shift দিয়ে exponential বিয়োগ — divisor-কে দ্বিগুণ করতে থাকো যতক্ষণ dividend-এর মধ্যে ধরে, সেই গুণিতক বিয়োগ করো।

**Approach:**
1. Brute force: বারবার বিয়োগ — O(dividend), 2³¹ পর্যন্ত।
2. Optimized: sign আলাদা করো, absolute মানে কাজ। প্রতি রাউন্ডে `d << shift` সবচেয়ে বড় যেটা `≤ a`, বিয়োগ, `q += 1 << shift`। O(log² n)।

**PHP:**
```php
<?php
function divide(int $dividend, int $divisor): int
{
    $MAX = 2147483647; $MIN = -2147483648;
    if ($dividend === $MIN && $divisor === -1) return $MAX;     // the only overflow case
    $negative = ($dividend < 0) !== ($divisor < 0);
    $a = abs($dividend); $b = abs($divisor);                    // PHP ints are 64-bit: safe
    $q = 0;
    while ($a >= $b) {
        $shift = 0;
        while ($a >= ($b << ($shift + 1))) $shift++;            // largest b * 2^shift <= a
        $a -= $b << $shift;
        $q += 1 << $shift;
    }
    return $negative ? -$q : $q;
}

assert(divide(10, 3) === 3);
assert(divide(7, -3) === -2);
assert(divide(-2147483648, -1) === 2147483647);
assert(divide(-2147483648, 1) === -2147483648);
assert(divide(0, 5) === 0);
assert(divide(1, 1) === 1);
```

**Python:**
```python
def divide(dividend: int, divisor: int) -> int:
    MAX, MIN = 2**31 - 1, -2**31
    if dividend == MIN and divisor == -1:
        return MAX
    negative = (dividend < 0) != (divisor < 0)
    a, b, q = abs(dividend), abs(divisor), 0
    while a >= b:
        shift = 0
        while a >= b << (shift + 1):
            shift += 1
        a -= b << shift
        q += 1 << shift
    return -q if negative else q

assert divide(10, 3) == 3 and divide(7, -3) == -2 and divide(-2**31, -1) == 2**31 - 1
```

**Complexity:** Time O(log² n) · Space O(1)।

**Mistakes / edge cases:**
- `MIN / -1` overflow — একমাত্র বিশেষ কেস।
- 32-bit ভাষায় (Java/C++) `abs(MIN)` overflow → negative-এ কাজ করার কৌশল লাগে; PHP/Python-এ 64-bit/bigint, তাই সহজ — ইন্টারভিউয়ারকে এটা বলো।
- Python-এ `//` floor করে (`-7 // 3 = -3`), truncate না — তাই sign আলাদা রেখে positive-এ ভাগ।

🎤 **Say this while coding:** "Instead of subtracting the divisor one at a time, I double it with shifts until it would exceed the dividend, subtract that chunk, and add the matching power of two to the quotient."
