# 08 — Sorting & Searching — Medium

> Part of the Sorting & Searching pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

### Sorting (implement + apply)
- [ ] Merge Sort — GfG / LC 912 ⭐ → *worked below*
- [ ] Quick Sort — GfG → *worked below*
- [ ] Sort an Array — LC 912
- [ ] Kth Largest Element — LC 215 → *worked below*
- [ ] Sort Characters By Frequency — LC 451

### Binary Search
- [ ] Search in Rotated Sorted Array — LC 33 → *worked below*
- [ ] Find First and Last Position — LC 34 *(two biased binary searches)*
- [ ] Find Peak Element — LC 162
- [ ] Search a 2D Matrix — LC 74
- [ ] Koko Eating Bananas — LC 875 → *worked below*
- [ ] Find Minimum in Rotated Sorted Array — LC 153

**⭐ Priority in this file:** Merge Sort (GfG / LC 912).

---

## Worked Solutions

### ⭐ Merge Sort (implement) — GfG / LC 912  *(divide & conquer)*
```php
function mergeSort(array $a): array {
    if (count($a) <= 1) return $a;                    // base case
    $mid   = intdiv(count($a), 2);
    $left  = mergeSort(array_slice($a, 0, $mid));     // sort each half
    $right = mergeSort(array_slice($a, $mid));
    return merge($left, $right);                      // combine
}
function merge(array $l, array $r): array {
    $out = []; $i = $j = 0;
    while ($i < count($l) && $j < count($r)) {
        $l[$i] <= $r[$j] ? $out[] = $l[$i++] : $out[] = $r[$j++]; // <= keeps it stable
    }
    while ($i < count($l)) $out[] = $l[$i++];         // drain leftovers
    while ($j < count($r)) $out[] = $r[$j++];
    return $out;
}
// mergeSort([5,2,4,1,3]) -> [1,2,3,4,5] | Time O(n log n) always, Space O(n)
```

### Quick Sort — GfG  *(partition around a pivot, in place)*
```php
function quickSort(array &$a, int $lo, int $hi): void {
    if ($lo >= $hi) return;
    $p = partition($a, $lo, $hi);      // pivot lands at final position
    quickSort($a, $lo, $p - 1);
    quickSort($a, $p + 1, $hi);
}
function partition(array &$a, int $lo, int $hi): int {
    $pivot = $a[$hi]; $i = $lo;                    // last element as pivot
    for ($j = $lo; $j < $hi; $j++) {
        if ($a[$j] < $pivot) { [$a[$i], $a[$j]] = [$a[$j], $a[$i]]; $i++; }
    }
    [$a[$i], $a[$hi]] = [$a[$hi], $a[$i]];         // put pivot in place
    return $i;
}
// avg O(n log n), worst O(n²) on already-sorted; randomize pivot to avoid it | O(log n) stack
```

### Kth Largest Element — LC 215  *(quickselect, average O(n))*
```php
function findKthLargest(array $nums, int $k): int {
    $target = count($nums) - $k;                  // kth largest = index n-k when sorted
    $lo = 0; $hi = count($nums) - 1;
    while (true) {
        $p = partition($nums, $lo, $hi);          // reuse partition() above
        if ($p === $target) return $nums[$p];
        $p < $target ? $lo = $p + 1 : $hi = $p - 1; // recurse into one side only
    }
}
// findKthLargest([3,2,1,5,6,4], 2) -> 5 | avg O(n), worst O(n²)
```

### Search in Rotated Sorted Array — LC 33  *(binary search, one half is sorted)*
```php
function searchRotated(array $nums, int $target): int {
    $lo = 0; $hi = count($nums) - 1;
    while ($lo <= $hi) {
        $mid = $lo + intdiv($hi - $lo, 2);
        if ($nums[$mid] === $target) return $mid;
        if ($nums[$lo] <= $nums[$mid]) {                       // left half sorted
            ($nums[$lo] <= $target && $target < $nums[$mid]) ? $hi = $mid - 1 : $lo = $mid + 1;
        } else {                                               // right half sorted
            ($nums[$mid] < $target && $target <= $nums[$hi]) ? $lo = $mid + 1 : $hi = $mid - 1;
        }
    }
    return -1;
}
// searchRotated([4,5,6,7,0,1,2], 0) -> 4 | O(log n) / O(1)
```

### Koko Eating Bananas — LC 875  *(binary search the answer)*
```php
function minEatingSpeed(array $piles, int $h): int {
    $lo = 1; $hi = max($piles);                    // speed range [1 .. maxPile]
    while ($lo < $hi) {
        $speed = $lo + intdiv($hi - $lo, 2);
        $hours = 0;
        foreach ($piles as $p) $hours += intval(ceil($p / $speed));
        $hours <= $h ? $hi = $speed : $lo = $speed + 1; // feasible -> try slower
    }
    return $lo;                                    // smallest feasible speed
}
// minEatingSpeed([3,6,7,11], 8) -> 4 | O(n log maxPile) / O(1)
```
