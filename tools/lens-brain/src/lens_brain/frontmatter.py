"""Frontmatter parser shared by lens-brain and scripts/health.py. Stdlib only, no package imports."""
import re

FM_RE = re.compile(r"\A---\s*\n(.*?)\n---\s*(?:\n|\Z)", re.S)
FENCE_RE = re.compile(r"```.*?```", re.S)
WORD_RE = re.compile(r"[\wঀ-৿]+")


def parse_frontmatter(text: str) -> tuple[dict, str]:
    """Return (meta, body). Handles the flat YAML subset this repo uses:
    `key: value`, `key: [a, b]`, quoted strings, ints, trailing `# comments`."""
    m = FM_RE.match(text)
    if not m:
        return {}, text
    meta: dict = {}
    for line in m.group(1).splitlines():
        if not line.strip() or line.lstrip().startswith("#") or ":" not in line:
            continue
        key, _, val = line.partition(":")
        key, val = key.strip(), val.strip()
        if val and val[0] not in "\"'":
            val = re.sub(r"\s+#.*$", "", val)
        if val.startswith("[") and val.endswith("]"):
            meta[key] = [v.strip().strip("\"'") for v in val[1:-1].split(",") if v.strip()]
        elif len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            meta[key] = val[1:-1]
        elif re.fullmatch(r"-?\d+", val):
            meta[key] = int(val)
        else:
            meta[key] = val
    return meta, text[m.end():]


def word_count(body: str) -> int:
    """Words outside code fences. Bangla words count whole (vowel signs are not separators)."""
    return len(WORD_RE.findall(FENCE_RE.sub(" ", body)))
