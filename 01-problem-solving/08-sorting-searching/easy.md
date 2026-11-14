---
id: ps-sorting-searching-easy
title: "08 — Sorting & Searching — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, sorting-searching]
updated: 2026-11-14
---

# 08 — Sorting & Searching — Easy

> Part of the Sorting & Searching pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

### Sorting (implement)
- [ ] Bubble Sort — GfG
- [ ] Selection Sort — GfG
- [ ] Insertion Sort — GfG → *worked below*

### Binary Search
- [ ] Binary Search — LC 704 → *worked below*
- [ ] First Bad Version — LC 278
- [ ] Search Insert Position — LC 35 → *worked below*
- [ ] Sqrt(x) — LC 69 *(binary search the answer)* → *worked below*

---

## Worked Solutions

### Binary Search — LC 704
```php
function search(array $nums, int $target): int {
    $lo = 0; $hi = count($nums) - 1;
    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] === $target) return $mid;
        $nums[$mid] < $target ? $lo = $mid + 1 : $hi = $mid - 1;
    }
    return -1;
}
// search([-1,0,3,5,9,12], 9) -> 4 | O(log n) / O(1)
```

> **Pattern চেনার সংকেত:** sorted ডেটা + "খোঁজো / কোথায় বসবে" → binary search। "প্রথম যেটা শর্ত মানে" (`false false true true`) → lower-bound টেমপ্লেট। "√x / উত্তরটাই একটা সংখ্যা" → উত্তরের রেঞ্জে binary search ([22](../22-binary-search-on-answer/))।

### Insertion Sort  ·  GfG

**Problem:** array-কে insertion sort দিয়ে sort করো।
**কেন জানা দরকার:** প্রায়-sorted ডেটায় O(n), stable, in-place — ইন্টারভিউতে "কোন sort কখন?" প্রশ্নে আসে। PHP-র `sort()` আর Python-এর Timsort ছোট অংশে insertion sort-ই চালায়।

**PHP:**
```php
<?php
function insertionSort(array $a): array
{
    for ($i = 1; $i < count($a); $i++) {
        $key = $a[$i];
        $j = $i - 1;
        while ($j >= 0 && $a[$j] > $key) {   // shift bigger items right
            $a[$j + 1] = $a[$j];
            $j--;
        }
        $a[$j + 1] = $key;
    }
    return $a;
}

assert(insertionSort([5, 2, 4, 6, 1, 3]) === [1, 2, 3, 4, 5, 6]);
assert(insertionSort([]) === []);
assert(insertionSort([2, 2, 1]) === [1, 2, 2]);
```

**Python:**
```python
def insertion_sort(a: list[int]) -> list[int]:
    a = a[:]
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key
    return a

assert insertion_sort([5, 2, 4, 6, 1, 3]) == [1, 2, 3, 4, 5, 6]
```

**Complexity:** Time O(n²) worst, O(n) প্রায়-sorted · Space O(1) · Stable।

| Sort | Best | Avg | Worst | Space | Stable |
|---|---|---|---|---|---|
| Bubble | n | n² | n² | 1 | ✅ |
| Selection | n² | n² | n² | 1 | ❌ |
| Insertion | n | n² | n² | 1 | ✅ |
| Merge | n log n | n log n | n log n | n | ✅ |
| Quick | n log n | n log n | n² | log n | ❌ |
| Heap | n log n | n log n | n log n | 1 | ❌ |

🎤 **Say this while coding:** "Insertion sort grows a sorted prefix by shifting larger items right; it's linear on nearly sorted input, which is why hybrid sorts use it for small chunks."

### Search Insert Position  ·  LC 35

**Problem:** sorted distinct array-তে `target` থাকলে তার index, না থাকলে যেখানে বসবে।
**Example:** `[1,3,5,6], 5 → 2` · `2 → 1` · `7 → 4`

**Pattern:** Lower bound — প্রথম index যেখানে `nums[i] >= target`।

**PHP:**
```php
<?php
function searchInsert(array $nums, int $target): int
{
    $lo = 0; $hi = count($nums);            // hi = n: answer can be "after the end"
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi, 2);
        if ($nums[$mid] < $target) $lo = $mid + 1;
        else $hi = $mid;
    }
    return $lo;
}

assert(searchInsert([1, 3, 5, 6], 5) === 2);
assert(searchInsert([1, 3, 5, 6], 2) === 1);
assert(searchInsert([1, 3, 5, 6], 7) === 4);
assert(searchInsert([1, 3, 5, 6], 0) === 0);
```

**Python:**
```python
def search_insert(nums: list[int], target: int) -> int:
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

import bisect
assert search_insert([1, 3, 5, 6], 2) == 1 == bisect.bisect_left([1, 3, 5, 6], 2)
```

**Complexity:** Time O(log n) · Space O(1)।
**Mistakes:** `hi = n - 1` নিলে "শেষে বসবে" কেস ধরা পড়ে না। এই `lo < hi` + `hi = mid` টেমপ্লেট মুখস্থ রাখো — সব "প্রথম যেটা…" প্রশ্নে চলে।

🎤 **Say this while coding:** "I'm looking for the first index whose value is at least the target — a lower bound — so I use the half-open template where hi starts at n."

### Sqrt(x)  ·  LC 69

**Problem:** `x`-এর integer square root (নিচের দিকে গোল), built-in ছাড়া।
**Example:** `8 → 2` · `16 → 4`

**Pattern:** Binary search on answer — "সবচেয়ে বড় `m` যার `m² ≤ x`"।

**PHP:**
```php
<?php
function mySqrt(int $x): int
{
    $lo = 0; $hi = $x;
    while ($lo < $hi) {
        $mid = intdiv($lo + $hi + 1, 2);       // upper mid: we search the LAST valid value
        if ($mid <= intdiv($x, $mid)) $lo = $mid;   // mid*mid <= x without overflow
        else $hi = $mid - 1;
    }
    return $lo;
}

assert(mySqrt(8) === 2);
assert(mySqrt(16) === 4);
assert(mySqrt(0) === 0);
assert(mySqrt(1) === 1);
assert(mySqrt(2147395599) === 46339);
```

**Python:**
```python
def my_sqrt(x: int) -> int:
    lo, hi = 0, x
    while lo < hi:
        mid = (lo + hi + 1) // 2
        if mid * mid <= x:
            lo = mid
        else:
            hi = mid - 1
    return lo

assert my_sqrt(8) == 2 and my_sqrt(0) == 0 and my_sqrt(2147395599) == 46339
```

**Complexity:** Time O(log x) · Space O(1)।
**Mistakes:** "শেষ বৈধ মান" খুঁজতে `mid` উপরের দিকে গোল (`+1`), নইলে `lo = mid`-এ infinite loop। `mid*mid` overflow এড়াতে `mid <= x / mid`।

🎤 **Say this while coding:** "I binary search the answer itself: the largest m with m squared at most x. Since I keep lo equal to mid, I round mid up to avoid an infinite loop."
