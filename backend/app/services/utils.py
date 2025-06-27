"""Utility functions for TMDB service."""

import asyncio
import time
from typing import List, Dict, Any, Optional, Callable, TypeVar
import logging

logger = logging.getLogger(__name__)

T = TypeVar("T")


class RateLimiter:
    """Rate limiter to respect TMDB API limits."""

    def __init__(self, requests_per_second: float = 4.0, burst_limit: int = 40):
        # TMDB allows 40 requests per 10 seconds, so ~4 per second
        self.requests_per_second = requests_per_second
        self.burst_limit = burst_limit
        self.tokens = burst_limit
        self.last_update = time.time()
        self.lock = asyncio.Lock()

    async def acquire(self) -> None:
        """Acquire permission to make a request."""
        async with self.lock:
            now = time.time()
            time_passed = now - self.last_update

            # Add tokens based on time passed
            self.tokens = min(
                self.burst_limit, self.tokens + time_passed * self.requests_per_second
            )
            self.last_update = now

            if self.tokens >= 1:
                self.tokens -= 1
                return

            # Need to wait
            wait_time = (1 - self.tokens) / self.requests_per_second
            logger.debug(f"Rate limiting: waiting {wait_time:.2f}s")
            await asyncio.sleep(wait_time)
            self.tokens = 0


def validate_tmdb_response(data: Dict[str, Any], required_fields: List[str]) -> bool:
    """Validate that a TMDB API response contains required fields."""
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing required field in TMDB response: {field}")
            return False
    return True


def safe_get_year(date_str: Optional[str]) -> Optional[int]:
    """Safely extract year from TMDB date string."""
    if not date_str or len(date_str) < 4:
        return None
    try:
        return int(date_str[:4])
    except (ValueError, TypeError):
        logger.warning(f"Invalid date format: {date_str}")
        return None


def safe_get_int(value: Any, default: int = 0) -> int:
    """Safely convert value to integer."""
    try:
        return int(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def safe_get_float(value: Any, default: float = 0.0) -> float:
    """Safely convert value to float."""
    try:
        return float(value) if value is not None else default
    except (ValueError, TypeError):
        return default


def filter_empty_results(
    items: List[Dict[str, Any]], required_fields: List[str]
) -> List[Dict[str, Any]]:
    """Filter out items that are missing required fields."""
    filtered = []
    for item in items:
        if all(item.get(field) for field in required_fields):
            filtered.append(item)
        else:
            logger.debug(
                f"Filtered out item missing required fields: {item.get('id', 'unknown')}"
            )
    return filtered


def deduplicate_by_id(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Remove duplicate items based on ID field."""
    seen_ids = set()
    unique_items = []

    for item in items:
        item_id = item.get("id")
        if item_id and item_id not in seen_ids:
            seen_ids.add(item_id)
            unique_items.append(item)

    return unique_items


def sort_by_popularity(
    items: List[Dict[str, Any]], reverse: bool = True
) -> List[Dict[str, Any]]:
    """Sort items by popularity score."""
    return sorted(
        items, key=lambda x: safe_get_float(x.get("popularity", 0)), reverse=reverse
    )


def sort_by_year(
    items: List[Dict[str, Any]], reverse: bool = True
) -> List[Dict[str, Any]]:
    """Sort items by year, handling None values."""
    return sorted(items, key=lambda x: x.get("year") or 0, reverse=reverse)


def limit_results(items: List[T], limit: int) -> List[T]:
    """Limit the number of results."""
    if limit <= 0:
        return items
    return items[:limit]


def chunk_list(items: List[T], chunk_size: int) -> List[List[T]]:
    """Split a list into chunks of specified size."""
    return [items[i : i + chunk_size] for i in range(0, len(items), chunk_size)]


async def gather_with_limit(
    tasks: List[Callable], concurrency_limit: int = 5
) -> List[Any]:
    """Execute async tasks with concurrency limit."""
    semaphore = asyncio.Semaphore(concurrency_limit)

    async def limited_task(task):
        async with semaphore:
            return await task()

    return await asyncio.gather(*[limited_task(task) for task in tasks])


def format_duration(seconds: float) -> str:
    """Format duration in human-readable format."""
    if seconds < 1:
        return f"{seconds * 1000:.0f}ms"
    elif seconds < 60:
        return f"{seconds:.1f}s"
    else:
        minutes = int(seconds // 60)
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds:.1f}s"


def sanitize_filename(text: str) -> str:
    """Sanitize text for use in filenames."""
    # Replace problematic characters
    replacements = {
        "/": "-",
        "\\": "-",
        ":": "-",
        "*": "",
        "?": "",
        '"': "'",
        "<": "(",
        ">": ")",
        "|": "-",
        "\n": " ",
        "\r": " ",
        "\t": " ",
    }

    result = text
    for old, new in replacements.items():
        result = result.replace(old, new)

    # Remove multiple spaces
    while "  " in result:
        result = result.replace("  ", " ")

    return result.strip()


class Timer:
    """Context manager for timing operations."""

    def __init__(self, operation_name: str):
        self.operation_name = operation_name
        self.start_time = 0
        self.end_time = 0

    def __enter__(self):
        self.start_time = time.time()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.end_time = time.time()
        duration = self.end_time - self.start_time
        logger.debug(f"{self.operation_name} completed in {format_duration(duration)}")

    @property
    def duration(self) -> float:
        """Get duration in seconds."""
        return self.end_time - self.start_time if self.end_time > 0 else 0


def merge_search_results(
    results_list: List[List[Dict[str, Any]]], max_results: int = 100
) -> List[Dict[str, Any]]:
    """Merge multiple search result lists and deduplicate."""
    all_results = []
    for results in results_list:
        all_results.extend(results)

    # Deduplicate by ID
    unique_results = deduplicate_by_id(all_results)

    # Sort by popularity
    sorted_results = sort_by_popularity(unique_results, reverse=True)

    # Limit results
    return limit_results(sorted_results, max_results)


def extract_crew_by_job(
    crew_data: List[Dict[str, Any]], target_jobs: List[str]
) -> List[Dict[str, Any]]:
    """Extract crew members with specific jobs."""
    return [person for person in crew_data if person.get("job") in target_jobs]


def format_person_name(person: Dict[str, Any]) -> str:
    """Format person name with optional character/job info."""
    name = person.get("name", "Unknown")

    if person.get("character"):
        return f"{name} ({person['character']})"
    elif person.get("job"):
        return f"{name} ({person['job']})"
    else:
        return name
