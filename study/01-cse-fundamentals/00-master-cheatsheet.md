# 00 — Master Cheat Sheet (Test-Day Cram)

> Read this on the morning of **1 Aug 2026**. Everything condensed to one page per bucket.

---

## OOP — 4 Pillars
| Pillar | One line | Example |
|--------|----------|---------|
| **Encapsulation** | Hide data, expose via methods | `private balance` + `getBalance()` |
| **Abstraction** | Hide complexity, show only essentials | `car.drive()` hides engine logic |
| **Inheritance** | Child reuses parent | `Dog extends Animal` |
| **Polymorphism** | Same call, different behaviour | `animal.speak()` → bark/meow |

- **Overloading** = same name, different params (compile-time). **Overriding** = child redefines parent method (run-time).
- Patterns: **Singleton** (one instance) · **Factory** (create without `new`) · **Observer** (notify subscribers) · **Strategy** (swap algorithm).

## Complexity (Big-O)
`O(1)` < `O(log n)` < `O(n)` < `O(n log n)` < `O(n²)` < `O(2ⁿ)` < `O(n!)`
- Binary search = **O(log n)** · Merge/Quick sort avg = **O(n log n)** · Nested loop = **O(n²)** · Hash lookup = **O(1)**.

## DSA quick facts
- **Stack** = LIFO (undo, call stack, bracket matching). **Queue** = FIFO (BFS, scheduling).
- **Hash map** = O(1) avg lookup. **BST** search = O(log n) balanced.
- **BFS** = queue, level order. **DFS** = stack/recursion, deep first.

## SQL
- Joins: **INNER** (match both) · **LEFT** (all left) · **RIGHT** · **FULL**.
- `WHERE` filters rows **before** grouping; `HAVING` filters **after** `GROUP BY`.
- 2nd highest salary: `SELECT MAX(salary) FROM emp WHERE salary < (SELECT MAX(salary) FROM emp);`
- Normalization: **1NF** atomic · **2NF** no partial dep · **3NF** no transitive dep.

## Networking / Subnetting
- `/26` = mask `255.255.255.192` → block size **64** → 62 usable hosts.
- Network address = IP AND mask. Broadcast = last address in block.
- OSI 7 layers: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way (Physical, Data-link, Network, Transport, Session, Presentation, Application).
- Ports: HTTP **80**, HTTPS **443**, SSH **22**, DNS **53**, FTP **21**, SMTP **25**.

## OS
- **Process** = own memory. **Thread** = shares process memory, lighter.
- Deadlock 4 conditions: **Mutual exclusion, Hold & wait, No preemption, Circular wait**.
- **Mutex** = one owner (lock). **Semaphore** = counter for N resources.

## Web / HTTP
- Verbs: **GET** read · **POST** create · **PUT** replace · **PATCH** partial update · **DELETE** remove.
- Codes: **200** OK · **201** Created · **301** Moved · **400** Bad Request · **401** Unauthorized · **403** Forbidden · **404** Not Found · **500** Server Error.
- **JWT** = header.payload.signature — signed token, stateless auth, sent in `Authorization: Bearer`.

## SDLC
Requirements → Design → Implementation → Testing → Deployment → Maintenance.
- **Waterfall** = sequential, rigid. **Agile** = iterative sprints, flexible.
- **Authentication** = who you are. **Authorization** = what you can do.

---

## Test-day tactics
1. **Two-pass:** answer easy <30s, mark hard, return in pass 2.
2. **Never blank** — no negative marking, guess before auto-submit.
3. **~60–90s/question.** Stuck >90s → mark, move.
4. Watch **NOT / EXCEPT / always / never** wording.
5. Proctor hygiene: face visible, no phone, no copy-paste, no tab-switch.
