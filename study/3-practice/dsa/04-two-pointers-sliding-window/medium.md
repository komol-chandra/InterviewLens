# 04 — Two Pointers & Sliding Window — Medium

> Part of the Two Pointers & Sliding Window pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Max Sum Subarray of Size K — GfG ⭐ → *worked below*
- [ ] Longest Substring Without Repeating Characters — LC 3 → *worked below*
- [ ] Minimum Size Subarray Sum — LC 209 → *worked below*
- [ ] Container With Most Water — LC 11 → *worked below*
- [ ] Fruit Into Baskets — LC 904
- [ ] Permutation in String — LC 567
- [ ] 3Sum — LC 15 *(see arrays pattern)*
- [ ] Sort Colors — LC 75
- [ ] Longest Repeating Character Replacement — LC 424

**⭐ Priority in this file:** Max-sum size-k window (GfG). The other ⭐ item, Sliding Window Maximum (LC 239), is Hard-tier — see `hard.md`.

---

## Worked Solutions

### ⭐ Max-Sum Subarray of Size K — GfG  *(fixed-size window)*
```php
function maxSumWindow(array $a, int $k): int {
    $sum = array_sum(array_slice($a, 0, $k)); // first window
    $best = $sum;
    for ($r = $k; $r < count($a); $r++) {
        $sum += $a[$r] - $a[$r - $k];         // slide by one
        $best = max($best, $sum);
    }
    return $best;
}
// maxSumWindow([2,1,5,1,3,2], 3) -> 9  ([5,1,3]) | O(n) / O(1)
```

### Longest Substring Without Repeating Characters — LC 3  *(variable window)*
```php
function lengthOfLongestSubstring(string $s): int {
    $last = [];                 // char => last index seen
    $l = 0; $best = 0;
    for ($r = 0; $r < strlen($s); $r++) {
        $c = $s[$r];
        if (isset($last[$c]) && $last[$c] >= $l) $l = $last[$c] + 1; // jump past the repeat
        $last[$c] = $r;
        $best = max($best, $r - $l + 1);
    }
    return $best;
}
// lengthOfLongestSubstring("abcabcbb") -> 3 ("abc") | O(n) / O(min(n,alphabet))
```

### Minimum Size Subarray Sum — LC 209  *(shrinking window)*
```php
function minSubArrayLen(int $target, array $nums): int {
    $l = 0; $sum = 0; $best = PHP_INT_MAX;
    for ($r = 0; $r < count($nums); $r++) {
        $sum += $nums[$r];
        while ($sum >= $target) {                 // valid -> try to shrink
            $best = min($best, $r - $l + 1);
            $sum -= $nums[$l++];
        }
    }
    return $best === PHP_INT_MAX ? 0 : $best;
}
// minSubArrayLen(7, [2,3,1,2,4,3]) -> 2  ([4,3]) | O(n) / O(1)
```

### Container With Most Water — LC 11  *(converging, move the shorter wall)*
```php
function maxArea(array $height): int {
    $l = 0; $r = count($height) - 1; $best = 0;
    while ($l < $r) {
        $best = max($best, min($height[$l], $height[$r]) * ($r - $l));
        $height[$l] < $height[$r] ? $l++ : $r--;   // shorter side limits area
    }
    return $best;
}
// maxArea([1,8,6,2,5,4,8,3,7]) -> 49 | O(n) / O(1)
```
