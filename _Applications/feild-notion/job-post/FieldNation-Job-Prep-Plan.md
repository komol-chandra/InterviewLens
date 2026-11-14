# Field Nation — Job Preparation Plan

**Roles:** Senior Software Engineer (Full stack) · Software Engineer
**Company:** Field Nation, a marketplace for on-site gig work. Work orders connect buyers with technicians.
**Location:** Uttara 12, Dhaka. Hybrid (2 days in office, 3 remote). Hours are 1 PM – 10 PM BD time, which overlaps with the US team.
**Prepared:** 2026-09-27

---

## 1. The Two Roles Side by Side

| | Senior Software Engineer | Software Engineer |
|---|---|---|
| Salary | **BDT 160k – 210k** | BDT 80k – 120k |
| Backend experience | 4+ yrs | 2+ yrs |
| React experience | 3+ yrs | 1+ yr |
| TDD | **"Strong focus", required** | Not listed |
| Microservices | **Required** | Nice to have |
| React Native | **Required** | Nice to have |
| AI tools in daily workflow | **Required (listed twice)** | Not listed |
| AI orchestration / automation | **Required (listed twice)** | Not listed |
| Advanced SQL | "Advanced" | "Knowledge of" |
| Extra duties | Bring ideas, join customer calls to troubleshoot integrations | — |
| Shared stack | PHP + MySQL → Node.js/NestJS microservices, REST, React/Redux/RN, Docker + Kubernetes, AWS, SLI/SLO observability, RabbitMQ/Kafka (plus) |

### Recommendation: apply for Senior, and fall back to SE if needed
- The Senior post lists the same AI requirements twice: using AI tools in daily development and using AI orchestration/automation. That is where you are strongest. You run a multi-agent Claude setup (named sub-agents, skills, hooks, and phase-based orchestration) on a production multi-tenant SaaS, which most candidates cannot show.
- If the Senior loop decides you are not ready, ask to be considered for SE in the same process. Don't apply for SE first, because that anchors your salary at 80–120k.

---

## 2. Gap Analysis (check each honestly)

Rate yourself from 0 (no exposure) to 3 (can defend it in a deep dive). Anything at 0–1 goes into the study plan.

| Area | What they will probe | Your evidence (Sokrio) | Self-rating | Gap action |
|---|---|---|---|---|
| PHP backend | OOP, SOLID, Laravel internals, queues | Laravel 10 multi-tenant API, 40+ queued jobs, reports | | |
| MySQL (advanced) | Indexes, EXPLAIN, joins vs subqueries, window functions, locking, isolation levels | Heavy report queries, landlord/tenant DBs | | Practise EXPLAIN plus 15 SQL problems |
| **Node.js / NestJS** | Event loop, async/await, modules, DI, guards, pipes | ? | | **Build a mini NestJS service (Section 4)** |
| React + Redux + TS | Hooks, rendering, memoisation, RTK, typing | App frontend + admin frontend (React/Vite/TS/RTK) | | |
| **React Native** | Differences from web, navigation, native bridge, offline | ? | | 1 small RN screen with Expo |
| **TDD** | Red-green-refactor live, mocking, test pyramid | PHPUnit, pytest, Vitest suites | | **Practise TDD katas live** |
| Microservices | Service boundaries, sync vs async, sagas, idempotency, API gateway | Laravel + FastAPI benchmark service split | | Study plus a design drill |
| Event-driven | RabbitMQ vs Kafka, at-least-once delivery, DLQ, outbox pattern | Laravel queues / Redis | | Theory plus a diagram |
| Docker / K8s | Dockerfile, compose, Pod/Deployment/Service/Ingress, probes, HPA | Dockerised services | | K8s basics with a minikube demo |
| AWS | EC2, RDS, S3, SQS/SNS, ECS/EKS, IAM, CloudWatch | AWS theory guide already done | | Review |
| Observability | SLI/SLO/SLA, error budgets, the 4 golden signals, tracing, APM | ? | | Theory plus one example SLO |
| Linux | Processes, logs, grep/awk, systemd, networking basics | Daily Ubuntu | | |
| AI in workflow | Concrete examples, guardrails, measured gains | **Claude agents/skills/hooks setup** | | **Prepare a 3-minute demo story** |
| HTML/CSS/SASS | Semantics, flex/grid, specificity, BEM | | | Light review |

