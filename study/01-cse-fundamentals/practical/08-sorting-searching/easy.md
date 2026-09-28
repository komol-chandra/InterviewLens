# 08 — Sorting & Searching — Easy

> Part of the Sorting & Searching pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

### Sorting (implement)
- [ ] Bubble Sort — GfG
- [ ] Selection Sort — GfG
- [ ] Insertion Sort — GfG

### Binary Search
- [ ] Binary Search — LC 704 → *worked below*
- [ ] First Bad Version — LC 278
- [ ] Search Insert Position — LC 35
- [ ] Sqrt(x) — LC 69 *(binary search the answer)*

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
