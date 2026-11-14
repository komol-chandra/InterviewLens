---
id: ps-binary-search-on-answer-medium
title: "22 — Binary Search on Answer — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, binary-search-on-answer]
updated: 2026-11-14
---

# 22 — Binary Search on Answer — Medium

> **Pattern চেনার সংকেত:** "D দিনে সব পাঠাতে সর্বনিম্ন capacity", "m টা bouquet বানাতে সর্বনিম্ন দিন", "সর্বনিম্ন eating speed" → minimize, first true; feasible = এক pass greedy।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Capacity To Ship Packages Within D Days ⭐ | LC 1011 | ⬜ | — | — |
| 2 | Minimum Number of Days to Make m Bouquets | LC 1482 | ⬜ | — | — |
| 3 | Koko Eating Bananas | LC 875 *(worked in [08 medium](../08-sorting-searching/medium.md))* | ⬜ | — | — |
| 4 | Magnetic Force Between Two Balls | LC 1552 *(maximize the minimum → last true)* | ⬜ | — | — |
| 5 | Find the Smallest Divisor Given a Threshold | LC 1283 | ⬜ | — | — |

---

## 1. Capacity To Ship Packages Within D Days  ·  LC 1011

**Problem:** প্যাকেজের ওজন **ক্রমে** জাহাজে তুলতে হয় (ক্রম বদলানো যাবে না); প্রতিদিন জাহাজের capacity পর্যন্ত। `days` দিনে সব পাঠাতে সর্বনিম্ন capacity।
**Example:** `[1,2,3,4,5,6,7,8,9,10], 5 → 15` · `[3,2,2,4,1,4], 3 → 6`
**Constraints:** `n ≤ 5·10⁴`, ওজন ≤ 500।

**Pattern:** Binary search on capacity — `lo = max(w)` (সবচেয়ে ভারীটা অন্তত ধরতে হবে), `hi = sum(w)` (এক দিনে সব)। feasible(cap) = greedy: দিন ভরে যতক্ষণ ধরে, না ধরলে নতুন দিন।

**PHP:**
```php
<?php
function shipWithinDays(array $weights, int $days): int
{
    $canShip = function (int $cap) use ($weights, $days): bool {
        $need = 1; $load = 0;
        foreach ($weights as $w) {
            if ($load + $w > $cap) { $need++; $load = 0; }   // start a new day
            $load += $w;
        }
        return $need <= $days;
    };
    $lo = max($weights); $hi = array_sum($weights);
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($canShip($mid)) $hi = $mid; else $lo = $mid + 1;
    }
    return $lo;
}

assert(shipWithinDays([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) === 15);
assert(shipWithinDays([3, 2, 2, 4, 1, 4], 3) === 6);
assert(shipWithinDays([1, 2, 3, 1, 1], 4) === 3);
assert(shipWithinDays([10], 1) === 10);
```

**Python:**
```python
def ship_within_days(weights: list[int], days: int) -> int:
    def can_ship(cap: int) -> bool:
        need, load = 1, 0
        for w in weights:
            if load + w > cap:
                need += 1
                load = 0
            load += w
        return need <= days

    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_ship(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

assert ship_within_days([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5) == 15 and ship_within_days([3, 2, 2, 4, 1, 4], 3) == 6
```

**Complexity:** Time O(n · log(sum)) · Space O(1)।
**Mistakes:** `lo = 1` → feasible-এ ভারী প্যাকেজ কখনো জায়গা পায় না, কিন্তু greedy সেটা ধরতে পারে না (ভুল true দেয়)।

🎤 **Say this while coding:** "Capacity is the answer I binary search. For a candidate, a greedy pass counts how many days it takes; more capacity never needs more days, so the check is monotonic. The lower bound is the heaviest package, the upper bound is the total."

🔗 DistroSaaS: delivery van-এর capacity আর দিনে কয়টা trip — একই হিসাব (ক্রম বজায় = route sequence) — **[Komol পূরণ করবে: load/van planning-এর কাজ থাকলে স্টোরি ID]**।

---

## 2. Minimum Number of Days to Make m Bouquets  ·  LC 1482

**Problem:** `bloomDay[i]` = i-তম ফুল কোন দিনে ফোটে। একটা bouquet = **পাশাপাশি** k টা ফোটা ফুল। m টা bouquet বানাতে সর্বনিম্ন কত দিন অপেক্ষা? অসম্ভব হলে −1।
**Example:** `[1,10,3,10,2], m=3, k=1 → 3` · `m=3, k=2 → -1` · `[7,7,7,7,12,7,7], m=2, k=3 → 12`

**Pattern:** Binary search on day — `m·k > n` হলে সরাসরি −1। feasible(day): টানা ফোটা ফুল গোনো, k হলেই একটা bouquet।

**PHP:**
```php
<?php
function minDays(array $bloomDay, int $m, int $k): int
{
    if ($m * $k > count($bloomDay)) return -1;
    $canMake = function (int $day) use ($bloomDay, $m, $k): bool {
        $bouquets = 0; $run = 0;
        foreach ($bloomDay as $b) {
            if ($b <= $day) {
                if (++$run === $k) { $bouquets++; $run = 0; }   // use k adjacent flowers
            } else {
                $run = 0;                                      // adjacency broken
            }
        }
        return $bouquets >= $m;
    };
    $lo = min($bloomDay); $hi = max($bloomDay);
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($canMake($mid)) $hi = $mid; else $lo = $mid + 1;
    }
    return $lo;
}

assert(minDays([1, 10, 3, 10, 2], 3, 1) === 3);
assert(minDays([1, 10, 3, 10, 2], 3, 2) === -1);
assert(minDays([7, 7, 7, 7, 12, 7, 7], 2, 3) === 12);
assert(minDays([1000000000, 1000000000], 1, 1) === 1000000000);
```

**Python:**
```python
def min_days(bloom_day: list[int], m: int, k: int) -> int:
    if m * k > len(bloom_day):
        return -1

    def can_make(day: int) -> bool:
        bouquets = run = 0
        for b in bloom_day:
            if b <= day:
                run += 1
                if run == k:
                    bouquets += 1
                    run = 0
            else:
                run = 0
        return bouquets >= m

    lo, hi = min(bloom_day), max(bloom_day)
    while lo < hi:
        mid = (lo + hi) // 2
        if can_make(mid):
            hi = mid
        else:
            lo = mid + 1
    return lo

assert min_days([7, 7, 7, 7, 12, 7, 7], 2, 3) == 12 and min_days([1, 10, 3, 10, 2], 3, 2) == -1
```

**Complexity:** Time O(n · log(max − min)) · Space O(1)।
**Mistakes:** অসম্ভব কেস আগে না ধরা (তখন binary search `max`-এ থামে আর ভুলভাবে সেটা ফেরত দেয়); ফোটেনি এমন ফুলে run রিসেট না করা।

🎤 **Say this while coding:** "Waiting longer only lets more flowers bloom, so feasibility is monotonic in the day. I first rule out the impossible case where m times k exceeds the flowers, then binary search the day with a greedy count of adjacent runs."
