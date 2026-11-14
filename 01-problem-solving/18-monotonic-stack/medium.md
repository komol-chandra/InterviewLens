---
id: ps-monotonic-stack-medium
title: "18 — Monotonic Stack — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, monotonic-stack]
updated: 2026-11-14
---

# 18 — Monotonic Stack — Medium

> **Pattern চেনার সংকেত:** circular → `2n` বার ঘোরো, index `i % n`। stream ("আজ পর্যন্ত টানা কতদিন ≤ আজকের দাম") → stack-এ `(দাম, span)` জমা করো। "সব subarray-এর min-এর যোগফল" → প্রতিটা উপাদানের বাম আর ডান সীমা।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Next Greater Element II (circular) ⭐ | LC 503 | ⬜ | — | — |
| 2 | Online Stock Span | LC 901 | ⬜ | — | — |
| 3 | Sum of Subarray Minimums | LC 907 | ⬜ | — | — |
| 4 | Remove K Digits | LC 402 *(increasing stack, greedy pop)* | ⬜ | — | — |
| 5 | 132 Pattern | LC 456 *(ডান থেকে decreasing stack)* | ⬜ | — | — |

---

## 1. Next Greater Element II  ·  LC 503

**Problem:** circular array — শেষের পর আবার শুরু; প্রতিটার next greater (না থাকলে −1)।
**Example:** `[1,2,1] → [2,-1,2]` · `[1,2,3,4,3] → [2,3,4,-1,4]`

**Pattern:** Monotonic stack, দুইবার ঘোরা — `i` 0 থেকে `2n−1`, মান `nums[i % n]`; শুধু প্রথম ঘোরায় push।

**PHP:**
```php
<?php
function nextGreaterElements(array $nums): array
{
    $n = count($nums);
    $res = array_fill(0, $n, -1);
    $stack = [];
    for ($i = 0; $i < 2 * $n; $i++) {
        $x = $nums[$i % $n];
        while ($stack && $nums[end($stack)] < $x) $res[array_pop($stack)] = $x;
        if ($i < $n) $stack[] = $i;                // second lap only resolves, never pushes
    }
    return $res;
}

assert(nextGreaterElements([1, 2, 1]) === [2, -1, 2]);
assert(nextGreaterElements([1, 2, 3, 4, 3]) === [2, 3, 4, -1, 4]);
assert(nextGreaterElements([5, 5, 5]) === [-1, -1, -1]);
```

**Python:**
```python
def next_greater_elements(nums: list[int]) -> list[int]:
    n = len(nums)
    res, stack = [-1] * n, []
    for i in range(2 * n):
        x = nums[i % n]
        while stack and nums[stack[-1]] < x:
            res[stack.pop()] = x
        if i < n:
            stack.append(i)
    return res

assert next_greater_elements([1, 2, 3, 4, 3]) == [2, 3, 4, -1, 4]
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** array কপি করে দ্বিগুণ বানানো — চলে, কিন্তু `% n` পরিষ্কার।

🎤 **Say this while coding:** "For a circular array I just loop twice using index mod n; the second pass only resolves leftovers from the first."

---

## 2. Online Stock Span  ·  LC 901

**Problem:** প্রতিদিন `next(price)`; আজকের span = আজ সহ পেছনে টানা কতদিন দাম ≤ আজকের দাম।
**Example:** `100,80,60,70,60,75,85 → 1,1,1,2,1,4,6`

**Pattern:** Stack-এ `(price, span)` — ছোট বা সমান দামগুলো pop করে তাদের span যোগ করো (তারা আর কখনো লাগবে না, আজকের দাম তাদের ঢেকে দিয়েছে)।

**PHP:**
```php
<?php
final class StockSpanner
{
    private array $stack = [];     // [price, span], prices strictly decreasing

    public function next(int $price): int
    {
        $span = 1;
        while ($this->stack && end($this->stack)[0] <= $price) {
            $span += array_pop($this->stack)[1];   // absorb the days it covered
        }
        $this->stack[] = [$price, $span];
        return $span;
    }
}

