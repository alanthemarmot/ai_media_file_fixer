#!/bin/bash

# Store the root directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

# Check if Python virtual environment exists, create if not
if [ ! -d "$ROOT_DIR/.venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv "$ROOT_DIR/.venv"
    source "$ROOT_DIR/.venv/bin/activate"
    pip install -r "$ROOT_DIR/requirements.txt"
else
    source "$ROOT_DIR/.venv/bin/activate"
fi

# Function to cleanup background processes on script exit
cleanup() {
    echo "Shutting down services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

# Set up cleanup on script exit
trap cleanup EXIT

# Start the backend server
echo "Starting backend server..."
cd "$BACKEND_DIR" && uvicorn app.main:app --reload --port 8000 &

# Start the frontend development server and capture its output
echo "Starting frontend server..."
cd "$FRONTEND_DIR" && npm install

# Start the frontend server and filter its output to find the local URL
cd "$FRONTEND_DIR" && npm run dev | while read -r line; do
    echo "$line"
    if [[ $line == *"Local:"*"http"* ]]; then
        echo -e "\n👉 Frontend is running at: $(echo $line | grep -o 'http://[^ ]*')\n"
    fi
done &

# Wait for both processes
wait