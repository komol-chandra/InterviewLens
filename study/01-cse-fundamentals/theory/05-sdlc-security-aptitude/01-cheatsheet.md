# 07 — SDLC + Security + Aptitude/Math (Day 7)

> **Goal:** SDLC phases in order + auth vs authz + fast mental math.

---

# PART A — SDLC (Software Development Life Cycle)

## 1. Phases in order
```
Requirements → Design → Implementation (Coding) → Testing → Deployment → Maintenance
```
- **Requirements** — gather + document what's needed.
- **Design** — architecture, DB schema, UI mockups.
- **Implementation** — write the code.
- **Testing** — unit, integration, system, UAT.
- **Deployment** — release to production.
- **Maintenance** — bug fixes, updates, support.

## 2. Models
| Model | Nature | Best for |
|-------|--------|----------|
| **Waterfall** | Sequential, rigid, phases don't overlap | Fixed, well-known requirements |
| **Agile** | Iterative sprints, adaptive, continuous feedback | Changing requirements |
| **Scrum** | Agile framework: sprints, standups, backlog | Team delivery |
| **V-Model** | Waterfall + testing paired to each phase | Safety-critical |

- **Agile values:** individuals & interactions, working software, customer collaboration, responding to change.

## 3. Testing types
- **Unit** — single function/class. **Integration** — modules together.
- **System** — whole app. **UAT** — user acceptance.
- **Regression** — re-test after changes. **Black-box** (no code) vs **White-box** (knows code).

---

# PART B — Security

## 4. Authentication vs Authorization
- **Authentication (AuthN)** — verifying **who you are** (login, password, OTP, JWT).
- **Authorization (AuthZ)** — verifying **what you can do** (roles, permissions).

## 5. Common vulnerabilities (OWASP-flavoured)
- **SQL Injection** — malicious SQL via input → use parameterized queries.
- **XSS (Cross-Site Scripting)** — inject JS into pages → escape/sanitize output.
- **CSRF** — trick user's browser into a request → CSRF tokens.
- **Broken auth / weak passwords** — hash passwords (bcrypt), use MFA.
- **Man-in-the-middle** — use HTTPS/TLS.

## 6. Crypto basics
- **Hashing** (one-way: SHA-256, bcrypt) — passwords, integrity. Can't reverse.
- **Encryption** (two-way) — **symmetric** (one key, AES) vs **asymmetric** (public/private, RSA).
- **HTTPS = HTTP + TLS** — encrypts data in transit.

---

# PART C — Aptitude / Math / Logic

## 7. Quick formulas
- **Percentage:** x% of y = (x/100)·y. Increase from a→b = ((b−a)/a)·100%.
- **Ratio:** a:b split of N → a·N/(a+b) and b·N/(a+b).
- **Average** = sum / count.
- **Speed** = distance / time.
- **Simple interest** = P·R·T/100.

## 8. Series patterns
- Arithmetic (constant diff): 2, 5, 8, 11 → +3.
- Geometric (constant ratio): 3, 6, 12, 24 → ×2.
- Squares/cubes: 1, 4, 9, 16 (n²); 1, 8, 27 (n³).
- Fibonacci: 1, 1, 2, 3, 5, 8 (add previous two).

## 9. Logic puzzle tips
- **Two-pass:** skip hard puzzles, return later.
- Draw a quick table/grid for "who sits where" type questions.
- Watch **NOT / EXCEPT / only / always** wording.

---

## 10. Practice MCQs

1. Correct SDLC order starts with: a) Design b) **Requirements** c) Testing d) Coding
2. Agile is characterized by: a) Rigid phases b) **Iterative sprints** c) No testing d) One release only
3. SQL injection is prevented by: a) More servers b) **Parameterized queries** c) Faster DB d) Caching
4. AuthN answers: a) What can you do b) **Who are you** c) Where are you d) When
5. Hashing is: a) Two-way b) **One-way** c) Compression d) Encryption with a key
6. XSS involves injecting: a) SQL b) **JavaScript into a page** c) SSH keys d) Cookies only
7. 20% of 150 = a) 20 b) **30** c) 15 d) 45
8. Next in series 3, 6, 12, 24, ...: a) 30 b) 36 c) **48** d) 28
9. Which model pairs testing with each dev phase? a) Waterfall b) Agile c) **V-Model** d) Scrum
10. HTTPS provides security via: a) Faster DNS b) **TLS encryption** c) Bigger packets d) Caching

### Answer Key
1-b, 2-b, 3-b, 4-b, 5-b, 6-b, 7-b, 8-c, 9-c, 10-b

---

## 11. Common Traps
- Requirements comes **before** Design — don't start SDLC at coding.
- AuthN (identity) ≠ AuthZ (permission).
- Hashing is one-way (can't reverse); encryption is reversible with a key.
- Read series carefully: is it +constant (arithmetic) or ×constant (geometric)?
