# 06 — Linked List — Easy

> Part of the Linked List pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Reverse Linked List — LC 206 → *worked below*
- [ ] Merge Two Sorted Lists — LC 21 → *worked below*
- [ ] Linked List Cycle — LC 141 ⭐ → *worked below*
- [ ] Middle of the Linked List — LC 876 → *worked below*
- [ ] Palindrome Linked List — LC 234 *(find middle, reverse half, compare)*
- [ ] Remove Duplicates from Sorted List — LC 83
- [ ] Intersection of Two Linked Lists — LC 160
- [ ] Remove Linked List Elements — LC 203

**⭐ Priority in this file:** Linked List Cycle (LC 141).

---

## Worked Solutions

### ⭐ Linked List Cycle (detect) — LC 141  *(Floyd's fast & slow)*
```php
function hasCycle(?ListNode $head): bool {
    $slow = $fast = $head;
    while ($fast && $fast->next) {
        $slow = $slow->next;            // +1
        $fast = $fast->next->next;      // +2
        if ($slow === $fast) return true; // pointers collided -> loop
    }
    return false;                       // fast reached null -> no loop
}
// Time O(n), Space O(1) — the O(1) space is the whole point vs a hash set
```

### Reverse Linked List — LC 206  *(pointer flip)*
```php
function reverseList(?ListNode $head): ?ListNode {
    $prev = null;
    while ($head) {
        $next = $head->next;
        $head->next = $prev;
        $prev = $head;
        $head = $next;
    }
    return $prev;
}
// 1->2->3 becomes 3->2->1 | O(n) / O(1)
```

### Merge Two Sorted Lists — LC 21  *(dummy head + splice)*
```php
function mergeTwoLists(?ListNode $a, ?ListNode $b): ?ListNode {
    $dummy = new ListNode();
    $tail = $dummy;
    while ($a && $b) {
        if ($a->val <= $b->val) { $tail->next = $a; $a = $a->next; }
        else                    { $tail->next = $b; $b = $b->next; }
        $tail = $tail->next;
    }
    $tail->next = $a ?? $b;             // attach the remaining run
    return $dummy->next;
}
// [1,2,4]+[1,3,4] -> [1,1,2,3,4,4] | O(n+m) / O(1)
```

### Middle of the Linked List — LC 876  *(fast/slow)*
```php
function middleNode(?ListNode $head): ?ListNode {
    $slow = $fast = $head;
    while ($fast && $fast->next) { $slow = $slow->next; $fast = $fast->next->next; }
    return $slow;                       // fast off the end -> slow at middle
}
// [1,2,3,4,5] -> node 3 ; [1,2,3,4] -> node 3 (second middle) | O(n) / O(1)
```
