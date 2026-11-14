#!/usr/bin/env python3
"""InterviewLens content health check (stdlib only).

Usage:
    python3 scripts/health.py            # writes 00-start/health-report.md
    python3 scripts/health.py --json     # prints the summary as JSON (for DASHBOARD.md)
    python3 scripts/health.py --stdout   # prints the report instead of writing it

Per top-level folder it reports: files, words, stubs (<150 words), missing README,
missing frontmatter, broken relative links, paths with spaces, and leaks of the
employer name outside 99-archive/ and .claude/.

`parse_frontmatter()` and `iter_markdown()` are meant to be imported by
tools/lens-brain so both tools read files the same way.
"""
from __future__ import annotations

import datetime as _dt
import json
import os
import re
import sys
import urllib.parse
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPORT = ROOT / "00-start" / "health-report.md"

SKIP_DIRS = {".git", "node_modules", ".kilo", "vendor", "__pycache__", ".venv"}
# Not study content: no README / frontmatter / leak rules inside these.
EXEMPT_TOP = {".claude", "99-archive", "scripts", "tools"}
# Root files that legitimately mention the local checkout path.
LEAK_EXEMPT_FILES = {"CLAUDE.md", "MASTER-PLAN.md", "00-start/health-report.md"}
NO_FRONTMATTER_OK = {"CLAUDE.md", "MASTER-PLAN.md"}
TEXT_EXT = {".md", ".txt", ".html", ".php", ".py", ".ts", ".tsx", ".js", ".json",
            ".yml", ".yaml", ".sh", ".sql", ".env", ".conf", ".ini", ".toml", ".csv"}
STUB_WORDS = 150
LEAK_RE = re.compile("so" + "krio", re.I)  # split so this file does not flag itself
LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)")
FENCE_RE = re.compile(r"```.*?```", re.S)
FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.S)


