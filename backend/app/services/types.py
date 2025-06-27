"""Type definitions for TMDB service responses and internal data structures."""

from typing import Dict, List, Optional, Union, TypedDict
from datetime import datetime


class CacheEntry(TypedDict):
    """Cache entry structure."""

    data: Dict
    timestamp: datetime


class TMDBError(Exception):
    """Custom exception for TMDB API errors."""

    def __init__(
        self,
        message: str,
        status_code: Optional[int] = None,
        response_data: Optional[Dict] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.response_data = response_data
        super().__init__(self.message)


class PersonResult(TypedDict):
    """Person search result."""

    id: int
    media_type: str  # "person"
    name: str
    known_for_department: Optional[str]
    profile_path: Optional[str]
    popularity: float


class MovieResult(TypedDict):
    """Movie search result."""

    id: int
    media_type: str  # "movie"
    title: str
    year: Optional[int]
    poster_path: Optional[str]


class TVResult(TypedDict):
    """TV show search result."""

    id: int
    media_type: str  # "tv"
    title: str
    year: Optional[int]
    poster_path: Optional[str]


SearchResult = Union[PersonResult, MovieResult, TVResult]


class CastMember(TypedDict):
    """Cast member information."""

    id: int
    name: str
    character: Optional[str]
    profile_path: Optional[str]


class CrewMember(TypedDict):
    """Crew member information."""

    id: int
    name: str
    profile_path: Optional[str]
    job: Optional[str]
    department: Optional[str]


class CrewInfo(TypedDict):
    """Crew information with directors and composers."""

    directors: Optional[List[CrewMember]]
    composers: Optional[List[CrewMember]]


class Season(TypedDict):
    """TV season information."""

    season_number: int
    name: str
    poster_path: Optional[str]
    episode_count: int


class Episode(TypedDict):
    """TV episode information."""

    episode_number: int
    season_number: int
    name: str
    air_date: Optional[str]


class MovieDetails(TypedDict):
    """Movie details response."""

    title: str
    year: Optional[int]
    genres: List[str]
    cast: List[CastMember]
    crew: CrewInfo


class TVDetails(TypedDict):
    """TV show details response."""

    title: str
    network: Optional[str]
    season: Optional[int]
    episode: Optional[int]
    episode_title: Optional[str]
    genres: List[str]
    cast: List[CastMember]
    crew: CrewInfo


MediaDetails = Union[MovieDetails, TVDetails]


class FilmographyItem(TypedDict):
    """Filmography item (cast or crew credit)."""

    id: int
    media_type: str  # "movie" or "tv"
    title: str
    year: Optional[int]
    poster_path: Optional[str]
    role_type: str  # "cast" or "crew"
    character: Optional[str]  # For cast
    job: Optional[str]  # For crew
    department: Optional[str]  # For crew


class PersonInfo(TypedDict):
    """Person information."""

    id: int
    name: str
    known_for_department: Optional[str]
    profile_path: Optional[str]
    biography: Optional[str]
    birthday: Optional[str]
    place_of_birth: Optional[str]


class PersonFilmography(TypedDict):
    """Person filmography response."""

    person: PersonInfo
    cast: List[FilmographyItem]
    crew: List[FilmographyItem]


class PaginatedResponse(TypedDict):
    """Paginated API response."""

    page: int
    total_pages: int
    total_results: int
    results: List[Dict]


class RequestMetrics(TypedDict):
    """Request performance metrics."""

    endpoint: str
    duration_ms: float
    cached: bool
    timestamp: datetime
    status_code: Optional[int]
    error: Optional[str]
