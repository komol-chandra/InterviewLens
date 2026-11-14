# 06 — Linked List — Medium

> Part of the Linked List pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Add Two Numbers — LC 2 *(carry + dummy head)*
- [ ] Remove Nth Node From End — LC 19 → *worked below*
- [ ] Reorder List — LC 143 *(middle + reverse + merge)*
- [ ] Odd Even Linked List — LC 328
- [ ] Linked List Cycle II (find start) — LC 142 → *worked below*
- [ ] Rotate List — LC 61
- [ ] Copy List with Random Pointer — LC 138 *(hash old→new, or interleave)*

---

## Worked Solutions

### Remove Nth Node From End — LC 19  *(two-pointer gap + dummy)*
```php
function removeNthFromEnd(?ListNode $head, int $n): ?ListNode {
    $dummy = new ListNode(0, $head);
    $lead = $lag = $dummy;
    for ($i = 0; $i < $n; $i++) $lead = $lead->next;  // open a gap of n
    while ($lead->next) { $lead = $lead->next; $lag = $lag->next; }
    $lag->next = $lag->next->next;                     // skip the target
    return $dummy->next;
}
// remove 2nd-from-end of 1->2->3->4->5 -> 1->2->3->5 | O(n) / O(1)
```

### Linked List Cycle II (find start) — LC 142  *(Floyd phase 2)*
```php
function detectCycle(?ListNode $head): ?ListNode {
    $slow = $fast = $head;
    while ($fast && $fast->next) {
        $slow = $slow->next; $fast = $fast->next->next;
        if ($slow === $fast) {                 // meeting point found
            $p = $head;
            while ($p !== $slow) { $p = $p->next; $slow = $slow->next; }
            return $p;                          // entry of the cycle
        }
    }
    return null;
}
// Math fact: distance head->entry == distance meeting->entry | O(n) / O(1)
```
