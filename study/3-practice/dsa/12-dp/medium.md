# 12 — Dynamic Programming — Medium

> Part of the DP pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] House Robber — LC 198 → *worked below*
- [ ] House Robber II — LC 213 *(circular: rob [0..n-2] or [1..n-1])*
- [ ] Coin Change — LC 322 ⭐ → *worked below*
- [ ] Coin Change II (count ways) — LC 518 *(loop coins outer, amount inner)*
- [ ] Longest Increasing Subsequence — LC 300 → *worked below*
- [ ] Longest Common Subsequence — LC 1143 → *worked below*
- [ ] Word Break — LC 139 *(dp[i] = can segment prefix i)*
- [ ] Unique Paths — LC 62 → *worked below*
- [ ] Minimum Path Sum — LC 64
- [ ] Decode Ways — LC 91 *(dp like stairs, but validate 1–26)*
- [ ] Partition Equal Subset Sum — LC 416 *(subset-sum knapsack, bool dp)*

**⭐ Priority in this file:** Coin Change min-coins (LC 322), Fibonacci (LC 509, built in the recursion-backtracking pattern).

---

## Worked Solutions

### ⭐ Coin Change (min coins) — LC 322  *(1-D unbounded knapsack)*
```php
function coinChange(array $coins, int $amount): int {
    $dp = array_fill(0, $amount + 1, $amount + 1); // "infinity" sentinel
    $dp[0] = 0;                                     // base: 0 coins make amount 0
    for ($a = 1; $a <= $amount; $a++) {
        foreach ($coins as $c) {
            if ($c <= $a) $dp[$a] = min($dp[$a], $dp[$a - $c] + 1); // take one coin c
        }
    }
    return $dp[$amount] > $amount ? -1 : $dp[$amount]; // untouched -> unreachable
}
// coinChange([1,2,5], 11) -> 3 (5+5+1) ; coinChange([2], 3) -> -1
// Time O(amount·coins), Space O(amount) — DP because greedy fails on odd denominations
```

### House Robber — LC 198  *(take-or-skip 1-D)*
```php
function rob(array $nums): int {
    $prev = 0; $curr = 0;                    // best loot excluding / including handling
    foreach ($nums as $x) {
        $take = $prev + $x;                  // rob this house (skip previous)
        $prev = $curr;                       // slide window
        $curr = max($curr, $take);           // best of skip vs take
    }
    return $curr;
}
// rob([2,7,9,3,1]) -> 12 (2+9+1) | O(n) / O(1)
```

### Longest Increasing Subsequence — LC 300  *(O(n²) DP; O(n log n) patience)*
```php
function lengthOfLIS(array $nums): int {
    $dp = array_fill(0, count($nums), 1);    // dp[i] = LIS ending at i
    $best = 1;
    for ($i = 1; $i < count($nums); $i++) {
        for ($j = 0; $j < $i; $j++) {
            if ($nums[$j] < $nums[$i]) $dp[$i] = max($dp[$i], $dp[$j] + 1);
        }
        $best = max($best, $dp[$i]);
    }
    return $best;
}
// lengthOfLIS([10,9,2,5,3,7,101,18]) -> 4 ([2,3,7,101]) | O(n²) / O(n)
```

### Unique Paths — LC 62  *(grid DP, rolled to one row)*
```php
function uniquePaths(int $m, int $n): int {
    $row = array_fill(0, $n, 1);             // top row: only one way (all right)
    for ($r = 1; $r < $m; $r++)
        for ($c = 1; $c < $n; $c++)
            $row[$c] += $row[$c - 1];         // paths from above + from left
    return $row[$n - 1];
}
// uniquePaths(3, 7) -> 28 | O(m·n) / O(n)
```

### Longest Common Subsequence — LC 1143  *(2-D grid DP)*
```php
function longestCommonSubsequence(string $a, string $b): int {
    $n = strlen($a); $m = strlen($b);
    $dp = array_fill(0, $m + 1, 0);          // rolled: previous row
    for ($i = 1; $i <= $n; $i++) {
        $prevDiag = 0;                       // dp[i-1][j-1]
        for ($j = 1; $j <= $m; $j++) {
            $tmp = $dp[$j];
            $dp[$j] = ($a[$i-1] === $b[$j-1]) ? $prevDiag + 1 : max($dp[$j], $dp[$j-1]);
            $prevDiag = $tmp;
        }
    }
    return $dp[$m];
}
// longestCommonSubsequence("abcde","ace") -> 3 ("ace") | O(n·m) / O(m)
```
