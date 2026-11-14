"""Core tests: chunker, incremental index, hybrid search. Uses a temp repo + fake embedder (no model download)."""
import importlib
import textwrap

import pytest


@pytest.fixture()
def env(tmp_path, monkeypatch):
    repo = tmp_path / "repo"
    (repo / "03-system-design").mkdir(parents=True)
    (repo / "05-backend").mkdir()
    (repo / "99-archive").mkdir()
    (repo / ".claude" / "templates").mkdir(parents=True)
    (repo / "03-system-design" / "caching.md").write_text(textwrap.dedent("""\
        ---
        id: sd-caching
        title: Caching
        track: system-design
        status: draft
        conf: 1
        tier: starter
        tags: [system-design, cache]
        ---
        # Caching

        ## Cache stampede
        যখন অনেক রিকোয়েস্ট একসাথে মেয়াদোত্তীর্ণ key-তে আসে, তখন ডেটাবেসে চাপ পড়ে। Use a lock or early refresh.

        ## Invalidation
        Write-through vs cache-aside. TTL jitter.
        """), encoding="utf-8")
    (repo / "05-backend" / "queues.md").write_text(
        "---\nid: be-queues\ntitle: Queues\nstatus: good\ntier: mvp\ntags: [backend]\n---\n"
        "# Queues\n\n## Idempotency\nConsumers must be idempotent; store a processed message id.\n",
        encoding="utf-8")
    (repo / "99-archive" / "old.md").write_text("# Old\ncache stampede archived\n", encoding="utf-8")
    (repo / ".claude" / "templates" / "t.md").write_text("# Template\ncache stampede\n", encoding="utf-8")
    monkeypatch.setenv("LENS_REPO_ROOT", str(repo))
    monkeypatch.setenv("LENS_DB", str(tmp_path / "lens.db"))
    monkeypatch.setenv("LENS_EMBEDDER", "fake")
    monkeypatch.setenv("LENS_INCLUDE_ARCHIVE", "0")
    from lens_brain import config
    importlib.reload(config)
    from lens_brain import chunker, embed, indexer, notes, search, store
    for m in (chunker, embed, store, indexer, search, notes):
        importlib.reload(m)
    return repo, store.connect(), indexer, search


def test_chunker_headings_and_fences():
    from lens_brain.chunker import _sections, chunk_markdown

    body = "# T\nintro\n## A\ntext a\n```bash\n# not a heading\n```\n### A1\nmore\n## B\nb text\n"
    secs = _sections(body)
    assert [h for h, _ in secs] == ["T", "T › A", "T › A › A1", "T › B"]
    assert "# not a heading" in secs[1][1]
    # small sections merge into one chunk
    assert len(chunk_markdown(body, "T")) == 1


def test_chunker_splits_long_with_overlap():
    from lens_brain import config
    from lens_brain.chunker import chunk_markdown

    para = "word " * 200
    body = "## Big\n\n" + "\n\n".join(f"P{i} {para}" for i in range(6))
    chunks = chunk_markdown(body, "Doc")
    assert len(chunks) > 1
    assert all(len(c.text) <= config.CHUNK_MAX_CHARS + config.CHUNK_OVERLAP_CHARS for c in chunks)
    assert all(c.heading == "Big" for c in chunks)


def test_frontmatter_and_bangla_word_count():
    from lens_brain.frontmatter import parse_frontmatter, word_count

    meta, body = parse_frontmatter("---\ntitle: \"X: y\"\nconf: 2   # self\ntags: [a, b]\n---\nডেটাবেস ইনডেক্স কাজ করে\n")
    assert meta == {"title": "X: y", "conf": 2, "tags": ["a", "b"]}
    assert word_count(body) == 4


def test_incremental_index(env):
    repo, conn, indexer, _ = env
    r1 = indexer.index(conn, log=lambda *_: None)
    assert r1["files"] == 2 and r1["changed"] == 2  # archive + .claude/templates excluded
    assert r1["new_vectors"] > 0

    r2 = indexer.index(conn, log=lambda *_: None)
    assert r2["changed"] == 0 and r2["new_chunks"] == 0 and r2["new_vectors"] == 0

    f = repo / "05-backend" / "queues.md"
    f.write_text(f.read_text() + "\n## Outbox\nTransactional outbox pattern.\n", encoding="utf-8")
    r3 = indexer.index(conn, log=lambda *_: None)
    assert r3["changed"] == 1

    f.unlink()
    r4 = indexer.index(conn, log=lambda *_: None)
    assert r4["removed"] == 1
    assert conn.execute("SELECT COUNT(*) FROM chunks WHERE path = '05-backend/queues.md'").fetchone()[0] == 0
    orphans = conn.execute("SELECT COUNT(*) FROM vec_map WHERE chunk_id NOT IN (SELECT id FROM chunks)").fetchone()[0]
    assert orphans == 0


def test_hybrid_search_finds_known_file(env):
    _, conn, indexer, search = env
    indexer.index(conn, log=lambda *_: None)

    hits = search.search(conn, "cache stampede", k=3)
    assert hits[0]["path"] == "03-system-design/caching.md"
    assert set(hits[0]["via"]) == {"bm25", "vector"}

    bn = search.search(conn, "ডেটাবেসে চাপ", k=3, semantic=False)  # Bangla keyword, FTS only
    assert bn and bn[0]["path"] == "03-system-design/caching.md"

    assert search.search(conn, "idempotent consumer", k=3, tier="mvp")[0]["path"] == "05-backend/queues.md"
    assert all(h["folder"] == "05-backend" for h in search.search(conn, "cache", folder="05-backend"))
    assert search.search(conn, "cache stampede", tags="cache")[0]["id"] == "sd-caching"


def test_get_doc_section_and_path_guard(env):
    repo, *_ = env
    from lens_brain import notes

    d = notes.get_doc("03-system-design/caching.md", "Caching › Invalidation")
    assert d["content"].startswith("## Invalidation") and "stampede" not in d["content"]
    assert d["meta"]["id"] == "sd-caching"
    with pytest.raises(ValueError):
        notes.get_doc("../../etc/passwd")
