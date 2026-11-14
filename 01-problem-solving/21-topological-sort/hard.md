---
id: ps-topological-sort-hard
title: "21 — Topological Sort — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, topological-sort]
updated: 2026-11-14
---

# 21 — Topological Sort — Hard

> **Pattern চেনার সংকেত:** "sorted শব্দ থেকে অজানা বর্ণমালার ক্রম" → পাশাপাশি শব্দের **প্রথম ভিন্ন অক্ষর** = একটা edge, তারপর Kahn's। "DAG-এ path ধরে কিছু গোনা / max" → topo ক্রমে DP; cycle হলে −1।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Alien Dictionary ⭐ | LC 269 | ⬜ | — | — |
| 2 | Largest Color Value in a Directed Graph | LC 1857 | ⬜ | — | — |
| 3 | Sort Items by Groups Respecting Dependencies | LC 1203 *(দুই স্তরের topo sort)* | ⬜ | — | — |
| 4 | Longest Increasing Path in a Matrix | LC 329 *(implicit DAG; memo DFS [10 hard](../10-graphs-bfs-dfs/hard.md))* | ⬜ | — | — |

---

## 1. Alien Dictionary  ·  LC 269

**Problem:** অজানা ভাষার শব্দ, সেই ভাষার অক্ষর-ক্রমে sorted। অক্ষরগুলোর একটা বৈধ ক্রম দাও; অসম্ভব হলে `""`।
**Example:** `["wrt","wrf","er","ett","rftt"] → "wertf"` · `["z","x","z"] → ""` · `["abc","ab"] → ""`

**Pattern:** Graph বানানো + Kahn's —
1. node = শব্দগুলোতে থাকা সব অক্ষর।
2. পাশাপাশি দুটো শব্দে প্রথম যে অবস্থানে অক্ষর আলাদা: `w1[j] → w2[j]` edge; তারপর থামো (বাকিটা কিছু বলে না)।
3. কোনো পার্থক্য না পেলে আর `w1` লম্বা (`"abc"` আগে `"ab"`) → অবৈধ।

**PHP:**
```php
<?php
function alienOrder(array $words): string
{
    $adj = []; $indeg = [];
    foreach ($words as $w) foreach (str_split($w) as $ch) { $adj[$ch] ??= []; $indeg[$ch] ??= 0; }
    for ($i = 0; $i + 1 < count($words); $i++) {
        [$a, $b] = [$words[$i], $words[$i + 1]];
        $len = min(strlen($a), strlen($b));
        $j = 0;
        while ($j < $len && $a[$j] === $b[$j]) $j++;
        if ($j === $len) {
            if (strlen($a) > strlen($b)) return '';          // "abc" before "ab": impossible
            continue;
        }
        if (!isset($adj[$a[$j]][$b[$j]])) {                  // avoid double-counting in-degree
            $adj[$a[$j]][$b[$j]] = true;
            $indeg[$b[$j]]++;
        }
    }
    $q = new SplQueue();
    foreach ($indeg as $ch => $d) if ($d === 0) $q->enqueue((string) $ch);
    $order = '';
    while (!$q->isEmpty()) {
        $c = $q->dequeue();
        $order .= $c;
        foreach (array_keys($adj[$c]) as $nx) {
            $nx = (string) $nx;
            if (--$indeg[$nx] === 0) $q->enqueue($nx);
        }
    }
    return strlen($order) === count($indeg) ? $order : '';   // leftovers => cycle
}

assert(alienOrder(['wrt', 'wrf', 'er', 'ett', 'rftt']) === 'wertf');
assert(alienOrder(['z', 'x']) === 'zx');
assert(alienOrder(['z', 'x', 'z']) === '');
assert(alienOrder(['abc', 'ab']) === '');
assert(strlen(alienOrder(['z', 'z'])) === 1);
```

> ⚠️ PHP: অক্ষর `'1'`-এর মতো digit হলে array key int হয়ে যায় — তাই `(string)` cast। (LC-তে শুধু a–z, তবু অভ্যাস রাখো।)

**Python:**
```python
from collections import deque

def alien_order(words: list[str]) -> str:
    adj = {ch: set() for w in words for ch in w}
    indeg = {ch: 0 for ch in adj}
    for a, b in zip(words, words[1:]):
        for x, y in zip(a, b):
            if x != y:
                if y not in adj[x]:
                    adj[x].add(y)
                    indeg[y] += 1
                break
        else:                          # no differing char found
            if len(a) > len(b):
                return ""
    q = deque(ch for ch, d in indeg.items() if d == 0)
    order = []
    while q:
        c = q.popleft()
        order.append(c)
        for nx in adj[c]:
            indeg[nx] -= 1
            if indeg[nx] == 0:
                q.append(nx)
    return "".join(order) if len(order) == len(indeg) else ""

assert alien_order(["wrt", "wrf", "er", "ett", "rftt"]) == "wertf"
assert alien_order(["z", "x", "z"]) == "" and alien_order(["abc", "ab"]) == ""
```

