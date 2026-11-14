---
id: ps-trie-hard
title: "19 — Trie — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, trie]
updated: 2026-11-14
---

# 19 — Trie — Hard

> **Pattern চেনার সংকেত:** "grid-এ অনেক শব্দ খোঁজো" → সব শব্দের trie + grid-এ **একবার** DFS, trie-তে prefix না থাকলেই থামো। "দুটো সংখ্যার maximum XOR" → bit trie (MSB থেকে), প্রতিটা bit-এ উল্টো bit-এর দিকে যাওয়ার চেষ্টা।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Word Search II ⭐ | LC 212 | ⬜ | — | — |
| 2 | Maximum XOR of Two Numbers in an Array | LC 421 | ⬜ | — | — |
| 3 | Palindrome Pairs | LC 336 *(উল্টো শব্দের trie)* | ⬜ | — | — |
| 4 | Concatenated Words | LC 472 *(trie + DP/DFS)* | ⬜ | — | — |

---

## 1. Word Search II  ·  LC 212

**Problem:** অক্ষরের grid আর শব্দের list; কোন শব্দগুলো grid-এ পাওয়া যায় (পাশাপাশি ঘর, একই ঘর একটা শব্দে একবার)?
**Example:** নিচে টেস্টে → `["eat","oath"]`
**Constraints:** grid ≤ 12×12, শব্দ ≤ 3·10⁴, দৈর্ঘ্য ≤ 10।

**Pattern:** Trie + backtracking — প্রতিটা শব্দের জন্য আলাদা Word Search (LC 79) চালালে O(W · R·C · 4^L)। trie দিয়ে সব শব্দ একসাথে: grid-এর প্রতিটা ঘর থেকে DFS, trie-র node ধরে নামো; child না থাকলে সাথে সাথে থামো।

**Approach:**
1. trie-র end node-এ পুরো শব্দটা রাখো (`'#' => word`), যাতে পথ আবার জোড়া লাগাতে না হয়।
2. DFS: ঘরটা সাময়িকভাবে `'*'` দিয়ে visited; শব্দ পেলে result-এ যোগ, আর `'#'` মুছে দাও (duplicate এড়াতে)।
3. Optimisation (মুখে বলো): খালি হয়ে যাওয়া trie branch ছেঁটে ফেলো।

**PHP:**
```php
<?php
function findWords(array $board, array $words): array
{
    $root = [];
    foreach ($words as $w) {
        $node = &$root;
        foreach (str_split($w) as $ch) { $node[$ch] ??= []; $node = &$node[$ch]; }
        $node['#'] = $w;                                     // store the whole word at its end
        unset($node);
    }
    $R = count($board); $C = count($board[0]); $found = [];
    $dfs = function (int $r, int $c, array &$parent) use (&$dfs, &$board, &$found, $R, $C): void {
        $ch = $board[$r][$c];
        if (!isset($parent[$ch])) return;                    // no word continues with this prefix
        $node = &$parent[$ch];
        if (isset($node['#'])) { $found[] = $node['#']; unset($node['#']); }   // report once
        $board[$r][$c] = '*';                                // mark visited
        foreach ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [$dr, $dc]) {
            $nr = $r + $dr; $nc = $c + $dc;
            if ($nr >= 0 && $nr < $R && $nc >= 0 && $nc < $C && $board[$nr][$nc] !== '*') {
                $dfs($nr, $nc, $node);
            }
        }
        $board[$r][$c] = $ch;                                // un-mark
        if (!$node) unset($parent[$ch]);                     // prune an exhausted branch
    };
    for ($r = 0; $r < $R; $r++) for ($c = 0; $c < $C; $c++) $dfs($r, $c, $root);
    sort($found);
    return $found;
}

$board = array_map('str_split', ['oaan', 'etae', 'ihkr', 'iflv']);
assert(findWords($board, ['oath', 'pea', 'eat', 'rain']) === ['eat', 'oath']);
assert(findWords([['a', 'b'], ['c', 'd']], ['abcb']) === []);
assert(findWords([['a', 'a']], ['aaa', 'aa', 'a']) === ['a', 'aa']);
```

**Python:**
```python
def find_words(board: list[list[str]], words: list[str]) -> list[str]:
    root: dict = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["#"] = w
    R, C, found = len(board), len(board[0]), []

    def dfs(r: int, c: int, parent: dict) -> None:
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:
            return
        if "#" in node:
            found.append(node.pop("#"))
        board[r][c] = "*"
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and board[nr][nc] != "*":
                dfs(nr, nc, node)
        board[r][c] = ch
        if not node:
            del parent[ch]

    for r in range(R):
        for c in range(C):
            dfs(r, c, root)
    return sorted(found)

b = [list(r) for r in ["oaan", "etae", "ihkr", "iflv"]]
assert find_words(b, ["oath", "pea", "eat", "rain"]) == ["eat", "oath"]
assert find_words([["a", "a"]], ["aaa", "aa", "a"]) == ["a", "aa"]
```

