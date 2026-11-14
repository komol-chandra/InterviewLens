"""MCP server over stdio. Claude Code starts it on demand, so it costs nothing while idle."""
import json

from mcp.server.fastmcp import FastMCP

from . import notes
from .search import format_hits, search
from .store import connect

mcp = FastMCP(
    "lens-brain",
    instructions=(
        "Hybrid (keyword + semantic, Bangla + English) search over Komol's InterviewLens study notes. "
        "Call search_notes before opening many files or before writing a new study file (to avoid duplicates). "
        "get_doc returns a file or one section of it. list_weak_areas gives the weakest topics for planning a "
        "study block. stats gives per-folder counts and the DASHBOARD numbers."
    ),
)
_conn = None


def conn():
    global _conn
    if _conn is None:
        _conn = connect()
    return _conn


@mcp.tool()
def search_notes(query: str, k: int = 8, folder: str | None = None, tier: str | None = None,
                 status: str | None = None, tags: str | None = None) -> str:
    """Search the study notes. query: Bangla or English. folder: e.g. 03-system-design. tier: mvp|starter|product.
    status: stub|draft|good|complete. tags: comma-separated, all must match. Returns ranked sections with
    their file path and heading."""
    return format_hits(search(conn(), query, k=min(k, 20), folder=folder, tier=tier, status=status, tags=tags))


@mcp.tool()
def get_doc(path: str, heading: str | None = None) -> str:
    """Return a note by repo-relative path (e.g. 05-backend/README.md), optionally only the section under
    `heading`. Frontmatter is returned as JSON on the first line."""
    try:
        d = notes.get_doc(path, heading)
    except (ValueError, FileNotFoundError) as e:
        return f"Error: {e}"
    return json.dumps(d["meta"], ensure_ascii=False) + "\n\n" + d["content"]


@mcp.tool()
def list_weak_areas(priority: str | None = None, folder: str | None = None, limit: int = 15) -> str:
    """Weakest topics first (self-rating `Now`, else Claude's `Guess`, 0–3). priority: 🔴 | 🟠 | 🟡."""
    rows = notes.weak_areas(priority, folder, limit)
    if not rows:
        return "No weak areas found."
    return "\n".join(
        f"- {r['priority']} {r['topic']} — now {r['now'] if r['now'] is not None else '?'} "
        f"(guess {r['guess']}) · {r['folder']} · {r['group']}" for r in rows)


@mcp.tool()
def stats() -> str:
    """Per-folder files/words/stubs/status/tier, index state, and DASHBOARD.md numbers, as JSON."""
    return json.dumps(notes.stats(conn()), ensure_ascii=False, indent=1)


def main():
    mcp.run()


if __name__ == "__main__":
    main()
