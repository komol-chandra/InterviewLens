"""Incremental indexer: file hash -> only changed files are re-chunked and re-embedded."""
import hashlib
import sqlite3
import sys
import time
from pathlib import Path

from . import config
from .chunker import chunk_markdown, embed_windows
from .frontmatter import parse_frontmatter, word_count
from .store import get_meta, set_meta


def iter_markdown(root: Path | None = None, include_archive: bool | None = None):
    """Yield (abs_path, rel_posix) for every markdown file that belongs in the index."""
    root = root or config.REPO_ROOT
    include_archive = config.INCLUDE_ARCHIVE if include_archive is None else include_archive
    for p in sorted(root.rglob("*.md")):
        rel = p.relative_to(root).as_posix()
        parts = rel.split("/")
        if any(x in config.EXCLUDE_DIRS for x in parts[:-1]):
            continue
        if parts[0] == ".claude" and not rel.startswith(config.CLAUDE_INCLUDE):
            continue
        if parts[0] == config.ARCHIVE_DIR and not include_archive:
            continue
        yield p, rel


def _folder(rel: str) -> str:
    return rel.split("/")[0] if "/" in rel else "(root)"


def _index_file(conn: sqlite3.Connection, path: Path, rel: str, digest: str, text: str) -> int:
    meta, body = parse_frontmatter(text)
    title = str(meta.get("title") or next((ln.lstrip("# ").strip() for ln in body.splitlines()
                                            if ln.startswith("# ")), path.stem))
    tags = meta.get("tags") or []
    tags = tags if isinstance(tags, list) else [str(tags)]
    conn.execute("DELETE FROM chunks WHERE path = ?", (rel,))
    conn.execute(
        "INSERT INTO docs(path, hash, doc_id, title, folder, track, type, status, conf, tier, tags, words, updated, "
        "indexed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now')) ON CONFLICT(path) DO UPDATE SET "
        "hash=excluded.hash, doc_id=excluded.doc_id, title=excluded.title, folder=excluded.folder, "
        "track=excluded.track, type=excluded.type, status=excluded.status, conf=excluded.conf, tier=excluded.tier, "
        "tags=excluded.tags, words=excluded.words, updated=excluded.updated, indexed_at=excluded.indexed_at",
        (rel, digest, meta.get("id"), title, _folder(rel), meta.get("track"), meta.get("type"), meta.get("status"),
         meta.get("conf") if isinstance(meta.get("conf"), int) else None, meta.get("tier"),
         "," + ",".join(tags) + "," if tags else None, word_count(body), str(meta.get("updated") or "") or None),
    )
    chunks = chunk_markdown(body, title)
    conn.executemany("INSERT INTO chunks(path, ord, heading, text) VALUES (?,?,?,?)",
                     [(rel, c.ord, c.heading, c.text) for c in chunks])
    return len(chunks)


def index(conn: sqlite3.Connection, full: bool = False, embed: bool = True,
          include_archive: bool | None = None, log=print) -> dict:
    t0 = time.time()
    if full:
        conn.execute("DELETE FROM chunks")
        conn.execute("DELETE FROM docs")
    known = {r["path"]: r["hash"] for r in conn.execute("SELECT path, hash FROM docs")}
    seen, changed, n_chunks = set(), 0, 0
    for path, rel in iter_markdown(include_archive=include_archive):
        seen.add(rel)
        text = path.read_text(encoding="utf-8", errors="ignore")
        digest = hashlib.sha256(text.encode()).hexdigest()
        if known.get(rel) == digest:
            continue
        n_chunks += _index_file(conn, path, rel, digest, text)
        changed += 1
    removed = [p for p in known if p not in seen]
    for p in removed:
        conn.execute("DELETE FROM chunks WHERE path = ?", (p,))
        conn.execute("DELETE FROM docs WHERE path = ?", (p,))
    conn.commit()
    log(f"text: {changed} changed, {len(removed)} removed, {len(seen) - changed} unchanged ({n_chunks} new chunks)")
    vecs = embed_pending(conn, log=log) if embed else 0
    set_meta(conn, "last_indexed", time.strftime("%Y-%m-%d %H:%M:%S"))
    conn.commit()
    return {"files": len(seen), "changed": changed, "removed": len(removed), "new_chunks": n_chunks,
            "new_vectors": vecs, "seconds": round(time.time() - t0, 1)}


def embed_pending(conn: sqlite3.Connection, batch: int = 64, log=print) -> int:
    from .embed import embed_passages

    rows = conn.execute(
        "SELECT c.id, c.heading, c.text, d.title FROM chunks c JOIN docs d ON d.path = c.path "
        "WHERE c.embedded = 0 ORDER BY c.id").fetchall()
    if not rows:
        return 0
    if get_meta(conn, "embed_model") is None:
        set_meta(conn, "embed_model", config.EMBED_MODEL)
    # an interrupted run may have left some windows of a pending chunk: drop them, redo the chunk
    conn.execute("DELETE FROM chunks_vec WHERE rowid IN (SELECT m.vec_id FROM vec_map m JOIN chunks c "
                 "ON c.id = m.chunk_id WHERE c.embedded = 0)")
    conn.execute("DELETE FROM vec_map WHERE chunk_id IN (SELECT id FROM chunks WHERE embedded = 0)")
    jobs = [(r["id"], w) for r in rows for w in embed_windows(r["text"], r["heading"], r["title"])]
    log(f"embedding {len(jobs)} windows for {len(rows)} chunks ({config.EMBED_MODEL}) …")
    t0, done = time.time(), 0
    for i in range(0, len(jobs), batch):
        part = jobs[i:i + batch]
        vecs = embed_passages([w for _, w in part])
        for (cid, _), v in zip(part, vecs):
            cur = conn.execute("INSERT INTO chunks_vec(embedding) VALUES (?)", (v,))
            conn.execute("INSERT INTO vec_map(vec_id, chunk_id) VALUES (?, ?)", (cur.lastrowid, cid))
        done += len(part)
        finished = {cid for cid, _ in jobs[: i + batch]} - {cid for cid, _ in jobs[i + batch:]}
        conn.executemany("UPDATE chunks SET embedded = 1 WHERE id = ?", [(c,) for c in finished])
        conn.commit()
        if sys.stderr.isatty():
            print(f"\r  {done}/{len(jobs)} ({done / max(time.time() - t0, 0.01):.0f}/s)", end="", file=sys.stderr)
    if sys.stderr.isatty():
        print(file=sys.stderr)
    # chunks with no text windows (shouldn't happen) still count as done
    conn.execute("UPDATE chunks SET embedded = 1 WHERE embedded = 0 AND id NOT IN (SELECT chunk_id FROM vec_map)")
    conn.commit()
    return done
