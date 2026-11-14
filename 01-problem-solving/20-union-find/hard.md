---
id: ps-union-find-hard
title: "20 — Union-Find — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, union-find]
updated: 2026-11-14
---

# 20 — Union-Find — Hard

> **Pattern চেনার সংকেত:** "land একে একে যোগ হচ্ছে, প্রতিবার কয়টা island" → online DSU (grid index `r*C + c`)। "দুইজনের জন্য আলাদা edge type, সর্বোচ্চ কয়টা edge বাদ দেওয়া যায়" → দুটো DSU, shared edge আগে।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও DSU টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Number of Islands II ⭐ | LC 305 | ⬜ | — | — |
| 2 | Remove Max Number of Edges to Keep Graph Fully Traversable | LC 1579 | ⬜ | — | — |
| 3 | Swim in Rising Water | LC 778 *(DSU রূপ: ঘর উচ্চতা ক্রমে খোলো; Dijkstra রূপ [10 hard](../10-graphs-bfs-dfs/hard.md))* | ⬜ | — | — |
| 4 | Making A Large Island | LC 827 | ⬜ | — | — |

---

## 1. Number of Islands II  ·  LC 305

**Problem:** m×n পানি; `positions`-এর প্রতিটা অবস্থানে একে একে land যোগ হয়। প্রতিটা যোগের পর island সংখ্যা।
**Example:** `m=3, n=3, [[0,0],[0,1],[1,2],[2,1]] → [1,1,2,3]`
**Constraints:** `m·n ≤ 10⁴`, positions ≤ 10⁴ (duplicate থাকতে পারে)।

**Pattern:** Online DSU — প্রতিবার BFS চালালে O(k·m·n)। নতুন land = নতুন component (+1), তারপর ৪ প্রতিবেশী land-এর সাথে union (প্রতিটা সফল union −1)।

**PHP:**
```php
<?php
function numIslands2(int $m, int $n, array $positions): array
{
    $parent = [];                                  // only land cells have an entry
    $find = function (int $x) use (&$parent): int {
        while ($parent[$x] !== $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x]; }
        return $x;
    };
    $count = 0; $res = [];
    foreach ($positions as [$r, $c]) {
        $id = $r * $n + $c;
        if (isset($parent[$id])) { $res[] = $count; continue; }   // duplicate position
        $parent[$id] = $id;
        $count++;
        foreach ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [$dr, $dc]) {
            $nr = $r + $dr; $nc = $c + $dc;
            $nid = $nr * $n + $nc;
            if ($nr < 0 || $nc < 0 || $nr >= $m || $nc >= $n || !isset($parent[$nid])) continue;
            $a = $find($id); $b = $find($nid);
            if ($a !== $b) { $parent[$a] = $b; $count--; }       // merged two islands
        }
        $res[] = $count;
    }
    return $res;
}

assert(numIslands2(3, 3, [[0, 0], [0, 1], [1, 2], [2, 1]]) === [1, 1, 2, 3]);
assert(numIslands2(3, 3, [[0, 0], [0, 2], [0, 1]]) === [1, 2, 1]);
assert(numIslands2(1, 1, [[0, 0], [0, 0]]) === [1, 1]);
```

**Python:**
```python
def num_islands2(m: int, n: int, positions: list[list[int]]) -> list[int]:
    parent: dict[int, int] = {}

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    count, res = 0, []
    for r, c in positions:
        idx = r * n + c
        if idx in parent:
            res.append(count); continue
        parent[idx] = idx
        count += 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            nidx = nr * n + nc
            if 0 <= nr < m and 0 <= nc < n and nidx in parent:
                a, b = find(idx), find(nidx)
                if a != b:
                    parent[a] = b
                    count -= 1
        res.append(count)
    return res

assert num_islands2(3, 3, [[0, 0], [0, 2], [0, 1]]) == [1, 2, 1]
```

**Complexity:** Time O(k · α(mn)) · Space O(mn)।
**Mistakes:** duplicate position-এ আবার `count++`; 2-D → 1-D index `r * n + c` (`m` না)।

🎤 **Say this while coding:** "Each new land cell starts as its own island; then every union with an adjacent land cell that was in a different set merges two islands, so I decrement. That's near-constant work per addition instead of a fresh BFS."

---

## 2. Remove Max Number of Edges to Keep Graph Fully Traversable  ·  LC 1579

