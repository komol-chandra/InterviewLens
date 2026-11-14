# 03 — DSA Part 2: Trees, Hashing, Recursion + Complexity (Day 3)

> **Goal:** state Big-O of any snippet in <10 seconds.

---

## 1. Trees
- **Binary tree** — each node ≤ 2 children. **BST** — left < node < right.
- BST search/insert/delete = **O(log n)** balanced, **O(n)** worst (degenerate/skewed).
- **Traversals (DFS):**
  - **In-order** (Left, Root, Right) → BST gives **sorted** output.
  - **Pre-order** (Root, Left, Right) → copy/serialize tree.
  - **Post-order** (Left, Right, Root) → delete tree / evaluate expression.
- **BFS / level-order** uses a **queue**.

## 2. Hashing
- **Hash map / hash table** — key → bucket via hash function. Avg lookup/insert/delete **O(1)**, worst **O(n)** (collisions).
- Collision handling: **chaining** (linked list per bucket) or **open addressing** (probing).
- Uses: frequency count, deduplication, caching, two-sum.

## 3. Recursion
Every recursion needs:
1. **Base case** — stops the recursion.
2. **Recursive case** — calls itself on a smaller input.
- Uses the **call stack** → deep recursion can cause stack overflow.
- Common: factorial, Fibonacci, reverse a number, tree traversal, merge sort.

---

## 4. Complexity (Big-O) — the money topic

| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | array index, hash lookup |
| O(log n) | Logarithmic | binary search, balanced BST |
| O(n) | Linear | single loop, linear search |
| O(n log n) | Linearithmic | merge sort, quick sort avg, heap sort |
| O(n²) | Quadratic | nested loop, bubble/insertion/selection sort |
| O(2ⁿ) | Exponential | naive recursive Fibonacci, subsets |
| O(n!) | Factorial | permutations, brute-force TSP |

### How to read a snippet
- Single loop over n → **O(n)**.
- Loop inside a loop (both n) → **O(n²)**.
- Halving each step (`i *= 2` / binary search) → **O(log n)**.
- Two **separate** loops → O(n) + O(n) = **O(n)** (drop constants).
- Recursion that splits in half + combines → **O(n log n)**.

### Sorting cheat
| Sort | Best | Avg | Worst | Space | Stable |
|------|------|-----|-------|-------|--------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Insertion | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap | O(n log n) | O(n log n) | O(n log n) | O(1) | No |

---

## 5. Worked Examples

### Fibonacci (recursive vs iterative)
```python
# Recursive — O(2^n) time, O(n) stack  (elegant but slow)
def fib(n):
    if n < 2: return n           # base case
    return fib(n-1) + fib(n-2)   # recursive case

# Iterative — O(n) time, O(1) space  (preferred)
def fib_fast(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
```

### Recursive reverse a number
```python
def reverse_num(n, rev=0):
    if n == 0: return rev
    return reverse_num(n // 10, rev * 10 + n % 10)
# reverse_num(123) -> 321
```

### Find duplicates using a hash map
```python
def find_dupes(arr):
    seen, dupes = set(), []
    for x in arr:
        if x in seen: dupes.append(x)   # O(1) lookup
        else: seen.add(x)
    return dupes
# Time O(n), Space O(n)
```

---

## 6. Practice MCQs

1. Big-O of binary search: a) O(n) b) **O(log n)** c) O(n log n) d) O(1)
2. Merge sort average time: a) O(n²) b) O(n) c) **O(n log n)** d) O(log n)
3. Two nested loops over n each: a) O(n) b) **O(n²)** c) O(2n) d) O(log n)
4. In-order traversal of a BST gives: a) Reverse b) **Sorted order** c) Random d) Level order
5. Average hash map lookup: a) O(n) b) O(log n) c) **O(1)** d) O(n²)
6. Every recursion must have a: a) Loop b) **Base case** c) Global var d) Stack pop
7. Naive recursive Fibonacci is: a) O(n) b) O(n log n) c) **O(2ⁿ)** d) O(1)
8. Which sort is NOT O(n log n) average? a) Merge b) Quick c) Heap d) **Bubble**
9. Quick sort worst case: a) O(n log n) b) **O(n²)** c) O(n) d) O(log n)
10. BFS on a tree uses a: a) Stack b) **Queue** c) Hash map d) Heap

### Answer Key
1-b, 2-c, 3-b, 4-b, 5-c, 6-b, 7-c, 8-d, 9-b, 10-b

---

## 7. Common Traps
- Quick sort is O(n log n) **average** but **O(n²) worst** (already-sorted with bad pivot).
- Drop constants and lower terms: O(2n + 5) → **O(n)**; O(n² + n) → **O(n²)**.
- In-order (not pre/post) gives sorted BST output.
- Hash map is O(1) **average**, not guaranteed — collisions make worst case O(n).
