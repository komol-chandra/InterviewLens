---
id: ps-trees-bst-hard
title: "09 — Trees & BST — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, trees-bst]
updated: 2026-11-14
---

# 09 — Trees & BST — Hard

> **Pattern চেনার সংকেত:** "path যেকোনো node থেকে যেকোনো node" → post-order DFS যেটা **parent-কে এক দিকের মান ফেরত দেয়**, কিন্তু global উত্তরে **দুই দিক** জোড়ে। "tree → string → tree" → pre-order + null marker। "প্রতিটা node-কে cover/monitor করো, minimum" → DFS-এ প্রতিটা node-এর state (greedy বটম-আপ)।
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Binary Tree Maximum Path Sum ⭐ | LC 124 | ⬜ | — | — |
| 2 | Serialize and Deserialize Binary Tree ⭐ | LC 297 | ⬜ | — | — |
| 3 | Binary Tree Cameras | LC 968 | ⬜ | — | — |
| 4 | Recover Binary Search Tree | LC 99 *(inorder-এ দুটো উল্টো জায়গা)* | ⬜ | — | — |
| 5 | Vertical Order Traversal | LC 987 *(BFS + (col,row,val) sort)* | ⬜ | — | — |

> নিচের কোডে tree বানানো হয় level-order array থেকে (`null` = খালি), LeetCode-এর মতো।

---

## 1. Binary Tree Maximum Path Sum  ·  LC 124

**Problem:** path = যেকোনো node থেকে যেকোনো node, প্রতিটা node সর্বোচ্চ একবার, root দিয়ে যেতে হবে না। সর্বোচ্চ path sum (negative থাকতে পারে)।
**Example:** `[1,2,3] → 6` · `[-10,9,20,null,null,15,7] → 42` (15→20→7)
**Constraints:** `1 ≤ n ≤ 3·10⁴`, `-1000 ≤ val ≤ 1000`

**Pattern:** Post-order DFS, দুই ধরনের মান — **ফেরত** দাও "এই node থেকে নিচে এক দিকে সেরা gain" (parent এটা বাড়াতে পারে), আর **global**-এ আপডেট করো "এই node-এ বাঁক নেওয়া path = left + node + right"।

**Approach:**
1. `gain(node)`: `l = max(gain(left), 0)`, `r = max(gain(right), 0)` (negative হলে না নেওয়াই ভালো)।
2. `best = max(best, node.val + l + r)`।
3. return `node.val + max(l, r)`।

**PHP:**
```php
<?php
final class TreeNode
{
    public function __construct(public int $val = 0, public ?TreeNode $left = null, public ?TreeNode $right = null) {}
}
function buildTree(array $a): ?TreeNode
{
    if (!$a || $a[0] === null) return null;
    $root = new TreeNode($a[0]); $q = [$root]; $i = 1;
    for ($h = 0; $h < count($q) && $i < count($a); $h++) {
        $node = $q[$h];
        if ($i < count($a) && $a[$i] !== null) { $node->left = new TreeNode($a[$i]); $q[] = $node->left; } $i++;
        if ($i < count($a) && $a[$i] !== null) { $node->right = new TreeNode($a[$i]); $q[] = $node->right; } $i++;
    }
    return $root;
}

function maxPathSum(?TreeNode $root): int
{
    $best = PHP_INT_MIN;
    $gain = function (?TreeNode $node) use (&$gain, &$best): int {
        if (!$node) return 0;
        $l = max($gain($node->left), 0);       // drop negative branches
        $r = max($gain($node->right), 0);
        $best = max($best, $node->val + $l + $r);   // path that bends here
        return $node->val + max($l, $r);            // parent can extend only one side
    };
    $gain($root);
    return $best;
}

assert(maxPathSum(buildTree([1, 2, 3])) === 6);
assert(maxPathSum(buildTree([-10, 9, 20, null, null, 15, 7])) === 42);
assert(maxPathSum(buildTree([-3])) === -3);
assert(maxPathSum(buildTree([2, -1])) === 2);
```

