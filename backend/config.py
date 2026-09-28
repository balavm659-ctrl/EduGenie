"""
EduGenie Configuration
Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # Application
    APP_NAME: str = "EduGenie"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "AI-Powered Personal Learning Companion"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./edugenie.db"

    # JWT Authentication
    JWT_SECRET: str = "change_this_to_a_secure_random_string"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Google Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: str = ".pdf,.txt"

    # XP Configuration
    XP_QUESTION: int = 5
    XP_QUIZ_COMPLETE: int = 20
    XP_QUIZ_PERFECT: int = 50
    XP_LEARNING_PATH_MILESTONE: int = 30
    XP_DAILY_STREAK_BONUS: int = 10
    XP_EXPLANATION: int = 5
    XP_SUMMARY: int = 5

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Cached settings instance."""
    return Settings()
