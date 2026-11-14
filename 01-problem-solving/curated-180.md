---
id: ps-curated-index
title: "Problem Index (curated)"
track: problem-solving
type: note
status: good
conf: 0
tier: starter
tags: [problem-solving, index]
updated: 2026-11-14
---

# Problem Index (curated)

`01-problem-solving/`-এর সব প্রবলেম এক জায়গায়, প্যাটার্ন ধরে। একই প্রবলেম কয়েকটা প্যাটার্নে থাকলে এখানে একবারই আছে — যে ফাইলে worked solution আছে সেখানকার লিংক দিয়ে।

> ফাইলের নাম `curated-180` রোডম্যাপ থেকে এসেছে (লক্ষ্য ছিল ~১৮০)। আসলে আছে **324টা আলাদা প্রবলেম** — E 105 · M 134 · H 85; এর মধ্যে **190টার** PHP (আর নতুনগুলোতে Python-ও) worked solution রিপোতে আছে। Starter লক্ষ্য (≥ ১৫০ সমাধান) পূরণে ⭐ আর ✍️ আগে করো।

**চিহ্ন:** ⭐ = প্রায়োরিটি · ✍️ = worked solution আছে (আগে নিজে চেষ্টা, তারপর মেলাও) · `Solved` কলামে নিজের ✅ + তারিখ বসাও।
**ক্রম:** প্রতিদিন দুর্বলতম প্যাটার্ন থেকে easy → medium → hard ([`which-pattern.md`](which-pattern.md), [`live-coding-script.md`](live-coding-script.md))।

## সারসংক্ষেপ

| প্যাটার্ন | E | M | H | মোট | ✍️ |
|---|---|---|---|---|---|
| [01-arrays](01-arrays/README.md) | 9 | 10 | 4 | 23 | 9 |
| [02-strings](02-strings/README.md) | 8 | 9 | 3 | 20 | 8 |
| [03-hashing](03-hashing/README.md) | 6 | 5 | 5 | 16 | 8 |
| [04-two-pointers-sliding-window](04-two-pointers-sliding-window/README.md) | 4 | 6 | 5 | 15 | 10 |
| [05-stack-queue](05-stack-queue/README.md) | 5 | 7 | 4 | 16 | 9 |
| [06-linked-list](06-linked-list/README.md) | 8 | 6 | 3 | 17 | 9 |
| [07-recursion-backtracking](07-recursion-backtracking/README.md) | 4 | 7 | 4 | 15 | 8 |
| [08-sorting-searching](08-sorting-searching/README.md) | 6 | 10 | 4 | 20 | 12 |
| [09-trees-bst](09-trees-bst/README.md) | 8 | 7 | 5 | 20 | 9 |
| [10-graphs-bfs-dfs](10-graphs-bfs-dfs/README.md) | 4 | 8 | 5 | 17 | 11 |
| [11-greedy](11-greedy/README.md) | 2 | 8 | 3 | 13 | 8 |
| [12-dp](12-dp/README.md) | 4 | 11 | 4 | 19 | 12 |
| [13-math-bit-manipulation](13-math-bit-manipulation/README.md) | 10 | 4 | 3 | 17 | 12 |
| [14-sql](14-sql/README.md) | 4 | 4 | 5 | 13 | 9 |
| [15-heap](15-heap/README.md) | 4 | 3 | 4 | 11 | 8 |
| [16-intervals](16-intervals/README.md) | 3 | 4 | 4 | 11 | 8 |
| [17-prefix-sum](17-prefix-sum/README.md) | 4 | 5 | 4 | 13 | 8 |
| [18-monotonic-stack](18-monotonic-stack/README.md) | 2 | 4 | 3 | 9 | 7 |
| [19-trie](19-trie/README.md) | 3 | 4 | 4 | 11 | 7 |
| [20-union-find](20-union-find/README.md) | 2 | 4 | 3 | 9 | 6 |
| [21-topological-sort](21-topological-sort/README.md) | 2 | 4 | 3 | 9 | 6 |
| [22-binary-search-on-answer](22-binary-search-on-answer/README.md) | 3 | 4 | 3 | 10 | 6 |
| **মোট** | **105** | **134** | **85** | **324** | **190** |

