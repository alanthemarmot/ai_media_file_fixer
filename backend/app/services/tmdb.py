import httpx
from typing import List, Dict, Any


class TMDBService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.themoviedb.org/3"

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
                }
                if not result["year"] and item.get("first_air_date"):
                    result["year"] = int(item["first_air_date"][:4])
                results.append(result)

            return results

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
