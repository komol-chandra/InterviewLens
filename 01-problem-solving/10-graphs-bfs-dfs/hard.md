---
id: ps-graphs-bfs-dfs-hard
title: "10 — Graphs · BFS / DFS — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, graphs-bfs-dfs]
updated: 2026-11-14
---

# 10 — Graphs · BFS / DFS — Hard

> **Pattern চেনার সংকেত:** "এক শব্দ থেকে আরেক শব্দে সবচেয়ে কম রূপান্তর" → implicit graph-এ BFS (প্রতিবেশী = এক অক্ষর বদল)। "grid-এ সবচেয়ে লম্বা increasing path" → DFS + memo (DAG-এ longest path)। "path-এর **সর্বোচ্চ** edge/ঘর minimize করো" বা weighted shortest path → Dijkstra (min-heap)।
> Topological sort আর union-find আলাদা ফোল্ডারে: [21](../21-topological-sort/), [20](../20-union-find/)।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Word Ladder ⭐ | LC 127 | ⬜ | — | — |
| 2 | Longest Increasing Path in a Matrix | LC 329 | ⬜ | — | — |
| 3 | Swim in Rising Water (Dijkstra) | LC 778 | ⬜ | — | — |
| 4 | Network Delay Time | LC 743 *(Dijkstra টেমপ্লেট, medium)* | ⬜ | — | — |
| 5 | Alien Dictionary | LC 269 *(→ [21 hard](../21-topological-sort/hard.md))* | ⬜ | — | — |
| 6 | Cheapest Flights Within K Stops | LC 787 *(Bellman-Ford K রাউন্ড)* | ⬜ | — | — |

---

## 1. Word Ladder  ·  LC 127

**Problem:** `beginWord` থেকে `endWord`-এ যাও, প্রতিবার একটা অক্ষর বদলে, প্রতিটা মধ্যবর্তী শব্দ `wordList`-এ থাকতে হবে। সবচেয়ে ছোট sequence-এর শব্দ সংখ্যা (না পারলে 0)।
**Example:** `"hit"→"cog", ["hot","dot","dog","lot","log","cog"] → 5` (hit→hot→dot→dog→cog)
**Constraints:** শব্দের দৈর্ঘ্য L ≤ 10, list ≤ 5000।

**Pattern:** BFS on implicit graph — node = শব্দ, edge = এক অক্ষরের পার্থক্য; unweighted shortest path → BFS।

**Approach:**
1. Brute force: প্রতিটা জোড়া শব্দ তুলনা করে graph — O(N²·L)।
2. Optimized: প্রতিটা শব্দের প্রতিটা অবস্থানে `a..z` বসিয়ে দেখো set-এ আছে কি না — O(N·L·26)। দেখা মাত্র set থেকে মুছে দাও (visited)।

**PHP:**
```php
<?php
function ladderLength(string $begin, string $end, array $wordList): int
{
    $words = array_flip($wordList);
    if (!isset($words[$end])) return 0;
    $q = new SplQueue();
    $q->enqueue([$begin, 1]);
    unset($words[$begin]);
    while (!$q->isEmpty()) {
        [$w, $steps] = $q->dequeue();
        if ($w === $end) return $steps;
        for ($i = 0; $i < strlen($w); $i++) {
            $orig = $w[$i];
            for ($c = ord('a'); $c <= ord('z'); $c++) {
                $w[$i] = chr($c);
                if (isset($words[$w])) {
                    unset($words[$w]);          // visited = removed from the dictionary
                    $q->enqueue([$w, $steps + 1]);
                }
            }
            $w[$i] = $orig;
        }
    }
    return 0;
}

assert(ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']) === 5);
assert(ladderLength('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']) === 0);
assert(ladderLength('a', 'c', ['a', 'b', 'c']) === 2);
```

**Python:**
```python
from collections import deque
from string import ascii_lowercase

def ladder_length(begin: str, end: str, word_list: list[str]) -> int:
    words = set(word_list)
    if end not in words:
        return 0
    q = deque([(begin, 1)])
    words.discard(begin)
    while q:
        w, steps = q.popleft()
        if w == end:
            return steps
        for i in range(len(w)):
            for c in ascii_lowercase:
                nxt = w[:i] + c + w[i + 1:]
                if nxt in words:
                    words.remove(nxt)
                    q.append((nxt, steps + 1))
    return 0

assert ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]) == 5
assert ladder_length("hit", "cog", ["hot", "dot", "dog", "lot", "log"]) == 0
```

