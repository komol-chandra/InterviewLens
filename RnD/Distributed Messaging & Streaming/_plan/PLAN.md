# PLAN — Distributed Messaging & Streaming Deep Dive → One HTML Page

> Approved 2026-10-26. Source brief: `../README_2.md`. Question bank: `../interview-questions.md`
> (`../README.md` is a byte-identical duplicate of it). Old notes: `../old-resource/`.

## Goal
Build a code-verified, interview-ready knowledge base on how Sokrio uses Kafka, Redis, Laravel queues and AWS.
Write it **part by part as Markdown sections**, then **render everything into one standard HTML page**.

## Decisions (made with Komol)
| Decision | Choice |
|---|---|
| Format | Section `.md` files first (`../sections/`), then one rendered `.html` |
| Depth | Full code-verified deep dive, every Sokrio claim as `file:line` + tag |
| Language | English |
| Q&A scope | All 81 questions + 20 or more new ones from the code, full format, plus the STAR story and 3 system designs |
| Location | This RnD folder. This replaces README_2's `docs/messaging-knowledge/` |
| Pace | One task per run. Stop after each and wait for "next" |

## Folder layout
```
Distributed Messaging & Streaming/
├── README.md / interview-questions.md / README_2.md / old-resource/   (inputs, never edited)
├── _plan/            PLAN · TRACKER · MEMORY · HANDOFF   (control)
├── sections/         00…09 + GLOSSARY                     (content)
├── build/build_html.py                                    (renderer)
└── messaging-deep-dive.html                               (final page)
```

## Global rules (apply to every task)
1. Code is the source of truth. When the notes disagree, say so and trust the code.
2. Tag every statement `[CODE]` / `[NOTES]` / `[GENERAL]` / `[ASSUMPTION]`.
3. Never invent topics, queues, configs or AWS services. When something is absent, write `Not found. Searched: …`.
4. No secrets, hosts or IPs. Use the env var name and `<redacted>`.
5. Mermaid for every flow. Trim code snippets to the lines that matter.
6. Split a file once it passes ~600 lines.
7. Write like a senior engineer teaching a mid-level one: short paragraphs.
8. Each section ends with the README_2 §6 quality checklist.

---

## Task cards

### T0 — Inventory ✅ DONE
Output: `sections/00-inventory.md`. Facts are summarised in `MEMORY.md`.

### T1 — Architecture overview (README_2 Phase 1)
- **Output:** `sections/01-architecture-overview.md`
- **Inputs:** MEMORY.md §Facts, `old-resource/03-*.md` and `04-*.md`, study guide §1
- **Steps:**
  1. List the business problems solved by messaging: GPS tracking, department → Mongo sync, summary/report jobs, feature-usage analytics, realtime notifications, deferred exports, delayed order approval.
  2. Explain why each technology fits its job (Kafka vs Laravel/Redis queue vs Redis buffer vs Pusher), and add a "should have been" comment where the choice is undocumented.
  3. Draw 3 Mermaid sequence diagrams: (a) tracking publish → consumer → MySQL+Mongo with the fallback, (b) department save → Kafka → Mongo upsert, (c) scheduler → summary job per tenant → Mongo bulkWrite.
  4. Add a notes-vs-code table, reusing D1–D8 from MEMORY.md and adding any new ones.
- **Done when:** 3 diagrams, every claim tagged, checklist passed.

### T2 — Kafka in Sokrio, deep dive (README_2 Phase 2)
- **Output:** `sections/02-kafka-in-sokrio.md` (split into 02a/02b if it runs long)
- **Must verify first:** the `longlang/phpkafka` defaults for `acks`, `auto.offset.reset`, partitioner and compression in `vendor/longlang/phpkafka/src/{Producer,Consumer}/*Config.php`. This resolves A1/A2 in MEMORY.md.
- **Cover:**
  1. Producer config, the key choice (user_id / department_id vs the tenant_id default), the envelope, and the retry and fallback.
  2. Dual-write risk. The Department observer fires inside the model save, possibly before commit. Tracking has the fallback and a lost-ack duplicate. Propose an outbox.
  3. Consumer: Supervisor, group ids, manual per-flush commit, batching, tenant switching, signals, recycle, memory.
  4. PR-5094 walkthrough, then compare with today's code.
  5. Topic design: RF=1 auto-create, 3 partitions, retention defaults.
  6. Delivery guarantee: at-least-once with at-most-once on the swallowed-failure path. Prove it with `file:line`.
  7. Idempotency: tracking is not idempotent (duplicate rows possible); departments is idempotent (upsert).
  8. Ordering: per user / per department, and where it breaks (rebalance mid-batch, per-point fallback, the retry sleep).
  9. Retry/DLQ: none, with a proposal.
- **Done when:** every subsection has a code proof and a "what could go wrong" note.

### T3 — RabbitMQ (README_2 Phase 3)
- **Output:** `sections/03-rabbitmq-in-sokrio.md`
- **Content:** "Not used". Show the search proof from MEMORY.md and the inventory. Then a `[GENERAL]` section on where it *would* fit in Sokrio: delayed order approval, SMS/notification retries with DLX+TTL, per-tenant priority, request/reply to ERP sync. Include an AMQP model diagram.

