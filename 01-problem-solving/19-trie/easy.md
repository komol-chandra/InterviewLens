---
id: ps-trie-easy
title: "19 — Trie — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, trie]
updated: 2026-11-14
---

# 19 — Trie — Easy

> **Pattern চেনার সংকেত:** "insert / search / startsWith" → trie implement করো। "সব শব্দের common prefix" → trie-তে root থেকে নিচে নামো যতক্ষণ ঠিক একটা child আর কোনো শব্দ শেষ হয়নি।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Implement Trie (Prefix Tree) ⭐ | LC 208 *(LC-তে medium; ভিত্তি তাই এখানে)* | ⬜ | — | — |
| 2 | Longest Common Prefix (trie দিয়ে) | LC 14 | ⬜ | — | — |
| 3 | Longest Word in Dictionary | LC 720 | ⬜ | — | — |

---

## 1. Implement Trie (Prefix Tree)  ·  LC 208

**Problem:** `insert(word)`, `search(word)` (পুরো শব্দ), `startsWith(prefix)`।
**Example:** insert "apple"; search "apple"→true; search "app"→false; startsWith "app"→true; insert "app"; search "app"→true

**Pattern:** Node class — `children` map + `isEnd`। (array-ভিত্তিক ছোট রূপ [overview](00-pattern-overview.md)-তে।)

**PHP:**
```php
<?php
final class TrieNode
{
    /** @var array<string, TrieNode> */
    public array $children = [];
    public bool $isEnd = false;
}

final class Trie
{
    private TrieNode $root;

    public function __construct() { $this->root = new TrieNode(); }

    public function insert(string $word): void
    {
        $node = $this->root;                      // objects are handles: no & needed
        for ($i = 0; $i < strlen($word); $i++) {
            $node = $node->children[$word[$i]] ??= new TrieNode();
        }
        $node->isEnd = true;
    }

    private function find(string $s): ?TrieNode
    {
        $node = $this->root;
        for ($i = 0; $i < strlen($s); $i++) {
            $node = $node->children[$s[$i]] ?? null;
            if (!$node) return null;
        }
        return $node;
    }

    public function search(string $word): bool { return $this->find($word)?->isEnd ?? false; }
    public function startsWith(string $prefix): bool { return $this->find($prefix) !== null; }
}

$t = new Trie();
$t->insert('apple');
assert($t->search('apple') === true);
assert($t->search('app') === false);
assert($t->startsWith('app') === true);
$t->insert('app');
assert($t->search('app') === true);
assert($t->startsWith('b') === false);
```

**Python:**
```python
class TrieNode:
    __slots__ = ("children", "is_end")
    def __init__(self):
        self.children: dict[str, "TrieNode"] = {}
        self.is_end = False

class Trie:
    def __init__(self):
        self.root = TrieNode()

    def insert(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.children.setdefault(ch, TrieNode())
        node.is_end = True

    def _find(self, s: str):
        node = self.root
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word: str) -> bool:
        node = self._find(word)
        return bool(node and node.is_end)

    def starts_with(self, prefix: str) -> bool:
        return self._find(prefix) is not None

t = Trie()
t.insert("apple")
assert t.search("apple") and not t.search("app") and t.starts_with("app")
```

**Complexity:** প্রতিটা অপারেশন O(L) · Space O(মোট অক্ষর)।
**Mistakes:** object node-এ PHP-তে `&` লাগে না (object handle), কিন্তু nested array-তে লাগে — দুটো মিশিয়ে ফেলো না।

🎤 **Say this while coding:** "Each node maps a character to a child and flags whether a word ends there; search and startsWith share the same walk and differ only in checking that flag."

---

## 2. Longest Common Prefix (trie দিয়ে)  ·  LC 14

**Problem:** string-গুলোর সবচেয়ে লম্বা common prefix।
**Example:** `["flower","flow","flight"] → "fl"` · `["dog","racecar","car"] → ""`

**Pattern:** সব শব্দ trie-তে, তারপর root থেকে নামো যতক্ষণ node-এর **ঠিক একটা child** আর সেখানে কোনো শব্দ শেষ হয়নি।
> সরাসরি সমাধান (vertical scan) সহজ আর O(1) extra space — ইন্টারভিউতে আগে সেটা বলো; trie রূপটা দেখায় তুমি জানো অনেক query-তে কেন trie ভালো।

