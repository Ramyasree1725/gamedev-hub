
"""
Service layer module 9 for GameDev Hub.
Business logic and orchestration for game-related operations.
"""
from typing import List, Dict, Optional, Any, Tuple
from datetime import datetime, timedelta
import logging
import random

logger = logging.getLogger(__name__)
SERVICE_ID = 9

class BaseService:
    """Base class for all services providing common utilities."""

    def __init__(self, name: str = "base"):
        self.name = name
        self.created_at = datetime.utcnow()
        self.call_count = 0

    def _log(self, message: str, level: str = "info"):
        self.call_count += 1
        getattr(logger, level, logger.info)(f"[{self.name}] {message}")

    def health(self) -> Dict[str, Any]:
        return {
            "service": self.name,
            "status": "ok",
            "calls": self.call_count,
            "uptime_seconds": (datetime.utcnow() - self.created_at).total_seconds(),
        }


class ScoreService(BaseService):
    """Handles score validation, ranking, and leaderboard operations."""

    def __init__(self):
        super().__init__(f"score_service_{SERVICE_ID}")
        self._cache: Dict[str, List[Dict]] = {}

    def validate_submission(self, game_id: str, name: str, score: int) -> Tuple[bool, str]:
        if not game_id or not isinstance(game_id, str):
            return False, "Invalid game_id"
        if not name or len(name.strip()) == 0:
            return False, "Name required"
        if len(name) > 20:
            return False, "Name too long"
        if not isinstance(score, (int, float)) or score < 0:
            return False, "Invalid score"
        if score > 1_000_000:
            return False, "Score exceeds maximum"
        return True, "OK"

    def rank_scores(self, scores: List[Dict], limit: int = 20) -> List[Dict]:
        sorted_scores = sorted(scores, key=lambda x: x.get("score", 0), reverse=True)
        return sorted_scores[:limit]

    def compute_percentile(self, score: int, all_scores: List[int]) -> float:
        if not all_scores:
            return 100.0
        below = sum(1 for s in all_scores if s < score)
        return round((below / len(all_scores)) * 100, 1)

    def detect_anomalies(self, scores: List[Dict], threshold_sigma: float = 3.0) -> List[Dict]:
        if len(scores) < 5:
            return []
        values = [s["score"] for s in scores]
        mean = sum(values) / len(values)
        variance = sum((v - mean) ** 2 for v in values) / len(values)
        std = variance ** 0.5 if variance > 0 else 1
        anomalies = []
        for s in scores:
            z = abs(s["score"] - mean) / std
            if z > threshold_sigma:
                anomalies.append({**s, "z_score": round(z, 2)})
        return anomalies


class LeaderboardService(BaseService):
    """Manages leaderboard state and queries."""

    def __init__(self, max_entries: int = 100):
        super().__init__(f"leaderboard_service_{SERVICE_ID}")
        self.max_entries = max_entries
        self._boards: Dict[str, List[Dict]] = {}

    def add_entry(self, game_id: str, entry: Dict) -> Dict:
        if game_id not in self._boards:
            self._boards[game_id] = []
        self._boards[game_id].append(entry)
        self._boards[game_id] = sorted(
            self._boards[game_id], key=lambda x: x["score"], reverse=True
        )[: self.max_entries]
        return entry

    def get_top(self, game_id: str, n: int = 15) -> List[Dict]:
        return self._boards.get(game_id, [])[:n]

    def get_player_rank(self, game_id: str, player_name: str) -> Optional[int]:
        board = self._boards.get(game_id, [])
        for idx, entry in enumerate(board):
            if entry.get("name") == player_name:
                return idx + 1
        return None

    def get_stats(self, game_id: str) -> Dict[str, Any]:
        board = self._boards.get(game_id, [])
        if not board:
            return {"count": 0, "avg": 0, "max": 0, "min": 0}
        scores = [e["score"] for e in board]
        return {
            "count": len(scores),
            "avg": round(sum(scores) / len(scores), 1),
            "max": max(scores),
            "min": min(scores),
        }


