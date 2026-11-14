---
id: ps-linked-list-hard
title: "06 — Linked List — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, linked-list]
updated: 2026-11-14
---

# 06 — Linked List — Hard

> **Pattern চেনার সংকেত:** "k-টা করে উল্টাও" → group-এর আগের node (`groupPrev`) ধরে sub-list reverse। "k-টা sorted list merge" → min-heap-এ প্রতিটা list-এর head। "list sort, O(1) extra space" → merge sort (fast/slow দিয়ে মাঝখান)।
> **সবসময়:** dummy head নাও — head বদলাতে পারে এমন যেকোনো প্রবলেমে।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Reverse Nodes in k-Group ⭐ | LC 25 | ⬜ | — | — |
| 2 | Merge k Sorted Lists ⭐ | LC 23 | ⬜ | — | — |
| 3 | Sort List | LC 148 | ⬜ | — | — |
| 4 | LRU Cache | LC 146 *(worked in [03 hard](../03-hashing/hard.md))* | ⬜ | — | — |
| 5 | Copy List with Random Pointer | LC 138 *(interleave trick, O(1) space)* | ⬜ | — | — |

> নিচের সব কোডে একই helper: `ListNode`, array → list (`build`), list → array (`toArray`)।

---

## 1. Reverse Nodes in k-Group  ·  LC 25

**Problem:** linked list-এর node গুলো k-টা করে উল্টাও; শেষে k-এর কম থাকলে সেগুলো যেমন আছে।
**Example:** `1→2→3→4→5, k=2 → 2→1→4→3→5` · `k=3 → 3→2→1→4→5`
**Constraints:** `1 ≤ k ≤ n ≤ 5000`

**Pattern:** In-place reversal + dummy head — প্রতিটা group-এর আগের node (`groupPrev`) থেকে k-তম node খোঁজো, মাঝখানটা উল্টাও, জোড়া লাগাও।

**Approach:**
1. Brute force: মান array-তে কপি করে উল্টে আবার লেখা — O(n) space, আর ইন্টারভিউয়ার সাধারণত "node বদলাও, মান না" বলে।
2. Optimized: `kth = groupPrev`-থেকে k ধাপ; না পেলে থামো। `groupNext = kth.next`। `groupPrev.next … kth` উল্টাও (prev শুরু `groupNext` থেকে, তাতে শেষটা আপনা থেকে জুড়ে যায়)। তারপর `groupPrev` = পুরনো group-এর প্রথম node।

**PHP:**
```php
<?php
final class ListNode
{
    public function __construct(public int $val = 0, public ?ListNode $next = null) {}
}
function build(array $a): ?ListNode { $d = new ListNode(); $c = $d; foreach ($a as $v) { $c->next = new ListNode($v); $c = $c->next; } return $d->next; }
function toArray(?ListNode $h): array { $r = []; for (; $h; $h = $h->next) $r[] = $h->val; return $r; }

function reverseKGroup(?ListNode $head, int $k): ?ListNode
{
    $dummy = new ListNode(0, $head);
    $groupPrev = $dummy;
    while (true) {
        $kth = $groupPrev;
        for ($i = 0; $i < $k && $kth; $i++) $kth = $kth->next;
        if (!$kth) break;                         // fewer than k left
        $groupNext = $kth->next;
        $prev = $groupNext; $cur = $groupPrev->next;
        while ($cur !== $groupNext) {             // standard reversal inside the group
            $nxt = $cur->next;
            $cur->next = $prev;
            $prev = $cur;
            $cur = $nxt;
        }
        $first = $groupPrev->next;                // becomes the group's tail
        $groupPrev->next = $kth;
        $groupPrev = $first;
    }
    return $dummy->next;
}

assert(toArray(reverseKGroup(build([1, 2, 3, 4, 5]), 2)) === [2, 1, 4, 3, 5]);
assert(toArray(reverseKGroup(build([1, 2, 3, 4, 5]), 3)) === [3, 2, 1, 4, 5]);
assert(toArray(reverseKGroup(build([1]), 1)) === [1]);
assert(toArray(reverseKGroup(build([1, 2, 3, 4]), 4)) === [4, 3, 2, 1]);
```

**Python:**
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def build(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v); c = c.next
    return d.next

def to_list(h):
    r = []
    while h:
        r.append(h.val); h = h.next
    return r

def reverse_k_group(head, k):
    dummy = ListNode(0, head)
    group_prev = dummy
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return dummy.next
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            cur.next, prev, cur = prev, cur, cur.next
        first = group_prev.next
        group_prev.next = kth
        group_prev = first

