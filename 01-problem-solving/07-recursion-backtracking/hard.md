---
id: ps-recursion-backtracking-hard
title: "07 — Recursion & Backtracking — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, recursion-backtracking]
updated: 2026-11-14
---

# 07 — Recursion & Backtracking — Hard

> **Pattern চেনার সংকেত:** "সব valid configuration দাও" (board, sentence, placement) + ছোট n → backtracking। দ্রুত করতে: **O(1) conflict check** (set/array), **আগে prune**, আর একই sub-problem বারবার এলে **memo**।
> **Backtracking টেমপ্লেট:** choose → recurse → un-choose। প্রতিটা ধাপে: "এই state-এ কী কী option? কোনটা অবৈধ? কখন শেষ?"
> **লাইভ কোডিং স্ক্রিপ্ট:** [live-coding-script.md](../live-coding-script.md) · প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | N-Queens ⭐ | LC 51 | ⬜ | — | — |
| 2 | Sudoku Solver | LC 37 | ⬜ | — | — |
| 3 | Word Break II | LC 140 | ⬜ | — | — |
| 4 | Word Search II | LC 212 *(trie + DFS → [19 hard](../19-trie/hard.md))* | ⬜ | — | — |
| 5 | Remove Invalid Parentheses | LC 301 *(BFS by removals, বা DFS + count)* | ⬜ | — | — |

---

## 1. N-Queens  ·  LC 51

**Problem:** n×n বোর্ডে n-টা queen বসাও যাতে কেউ কাউকে আক্রমণ না করে; সব সমাধান দাও।
**Example:** `n=4 → [".Q..","...Q","Q...","..Q."], ["..Q.","Q...","...Q",".Q.."]`
**Constraints:** `1 ≤ n ≤ 9`

**Pattern:** Backtracking row ধরে — প্রতিটা row-এ ঠিক একটা queen, তাই প্রতি ধাপে শুধু column বাছতে হয়।

**Approach:**
1. Brute force: n² ঘর থেকে n-টা বাছাই — C(n², n), অসম্ভব।
2. Optimized: row `r`-এ column `c` চেষ্টা; বাধা তিনটা set-এ: `cols`, `diag (r−c)`, `anti (r+c)` — O(1) চেক। বসাও → পরের row → সরাও।

**PHP:**
```php
<?php
function solveNQueens(int $n): array
{
    $res = []; $queens = [];                 // queens[r] = column
    $cols = $diag = $anti = [];
    $place = function (int $r) use (&$place, &$res, &$queens, &$cols, &$diag, &$anti, $n): void {
        if ($r === $n) {
            $res[] = array_map(fn($c) => str_repeat('.', $c) . 'Q' . str_repeat('.', $n - $c - 1), $queens);
            return;
        }
        for ($c = 0; $c < $n; $c++) {
            if (isset($cols[$c]) || isset($diag[$r - $c]) || isset($anti[$r + $c])) continue;
            $queens[$r] = $c;
            $cols[$c] = $diag[$r - $c] = $anti[$r + $c] = true;     // choose
            $place($r + 1);                                          // recurse
            unset($cols[$c], $diag[$r - $c], $anti[$r + $c]);        // un-choose
        }
    };
    $place(0);
    return $res;
}

assert(solveNQueens(4) === [['.Q..', '...Q', 'Q...', '..Q.'], ['..Q.', 'Q...', '...Q', '.Q..']]);
assert(solveNQueens(1) === [['Q']]);
assert(count(solveNQueens(8)) === 92);
assert(solveNQueens(3) === []);
```

**Python:**
```python
def solve_n_queens(n: int) -> list[list[str]]:
    res, queens = [], []
    cols, diag, anti = set(), set(), set()

    def place(r: int) -> None:
        if r == n:
            res.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or r - c in diag or r + c in anti:
                continue
            queens.append(c); cols.add(c); diag.add(r - c); anti.add(r + c)
            place(r + 1)
            queens.pop(); cols.remove(c); diag.remove(r - c); anti.remove(r + c)

    place(0)
    return res

assert len(solve_n_queens(8)) == 92
assert solve_n_queens(4)[0] == [".Q..", "...Q", "Q...", "..Q."]
```

**Complexity:** Time O(n!) মোটামুটি · Space O(n)।