**Complexity:** Time O(N · L · 26) (Python-এ string বানানো সহ O(N·L²·26)) · Space O(N)।

**Mistakes / edge cases:**
- `endWord` list-এ না থাকলে সাথে সাথে 0।
- visited আলাদা না রেখে set থেকে মুছে দেওয়া — সহজ আর দ্রুত।
- উত্তর = শব্দ সংখ্যা (begin সহ), ধাপ সংখ্যা না।
- উন্নতি (মুখে বলো): bidirectional BFS — দুই দিক থেকে, ছোট frontier আগে বাড়াও।

🎤 **Say this while coding:** "Words are nodes and one-letter changes are edges, so this is an unweighted shortest path — BFS. I generate neighbours by trying 26 letters at each position instead of comparing every pair."

---

## 2. Longest Increasing Path in a Matrix  ·  LC 329

**Problem:** m×n matrix-এ সবচেয়ে লম্বা strictly increasing path (৪ দিকে চলা যায়)।
**Example:** `[[9,9,4],[6,6,8],[2,1,1]] → 4` (1→2→6→9)
**Constraints:** `m, n ≤ 200`

**Pattern:** DFS + memoization — "strictly increasing" মানে কোনো cycle নেই (DAG), তাই প্রতিটা ঘর থেকে শুরু করা সেরা path একবার হিসাব করলেই হয়।

**Approach:**
1. Brute force: প্রতিটা ঘর থেকে DFS memo ছাড়া — exponential।
2. Optimized: `memo[r][c]` = এই ঘর থেকে শুরু করা সবচেয়ে লম্বা path। `dfs = 1 + max(dfs(বড় প্রতিবেশী))`। visited লাগে না (increasing হওয়ায় ফিরে আসা অসম্ভব)।

**PHP:**
```php
<?php
function longestIncreasingPath(array $m): int
{
    $R = count($m); $C = count($m[0]);
    $memo = array_fill(0, $R, array_fill(0, $C, 0));
    $dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    $dfs = function (int $r, int $c) use (&$dfs, &$memo, $m, $R, $C, $dirs): int {
        if ($memo[$r][$c]) return $memo[$r][$c];
        $best = 1;
        foreach ($dirs as [$dr, $dc]) {
            $nr = $r + $dr; $nc = $c + $dc;
            if ($nr >= 0 && $nr < $R && $nc >= 0 && $nc < $C && $m[$nr][$nc] > $m[$r][$c]) {
                $best = max($best, 1 + $dfs($nr, $nc));
            }
        }
        return $memo[$r][$c] = $best;
    };
    $ans = 0;
    for ($r = 0; $r < $R; $r++) for ($c = 0; $c < $C; $c++) $ans = max($ans, $dfs($r, $c));
    return $ans;
}

assert(longestIncreasingPath([[9, 9, 4], [6, 6, 8], [2, 1, 1]]) === 4);
assert(longestIncreasingPath([[3, 4, 5], [3, 2, 6], [2, 2, 1]]) === 4);
assert(longestIncreasingPath([[1]]) === 1);
```

**Python:**
```python
from functools import lru_cache

def longest_increasing_path(m: list[list[int]]) -> int:
    R, C = len(m), len(m[0])

    @lru_cache(maxsize=None)
    def dfs(r: int, c: int) -> int:
        best = 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and m[nr][nc] > m[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        return best

    return max(dfs(r, c) for r in range(R) for c in range(C))

assert longest_increasing_path([[9, 9, 4], [6, 6, 8], [2, 1, 1]]) == 4
assert longest_increasing_path([[3, 4, 5], [3, 2, 6], [2, 2, 1]]) == 4
```

**Complexity:** Time O(m·n) · Space O(m·n)।

**Mistakes / edge cases:**
- visited set রাখা অপ্রয়োজনীয়, আর memo-র সাথে মিশে ভুল ফল দেয়।
- "strictly" — সমান মানে যাওয়া যাবে না।

🎤 **Say this while coding:** "Because the path must strictly increase there are no cycles, so the grid is a DAG; the longest path from each cell can be memoized and the total work is linear in the cells."

---

## 3. Swim in Rising Water  ·  LC 778