---

## 3. Likely Interview Process (typical for Field Nation in Dhaka)

1. **HR screen** (20–30 min): motivation, the 1–10 PM shift, notice period, salary expectation.
2. **Online assessment or take-home**: coding problems (JS/TS or PHP) or a small full-stack task with tests.
3. **Technical interview 1** (60–90 min): JS/TS, React, PHP, SQL, REST, often with live coding.
4. **Technical interview 2 / system design** (Senior): design a piece of a work-order marketplace, covering microservices, events, and scaling.
5. **Engineering manager / culture round**: teamwork, offshore collaboration, conflict, ownership.
6. **Offer / HR**.

> Ask HR for the exact rounds and format. Then give more weight in this plan to whatever they name.

---

## 4. 14-Day Study Plan

About 3–4 hours on weekdays and 6 hours on weekends. If the interview is sooner, compress by doing only the **bold** items.

### Week 1: Close the biggest gaps

| Day | Focus | Tasks | Output |
|---|---|---|---|
| 1 | **Research + stories** | Study Field Nation's product (work orders, buyers, providers, payments, ratings). Write 6 STAR stories (Section 7). | stories.md |
| 2 | **Node.js core** | Event loop phases, microtasks vs macrotasks, streams, `async`/`await` error handling, cluster vs worker threads | Notes and 10 Q&A |
| 3 | **NestJS hands-on** | Build a `work-orders` service: module, controller, service, DTO + class-validator, TypeORM + MySQL, guard | GitHub repo |
| 4 | **TDD in NestJS** | Rebuild one endpoint test-first with Jest (unit + e2e with supertest), with repository mocks | Tests in the repo |
| 5 | **Advanced SQL** | Composite indexes, the leftmost-prefix rule, EXPLAIN output, window functions, gap locks, isolation levels, N+1 | 15 solved SQL problems |
| 6 | Event-driven + microservices | Add RabbitMQ to the repo: publish `WorkOrderAssigned`, consumer service, DLQ, idempotency key. Read about the outbox and saga patterns. | Diagram + code |
| 7 | Docker + K8s | Dockerfile (multi-stage) and docker-compose for the repo. Deploy to minikube with Deployment, Service, liveness/readiness probes, ConfigMap/Secret. | Working `kubectl apply` |

### Week 2: Depth, design, and practice

| Day | Focus | Tasks | Output |
|---|---|---|---|
| 8 | **React + Redux + TS** | Reconciliation, keys, `useMemo`/`useCallback`/`memo`, custom hooks, RTK Query, typing props/generics | 15 Q&A |
| 9 | React Native | Expo app with a work-order list and details screen, React Navigation, and an offline caching idea | Small RN app |
| 10 | Observability + AWS | SLI/SLO/error budget with an example. Golden signals, OpenTelemetry tracing, CloudWatch/Datadog/New Relic. Review the AWS guide. | 1-page cheat sheet |
| 11 | **System design** | Design "Field Nation work-order dispatch" (Section 6). Draw it and practise a 35-min spoken walkthrough. | Diagram |
| 12 | **Coding practice** | 6 LeetCode easy/medium (arrays, hash map, two pointers, sliding window, intervals, BFS) in **TypeScript** | Timed solutions |
| 13 | **Mock interview** | A full 90-min mock: 20 min behavioural, 40 min coding with TDD, 30 min design. Record yourself. | Fix list |
| 14 | Polish | Re-read the weak areas, practise the AI demo, prepare questions for them, check logistics. Get a good night's sleep. | Ready |

---

## 5. Technical Question Bank (practise answering out loud)

