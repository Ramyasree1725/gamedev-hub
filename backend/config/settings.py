
"""
Application configuration and settings for GameDev Hub.
Centralized configuration management for production deployment.
"""
import os
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional

@dataclass
class DatabaseConfig:
    """Database configuration (for future SQLAlchemy/Postgres integration)."""
    url: str = os.environ.get("DATABASE_URL", "sqlite:///gamedevhub.db")
    pool_size: int = 5
    max_overflow: int = 10
    echo: bool = False
    pool_pre_ping: bool = True
    connect_args: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RedisConfig:
    """Redis configuration for session and leaderboard caching."""
    host: str = os.environ.get("REDIS_HOST", "localhost")
    port: int = int(os.environ.get("REDIS_PORT", "6379"))
    db: int = 0
    password: Optional[str] = os.environ.get("REDIS_PASSWORD")
    socket_timeout: float = 5.0
    decode_responses: bool = True

@dataclass
class SecurityConfig:
    """Security related settings."""
    secret_key: str = os.environ.get("SECRET_KEY", "gamedev-hub-change-me-in-production-2026")
    session_cookie_secure: bool = os.environ.get("FLASK_ENV") == "production"
    session_cookie_httponly: bool = True
    session_cookie_samesite: str = "Lax"
    csrf_enabled: bool = True
    max_content_length: int = 16 * 1024 * 1024  # 16 MB
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds

@dataclass
class GameConfig:
    """Game-specific configuration values."""
    max_leaderboard_entries: int = 100
    score_submission_cooldown: int = 5  # seconds
    allowed_score_range: tuple = (0, 1_000_000)
    name_max_length: int = 20
    default_games: List[str] = field(default_factory=lambda: [
        "snake", "tictactoe", "memory", "breakout", "pong"
    ])
    difficulty_levels: List[str] = field(default_factory=lambda: [
        "easy", "medium", "hard", "expert"
    ])

@dataclass
class ServerConfig:
    """Server and runtime configuration."""
    host: str = "0.0.0.0"
    port: int = int(os.environ.get("PORT", "5000"))
    debug: bool = os.environ.get("FLASK_DEBUG", "0") == "1"
    workers: int = int(os.environ.get("WEB_CONCURRENCY", "2"))
    threads: int = 4
    timeout: int = 30
    keepalive: int = 2

@dataclass
class LoggingConfig:
    """Logging configuration."""
    level: str = os.environ.get("LOG_LEVEL", "INFO")
    format: str = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    date_format: str = "%Y-%m-%d %H:%M:%S"
    file_path: Optional[str] = os.environ.get("LOG_FILE")
    max_bytes: int = 10 * 1024 * 1024
    backup_count: int = 5

@dataclass
class AppConfig:
    """Root application configuration aggregating all sub-configs."""
    env: str = os.environ.get("FLASK_ENV", "development")
    database: DatabaseConfig = field(default_factory=DatabaseConfig)
    redis: RedisConfig = field(default_factory=RedisConfig)
    security: SecurityConfig = field(default_factory=SecurityConfig)
    game: GameConfig = field(default_factory=GameConfig)
    server: ServerConfig = field(default_factory=ServerConfig)
    logging: LoggingConfig = field(default_factory=LoggingConfig)

    @property
    def is_production(self) -> bool:
        return self.env == "production"

    @property
    def is_development(self) -> bool:
        return self.env == "development"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "env": self.env,
            "database_url": self.database.url.split("@")[-1] if "@" in self.database.url else self.database.url,
            "redis_host": self.redis.host,
            "max_leaderboard": self.game.max_leaderboard_entries,
            "port": self.server.port,
        }

# Singleton config instance
config = AppConfig()

# Feature flags
FEATURE_FLAGS = {
    "enable_ai_difficulty": True,
    "enable_multiplayer": False,
    "enable_achievements": True,
    "enable_daily_challenges": True,
    "enable_replay_system": False,
    "enable_spectator_mode": False,
    "enable_chat": False,
    "enable_tournaments": False,
    "strict_score_validation": True,
    "cache_leaderboards": True,
}

def get_feature(name: str, default: bool = False) -> bool:
    """Retrieve a feature flag value."""
    return FEATURE_FLAGS.get(name, default)
