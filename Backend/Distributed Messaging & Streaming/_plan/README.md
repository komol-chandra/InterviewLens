# _plan — Messaging Deep-Dive: Control Folder

This folder holds the plan, progress and memory for the
"Distributed Messaging & Streaming" knowledge base. The content itself
lives in `../sections/`. The final page will be `../messaging-deep-dive.html`.

| File | What it is | When to read |
|---|---|---|
| `PLAN.md` | The approved plan, plus one **task card** per phase (inputs, outputs, steps, done-criteria) | Before starting any task |
| `TRACKER.md` | Status board: what's done, what's next, line counts, dates | Start and end of every session |
| `MEMORY.md` | Facts already verified, decisions, notes-vs-code conflicts, open assumptions, style rules | Before writing any section, so nothing is re-researched |
| `HANDOFF.md` | Where the last session stopped and the exact next step | When resuming in a new session |

## How to run a task (copy-paste prompts)

Start or resume:
```
Read _komol/RnD/Distributed Messaging & Streaming/_plan/README.md, then TRACKER.md, MEMORY.md, HANDOFF.md.
Start task <T-ID> from PLAN.md.
```

Examples:
- `Start task T1` (Phase 1, architecture overview)
- `Start task T8a` (Interview Q&A part 1)
- `Start task T11` (build the HTML page)

Anytime:
- `Quiz me on T2`: 5 questions, one at a time, graded against the code
- `Explain <topic> simpler` / `Show me the code path for <flow>`
- `Verify assumption A3`: check an open item in MEMORY.md

## Session rules (for Claude)
1. Read `TRACKER.md`, `MEMORY.md` and `HANDOFF.md` first. Don't re-derive facts already in MEMORY.md; reuse them.
2. Do **one task per run**. Stop after it, show a summary, and wait for "next".
3. At the end of a task, update `TRACKER.md` (status, lines, date), append any new facts, decisions or conflicts to `MEMORY.md`, and rewrite `HANDOFF.md`.
4. Never modify application code. Only write inside this RnD folder.
5. Never copy secrets, hosts or IPs. Give the env var name and `<redacted>` instead.