assert to_list(reverse_k_group(build([1, 2, 3, 4, 5]), 2)) == [2, 1, 4, 3, 5]
assert to_list(reverse_k_group(build([1, 2, 3, 4, 5]), 3)) == [3, 2, 1, 4, 5]
```

**Complexity:** Time O(n) · Space O(1)।

**Mistakes / edge cases:**
- `prev`-কে `null` থেকে শুরু করলে group-এর শেষ পরের অংশের সাথে জোড়া লাগে না।
- `groupPrev->next = $kth`-এর **আগে** পুরনো প্রথম node (`$first`) সংরক্ষণ করো।
- Python-এর এক লাইনের multi-assign: `cur.next, prev, cur = prev, cur, cur.next` — ডান পাশ আগে পুরোটা evaluate হয়, তাই ঠিক আছে।

🎤 **Say this while coding:** "With a dummy node, every group looks the same: find the k-th node, reverse the segment by starting prev at the node after the group so it reconnects automatically, then move groupPrev to the old first node."

---

## 2. Merge k Sorted Lists  ·  LC 23

**Problem:** k-টা sorted linked list একটা sorted list-এ merge।
**Example:** `[[1,4,5],[1,3,4],[2,6]] → 1→1→2→3→4→4→5→6`
**Constraints:** `0 ≤ k ≤ 10⁴`, মোট node N ≤ 10⁴।

**Pattern:** Min-heap — প্রতিটা list-এর বর্তমান head heap-এ; সবচেয়ে ছোটটা বের করে তার next ঢোকাও।

**Approach:**
1. Brute force: সব মান array-তে, sort, নতুন list — O(N log N), O(N) space। অথবা এক এক করে merge — O(N·k)।
2. Optimized: heap-এ `(val, tiebreak, node)`; প্রতিটা pop/push O(log k)। বিকল্প: divide & conquer জোড়ায় জোড়ায় merge, একই O(N log k)।

**PHP:**
```php
<?php
final class ListNode
{
    public function __construct(public int $val = 0, public ?ListNode $next = null) {}
}
function build(array $a): ?ListNode { $d = new ListNode(); $c = $d; foreach ($a as $v) { $c->next = new ListNode($v); $c = $c->next; } return $d->next; }
function toArray(?ListNode $h): array { $r = []; for (; $h; $h = $h->next) $r[] = $h->val; return $r; }

function mergeKLists(array $lists): ?ListNode
{
    $pq = new SplPriorityQueue();               // max-heap -> negate priority for min
    $seq = 0;
    foreach ($lists as $h) {
        if ($h) $pq->insert($h, [-$h->val, $seq--]);   // second field breaks ties FIFO
    }
    $dummy = new ListNode(); $tail = $dummy;
    while (!$pq->isEmpty()) {
        $node = $pq->extract();
        $tail->next = $node; $tail = $node;
        if ($node->next) $pq->insert($node->next, [-$node->next->val, $seq--]);
    }
    $tail->next = null;
    return $dummy->next;
}

assert(toArray(mergeKLists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])])) === [1, 1, 2, 3, 4, 4, 5, 6]);
assert(toArray(mergeKLists([])) === []);
assert(toArray(mergeKLists([null, build([1])])) === [1]);
```

> PHP নোট: `SplPriorityQueue` **max**-heap; min চাইলে priority `-val`। priority হিসেবে array দিলে উপাদান ধরে তুলনা করে, তাই `[-val, seq]` টাই-ব্রেকার হিসেবে কাজ করে।

**Python:**
```python
import heapq

class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def build(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v); c = c.next
    return d.next

def to_list(h):
    r = []
    while h:
        r.append(h.val); h = h.next
    return r

def merge_k_lists(lists):
    heap = [(h.val, i, h) for i, h in enumerate(lists) if h]
    heapq.heapify(heap)
    dummy = tail = ListNode()
    counter = len(lists)
    while heap:
        _, _, node = heapq.heappop(heap)
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, counter, node.next))
            counter += 1
    return dummy.next

