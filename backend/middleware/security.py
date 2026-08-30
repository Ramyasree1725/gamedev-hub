
"""
Security middleware for GameDev Hub: headers, CSRF helpers, input sanitization.
"""
from flask import request, g, abort
from functools import wraps
import re
import hashlib
import hmac
import time
from typing import Optional, Callable, Any

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
}

def apply_security_headers(response):
    for key, value in SECURITY_HEADERS.items():
        response.headers.setdefault(key, value)
    return response

def sanitize_html(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"<script[^>]*>.*?</script>", "", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()

def sanitize_filename(name: str) -> str:
    name = re.sub(r"[^\w.\-]", "_", name)
    return name[:200]

def constant_time_compare(a: str, b: str) -> bool:
    return hmac.compare_digest(a.encode(), b.encode())

def generate_token(secret: str, payload: str, expiry_seconds: int = 3600) -> str:
    expiry = int(time.time()) + expiry_seconds
    msg = f"{payload}:{expiry}"
    sig = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
    return f"{msg}:{sig}"

def verify_token(secret: str, token: str) -> Optional[str]:
    try:
        parts = token.rsplit(":", 2)
        if len(parts) != 3:
            return None
        payload, expiry_str, sig = parts
        msg = f"{payload}:{expiry_str}"
        expected = hmac.new(secret.encode(), msg.encode(), hashlib.sha256).hexdigest()
        if not constant_time_compare(sig, expected):
            return None
        if int(expiry_str) < time.time():
            return None
        return payload
    except Exception:
        return None

def require_json(f: Callable) -> Callable:
    @wraps(f)
    def wrapped(*args, **kwargs):
        if not request.is_json:
            abort(415, description="Content-Type must be application/json")
        return f(*args, **kwargs)
    return wrapped

def setup_security(app):
    app.after_request(apply_security_headers)
