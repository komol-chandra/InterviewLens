# 11 — Greedy — Medium

> Part of the Greedy pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Jump Game — LC 55 → *worked below*
- [ ] Jump Game II — LC 45 → *worked below*
- [ ] Best Time to Buy/Sell Stock II — LC 122 *(grab every up-day)*
- [ ] Gas Station — LC 134 → *worked below*
- [ ] Partition Labels — LC 763 *(last-index map, extend window)*
- [ ] Non-overlapping Intervals — LC 435 → *worked below*
- [ ] Minimum Number of Arrows to Burst Balloons — LC 452 *(sort by end)*
- [ ] Task Scheduler — LC 621 *(greedy on most-frequent task + cooldown)*

---

## Worked Solutions

### Jump Game — LC 55  *(running farthest-reachable)*
```php
function canJump(array $nums): bool {
    $reach = 0;
    foreach ($nums as $i => $x) {
        if ($i > $reach) return false;      // stuck before this index
        $reach = max($reach, $i + $x);      // extend the frontier
    }
    return true;
}
// canJump([2,3,1,1,4]) -> true ; [3,2,1,0,4] -> false | O(n) / O(1)
```

### Jump Game II — LC 45  *(fewest jumps, greedy level expansion)*
```php
function jump(array $nums): int {
    $jumps = 0; $curEnd = 0; $farthest = 0;
    for ($i = 0; $i < count($nums) - 1; $i++) {
        $farthest = max($farthest, $i + $nums[$i]);
        if ($i === $curEnd) { $jumps++; $curEnd = $farthest; } // must jump now
    }
    return $jumps;
}
// jump([2,3,1,1,4]) -> 2 | O(n) / O(1)
```

### Gas Station — LC 134  *(if total >= 0, the failing point + 1 is the start)*
```php
function canCompleteCircuit(array $gas, array $cost): int {
    $total = 0; $tank = 0; $start = 0;
    for ($i = 0; $i < count($gas); $i++) {
        $diff = $gas[$i] - $cost[$i];
        $total += $diff; $tank += $diff;
        if ($tank < 0) { $start = $i + 1; $tank = 0; } // can't reach i+1 from current start
    }
    return $total >= 0 ? $start : -1;
}
// canCompleteCircuit([1,2,3,4,5],[3,4,5,1,2]) -> 3 | O(n) / O(1)
```

### Non-overlapping Intervals — LC 435  *(sort by end, count keepers)*
```php
function eraseOverlapIntervals(array $intervals): int {
    usort($intervals, fn ($a, $b) => $a[1] <=> $b[1]);   // earliest finishing first
    $keep = 0; $end = PHP_INT_MIN;
    foreach ($intervals as [$s, $e]) {
        if ($s >= $end) { $keep++; $end = $e; }          // non-overlapping -> keep
    }
    return count($intervals) - $keep;                    // the rest must be removed
}
// eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]) -> 1 | O(n log n) / O(1)
```
