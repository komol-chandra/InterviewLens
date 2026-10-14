# 04 — SQL & Databases (Day 4)

> **Goal:** write the 2nd-highest-salary query from memory + know join types cold.

---

## 1. Core SQL clauses (execution order)
```
FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT
```
- **WHERE** filters rows **before** grouping.
- **HAVING** filters groups **after** `GROUP BY` (used with aggregates).
- **ORDER BY** sorts final result; **LIMIT** caps rows.

## 2. JOIN types
| Join | Returns |
|------|---------|
| **INNER JOIN** | Only rows matching in **both** tables |
| **LEFT JOIN** | All left rows + matched right (NULLs if none) |
| **RIGHT JOIN** | All right rows + matched left |
| **FULL OUTER JOIN** | All rows from both, matched where possible |
| **CROSS JOIN** | Cartesian product (every combo) |
| **SELF JOIN** | Table joined to itself (e.g. employee → manager) |

```sql
SELECT e.name, d.dept_name
FROM employees e
INNER JOIN departments d ON e.dept_id = d.id;
```

## 3. Aggregates + GROUP BY
`COUNT, SUM, AVG, MIN, MAX`
```sql
SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_sal
FROM employees
GROUP BY dept_id
HAVING COUNT(*) > 5;          -- only depts with >5 people
```

## 4. Subqueries — the classics

### Highest salary
```sql
SELECT MAX(salary) FROM employees;
```

### 2nd highest salary (memorize this)
```sql
SELECT MAX(salary) FROM employees
WHERE salary < (SELECT MAX(salary) FROM employees);
```
Alternative with `DISTINCT` + `LIMIT`:
```sql
SELECT DISTINCT salary FROM employees
ORDER BY salary DESC
LIMIT 1 OFFSET 1;   -- skip 1, take the next
```
Nth highest (dense): `DENSE_RANK() OVER (ORDER BY salary DESC)` then filter `= N`.

### Employees earning above company average
```sql
SELECT name, salary FROM employees
WHERE salary > (SELECT AVG(salary) FROM employees);
```

## 5. Normalization
- **1NF** — atomic values, no repeating groups (each cell one value).
- **2NF** — 1NF + no **partial** dependency (non-key depends on whole composite key).
- **3NF** — 2NF + no **transitive** dependency (non-key depends only on the key).
- **Denormalization** — deliberately add redundancy for read speed.

## 6. Indexing
- An **index** speeds up reads (like a book index) — B-tree lookup O(log n) instead of full scan O(n).
- Trade-off: **slower writes** (index must update) + extra storage.
- **Primary key** = unique + not null, auto-indexed. **Foreign key** = link to another table's PK.

## 7. ACID (transactions)
- **A**tomicity — all or nothing.
- **C**onsistency — valid state to valid state.
- **I**solation — concurrent txns don't interfere.
- **D**urability — committed data survives crashes.

## 8. SQL vs NoSQL
- **SQL** (MySQL, Postgres) — structured, fixed schema, relations, ACID.
- **NoSQL** (MongoDB, Redis) — flexible schema, horizontal scale, documents/key-value.

---

## 9. Practice MCQs

1. Which filters groups after GROUP BY? a) WHERE b) **HAVING** c) ORDER BY d) LIMIT
2. INNER JOIN returns: a) All left rows b) **Only matching rows in both** c) All rows d) No rows
3. 2nd highest salary can use: a) COUNT b) **MAX with a subquery** c) GROUP BY only d) DISTINCT only
4. 3NF removes: a) Atomic values b) **Transitive dependencies** c) All joins d) Indexes
5. An index primarily improves: a) Writes b) **Read/search speed** c) Storage size d) Deletes
6. LEFT JOIN keeps: a) Only matches b) **All left rows** c) All right rows d) Nothing
7. The "I" in ACID is: a) Index b) Integrity c) **Isolation** d) Insert
8. WHERE runs: a) After GROUP BY b) **Before GROUP BY** c) After SELECT d) Last
9. A primary key is: a) Nullable b) **Unique and not null** c) Always a string d) Optional
10. AVG, SUM, COUNT are: a) Joins b) **Aggregate functions** c) Indexes d) Constraints

### Answer Key
1-b, 2-b, 3-b, 4-b, 5-b, 6-b, 7-c, 8-b, 9-b, 10-b

---

## 10. Common Traps
- `WHERE` cannot use aggregate functions — use `HAVING` for `COUNT()/SUM()` filters.
- INNER JOIN drops unmatched rows; use LEFT JOIN to keep them with NULLs.
- Index speeds reads but **slows inserts/updates** — not free.
- 2NF is about **partial** dependency (composite keys); 3NF about **transitive** dependency.
