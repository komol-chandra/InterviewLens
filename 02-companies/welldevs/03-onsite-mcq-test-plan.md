# 03 — MCQ Test Preparation Plan

> The MCQ round is the **#1 filter** and they **rank candidates by score**. Goal: not just pass — **finish in the top band.**
> Format: **60 minutes**, **~40–60 questions**, online + **proctored** (camera + clipboard, Qualligo), auto-submit timer.

---

## 1. Know the Enemy (test facts from real reviews)

- **Time pressure is the real challenge**, not raw difficulty — that's ~**60–90 seconds per question**.
- Difficulty reported as **"above average" for beginners.**
- **Proctored:** webcam on, clipboard/copy-paste monitored → assume **no external help, no tab-switching.**
- **Broad coverage:** one question each from many CS areas — breadth beats depth here.
- **No negative marking reported**, and it auto-submits → **never leave a blank. Guess before time runs out.**

---

## 2. Exact Topic Blueprint (official guideline + reviews)

| Bucket | Topics | Weight (est.) |
|--------|--------|---------------|
| **Programming & OOP** | OOP 4 pillars, inheritance/polymorphism, design patterns (Singleton/Factory/Observer), programming fundamentals | ●●●● High |
| **DSA** | arrays, strings, stack/queue, linked list, hash map, trees; sorting, searching, recursion, sliding window, BFS/DFS, greedy | ●●●● High |
| **Complexity** | Big-O of snippets, best/avg/worst case, space vs time | ●●● Med |
| **Databases** | SQL SELECT/JOIN/subquery/aggregate, normalization, indexing, "highest salary" style | ●●● Med |
| **Networking** | OSI/TCP-IP, HTTP/HTTPS, **subnetting & network address**, DNS, ports | ●●● Med |
| **Operating Systems** | process vs thread, scheduling, deadlock, memory/paging | ●● Med |
| **Web / API** | REST verbs, status codes, how APIs work, **JWT/auth**, HTML/CSS basics | ●● Med |
| **Security & SDLC** | auth vs authorization, common vulns, SDLC phases | ●● Low-Med |
| **Aptitude / Math / GK** | ratios, percentages, series, logical puzzles, general knowledge | ●● Low-Med |

---

## 3. Must-Know Hit List (memorize cold — these appeared)

- **Subnetting:** given IP + mask → compute **network address, broadcast, host range, # of hosts**. Practice `/26` (255.255.255.192), `/24`, `/27`, `/30`.
- **OOP:** define + example for **encapsulation, inheritance, polymorphism, abstraction**; overloading vs overriding.
- **Complexity:** Big-O of common loops, binary search (O(log n)), merge/quick sort (O(n log n)), nested loops (O(n²)).
- **SQL:** `JOIN` types, `GROUP BY` + `HAVING`, subquery for **2nd-highest salary**, `WHERE` vs `HAVING`.
- **HTTP:** GET/POST/PUT/PATCH/DELETE, status codes (200/201/301/400/401/403/404/500).
- **OS:** process vs thread, deadlock 4 conditions, what a semaphore/mutex is.
- **SDLC:** phases in order (Requirements → Design → Implementation → Testing → Deployment → Maintenance); models (Waterfall vs Agile).
- **Design patterns:** one-line purpose of Singleton, Factory, Observer, Strategy.
- **Recursion:** base case + recursive case; know factorial/Fibonacci/reverse-a-number.

---

## 4. Study Plan

### If you have ~2 weeks (recommended)
| Day | Focus | Practice |
|-----|-------|----------|
| 1 | OOP + design patterns | 30 MCQs |
| 2 | DSA part 1 (arrays, strings, stack, queue, linked list) | 30 MCQs |
| 3 | DSA part 2 (trees, hashing, recursion) | 30 MCQs |
| 4 | Sorting/searching + **complexity analysis** | 30 MCQs |
| 5 | SQL + databases | 30 MCQs + 5 query writes |
| 6 | **Networking + subnetting** | 30 MCQs + 10 subnet problems |
| 7 | **Rest / review wrong answers** | redo all mistakes |
| 8 | Operating Systems | 30 MCQs |
| 9 | Web/API + HTTP + JWT + HTML/CSS | 30 MCQs |
| 10 | Security + SDLC | 20 MCQs |
| 11 | Aptitude + math + logic | 30 MCQs |
| 12 | **Full timed mock #1** (60 min, mixed) | review same day |
| 13 | Weak-area drilling (from mock) | targeted MCQs |
| 14 | **Full timed mock #2** + light review | rest before test |

### If you have ~3 days (crash mode)
- Day 1: OOP + DSA + complexity (highest weight).
- Day 2: SQL + Networking/subnetting + OS.
- Day 3: HTTP/API/JWT + SDLC + aptitude, then **one full timed mock**.

---

## 5. Test-Day Tactics (how top scorers win the clock)

1. **Two-pass strategy:** Pass 1 — answer everything you know in <30s. **Skip hard ones**, mark them. Pass 2 — return to marked ones with remaining time.
2. **Never blank:** before auto-submit, **fill every answer** (educated guess). No penalty reported.
3. **Budget time:** ~60–90s/question. If stuck >90s, mark and move.
4. **Eliminate options** to raise guess odds to 50/50.
5. **Read carefully** on "NOT/EXCEPT/always/never" wording — classic MCQ traps.
6. **Proctoring hygiene:** good lighting, face visible, **no second screen, no copy-paste, no phone.** Don't get flagged.
7. **Setup:** stable internet, laptop charged, quiet room, water, bathroom before start (it auto-submits — no pausing).

---

## 6. Free Practice Resources

- **GeeksforGeeks** — "GATE / CS Quizzes" for OOP, OS, DBMS, CN, Aptitude (candidates specifically named GfG).
- **LeetCode** — Easy set for the coding rounds (do them for MCQ intuition too).
- **HackerRank** — "Prepare → Problem Solving / SQL" tracks + timed practice.
- **W3Schools / MDN** — quick HTTP, SQL, HTML/CSS refreshers.
- **subnetting practice** — subnettingpractice.com or any `/CIDR` drill site.

---

## 7. Self-Check Before You Sit the Test

- [ ] Can I subnet a `/26` and give network + broadcast + host range in under 2 min?
- [ ] Can I state Big-O of any loop/sort/search instantly?
- [ ] Can I write a subquery for 2nd-highest salary?
- [ ] Can I define all 4 OOP pillars with an example each?
- [ ] Do I know the SDLC phases in order + Agile vs Waterfall?
- [ ] Do I know REST verbs + common HTTP status codes?
- [ ] Have I done **at least one full 60-minute timed mock**?
- [ ] Is my room/webcam/internet proctor-ready?

> Hit all 8 → you're in the top band. Then it's about staying calm on the clock.

---

*Generate unlimited practice MCQs and a full timed mock with `CLAUDE-MASTER-PROMPT.md`.*
```
