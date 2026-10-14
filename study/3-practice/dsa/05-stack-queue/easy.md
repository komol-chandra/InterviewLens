# 05 — Stack & Queue — Easy

> Part of the Stack & Queue pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Valid Parentheses — LC 20 ⭐ → *worked below*
- [ ] Implement Queue using Stacks — LC 232 → *worked below*
- [ ] Implement Stack using Queues — LC 225
- [ ] Baseball Game — LC 682
- [ ] Reverse a String using Stack — GfG ⭐ → *worked below*
- [ ] Next Greater Element I — LC 496

**⭐ Priority in this file:** Valid Parentheses (LC 20), Reverse String using Stack (GfG).

---

## Worked Solutions

### ⭐ Valid Parentheses / Balanced Brackets — LC 20  *(match with a stack)*
```php
function isValid(string $s): bool {
    $pairs = [')' => '(', ']' => '[', '}' => '{'];
    $stack = [];
    for ($i = 0; $i < strlen($s); $i++) {
        $c = $s[$i];
        if (isset($pairs[$c])) {                        // a closer
            if (empty($stack) || array_pop($stack) !== $pairs[$c]) return false;
        } else {
            $stack[] = $c;                              // an opener
        }
    }
    return empty($stack);                               // nothing left unmatched
}
// isValid("()[]{}") -> true ; isValid("(]") -> false | Time O(n), Space O(n)
```

### ⭐ Reverse a String using a Stack — GfG
```php
function reverseWithStack(string $s): string {
    $stack = str_split($s);      // push every char
    $out = '';
    while (!empty($stack)) $out .= array_pop($stack);   // pop = reverse order
    return $out;
}
// reverseWithStack("abc") -> "cba" | Time O(n), Space O(n)
```

### Implement Queue using Stacks — LC 232  *(two stacks, amortized O(1))*
```php
class MyQueue {
    private array $in = [], $out = [];
    public function push(int $x): void { $this->in[] = $x; }
    public function pop(): int { $this->shift(); return array_pop($this->out); }
    public function peek(): int { $this->shift(); return end($this->out); }
    public function empty(): bool { return empty($this->in) && empty($this->out); }
    private function shift(): void {                  // move in -> out only when out is empty
        if (empty($this->out)) while (!empty($this->in)) $this->out[] = array_pop($this->in);
    }
}
// Amortized O(1) per op
```
