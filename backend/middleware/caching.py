
"""
Simple response caching helpers for GameDev Hub.
"""
from functools import wraps
from flask import request, make_response
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Callable
import hashlib
import json
import threading

class SimpleCache:
    def __init__(self, default_ttl: int = 60):
        self._store: Dict[str, tuple] = {}
        self.default_ttl = default_ttl
        self._lock = threading.Lock()

    def _key(self, *parts) -> str:
        raw = "|".join(str(p) for p in parts)
        return hashlib.md5(raw.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if not entry:
                return None
            value, expires = entry
            if datetime.utcnow() > expires:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        ttl = ttl if ttl is not None else self.default_ttl
        expires = datetime.utcnow() + timedelta(seconds=ttl)
        with self._lock:
            self._store[key] = (value, expires)

    def delete(self, key: str):
        with self._lock:
            self._store.pop(key, None)

    def clear(self):
        with self._lock:
            self._store.clear()

    def stats(self) -> Dict[str, Any]:
        with self._lock:
            return {"entries": len(self._store), "ttl_default": self.default_ttl}

_cache = SimpleCache()

def cached(ttl: int = 60, key_prefix: str = ""):
    def decorator(f: Callable) -> Callable:
        @wraps(f)
        def wrapped(*args, **kwargs):
            cache_key = _cache._key(key_prefix, f.__name__, request.path, request.query_string.decode())
            hit = _cache.get(cache_key)
            if hit is not None:
                return hit
            result = f(*args, **kwargs)
            _cache.set(cache_key, result, ttl)
            return result
        return wrapped
    return decorator

def get_cache() -> SimpleCache:
    return _cache
