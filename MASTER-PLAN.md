# InterviewLens Master Plan

> **On approval:** copy this whole file verbatim to `/home/kiri2ka/code/sokrio/_komol/InterviewLens/MASTER-PLAN.md`, then stop. Komol continues in a new chat with:
> "Read MASTER-PLAN.md and start Work 01."
>
> Written 2026-11-14. This is the single source of truth until the MVP is finished.

---

## 1. Who and why (context for any new chat)

- **Komol:** Software Engineer, ~4 years building a multi-tenant distribution / order-management SaaS (called **"DistroSaaS"** in all public content). Stack: Laravel, React, FastAPI, MySQL (AWS RDS), MongoDB, Redis and Kafka (self-hosted on EC2), Datadog/CloudWatch.
  - Built: custom reports and the heavy-report pipeline, module + layered approval workflows, global settings, the promotion engine, primary/secondary orders with Kafka events, field tracking, territory/department hierarchy, and the benchmark/market-intelligence service.
- **Strongest:** PHP/Laravel, backend modules, real production work.
- **Weakest:**
  - Problem solving: MCQ (CS fundamentals, code-output, aptitude) and freezing in live coding.
  - **AWS:** zero knowledge, and it feels confusing.
  - AI engineering, Python frameworks, Next.js.
- **Goals:**
  - Apply **now** for Laravel, Node, Python and AI Engineer roles (all four).
  - Senior Engineer or Product Lead at a top company within 2–3 years.
  - Future-proof for 5 years.
- **Time:** 6–8 h/day.

### Decisions (fixed, do not re-ask)

| # | Decision |
|---|---|
| D1 | Folder names: numbered kebab-case, no spaces; binaries in `assets/` |
| D2 | Language: Bangla explanations, English terms, English "say-this-in-interview" lines |
| D3 | Code: **PHP** for problem solving, Python second pass, TS/Python wherever it fits better (LLD, Node, AI) |
| D4 | AI depth: applied AI engineering + ML foundations |
| D5 | AWS: local-first (Docker, LocalStack, MinIO, k3d, OpenTofu), then free-tier account with a budget alarm. Ask manager/team to verify facts. **SAA-C03** certification is a milestone |
| D6 | Known prod facts: RDS MySQL; Redis/Kafka self-hosted on EC2; Mongo (Atlas or self-hosted); Datadog + CloudWatch; deploys are GitHub Actions → SSH to EC2 VMs (prod, queue-worker, report, staging); S3 + DO Spaces |
| D7 | **Public-safe rule:** never write "Sokrio", client names, hosts, IPs, secrets, or raw code dumps. Use "DistroSaaS" and rewrite patterns generically. Mark unverified facts `[inferred]`. The real code at `~/code/sokrio/*` is a read-only *source of ideas* |
| D8 | Restore the 47 files that exist only in git history into `99-archive/restored-from-git/` |
| D9 | Memory lives in both places: Claude auto-memory (facts) + repo `.claude/memory/` (study state) |
| D10 | MVP = full restructure (not a skeleton) |
| D11 | Starter content is generated **topic by topic** (all of Problem Solving, then System Design, then AWS) |
| D12 | Execution: **stop after each Work item** and wait for "continue" |
| D13 | No `git push`, no Claude co-author line in commits; Komol commits himself |
| D14 | Dashboard is a simple `DASHBOARD.md` (YAML frontmatter numbers + Markdown/Mermaid), updated by Claude in `/study-end`. No build step |

---

## 2. Three tiers

| Tier | What | Done when |
|---|---|---|
| **THE MVP** | Memory, `.claude/` brain, restore + dedupe, full restructure, link fix, READMEs, DASHBOARD, health check, RAG memory v1 | Health check is clean, `/study-start` works, and RAG search answers from the repo |
| **THE STARTER** | Main-focus content, topic by topic: ① Problem Solving + MCQ ② System Design ③ AWS foundations (00–08) → then DevOps basics, behavioral, CVs per role | ~180 problems curated, 600 MCQ, 11+ SD cases, AWS 00–08 with labs; applying weekly |
| **THE PRODUCT** | Advanced: AI Engineering (ML + applied LLM), AWS 100% + SAA-C03, System Design 100% (staff level), Python frameworks, Node/Next.js, real-world cases, leadership | Cert passed, 2 portfolio repos, full mock loops, Senior/Lead-ready |

