// Builds 3 role-specific CVs in the same format as Komol_CV_Software_Engineer.pdf
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ExternalHyperlink, AlignmentType,
  LevelFormat, BorderStyle, TabStopType,
} = require("docx");

const OUT = process.argv[2] || ".";
const FONT = "Noto Sans";
const NAVY = "1F2B4D";
const LINK = "1155CC";
const PAGE_W = 11906, MARGIN = 850; // A4, ~0.59in margins
const RIGHT = PAGE_W - MARGIN * 2;
const SZ = 20; // 10pt body

const r = (text, o = {}) => new TextRun({ text, font: FONT, size: SZ, ...o });

const header = (title) => [
  new Paragraph({ spacing: { after: 20 }, children: [r("KOMOL CHANDRA DEVNATH", { bold: true, size: 40, color: NAVY })] }),
  new Paragraph({ spacing: { after: 0 }, children: [r(title, { bold: true, size: 22 })] }),
  new Paragraph({ spacing: { after: 0 }, children: [r("Dhaka, Bangladesh | +880 1874303467 | komolnath67@gmail.com")] }),
  new Paragraph({
    spacing: { after: 60 },
    children: [
      r("GitHub: "),
      new ExternalHyperlink({ link: "https://github.com/komol-chandra", children: [r("github.com/komol-chandra", { color: LINK, underline: {} })] }),
      r(" | LinkedIn: "),
      new ExternalHyperlink({ link: "https://linkedin.com/in/komol-chandra", children: [r("linkedin.com/in/komol-chandra", { color: LINK, underline: {} })] }),
    ],
  }),
];

const section = (t) => new Paragraph({
  spacing: { before: 200, after: 80 },
  keepNext: true,
  border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: NAVY, space: 1 } },
  children: [r(t, { bold: true, size: 24, color: NAVY })],
});

const para = (t, after = 100) => new Paragraph({ spacing: { after, line: 252 }, children: [r(t)] });

const skill = ([label, text]) => new Paragraph({
  spacing: { after: 20, line: 252 },
  children: [r(label + ": ", { bold: true }), r(text)],
});

const bullet = (b) => new Paragraph({
  numbering: { reference: "bul", level: 0 },
  spacing: { after: 10, line: 252 },
  children: typeof b === "string" ? [r(b)] : [r(b[0] + ": ", { bold: true }), r(b[1])],
});

const roleLine = (left, right, italic) => {
  const out = [new Paragraph({
    spacing: { before: 120, after: 0 },
    keepNext: true,
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
    children: [r(left, { bold: true }), r("\t" + right, { bold: true })],
  })];
  if (italic) out.push(new Paragraph({ spacing: { after: 20 }, children: [r(italic, { italics: true })] }));
  return out;
};

const eduLine = (left, right, sub) => [
  new Paragraph({
    spacing: { before: 100, after: 0 },
    keepNext: true,
    tabStops: [{ type: TabStopType.RIGHT, position: RIGHT }],
    children: [r(left, { bold: true }), r("\t" + right, { bold: true })],
  }),
  new Paragraph({ spacing: { after: 0 }, children: [r(sub)] }),
];


// =====================================================================
// CONTENT — v2 (2026-11-14): ATS-friendly, one stack leads per CV.
// Rule: company bullets stay true. JS/Python CVs use stack-neutral wording
// (no PHP/Laravel named) instead of claiming another framework.
// Projects marked BUILD in comments must exist on GitHub before sending.
// =====================================================================

const SOKRIO_TAG = "Multi-tenant distribution, supply chain and order management SaaS serving 100+ enterprise clients across 40+ industries.";

const EDU = [
  ["Bachelor of Science in Computer Science and Engineering", "2022 – 2025", "Bangladesh University of Business and Technology (BUBT), Dhaka"],
  ["Diploma in Engineering, Data Telecommunication and Networking", "2016 – 2020", "Feni Computer Institute, Feni"],
];
const CERTS = "AWS Fundamentals (2025) | Problem Solving and Data Structures (2023) | Frontend Development with React.js and Next.js (2022) | Software Engineering Fundamentals (2020)";

