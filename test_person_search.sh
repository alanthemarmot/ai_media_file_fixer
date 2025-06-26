#!/bin/bash

echo "Testing Actor/Director Search Integration"
echo "========================================"

echo
echo "1. Testing search with mixed results (batman)..."
curl -s "http://localhost:8000/api/search?query=batman" | jq '[.[] | {media_type, title, name}] | group_by(.media_type) | map({type: .[0].media_type, count: length})'

echo
echo "2. Testing person search (Tom Hanks)..."
PERSON_ID=$(curl -s "http://localhost:8000/api/search?query=Tom%20Hanks" | jq -r '.[] | select(.media_type == "person") | .id' | head -1)
echo "Person ID: $PERSON_ID"

echo
echo "3. Testing filmography endpoint..."
curl -s "http://localhost:8000/api/person/$PERSON_ID/filmography" | jq '{
  person: .person.name,
  cast_count: (.cast | length),
  crew_count: (.crew | length),
  latest_cast: (.cast[0:2] | map({title, year, character})),
  latest_crew: (.crew[0:2] | map({title, year, job}))
}'

echo
echo "4. Testing director search (Christopher Nolan)..."
DIRECTOR_ID=$(curl -s "http://localhost:8000/api/search?query=Christopher%20Nolan" | jq -r '.[] | select(.media_type == "person" and .known_for_department == "Directing") | .id' | head -1)
echo "Director ID: $DIRECTOR_ID"

echo
echo "5. Testing director filmography..."
curl -s "http://localhost:8000/api/person/$DIRECTOR_ID/filmography" | jq '{
  director: .person.name,
  directing_credits: (.crew | map(select(.department == "Directing")) | length),
  latest_directing: (.crew | map(select(.department == "Directing"))[0:3] | map({title, year, job}))
}'

echo
echo "All tests completed!"