---

## 3. Work items (run in order; stop after each)

### Work 01: Memory files (2–5 files from this chat)

**A. Claude auto-memory** in `~/.claude/projects/-home-kiri2ka-code-sokrio--komol-InterviewLens/memory/`, each with frontmatter, plus an index line in `MEMORY.md`:
1. `user-career-goals.md` (user): roles, 2–3-year Senior/Lead goal, 6–8 h/day, applying now.
2. `user-skill-map.md` (user): strengths (PHP/Laravel, backend modules) vs gaps (PS/MCQ, AWS zero, AI, Python frameworks, Next.js).
3. `feedback-aws-local-first.md` (feedback): AWS confuses him. Explain simply, local tools first, then free tier. **Why:** zero knowledge. **How to apply:** every AWS doc has a local lab before any console step.
4. `feedback-public-safe-distrosaas.md` (feedback): rule D7.
5. `project-interviewlens-plan.md` (project): tiers, decisions D1–D14, pointer to `MASTER-PLAN.md`.

**B. Repo `.claude/memory/`**, migrated from `_Resume/1-me/` and updated to the new goals:
- `MEMORY.md` (index)
- `profile.md`
- `decisions.md` (append D1–D14)
- `weak-areas.md` (generic SE topics, 0–3 ratings)
- `interview-log.md`
- `handoff.md`
- `story-bank.md` stays study content and moves to `10-behavioral-leadership/`.

### Work 02: The `.claude/` directory

```
InterviewLens/
├── CLAUDE.md                      ← rules: session protocol, folder rules, Answer Pattern, Honesty + Public-safe, frontmatter spec
└── .claude/
    ├── settings.json              ← registers the RAG MCP server (lens-brain) + permissions for scripts/
    ├── memory/                    ← (Work 01 B)
    ├── templates/
    │   ├── topic.md               ← theory → example → DistroSaaS link → interview Q&A → 🔗 story ID
    │   ├── sd-case.md             ← 7-step: requirements, estimation, API, data model, HLD, deep dive, trade-offs + "DistroSaaS relates"
    │   ├── aws-module.md          ← simple theory → DistroSaaS today [inferred] → target (mermaid) → LOCAL LAB → free-tier lab + teardown → SAA points → Q&A → ask-your-team
    │   ├── problem.md             ← pattern, approach, PHP solution, Python, complexity, mistakes
    │   ├── mcq-bank.md            ← Q, options, answer, 1-line why, trap tag
    │   └── folder-readme.md       ← frontmatter + intro + file table + what's missing
    └── commands/
        ├── study-start.md         ← read handoff, today, weak-areas, DASHBOARD → propose the day's blocks
        ├── study-end.md           ← update tracker, weak-areas, handoff, DASHBOARD, auto-memory; re-index RAG
        ├── gen-topic.md           ← generate one file from a template; public-safe check; read ~/code/sokrio for real examples
        ├── health-check.md        ← run scripts/health.py → refresh 00-start/health-report.md
        ├── log-interview.md       ← record a round → interview-log, weak-areas, applications pipeline
        └── ask.md                 ← query the RAG (lens-brain) before reading many files
```

**Frontmatter spec:**
- Folder `README.md`: `title, order, status (empty|stub|draft|good|complete), tags, updated`.
- Topic file: `id, title, status, conf (0–3), tier (mvp|starter|product), tags`.

### Work 03: Study plan for key topics → `00-start/roadmap.md`

**Daily template (≈7 h):**
- 1.5 h problem solving: 2–3 problems in PHP + 20 timed MCQ.
- 1.5 h system design / LLD.
- 2 h the current main topic.
- 1 h hands-on lab.
- 30 m spoken English (stories, explaining a design out loud).
- 30 m applications.
- 15 m `/study-end`.

**STARTER, topic by topic:**