## 01-arrays

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Two Sum](01-arrays/easy.md) | LC 1 | E | ✍️ | ⬜ |
| 2 | [Best Time to Buy and Sell Stock](01-arrays/easy.md) | LC 121 | E | ✍️ | ⬜ |
| 3 | [Move Zeroes](01-arrays/easy.md) | LC 283 | E | ✍️ | ⬜ |
| 4 | [Plus One](01-arrays/easy.md) | LC 66 | E |  | ⬜ |
| 5 | [Merge Sorted Array](01-arrays/easy.md) | LC 88 | E |  | ⬜ |
| 6 | [Remove Duplicates from Sorted Array](01-arrays/easy.md) | LC 26 | E |  | ⬜ |
| 7 | [Majority Element](01-arrays/easy.md) | LC 169 | E |  | ⬜ |
| 8 | [Find All Numbers Disappeared in an Array](01-arrays/easy.md) | LC 448 | E |  | ⬜ |
| 9 | [Intersection of Two Arrays II](01-arrays/easy.md) | LC 350 | E |  | ⬜ |
| 10 | [Maximum Subarray (Kadane's)](01-arrays/medium.md) | LC 53 | M | ✍️ | ⬜ |
| 11 | [Rotate Array](01-arrays/medium.md) | LC 189 | M |  | ⬜ |
| 12 | [Product of Array Except Self](01-arrays/medium.md) | LC 238 | M | ✍️ | ⬜ |
| 13 | [Maximum Product Subarray](01-arrays/medium.md) | LC 152 | M |  | ⬜ |
| 14 | [Find the Duplicate Number](01-arrays/medium.md) | LC 287 | M |  | ⬜ |
| 15 | [3Sum](01-arrays/medium.md) | LC 15 | M | ✍️ | ⬜ |
| 16 | [Sort Colors (Dutch flag)](01-arrays/medium.md) | LC 75 | M |  | ⬜ |
| 17 | [Next Permutation](01-arrays/medium.md) | LC 31 | M |  | ⬜ |
| 18 | [Set Matrix Zeroes](01-arrays/medium.md) | LC 73 | M |  | ⬜ |
| 19 | [Spiral Matrix](01-arrays/medium.md) | LC 54 | M |  | ⬜ |
| 20 | [First Missing Positive](01-arrays/hard.md) | LC 41 | H | ⭐✍️ | ⬜ |
| 21 | [Candy](01-arrays/hard.md) | LC 135 | H | ✍️ | ⬜ |
| 22 | [Median of Two Sorted Arrays](01-arrays/hard.md) | LC 4 | H | ✍️ | ⬜ |
| 23 | [Max Chunks To Make Sorted II](01-arrays/hard.md) | LC 768 | H |  | ⬜ |

## 02-strings

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Valid Anagram](02-strings/easy.md) | LC 242 | E | ✍️ | ⬜ |
| 2 | [Valid Palindrome](02-strings/easy.md) | LC 125 | E | ✍️ | ⬜ |
| 3 | [Reverse String](02-strings/easy.md) | LC 344 | E | ✍️ | ⬜ |
| 4 | [Reverse Words in a String III](02-strings/easy.md) | LC 557 | E |  | ⬜ |
| 5 | [First Unique Character in a String](02-strings/easy.md) | LC 387 | E |  | ⬜ |
| 6 | [Roman to Integer](02-strings/easy.md) | LC 13 | E |  | ⬜ |
| 7 | [Isomorphic Strings](02-strings/easy.md) | LC 205 | E |  | ⬜ |
| 8 | [Ransom Note](02-strings/easy.md) | LC 383 | E |  | ⬜ |
| 9 | [Longest Palindromic Substring](02-strings/medium.md) | LC 5 | M | ✍️ | ⬜ |
| 10 | [Group Anagrams](02-strings/medium.md) | LC 49 | M | ✍️ | ⬜ |
| 11 | [String to Integer (atoi)](02-strings/medium.md) | LC 8 | M |  | ⬜ |
| 12 | [Longest Repeating Character Replacement](02-strings/medium.md) | LC 424 | M |  | ⬜ |
| 13 | [Palindromic Substrings (count)](02-strings/medium.md) | LC 647 | M |  | ⬜ |
| 14 | [Encode and Decode Strings](02-strings/medium.md) | LC 271 | M |  | ⬜ |
| 15 | [Generate Parentheses](02-strings/medium.md) | LC 22 | M |  | ⬜ |
| 16 | [Integer to Roman](02-strings/medium.md) | LC 12 | M |  | ⬜ |
| 17 | [Count and Say](02-strings/medium.md) | LC 38 | M |  | ⬜ |
| 18 | [Find the Index of the First Occurrence (KMP)](02-strings/hard.md) | LC 28 | H | ⭐✍️ | ⬜ |
| 19 | [Shortest Palindrome](02-strings/hard.md) | LC 214 | H | ✍️ | ⬜ |
| 20 | [Text Justification](02-strings/hard.md) | LC 68 | H | ✍️ | ⬜ |

## 03-hashing

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Contains Duplicate](03-hashing/easy.md) | LC 217 | E | ⭐✍️ | ⬜ |
| 2 | [Happy Number](03-hashing/easy.md) | LC 202 | E | ✍️ | ⬜ |
| 3 | [Word Pattern](03-hashing/easy.md) | LC 290 | E |  | ⬜ |
| 4 | [Intersection of Two Arrays](03-hashing/easy.md) | LC 349 | E |  | ⬜ |
| 5 | [Jewels and Stones](03-hashing/easy.md) | LC 771 | E |  | ⬜ |
| 6 | [Find the Difference](03-hashing/easy.md) | LC 389 | E |  | ⬜ |
| 7 | [Find All Duplicates in an Array](03-hashing/medium.md) | LC 442 | M | ⭐✍️ | ⬜ |
| 8 | [Top K Frequent Elements](03-hashing/medium.md) | LC 347 | M | ✍️ | ⬜ |
| 9 | [Longest Consecutive Sequence](03-hashing/medium.md) | LC 128 | M | ✍️ | ⬜ |
| 10 | [4Sum II](03-hashing/medium.md) | LC 454 | M |  | ⬜ |
| 11 | [Copy List with Random Pointer](03-hashing/medium.md) | LC 138 | M |  | ⬜ |
| 12 | [LRU Cache](03-hashing/hard.md) | LC 146 | H | ⭐✍️ | ⬜ |
| 13 | [Max Points on a Line](03-hashing/hard.md) | LC 149 | H | ✍️ | ⬜ |
| 14 | [Substring with Concatenation of All Words](03-hashing/hard.md) | LC 30 | H | ✍️ | ⬜ |
| 15 | [LFU Cache](03-hashing/hard.md) | LC 460 | H |  | ⬜ |
| 16 | [Insert Delete GetRandom O(1) – Duplicates allowed](03-hashing/hard.md) | LC 381 | H |  | ⬜ |

