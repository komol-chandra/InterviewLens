# 14 — SQL — Easy

> Part of the SQL pattern — see `00-pattern-overview.md` in this folder for the explanation, diagram, reusable query patterns, and common traps.

## Checklist

- [ ] Employees Earning More Than Their Managers — LC 181 → *worked below*
- [ ] Duplicate Emails — LC 182 → *worked below*
- [ ] Customers Who Never Order — LC 183 → *worked below*
- [ ] Combine Two Tables (JOIN) — LC 175 *(`LEFT JOIN` so people with no address still show)*

---

## Worked Solutions

### Employees Earning More Than Their Managers — LC 181  *(self-join)*
```sql
SELECT e.name AS Employee
FROM   Employee e
JOIN   Employee m ON e.managerId = m.id
WHERE  e.salary > m.salary;
-- join the table to itself: e = worker, m = their manager
```

### Duplicate Emails — LC 182  *(`GROUP BY … HAVING`)*
```sql
SELECT email
FROM   Person
GROUP  BY email
HAVING COUNT(*) > 1;      -- keep only groups that appear more than once
```

### Customers Who Never Order — LC 183  *(anti-join via `LEFT JOIN … IS NULL`)*
```sql
SELECT c.name AS Customers
FROM   Customers c
LEFT   JOIN Orders o ON o.customerId = c.id
WHERE  o.id IS NULL;      -- no matching order row = never ordered
```
