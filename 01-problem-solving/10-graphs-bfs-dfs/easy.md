---
id: ps-graphs-bfs-dfs-easy
title: "10 — Graphs · BFS / DFS — Easy"
track: problem-solving
type: problem-set
status: stub
conf: 0
tier: starter
tags: [problem-solving, graphs-bfs-dfs]
updated: 2026-10-15
---

# 10 — Graphs · BFS / DFS — Easy

> Part of the Graphs pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Flood Fill — LC 733 → *worked below*
- [ ] BFS traversal of a graph — GfG
- [ ] DFS traversal of a graph — GfG

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
