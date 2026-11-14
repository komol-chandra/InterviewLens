---
id: ps-monotonic-stack-hard
title: "18 — Monotonic Stack — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, monotonic-stack]
updated: 2026-11-14
---

# 18 — Monotonic Stack — Hard

> **Pattern চেনার সংকেত:** "histogram-এ সবচেয়ে বড় আয়তক্ষেত্র" → increasing stack; একটা বার pop হলে তার ডান সীমা = বর্তমান index, বাম সীমা = নতুন top। "0/1 matrix-এ সবচেয়ে বড় 1-এর আয়তক্ষেত্র" → প্রতিটা row-কে histogram বানাও।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Largest Rectangle in Histogram ⭐ | LC 84 | ⬜ | — | — |
| 2 | Maximal Rectangle | LC 85 | ⬜ | — | — |
| 3 | Trapping Rain Water | LC 42 *(two pointers [04 hard](../04-two-pointers-sliding-window/hard.md); stack দিয়েও হয়)* | ⬜ | — | — |
| 4 | Maximum Score of a Good Subarray | LC 1793 | ⬜ | — | — |

---

## 1. Largest Rectangle in Histogram  ·  LC 84

**Problem:** বারের উচ্চতা (প্রস্থ 1); সবচেয়ে বড় আয়তক্ষেত্রের ক্ষেত্রফল।
**Example:** `[2,1,5,6,2,3] → 10` (5 আর 6 মিলিয়ে, উচ্চতা 5 × প্রস্থ 2)
**Constraints:** `n ≤ 10⁵`

**Pattern:** Increasing stack — প্রতিটা বার `h[i]` যতদূর বাম/ডানে ছড়াতে পারে (যতক্ষণ বার ≥ h[i])। বার pop হয় যখন ডানে ছোট বার আসে → ডান সীমা পাওয়া গেল; stack-এ তার নিচেরটা বাম সীমা।

**Approach:**
1. Brute force: প্রতিটা বার থেকে দুই দিকে ছড়াও — O(n²)।
2. শেষে উচ্চতা 0-এর একটা sentinel যোগ করো যাতে সব বার pop হয়। pop হওয়া বার `h`: প্রস্থ = `i − stack.top − 1` (stack খালি হলে `i`)।

**PHP:**
```php
<?php
function largestRectangleArea(array $heights): int
{
    $heights[] = 0;                          // sentinel flushes the stack at the end
    $stack = []; $best = 0;
    foreach ($heights as $i => $h) {
        while ($stack && $heights[end($stack)] > $h) {
            $height = $heights[array_pop($stack)];
            $width = $stack ? $i - end($stack) - 1 : $i;   // between the new top and i
            $best = max($best, $height * $width);
        }
        $stack[] = $i;
    }
    return $best;
}

assert(largestRectangleArea([2, 1, 5, 6, 2, 3]) === 10);
assert(largestRectangleArea([2, 4]) === 4);
assert(largestRectangleArea([1, 1, 1, 1]) === 4);
assert(largestRectangleArea([6, 2, 5, 4, 5, 1, 6]) === 12);
```

**Python:**
```python
def largest_rectangle_area(heights: list[int]) -> int:
    hs = heights + [0]
    stack, best = [], 0
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] > h:
            height = hs[stack.pop()]
            width = i - stack[-1] - 1 if stack else i
            best = max(best, height * width)
        stack.append(i)
    return best

assert largest_rectangle_area([2, 1, 5, 6, 2, 3]) == 10 and largest_rectangle_area([6, 2, 5, 4, 5, 1, 6]) == 12
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** প্রস্থ হিসাবে `i − popped_index` লেখা — বাম সীমা popped index না, **নতুন top**-এর পরে থেকে শুরু; sentinel না দিলে শেষে থাকা increasing বারগুলো কখনো হিসাব হয় না।

🎤 **Say this while coding:** "When a shorter bar arrives, every taller bar on the stack has found its right boundary; its left boundary is the bar below it in the stack, because that's the previous smaller one. A zero sentinel at the end flushes everything."

---

## 2. Maximal Rectangle  ·  LC 85

**Problem:** `'0'`/`'1'` matrix-এ শুধু 1 দিয়ে তৈরি সবচেয়ে বড় আয়তক্ষেত্রের ক্ষেত্রফল।
**Example:** নিচে টেস্টে (উত্তর 6)।
**Constraints:** `R, C ≤ 200`

**Pattern:** প্রতিটা row = histogram — `heights[c]` = এই row পর্যন্ত column `c`-তে টানা কতগুলো 1; তারপর LC 84।

**PHP:**
```php
<?php
function largestRectangleArea(array $heights): int
{
    $heights[] = 0; $stack = []; $best = 0;
    foreach ($heights as $i => $h) {
        while ($stack && $heights[end($stack)] > $h) {
            $height = $heights[array_pop($stack)];
            $best = max($best, $height * ($stack ? $i - end($stack) - 1 : $i));
        }
        $stack[] = $i;
    }
    return $best;
}

function maximalRectangle(array $matrix): int
{
    if (!$matrix) return 0;
    $heights = array_fill(0, count($matrix[0]), 0);
    $best = 0;
    foreach ($matrix as $row) {
        foreach ($row as $c => $cell) $heights[$c] = $cell === '1' ? $heights[$c] + 1 : 0;  // reset on 0
        $best = max($best, largestRectangleArea($heights));
    }
    return $best;
}

$m = array_map('str_split', ['10100', '10111', '11111', '10010']);
assert(maximalRectangle($m) === 6);
assert(maximalRectangle([['0']]) === 0);
assert(maximalRectangle([['1']]) === 1);
```

**Python:**
```python
def largest_rectangle_area(heights):
    hs, stack, best = heights + [0], [], 0
    for i, h in enumerate(hs):
        while stack and hs[stack[-1]] > h:
            height = hs[stack.pop()]
            best = max(best, height * (i - stack[-1] - 1 if stack else i))
        stack.append(i)
    return best

def maximal_rectangle(matrix: list[list[str]]) -> int:
    if not matrix:
        return 0
    heights, best = [0] * len(matrix[0]), 0
    for row in matrix:
        heights = [h + 1 if cell == "1" else 0 for h, cell in zip(heights, row)]
        best = max(best, largest_rectangle_area(heights))
    return best

assert maximal_rectangle([list(r) for r in ["10100", "10111", "11111", "10010"]]) == 6
```

**Complexity:** Time O(R·C) · Space O(C)।
**Mistakes:** 0-তে height রিসেট না করা; input string `'1'`, int না।

🎤 **Say this while coding:** "Each row turns the problem into a histogram: heights count consecutive ones ending at this row, and I run the largest-rectangle-in-histogram routine on every row."