| Order | Topic | Content to generate | Weeks |
|---|---|---|---|
| ① | **Problem Solving** | "Which pattern?" decision sheet. Fill all 14 `hard.md` stubs. New patterns 15–22: heap, intervals, prefix sum, monotonic stack, trie, union-find, topological sort, binary search on answer. ~180 curated problems with PHP solutions. Live-coding script (clarify → brute → optimize → code → test) | 1–3 |
| ①b | **MCQ / fundamentals** (`02-cs-fundamentals-mcq/`) | 600+ MCQ with explanations: OS, networking, DBMS, OOP, complexity; code-output traps (PHP/JS/Python); aptitude and logic; weekly timed test | 1–4 (parallel) |
| ② | **System Design** | Missing concepts: API design + rate limiting, ID gen + consistent hashing, storage/CDN/search/geo, LB/proxy, estimation. **Cases:** distributed message queue, hotel/train/flight reservation, real-time gaming/trading leaderboard, payment system, stock exchange, digital wallet, email service, object storage, Uber, nearby friends, Google Maps, plus `drills.md` | 4–7 |
| ③ | **AWS foundations** | 00 local lab setup + budget alarm · 01 cloud basics · 02 IAM · 03 VPC · 04 EC2 + ALB + Auto Scaling · 05 S3/EBS + CloudFront · 06 RDS + replicas · 07 ElastiCache vs self-hosted Redis · 08 SQS/SNS/EventBridge, MSK vs self-hosted Kafka | 8–11 |
| ④ | Career + behavioral | One CV per role (Laravel / Node / Python / AI), generic pitch per role, story bank generalized, `applications.md` pipeline | parallel from week 1 |

**PRODUCT (after the Starter):**

| Track | Content |
|---|---|
| AWS 100% | 09 API Gateway + **rate limiting** + WAF + Lambda · 10 Docker → ECR → ECS Fargate · 11 Kubernetes (k3d) → EKS · 12 CI/CD (SSH deploy → blue/green) + Terraform · 13 observability (CloudWatch, Datadog, X-Ray, SLOs) · 14 security (KMS, Secrets Manager, least privilege) · 15 cost + Well-Architected + DR · 16 SAA-C03 practice → **exam**. Capstone: "DistroSaaS on AWS" v0→v4 migration serving web, mobile, API and AI |
| AI Engineering | ML foundations (math, scikit-learn, neural nets, PyTorch, transformers, LoRA) + applied (LLM APIs, prompting, embeddings, pgvector/Qdrant, RAG, agents + tool use, MCP, evals, guardrails, cost/latency, LLMOps). Projects: report Q&A RAG, demand forecasting, field-agent assistant, promotion recommender |
| System Design 100% | Staff level: multi-region, migrations, data platforms, cost; 2 full mock loops per week |
| Python frameworks | FastAPI (deep), Flask, Django + DRF, Celery, Pydantic, async |
| Node / Next.js | NestJS, Next.js App Router, RSC, SSR/ISR, auth, caching, deploying on AWS; portfolio dashboard app |
| Real-world cases (`09-real-world-cases/`) | Multi-tenancy, module + layered approval engine, global settings, custom report builder + heavy reports, promotion engine, primary/secondary orders + Kafka, field tracking, territory/department hierarchy, benchmark service, AI opportunities. All public-safe |
| Leadership | Design docs/RFCs, product thinking, metrics, prioritization, incident leadership, mentoring; 6 blog posts from the cases |

### Work 04: MVP plan + start

**Step 1: Restore and dedupe**
- Restore the 47 files: `git show HEAD:<path>` → `99-archive/restored-from-git/`.
- Delete only md5-identical duplicates:
  - The 7 copies under `cv/old/*`.
  - The CV PDF in the root and `_Resume/`.
  - The Distributed Messaging `README.md`, which is identical to `interview-questions.md`.
- Before touching anything, run an md5 inventory script in the scratchpad.

**Step 2: Restructure**
- A move-map script prints the full map, then runs `mv` (the files are untracked).
- Empty folders get a stub README: mongodb, heavy-reporting. `JS/vuejs` is removed.

