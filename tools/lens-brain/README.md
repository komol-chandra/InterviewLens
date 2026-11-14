---
title: "lens-brain"
order: 0
status: good
tags: [tooling, rag]
updated: 2026-11-14
---

# lens-brain: local RAG over the study notes

রিপোর সব নোটে hybrid search (keyword + semantic, বাংলা + ইংরেজি)। Claude Code সেশন অনেক ফাইল খোলার আগে এখানে খোঁজে (`/ask`), আর পরে React অ্যাপ `localhost:8765` থেকে পড়বে।

- **Store:** SQLite ফাইল `~/.local/share/interviewlens-brain/lens.db`। FTS5 (BM25) + `sqlite-vec` (KNN), ফল মেলানো হয় Reciprocal Rank Fusion দিয়ে। Docker বা vector server নেই।
- **Model:** `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` (384-dim, fastembed/ONNX, CPU), cache `~/.cache/interviewlens-brain/models` (~470 MB, প্রথমবার নামে)।
- **MCP:** stdio, রুট `.mcp.json`-এ রেজিস্টার; Claude Code দরকার হলে চালায়, idle-এ RAM ০।

## Commands

রুট থেকে (`lens` PATH-এ না থাকলে `uv run --directory tools/lens-brain lens …`):

| কমান্ড | কাজ |
|---|---|
| `lens index` | incremental: শুধু বদলানো ফাইল আবার chunk + embed, মোছা ফাইল সরায়। `/study-end` এটা চালায় |
| `lens index --full` | সব মুছে নতুন করে (এই মেশিনে ~৭ মিনিট) |
| `lens index --no-embed` | শুধু keyword index (মডেল লাগে না) |
| `lens search "…" [-k 8] [--folder 03-system-design] [--tier starter] [--status draft] [--tags cache] [--fts-only] [--json]` | hybrid search |
| `lens doc <path> [--heading "…"]` | একটা ফাইল বা তার একটা সেকশন |
| `lens weak [--priority 🔴] [-n 15]` | সবচেয়ে দুর্বল টপিক আগে (`Now`, না থাকলে `Guess`) |
| `lens stats [--json]` | ফোল্ডার-ভিত্তিক files / words / stubs / status, index অবস্থা |
| `lens serve [--port 8765]` | FastAPI, শুধু `127.0.0.1` |

`lens` কমান্ড সব জায়গা থেকে চালাতে চাইলে একবার: `uv tool install --editable tools/lens-brain`।

## MCP tools (Claude Code)

| Tool | কখন |
|---|---|
| `search_notes(query, k, folder?, tier?, status?, tags?)` | কিছু লেখার বা অনেক ফাইল খোলার আগে |
| `get_doc(path, heading?)` | একটা ফাইল বা একটা সেকশন (frontmatter JSON প্রথম লাইনে) |
| `list_weak_areas(priority?, folder?, limit)` | দিনের ব্লক বাছতে (`/study-start`) |
| `stats()` | ফোল্ডার সংখ্যা + DASHBOARD frontmatter |

## HTTP API (`lens serve`)

`GET /search?q=&k=&folder=&tier=&status=&track=&tags=&semantic=` · `GET /doc?path=&heading=` · `GET /stats` · `GET /weak-areas` · `POST /reindex?full=&embed=` · `GET /health`। CORS শুধু `localhost` / `127.0.0.1` origin।

## কী index হয়

রিপোর সব `.md`, বাদে: `99-archive/` (চাইলে `--archive` বা `LENS_INCLUDE_ARCHIVE=1`), `assets/`, `tools/`, `scripts/`, `.kilo/`, আর `.claude/`-এর মধ্যে শুধু `.claude/memory/` থাকে।

## ভালো ফল পেতে

- টেকনিক্যাল টার্ম **ইংরেজিতে** লেখো, বাকিটা যেকোনো ভাষায়: `"Event Loop কীভাবে কাজ করে"` ✅, `"ইভেন্ট লুপ"` ❌। নোটগুলো D2 মেনে টার্ম ইংরেজিতে রাখে, তাই বাংলা লিপিতে লেখা টার্ম keyword-এ মেলে না, semantic-এ দুর্বল।
- এক ফাইল থেকে সর্বোচ্চ ২টা সেকশন আসে (বৈচিত্র্যের জন্য)।

## Design notes

- **Chunking:** H1–H3 অনুযায়ী সেকশন (code fence-এর ভেতরের `#` বাদ), ছোট সেকশন জোড়া লাগে, বড়টা ~৮০০ token-এ ভাগ, ৮০ token overlap। প্রতিটা chunk-এ heading trail (`H1 › H2 › H3`)।
- **Embedding windows:** মডেল সর্বোচ্চ ১২৮ word-piece পড়ে, তাই প্রতিটা chunk ~৪২০ অক্ষরের window-এ (সর্বোচ্চ ৮টা) embed হয়; KNN-এ chunk-এর সেরা window গোনা হয়। পুরো টেক্সট FTS-এ থাকে।
- **বাংলা FTS:** SQLite `unicode61` বাংলা কার/হসন্তকে separator ধরে শব্দ ভেঙে ফেলে (`ডেটাবেস` → ড, ট, ব, স)। তাই বাংলা combining marks `tokenchars`-এ দেওয়া আছে ([store.py](src/lens_brain/store.py))। query-তে prefix match (`"ডেটা"*`) বিভক্তি ধরে।
- **Frontmatter parser** ([frontmatter.py](src/lens_brain/frontmatter.py)) stdlib-only; `scripts/health.py`-ও এটাই ইমপোর্ট করে, তাই দুই টুলের word count এক।
- মডেল বদলালে DB ফাইল মুছে `lens index --full` (connect নিজেই mismatch ধরে থামায়)।

## Tests

```bash
cd tools/lens-brain && uv run pytest -q   # fake embedder, মডেল নামে না
```
