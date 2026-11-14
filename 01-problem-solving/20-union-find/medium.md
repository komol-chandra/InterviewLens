---
id: ps-union-find-medium
title: "20 — Union-Find — Medium"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, union-find]
updated: 2026-11-14
---

# 20 — Union-Find — Medium

> **Pattern চেনার সংকেত:** "কোন edge বাদ দিলে tree হবে" → edge ক্রমে union, প্রথম যেটায় `union` false। "কোনো common item থাকলে দুটো রেকর্ড একই মানুষ" → item → প্রথম মালিক map, তারপর union।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন ও DSU টেমপ্লেট: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Redundant Connection ⭐ | LC 684 | ⬜ | — | — |
| 2 | Accounts Merge ⭐ | LC 721 | ⬜ | — | — |
| 3 | Number of Connected Components in an Undirected Graph | LC 323 | ⬜ | — | — |
| 4 | Most Stones Removed with Same Row or Column | LC 947 *(উত্তর = n − components)* | ⬜ | — | — |
| 5 | Min Cost to Connect All Points | LC 1584 *(Kruskal: edge sort + DSU)* | ⬜ | — | — |

---

## 1. Redundant Connection  ·  LC 684

**Problem:** n node-এর একটা tree-তে একটা বাড়তি edge যোগ হয়েছে (মোট n edge, node 1..n)। কোন edge বাদ দিলে আবার tree হয়? একাধিক হলে input-এ শেষেরটা।
**Example:** `[[1,2],[1,3],[2,3]] → [2,3]` · `[[1,2],[2,3],[3,4],[1,4],[1,5]] → [1,4]`

**Pattern:** DSU cycle detection — edge ক্রমে union; যে edge-এর দুই প্রান্ত আগেই connected, সেটাই cycle বানায়। ক্রমে যাচ্ছি বলে সেটাই "শেষের" উত্তর।

**PHP:**
```php
<?php
function findRedundantConnection(array $edges): array
{
    $parent = range(0, count($edges));             // nodes are 1..n
    $find = function (int $x) use (&$parent): int {
        while ($parent[$x] !== $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x]; }
        return $x;
    };
    foreach ($edges as [$a, $b]) {
        $ra = $find($a); $rb = $find($b);
        if ($ra === $rb) return [$a, $b];          // already connected: this edge closes a cycle
        $parent[$ra] = $rb;
    }
    return [];
}

assert(findRedundantConnection([[1, 2], [1, 3], [2, 3]]) === [2, 3]);
assert(findRedundantConnection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]) === [1, 4]);
```

**Python:**
```python
def find_redundant_connection(edges: list[list[int]]) -> list[int]:
    parent = list(range(len(edges) + 1))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    for a, b in edges:
        ra, rb = find(a), find(b)
        if ra == rb:
            return [a, b]
        parent[ra] = rb
    return []

assert find_redundant_connection([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]) == [1, 4]
```

**Complexity:** Time O(n · α(n)) · Space O(n)।
**Mistakes:** node 1-indexed → parent array n+1 সাইজ। Directed রূপ (LC 685) আলাদা ও কঠিন — দুই parent-ওয়ালা node কেস আছে।

🎤 **Say this while coding:** "In a tree any two nodes are connected by exactly one path, so the first edge whose endpoints are already in the same set is the one that creates the cycle."

---

## 2. Accounts Merge  ·  LC 721

**Problem:** প্রতিটা account = `[name, email1, email2, …]`। দুটো account-এ একটা common email থাকলে একই মানুষ (নাম এক হলেই না)। merge করো; প্রতিটার email sorted।
**Example:** নিচে টেস্টে।
**Constraints:** account ≤ 1000, প্রতিটায় email ≤ 10।

**Pattern:** DSU on account index — `email → প্রথম যে account-এ দেখা` map; আবার দেখা গেলে দুই account union।

**Approach:**
1. প্রতিটা account i, প্রতিটা email: map-এ থাকলে `union(i, owner)`, নইলে `owner = i`।
2. প্রতিটা email-কে তার owner-এর root-এর group-এ রাখো; sort; নাম সামনে।

**PHP:**
```php
<?php
function accountsMerge(array $accounts): array
{
    $n = count($accounts);
    $parent = range(0, $n - 1);
    $find = function (int $x) use (&$parent): int {
        while ($parent[$x] !== $x) { $parent[$x] = $parent[$parent[$x]]; $x = $parent[$x]; }
        return $x;
    };
    $owner = [];                                      // email => first account index
    foreach ($accounts as $i => $acc) {
        foreach (array_slice($acc, 1) as $email) {
            if (isset($owner[$email])) $parent[$find($i)] = $find($owner[$email]);
            else $owner[$email] = $i;
        }
    }
    $groups = [];                                     // root => [emails]
    foreach ($owner as $email => $i) $groups[$find($i)][] = $email;
    $res = [];
    foreach ($groups as $root => $emails) {
        sort($emails, SORT_STRING);
        $res[] = array_merge([$accounts[$root][0]], $emails);
    }
    usort($res, fn($a, $b) => [$a[0], $a[1]] <=> [$b[0], $b[1]]);   // deterministic order for tests
    return $res;
}

$in = [
    ['John', 'johnsmith@mail.com', 'john_newyork@mail.com'],
    ['John', 'johnsmith@mail.com', 'john00@mail.com'],
    ['Mary', 'mary@mail.com'],
    ['John', 'johnnybravo@mail.com'],
];
assert(accountsMerge($in) === [
    ['John', 'john00@mail.com', 'john_newyork@mail.com', 'johnsmith@mail.com'],
    ['John', 'johnnybravo@mail.com'],
    ['Mary', 'mary@mail.com'],
]);
```

**Python:**
```python
from collections import defaultdict

def accounts_merge(accounts: list[list[str]]) -> list[list[str]]:
    parent = list(range(len(accounts)))

    def find(x: int) -> int:
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    owner: dict[str, int] = {}
    for i, acc in enumerate(accounts):
        for email in acc[1:]:
            if email in owner:
                parent[find(i)] = find(owner[email])
            else:
                owner[email] = i
    groups: dict[int, list[str]] = defaultdict(list)
    for email, i in owner.items():
        groups[find(i)].append(email)
    return sorted([accounts[r][0], *sorted(es)] for r, es in groups.items())

res = accounts_merge([["John", "johnsmith@mail.com", "john_newyork@mail.com"],
                      ["John", "johnsmith@mail.com", "john00@mail.com"],
                      ["Mary", "mary@mail.com"], ["John", "johnnybravo@mail.com"]])
assert res[0] == ["John", "john00@mail.com", "john_newyork@mail.com", "johnsmith@mail.com"] and len(res) == 3
```

**Complexity:** Time O(E log E) (E = মোট email, sort-এর জন্য) · Space O(E)।
**Mistakes:** নাম দিয়ে merge করা (একই নামের আলাদা মানুষ থাকে); PHP-তে সংখ্যার মতো দেখতে key int হয়ে যায় — email-এ সমস্যা নেই, কিন্তু সাধারণভাবে মনে রাখো।

🎤 **Say this while coding:** "Accounts are nodes; sharing an email is an edge. I map each email to the first account that had it and union any later account with that owner, then collect emails per root."

🔗 DistroSaaS: একই ফোন নম্বর/ঠিকানার duplicate outlet রেকর্ড মেলানো — **[Komol পূরণ করবে: duplicate outlet/retailer cleanup-এর স্টোরি ID]**।
