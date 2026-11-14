---
id: ps-arrays-hard
title: "01 — Arrays — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, arrays]
updated: 2026-11-14
---

# 01 — Arrays — Hard

> **Pattern চেনার সংকেত:** "O(n) time, O(1) extra space" শর্ত + মানের রেঞ্জ `1..n` → index-কেই hash হিসেবে ব্যবহার (cyclic sort)। দুই দিক থেকে শর্ত ("বাম আর ডান দুই প্রতিবেশীর চেয়ে বেশি") → দুই pass (left→right, right→left)। দুটো sorted array + log সময় → partition-এর ওপর binary search।
> **লাইভ কোডিং স্ক্রিপ্ট:** clarify → brute force বলো → optimize → code → test (edge cases) — [live-coding-script.md](../live-coding-script.md)।
> প্যাটার্নের ব্যাখ্যা: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | First Missing Positive ⭐ | LC 41 | ⬜ | — | — |
| 2 | Candy | LC 135 | ⬜ | — | — |
| 3 | Median of Two Sorted Arrays | LC 4 | ⬜ | — | — |
| 4 | Count of Smaller Numbers After Self | LC 315 *(merge sort, [08](../08-sorting-searching/))* | ⬜ | — | — |
| 5 | Max Chunks To Make Sorted II | LC 768 *(prefix max vs suffix min)* | ⬜ | — | — |

---

## 1. First Missing Positive  ·  LC 41

**Problem:** একটা unsorted integer array দেওয়া; সবচেয়ে ছোট positive integer বের করো যেটা array-তে নেই। O(n) time, O(1) extra space।
**Example:** `[3,4,-1,1] → 2` · `[1,2,0] → 3` · `[7,8,9] → 1`
**Constraints:** `1 ≤ n ≤ 10⁵`, মান যেকোনো (negative, বড়)।

**Pattern:** Cyclic sort / index-as-hash — কারণ উত্তর সবসময় `1..n+1`-এর মধ্যে, তাই মান `v` কে index `v-1`-এ বসানো যায়।

**Approach:**
1. Brute force: sort করে 1 থেকে খোঁজো O(n log n), বা hash set O(n) space — দুটোই শর্ত ভাঙে।
2. Optimized: প্রতিটা `v` যদি `1..n`-এর মধ্যে হয়, swap করে `nums[v-1]`-এ পাঠাও (যতক্ষণ সঠিক জায়গায় না বসে)। তারপর প্রথম যে index `i`-তে `nums[i] != i+1`, উত্তর `i+1`। সব ঠিক থাকলে `n+1`।

**PHP:**
```php
<?php
function firstMissingPositive(array $nums): int
{
    $n = count($nums);
    for ($i = 0; $i < $n; $i++) {
        // keep swapping until nums[i] is out of range or already at its home
        while ($nums[$i] > 0 && $nums[$i] <= $n && $nums[$nums[$i] - 1] !== $nums[$i]) {
            $j = $nums[$i] - 1;
            [$nums[$i], $nums[$j]] = [$nums[$j], $nums[$i]];
        }
    }
    for ($i = 0; $i < $n; $i++) {
        if ($nums[$i] !== $i + 1) return $i + 1;
    }
    return $n + 1;
}

assert(firstMissingPositive([3, 4, -1, 1]) === 2);
assert(firstMissingPositive([1, 2, 0]) === 3);
assert(firstMissingPositive([7, 8, 9, 11, 12]) === 1);
assert(firstMissingPositive([1, 1]) === 2);
assert(firstMissingPositive([1]) === 2);
```

**Python:**
```python
def first_missing_positive(nums: list[int]) -> int:
    n = len(nums)
    for i in range(n):
        while 0 < nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1

assert first_missing_positive([3, 4, -1, 1]) == 2
assert first_missing_positive([1, 2, 0]) == 3
assert first_missing_positive([7, 8, 9, 11, 12]) == 1
assert first_missing_positive([1, 1]) == 2
```

