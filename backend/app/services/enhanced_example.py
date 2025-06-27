"""Example integration of enhanced TMDB service with existing application."""

from typing import Dict, Any
import logging
from app.services.tmdb import TMDBService
from app.services.config import TMDBConfig
from app.services.types import TMDBError

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class EnhancedMediaService:
    """Enhanced media service with improved error handling and performance."""

    def __init__(self, api_key: str):
        # Create configuration from environment
        self.config = TMDBConfig.from_env(api_key)

        # Create enhanced TMDB service
        self.tmdb = TMDBService(self.config.api_key)

        logger.info(
            f"Enhanced media service initialized with config: {self.config.to_dict()}"
        )

    async def search_content(self, query: str) -> Dict[str, Any]:
        """Search for content with enhanced error handling."""
        try:
            logger.info(f"Searching for: {query}")

            # Use enhanced search with automatic caching and retry
            results = await self.tmdb.search_multi(query)

            # Log performance metrics
            cache_stats = self.tmdb.cache.get_stats()
            logger.info(
                f"Search completed. Cache hit rate: {cache_stats['hit_rate_percent']}%"
            )

            return {
                "success": True,
                "results": results,
                "count": len(results),
                "cache_stats": cache_stats,
            }

        except TMDBError as e:
            logger.error(f"TMDB API error during search: {e.message}")

            # Return error information to frontend
            return {
                "success": False,
                "error": e.message,
                "status_code": e.status_code,
                "retry_suggested": e.status_code in [429, 500, 502, 503, 504],
            }

        except Exception as e:
            logger.error(f"Unexpected error during search: {e}")
            return {
                "success": False,
                "error": "An unexpected error occurred",
                "retry_suggested": True,
            }

    async def get_content_details(
        self, content_id: int, media_type: str
    ) -> Dict[str, Any]:
        """Get detailed content information with enhanced features."""
        try:
            logger.info(f"Getting details for {media_type} ID: {content_id}")

            details = await self.tmdb.get_details(content_id, media_type)

            # Add performance information
            perf_stats = self.tmdb.performance_tracker.get_endpoint_stats(
                f"/{media_type}/{content_id}"
            )

            return {"success": True, "details": details, "performance": perf_stats}

        except TMDBError as e:
            logger.error(f"Error getting {media_type} details: {e.message}")
            return {"success": False, "error": e.message, "status_code": e.status_code}

    async def get_person_info(self, person_id: int) -> Dict[str, Any]:
        """Get person filmography with enhanced caching."""
        try:
            logger.info(f"Getting filmography for person ID: {person_id}")

            filmography = await self.tmdb.get_person_filmography(person_id)

            # Sort and filter results
            filmography["cast"] = sorted(
                filmography["cast"], key=lambda x: x.get("year") or 0, reverse=True
            )
            filmography["crew"] = sorted(
                filmography["crew"], key=lambda x: x.get("year") or 0, reverse=True
            )

            return {
                "success": True,
                "filmography": filmography,
                "cast_count": len(filmography["cast"]),
                "crew_count": len(filmography["crew"]),
            }

        except TMDBError as e:
            logger.error(f"Error getting person filmography: {e.message}")
            return {"success": False, "error": e.message, "status_code": e.status_code}

    async def get_service_health(self) -> Dict[str, Any]:
        """Get service health and performance metrics."""
        try:
            # Test API connection
            await self.tmdb.test_api_key()

            # Get comprehensive statistics
            cache_stats = self.tmdb.cache.get_stats()
            performance_stats = self.tmdb.performance_tracker.get_overall_stats()

            return {
                "status": "healthy",
                "api_key_valid": True,
                "cache": cache_stats,
                "performance": performance_stats,
                "config": self.config.to_dict(),
            }

        except TMDBError as e:
            return {
                "status": "unhealthy",
                "api_key_valid": False,
                "error": e.message,
                "config": self.config.to_dict(),
            }

    async def clear_cache(self) -> Dict[str, Any]:
        """Clear cache and return statistics."""
        old_stats = self.tmdb.cache.get_stats()
        self.tmdb.cache.clear()

        return {
            "success": True,
            "message": "Cache cleared",
            "previous_stats": old_stats,
        }

    async def cleanup_expired_cache(self) -> Dict[str, Any]:
        """Clean up expired cache entries."""
        removed_count = self.tmdb.cache.cleanup_expired()

        return {
            "success": True,
            "removed_entries": removed_count,
            "current_stats": self.tmdb.cache.get_stats(),
        }


# Example usage and testing
async def main():
    """Example usage of the enhanced media service."""
    # Initialize service
    service = EnhancedMediaService("your_api_key_here")

    # Test service health
    health = await service.get_service_health()
    print(f"Service health: {health['status']}")

    # Search for content
    search_results = await service.search_content("Batman")
    if search_results["success"]:
        print(f"Found {search_results['count']} results")
        print(f"Cache hit rate: {search_results['cache_stats']['hit_rate_percent']}%")
    else:
        print(f"Search failed: {search_results['error']}")

    # Get content details (if search was successful)
    if search_results["success"] and search_results["results"]:
        first_result = search_results["results"][0]
        details = await service.get_content_details(
            first_result["id"], first_result["media_type"]
        )

        if details["success"]:
            print(f"Got details for: {details['details']['title']}")
        else:
            print(f"Failed to get details: {details['error']}")

    # Get person information (example)
    person_info = await service.get_person_info(1)  # Example person ID
    if person_info["success"]:
        person = person_info["filmography"]["person"]
        print(f"Person: {person['name']}")
        print(f"Cast credits: {person_info['cast_count']}")
        print(f"Crew credits: {person_info['crew_count']}")

    # Get final service statistics
    final_health = await service.get_service_health()
    print("\nFinal service statistics:")
    print(f"Cache: {final_health['cache']}")
    print(f"Performance: {final_health['performance']}")


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