**Complexity:** Time O(C) (C = মোট অক্ষর) · Space O(U + E) (U ≤ 26)।
**Mistakes:** একই edge দুবার → in-degree দ্বিগুণ (set/check লাগে); প্রথম পার্থক্যের পরে আর edge যোগ করা; prefix কেস (`"abc"`, `"ab"`) ভুলে যাওয়া; যে অক্ষর কোনো edge-এ নেই সেটা output-এ রাখা ভুলে যাওয়া।

🎤 **Say this while coding:** "Adjacent words only tell me one thing: at the first position where they differ, the first word's letter comes earlier. Those pairs are edges; a topological sort gives the alphabet, and a cycle — or a word followed by its own prefix — means it's invalid."

---

## 2. Largest Color Value in a Directed Graph  ·  LC 1857

**Problem:** প্রতিটা node-এর একটা রং (`colors[i]`, a–z)। কোনো path-এ সবচেয়ে বেশি বার আসা রঙের সংখ্যা = path-এর color value। সব path-এর মধ্যে সর্বোচ্চ; graph-এ cycle থাকলে −1।
**Example:** `"abaca", [[0,1],[0,2],[2,3],[3,4]] → 3` (0→2→3→4-এ 'a' ৩ বার) · `"a", [[0,0]] → -1`
**Constraints:** `n, m ≤ 10⁵`

**Pattern:** Topo ক্রমে DP — `dp[v][c]` = v-তে শেষ হওয়া কোনো path-এ রং c সর্বোচ্চ কতবার। Kahn's-এ node বের করার সময় নিজের রং +1, তারপর প্রতিটা child-এ `dp[child][c] = max(dp[child][c], dp[v][c])`।

**PHP:**
```php
<?php
function largestPathValue(string $colors, array $edges): int
{
    $n = strlen($colors);
    $adj = array_fill(0, $n, []);
    $indeg = array_fill(0, $n, 0);
    foreach ($edges as [$u, $v]) { $adj[$u][] = $v; $indeg[$v]++; }
    $dp = array_fill(0, $n, array_fill(0, 26, 0));
    $q = new SplQueue();
    foreach ($indeg as $v => $d) if ($d === 0) $q->enqueue($v);
    $seen = 0; $best = 0;
    while (!$q->isEmpty()) {
        $u = $q->dequeue();
        $seen++;
        $dp[$u][ord($colors[$u]) - 97]++;                 // count u's own colour
        $best = max($best, max($dp[$u]));
        foreach ($adj[$u] as $v) {
            for ($c = 0; $c < 26; $c++) {
                if ($dp[$u][$c] > $dp[$v][$c]) $dp[$v][$c] = $dp[$u][$c];   // push best counts forward
            }
            if (--$indeg[$v] === 0) $q->enqueue($v);
        }
    }
    return $seen === $n ? $best : -1;                     // not all processed => cycle
}

assert(largestPathValue('abaca', [[0, 1], [0, 2], [2, 3], [3, 4]]) === 3);
assert(largestPathValue('a', [[0, 0]]) === -1);
assert(largestPathValue('hhqhuqhqff', [[0, 1], [0, 2], [2, 3], [3, 4], [3, 5], [5, 6], [2, 7], [6, 7], [7, 8], [3, 8], [5, 8], [8, 9], [3, 9], [6, 9]]) === 3);
```

**Python:**
```python
from collections import deque

def largest_path_value(colors: str, edges: list[list[int]]) -> int:
    n = len(colors)
    adj = [[] for _ in range(n)]
    indeg = [0] * n
    for u, v in edges:
        adj[u].append(v); indeg[v] += 1
    dp = [[0] * 26 for _ in range(n)]
    q = deque(v for v in range(n) if indeg[v] == 0)
    seen = best = 0
    while q:
        u = q.popleft()
        seen += 1
        dp[u][ord(colors[u]) - 97] += 1
        best = max(best, max(dp[u]))
        for v in adj[u]:
            dv, du = dp[v], dp[u]
            for c in range(26):
                if du[c] > dv[c]:
                    dv[c] = du[c]
            indeg[v] -= 1
            if indeg[v] == 0:
                q.append(v)
    return best if seen == n else -1

assert largest_path_value("abaca", [[0, 1], [0, 2], [2, 3], [3, 4]]) == 3
assert largest_path_value("a", [[0, 0]]) == -1
```

**Complexity:** Time O(26 · (V + E)) · Space O(26 · V)।
**Mistakes:** নিজের রং যোগ করার আগে child-এ ঠেলে দেওয়া (ক্রম: আগে নিজেকে গোনো, তারপর push); self-loop (`[0,0]`) = cycle।

🎤 **Say this while coding:** "Processing nodes in topological order guarantees all paths into a node are final before I use it. For each node I keep the best count of every colour along any path ending there, add its own colour, and push those counts to its children. If Kahn's can't process every node, there's a cycle."
