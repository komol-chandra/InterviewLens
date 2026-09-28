# 07 — Recursion & Backtracking — Easy

> Part of the Recursion & Backtracking pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Factorial (recursive) — GfG
- [ ] Fibonacci (recursive + memo) — LC 509 ⭐ → *worked below*
- [ ] Reverse a Number recursively — GfG ⭐ → *worked below*
- [ ] Sum of Digits (recursive) — GfG
- [ ] Reverse String recursively — LC 344

**⭐ Priority in this file:** Fibonacci (LC 509), Reverse a Number recursively (GfG).

---

## Worked Solutions

### ⭐ Fibonacci Number — LC 509  *(naive → memo → O(1) DP)*
```php
// Naive recursion — exponential, shows the recurrence
function fibNaive(int $n): int {
    if ($n < 2) return $n;                 // base: fib(0)=0, fib(1)=1
    return fibNaive($n - 1) + fibNaive($n - 2);
}

// Memoized — each n computed once, O(n)
function fibMemo(int $n, array &$memo = []): int {
    if ($n < 2) return $n;
    if (isset($memo[$n])) return $memo[$n];
    return $memo[$n] = fibMemo($n - 1, $memo) + fibMemo($n - 2, $memo);
}

// Iterative, O(1) space — what you write in the interview
function fib(int $n): int {
    if ($n < 2) return $n;
    $a = 0; $b = 1;
    for ($i = 2; $i <= $n; $i++) { [$a, $b] = [$b, $a + $b]; }
    return $b;
}
// fib(10) -> 55 | naive O(2^n) -> memo O(n) -> iterative O(n) time / O(1) space
```

### ⭐ Recursive Function to Reverse a Number — GfG
```php
function reverseNumber(int $n, int $rev = 0): int {
    if ($n === 0) return $rev;                 // base: no digits left
    return reverseNumber(intdiv($n, 10), $rev * 10 + $n % 10); // peel last digit
}
// reverseNumber(1234) -> 4321 | Time O(digits), Space O(digits) stack
// (guard/strip sign separately if negatives are allowed)
```