$s = new StockSpanner();
assert(array_map(fn($p) => $s->next($p), [100, 80, 60, 70, 60, 75, 85]) === [1, 1, 1, 2, 1, 4, 6]);
```

**Python:**
```python
class StockSpanner:
    def __init__(self):
        self.stack: list[tuple[int, int]] = []

    def next(self, price: int) -> int:
        span = 1
        while self.stack and self.stack[-1][0] <= price:
            span += self.stack.pop()[1]
        self.stack.append((price, span))
        return span

s = StockSpanner()
assert [s.next(p) for p in (100, 80, 60, 70, 60, 75, 85)] == [1, 1, 1, 2, 1, 4, 6]
```

**Complexity:** amortised O(1) প্রতি `next` · Space O(n)।
**Mistakes:** pop করা দিনের span যোগ না করা — তখন আবার পেছনে স্ক্যান করতে হয়।

🎤 **Say this while coding:** "Any earlier day with a price at most today's is covered by today forever, so I pop it and add its span — each day is popped at most once."

---

## 3. Sum of Subarray Minimums  ·  LC 907

**Problem:** সব contiguous subarray-এর minimum-এর যোগফল, mod 10⁹+7।
**Example:** `[3,1,2,4] → 17`
**Constraints:** `n ≤ 3·10⁴`

**Pattern:** Contribution technique — `arr[i]` কতগুলো subarray-এর min? `left[i]` = বামে কতগুলো (নিজে সহ) পর্যন্ত বাড়ানো যায়, `right[i]` = ডানে। অবদান = `arr[i] · left · right`।

**Approach:**
1. Brute force: সব subarray-এর min — O(n²)।
2. বাম সীমা: previous **strictly smaller**; ডান সীমা: next **smaller-or-equal** — সমান মানের subarray যেন ঠিক একবার গোনা হয়।

**PHP:**
```php
<?php
function sumSubarrayMins(array $arr): int
{
    $MOD = 1_000_000_007;
    $n = count($arr);
    $left = $right = array_fill(0, $n, 0);
    $stack = [];
    for ($i = 0; $i < $n; $i++) {                       // previous strictly smaller
        while ($stack && $arr[end($stack)] >= $arr[$i]) array_pop($stack);
        $left[$i] = $stack ? $i - end($stack) : $i + 1;
        $stack[] = $i;
    }
    $stack = [];
    for ($i = $n - 1; $i >= 0; $i--) {                  // next smaller-or-equal
        while ($stack && $arr[end($stack)] > $arr[$i]) array_pop($stack);
        $right[$i] = $stack ? end($stack) - $i : $n - $i;
        $stack[] = $i;
    }
    $sum = 0;
    for ($i = 0; $i < $n; $i++) $sum = ($sum + $arr[$i] * $left[$i] * $right[$i]) % $MOD;
    return $sum;
}

assert(sumSubarrayMins([3, 1, 2, 4]) === 17);
assert(sumSubarrayMins([11, 81, 94, 43, 3]) === 444);
assert(sumSubarrayMins([2, 2]) === 6);      // [2],[2],[2,2] — duplicates counted once each
```

**Python:**
```python
def sum_subarray_mins(arr: list[int]) -> int:
    n, MOD = len(arr), 10**9 + 7
    left, right, stack = [0] * n, [0] * n, []
    for i in range(n):
        while stack and arr[stack[-1]] >= arr[i]:
            stack.pop()
        left[i] = i - stack[-1] if stack else i + 1
        stack.append(i)
    stack = []
    for i in range(n - 1, -1, -1):
        while stack and arr[stack[-1]] > arr[i]:
            stack.pop()
        right[i] = stack[-1] - i if stack else n - i
        stack.append(i)
    return sum(a * l * r for a, l, r in zip(arr, left, right)) % MOD

assert sum_subarray_mins([3, 1, 2, 4]) == 17 and sum_subarray_mins([2, 2]) == 6
```

**Complexity:** Time O(n) · Space O(n)।
**Mistakes:** দুই দিকেই `<` বা দুই দিকেই `<=` → duplicate-এ দ্বিগুণ বা বাদ।

🎤 **Say this while coding:** "Instead of enumerating subarrays, I ask how many subarrays each element is the minimum of: the distance to the previous smaller times the distance to the next smaller-or-equal. Using strict on one side and non-strict on the other counts ties exactly once."