## 04-two-pointers-sliding-window

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Two Sum II (sorted)](04-two-pointers-sliding-window/easy.md) | LC 167 | E | ✍️ | ⬜ |
| 2 | [Squares of a Sorted Array](04-two-pointers-sliding-window/easy.md) | LC 977 | E | ✍️ | ⬜ |
| 3 | [Remove Element](04-two-pointers-sliding-window/easy.md) | LC 27 | E |  | ⬜ |
| 4 | [Backspace String Compare](04-two-pointers-sliding-window/easy.md) | LC 844 | E | ✍️ | ⬜ |
| 5 | [Container With Most Water](04-two-pointers-sliding-window/medium.md) | LC 11 | M | ✍️ | ⬜ |
| 6 | [Longest Substring Without Repeating Characters](04-two-pointers-sliding-window/medium.md) | LC 3 | M | ✍️ | ⬜ |
| 7 | [Max Sum Subarray of Size K](04-two-pointers-sliding-window/medium.md) | GfG | M | ⭐✍️ | ⬜ |
| 8 | [Minimum Size Subarray Sum](04-two-pointers-sliding-window/medium.md) | LC 209 | M | ✍️ | ⬜ |
| 9 | [Fruit Into Baskets](04-two-pointers-sliding-window/medium.md) | LC 904 | M |  | ⬜ |
| 10 | [Permutation in String](04-two-pointers-sliding-window/medium.md) | LC 567 | M |  | ⬜ |
| 11 | [Minimum Window Substring](04-two-pointers-sliding-window/hard.md) | LC 76 | H | ⭐✍️ | ⬜ |
| 12 | [Trapping Rain Water](04-two-pointers-sliding-window/hard.md) | LC 42 | H | ⭐✍️ | ⬜ |
| 13 | [Sliding Window Maximum](04-two-pointers-sliding-window/hard.md) | LC 239 | H | ⭐✍️ | ⬜ |
| 14 | [Subarrays with K Different Integers](04-two-pointers-sliding-window/hard.md) | LC 992 | H |  | ⬜ |
| 15 | [Minimum Window Subsequence](04-two-pointers-sliding-window/hard.md) | LC 727 | H |  | ⬜ |

## 05-stack-queue

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Valid Parentheses](05-stack-queue/easy.md) | LC 20 | E | ⭐✍️ | ⬜ |
| 2 | [Implement Queue using Stacks](05-stack-queue/easy.md) | LC 232 | E | ✍️ | ⬜ |
| 3 | [Implement Stack using Queues](05-stack-queue/easy.md) | LC 225 | E |  | ⬜ |
| 4 | [Baseball Game](05-stack-queue/easy.md) | LC 682 | E |  | ⬜ |
| 5 | [Reverse a String using Stack](05-stack-queue/easy.md) | GfG | E | ⭐✍️ | ⬜ |
| 6 | [Min Stack](05-stack-queue/medium.md) | LC 155 | M | ✍️ | ⬜ |
| 7 | [Daily Temperatures](05-stack-queue/medium.md) | LC 739 | M | ✍️ | ⬜ |
| 8 | [Evaluate Reverse Polish Notation](05-stack-queue/medium.md) | LC 150 | M | ✍️ | ⬜ |
| 9 | [Asteroid Collision](05-stack-queue/medium.md) | LC 735 | M |  | ⬜ |
| 10 | [Decode String](05-stack-queue/medium.md) | LC 394 | M |  | ⬜ |
| 11 | [Remove K Digits](05-stack-queue/medium.md) | LC 402 | M |  | ⬜ |
| 12 | [Basic Calculator II](05-stack-queue/medium.md) | LC 227 | M |  | ⬜ |
| 13 | [Longest Valid Parentheses](05-stack-queue/hard.md) | LC 32 | H | ✍️ | ⬜ |
| 14 | [Basic Calculator](05-stack-queue/hard.md) | LC 224 | H | ⭐✍️ | ⬜ |
| 15 | [Maximum Frequency Stack](05-stack-queue/hard.md) | LC 895 | H | ✍️ | ⬜ |
| 16 | [Basic Calculator III](05-stack-queue/hard.md) | LC 772 | H |  | ⬜ |

## 06-linked-list

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Reverse Linked List](06-linked-list/easy.md) | LC 206 | E | ✍️ | ⬜ |
| 2 | [Merge Two Sorted Lists](06-linked-list/easy.md) | LC 21 | E | ✍️ | ⬜ |
| 3 | [Linked List Cycle](06-linked-list/easy.md) | LC 141 | E | ⭐✍️ | ⬜ |
| 4 | [Middle of the Linked List](06-linked-list/easy.md) | LC 876 | E | ✍️ | ⬜ |
| 5 | [Palindrome Linked List](06-linked-list/easy.md) | LC 234 | E |  | ⬜ |
| 6 | [Remove Duplicates from Sorted List](06-linked-list/easy.md) | LC 83 | E |  | ⬜ |
| 7 | [Intersection of Two Linked Lists](06-linked-list/easy.md) | LC 160 | E |  | ⬜ |
| 8 | [Remove Linked List Elements](06-linked-list/easy.md) | LC 203 | E |  | ⬜ |
| 9 | [Add Two Numbers](06-linked-list/medium.md) | LC 2 | M |  | ⬜ |
| 10 | [Remove Nth Node From End](06-linked-list/medium.md) | LC 19 | M | ✍️ | ⬜ |
| 11 | [Reorder List](06-linked-list/medium.md) | LC 143 | M |  | ⬜ |
| 12 | [Odd Even Linked List](06-linked-list/medium.md) | LC 328 | M |  | ⬜ |
| 13 | [Linked List Cycle II (find start)](06-linked-list/medium.md) | LC 142 | M | ✍️ | ⬜ |
| 14 | [Rotate List](06-linked-list/medium.md) | LC 61 | M |  | ⬜ |
| 15 | [Reverse Nodes in k-Group](06-linked-list/hard.md) | LC 25 | H | ⭐✍️ | ⬜ |
| 16 | [Merge k Sorted Lists](06-linked-list/hard.md) | LC 23 | H | ⭐✍️ | ⬜ |
| 17 | [Sort List](06-linked-list/hard.md) | LC 148 | H | ✍️ | ⬜ |

