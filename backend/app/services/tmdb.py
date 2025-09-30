import httpx
import asyncio
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from functools import wraps

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Simple in-memory cache
class TMDBCache:
    def __init__(self, ttl_minutes: int = 60):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)

    def get(self, key: str) -> Optional[Any]:
        if key in self.cache:
            data, timestamp = self.cache[key]
            if datetime.now() - timestamp < self.ttl:
                logger.debug(f"Cache hit for key: {key}")
                return data
            else:
                del self.cache[key]
                logger.debug(f"Cache expired for key: {key}")
        return None

    def set(self, key: str, value: Any) -> None:
        self.cache[key] = (value, datetime.now())
        logger.debug(f"Cache set for key: {key}")

    def clear(self) -> None:
        self.cache.clear()
        logger.info("Cache cleared")


# Retry decorator
def retry_on_failure(max_retries: int = 3, delay: float = 1.0):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except httpx.HTTPStatusError as e:
                    last_exception = e
                    if e.response.status_code == 429:  # Rate limit
                        wait_time = delay * (2**attempt)  # Exponential backoff
                        logger.warning(
                            f"Rate limited, waiting {wait_time}s before retry {attempt + 1}"
                        )
                        await asyncio.sleep(wait_time)
                    elif e.response.status_code >= 500:  # Server error
                        wait_time = delay * (attempt + 1)
                        logger.warning(
                            f"Server error {e.response.status_code}, retrying in {wait_time}s"
                        )
                        await asyncio.sleep(wait_time)
                    else:
                        # Client error, don't retry
                        raise e
                except (httpx.RequestError, httpx.ConnectError) as e:
                    last_exception = e
                    wait_time = delay * (attempt + 1)
                    logger.warning(f"Network error: {e}, retrying in {wait_time}s")
                    await asyncio.sleep(wait_time)

            logger.error(f"All {max_retries} attempts failed")
            raise last_exception

        return wrapper

    return decorator