**Python:**
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build_tree(a):
    if not a or a[0] is None:
        return None
    root = TreeNode(a[0]); q = [root]; i = 1; h = 0
    while h < len(q) and i < len(a):
        node = q[h]; h += 1
        if i < len(a) and a[i] is not None:
            node.left = TreeNode(a[i]); q.append(node.left)
        i += 1
        if i < len(a) and a[i] is not None:
            node.right = TreeNode(a[i]); q.append(node.right)
        i += 1
    return root

def max_path_sum(root) -> int:
    best = float("-inf")

    def gain(node) -> int:
        nonlocal best
        if not node:
            return 0
        l = max(gain(node.left), 0)
        r = max(gain(node.right), 0)
        best = max(best, node.val + l + r)
        return node.val + max(l, r)

    gain(root)
    return best

assert max_path_sum(build_tree([-10, 9, 20, None, None, 15, 7])) == 42
assert max_path_sum(build_tree([-3])) == -3
```

**Complexity:** Time O(n) · Space O(h)।

**Mistakes / edge cases:**
- সব negative → `best` শুরু 0 দিলে ভুল; `-∞` থেকে শুরু।
- parent-কে `l + r + val` ফেরত দেওয়া — তাহলে path "Y" আকার হয়, বৈধ না।

🎤 **Say this while coding:** "Each call returns the best downward path that a parent could extend — only one side — while separately updating the global answer with the path that bends at this node using both sides."

---

## 2. Serialize and Deserialize Binary Tree  ·  LC 297

**Problem:** binary tree → string আর string → একই tree।
**Example:** `[1,2,3,null,null,4,5]` → যেকোনো ফরম্যাট → একই tree।

**Pattern:** Pre-order DFS + null marker — pre-order-এ null চিহ্ন থাকলে tree অনন্যভাবে আবার বানানো যায়।

**Approach:**
1. serialize: `node ? "val," + ser(left) + ser(right) : "#,"`।
2. deserialize: token list-এর ওপর একটা pointer; `#` → null; নইলে node, তারপর recursive left, right।

**PHP:**
```php
<?php
final class TreeNode
{
    public function __construct(public int $val = 0, public ?TreeNode $left = null, public ?TreeNode $right = null) {}
}

final class Codec
{
    public function serialize(?TreeNode $root): string
    {
        $out = [];
        $walk = function (?TreeNode $n) use (&$walk, &$out): void {
            if (!$n) { $out[] = '#'; return; }
            $out[] = (string) $n->val;
            $walk($n->left);
            $walk($n->right);
        };
        $walk($root);
        return implode(',', $out);
    }

    public function deserialize(string $data): ?TreeNode
    {
        $tokens = explode(',', $data);
        $i = 0;
        $build = function () use (&$build, &$tokens, &$i): ?TreeNode {
            $t = $tokens[$i++];
            if ($t === '#') return null;
            $node = new TreeNode((int) $t);
            $node->left = $build();
            $node->right = $build();
            return $node;
        };
        return $build();
    }
}

$c = new Codec();
$root = new TreeNode(1, new TreeNode(2), new TreeNode(3, new TreeNode(4), new TreeNode(5)));
$s = $c->serialize($root);
assert($s === '1,2,#,#,3,4,#,#,5,#,#');
assert($c->serialize($c->deserialize($s)) === $s);
assert($c->serialize(null) === '#' && $c->deserialize('#') === null);
assert($c->serialize($c->deserialize('-5,#,7,#,#')) === '-5,#,7,#,#');
```

**Python:**
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def serialize(root) -> str:
    out = []
    def walk(n):
        if not n:
            out.append("#"); return
        out.append(str(n.val)); walk(n.left); walk(n.right)
    walk(root)
    return ",".join(out)

def deserialize(data: str):
    tokens = iter(data.split(","))
    def build():
        t = next(tokens)
        if t == "#":
            return None
        node = TreeNode(int(t))
        node.left, node.right = build(), build()
        return node
    return build()