**Mistakes / edge cases:**
- diagonal-এর key: `r−c` (↘) আর `r+c` (↙) — দুটো আলাদা set।
- PHP closure-এ recursion: `use (&$place)` reference দিয়ে, নইলে closure নিজেকে দেখে না।
- n = 2, 3 → কোনো সমাধান নেই।

🎤 **Say this while coding:** "One queen per row, so I only choose a column at each row. Three sets for columns and both diagonals make the conflict check O(1), and I undo the choice after recursing."

---

## 2. Sudoku Solver  ·  LC 37

**Problem:** 9×9 sudoku (`.` = খালি) in-place পূরণ করো; একটাই সমাধান নিশ্চিত।
**Example:** স্ট্যান্ডার্ড LC বোর্ড (নিচে টেস্টে)।

**Pattern:** Backtracking + constraint sets — row, column, 3×3 box-এ কোন অঙ্ক আছে তা O(1)-এ জানা।

**Approach:**
1. খালি ঘরগুলোর list বানাও; `rows[r]`, `cols[c]`, `boxes[b]` set (b = `(r/3)*3 + c/3`)।
2. `k`-তম খালি ঘরে 1–9 চেষ্টা, বৈধ হলে বসিয়ে `k+1`; পুরো সফল হলে `true` ফেরত দিয়ে সব স্তর থেমে যায়।
3. (উন্নতি, মুখে বলো) সবচেয়ে কম option-ওয়ালা ঘর আগে নিলে (MRV) অনেক দ্রুত।

**PHP:**
```php
<?php
function solveSudoku(array &$board): void
{
    $rows = $cols = $boxes = array_fill(0, 9, []);
    $empty = [];
    for ($r = 0; $r < 9; $r++) {
        for ($c = 0; $c < 9; $c++) {
            $v = $board[$r][$c];
            if ($v === '.') { $empty[] = [$r, $c]; continue; }
            $b = intdiv($r, 3) * 3 + intdiv($c, 3);
            $rows[$r][$v] = $cols[$c][$v] = $boxes[$b][$v] = true;
        }
    }
    $solve = function (int $k) use (&$solve, &$board, &$rows, &$cols, &$boxes, $empty): bool {
        if ($k === count($empty)) return true;
        [$r, $c] = $empty[$k];
        $b = intdiv($r, 3) * 3 + intdiv($c, 3);
        for ($d = 1; $d <= 9; $d++) {
            $v = (string) $d;
            if (isset($rows[$r][$v]) || isset($cols[$c][$v]) || isset($boxes[$b][$v])) continue;
            $board[$r][$c] = $v;
            $rows[$r][$v] = $cols[$c][$v] = $boxes[$b][$v] = true;
            if ($solve($k + 1)) return true;
            unset($rows[$r][$v], $cols[$c][$v], $boxes[$b][$v]);
        }
        $board[$r][$c] = '.';
        return false;
    };
    $solve(0);
}

$board = array_map('str_split', [
    '53..7....', '6..195...', '.98....6.', '8...6...3', '4..8.3..1',
    '7...2...6', '.6....28.', '...419..5', '....8..79',
]);
solveSudoku($board);
assert(array_map('implode', $board) === [
    '534678912', '672195348', '198342567', '859761423', '426853791',
    '713924856', '961537284', '287419635', '345286179',
]);
```

**Python:**
```python
def solve_sudoku(board: list[list[str]]) -> None:
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                empty.append((r, c))
            else:
                rows[r].add(v); cols[c].add(v); boxes[r // 3 * 3 + c // 3].add(v)

    def solve(k: int) -> bool:
        if k == len(empty):
            return True
        r, c = empty[k]
        b = r // 3 * 3 + c // 3
        for v in "123456789":
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                continue
            board[r][c] = v
            rows[r].add(v); cols[c].add(v); boxes[b].add(v)
            if solve(k + 1):
                return True
            rows[r].remove(v); cols[c].remove(v); boxes[b].remove(v)
        board[r][c] = "."
        return False

    solve(0)

b = [list(row) for row in ["53..7....", "6..195...", ".98....6.", "8...6...3", "4..8.3..1",
                            "7...2...6", ".6....28.", "...419..5", "....8..79"]]
solve_sudoku(b)
assert "".join(b[0]) == "534678912" and "".join(b[8]) == "345286179"
```

**Complexity:** Time worst O(9^E) (E = খালি ঘর), বাস্তবে pruning-এর কারণে দ্রুত · Space O(E)।

