---
id: ps-strings-hard
title: "02 — Strings — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, strings]
updated: 2026-11-14
---

# 02 — Strings — Hard

> **Pattern চেনার সংকেত:** "pattern খোঁজো O(n+m)-এ" বা "prefix যেটা suffix-ও" → KMP-এর LPS (failure) array। "লাইনে ঠিক W অক্ষর, ফাঁকা সমানভাবে ভাগ" → simulation, গুনে গুনে। "minimum window যেখানে সব অক্ষর আছে" → sliding window ([04 hard](../04-two-pointers-sliding-window/hard.md))।
> **লাইভ কোডিং স্ক্রিপ্ট:** clarify → brute force বলো → optimize → code → test — [live-coding-script.md](../live-coding-script.md)।
> প্যাটার্নের ব্যাখ্যা: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Find the Index of the First Occurrence (KMP) ⭐ | LC 28 | ⬜ | — | — |
| 2 | Shortest Palindrome | LC 214 | ⬜ | — | — |
| 3 | Text Justification | LC 68 | ⬜ | — | — |
| 4 | Minimum Window Substring | LC 76 *(worked in [04 hard](../04-two-pointers-sliding-window/hard.md))* | ⬜ | — | — |
| 5 | Regular Expression Matching | LC 10 *(2-D DP, [12](../12-dp/))* | ⬜ | — | — |
| 6 | Longest Valid Parentheses | LC 32 *(worked in [05 hard](../05-stack-queue/hard.md))* | ⬜ | — | — |

---

## 1. Find the Index of the First Occurrence — KMP  ·  LC 28

**Problem:** `haystack`-এ `needle` প্রথম কোথায় শুরু হয় (না থাকলে −1)। LC-তে easy, কিন্তু ইন্টারভিউতে "O(n+m)-এ করো" বললে এটা hard — KMP লাগে।
**Example:** `"sadbutsad", "sad" → 0` · `"aabaaabaaac", "aabaaac" → 4`
**Constraints:** `1 ≤ n, m ≤ 10⁴`

**Pattern:** KMP — কারণ mismatch হলে শুরু থেকে আবার না মিলিয়ে, needle-এর যে অংশ ইতিমধ্যে মিলেছে তার "longest proper prefix যেটা suffix-ও" (LPS) পর্যন্ত লাফাও।

**Approach:**
1. Brute force: প্রতিটা শুরুর জায়গা থেকে মেলাও — O(n·m)।
2. Optimized: `lps[i]` = `needle[0..i]`-এর সবচেয়ে লম্বা proper prefix যেটা suffix-ও। মেলানোর সময় mismatch হলে `j = lps[j-1]` — haystack-এর pointer কখনো পেছনে যায় না।

**PHP:**
```php
<?php
function buildLps(string $p): array
{
    $m = strlen($p);
    $lps = array_fill(0, $m, 0);
    $len = 0;                                  // length of current matched prefix
    for ($i = 1; $i < $m; $i++) {
        while ($len > 0 && $p[$i] !== $p[$len]) $len = $lps[$len - 1];
        if ($p[$i] === $p[$len]) $len++;
        $lps[$i] = $len;
    }
    return $lps;
}

function kmpSearch(string $haystack, string $needle): int
{
    $lps = buildLps($needle);
    $j = 0;
    for ($i = 0; $i < strlen($haystack); $i++) {
        while ($j > 0 && $haystack[$i] !== $needle[$j]) $j = $lps[$j - 1];
        if ($haystack[$i] === $needle[$j]) $j++;
        if ($j === strlen($needle)) return $i - $j + 1;
    }
    return -1;
}

assert(buildLps('aabaaac') === [0, 1, 0, 1, 2, 2, 0]);
assert(kmpSearch('sadbutsad', 'sad') === 0);
assert(kmpSearch('leetcode', 'leeto') === -1);
assert(kmpSearch('aabaaabaaac', 'aabaaac') === 4);
```

**Python:**
```python
def build_lps(p: str) -> list[int]:
    lps = [0] * len(p)
    length = 0
    for i in range(1, len(p)):
        while length and p[i] != p[length]:
            length = lps[length - 1]
        if p[i] == p[length]:
            length += 1
        lps[i] = length
    return lps

def str_str(haystack: str, needle: str) -> int:
    lps = build_lps(needle)
    j = 0
    for i, ch in enumerate(haystack):
        while j and ch != needle[j]:
            j = lps[j - 1]
        if ch == needle[j]:
            j += 1
        if j == len(needle):
            return i - j + 1
    return -1

assert build_lps("aabaaac") == [0, 1, 0, 1, 2, 2, 0]
assert str_str("sadbutsad", "sad") == 0
assert str_str("aabaaabaaac", "aabaaac") == 4
```

