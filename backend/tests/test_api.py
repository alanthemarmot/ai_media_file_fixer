from fastapi.testclient import TestClient
from app.main import app


def test_search_movies(client: TestClient):
    """Test searching for popular movies"""
    response = client.get("/api/search?query=Inception")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Check if Inception (2010) is in results
    found = False
    for item in data:
        if item["media_type"] == "movie" and item["title"] == "Inception":
            found = True
            assert item["year"] == 2010
            break
    assert found, "Inception movie not found in search results"


def test_search_tv_shows(client: TestClient):
    """Test searching for TV shows"""
    response = client.get("/api/search?query=Breaking Bad")

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    # Check if Breaking Bad is in results
    found = False
    for item in data:
        if item["media_type"] == "tv" and item["title"] == "Breaking Bad":
            found = True
            assert item["year"] == 2008
            break
    assert found, "Breaking Bad TV show not found in search results"


def test_get_movie_details(client: TestClient):
    """Test getting movie details"""
    # Inception movie ID
    movie_id = 27205
    response = client.get(f"/api/details?id={movie_id}&type=movie")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Inception"
    assert data["year"] == 2010


def test_get_tv_show_details(client: TestClient):
    """Test getting TV show details"""
    # Breaking Bad show ID
    tv_id = 1396
    response = client.get(f"/api/details?id={tv_id}&type=tv")

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Breaking Bad"
    assert data["network"] == "AMC"
    assert "season" in data
    assert "episode" in data
    assert "episode_title" in data


def test_invalid_media_type(client: TestClient):
    """Test error handling for invalid media type"""
    response = client.get("/api/details?id=27205&type=invalid")
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid media type"


def test_search_with_empty_query(client: TestClient):
    """Test search with empty query"""
    response = client.get("/api/search?query=")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0
