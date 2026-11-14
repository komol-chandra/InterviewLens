# 09 — Trees & BST — Easy

> Part of the Trees & BST pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Maximum Depth of Binary Tree — LC 104 → *worked below*
- [ ] Invert Binary Tree — LC 226 → *worked below*
- [ ] Same Tree — LC 100
- [ ] Symmetric Tree — LC 101
- [ ] Path Sum — LC 112
- [ ] Diameter of Binary Tree — LC 543 *(DFS returning depth, track best)*
- [ ] Balanced Binary Tree — LC 110
- [ ] Binary Tree Inorder Traversal — LC 94

---

## Worked Solutions

### Maximum Depth of Binary Tree — LC 104  *(DFS post-order)*
```php
function maxDepth(?TreeNode $root): int {
    if (!$root) return 0;                                   // empty -> depth 0
    return 1 + max(maxDepth($root->left), maxDepth($root->right));
}
// depth of [3,9,20,null,null,15,7] -> 3 | O(n) / O(h)
```

### Invert Binary Tree — LC 226  *(swap children, recurse)*
```php
function invertTree(?TreeNode $root): ?TreeNode {
    if (!$root) return null;
    [$root->left, $root->right] = [invertTree($root->right), invertTree($root->left)];
    return $root;
}
// mirrors the tree | O(n) / O(h)
```
