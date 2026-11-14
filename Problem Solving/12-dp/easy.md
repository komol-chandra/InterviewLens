# 12 — Dynamic Programming — Easy

> Part of the DP pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Climbing Stairs — LC 70 → *worked below*
- [ ] Fibonacci (DP) — LC 509 ⭐ *(see the recursion-backtracking pattern for the full memo→iterative build)*
- [ ] Min Cost Climbing Stairs — LC 746
- [ ] Maximum Subarray — LC 53 *(Kadane, see the arrays pattern)*

---

## Worked Solutions

### Climbing Stairs — LC 70  *(Fibonacci in disguise)*
```php
function climbStairs(int $n): int {
    if ($n < 3) return $n;
    $a = 1; $b = 2;                          // ways to reach step 1 and step 2
    for ($i = 3; $i <= $n; $i++) [$a, $b] = [$b, $a + $b];
    return $b;
}
// climbStairs(5) -> 8 | O(n) / O(1) — reach step i from i-1 or i-2
```