## 07-recursion-backtracking

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Factorial (recursive)](07-recursion-backtracking/easy.md) | GfG | E |  | ⬜ |
| 2 | [Fibonacci (recursive + memo)](07-recursion-backtracking/easy.md) | LC 509 | E | ⭐✍️ | ⬜ |
| 3 | [Reverse a Number recursively](07-recursion-backtracking/easy.md) | GfG | E | ⭐✍️ | ⬜ |
| 4 | [Sum of Digits (recursive)](07-recursion-backtracking/easy.md) | GfG | E |  | ⬜ |
| 5 | [Subsets](07-recursion-backtracking/medium.md) | LC 78 | M | ✍️ | ⬜ |
| 6 | [Subsets II](07-recursion-backtracking/medium.md) | LC 90 | M |  | ⬜ |
| 7 | [Permutations](07-recursion-backtracking/medium.md) | LC 46 | M | ✍️ | ⬜ |
| 8 | [Combination Sum](07-recursion-backtracking/medium.md) | LC 39 | M | ✍️ | ⬜ |
| 9 | [Combination Sum II](07-recursion-backtracking/medium.md) | LC 40 | M |  | ⬜ |
| 10 | [Letter Combinations of a Phone Number](07-recursion-backtracking/medium.md) | LC 17 | M |  | ⬜ |
| 11 | [Word Search](07-recursion-backtracking/medium.md) | LC 79 | M |  | ⬜ |
| 12 | [N-Queens](07-recursion-backtracking/hard.md) | LC 51 | H | ⭐✍️ | ⬜ |
| 13 | [Sudoku Solver](07-recursion-backtracking/hard.md) | LC 37 | H | ✍️ | ⬜ |
| 14 | [Word Break II](07-recursion-backtracking/hard.md) | LC 140 | H | ✍️ | ⬜ |
| 15 | [Remove Invalid Parentheses](07-recursion-backtracking/hard.md) | LC 301 | H |  | ⬜ |

## 08-sorting-searching

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Bubble Sort](08-sorting-searching/easy.md) | GfG | E |  | ⬜ |
| 2 | [Selection Sort](08-sorting-searching/easy.md) | GfG | E |  | ⬜ |
| 3 | [Insertion Sort](08-sorting-searching/easy.md) | GfG | E | ✍️ | ⬜ |
| 4 | [Binary Search](08-sorting-searching/easy.md) | LC 704 | E | ✍️ | ⬜ |
| 5 | [Search Insert Position](08-sorting-searching/easy.md) | LC 35 | E | ✍️ | ⬜ |
| 6 | [Sqrt(x)](08-sorting-searching/easy.md) | LC 69 | E | ✍️ | ⬜ |
| 7 | [Merge Sort](08-sorting-searching/medium.md) | LC 912 | M | ⭐✍️ | ⬜ |
| 8 | [Quick Sort](08-sorting-searching/medium.md) | GfG | M | ✍️ | ⬜ |
| 9 | [Kth Largest Element](08-sorting-searching/medium.md) | LC 215 | M | ✍️ | ⬜ |
| 10 | [Sort Characters By Frequency](08-sorting-searching/medium.md) | LC 451 | M |  | ⬜ |
| 11 | [Search in Rotated Sorted Array](08-sorting-searching/medium.md) | LC 33 | M | ✍️ | ⬜ |
| 12 | [Find First and Last Position](08-sorting-searching/medium.md) | LC 34 | M |  | ⬜ |
| 13 | [Find Peak Element](08-sorting-searching/medium.md) | LC 162 | M |  | ⬜ |
| 14 | [Search a 2D Matrix](08-sorting-searching/medium.md) | LC 74 | M |  | ⬜ |
| 15 | [Koko Eating Bananas](08-sorting-searching/medium.md) | LC 875 | M | ✍️ | ⬜ |
| 16 | [Find Minimum in Rotated Sorted Array](08-sorting-searching/medium.md) | LC 153 | M |  | ⬜ |
| 17 | [Count of Smaller Numbers After Self](08-sorting-searching/hard.md) | LC 315 | H | ⭐✍️ | ⬜ |
| 18 | [Find Minimum in Rotated Sorted Array II](08-sorting-searching/hard.md) | LC 154 | H | ✍️ | ⬜ |
| 19 | [Find K-th Smallest Pair Distance](08-sorting-searching/hard.md) | LC 719 | H | ✍️ | ⬜ |
| 20 | [Reverse Pairs](08-sorting-searching/hard.md) | LC 493 | H |  | ⬜ |