### JavaScript / TypeScript
- Explain the event loop: why does `Promise.then` run before `setTimeout(0)`?
- What is the difference between `==` and `===`, and between `let`, `const`, and `var`? Explain hoisting and the temporal dead zone.
- Closures: give a real use (memoise, debounce). Write a `debounce` from scratch.
- `this` binding rules, and arrow vs regular functions.
- TS: `interface` vs `type`, generics, `unknown` vs `any`, utility types (`Partial`, `Pick`, `Omit`, `Record`), discriminated unions.

### Node.js / NestJS
- How do you handle a CPU-heavy task in Node?
- NestJS request lifecycle: middleware → guards → interceptors → pipes → controller → interceptors → exception filters.
- How does NestJS dependency injection work? What are providers and scopes?
- **"We're moving PHP to Node microservices. How would you migrate one module safely?"** Answer with the strangler fig pattern, an API gateway, a shared DB → DB-per-service phase, contract tests, and feature flags.

### PHP / Laravel
- Service container and service providers. Facades vs dependency injection.
- Queues: retries, backoff, failed jobs, idempotency. Tie this to your Sokrio jobs.
- Eloquent N+1: `with()` vs `load()`, and chunking large datasets.
- Multi-tenancy: explain your landlord/tenant switching and how you prevent data leaks between tenants. **This is a strong story.**

### MySQL
- Why might the index on `(status, created_at)` go unused when the query filters `WHERE created_at > ? AND status = ?`? It is used, since the optimiser reorders the conditions. The leftmost-prefix rule is what matters.
- What does EXPLAIN tell you: `type`, `key`, `rows`, `Extra: Using filesort/temporary`?
- Deadlocks: causes and how to avoid them.
- Pagination: why is OFFSET slow and how does keyset pagination fix it?
- Write: the top 3 technicians by completed jobs per region last month (window functions).

### React / Redux / React Native
- When does a component re-render? How do you stop unnecessary re-renders?
- Controlled vs uncontrolled inputs. Explain `useEffect` cleanup and dependency pitfalls.
- Redux Toolkit vs Context. When would you use RTK Query?
- RN: how does it differ from web, both the bridge and the new architecture (JSI/Fabric)? How do you debug performance problems?

### Testing / TDD
- Walk through red → green → refactor on a small function.
- Unit vs integration vs e2e. What is the test pyramid?
- Mocks vs stubs vs fakes. When is too much mocking harmful?
- How do you test a queue consumer? How do you test a React component with API calls (MSW)?

### Microservices / Events / DevOps
- Sync (REST) vs async (events): which would you choose, and why?
- RabbitMQ vs Kafka: queue vs log, ordering, replay, consumer groups.
- Exactly-once is a myth. Explain at-least-once delivery combined with idempotent consumers.
- The outbox pattern, and why you need it.
- K8s: Pod vs Deployment vs Service vs Ingress. Readiness vs liveness probes. Rolling updates.
- Define SLI, SLO, and error budget. **Example:** 99.9% of `GET /work-orders` requests succeed in under 300 ms over 30 days, which gives an error budget of about 43 minutes.

### AI in the workflow (Senior, required)
- "How do you use AI tools day to day?"
- "How do you make sure AI-generated code is correct and secure?"
- "Give an example of automating a repetitive engineering task."
- "What doesn't AI do well?"

---

## 6. System Design Drill: "Work-Order Dispatch"

**Prompt to practise:** *A buyer posts a work order (e.g. fix a POS terminal in Chicago). Nearby qualified technicians get notified, one accepts, and the buyer tracks progress, approves the work, and pays.*