s = serialize(TreeNode(1, TreeNode(2), TreeNode(3, TreeNode(4), TreeNode(5))))
assert s == "1,2,#,#,3,4,#,#,5,#,#" and serialize(deserialize(s)) == s
```

**Complexity:** Time O(n) · Space O(n)।

**Mistakes / edge cases:**
- null marker ছাড়া শুধু pre-order দিয়ে tree অনন্য হয় না।
- negative ও বহু-অঙ্কের মান → separator লাগে।
- খুব গভীর tree-তে recursion limit → BFS ফরম্যাট বিকল্প।

🎤 **Say this while coding:** "Pre-order with explicit null markers is enough to rebuild the tree uniquely; deserialization consumes the tokens in the same order with a shared pointer."

🔗 DistroSaaS: hierarchy (territory/region tree) DB-তে রাখা আর API-তে nested JSON হিসেবে পাঠানো একই সমস্যা — **[Komol পূরণ করবে: territory hierarchy স্টোরি ID]**।

---

## 3. Binary Tree Cameras  ·  LC 968

**Problem:** একটা camera নিজেকে, parent আর children-কে monitor করে। সব node monitor করতে সর্বনিম্ন camera?
**Example:** `[0,0,null,0,0] → 1` · `[0,0,null,0,null,0,null,null,0] → 2`
**Constraints:** `1 ≤ n ≤ 1000`

**Pattern:** Greedy post-order DFS with states — leaf-এ camera বসানো সবসময় খারাপ; তার parent-এ বসানো ভালো। প্রতিটা node ফেরত দেয়: `0` = monitor হয়নি, `1` = camera আছে, `2` = monitored (camera ছাড়া)।

**Approach:**
1. null → `2` (monitored ধরো, যাতে leaf-এ camera না বসে)।
2. কোনো child `0` → এখানে camera বসাও, `1` ফেরত।
3. কোনো child `1` → `2` ফেরত।
4. নইলে `0`। শেষে root `0` হলে আরেকটা camera।

**PHP:**
```php
<?php
final class TreeNode
{
    public function __construct(public int $val = 0, public ?TreeNode $left = null, public ?TreeNode $right = null) {}
}

function minCameraCover(?TreeNode $root): int
{
    $cams = 0;
    $dfs = function (?TreeNode $n) use (&$dfs, &$cams): int {
        if (!$n) return 2;                         // null counts as covered
        $l = $dfs($n->left);
        $r = $dfs($n->right);
        if ($l === 0 || $r === 0) { $cams++; return 1; }   // a child needs us
        if ($l === 1 || $r === 1) return 2;                // a child watches us
        return 0;                                          // leave it to our parent
    };
    if ($dfs($root) === 0) $cams++;
    return $cams;
}

// [0,0,null,0,0]
assert(minCameraCover(new TreeNode(0, new TreeNode(0, new TreeNode(0), new TreeNode(0)))) === 1);
// chain of 5 nodes
$chain = new TreeNode(0, new TreeNode(0, new TreeNode(0, new TreeNode(0, new TreeNode(0)))));
assert(minCameraCover($chain) === 2);
assert(minCameraCover(new TreeNode(0)) === 1);
```

**Python:**
```python
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def min_camera_cover(root) -> int:
    cams = 0

    def dfs(n) -> int:
        nonlocal cams
        if not n:
            return 2
        l, r = dfs(n.left), dfs(n.right)
        if l == 0 or r == 0:
            cams += 1
            return 1
        if l == 1 or r == 1:
            return 2
        return 0

    root_state = dfs(root)          # run DFS first: `cams + dfs(...)` would read cams too early
    return cams + (1 if root_state == 0 else 0)

assert min_camera_cover(TreeNode(0, TreeNode(0, TreeNode(0), TreeNode(0)))) == 1
assert min_camera_cover(TreeNode(0)) == 1
```

**Complexity:** Time O(n) · Space O(h)।

**Mistakes / edge cases:**
- null-কে `0` ফেরত দিলে প্রতিটা leaf-এ camera বসে।
- root uncovered কেস ভুলে যাওয়া (single node → 1)।
- Python-এ `return cams + (dfs(root) == 0)` লিখলে `cams` পড়া হয় DFS চলার **আগে** (বাম থেকে ডানে evaluate) → সবসময় 0/1। আগে DFS চালিয়ে ফল variable-এ রাখো।

🎤 **Say this while coding:** "Greedy from the bottom: a camera on a leaf's parent covers strictly more than one on the leaf, so each node reports whether it needs coverage, has a camera, or is already covered."
