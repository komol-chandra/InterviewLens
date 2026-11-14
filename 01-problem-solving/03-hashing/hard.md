---
id: ps-hashing-hard
title: "03 — Hashing / Maps & Sets — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, hashing]
updated: 2026-11-14
---

# 03 — Hashing / Maps & Sets — Hard

> **Pattern চেনার সংকেত:** "O(1)-এ get আর put, capacity ভরলে পুরনোটা বাদ" → hash map + doubly linked list (LRU)। "একই লাইনে কতগুলো বিন্দু" → প্রতিটা বিন্দু থেকে **slope**-কে key করে গোনা। "সব শব্দ জোড়া লাগিয়ে যে substring" → শব্দ-দৈর্ঘ্যের ধাপে sliding window + count map।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | LRU Cache ⭐ | LC 146 | ⬜ | — | — |
| 2 | Max Points on a Line | LC 149 | ⬜ | — | — |
| 3 | Substring with Concatenation of All Words | LC 30 | ⬜ | — | — |
| 4 | LFU Cache | LC 460 *(map key→freq + map freq→ordered keys)* | ⬜ | — | — |
| 5 | Insert Delete GetRandom O(1) – Duplicates allowed | LC 381 | ⬜ | — | — |

---

## 1. LRU Cache  ·  LC 146

**Problem:** একটা cache বানাও যার `get(key)` আর `put(key, value)` দুটোই O(1); capacity ভরলে সবচেয়ে কম সম্প্রতি ব্যবহৃত (least recently used) key বাদ।
**Example:** cap 2: `put(1,1) put(2,2) get(1)=1 put(3,3)` (2 বাদ) `get(2)=-1`
**Constraints:** `1 ≤ capacity ≤ 3000`, ≤ 2·10⁵ কল।

**Pattern:** Hash map + doubly linked list — map দেয় O(1) খোঁজা, list দেয় O(1)-এ "সামনে আনা" আর "পেছন থেকে বাদ"।

**Approach:**
1. Brute force: array-তে timestamp রেখে evict-এর সময় min খোঁজা — O(n)।
2. Optimized: dummy `head` আর `tail` সহ doubly linked list; head-এর পাশে সবচেয়ে নতুন। `get` → node সরিয়ে head-এ বসাও। `put` → আছে হলে update + সামনে; নেই হলে নতুন node, সাইজ বেশি হলে `tail.prev` বাদ।

**PHP:**
```php
<?php
final class Node
{
    public ?Node $prev = null;
    public ?Node $next = null;
    public function __construct(public int $key = 0, public int $val = 0) {}
}

final class LRUCache
{
    private array $map = [];          // key => Node
    private Node $head;
    private Node $tail;

    public function __construct(private int $capacity)
    {
        $this->head = new Node();
        $this->tail = new Node();
        $this->head->next = $this->tail;
        $this->tail->prev = $this->head;
    }

    private function remove(Node $n): void
    {
        $n->prev->next = $n->next;
        $n->next->prev = $n->prev;
    }

    private function addFront(Node $n): void
    {
        $n->next = $this->head->next;
        $n->prev = $this->head;
        $this->head->next->prev = $n;
        $this->head->next = $n;
    }

    public function get(int $key): int
    {
        if (!isset($this->map[$key])) return -1;
        $n = $this->map[$key];
        $this->remove($n);
        $this->addFront($n);
        return $n->val;
    }

    public function put(int $key, int $value): void
    {
        if (isset($this->map[$key])) {
            $n = $this->map[$key];
            $n->val = $value;
            $this->remove($n);
            $this->addFront($n);
            return;
        }
        $n = new Node($key, $value);
        $this->map[$key] = $n;
        $this->addFront($n);
        if (count($this->map) > $this->capacity) {
            $lru = $this->tail->prev;
            $this->remove($lru);
            unset($this->map[$lru->key]);
        }
    }
}

$c = new LRUCache(2);
$c->put(1, 1); $c->put(2, 2);
assert($c->get(1) === 1);
$c->put(3, 3);                 // evicts 2
assert($c->get(2) === -1);
$c->put(4, 4);                 // evicts 1
assert($c->get(1) === -1);
assert($c->get(3) === 3 && $c->get(4) === 4);
```

