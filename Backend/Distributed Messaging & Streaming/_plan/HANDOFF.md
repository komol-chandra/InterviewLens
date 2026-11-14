# HANDOFF — last updated 2026-10-29 (after T12, plan complete)

## Where we are
- **T0–T12 ✅. All 17 tasks are done.** The knowledge base is `../sections/*.md`, rendered to `../messaging-deep-dive.html` (757 KB) by `python3 build/build_html.py`.
- T12 final QA:
  - Secrets scan is clean.
  - All 1,038 `file:line` refs were checked automatically against `d14c0ebb2`. One off-by-one was fixed in `01`.
  - 10 random refs were checked by eye.
  - Master drift (`75c787a2c`) is recorded in `00` §0.14, with update notes at F12/F13 in `04`.
- Publishing as a private claude.ai artifact: **offered, not done.**

## If you continue
- **Refresh to a new master:** run the re-check command in `00` §0.14. If messaging files changed, re-run T12's auto ref check. The script logic is in MEMORY §5, 2026-10-29: resolve each ref with `git ls-tree`, compare the cited lines at `d14c0ebb2` vs `master`.
- **Open items still needing Komol:** prod facts A3–A7 and A9–A11 (MEMORY §3). Also review the new `SyncPrimaryOrderToSap` job (queue, `afterCommit`).
- Study mode prompts: `Quiz me on T2`, `Explain <topic> simpler` (see README.md).

## Things to remember
- **Code snapshot:** refs are pinned to `d14c0ebb2`. Read drifted files with `git show d14c0ebb2:<path>`. **Don't switch branches** in `sokrio-server`.
- The local `grep` is ugrep: use `grep -F` / `grep -e`.
- Reading `sokrio-server/.env` is blocked.
- Mermaid rules: no `;` in sequence messages or notes; quote labels that contain `()`, `{}` or `[]`; write `:` inside stateDiagram labels as `#58;`; dotted cross edge is `-.-x`.
- Re-verify the page: `python3 -m http.server 8765` in the RnD root, then a Playwright script with Node 22 (`~/.nvm/versions/node/v22.23.4/bin/node`). Rendered diagrams are `.mermaid-wrap svg`; failures are `.mermaid-err`.
- Don't edit the inputs (`README.md`, `README_2.md`, `interview-questions.md`, `old-resource/`).
