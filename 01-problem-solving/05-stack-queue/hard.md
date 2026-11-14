---
id: ps-stack-queue-hard
title: "05 — Stack & Queue — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, stack-queue]
updated: 2026-11-14
---

# 05 — Stack & Queue — Hard

> **Pattern চেনার সংকেত:** expression, `+ - ( )` → stack-এ "আগের context" (result, sign) জমাও। "সবচেয়ে লম্বা valid bracket অংশ" → index-এর stack, তলায় একটা sentinel। "সবচেয়ে frequent-টা pop, টাই হলে সবচেয়ে নতুন" → frequency অনুযায়ী আলাদা stack।
> Monotonic stack (histogram, next greater) আলাদা ফোল্ডারে: [18-monotonic-stack](../18-monotonic-stack/)।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Basic Calculator ⭐ | LC 224 | ⬜ | — | — |
| 2 | Longest Valid Parentheses | LC 32 | ⬜ | — | — |
| 3 | Maximum Frequency Stack | LC 895 | ⬜ | — | — |
| 4 | Largest Rectangle in Histogram | LC 84 *(→ [18 hard](../18-monotonic-stack/hard.md))* | ⬜ | — | — |
| 5 | Basic Calculator III | LC 772 *(224 + 227 মিলিয়ে, recursion)* | ⬜ | — | — |

---

## 1. Basic Calculator  ·  LC 224

**Problem:** `+`, `-`, `(`, `)`, space আর non-negative integer দিয়ে লেখা expression evaluate করো (`eval` নিষেধ)। unary minus থাকতে পারে (`-(2+3)`)।
**Example:** `"(1+(4+5+2)-3)+(6+8)" → 23` · `"- (3 + (4 + 5))" → -12`
**Constraints:** `1 ≤ |s| ≤ 3·10⁵`

**Pattern:** Stack — `(` পেলে বর্তমান `result` আর `sign` stack-এ রেখে নতুন হিসাব শুরু; `)` পেলে ভেতরের ফল বাইরের সাথে জোড়া।

**Approach:**
1. চলমান `result`, `sign` (+1/−1), `num`।
2. অঙ্ক → `num` বানাও। `+`/`-` → `result += sign*num`, নতুন sign। `(` → push(result), push(sign), রিসেট। `)` → `result += sign*num`; তারপর `result = pop_sign * result + pop_result`।

**PHP:**
```php
<?php
function calculate(string $s): int
{
    $stack = []; $result = 0; $sign = 1; $num = 0;
    $n = strlen($s);
    for ($i = 0; $i < $n; $i++) {
        $c = $s[$i];
        if (ctype_digit($c)) {
            $num = $num * 10 + (int) $c;
        } elseif ($c === '+' || $c === '-') {
            $result += $sign * $num;
            $num = 0;
            $sign = $c === '+' ? 1 : -1;
        } elseif ($c === '(') {
            $stack[] = $result;              // save outer context
            $stack[] = $sign;
            $result = 0; $sign = 1;
        } elseif ($c === ')') {
            $result += $sign * $num;
            $num = 0;
            $outerSign = array_pop($stack);
            $outerResult = array_pop($stack);
            $result = $outerResult + $outerSign * $result;
        }
    }
    return $result + $sign * $num;
}

assert(calculate('1 + 1') === 2);
assert(calculate(' 2-1 + 2 ') === 3);
assert(calculate('(1+(4+5+2)-3)+(6+8)') === 23);
assert(calculate('- (3 + (4 + 5))') === -12);
assert(calculate('2147483647') === 2147483647);
```

**Python:**
```python
def calculate(s: str) -> int:
    stack: list[int] = []
    result, sign, num = 0, 1, 0
    for c in s:
        if c.isdigit():
            num = num * 10 + int(c)
        elif c in "+-":
            result += sign * num
            num = 0
            sign = 1 if c == "+" else -1
        elif c == "(":
            stack.append(result)
            stack.append(sign)
            result, sign = 0, 1
        elif c == ")":
            result += sign * num
            num = 0
            outer_sign = stack.pop()
            outer_result = stack.pop()
            result = outer_result + outer_sign * result
    return result + sign * num

assert calculate("(1+(4+5+2)-3)+(6+8)") == 23
assert calculate("- (3 + (4 + 5))") == -12
```

**Complexity:** Time O(n) · Space O(depth of parentheses)।

**Mistakes / edge cases:**
- একাধিক অঙ্কের সংখ্যা (`123`) — `num*10 + d`।
- শেষে লুপের বাইরে শেষ `num` যোগ করা ভুলে যাওয়া।
- unary minus শুরুতে: `result = 0` আর `sign = -1` দিয়ে স্বাভাবিকভাবে কাজ করে।

🎤 **Say this while coding:** "I keep a running result and sign; an opening bracket pushes the outer context onto a stack, and a closing bracket folds the inner result back into it."

---

## 2. Longest Valid Parentheses  ·  LC 32

**Problem:** শুধু `(` আর `)`-এর string; সবচেয়ে লম্বা valid (well-formed) contiguous অংশের দৈর্ঘ্য।
**Example:** `"(()" → 2` · `")()())" → 4` · `"" → 0`
**Constraints:** `0 ≤ n ≤ 3·10⁴`

**Pattern:** Stack of indices + sentinel — stack-এর তলায় "শেষ যে index-এ valid অংশ ভেঙেছে" রাখো।

**Approach:**
1. Brute force: সব জোড় দৈর্ঘ্যের substring valid কি না — O(n³)।
2. Optimized: stack = `[-1]`। `(` → index push। `)` → pop; stack খালি হলে এই index নতুন sentinel হিসেবে push; নইলে দৈর্ঘ্য = `i − top`।

