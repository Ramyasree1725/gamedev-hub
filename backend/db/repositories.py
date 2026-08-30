
"""
Repository pattern implementations for GameDev Hub domain objects.
"""
from typing import List, Optional, Dict, Any
from .store import get_db, Collection
from datetime import datetime

class ScoreRepository:
    def __init__(self):
        self.col: Collection = get_db().collection("scores")

    def add(self, game_id: str, name: str, score: int, difficulty: str = "medium") -> Dict:
        return self.col.insert({
            "game_id": game_id,
            "name": name,
            "score": score,
            "difficulty": difficulty,
        })

    def top_for_game(self, game_id: str, n: int = 20) -> List[Dict]:
        items = self.col.find(lambda d: d.get("game_id") == game_id, limit=500)
        items.sort(key=lambda x: x.get("score", 0), reverse=True)
        return items[:n]

    def by_player(self, name: str) -> List[Dict]:
        return self.col.find(lambda d: d.get("name") == name, limit=100)


class PlayerRepository:
    def __init__(self):
        self.col: Collection = get_db().collection("players")

    def get_or_create(self, name: str) -> Dict:
        existing = self.col.find(lambda d: d.get("name") == name, limit=1)
        if existing:
            return existing[0]
        return self.col.insert({
            "name": name,
            "total_score": 0,
            "games_played": 0,
            "achievements": [],
        })

    def increment_stats(self, name: str, score: int) -> Optional[Dict]:
        players = self.col.find(lambda d: d.get("name") == name, limit=1)
        if not players:
            p = self.get_or_create(name)
            return self.col.update(p["id"], {
                "total_score": score,
                "games_played": 1,
            })
        p = players[0]
        return self.col.update(p["id"], {
            "total_score": p.get("total_score", 0) + score,
            "games_played": p.get("games_played", 0) + 1,
        })


class AchievementRepository:
    def __init__(self):
        self.col: Collection = get_db().collection("achievements")

    def unlock(self, player: str, achievement_id: str) -> Dict:
        existing = self.col.find(
            lambda d: d.get("player") == player and d.get("achievement_id") == achievement_id,
            limit=1,
        )
        if existing:
            return existing[0]
        return self.col.insert({
            "player": player,
            "achievement_id": achievement_id,
            "unlocked_at": datetime.utcnow().isoformat() + "Z",
        })

    def for_player(self, player: str) -> List[Dict]:
        return self.col.find(lambda d: d.get("player") == player, limit=100)
