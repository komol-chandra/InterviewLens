---
id: ps-greedy-hard
title: "11 — Greedy — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, greedy]
updated: 2026-11-14
---

# 11 — Greedy — Hard

> **Pattern চেনার সংকেত:** "deadline আছে, সর্বোচ্চ কয়টা কাজ" → deadline অনুযায়ী sort + max-heap দিয়ে "সবচেয়ে খারাপটা ফেরত দাও" (regret greedy)। "সর্বনিম্ন কয়টা থামা/যোগ" → যতক্ষণ পারো এগোও, আটকালে **এ পর্যন্ত দেখা সেরা option**টা নাও (heap)। "1..n সব যোগফল তৈরি করা যায়?" → `reach` গুনে, ফাঁক পেলে `reach+1` যোগ।
> **Greedy-র প্রমাণ মুখে:** "exchange argument" — যেকোনো optimal সমাধানে আমার পছন্দটা বসালে খারাপ হয় না।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Course Schedule III ⭐ | LC 630 | ⬜ | — | — |
| 2 | Minimum Number of Refueling Stops | LC 871 | ⬜ | — | — |
| 3 | Patching Array | LC 330 | ⬜ | — | — |
| 4 | Candy | LC 135 *(worked in [01 hard](../01-arrays/hard.md))* | ⬜ | — | — |
| 5 | IPO | LC 502 *(দুই heap: খরচ অনুযায়ী min-heap → profit max-heap)* | ⬜ | — | — |

---

## 1. Course Schedule III  ·  LC 630

**Problem:** প্রতিটা course `[duration, lastDay]`; একটার পর একটা নিতে হয়, `lastDay`-এর মধ্যে শেষ করতে হবে। সর্বোচ্চ কয়টা course নেওয়া যায়?
**Example:** `[[100,200],[200,1300],[1000,1250],[2000,3200]] → 3`
**Constraints:** `n ≤ 10⁴`

**Pattern:** Sort by deadline + max-heap (regret) — deadline-এর ক্রমে নাও; সময় পেরিয়ে গেলে এ পর্যন্ত নেওয়া সবচেয়ে **লম্বা** course বাদ দাও (count একই থাকে, কিন্তু সময় সবচেয়ে বেশি বাঁচে)।

**Approach:**
1. Brute force: সব subset — O(2ⁿ)। DP `(i, time)` — time অনেক বড়।
2. Optimized: `lastDay` অনুযায়ী sort। `time += d`, heap-এ `d` push; `time > lastDay` হলে heap থেকে max বের করে `time` থেকে বাদ। উত্তর = heap size।

**PHP:**
```php
<?php
function scheduleCourse(array $courses): int
{
    usort($courses, fn($a, $b) => $a[1] <=> $b[1]);    // earliest deadline first
    $heap = new SplMaxHeap();                         // durations taken so far
    $time = 0;
    foreach ($courses as [$d, $last]) {
        $time += $d;
        $heap->insert($d);
        if ($time > $last) $time -= $heap->extract(); // drop the longest course
    }
    return count($heap);
}

assert(scheduleCourse([[100, 200], [200, 1300], [1000, 1250], [2000, 3200]]) === 3);
assert(scheduleCourse([[1, 2]]) === 1);
assert(scheduleCourse([[3, 2], [4, 3]]) === 0);
assert(scheduleCourse([[5, 5], [4, 6], [2, 6]]) === 2);
```

**Python:**
```python
import heapq

def schedule_course(courses: list[list[int]]) -> int:
    heap: list[int] = []          # max-heap via negatives
    time = 0
    for d, last in sorted(courses, key=lambda c: c[1]):
        time += d
        heapq.heappush(heap, -d)
        if time > last:
            time += heapq.heappop(heap)   # pops -max, so this subtracts the longest
    return len(heap)

assert schedule_course([[100, 200], [200, 1300], [1000, 1250], [2000, 3200]]) == 3
assert schedule_course([[5, 5], [4, 6], [2, 6]]) == 2
```

**Complexity:** Time O(n log n) · Space O(n)।

**Mistakes / edge cases:**
- duration অনুযায়ী sort — ভুল; deadline অনুযায়ী।
- যে course নিজেই deadline পেরোয় (`[3,2]`) — push করে সাথে সাথে বের হয়ে যায়, ঠিক আছে।

🎤 **Say this while coding:** "Taking courses in deadline order, whenever I run over time I drop the longest course taken so far — the count doesn't change but I free the most time, which can only help later courses."

---

## 2. Minimum Number of Refueling Stops  ·  LC 871

**Problem:** গাড়ি `startFuel` নিয়ে শুরু, `target` দূরত্বে যাবে; পথে স্টেশন `[position, fuel]`। সর্বনিম্ন কয়বার থামতে হবে (না পারলে −1)?
**Example:** `target=100, start=10, [[10,60],[20,30],[30,30],[60,40]] → 2`
**Constraints:** স্টেশন ≤ 500।

**Pattern:** Greedy + max-heap — যত দূর পারো চালাও, পেরোনো সব স্টেশনের fuel heap-এ রাখো; আটকে গেলে "অতীতে সবচেয়ে বেশি fuel-ওয়ালা স্টেশনে থেমেছিলাম" ধরে নাও।

