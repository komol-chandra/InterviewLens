# 03 — Hashing / Maps & Sets — Easy

> Part of the Hashing pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Two Sum (hash version) — LC 1 *(see arrays pattern)*
- [ ] Contains Duplicate — LC 217 ⭐ → *worked below*
- [ ] Happy Number — LC 202 → *worked below*
- [ ] Word Pattern — LC 290
- [ ] Intersection of Two Arrays — LC 349
- [ ] Jewels and Stones — LC 771
- [ ] Find the Difference — LC 389

**⭐ Priority in this file:** Find Duplicates via Hash Map (LC 217/442 — LC 442 is in `medium.md`).

---

## Worked Solutions

### ⭐ Contains Duplicate — LC 217  *(seen-set)*
```php
// does any value repeat?
function containsDuplicate(array $nums): bool {
    $seen = [];
    foreach ($nums as $x) {
        if (isset($seen[$x])) return true;   // second sighting
        $seen[$x] = true;
    }
    return false;
}
// containsDuplicate([1,2,3,1]) -> true | Time O(n), Space O(n)
```

### Happy Number — LC 202  *(set to detect the cycle)*
```php
function isHappy(int $n): bool {
    $seen = [];
    while ($n !== 1) {
        if (isset($seen[$n])) return false;  // loop -> never reaches 1
        $seen[$n] = true;
        $sum = 0;
        foreach (str_split((string) $n) as $d) $sum += $d * $d;
        $n = $sum;
    }
    return true;
}
// isHappy(19) -> true | Time O(log n) per step, Space O(k)
```
