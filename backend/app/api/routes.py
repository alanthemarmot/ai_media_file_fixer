from fastapi import APIRouter, HTTPException, Header
from app.services.tmdb import TMDBService
from app.core.config import get_settings
from typing import Optional

router = APIRouter()
settings = get_settings()
tmdb_service = TMDBService(api_key=settings.TMDB_API_KEY)


@router.get("/validate-key")
async def validate_api_key(api_key: str):
    """Validates if an API key is valid by making a test request to TMDb"""
    try:
        # Create a temporary TMDBService with the provided key
        temp_service = TMDBService(api_key=api_key)
        # Try to make a simple request with the key
        await temp_service.test_api_key()
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "error": str(e)}


@router.get("/search")
async def search_media(query: str, x_api_key: Optional[str] = Header(None)):
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY
        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        
        print(f"Searching for query: {query}")
        results = await service.search_multi(query)
        print(f"Got results: {results}")
        return results
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details")
async def get_media_details(id: int, type: str, x_api_key: Optional[str] = Header(None)):
    # Check media type first
    if type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media type")

    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY
        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        
        details = await service.get_details(id, type)
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/seasons")
async def get_tv_seasons(id: int, x_api_key: Optional[str] = Header(None)):
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY
        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        
        seasons = await service.get_tv_seasons(id)
        return seasons
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/episodes")
async def get_tv_episodes(id: int, season_number: int, x_api_key: Optional[str] = Header(None)):
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY
        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        
        episodes = await service.get_tv_episodes(id, season_number)
        return episodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
