# Media File Renamer

A lightweight local web app to help you search The Movie Database (TMDb), select shows, movies, or explore actor/director filmographies, and generate formatted naming strings for your media files. Designed for users who want consistent, media server-friendly file names for TV shows and movies.

---

## Features
- **Universal Search**: Query TMDb for TV shows, movies, or people (actors/directors) by name.
- **Multi-Tab Results**: Organized results with separate tabs for TV Shows, Movies, and People.
- **Person Filmography**: Browse an actor's or director's complete filmography, sorted chronologically.
- **Smart Navigation**: Navigate from person filmography to specific shows/movies with breadcrumb navigation.
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
2. Enter a movie, TV show, or person's name in the search bar
3. Select from organized results in TV Shows, Movies, or People tabs
4. **For TV/Movies**: The app fetches details (season, episode, year, etc.) and generates a suggested filename
5. **For People**: Browse their complete filmography and click on any item to get naming details
6. Navigate using breadcrumbs to move between search results, person pages, and media details
7. Click "Copy" to copy the filename to your clipboard

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
3. **Make sure [uv](https://docs.astral.sh/uv/guides/) is installed**:
   ```sh
   # Install uv using pipx (recommended)
   pipx install uv
   
   # Or with pip for user installation
   pip install uv
   ```

4. **Run the startup script:**
   ```sh
   ./start.sh
   ```
   This will:
   - Set up a Python virtual environment using uv
   - Install dependencies with uv
   - Start the FastAPI backend (port 8000)
   - Install frontend dependencies and start the React dev server (port 5173)

5. **Open the app**
   - Visit the local URL shown in your terminal (usually http://localhost:5173)

### Stopping the App
- Press `Ctrl+C` in your terminal to stop both backend and frontend servers.

---

## Project Structure
```
media_file_renamer/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── services/
│   │   │   └── tmdb.py     # TMDb API integration with person search
│   │   └── api/
│   │       └── routes.py   # API endpoints including /person/{id}/filmography
├── frontend/          # React frontend
│   └── src/
│       └── components/
│           ├── SearchBar.tsx         # Universal search (movies, TV, people)
│           ├── ResultsList.tsx       # Tabbed results display
│           ├── PersonResultsList.tsx # Person search results
│           ├── Filmography.tsx       # Person filmography display
│           └── Breadcrumb.tsx        # Navigation breadcrumbs
├── start.sh           # Startup script (uses uv for Python env)
├── update_dependencies.sh  # Script to update Python dependencies
├── requirements.txt   # Python dependencies
├── README.md          # This file
```

---

## Development
- **Backend**: Edit code in `backend/app/`, run tests with `pytest backend/`
- **Frontend**: Edit code in `frontend/src/`, run tests with your preferred React testing tools
- **Dependencies**: Update Python dependencies with `./update_dependencies.sh`

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