**Python:**
```python
class Node:
    __slots__ = ("key", "val", "prev", "next")
    def __init__(self, key=0, val=0):
        self.key, self.val, self.prev, self.next = key, val, None, None

class LRUCache:
    def __init__(self, capacity: int):
        self.cap = capacity
        self.map: dict[int, Node] = {}
        self.head, self.tail = Node(), Node()
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, n: Node) -> None:
        n.prev.next, n.next.prev = n.next, n.prev

    def _add_front(self, n: Node) -> None:
        n.prev, n.next = self.head, self.head.next
        self.head.next.prev = n
        self.head.next = n

    def get(self, key: int) -> int:
        if key not in self.map:
            return -1
        n = self.map[key]
        self._remove(n)
        self._add_front(n)
        return n.val

    def put(self, key: int, value: int) -> None:
        if key in self.map:
            n = self.map[key]
            n.val = value
            self._remove(n)
            self._add_front(n)
            return
        n = Node(key, value)
        self.map[key] = n
        self._add_front(n)
        if len(self.map) > self.cap:
            lru = self.tail.prev
            self._remove(lru)
            del self.map[lru.key]

c = LRUCache(2)
c.put(1, 1); c.put(2, 2)
assert c.get(1) == 1
c.put(3, 3)
assert c.get(2) == -1
```

> Python শর্টকাট: `collections.OrderedDict` + `move_to_end` + `popitem(last=False)`। ইন্টারভিউতে আগে জিজ্ঞেস করো built-in চলবে কি না; সাধারণত নিজে list বানাতে বলে।

**Complexity:** Time O(1) প্রতি অপারেশন · Space O(capacity)।

**Mistakes / edge cases:**
- node-এ `key` না রাখলে evict-এর সময় map থেকে মুছতে পারবে না।
- existing key-তে `put` করলে সামনে আনা ভুলে যাওয়া।
- dummy head/tail ছাড়া লিখলে null-চেকের জঙ্গল।

🎤 **Say this while coding:** "The hash map gives me O(1) lookup, and the doubly linked list keeps recency order so I can move a node to the front or drop the tail in O(1). Dummy head and tail remove all the null checks."

🔗 DistroSaaS: Redis `allkeys-lru` eviction আর রিপোর্ট cache এই আইডিয়ার ওপরেই — **[Komol পূরণ করবে: রিপোর্ট caching স্টোরির ID]**।

---

## 2. Max Points on a Line  ·  LC 149

**Problem:** 2-D বিন্দুর list; একই সরলরেখায় সর্বোচ্চ কতগুলো বিন্দু থাকতে পারে?
**Example:** `[[1,1],[2,2],[3,3]] → 3` · `[[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]] → 4`
**Constraints:** `1 ≤ n ≤ 300`, সব বিন্দু আলাদা।

**Pattern:** প্রতিটা anchor বিন্দু থেকে slope গুনে hash map — কারণ একই anchor দিয়ে যাওয়া রেখা = একই slope।

**Approach:**
1. Brute force: প্রতি জোড়া রেখা, তারপর সব বিন্দু চেক — O(n³)।
2. Optimized: প্রতিটা `i`-র জন্য, `j > i` বিন্দুগুলোর slope `(dy, dx)` কে gcd দিয়ে ভাগ করে আর sign ঠিক করে key বানাও (float slope নিও না)। সবচেয়ে বড় count + 1 (anchor নিজে)।

**PHP:**
```php
<?php
function gcd(int $a, int $b): int
{
    return $b === 0 ? abs($a) : gcd($b, $a % $b);
}

function maxPoints(array $points): int
{
    $n = count($points);
    if ($n <= 2) return $n;
    $best = 0;
    for ($i = 0; $i < $n; $i++) {
        $slopes = [];
        for ($j = $i + 1; $j < $n; $j++) {
            $dx = $points[$j][0] - $points[$i][0];
            $dy = $points[$j][1] - $points[$i][1];
            $g = gcd($dx, $dy);
            $dx = intdiv($dx, $g); $dy = intdiv($dy, $g);
            if ($dx < 0 || ($dx === 0 && $dy < 0)) { $dx = -$dx; $dy = -$dy; } // one canonical sign
            $key = "$dy/$dx";
            $slopes[$key] = ($slopes[$key] ?? 0) + 1;
        }
        if ($slopes) $best = max($best, max($slopes) + 1);
    }
    return $best;
}

assert(maxPoints([[1, 1], [2, 2], [3, 3]]) === 3);
assert(maxPoints([[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]) === 4);
assert(maxPoints([[0, 0], [0, 5], [0, -3]]) === 3);   // vertical line
assert(maxPoints([[5, 5]]) === 1);
```

**Python:**
```python
from collections import Counter
from math import gcd

def max_points(points: list[list[int]]) -> int:
    n = len(points)
    if n <= 2:
        return n
    best = 0
    for i in range(n):
        slopes = Counter()
        for j in range(i + 1, n):
            dx = points[j][0] - points[i][0]
            dy = points[j][1] - points[i][1]
            g = gcd(dx, dy)
            dx, dy = dx // g, dy // g
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy
            slopes[(dy, dx)] += 1
        if slopes:
            best = max(best, max(slopes.values()) + 1)
    return best

assert max_points([[1, 1], [2, 2], [3, 3]]) == 3
assert max_points([[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]) == 4
assert max_points([[0, 0], [0, 5], [0, -3]]) == 3
```

