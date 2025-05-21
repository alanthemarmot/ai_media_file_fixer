#!/bin/bash

# Store the root directory
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "Error: uv is not installed. Please install uv first."
    echo "Visit https://docs.astral.sh/uv/guides/ for installation instructions."
    exit 1
fi

# Activate the virtual environment
if [ -d "$ROOT_DIR/.venv" ]; then
    source "$ROOT_DIR/.venv/bin/activate"
    echo "Updating Python dependencies with uv..."
    uv pip install -r "$ROOT_DIR/requirements.txt"
    echo "Dependencies updated successfully."
else
    echo "Virtual environment not found. Run start.sh first to create it."
    exit 1
fi
