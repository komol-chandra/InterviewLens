"""Paths and tunables. Every path can be overridden with an env var (tests use this)."""
import os
from pathlib import Path

HOME = Path.home()
# tools/lens-brain/src/lens_brain/config.py -> repo root is 4 levels up
REPO_ROOT = Path(os.environ.get("LENS_REPO_ROOT", Path(__file__).resolve().parents[4]))
DB_PATH = Path(os.environ.get("LENS_DB", HOME / ".local/share/interviewlens-brain/lens.db"))
MODEL_CACHE = Path(os.environ.get("LENS_MODELS", HOME / ".cache/interviewlens-brain/models"))

# Which markdown gets indexed (paths relative to REPO_ROOT).
EXCLUDE_DIRS = {".git", "node_modules", "vendor", ".venv", "venv", "__pycache__", "assets",
                ".kilo", "tools", "scripts"}
# .claude/: only the study memory is useful to search (not templates/commands).
CLAUDE_INCLUDE = (".claude/memory/",)
ARCHIVE_DIR = "99-archive"
INCLUDE_ARCHIVE = os.environ.get("LENS_INCLUDE_ARCHIVE", "0") == "1"

# Embeddings. Bangla + English content -> multilingual model (in fastembed's supported list).
# It reads at most 128 word-pieces, so each chunk is embedded as several short windows.
EMBED_MODEL = os.environ.get("LENS_EMBED_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
EMBED_DIM = int(os.environ.get("LENS_EMBED_DIM", "384"))
EMBED_THREADS = 4          # leave CPU for the rest of the machine
EMBED_WINDOW_CHARS = 420   # ~110–128 word-pieces for mixed Bangla/English
EMBED_MAX_WINDOWS = 8      # per chunk; the rest is still covered by FTS
# "fake" = deterministic hash vectors, no model download (tests only)
EMBEDDER = os.environ.get("LENS_EMBEDDER", "fastembed")

# Chunking (~4 chars per token): target 400–800 tokens, 80-token overlap.
CHUNK_MIN_CHARS = 1600
CHUNK_MAX_CHARS = 3200
CHUNK_OVERLAP_CHARS = 320

API_PORT = int(os.environ.get("LENS_PORT", "8765"))
