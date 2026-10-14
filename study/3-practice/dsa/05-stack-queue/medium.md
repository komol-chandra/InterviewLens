# 05 — Stack & Queue — Medium

> Part of the Stack & Queue pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Min Stack — LC 155 → *worked below*
- [ ] Daily Temperatures — LC 739 → *worked below*
- [ ] Evaluate Reverse Polish Notation — LC 150 → *worked below*
- [ ] Next Greater Element II — LC 503
- [ ] Asteroid Collision — LC 735
- [ ] Decode String — LC 394
- [ ] Remove K Digits — LC 402
- [ ] Basic Calculator II — LC 227

---

## Worked Solutions

### Min Stack — LC 155  *(pair each value with the min-so-far)*
```php
class MinStack {
    private array $stack = [];   // each entry: [value, minAtOrBelow]
    public function push(int $x): void {
        $min = empty($this->stack) ? $x : min($x, end($this->stack)[1]);
        $this->stack[] = [$x, $min];
    }
    public function pop(): void { array_pop($this->stack); }
    public function top(): int { return end($this->stack)[0]; }
    public function getMin(): int { return end($this->stack)[1]; } // O(1)
}
// All ops O(1) time, O(n) space
```

### Daily Temperatures — LC 739  *(monotonic decreasing stack)*
```php
function dailyTemperatures(array $t): array {
    $n = count($t); $res = array_fill(0, $n, 0);
    $stack = [];                              // indices, temps decreasing
    for ($i = 0; $i < $n; $i++) {
        while (!empty($stack) && $t[end($stack)] < $t[$i]) {
            $j = array_pop($stack);
            $res[$j] = $i - $j;               // days until warmer
        }
        $stack[] = $i;
    }
    return $res;
}
// dailyTemperatures([73,74,75,71,69,72,76,73]) -> [1,1,4,2,1,1,0,0] | O(n) / O(n)
```

### Evaluate Reverse Polish Notation — LC 150  *(operand stack)*
```php
function evalRPN(array $tokens): int {
    $stack = [];
    foreach ($tokens as $tok) {
        if (in_array($tok, ['+','-','*','/'], true)) {
            $b = array_pop($stack); $a = array_pop($stack);
            $stack[] = match ($tok) {
                '+' => $a + $b, '-' => $a - $b, '*' => $a * $b,
                '/' => intdiv($a, $b),         // truncate toward zero
            };
        } else {
            $stack[] = (int) $tok;
        }
    }
    return $stack[0];
}
// evalRPN(["2","1","+","3","*"]) -> 9  ((2+1)*3) | O(n) / O(n)
```
