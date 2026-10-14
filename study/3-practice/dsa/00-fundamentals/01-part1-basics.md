# 02 — DSA Part 1: Arrays, Strings, Stack, Queue, Linked List (Day 2)

> **Goal:** know when to use each structure instantly + LIFO/FIFO cold.

---

## 1. Array
Contiguous fixed-size block, index access O(1).
- **Access** O(1) · **Search** O(n) · **Insert/Delete (middle)** O(n) · **Insert at end** O(1) amortized (dynamic array).
- Use when: you need fast index access and size is roughly known.

## 2. String
Array of characters, usually **immutable** (Java/Python/JS). Concatenation in a loop = O(n²) — use a builder/list + join.
- Common ops: reverse, palindrome check, anagram (sort or char-count map), substring search.

## 3. Stack — LIFO (Last In First Out)
Push/pop from **one end** (top). Both O(1).
- **Uses:** undo/redo, function call stack, **balanced brackets**, reverse a string, DFS, expression evaluation.

## 4. Queue — FIFO (First In First Out)
Enqueue at rear, dequeue at front. Both O(1).
- **Uses:** BFS, task/print scheduling, buffering, order processing.
- **Variants:** circular queue, deque (both ends), priority queue (heap).

## 5. Linked List
Nodes with `value` + `next` pointer. No index access.
- **Access/Search** O(n) · **Insert/Delete at known node** O(1) (no shifting).
- **Singly** (one direction) · **Doubly** (prev + next) · **Circular** (tail → head).
- Use when: frequent insert/delete at ends/middle, size unknown. Avoid when you need random access.

| Structure | Access | Search | Insert | Delete |
|-----------|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Stack/Queue | O(n) | O(n) | O(1) | O(1) |
| Linked List | O(n) | O(n) | O(1)* | O(1)* |
*at a known position

---

## 6. Worked Examples

### Reverse a string using a stack
```python
def reverse(s):
    stack = list(s)          # push all chars
    out = ""
    while stack:
        out += stack.pop()   # pop = LIFO = reversed
    return out
# reverse("abc") -> "cba"   | Time O(n), Space O(n)
```

### Detect a cycle in a linked list (Floyd's tortoise & hare)
```python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # +1
        fast = fast.next.next     # +2
        if slow == fast:          # they meet -> cycle
            return True
    return False
# Time O(n), Space O(1)
```

---

## 7. Practice MCQs

1. A stack follows: a) FIFO b) **LIFO** c) Random d) Sorted
2. A queue follows: a) **FIFO** b) LIFO c) Priority always d) Random
3. Best structure for BFS: a) Stack b) **Queue** c) Array d) Tree
4. Access element by index in array is: a) O(n) b) **O(1)** c) O(log n) d) O(n²)
5. Inserting in the middle of an array is: a) O(1) b) **O(n)** c) O(log n) d) O(n²)
6. Floyd's cycle detection uses: a) A hash set b) **Two pointers (slow/fast)** c) Recursion d) A stack
7. Which is used for "undo" functionality? a) Queue b) **Stack** c) Linked list d) Heap
8. A doubly linked list node has: a) Only next b) **prev and next** c) Only value d) An index
9. Concatenating strings in a loop (immutable) is: a) O(n) b) O(1) c) **O(n²)** d) O(log n)
10. Deleting a node given its position in a linked list is: a) **O(1)** b) O(n) c) O(log n) d) O(n²)

### Answer Key
1-b, 2-a, 3-b, 4-b, 5-b, 6-b, 7-b, 8-b, 9-c, 10-a

---

## 8. Common Traps
- Array insert at **end** is O(1) amortized, but insert in **middle** is O(n) (shifting).
- Linked list "insert is O(1)" only if you **already have the node**; finding it is O(n).
- Stack ↔ LIFO, Queue ↔ FIFO — never confuse under time pressure.
- Floyd's algorithm uses **O(1) space** (two pointers), not a hash set.
