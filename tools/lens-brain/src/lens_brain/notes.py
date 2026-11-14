"""Read-side helpers shared by the CLI, MCP server and API: get_doc, weak areas, stats."""
import re
import sqlite3
from pathlib import Path

from . import config
from .frontmatter import parse_frontmatter
from .store import get_meta

BN_DIGITS = str.maketrans("০১২৩৪৫৬৭৮৯", "0123456789")
PRIORITY_ORDER = {"🔴": 0, "🟠": 1, "🟡": 2}
WEAK_AREAS = ".claude/memory/weak-areas.md"


def safe_path(rel: str) -> Path:
    """Resolve a repo-relative markdown path; refuse anything outside the repo or not .md."""
    p = (config.REPO_ROOT / rel.lstrip("/")).resolve()
    if config.REPO_ROOT.resolve() not in p.parents or p.suffix != ".md":
        raise ValueError(f"not a markdown file inside the repo: {rel}")
    if not p.is_file():
        raise FileNotFoundError(rel)
    return p


def get_doc(rel: str, heading: str | None = None) -> dict:
    p = safe_path(rel)
    text = p.read_text(encoding="utf-8", errors="ignore")
    meta, body = parse_frontmatter(text)
    if heading:
        want = heading.split("›")[-1].strip().lower().lstrip("#").strip()
        lines, out, level = body.splitlines(), [], None
        for ln in lines:
            m = re.match(r"^(#{1,6})\s+(.*)", ln)
            if m and level is not None and len(m.group(1)) <= level:
                break
            if m and level is None and re.sub(r"[*_`]", "", m.group(2)).strip().lower() == want:
                level = len(m.group(1))
            if level is not None:
                out.append(ln)
        if out:
            body = "\n".join(out)
    return {"path": p.relative_to(config.REPO_ROOT).as_posix(), "meta": meta, "content": body}


def _cell_int(s: str) -> int | None:
    s = s.strip().translate(BN_DIGITS)
    return int(s) if s.isdigit() else None


def weak_areas(priority: str | None = None, folder: str | None = None, limit: int = 15) -> list[dict]:
    """Rows of weak-areas.md, weakest first: by Now (else Guess), then priority."""
    p = config.REPO_ROOT / WEAK_AREAS
    if not p.exists():
        return []
    group, rows = "", []
    for ln in p.read_text(encoding="utf-8").splitlines():
        if ln.startswith("## "):
            group = re.sub(r"^[#\s০-৯\d.]+", "", ln).strip()
            continue
        cells = [c.strip() for c in ln.strip().strip("|").split("|")]
        if len(cells) < 6 or set(cells[0]) <= set("-: ") or cells[2].lower() == "guess":
            continue
        guess, now = _cell_int(cells[2]), _cell_int(cells[3])
        if guess is None and now is None:
            continue
        rows.append({"group": group, "topic": cells[0], "priority": cells[1], "guess": guess, "now": now,
                     "history": cells[4], "folder": cells[5]})
    if priority:
        rows = [r for r in rows if priority in r["priority"]]
    if folder:
        rows = [r for r in rows if r["folder"] == folder]
    rows.sort(key=lambda r: (r["now"] if r["now"] is not None else r["guess"],
                             PRIORITY_ORDER.get(r["priority"][:1], 9)))
    return rows[:limit]


def dashboard_numbers() -> dict:
    p = config.REPO_ROOT / "DASHBOARD.md"
    if not p.exists():
        return {}
    meta, _ = parse_frontmatter(p.read_text(encoding="utf-8"))
    return {k: v for k, v in meta.items() if isinstance(v, int)}


def stats(conn: sqlite3.Connection) -> dict:
    folders = {}
    for r in conn.execute(
            "SELECT folder, COUNT(*) files, SUM(words) words, SUM(words < 150 AND path NOT LIKE '%README.md') stubs, "
            "ROUND(AVG(conf), 2) avg_conf FROM docs GROUP BY folder ORDER BY folder"):
        folders[r["folder"]] = dict(r) | {"status": {}, "tier": {}}
    for col in ("status", "tier"):
        for r in conn.execute(f"SELECT folder, {col} v, COUNT(*) n FROM docs WHERE {col} IS NOT NULL "
                              f"GROUP BY folder, {col}"):
            folders[r["folder"]][col][r["v"]] = r["n"]
    totals = dict(conn.execute("SELECT COUNT(*) files, COALESCE(SUM(words), 0) words FROM docs").fetchone())
    totals["chunks"] = conn.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]
    totals["embedded_chunks"] = conn.execute("SELECT COUNT(*) FROM chunks WHERE embedded = 1").fetchone()[0]
    totals["vectors"] = conn.execute("SELECT COUNT(*) FROM vec_map").fetchone()[0]
    return {"totals": totals, "folders": folders, "dashboard": dashboard_numbers(),
            "index": {"last_indexed": get_meta(conn, "last_indexed"), "embed_model": get_meta(conn, "embed_model"),
                      "db": str(config.DB_PATH)}}