**PHP:**
```php
<?php
function longestCommonPrefix(array $strs): string
{
    $root = [];
    foreach ($strs as $w) {
        $node = &$root;
        foreach (str_split($w) as $ch) { $node[$ch] ??= []; $node = &$node[$ch]; }
        $node['$'] = true;
        unset($node);                            // break the reference before the next word
    }
    $prefix = ''; $node = $root;
    while (count($node) === 1 && !isset($node['$'])) {
        $ch = array_key_first($node);
        $prefix .= $ch;
        $node = $node[$ch];
    }
    return $prefix;
}

assert(longestCommonPrefix(['flower', 'flow', 'flight']) === 'fl');
assert(longestCommonPrefix(['dog', 'racecar', 'car']) === '');
assert(longestCommonPrefix(['ab', 'a']) === 'a');
assert(longestCommonPrefix(['solo']) === 'solo');
```

**Python:**
```python
def longest_common_prefix(strs: list[str]) -> str:
    root: dict = {}
    for w in strs:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True
    prefix, node = [], root
    while len(node) == 1 and "$" not in node:
        ch = next(iter(node))
        prefix.append(ch)
        node = node[ch]
    return "".join(prefix)

assert longest_common_prefix(["flower", "flow", "flight"]) == "fl" and longest_common_prefix(["ab", "a"]) == "a"
```

**Complexity:** Time O(মোট অক্ষর) · Space O(মোট অক্ষর)।
**Mistakes:** PHP-তে loop-এর পরে `unset($node)` না করলে পরের iteration-এ reference পুরনো জায়গায় লেখে; `$` চিহ্ন চেক না করলে `["ab","a"]`-এ `"ab"` ফেরত দেয়।

🎤 **Say this while coding:** "The common prefix is the path from the root while every node has exactly one child and no word has ended yet."

---

## 3. Longest Word in Dictionary  ·  LC 720

**Problem:** সবচেয়ে লম্বা শব্দ যেটা dictionary-র অন্য শব্দ থেকে একটা একটা অক্ষর যোগ করে তৈরি (প্রতিটা prefix dictionary-তে আছে); টাই হলে lexicographically ছোট।
**Example:** `["w","wo","wor","worl","world"] → "world"` · `["a","banana","app","appl","ap","apply","apple"] → "apple"`

**Pattern:** Trie + DFS শুধু `end` node দিয়ে — পথের প্রতিটা node শব্দের শেষ হতে হবে।

**PHP:**
```php
<?php
function longestWord(array $words): string
{
    $root = [];
    foreach ($words as $w) {
        $node = &$root;
        foreach (str_split($w) as $ch) { $node[$ch] ??= []; $node = &$node[$ch]; }
        $node['$'] = true;
        unset($node);
    }
    $best = '';
    $dfs = function (array $node, string $path) use (&$dfs, &$best): void {
        if (strlen($path) > strlen($best) || (strlen($path) === strlen($best) && $path < $best)) $best = $path;
        foreach ($node as $ch => $child) {
            if ($ch !== '$' && isset($child['$'])) $dfs($child, $path . $ch);   // only through complete words
        }
    };
    $dfs($root, '');
    return $best;
}

assert(longestWord(['w', 'wo', 'wor', 'worl', 'world']) === 'world');
assert(longestWord(['a', 'banana', 'app', 'appl', 'ap', 'apply', 'apple']) === 'apple');
assert(longestWord(['yo', 'ew', 'fc']) === '');
```

**Python:**
```python
def longest_word(words: list[str]) -> str:
    root: dict = {}
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True
    best = ""

    def dfs(node: dict, path: str) -> None:
        nonlocal best
        if (len(path), best) > (len(best), path):    # longer, or same length and smaller
            best = path
        for ch, child in node.items():
            if ch != "$" and "$" in child:
                dfs(child, path + ch)

    dfs(root, "")
    return best

assert longest_word(["a", "banana", "app", "appl", "ap", "apply", "apple"]) == "apple"
```

**Complexity:** Time O(মোট অক্ষর) · Space O(মোট অক্ষর)।
**Mistakes:** tie-break (lexicographic) ভুলে যাওয়া; প্রথম অক্ষরটাও একটা শব্দ হতে হবে (`"a"`)।

🎤 **Say this while coding:** "A word is buildable only if every prefix is a word, so I DFS the trie stepping only into nodes that end a word, and keep the longest path with a lexicographic tie-break."
