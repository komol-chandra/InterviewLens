"""`lens` CLI: index | search | doc | weak | stats | serve."""
import argparse
import json
import sys

from . import config


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="lens", description="InterviewLens notes RAG")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("index", help="incremental index (only changed files)")
    p.add_argument("--full", action="store_true", help="drop everything and rebuild")
    p.add_argument("--no-embed", action="store_true", help="text/FTS only, skip embeddings")
    p.add_argument("--archive", action="store_true", help="include 99-archive/")

    p = sub.add_parser("search", help="hybrid search")
    p.add_argument("query")
    p.add_argument("-k", type=int, default=8)
    p.add_argument("--folder")
    p.add_argument("--tier")
    p.add_argument("--status")
    p.add_argument("--track")
    p.add_argument("--tags", help="comma-separated, all must match")
    p.add_argument("--fts-only", action="store_true", help="keyword search only (no model load)")
    p.add_argument("--json", action="store_true")

    p = sub.add_parser("doc", help="print a note (optionally one section)")
    p.add_argument("path")
    p.add_argument("--heading")

    p = sub.add_parser("weak", help="weakest topics first")
    p.add_argument("--priority")
    p.add_argument("--folder")
    p.add_argument("-n", type=int, default=15)

    p = sub.add_parser("stats", help="index + folder stats")
    p.add_argument("--json", action="store_true")

    p = sub.add_parser("serve", help=f"FastAPI on 127.0.0.1:{config.API_PORT}")
    p.add_argument("--port", type=int, default=config.API_PORT)

    a = ap.parse_args(argv)

    if a.cmd == "serve":
        import uvicorn

        uvicorn.run("lens_brain.api:app", host="127.0.0.1", port=a.port, log_level="info")
        return 0

    from . import notes
    from .store import connect

    if a.cmd == "doc":
        d = notes.get_doc(a.path, a.heading)
        print(d["content"])
        return 0
    if a.cmd == "weak":
        for r in notes.weak_areas(a.priority, a.folder, a.n):
            now = r["now"] if r["now"] is not None else "?"
            print(f"{r['priority']} {now}/{r['guess']}  {r['topic']}  ({r['folder']})")
        return 0

    conn = connect()
    if a.cmd == "index":
        from .indexer import index

        r = index(conn, full=a.full, embed=not a.no_embed, include_archive=a.archive or None)
        print(f"done in {r['seconds']}s: {r['files']} files, {r['changed']} changed, {r['removed']} removed, "
              f"{r['new_chunks']} chunks, {r['new_vectors']} vectors")
    elif a.cmd == "search":
        from .search import format_hits, search

        hits = search(conn, a.query, k=a.k, folder=a.folder, tier=a.tier, status=a.status, track=a.track,
                      tags=a.tags, semantic=not a.fts_only)
        print(json.dumps(hits, ensure_ascii=False, indent=1) if a.json else format_hits(hits))
    elif a.cmd == "stats":
        s = notes.stats(conn)
        if a.json:
            print(json.dumps(s, ensure_ascii=False, indent=1))
        else:
            t = s["totals"]
            print(f"{t['files']} files · {t['words']:,} words · {t['chunks']} chunks "
                  f"({t['embedded_chunks']} embedded, {t['vectors']} vectors) · last index {s['index']['last_indexed']}")
            print(f"{'folder':28} {'files':>5} {'words':>8} {'stubs':>5}  status")
            for name, f in s["folders"].items():
                st = " ".join(f"{k}:{v}" for k, v in sorted(f["status"].items()))
                print(f"{name:28} {f['files']:>5} {f['words']:>8,} {f['stubs']:>5}  {st}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