// ---------------------------------------------------------------- JS
const JS = {
  file: "Komol_CV_JS_FullStack.docx",
  title: "Full-Stack JavaScript Engineer | Node.js, NestJS, Next.js, React, TypeScript",
  summary: [
    "Full-Stack JavaScript Engineer with 5+ years of backend and API experience and 3+ years of React and TypeScript, building a multi-tenant SaaS used by 100+ enterprise clients. Led a frontend rewrite to React, Next.js, Redux Toolkit and TypeScript in 2 months that raised user engagement 30%, built Node.js/Express services and background workers, and designed the REST APIs behind a React Native field-force app. Made reports up to 85% faster and cut production issue resolution time by 65%.",
    "Builds end-to-end features in TypeScript: NestJS and Express APIs, Next.js App Router frontends, queues, caching and tests. Writes technical specs, breaks large features into small, testable pieces and works closely with product, UX and international clients.",
  ],
  skills: [
    ["Languages", "JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3"],
    ["Backend", "Node.js, Express.js, NestJS, REST APIs, GraphQL (basics), WebSockets (Socket.IO), JWT, RBAC, BullMQ, background workers, webhooks"],
    ["Frontend", "React.js, Next.js (App Router, SSR, ISR), Redux Toolkit, TanStack Query, React Native, Tailwind CSS, SASS, Ant Design, Vue.js, Figma handoff"],
    ["Databases and ORMs", "MySQL, PostgreSQL, MongoDB, Redis, Prisma, TypeORM, Mongoose"],
    ["Testing", "Jest, Supertest, React Testing Library, Postman, TDD"],
    ["DevOps and Cloud", "Docker, Docker Compose, GitHub Actions CI/CD, AWS (EC2, S3, RDS, CloudWatch), Nginx, Linux, Git"],
    ["Architecture", "Microservices, event-driven (RabbitMQ, Kafka basics), multi-tenant SaaS, caching, SLIs/SLOs, observability"],
    ["Also", "PHP, Laravel, Python, FastAPI; AI-assisted development with Claude Code (multi-agent workflows)"],
  ],
  sokrio: [
    ["Frontend modernization", "Led the Vue.js to React, Next.js, Redux Toolkit and TypeScript (SASS) rewrite of the tenant and admin apps in 2 months, rebuilt key user journeys from Figma designs with UX and product, and set the component, folder-structure and code-review standards the team adopted. User engagement rose 30%."],
    ["Node.js services", "Built Node.js/Express services, background workers and developer tooling in JavaScript and TypeScript alongside the core REST API."],
    ["REST APIs for mobile and integrations", "Designed the REST APIs behind the mobile field-force app and contributed React Native screens and fixes, plus queue-based sync for legacy enterprise clients; troubleshot integrations directly with client teams."],
    ["Microservices migration", "Led the migration of a legacy monolith to an event-driven platform: core REST API, separate React tenant and admin apps, and Report, Notification and SOP services over RabbitMQ with MongoDB and Redis. Ran both systems in parallel for a zero-downtime cutover, cutting server load by about 20%."],
    ["Reporting and performance", "Built heavy reports over millions of records with MongoDB aggregation pipelines, queue workers (retries, dead-letter queues, priority jobs) and Redis caching, cutting load times by up to 85% with 99.9%+ report-generation uptime."],
    ["Multi-tenancy and security", "Built tenant database isolation, tenant-scoped queries and territory-scoped RBAC from scratch, with zero cross-tenant data leakage across 100+ tenants."],
    ["Observability and on-call", "Primary 24/7 on-call engineer for six production apps; tracked SLIs/SLOs (availability, API latency, error rate) with APM, Grafana/Prometheus, AWS CloudWatch and structured logging; cut issue resolution time by 65%."],
    ["Field force and van sales", "Built task, van sales, vehicle feedback and attendance modules with real-time sync and GPS-spoofing fraud detection, contributing to 27% company revenue growth."],
    ["Docker, CI/CD and AI-assisted delivery", "Containerized services and built CI/CD pipelines (about 40% faster deployments); use Claude Code daily with custom skills and sub-agents for code, tests and docs."],
  ],
  softarch: [
    "Built a multi-store e-commerce platform (Vue.js, REST API, MySQL) with Point of Sale integration, barcode inventory and real-time stock tracking, cutting manual stock reconciliation by about 60%.",
    "Integrated card, bKash, Nagad and cash-on-delivery payments with webhook-driven order status updates, wishlists and a persistent cart.",
    "Set up Dockerized CI/CD pipelines (lint, test, deploy on every push) and managed Linux VPS servers for zero-downtime releases.",
  ],
  amcoders: [
    "Designed, built and shipped a multi-tenant SaaS product sold on the CodeCanyon marketplace, with RBAC, a REST API and a Vue.js frontend.",
    "Integrated payment gateways with a full subscription lifecycle and verified payment webhooks; promoted from intern to Software Engineer within 1 month.",
  ],
  projects: [
    ["Multi-Tenant Order Management API", "NestJS, TypeScript, PostgreSQL, Prisma, Redis, BullMQ, Docker. Tenant-isolated REST API for products, orders and approvals with JWT + RBAC, queue-based report exports, Swagger docs and Jest/Supertest tests in GitHub Actions."], // BUILD
    ["Sales Analytics Dashboard", "Next.js App Router, React Server Components, TypeScript, TanStack Query, Tailwind CSS. Server-rendered dashboards with filters, charts, CSV export and role-based pages on top of the order API."], // BUILD
    ["Real-Time Field Tracking", "Node.js, Express, Socket.IO, MongoDB geospatial queries, React. Live map of field agents with check-in events and a geofence alert service."], // BUILD
    ["Supply Chain Distribution System", "Node.js, Express.js and React.js platform that manages products, customers and orders through RESTful APIs."],
  ],
};

