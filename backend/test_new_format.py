import asyncio
import sys
import os

# Add the app directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from app.services.tmdb import TMDBService


async def test_director_composer_format():
    """Test that directors and composers are returned as comma-separated strings"""

    # Initialize TMDB service
    tmdb_service = TMDBService("fde7ce07ee92a4036653c14d36613304")

    print("Testing movie (Inception)...")
    try:
        # Test movie details - Inception (2010)
        movie_details = await tmdb_service.get_details(27205, "movie")

        print("Movie Details:")
        print(f"Title: {movie_details['title']}")
        print(f"Year: {movie_details['year']}")
        print(f"Genres: {movie_details['genres']}")

        print("\nCrew Information:")
        print(
            f"Directors: {movie_details['crew']['directors']} (type: {type(movie_details['crew']['directors'])})"
        )
        print(
            f"Composers: {movie_details['crew']['composers']} (type: {type(movie_details['crew']['composers'])})"
        )

        print(f"\nCast ({len(movie_details['cast'])} members):")
        for i, actor in enumerate(movie_details["cast"][:3]):  # Show first 3
            print(f"  {i + 1}. {actor['name']} as {actor['character']}")

    except Exception as e:
        print(f"Error testing movie: {str(e)}")

    print("\n" + "=" * 60 + "\n")

    print("Testing TV show (Breaking Bad)...")
    try:
        # Test TV show details - Breaking Bad
        tv_details = await tmdb_service.get_details(1396, "tv")

        print("TV Show Details:")
        print(f"Title: {tv_details['title']}")
        print(f"Network: {tv_details['network']}")
        print(f"Genres: {tv_details['genres']}")

        print("\nCrew Information:")
        print(
            f"Directors: {tv_details['crew']['directors']} (type: {type(tv_details['crew']['directors'])})"
        )
        print(
            f"Composers: {tv_details['crew']['composers']} (type: {type(tv_details['crew']['composers'])})"
        )

        print(f"\nCast ({len(tv_details['cast'])} members):")
        for i, actor in enumerate(tv_details["cast"][:3]):  # Show first 3
            print(f"  {i + 1}. {actor['name']} as {actor['character']}")

    except Exception as e:
        print(f"Error testing TV show: {str(e)}")


if __name__ == "__main__":
    asyncio.run(test_director_composer_format())
