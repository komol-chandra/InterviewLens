"""Hybrid retrieval: FTS5 BM25 + sqlite-vec KNN, merged with Reciprocal Rank Fusion, then filters."""
import re
import sqlite3

RRF_K = 60
_TOKEN_RE = re.compile(r"[\wঀ-৿‌‍]+")
_STOP = {"the", "and", "for", "what", "how", "why", "is", "are", "of", "to", "in", "a", "an", "do", "does",
         "কী", "কি", "কেন", "কীভাবে", "এবং", "আর", "এর", "করে", "হয়"}


def fts_query(q: str) -> str:
    words = [w for w in _TOKEN_RE.findall(q.lower()) if len(w) > 1 and w not in _STOP]
    # prefix match helps Bangla inflections (ক্যাশিং-এ, ডেটাবেসের) and English plurals
    return " OR ".join(f'"{w}"*' if len(w) >= 3 else f'"{w}"' for w in dict.fromkeys(words))


def _filters(folder=None, tier=None, status=None, track=None, tags=None) -> tuple[str, list]:
    sql, args = "", []
    for col, val in (("folder", folder), ("tier", tier), ("status", status), ("track", track)):
        if val:
            sql += f" AND d.{col} = ?"
            args.append(val)
    for t in ([tags] if isinstance(tags, str) else tags or []):
        for one in str(t).split(","):
            if one.strip():
                sql += " AND d.tags LIKE ?"
                args.append(f"%,{one.strip()},%")
    return sql, args


def search(conn: sqlite3.Connection, query: str, k: int = 8, folder: str | None = None, tier: str | None = None,
           status: str | None = None, track: str | None = None, tags=None, semantic: bool = True,
           per_file_cap: int = 2) -> list[dict]:
    fsql, fargs = _filters(folder, tier, status, track, tags)
    pool = max(k * 5, 30)
    ranks: dict[int, float] = {}
    via: dict[int, set] = {}

    fq = fts_query(query)
    if fq:
        rows = conn.execute(
            "SELECT c.id FROM chunks_fts f JOIN chunks c ON c.id = f.rowid JOIN docs d ON d.path = c.path "
            f"WHERE chunks_fts MATCH ? {fsql} ORDER BY bm25(chunks_fts, 4.0, 1.0) LIMIT ?",
            [fq, *fargs, pool]).fetchall()
        for i, r in enumerate(rows):
            ranks[r["id"]] = ranks.get(r["id"], 0) + 1 / (RRF_K + i)
            via.setdefault(r["id"], set()).add("bm25")

    if semantic and conn.execute("SELECT 1 FROM vec_map LIMIT 1").fetchone():
        from .embed import embed_query

        knn = conn.execute("SELECT rowid, distance FROM chunks_vec WHERE embedding MATCH ? AND k = ? "
                           "ORDER BY distance", (embed_query(query), pool * 4)).fetchall()
        vmap = {r["vec_id"]: r["chunk_id"] for r in conn.execute(
            f"SELECT vec_id, chunk_id FROM vec_map WHERE vec_id IN ({','.join('?' * len(knn))})",
            [r["rowid"] for r in knn])} if knn else {}
        ordered = list(dict.fromkeys(vmap[r["rowid"]] for r in knn if r["rowid"] in vmap))  # best window wins
        if fsql and ordered:
            keep = {r["id"] for r in conn.execute(
                f"SELECT c.id FROM chunks c JOIN docs d ON d.path = c.path "
                f"WHERE c.id IN ({','.join('?' * len(ordered))}) {fsql}", [*ordered, *fargs])}
            ordered = [i for i in ordered if i in keep]
        for i, cid in enumerate(ordered[:pool]):
            ranks[cid] = ranks.get(cid, 0) + 1 / (RRF_K + i)
            via.setdefault(cid, set()).add("vector")

    ranked = sorted(ranks.items(), key=lambda x: -x[1])
    if not ranked:
        return []
    rows = {r["id"]: r for r in conn.execute(
        "SELECT c.id, c.path, c.heading, c.text, d.title, d.folder, d.status, d.conf, d.tier, d.track, d.doc_id "
        f"FROM chunks c JOIN docs d ON d.path = c.path WHERE c.id IN ({','.join('?' * len(ranked))})",
        [i for i, _ in ranked])}
    top, per_file = [], {}
    for i, s in ranked:  # diversity: at most `per_file_cap` sections from one file
        p = rows[i]["path"] if i in rows else None
        if p is None or per_file.get(p, 0) >= per_file_cap:
            continue
        per_file[p] = per_file.get(p, 0) + 1
        top.append((i, s))
        if len(top) == k:
            break
    return [{"score": round(s, 4), "via": sorted(via.get(i, ())), "path": rows[i]["path"],
             "heading": rows[i]["heading"], "title": rows[i]["title"], "folder": rows[i]["folder"],
             "status": rows[i]["status"], "conf": rows[i]["conf"], "tier": rows[i]["tier"],
             "track": rows[i]["track"], "id": rows[i]["doc_id"], "text": rows[i]["text"]}
            for i, s in top if i in rows]


def format_hits(hits: list[dict], max_chars: int = 700) -> str:
    if not hits:
        return "No matches."
    out = []
    for n, h in enumerate(hits, 1):
        meta = " · ".join(str(x) for x in (h["status"], h["tier"], h["conf"] is not None and f"conf {h['conf']}",
                                           "+".join(h["via"])) if x)
        anchor = f"#{h['heading']}" if h["heading"] and h["heading"] != h["title"] else ""
        text = h["text"] if len(h["text"]) <= max_chars else h["text"][:max_chars] + " …"
        out.append(f"[{n}] {h['title']} — {h['path']}{anchor}\n    ({meta})\n{text}")
    return "\n\n---\n\n".join(out)
