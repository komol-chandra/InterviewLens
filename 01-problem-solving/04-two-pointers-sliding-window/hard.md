---
id: ps-two-pointers-sliding-window-hard
title: "04 — Two Pointers & Sliding Window — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, two-pointers-sliding-window]
updated: 2026-11-14
---

# 04 — Two Pointers & Sliding Window — Hard

> **Pattern চেনার সংকেত:** "প্রতিটা অবস্থানে বাম max আর ডান max-এর min" → দুই দিক থেকে two pointers। "সবচেয়ে ছোট window যেখানে সব X আছে" → variable sliding window + need/have count। "প্রতিটা window-এর max" → monotonic deque।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Trapping Rain Water ⭐ | LC 42 | ⬜ | — | — |
| 2 | Minimum Window Substring ⭐ | LC 76 | ⬜ | — | — |
| 3 | Sliding Window Maximum ⭐ | LC 239 | ⬜ | — | — |
| 4 | Subarrays with K Different Integers | LC 992 *(atMost(K) − atMost(K−1))* | ⬜ | — | — |
| 5 | Minimum Window Subsequence | LC 727 | ⬜ | — | — |

---

## 1. Trapping Rain Water  ·  LC 42

**Problem:** বারের উচ্চতা দেওয়া (প্রস্থ 1); বৃষ্টির পর কত একক পানি জমবে?
**Example:** `[0,1,0,2,1,0,1,3,2,1,2,1] → 6`
**Constraints:** `1 ≤ n ≤ 2·10⁴`, `0 ≤ h ≤ 10⁵`

**Pattern:** Two pointers — কারণ `i`-তে পানি = `min(leftMax, rightMax) − h[i]`, আর যে দিকের max ছোট, সেদিকের উত্তর ইতিমধ্যে নিশ্চিত।

**Approach:**
1. Brute force: প্রতিটা `i`-তে বাম আর ডান max খোঁজো — O(n²)। প্রি-কম্পিউট করা দুই array দিয়ে O(n) time, O(n) space।
2. Optimized: `l=0, r=n-1`, `leftMax, rightMax`। `h[l] < h[r]` হলে বাম দিকের পানি `leftMax − h[l]` নিশ্চিত (ডানে অন্তত `h[r]` উঁচু দেয়াল আছে) → `l++`; নইলে উল্টো।

**PHP:**
```php
<?php
function trap(array $h): int
{
    $l = 0; $r = count($h) - 1;
    $leftMax = $rightMax = 0; $water = 0;
    while ($l < $r) {
        if ($h[$l] < $h[$r]) {
            $leftMax = max($leftMax, $h[$l]);
            $water += $leftMax - $h[$l];   // right side has a wall >= h[r] > h[l]
            $l++;
        } else {
            $rightMax = max($rightMax, $h[$r]);
            $water += $rightMax - $h[$r];
            $r--;
        }
    }
    return $water;
}

assert(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) === 6);
assert(trap([4, 2, 0, 3, 2, 5]) === 9);
assert(trap([1]) === 0);
assert(trap([3, 2, 1]) === 0);
```

**Python:**
```python
def trap(h: list[int]) -> int:
    l, r = 0, len(h) - 1
    left_max = right_max = water = 0
    while l < r:
        if h[l] < h[r]:
            left_max = max(left_max, h[l])
            water += left_max - h[l]
            l += 1
        else:
            right_max = max(right_max, h[r])
            water += right_max - h[r]
            r -= 1
    return water

assert trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]) == 6
assert trap([4, 2, 0, 3, 2, 5]) == 9
```

**Complexity:** Time O(n) · Space O(1)।

**Mistakes / edge cases:**
- `leftMax` update পানি যোগের **আগে** করো, নইলে negative পানি।
- monotonic (শুধু বাড়ে/কমে) input → 0।

🎤 **Say this while coding:** "Water at a position is bounded by the shorter of the tallest walls on each side. Whichever pointer has the smaller height, its answer is already decided, so I move that one inward."

---

## 2. Minimum Window Substring  ·  LC 76

**Problem:** `s`-এর সবচেয়ে ছোট substring যেটায় `t`-এর সব অক্ষর (duplicate সহ) আছে।
**Example:** `s="ADOBECODEBANC", t="ABC" → "BANC"`
**Constraints:** `1 ≤ |s|, |t| ≤ 10⁵`

**Pattern:** Variable sliding window — ডান দিক বাড়িয়ে valid করো, তারপর বাম দিক যতটা পারা যায় ছোট করো।

**Approach:**
1. Brute force: সব substring চেক — O(n² · |Σ|)।
2. Optimized: `need` count map, `missing = |t|`। ডান অক্ষর `need`-এ positive হলে `missing--`; `need[c]--`। `missing == 0` হলে বাম দিক সরাও যতক্ষণ `need[s[l]] < 0` (বাড়তি অক্ষর); উত্তর আপডেট; তারপর বাম অক্ষর ছেড়ে দিয়ে আবার invalid করো।

