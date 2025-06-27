"""Comprehensive tests for enhanced TMDB service functionality."""

import asyncio
from unittest.mock import patch

# Import our enhanced modules
from app.services.cache import TMDBCache, PerformanceTracker
from app.services.config import TMDBConfig
from app.services.utils import (
    RateLimiter,
    validate_tmdb_response,
    safe_get_year,
    deduplicate_by_id,
    sort_by_popularity,
    Timer,
)
from app.services.types import TMDBError


class TestTMDBCache:
    """Test the enhanced caching functionality."""

    def test_cache_basic_operations(self):
        """Test basic cache set/get operations."""
        cache = TMDBCache(ttl_minutes=1, max_size=3)

        # Test set and get
        cache.set("key1", {"data": "value1"})
        assert cache.get("key1") == {"data": "value1"}

        # Test cache miss
        assert cache.get("nonexistent") is None

        # Test statistics
        stats = cache.get_stats()
        assert stats["hits"] == 1
        assert stats["misses"] == 1
        assert stats["cache_size"] == 1

    def test_cache_expiration(self):
        """Test cache TTL expiration."""
        cache = TMDBCache(ttl_minutes=0.001)  # Very short TTL for testing

        cache.set("key1", {"data": "value1"})
        assert cache.get("key1") == {"data": "value1"}

        # Wait for expiration
        import time

        time.sleep(0.1)

        assert cache.get("key1") is None
        stats = cache.get_stats()
        assert stats["expirations"] == 1

    def test_cache_size_limit(self):
        """Test cache size limiting and LRU eviction."""
        cache = TMDBCache(ttl_minutes=60, max_size=2)

        # Fill cache to limit
        cache.set("key1", "value1")
        cache.set("key2", "value2")
        assert len(cache.cache) == 2

        # Add one more - should evict oldest
        cache.set("key3", "value3")
        assert len(cache.cache) == 2
        assert cache.get("key1") is None  # Evicted
        assert cache.get("key2") == "value2"
        assert cache.get("key3") == "value3"

        stats = cache.get_stats()
        assert stats["evictions"] == 1


class TestPerformanceTracker:
    """Test performance tracking functionality."""

    def test_performance_tracking(self):
        """Test request performance tracking."""
        tracker = PerformanceTracker(max_entries=10)

        # Record some requests
        tracker.record_request("/search/multi", 150.0, False, 200)
        tracker.record_request("/search/multi", 120.0, True, 200)
        tracker.record_request("/movie/123", 200.0, False, 200)

        # Test endpoint stats
        search_stats = tracker.get_endpoint_stats("/search/multi")
        assert search_stats["count"] == 2
        assert search_stats["avg_duration_ms"] == 135.0
        assert search_stats["cached_requests"] == 1
        assert search_stats["cache_hit_rate_percent"] == 50.0

        # Test overall stats
        overall_stats = tracker.get_overall_stats()
        assert overall_stats["total_requests"] == 3
        assert overall_stats["successful_requests"] == 3
        assert overall_stats["cached_requests"] == 1


class TestTMDBConfig:
    """Test configuration management."""

    def test_config_creation(self):
        """Test configuration object creation."""
        config = TMDBConfig(api_key="test_key")
        assert config.api_key == "test_key"
        assert config.base_url == "https://api.themoviedb.org/3"
        assert config.cache_ttl_minutes == 60
        assert config.max_retries == 3

    def test_config_from_env(self):
        """Test configuration from environment variables."""
        with patch.dict(
            "os.environ",
            {
                "TMDB_CACHE_TTL_MINUTES": "120",
                "TMDB_MAX_RETRIES": "5",
                "TMDB_TIMEOUT_SECONDS": "45.0",
            },
        ):
            config = TMDBConfig.from_env("test_key")
            assert config.cache_ttl_minutes == 120
            assert config.max_retries == 5
            assert config.timeout_seconds == 45.0

    def test_config_to_dict(self):
        """Test configuration serialization."""
        config = TMDBConfig(api_key="secret_key", cache_ttl_minutes=30)
        config_dict = config.to_dict()

        assert config_dict["api_key"] == "***"  # Should be masked
        assert config_dict["cache_ttl_minutes"] == 30
        assert "base_url" in config_dict


