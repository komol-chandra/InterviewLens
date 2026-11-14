"""FastAPI for the (future) React app: `lens serve` -> http://127.0.0.1:8765 (localhost only)."""
import threading

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from . import notes
from .indexer import index
from .search import search
from .store import connect

app = FastAPI(title="lens-brain", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
                   allow_methods=["GET", "POST"], allow_headers=["*"])
_lock = threading.Lock()
_conn = None


def conn():
    global _conn
    if _conn is None:
        _conn = connect()
    return _conn


@app.get("/health")
def health():
    c = conn()
    return {"ok": True, "docs": c.execute("SELECT COUNT(*) FROM docs").fetchone()[0],
            "chunks": c.execute("SELECT COUNT(*) FROM chunks").fetchone()[0]}


@app.get("/search")
def search_ep(q: str = Query(..., min_length=1), k: int = Query(8, ge=1, le=50), folder: str | None = None,
              tier: str | None = None, status: str | None = None, track: str | None = None,
              tags: str | None = None, semantic: bool = True):
    with _lock:
        return {"query": q, "hits": search(conn(), q, k=k, folder=folder, tier=tier, status=status,
                                           track=track, tags=tags, semantic=semantic)}


@app.get("/doc")
def doc_ep(path: str, heading: str | None = None):
    try:
        return notes.get_doc(path, heading)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except FileNotFoundError:
        raise HTTPException(404, f"not found: {path}")


@app.get("/stats")
def stats_ep():
    with _lock:
        return notes.stats(conn())


@app.get("/weak-areas")
def weak_ep(priority: str | None = None, folder: str | None = None, limit: int = 50):
    return notes.weak_areas(priority, folder, limit)


@app.post("/reindex")
def reindex_ep(full: bool = False, embed: bool = True):
    with _lock:
        return index(conn(), full=full, embed=embed, log=lambda *_: None)
