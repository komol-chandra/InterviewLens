"""SQLite store: docs, chunks, chunks_fts (FTS5), chunks_vec (sqlite-vec) + vec_map."""
import sqlite3
import unicodedata
from pathlib import Path

import sqlite_vec

from . import config

# unicode61 treats combining marks as separators, which shreds Bangla words
# ("ডেটাবেস" -> ড, ট, ব, স). Declaring the Bengali vowel signs / virama / nukta (and ZWJ/ZWNJ)
# as token characters keeps whole words.
_BN_MARKS = "".join(ch for ch in map(chr, range(0x0980, 0x0A00))
                    if unicodedata.category(ch) in ("Mn", "Mc")) + "‌‍"
FTS_TOKENIZE = f"porter unicode61 remove_diacritics 2 tokenchars '{_BN_MARKS}'"

SCHEMA = f"""
CREATE TABLE IF NOT EXISTS docs (
    path TEXT PRIMARY KEY,           -- relative to REPO_ROOT
    hash TEXT NOT NULL,
    doc_id TEXT, title TEXT, folder TEXT, track TEXT, type TEXT,
    status TEXT, conf INTEGER, tier TEXT, tags TEXT,   -- tags: ',a,b,' for LIKE filters
    words INTEGER NOT NULL DEFAULT 0,
    updated TEXT,
    indexed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS chunks (
    id INTEGER PRIMARY KEY,
    path TEXT NOT NULL REFERENCES docs(path),
    ord INTEGER NOT NULL,
    heading TEXT,
    text TEXT NOT NULL,
    embedded INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS chunks_path ON chunks(path);
CREATE INDEX IF NOT EXISTS chunks_embedded ON chunks(embedded);
CREATE TABLE IF NOT EXISTS vec_map (
    vec_id INTEGER PRIMARY KEY,
    chunk_id INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS vec_map_chunk ON vec_map(chunk_id);
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
    heading, text, content='chunks', content_rowid='id', tokenize="{FTS_TOKENIZE}"
);
CREATE VIRTUAL TABLE IF NOT EXISTS chunks_vec USING vec0(embedding float[{config.EMBED_DIM}]);
CREATE TRIGGER IF NOT EXISTS chunks_ai AFTER INSERT ON chunks BEGIN
    INSERT INTO chunks_fts(rowid, heading, text) VALUES (new.id, new.heading, new.text);
END;
CREATE TRIGGER IF NOT EXISTS chunks_ad AFTER DELETE ON chunks BEGIN
    INSERT INTO chunks_fts(chunks_fts, rowid, heading, text) VALUES ('delete', old.id, old.heading, old.text);
    DELETE FROM chunks_vec WHERE rowid IN (SELECT vec_id FROM vec_map WHERE chunk_id = old.id);
    DELETE FROM vec_map WHERE chunk_id = old.id;
END;
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT);
"""


def connect(path: Path | None = None) -> sqlite3.Connection:
    path = path or config.DB_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.enable_load_extension(True)
    sqlite_vec.load(conn)
    conn.enable_load_extension(False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.executescript(SCHEMA)
    model = conn.execute("SELECT value FROM meta WHERE key='embed_model'").fetchone()
    if model and model[0] != config.EMBED_MODEL:
        raise RuntimeError(f"DB was embedded with {model[0]!r}, config says {config.EMBED_MODEL!r}. "
                           f"Run `lens index --full` after deleting {path}.")
    return conn


def set_meta(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute("INSERT INTO meta(key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
                 (key, value))


def get_meta(conn: sqlite3.Connection, key: str) -> str | None:
    r = conn.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    return r[0] if r else None
