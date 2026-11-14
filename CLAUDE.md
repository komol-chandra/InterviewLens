# InterviewLens — Claude Study Brain

এটা Komol-এর **ইন্টারভিউ ও ক্যারিয়ার প্রস্তুতির ওয়ার্কস্পেস**, কোনো প্রোডাক্ট কোডবেস না।
প্যারেন্ট `~/code/sokrio/.claude/CLAUDE.md`-এর নিয়ম (Laravel skills, module protocol, sprint tracker, sub-agent টেবিল) **এখানে প্রযোজ্য নয়**। শুধু দুটো জিনিস সেখান থেকে বহাল: no `git push`, no Claude co-author line।

- মাস্টার প্ল্যান (MVP শেষ হওয়া পর্যন্ত একমাত্র source of truth): [`MASTER-PLAN.md`](MASTER-PLAN.md)
- স্থির সিদ্ধান্ত D1–D16: [`.claude/memory/decisions.md`](.claude/memory/decisions.md)। **আবার জিজ্ঞেস করবে না।**

---

## Session Protocol (MANDATORY)

**শুরুতে** (বা `/study-start`):
1. `.claude/memory/handoff.md` — গতবার কোথায় থামলাম, পরের প্রথম কাজ
2. `00-start/today.md` + `.claude/memory/weak-areas.md` — আজকের ব্লক কোথা থেকে আসবে
3. নতুন কিছু লেখার আগে আগে থেকে আছে কি না খোঁজো: `/ask` (lens-brain RAG) → না থাকলে `grep`। অনেক ফাইল একে একে খুলবে না।
4. প্ল্যানের Work item চললে: MASTER-PLAN-এর সেই সেকশন পড়ো। **প্রতিটা Work item শেষে থামো, "continue"-এর অপেক্ষা করো (D12)।**

**শেষে** (বা `/study-end`):
1. `00-start/tracker.md`, `weak-areas.md`, `DASHBOARD.md` (frontmatter সংখ্যা) আপডেট
2. `handoff.md` **ওভাররাইট** (history রাখে না, সেটা git)
3. স্থায়ী তথ্য বদলালে (লক্ষ্য, রোল, নিয়ম) Claude auto-memory আপডেট — স্টাডি স্টেট সেখানে যায় না (D9)
4. `lens index` (lens-brain থাকলে)
5. Commit করবে না। Komol নিজে commit করে (D13)। শুধু commit message সাজেস্ট করতে পারো।

---

## Folder Rules

টার্গেট লেআউট (Work 04-এর পরে)। ফোল্ডার = বিষয়; প্রতিটা ফোল্ডারে `README.md` বাধ্যতামূলক।

| ফোল্ডার | কী যায় | টেমপ্লেট |
|---|---|---|
| `00-start/` | `today.md`, `roadmap.md`, `tracker.md`, `health-report.md` | — |
| `01-problem-solving/` | প্যাটার্ন-ভিত্তিক প্রবলেম (`NN-pattern/easy\|medium\|hard.md`) | `problem.md` |
| `02-cs-fundamentals-mcq/` | OS, networking, DBMS, OOP, complexity, code-output, aptitude MCQ ব্যাংক | `mcq-bank.md` |
| `03-system-design/` | concepts + cases | `topic.md`, `sd-case.md` |
| `04-design-patterns-lld/` | GoF patterns + LLD problems | `topic.md` |
| `05-backend/` | Laravel, PHP, DB, Redis, messaging, FastAPI, Node | `topic.md` |
| `06-aws-devops/` | AWS 00–16, Docker/K8s, CI/CD, observability | `aws-module.md` |
| `07-ai-engineering/` | ML foundations + applied LLM | `topic.md` |
| `08-frontend-nextjs/` | JS/TS, React, Next.js | `topic.md` |
| `09-real-world-cases/` | DistroSaaS-এর আসল সমস্যা, জেনেরিক করে লেখা | `sd-case.md` |
| `10-behavioral-leadership/` | story bank, pitch, HR উত্তর | — |
| `11-mocks/` | প্রতিটা চালানো মকের রেকর্ড | — |
| `12-career/` | CV, cover letter, `applications.md` | — |
| `99-archive/` | শেষ হওয়া রাউন্ড, পুরনো প্ল্যান, restored-from-git — **শুধু পড়া** | — |

