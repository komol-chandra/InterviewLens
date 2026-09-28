# 11 — Greedy — Easy

> Part of the Greedy pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Coin Change (greedy variant) — GfG ⭐ → *worked below (+ DP fallback in the dp pattern)*
- [ ] Assign Cookies — LC 455 *(sort both, two pointers)*

**⭐ Priority in this file:** Coin Change greedy variant (GfG) — **and know when it fails** (see the DP version, LC 322, in the dp pattern).

---

## Worked Solutions

### ⭐ Coin Change (greedy variant) — GfG  *(works only for canonical coin systems)*
```php
// Greedy: always take the largest coin <= remaining. Correct for {1,2,5,10,...}
function coinChangeGreedy(array $coins, int $amount): int {
    rsort($coins);                          // largest first
    $count = 0;
    foreach ($coins as $c) {
        while ($amount >= $c) { $amount -= $c; $count++; }
    }
    return $amount === 0 ? $count : -1;     // leftover -> greedy failed
}
// coinChangeGreedy([1,2,5], 11) -> 3 (5+5+1) | O(n) after sort
// ⚠️ WRONG for coins like [1,3,4], amount 6: greedy gives 4+1+1=3, optimal is 3+3=2.
//    For arbitrary coins use the DP version in the dp pattern (LC 322).
```
