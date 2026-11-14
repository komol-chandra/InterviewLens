---
id: ps-heap-hard
title: "15 — Heap — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, heap]
updated: 2026-11-14
---

# 15 — Heap — Hard

> **Pattern চেনার সংকেত:** "stream-এর median" → দুই heap, সাইজ balance। "K list-এর প্রত্যেকটা থেকে অন্তত একটা নিয়ে সবচেয়ে ছোট range" → min-heap-এ প্রতিটা list-এর বর্তমান উপাদান + চলমান max।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Find Median from Data Stream ⭐ | LC 295 | ⬜ | — | — |
| 2 | Smallest Range Covering Elements from K Lists | LC 632 | ⬜ | — | — |
| 3 | Merge k Sorted Lists | LC 23 *(worked in [06 hard](../06-linked-list/hard.md))* | ⬜ | — | — |
| 4 | IPO | LC 502 | ⬜ | — | — |
| 5 | Sliding Window Median | LC 480 *(দুই heap + lazy deletion)* | ⬜ | — | — |

---

## 1. Find Median from Data Stream  ·  LC 295

**Problem:** `addNum(x)` আর `findMedian()`; সংখ্যা আসতেই থাকে।
**Example:** add 1, add 2 → 1.5; add 3 → 2.0
**Constraints:** ≤ 5·10⁴ কল।

**Pattern:** দুই heap — `low` (max-heap, ছোট অর্ধেক) আর `high` (min-heap, বড় অর্ধেক)। নিয়ম: `low`-এর সব ≤ `high`-এর সব, আর `size(low) == size(high)` বা এক বেশি।

**Approach:**
1. Brute force: sorted list-এ insert — O(n) প্রতি add।
2. add: আগে `low`-এ দাও, `low`-এর max `high`-এ সরাও (ক্রম ঠিক রাখতে), তারপর `high` বড় হলে তার min `low`-এ ফেরত। median = `low.top` (বিজোড়) বা দুই top-এর গড়।

**PHP:**
```php
<?php
final class MedianFinder
{
    private SplMaxHeap $low;    // smaller half
    private SplMinHeap $high;   // larger half

    public function __construct()
    {
        $this->low = new SplMaxHeap();
        $this->high = new SplMinHeap();
    }

    public function addNum(int $num): void
    {
        $this->low->insert($num);
        $this->high->insert($this->low->extract());          // keep order: low <= high
        if (count($this->high) > count($this->low)) {
            $this->low->insert($this->high->extract());      // keep size: low >= high
        }
    }

    public function findMedian(): float
    {
        if (count($this->low) > count($this->high)) return (float) $this->low->top();
        return ($this->low->top() + $this->high->top()) / 2;
    }
}

$m = new MedianFinder();
$m->addNum(1); $m->addNum(2);
assert($m->findMedian() === 1.5);
$m->addNum(3);
assert($m->findMedian() === 2.0);
$m2 = new MedianFinder();
foreach ([5, 15, 1, 3] as $x) $m2->addNum($x);
assert($m2->findMedian() === 4.0);
```

**Python:**
```python
import heapq

class MedianFinder:
    def __init__(self):
        self.low: list[int] = []    # max-heap via negatives
        self.high: list[int] = []

    def add_num(self, num: int) -> None:
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))
        if len(self.high) > len(self.low):
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def find_median(self) -> float:
        if len(self.low) > len(self.high):
            return float(-self.low[0])
        return (-self.low[0] + self.high[0]) / 2

m = MedianFinder()
for x in (5, 15, 1, 3):
    m.add_num(x)
assert m.find_median() == 4.0
```

**Complexity:** add O(log n), median O(1) · Space O(n)।
**Mistakes:** শুধু size balance করে ক্রম না মেলানো (বড় সংখ্যা `low`-এ থেকে যায়)।
**Follow-up:** সব সংখ্যা 0–100 হলে → 101-টা bucket-এর count array, O(1)।

🎤 **Say this while coding:** "I split the numbers into a max-heap for the lower half and a min-heap for the upper half, always pushing through one heap to the other so both order and sizes stay balanced; the median sits at the tops."

🔗 DistroSaaS: রিপোর্টে median delivery time / median order value — **[Komol পূরণ করবে: percentile/median রিপোর্ট থাকলে স্টোরি ID]**।

---

## 2. Smallest Range Covering Elements from K Lists  ·  LC 632

**Problem:** k-টা sorted list; সবচেয়ে ছোট `[a, b]` যাতে প্রতিটা list-এর অন্তত একটা সংখ্যা থাকে (সমান হলে যার `a` ছোট)।
**Example:** `[[4,10,15,24,26],[0,9,12,20],[5,18,22,30]] → [20,24]`

