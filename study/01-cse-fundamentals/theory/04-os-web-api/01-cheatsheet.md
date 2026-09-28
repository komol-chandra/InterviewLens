# 06 — Operating Systems + Web / API / JWT (Day 6)

> **Goal:** recite HTTP verbs + status codes; explain JWT in 3 sentences.

---

# PART A — Operating Systems

## 1. Process vs Thread
| | Process | Thread |
|---|---------|--------|
| Memory | Own separate memory | Shares process memory |
| Weight | Heavy | Light |
| Communication | IPC (slow) | Shared memory (fast) |
| Crash | Isolated | Can crash whole process |

- **Multithreading** = multiple threads in one process (parallelism, shared data → needs sync).

## 2. Process states
`New → Ready → Running → Waiting → Terminated`

## 3. CPU Scheduling algorithms
- **FCFS** — first come first served (simple, convoy effect).
- **SJF** — shortest job first (optimal avg wait, needs prediction).
- **Round Robin** — each gets a time quantum (fair, good for time-sharing).
- **Priority** — highest priority first (can starve low priority).

## 4. Deadlock — 4 necessary conditions (all must hold)
1. **Mutual exclusion** — resource held by one at a time.
2. **Hold and wait** — holding one, waiting for another.
3. **No preemption** — can't force-release.
4. **Circular wait** — cycle of waiting processes.
> Break any one → no deadlock.

## 5. Mutex vs Semaphore
- **Mutex** — lock owned by one thread (binary, ownership).
- **Semaphore** — counter allowing N threads (no ownership). Binary semaphore ≈ mutex.

## 6. Memory
- **Paging** — divides memory into fixed-size **pages**/frames (no external fragmentation).
- **Virtual memory** — use disk as extra RAM; **page fault** when page not in RAM.
- **Thrashing** — excessive paging kills performance.

---

# PART B — Web / API / HTTP

## 7. REST verbs (idempotent? = same call twice = same result)
| Verb | Action | Idempotent? |
|------|--------|-------------|
| **GET** | Read | Yes |
| **POST** | Create | No |
| **PUT** | Replace whole resource | Yes |
| **PATCH** | Partial update | No (usually) |
| **DELETE** | Remove | Yes |

## 8. HTTP status codes
| Code | Meaning |
|------|---------|
| **200** OK | Success |
| **201** Created | Resource created (POST) |
| **204** No Content | Success, no body |
| **301** Moved Permanently | Redirect |
| **400** Bad Request | Client sent invalid data |
| **401** Unauthorized | Not authenticated |
| **403** Forbidden | Authenticated but no permission |
| **404** Not Found | Resource doesn't exist |
| **500** Internal Server Error | Server crashed |
| **502/503** | Bad Gateway / Service Unavailable |

- **1xx** info · **2xx** success · **3xx** redirect · **4xx** client error · **5xx** server error.

## 9. How an API works (REST, 4 sentences)
1. Client sends an HTTP request (verb + URL + headers + optional body) to an endpoint.
2. Server routes it, runs logic, queries the DB.
3. Server returns a **status code + JSON** response.
4. Stateless — each request carries all info needed (often a token).

## 10. JWT authentication (explain in 3 sentences)
1. User logs in; server verifies credentials and returns a **signed JWT** = `header.payload.signature`.
2. Client stores it and sends it on every request in `Authorization: Bearer <token>`.
3. Server **verifies the signature** (no DB lookup needed → stateless) and reads the payload (user id, roles, expiry).

- **Header** = algorithm + type. **Payload** = claims (not encrypted, just base64 — never put secrets). **Signature** = HMAC/RSA of header+payload with a secret key → detects tampering.
- **Authentication** (who you are) vs **Authorization** (what you're allowed to do).

## 11. HTML/CSS basics
- HTML = structure (tags), CSS = styling. **Block** vs **inline** elements.
- CSS specificity: inline > id > class > element. Box model: content → padding → border → margin.
- `<div>` block container, `<span>` inline. Semantic tags: `<header> <nav> <main> <footer>`.

---

## 12. Practice MCQs

1. A thread differs from a process because it: a) Has own memory b) **Shares process memory** c) Is heavier d) Can't run concurrently
2. Which HTTP status is "Forbidden"? a) 401 b) **403** c) 404 d) 400
3. POST is used to: a) Read b) **Create** c) Delete d) Replace
4. JWT is sent in which header? a) Cookie only b) **Authorization: Bearer** c) Content-Type d) Host
5. Deadlock requires how many conditions? a) 2 b) 3 c) **4** d) 5
6. 401 means: a) Forbidden b) **Unauthorized (not authenticated)** c) Not found d) Server error
7. Which is idempotent? a) POST b) **PUT** c) PATCH always d) None
8. Round Robin scheduling uses: a) Priority b) **Time quantum** c) Job length d) FIFO only
9. The JWT signature exists to: a) Encrypt data b) **Detect tampering / verify authenticity** c) Store the password d) Compress the token
10. Authentication vs Authorization: a) Same thing b) **AuthN = who you are, AuthZ = what you can do** c) Both check permissions d) AuthZ = login

### Answer Key
1-b, 2-b, 3-b, 4-b, 5-c, 6-b, 7-b, 8-b, 9-b, 10-b

---

## 13. Common Traps
- **401 vs 403:** 401 = not logged in; 403 = logged in but not allowed.
- JWT payload is **base64-encoded, NOT encrypted** — anyone can read it; never store secrets there.
- A thread crash can take down the whole process; processes are isolated.
- PUT (replace) is idempotent; POST (create) is not.