// ---------------------------------------------------------------- LARAVEL
const LARAVEL = {
  file: "Komol_CV_Laravel_Backend.docx",
  title: "Backend Software Engineer | PHP, Laravel, MySQL, Redis, Multi-Tenant SaaS",
  summary: [
    "Backend Software Engineer with 5+ years of PHP and Laravel experience, building the core API of a multi-tenant SaaS used by 100+ enterprise clients. Built landlord/tenant database isolation and territory-scoped RBAC with zero cross-tenant data leakage, heavy reporting over millions of records with Laravel queues, MongoDB and Redis (up to 85% faster), and led a Laravel monolith to event-driven microservices migration. Cut production issue resolution time by 65% and contributed to 27% company revenue growth.",
    "Writes technical specs and phased plans before each module, ships with PHPUnit tests and works closely with product, UX and international clients. Comfortable across the stack with React, TypeScript and Node.js when a feature needs it.",
  ],
  skills: [
    ["Languages", "PHP 8, SQL, JavaScript (ES6+), TypeScript, Python"],
    ["Laravel", "Laravel 8 to 10, Eloquent ORM, Queues and Jobs, Events and Listeners, Sanctum, Policies and Gates, Middleware, Scheduler, Service Container, Laravel Telescope"],
    ["APIs and Integrations", "REST APIs, API versioning, SOAP, webhooks, payment gateways, rate limiting, multi-tenant SaaS, RBAC"],
    ["Databases", "MySQL (indexing, EXPLAIN, query optimization, data modeling), MongoDB (aggregation pipelines), Redis (caching, queues)"],
    ["Testing", "PHPUnit, feature and unit tests, TDD, Postman"],
    ["DevOps and Cloud", "Docker, Docker Compose, CI/CD, AWS (EC2, S3, RDS, CloudWatch), Nginx, Linux (Ubuntu, Debian), Git"],
    ["Architecture", "Microservices, event-driven (RabbitMQ, Kafka basics), caching strategies, SLIs/SLOs, APM, Grafana/Prometheus"],
    ["Also", "React.js, Next.js, Redux Toolkit, Vue.js, Node.js, FastAPI; AI-assisted development with Claude Code (multi-agent workflows)"],
  ],
  sokrio: [
    ["Multi-tenancy and security", "Built landlord/tenant database isolation in Laravel, tenant-scoped queries and territory-scoped role-based access control (RBAC) from scratch, with zero cross-tenant data leakage across 100+ tenants."],
    ["Reporting and performance", "Built heavy reports over millions of records using MongoDB aggregation pipelines, Laravel queue jobs (retries, dead-letter queues, priority jobs) and Redis caching, cutting report load times by up to 85% with 99.9%+ report-generation uptime."],
    ["MySQL optimization", "Tuned MySQL with composite indexes, EXPLAIN analysis and Eloquent N+1 elimination; moved heavy reads to MongoDB; designed a polymorphic entity-mapping model and row/cell-level bulk-import validation."],
    ["Microservices migration", "Led the migration of a Laravel 8/Vue.js 2 monolith to an event-driven platform: Laravel core REST API, separate React tenant and admin apps, and Report, Notification and SOP services over RabbitMQ with MongoDB and Redis. Ran both systems in parallel for a zero-downtime cutover, cutting server load by about 20%."],
    ["Laravel modules", "Built approval workflows, global settings, a promotion engine, primary and secondary orders with Kafka events, and territory/department hierarchies as reusable Laravel modules."],
    ["REST APIs and integrations", "Designed the REST APIs behind the mobile field-force app, plus SOAP endpoints and queue-based sync for legacy enterprise clients; added named rate limiters for SMS resend."],
    ["Payments", "Designed the payment gateway integration for billing and subscriptions: initiation, webhooks, retries, auto-reconciliation and receipts, with HMAC signature verification and idempotency keys."],
    ["Observability and on-call", "Primary 24/7 on-call engineer for six production apps; tracked SLIs/SLOs with APM, Grafana/Prometheus, AWS CloudWatch, Laravel Telescope and structured logging; cut issue resolution time by 65%."],
    ["Testing and delivery", "Made PHPUnit tests a required phase of every feature and built Docker CI/CD pipelines, making deployments about 40% faster with no environment-mismatch incidents."],
    ["Field force and van sales", "Built Task Manager, Van Sales, Vehicle Feedback and Van Attendance modules with real-time sync and GPS-spoofing fraud detection, contributing to 27% company revenue growth."],
    ["AI-assisted engineering", "Use Claude Code daily with a custom setup of Laravel-specific skills and sub-agents for migrations, services, frontend and tests."],
  ],
  softarch: [
    "Built GirlyShopper, a multi-store e-commerce platform (Laravel, Vue.js, MySQL) with Point of Sale integration, barcode inventory and real-time stock tracking, cutting manual stock reconciliation by about 60%.",
    "Integrated card, bKash, Nagad and cash-on-delivery payments with webhook-driven order status updates.",
    "Built a grocery delivery platform in Laravel with multi-store inventory, advance orders and MySQL tuning for peak volumes.",
    "Managed Linux VPS servers and set up Dockerized CI/CD pipelines (lint, test, deploy on every push) for zero-downtime releases.",
  ],
  amcoders: [
    "Designed, built and shipped a multi-tenant Laravel SaaS product sold on the CodeCanyon marketplace, with RBAC, a REST API and a Vue.js frontend.",
    "Integrated payment gateways with a full subscription lifecycle (trial, renewal, cancellation), HMAC-verified webhooks and encrypted billing storage; promoted from intern to Software Engineer within 1 month.",
  ],
  projects: [
    ["Laravel Multi-Tenancy Package", "Laravel 10, PHP 8, MySQL, Pest. Open-source package for database-per-tenant connections, tenant-scoped models and cache keys, with a demo app and CI."], // BUILD
    ["Laravel Report Engine", "Laravel, Redis, Horizon, MongoDB. Queue-based heavy report exports with chunked queries, progress tracking, retries and a cached result store."], // BUILD
    ["Engineering RAG Memory (Python)", "Local hybrid-search memory (SQLite FTS5 + vector embeddings) for AI coding sessions, served to Claude Code as an MCP server."],
  ],
};