## 09-trees-bst

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Maximum Depth of Binary Tree](09-trees-bst/easy.md) | LC 104 | E | ✍️ | ⬜ |
| 2 | [Invert Binary Tree](09-trees-bst/easy.md) | LC 226 | E | ✍️ | ⬜ |
| 3 | [Same Tree](09-trees-bst/easy.md) | LC 100 | E |  | ⬜ |
| 4 | [Symmetric Tree](09-trees-bst/easy.md) | LC 101 | E |  | ⬜ |
| 5 | [Path Sum](09-trees-bst/easy.md) | LC 112 | E |  | ⬜ |
| 6 | [Diameter of Binary Tree](09-trees-bst/easy.md) | LC 543 | E |  | ⬜ |
| 7 | [Balanced Binary Tree](09-trees-bst/easy.md) | LC 110 | E |  | ⬜ |
| 8 | [Binary Tree Inorder Traversal](09-trees-bst/easy.md) | LC 94 | E |  | ⬜ |
| 9 | [Level Order Traversal (BFS)](09-trees-bst/medium.md) | LC 102 | M | ✍️ | ⬜ |
| 10 | [Validate BST](09-trees-bst/medium.md) | LC 98 | M | ✍️ | ⬜ |
| 11 | [Lowest Common Ancestor of BST](09-trees-bst/medium.md) | LC 235 | M | ✍️ | ⬜ |
| 12 | [Kth Smallest Element in a BST](09-trees-bst/medium.md) | LC 230 | M | ✍️ | ⬜ |
| 13 | [Construct Tree from Preorder & Inorder](09-trees-bst/medium.md) | LC 105 | M |  | ⬜ |
| 14 | [Binary Tree Right Side View](09-trees-bst/medium.md) | LC 199 | M |  | ⬜ |
| 15 | [Count Good Nodes in Binary Tree](09-trees-bst/medium.md) | LC 1448 | M |  | ⬜ |
| 16 | [Binary Tree Maximum Path Sum](09-trees-bst/hard.md) | LC 124 | H | ⭐✍️ | ⬜ |
| 17 | [Serialize and Deserialize Binary Tree](09-trees-bst/hard.md) | LC 297 | H | ⭐✍️ | ⬜ |
| 18 | [Binary Tree Cameras](09-trees-bst/hard.md) | LC 968 | H | ✍️ | ⬜ |
| 19 | [Recover Binary Search Tree](09-trees-bst/hard.md) | LC 99 | H |  | ⬜ |
| 20 | [Vertical Order Traversal](09-trees-bst/hard.md) | LC 987 | H |  | ⬜ |

## 10-graphs-bfs-dfs

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Flood Fill](10-graphs-bfs-dfs/easy.md) | LC 733 | E | ✍️ | ⬜ |
| 2 | [BFS traversal of a graph](10-graphs-bfs-dfs/easy.md) | GfG | E | ✍️ | ⬜ |
| 3 | [DFS traversal of a graph](10-graphs-bfs-dfs/easy.md) | GfG | E | ✍️ | ⬜ |
| 4 | [Find if Path Exists in Graph](10-graphs-bfs-dfs/easy.md) | LC 1971 | E | ✍️ | ⬜ |
| 5 | [Number of Islands](10-graphs-bfs-dfs/medium.md) | LC 200 | M | ✍️ | ⬜ |
| 6 | [Max Area of Island](10-graphs-bfs-dfs/medium.md) | LC 695 | M |  | ⬜ |
| 7 | [Clone Graph](10-graphs-bfs-dfs/medium.md) | LC 133 | M | ✍️ | ⬜ |
| 8 | [Rotting Oranges](10-graphs-bfs-dfs/medium.md) | LC 994 | M | ✍️ | ⬜ |
| 9 | [Course Schedule (cycle detect)](10-graphs-bfs-dfs/medium.md) | LC 207 | M | ✍️ | ⬜ |
| 10 | [Pacific Atlantic Water Flow](10-graphs-bfs-dfs/medium.md) | LC 417 | M |  | ⬜ |
| 11 | [Number of Connected Components](10-graphs-bfs-dfs/medium.md) | LC 323 | M |  | ⬜ |
| 12 | [Surrounded Regions](10-graphs-bfs-dfs/medium.md) | LC 130 | M |  | ⬜ |
| 13 | [Word Ladder](10-graphs-bfs-dfs/hard.md) | LC 127 | H | ⭐✍️ | ⬜ |
| 14 | [Longest Increasing Path in a Matrix](10-graphs-bfs-dfs/hard.md) | LC 329 | H | ✍️ | ⬜ |
| 15 | [Swim in Rising Water (Dijkstra)](10-graphs-bfs-dfs/hard.md) | LC 778 | H | ✍️ | ⬜ |
| 16 | [Network Delay Time](10-graphs-bfs-dfs/hard.md) | LC 743 | H |  | ⬜ |
| 17 | [Cheapest Flights Within K Stops](10-graphs-bfs-dfs/hard.md) | LC 787 | H |  | ⬜ |

## 11-greedy

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Coin Change (greedy variant)](11-greedy/easy.md) | GfG | E | ⭐✍️ | ⬜ |
| 2 | [Assign Cookies](11-greedy/easy.md) | LC 455 | E |  | ⬜ |
| 3 | [Jump Game](11-greedy/medium.md) | LC 55 | M | ✍️ | ⬜ |
| 4 | [Jump Game II](11-greedy/medium.md) | LC 45 | M | ✍️ | ⬜ |
| 5 | [Best Time to Buy/Sell Stock II](11-greedy/medium.md) | LC 122 | M |  | ⬜ |
| 6 | [Gas Station](11-greedy/medium.md) | LC 134 | M | ✍️ | ⬜ |
| 7 | [Partition Labels](11-greedy/medium.md) | LC 763 | M |  | ⬜ |
| 8 | [Non-overlapping Intervals](11-greedy/medium.md) | LC 435 | M | ✍️ | ⬜ |
| 9 | [Minimum Number of Arrows to Burst Balloons](11-greedy/medium.md) | LC 452 | M |  | ⬜ |
| 10 | [Task Scheduler](11-greedy/medium.md) | LC 621 | M |  | ⬜ |
| 11 | [Course Schedule III](11-greedy/hard.md) | LC 630 | H | ⭐✍️ | ⬜ |
| 12 | [Minimum Number of Refueling Stops](11-greedy/hard.md) | LC 871 | H | ✍️ | ⬜ |
| 13 | [Patching Array](11-greedy/hard.md) | LC 330 | H | ✍️ | ⬜ |