**Complexity:** Time O(n) · Space O(1) — প্রতিটা swap একটা মানকে চিরতরে সঠিক জায়গায় বসায়, তাই মোট swap ≤ n।

**Mistakes / edge cases:**
- duplicate (`[1,1]`) — `nums[nums[i]-1] !== nums[i]` চেক না থাকলে infinite loop।
- Python-এ `nums[i], nums[nums[i]-1] = ...` লিখলে বাম পাশের index assignment-এর মাঝে বদলে যায় → আলাদা `j` নাও।
- সব `1..n` থাকলে উত্তর `n+1`, ভুলে `n` ফেরত দেওয়া।

🎤 **Say this while coding:** "The answer must be between 1 and n plus 1, so I can use the array itself as a hash table — I place each value v at index v minus 1, then the first slot that doesn't match is the answer."

---

## 2. Candy  ·  LC 135

**Problem:** লাইনে বাচ্চাদের rating দেওয়া। প্রত্যেকে কমপক্ষে ১টা candy পাবে; পাশের কারো চেয়ে rating বেশি হলে তার চেয়ে বেশি candy পাবে। মোট সর্বনিম্ন candy কত?
**Example:** `[1,0,2] → 5` (2,1,2) · `[1,2,2] → 4` (1,2,1)
**Constraints:** `1 ≤ n ≤ 2·10⁴`

**Pattern:** Two-pass greedy — কারণ শর্ত দুই দিকের (বাম প্রতিবেশী আর ডান প্রতিবেশী), আর প্রতিটা দিক আলাদাভাবে এক pass-এ মেটানো যায়।

**Approach:**
1. Brute force: সবাইকে 1 দিয়ে, যতক্ষণ কোনো শর্ত ভাঙে ততক্ষণ ঠিক করতে থাকো — O(n²)।
2. Optimized: `left[i]` = বাম থেকে বাড়তে থাকা streak; `right[i]` = ডান থেকে। উত্তর `Σ max(left[i], right[i])`। দ্বিতীয় array-কে একটা চলমান variable-এ নামানো যায়।

**PHP:**
```php
<?php
function candy(array $ratings): int
{
    $n = count($ratings);
    $c = array_fill(0, $n, 1);
    for ($i = 1; $i < $n; $i++) {               // left neighbour rule
        if ($ratings[$i] > $ratings[$i - 1]) $c[$i] = $c[$i - 1] + 1;
    }
    for ($i = $n - 2; $i >= 0; $i--) {          // right neighbour rule
        if ($ratings[$i] > $ratings[$i + 1]) $c[$i] = max($c[$i], $c[$i + 1] + 1);
    }
    return array_sum($c);
}

assert(candy([1, 0, 2]) === 5);
assert(candy([1, 2, 2]) === 4);
assert(candy([1, 3, 4, 5, 2]) === 11);
assert(candy([5]) === 1);
```

**Python:**
```python
def candy(ratings: list[int]) -> int:
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)

assert candy([1, 0, 2]) == 5
assert candy([1, 2, 2]) == 4
assert candy([1, 3, 4, 5, 2]) == 11
```

**Complexity:** Time O(n) · Space O(n) — দুটো linear pass।

**Mistakes / edge cases:**
- দ্বিতীয় pass-এ `max()` ভুলে `c[i] = c[i+1] + 1` লিখলে বাম-শর্ত ভেঙে যায়।
- সমান rating-এ কোনো শর্ত নেই (`[1,2,2]` → শেষজন 1 পায়)।

🎤 **Say this while coding:** "Each child has two independent constraints, so I satisfy the left one in a forward pass and the right one in a backward pass, taking the max so I don't break the first."

---

## 3. Median of Two Sorted Arrays  ·  LC 4

