# Functional Design Document: Simplified Media Naming Helper

## 1. Overview

**Purpose:**  
Provide a lightweight local web app that lets the user search The Movie Database (TMDb), select a show or movie from the results, and generate a formatted naming string suitable for clipboard copying.

**Key Features:**  
1. **Search:** Query TMDb for TV shows or movies by title.  
2. **Select:** Display a list of search results for user selection.  
3. **Display Naming:** Upon user action, show a plain-text naming convention string for the chosen item:  
   - **TV Show Episode:** `S{season:02d}E{episode:02d} - {Episode Title} ({Quality})`  
   - **Movie:** `{Movie Title} [{Year}] ({Quality})`  
4. **Copy to Clipboard:** Allow easy manual copy of the displayed text.

---

## 2. Architecture

- **Frontend (React):** Single-page interface handling search, selection, and display.  
- **Backend (Python, FastAPI):** Minimal API proxy to TMDb to avoid exposing API key in frontend.

---

## 3. Functional Flow

1. **Search Screen**  
   - User enters query and presses **Search**.  
   - React calls `GET /api/search?query={query}`.  
   - Backend proxies to TMDb search endpoint, returns top N results.  
   - Frontend lists titles with type indicator (TV/Movie) and release year.

2. **Select Media**  
   - User clicks an item; store its TMDb `id` and `media_type`.

3. **Display Naming**  
   - User presses **Display** button.  
   - React calls `GET /api/details?id={id}&type={media_type}`.  
   - Backend fetches details from TMDb:  
     - For **TV:** also fetch latest season & episode numbers and titles.  
     - For **Movie:** fetch release year.  
   - Frontend constructs naming string using a configurable `quality` (default `1080p`).  
   - Display the string in a read-only text box with a **Copy** button.

---

## 4. API Endpoints

- `GET /api/search?query={query}`  
  - Proxy to TMDb `/search/multi`.  
  - Return JSON:  
    ```json
    [
      { "id": 123, "media_type": "tv", "title": "The Sopranos", "year": 1999 },
      { "id": 456, "media_type": "movie", "title": "Sopranos: The Movie", "year": 2021 }
    ]
    ```

- `GET /api/details?id={id}&type={media_type}`  
  - If `type=tv`:  
    1. Fetch `/tv/{id}` for name and network.  
    2. Fetch `/tv/{id}/season/{season_number}/episode/{episode_number}` for episode title.  
  - If `type=movie`:  
    - Fetch `/movie/{id}` for title and release year.  
  - Return JSON:  
    ```json
    {
      "title": "The Sopranos",
      "network": "HBO",         // TV only
      "season": 2,              // TV only
      "episode": 11,            // TV only
      "episode_title": "The Homecoming", // TV only
      "year": 1999              // Movie only
    }
    ```

---

## 5. UI Components

- **SearchBar:** Input + Search button.  
- **ResultsList:** Clickable list of results.  
- **DisplayArea:** Shows generated text and Copy button.  
- **Notifications:** Success/error toasts.

---

## 6. Naming Logic

- **Default Quality:** `1080p` (configurable in code).

### 6.1. TV Naming  
```
S{season:02d}E{episode:02d} - {episode_title} ({quality}).{file_extension}
```
Example: S02E11 - The Homecoming (1080p).mp4

### 6.2. Movie Naming
```
{title} [{year}] ({quality}).{file_extension}
```

Example: Jurassic Park [1993](1080p).mkv

### 6.3 File Renaming Logic & Directory Naming Logic

1. **Validate** file existence and permissions.  
2. **Generate target filename for TV shows/episodes**:   S{season:02d}E{episode:02d} - {Episode Title} ({File format}).{ext}
3. **Generate target directories for TV shows/episodes**:   {Show Title} [{TV Network}]({File Format})/Season{season:02d} ({File format})
4. **Generate target filename for Movies**:   S{Movie Title} [{Year of Release}]({File format}).{ext}


## 7. Technology Stack
- **Frontend:**
  - React (hooks, functional components)
  - Tailwind CSS + Headless UI or Material-UI
  - State management: Context API or Redux (optional)
  - File picker: HTML5 File System Access API

- **Backend:**
  - Python 3.12
  - uv for python environment and package management
  - FastAPI
  - HTTP client: httpx or requests
  - Caching: functools LRU or SQLite

- **Metadata API Options (free tier):**
  - TMDb (free API key) for movies and tv shows. Setup,  can provide the API key.

- **Development Tools:**
  - VSCode with Copilot
  - `uv` for Python environment management and dependency installation
  - Pytest for backend tests, Jest/React Testing Library for frontend

- **Installation/setup:**
  - Shell script executable to create and start the python environment and run the Python/node code locally.
  - Dockerized startup once the application is fully created and deployable.


## 8. Non-Functional Requirements
   - Local-Only: Runs on localhost.
   - Simple Deploy: One uv command to run backend and npm start for frontend.
   - Security: API key never exposed to client.