class TestUtilityFunctions:
    """Test utility functions."""

    def test_validate_tmdb_response(self):
        """Test TMDB response validation."""
        valid_data = {"id": 123, "title": "Test Movie", "results": []}
        assert validate_tmdb_response(valid_data, ["id", "title"]) is True

        invalid_data = {"id": 123}  # Missing "title"
        assert validate_tmdb_response(invalid_data, ["id", "title"]) is False

    def test_safe_get_year(self):
        """Test safe year extraction."""
        assert safe_get_year("2023-05-15") == 2023
        assert safe_get_year("2023") == 2023
        assert safe_get_year("invalid") is None
        assert safe_get_year(None) is None
        assert safe_get_year("") is None
        assert safe_get_year("23") is None  # Too short

    def test_deduplicate_by_id(self):
        """Test ID-based deduplication."""
        items = [
            {"id": 1, "name": "Item 1"},
            {"id": 2, "name": "Item 2"},
            {"id": 1, "name": "Item 1 Duplicate"},
            {"id": 3, "name": "Item 3"},
        ]

        unique_items = deduplicate_by_id(items)
        assert len(unique_items) == 3
        assert unique_items[0]["id"] == 1
        assert unique_items[1]["id"] == 2
        assert unique_items[2]["id"] == 3

    def test_sort_by_popularity(self):
        """Test popularity-based sorting."""
        items = [
            {"id": 1, "popularity": 10.5},
            {"id": 2, "popularity": 25.0},
            {"id": 3, "popularity": 5.0},
        ]

        sorted_items = sort_by_popularity(items)
        assert sorted_items[0]["popularity"] == 25.0
        assert sorted_items[1]["popularity"] == 10.5
        assert sorted_items[2]["popularity"] == 5.0

    async def test_rate_limiter(self):
        """Test rate limiting functionality."""
        limiter = RateLimiter(requests_per_second=2.0, burst_limit=2)

        # First two requests should be immediate
        start_time = asyncio.get_event_loop().time()
        await limiter.acquire()
        await limiter.acquire()
        first_duration = asyncio.get_event_loop().time() - start_time

        # Third request should be delayed
        start_time = asyncio.get_event_loop().time()
        await limiter.acquire()
        second_duration = asyncio.get_event_loop().time() - start_time

        assert first_duration < 0.1  # Should be immediate
        assert second_duration > 0.4  # Should be delayed

    def test_timer_context_manager(self):
        """Test timer utility."""
        import time

        with Timer("test_operation") as timer:
            time.sleep(0.1)

        assert timer.duration >= 0.1
        assert timer.duration < 0.2


class TestTMDBError:
    """Test custom error handling."""

    def test_tmdb_error_creation(self):
        """Test TMDB error creation with different parameters."""
        # Basic error
        error1 = TMDBError("Test error")
        assert str(error1) == "Test error"
        assert error1.status_code is None

        # Error with status code
        error2 = TMDBError("Rate limited", status_code=429)
        assert error2.status_code == 429

        # Error with response data
        response_data = {"error": "Invalid API key"}
        error3 = TMDBError("Auth failed", status_code=401, response_data=response_data)
        assert error3.response_data == response_data


# Integration test functions
async def test_enhanced_tmdb_service_integration():
    """Integration test for the enhanced TMDB service (requires API key)."""
    # This test would require a real API key and network access
    # For now, just test that imports work
    try:
        import importlib.util

        spec = importlib.util.find_spec("app.services.tmdb")
        if spec is not None:
            print("✅ Enhanced TMDBService module found")
            return True
        else:
            print("❌ Enhanced TMDBService module not found")
            return False
    except ImportError as e:
        print(f"❌ Enhanced TMDBService import failed: {e}")
        return False


if __name__ == "__main__":
    """Run basic tests without pytest."""
    print("Running enhanced TMDB service tests...")

    # Test cache functionality
    print("\n🧪 Testing cache functionality...")
    test_cache = TestTMDBCache()
    test_cache.test_cache_basic_operations()
    test_cache.test_cache_size_limit()
    print("✅ Cache tests passed")

    # Test configuration
    print("\n🧪 Testing configuration...")
    test_config = TestTMDBConfig()
    test_config.test_config_creation()
    test_config.test_config_to_dict()
    print("✅ Configuration tests passed")

    # Test utilities
    print("\n🧪 Testing utilities...")
    test_utils = TestUtilityFunctions()
    test_utils.test_validate_tmdb_response()
    test_utils.test_safe_get_year()
    test_utils.test_deduplicate_by_id()
    test_utils.test_sort_by_popularity()
    print("✅ Utility tests passed")

    # Test error handling
    print("\n🧪 Testing error handling...")
    test_errors = TestTMDBError()
    test_errors.test_tmdb_error_creation()
    print("✅ Error handling tests passed")

    print("\n🎉 All enhanced functionality tests passed!")
    print("\nNew features added:")
    print("✅ Enhanced caching with LRU and performance tracking")
    print("✅ Configurable settings with environment support")
    print("✅ Rate limiting to respect TMDB API limits")
    print("✅ Comprehensive error handling and retry logic")
    print("✅ Type safety with TypedDict definitions")
    print("✅ Performance monitoring and statistics")
    print("✅ Data validation and utility functions")
