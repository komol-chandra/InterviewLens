---
id: ps-binary-search-on-answer-easy
title: "22 — Binary Search on Answer — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, binary-search-on-answer]
updated: 2026-11-14
---

# 22 — Binary Search on Answer — Easy

> **Pattern চেনার সংকেত:** `false … false true … true` ধরনের API বা শর্ত → প্রথম true খোঁজো। "সর্বোচ্চ কয়টা পূর্ণ সারি / সর্বোচ্চ x যাতে f(x) ≤ n" → শেষ true।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | First Bad Version ⭐ | LC 278 | ⬜ | — | — |
| 2 | Arranging Coins | LC 441 | ⬜ | — | — |
| 3 | Sqrt(x) | LC 69 *(worked in [08 easy](../08-sorting-searching/easy.md))* | ⬜ | — | — |
| 4 | Valid Perfect Square | LC 367 | ⬜ | — | — |

---

## 1. First Bad Version  ·  LC 278

**Problem:** version 1..n; কোনো এক version থেকে সব খারাপ। `isBadVersion(v)` API যত কম বার ডেকে প্রথম খারাপটা খোঁজো।
**Example:** `n=5, first bad=4 → 4`

**Pattern:** First true — `isBad` monotonic (`F F F T T`)।

**PHP:**
```php
<?php
function firstBadVersion(int $n, callable $isBad): int
{
    $lo = 1; $hi = $n;
    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);        // no overflow even for n near 2^31
        if ($isBad($mid)) $hi = $mid; else $lo = $mid + 1;
    }
    return $lo;
}

$calls = 0;
$bad = function (int $v) use (&$calls): bool { $calls++; return $v >= 4; };
assert(firstBadVersion(5, $bad) === 4);
assert(firstBadVersion(1, fn($v) => true) === 1);
$calls = 0;
assert(firstBadVersion(2126753390, function (int $v) use (&$calls) { $calls++; return $v >= 1702766719; }) === 1702766719);
assert($calls <= 32);
```

**Python:**
```python
def first_bad_version(n: int, is_bad) -> int:
    lo, hi = 1, n
    while lo < hi:
        mid = lo + (hi - lo) // 2
        if is_bad(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

assert first_bad_version(5, lambda v: v >= 4) == 4
assert first_bad_version(2126753390, lambda v: v >= 1702766719) == 1702766719
```

**Complexity:** O(log n) API কল · Space O(1)।
**Mistakes:** `(lo + hi) / 2` 32-bit ভাষায় overflow — LC-র আসল ফাঁদ; `hi = mid − 1` লিখলে প্রথম bad বাদ পড়তে পারে।

🎤 **Say this while coding:** "Versions go from good to bad exactly once, so I binary search for the first true, keeping mid as a candidate when it's bad."

---

## 2. Arranging Coins  ·  LC 441

**Problem:** `n` কয়েন দিয়ে সিঁড়ি: k-তম সারিতে k টা কয়েন। কয়টা **পূর্ণ** সারি?
**Example:** `5 → 2` · `8 → 3`
**Constraints:** `n ≤ 2³¹ − 1`

**Pattern:** Last true — সবচেয়ে বড় `k` যাতে `k(k+1)/2 ≤ n`।

**PHP:**
```php
<?php
function arrangeCoins(int $n): int
{
    $lo = 0; $hi = $n;
    while ($lo < $hi) {
        $mid = $lo + intdiv($hi - $lo + 1, 2);         // upper mid
        if (intdiv($mid * ($mid + 1), 2) <= $n) $lo = $mid; else $hi = $mid - 1;
    }
    return $lo;
}

assert(arrangeCoins(5) === 2);
assert(arrangeCoins(8) === 3);
assert(arrangeCoins(1) === 1);
assert(arrangeCoins(0) === 0);
assert(arrangeCoins(2147483647) === 65535);
```

**Python:**
```python
def arrange_coins(n: int) -> int:
    lo, hi = 0, n
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * (mid + 1) // 2 <= n:
            lo = mid
        else:
            hi = mid - 1
    return lo

assert arrange_coins(8) == 3 and arrange_coins(2147483647) == 65535
```

**Complexity:** Time O(log n) · Space O(1)। (Math: `k = floor((√(8n+1) − 1) / 2)` — float precision নিয়ে সাবধান, মুখে বলো।)
**Mistakes:** `mid * (mid+1)` 32-bit-এ overflow (PHP 64-bit, তাই ঠিক)।

🎤 **Say this while coding:** "I want the largest k whose triangular number fits in n, so it's the last-true template with an upper mid."
