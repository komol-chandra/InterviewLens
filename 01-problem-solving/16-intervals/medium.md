---
id: ps-intervals-medium
title: "16 — Intervals — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, intervals]
updated: 2026-11-14
---

# 16 — Intervals — Medium

> **Pattern চেনার সংকেত:** "merge / insert" → start অনুযায়ী sort (insert-এ ইতিমধ্যে sorted, তাই ৩ ভাগ: আগে, overlap, পরে)। "সর্বনিম্ন কয়টা room / platform" → sweep line বা end-এর min-heap।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Merge Intervals ⭐ | LC 56 | ⬜ | — | — |
| 2 | Insert Interval | LC 57 | ⬜ | — | — |
| 3 | Meeting Rooms II ⭐ | LC 253 | ⬜ | — | — |
| 4 | Non-overlapping Intervals | LC 435 *(worked in [11 medium](../11-greedy/medium.md))* | ⬜ | — | — |
| 5 | Interval List Intersections | LC 986 *(two pointers)* | ⬜ | — | — |
| 6 | Minimum Number of Arrows to Burst Balloons | LC 452 *(sort by end)* | ⬜ | — | — |

---

## 1. Merge Intervals  ·  LC 56

**Problem:** overlap করা সব interval merge করো।
**Example:** `[[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]` · `[[1,4],[4,5]] → [[1,5]]`

**Pattern:** Sort by start; result-এর শেষ interval-এর সাথে তুলনা।

**PHP:**
```php
<?php
function merge(array $intervals): array
{
    usort($intervals, fn($a, $b) => $a[0] <=> $b[0]);
    $out = [];
    foreach ($intervals as [$s, $e]) {
        $last = count($out) - 1;
        if ($last >= 0 && $s <= $out[$last][1]) {
            $out[$last][1] = max($out[$last][1], $e);    // extend, never shrink
        } else {
            $out[] = [$s, $e];
        }
    }
    return $out;
}

assert(merge([[1, 3], [2, 6], [8, 10], [15, 18]]) === [[1, 6], [8, 10], [15, 18]]);
assert(merge([[1, 4], [4, 5]]) === [[1, 5]]);
assert(merge([[1, 10], [2, 3], [4, 5]]) === [[1, 10]]);
```

**Python:**
```python
def merge(intervals: list[list[int]]) -> list[list[int]]:
    out: list[list[int]] = []
    for s, e in sorted(intervals):
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)
        else:
            out.append([s, e])
    return out

assert merge([[1, 10], [2, 3], [4, 5]]) == [[1, 10]]
```

**Complexity:** Time O(n log n) · Space O(n)।
**Mistakes:** `max` ছাড়া end বসানো (nested interval ভাঙে)।

🎤 **Say this while coding:** "After sorting by start, each interval either overlaps the last merged one — then I extend its end with a max — or starts a new group."

---

## 2. Insert Interval  ·  LC 57

**Problem:** sorted, non-overlapping list-এ একটা নতুন interval ঢোকাও, দরকারে merge করো।
**Example:** `[[1,3],[6,9]], [2,5] → [[1,5],[6,9]]` · `[[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8] → [[1,2],[3,10],[12,16]]`

**Pattern:** তিন ভাগে এক pass — (১) নতুনটার আগে শেষ হয় যারা, (২) overlap করে যারা (merge করে নতুনটাকে বড় করো), (৩) পরে শুরু হয় যারা।

**PHP:**
```php
<?php
function insert(array $intervals, array $new): array
{
    $res = []; $i = 0; $n = count($intervals);
    while ($i < $n && $intervals[$i][1] < $new[0]) $res[] = $intervals[$i++];       // entirely before
    while ($i < $n && $intervals[$i][0] <= $new[1]) {                               // overlapping
        $new = [min($new[0], $intervals[$i][0]), max($new[1], $intervals[$i][1])];
        $i++;
    }
    $res[] = $new;
    while ($i < $n) $res[] = $intervals[$i++];                                      // entirely after
    return $res;
}

assert(insert([[1, 3], [6, 9]], [2, 5]) === [[1, 5], [6, 9]]);
assert(insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]) === [[1, 2], [3, 10], [12, 16]]);
assert(insert([], [5, 7]) === [[5, 7]]);
assert(insert([[1, 5]], [6, 8]) === [[1, 5], [6, 8]]);
```

