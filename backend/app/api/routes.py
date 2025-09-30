from fastapi import APIRouter, HTTPException, Header
from app.services.tmdb import TMDBService
from app.services.file_service import FileService
from app.models.file_models import (
    RenameFileRequest,
    RenameFileResponse,
    ValidateFilenameRequest,
    ValidateFilenameResponse
)
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


@router.post("/files/rename", response_model=RenameFileResponse)
async def rename_file(request: RenameFileRequest):
    """Rename a file on the file system"""
    try:
        # First validate the new filename
        validation_result = FileService.validate_filename(request.new_name)
        if not validation_result["valid"]:
            return RenameFileResponse(
                success=False,
                message=f"Invalid filename: {validation_result['message']}",
                error="INVALID_FILENAME"
            )

        # Attempt to rename the file
        result = FileService.rename_file(request.original_path, request.new_name)

        return RenameFileResponse(
            success=result["success"],
            message=result["message"],
            new_path=result.get("new_path"),
            original_path=result.get("original_path"),
            error=result.get("error")
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error during file rename: {str(e)}"
        )


@router.post("/files/validate-filename", response_model=ValidateFilenameResponse)
async def validate_filename(request: ValidateFilenameRequest):
    """Validate a filename for the current operating system"""
    try:
        result = FileService.validate_filename(request.filename)
        return ValidateFilenameResponse(
            valid=result["valid"],
            message=result["message"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error validating filename: {str(e)}"
        )


@router.get("/genres/{media_type}")
async def get_genres(media_type: str, x_api_key: Optional[str] = Header(None)):
    """Get list of genres for movies or TV shows"""
    if media_type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media type. Use 'movie' or 'tv'.")

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

        genres = await service.get_genres(media_type)
        return genres
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/discover/{media_type}")
async def discover_media(
    media_type: str,
    x_api_key: Optional[str] = Header(None),
    with_genres: Optional[str] = None,
    year: Optional[int] = None,
    primary_release_year: Optional[int] = None,
    first_air_date_year: Optional[int] = None,
    vote_average_gte: Optional[float] = None,
    vote_average_lte: Optional[float] = None,
    with_runtime_gte: Optional[int] = None,
    with_runtime_lte: Optional[int] = None,
    sort_by: Optional[str] = None,
):
    """Discover movies or TV shows with filters"""
    if media_type not in ["movie", "tv"]:
        raise HTTPException(status_code=400, detail="Invalid media type. Use 'movie' or 'tv'.")

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

        # Build filter params
        filters = {}
        if with_genres:
            filters["with_genres"] = with_genres
        if year:
            filters["year"] = year
        if primary_release_year:
            filters["primary_release_year"] = primary_release_year
        if first_air_date_year:
            filters["first_air_date_year"] = first_air_date_year
        if vote_average_gte is not None:
            filters["vote_average.gte"] = vote_average_gte
        if vote_average_lte is not None:
            filters["vote_average.lte"] = vote_average_lte
        if with_runtime_gte is not None:
            filters["with_runtime.gte"] = with_runtime_gte
        if with_runtime_lte is not None:
            filters["with_runtime.lte"] = with_runtime_lte
        if sort_by:
            filters["sort_by"] = sort_by

        results = await service.discover_media(media_type, filters)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
