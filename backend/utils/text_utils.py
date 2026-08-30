"""
Text processing utilities for GameDev Hub UI and API responses.
"""
from typing import Optional
import re
import html

def escape_html(text: str) -> str:
    """Escape HTML special characters."""
    return html.escape(text or "")

def truncate(text: str, max_len: int = 100, suffix: str = "...") -> str:
    """Truncate text to max_len characters."""
    if not text or len(text) <= max_len:
        return text or ""
    return text[: max_len - len(suffix)].rstrip() + suffix

def capitalize_words(text: str) -> str:
    """Capitalize each word in a string."""
    return " ".join(w.capitalize() for w in (text or "").split())

def slugify(text: str) -> str:
    """Convert text to a URL-safe slug."""
    text = (text or "").lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")[:64]

def normalize_whitespace(text: str) -> str:
    """Collapse multiple whitespace characters into single spaces."""
    return re.sub(r"\s+", " ", (text or "")).strip()

def remove_emoji(text: str) -> str:
    """Remove common emoji ranges from text."""
    if not text:
        return ""
    return re.sub(
        r"[\U0001F600-\U0001F64F\U0001F300-\U0001F5FF\U0001F680-\U0001F6FF"
        r"\U0001F1E0-\U0001F1FF\U00002702-\U000027B0\U000024C2-\U0001F251]+",
        "",
        text,
    )

def format_player_name(name: Optional[str], max_len: int = 20) -> str:
    """Sanitize and format a player display name."""
    name = normalize_whitespace(name or "")
    name = remove_emoji(name)
    name = re.sub(r"[^\w\s.\-]", "", name)
    name = truncate(name, max_len, "")
    return name or "Anonymous"
