
"""
Serializer module 5 for GameDev Hub API responses and request validation.
"""
from typing import Any, Dict, List, Optional
from datetime import datetime
import re

class BaseSerializer:
    """Base serializer with common validation helpers."""

    def __init__(self, data: Optional[Dict] = None):
        self.data = data or {}
        self.errors: List[str] = []
        self.validated: Dict[str, Any] = {}

    def is_valid(self) -> bool:
        self.errors = []
        self.validated = {}
        self.validate()
        return len(self.errors) == 0

    def validate(self):
        raise NotImplementedError

    def add_error(self, field: str, message: str):
        self.errors.append(f"{field}: {message}")

    def require(self, field: str, type_=None):
        if field not in self.data or self.data[field] is None:
            self.add_error(field, "required")
            return None
        val = self.data[field]
        if type_ and not isinstance(val, type_):
            self.add_error(field, f"must be {type_.__name__}")
            return None
        self.validated[field] = val
        return val

    def optional(self, field: str, default=None, type_=None):
        val = self.data.get(field, default)
        if val is not None and type_ and not isinstance(val, type_):
            self.add_error(field, f"must be {type_.__name__}")
            return default
        self.validated[field] = val
        return val


class ScoreSerializer(BaseSerializer):
    def validate(self):
        game = self.require("game", str)
        if game and game not in ("snake", "tictactoe", "memory", "breakout", "pong",
                                  "asteroids", "flappy", "tetris", "pacman", "racing"):
            self.add_error("game", "unknown game id")
        name = self.require("name", str)
        if name and (len(name) < 1 or len(name) > 20):
            self.add_error("name", "must be 1-20 characters")
        if name and not re.match(r"^[\w\s.\-]+$", name):
            self.add_error("name", "invalid characters")
        score = self.require("score", (int, float))
        if score is not None and (score < 0 or score > 1_000_000):
            self.add_error("score", "out of range")
        self.optional("difficulty", "medium", str)
        self.optional("metadata", {}, dict)


class ProfileSerializer(BaseSerializer):
    def validate(self):
        self.require("name", str)
        self.optional("avatar", None, str)
        self.optional("bio", "", str)
        self.optional("preferred_games", [], list)


class ChallengeSerializer(BaseSerializer):
    def validate(self):
        self.require("game_id", str)
        self.require("title", str)
        target = self.require("target_score", (int, float))
        if target is not None and target <= 0:
            self.add_error("target_score", "must be positive")
        self.optional("reward_points", 10, int)
        self.optional("expires_at", None, str)


class TournamentSerializer(BaseSerializer):
    def validate(self):
        self.require("name", str)
        self.require("game_id", str)
        self.optional("max_players", 16, int)
        self.optional("start_at", None, str)
        self.optional("entry_fee", 0, int)


def serialize_score_entry(entry: Dict) -> Dict:
    return {
        "id": entry.get("id"),
        "name": entry.get("name") or entry.get("player_name"),
        "score": entry.get("score"),
        "timestamp": entry.get("timestamp"),
        "difficulty": entry.get("difficulty", "medium"),
    }

def serialize_game_info(game: Dict) -> Dict:
    return {
        "id": game.get("id"),
        "name": game.get("name"),
        "description": game.get("description"),
        "difficulty": game.get("difficulty"),
        "controls": game.get("controls"),
        "color": game.get("color"),
        "icon": game.get("icon"),
    }

def serialize_list(items: List[Dict], serializer_fn) -> List[Dict]:
    return [serializer_fn(i) for i in items]

def paginate(items: List, page: int = 1, per_page: int = 20) -> Dict:
    total = len(items)
    pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, pages))
    start = (page - 1) * per_page
    return {
        "results": items[start:start + per_page],
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": pages,
            "has_next": page < pages,
            "has_prev": page > 1,
        },
    }

MODULE_ID = 5
