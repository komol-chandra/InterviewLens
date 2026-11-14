---
id: ps-intervals-hard
title: "16 — Intervals — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, intervals]
updated: 2026-11-14
---

# 16 — Intervals — Hard

> **Pattern চেনার সংকেত:** "সবার একসাথে ফাঁকা সময়" → সব interval এক list-এ, merge, তারপর ফাঁকগুলো। "weighted interval বাছাই, সর্বোচ্চ লাভ" → end অনুযায়ী sort + DP + binary search (আগের compatible job)।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Employee Free Time ⭐ | LC 759 | ⬜ | — | — |
| 2 | Maximum Profit in Job Scheduling ⭐ | LC 1235 | ⬜ | — | — |
| 3 | The Skyline Problem | LC 218 *(sweep + max-heap, lazy delete)* | ⬜ | — | — |
| 4 | Data Stream as Disjoint Intervals | LC 352 | ⬜ | — | — |

---

## 1. Employee Free Time  ·  LC 759

**Problem:** প্রতিটা employee-র sorted, non-overlapping কাজের সময়ের list; **সবার** একসাথে ফাঁকা সময়ের finite interval গুলো দাও।
**Example:** `[[[1,2],[5,6]],[[1,3]],[[4,10]]] → [[3,4]]`
**Constraints:** মোট interval N ≤ 10⁴।

**Pattern:** Flatten + sort + merge-এর ফাঁক — কে কাজ করছে সেটা গুরুত্বপূর্ণ না; যেকোনো একজন ব্যস্ত = "সবার ফাঁকা" না।

**Approach:**
1. সব interval এক list-এ, start অনুযায়ী sort (বা k-way merge heap দিয়ে O(N log k))।
2. চলমান `end`; পরের interval-এর start > end হলে `[end, start]` ফাঁকা; `end = max(end, e)`।

**PHP:**
```php
<?php
function employeeFreeTime(array $schedule): array
{
    $all = array_merge(...$schedule);
    usort($all, fn($a, $b) => $a[0] <=> $b[0]);
    $free = [];
    $end = $all[0][1];
    foreach ($all as [$s, $e]) {
        if ($s > $end) $free[] = [$end, $s];   // a gap nobody covers
        $end = max($end, $e);
    }
    return $free;
}

assert(employeeFreeTime([[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]) === [[3, 4]]);
assert(employeeFreeTime([[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]) === [[5, 6], [7, 9]]);
assert(employeeFreeTime([[[1, 2]], [[2, 3]]]) === []);
```

**Python:**
```python
def employee_free_time(schedule: list[list[list[int]]]) -> list[list[int]]:
    all_iv = sorted(iv for emp in schedule for iv in emp)
    free, end = [], all_iv[0][1]
    for s, e in all_iv:
        if s > end:
            free.append([end, s])
        end = max(end, e)
    return free

assert employee_free_time([[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]) == [[5, 6], [7, 9]]
```

**Complexity:** Time O(N log N) (heap দিয়ে O(N log k)) · Space O(N)।
**Mistakes:** `s > end` (কঠোর) — `[1,2]` আর `[2,3]`-এর মাঝে শূন্য-দৈর্ঘ্যের ফাঁক রাখবে না।

🎤 **Say this while coding:** "Who is busy doesn't matter, only whether anyone is. So I flatten all intervals, sort by start, sweep with a running end, and every gap between the running end and the next start is common free time."

---

## 2. Maximum Profit in Job Scheduling  ·  LC 1235

**Problem:** job-এর `startTime`, `endTime`, `profit`; overlap না করে (একটা শেষের সময়েই আরেকটা শুরু হতে পারে) সর্বোচ্চ মোট profit।
**Example:** `start=[1,2,3,3], end=[3,4,5,6], profit=[50,10,40,70] → 120` (job 1 + job 4)
**Constraints:** `n ≤ 5·10⁴`

**Pattern:** Weighted interval scheduling — end অনুযায়ী sort; `dp[i]` = প্রথম i-টা job থেকে সর্বোচ্চ; job i নিলে আগের শেষ compatible job binary search দিয়ে।

**Approach:**
1. Greedy (end অনুযায়ী) এখানে চলে না — profit আলাদা।
2. `dp[i] = max(dp[i-1], profit[i] + dp[j])`, যেখানে `j` = যতগুলো job-এর `end ≤ start[i]` (upper bound binary search)।

**PHP:**
```php
<?php
function jobScheduling(array $start, array $end, array $profit): int
{
    $jobs = array_map(null, $end, $start, $profit);
    sort($jobs);                                     // by end time
    $n = count($jobs);
    $ends = array_column($jobs, 0);
    $dp = array_fill(0, $n + 1, 0);                  // dp[i] = best using the first i jobs
    for ($i = 1; $i <= $n; $i++) {
        [, $s, $p] = $jobs[$i - 1];
        $lo = 0; $hi = $i - 1;                       // count of jobs (among first i-1) with end <= s
        while ($lo < $hi) {
            $mid = intdiv($lo + $hi, 2);
            if ($ends[$mid] <= $s) $lo = $mid + 1; else $hi = $mid;
        }
        $dp[$i] = max($dp[$i - 1], $p + $dp[$lo]);   // skip job i, or take it after `lo` jobs
    }
    return $dp[$n];
}

assert(jobScheduling([1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]) === 120);
assert(jobScheduling([1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]) === 150);
assert(jobScheduling([1, 1, 1], [2, 3, 4], [5, 6, 4]) === 6);
```

**Python:**
```python
from bisect import bisect_right

def job_scheduling(start: list[int], end: list[int], profit: list[int]) -> int:
    jobs = sorted(zip(end, start, profit))
    ends = [e for e, _, _ in jobs]
    dp = [0] * (len(jobs) + 1)
    for i, (e, s, p) in enumerate(jobs, 1):
        j = bisect_right(ends, s, 0, i - 1)   # jobs finishing by time s
        dp[i] = max(dp[i - 1], p + dp[j])
    return dp[-1]

assert job_scheduling([1, 2, 3, 3], [3, 4, 5, 6], [50, 10, 40, 70]) == 120
assert job_scheduling([1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60]) == 150
```

**Complexity:** Time O(n log n) · Space O(n)।
**Mistakes:** `end ≤ start` চলে (touching), তাই upper bound (`bisect_right`)। binary search শুধু `[0, i-1)` পরিসরে।

🎤 **Say this while coding:** "Greedy fails because profits differ, so it's DP over jobs sorted by end time: either skip job i, or take it plus the best answer among jobs that finish by its start, which I find with binary search."

🔗 DistroSaaS: সীমিত van/slot-এ সর্বোচ্চ মূল্যের delivery বাছাই — একই weighted scheduling — **[Komol পূরণ করবে: থাকলে স্টোরি ID]**; না থাকলে বলো এটা অ্যালগরিদম অনুশীলন।