// ---------------------------------------------------------------- PYTHON + AI
const PYAI = {
  file: "Komol_CV_Python_AI_Engineer.docx",
  title: "Python and AI Software Engineer | FastAPI, Django, LLMs, RAG, React",
  summary: [
    "Python and AI Software Engineer with 5+ years of backend experience, building data-heavy services for a multi-tenant SaaS used by 100+ enterprise clients. Built a FastAPI benchmark and market-intelligence service over MongoDB and MySQL, heavy reporting pipelines over millions of records (up to 85% faster), and a hybrid-search RAG system (BM25 + vector embeddings) served to an LLM over MCP. Co-author of submitted research on emotion detection from customer reviews using LLMs.",
    "Works across the stack: Python APIs (FastAPI, Django, Flask), LLM applications (RAG, agents, tool use, prompt design, evaluation) and React or Vue frontends. Writes technical specs, ships with pytest tests and works closely with product and international clients.",
  ],
  skills: [
    ["Languages", "Python, SQL, JavaScript (ES6+), TypeScript"],
    ["Python Frameworks", "FastAPI, Django, Django REST Framework, Flask, Pydantic, Celery, SQLAlchemy, pytest, uv"],
    ["AI and LLM", "LLM APIs (OpenAI, Anthropic Claude), LangChain, Hugging Face Transformers, RAG, embeddings, hybrid search (BM25 + vector, Reciprocal Rank Fusion), vector databases (pgvector, sqlite-vec), agents and tool use, Model Context Protocol (MCP), prompt engineering, LLM evaluation"],
    ["Machine Learning and Data", "scikit-learn, pandas, NumPy, NLP, sentiment analysis, classification, regression, clustering, statistical analysis, data mining"],
    ["Databases", "PostgreSQL, MySQL, MongoDB (aggregation pipelines), Redis, SQLite (FTS5)"],
    ["Frontend", "React.js, Next.js, Redux Toolkit, Vue.js, TypeScript, Tailwind CSS, Ant Design"],
    ["DevOps and Cloud", "Docker, Docker Compose, GitHub Actions CI/CD, AWS (EC2, S3, RDS, CloudWatch), Nginx, Linux, Git"],
    ["Architecture", "REST APIs, JWT, microservices, event-driven (RabbitMQ, Kafka basics), multi-tenant SaaS, caching, observability"],
  ],
  sokrio: [
    ["Python and FastAPI service", "Built a FastAPI benchmark and market-intelligence service over MongoDB and MySQL: an internal benchmark API plus a client-facing, JWT-authenticated API with a standard response envelope, per-request tenant resolution and Redis caching with timing instrumentation on every route."],
    ["AI-assisted engineering with multi-agent workflows", "Designed and use daily a custom Claude Code setup: domain skills, specialised sub-agents (database, backend, frontend, tests, review) with a model chosen per task, and hooks that inject project memory from a RAG index, so features ship faster with tests and docs."],
    ["Data pipelines and reporting", "Built heavy reports over millions of records with MongoDB aggregation pipelines, queue workers (retries, dead-letter queues, priority jobs) and Redis caching, cutting load times by up to 85% with 99.9%+ report-generation uptime."],
    ["Data modeling and query optimization", "Tuned MySQL with composite indexes, EXPLAIN analysis and N+1 elimination; moved heavy reads to MongoDB; designed row/cell-level bulk-import validation."],
    ["Frontend", "Led the rewrite of the tenant and admin apps to React, Next.js, Redux Toolkit and TypeScript in 2 months; user engagement rose 30%."],
    ["Microservices and multi-tenancy", "Led a monolith to event-driven microservices migration (RabbitMQ, MongoDB, Redis) with a zero-downtime cutover, and built tenant isolation and RBAC with zero cross-tenant data leakage across 100+ tenants."],
    ["Observability and on-call", "Primary 24/7 on-call engineer for six production apps; tracked SLIs/SLOs with APM, Grafana/Prometheus, AWS CloudWatch and structured logging; cut issue resolution time by 65%."],
    ["Testing and delivery", "Wrote pytest tests for service and API logic and built Docker CI/CD pipelines, making deployments about 40% faster."],
  ],
  softarch: [
    "Built a multi-store e-commerce platform (Vue.js, REST API, MySQL) with Point of Sale integration, barcode inventory and real-time stock tracking, cutting manual stock reconciliation by about 60%.",
    "Integrated card, bKash, Nagad and cash-on-delivery payments with webhook-driven order status updates.",
    "Set up Dockerized CI/CD pipelines and managed Linux VPS servers for zero-downtime releases.",
  ],
  amcoders: [
    "Designed, built and shipped a multi-tenant SaaS product sold on the CodeCanyon marketplace, with RBAC, a REST API and a Vue.js frontend; promoted from intern to Software Engineer within 1 month.",
  ],
  projects: [
    ["Engineering RAG Memory", "Python, SQLite FTS5, sqlite-vec, fastembed, MCP. Indexes docs, session transcripts and git history with hybrid search (BM25 + embeddings, Reciprocal Rank Fusion), redacts secrets before indexing and serves search to Claude Code as an MCP server on CPU only."],
    ["Sales Report Q&A Assistant (RAG)", "FastAPI, LangChain, PostgreSQL + pgvector, Claude/OpenAI API, React. Answers natural-language questions over sales reports with cited sources, guardrails and an evaluation set for retrieval and answer quality."], // BUILD
    ["Field Agent AI Assistant", "Django, Django REST Framework, Celery, LLM tool use, Vue.js. Agent that plans daily visits and drafts orders by calling order, stock and route tools, with human approval before any write."], // BUILD
    ["Demand Forecasting API", "Flask, pandas, scikit-learn. Forecasts product demand per territory from order history, with feature engineering, model comparison and a REST endpoint for predictions."], // BUILD
    ["Research (submitted, under review)", "Emotion Detection from Customer Reviews using LLMs, Sentiment Analysis and NLP; Bangladesh Suicide Case Pattern Analysis using Statistical Analysis and Data Mining."],
  ],
};

