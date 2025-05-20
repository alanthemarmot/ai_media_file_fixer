import tmdbsimple as tmdb
import os

# Set up TMDb with our API key
tmdb.API_KEY = "fde7ce07ee92a4036653c14d36613304"

# Try a simple search
search = tmdb.Search()
try:
    response = search.movie(query="Inception")
    print("Success!")
    print(f"Found {len(response['results'])} results")
    if response["results"]:
        print(f"First result: {response['results'][0]['title']}")
except Exception as e:
    print(f"Error: {str(e)}")
