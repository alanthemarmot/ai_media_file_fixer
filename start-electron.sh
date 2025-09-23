#!/bin/bash

# Script to start the Media File Renamer Electron app in development mode

echo "🚀 Starting Media File Renamer Electron App..."

# Function to cleanup background processes
cleanup() {
    echo "🧹 Cleaning up processes..."
    if [[ ! -z "$BACKEND_PID" ]]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    if [[ ! -z "$FRONTEND_PID" ]]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start backend
echo "📡 Starting FastAPI backend..."
cd backend
if [[ ! -d "../.venv" ]]; then
    echo "⚠️  Virtual environment not found. Run ./start.sh first to set up the project."
    exit 1
fi

# Activate virtual environment and start backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend dev server
echo "🎨 Starting React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 5

# Start Electron
echo "🖥️  Starting Electron app..."
npm run electron-dev

# Keep script running and wait for processes
wait