**PHP:**
```php
<?php
function longestValidParentheses(string $s): int
{
    $stack = [-1];                          // index before the current valid run
    $best = 0;
    for ($i = 0; $i < strlen($s); $i++) {
        if ($s[$i] === '(') {
            $stack[] = $i;
        } else {
            array_pop($stack);
            if (!$stack) {
                $stack[] = $i;              // unmatched ')' becomes the new base
            } else {
                $best = max($best, $i - end($stack));
            }
        }
    }
    return $best;
}

assert(longestValidParentheses('(()') === 2);
assert(longestValidParentheses(')()())') === 4);
assert(longestValidParentheses('') === 0);
assert(longestValidParentheses('()(())') === 6);
assert(longestValidParentheses('()(()') === 2);
```

**Python:**
```python
def longest_valid_parentheses(s: str) -> int:
    stack = [-1]
    best = 0
    for i, c in enumerate(s):
        if c == "(":
            stack.append(i)
        else:
            stack.pop()
            if not stack:
                stack.append(i)
            else:
                best = max(best, i - stack[-1])
    return best

assert longest_valid_parentheses(")()())") == 4
assert longest_valid_parentheses("()(()") == 2
```

**Complexity:** Time O(n) · Space O(n)। (O(1) space বিকল্প: বাম→ডান আর ডান→বাম দুইবার `open`/`close` গুনে।)

**Mistakes / edge cases:**
- sentinel `-1` ছাড়া `"()"`-এর দৈর্ঘ্য হিসাব হয় না।
- `"()(()"` → 2, 4 না — মাঝের unmatched `(` অংশটা ভাঙে।

🎤 **Say this while coding:** "I push indices; the bottom of the stack always holds the index just before the current valid run, so on each match the length is i minus the top."

---

## 3. Maximum Frequency Stack  ·  LC 895

**Problem:** `push(x)` আর `pop()`; `pop` সবচেয়ে বেশিবার থাকা মানটা ফেরত দেয়, টাই হলে যেটা সবচেয়ে সম্প্রতি push হয়েছে।
**Example:** push 5,7,5,7,4,5 → pop: 5, 7, 5, 4
**Constraints:** ≤ 2·10⁴ কল।

**Pattern:** Frequency অনুযায়ী stack-এর map — `group[f]` = যেসব মান `f`-তম বার push হয়েছে, push-এর ক্রমে।

**Approach:**
1. Brute force: pop-এর সময় সব মান স্ক্যান করে max freq + সবচেয়ে নতুন — O(n)।
2. Optimized: `freq[x]`, `group[f]` (stack), `maxFreq`। push → `f = ++freq[x]`, `group[f].push(x)`, `maxFreq = max`। pop → `group[maxFreq].pop()`, `freq[x]--`, ওই stack খালি হলে `maxFreq--`।

**PHP:**
```php
<?php
final class FreqStack
{
    private array $freq = [];
    private array $group = [];    // freq => stack of values
    private int $maxFreq = 0;

    public function push(int $x): void
    {
        $f = ($this->freq[$x] ?? 0) + 1;
        $this->freq[$x] = $f;
        $this->group[$f][] = $x;
        $this->maxFreq = max($this->maxFreq, $f);
    }

    public function pop(): int
    {
        $x = array_pop($this->group[$this->maxFreq]);
        $this->freq[$x]--;
        if (!$this->group[$this->maxFreq]) $this->maxFreq--;
        return $x;
    }
}

$s = new FreqStack();
foreach ([5, 7, 5, 7, 4, 5] as $x) $s->push($x);
assert($s->pop() === 5);
assert($s->pop() === 7);
assert($s->pop() === 5);
assert($s->pop() === 4);
```

**Python:**
```python
from collections import defaultdict

class FreqStack:
    def __init__(self):
        self.freq: dict[int, int] = defaultdict(int)
        self.group: dict[int, list[int]] = defaultdict(list)
        self.max_freq = 0

    def push(self, x: int) -> None:
        self.freq[x] += 1
        f = self.freq[x]
        self.group[f].append(x)
        self.max_freq = max(self.max_freq, f)

    def pop(self) -> int:
        x = self.group[self.max_freq].pop()
        self.freq[x] -= 1
        if not self.group[self.max_freq]:
            self.max_freq -= 1
        return x

s = FreqStack()
for x in [5, 7, 5, 7, 4, 5]:
    s.push(x)
assert [s.pop() for _ in range(4)] == [5, 7, 5, 4]
```

**Complexity:** Time O(1) প্রতি অপারেশন · Space O(n)।

**Mistakes / edge cases:**
- একটা মান একাধিক `group`-এ থাকে (f=1, f=2…) — এটা ঠিক, ভুল না; pop শুধু সবচেয়ে উঁচু থেকে নেয়।
- heap দিয়ে করলে O(log n) — চলে, কিন্তু O(1) সমাধানটা ইন্টারভিউয়ার আশা করে।

🎤 **Say this while coding:** "Instead of sorting by frequency, I keep one stack per frequency level. The top of the highest non-empty level is both the most frequent and the most recent."

🔗 DistroSaaS: expression parsing সরাসরি কাজে নেই — এভাবে বলো: "The same push-context-on-open, fold-on-close idea is how nested filter groups (AND/OR brackets) are evaluated." **[Komol পূরণ করবে: nested filter/approval-rule ধরনের কাজ থাকলে স্টোরি ID]**