**Problem:** দুটো sorted array `A` (m) আর `B` (n); দুটো মিলিয়ে median বের করো O(log(min(m,n)))-এ।
**Example:** `[1,3], [2] → 2.0` · `[1,2], [3,4] → 2.5`
**Constraints:** `0 ≤ m, n ≤ 1000`, `m + n ≥ 1`

**Pattern:** Binary search on partition — কারণ "log time + দুটো sorted array"।

**Approach:**
1. Brute force: merge করে মাঝখান নাও — O(m+n)।
2. Optimized: ছোট array `A`-তে cut `i` বাছো, তাহলে `B`-তে cut `j = (m+n+1)/2 − i`। সঠিক cut-এ `A[i-1] ≤ B[j]` আর `B[j-1] ≤ A[i]`। `A[i-1] > B[j]` হলে `i` বাঁয়ে সরাও, নইলে ডানে। শেষে বাম অর্ধেকের max আর ডান অর্ধেকের min থেকে median।

**PHP:**
```php
<?php
function findMedianSortedArrays(array $a, array $b): float
{
    if (count($a) > count($b)) [$a, $b] = [$b, $a];   // binary search the shorter one
    $m = count($a); $n = count($b);
    $half = intdiv($m + $n + 1, 2);
    $lo = 0; $hi = $m;
    while ($lo <= $hi) {
        $i = intdiv($lo + $hi, 2);
        $j = $half - $i;
        $aLeft  = $i > 0  ? $a[$i - 1] : -INF;
        $aRight = $i < $m ? $a[$i]     :  INF;
        $bLeft  = $j > 0  ? $b[$j - 1] : -INF;
        $bRight = $j < $n ? $b[$j]     :  INF;
        if ($aLeft <= $bRight && $bLeft <= $aRight) {
            if (($m + $n) % 2 === 1) return (float) max($aLeft, $bLeft);
            return (max($aLeft, $bLeft) + min($aRight, $bRight)) / 2;
        }
        if ($aLeft > $bRight) $hi = $i - 1; else $lo = $i + 1;
    }
    throw new InvalidArgumentException('inputs not sorted');
}

assert(findMedianSortedArrays([1, 3], [2]) === 2.0);
assert(findMedianSortedArrays([1, 2], [3, 4]) === 2.5);
assert(findMedianSortedArrays([], [1]) === 1.0);
assert(findMedianSortedArrays([1, 2, 3, 4, 5], [6, 7]) === 4.0);
```

**Python:**
```python
def find_median_sorted_arrays(a: list[int], b: list[int]) -> float:
    if len(a) > len(b):
        a, b = b, a
    m, n = len(a), len(b)
    half = (m + n + 1) // 2
    lo, hi = 0, m
    inf = float("inf")
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < m else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < n else inf
        if a_left <= b_right and b_left <= a_right:
            if (m + n) % 2:
                return float(max(a_left, b_left))
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            hi = i - 1
        else:
            lo = i + 1
    raise ValueError("inputs not sorted")

assert find_median_sorted_arrays([1, 3], [2]) == 2.0
assert find_median_sorted_arrays([1, 2], [3, 4]) == 2.5
assert find_median_sorted_arrays([], [1]) == 1.0
```

**Complexity:** Time O(log min(m,n)) · Space O(1) — শুধু ছোট array-এর cut-এ binary search।

**Mistakes / edge cases:**
- বড় array-তে binary search করলে `j` negative হয়ে যায় → সবসময় ছোটটায়।
- একটা array খালি — `±INF` sentinel না দিলে index error।
- odd মোট দৈর্ঘ্যে `half = (m+n+1)/2` নিলে median বাম অর্ধেকের max।

🎤 **Say this while coding:** "Instead of merging, I binary search for a cut in the shorter array so that everything on the left of both cuts is smaller than everything on the right; then the median comes from the four border elements."

🔗 DistroSaaS: সরাসরি মিল নেই — এভাবে বলো: "The two-pass idea in Candy is like reconciling a report from both ends: each pass fixes one constraint without breaking the other."
