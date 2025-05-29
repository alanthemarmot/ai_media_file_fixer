import httpx
from typing import List, Dict, Any


class TMDBService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"
        
    async def test_api_key(self) -> bool:
        """Tests if the API key is valid by making a request to a simple endpoint"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    f"{self.base_url}/configuration",
                    params={"api_key": self.api_key},
                )
                response.raise_for_status()
                return True
            except Exception as e:
                raise Exception(f"Invalid API key: {str(e)}")

    async def search_multi(self, query: str) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search/multi",
                params={"api_key": self.api_key, "query": query},
            )
            response.raise_for_status()
            data = response.json()

            # Format the response according to our API specification
            results = []
            for item in data.get("results", []):
                if item["media_type"] not in ["movie", "tv"]:
                    continue

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

    async def get_tv_seasons(self, tv_id: int) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tv/{tv_id}", params={"api_key": self.api_key}
            )
            response.raise_for_status()
            data = response.json()

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

    async def get_details(self, id: int, media_type: str) -> Dict[str, Any]:
        async with httpx.AsyncClient() as client:
            if media_type == "movie":
                response = await client.get(
                    f"{self.base_url}/movie/{id}", params={"api_key": self.api_key}
                )
                response.raise_for_status()
                data = response.json()
                return {
                    "title": data["title"],
                    "year": int(data["release_date"][:4])
                    if data.get("release_date")
                    else None,
                }
            else:  # TV Show
                # Get show details
                response = await client.get(
                    f"{self.base_url}/tv/{id}", params={"api_key": self.api_key}
                )
                response.raise_for_status()
                data = response.json()

                # Get latest season/episode info
                latest_season = max(
                    data.get("seasons", []), key=lambda x: x["season_number"]
                )
                season_response = await client.get(
                    f"{self.base_url}/tv/{id}/season/{latest_season['season_number']}",
                    params={"api_key": self.api_key},
                )
                season_response.raise_for_status()
                season_data = season_response.json()

                latest_episode = (
                    season_data["episodes"][-1] if season_data.get("episodes") else None
                )

                return {
                    "title": data["name"],
                    "network": data.get("networks", [{}])[0].get("name")
                    if data.get("networks")
                    else None,
                    "season": latest_season["season_number"],
                    "episode": latest_episode["episode_number"]
                    if latest_episode
                    else None,
                    "episode_title": latest_episode["name"] if latest_episode else None,
                }

    async def get_tv_episodes(
        self, tv_id: int, season_number: int
    ) -> List[Dict[str, Any]]:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/tv/{tv_id}/season/{season_number}",
                params={"api_key": self.api_key},
            )
            response.raise_for_status()
            data = response.json()
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
