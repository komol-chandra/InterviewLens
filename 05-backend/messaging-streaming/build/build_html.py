#!/usr/bin/env python3
"""T11: render sections/*.md into one self-contained page, messaging-deep-dive.html.

Usage:  python3 build/build_html.py        (run from anywhere)

The markdown is embedded as JSON and rendered in the browser with pinned
marked + mermaid builds from jsDelivr. Renderer contract (MEMORY.md §6):
  `## `            -> TOC entries
  `### Q<n>.`      -> Q&A cards (known-tracker + quiz)
  `**Label:**`     -> collapsible <details> parts inside a card
"""
import datetime
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SECTIONS = ROOT / "sections"
TEMPLATE = pathlib.Path(__file__).resolve().parent / "template.html"
OUT = ROOT / "messaging-deep-dive.html"


def main():
    # Digits sort before uppercase, so GLOSSARY.md lands last.
    files = sorted(SECTIONS.glob("*.md"), key=lambda p: p.name)
    docs = [{"file": p.name, "md": p.read_text(encoding="utf-8")} for p in files]
    payload = json.dumps(docs, ensure_ascii=False).replace("</", "<\\/")
    html = TEMPLATE.read_text(encoding="utf-8")
    html = html.replace("__DOCS_JSON__", payload)
    html = html.replace("__BUILT__", datetime.date.today().isoformat())
    OUT.write_text(html, encoding="utf-8")
    lines = sum(d["md"].count("\n") for d in docs)
    print(f"{OUT.name}: {len(docs)} sections, {lines} md lines, {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
