---
id: ps-trie-medium
title: "19 — Trie — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, trie]
updated: 2026-11-14
---

# 19 — Trie — Medium

> **Pattern চেনার সংকেত:** wildcard `.` → trie + DFS (`.`-এ সব child চেষ্টা)। "প্রতিটা শব্দকে তার সবচেয়ে ছোট root দিয়ে বদলাও" → root-গুলোর trie, শব্দ ধরে নামো, প্রথম `end`-এ থামো। "typing করতে করতে suggestion" → trie node-এ top-3 রাখো।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Design Add and Search Words Data Structure ⭐ | LC 211 | ⬜ | — | — |
| 2 | Replace Words | LC 648 | ⬜ | — | — |
| 3 | Search Suggestions System | LC 1268 *(trie, বা sort + binary search)* | ⬜ | — | — |
| 4 | Map Sum Pairs | LC 677 *(node-এ চলমান যোগফল)* | ⬜ | — | — |

---

## 1. Design Add and Search Words Data Structure  ·  LC 211

**Problem:** `addWord(word)`, `search(word)` — `word`-এ `.` যেকোনো এক অক্ষরের সাথে মেলে।
**Example:** add bad, dad, mad → search "pad"=false, "bad"=true, ".ad"=true, "b.."=true

**Pattern:** Trie + DFS — সাধারণ অক্ষরে এক পথ, `.`-এ সব child।

**PHP:**
```php
<?php
final class WordDictionary
{
    private array $root = [];

    public function addWord(string $word): void
    {
        $node = &$this->root;
        foreach (str_split($word) as $ch) { $node[$ch] ??= []; $node = &$node[$ch]; }
        $node['$'] = true;
    }

    public function search(string $word): bool
    {
        return $this->dfs($this->root, $word, 0);
    }

    private function dfs(array $node, string $w, int $i): bool
    {
        if ($i === strlen($w)) return isset($node['$']);
        $ch = $w[$i];
        if ($ch !== '.') return isset($node[$ch]) && $this->dfs($node[$ch], $w, $i + 1);
        foreach ($node as $k => $child) {                 // wildcard: try every branch
            if ($k !== '$' && $this->dfs($child, $w, $i + 1)) return true;
        }
        return false;
    }
}

$d = new WordDictionary();
foreach (['bad', 'dad', 'mad'] as $w) $d->addWord($w);
assert($d->search('pad') === false);
assert($d->search('bad') === true);
assert($d->search('.ad') === true);
assert($d->search('b..') === true);
assert($d->search('...') === true && $d->search('..') === false);
```

**Python:**
```python
class WordDictionary:
    def __init__(self):
        self.root: dict = {}

    def add_word(self, word: str) -> None:
        node = self.root
        for ch in word:
            node = node.setdefault(ch, {})
        node["$"] = True

    def search(self, word: str) -> bool:
        def dfs(node: dict, i: int) -> bool:
            if i == len(word):
                return "$" in node
            ch = word[i]
            if ch != ".":
                return ch in node and dfs(node[ch], i + 1)
            return any(dfs(child, i + 1) for k, child in node.items() if k != "$")
        return dfs(self.root, 0)

d = WordDictionary()
for w in ("bad", "dad", "mad"):
    d.add_word(w)
assert d.search(".ad") and d.search("b..") and not d.search("pad") and not d.search("..")
```

**Complexity:** add O(L); search O(L) সাধারণ, worst O(26^dots · L) · Space O(মোট অক্ষর)।
**Mistakes:** `.`-এর loop-এ `'$'` key-কে child ধরে নেওয়া (PHP-তে `$node['$']` bool, array না → TypeError)।

🎤 **Say this while coding:** "Normal characters follow a single path; a dot branches into every child, so search is a DFS that returns as soon as one branch matches."

---

## 2. Replace Words  ·  LC 648

**Problem:** root-এর list আর একটা বাক্য; প্রতিটা শব্দ যদি কোনো root দিয়ে শুরু হয়, সবচেয়ে **ছোট** root দিয়ে বদলাও।
**Example:** `["cat","bat","rat"], "the cattle was rattled by the battery" → "the cat was rat by the bat"`

**Pattern:** Root-গুলোর trie; প্রতিটা শব্দ ধরে নামো, প্রথম `end` node-এ থামো।

**PHP:**
```php
<?php
function replaceWords(array $dictionary, string $sentence): string
{
    $root = [];
    foreach ($dictionary as $w) {
        $node = &$root;
        foreach (str_split($w) as $ch) { $node[$ch] ??= []; $node = &$node[$ch]; }
        $node['$'] = true;
        unset($node);
    }
    $out = [];
    foreach (explode(' ', $sentence) as $word) {
        $node = $root; $prefix = ''; $replaced = $word;
        foreach (str_split($word) as $ch) {
            if (!isset($node[$ch])) break;
            $node = $node[$ch];
            $prefix .= $ch;
            if (isset($node['$'])) { $replaced = $prefix; break; }   // shortest root wins
        }
        $out[] = $replaced;
    }
    return implode(' ', $out);
}

assert(replaceWords(['cat', 'bat', 'rat'], 'the cattle was rattled by the battery') === 'the cat was rat by the bat');
assert(replaceWords(['a', 'b', 'c'], 'aadsfasf absbs bbab cadsfafs') === 'a a b c');
assert(replaceWords(['catt', 'cat'], 'cattle') === 'cat');
```

**Python:**
```python
def replace_words(dictionary: list[str], sentence: str) -> str:
    root: dict = {}
    for w in dictionary:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = True

    def shortest_root(word: str) -> str:
        node = root
        for i, ch in enumerate(word):
            if ch not in node:
                return word
            node = node[ch]
            if "$" in node:
                return word[: i + 1]
        return word

    return " ".join(shortest_root(w) for w in sentence.split())

assert replace_words(["cat", "bat", "rat"], "the cattle was rattled by the battery") == "the cat was rat by the bat"
```

**Complexity:** Time O(মোট অক্ষর) · Space O(dictionary-র অক্ষর)।
**Mistakes:** প্রথম `end`-এ না থেমে লম্বা root নেওয়া (`["catt","cat"]`)।

🎤 **Say this while coding:** "I put the roots in a trie and walk each word down it, stopping at the first node that ends a root — that's automatically the shortest one."
