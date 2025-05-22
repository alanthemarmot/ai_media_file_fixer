from fastapi import APIRouter, HTTPException
from app.services.tmdb import TMDBService
from app.core.config import get_settings

router = APIRouter()
settings = get_settings()
tmdb_service = TMDBService(api_key=settings.TMDB_API_KEY)


@router.get("/search")
async def search_media(query: str):
    try:
        print(f"Searching for query: {query}")
        print(f"Using API key: {settings.TMDB_API_KEY}")
        results = await tmdb_service.search_multi(query)
        print(f"Got results: {results}")
        return results
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details")
async def get_media_details(id: int, type: str):
    # Check media type first
    if type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media type")

    try:
        details = await tmdb_service.get_details(id, type)
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/seasons")
async def get_tv_seasons(id: int):
    try:
        seasons = await tmdb_service.get_tv_seasons(id)
        return seasons
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/episodes")
async def get_tv_episodes(id: int, season_number: int):
    try:
        episodes = await tmdb_service.get_tv_episodes(id, season_number)
        return episodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