**Approach:**
1. DP বিকল্প: `dp[k]` = k বার থেমে সর্বোচ্চ দূরত্ব — O(n²)।
2. Greedy: স্টেশন ক্রমে (+ target-কে শেষ স্টেশন ধরো fuel 0); পৌঁছানোর আগে `reach < pos` হলে heap থেকে max নিয়ে `reach +=`, `stops++`; heap খালি হলে −1।

**PHP:**
```php
<?php
function minRefuelStops(int $target, int $startFuel, array $stations): int
{
    $heap = new SplMaxHeap();
    $reach = $startFuel; $stops = 0;
    $stations[] = [$target, 0];                       // treat target as a final station
    foreach ($stations as [$pos, $fuel]) {
        while ($reach < $pos) {                       // can't get here: refuel retroactively
            if ($heap->isEmpty()) return -1;
            $reach += $heap->extract();
            $stops++;
        }
        $heap->insert($fuel);
    }
    return $stops;
}

assert(minRefuelStops(1, 1, []) === 0);
assert(minRefuelStops(100, 1, [[10, 100]]) === -1);
assert(minRefuelStops(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]) === 2);
assert(minRefuelStops(100, 50, [[25, 25], [50, 50]]) === 1);
```

**Python:**
```python
import heapq

def min_refuel_stops(target: int, start_fuel: int, stations: list[list[int]]) -> int:
    heap: list[int] = []
    reach, stops = start_fuel, 0
    for pos, fuel in stations + [[target, 0]]:
        while reach < pos:
            if not heap:
                return -1
            reach -= heapq.heappop(heap)
            stops += 1
        heapq.heappush(heap, -fuel)
    return stops

assert min_refuel_stops(100, 10, [[10, 60], [20, 30], [30, 30], [60, 40]]) == 2
assert min_refuel_stops(100, 1, [[10, 100]]) == -1
```

**Complexity:** Time O(n log n) · Space O(n)।

**Mistakes / edge cases:**
- target-এ পৌঁছানোর শেষ চেক ভুলে যাওয়া → target-কে fuel-0 স্টেশন হিসেবে যোগ করলে সমাধান।
- `reach == pos` → পৌঁছানো যায় (`<`, `<=` না)।

🎤 **Say this while coding:** "I drive as far as I can and remember every station I passed. When I can't reach the next point, I pretend I stopped at the passed station with the most fuel — that's always the best single stop to add."

---

## 3. Patching Array  ·  LC 330

**Problem:** sorted `nums` আর `n`; সর্বনিম্ন কয়টা সংখ্যা যোগ করলে `[1, n]`-এর প্রতিটা মান কোনো subset-এর যোগফল হিসেবে পাওয়া যাবে?
**Example:** `[1,3], n=6 → 1` (2 যোগ) · `[1,5,10], n=20 → 2` (2, 4)
**Constraints:** `n ≤ 2³¹−1`

**Pattern:** Greedy reach — `miss` = সবচেয়ে ছোট যে মান এখনো বানানো যায় না (`[1, miss)` সব পারা যায়)। পরের সংখ্যা `≤ miss` হলে নাও (`miss += x`); নইলে `miss` নিজেই patch করো (`miss *= 2`) — এটাই রেঞ্জ সবচেয়ে বেশি বাড়ায়।

**PHP:**
```php
<?php
function minPatches(array $nums, int $n): int
{
    $miss = 1; $i = 0; $patches = 0;
    while ($miss <= $n) {
        if ($i < count($nums) && $nums[$i] <= $miss) {
            $miss += $nums[$i++];          // extend [1, miss) using an existing number
        } else {
            $miss += $miss;                // patch with `miss` itself: doubles the range
            $patches++;
        }
    }
    return $patches;
}

assert(minPatches([1, 3], 6) === 1);
assert(minPatches([1, 5, 10], 20) === 2);
assert(minPatches([1, 2, 2], 5) === 0);
assert(minPatches([], 7) === 3);                 // 1, 2, 4
assert(minPatches([1, 2, 31, 33], 2147483647) === 28);
```

**Python:**
```python
def min_patches(nums: list[int], n: int) -> int:
    miss, i, patches = 1, 0, 0
    while miss <= n:
        if i < len(nums) and nums[i] <= miss:
            miss += nums[i]; i += 1
        else:
            miss += miss; patches += 1
    return patches

assert min_patches([1, 5, 10], 20) == 2 and min_patches([], 7) == 3
assert min_patches([1, 2, 31, 33], 2147483647) == 28
```

**Complexity:** Time O(len(nums) + log n) · Space O(1)।

**Mistakes / edge cases:**
- `miss` 32-bit-এ overflow (C++/Java-তে `long` লাগে) — PHP/Python-এ সমস্যা নেই, কিন্তু উল্লেখ করো।
- `nums[i] > miss` হলে সেটা দিয়ে `miss` বানানো যায় না — তাই patch।

🎤 **Say this while coding:** "I track the smallest sum I can't build yet. If the next number is not larger than it, I absorb it; otherwise the best patch is that missing value itself, which doubles the reachable range."

🔗 DistroSaaS: "deadline-এর মধ্যে সর্বোচ্চ কাজ" ধরনের scheduling — **[Komol পূরণ করবে: queue job prioritization বা delivery slot ধরনের কাজ থাকলে স্টোরি ID]**।
