# 02 — Strings — Medium

> Part of the Strings pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Longest Substring Without Repeating Characters — LC 3 *(see two-pointers-sliding-window pattern)*
- [ ] Longest Palindromic Substring — LC 5 → *worked below*
- [ ] Group Anagrams — LC 49 → *worked below*
- [ ] String to Integer (atoi) — LC 8
- [ ] Longest Repeating Character Replacement — LC 424 *(see two-pointers-sliding-window pattern)*
- [ ] Palindromic Substrings (count) — LC 647
- [ ] Encode and Decode Strings — LC 271
- [ ] Generate Parentheses — LC 22 *(see recursion-backtracking pattern)*
- [ ] Integer to Roman — LC 12
- [ ] Count and Say — LC 38

---

## Worked Solutions

### Group Anagrams — LC 49  *(sorted-key hash map)*
```php
function groupAnagrams(array $strs): array {
    $groups = [];
    foreach ($strs as $w) {
        $chars = str_split($w);
        sort($chars);
        $key = implode('', $chars);         // canonical signature
        $groups[$key][] = $w;
    }
    return array_values($groups);
}
// ["eat","tea","tan","ate","nat","bat"] -> [["eat","tea","ate"],["tan","nat"],["bat"]] | O(n·k log k)
```

### Longest Palindromic Substring — LC 5  *(expand around center)*
```php
function longestPalindrome(string $s): string {
    if ($s === '') return '';
    $start = 0; $len = 0; $n = strlen($s);
    $grow = function ($l, $r) use ($s, $n) {
        while ($l >= 0 && $r < $n && $s[$l] === $s[$r]) { $l--; $r++; }
        return [$l + 1, $r - $l - 1];        // [start, length]
    };
    for ($i = 0; $i < $n; $i++) {
        foreach ([$grow($i, $i), $grow($i, $i + 1)] as [$st, $ln]) { // odd + even centers
            if ($ln > $len) { $start = $st; $len = $ln; }
        }
    }
    return substr($s, $start, $len);
}
// longestPalindrome("babad") -> "bab" (or "aba") | O(n²) / O(1)
```
