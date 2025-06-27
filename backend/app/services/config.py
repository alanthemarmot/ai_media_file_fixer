"""Configuration and settings for TMDB service."""

import os
from typing import Dict, Any
from dataclasses import dataclass


@dataclass
class TMDBConfig:
    """Configuration for TMDB service."""

    # API settings
    api_key: str
    base_url: str = "https://api.themoviedb.org/3"

    # Cache settings
    cache_ttl_minutes: int = 60
    cache_max_size: int = 1000

    # Request settings
    timeout_seconds: float = 30.0
    max_connections: int = 10
    max_keepalive_connections: int = 5

    # Retry settings
    max_retries: int = 3
    retry_delay: float = 1.0
    exponential_backoff: bool = True

    # Rate limiting
    requests_per_second: float = 40.0  # TMDB allows 40 requests per 10 seconds
    burst_limit: int = 40

    # Result limits
    max_search_results: int = 100
    max_cast_members: int = 15
    max_filmography_items: int = 500

    # Logging
    log_level: str = "INFO"
    log_requests: bool = True
    log_performance: bool = True

    @classmethod
    def from_env(cls, api_key: str) -> "TMDBConfig":
        """Create configuration from environment variables."""
        return cls(
            api_key=api_key,
            cache_ttl_minutes=int(os.getenv("TMDB_CACHE_TTL_MINUTES", "60")),
            cache_max_size=int(os.getenv("TMDB_CACHE_MAX_SIZE", "1000")),
            timeout_seconds=float(os.getenv("TMDB_TIMEOUT_SECONDS", "30.0")),
            max_retries=int(os.getenv("TMDB_MAX_RETRIES", "3")),
            retry_delay=float(os.getenv("TMDB_RETRY_DELAY", "1.0")),
            max_search_results=int(os.getenv("TMDB_MAX_SEARCH_RESULTS", "100")),
            max_cast_members=int(os.getenv("TMDB_MAX_CAST_MEMBERS", "15")),
            log_level=os.getenv("TMDB_LOG_LEVEL", "INFO"),
            log_requests=os.getenv("TMDB_LOG_REQUESTS", "true").lower() == "true",
            log_performance=os.getenv("TMDB_LOG_PERFORMANCE", "true").lower() == "true",
        )

    def to_dict(self) -> Dict[str, Any]:
        """Convert configuration to dictionary."""
        return {
            "api_key": "***",  # Don't expose API key
            "base_url": self.base_url,
            "cache_ttl_minutes": self.cache_ttl_minutes,
            "cache_max_size": self.cache_max_size,
            "timeout_seconds": self.timeout_seconds,
            "max_connections": self.max_connections,
            "max_keepalive_connections": self.max_keepalive_connections,
            "max_retries": self.max_retries,
            "retry_delay": self.retry_delay,
            "exponential_backoff": self.exponential_backoff,
            "requests_per_second": self.requests_per_second,
            "burst_limit": self.burst_limit,
            "max_search_results": self.max_search_results,
            "max_cast_members": self.max_cast_members,
            "max_filmography_items": self.max_filmography_items,
            "log_level": self.log_level,
            "log_requests": self.log_requests,
            "log_performance": self.log_performance,
        }