assert to_list(merge_k_lists([build([1, 4, 5]), build([1, 3, 4]), build([2, 6])])) == [1, 1, 2, 3, 4, 4, 5, 6]
assert to_list(merge_k_lists([])) == []
```

**Complexity:** Time O(N log k) · Space O(k)।

**Mistakes / edge cases:**
- Python heap-এ `(val, node)` রাখলে সমান val-এ node তুলনা করতে গিয়ে `TypeError` → মাঝে unique counter।
- `tail.next = tail = node` — Python বাম থেকে ডানে assign করে: আগে `tail.next = node`, তারপর `tail = node`। ঠিক আছে, কিন্তু উল্টো লিখলে ভুল।
- খালি list / `null` list।

🎤 **Say this while coding:** "At any moment the next smallest node is one of the k current heads, so I keep those heads in a min-heap — each step is log k, total N log k."

---

## 3. Sort List  ·  LC 148

**Problem:** linked list sort করো O(n log n) time-এ (follow-up: O(1) extra space)।
**Example:** `4→2→1→3 → 1→2→3→4`
**Constraints:** `0 ≤ n ≤ 5·10⁴`

**Pattern:** Merge sort — linked list-এ random access নেই, তাই quick sort খারাপ; merge sort-এর merge ধাপ list-এ O(1) space।

**Approach:**
1. Brute force: মান array-তে, sort, লেখা — O(n) space।
2. Optimized (top-down): slow/fast দিয়ে মাঝখান, দুই ভাগ কাটো, recursive sort, merge। (recursion stack O(log n); পুরো O(1) চাইলে bottom-up — size 1, 2, 4… করে merge।)

**PHP:**
```php
<?php
final class ListNode
{
    public function __construct(public int $val = 0, public ?ListNode $next = null) {}
}
function build(array $a): ?ListNode { $d = new ListNode(); $c = $d; foreach ($a as $v) { $c->next = new ListNode($v); $c = $c->next; } return $d->next; }
function toArray(?ListNode $h): array { $r = []; for (; $h; $h = $h->next) $r[] = $h->val; return $r; }

function mergeTwo(?ListNode $a, ?ListNode $b): ?ListNode
{
    $d = new ListNode(); $t = $d;
    while ($a && $b) {
        if ($a->val <= $b->val) { $t->next = $a; $a = $a->next; }
        else { $t->next = $b; $b = $b->next; }
        $t = $t->next;
    }
    $t->next = $a ?? $b;
    return $d->next;
}

function sortList(?ListNode $head): ?ListNode
{
    if (!$head || !$head->next) return $head;
    $slow = $head; $fast = $head->next;        // fast starts one ahead -> left half never empty
    while ($fast && $fast->next) { $slow = $slow->next; $fast = $fast->next->next; }
    $right = $slow->next;
    $slow->next = null;                         // cut
    return mergeTwo(sortList($head), sortList($right));
}

assert(toArray(sortList(build([4, 2, 1, 3]))) === [1, 2, 3, 4]);
assert(toArray(sortList(build([-1, 5, 3, 4, 0]))) === [-1, 0, 3, 4, 5]);
assert(toArray(sortList(build([]))) === []);
assert(toArray(sortList(build([2, 1]))) === [1, 2]);
```

**Python:**
```python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def build(a):
    d = c = ListNode()
    for v in a:
        c.next = ListNode(v); c = c.next
    return d.next

def to_list(h):
    r = []
    while h:
        r.append(h.val); h = h.next
    return r

def merge_two(a, b):
    d = t = ListNode()
    while a and b:
        if a.val <= b.val:
            t.next, a = a, a.next
        else:
            t.next, b = b, b.next
        t = t.next
    t.next = a or b
    return d.next

def sort_list(head):
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    right, slow.next = slow.next, None
    return merge_two(sort_list(head), sort_list(right))

assert to_list(sort_list(build([4, 2, 1, 3]))) == [1, 2, 3, 4]
assert to_list(sort_list(build([2, 1]))) == [1, 2]
```

**Complexity:** Time O(n log n) · Space O(log n) recursion (bottom-up হলে O(1))।

**Mistakes / edge cases:**
- `fast = head` থেকে শুরু করলে ২-node list-এ বাম অংশে দুটোই থাকে → infinite recursion।
- কাটার জন্য `slow->next = null` ভুলে যাওয়া।

🎤 **Say this while coding:** "Merge sort fits linked lists because merging needs no extra array — I split with slow and fast pointers, sort each half, and merge."

🔗 DistroSaaS: k-way merge = কয়েকটা source থেকে time-sorted ডেটা জোড়া (যেমন কয়েকটা shard/টেবিলের ordered রেকর্ড) — **[Komol পূরণ করবে: multi-source sorted merge-এর কোনো রিপোর্ট থাকলে স্টোরি ID]**।