**Complexity:** Time O(n + m) · Space O(m) — `i` শুধু সামনে যায়, `j` মোট যতবার বাড়ে তার বেশি কমতে পারে না।

**Mistakes / edge cases:**
- LPS বানাতে `i` 1 থেকে শুরু (0 থেকে শুরু করলে পুরো string নিজেই prefix হয়ে যায়)।
- mismatch-এ `if` না, `while` — একাধিকবার পেছনে লাফাতে হতে পারে।
- PHP-তে `strpos` আছে (আর `strStr` নামটা PHP-র built-in `strstr`-এর সাথে clash করে, তাই নাম `kmpSearch`); ইন্টারভিউয়ার নিষেধ না করলে প্রথমে সেটা উল্লেখ করো, তারপর KMP।

🎤 **Say this while coding:** "When a mismatch happens I don't restart from scratch — the LPS table tells me how much of the needle is still matched, so the haystack pointer never moves backwards."

---

## 2. Shortest Palindrome  ·  LC 214

**Problem:** string `s`-এর **সামনে** সবচেয়ে কম অক্ষর যোগ করে palindrome বানাও।
**Example:** `"aacecaaa" → "aaacecaaa"` · `"abcd" → "dcbabcd"`
**Constraints:** `0 ≤ n ≤ 5·10⁴`

**Pattern:** KMP-এর LPS — কারণ আসল প্রশ্ন: `s`-এর সবচেয়ে লম্বা palindromic **prefix** কোনটা? `s + '#' + reverse(s)`-এর শেষ LPS মান ঠিক সেটা।

**Approach:**
1. Brute force: প্রতিটা prefix palindrome কি না চেক, লম্বা থেকে ছোট — O(n²)।
2. Optimized: `t = s + '#' + rev(s)`; `k = lps(t)[last]` = সবচেয়ে লম্বা palindromic prefix-এর দৈর্ঘ্য। বাকি অংশ `s[k:]` উল্টে সামনে বসাও। `#` রাখা হয় যাতে match দুই অংশ পেরিয়ে না যায়।

**PHP:**
```php
<?php
function shortestPalindrome(string $s): string
{
    $t = $s . '#' . strrev($s);
    $lps = array_fill(0, strlen($t), 0);
    $len = 0;
    for ($i = 1; $i < strlen($t); $i++) {
        while ($len > 0 && $t[$i] !== $t[$len]) $len = $lps[$len - 1];
        if ($t[$i] === $t[$len]) $len++;
        $lps[$i] = $len;
    }
    $k = $lps[strlen($t) - 1];                 // longest palindromic prefix of s
    return strrev(substr($s, $k)) . $s;
}

assert(shortestPalindrome('aacecaaa') === 'aaacecaaa');
assert(shortestPalindrome('abcd') === 'dcbabcd');
assert(shortestPalindrome('') === '');
assert(shortestPalindrome('aba') === 'aba');
```

**Python:**
```python
def shortest_palindrome(s: str) -> str:
    t = s + "#" + s[::-1]
    lps = [0] * len(t)
    length = 0
    for i in range(1, len(t)):
        while length and t[i] != t[length]:
            length = lps[length - 1]
        if t[i] == t[length]:
            length += 1
        lps[i] = length
    k = lps[-1]
    return s[k:][::-1] + s

assert shortest_palindrome("aacecaaa") == "aaacecaaa"
assert shortest_palindrome("abcd") == "dcbabcd"
assert shortest_palindrome("") == ""
```

**Complexity:** Time O(n) · Space O(n)।

**Mistakes / edge cases:**
- separator `#` বাদ দিলে `"aaa"`-এর মতো ইনপুটে LPS `n`-এর বেশি হয়ে যায়।
- খালি string।

🎤 **Say this while coding:** "The question is really: what is the longest palindromic prefix? If I glue the string to its reverse with a separator, the KMP failure value at the end gives exactly that length."

---

## 3. Text Justification  ·  LC 68

