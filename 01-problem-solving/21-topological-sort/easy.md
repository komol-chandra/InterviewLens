---
id: ps-topological-sort-easy
title: "21 — Topological Sort — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, topological-sort]
updated: 2026-11-14
---

# 21 — Topological Sort — Easy

> **Pattern চেনার সংকেত:** topo sort-এর ভিত্তি = **in-degree / out-degree** গোনা। "সবাই যাকে বিশ্বাস করে, সে কাউকে না" → in − out = n−1। "কোন node-গুলো থেকে শুরু করলে সব জায়গায় পৌঁছানো যায়" → in-degree 0-এর node।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Find the Town Judge ⭐ | LC 997 | ⬜ | — | — |
| 2 | Minimum Number of Vertices to Reach All Nodes | LC 1557 | ⬜ | — | — |
| 3 | Course Schedule | LC 207 *(worked in [10 medium](../10-graphs-bfs-dfs/medium.md); Kahn's দিয়ে আবার লেখো)* | ⬜ | — | — |

---

## 1. Find the Town Judge  ·  LC 997

**Problem:** n জন (1..n); `trust[i] = [a, b]` মানে a, b-কে বিশ্বাস করে। judge কাউকে বিশ্বাস করে না, আর বাকি সবাই judge-কে বিশ্বাস করে। judge-এর নম্বর (না থাকলে −1)।
**Example:** `n=3, [[1,3],[2,3]] → 3` · `n=3, [[1,3],[2,3],[3,1]] → -1`

**Pattern:** Degree গোনা — `score[x] = in − out`; judge-এর score ঠিক `n − 1`।

**PHP:**
```php
<?php
function findJudge(int $n, array $trust): int
{
    $score = array_fill(1, $n, 0);
    foreach ($trust as [$a, $b]) { $score[$a]--; $score[$b]++; }   // out-degree -1, in-degree +1
    foreach ($score as $p => $s) if ($s === $n - 1) return $p;
    return -1;
}

assert(findJudge(2, [[1, 2]]) === 2);
assert(findJudge(3, [[1, 3], [2, 3]]) === 3);
assert(findJudge(3, [[1, 3], [2, 3], [3, 1]]) === -1);
assert(findJudge(1, []) === 1);
```

**Python:**
```python
def find_judge(n: int, trust: list[list[int]]) -> int:
    score = [0] * (n + 1)
    for a, b in trust:
        score[a] -= 1
        score[b] += 1
    return next((p for p in range(1, n + 1) if score[p] == n - 1), -1)

assert find_judge(3, [[1, 3], [2, 3]]) == 3 and find_judge(1, []) == 1
```

**Complexity:** Time O(n + t) · Space O(n)।
**Mistakes:** `n = 1`, কোনো trust নেই → সে নিজেই judge।

🎤 **Say this while coding:** "The judge has in-degree n minus one and out-degree zero, so a single score of in minus out identifies them in one pass."

---

## 2. Minimum Number of Vertices to Reach All Nodes  ·  LC 1557

**Problem:** DAG; সবচেয়ে ছোট node-সেট যেখান থেকে সব node-এ পৌঁছানো যায়।
**Example:** `n=6, [[0,1],[0,2],[2,5],[3,4],[4,2]] → [0,3]`

**Pattern:** In-degree 0 — কেউ যাদের দিকে আসে না, তাদের নিজেদেরই শুরুতে থাকতে হবে; আর DAG-এ বাকি সবাই এদের কোনো একটা থেকে পৌঁছানো যায়।

**PHP:**
```php
<?php
function findSmallestSetOfVertices(int $n, array $edges): array
{
    $hasIncoming = array_fill(0, $n, false);
    foreach ($edges as [, $v]) $hasIncoming[$v] = true;
    return array_keys(array_filter($hasIncoming, fn($x) => !$x));
}

assert(findSmallestSetOfVertices(6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]) === [0, 3]);
assert(findSmallestSetOfVertices(5, [[0, 1], [2, 1], [3, 1], [1, 4], [2, 4]]) === [0, 2, 3]);
```

**Python:**
```python
def find_smallest_set_of_vertices(n: int, edges: list[list[int]]) -> list[int]:
    targets = {v for _, v in edges}
    return [v for v in range(n) if v not in targets]

assert find_smallest_set_of_vertices(6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]) == [0, 3]
```

**Complexity:** Time O(n + E) · Space O(n)।
**Mistakes:** BFS চালানো — দরকার নেই; graph DAG বলে in-degree-ই যথেষ্ট (cycle থাকলে কাজ করত না)।

🎤 **Say this while coding:** "A node with no incoming edge can't be reached from anywhere else, so it must be in the set; and in a DAG every other node is reachable from one of these, so they're also sufficient."
