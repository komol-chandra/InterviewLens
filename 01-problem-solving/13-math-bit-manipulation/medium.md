---
id: ps-math-bit-manipulation-medium
title: "13 — Math & Bit Manipulation — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, math-bit-manipulation]
updated: 2026-11-14
---

# 13 — Math & Bit Manipulation — Medium

> Part of the Math & Bit Manipulation pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Reverse Integer — LC 7 → *worked below*
- [ ] Pow(x, n) — LC 50 → *worked below*
- [ ] Count Primes — LC 204 → *worked below*
- [ ] Bitwise AND of Numbers Range — LC 201 → *worked below*

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

> **Pattern চেনার সংকেত:** "`+`/`-` ছাড়া যোগ" → XOR (যোগ, carry ছাড়া) + AND<<1 (carry)। "n পর্যন্ত সব prime" → Sieve of Eratosthenes। "range-এর সব সংখ্যার AND" → common binary prefix। "xⁿ দ্রুত" → fast exponentiation (n অর্ধেক করো)।

### Pow(x, n)  ·  LC 50

**Problem:** `x^n` হিসাব করো, n negative হতে পারে।
**Example:** `2.0, 10 → 1024.0` · `2.0, -2 → 0.25`

**Pattern:** Fast exponentiation — `x^n = (x²)^(n/2)`, বিজোড় হলে আরেকটা `x` গুণ।

**PHP:**
```php
<?php
function myPow(float $x, int $n): float
{
    if ($n < 0) { $x = 1 / $x; $n = -$n; }
    $result = 1.0;
    while ($n > 0) {
        if ($n & 1) $result *= $x;   // current bit set -> include this power
        $x *= $x;                    // x, x^2, x^4, x^8 ...
        $n >>= 1;
    }
    return $result;
}

assert(abs(myPow(2.0, 10) - 1024.0) < 1e-9);
assert(abs(myPow(2.1, 3) - 9.261) < 1e-9);
assert(abs(myPow(2.0, -2) - 0.25) < 1e-9);
assert(myPow(5.0, 0) === 1.0);
```

**Python:**
```python
def my_pow(x: float, n: int) -> float:
    if n < 0:
        x, n = 1 / x, -n
    result = 1.0
    while n:
        if n & 1:
            result *= x
        x *= x
        n >>= 1
    return result

assert abs(my_pow(2.0, 10) - 1024.0) < 1e-9 and abs(my_pow(2.0, -2) - 0.25) < 1e-9
```

**Complexity:** Time O(log n) · Space O(1)।
**Mistakes:** float তুলনায় `===` না, tolerance। অন্য ভাষায় `-n` overflow (`INT_MIN`) — PHP/Python-এ 64-bit/bigint বলে সমস্যা নেই, কিন্তু উল্লেখ করো।

🎤 **Say this while coding:** "I walk the bits of n: square x every step and multiply it into the result only when the current bit is set — log n multiplications."

### Count Primes  ·  LC 204

**Problem:** `n`-এর **ছোট** কতগুলো prime?
**Example:** `10 → 4` (2,3,5,7)

**Pattern:** Sieve of Eratosthenes — প্রতিটা prime `p`-এর গুণিতক `p²` থেকে কেটে দাও।

**PHP:**
```php
<?php
function countPrimes(int $n): int
{
    if ($n < 3) return 0;
    $isPrime = array_fill(0, $n, true);
    $isPrime[0] = $isPrime[1] = false;
    for ($p = 2; $p * $p < $n; $p++) {
        if (!$isPrime[$p]) continue;
        for ($m = $p * $p; $m < $n; $m += $p) $isPrime[$m] = false;   // smaller multiples already crossed
    }
    return count(array_filter($isPrime));
}

assert(countPrimes(10) === 4);
assert(countPrimes(0) === 0);
assert(countPrimes(2) === 0);
assert(countPrimes(100) === 25);
```

**Python:**
```python
def count_primes(n: int) -> int:
    if n < 3:
        return 0
    is_prime = bytearray([1]) * n
    is_prime[0] = is_prime[1] = 0
    p = 2
    while p * p < n:
        if is_prime[p]:
            is_prime[p * p::p] = bytearray(len(range(p * p, n, p)))
        p += 1
    return sum(is_prime)

assert count_primes(10) == 4 and count_primes(100) == 25 and count_primes(2) == 0
```

**Complexity:** Time O(n log log n) · Space O(n)।
**Mistakes:** "n-এর ছোট" — n নিজে গোনা হয় না; `p*p` থেকে শুরু, `2p` থেকে না (বাড়তি কাজ)।

🎤 **Say this while coding:** "Every composite has a prime factor up to its square root, so I cross out multiples of each prime starting from p squared."

### Bitwise AND of Numbers Range  ·  LC 201

**Problem:** `[left, right]`-এর সব সংখ্যার bitwise AND।
**Example:** `5, 7 → 4` (101 & 110 & 111 = 100)

**Pattern:** Common prefix — রেঞ্জে কোনো bit একবার 0 হলে AND-এ 0; তাই দুই প্রান্তের common binary prefix-ই উত্তর।

**PHP:**
```php
<?php
function rangeBitwiseAnd(int $left, int $right): int
{
    $shift = 0;
    while ($left !== $right) {      // strip differing low bits
        $left >>= 1;
        $right >>= 1;
        $shift++;
    }
    return $left << $shift;
}

assert(rangeBitwiseAnd(5, 7) === 4);
assert(rangeBitwiseAnd(0, 0) === 0);
assert(rangeBitwiseAnd(1, 2147483647) === 0);
assert(rangeBitwiseAnd(12, 15) === 12);
```

**Python:**
```python
def range_bitwise_and(left: int, right: int) -> int:
    shift = 0
    while left != right:
        left >>= 1; right >>= 1; shift += 1
    return left << shift

assert range_bitwise_and(5, 7) == 4 and range_bitwise_and(1, 2147483647) == 0
```

**Complexity:** Time O(log right) · Space O(1)।
**Mistakes:** loop দিয়ে সব সংখ্যা AND করা — রেঞ্জ ২³¹ পর্যন্ত, TLE।

🎤 **Say this while coding:** "Any bit that changes inside the range becomes zero, so the answer is just the common binary prefix of left and right."