- নাম: নম্বরযুক্ত kebab-case, **স্পেস নেই**; PDF/ছবি/docx → সেই ফোল্ডারের `assets/` (D1)।
- ফোল্ডার/ফাইলের নম্বর কখনো রিইউজ বা শিফট করবে না; নতুনটা শেষে যোগ হয়।
- নতুন TODO.md বানাবে না। অগ্রগতি থাকে শুধু `00-start/tracker.md` + `DASHBOARD.md`-এ।
- কোম্পানি-নির্দিষ্ট প্রেপ (`<company>-<round>`) শেষ হলে `99-archive/`-এ যায়; জেনেরিক টপিক কখনো কোম্পানি ফোল্ডারে ডুপ্লিকেট হবে না।

> **ট্রানজিশন নোট:** Work 04 শেষ না হওয়া পর্যন্ত পুরনো ফোল্ডার (`Backend/`, `Problem Solving/`, `System Design/`, `AWS/`, `JS/`, `Tropic/`, `_Resume/`, `_Applications/`) আছে। ম্যাপিং MASTER-PLAN §3 Work 04 Step 2-এ। নতুন ফাইল আগেই টার্গেট path-এ বানাতে হলে Komol-কে জিজ্ঞেস করো।

---

## Answer Pattern (কনটেন্ট জেনারেশনের নিয়ম)

নতুন স্টাডি ফাইল সবসময় `.claude/templates/`-এর একটা টেমপ্লেট থেকে (`/gen-topic`):

| ফাইলের ধরন | টেমপ্লেট | মূল কাঠামো |
|---|---|---|
| জেনেরিক টপিক (Laravel, DB, Redis, React, AI…) | `topic.md` | theory → example → DistroSaaS link → interview Q&A → 🔗 story ID |
| SD case / real-world case | `sd-case.md` | requirements → estimation → API → data model → HLD → deep dive → trade-offs + DistroSaaS relates |
| AWS মডিউল | `aws-module.md` | সহজ theory → DistroSaaS today `[inferred]` → target (mermaid) → **LOCAL LAB** → free-tier lab + teardown → SAA points → Q&A → ask-your-team |
| Problem solving | `problem.md` | pattern → approach → **PHP** → Python → complexity → mistakes |
| MCQ ব্যাংক | `mcq-bank.md` | Q, options, answer, ১-লাইন why, trap tag |
| ফোল্ডার README | `folder-readme.md` | frontmatter + intro + file table + what's missing |

**ভাষা (D2):** ব্যাখ্যা বাংলায়; টেকনিক্যাল টার্ম ইংরেজিতে (Index, Event Loop, Idempotency); **"🎤 Say this in interview" লাইন ইংরেজিতে**, ১–৩ বাক্য, মুখে বলার মতো।
**কোড (D3):** problem solving-এ PHP আগে, তারপর Python। LLD/Node/AI-তে TS বা Python, যেটা মানায়।
**অডিয়েন্স:** ~৪ বছরের ব্যাকএন্ড ইঞ্জিনিয়ার। বেসিক সংজ্ঞায় সময় নষ্ট না করে practical গভীরতায় যাও; কিন্তু AWS/AI-তে শূন্য থেকে, সহজ ভাষায়, লোকাল ল্যাব আগে (D5)।
**DistroSaaS link:** প্রতিটা প্রশ্নের শেষে `🔗 DistroSaaS:` — এক লাইনে Komol-এর কোন কাজ এই উত্তরের প্রমাণ, স্টোরি ID দিয়ে (`S2`)। মিল না থাকলে সৎভাবে: "সরাসরি অভিজ্ঞতা নেই — এভাবে বলো: …"।
**বাস্তব উদাহরণ:** `~/code/sokrio/*` পড়ে আইডিয়া নাও (**read-only**, কখনো এডিট করবে না), কিন্তু লেখো জেনেরিক প্যাটার্ন হিসেবে।

---

## Honesty + Public-safe (কখনো ভাঙবে না)

**Public-safe (D7)** — `.claude/` আর `99-archive/`-এর বাইরে কোথাও:
- ❌ "Sokrio", ক্লায়েন্ট/টিমমেটের নাম, host, IP, domain, secret, `.env` মান, raw code dump (আসল ফাইল কপি-পেস্ট)
- ✅ "DistroSaaS", জেনেরিক টেবিল/ক্লাস নাম, নিজে লেখা ছোট উদাহরণ কোড
- যাচাই-না-করা infra/prod তথ্যে `[inferred]` ট্যাগ; সেগুলো "ask-your-team" তালিকায় যায়
- ফাইল লেখার পরে চেক: `grep -rni 'sokrio' <file>` → ০ হিট হতে হবে

