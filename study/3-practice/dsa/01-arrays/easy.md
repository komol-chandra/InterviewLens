# 01 — Arrays — Easy

> Part of the Arrays pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Two Sum — LC 1 → *worked below*
- [ ] Best Time to Buy and Sell Stock — LC 121 → *worked below*
- [ ] Contains Duplicate — LC 217
- [ ] Move Zeroes — LC 283 → *worked below*
- [ ] Plus One — LC 66
- [ ] Merge Sorted Array — LC 88
- [ ] Remove Duplicates from Sorted Array — LC 26
- [ ] Single Number — LC 136
- [ ] Majority Element — LC 169
- [ ] Find All Numbers Disappeared in an Array — LC 448
- [ ] Intersection of Two Arrays II — LC 350

---

## Worked Solutions

### Two Sum — LC 1  *(hash map)*
```php
function twoSum(array $nums, int $target): array {
    $seen = [];                          // value => index
    foreach ($nums as $i => $x) {
        $need = $target - $x;
        if (isset($seen[$need])) return [$seen[$need], $i];
        $seen[$x] = $i;
    }
    return [];
}
// twoSum([2,7,11,15], 9) -> [0,1]   | Time O(n), Space O(n)
```

### Best Time to Buy and Sell Stock — LC 121  *(running min)*
```php
function maxProfit(array $prices): int {
    $minPrice = PHP_INT_MAX; $best = 0;
    foreach ($prices as $p) {
        $minPrice = min($minPrice, $p);       // cheapest day so far
        $best     = max($best, $p - $minPrice); // sell today?
    }
    return $best;
}
// maxProfit([7,1,5,3,6,4]) -> 5  (buy 1, sell 6) | O(n) / O(1)
```

### Move Zeroes — LC 283  *(in-place write pointer)*
```php
function moveZeroes(array &$nums): void {
    $w = 0;                                   // next slot for a non-zero
    foreach ($nums as $x) if ($x !== 0) $nums[$w++] = $x;
    while ($w < count($nums)) $nums[$w++] = 0; // pad the rest with zeros
}
// [0,1,0,3,12] -> [1,3,12,0,0] | O(n) / O(1)
```