**Problem:** n node, edge type 1 (শুধু Alice), 2 (শুধু Bob), 3 (দুজনেই)। দুজনেই যাতে পুরো graph ঘুরতে পারে, সর্বোচ্চ কয়টা edge বাদ দেওয়া যায়? অসম্ভব হলে −1।
**Example:** `n=4, [[3,1,2],[3,2,3],[1,1,3],[1,2,4],[1,1,2],[2,3,4]] → 2`

**Pattern:** দুটো DSU + greedy — type 3 edge দুজনের কাজে লাগে, তাই **আগে** নাও; তারপর type 1 শুধু Alice-এর DSU-তে, type 2 শুধু Bob-এর। যে edge কোনো union ঘটায় না, সেটা বাদ দেওয়া যায়।

**PHP:**
```php
<?php
final class DSU
{
    private array $p;
    public int $components;
    public function __construct(int $n) { $this->p = range(0, $n); $this->components = $n; }
    public function find(int $x): int
    {
        while ($this->p[$x] !== $x) { $this->p[$x] = $this->p[$this->p[$x]]; $x = $this->p[$x]; }
        return $x;
    }
    public function union(int $a, int $b): bool
    {
        $ra = $this->find($a); $rb = $this->find($b);
        if ($ra === $rb) return false;
        $this->p[$ra] = $rb;
        $this->components--;
        return true;
    }
}

function maxNumEdgesToRemove(int $n, array $edges): int
{
    $alice = new DSU($n); $bob = new DSU($n); $used = 0;
    foreach ($edges as [$t, $u, $v]) {                // shared edges first: they serve both
        if ($t === 3) {
            $a = $alice->union($u, $v);
            $b = $bob->union($u, $v);
            if ($a || $b) $used++;
        }
    }
    foreach ($edges as [$t, $u, $v]) {
        if ($t === 1 && $alice->union($u, $v)) $used++;
        if ($t === 2 && $bob->union($u, $v)) $used++;
    }
    if ($alice->components !== 1 || $bob->components !== 1) return -1;
    return count($edges) - $used;
}

assert(maxNumEdgesToRemove(4, [[3, 1, 2], [3, 2, 3], [1, 1, 3], [1, 2, 4], [1, 1, 2], [2, 3, 4]]) === 2);
assert(maxNumEdgesToRemove(4, [[3, 1, 2], [3, 2, 3], [1, 1, 4], [2, 1, 4]]) === 0);
assert(maxNumEdgesToRemove(4, [[3, 2, 3], [1, 1, 2], [2, 3, 4]]) === -1);
```

**Python:**
```python
class DSU:
    def __init__(self, n: int):
        self.p = list(range(n + 1))
        self.components = n

    def find(self, x: int) -> int:
        while self.p[x] != x:
            self.p[x] = self.p[self.p[x]]
            x = self.p[x]
        return x

    def union(self, a: int, b: int) -> bool:
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        self.p[ra] = rb
        self.components -= 1
        return True

def max_num_edges_to_remove(n: int, edges: list[list[int]]) -> int:
    alice, bob, used = DSU(n), DSU(n), 0
    for t, u, v in edges:
        if t == 3:
            a, b = alice.union(u, v), bob.union(u, v)   # evaluate both — no short-circuit
            used += a or b
    for t, u, v in edges:
        if t == 1:
            used += alice.union(u, v)
        elif t == 2:
            used += bob.union(u, v)
    if alice.components != 1 or bob.components != 1:
        return -1
    return len(edges) - used

assert max_num_edges_to_remove(4, [[3, 1, 2], [3, 2, 3], [1, 1, 3], [1, 2, 4], [1, 1, 2], [2, 3, 4]]) == 2
assert max_num_edges_to_remove(4, [[3, 2, 3], [1, 1, 2], [2, 3, 4]]) == -1
```

**Complexity:** Time O(E · α(n)) · Space O(n)।
**Mistakes:** `alice.union(u,v) or bob.union(u,v)` এক লাইনে লিখলে short-circuit-এ Bob-এর union চলেই না — দুটো আলাদা চালাও।

🎤 **Say this while coding:** "A shared edge can replace one Alice edge and one Bob edge, so greedily I add all type-3 edges first, then each person's own edges into their own DSU; every edge that doesn't merge anything is removable."
