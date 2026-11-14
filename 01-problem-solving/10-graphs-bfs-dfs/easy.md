---
id: ps-graphs-bfs-dfs-easy
title: "10 — Graphs · BFS / DFS — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, graphs-bfs-dfs]
updated: 2026-11-14
---

# 10 — Graphs · BFS / DFS — Easy

> Part of the Graphs pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Flood Fill — LC 733 → *worked below*
- [ ] BFS traversal of a graph — GfG → *worked below*
- [ ] DFS traversal of a graph — GfG → *worked below*
- [ ] Find if Path Exists in Graph — LC 1971 → *worked below*

---

## Worked Solutions

### Flood Fill — LC 733  *(DFS recolor)*
```php
function floodFill(array $image, int $sr, int $sc, int $color): array {
    $start = $image[$sr][$sc];
    if ($start === $color) return $image;            // nothing to do, avoids infinite loop
    $fill = function ($r, $c) use (&$fill, &$image, $start, $color) {
        if ($r < 0 || $c < 0 || $r >= count($image) || $c >= count($image[0])
            || $image[$r][$c] !== $start) return;
        $image[$r][$c] = $color;
        $fill($r+1,$c); $fill($r-1,$c); $fill($r,$c+1); $fill($r,$c-1);
    };
    $fill($sr, $sc);
    return $image;
}
// O(R·C) / O(R·C)
```

> **Pattern চেনার সংকেত:** "edges list" দেওয়া → আগে adjacency list বানাও। "পৌঁছানো যায়?" → BFS বা DFS যেকোনো। "সবচেয়ে কম ধাপ" (unweighted) → BFS। grid = graph যেখানে প্রতিটা ঘরের ৪ প্রতিবেশী।

### BFS traversal of a graph  ·  GfG

**Problem:** undirected graph (n node, edges); node 0 থেকে BFS ক্রম দাও।
**Example:** `n=5, edges=[[0,1],[0,2],[1,3],[2,4]] → [0,1,2,3,4]`

**Pattern:** Queue + visited — ঢোকানোর সময়ই visited mark করো, যাতে একই node দুবার queue-তে না যায়।

**PHP:**
```php
<?php
function buildAdj(int $n, array $edges): array
{
    $adj = array_fill(0, $n, []);
    foreach ($edges as [$u, $v]) { $adj[$u][] = $v; $adj[$v][] = $u; }
    return $adj;
}

function bfs(int $n, array $edges, int $start = 0): array
{
    $adj = buildAdj($n, $edges);
    $visited = [$start => true];
    $q = new SplQueue();
    $q->enqueue($start);
    $order = [];
    while (!$q->isEmpty()) {
        $u = $q->dequeue();
        $order[] = $u;
        foreach ($adj[$u] as $v) {
            if (isset($visited[$v])) continue;
            $visited[$v] = true;               // mark on enqueue, not on dequeue
            $q->enqueue($v);
        }
    }
    return $order;
}

assert(bfs(5, [[0, 1], [0, 2], [1, 3], [2, 4]]) === [0, 1, 2, 3, 4]);
assert(bfs(4, [[0, 1], [1, 2], [2, 0], [2, 3]]) === [0, 1, 2, 3]);
assert(bfs(1, []) === [0]);
```

**Python:**
```python
from collections import deque

def bfs(n: int, edges: list[list[int]], start: int = 0) -> list[int]:
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    visited = {start}
    q = deque([start])
    order = []
    while q:
        u = q.popleft()
        order.append(u)
        for v in adj[u]:
            if v not in visited:
                visited.add(v)
                q.append(v)
    return order

assert bfs(5, [[0, 1], [0, 2], [1, 3], [2, 4]]) == [0, 1, 2, 3, 4]
```

**Complexity:** Time O(V + E) · Space O(V)।
**Mistakes:** dequeue-এর সময় visited mark করলে একই node একাধিকবার queue-তে ঢোকে। PHP-তে `array_shift` O(n) → `SplQueue`।

🎤 **Say this while coding:** "I mark a node visited when I enqueue it, so each node enters the queue once and the total work is V plus E."