### T4 — Redis in Sokrio (README_2 Phase 4)
- **Output:** `sections/04-redis-in-sokrio.md`
- **Cover:**
  - The queue driver: the queues, `retry_after=9000` vs the `$timeout=0` jobs (duplicate-run risk), the ignored `$retry_after`/`$retries` properties, no Horizon.
  - Cache: `ScopeCacheToTenant`, `Org::findById`, stampede risk on heavy reports (check `MatrixAggregator` lock+block).
  - Locks: all 8 sites, and what happens on expiry.
  - Rate limiters.
  - The feature-tracking RPUSH/RENAME buffer as a "poor man's stream".
  - Broadcast/Pusher.
  - Persistence/eviction expectations: what is lost on a restart.
- **Must check:** the `redis` cache store config, the session driver, `ShouldBeUnique` lock store, and whether `phpredis` or `predis` is used in practice.

### T5 — Laravel implementation layer (README_2 Phase 5)
- **Output:** `sections/05-laravel-implementation.md`
- **Cover:**
  - Step-by-step "add a new topic + consumer", using the real classes as templates (reuse the study guide §8 checklist, corrected).
  - "Add a queued job the Sokrio way" (Org in the constructor, then `TenantManager` reconnect).
  - Where `afterCommit` is missing.
  - Tenant context in jobs and consumers.
  - Testing patterns from the 12 Kafka test files.
  - Local dev: Docker services, env var names, running a consumer.

### T6 — AWS infrastructure (README_2 Phase 6)
- **Output:** `sections/06-aws-infrastructure.md`
- **Known:** EC2 VMs deployed by GitHub Actions over SSH with a server-side `pipeline.sh`. Boxes: prod, queue worker, report server, PVM, staging. Supervisor. Datadog + Sentry. No IaC.
- **Unknown (mark `[ASSUMPTION]`):** MSK vs self-hosted Kafka, ElastiCache vs self-hosted Redis.
- **Cover:** the README_2 concern table, what AWS manages vs what we manage, and the alternatives (MSK, ElastiCache, SQS/SNS/EventBridge/Kinesis) with trade-offs for Sokrio.

### T7 — Failure modes & runbooks (README_2 Phase 7)
- **Output:** `sections/07-failure-modes-and-runbooks.md` (likely split into 07a/07b)
- **Format:** the exact 8-field runbook template from README_2, for all 20 listed failures plus the Sokrio-specific ones (RF=1 topic, FENCED_INSTANCE_ID group sharing, EINTR/Datadog, signal mid-DB-read, department publish lost with no fallback, the `$timeout=0` double run).
- **End with:** the Top 5 risks today, ranked, with the first fix to propose.

### T8 — Interview Q&A (README_2 Phase 8)
Format per question: **Short (30s) / Deep / Sokrio example (file:line) / Follow-ups / Mistakes**.
| Card | Output | Questions |
|---|---|---|
| T8a | `sections/08a-interview-qa.md` | Q1–Q19 (foundations, guarantees, Kafka internals) |
| T8b | `sections/08b-interview-qa.md` | Q20–Q37 (Kafka ops, RabbitMQ) |
| T8c | `sections/08c-interview-qa.md` | Q38–Q57 (Redis, comparisons, stream processing) |
| T8d | `sections/08d-interview-qa.md` | Q58–Q81 (patterns, Laravel, design, incidents) |
| T8e | `sections/08e-interview-qa.md` | Q82–Q101+: 20 or more new Sokrio-derived questions, the STAR story (PR-5094 → tracking pipeline), and 3 system designs (order pipeline, multi-tenant reporting, notifications) |

### T9 — Study plan, labs, cheat sheet (README_2 Phase 9)
- **Output:** `sections/09-study-plan-and-labs.md`
- **Content:** a 4–6 week plan over these sections, and Docker labs (kill a broker, force a rebalance, reproduce a duplicate then fix it, the retry_after double run, Redis eviction). Plus a cheat sheet of Kafka CLI, redis-cli, `queue:*` artisan commands and supervisorctl.

### T10 — Glossary
- **Output:** `sections/GLOSSARY.md`, every term used across sections, one line each.

### T11 — Render the single HTML page
- **Output:** `build/build_html.py` → `messaging-deep-dive.html`
- **Spec:**
  - Read `sections/*.md` in order and embed the content in one file.
  - Use `marked` + `mermaid` from cdnjs/jsdelivr with pinned versions.
  - Sticky sidebar TOC, full-text search, light/dark theme.
  - Colored badges for `[CODE]/[NOTES]/[GENERAL]/[ASSUMPTION]`, chips for 🟢🟡🔴.
  - Q&A answers collapsed in `<details>`, a "mark as known" progress tracker in localStorage, and a quiz mode that picks random questions.
  - File:line refs as monospace chips. Works at phone width.
- **Verify:** run the script, open it in Chrome, and check the TOC, search, Mermaid, collapse, quiz, dark mode and that the console is clean.
- **Then:** offer to publish it as a private claude.ai artifact. Don't do it automatically.

### T12 — Final QA
- Grep all sections for secret-like patterns (IPs, `password=`, `KAFKA_*=value`).
- Spot-check 10 random `file:line` refs with `sed -n`.
- Re-check that the line refs still match `master` HEAD. If HEAD moved past `d14c0ebb2`, re-verify the changed Kafka files.

## Order
T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8a–e → T9 → T10 → T11 → T12.
T11 can run early (after T2) to preview the page, then be re-run at the end.
