
"""
Shared validation utilities for GameDev Hub forms and API payloads.
"""
from typing import Any, Optional, Tuple, List
import re

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
USERNAME_RE = re.compile(r"^[\w.\-]{1,20}$")
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")

def is_valid_email(value: str) -> bool:
    return bool(value and EMAIL_RE.match(value))

def is_valid_username(value: str) -> bool:
    return bool(value and USERNAME_RE.match(value))

def is_valid_slug(value: str) -> bool:
    return bool(value and SLUG_RE.match(value) and len(value) <= 64)

def is_positive_int(value: Any, max_val: int = 1_000_000) -> bool:
    try:
        v = int(value)
        return 0 <= v <= max_val
    except (TypeError, ValueError):
        return False

def coerce_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def coerce_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return default

def coerce_bool(value: Any, default: bool = False) -> bool:
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.lower() in ("1", "true", "yes", "on")
    if isinstance(value, (int, float)):
        return bool(value)
    return default

def validate_score_payload(data: dict) -> Tuple[bool, List[str]]:
    errors = []
    if not isinstance(data, dict):
        return False, ["payload must be object"]
    game = data.get("game")
    if not game or not isinstance(game, str):
        errors.append("game is required")
    name = data.get("name", "")
    if not isinstance(name, str) or len(name.strip()) == 0:
        errors.append("name is required")
    elif len(name) > 20:
        errors.append("name too long")
    score = data.get("score")
    if not is_positive_int(score):
        errors.append("score must be a non-negative integer")
    return len(errors) == 0, errors

def strip_control_chars(text: str) -> str:
    if not text:
        return ""
    return "".join(ch for ch in text if ord(ch) >= 32 or ch in "\n\t")
