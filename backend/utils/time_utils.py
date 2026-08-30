
"""
Time and date utilities for GameDev Hub.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

def utcnow() -> datetime:
    return datetime.now(timezone.utc)

def utcnow_iso() -> str:
    return utcnow().strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

def parse_iso(value: str) -> Optional[datetime]:
    if not value:
        return None
    try:
        value = value.replace("Z", "+00:00")
        return datetime.fromisoformat(value)
    except Exception:
        return None

def format_duration(seconds: float) -> str:
    seconds = int(seconds)
    if seconds < 60:
        return f"{seconds}s"
    minutes, sec = divmod(seconds, 60)
    if minutes < 60:
        return f"{minutes}m {sec}s"
    hours, minutes = divmod(minutes, 60)
    return f"{hours}h {minutes}m"

def time_ago(iso_str: str) -> str:
    dt = parse_iso(iso_str)
    if not dt:
        return ""
    now = utcnow()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    delta = now - dt
    secs = int(delta.total_seconds())
    if secs < 0:
        return "in the future"
    if secs < 60:
        return "just now"
    if secs < 3600:
        return f"{secs // 60}m ago"
    if secs < 86400:
        return f"{secs // 3600}h ago"
    if secs < 604800:
        return f"{secs // 86400}d ago"
    return dt.strftime("%Y-%m-%d")

def is_expired(iso_str: str, ttl_seconds: int) -> bool:
    dt = parse_iso(iso_str)
    if not dt:
        return True
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return utcnow() > dt + timedelta(seconds=ttl_seconds)

def start_of_day(dt: Optional[datetime] = None) -> datetime:
    dt = dt or utcnow()
    return dt.replace(hour=0, minute=0, second=0, microsecond=0)

def end_of_day(dt: Optional[datetime] = None) -> datetime:
    dt = dt or utcnow()
    return dt.replace(hour=23, minute=59, second=59, microsecond=999999)