**Problem:** n×n grid, `grid[r][c]` = ওই ঘরের উচ্চতা; সময় `t`-তে সব ঘর যার উচ্চতা ≤ t সাঁতরানো যায়। (0,0) থেকে (n−1,n−1)-এ সবচেয়ে কম কোন সময়ে পৌঁছানো যায়?
**Example:** `[[0,2],[1,3]] → 3` · বড় উদাহরণ নিচে টেস্টে (উত্তর 16)।
**Constraints:** `n ≤ 50`, মান 0..n²−1 আলাদা।

**Pattern:** Dijkstra (minimax variant) — path-এর খরচ = path-এর **সর্বোচ্চ** ঘর, আর আমরা সেটা minimize করি। min-heap-এ `(এখন পর্যন্ত max, r, c)`।

**Approach:**
1. বিকল্প: উত্তরের ওপর binary search + BFS (`t` সময়ে পৌঁছানো যায়?) — O(n² log n²)।
2. Dijkstra: heap থেকে সবচেয়ে ছোট `t`-এর ঘর বের করো; প্রতিবেশীর খরচ `max(t, grid[nr][nc])`; প্রথমবার target বের হলেই উত্তর।

**PHP:**
```php
<?php
function swimInWater(array $grid): int
{
    $n = count($grid);
    $heap = new SplMinHeap();                // compares arrays element-wise: [time, r, c]
    $heap->insert([$grid[0][0], 0, 0]);
    $seen = ["0,0" => true];
    while (!$heap->isEmpty()) {
        [$t, $r, $c] = $heap->extract();
        if ($r === $n - 1 && $c === $n - 1) return $t;
        foreach ([[1, 0], [-1, 0], [0, 1], [0, -1]] as [$dr, $dc]) {
            $nr = $r + $dr; $nc = $c + $dc;
            if ($nr < 0 || $nc < 0 || $nr >= $n || $nc >= $n || isset($seen["$nr,$nc"])) continue;
            $seen["$nr,$nc"] = true;
            $heap->insert([max($t, $grid[$nr][$nc]), $nr, $nc]);   // cost = highest cell on path
        }
    }
    return -1;
}

assert(swimInWater([[0, 2], [1, 3]]) === 3);
assert(swimInWater([
    [0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16],
    [11, 17, 18, 19, 20], [10, 9, 8, 7, 6],
]) === 16);
assert(swimInWater([[0]]) === 0);
```

**Python:**
```python
import heapq

def swim_in_water(grid: list[list[int]]) -> int:
    n = len(grid)
    heap = [(grid[0][0], 0, 0)]
    seen = {(0, 0)}
    while heap:
        t, r, c = heapq.heappop(heap)
        if r == c == n - 1:
            return t
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1

assert swim_in_water([[0, 2], [1, 3]]) == 3
assert swim_in_water([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16],
                      [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]) == 16
```

**Complexity:** Time O(n² log n) · Space O(n²)।

**Mistakes / edge cases:**
- সাধারণ BFS (FIFO) ভুল — খরচ সমান না, তাই heap।
- এখানে push-এর সময় `seen` mark করা ঠিক আছে: heap থেকে বের হওয়া `t` কখনো কমে না, তাই কোনো ঘর প্রথমবার যে খরচে ঢোকে (`max(t, h)`), পরে তার চেয়ে কম খরচে আসা অসম্ভব। কিন্তু **যোগফল-খরচের** সাধারণ Dijkstra-তে এটা ভুল — সেখানে pop-এর সময় চূড়ান্ত করো (নিচের টেমপ্লেট)।
- Starting cell-এর উচ্চতা নিজেই খরচ (`[[3]]`-এর উত্তর 3)।

🎤 **Say this while coding:** "The cost of a path is its highest cell, and I want the path that minimizes that — a minimax shortest path — so Dijkstra with a min-heap keyed on the running maximum works."

> ⚠️ **Dijkstra-র সাধারণ টেমপ্লেট (যোগফল খরচ, LC 743):** `dist[src]=0`; heap থেকে `(d,u)` বের করো; `d > dist[u]` হলে skip; প্রতিটা `(v,w)`-এ `d+w < dist[v]` হলে আপডেট ও push। Negative weight থাকলে Dijkstra চলে না → Bellman-Ford।

🔗 DistroSaaS: delivery route / নিকটতম ডিস্ট্রিবিউটর খোঁজা = weighted shortest path — **[Komol পূরণ করবে: route/territory distance-এর কাজ থাকলে স্টোরি ID]**; না থাকলে বলো এটা অ্যালগরিদম অনুশীলন।