**Problem:** শব্দের list আর `maxWidth`; প্রতিটা লাইন ঠিক `maxWidth` অক্ষরের হবে, ফাঁকা শব্দগুলোর মাঝে যতটা সম্ভব সমানভাবে, বেশি ফাঁকা বাঁ দিকে। শেষ লাইন আর এক-শব্দের লাইন left-justified।
**Example:** `["This","is","an","example","of","text","justification."], 16 →`
`["This    is    an", "example  of text", "justification.  "]`
**Constraints:** `1 ≤ words ≤ 300`, প্রতিটা শব্দ ≤ maxWidth।

**Pattern:** Greedy simulation — কারণ যতগুলো শব্দ ধরে ততগুলো লাইনে নাও, তারপর হিসাব করে space ভাগ করো। এখানে কোনো চালাকি নেই; ঝুঁকি শুধু off-by-one।

**Approach:**
1. `i` থেকে শুরু করে শব্দ যোগ করো যতক্ষণ `letters + words_in_line + len(next) ≤ maxWidth` (প্রতি gap-এ কমপক্ষে ১টা space)।
2. মোট space = `maxWidth − letters`; gap = শব্দ − 1। প্রতিটা gap পায় `space / gaps`, প্রথম `space % gaps` টা gap একটা বেশি।
3. শেষ লাইন বা gap = 0 → শব্দ `' '` দিয়ে জোড়া, ডানে padding।

**PHP:**
```php
<?php
function fullJustify(array $words, int $maxWidth): array
{
    $res = [];
    $i = 0; $n = count($words);
    while ($i < $n) {
        $j = $i; $letters = 0;
        while ($j < $n && $letters + strlen($words[$j]) + ($j - $i) <= $maxWidth) {
            $letters += strlen($words[$j]);
            $j++;
        }
        $line = array_slice($words, $i, $j - $i);
        $gaps = count($line) - 1;
        if ($j === $n || $gaps === 0) {                       // last line or single word
            $res[] = str_pad(implode(' ', $line), $maxWidth);
        } else {
            $spaces = $maxWidth - $letters;
            $each = intdiv($spaces, $gaps);
            $extra = $spaces % $gaps;
            $s = '';
            foreach ($line as $k => $w) {
                $s .= $w;
                if ($k < $gaps) $s .= str_repeat(' ', $each + ($k < $extra ? 1 : 0));
            }
            $res[] = $s;
        }
        $i = $j;
    }
    return $res;
}

assert(fullJustify(['This', 'is', 'an', 'example', 'of', 'text', 'justification.'], 16) ===
    ['This    is    an', 'example  of text', 'justification.  ']);
assert(fullJustify(['What', 'must', 'be', 'acknowledgment', 'shall', 'be'], 16) ===
    ['What   must   be', 'acknowledgment  ', 'shall be        ']);
```

**Python:**
```python
def full_justify(words: list[str], max_width: int) -> list[str]:
    res, i, n = [], 0, len(words)
    while i < n:
        j, letters = i, 0
        while j < n and letters + len(words[j]) + (j - i) <= max_width:
            letters += len(words[j])
            j += 1
        line = words[i:j]
        gaps = len(line) - 1
        if j == n or gaps == 0:
            res.append(" ".join(line).ljust(max_width))
        else:
            each, extra = divmod(max_width - letters, gaps)
            s = ""
            for k, w in enumerate(line[:-1]):
                s += w + " " * (each + (1 if k < extra else 0))
            res.append(s + line[-1])
        i = j
    return res

assert full_justify(["This", "is", "an", "example", "of", "text", "justification."], 16) == [
    "This    is    an", "example  of text", "justification.  "]
```

**Complexity:** Time O(total chars) · Space O(maxWidth) প্রতি লাইনে।

**Mistakes / edge cases:**
- শব্দ যোগের শর্তে gap-এর ন্যূনতম space (`j - i`) ভুলে যাওয়া।
- এক-শব্দের লাইনে `gaps = 0` → division by zero।
- শেষ লাইন left-justify না করা।

🎤 **Say this while coding:** "This is pure simulation, so I'll be careful with counting: greedily pack words while letters plus one space per gap fit, then spread the remaining spaces, giving the extras to the leftmost gaps."

🔗 DistroSaaS: Text Justification-এর মতো fixed-width ফরম্যাটিং — **[Komol পূরণ করবে: থার্মাল প্রিন্ট/ইনভয়েস লেআউটের কোনো কাজ থাকলে স্টোরি ID]**; না থাকলে বলো: "It's the same discipline as formatting a fixed-width report — count first, then distribute."
