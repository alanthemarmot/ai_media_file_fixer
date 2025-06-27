"""Enhanced caching system for TMDB API responses."""

import json
import logging
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, Tuple
from collections import OrderedDict
import hashlib

logger = logging.getLogger(__name__)


class TMDBCache:
    """Enhanced LRU cache with TTL, size limits, and performance tracking."""

    def __init__(self, ttl_minutes: int = 60, max_size: int = 1000):
        self.ttl = timedelta(minutes=ttl_minutes)
        self.max_size = max_size
        self.cache: OrderedDict[str, Tuple[Any, datetime]] = OrderedDict()

        # Statistics
        self.hits = 0
        self.misses = 0
        self.evictions = 0
        self.expirations = 0

    def _make_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Create a stable cache key from endpoint and parameters."""
        # Remove sensitive data and sort for consistency
        clean_params = {k: v for k, v in params.items() if k != "api_key"}
        param_str = json.dumps(clean_params, sort_keys=True)
        key_data = f"{endpoint}:{param_str}"
        return hashlib.md5(key_data.encode()).hexdigest()

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if it exists and hasn't expired."""
        if key not in self.cache:
            self.misses += 1
            logger.debug(f"Cache miss for key: {key[:8]}...")
            return None

        data, timestamp = self.cache[key]

        # Check if expired
        if datetime.now() - timestamp > self.ttl:
            del self.cache[key]
            self.expirations += 1
            self.misses += 1
            logger.debug(f"Cache expired for key: {key[:8]}...")
            return None

        # Move to end (LRU)
        self.cache.move_to_end(key)
        self.hits += 1
        logger.debug(f"Cache hit for key: {key[:8]}...")
        return data

    def set(self, key: str, value: Any) -> None:
        """Set cached value, evicting oldest if necessary."""
        # Remove if already exists
        if key in self.cache:
            del self.cache[key]

        # Add new value
        self.cache[key] = (value, datetime.now())

        # Evict oldest if over size limit
        while len(self.cache) > self.max_size:
            oldest_key = next(iter(self.cache))
            del self.cache[oldest_key]
            self.evictions += 1
            logger.debug(f"Cache evicted key: {oldest_key[:8]}...")

        logger.debug(f"Cache set for key: {key[:8]}...")

    def clear(self) -> None:
        """Clear all cached data."""
        cache_size = len(self.cache)
        self.cache.clear()
        logger.info(f"Cache cleared: {cache_size} items removed")

    def cleanup_expired(self) -> int:
        """Remove expired entries and return count of removed items."""
        now = datetime.now()
        expired_keys = [
            key
            for key, (_, timestamp) in self.cache.items()
            if now - timestamp > self.ttl
        ]

        for key in expired_keys:
            del self.cache[key]
            self.expirations += 1

        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")

        return len(expired_keys)

    def get_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics."""
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0

        return {
            "cache_size": len(self.cache),
            "max_size": self.max_size,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate_percent": round(hit_rate, 2),
            "evictions": self.evictions,
            "expirations": self.expirations,
            "ttl_minutes": self.ttl.total_seconds() / 60,
        }

    def get_key_info(self, endpoint: str, params: Dict[str, Any]) -> Tuple[str, bool]:
        """Get cache key and whether it exists."""
        key = self._make_key(endpoint, params)
        exists = key in self.cache and datetime.now() - self.cache[key][1] <= self.ttl
        return key, exists


class PerformanceTracker:
    """Track API request performance metrics."""

    def __init__(self, max_entries: int = 1000):
        self.max_entries = max_entries
        self.metrics: OrderedDict[str, Dict[str, Any]] = OrderedDict()

    def record_request(
        self,
        endpoint: str,
        duration_ms: float,
        cached: bool,
        status_code: Optional[int] = None,
        error: Optional[str] = None,
    ) -> None:
        """Record a request's performance metrics."""
        timestamp = datetime.now()
        request_id = f"{endpoint}_{timestamp.strftime('%H%M%S')}"

        self.metrics[request_id] = {
            "endpoint": endpoint,
            "duration_ms": duration_ms,
            "cached": cached,
            "timestamp": timestamp,
            "status_code": status_code,
            "error": error,
        }

        # Keep only the most recent entries
        while len(self.metrics) > self.max_entries:
            self.metrics.popitem(last=False)

    def get_endpoint_stats(self, endpoint: str) -> Dict[str, Any]:
        """Get statistics for a specific endpoint."""
        endpoint_metrics = [
            m
            for m in self.metrics.values()
            if m["endpoint"] == endpoint and m["error"] is None
        ]

        if not endpoint_metrics:
            return {"endpoint": endpoint, "count": 0}

        durations = [m["duration_ms"] for m in endpoint_metrics]
        cached_count = sum(1 for m in endpoint_metrics if m["cached"])

        return {
            "endpoint": endpoint,
            "count": len(endpoint_metrics),
            "avg_duration_ms": round(sum(durations) / len(durations), 2),
            "min_duration_ms": min(durations),
            "max_duration_ms": max(durations),
            "cached_requests": cached_count,
            "cache_hit_rate_percent": round(
                cached_count / len(endpoint_metrics) * 100, 2
            ),
        }

    def get_overall_stats(self) -> Dict[str, Any]:
        """Get overall performance statistics."""
        all_metrics = list(self.metrics.values())
        successful_metrics = [m for m in all_metrics if m["error"] is None]

        if not successful_metrics:
            return {"total_requests": len(all_metrics), "successful_requests": 0}

        durations = [m["duration_ms"] for m in successful_metrics]
        cached_count = sum(1 for m in successful_metrics if m["cached"])
        error_count = len(all_metrics) - len(successful_metrics)

        return {
            "total_requests": len(all_metrics),
            "successful_requests": len(successful_metrics),
            "error_requests": error_count,
            "avg_duration_ms": round(sum(durations) / len(durations), 2),
            "cached_requests": cached_count,
            "cache_hit_rate_percent": round(
                cached_count / len(successful_metrics) * 100, 2
            ),
            "error_rate_percent": round(error_count / len(all_metrics) * 100, 2),
        }
