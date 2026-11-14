"""Lazy CPU embeddings (fastembed / ONNX). The model loads only when something needs it."""
import hashlib
import math
from functools import lru_cache

import sqlite_vec

from . import config


@lru_cache(maxsize=1)
def _model():
    from fastembed import TextEmbedding

    config.MODEL_CACHE.mkdir(parents=True, exist_ok=True)
    return TextEmbedding(model_name=config.EMBED_MODEL, cache_dir=str(config.MODEL_CACHE),
                         threads=config.EMBED_THREADS)


def _fake(text: str) -> list[float]:
    """Deterministic bag-of-words hash vector (tests only): shared words -> close vectors."""
    v = [0.0] * config.EMBED_DIM
    for w in text.lower().split():
        h = int(hashlib.md5(w.encode()).hexdigest(), 16)
        v[h % config.EMBED_DIM] += 1.0
    n = math.sqrt(sum(x * x for x in v)) or 1.0
    return [x / n for x in v]


def embed_passages(texts: list[str]) -> list[bytes]:
    if config.EMBEDDER == "fake":
        return [sqlite_vec.serialize_float32(_fake(t)) for t in texts]
    return [sqlite_vec.serialize_float32(v.tolist()) for v in _model().passage_embed(texts, batch_size=32)]


def embed_query(text: str) -> bytes:
    if config.EMBEDDER == "fake":
        return sqlite_vec.serialize_float32(_fake(text))
    return sqlite_vec.serialize_float32(next(iter(_model().query_embed(text))).tolist())