**Pattern:** K-way merge heap + চলমান max — heap-এ প্রতিটা list থেকে ঠিক একটা উপাদান; range = `[heap.min, curMax]`। min-টা সরিয়ে একই list-এর পরেরটা ঢোকাও (range ছোট করার একমাত্র উপায় min বাড়ানো)।

**PHP:**
```php
<?php
function smallestRange(array $nums): array
{
    $h = new SplMinHeap();                       // [value, listIdx, elemIdx]
    $curMax = PHP_INT_MIN;
    foreach ($nums as $li => $list) {
        $h->insert([$list[0], $li, 0]);
        $curMax = max($curMax, $list[0]);
    }
    $best = [PHP_INT_MIN, PHP_INT_MAX];
    while (true) {
        [$v, $li, $ei] = $h->extract();
        if ($curMax - $v < $best[1] - $best[0]) $best = [$v, $curMax];
        if ($ei + 1 === count($nums[$li])) break;   // this list is exhausted: can't cover anymore
        $next = $nums[$li][$ei + 1];
        $h->insert([$next, $li, $ei + 1]);
        $curMax = max($curMax, $next);
    }
    return $best;
}

assert(smallestRange([[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]) === [20, 24]);
assert(smallestRange([[1, 2, 3], [1, 2, 3], [1, 2, 3]]) === [1, 1]);
```

**Python:**
```python
import heapq

def smallest_range(nums: list[list[int]]) -> list[int]:
    h = [(lst[0], i, 0) for i, lst in enumerate(nums)]
    heapq.heapify(h)
    cur_max = max(lst[0] for lst in nums)
    best = [-10**9, 10**9]
    while True:
        v, i, j = heapq.heappop(h)
        if cur_max - v < best[1] - best[0]:
            best = [v, cur_max]
        if j + 1 == len(nums[i]):
            return best
        nxt = nums[i][j + 1]
        heapq.heappush(h, (nxt, i, j + 1))
        cur_max = max(cur_max, nxt)

assert smallest_range([[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]]) == [20, 24]
```

**Complexity:** Time O(N log k) (N = মোট উপাদান) · Space O(k)।
**Mistakes:** কোনো list শেষ হলেই থামতে হবে; tie-তে `<` (কঠোর) দিলে ছোট `a`-ওয়ালাটা থাকে কারণ সেটা আগে আসে।

🎤 **Say this while coding:** "The heap holds one element from each list, so the current range is heap-min to running-max. The only way to shrink it is to advance the minimum, and I stop as soon as any list runs out."

---

## 3. IPO  ·  LC 502

**Problem:** শুরুর মূলধন `w`; প্রতিটা project-এর `capital[i]` (শুরু করতে লাগে) আর `profits[i]`। সর্বোচ্চ `k` project শেষে সর্বোচ্চ মূলধন?
**Example:** `k=2, w=0, profits=[1,2,3], capital=[0,1,1] → 4`

**Pattern:** দুই heap greedy — capital অনুযায়ী sort (বা min-heap); যা এখন সামর্থ্যের মধ্যে, তাদের profit max-heap-এ; প্রতিবার সবচেয়ে লাভজনকটা নাও।

**PHP:**
```php
<?php
function findMaximizedCapital(int $k, int $w, array $profits, array $capital): int
{
    $projects = array_map(null, $capital, $profits);
    usort($projects, fn($a, $b) => $a[0] <=> $b[0]);
    $avail = new SplMaxHeap();
    $i = 0; $n = count($projects);
    for ($round = 0; $round < $k; $round++) {
        while ($i < $n && $projects[$i][0] <= $w) $avail->insert($projects[$i++][1]);  // unlock affordable
        if ($avail->isEmpty()) break;
        $w += $avail->extract();
    }
    return $w;
}

assert(findMaximizedCapital(2, 0, [1, 2, 3], [0, 1, 1]) === 4);
assert(findMaximizedCapital(3, 0, [1, 2, 3], [0, 1, 2]) === 6);
assert(findMaximizedCapital(1, 0, [1, 2], [1, 1]) === 0);
```

**Python:**
```python
import heapq

def find_maximized_capital(k: int, w: int, profits: list[int], capital: list[int]) -> int:
    projects = sorted(zip(capital, profits))
    avail: list[int] = []
    i = 0
    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(avail, -projects[i][1]); i += 1
        if not avail:
            break
        w -= heapq.heappop(avail)
    return w

assert find_maximized_capital(3, 0, [1, 2, 3], [0, 1, 2]) == 6
```

**Complexity:** Time O(n log n + k log n) · Space O(n)।
**Mistakes:** কোনো project সামর্থ্যে না থাকলে লুপ ভাঙো, নইলে খালি heap থেকে extract।

🎤 **Say this while coding:** "As capital grows, more projects unlock; among the unlocked ones, taking the most profitable first is always best, so I move affordable projects into a max-heap of profits."