**Mistakes / edge cases:**
- box index ভুল: `(r/3)*3 + c/3` — integer division।
- সফল হলে `return true` না দিলে পরের অঙ্ক চেষ্টা করে সমাধান মুছে ফেলে।
- PHP-তে বোর্ড reference (`&$board`) দিয়ে পাঠাও।

🎤 **Say this while coding:** "I precompute which digits each row, column and box already has, so each try is an O(1) check; on success I return true all the way up so the filled board is kept."

---

## 3. Word Break II  ·  LC 140

**Problem:** string `s` আর dictionary; `s`-কে dictionary-র শব্দে ভাগ করার সব বাক্য দাও।
**Example:** `"catsanddog", ["cat","cats","and","sand","dog"] → ["cats and dog","cat sand dog"]`
**Constraints:** `1 ≤ |s| ≤ 20`, dict ≤ 1000।

**Pattern:** Backtracking + memoization — একই suffix বারবার আসে (`"dog"` দুই পথে), তাই `memo[start]` = ওই index থেকে সব বাক্য।

**Approach:**
1. Brute force: প্রতিটা ভাগের জায়গায় কাটো/কাটো না — O(2ⁿ) আর একই কাজ বারবার।
2. Optimized: `dfs(start)`: `end` = start+1…n, `s[start:end]` dictionary-তে থাকলে `dfs(end)`-এর প্রতিটা বাক্যের সামনে জোড়ো। `start == n` → `[""]`। memo রাখো।

**PHP:**
```php
<?php
function wordBreak(string $s, array $wordDict): array
{
    $dict = array_flip($wordDict);
    $n = strlen($s);
    $memo = [];
    $dfs = function (int $start) use (&$dfs, &$memo, $dict, $s, $n): array {
        if ($start === $n) return [''];
        if (isset($memo[$start])) return $memo[$start];
        $out = [];
        for ($end = $start + 1; $end <= $n; $end++) {
            $word = substr($s, $start, $end - $start);
            if (!isset($dict[$word])) continue;
            foreach ($dfs($end) as $rest) {
                $out[] = $rest === '' ? $word : "$word $rest";
            }
        }
        return $memo[$start] = $out;
    };
    return $dfs(0);
}

$r = wordBreak('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']);
sort($r);
assert($r === ['cat sand dog', 'cats and dog']);
$r = wordBreak('pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']);
sort($r);
assert($r === ['pine apple pen apple', 'pine applepen apple', 'pineapple pen apple']);
assert(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']) === []);
```

**Python:**
```python
from functools import lru_cache

def word_break(s: str, word_dict: list[str]) -> list[str]:
    words = set(word_dict)
    n = len(s)

    @lru_cache(maxsize=None)
    def dfs(start: int) -> tuple[str, ...]:
        if start == n:
            return ("",)
        out = []
        for end in range(start + 1, n + 1):
            w = s[start:end]
            if w in words:
                out.extend(w if not rest else f"{w} {rest}" for rest in dfs(end))
        return tuple(out)

    return list(dfs(0))

assert sorted(word_break("catsanddog", ["cat", "cats", "and", "sand", "dog"])) == ["cat sand dog", "cats and dog"]
assert word_break("catsandog", ["cats", "dog", "sand", "and", "cat"]) == []
```

**Complexity:** Time O(n² + output size) মোটামুটি (worst-case output নিজেই exponential) · Space O(n · output)।

**Mistakes / edge cases:**
- memo ছাড়া `"aaaa…ab"` ধরনের ইনপুটে exponential সময়।
- base case `[""]` (একটা খালি বাক্য), `[]` না — নইলে কোনো বাক্যই তৈরি হয় না।
- Python `lru_cache`-এ list ফেরত দিলে mutable shared object → tuple ফেরত দাও।

🎤 **Say this while coding:** "This is backtracking over cut positions, but the same suffix is reached through different prefixes, so I memoize the list of sentences for each start index."

🔗 DistroSaaS: backtracking-এর মতো "সব বৈধ কম্বিনেশন" — **[Komol পূরণ করবে: route/beat প্ল্যানিং বা promotion-combination ধরনের কাজ থাকলে স্টোরি ID]**; না থাকলে সৎভাবে বলো এটা অ্যালগরিদম অনুশীলন।
