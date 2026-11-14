---
type: handoff
updated: 2026-11-14
---

# Handoff — শেষ সেশন → পরের সেশন

> প্রতি সেশনের শেষে **পুরোটা ওভাররাইট** করো। History রাখার জায়গা এটা না (সেটা git)।

## প্রেক্ষাপট (স্থির)

- মাস্টার প্ল্যান: [`MASTER-PLAN.md`](../../MASTER-PLAN.md)। এখন **MVP টিয়ার** চলছে, Work 01 → 05 ক্রমে, প্রতিটার পরে থামো (D12)।
- লক্ষ্য: Laravel / Node / Python / AI রোলে এখনই অ্যাপ্লাই; ২–৩ বছরে Senior/Lead।
- Komol নিজে commit করে; Claude push বা co-author লাইন দেবে না (D13)।

## ২০২৬-১১-১৪: কী হলো

- MASTER-PLAN.md লেখা ও অনুমোদিত।
- **Work 01 সম্পূর্ণ:**
  - Claude auto-memory: `user-career-goals`, `user-skill-map`, `feedback-aws-local-first`, `feedback-public-safe-distrosaas`, `project-interviewlens-plan` + `MEMORY.md` ইনডেক্স।
  - রিপো `.claude/memory/`: `MEMORY.md`, `profile.md`, `decisions.md` (D1–D14 + পুরনো H1–H10), `weak-areas.md` (জেনেরিক SE টপিক, ৭ গ্রুপ, Guess কলাম ভরা, `Now` খালি), `interview-log.md`, `handoff.md`।
  - পুরনো `_Resume/1-me/` অক্ষত আছে; Work 04-এ আর্কাইভ হবে। `story-bank.md` Work 04-এ যাবে `10-behavioral-leadership/`-এ।
- **রোল-ভিত্তিক CV (D15):** `_Resume/cv-by-role/`-এ ৩টা `.docx`: `Komol_CV_JS_FullStack`, `Komol_CV_Laravel_Backend`, `Komol_CV_Python_AI_Engineer`। ফরম্যাট বেস CV-র মতো (Noto Sans, A4, ২ পাতা)। জেনারেটর `build-cvs.js` (চালাতে একটা ফোল্ডারে `npm install docx@9.5.1` লাগে)।
  - Python/AI CV-তে নতুন যোগ (সত্যি, কোডে আছে): FastAPI benchmark service, multi-agent Claude Code setup, personal RAG memory প্রজেক্ট।
  - ⚠️ RabbitMQ microservices, Node.js services, payment HMAC: এই দাবিগুলো বেস CV থেকে রাখা হয়েছে, কিন্তু Truth Audit-এ কোড-প্রমাণ মেলেনি। পাঠানোর আগে Komol ঠিক করবে।
