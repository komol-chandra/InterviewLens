---
id: ps-heap-easy
title: "15 — Heap — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, heap]
updated: 2026-11-14
---

# 15 — Heap — Easy

> **Pattern চেনার সংকেত:** "K-তম বড়, আর ডেটা আসতে থাকে" → size-K min-heap। "প্রতিবার সবচেয়ে বড় দুটো নাও" → max-heap।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Kth Largest Element in a Stream ⭐ | LC 703 | ⬜ | — | — |
| 2 | Last Stone Weight | LC 1046 | ⬜ | — | — |
| 3 | Relative Ranks | LC 506 | ⬜ | — | — |
| 4 | Minimum Cost to Connect Sticks | LC 1167 *(দুটো ছোট বারবার জোড়া)* | ⬜ | — | — |

---

## 1. Kth Largest Element in a Stream  ·  LC 703

**Problem:** একটা class: শুরুতে `k` আর কিছু সংখ্যা; প্রতিটা `add(val)` এখন পর্যন্ত সব সংখ্যার k-তম বড়টা ফেরত দেয়।
**Example:** `k=3, [4,5,8,2]`; `add(3)→4, add(5)→5, add(10)→5, add(9)→8, add(4)→8`

**Pattern:** size-K min-heap — root সবসময় k-তম বড়।

**Approach:**
1. Brute force: প্রতিবার sort — O(n log n) প্রতি add।
2. Optimized: heap-এ সর্বোচ্চ k উপাদান; বেশি হলে min ফেলো। add = O(log k)।

**PHP:**
```php
<?php
final class KthLargest
{
    private SplMinHeap $heap;

    public function __construct(private int $k, array $nums)
    {
        $this->heap = new SplMinHeap();
        foreach ($nums as $x) $this->add($x);
    }

    public function add(int $val): int
    {
        $this->heap->insert($val);
        if (count($this->heap) > $this->k) $this->heap->extract();   // keep only k largest
        return $this->heap->top();
    }
}

$kl = new KthLargest(3, [4, 5, 8, 2]);
assert([$kl->add(3), $kl->add(5), $kl->add(10), $kl->add(9), $kl->add(4)] === [4, 5, 5, 8, 8]);
$one = new KthLargest(1, []);
assert($one->add(-3) === -3 && $one->add(-2) === -2);
```

**Python:**
```python
import heapq

class KthLargest:
    def __init__(self, k: int, nums: list[int]):
        self.k, self.h = k, []
        for x in nums:
            self.add(x)

    def add(self, val: int) -> int:
        heapq.heappush(self.h, val)
        if len(self.h) > self.k:
            heapq.heappop(self.h)
        return self.h[0]

kl = KthLargest(3, [4, 5, 8, 2])
assert [kl.add(x) for x in (3, 5, 10, 9, 4)] == [4, 5, 5, 8, 8]
```

**Complexity:** add O(log k) · Space O(k)।
**Mistakes:** শুরুতে উপাদান k-এর কম হতে পারে (`k=1, []`) — LC নিশ্চিত করে add-এর পরে ≥ k থাকবে।

🎤 **Say this while coding:** "I keep only the k largest values in a min-heap, so its root is exactly the k-th largest, and each add costs log k."

---

## 2. Last Stone Weight  ·  LC 1046

**Problem:** প্রতিবার সবচেয়ে ভারী দুটো পাথর ধাক্কা খায়: সমান হলে দুটোই শেষ, নইলে পার্থক্যটা থাকে। শেষ পাথরের ওজন (না থাকলে 0)।
**Example:** `[2,7,4,1,8,1] → 1`

**Pattern:** Max-heap simulation।

**PHP:**
```php
<?php
function lastStoneWeight(array $stones): int
{
    $h = new SplMaxHeap();
    foreach ($stones as $s) $h->insert($s);
    while (count($h) > 1) {
        $y = $h->extract(); $x = $h->extract();
        if ($y !== $x) $h->insert($y - $x);
    }
    return $h->isEmpty() ? 0 : $h->top();
}

assert(lastStoneWeight([2, 7, 4, 1, 8, 1]) === 1);
assert(lastStoneWeight([1]) === 1);
assert(lastStoneWeight([3, 3]) === 0);
```

**Python:**
```python
import heapq

def last_stone_weight(stones: list[int]) -> int:
    h = [-s for s in stones]
    heapq.heapify(h)
    while len(h) > 1:
        y, x = -heapq.heappop(h), -heapq.heappop(h)
        if y != x:
            heapq.heappush(h, -(y - x))
    return -h[0] if h else 0

assert last_stone_weight([2, 7, 4, 1, 8, 1]) == 1 and last_stone_weight([3, 3]) == 0
```

**Complexity:** Time O(n log n) · Space O(n)।
**Mistakes:** Python-এ negative ভুলে যাওয়া; শেষে খালি heap।

🎤 **Say this while coding:** "I repeatedly need the two largest, so a max-heap; in Python I store negatives because heapq is a min-heap."

---

## 3. Relative Ranks  ·  LC 506

**Problem:** score (সব আলাদা); প্রথম তিনজন `"Gold Medal"`, `"Silver Medal"`, `"Bronze Medal"`, বাকিরা নিজের rank সংখ্যা (string)।
**Example:** `[10,3,8,9,4] → ["Gold Medal","5","Bronze Medal","Silver Medal","4"]`

**Pattern:** Max-heap-এ `(score, index)` — একে একে বের করলে rank ক্রমে আসে। (sort-ও চলে; heap দেখায় তুমি "ক্রমে বের করা" ভাবতে পারো।)

**PHP:**
```php
<?php
function findRelativeRanks(array $score): array
{
    $h = new SplMaxHeap();
    foreach ($score as $i => $s) $h->insert([$s, $i]);
    $medals = ['Gold Medal', 'Silver Medal', 'Bronze Medal'];
    $res = []; $rank = 0;
    while (!$h->isEmpty()) {
        [, $i] = $h->extract();
        $res[$i] = $medals[$rank] ?? (string) ($rank + 1);
        $rank++;
    }
    ksort($res);
    return $res;
}

assert(findRelativeRanks([10, 3, 8, 9, 4]) === ['Gold Medal', '5', 'Bronze Medal', 'Silver Medal', '4']);
assert(findRelativeRanks([1]) === ['Gold Medal']);
```

**Python:**
```python
import heapq

def find_relative_ranks(score: list[int]) -> list[str]:
    h = [(-s, i) for i, s in enumerate(score)]
    heapq.heapify(h)
    medals = ["Gold Medal", "Silver Medal", "Bronze Medal"]
    res = [""] * len(score)
    rank = 0
    while h:
        _, i = heapq.heappop(h)
        res[i] = medals[rank] if rank < 3 else str(rank + 1)
        rank += 1
    return res

assert find_relative_ranks([10, 3, 8, 9, 4]) == ["Gold Medal", "5", "Bronze Medal", "Silver Medal", "4"]
```

**Complexity:** Time O(n log n) · Space O(n)।
**Mistakes:** rank সংখ্যা string হিসেবে; original index ধরে রাখা।

🎤 **Say this while coding:** "I pull athletes out of a max-heap in score order and write each rank back to the athlete's original index."
