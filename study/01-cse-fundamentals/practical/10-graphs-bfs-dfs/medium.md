# 10 — Graphs · BFS / DFS — Medium

> Part of the Graphs pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Number of Islands — LC 200 → *worked below*
- [ ] Max Area of Island — LC 695 *(DFS returning area)*
- [ ] Clone Graph — LC 133 → *worked below*
- [ ] Rotting Oranges — LC 994 → *worked below*
- [ ] Course Schedule (cycle detect) — LC 207 → *worked below*
- [ ] Pacific Atlantic Water Flow — LC 417 *(DFS from the borders inward)*
- [ ] Number of Connected Components — LC 323 *(DFS or union-find)*
- [ ] Surrounded Regions — LC 130 *(mark border-connected, flip the rest)*

**⭐ Priority in this file:** none reported — but Number of Islands + Course Schedule are the two most-asked graph mediums anywhere.

---

## Worked Solutions

### Number of Islands — LC 200  *(DFS flood fill, count launches)*
```php
function numIslands(array $grid): int {
    if (empty($grid)) return 0;
    $rows = count($grid); $cols = count($grid[0]); $count = 0;
    $sink = function ($r, $c) use (&$sink, &$grid, $rows, $cols) {
        if ($r < 0 || $c < 0 || $r >= $rows || $c >= $cols || $grid[$r][$c] !== '1') return;
        $grid[$r][$c] = '0';                          // sink this land
        $sink($r+1,$c); $sink($r-1,$c); $sink($r,$c+1); $sink($r,$c-1);
    };
    for ($r = 0; $r < $rows; $r++)
        for ($c = 0; $c < $cols; $c++)
            if ($grid[$r][$c] === '1') { $count++; $sink($r, $c); } // one new island
    return $count;
}
// grid of '1'/'0' -> number of connected land blobs | O(R·C) / O(R·C) stack
```

### Rotting Oranges — LC 994  *(multi-source BFS, count minutes)*
```php
function orangesRotting(array $grid): int {
    $rows = count($grid); $cols = count($grid[0]);
    $q = new SplQueue(); $fresh = 0;
    for ($r = 0; $r < $rows; $r++)
        for ($c = 0; $c < $cols; $c++) {
            if ($grid[$r][$c] === 2) $q->enqueue([$r, $c]); // all rotten = sources
            if ($grid[$r][$c] === 1) $fresh++;
        }
    $minutes = 0; $dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    while (!$q->isEmpty() && $fresh > 0) {
        $minutes++;
        for ($i = $q->count(); $i > 0; $i--) {           // one minute = one BFS layer
            [$r, $c] = $q->dequeue();
            foreach ($dirs as [$dr, $dc]) {
                $nr = $r + $dr; $nc = $c + $dc;
                if ($nr >= 0 && $nc >= 0 && $nr < $rows && $nc < $cols && $grid[$nr][$nc] === 1) {
                    $grid[$nr][$nc] = 2; $fresh--; $q->enqueue([$nr, $nc]);
                }
            }
        }
    }
    return $fresh === 0 ? $minutes : -1;                 // leftover fresh = unreachable
}
// O(R·C) / O(R·C)
```

### Course Schedule (cycle detect) — LC 207  *(DFS 3-color)*
```php
function canFinish(int $numCourses, array $prerequisites): bool {
    $adj = array_fill(0, $numCourses, []);
    foreach ($prerequisites as [$a, $b]) $adj[$b][] = $a;   // b -> a
    $state = array_fill(0, $numCourses, 0);                 // 0=unseen,1=in-stack,2=done
    $dfs = function ($u) use (&$dfs, &$adj, &$state): bool {
        if ($state[$u] === 1) return false;                // back-edge = cycle
        if ($state[$u] === 2) return true;                 // already cleared
        $state[$u] = 1;
        foreach ($adj[$u] as $v) if (!$dfs($v)) return false;
        $state[$u] = 2;
        return true;
    };
    for ($i = 0; $i < $numCourses; $i++) if (!$dfs($i)) return false;
    return true;                                           // no cycle -> orderable
}
// canFinish(2, [[1,0]]) -> true ; [[1,0],[0,1]] -> false | O(V+E) / O(V)
```

### Clone Graph — LC 133  *(DFS + old→new map)*
```php
function cloneGraph($node, array &$seen = []) {
    if (!$node) return null;
    if (isset($seen[$node->val])) return $seen[$node->val]; // return the already-made copy
    $copy = new Node($node->val);
    $seen[$node->val] = $copy;                              // register BEFORE recursing (cycles)
    foreach ($node->neighbors as $nb) $copy->neighbors[] = cloneGraph($nb, $seen);
    return $copy;
}
// registering before recursion is what stops the neighbor cycle from looping | O(V+E) / O(V)
```
