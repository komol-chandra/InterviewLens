---
id: ps-sql-hard
title: "14 — SQL — Hard"
track: problem-solving
type: problem-set
status: draft
conf: 0
tier: starter
tags: [problem-solving, sql]
updated: 2026-11-14
---

# 14 — SQL — Hard

> **Pattern চেনার সংকেত:** "প্রতিটা group-এ top N" → `DENSE_RANK() OVER (PARTITION BY … ORDER BY …)` তারপর `WHERE rnk <= N`। "শর্ত মানা রেকর্ডের হার, দিনে দিনে" → `AVG(condition)` বা `SUM(CASE…)/COUNT(*)` + `GROUP BY day`। "টানা ৩ বা বেশি দিন/সারি" → **gaps-and-islands**: `id − ROW_NUMBER()` একটা টানা অংশে একই থাকে।
> নিচের query গুলো MySQL 8-এর জন্য লেখা, আর LeetCode-এর sample ডেটা দিয়ে SQLite-এ যাচাই করা (window function দুটোতেই একই)।
> প্যাটার্ন: [00-pattern-overview.md](00-pattern-overview.md)

| # | Problem | Source | Solved | Time | Revisit |
|---|---|---|---|---|---|
| 1 | Department Top Three Salaries ⭐ | LC 185 | ⬜ | — | — |
| 2 | Trips and Users | LC 262 | ⬜ | — | — |
| 3 | Human Traffic of Stadium | LC 601 | ⬜ | — | — |
| 4 | Median Employee Salary | LC 569 *(ROW_NUMBER + COUNT OVER)* | ⬜ | — | — |
| 5 | Find Cumulative Salary of an Employee | LC 579 *(frame: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`)* | ⬜ | — | — |

---

## 1. Department Top Three Salaries  ·  LC 185

**Problem:** প্রতিটা department-এ যারা top 3 **unique** salary পায় (একই salary-র সবাই আসবে)।
**Tables:** `Employee(id, name, salary, departmentId)`, `Department(id, name)`
**Output:** `Department, Employee, Salary`

**Pattern:** `DENSE_RANK` per partition — tie থাকলে একই rank, আর পরের rank-এ ফাঁক নেই (`RANK` দিলে 1,1,3 — ভুল)।

**SQL:**
```sql
WITH ranked AS (
    SELECT e.name,
           e.salary,
           e.departmentId,
           DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) AS rnk
    FROM   Employee e
)
SELECT d.name   AS Department,
       r.name   AS Employee,
       r.salary AS Salary
FROM   ranked r
JOIN   Department d ON d.id = r.departmentId
WHERE  r.rnk <= 3
ORDER  BY d.name, r.salary DESC, r.name;
```

**Window function ছাড়া (MySQL 5.7, ইন্টারভিউয়ার চাইলে):**
```sql
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM   Employee e
JOIN   Department d ON d.id = e.departmentId
WHERE  (SELECT COUNT(DISTINCT e2.salary)
        FROM   Employee e2
        WHERE  e2.departmentId = e.departmentId
          AND  e2.salary > e.salary) < 3       -- fewer than 3 distinct salaries above me
