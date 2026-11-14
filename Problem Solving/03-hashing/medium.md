# 03 — Hashing / Maps & Sets — Medium

> Part of the Hashing pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Find All Duplicates in an Array — LC 442 ⭐ → *worked below*
- [ ] Top K Frequent Elements — LC 347 → *worked below*
- [ ] Longest Consecutive Sequence — LC 128 → *worked below*
- [ ] Subarray Sum Equals K — LC 560 *(prefix-sum + map)*
- [ ] 4Sum II — LC 454
- [ ] Group Anagrams — LC 49 *(see strings pattern)*
- [ ] Copy List with Random Pointer — LC 138 *(see linked-list pattern)*

**⭐ Priority in this file:** Find Duplicates via Hash Map (LC 217/442 — LC 217 is in `easy.md`).

---

## Worked Solutions

### ⭐ Find All Duplicates in an Array — LC 442  *(count map)*
```php
// return every value that appears exactly twice
function findDuplicates(array $nums): array {
    $count = []; $res = [];
    foreach ($nums as $x) {
        $count[$x] = ($count[$x] ?? 0) + 1;
        if ($count[$x] === 2) $res[] = $x;
    }
    return $res;
}
// findDuplicates([4,3,2,7,8,2,3,1]) -> [2,3] | O(n) / O(n)
```

### Top K Frequent Elements — LC 347  *(count map + sort)*
```php
function topKFrequent(array $nums, int $k): array {
    $count = array_count_values($nums);      // value => freq
    arsort($count);                          // sort by freq desc
    return array_slice(array_keys($count), 0, $k);
}
// topKFrequent([1,1,1,2,2,3], 2) -> [1,2] | O(n log n) / O(n)
// (bucket sort by frequency gets this to O(n) if asked)
```

### Longest Consecutive Sequence — LC 128  *(set, only start from run beginnings)*
```php
function longestConsecutive(array $nums): int {
    $set = array_flip($nums);                // value => true, O(1) lookup
    $best = 0;
    foreach ($set as $x => $_) {
        if (isset($set[$x - 1])) continue;   // not a run start, skip
        $len = 1;
        while (isset($set[$x + $len])) $len++;
        $best = max($best, $len);
    }
    return $best;
}
// longestConsecutive([100,4,200,1,3,2]) -> 4  (1,2,3,4) | O(n) / O(n)
```
