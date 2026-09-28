# 01 — Arrays — Medium

> Part of the Arrays pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Maximum Subarray (Kadane's) — LC 53 → *worked below*
- [ ] Rotate Array — LC 189
- [ ] Product of Array Except Self — LC 238 → *worked below*
- [ ] Maximum Product Subarray — LC 152
- [ ] Find the Duplicate Number — LC 287
- [ ] Subarray Sum Equals K — LC 560
- [ ] 3Sum — LC 15 → *worked below*
- [ ] Container With Most Water — LC 11
- [ ] Sort Colors (Dutch flag) — LC 75
- [ ] Merge Intervals — LC 56
- [ ] Insert Interval — LC 57
- [ ] Next Permutation — LC 31
- [ ] Set Matrix Zeroes — LC 73
- [ ] Spiral Matrix — LC 54

---

## Worked Solutions

### Maximum Subarray (Kadane's) — LC 53  *(running state)*
```php
function maxSubArray(array $nums): int {
    $best = $cur = $nums[0];
    for ($i = 1; $i < count($nums); $i++) {
        $cur  = max($nums[$i], $cur + $nums[$i]); // keep growing or start fresh
        $best = max($best, $cur);
    }
    return $best;
}
// maxSubArray([-2,1,-3,4,-1,2,1,-5,4]) -> 6  (subarray [4,-1,2,1]) | O(n) / O(1)
```

### Product of Array Except Self — LC 238  *(prefix × suffix, no division)*
```php
function productExceptSelf(array $nums): array {
    $n = count($nums); $res = array_fill(0, $n, 1);
    $pre = 1;
    for ($i = 0; $i < $n; $i++) { $res[$i] = $pre; $pre *= $nums[$i]; }  // product of everything left
    $suf = 1;
    for ($i = $n - 1; $i >= 0; $i--) { $res[$i] *= $suf; $suf *= $nums[$i]; } // × everything right
    return $res;
}
// productExceptSelf([1,2,3,4]) -> [24,12,8,6] | O(n) / O(1) extra (output not counted)
```

### 3Sum — LC 15  *(sort + two pointers, skip dupes)*
```php
function threeSum(array $nums): array {
    sort($nums); $n = count($nums); $res = [];
    for ($i = 0; $i < $n - 2; $i++) {
        if ($i > 0 && $nums[$i] === $nums[$i - 1]) continue;   // skip dup anchor
        $l = $i + 1; $r = $n - 1;
        while ($l < $r) {
            $s = $nums[$i] + $nums[$l] + $nums[$r];
            if ($s === 0) {
                $res[] = [$nums[$i], $nums[$l], $nums[$r]];
                while ($l < $r && $nums[$l] === $nums[$l + 1]) $l++; // skip dup
                while ($l < $r && $nums[$r] === $nums[$r - 1]) $r--;
                $l++; $r--;
            } elseif ($s < 0) $l++; else $r--;
        }
    }
    return $res;
}
// threeSum([-1,0,1,2,-1,-4]) -> [[-1,-1,2],[-1,0,1]] | O(n²) / O(1)
```