**Complexity:** Time O(R·C · 4 · 3^(L−1)) worst · Space O(মোট অক্ষর)।
**Mistakes:** একই শব্দ একাধিক পথে পাওয়া → `#` মুছে দাও; visited ফেরত না দেওয়া (`board[r][c] = ch`); PHP-তে trie node reference (`&`) দিয়ে না পাঠালে `unset` আসল trie-তে লাগে না।

🎤 **Say this while coding:** "Searching each word separately repeats the same grid walks. With all words in a trie, one DFS per cell follows the trie and stops the moment the current path isn't a prefix of any word; I remove found words and empty branches so the trie shrinks as I go."

---

## 2. Maximum XOR of Two Numbers in an Array  ·  LC 421

**Problem:** `nums[i] XOR nums[j]`-এর সর্বোচ্চ মান।
**Example:** `[3,10,5,25,2,8] → 28` (5 XOR 25)
**Constraints:** `n ≤ 2·10⁵`, `0 ≤ x < 2³¹`

**Pattern:** Bit trie — XOR বড় হয় যখন উঁচু bit আলাদা। প্রতিটা সংখ্যার জন্য trie-তে MSB থেকে নামো, প্রতি bit-এ **উল্টো** bit-এর দিকে যেতে চেষ্টা করো (পারলে সেই bit 1)।

**Approach:**
1. Brute force: সব জোড়া — O(n²)।
2. প্রতিটা সংখ্যা: আগে trie-তে query (এখন পর্যন্ত সেরা সঙ্গী), তারপর insert। O(n · 31)।

**PHP:**
```php
<?php
function findMaximumXOR(array $nums): int
{
    $trie = [[null, null]];                 // node pool: each node = [child0, child1]
    $insert = function (int $x) use (&$trie): void {
        $cur = 0;
        for ($b = 30; $b >= 0; $b--) {
            $bit = ($x >> $b) & 1;
            if ($trie[$cur][$bit] === null) { $trie[] = [null, null]; $trie[$cur][$bit] = count($trie) - 1; }
            $cur = $trie[$cur][$bit];
        }
    };
    $best = 0;
    $insert($nums[0]);
    for ($i = 1; $i < count($nums); $i++) {
        $x = $nums[$i]; $cur = 0; $xor = 0;
        for ($b = 30; $b >= 0; $b--) {
            $want = (($x >> $b) & 1) ^ 1;   // opposite bit makes this XOR bit 1
            if ($trie[$cur][$want] !== null) { $xor |= 1 << $b; $cur = $trie[$cur][$want]; }
            else $cur = $trie[$cur][$want ^ 1];
        }
        $best = max($best, $xor);
        $insert($x);
    }
    return $best;
}

assert(findMaximumXOR([3, 10, 5, 25, 2, 8]) === 28);
assert(findMaximumXOR([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]) === 127);
assert(findMaximumXOR([0]) === 0);
```

> PHP নোট: node pool (flat array + index) nested array-এর চেয়ে দ্রুত আর reference-এর ঝামেলা নেই।

**Python:**
```python
def find_maximum_xor(nums: list[int]) -> int:
    trie: list[list[int]] = [[-1, -1]]

    def insert(x: int) -> None:
        cur = 0
        for b in range(30, -1, -1):
            bit = (x >> b) & 1
            if trie[cur][bit] == -1:
                trie.append([-1, -1])
                trie[cur][bit] = len(trie) - 1
            cur = trie[cur][bit]

    best = 0
    insert(nums[0])
    for x in nums[1:]:
        cur, xor = 0, 0
        for b in range(30, -1, -1):
            want = ((x >> b) & 1) ^ 1
            if trie[cur][want] != -1:
                xor |= 1 << b
                cur = trie[cur][want]
            else:
                cur = trie[cur][want ^ 1]
        best = max(best, xor)
        insert(x)
    return best

assert find_maximum_xor([3, 10, 5, 25, 2, 8]) == 28
assert find_maximum_xor([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]) == 127
```

**Complexity:** Time O(n · 31) · Space O(n · 31)।
**Mistakes:** LSB থেকে trie বানানো — greedy কাজ করে শুধু MSB থেকে (উঁচু bit-এর মূল্য নিচের সব bit মিলিয়ে বেশি)।

🎤 **Say this while coding:** "A higher bit outweighs all lower bits combined, so I greedily pick, from the most significant bit down, the trie branch with the opposite bit whenever it exists."
