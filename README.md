# Media File Renamer

A lightweight local web app to help you search The Movie Database (TMDb), select a show or movie, and generate a formatted naming string for your media files. Designed for users who want consistent, media server-friendly file names for TV shows and movies.

---

## Features
- **Search**: Query TMDb for TV shows or movies by title.
- **Select**: Choose from a list of search results (TV or Movie, with year).
- **Display Naming**: Instantly generate a naming string for the selected item:
  - TV Show: `S{{season:02d}}E{{episode:02d}} - {{Episode Title}} ({{Quality}})`
  - Movie: `{{Movie Title}} [{{Year}}] ({{Quality}})`
- **Copy to Clipboard**: One-click copy of the generated filename.
- **Local-Only**: Runs entirely on your machine; your TMDb API key is never exposed to the client.

---

## Architecture
- **Frontend**: React (functional components, hooks), Tailwind CSS, Vite
- **Backend**: Python 3.12, FastAPI, httpx, uvicorn
- **API**: Backend proxies all TMDb requests to keep your API key secure

---

## How It Works
1. **Start the app** (see below)
2. Enter a movie or TV show title in the search bar
3. Select the correct result from the list
4. The app fetches details (season, episode, year, etc.)
5. A suggested filename is generated and displayed
6. Click "Copy" to copy the filename to your clipboard

---

## Installation & Usage

### Prerequisites
- Python 3.12+
- Node.js 18+
- [uv](https://docs.astral.sh/uv/guides/) (for Python env management)
- TMDb API key (add to `backend/.env` as `TMDB_API_KEY`)

### Quick Start
1. **Clone the repository**
2. **Add your TMDb API key** to `backend/.env`:
   ```
   TMDB_API_KEY=your_tmdb_api_key_here
   ```
3. **Run the startup script:**
   ```sh
   ./start.sh
   ```
   This will:
   - Set up the Python environment and install dependencies
   - Start the FastAPI backend (port 8000)
   - Install frontend dependencies and start the React dev server (port 5173)

4. **Open the app**
   - Visit the local URL shown in your terminal (usually http://localhost:5173)

### Stopping the App
- Press `Ctrl+C` in your terminal to stop both backend and frontend servers.

---

## Project Structure
```
media_file_renamer/
├── backend/         # FastAPI backend
├── frontend/        # React frontend
├── start.sh         # Startup script
├── requirements.txt # Python dependencies
├── README.md        # This file
```

---

## Development
- **Backend**: Edit code in `backend/app/`, run tests with `pytest backend/`
- **Frontend**: Edit code in `frontend/src/`, run tests with your preferred React testing tools

---

## Security
- The TMDb API key is only used on the backend and never sent to the client.
- The app is intended for local use only (localhost).

---

## License
MIT (or specify your license here)

---

## Credits
- [TMDb](https://www.themoviedb.org/) for the free movie/TV metadata API
- Built with FastAPI, React, Tailwind CSS, and Vite