Cover these points in about 35 minutes:
1. **Requirements**: functional (create order, match, notify, accept, check-in/out, approve, pay) and non-functional (peak load, latency, availability, auditability).
2. **Services**: Work Order, Matching, Provider Profile, Notification, Payments, Ratings, API Gateway plus Auth.
3. **Data**: MySQL for orders and payments (ACID). A search index or geo index for technician matching. Redis for caching and locks.
4. **Events**: `WorkOrderPublished` → Matching → `ProvidersNotified`. `WorkOrderAccepted` must allow **only one acceptance**, enforced with an optimistic lock or a conditional update.
5. **Reliability**: outbox pattern, idempotency keys on payments, DLQ, retries with backoff.
6. **Scale**: stateless services on K8s with HPA, read replicas, partitioning by region.
7. **Observability**: SLOs per service, distributed tracing, alerts driven by the error budget.
8. **Trade-offs**: say what you would build first as an MVP and what comes later.

> Tie it back to your experience: Sokrio field-force sales (orders, territories, check-ins, deliveries) is close to Field Nation's domain. Say so explicitly.

---

## 7. Behavioural Stories (STAR format, 2 minutes each)

| # | Theme | Suggested Sokrio story |
|---|---|---|
| 1 | Hardest technical problem | Multi-tenant report performance: caching scoped per tenant, MongoDB aggregation, or moving heavy reports to queues |
| 2 | Ownership / impact | A module you delivered end to end (DB → API → UI → tests) |
| 3 | **AI automation** | Building the Claude agent system: named sub-agents, skills, hooks, phase-by-phase builds. Give **measured** gains (time saved, test coverage, fewer review bugs). |
| 4 | Disagreement / conflict | A technical decision where you pushed back with data |
| 5 | Production incident | Something that broke, how you debugged it, and what you changed afterwards |
| 6 | Breaking down big work | Splitting a large feature into phases and tickets |
| 7 | Collaborating across time zones / with product | Working with the business or stakeholders on requirements |
| 8 | Learning fast | Picking up a new stack quickly (FastAPI benchmark service, DevOps) |

**Rule:** every story ends with a number (%, ms, hours, users, tenants).

---

## 8. The AI Workflow Pitch (about 3 minutes, practise until smooth)

1. **Problem:** "A multi-tenant SaaS with 3 apps and a Python service. Repetitive CRUD and report work, and a real risk of tenant-isolation mistakes."
2. **What I built:** "Named sub-agents for each layer (DB, backend, frontend, tests, review). Skills that encode our conventions. Hooks that run checks after edits. A mandatory planning phase with a human approval gate."
3. **Guardrails:** "The AI never merges on its own. There is a review agent with a tenant-isolation checklist, tests are required in each phase, and I review every diff."
4. **Results:** *(fill in real numbers, e.g. new CRUD module from X days to Y hours, test coverage up Z%)*
5. **Limits:** "It is weak at ambiguous business logic and cross-service reasoning without context. That is why the planning docs and memory files exist."

If allowed, bring a screenshot or a short screen recording.

---

## 9. Questions to Ask Them

- How far along is the PHP → Node.js migration? Which services have moved?
- What does the TDD practice look like day to day? What is the coverage expectation?
- How are SLOs defined and owned? Who is on call?
- How is the Dhaka team split with the US team? Who does this role report to?
- How is AI tooling used by the team today, and is there a budget for it?
- What does success look like in the first 90 days?

---

## 10. Salary and Logistics

- **Senior:** ask for **BDT 195k – 210k**, backed by your multi-tenant, full-stack, and AI-automation work. Don't give a number below 180k.
- **SE fallback:** aim for the top of the band (110k – 120k) and ask for a Senior review in 6–12 months.
- Confirm that you are fine with the **1 PM – 10 PM** shift and 2 office days in Uttara 12. Plan your commute.
- Know your notice period and joining date before the HR call.

---

## 11. Final-Day Checklist
- [ ] The CV headline matches the Senior post (Full-stack · PHP/Laravel · React/TS · AI-assisted engineering)
- [ ] NestJS + RabbitMQ + K8s demo repo pushed and linked
- [ ] 8 STAR stories written, each with numbers
- [ ] AI pitch practised out loud (under 3 minutes)
- [ ] System design drawn twice from memory
- [ ] 6 TypeScript coding problems solved under time
- [ ] Questions for them ready
- [ ] Laptop, internet, camera, and quiet room tested (for a remote round)
