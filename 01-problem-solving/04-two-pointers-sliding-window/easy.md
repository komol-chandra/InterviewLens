---
id: ps-two-pointers-sliding-window-easy
title: "04 — Two Pointers & Sliding Window — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, two-pointers-sliding-window]
updated: 2026-11-14
---

# 04 — Two Pointers & Sliding Window — Easy

> Part of the Two Pointers & Sliding Window pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Valid Palindrome — LC 125 *(see strings pattern)*
- [ ] Two Sum II (sorted) — LC 167 → *worked below*
- [ ] Squares of a Sorted Array — LC 977 → *worked below*
- [ ] Remove Element — LC 27
- [ ] Backspace String Compare — LC 844 → *worked below*

---

## Worked Solutions

> **Pattern চেনার সংকেত:** **sorted** array + pair/তুলনা → দুই প্রান্ত থেকে two pointers। "in-place remove/compact" → read/write pointer। "দুইটা string পেছন থেকে তুলনা" → দুই pointer উল্টো দিকে।

### 1. Two Sum II — Input Array Is Sorted  ·  LC 167

**Problem:** sorted array-তে দুটো সংখ্যা যাদের যোগফল `target`; 1-indexed index দাও (ঠিক একটা উত্তর)।
**Example:** `[2,7,11,15], 9 → [1,2]`

**Pattern:** Two pointers দুই প্রান্ত থেকে — যোগফল ছোট হলে বাম সরাও (বড় হবে), বড় হলে ডান সরাও।

**PHP:**
```php
<?php
function twoSumSorted(array $nums, int $target): array
{
    $l = 0; $r = count($nums) - 1;
    while ($l < $r) {
        $sum = $nums[$l] + $nums[$r];
        if ($sum === $target) return [$l + 1, $r + 1];
        if ($sum < $target) $l++; else $r--;
    }
    return [];
}

assert(twoSumSorted([2, 7, 11, 15], 9) === [1, 2]);
assert(twoSumSorted([2, 3, 4], 6) === [1, 3]);
assert(twoSumSorted([-1, 0], -1) === [1, 2]);
```

**Python:**
```python
def two_sum_sorted(nums: list[int], target: int) -> list[int]:
    l, r = 0, len(nums) - 1
    while l < r:
        s = nums[l] + nums[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []

assert two_sum_sorted([2, 7, 11, 15], 9) == [1, 2]
```

**Complexity:** Time O(n) · Space O(1) — hash map লাগে না কারণ sorted।
**Mistakes:** 1-indexed উত্তর; `l < r` (`<=` না, একই উপাদান দুবার নেওয়া যায় না)।

🎤 **Say this while coding:** "Since the array is sorted, if the sum is too small the only way to grow it is moving the left pointer right, so I don't need extra memory."

### 2. Squares of a Sorted Array  ·  LC 977

**Problem:** sorted array (negative থাকতে পারে); প্রতিটার বর্গ, sorted ক্রমে।
**Example:** `[-4,-1,0,3,10] → [0,1,9,16,100]`

**Pattern:** দুই প্রান্ত থেকে two pointers — সবচেয়ে বড় বর্গ সবসময় কোনো এক প্রান্তে, তাই result পেছন থেকে ভরো।

**PHP:**
```php
<?php
function sortedSquares(array $nums): array
{
    $n = count($nums);
    $res = array_fill(0, $n, 0);
    $l = 0; $r = $n - 1;
    for ($k = $n - 1; $k >= 0; $k--) {         // fill from the largest end
        if (abs($nums[$l]) > abs($nums[$r])) { $res[$k] = $nums[$l] ** 2; $l++; }
        else { $res[$k] = $nums[$r] ** 2; $r--; }
    }
    return $res;
}

assert(sortedSquares([-4, -1, 0, 3, 10]) === [0, 1, 9, 16, 100]);
assert(sortedSquares([-7, -3, 2, 3, 11]) === [4, 9, 9, 49, 121]);
assert(sortedSquares([-2]) === [4]);
```

**Python:**
```python
def sorted_squares(nums: list[int]) -> list[int]:
    n = len(nums)
    res = [0] * n
    l, r = 0, n - 1
    for k in range(n - 1, -1, -1):
        if abs(nums[l]) > abs(nums[r]):
            res[k] = nums[l] ** 2; l += 1
        else:
            res[k] = nums[r] ** 2; r -= 1
    return res

assert sorted_squares([-4, -1, 0, 3, 10]) == [0, 1, 9, 16, 100]
```

**Complexity:** Time O(n) · Space O(n) output — বর্গ করে sort করলে O(n log n)।
**Mistakes:** সামনে থেকে ভরতে গেলে সবচেয়ে ছোট বর্গ কোথায় জানা নেই (মাঝখানে)।

🎤 **Say this while coding:** "The largest square is always at one of the two ends, so I fill the result from the back."

### 3. Backspace String Compare  ·  LC 844

**Problem:** `#` মানে backspace; দুটো string টাইপ করার পর সমান কি না। Follow-up: O(1) space।
**Example:** `"ab#c", "ad#c" → true` · `"a#c", "b" → false`

**Pattern:** দুই pointer পেছন থেকে — `#` গুনে skip করো, তারপর অক্ষর তুলনা।

**PHP:**
```php
<?php
function backspaceCompare(string $s, string $t): bool
{
    $i = strlen($s) - 1; $j = strlen($t) - 1;
    while ($i >= 0 || $j >= 0) {
        $i = nextValid($s, $i);
        $j = nextValid($t, $j);
        if ($i < 0 || $j < 0) return $i < 0 && $j < 0;
        if ($s[$i] !== $t[$j]) return false;
        $i--; $j--;
    }
    return true;
}

function nextValid(string $s, int $i): int
{
    $skip = 0;
    while ($i >= 0) {
        if ($s[$i] === '#') { $skip++; $i--; }
        elseif ($skip > 0) { $skip--; $i--; }
        else break;
    }
    return $i;
}

assert(backspaceCompare('ab#c', 'ad#c') === true);
assert(backspaceCompare('ab##', 'c#d#') === true);
assert(backspaceCompare('a#c', 'b') === false);
assert(backspaceCompare('a##c', '#a#c') === true);
```

**Python:**
```python
def backspace_compare(s: str, t: str) -> bool:
    def next_valid(x: str, i: int) -> int:
        skip = 0
        while i >= 0:
            if x[i] == "#":
                skip += 1; i -= 1
            elif skip:
                skip -= 1; i -= 1
            else:
                break
        return i

    i, j = len(s) - 1, len(t) - 1
    while i >= 0 or j >= 0:
        i, j = next_valid(s, i), next_valid(t, j)
        if i < 0 or j < 0:
            return i < 0 and j < 0
        if s[i] != t[j]:
            return False
        i -= 1; j -= 1
    return True

assert backspace_compare("ab#c", "ad#c")
assert not backspace_compare("a#c", "b")
```

**Complexity:** Time O(n + m) · Space O(1)। (stack দিয়ে সহজ সমাধান O(n) space — প্রথমে সেটা বলো।)
**Mistakes:** খালি string-এ `#` (`"#a"`) — skip কিছু মোছে না।

🎤 **Say this while coding:** "A backspace only affects characters before it, so scanning from the end lets me skip deleted characters without building new strings."
