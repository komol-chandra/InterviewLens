---
id: ps-heap-medium
title: "15 — Heap — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, heap]
updated: 2026-11-14
---

# 15 — Heap — Medium

> **Pattern চেনার সংকেত:** "K closest / K most frequent" → size-K heap (উল্টো ধরনের)। "পাশাপাশি একই অক্ষর যেন না থাকে" / "cooldown" → সবচেয়ে বেশি বাকি থাকাটা আগে (max-heap), সদ্য-ব্যবহৃতটা এক ধাপ আটকে রাখো।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | K Closest Points to Origin ⭐ | LC 973 | ⬜ | — | — |
| 2 | Reorganize String | LC 767 | ⬜ | — | — |
| 3 | Kth Largest Element in an Array | LC 215 *(worked in [08 medium](../08-sorting-searching/medium.md))* | ⬜ | — | — |
| 4 | Top K Frequent Elements | LC 347 *(worked in [03 medium](../03-hashing/medium.md))* | ⬜ | — | — |
| 5 | Task Scheduler | LC 621 | ⬜ | — | — |
| 6 | Find K Pairs with Smallest Sums | LC 373 | ⬜ | — | — |

---

## 1. K Closest Points to Origin  ·  LC 973

**Problem:** 2-D বিন্দু; origin-এর সবচেয়ে কাছের `k`টা (যেকোনো ক্রমে)।
**Example:** `[[3,3],[5,-1],[-2,4]], k=2 → [[3,3],[-2,4]]`
**Constraints:** `k ≤ n ≤ 10⁴`

**Pattern:** size-K **max**-heap দূরত্ব অনুযায়ী — K closest (ছোট) চাই, তাই heap-এর root = এখন পর্যন্ত রাখা সবচেয়ে **দূরের**টা, নতুনটা কাছে হলে সেটা বাদ।

**Approach:**
1. Sort by distance — O(n log n)।
2. Heap — O(n log k)। (Quickselect গড়ে O(n) — মুখে উল্লেখ করো।) দূরত্বে `sqrt` লাগে না, বর্গই যথেষ্ট।

**PHP:**
```php
<?php
function kClosest(array $points, int $k): array
{
    $h = new SplMaxHeap();                             // [dist², x, y]
    foreach ($points as [$x, $y]) {
        $h->insert([$x * $x + $y * $y, $x, $y]);
        if (count($h) > $k) $h->extract();             // drop the farthest
    }
    $res = [];
    foreach ($h as [, $x, $y]) $res[] = [$x, $y];      // iterating empties the heap; fine here
    sort($res);
    return $res;
}

assert(kClosest([[1, 3], [-2, 2]], 1) === [[-2, 2]]);
assert(kClosest([[3, 3], [5, -1], [-2, 4]], 2) === [[-2, 4], [3, 3]]);
```

**Python:**
```python
import heapq

def k_closest(points: list[list[int]], k: int) -> list[list[int]]:
    h: list[tuple[int, int, int]] = []
    for x, y in points:
        heapq.heappush(h, (-(x * x + y * y), x, y))   # negate -> max-heap on distance
        if len(h) > k:
            heapq.heappop(h)
    return sorted([x, y] for _, x, y in h)

assert k_closest([[3, 3], [5, -1], [-2, 4]], 2) == [[-2, 4], [3, 3]]
```

**Complexity:** Time O(n log k) · Space O(k)।
**Mistakes:** "closest" দেখে min-heap-এ সব ঢোকানো — চলে কিন্তু O(n) memory; `sqrt` float-এর ঝামেলা অপ্রয়োজনীয়।

🎤 **Say this while coding:** "To keep the k smallest distances I use a max-heap of size k — the root is the worst of my current best, so any closer point replaces it."

---

## 2. Reorganize String  ·  LC 767

**Problem:** অক্ষরগুলো এমনভাবে সাজাও যাতে পাশাপাশি দুটো একই না হয়; না পারলে `""`।
**Example:** `"aab" → "aba"` · `"aaab" → ""`

**Pattern:** Greedy + max-heap by count — প্রতিবার সবচেয়ে বেশি বাকি অক্ষরটা বসাও, কিন্তু আগের ধাপে বসানোটা এক ধাপ heap-এর বাইরে রাখো।

**Approach:**
1. সম্ভব কি না: কোনো অক্ষরের count > `(n+1)/2` হলে অসম্ভব।
2. heap থেকে `(count, ch)` নাও, বসাও, আগের ধাপে আটকে রাখা `prev` (count > 0 হলে) আবার heap-এ ঢোকাও, এবার এটাকে `prev` বানাও।

**PHP:**
```php
<?php
function reorganizeString(string $s): string
{
    $h = new SplMaxHeap();
    foreach (count_chars($s, 1) as $code => $cnt) $h->insert([$cnt, chr($code)]);
    $out = ''; $prev = null;
    while (!$h->isEmpty()) {
        [$cnt, $ch] = $h->extract();
        $out .= $ch;
        if ($prev !== null) $h->insert($prev);          // re-allow the char used last step
        $prev = $cnt > 1 ? [$cnt - 1, $ch] : null;
    }
    return strlen($out) === strlen($s) ? $out : '';
}

function noAdjacentSame(string $s): bool
{
    for ($i = 1; $i < strlen($s); $i++) if ($s[$i] === $s[$i - 1]) return false;
    return true;
}

assert(reorganizeString('aab') === 'aba');
assert(reorganizeString('aaab') === '');
$r = reorganizeString('aaabbc');
assert(strlen($r) === 6 && noAdjacentSame($r) && count_chars($r, 1) === count_chars('aaabbc', 1));
```

**Python:**
```python
import heapq
from collections import Counter

def reorganize_string(s: str) -> str:
    h = [(-c, ch) for ch, c in Counter(s).items()]
    heapq.heapify(h)
    out, prev = [], None
    while h:
        c, ch = heapq.heappop(h)
        out.append(ch)
        if prev:
            heapq.heappush(h, prev)
        prev = (c + 1, ch) if c + 1 < 0 else None   # counts are negative
    return "".join(out) if len(out) == len(s) else ""

r = reorganize_string("aaabbc")
assert len(r) == 6 and all(a != b for a, b in zip(r, r[1:]))
assert reorganize_string("aaab") == ""
```

**Complexity:** Time O(n log σ) (σ = আলাদা অক্ষর, ≤ 26) · Space O(σ)।
**Mistakes:** `prev`-কে একই ধাপে ফেরত দিলে সেটা আবার সাথে সাথে বের হয়ে পাশাপাশি বসে।

🎤 **Say this while coding:** "I always place the most frequent remaining character, but I hold back the one I just used for one round so it can't be placed twice in a row."
