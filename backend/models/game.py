
"""
Game domain models for GameDev Hub.
"""
from dataclasses import dataclass, field, asdict
from typing import List, Dict, Optional, Any
from datetime import datetime
import uuid

@dataclass
class GameInfo:
    id: str
    name: str
    description: str
    difficulty: str
    controls: str
    color: str
    icon: str
    category: str = "arcade"
    min_players: int = 1
    max_players: int = 1
    has_ai: bool = False
    tags: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class ScoreEntry:
    id: str
    game_id: str
    player_name: str
    score: int
    timestamp: str
    difficulty: str = "medium"
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

    @classmethod
    def create(cls, game_id: str, player_name: str, score: int, difficulty: str = "medium") -> "ScoreEntry":
        return cls(
            id=str(uuid.uuid4())[:8],
            game_id=game_id,
            player_name=player_name,
            score=score,
            timestamp=datetime.utcnow().isoformat() + "Z",
            difficulty=difficulty,
        )

@dataclass
class PlayerProfile:
    id: str
    name: str
    created_at: str
    total_score: int = 0
    games_played: int = 0
    achievements: List[str] = field(default_factory=list)
    preferred_games: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class Achievement:
    id: str
    name: str
    description: str
    icon: str
    game_id: Optional[str] = None
    threshold: int = 0
    points: int = 10

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class DailyChallenge:
    id: str
    game_id: str
    title: str
    description: str
    target_score: int
    reward_points: int
    date: str
    completed_by: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

# Predefined achievements
ACHIEVEMENTS = [
    Achievement("first_win", "First Victory", "Win your first game", "🏆", threshold=1, points=10),
    Achievement("snake_100", "Snake Charmer", "Score 100+ in Snake", "🐍", "snake", 100, 25),
    Achievement("snake_500", "Serpent Master", "Score 500+ in Snake", "🐍", "snake", 500, 50),
    Achievement("memory_fast", "Quick Mind", "Complete Memory under 20 moves", "🧠", "memory", 20, 30),
    Achievement("breakout_clear", "Brick Breaker", "Clear all bricks in Breakout", "🧱", "breakout", 1, 40),
    Achievement("pong_win", "Pong Champion", "Beat the AI in Pong", "🏓", "pong", 5, 35),
    Achievement("tictactoe_streak", "Unbeatable", "Win 5 Tic Tac Toe games", "❌", "tictactoe", 5, 45),
    Achievement("high_roller", "High Roller", "Reach 10,000 total points", "💎", threshold=10000, points=100),
    Achievement("dedicated", "Dedicated Player", "Play 50 games", "🎮", threshold=50, points=60),
    Achievement("explorer", "Explorer", "Play all 5 games", "🗺️", threshold=5, points=50),
]

def get_achievement(achievement_id: str) -> Optional[Achievement]:
    for a in ACHIEVEMENTS:
        if a.id == achievement_id:
            return a
    return None
