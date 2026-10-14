# 13 — Math & Bit Manipulation — Medium

> Part of the Math & Bit Manipulation pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Reverse Integer — LC 7 → *worked below*

---

## Worked Solutions

### Reverse Integer — LC 7  *(digit math + overflow guard)*
```php
function reverse(int $x): int {
    $sign = $x < 0 ? -1 : 1; $x = abs($x); $rev = 0;
    while ($x > 0) { $rev = $rev * 10 + $x % 10; $x = intdiv($x, 10); }
    $rev *= $sign;
    return ($rev < -2**31 || $rev > 2**31 - 1) ? 0 : $rev; // 32-bit overflow -> 0
}
// reverse(-123) -> -321 ; reverse(1534236469) -> 0 (overflows) | O(digits) / O(1)
```
