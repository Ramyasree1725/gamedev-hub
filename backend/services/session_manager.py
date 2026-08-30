
"""
Game session management for GameDev Hub.
Tracks active play sessions, anti-cheat heuristics, and session tokens.
"""
from typing import Dict, Optional, Any, List
from datetime import datetime, timedelta
from dataclasses import dataclass, field, asdict
import hashlib
import secrets
import threading

@dataclass
class GameSession:
    session_id: str
    game_id: str
    player_name: str
    started_at: str
    last_heartbeat: str
    score: int = 0
    moves: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    valid: bool = True

    def to_dict(self) -> Dict:
        return asdict(self)


class SessionManager:
    def __init__(self, ttl_seconds: int = 3600, max_sessions: int = 10000):
        self._sessions: Dict[str, GameSession] = {}
        self.ttl = timedelta(seconds=ttl_seconds)
        self.max_sessions = max_sessions
        self._lock = threading.Lock()

    def create(self, game_id: str, player_name: str, metadata: Optional[Dict] = None) -> GameSession:
        with self._lock:
            self._evict_expired()
            if len(self._sessions) >= self.max_sessions:
                # Drop oldest
                oldest = min(self._sessions.values(), key=lambda s: s.started_at)
                del self._sessions[oldest.session_id]
            sid = secrets.token_hex(16)
            now = datetime.utcnow().isoformat() + "Z"
            session = GameSession(
                session_id=sid,
                game_id=game_id,
                player_name=player_name[:20],
                started_at=now,
                last_heartbeat=now,
                metadata=metadata or {},
            )
            self._sessions[sid] = session
            return session

    def heartbeat(self, session_id: str, score: int = 0, moves: int = 0) -> Optional[GameSession]:
        with self._lock:
            s = self._sessions.get(session_id)
            if not s or not s.valid:
                return None
            s.last_heartbeat = datetime.utcnow().isoformat() + "Z"
            if score > s.score:
                # Basic anti-cheat: score should not jump unrealistically
                delta = score - s.score
                if delta > 5000:
                    s.valid = False
                    return s
                s.score = score
            s.moves = max(s.moves, moves)
            return s

    def get(self, session_id: str) -> Optional[GameSession]:
        with self._lock:
            return self._sessions.get(session_id)

    def end(self, session_id: str) -> Optional[GameSession]:
        with self._lock:
            return self._sessions.pop(session_id, None)

    def _evict_expired(self):
        now = datetime.utcnow()
        expired = []
        for sid, s in self._sessions.items():
            try:
                last = datetime.fromisoformat(s.last_heartbeat.replace("Z", ""))
                if now - last > self.ttl:
                    expired.append(sid)
            except Exception:
                expired.append(sid)
        for sid in expired:
            del self._sessions[sid]

    def active_count(self) -> int:
        with self._lock:
            self._evict_expired()
            return len(self._sessions)

    def stats(self) -> Dict[str, Any]:
        with self._lock:
            by_game: Dict[str, int] = {}
            for s in self._sessions.values():
                by_game[s.game_id] = by_game.get(s.game_id, 0) + 1
            return {
                "active": len(self._sessions),
                "by_game": by_game,
            }


# Singleton
session_manager = SessionManager()

def get_session_manager() -> SessionManager:
    return session_manager
