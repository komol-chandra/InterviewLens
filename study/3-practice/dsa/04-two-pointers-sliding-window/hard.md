# 04 — Two Pointers & Sliding Window — Hard

> Part of the Two Pointers & Sliding Window pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Trapping Rain Water — LC 42
- [ ] Minimum Window Substring — LC 76
- [ ] Sliding Window Maximum — LC 239 ⭐ → *worked below*

**⭐ Priority in this file:** Sliding Window Maximum (LC 239).

---

## Worked Solutions

### ⭐ Sliding Window Maximum — LC 239  *(monotonic deque)*

Max element of *each* window via a monotonic deque:
```php
function maxSlidingWindow(array $nums, int $k): array {
    $dq = [];   // holds indices, values decreasing front->back
    $res = [];
    for ($i = 0; $i < count($nums); $i++) {
        if (!empty($dq) && $dq[0] <= $i - $k) array_shift($dq);      // drop out-of-window
        while (!empty($dq) && $nums[end($dq)] <= $nums[$i]) array_pop($dq); // drop smaller
        $dq[] = $i;
        if ($i >= $k - 1) $res[] = $nums[$dq[0]];                    // front = window max
    }
    return $res;
}
// maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3) -> [3,3,5,5,6,7] | O(n) / O(k)
```