```
InterviewLens/
├── README.md  DASHBOARD.md  CLAUDE.md  MASTER-PLAN.md
├── .claude/   scripts/   tools/lens-brain/
├── 00-start/                 today.md, roadmap.md, tracker.md, health-report.md
├── 01-problem-solving/       ← "Problem Solving/" (pdf-series → assets/)
├── 02-cs-fundamentals-mcq/   ← _Resume/mcq-bank.md + new banks
├── 03-system-design/         ← "System Design/" + Backend/system-design
├── 04-design-patterns-lld/   ← Backend/design-patterns + Backend/05-oop-design-pattern
├── 05-backend/               ← Backend/01,03,04,06,07,08 + 09-kafka… + "Distributed Messaging & Streaming" → messaging-streaming/ ; mongodb, heavy-reporting stubs ; Tropic mysql/rest/microservices/node files
├── 06-aws-devops/            ← AWS/ + Tropic/10-docker-k8s-aws-linux + 11-observability
├── 07-ai-engineering/        ← new (README stub)
├── 08-frontend-nextjs/       ← JS/ + Tropic js/ts/react/react-native + PS/06-html-css
├── 09-real-world-cases/      ← new (README stub)
├── 10-behavioral-leadership/ ← _Resume/2-speak + story-bank
├── 11-mocks/                 ← _Resume/mocks
├── 12-career/                ← _Resume/files (resume/), 00-templates (templates/), applications.md
└── 99-archive/               ← fieldnation-2026-10/ (_Applications/feild-notion, Tropic FN-only, 0-now, FN pitch/hr, old START-HERE/tracker), welldevs/, automatrix/, senior-software-engineer/, restored-from-git/
```

**Step 3: Fix links.** Rewrite the old prefixes (`study/`, `4-library/`, `3-practice/`, `5-tracks/`, `0-now/`, `1-me/`, `2-speak/`) to the new paths, then run the link checker.

**Step 4: READMEs and frontmatter.**
- Root hub `README.md` + one `README.md` per folder, built from `.claude/templates/folder-readme.md`.
- Add frontmatter to existing study files without changing their bodies.

