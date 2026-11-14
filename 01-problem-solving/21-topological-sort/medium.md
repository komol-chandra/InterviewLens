---
id: ps-topological-sort-medium
title: "21 — Topological Sort — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, topological-sort]
updated: 2026-11-14
---

# 21 — Topological Sort — Medium

> **Pattern চেনার সংকেত:** "কোন ক্রমে course নেবে" → Kahn's, ক্রম ফেরত দাও (cycle হলে খালি)। "কোন node থেকে শুরু করলে কখনো cycle-এ আটকাবে না" → উল্টো graph-এ Kahn's, অথবা DFS 3-colour।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Course Schedule II ⭐ | LC 210 | ⬜ | — | — |
| 2 | Find Eventual Safe States | LC 802 | ⬜ | — | — |
| 3 | Parallel Courses | LC 1136 *(Kahn's level ধরে = সেমিস্টার সংখ্যা)* | ⬜ | — | — |
| 4 | Minimum Height Trees | LC 310 *(leaf ছাঁটাই — undirected-এ Kahn's-এর মতো)* | ⬜ | — | — |

---

## 1. Course Schedule II  ·  LC 210

**Problem:** `numCourses`, `prerequisites[i] = [a, b]` মানে a নেওয়ার আগে b। সব শেষ করার একটা বৈধ ক্রম দাও; অসম্ভব হলে `[]`।
**Example:** `2, [[1,0]] → [0,1]` · `4, [[1,0],[2,0],[3,1],[3,2]] → [0,1,2,3]` (বা `[0,2,1,3]`)

**Pattern:** Kahn's algorithm — edge `b → a`।

**PHP:**
```php
<?php
function findOrder(int $numCourses, array $prerequisites): array
{
    $adj = array_fill(0, $numCourses, []);
    $indeg = array_fill(0, $numCourses, 0);
    foreach ($prerequisites as [$a, $b]) { $adj[$b][] = $a; $indeg[$a]++; }   // b must come before a
    $q = new SplQueue();
    foreach ($indeg as $c => $d) if ($d === 0) $q->enqueue($c);
    $order = [];
    while (!$q->isEmpty()) {
        $c = $q->dequeue();
        $order[] = $c;
        foreach ($adj[$c] as $next) if (--$indeg[$next] === 0) $q->enqueue($next);
    }
    return count($order) === $numCourses ? $order : [];
}

function isValidOrder(array $order, int $n, array $pre): bool
{
    if (count($order) !== $n) return false;
    $pos = array_flip($order);
    foreach ($pre as [$a, $b]) if ($pos[$b] > $pos[$a]) return false;
    return true;
}

assert(findOrder(2, [[1, 0]]) === [0, 1]);
$pre = [[1, 0], [2, 0], [3, 1], [3, 2]];
assert(isValidOrder(findOrder(4, $pre), 4, $pre));
assert(findOrder(2, [[1, 0], [0, 1]]) === []);
assert(findOrder(1, []) === [0]);
```

**Python:**
```python
from collections import deque

def find_order(num_courses: int, prerequisites: list[list[int]]) -> list[int]:
    adj = [[] for _ in range(num_courses)]
    indeg = [0] * num_courses
    for a, b in prerequisites:
        adj[b].append(a)
        indeg[a] += 1
    q = deque(c for c in range(num_courses) if indeg[c] == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nxt in adj[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                q.append(nxt)
    return order if len(order) == num_courses else []

order = find_order(4, [[1, 0], [2, 0], [3, 1], [3, 2]])
pos = {c: i for i, c in enumerate(order)}
assert all(pos[b] < pos[a] for a, b in [[1, 0], [2, 0], [3, 1], [3, 2]])
assert find_order(2, [[1, 0], [0, 1]]) == []
```

**Complexity:** Time O(V + E) · Space O(V + E)।
**Mistakes:** edge-এর দিক (`[a, b]` → `b → a`); cycle-এ আংশিক ক্রম ফেরত দেওয়া।

🎤 **Say this while coding:** "Courses with no remaining prerequisites can be taken now; taking one lowers the in-degree of the courses that depend on it. If I can't take all of them, there's a cycle and I return an empty list."

---

## 2. Find Eventual Safe States  ·  LC 802

**Problem:** directed graph; একটা node "safe" যদি সেখান থেকে শুরু করা **সব** পথ শেষে terminal node-এ (out-degree 0) থামে। সব safe node sorted।
**Example:** `[[1,2],[2,3],[5],[0],[5],[],[]] → [2,4,5,6]`

**Pattern:** উল্টো graph-এ Kahn's — terminal node গুলো safe; একটা node safe যখন তার **সব** outgoing edge safe node-এ যায়। graph উল্টে দিলে এটা ঠিক in-degree (= মূল out-degree) শূন্য হওয়ার শর্ত।

**PHP:**
```php
<?php
function eventualSafeNodes(array $graph): array
{
    $n = count($graph);
    $rev = array_fill(0, $n, []);
    $outdeg = array_fill(0, $n, 0);
    foreach ($graph as $u => $nbrs) {
        $outdeg[$u] = count($nbrs);
        foreach ($nbrs as $v) $rev[$v][] = $u;
    }
    $q = new SplQueue();
    foreach ($outdeg as $u => $d) if ($d === 0) $q->enqueue($u);   // terminal nodes
    $safe = array_fill(0, $n, false);
    while (!$q->isEmpty()) {
        $v = $q->dequeue();
        $safe[$v] = true;
        foreach ($rev[$v] as $u) if (--$outdeg[$u] === 0) $q->enqueue($u);   // all of u's edges lead to safe nodes
    }
    return array_keys(array_filter($safe));
}

assert(eventualSafeNodes([[1, 2], [2, 3], [5], [0], [5], [], []]) === [2, 4, 5, 6]);
assert(eventualSafeNodes([[1, 2, 3, 4], [1, 2], [3, 4], [0, 4], []]) === [4]);
```

**Python:**
```python
from collections import deque

def eventual_safe_nodes(graph: list[list[int]]) -> list[int]:
    n = len(graph)
    rev = [[] for _ in range(n)]
    outdeg = [len(nbrs) for nbrs in graph]
    for u, nbrs in enumerate(graph):
        for v in nbrs:
            rev[v].append(u)
    q = deque(u for u in range(n) if outdeg[u] == 0)
    safe = [False] * n
    while q:
        v = q.popleft()
        safe[v] = True
        for u in rev[v]:
            outdeg[u] -= 1
            if outdeg[u] == 0:
                q.append(u)
    return [u for u in range(n) if safe[u]]

assert eventual_safe_nodes([[1, 2], [2, 3], [5], [0], [5], [], []]) == [2, 4, 5, 6]
```

**Complexity:** Time O(V + E) · Space O(V + E)।
**Mistakes:** "কোনো একটা পথ" safe হলেই safe ধরা — শর্ত **সব** পথ। (DFS বিকল্প: 3-colour; gray-তে পৌঁছানো node আর তার পূর্বপুরুষ unsafe।)

🎤 **Say this while coding:** "A node is safe once every outgoing edge leads to a safe node. Reversing the graph turns that into a Kahn's-style peel starting from terminal nodes: when a node's remaining out-degree hits zero, it's safe."