- **CV v2 (D16):** তিনটা CV আবার লেখা, ATS-friendly। JS CV-তে PHP/Laravel নেই (শুধু "Also" লাইনে); Python+AI CV-তে Django/Flask/FastAPI + LangChain/RAG/sklearn + React/Vue। ৮টা নতুন প্রজেক্ট এখনো বানানো বাকি (`// BUILD`)।
- **কমন কভার লেটার:** `_Resume/cv-by-role/Komol_Cover_Letter_Common.docx` (১ পাতা; জার্নি → প্রভাব → প্যাশন + এখনকার চেষ্টা → লক্ষ্য)। হলুদ অংশ প্রতি কোম্পানিতে বদলাতে হবে: তারিখ, কোম্পানি, রোল, "কেন এই কোম্পানি"। জেনারেটর `build-cover-letter.js`। শুধু যাচাই-করা দাবি আছে (RabbitMQ/payment/Node নেই)।
- **ছোট কভার লেটার:** `Komol_Cover_Letter_Short.docx` (~২০০ শব্দ; ৪টা key point: Journey, Impact, How I work, Goal)। জেনারেটর `build-cover-letter-short.js`। লম্বাটা (`_Common`) রাখা আছে।
- **গল্প-ভিত্তিক কভার লেটার (v3, মূল):** `Komol_Cover_Letter_Story.docx` (~৩৮০ শব্দ, বুলেট নেই; শুরু → "code is a promise" শিক্ষা → স্কেল + প্রভাব → নিজে থেকে শেখা → লক্ষ্য; পুরো জেনেরিক: তারিখ, কোম্পানি, রোল বা কেন-এই-কোম্পানি অংশ নেই, Komol এগুলো কখনো ব্যবহার করবে না)। Short ভার্সনকে Komol ৩/১০ দিয়েছে: খুব chatbot-এর মতো। জেনারেটর `build-cover-letter-story.js`।
- **কমন CV:** `Komol_CV_Software_Engineer_Common.docx` (২ পাতা, ATS; সব স্ট্যাক + AI; শুধু আসল প্রজেক্ট, কোনো `// BUILD` নেই)। টপ কোম্পানি/জেনারেল আবেদনের জন্য। `build-cvs.js` এখন ৪টা CV বানায়।
- **Work 02 সম্পূর্ণ:**
  - রুট `CLAUDE.md`: session protocol, folder rules (টার্গেট লেআউট + ট্রানজিশন নোট), Answer Pattern, Honesty + Public-safe, frontmatter spec, memory, commands, Do Not। প্যারেন্ট Sokrio CLAUDE.md-এর নিয়ম এখানে প্রযোজ্য নয় বলে স্পষ্ট লেখা।
  - `.claude/settings.json`: `enabledMcpjsonServers: ["lens-brain"]`, স্ক্রিপ্ট/lens/MCP টুলের permission, `git push` আর `~/code/sokrio/sokrio-*`-এ Edit/Write deny।
  - `.claude/templates/`: topic, sd-case, aws-module, problem, mcq-bank, folder-readme।
  - `.claude/commands/`: study-start, study-end, gen-topic, health-check, log-interview, ask। প্রতিটায় "এখনো নেই" অবস্থার fallback আছে (Work 04/05-এর আগে)।
  - ⚠️ Work 05-এর জন্য: MCP সার্ভার রেজিস্ট্রেশন হবে রুট `.mcp.json`-এ (Claude Code project MCP সেখানেই থাকে); settings.json শুধু সেটা enable করে।
  - ⚠️ Work 04 Step 5-এর জন্য: `health.py`-এর "sokrio" চেকে রুট `CLAUDE.md` আর `MASTER-PLAN.md`-ও বাদ দিতে হবে (এগুলোতে `~/code/sokrio` path আছে, স্টাডি কনটেন্ট না)।
- **Work 03 সম্পূর্ণ:** `00-start/roadmap.md` — gantt, দৈনিক টেমপ্লেট + শনি মক/রবি হালকা ছন্দ, Starter লক্ষ্য, W1–W11 সপ্তাহ-ভিত্তিক ফাইল তালিকা (W1 = ২০২৬-১১-১৬ সোমবার, W11 শেষ ২০২৭-০১-৩১), ৮টা `// BUILD` প্রজেক্টের ক্রম (Order API W1–3, RAG W4–7), কোন CV কখন পাঠানো যায়, Product প্রস্তাব (SAA-C03 লক্ষ্য এপ্রিল ২০২৭), চেকপয়েন্ট।
  - অনুমান যেগুলো Komol বদলাতে পারে: আবেদন ৫–১০/সপ্তাহ, MCQ লক্ষ্য ≥ ৭৫%, ≥ ১৫০ সমাধান, Product মাসগুলো।
- কিছুই commit হয়নি।

## পরের সেশনে প্রথম কাজ

1. **Work 04:** restore + dedupe → restructure (move-map script) → link fix → READMEs + frontmatter → `scripts/health.py` → `DASHBOARD.md`। আগে বর্তমান অবস্থা commit করতে Komol-কে মনে করাও। স্পেক MASTER-PLAN §3 Work 04-এ। `00-start/` ইতিমধ্যে আছে (roadmap.md)।
2. তারপর Work 05 (lens-brain RAG)।

## Komol-এর কাছে অপেক্ষমাণ

- CV-র `// BUILD` প্রজেক্টগুলো GitHub-এ বানানো (সবার আগে: JS-এ Multi-Tenant Order API, Python-এ Sales Report Q&A RAG)। Starter রোডম্যাপে (Work 03) যোগ করতে হবে।

- `weak-areas.md`-এর `Now` কলামে নিজের রেটিং (প্রথম `/study-start`-এ)।
- `profile.md` / `decisions.md`-এর `[Komol পূরণ করবে]`: notice period, স্যালারি রেঞ্জ, RabbitMQ/Node CV দাবি।
- Work 04-এর আগে বর্তমান অবস্থা commit করা (ফিরে আসার পরিষ্কার পয়েন্ট)।