**PHP:**
```php
<?php
function minWindow(string $s, string $t): string
{
    $need = [];
    foreach (str_split($t) as $c) $need[$c] = ($need[$c] ?? 0) + 1;
    $missing = strlen($t);
    $bestL = 0; $bestLen = PHP_INT_MAX; $l = 0;
    for ($r = 0; $r < strlen($s); $r++) {
        $c = $s[$r];
        if (($need[$c] ?? 0) > 0) $missing--;
        $need[$c] = ($need[$c] ?? 0) - 1;
        if ($missing === 0) {
            while ($need[$s[$l]] < 0) {        // drop surplus chars on the left
                $need[$s[$l]]++;
                $l++;
            }
            if ($r - $l + 1 < $bestLen) { $bestLen = $r - $l + 1; $bestL = $l; }
            $need[$s[$l]]++;                   // give up a required char -> invalid again
            $missing++;
            $l++;
        }
    }
    return $bestLen === PHP_INT_MAX ? '' : substr($s, $bestL, $bestLen);
}

assert(minWindow('ADOBECODEBANC', 'ABC') === 'BANC');
assert(minWindow('a', 'a') === 'a');
assert(minWindow('a', 'aa') === '');
assert(minWindow('aaflslflsldkalskaaa', 'aaa') === 'aaa');
```

**Python:**
```python
from collections import Counter

def min_window(s: str, t: str) -> str:
    need = Counter(t)
    missing = len(t)
    best_l, best_len, l = 0, float("inf"), 0
    for r, c in enumerate(s):
        if need[c] > 0:
            missing -= 1
        need[c] -= 1
        if missing == 0:
            while need[s[l]] < 0:
                need[s[l]] += 1
                l += 1
            if r - l + 1 < best_len:
                best_l, best_len = l, r - l + 1
            need[s[l]] += 1
            missing += 1
            l += 1
    return "" if best_len == float("inf") else s[best_l:best_l + best_len]

assert min_window("ADOBECODEBANC", "ABC") == "BANC"
assert min_window("a", "aa") == ""
```

**Complexity:** Time O(|s| + |t|) · Space O(|Σ|) — প্রতিটা অক্ষর একবার ঢোকে, একবার বেরোয়।

**Mistakes / edge cases:**
- `t`-এ duplicate (`"aa"`) — set দিয়ে করলে ভুল।
- `need`-এ নেই এমন অক্ষর negative-এ যায় — এটা ইচ্ছাকৃত, তাতে বাম দিক সহজে বাদ দেওয়া যায়।
- উত্তর না থাকলে খালি string।

🎤 **Say this while coding:** "I expand the right edge until the window contains everything I need, then shrink from the left while it stays valid, recording the smallest window. Each character enters and leaves once, so it's linear."

---

## 3. Sliding Window Maximum  ·  LC 239

**Problem:** `k`-আকারের প্রতিটা window-এর max।
**Example:** `[1,3,-1,-3,5,3,6,7], k=3 → [3,3,5,5,6,7]`
**Constraints:** `1 ≤ k ≤ n ≤ 10⁵`

**Pattern:** Monotonic deque — deque-এ index রাখো যাদের মান সামনে থেকে পেছনে কমছে; সামনেরটা window max।

**Approach:**
1. Brute force: প্রতিটা window-এ max — O(n·k)। Heap দিয়ে O(n log n)।
2. Optimized: নতুন `i` ঢোকার আগে পেছন থেকে ছোট/সমান মানগুলো ফেলে দাও (তারা আর কখনো max হবে না); সামনে window-এর বাইরে চলে যাওয়া index বাদ।

**PHP:**
```php
<?php
function maxSlidingWindow(array $nums, int $k): array
{
    $dq = new SplDoublyLinkedList();   // indices, values decreasing front -> back
    $res = [];
    foreach ($nums as $i => $x) {
        if (!$dq->isEmpty() && $dq->bottom() <= $i - $k) $dq->shift();        // out of window
        while (!$dq->isEmpty() && $nums[$dq->top()] <= $x) $dq->pop();       // smaller ones are useless
        $dq->push($i);
        if ($i >= $k - 1) $res[] = $nums[$dq->bottom()];
    }
    return $res;
}

assert(maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3) === [3, 3, 5, 5, 6, 7]);
assert(maxSlidingWindow([1], 1) === [1]);
assert(maxSlidingWindow([9, 8, 7, 6], 2) === [9, 8, 7]);
```

> PHP নোট: `SplDoublyLinkedList`-এ `bottom()`/`shift()` = সামনে, `top()`/`pop()` = পেছনে; দুটোই O(1)। সাধারণ array-তে `array_shift` O(n)।

**Python:**
```python
from collections import deque

def max_sliding_window(nums: list[int], k: int) -> list[int]:
    dq: deque[int] = deque()
    res = []
    for i, x in enumerate(nums):
        if dq and dq[0] <= i - k:
            dq.popleft()
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res

assert max_sliding_window([1, 3, -1, -3, 5, 3, 6, 7], 3) == [3, 3, 5, 5, 6, 7]
assert max_sliding_window([9, 8, 7, 6], 2) == [9, 8, 7]
```

**Complexity:** Time O(n) · Space O(k)।

**Mistakes / edge cases:**
- deque-এ **মান** রাখলে বোঝা যায় না কোনটা window-এর বাইরে → index রাখো।
- ফল যোগ শুরু `i >= k-1` থেকে।

🎤 **Say this while coding:** "Any element smaller than a newer one can never be a future maximum, so I pop it. That keeps the deque decreasing and the front is always the window max."

🔗 DistroSaaS: sliding window = rolling metric (যেমন "শেষ ৭ দিনের বিক্রি") — **[Komol পূরণ করবে: rolling/date-range রিপোর্টের স্টোরি ID]**।
