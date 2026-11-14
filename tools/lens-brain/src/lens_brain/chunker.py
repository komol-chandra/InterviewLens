"""Split a markdown file into heading-scoped chunks.

- Sections start at H1/H2/H3 (headings inside ``` fences are ignored).
- Small neighbouring sections are merged up to CHUNK_MIN_CHARS; big ones are split on
  paragraph boundaries at CHUNK_MAX_CHARS with CHUNK_OVERLAP_CHARS of overlap.
- Each chunk keeps its heading trail ("H1 › H2 › H3") for display and ranking.
"""
import re
from dataclasses import dataclass

from . import config

HEADING_RE = re.compile(r"^(#{1,3})\s+(.+?)\s*#*\s*$")
FENCE_LINE_RE = re.compile(r"^\s*(```|~~~)")


@dataclass
class Chunk:
    ord: int
    heading: str
    text: str


def _sections(body: str) -> list[tuple[str, str]]:
    """[(heading_trail, text)] in document order. Text before the first heading gets trail ''."""
    trail: list[str] = []
    out: list[tuple[str, list[str]]] = [("", [])]
    in_fence = False
    for line in body.splitlines():
        if FENCE_LINE_RE.match(line):
            in_fence = not in_fence
        m = None if in_fence else HEADING_RE.match(line)
        if m:
            level = len(m.group(1))
            title = re.sub(r"[*_`]", "", m.group(2)).strip()
            trail = trail[: level - 1] + [""] * max(0, level - 1 - len(trail)) + [title]
            out.append((" › ".join(t for t in trail if t), [line]))
        else:
            out[-1][1].append(line)
    return [(h, "\n".join(lines).strip()) for h, lines in out if "\n".join(lines).strip()]


def _split_long(text: str, limit: int, overlap: int) -> list[str]:
    paras = re.split(r"\n{2,}", text)
    pieces, buf = [], ""
    for p in paras:
        while len(p) > limit:  # a single huge paragraph / code block
            if buf:
                pieces.append(buf)
                buf = ""
            pieces.append(p[:limit])
            p = p[limit - overlap:]
        if buf and len(buf) + len(p) + 2 > limit:
            pieces.append(buf)
            tail = buf[-overlap:]
            cut = tail.find("\n")
            buf = (tail[cut + 1:] if 0 <= cut < len(tail) - 1 else tail) + "\n\n" + p
        else:
            buf = f"{buf}\n\n{p}" if buf else p
    if buf.strip():
        pieces.append(buf)
    return [x.strip() for x in pieces if x.strip()]


def chunk_markdown(body: str, title: str = "") -> list[Chunk]:
    lo, hi, ov = config.CHUNK_MIN_CHARS, config.CHUNK_MAX_CHARS, config.CHUNK_OVERLAP_CHARS
    merged: list[tuple[str, str]] = []
    for heading, text in _sections(body):
        if merged and len(merged[-1][1]) < lo and len(merged[-1][1]) + len(text) <= hi:
            h0, t0 = merged[-1]
            merged[-1] = (h0 or heading, f"{t0}\n\n{text}")
        else:
            merged.append((heading, text))
    chunks: list[Chunk] = []
    for heading, text in merged:
        for piece in (_split_long(text, hi, ov) if len(text) > hi else [text]):
            chunks.append(Chunk(len(chunks), heading or title, piece))
    return chunks


def embed_windows(text: str, heading: str, title: str) -> list[str]:
    """Short windows of a chunk for the 128-token embedding model, each prefixed with context."""
    w, n = config.EMBED_WINDOW_CHARS, config.EMBED_MAX_WINDOWS
    prefix = " › ".join(dict.fromkeys(x for x in (title, heading) if x))[:120]
    flat = re.sub(r"\s+", " ", text).strip()
    step = int(w * 0.85)
    wins = [flat[i:i + w] for i in range(0, max(len(flat), 1), step)][:n]
    return [f"{prefix}\n{x}" for x in wins if x.strip()]