// ---------------------------------------------------------------- COMMON (general, top companies)
// Only real, existing projects here: no // BUILD items.
const COMMON = {
  file: "Komol_CV_Software_Engineer_Common.docx",
  title: "Software Engineer | Backend, Full-Stack and AI | PHP, Node.js, Python, React, TypeScript",
  summary: [
    "Software Engineer with 5+ years of experience building production systems, most recently the core of a multi-tenant SaaS platform that 100+ enterprise clients across 40+ industries use to run their distribution business. Rebuilt heavy reporting over millions of records to run up to 85% faster, designed tenant isolation with zero cross-tenant data leakage, led a React, Next.js and TypeScript rewrite in 2 months (+30% engagement), and cut production issue resolution time by 65% as primary on-call engineer.",
    "Owns features end to end, from technical specification and data model to APIs, frontend, tests, deployment and on-call. Works across backend (Laravel, Node.js, FastAPI), frontend (React, Next.js) and applied AI (LLMs, RAG, multi-agent workflows), and keeps raising the bar through system design, AWS and AI engineering.",
  ],
  skills: [
    ["Languages", "PHP, JavaScript (ES6+), TypeScript, Python, SQL"],
    ["Backend", "Laravel, Node.js, Express.js, NestJS, FastAPI, Django, Flask, REST APIs, webhooks, queues and background jobs, JWT, RBAC"],
    ["Frontend", "React.js, Next.js, Redux Toolkit, React Native, Vue.js, Tailwind CSS, SASS, Ant Design"],
    ["AI and Data", "LLM APIs (Claude, OpenAI), RAG, embeddings, hybrid search (BM25 + vector), agents and tool use, Model Context Protocol (MCP), LangChain, scikit-learn, pandas, NLP"],
    ["Databases", "MySQL (indexing, query optimization, data modeling), PostgreSQL, MongoDB (aggregation pipelines), Redis"],
    ["Cloud and DevOps", "AWS (EC2, S3, RDS, CloudWatch), Docker, Docker Compose, CI/CD, Nginx, Linux, Git"],
    ["Architecture", "Multi-tenant SaaS, microservices, event-driven systems (RabbitMQ, Kafka basics), caching, SLIs/SLOs, observability"],
    ["Testing", "PHPUnit, pytest, Jest, TDD, Postman"],
  ],
  sokrio: [
    ["Multi-tenancy and security", "Built landlord/tenant database isolation, tenant-scoped queries and territory-scoped role-based access control (RBAC) from scratch, with zero cross-tenant data leakage across 100+ tenants."],
    ["Reporting and performance", "Built heavy reports over millions of records using MongoDB aggregation pipelines, queue jobs (retries, dead-letter queues, priority jobs) and Redis caching, cutting report load times by up to 85% with 99.9%+ report-generation uptime."],
    ["Frontend modernization", "Led the Vue.js to React, Next.js, Redux Toolkit and TypeScript rewrite of the tenant and admin apps in 2 months, rebuilt key user journeys from Figma with UX and product, and set the component and code-review standards the team adopted. User engagement rose 30%."],
    ["Python and FastAPI service", "Built a FastAPI benchmark and market-intelligence service over MongoDB and MySQL, with an internal API, a JWT-authenticated client API, per-request tenant resolution and Redis caching with timing instrumentation."],
    ["Microservices migration", "Led the migration of a Laravel/Vue.js monolith to an event-driven platform with a core REST API, separate React apps and Report, Notification and SOP services over RabbitMQ, MongoDB and Redis; ran both systems in parallel for a zero-downtime cutover, cutting server load by about 20%."],
    ["Observability and on-call", "Primary 24/7 on-call engineer for six production apps; tracked SLIs/SLOs (availability, API latency, error rate) with APM, Grafana/Prometheus, AWS CloudWatch and structured logging; cut issue resolution time by 65%."],
    ["Data modeling and MySQL", "Tuned MySQL with composite indexes, EXPLAIN analysis and N+1 elimination, moved heavy reads to MongoDB, and designed a polymorphic entity-mapping model with row/cell-level bulk-import validation."],
    ["Field force and van sales", "Built task, van sales, vehicle feedback and attendance modules with real-time sync and GPS-spoofing fraud detection, contributing to 27% company revenue growth."],
    ["Specs, collaboration and delivery", "Write a technical specification (data model, API contract, UI flow, test plan) before each module; work with international clients and distributed teams in English; containerized services and built CI/CD pipelines that made deployments about 40% faster."],
    ["AI-assisted engineering", "Designed and use daily a custom Claude Code setup with domain skills, specialised sub-agents (database, backend, frontend, tests, review) and hooks that inject project memory from a RAG index."],
  ],
  softarch: [
    "Built GirlyShopper, a multi-store e-commerce platform (Laravel, Vue.js, MySQL) with Point of Sale integration, barcode inventory and real-time stock tracking, cutting manual stock reconciliation by about 60%.",
    "Integrated card, bKash, Nagad and cash-on-delivery payments with webhook-driven order status updates.",
    "Managed Linux VPS servers and set up Dockerized CI/CD pipelines (lint, test, deploy on every push) for zero-downtime releases.",
  ],
  amcoders: [
    "Designed, built and shipped a multi-tenant SaaS product sold on the CodeCanyon marketplace, with RBAC, a REST API and a Vue.js frontend.",
    "Handled buyer bug reports and support, usually resolving issues within 24 hours; promoted from intern to Software Engineer within 1 month.",
  ],
  projects: [
    ["Engineering RAG Memory", "Python, SQLite FTS5, sqlite-vec, fastembed, MCP. Hybrid-search memory (BM25 + embeddings, Reciprocal Rank Fusion) over docs, session transcripts and git history, with secret redaction, served to Claude Code as an MCP server on CPU only."],
    ["Supply Chain Distribution System", "Node.js, Express.js and React.js platform that manages products, customers and orders through RESTful APIs."],
    ["Research (submitted, under review)", "Emotion Detection from Customer Reviews using LLMs, Sentiment Analysis and NLP; Bangladesh Suicide Case Pattern Analysis using Statistical Analysis and Data Mining."],
  ],
};