## 12-dp

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Climbing Stairs](12-dp/easy.md) | LC 70 | E | ✍️ | ⬜ |
| 2 | [Min Cost Climbing Stairs](12-dp/easy.md) | LC 746 | E | ✍️ | ⬜ |
| 3 | [Pascal's Triangle](12-dp/easy.md) | LC 118 | E | ✍️ | ⬜ |
| 4 | [Is Subsequence](12-dp/easy.md) | LC 392 | E | ✍️ | ⬜ |
| 5 | [House Robber](12-dp/medium.md) | LC 198 | M | ✍️ | ⬜ |
| 6 | [House Robber II](12-dp/medium.md) | LC 213 | M |  | ⬜ |
| 7 | [Coin Change](12-dp/medium.md) | LC 322 | M | ⭐✍️ | ⬜ |
| 8 | [Coin Change II (count ways)](12-dp/medium.md) | LC 518 | M |  | ⬜ |
| 9 | [Longest Increasing Subsequence](12-dp/medium.md) | LC 300 | M | ✍️ | ⬜ |
| 10 | [Longest Common Subsequence](12-dp/medium.md) | LC 1143 | M | ✍️ | ⬜ |
| 11 | [Word Break](12-dp/medium.md) | LC 139 | M |  | ⬜ |
| 12 | [Unique Paths](12-dp/medium.md) | LC 62 | M | ✍️ | ⬜ |
| 13 | [Minimum Path Sum](12-dp/medium.md) | LC 64 | M |  | ⬜ |
| 14 | [Decode Ways](12-dp/medium.md) | LC 91 | M |  | ⬜ |
| 15 | [Partition Equal Subset Sum](12-dp/medium.md) | LC 416 | M |  | ⬜ |
| 16 | [Regular Expression Matching](12-dp/hard.md) | LC 10 | H | ✍️ | ⬜ |
| 17 | [Edit Distance](12-dp/hard.md) | LC 72 | H | ⭐✍️ | ⬜ |
| 18 | [Burst Balloons (interval DP)](12-dp/hard.md) | LC 312 | H | ✍️ | ⬜ |
| 19 | [Best Time to Buy and Sell Stock IV](12-dp/hard.md) | LC 188 | H |  | ⬜ |

## 13-math-bit-manipulation

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Single Number](13-math-bit-manipulation/easy.md) | LC 136 | E | ✍️ | ⬜ |
| 2 | [Angle between clock hands](13-math-bit-manipulation/easy.md) | GfG | E | ⭐✍️ | ⬜ |
| 3 | [Count currency notes for amount](13-math-bit-manipulation/easy.md) | GfG | E | ⭐✍️ | ⬜ |
| 4 | [Palindrome Number](13-math-bit-manipulation/easy.md) | LC 9 | E |  | ⬜ |
| 5 | [Power of Two](13-math-bit-manipulation/easy.md) | LC 231 | E |  | ⬜ |
| 6 | [FizzBuzz](13-math-bit-manipulation/easy.md) | LC 412 | E |  | ⬜ |
| 7 | [Excel Sheet Column Number](13-math-bit-manipulation/easy.md) | LC 171 | E |  | ⬜ |
| 8 | [Number of 1 Bits](13-math-bit-manipulation/easy.md) | LC 191 | E | ✍️ | ⬜ |
| 9 | [Counting Bits](13-math-bit-manipulation/easy.md) | LC 338 | E |  | ⬜ |
| 10 | [Missing Number](13-math-bit-manipulation/easy.md) | LC 268 | E | ✍️ | ⬜ |
| 11 | [Pow(x, n)](13-math-bit-manipulation/medium.md) | LC 50 | M | ✍️ | ⬜ |
| 12 | [Reverse Integer](13-math-bit-manipulation/medium.md) | LC 7 | M | ✍️ | ⬜ |
| 13 | [Count Primes](13-math-bit-manipulation/medium.md) | LC 204 | M | ✍️ | ⬜ |
| 14 | [Bitwise AND of Numbers Range](13-math-bit-manipulation/medium.md) | LC 201 | M | ✍️ | ⬜ |
| 15 | [Permutation Sequence](13-math-bit-manipulation/hard.md) | LC 60 | H | ⭐✍️ | ⬜ |
| 16 | [Number of Digit One](13-math-bit-manipulation/hard.md) | LC 233 | H | ✍️ | ⬜ |
| 17 | [Divide Two Integers](13-math-bit-manipulation/hard.md) | LC 29 | H | ✍️ | ⬜ |

## 14-sql

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Employees Earning More Than Their Managers](14-sql/easy.md) | LC 181 | E | ✍️ | ⬜ |
| 2 | [Duplicate Emails](14-sql/easy.md) | LC 182 | E | ✍️ | ⬜ |
| 3 | [Customers Who Never Order](14-sql/easy.md) | LC 183 | E | ✍️ | ⬜ |
| 4 | [Combine Two Tables (JOIN)](14-sql/easy.md) | LC 175 | E |  | ⬜ |
| 5 | [Second Highest Salary](14-sql/medium.md) | LC 176 | M | ⭐✍️ | ⬜ |
| 6 | [Nth Highest Salary](14-sql/medium.md) | LC 177 | M | ✍️ | ⬜ |
| 7 | [Department Highest Salary](14-sql/medium.md) | LC 184 | M | ✍️ | ⬜ |
| 8 | [Rank Scores](14-sql/medium.md) | LC 178 | M |  | ⬜ |
| 9 | [Department Top Three Salaries](14-sql/hard.md) | LC 185 | H | ⭐✍️ | ⬜ |
| 10 | [Trips and Users](14-sql/hard.md) | LC 262 | H | ✍️ | ⬜ |
| 11 | [Human Traffic of Stadium](14-sql/hard.md) | LC 601 | H | ✍️ | ⬜ |
| 12 | [Median Employee Salary](14-sql/hard.md) | LC 569 | H |  | ⬜ |
| 13 | [Find Cumulative Salary of an Employee](14-sql/hard.md) | LC 579 | H |  | ⬜ |