# ---------------------------------------------------------------- shared parser
def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Return (meta, body). Handles the flat YAML subset this repo uses:
    `key: value`, `key: [a, b]`, quoted strings, ints, trailing `# comments`."""
    m = FM_RE.match(text)
    if not m:
        return {}, text
    meta: dict = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        val = val.strip()
        if val and val[0] not in "\"'":
            val = re.sub(r"\s+#.*$", "", val)
        if val.startswith("[") and val.endswith("]"):
            meta[key.strip()] = [v.strip().strip("\"'") for v in val[1:-1].split(",") if v.strip()]
        elif len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            meta[key.strip()] = val[1:-1]
        elif re.fullmatch(r"-?\d+", val):
            meta[key.strip()] = int(val)
        else:
            meta[key.strip()] = val
    return meta, text[m.end():]


def word_count(body: str) -> int:
    return len(re.findall(r"\w+", FENCE_RE.sub(" ", body)))


def iter_files(root: Path = ROOT):
    for dp, dn, fn in os.walk(root):
        dn[:] = sorted(d for d in dn if d not in SKIP_DIRS)
        for f in sorted(fn):
            yield Path(dp) / f


def iter_markdown(root: Path = ROOT):
    for p in iter_files(root):
        if p.suffix == ".md":
            yield p


# ---------------------------------------------------------------- checks
def top_of(rel: Path) -> str:
    return rel.parts[0] if len(rel.parts) > 1 else "(root)"


def broken_links(path: Path, text: str) -> list[str]:
    out = []
    for m in LINK_RE.finditer(FENCE_RE.sub("", text)):
        url = m.group(1)
        if re.match(r"^(https?:|mailto:|#|data:)", url) or "<" in url:
            continue
        target = urllib.parse.unquote(url.split("#")[0])
        if target and not (path.parent / target).exists():
            out.append(url)
    return out


def scan(root: Path = ROOT) -> dict:
    stats = defaultdict(lambda: defaultdict(int))
    issues = defaultdict(list)  # kind -> [(rel, detail)]
    md_dirs = set()

    for p in iter_files(root):
        rel = p.relative_to(root)
        top = top_of(rel)
        exempt = top in EXEMPT_TOP

        if not exempt and " " in str(rel):
            issues["spaces"].append((str(rel), ""))

        if (p.suffix in TEXT_EXT or p.name.startswith(".env")) and not exempt \
                and str(rel) not in LEAK_EXEMPT_FILES:
            try:
                txt = p.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                txt = ""
            hits = len(LEAK_RE.findall(txt)) + len(LEAK_RE.findall(str(rel)))
            if hits:
                issues["leak"].append((str(rel), str(hits)))

        if p.suffix != ".md":
            if not exempt:
                stats[top]["assets"] += 1
            continue

        text = p.read_text(encoding="utf-8", errors="ignore")
        meta, body = parse_frontmatter(text)
        words = word_count(body)
        if top not in {".claude", "scripts", "tools"}:
            for url in broken_links(p, text):
                issues["broken"].append((str(rel), url))
        if exempt:
            continue

        md_dirs.add(p.parent)
        s = stats[top]
        s["files"] += 1
        s["words"] += words
        if p.name != "README.md" and words < STUB_WORDS:
            s["stubs"] += 1
            issues["stub"].append((str(rel), str(words)))
        if not meta and str(rel) not in NO_FRONTMATTER_OK:
            s["no_fm"] += 1
            issues["no_frontmatter"].append((str(rel), ""))
        st = meta.get("status")
        if isinstance(st, str) and st:
            s["status_" + st] += 1

    for d in sorted(md_dirs):
        if not (d / "README.md").exists():
            rel = d.relative_to(root)
            issues["no_readme"].append((str(rel) or ".", ""))
            stats[top_of(rel / "x")]["no_readme"] += 1
    for kind, kind_key in (("broken", "broken"), ("spaces", "spaces"), ("leak", "leak")):
        for rel, _ in issues[kind]:
            stats[top_of(Path(rel))][kind_key] += 1

    folders = {k: dict(v) for k, v in sorted(stats.items())}
    total = defaultdict(int)
    for v in folders.values():
        for k, n in v.items():
            total[k] += n
    return {
        "generated": _dt.date.today().isoformat(),
        "folders": folders,
        "total": dict(total),
        "issues": {k: v for k, v in issues.items()},
    }


# ---------------------------------------------------------------- report
def _cell(n: int, bad: bool = True) -> str:
    return "0" if not n else (f"**{n}**" if bad else str(n))


def render(r: dict) -> str:
    t = r["total"]
    iss = r["issues"]
    lines = [
        "---",
        "id: health-report",
        "title: Content Health Report",
        "track: plan",
        "type: note",
        "status: good",
        f"updated: {r['generated']}",
        f"files: {t.get('files', 0)}",
        f"words: {t.get('words', 0)}",
        f"stubs: {t.get('stubs', 0)}",
        f"no_readme: {len(iss.get('no_readme', []))}",
        f"no_frontmatter: {len(iss.get('no_frontmatter', []))}",
        f"broken_links: {len(iss.get('broken', []))}",
        f"spaces: {len(iss.get('spaces', []))}",
        f"leak_files: {len(iss.get('leak', []))}",
        "---",
        "",
        "# Content Health Report",
        "",
        "> `python3 scripts/health.py` দিয়ে তৈরি। হাতে এডিট করবে না, আবার চালাও (`/health-check`)।",
        "> `.claude/`, `99-archive/`, `scripts/`, `tools/` গোনা হয় না (link check বাদে `99-archive/`)।",
        "",
        "## Per folder",
        "",
        "| Folder | md | words | stubs | no README | no FM | broken links | spaces | leak files | assets |",
        "|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|",
    ]
    for name, s in r["folders"].items():
        if name in EXEMPT_TOP and not any(s.get(k) for k in ("broken",)):
            continue
        lines.append(
            f"| {name} | {s.get('files', 0)} | {s.get('words', 0):,} | {_cell(s.get('stubs', 0))} "
            f"| {_cell(s.get('no_readme', 0))} | {_cell(s.get('no_fm', 0))} | {_cell(s.get('broken', 0))} "
            f"| {_cell(s.get('spaces', 0))} | {_cell(s.get('leak', 0))} | {s.get('assets', 0)} |")
    lines.append(
        f"| **Total** | **{t.get('files', 0)}** | **{t.get('words', 0):,}** | **{t.get('stubs', 0)}** "
        f"| **{len(iss.get('no_readme', []))}** | **{len(iss.get('no_frontmatter', []))}** "
        f"| **{len(iss.get('broken', []))}** | **{len(iss.get('spaces', []))}** "
        f"| **{len(iss.get('leak', []))}** | **{t.get('assets', 0)}** |")

    def section(title: str, kind: str, detail: str | None, limit: int = 200):
        items = iss.get(kind, [])
        lines.extend(["", f"## {title} ({len(items)})", ""])
        if not items:
            lines.append("✅ কিছু নেই।")
            return
        rows = sorted(items, key=lambda x: -int(x[1])) if kind == "leak" else items
        for rel, d in rows[:limit]:
            link = urllib.parse.quote(rel)
            extra = f" — {detail.format(d)}" if detail and d else ""
            lines.append(f"- [{rel}](../{link}){extra}")
        if len(items) > limit:
            lines.append(f"- … আরও {len(items) - limit}টা")

    section("Public-safe leaks (employer name)", "leak", "{} hits")
    section("Broken links", "broken", "→ `{}`")
    section("Missing README", "no_readme", None)
    section("Missing frontmatter", "no_frontmatter", None)
    section("Paths with spaces", "spaces", None)
    section(f"Stubs (< {STUB_WORDS} words)", "stub", "{} words")
    return "\n".join(lines) + "\n"


def main(argv: list[str]) -> int:
    r = scan()
    if "--json" in argv:
        print(json.dumps({k: v for k, v in r.items() if k != "issues"}
                         | {"counts": {k: len(v) for k, v in r["issues"].items()}},
                         ensure_ascii=False, indent=2))
        return 0
    out = render(r)
    if "--stdout" in argv:
        print(out)
    else:
        REPORT.write_text(out, encoding="utf-8")
        c = {k: len(v) for k, v in r["issues"].items()}
        print(f"wrote {REPORT.relative_to(ROOT)}: {r['total'].get('files', 0)} md, "
              f"{r['total'].get('words', 0):,} words, " + ", ".join(f"{k}={n}" for k, n in sorted(c.items())))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
