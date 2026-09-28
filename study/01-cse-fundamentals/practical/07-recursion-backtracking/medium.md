# 07 — Recursion & Backtracking — Medium

> Part of the Recursion & Backtracking pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Power of x^n — LC 50 *(fast exponentiation, halve n)*
- [ ] Subsets — LC 78 → *worked below*
- [ ] Subsets II — LC 90 *(sort, skip duplicate siblings)*
- [ ] Permutations — LC 46 → *worked below*
- [ ] Combination Sum — LC 39 → *worked below*
- [ ] Combination Sum II — LC 40
- [ ] Letter Combinations of a Phone Number — LC 17
- [ ] Generate Parentheses — LC 22 *(track open/close counts)*
- [ ] Word Search — LC 79 *(DFS on grid + visited)*

---

## Worked Solutions

### Subsets — LC 78  *(backtracking, include/exclude)*
```php
function subsets(array $nums): array {
    $out = [];
    $go = function (int $start, array $path) use (&$go, $nums, &$out) {
        $out[] = $path;                        // every node is a valid subset
        for ($i = $start; $i < count($nums); $i++) {
            $path[] = $nums[$i];               // choose
            $go($i + 1, $path);                // recurse on the rest
            array_pop($path);                  // un-choose
        }
    };
    $go(0, []);
    return $out;
}
// subsets([1,2,3]) -> [[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]] | O(n·2^n)
```

### Permutations — LC 46  *(backtracking with a used-set)*
```php
function permute(array $nums): array {
    $out = []; $used = [];
    $go = function (array $path) use (&$go, $nums, &$used, &$out) {
        if (count($path) === count($nums)) { $out[] = $path; return; } // goal
        foreach ($nums as $i => $x) {
            if (!empty($used[$i])) continue;   // skip already-placed
            $used[$i] = true; $path[] = $x;    // choose
            $go($path);
            array_pop($path); $used[$i] = false; // un-choose
        }
    };
    $go([]);
    return $out;
}
// permute([1,2,3]) -> 6 orderings | O(n·n!)
```

### Combination Sum — LC 39  *(reuse allowed, prune when over target)*
```php
function combinationSum(array $cands, int $target): array {
    $out = []; sort($cands);
    $go = function (int $start, int $remain, array $path) use (&$go, $cands, &$out) {
        if ($remain === 0) { $out[] = $path; return; }        // exact hit
        for ($i = $start; $i < count($cands); $i++) {
            if ($cands[$i] > $remain) break;                  // sorted -> prune rest
            $path[] = $cands[$i];
            $go($i, $remain - $cands[$i], $path);             // $i (not $i+1) -> reuse
            array_pop($path);
        }
    };
    $go(0, $target, []);
    return $out;
}
// combinationSum([2,3,6,7], 7) -> [[2,2,3],[7]] | exponential, pruned
```
