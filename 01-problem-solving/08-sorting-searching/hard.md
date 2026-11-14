---
id: ps-sorting-searching-hard
title: "08 — Sorting & Searching — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, sorting-searching]
updated: 2026-11-14
---

# 08 — Sorting & Searching — Hard

> **Pattern চেনার সংকেত:** "প্রতিটার ডানে কতগুলো ছোট" / "inversion গোনা" → merge sort-এর merge ধাপে গোনা। rotated + **duplicate** → binary search, কিন্তু `nums[mid] == nums[hi]` হলে শুধু `hi--`। "K-th smallest pair/distance/fraction" → উত্তরের মানের ওপর binary search + গোনা ([22](../22-binary-search-on-answer/))।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Count of Smaller Numbers After Self ⭐ | LC 315 | ⬜ | — | — |
| 2 | Find Minimum in Rotated Sorted Array II | LC 154 | ⬜ | — | — |
| 3 | Find K-th Smallest Pair Distance | LC 719 | ⬜ | — | — |
| 4 | Median of Two Sorted Arrays | LC 4 *(worked in [01 hard](../01-arrays/hard.md))* | ⬜ | — | — |
| 5 | Reverse Pairs | LC 493 *(315-এর মতো merge sort-এ গোনা)* | ⬜ | — | — |

---

## 1. Count of Smaller Numbers After Self  ·  LC 315

**Problem:** প্রতিটা `nums[i]`-এর ডান পাশে কতগুলো উপাদান তার চেয়ে ছোট?
**Example:** `[5,2,6,1] → [2,1,1,0]`
**Constraints:** `1 ≤ n ≤ 10⁵`

**Pattern:** Merge sort + গোনা — merge-এর সময় যখন বাম অর্ধেকের একটা উপাদান নামে, তখন ডান অর্ধেক থেকে ইতিমধ্যে যতগুলো নেমেছে (সবই তার চেয়ে ছোট আর আসলে তার ডানে ছিল) সেটা যোগ করো।

**Approach:**
1. Brute force: প্রতিটার জন্য ডানে স্ক্যান — O(n²)।
2. Optimized: `(value, originalIndex)` জোড়া merge sort করো। merge-এ `rightTaken` কাউন্টার; বাম থেকে নামার সময় `count[idx] += rightTaken`। (বিকল্প: Fenwick tree / BIT, coordinate compression সহ।)

**PHP:**
```php
<?php
function countSmaller(array $nums): array
{
    $n = count($nums);
    $counts = array_fill(0, $n, 0);
    $items = [];
    foreach ($nums as $i => $v) $items[] = [$v, $i];

    $sort = function (array $a) use (&$sort, &$counts): array {
        $len = count($a);
        if ($len <= 1) return $a;
        $mid = intdiv($len, 2);
        $left = $sort(array_slice($a, 0, $mid));
        $right = $sort(array_slice($a, $mid));
        $out = []; $i = $j = 0; $rightTaken = 0;
        while ($i < count($left) || $j < count($right)) {
            if ($j === count($right) || ($i < count($left) && $left[$i][0] <= $right[$j][0])) {
                $counts[$left[$i][1]] += $rightTaken;   // all taken right items are smaller
                $out[] = $left[$i++];
            } else {
                $rightTaken++;
                $out[] = $right[$j++];
            }
        }
        return $out;
    };
    $sort($items);
    return $counts;
}

assert(countSmaller([5, 2, 6, 1]) === [2, 1, 1, 0]);
assert(countSmaller([-1]) === [0]);
assert(countSmaller([-1, -1]) === [0, 0]);
assert(countSmaller([3, 2, 2, 6, 1]) === [3, 1, 1, 1, 0]);
```

**Python:**
```python
def count_smaller(nums: list[int]) -> list[int]:
    counts = [0] * len(nums)

    def sort(a: list[tuple[int, int]]) -> list[tuple[int, int]]:
        if len(a) <= 1:
            return a
        mid = len(a) // 2
        left, right = sort(a[:mid]), sort(a[mid:])
        out, i, j, taken = [], 0, 0, 0
        while i < len(left) or j < len(right):
            if j == len(right) or (i < len(left) and left[i][0] <= right[j][0]):
                counts[left[i][1]] += taken
                out.append(left[i]); i += 1
            else:
                taken += 1
                out.append(right[j]); j += 1
        return out

    sort([(v, i) for i, v in enumerate(nums)])
    return counts

assert count_smaller([5, 2, 6, 1]) == [2, 1, 1, 0]
assert count_smaller([3, 2, 2, 6, 1]) == [3, 1, 1, 1, 0]
```

**Complexity:** Time O(n log n) · Space O(n)।

**Mistakes / edge cases:**
- সমান মানে `<=` দিয়ে বামটা আগে নামাও — নইলে সমান মানকে "ছোট" গুনে ফেলবে।
- sort-এর পর index হারিয়ে যায় → `(value, index)` জোড়া।

🎤 **Say this while coding:** "During the merge, when an element from the left half is placed, every element already taken from the right half was both smaller and originally to its right — so I add that running count."

---

## 2. Find Minimum in Rotated Sorted Array II  ·  LC 154

**Problem:** ascending sorted array কোথাও rotate করা, **duplicate থাকতে পারে**; minimum দাও।
**Example:** `[2,2,2,0,1] → 0` · `[1,3,5] → 1`
**Constraints:** `1 ≤ n ≤ 5000`

**Pattern:** Binary search `mid` বনাম `hi` তুলনায় — duplicate হলে কোন অর্ধেক বাদ দেবে বোঝা যায় না, তখন শুধু `hi` এক ধাপ কমাও।

