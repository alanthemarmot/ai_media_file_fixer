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
                # Get movie details
                response = await client.get(
                    f"{self.base_url}/movie/{id}", params={"api_key": self.api_key}
                )
                response.raise_for_status()
                data = response.json()

                # Get movie credits (cast and crew)
                credits_response = await client.get(
                    f"{self.base_url}/movie/{id}/credits",
                    params={"api_key": self.api_key},
                )
                credits_response.raise_for_status()
                credits_data = credits_response.json()

                # Extract top cast (limit to 8 actors)
                cast = []
                for actor in credits_data.get("cast", [])[:8]:
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

                return {
                    "title": data["title"],
                    "year": int(data["release_date"][:4])
                    if data.get("release_date")
                    else None,
                    "genres": genres,
                    "cast": cast,
                    "crew": crew,
                }
            else:  # TV Show
                # Get show details
                response = await client.get(
                    f"{self.base_url}/tv/{id}", params={"api_key": self.api_key}
                )
                response.raise_for_status()
                data = response.json()

                # Get TV show credits (cast and crew)
                credits_response = await client.get(
                    f"{self.base_url}/tv/{id}/credits", params={"api_key": self.api_key}
                )
                credits_response.raise_for_status()
                credits_data = credits_response.json()

                # Extract top cast (limit to 8 actors)
                cast = []
                for actor in credits_data.get("cast", [])[:8]:
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
                    "genres": genres,
                    "cast": cast,
                    "crew": crew,
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

    async def get_person_filmography(self, person_id: int) -> Dict[str, Any]:
        """Get a person's filmography including movies and TV shows"""
        async with httpx.AsyncClient() as client:
            # Get person details
            person_response = await client.get(
                f"{self.base_url}/person/{person_id}", params={"api_key": self.api_key}
            )
            person_response.raise_for_status()
            person_data = person_response.json()

            # Get combined credits (movies and TV)
            credits_response = await client.get(
                f"{self.base_url}/person/{person_id}/combined_credits",
                params={"api_key": self.api_key},
            )
            credits_response.raise_for_status()
            credits_data = credits_response.json()

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
