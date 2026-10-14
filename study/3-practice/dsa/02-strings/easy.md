# 02 — Strings — Easy

> Part of the Strings pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Valid Anagram — LC 242 → *worked below*
- [ ] Valid Palindrome — LC 125 → *worked below*
- [ ] Reverse String — LC 344 → *worked below*
- [ ] Reverse Words in a String III — LC 557
- [ ] First Unique Character in a String — LC 387
- [ ] Longest Common Prefix — LC 14
- [ ] Implement strStr() / indexOf — LC 28
- [ ] Roman to Integer — LC 13
- [ ] Isomorphic Strings — LC 205
- [ ] Ransom Note — LC 383

---

## Worked Solutions

### Valid Anagram — LC 242  *(frequency map)*
```php
function isAnagram(string $s, string $t): bool {
    if (strlen($s) !== strlen($t)) return false;
    $count = [];
    for ($i = 0; $i < strlen($s); $i++) $count[$s[$i]] = ($count[$s[$i]] ?? 0) + 1;
    for ($i = 0; $i < strlen($t); $i++) {
        if (!isset($count[$t[$i]]) || --$count[$t[$i]] < 0) return false;
    }
    return true;
}
// isAnagram("anagram","nagaram") -> true | Time O(n), Space O(1) (<=26 keys)
```

### Valid Palindrome — LC 125  *(two pointers, skip non-alnum)*
```php
function isPalindrome(string $s): bool {
    $s = strtolower($s);
    $l = 0; $r = strlen($s) - 1;
    while ($l < $r) {
        if (!ctype_alnum($s[$l])) { $l++; continue; }  // skip junk
        if (!ctype_alnum($s[$r])) { $r--; continue; }
        if ($s[$l++] !== $s[$r--]) return false;
    }
    return true;
}
// isPalindrome("A man, a plan, a canal: Panama") -> true | O(n) / O(1)
```

### Reverse String — LC 344  *(in-place two pointers)*
```php
function reverseString(array &$s): void {
    $l = 0; $r = count($s) - 1;
    while ($l < $r) { [$s[$l], $s[$r]] = [$s[$r], $s[$l]]; $l++; $r--; }
}
// ['h','e','l','l','o'] -> ['o','l','l','e','h'] | O(n) / O(1)
```
