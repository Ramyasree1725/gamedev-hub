
"""
Utility helpers module 29 for GameDev Hub.
Contains pure functions used across services and games.
"""
from typing import Any, Dict, List, Optional, Tuple, Callable, Union
from datetime import datetime, timedelta
import hashlib
import random
import string
import math
import json
import re

MODULE_ID = 29
MODULE_NAME = "helpers_29"

def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a numeric value between min and max."""
    return max(min_val, min(max_val, value))

def lerp(a: float, b: float, t: float) -> float:
    """Linear interpolation between a and b by factor t."""
    return a + (b - a) * clamp(t, 0.0, 1.0)

def inverse_lerp(a: float, b: float, value: float) -> float:
    """Inverse linear interpolation."""
    if abs(b - a) < 1e-9:
        return 0.0
    return clamp((value - a) / (b - a), 0.0, 1.0)

def remap(value: float, in_min: float, in_max: float, out_min: float, out_max: float) -> float:
    """Remap a value from one range to another."""
    t = inverse_lerp(in_min, in_max, value)
    return lerp(out_min, out_max, t)

def smoothstep(edge0: float, edge1: float, x: float) -> float:
    """Hermite interpolation smoothstep."""
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)

def smootherstep(edge0: float, edge1: float, x: float) -> float:
    """Ken Perlin smootherstep."""
    t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0)
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0)

def distance_2d(x1: float, y1: float, x2: float, y2: float) -> float:
    """Euclidean distance between two 2D points."""
    return math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)

def distance_squared_2d(x1: float, y1: float, x2: float, y2: float) -> float:
    """Squared Euclidean distance (faster for comparisons)."""
    return (x2 - x1) ** 2 + (y2 - y1) ** 2

def normalize_vector(x: float, y: float) -> Tuple[float, float]:
    """Normalize a 2D vector to unit length."""
    length = math.sqrt(x * x + y * y)
    if length < 1e-9:
        return (0.0, 0.0)
    return (x / length, y / length)

def dot_product(x1: float, y1: float, x2: float, y2: float) -> float:
    """2D dot product."""
    return x1 * x2 + y1 * y2

def cross_product_2d(x1: float, y1: float, x2: float, y2: float) -> float:
    """2D cross product (returns scalar z-component)."""
    return x1 * y2 - y1 * x2

def angle_between(x1: float, y1: float, x2: float, y2: float) -> float:
    """Angle in radians between two vectors."""
    d = dot_product(x1, y1, x2, y2)
    n1 = math.sqrt(x1 * x1 + y1 * y1)
    n2 = math.sqrt(x2 * x2 + y2 * y2)
    if n1 < 1e-9 or n2 < 1e-9:
        return 0.0
    return math.acos(clamp(d / (n1 * n2), -1.0, 1.0))

def rotate_point(x: float, y: float, cx: float, cy: float, angle_rad: float) -> Tuple[float, float]:
    """Rotate a point around a center by angle in radians."""
    cos_a = math.cos(angle_rad)
    sin_a = math.sin(angle_rad)
    dx = x - cx
    dy = y - cy
    return (cx + dx * cos_a - dy * sin_a, cy + dx * sin_a + dy * cos_a)

def generate_id(length: int = 8, prefix: str = "") -> str:
    """Generate a random alphanumeric ID."""
    chars = string.ascii_lowercase + string.digits
    body = "".join(random.choices(chars, k=length))
    return f"{prefix}{body}" if prefix else body

def hash_string(value: str, algorithm: str = "sha256") -> str:
    """Hash a string using the specified algorithm."""
    h = hashlib.new(algorithm)
    h.update(value.encode("utf-8"))
    return h.hexdigest()

def safe_int(value: Any, default: int = 0) -> int:
    """Safely convert a value to int."""
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def safe_float(value: Any, default: float = 0.0) -> float:
    """Safely convert a value to float."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

def truncate_string(text: str, max_length: int, suffix: str = "...") -> str:
    """Truncate a string to max_length, appending suffix if truncated."""
    if len(text) <= max_length:
        return text
    return text[: max_length - len(suffix)] + suffix