**Complexity:** Time O(n² log V) · Space O(n) — log V gcd-এর জন্য।

**Mistakes / edge cases:**
- float slope (`dy/dx`) → precision ভুল আর vertical রেখায় division by zero।
- sign normalise না করলে `(1,-1)` আর `(-1,1)` আলাদা key।
- n ≤ 2 সরাসরি n।

🎤 **Say this while coding:** "For every anchor point I count other points by slope; to avoid floating-point errors I store the slope as a reduced fraction with a canonical sign."

---

## 3. Substring with Concatenation of All Words  ·  LC 30

**Problem:** `s` আর সমান দৈর্ঘ্যের শব্দের list `words`; `s`-এর যে যে index থেকে শুরু করে সব শব্দ (যেকোনো ক্রমে, প্রতিটা ঠিক একবার) জোড়া পাওয়া যায়, সেগুলো দাও।
**Example:** `s="barfoothefoobarman", words=["foo","bar"] → [0,9]`
**Constraints:** `1 ≤ |s| ≤ 10⁴`, `1 ≤ words ≤ 5000`, শব্দের দৈর্ঘ্য ≤ 30।

**Pattern:** Hash count + sliding window (শব্দের ধাপে) — কারণ সব শব্দ সমান দৈর্ঘ্যের, তাই `s` কে `w`-দৈর্ঘ্যের টুকরো হিসেবে দেখা যায়, `w` টা আলাদা offset থেকে।

**Approach:**
1. Brute force: প্রতিটা index থেকে `k·w` লম্বা অংশ কেটে শব্দ গোনো — O(n·k)।
2. Optimized: offset `0..w-1`; প্রতিটায় window-এ শব্দ ঢোকাও। অচেনা শব্দ → window রিসেট। কোনো শব্দ বেশিবার → বাম থেকে বাদ দিতে থাকো যতক্ষণ ঠিক না হয়। window-এ `k` টা শব্দ হলে `left` উত্তর।

**PHP:**
```php
<?php
function findSubstring(string $s, array $words): array
{
    $w = strlen($words[0]); $k = count($words); $n = strlen($s);
    $need = array_count_values($words);
    $res = [];
    for ($off = 0; $off < $w; $off++) {
        $left = $off; $count = 0; $seen = [];
        for ($right = $off; $right + $w <= $n; $right += $w) {
            $word = substr($s, $right, $w);
            if (!isset($need[$word])) {               // unknown word: reset window
                $seen = []; $count = 0; $left = $right + $w;
                continue;
            }
            $seen[$word] = ($seen[$word] ?? 0) + 1;
            $count++;
            while ($seen[$word] > $need[$word]) {     // too many of this word: shrink
                $seen[substr($s, $left, $w)]--;
                $left += $w; $count--;
            }
            if ($count === $k) {
                $res[] = $left;
                $seen[substr($s, $left, $w)]--;       // slide by one word
                $left += $w; $count--;
            }
        }
    }
    sort($res);
    return $res;
}

assert(findSubstring('barfoothefoobarman', ['foo', 'bar']) === [0, 9]);
assert(findSubstring('wordgoodgoodgoodbestword', ['word', 'good', 'best', 'word']) === []);
assert(findSubstring('barfoofoobarthefoobarman', ['bar', 'foo', 'the']) === [6, 9, 12]);
```

**Python:**
```python
from collections import Counter

def find_substring(s: str, words: list[str]) -> list[int]:
    w, k, n = len(words[0]), len(words), len(s)
    need = Counter(words)
    res = []
    for off in range(w):
        left, count, seen = off, 0, Counter()
        for right in range(off, n - w + 1, w):
            word = s[right:right + w]
            if word not in need:
                seen.clear(); count = 0; left = right + w
                continue
            seen[word] += 1
            count += 1
            while seen[word] > need[word]:
                seen[s[left:left + w]] -= 1
                left += w; count -= 1
            if count == k:
                res.append(left)
                seen[s[left:left + w]] -= 1
                left += w; count -= 1
    return sorted(res)

assert find_substring("barfoothefoobarman", ["foo", "bar"]) == [0, 9]
assert find_substring("barfoofoobarthefoobarman", ["bar", "foo", "the"]) == [6, 9, 12]
```

**Complexity:** Time O(n · w) · Space O(k)।

**Mistakes / edge cases:**
- `words`-এ duplicate (`["word","word"]`) — set ব্যবহার করলে ভুল; count map লাগে।
- শুধু offset 0 থেকে চালানো → অনেক উত্তর হারায়।

🎤 **Say this while coding:** "Because every word has the same length, I run a sliding window in steps of one word, once for each starting offset, and keep a count map so duplicates in the word list are handled."