**Honesty:**
- CV/স্টোরির কোনো সংখ্যা বা ঘটনা **বানাবে না**। অজানা ডিটেইল → `[Komol পূরণ করবে]`।
- কোডে প্রমাণ নেই এমন দাবি (এখন: RabbitMQ microservices, Node services, payment HMAC) উত্তরে বা CV-তে নতুন করে ব্যবহার করবে না, যতক্ষণ Komol নিশ্চিত না করে।
- `conf` (০–৩) Komol-এর self-rating; Claude শুধু `Guess` দিতে পারে।

---

## Frontmatter Spec

ফোল্ডার `README.md`:
```yaml
---
title: System Design
order: 3
status: draft        # empty | stub | draft | good | complete
tags: [system-design, hld]
updated: 2026-11-14
---
```

টপিক/স্টাডি ফাইল:
```yaml
---
id: sd-case-payment-system   # kebab-case, রিপোতে ইউনিক; কখনো বদলাবে না (MyLens অ্যাপের progress এতে বাঁধা)
title: Payment System
track: system-design         # problem-solving | mcq | system-design | lld | backend | aws | ai | frontend | behavioral | career | mock | plan
type: sd-case                # topic | problem-set | sd-case | mcq-bank | mock | company | plan | note
status: draft                # empty | stub | draft | good | complete
conf: 0                      # ০–৩, Komol-এর self-rating
tier: starter                # mvp | starter | product
tags: [system-design, payments, idempotency]
updated: 2026-11-14
---
```

`track`/`type` MyLens অ্যাপের InterviewLens ট্যাবের জন্য (ফিল্টার, ড্যাশবোর্ড)। অ্যাপে `conf`/status বদলালে সেটা Supabase-এ থাকে, ফাইলে না; ফাইলের `status` = কনটেন্টের অবস্থা।
অপশনাল: `company: <slug>` (কোনো অ্যাপ্লিকেশনের সাথে ডক জুড়তে)।

`status` গাইড: `stub` < ১৫০ শব্দ · `draft` কাঠামো আছে, ফাঁক আছে · `good` ইন্টারভিউতে চলবে · `complete` + Q&A + লাইভ ড্রিল করা।
বিদ্যমান ফাইলে frontmatter যোগ করলে body বদলাবে না।

---

## Memory

| কোথায় | কী | নিয়ম |
|---|---|---|
| `.claude/memory/` | স্টাডি স্টেট: profile, decisions, weak-areas, interview-log, handoff | টাইপ টেবিল [`MEMORY.md`](.claude/memory/MEMORY.md)-এ। `handoff` ছাড়া সব append/update, মুছবে না, ভুল হলে ~~strike~~ + কারণ |
| Claude auto-memory | স্থায়ী তথ্য: কে, লক্ষ্য, feedback | স্টাডি অগ্রগতি সেখানে না |

Komol কোনো ভুল ধরিয়ে দিলে → auto-memory-তে `feedback` এন্ট্রি (Why + How to apply)।

---

## Commands

| কমান্ড | কাজ |
|---|---|
| `/study-start` | handoff + today + weak-areas + DASHBOARD পড়ে দিনের ব্লক প্রস্তাব |
| `/study-end` | tracker, weak-areas, handoff, DASHBOARD, auto-memory আপডেট; RAG re-index |
| `/gen-topic <template> <path>` | টেমপ্লেট থেকে একটা ফাইল; public-safe চেক |
| `/health-check` | `scripts/health.py` → `00-start/health-report.md` |
| `/log-interview` | একটা রাউন্ড → interview-log, weak-areas, applications pipeline |
| `/ask <question>` | lens-brain RAG-এ খোঁজো, অনেক ফাইল খোলার আগে |

## Do Not

- `git push`, commit, বা Claude co-author/attribution লাইন — কখনো না (D13)
- `~/code/sokrio/*`-এ কোনো এডিট — শুধু পড়া
- একসাথে একাধিক Work item — একটা শেষ, থামো (D12)
- `99-archive/`-এ নতুন কনটেন্ট লেখা
- এক তথ্য দুই জায়গায় (মেমরি vs স্টাডি কনটেন্ট)
- AWS-এ লোকাল ল্যাব ছাড়া সরাসরি কনসোল স্টেপ, বা teardown ছাড়া free-tier ল্যাব