class GameCatalogService(BaseService):
    """Provides game catalog and metadata."""

    CATALOG = [
        {"id": "snake", "name": "Classic Snake", "difficulty": "Easy", "has_ai": False},
        {"id": "tictactoe", "name": "Tic Tac Toe", "difficulty": "Easy", "has_ai": True},
        {"id": "memory", "name": "Memory Match", "difficulty": "Medium", "has_ai": False},
        {"id": "breakout", "name": "Breakout", "difficulty": "Medium", "has_ai": False},
        {"id": "pong", "name": "Pong", "difficulty": "Hard", "has_ai": True},
    ]

    def __init__(self):
        super().__init__(f"catalog_service_{SERVICE_ID}")

    def list_games(self) -> List[Dict]:
        return list(self.CATALOG)

    def get_game(self, game_id: str) -> Optional[Dict]:
        for g in self.CATALOG:
            if g["id"] == game_id:
                return g
        return None

    def filter_by_difficulty(self, difficulty: str) -> List[Dict]:
        return [g for g in self.CATALOG if g["difficulty"].lower() == difficulty.lower()]

    def search(self, query: str) -> List[Dict]:
        q = query.lower()
        return [g for g in self.CATALOG if q in g["name"].lower() or q in g["id"]]


class AchievementService(BaseService):
    """Tracks and awards achievements."""

    def __init__(self):
        super().__init__(f"achievement_service_{SERVICE_ID}")
        self._player_achievements: Dict[str, List[str]] = {}

    def check_and_award(self, player: str, game_id: str, score: int) -> List[str]:
        awarded = []
        thresholds = {
            "snake": [(100, "snake_100"), (500, "snake_500")],
            "memory": [(200, "memory_fast")],
            "breakout": [(100, "breakout_clear")],
            "pong": [(5, "pong_win")],
            "tictactoe": [(5, "tictactoe_streak")],
        }
        for threshold, ach_id in thresholds.get(game_id, []):
            if score >= threshold:
                if self._award(player, ach_id):
                    awarded.append(ach_id)
        return awarded

    def _award(self, player: str, ach_id: str) -> bool:
        if player not in self._player_achievements:
            self._player_achievements[player] = []
        if ach_id not in self._player_achievements[player]:
            self._player_achievements[player].append(ach_id)
            self._log(f"Awarded {ach_id} to {player}")
            return True
        return False

    def get_player_achievements(self, player: str) -> List[str]:
        return self._player_achievements.get(player, [])


class AnalyticsService(BaseService):
    """Simple analytics aggregation."""

    def __init__(self):
        super().__init__(f"analytics_service_{SERVICE_ID}")
        self._events: List[Dict] = []

    def track(self, event_type: str, data: Dict[str, Any]):
        self._events.append({
            "type": event_type,
            "data": data,
            "ts": datetime.utcnow().isoformat() + "Z",
        })
        if len(self._events) > 10000:
            self._events = self._events[-5000:]

    def event_counts(self) -> Dict[str, int]:
        counts: Dict[str, int] = {}
        for e in self._events:
            counts[e["type"]] = counts.get(e["type"], 0) + 1
        return counts

    def recent(self, n: int = 50) -> List[Dict]:
        return self._events[-n:]


class NotificationService(BaseService):
    """In-app notification queue (stub for future WebSocket)."""

    def __init__(self):
        super().__init__(f"notification_service_{SERVICE_ID}")
        self._queue: List[Dict] = []

    def push(self, user: str, title: str, body: str, level: str = "info"):
        self._queue.append({
            "user": user,
            "title": title,
            "body": body,
            "level": level,
            "ts": datetime.utcnow().isoformat() + "Z",
            "read": False,
        })

    def get_unread(self, user: str) -> List[Dict]:
        return [n for n in self._queue if n["user"] == user and not n["read"]]

    def mark_read(self, user: str):
        for n in self._queue:
            if n["user"] == user:
                n["read"] = True


def create_score_service() -> ScoreService:
    return ScoreService()

def create_leaderboard_service(max_entries: int = 100) -> LeaderboardService:
    return LeaderboardService(max_entries)

def create_catalog_service() -> GameCatalogService:
    return GameCatalogService()

def create_achievement_service() -> AchievementService:
    return AchievementService()

def get_all_service_names() -> List[str]:
    return [
        "ScoreService", "LeaderboardService", "GameCatalogService",
        "AchievementService", "AnalyticsService", "NotificationService",
    ]
