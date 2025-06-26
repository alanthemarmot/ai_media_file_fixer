from fastapi import APIRouter, HTTPException, Header
from app.services.tmdb import TMDBService
from app.core.config import get_settings, has_server_api_key
from typing import Optional

router = APIRouter()
settings = get_settings()

# Initialize TMDBService only if server has API key
tmdb_service = (
    TMDBService(api_key=settings.TMDB_API_KEY) if has_server_api_key() else None
)


@router.get("/server-key-status")
async def check_server_api_key():
    """Check if the server has a TMDB API key configured"""
    return {"has_key": has_server_api_key()}


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

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key required. Please provide API key in X-API-Key header.",
            )

        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        if not service:
            service = TMDBService(api_key=api_key)

        print(f"Searching for query: {query}")
        results = await service.search_multi(query)
        print(f"Got results: {results}")
        return results
    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/details")
async def get_media_details(
    id: int, type: str, x_api_key: Optional[str] = Header(None)
):
    # Check media type first
    if type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media type")

    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key required. Please provide API key in X-API-Key header.",
            )

        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        if not service:
            service = TMDBService(api_key=api_key)

        details = await service.get_details(id, type)
        return details
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/seasons")
async def get_tv_seasons(id: int, x_api_key: Optional[str] = Header(None)):
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key required. Please provide API key in X-API-Key header.",
            )

        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        if not service:
            service = TMDBService(api_key=api_key)

        seasons = await service.get_tv_seasons(id)
        return seasons
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/episodes")
async def get_tv_episodes(
    id: int, season_number: int, x_api_key: Optional[str] = Header(None)
):
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key required. Please provide API key in X-API-Key header.",
            )

        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        if not service:
            service = TMDBService(api_key=api_key)

        episodes = await service.get_tv_episodes(id, season_number)
        return episodes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/person/{person_id}/filmography")
async def get_person_filmography(
    person_id: int, x_api_key: Optional[str] = Header(None)
):
    """Get a person's filmography including movies and TV shows"""
    try:
        # Use the provided API key if available, otherwise use the server's key
        api_key = x_api_key or settings.TMDB_API_KEY

        if not api_key:
            raise HTTPException(
                status_code=400,
                detail="API key required. Please provide API key in X-API-Key header.",
            )

        service = TMDBService(api_key=api_key) if x_api_key else tmdb_service
        if not service:
            service = TMDBService(api_key=api_key)

        filmography = await service.get_person_filmography(person_id)
        return filmography
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
