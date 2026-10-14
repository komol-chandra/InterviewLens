# 14 — SQL — Medium

> Part of the SQL pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable query patterns, and common traps.

## Checklist

- [ ] Second Highest Salary — LC 176 ⭐ → *worked below*
- [ ] Nth Highest Salary — LC 177 → *worked below*
- [ ] Department Highest Salary — LC 184 → *worked below*
- [ ] Rank Scores — LC 178 *(`DENSE_RANK()` — no gaps between tied scores)*

**⭐ Priority in this file:** Second Highest Salary (LC 176).

---

## Worked Solutions

### ⭐ Second Highest Salary — LC 176  *(subquery + `DISTINCT`, NULL-safe)*
```sql
-- Returns NULL if there is no second-highest (required by the problem)
SELECT (
    SELECT DISTINCT salary
    FROM   Employee
    ORDER  BY salary DESC
    LIMIT  1 OFFSET 1          -- skip the top, take the next distinct
) AS SecondHighestSalary;
-- Wrapping in an outer SELECT makes it yield NULL (not an empty set) when absent.
```

Window-function alternative (generalizes to Nth):
```sql
SELECT MAX(salary) AS SecondHighestSalary
FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
    FROM   Employee
) t
WHERE rnk = 2;
```

### Nth Highest Salary — LC 177  *(`DENSE_RANK` generalizes cleanly)*
```sql
CREATE FUNCTION getNthHighestSalary(N INT) RETURNS INT
BEGIN
  RETURN (
    SELECT DISTINCT salary
    FROM (
      SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
      FROM Employee
    ) t
    WHERE rnk = N
  );
END;
```

### Department Highest Salary — LC 184  *(window `PARTITION BY`)*
```sql
SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM (
    SELECT name, salary, departmentId,
           RANK() OVER (PARTITION BY departmentId ORDER BY salary DESC) AS rnk
    FROM   Employee
) e
JOIN   Department d ON d.id = e.departmentId
WHERE  e.rnk = 1;         -- RANK (not DENSE_RANK) so ties all count as top
```