**Python:**
```python
def insert(intervals: list[list[int]], new: list[int]) -> list[list[int]]:
    res, i, n = [], 0, len(intervals)
    while i < n and intervals[i][1] < new[0]:
        res.append(intervals[i]); i += 1
    while i < n and intervals[i][0] <= new[1]:
        new = [min(new[0], intervals[i][0]), max(new[1], intervals[i][1])]
        i += 1
    res.append(new)
    res.extend(intervals[i:])
    return res

assert insert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]) == [[1, 2], [3, 10], [12, 16]]
```

**Complexity:** Time O(n) · Space O(n) — আবার sort লাগে না।
**Mistakes:** append করে আবার পুরো merge চালানো (O(n log n), চলে কিন্তু input sorted-এর সুবিধা হারায়)।

🎤 **Say this while coding:** "The list is already sorted, so one pass in three phases does it: copy everything that ends before the new interval, absorb everything that overlaps, then copy the rest."

---

## 3. Meeting Rooms II  ·  LC 253

**Problem:** সব মিটিং চালাতে সর্বনিম্ন কয়টা room (`[start, end)`)?
**Example:** `[[0,30],[5,10],[15,20]] → 2` · `[[7,10],[2,4]] → 1`

**Pattern:** Min-heap of end times — start অনুযায়ী sort; heap-এ চলমান মিটিংগুলোর end; নতুন মিটিং শুরু হওয়ার আগে যেটা শেষ হয়েছে, সেই room খালি (pop)।

**PHP:**
```php
<?php
function minMeetingRooms(array $iv): int
{
    usort($iv, fn($a, $b) => $a[0] <=> $b[0]);
    $ends = new SplMinHeap();
    foreach ($iv as [$s, $e]) {
        if (!$ends->isEmpty() && $ends->top() <= $s) $ends->extract();   // reuse the room that freed up
        $ends->insert($e);
    }
    return count($ends);
}

assert(minMeetingRooms([[0, 30], [5, 10], [15, 20]]) === 2);
assert(minMeetingRooms([[7, 10], [2, 4]]) === 1);
assert(minMeetingRooms([[1, 5], [2, 6], [3, 7], [5, 8]]) === 3);
assert(minMeetingRooms([]) === 0);
```

**Python:**
```python
import heapq

def min_meeting_rooms(iv: list[list[int]]) -> int:
    ends: list[int] = []
    for s, e in sorted(iv):
        if ends and ends[0] <= s:
            heapq.heapreplace(ends, e)    # pop + push in one step
        else:
            heapq.heappush(ends, e)
    return len(ends)

assert min_meeting_rooms([[1, 5], [2, 6], [3, 7], [5, 8]]) == 3
```

**Complexity:** Time O(n log n) · Space O(n)। (Sweep line বিকল্প: [overview](00-pattern-overview.md)-এর `maxConcurrent`।)
**Mistakes:** heap size = উত্তর, কারণ আমরা কখনো দরকারের বেশি room রাখি না; `<=` (শেষ হওয়া মুহূর্তে শুরু হলে room চলে)।

🎤 **Say this while coding:** "I process meetings by start time and keep the end times of rooms in use in a min-heap; if the earliest-ending room is free by now I reuse it, otherwise I open a new one. The heap size is the answer."

🔗 DistroSaaS: একই সময়ে কয়টা delivery van / SR visit চলছে — capacity প্ল্যানিং — **[Komol পূরণ করবে: স্টোরি ID থাকলে]**।
