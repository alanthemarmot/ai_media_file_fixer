from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    TMDB_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


@lru_cache()
def get_settings() -> Settings:
    return Settings()


def has_server_api_key() -> bool:
    """Check if the server has a TMDB API key configured"""
    settings = get_settings()
    return settings.TMDB_API_KEY is not None and settings.TMDB_API_KEY.strip() != ""