**Approach:**
1. `nums[mid] > nums[hi]` → min ডান অর্ধেকে: `lo = mid + 1`।
2. `nums[mid] < nums[hi]` → min `mid` বা তার বামে: `hi = mid`।
3. সমান → `hi--` (`nums[hi]` বাদ দিলে min হারায় না, কারণ `nums[mid]` একই মান রাখে)।

**PHP:**
```php
<?php
function findMin(array $nums): int
{
    $lo = 0; $hi = count($nums) - 1;
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($nums[$mid] > $nums[$hi]) $lo = $mid + 1;
        elseif ($nums[$mid] < $nums[$hi]) $hi = $mid;
        else $hi--;                             // can't tell which side: shrink safely
    }
    return $nums[$lo];
}

assert(findMin([2, 2, 2, 0, 1]) === 0);
assert(findMin([1, 3, 5]) === 1);
assert(findMin([3, 1, 3]) === 1);
assert(findMin([10, 1, 10, 10, 10]) === 1);
assert(findMin([1]) === 1);
```

**Python:**
```python
def find_min(nums: list[int]) -> int:
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        elif nums[mid] < nums[hi]:
            hi = mid
        else:
            hi -= 1
    return nums[lo]

assert find_min([2, 2, 2, 0, 1]) == 0 and find_min([10, 1, 10, 10, 10]) == 1
```

**Complexity:** Time O(log n) গড়, worst O(n) (সব সমান) · Space O(1)।

**Mistakes / edge cases:**
- `nums[lo]`-এর সাথে তুলনা করলে rotate-না-করা array-তে ভুল দিকে যায় — `hi`-এর সাথে তুলনা নিরাপদ।
- worst case O(n) — ইন্টারভিউয়ার জিজ্ঞেস করবে; বলো duplicate থাকলে এর চেয়ে ভালো সম্ভব না (`[1,1,1,0,1,1]`)।

🎤 **Say this while coding:** "Comparing mid with hi tells me which half is unsorted; when they are equal I can't decide, but dropping hi is safe because mid still holds the same value — that makes the worst case linear."

---

## 3. Find K-th Smallest Pair Distance  ·  LC 719

**Problem:** সব জোড়া `(i<j)`-এর `|nums[i] − nums[j]|`-এর মধ্যে k-তম ছোটটা।
**Example:** `[1,3,1], k=1 → 0` · `[1,6,1], k=3 → 5`
**Constraints:** `2 ≤ n ≤ 10⁴`, `0 ≤ nums[i] ≤ 10⁶`

**Pattern:** Sort + **binary search on answer** + two pointers দিয়ে গোনা — n² জোড়া বানানো অসম্ভব, কিন্তু "দূরত্ব ≤ d এমন জোড়া কয়টা?" O(n)-এ গোনা যায়।

**Approach:**
1. Brute force: সব জোড়ার দূরত্ব বানিয়ে sort — O(n² log n), memory 10⁸।
2. Optimized: sort। `lo=0, hi=max−min`। `count(d)`: sliding `left` pointer, প্রতিটা `right`-এর জন্য `right − left` জোড়া। সবচেয়ে ছোট `d` যেখানে `count(d) ≥ k`।

**PHP:**
```php
<?php
function smallestDistancePair(array $nums, int $k): int
{
    sort($nums);
    $n = count($nums);
    $countAtMost = function (int $d) use ($nums, $n): int {
        $count = 0; $left = 0;
        for ($right = 0; $right < $n; $right++) {
            while ($nums[$right] - $nums[$left] > $d) $left++;
            $count += $right - $left;          // pairs (left..right-1, right)
        }
        return $count;
    };
    $lo = 0; $hi = $nums[$n - 1] - $nums[0];
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($countAtMost($mid) >= $k) $hi = $mid; else $lo = $mid + 1;
    }
    return $lo;
}

assert(smallestDistancePair([1, 3, 1], 1) === 0);
assert(smallestDistancePair([1, 1, 1], 2) === 0);
assert(smallestDistancePair([1, 6, 1], 3) === 5);
assert(smallestDistancePair([9, 10, 7, 10, 6, 1, 5, 4, 9, 8], 18) === 2);
```

**Python:**
```python
def smallest_distance_pair(nums: list[int], k: int) -> int:
    nums = sorted(nums)
    n = len(nums)

    def count_at_most(d: int) -> int:
        count = left = 0
        for right in range(n):
            while nums[right] - nums[left] > d:
                left += 1
            count += right - left
        return count

    lo, hi = 0, nums[-1] - nums[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if count_at_most(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo

assert smallest_distance_pair([1, 6, 1], 3) == 5
assert smallest_distance_pair([9, 10, 7, 10, 6, 1, 5, 4, 9, 8], 18) == 2
```

**Complexity:** Time O(n log n + n log W) (W = max−min) · Space O(1) (sort বাদে)।

**Mistakes / edge cases:**
- "k-তম" — `count ≥ k` হলে উত্তর ≤ mid, তাই `hi = mid` (lower-bound টেমপ্লেট)।
- `left` প্রতিটা `right`-এর জন্য রিসেট করলে O(n²)।

🎤 **Say this while coding:** "I can't list n squared pairs, but I can count pairs with distance at most d in linear time using two pointers on the sorted array, so I binary search the smallest d whose count reaches k."

🔗 DistroSaaS: "রিপোর্টে rank/position বের করা" — **[Komol পূরণ করবে: ranking/percentile ধরনের রিপোর্ট থাকলে স্টোরি ID]**; নইলে বলো এটা অ্যালগরিদম অনুশীলন।
