---
id: ps-intervals-easy
title: "16 — Intervals — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, intervals]
updated: 2026-11-14
---

# 16 — Intervals — Easy

> **Pattern চেনার সংকেত:** "কোনো দুটো overlap করে কি?" → start অনুযায়ী sort, পাশাপাশি তুলনা। "টানা সংখ্যাগুলো range হিসেবে লেখো" → এক pass-এ run খোঁজা।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Meeting Rooms ⭐ | LC 252 | ⬜ | — | — |
| 2 | Summary Ranges | LC 228 | ⬜ | — | — |
| 3 | Teemo Attacking | LC 495 | ⬜ | — | — |

---

## 1. Meeting Rooms  ·  LC 252

**Problem:** মিটিংয়ের `[start, end)` সময়; একজন মানুষ সবগুলোতে যেতে পারবে কি (কোনো overlap নেই)?
**Example:** `[[0,30],[5,10],[15,20]] → false` · `[[7,10],[2,4]] → true`

**Pattern:** Sort by start → পাশাপাশি জোড়ায় `next.start < prev.end` হলে overlap।

**PHP:**
```php
<?php
function canAttendMeetings(array $iv): bool
{
    usort($iv, fn($a, $b) => $a[0] <=> $b[0]);
    for ($i = 1; $i < count($iv); $i++) {
        if ($iv[$i][0] < $iv[$i - 1][1]) return false;   // starts before previous ends
    }
    return true;
}

assert(canAttendMeetings([[0, 30], [5, 10], [15, 20]]) === false);
assert(canAttendMeetings([[7, 10], [2, 4]]) === true);
assert(canAttendMeetings([[1, 5], [5, 8]]) === true);    // touching is fine for [s, e)
assert(canAttendMeetings([]) === true);
```

**Python:**
```python
def can_attend_meetings(iv: list[list[int]]) -> bool:
    iv = sorted(iv)
    return all(iv[i][0] >= iv[i - 1][1] for i in range(1, len(iv)))

assert not can_attend_meetings([[0, 30], [5, 10], [15, 20]])
assert can_attend_meetings([[1, 5], [5, 8]])
```

**Complexity:** Time O(n log n) · Space O(1) (sort বাদে)।
**Mistakes:** sort না করে সব জোড়া তুলনা O(n²); touching boundary।

🎤 **Say this while coding:** "After sorting by start time, an overlap can only happen between neighbours, so one linear pass is enough."

---

## 2. Summary Ranges  ·  LC 228

**Problem:** sorted unique integer array; টানা অংশগুলো `"a->b"` হিসেবে, একক হলে `"a"`।
**Example:** `[0,1,2,4,5,7] → ["0->2","4->5","7"]`

**Pattern:** এক pass-এ run খোঁজা — `nums[i+1] == nums[i] + 1` যতক্ষণ, run চলছে।

**PHP:**
```php
<?php
function summaryRanges(array $nums): array
{
    $res = []; $n = count($nums); $i = 0;
    while ($i < $n) {
        $start = $nums[$i];
        while ($i + 1 < $n && $nums[$i + 1] === $nums[$i] + 1) $i++;
        $res[] = $start === $nums[$i] ? "$start" : "$start->{$nums[$i]}";
        $i++;
    }
    return $res;
}

assert(summaryRanges([0, 1, 2, 4, 5, 7]) === ['0->2', '4->5', '7']);
assert(summaryRanges([0, 2, 3, 4, 6, 8, 9]) === ['0', '2->4', '6', '8->9']);
assert(summaryRanges([]) === []);
assert(summaryRanges([-3]) === ['-3']);
```

**Python:**
```python
def summary_ranges(nums: list[int]) -> list[str]:
    res, i, n = [], 0, len(nums)
    while i < n:
        start = nums[i]
        while i + 1 < n and nums[i + 1] == nums[i] + 1:
            i += 1
        res.append(str(start) if start == nums[i] else f"{start}->{nums[i]}")
        i += 1
    return res

assert summary_ranges([0, 2, 3, 4, 6, 8, 9]) == ["0", "2->4", "6", "8->9"]
```

**Complexity:** Time O(n) · Space O(1) (output বাদে)।
**Mistakes:** PHP string-এ `"$start->..."` লিখলে `->` property access ধরে নেয় — `{$nums[$i]}` আর `"$start->"` সাবধানে (উপরের কোড যাচাই করা)। নিরাপদ বিকল্প: `$start . '->' . $nums[$i]`।

🎤 **Say this while coding:** "I extend a run while the next number is exactly one more, then emit either a single value or a start-to-end range."

---

## 3. Teemo Attacking  ·  LC 495

**Problem:** আক্রমণের সময় `timeSeries` (sorted), প্রতিটা `duration` সেকেন্ড বিষ দেয়; নতুন আক্রমণ চলমান বিষ রিসেট করে। মোট বিষাক্ত সময়?
**Example:** `[1,4], 2 → 4` · `[1,2], 2 → 3`

**Pattern:** Interval union-এর দৈর্ঘ্য — প্রতিটা আক্রমণ `[t, t+d)`; পরের আক্রমণ আগে এলে overlap বাদ।

**PHP:**
```php
<?php
function findPoisonedDuration(array $timeSeries, int $duration): int
{
    $total = 0;
    for ($i = 0; $i < count($timeSeries); $i++) {
        $next = $timeSeries[$i + 1] ?? PHP_INT_MAX;
        $total += min($duration, $next - $timeSeries[$i]);   // cut short by the next attack
    }
    return $total;
}

assert(findPoisonedDuration([1, 4], 2) === 4);
assert(findPoisonedDuration([1, 2], 2) === 3);
assert(findPoisonedDuration([1, 2, 3, 4, 5], 5) === 9);
```

**Python:**
```python
def find_poisoned_duration(ts: list[int], d: int) -> int:
    return sum(min(d, b - a) for a, b in zip(ts, ts[1:])) + (d if ts else 0)

assert find_poisoned_duration([1, 4], 2) == 4 and find_poisoned_duration([1, 2], 2) == 3
```

**Complexity:** Time O(n) · Space O(1)।
**Mistakes:** শেষ আক্রমণের পুরো `duration` যোগ করা ভুলে যাওয়া।

🎤 **Say this while coding:** "Each attack contributes its full duration unless the next attack comes sooner, so I add the minimum of the duration and the gap."
