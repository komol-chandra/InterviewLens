# 09 — Trees & BST — Medium

> Part of the Trees & BST pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable template, and common traps.

## Checklist

- [ ] Level Order Traversal (BFS) — LC 102 → *worked below*
- [ ] Validate BST — LC 98 → *worked below*
- [ ] Lowest Common Ancestor of BST — LC 235 → *worked below*
- [ ] Kth Smallest Element in a BST — LC 230 → *worked below*
- [ ] Construct Tree from Preorder & Inorder — LC 105
- [ ] Binary Tree Right Side View — LC 199 *(BFS, take last of each level)*
- [ ] Count Good Nodes in Binary Tree — LC 1448

**⭐ Priority in this file:** none (no reported ⭐ here) — but Validate BST + Level Order are the highest-yield mediums.

---

## Worked Solutions

### Level Order Traversal (BFS) — LC 102
```php
function levelOrder(?TreeNode $root): array {
    if (!$root) return [];
    $out = []; $q = new SplQueue(); $q->enqueue($root);
    while (!$q->isEmpty()) {
        $level = []; $size = $q->count();
        for ($i = 0; $i < $size; $i++) {
            $n = $q->dequeue(); $level[] = $n->val;
            if ($n->left)  $q->enqueue($n->left);
            if ($n->right) $q->enqueue($n->right);
        }
        $out[] = $level;                        // one array per level
    }
    return $out;
}
// [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]] | O(n) / O(w)
```

### Validate BST — LC 98  *(carry min/max bounds)*
```php
function isValidBST(?TreeNode $node, $min = null, $max = null): bool {
    if (!$node) return true;
    if (($min !== null && $node->val <= $min) ||
        ($max !== null && $node->val >= $max)) return false; // out of allowed range
    return isValidBST($node->left,  $min, $node->val)        // right bound tightens
        && isValidBST($node->right, $node->val, $max);       // left bound tightens
}
// [5,1,4,null,null,3,6] -> false (4 < 5 on the right) | O(n) / O(h)
```

### Kth Smallest Element in a BST — LC 230  *(inorder = sorted)*
```php
function kthSmallest(?TreeNode $root, int $k): int {
    $stack = []; $node = $root;
    while ($node || !empty($stack)) {
        while ($node) { $stack[] = $node; $node = $node->left; } // dive left
        $node = array_pop($stack);
        if (--$k === 0) return $node->val;      // kth visited in sorted order
        $node = $node->right;
    }
    return -1;
}
// iterative inorder stops early at the kth node | O(h + k) / O(h)
```

### Lowest Common Ancestor of a BST — LC 235  *(use ordering to walk down)*
```php
function lowestCommonAncestor(?TreeNode $root, TreeNode $p, TreeNode $q): ?TreeNode {
    while ($root) {
        if ($p->val < $root->val && $q->val < $root->val) $root = $root->left;
        elseif ($p->val > $root->val && $q->val > $root->val) $root = $root->right;
        else return $root;                      // split point = LCA
    }
    return null;
}
// both smaller -> go left, both bigger -> go right, else this node | O(h) / O(1)
```
