---
id: ps-union-find-easy
title: "20 — Union-Find — Easy"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, union-find]
updated: 2026-11-14
---

# 20 — Union-Find — Easy

> **Pattern চেনার সংকেত:** "কয়টা আলাদা group" → DSU-র `components`। "`a==b` আর `a!=b` শর্ত একসাথে সম্ভব?" → আগে সব `==` union, তারপর `!=` চেক।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও DSU টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Number of Provinces ⭐ | LC 547 *(LC-তে medium; DSU-র প্রথম অনুশীলন)* | ⬜ | — | — |
| 2 | Satisfiability of Equality Equations | LC 990 | ⬜ | — | — |
| 3 | Find if Path Exists in Graph | LC 1971 *(DFS সমাধান [10 easy](../10-graphs-bfs-dfs/easy.md)-এ; DSU দিয়ে আবার করো)* | ⬜ | — | — |

---

## 1. Number of Provinces  ·  LC 547

**Problem:** `isConnected[i][j] = 1` মানে শহর i আর j সরাসরি যুক্ত; province = connected component। কয়টা?
**Example:** `[[1,1,0],[1,1,0],[0,0,1]] → 2`

**Pattern:** DSU — প্রতিটা `1`-এ union, শেষে component সংখ্যা।

**PHP:**
```php
<?php
function findCircleNum(array $isConnected): int
{
    $n = count($isConnected);
    $parent = range(0, $n - 1);
    $find = function (int $x) use (&$parent): int {
        while ($parent[$x] !== $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x]; }
        return $x;
    };
    $components = $n;
    for ($i = 0; $i < $n; $i++) {
        for ($j = $i + 1; $j < $n; $j++) {            // matrix is symmetric: upper triangle only
            if (!$isConnected[$i][$j]) continue;
            $ri = $find($i); $rj = $find($j);
            if ($ri !== $rj) { $parent[$ri] = $rj; $components--; }
        }
    }
    return $components;
}

assert(findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]]) === 2);
assert(findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]]) === 3);
assert(findCircleNum([[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]) === 1);
```

**Python:**
```python
def find_circle_num(is_connected: list[list[int]]) -> int:
    n = len(is_connected)
    parent = list(range(n))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    components = n
    for i in range(n):
        for j in range(i + 1, n):
            if is_connected[i][j]:
                ri, rj = find(i), find(j)
                if ri != rj:
                    parent[ri] = rj
                    components -= 1
    return components

assert find_circle_num([[1, 1, 0], [1, 1, 0], [0, 0, 1]]) == 2
assert find_circle_num([[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 1], [1, 0, 1, 1]]) == 1
```

**Complexity:** Time O(n² · α(n)) · Space O(n)।
**Mistakes:** root না খুঁজে `parent[i] = j`।

🎤 **Say this while coding:** "Every direct connection is a union; I start with n components and decrement each time a union actually merges two different groups."

---

## 2. Satisfiability of Equality Equations  ·  LC 990

**Problem:** `"a==b"` বা `"a!=b"` ধরনের সমীকরণ (একক ছোট হাতের অক্ষর); সব একসাথে সত্য করা যায়?
**Example:** `["a==b","b!=a"] → false` · `["a==b","b==c","a==c"] → true` · `["a==b","b==c","c!=a"] → false`

**Pattern:** DSU দুই pass — `==` গুলো দিয়ে group বানাও; তারপর প্রতিটা `!=`-এর দুই পাশ একই group-এ হলে অসম্ভব।

**PHP:**
```php
<?php
function equationsPossible(array $equations): bool
{
    $parent = range(0, 25);
    $find = function (int $x) use (&$parent): int {
        while ($parent[$x] !== $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x]; }
        return $x;
    };
    foreach ($equations as $e) {                         // pass 1: merge equal variables
        if ($e[1] === '=') $parent[$find(ord($e[0]) - 97)] = $find(ord($e[3]) - 97);
    }
    foreach ($equations as $e) {                         // pass 2: check every inequality
        if ($e[1] === '!' && $find(ord($e[0]) - 97) === $find(ord($e[3]) - 97)) return false;
    }
    return true;
}

assert(equationsPossible(['a==b', 'b!=a']) === false);
assert(equationsPossible(['b==a', 'a==b']) === true);
assert(equationsPossible(['a==b', 'b==c', 'a==c']) === true);
assert(equationsPossible(['a==b', 'b==c', 'c!=a']) === false);
assert(equationsPossible(['a!=a']) === false);
```

**Python:**
```python
def equations_possible(equations: list[str]) -> bool:
    parent = list(range(26))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    idx = lambda ch: ord(ch) - ord("a")
    for e in equations:
        if e[1] == "=":
            parent[find(idx(e[0]))] = find(idx(e[3]))
    return all(find(idx(e[0])) != find(idx(e[3])) for e in equations if e[1] == "!")

assert not equations_possible(["a==b", "b==c", "c!=a"]) and not equations_possible(["a!=a"])
```

**Complexity:** Time O(n · α(26)) · Space O(1) (২৬টা অক্ষর)।
**Mistakes:** এক pass-এ দুটো একসাথে চেক করা — পরে আসা `==` আগের `!=`-কে ভাঙতে পারে।

🎤 **Say this while coding:** "Equalities are transitive, so I first union all equal pairs; only then can I check each inequality against the final groups."