const CVS = [COMMON, JS, LARAVEL, PYAI];

function build(cv) {
  const children = [
    ...header(cv.title),
    section("SUMMARY"),
    ...cv.summary.map((s, i) => para(s, i === cv.summary.length - 1 ? 0 : 120)),
    section("SKILLS"),
    ...cv.skills.map(skill),
    section("EXPERIENCE"),
    ...roleLine("Software Engineer | Sokrio | Dhaka, Bangladesh", "2023 – Present", SOKRIO_TAG),
    ...cv.sokrio.map(bullet),
    ...roleLine("Junior Software Engineer | SoftArch | Dhaka, Bangladesh", "May 2022 – May 2023"),
    ...cv.softarch.map(bullet),
    ...roleLine("Software Engineer | Am Coders | Dhaka, Bangladesh", "Feb 2021 – Apr 2022"),
    ...cv.amcoders.map(bullet),
    section("PROJECTS"),
    ...cv.projects.map(bullet),
    section("EDUCATION"),
    ...EDU.flatMap(([a, b, c]) => eduLine(a, b, c)),
    section("CERTIFICATIONS"),
    para(CERTS, 0),
  ];

  return new Document({
    creator: "Komol Chandra Devnath",
    title: "Komol Chandra Devnath - CV",
    styles: { default: { document: { run: { font: FONT, size: SZ } } } },
    numbering: {
      config: [{
        reference: "bul",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 360, hanging: 220 } } } }],
      }],
    },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 720, bottom: 720, left: MARGIN, right: MARGIN } } },
      children,
    }],
  });
}

(async () => {
  for (const cv of CVS) {
    fs.writeFileSync(path.join(OUT, cv.file), await Packer.toBuffer(build(cv)));
    console.log("wrote", cv.file);
  }
})();