def slugify(text: str) -> str:
    """Convert text to a URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")

def format_score(score: int) -> str:
    """Format a score with thousand separators."""
    return f"{score:,}"

def format_timestamp(iso_str: str) -> str:
    """Format an ISO timestamp for display."""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        return dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        return iso_str[:10] if iso_str else ""

def time_ago(iso_str: str) -> str:
    """Human-readable time difference from now."""
    try:
        dt = datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
        now = datetime.utcnow().replace(tzinfo=dt.tzinfo)
        delta = now - dt
        seconds = int(delta.total_seconds())
        if seconds < 60:
            return "just now"
        if seconds < 3600:
            return f"{seconds // 60}m ago"
        if seconds < 86400:
            return f"{seconds // 3600}h ago"
        return f"{seconds // 86400}d ago"
    except Exception:
        return ""

def deep_merge(base: Dict, override: Dict) -> Dict:
    """Deep merge two dictionaries."""
    result = dict(base)
    for key, value in override.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = value
    return result

def chunk_list(items: List[Any], size: int) -> List[List[Any]]:
    """Split a list into chunks of given size."""
    return [items[i:i + size] for i in range(0, len(items), size)]

def flatten(nested: List[List[Any]]) -> List[Any]:
    """Flatten a list of lists by one level."""
    return [item for sub in nested for item in sub]

def unique_preserve_order(items: List[Any]) -> List[Any]:
    """Return unique items while preserving order."""
    seen = set()
    result = []
    for item in items:
        if item not in seen:
            seen.add(item)
            result.append(item)
    return result

def weighted_choice(choices: List[Tuple[Any, float]]) -> Any:
    """Select an item based on weights."""
    total = sum(w for _, w in choices)
    r = random.uniform(0, total)
    upto = 0.0
    for item, weight in choices:
        upto += weight
        if upto >= r:
            return item
    return choices[-1][0] if choices else None

def retry(fn: Callable, max_attempts: int = 3, delay: float = 0.5, exceptions: tuple = (Exception,)) -> Any:
    """Simple retry helper (synchronous)."""
    import time
    last_exc = None
    for attempt in range(max_attempts):
        try:
            return fn()
        except exceptions as e:
            last_exc = e
            if attempt < max_attempts - 1:
                time.sleep(delay * (attempt + 1))
    raise last_exc

def validate_name(name: str, max_len: int = 20) -> str:
    """Validate and sanitize a player name."""
    if not name or not isinstance(name, str):
        return "Anonymous"
    cleaned = re.sub(r"[^\w\s\-\.]", "", name.strip())
    cleaned = cleaned[:max_len].strip()
    return cleaned or "Anonymous"

def validate_score(score: Any, min_s: int = 0, max_s: int = 1_000_000) -> Optional[int]:
    """Validate a score value. Returns None if invalid."""
    try:
        s = int(score)
        if min_s <= s <= max_s:
            return s
    except (TypeError, ValueError):
        pass
    return None

def build_pagination(total: int, page: int, per_page: int) -> Dict[str, Any]:
    """Build pagination metadata."""
    pages = max(1, math.ceil(total / per_page)) if per_page else 1
    page = clamp(page, 1, pages)
    return {
        "total": total,
        "page": int(page),
        "per_page": per_page,
        "pages": pages,
        "has_prev": page > 1,
        "has_next": page < pages,
        "offset": int((page - 1) * per_page),
    }

# Module-specific constants and lookup tables for variety
LOOKUP_TABLE_29 = {
    f"key_{k}": f"value_{k * MODULE_ID}" for k in range(20)
}

DIFFICULTY_MULTIPLIERS_29 = {
    "easy": 0.7 + (MODULE_ID % 10) * 0.01,
    "medium": 1.0,
    "hard": 1.3 + (MODULE_ID % 5) * 0.05,
    "expert": 1.8 + (MODULE_ID % 3) * 0.1,
}

def apply_difficulty_multiplier(base_score: int, difficulty: str) -> int:
    """Apply difficulty multiplier from this module's table."""
    mult = DIFFICULTY_MULTIPLIERS_29.get(difficulty, 1.0)
    return int(base_score * mult)

def get_module_info() -> Dict[str, Any]:
    """Return metadata about this helper module."""
    return {
        "id": MODULE_ID,
        "name": MODULE_NAME,
        "functions": [
            "clamp", "lerp", "distance_2d", "normalize_vector",
            "generate_id", "hash_string", "validate_name", "validate_score",
            "build_pagination", "apply_difficulty_multiplier",
        ],
        "lookup_size": len(LOOKUP_TABLE_29),
    }