## 15-heap

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Kth Largest Element in a Stream](15-heap/easy.md) | LC 703 | E | ⭐✍️ | ⬜ |
| 2 | [Last Stone Weight](15-heap/easy.md) | LC 1046 | E | ✍️ | ⬜ |
| 3 | [Relative Ranks](15-heap/easy.md) | LC 506 | E | ✍️ | ⬜ |
| 4 | [Minimum Cost to Connect Sticks](15-heap/easy.md) | LC 1167 | E |  | ⬜ |
| 5 | [K Closest Points to Origin](15-heap/medium.md) | LC 973 | M | ⭐✍️ | ⬜ |
| 6 | [Reorganize String](15-heap/medium.md) | LC 767 | M | ✍️ | ⬜ |
| 7 | [Find K Pairs with Smallest Sums](15-heap/medium.md) | LC 373 | M |  | ⬜ |
| 8 | [IPO](15-heap/hard.md) | LC 502 | H | ✍️ | ⬜ |
| 9 | [Find Median from Data Stream](15-heap/hard.md) | LC 295 | H | ⭐✍️ | ⬜ |
| 10 | [Smallest Range Covering Elements from K Lists](15-heap/hard.md) | LC 632 | H | ✍️ | ⬜ |
| 11 | [Sliding Window Median](15-heap/hard.md) | LC 480 | H |  | ⬜ |

## 16-intervals

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Meeting Rooms](16-intervals/easy.md) | LC 252 | E | ⭐✍️ | ⬜ |
| 2 | [Summary Ranges](16-intervals/easy.md) | LC 228 | E | ✍️ | ⬜ |
| 3 | [Teemo Attacking](16-intervals/easy.md) | LC 495 | E | ✍️ | ⬜ |
| 4 | [Merge Intervals](16-intervals/medium.md) | LC 56 | M | ⭐✍️ | ⬜ |
| 5 | [Insert Interval](16-intervals/medium.md) | LC 57 | M | ✍️ | ⬜ |
| 6 | [Meeting Rooms II](16-intervals/medium.md) | LC 253 | M | ⭐✍️ | ⬜ |
| 7 | [Interval List Intersections](16-intervals/medium.md) | LC 986 | M |  | ⬜ |
| 8 | [Employee Free Time](16-intervals/hard.md) | LC 759 | H | ⭐✍️ | ⬜ |
| 9 | [Maximum Profit in Job Scheduling](16-intervals/hard.md) | LC 1235 | H | ⭐✍️ | ⬜ |
| 10 | [The Skyline Problem](16-intervals/hard.md) | LC 218 | H |  | ⬜ |
| 11 | [Data Stream as Disjoint Intervals](16-intervals/hard.md) | LC 352 | H |  | ⬜ |

## 17-prefix-sum

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Range Sum Query – Immutable](17-prefix-sum/easy.md) | LC 303 | E | ⭐✍️ | ⬜ |
| 2 | [Find Pivot Index](17-prefix-sum/easy.md) | LC 724 | E | ✍️ | ⬜ |
| 3 | [Running Sum of 1d Array](17-prefix-sum/easy.md) | LC 1480 | E |  | ⬜ |
| 4 | [Left and Right Sum Differences](17-prefix-sum/easy.md) | LC 2574 | E | ✍️ | ⬜ |
| 5 | [Subarray Sum Equals K](17-prefix-sum/medium.md) | LC 560 | M | ⭐✍️ | ⬜ |
| 6 | [Subarray Sums Divisible by K](17-prefix-sum/medium.md) | LC 974 | M | ✍️ | ⬜ |
| 7 | [Range Sum Query 2D – Immutable](17-prefix-sum/medium.md) | LC 304 | M | ✍️ | ⬜ |
| 8 | [Corporate Flight Bookings](17-prefix-sum/medium.md) | LC 1109 | M |  | ⬜ |
| 9 | [Contiguous Array](17-prefix-sum/medium.md) | LC 525 | M |  | ⬜ |
| 10 | [Shortest Subarray with Sum at Least K](17-prefix-sum/hard.md) | LC 862 | H | ⭐✍️ | ⬜ |
| 11 | [Number of Submatrices That Sum to Target](17-prefix-sum/hard.md) | LC 1074 | H | ✍️ | ⬜ |
| 12 | [Count of Range Sum](17-prefix-sum/hard.md) | LC 327 | H |  | ⬜ |
| 13 | [Max Sum of Rectangle No Larger Than K](17-prefix-sum/hard.md) | LC 363 | H |  | ⬜ |

## 18-monotonic-stack

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Next Greater Element I](18-monotonic-stack/easy.md) | LC 496 | E | ⭐✍️ | ⬜ |
| 2 | [Final Prices With a Special Discount](18-monotonic-stack/easy.md) | LC 1475 | E | ✍️ | ⬜ |
| 3 | [Next Greater Element II (circular)](18-monotonic-stack/medium.md) | LC 503 | M | ⭐✍️ | ⬜ |
| 4 | [Online Stock Span](18-monotonic-stack/medium.md) | LC 901 | M | ✍️ | ⬜ |
| 5 | [Sum of Subarray Minimums](18-monotonic-stack/medium.md) | LC 907 | M | ✍️ | ⬜ |
| 6 | [132 Pattern](18-monotonic-stack/medium.md) | LC 456 | M |  | ⬜ |
| 7 | [Largest Rectangle in Histogram](18-monotonic-stack/hard.md) | LC 84 | H | ⭐✍️ | ⬜ |
| 8 | [Maximal Rectangle](18-monotonic-stack/hard.md) | LC 85 | H | ✍️ | ⬜ |
| 9 | [Maximum Score of a Good Subarray](18-monotonic-stack/hard.md) | LC 1793 | H |  | ⬜ |