ORDER  BY d.name, e.salary DESC, e.name;
```

**Complexity:** window version O(n log n) (partition sort); correlated subquery O(n²) — index `(departmentId, salary)` থাকলে অনেক ভালো।

**Mistakes:**
- `RANK()` বা `ROW_NUMBER()` → tie ভুল হ্যান্ডেল।
- `LIMIT 3` প্রতি group-এ কাজ করে না।

🎤 **Say this:** "Top N per group is a window-function job: dense rank within each department by salary descending, then keep ranks up to three. Dense rank, because ties should share a rank without leaving gaps."

🔗 DistroSaaS: "প্রতিটা territory-তে top 3 SR/outlet" রিপোর্ট — **[Komol পূরণ করবে: top-N per territory রিপোর্টের স্টোরি ID]**।

---

## 2. Trips and Users  ·  LC 262

**Problem:** `2013-10-01` থেকে `2013-10-03` প্রতিদিনের cancellation rate (দুই দশমিক), শুধু সেই trip যেখানে client আর driver দুজনেই **banned না**।
**Tables:** `Trips(id, client_id, driver_id, city_id, status, request_at)` — status: `completed`, `cancelled_by_driver`, `cancelled_by_client`; `Users(users_id, banned, role)`।
**Output:** `Day, Cancellation Rate`

**Pattern:** Filter join + conditional aggregate — দুইবার `Users` join (client, driver), তারপর `AVG(status != 'completed')`।

**SQL:**
```sql
SELECT t.request_at AS Day,
       ROUND(AVG(CASE WHEN t.status = 'completed' THEN 0 ELSE 1 END), 2) AS `Cancellation Rate`
FROM   Trips t
JOIN   Users c ON c.users_id = t.client_id AND c.banned = 'No'
JOIN   Users d ON d.users_id = t.driver_id AND d.banned = 'No'
WHERE  t.request_at BETWEEN '2013-10-01' AND '2013-10-03'
GROUP  BY t.request_at
ORDER  BY t.request_at;
```

**Mistakes:**
- `WHERE … NOT IN (banned users)` subquery-ও চলে, কিন্তু `NOT IN` + `NULL` থাকলে কিছুই ফেরত দেয় না — join নিরাপদ।
- rate = cancelled / **ফিল্টার করা** মোট, পুরো মোট না।
- `ROUND(…, 2)` ভুলে যাওয়া।

🎤 **Say this:** "I join Users twice, once as client and once as driver, both filtered to non-banned, so the denominator is already correct; then the cancellation rate is just the average of a cancelled flag per day."

---

## 3. Human Traffic of Stadium  ·  LC 601

**Problem:** যেসব সারি **টানা ৩ বা বেশি id**-র একটা অংশে আছে যেখানে প্রতিটায় `people ≥ 100`, সেগুলো `visit_date` ক্রমে দাও।
**Table:** `Stadium(id, visit_date, people)` — id বাড়ে visit_date-এর সাথে।

**Pattern:** Gaps-and-islands — `people ≥ 100` সারিগুলোর ওপর `id − ROW_NUMBER()`; টানা id-গুলোর জন্য এই পার্থক্য একই থাকে, তাই এটাই "island" key।

**SQL:**
```sql
WITH busy AS (
    SELECT id, visit_date, people,
           id - ROW_NUMBER() OVER (ORDER BY id) AS grp     -- constant inside a consecutive run
    FROM   Stadium
    WHERE  people >= 100
),
sized AS (
    SELECT id, visit_date, people,
           COUNT(*) OVER (PARTITION BY grp) AS run_len
    FROM   busy
)
SELECT id, visit_date, people
FROM   sized
WHERE  run_len >= 3
ORDER  BY visit_date;
```

**Mistakes:**
- `LAG/LEAD` দিয়ে শুধু ঠিক ৩টা প্রতিবেশী দেখলে লম্বা run-এর মাঝের/প্রান্তের সারি নিয়ে ভুল হয় — island পদ্ধতি সব দৈর্ঘ্যে চলে।
- `ROW_NUMBER()` **ফিল্টারের পরে** হিসাব হতে হবে (CTE-র ভেতরে `WHERE`), নইলে key ভাঙে।

🎤 **Say this:** "This is gaps and islands: after filtering busy days, id minus row number is constant within each consecutive run, so I group by that difference and keep groups with at least three rows."

🔗 DistroSaaS: "টানা N দিন অর্ডার না দেওয়া outlet" বা "টানা উপস্থিতি" — একই gaps-and-islands — **[Komol পূরণ করবে: streak/inactive-outlet রিপোর্টের স্টোরি ID]**।