### DFS traversal of a graph  ·  GfG

**Problem:** একই graph-এ node 0 থেকে DFS ক্রম (recursive আর iterative দুটোই জানো)।

**PHP:**
```php
<?php
function dfsRecursive(array $adj, int $u, array &$visited, array &$order): void
{
    $visited[$u] = true;
    $order[] = $u;
    foreach ($adj[$u] as $v) {
        if (!isset($visited[$v])) dfsRecursive($adj, $v, $visited, $order);
    }
}

function dfsIterative(array $adj, int $start): array
{
    $stack = [$start]; $visited = []; $order = [];
    while ($stack) {
        $u = array_pop($stack);
        if (isset($visited[$u])) continue;      // may be pushed twice; skip here
        $visited[$u] = true;
        $order[] = $u;
        foreach (array_reverse($adj[$u]) as $v) {   // reverse to match recursive order
            if (!isset($visited[$v])) $stack[] = $v;
        }
    }
    return $order;
}

$adj = [[1, 2], [0, 3], [0, 4], [1], [2]];
$visited = []; $order = [];
dfsRecursive($adj, 0, $visited, $order);
assert($order === [0, 1, 3, 2, 4]);
assert(dfsIterative($adj, 0) === [0, 1, 3, 2, 4]);
```

**Python:**
```python
def dfs_iterative(adj: list[list[int]], start: int) -> list[int]:
    stack, visited, order = [start], set(), []
    while stack:
        u = stack.pop()
        if u in visited:
            continue
        visited.add(u)
        order.append(u)
        for v in reversed(adj[u]):
            if v not in visited:
                stack.append(v)
    return order

assert dfs_iterative([[1, 2], [0, 3], [0, 4], [1], [2]], 0) == [0, 1, 3, 2, 4]
```

**Complexity:** Time O(V + E) · Space O(V)।
**Mistakes:** recursive DFS বড় graph-এ stack overflow (Python default limit 1000) → iterative জানো। iterative-এ pop-এর সময় visited চেক (push-এর সময় না), নইলে ক্রম ভুল হয়।

🎤 **Say this while coding:** "Recursive DFS is the cleanest, but for deep graphs I'd switch to an explicit stack to avoid hitting the recursion limit."

### Find if Path Exists in Graph  ·  LC 1971

**Problem:** undirected graph-এ `source` থেকে `destination`-এ পথ আছে কি?
**Example:** `n=3, [[0,1],[1,2],[2,0]], 0→2 → true`

**Pattern:** যেকোনো traversal (BFS/DFS) বা union-find ([20](../20-union-find/))।

**PHP:**
```php
<?php
function validPath(int $n, array $edges, int $source, int $destination): bool
{
    $adj = array_fill(0, $n, []);
    foreach ($edges as [$u, $v]) { $adj[$u][] = $v; $adj[$v][] = $u; }
    $stack = [$source]; $seen = [$source => true];
    while ($stack) {
        $u = array_pop($stack);
        if ($u === $destination) return true;
        foreach ($adj[$u] as $v) {
            if (!isset($seen[$v])) { $seen[$v] = true; $stack[] = $v; }
        }
    }
    return false;
}

assert(validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2) === true);
assert(validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5) === false);
assert(validPath(1, [], 0, 0) === true);
```

**Python:**
```python
def valid_path(n: int, edges: list[list[int]], source: int, destination: int) -> bool:
    adj = [[] for _ in range(n)]
    for u, v in edges:
        adj[u].append(v); adj[v].append(u)
    stack, seen = [source], {source}
    while stack:
        u = stack.pop()
        if u == destination:
            return True
        for v in adj[u]:
            if v not in seen:
                seen.add(v); stack.append(v)
    return False

assert valid_path(3, [[0, 1], [1, 2], [2, 0]], 0, 2)
assert not valid_path(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5)
```

**Complexity:** Time O(V + E) · Space O(V + E)।
**Mistakes:** `source == destination` → true।

🎤 **Say this while coding:** "I build an adjacency list and run an iterative DFS from the source; if I ever pop the destination, a path exists."