## 19-trie

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Longest Common Prefix (trie দিয়ে)](19-trie/easy.md) | LC 14 | E | ✍️ | ⬜ |
| 2 | [Implement Trie (Prefix Tree)](19-trie/easy.md) | LC 208 | E | ⭐✍️ | ⬜ |
| 3 | [Longest Word in Dictionary](19-trie/easy.md) | LC 720 | E | ✍️ | ⬜ |
| 4 | [Design Add and Search Words Data Structure](19-trie/medium.md) | LC 211 | M | ⭐✍️ | ⬜ |
| 5 | [Replace Words](19-trie/medium.md) | LC 648 | M | ✍️ | ⬜ |
| 6 | [Search Suggestions System](19-trie/medium.md) | LC 1268 | M |  | ⬜ |
| 7 | [Map Sum Pairs](19-trie/medium.md) | LC 677 | M |  | ⬜ |
| 8 | [Word Search II](19-trie/hard.md) | LC 212 | H | ⭐✍️ | ⬜ |
| 9 | [Maximum XOR of Two Numbers in an Array](19-trie/hard.md) | LC 421 | H | ✍️ | ⬜ |
| 10 | [Palindrome Pairs](19-trie/hard.md) | LC 336 | H |  | ⬜ |
| 11 | [Concatenated Words](19-trie/hard.md) | LC 472 | H |  | ⬜ |

## 20-union-find

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Number of Provinces](20-union-find/easy.md) | LC 547 | E | ⭐✍️ | ⬜ |
| 2 | [Satisfiability of Equality Equations](20-union-find/easy.md) | LC 990 | E | ✍️ | ⬜ |
| 3 | [Redundant Connection](20-union-find/medium.md) | LC 684 | M | ⭐✍️ | ⬜ |
| 4 | [Accounts Merge](20-union-find/medium.md) | LC 721 | M | ⭐✍️ | ⬜ |
| 5 | [Most Stones Removed with Same Row or Column](20-union-find/medium.md) | LC 947 | M |  | ⬜ |
| 6 | [Min Cost to Connect All Points](20-union-find/medium.md) | LC 1584 | M |  | ⬜ |
| 7 | [Number of Islands II](20-union-find/hard.md) | LC 305 | H | ⭐✍️ | ⬜ |
| 8 | [Remove Max Number of Edges to Keep Graph Fully Traversable](20-union-find/hard.md) | LC 1579 | H | ✍️ | ⬜ |
| 9 | [Making A Large Island](20-union-find/hard.md) | LC 827 | H |  | ⬜ |

## 21-topological-sort

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [Find the Town Judge](21-topological-sort/easy.md) | LC 997 | E | ⭐✍️ | ⬜ |
| 2 | [Minimum Number of Vertices to Reach All Nodes](21-topological-sort/easy.md) | LC 1557 | E | ✍️ | ⬜ |
| 3 | [Course Schedule II](21-topological-sort/medium.md) | LC 210 | M | ⭐✍️ | ⬜ |
| 4 | [Find Eventual Safe States](21-topological-sort/medium.md) | LC 802 | M | ✍️ | ⬜ |
| 5 | [Parallel Courses](21-topological-sort/medium.md) | LC 1136 | M |  | ⬜ |
| 6 | [Minimum Height Trees](21-topological-sort/medium.md) | LC 310 | M |  | ⬜ |
| 7 | [Alien Dictionary](21-topological-sort/hard.md) | LC 269 | H | ⭐✍️ | ⬜ |
| 8 | [Largest Color Value in a Directed Graph](21-topological-sort/hard.md) | LC 1857 | H | ✍️ | ⬜ |
| 9 | [Sort Items by Groups Respecting Dependencies](21-topological-sort/hard.md) | LC 1203 | H |  | ⬜ |

## 22-binary-search-on-answer

| # | Problem | Source | Level | | Solved |
|---|---|---|---|---|---|
| 1 | [First Bad Version](22-binary-search-on-answer/easy.md) | LC 278 | E | ⭐✍️ | ⬜ |
| 2 | [Arranging Coins](22-binary-search-on-answer/easy.md) | LC 441 | E | ✍️ | ⬜ |
| 3 | [Valid Perfect Square](22-binary-search-on-answer/easy.md) | LC 367 | E |  | ⬜ |
| 4 | [Capacity To Ship Packages Within D Days](22-binary-search-on-answer/medium.md) | LC 1011 | M | ⭐✍️ | ⬜ |
| 5 | [Minimum Number of Days to Make m Bouquets](22-binary-search-on-answer/medium.md) | LC 1482 | M | ✍️ | ⬜ |
| 6 | [Magnetic Force Between Two Balls](22-binary-search-on-answer/medium.md) | LC 1552 | M |  | ⬜ |
| 7 | [Find the Smallest Divisor Given a Threshold](22-binary-search-on-answer/medium.md) | LC 1283 | M |  | ⬜ |
| 8 | [Split Array Largest Sum](22-binary-search-on-answer/hard.md) | LC 410 | H | ⭐✍️ | ⬜ |
| 9 | [Kth Smallest Number in Multiplication Table](22-binary-search-on-answer/hard.md) | LC 668 | H | ✍️ | ⬜ |
| 10 | [Minimize Max Distance to Gas Station](22-binary-search-on-answer/hard.md) | LC 774 | H |  | ⬜ |
