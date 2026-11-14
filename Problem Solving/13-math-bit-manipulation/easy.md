# 13 — Math & Bit Manipulation — Easy

> Part of the Math & Bit Manipulation pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

### Math
- [ ] Angle between clock hands — GfG ⭐ → *worked below*
- [ ] Count currency notes for amount — GfG ⭐ → *worked below*
- [ ] Palindrome Number — LC 9 *(reverse half the digits)*
- [ ] Power of Two — LC 231 *(`n > 0 && (n & (n-1)) === 0`)*
- [ ] FizzBuzz — LC 412
- [ ] Excel Sheet Column Number — LC 171 *(base-26)*
- [ ] Happy Number — LC 202 *(cycle detect, see the hashing pattern)*

### Bit Manipulation
- [ ] Number of 1 Bits — LC 191 → *worked below*
- [ ] Counting Bits — LC 338 *(dp: `bits[i] = bits[i>>1] + (i&1)`)*
- [ ] Single Number — LC 136 → *worked below*
- [ ] Missing Number — LC 268 → *worked below*

**⭐ Priority in this file:** Angle between clock hands (GfG), Count currency notes (GfG).

---

## Worked Solutions

### ⭐ Angle Between Hands of a Clock — GfG
```php
function clockAngle(int $h, int $m): float {
    $h %= 12; $m %= 60;
    $minuteAngle = 6 * $m;                       // 360/60 = 6° per minute
    $hourAngle   = 0.5 * ($h * 60 + $m);         // 30° per hour + 0.5° per minute
    $angle = abs($hourAngle - $minuteAngle);
    return min($angle, 360 - $angle);            // the smaller side
}
// clockAngle(12, 30) -> 165.0 ; clockAngle(3, 0) -> 90.0 | O(1) / O(1)
```

### ⭐ Count Currency Notes for an Amount — GfG  *(greedy denominations)*
```php
function countNotes(int $amount): array {
    $denoms = [2000, 500, 200, 100, 50, 20, 10, 5, 1];
    $result = [];
    foreach ($denoms as $d) {
        if ($amount >= $d) {
            $result[$d] = intdiv($amount, $d);   // how many of this note
            $amount %= $d;                       // carry the remainder down
        }
    }
    return $result;                              // e.g. [2000=>1, 500=>1, 50=>1]
}
// countNotes(2550) -> [2000=>1, 500=>1, 50=>1] | O(denoms) / O(1)
// (greedy is valid here — the note system is canonical, see the greedy pattern)
```

### Number of 1 Bits — LC 191  *(Brian Kernighan)*
```php
function hammingWeight(int $n): int {
    $count = 0;
    while ($n) { $n &= $n - 1; $count++; }       // clear lowest set bit each pass
    return $count;
}
// hammingWeight(0b1011) -> 3 | O(#set bits) / O(1)
```

### Single Number — LC 136  *(XOR cancels pairs)*
```php
function singleNumber(array $nums): int {
    $acc = 0;
    foreach ($nums as $x) $acc ^= $x;            // duplicates cancel, one remains
    return $acc;
}
// singleNumber([4,1,2,1,2]) -> 4 | O(n) / O(1) — beats the hash-set O(n) space
```

### Missing Number — LC 268  *(XOR indices vs values, or Gauss sum)*
```php
function missingNumber(array $nums): int {
    $acc = count($nums);                         // start with n (the top index)
    foreach ($nums as $i => $x) $acc ^= $i ^ $x; // every present pair cancels
    return $acc;
}
// missingNumber([3,0,1]) -> 2 | O(n) / O(1) — no overflow risk vs the sum method
```