class TMDBService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        self.cache = TMDBCache(ttl_minutes=60)  # Cache for 1 hour
        self.client_config = {
            "timeout": httpx.Timeout(30.0),  # 30 second timeout
            "limits": httpx.Limits(max_connections=10, max_keepalive_connections=5),
        }

    def _get_cache_key(self, endpoint: str, params: Dict[str, Any]) -> str:
        """Generate a cache key from endpoint and parameters"""
        # Remove api_key from params for cache key
        cache_params = {k: v for k, v in params.items() if k != "api_key"}
        return f"{endpoint}:{hash(str(sorted(cache_params.items())))}"

    @retry_on_failure(max_retries=3)
    async def _make_request(
        self, endpoint: str, params: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Make a request to TMDB API with caching and error handling"""
        cache_key = self._get_cache_key(endpoint, params)

        # Check cache first
        cached_result = self.cache.get(cache_key)
        if cached_result is not None:
            return cached_result

        # Add API key to params
        request_params = {**params, "api_key": self.api_key}

        start_time = datetime.now()
        logger.info(
            f"Making TMDB API request: {endpoint} with params: {list(params.keys())}"
        )

        try:
            async with httpx.AsyncClient(**self.client_config) as client:
                response = await client.get(
                    f"{self.base_url}{endpoint}", params=request_params
                )
                response.raise_for_status()
                data = response.json()

                duration = (datetime.now() - start_time).total_seconds()
                logger.info(f"TMDB API request completed in {duration:.2f}s")

                # Cache the result
                self.cache.set(cache_key, data)
                return data

        except httpx.HTTPStatusError as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(
                f"TMDB API HTTP error {e.response.status_code} after {duration:.2f}s: {e}"
            )
            if e.response.status_code == 401:
                raise Exception("Invalid TMDB API key")
            elif e.response.status_code == 404:
                raise Exception("Resource not found")
            elif e.response.status_code == 429:
                raise Exception("Rate limit exceeded - please try again later")
            else:
                raise Exception(f"TMDB API error: {e.response.status_code}")
        except httpx.RequestError as e:
            duration = (datetime.now() - start_time).total_seconds()
            logger.error(f"TMDB API request error after {duration:.2f}s: {e}")
            raise Exception("Network error: Unable to connect to TMDB API")

    async def test_api_key(self) -> bool:
        """Tests if the API key is valid by making a request to a simple endpoint"""
        try:
            await self._make_request("/configuration", {})
            return True
        except Exception as e:
            logger.error(f"API key test failed: {e}")
            raise Exception(f"Invalid API key: {str(e)}")

    async def search_multi(self, query: str) -> List[Dict[str, Any]]:
        """Search for movies, TV shows, and people with enhanced error handling and caching"""
        try:
            data = await self._make_request("/search/multi", {"query": query})

            # Format the response according to our API specification
            results = []
            for item in data.get("results", []):
                if item["media_type"] not in ["movie", "tv", "person"]:
                    continue

                if item["media_type"] == "person":
                    result = {
                        "id": item["id"],
                        "media_type": "person",
                        "name": item.get("name"),
                        "known_for_department": item.get("known_for_department"),
                        "profile_path": item.get("profile_path"),
                        "popularity": item.get("popularity", 0),
                    }
                    results.append(result)
                else:
                    result = {
                        "id": item["id"],
                        "media_type": item["media_type"],
                        "title": item.get("title") or item.get("name"),
                        "year": int(item.get("release_date", "")[:4])
                        if item.get("release_date")
                        else None,
                        "poster_path": item.get("poster_path"),
                    }
                    if not result["year"] and item.get("first_air_date"):
                        result["year"] = int(item["first_air_date"][:4])
                    results.append(result)

            return results

        except Exception as e:
            logger.error(f"Search failed for query '{query}': {e}")
            raise Exception(f"Search failed: {str(e)}")

    async def get_tv_seasons(self, tv_id: int) -> List[Dict[str, Any]]:
        """Get TV show seasons with enhanced error handling and caching"""
        try:
            data = await self._make_request(f"/tv/{tv_id}", {})

            seasons = []
            for season in data.get("seasons", []):
                # Skip season 0 which is usually specials
                if season["season_number"] > 0:
                    seasons.append(
                        {
                            "season_number": season["season_number"],
                            "name": season["name"],
                            "poster_path": season["poster_path"],
                            "episode_count": season["episode_count"],
                        }
                    )

            return seasons

        except Exception as e:
            logger.error(f"Failed to get TV seasons for ID {tv_id}: {e}")
            raise Exception(f"Failed to get TV seasons: {str(e)}")

    async def get_details(self, id: int, media_type: str) -> Dict[str, Any]:
        """Get detailed information for a movie or TV show with enhanced error handling"""
        try:
            if media_type == "movie":
                # Get movie details, credits, and keywords concurrently
                details_task = self._make_request(f"/movie/{id}", {})
                credits_task = self._make_request(f"/movie/{id}/credits", {})
                keywords_task = self._make_request(f"/movie/{id}/keywords", {})

                data, credits_data, keywords_data = await asyncio.gather(details_task, credits_task, keywords_task)

                # Extract top cast (limit to 15 actors)
                cast = []
                for actor in credits_data.get("cast", [])[:15]:
                    cast.append(
                        {
                            "id": actor["id"],
                            "name": actor["name"],
                            "character": actor.get("character"),
                            "profile_path": actor.get("profile_path"),
                        }
                    )

                # Extract key crew (director, composer, etc.)
                directors = []
                composers = []
                for person in credits_data.get("crew", []):
                    job = person.get("job")
                    if job == "Director":
                        directors.append(
                            {
                                "id": person["id"],
                                "name": person["name"],
                                "profile_path": person.get("profile_path"),
                            }
                        )
                    elif job in ["Original Music Composer", "Music", "Composer"]:
                        composers.append(
                            {
                                "id": person["id"],
                                "name": person["name"],
                                "profile_path": person.get("profile_path"),
                            }
                        )

                crew = {
                    "directors": directors if directors else None,
                    "composers": composers if composers else None,
                }

                # Extract genres
                genres = [genre["name"] for genre in data.get("genres", [])]

                # Extract keywords
                keywords = [keyword["name"] for keyword in keywords_data.get("keywords", [])]

                return {
                    "title": data["title"],
                    "year": int(data["release_date"][:4])
                    if data.get("release_date")
                    else None,
                    "release_date": data.get("release_date"),
                    "runtime": data.get("runtime"),
                    "vote_average": data.get("vote_average"),
                    "vote_count": data.get("vote_count"),
                    "tagline": data.get("tagline"),
                    "poster_path": data.get("poster_path"),
                    "genres": genres,
                    "keywords": keywords,
                    "cast": cast,
                    "crew": crew,
                }
            else:  # TV Show
                # Get show details, credits, and keywords concurrently
                details_task = self._make_request(f"/tv/{id}", {})
                credits_task = self._make_request(f"/tv/{id}/credits", {})
                keywords_task = self._make_request(f"/tv/{id}/keywords", {})

                data, credits_data, keywords_data = await asyncio.gather(details_task, credits_task, keywords_task)

                # Extract top cast (limit to 15 actors)
                cast = []
                for actor in credits_data.get("cast", [])[:15]:
                    cast.append(
                        {
                            "id": actor["id"],
                            "name": actor["name"],
                            "character": actor.get("character"),
                            "profile_path": actor.get("profile_path"),
                        }
                    )

                # Extract key crew (director, composer, etc.)
                directors = []
                composers = []
                for person in credits_data.get("crew", []):
                    job = person.get("job")
                    if job in ["Director", "Series Director"]:
                        directors.append(
                            {
                                "id": person["id"],
                                "name": person["name"],
                                "profile_path": person.get("profile_path"),
                            }
                        )
                    elif job in ["Original Music Composer", "Music", "Composer"]:
                        composers.append(
                            {
                                "id": person["id"],
                                "name": person["name"],
                                "profile_path": person.get("profile_path"),
                            }
                        )

                crew = {
                    "directors": directors if directors else None,
                    "composers": composers if composers else None,
                }

                # Extract genres
                genres = [genre["name"] for genre in data.get("genres", [])]

                # Extract keywords (TV shows use 'results' field)
                keywords = [keyword["name"] for keyword in keywords_data.get("results", [])]

                # Get latest season/episode info safely
                latest_season = None
                latest_episode = None
                if data.get("seasons"):
                    latest_season = max(
                        data["seasons"], key=lambda x: x["season_number"]
                    )
                    try:
                        season_data = await self._make_request(
                            f"/tv/{id}/season/{latest_season['season_number']}", {}
                        )
                        if season_data.get("episodes"):
                            latest_episode = season_data["episodes"][-1]
                    except Exception as e:
                        logger.warning(
                            f"Failed to get latest episode data for TV {id}: {e}"
                        )

                return {
                    "title": data["name"],
                    "first_air_date": data.get("first_air_date"),
                    "last_air_date": data.get("last_air_date"),
                    "episode_run_time": data.get("episode_run_time", [None])[0] if data.get("episode_run_time") and len(data.get("episode_run_time", [])) > 0 else None,
                    "number_of_seasons": data.get("number_of_seasons"),
                    "number_of_episodes": data.get("number_of_episodes"),
                    "vote_average": data.get("vote_average"),
                    "vote_count": data.get("vote_count"),
                    "tagline": data.get("tagline"),
                    "status": data.get("status"),
                    "network": data.get("networks", [{}])[0].get("name")
                    if data.get("networks")
                    else None,
                    "season": latest_season["season_number"] if latest_season else None,
                    "episode": latest_episode["episode_number"]
                    if latest_episode
                    else None,
                    "episode_title": latest_episode["name"] if latest_episode else None,
                    "poster_path": data.get("poster_path"),
                    "genres": genres,
                    "keywords": keywords,
                    "cast": cast,
                    "crew": crew,
                }

        except Exception as e:
            logger.error(f"Failed to get details for {media_type} ID {id}: {e}")
            raise Exception(f"Failed to get {media_type} details: {str(e)}")

    async def get_tv_episodes(
        self, tv_id: int, season_number: int
    ) -> List[Dict[str, Any]]:
        """Get TV show episodes with enhanced error handling and caching"""
        try:
            data = await self._make_request(f"/tv/{tv_id}/season/{season_number}", {})

            episodes = []
            for ep in data.get("episodes", []):
                episodes.append(
                    {
                        "episode_number": ep["episode_number"],
                        "season_number": ep["season_number"],
                        "name": ep["name"],
                        "air_date": ep.get("air_date"),
                    }
                )
            return episodes

        except Exception as e:
            logger.error(
                f"Failed to get episodes for TV {tv_id} season {season_number}: {e}"
            )
            raise Exception(f"Failed to get TV episodes: {str(e)}")

    async def get_person_filmography(self, person_id: int) -> Dict[str, Any]:
        """Get a person's filmography including movies and TV shows with enhanced error handling"""
        try:
            # Get person details and credits concurrently
            person_task = self._make_request(f"/person/{person_id}", {})
            credits_task = self._make_request(
                f"/person/{person_id}/combined_credits", {}
            )

            person_data, credits_data = await asyncio.gather(person_task, credits_task)

            # Process cast credits
            cast_credits = []
            for credit in credits_data.get("cast", []):
                if credit.get("media_type") in ["movie", "tv"]:
                    item = {
                        "id": credit["id"],
                        "media_type": credit["media_type"],
                        "title": credit.get("title") or credit.get("name"),
                        "character": credit.get("character"),
                        "poster_path": credit.get("poster_path"),
                        "role_type": "cast",
                    }

                    # Add year/date
                    if credit["media_type"] == "movie":
                        item["year"] = (
                            int(credit["release_date"][:4])
                            if credit.get("release_date")
                            else None
                        )
                    else:  # TV
                        item["year"] = (
                            int(credit["first_air_date"][:4])
                            if credit.get("first_air_date")
                            else None
                        )

                    cast_credits.append(item)

            # Process crew credits
            crew_credits = []
            for credit in credits_data.get("crew", []):
                if credit.get("media_type") in ["movie", "tv"]:
                    item = {
                        "id": credit["id"],
                        "media_type": credit["media_type"],
                        "title": credit.get("title") or credit.get("name"),
                        "job": credit.get("job"),
                        "department": credit.get("department"),
                        "poster_path": credit.get("poster_path"),
                        "role_type": "crew",
                    }

                    # Add year/date
                    if credit["media_type"] == "movie":
                        item["year"] = (
                            int(credit["release_date"][:4])
                            if credit.get("release_date")
                            else None
                        )
                    else:  # TV
                        item["year"] = (
                            int(credit["first_air_date"][:4])
                            if credit.get("first_air_date")
                            else None
                        )

                    crew_credits.append(item)

            # Sort both by year (newest first), handling None values
            cast_credits.sort(key=lambda x: x["year"] or 0, reverse=True)
            crew_credits.sort(key=lambda x: x["year"] or 0, reverse=True)

            return {
                "person": {
                    "id": person_data["id"],
                    "name": person_data["name"],
                    "known_for_department": person_data.get("known_for_department"),
                    "profile_path": person_data.get("profile_path"),
                    "biography": person_data.get("biography"),
                    "birthday": person_data.get("birthday"),
                    "place_of_birth": person_data.get("place_of_birth"),
                },
                "cast": cast_credits,
                "crew": crew_credits,
            }

        except Exception as e:
            logger.error(f"Failed to get filmography for person ID {person_id}: {e}")
            raise Exception(f"Failed to get person filmography: {str(e)}")