**Step 5: `scripts/health.py`** (Python stdlib only; reuses `lens-brain`'s parser). Per folder it reports:
- files and words
- stubs (<150 words)
- missing README or frontmatter
- broken links
- paths with spaces
- the word "sokrio" outside `99-archive/` and `.claude/`

It writes `00-start/health-report.md`.

**Step 6: `DASHBOARD.md`.**
- YAML frontmatter holds the numbers.
- KPI cards table: streak, problems E/M/H, MCQ %, SD cases, AWS modules, AI modules, applications/interviews.
- `████░░` progress bars per track and per tier.
- Mermaid charts:
  - pie: time per track
  - xychart-beta: problems per week and MCQ trend
  - gantt: MVP → Starter → Product
- Weak-areas heat table (🟥🟧🟨🟩).
- Applications pipeline.
- Content-health table taken from the health report.

**Step 7: RAG memory v1** (Work 05 below).

**Step 8: Verify, then update the handoff.** Next is STARTER ① Problem Solving.

### Work 05: RAG memory, `tools/lens-brain/` (part of the MVP)

**Same proven design as `~/code/sokrio/_tools/sokrio-brain`:**
- SQLite FTS5 + `sqlite-vec` + `fastembed`, merged with Reciprocal Rank Fusion.
- MCP over stdio (0 RAM when idle).
- No Docker, no vector server. Light enough for the i5 / 16 GB machine.

```
tools/lens-brain/
├── pyproject.toml          ← deps: fastapi, uvicorn, mcp, sqlite-vec, fastembed, python-frontmatter (uv)
├── README.md
├── src/lens_brain/
│   ├── config.py           ← REPO_ROOT, DB=~/.local/share/interviewlens-brain/lens.db, model name, excluded dirs (99-archive optional, assets/)
│   ├── chunker.py          ← split .md by headings (H2/H3, ~400–800 tokens, 80 overlap); keep path, heading trail, frontmatter (id, status, conf, tier, tags)
│   ├── indexer.py          ← incremental: file hash → only changed files re-embedded; deletes removed files
│   ├── store.py            ← SQLite: docs, chunks, chunks_fts (FTS5 unicode61), chunks_vec (sqlite-vec)
│   ├── search.py           ← hybrid: BM25 top-20 + vector top-20 → RRF → filters (folder, tier, status, tags)
│   ├── api.py              ← FastAPI: GET /search?q=&k=&folder=&tier= · GET /doc?path= · GET /stats (feeds DASHBOARD/React) · POST /reindex · GET /health
│   ├── mcp_server.py       ← tools: search_notes, get_doc, list_weak_areas, stats  (for Claude Code sessions)
│   └── cli.py              ← `lens index`, `lens search "…"`, `lens serve` (FastAPI :8765), `lens stats`
└── tests/test_core.py      ← chunker, incremental index, hybrid search returns a known file
```

- **Embedding model:** the content is Bangla + English, so use a **multilingual** model. First choice is `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dim). Before building, verify it's in fastembed's supported list. Fallback: `intfloat/multilingual-e5-small`.
- **Optional `/ask`:** retrieve top-k, then answer with the Claude API (`claude-haiku-5-5` for cheap answers, using `ANTHROPIC_API_KEY`). It's off by default; search alone is the MVP. Load the `claude-api` skill before writing this code.
- **Hooks:**
  - `/study-end` runs `lens index`.
  - `.claude/settings.json` registers `lens-brain` as an MCP server, so new chats can call `search_notes` before reading many files.
- **React app later:** it calls `/search`, `/doc` and `/stats` on `localhost:8765`.

---

## 4. Current repo health (scan of 2026-11-14)

| Area (current path) | State | Notes |
|---|---|---|
| Backend/Distributed Messaging & Streaming | ✅ complete | ~100k words, labs, Q&A 08a–e; has a duplicate README; `sections/06-aws-infrastructure.md` = real infra evidence |
| Backend/design-patterns | ✅ good | 13 patterns + runnable TS + 4 LLD problems. Missing: Facade, Composite, Iterator, Abstract Factory, notification dispatcher, elevator, splitwise |
| Backend/system-design + System Design/ | 🟡 draft | Framework, 7 concepts, 8 cases + 2 FN cases + a 4k-word study plan |
| Problem Solving/ | 🟡 draft | Overviews OK; 14 `hard.md` are stubs (40–75 words); 0 problems solved; 7 Day PDFs |
| Backend/01,03,04,05,06 | 🟢 good | Notes + cheatsheet + deep-dive |
| Backend/07 laravel, 08 fastapi, 09 kafka | 🟡 | Notes only |
| Backend/02-mongodb, Havey-reporting, JS/vuejs | 🔴 empty | |
| AWS/ | 🔴 thin | 1 note (1.7k words) |
| JS/ | 🟡 thin | React + Node: 1 note each |
| Tropic/ | 🟡 FN-tailored | 14 topic files (JS, TS, Node, MySQL, REST, React, RN, microservices, Docker/K8s, observability); worth keeping in topic folders |
| _Resume/ | 🟡 | Old CLAUDE.md, 1-me memory, tracker, mocks (03 and 05 are stubs), speak files (FN-specific), mcq-bank (100) |
| _Applications/ | archive | FN, welldevs, automatrix; many duplicates in `cv/old` |
| Missing from tree | ⚠️ 47 files | CV archive, LinkedIn screenshots, `study/9-archive` → restore |
| Root | ⚠️ | README describes the old layout; CV PDF duplicated 3×; `.kilo/` (leave) |

---

## 5. Verification (end of MVP)

- `python scripts/health.py` reports:
  - 0 broken links
  - 0 folders without a README
  - 0 paths with spaces outside `99-archive/`
  - 0 "sokrio" hits outside `99-archive/` and `.claude/`
- md5 check: every HEAD file plus every pre-existing file exists in the new tree.
- `find . -type d -empty` returns nothing.
- `lens index && lens search "consistent hashing"` returns `03-system-design/...`. A Bangla query returns relevant chunks. `lens serve` → `GET /stats` returns counts.
- In a new chat, the MCP tool `search_notes` works.
- `DASHBOARD.md` renders the Mermaid pie, xychart and gantt in the VS Code preview.
- `/study-start` and `/study-end` round-trip: the handoff, tracker and dashboard update.
