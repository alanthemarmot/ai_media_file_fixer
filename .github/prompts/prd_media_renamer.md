# Functional Design Document: Media Renamer Web App

## 1. Overview

**Purpose:**  
Build a local web application that allows users to batch rename torrent media files (TV episodes, movies) into a consistent naming convention. The app searches and fetches metadata (movie/episode titles, numbers, year of release) from a free online API, previews the renaming, and commits changes.

**Target Audience:**  
Tech-savvy users with downloaded media libraries who want consistent file naming for media server compatibility (e.g., Plex, Jellyfin).

**Key Goals:**
- Select local media files and derive the require movie/tv show from the directory name.
- Search for TV series/movies and retrieve metadata based on the pulled title, show the results from the search on screen for the user to choose the correct one or to correct the results.
- Once the correct movie/show has been selected, atomatically map the local files to the metadata entries.
- Preview original vs. proposed filenames.
- Confirm and execute renaming operations on the filesystem.

---

## 2. Architecture

### 2.1. High-Level Components

- **Frontend (React):**
  - File picker and mapping interface.
  - Media discplay screen to choose the movie/series.
  - Rename preview modal
  - Confirmation & status feedback

- **Backend (Python, FastAPI):**
  - API endpoints: search, metadata fetch, preview rename, execute rename
  - Metadata service integration (TVmaze, TMDb, etc.)
  - File system operations
  - Validation
  - Error Handling: Show an eror message depending on the issue -> * API rate limits or unavailability. * No search results found. * Files are locked or in use during renaming. * Invalid file types selected. * Duplicate episode numbers in metadata or local files. * Network connectivity issues. *


---

## 3. Functional Requirements

### 3.1. User Stories

1. **Search Media**  
   As a user, I want to search for a TV show or movie by name so that I can select the correct title.

2. **Select Season/Episodes**  
   As a user, I want to browse seasons and episodes metadata so I can choose the right entries.

3. **Pick Local Files**  
   As a user, I want to select my downloaded files from my filesystem to map them against metadata.

4. **Map Files to Metadata**  
   As a user, I want to match each file to an episode (e.g., Episode 3 → file `S03E03`) to handle mismatches.

5. **Preview Rename**  
   As a user, I want to see “Before” and “After” filenames before applying changes.

6. **Execute Rename**  
   As a user, I want to confirm and apply the renaming operations.

7. **Error Handling**  
   As a user, I want to be notified if a file cannot be renamed (e.g., permission issues).

### 3.2. Detailed Requirements

| ID   | Description                                         | Priority |
|------|-----------------------------------------------------|----------|
| FR1  | Search media by title via external API              | High     |
| FR2  | Retrieve seasons and episode list                   | High     |
| FR3  | Allow file selection from local directories         | High     |
| FR4  | Present mapping UI to link files ↔ metadata         | High     |
| FR5  | Generate preview of rename operations               | High     |
| FR6  | Perform atomic rename transactions                  | High     |
| FR7  | Cache API responses (with TTL)                      | Medium   |
| FR8  | Allow customizing naming conventions (optional)     | Medium   |
| FR9  | Log operations and errors                           | Medium   |
| FR10 | Persist settings (last folder, API key)             | Low      |

---

## 4. Non-Functional Requirements

- **Local-Only:** No remote hosting required.  
- **Cross-Platform:** Works on Windows, macOS, Linux.  
- **Performance:** Preview generation within 200 ms for up to 100 files.  
- **Security:** No credentials stored in plaintext; API keys stored securely.  
- **Usability:** Modern, responsive UI; accessible components.

---

## 5. Technology Stack

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

---

## 6. Component Design & Data Flow

1. **File Picker & Mapping Page**  
   - User picks a directory → frontend reads filenames → displays list. 
   - Screen displays the TV Series/Movie name from the directory which te user can edit if needed.
   - Search button to execute the API search for the movie/tv show and load the next page. 
   - React calls `GET /api/search?query=` → FastAPI fetches from metadata API → returns list of matching TV or Movie titles.
   - Normalize/Validate filenames as soon as the directory is read (e.g. filter out non-media files).
   - Expose quick “reset” in case the directory name → search term mapping isn’t accurate.

2. **Metadata Browser/Display Screen**  
   - Displays all possible series/movies from the search and suer can select the correct one to go to the next screen.
   - On series select → `GET /api/series/{id}/episodes` → TV seasons & episodes.
   - or title select `GET /api/movie/{id}` → Movie.
   - Paginate search results or show “load more” if the API returns a lot of matches.
   - On a TV series selection, preload the next-level call (/shows/{id}/episodes) to hide any spinner.

3. **Preview Rename**  
   - Frontend builds rename map → displays “Current Name” vs. “Proposed Name” for movie or tv series.
   - Group errors (e.g. duplicate episode numbers) inline in the preview table so users can fix mapping before confirming.

4. **Execute Rename**  
   - User confirms → POST `/api/rename` with map → backend performs atomic `os.rename` operations → returns success/errors.
   - Wrap the batch of os.rename calls in a transaction-like rollback on partial failure (or at least surface which files failed and which succeeded).
   - Return a detailed report object (e.g. { success: [], failed: [{ name, reason }] }) so the UI can show per-file status.

---

## 7. UI Wireframes & Mockups (Described)

- **Search Page:** Centered search bar; list of results with posters, titles, years.  
- **Season Selector:** Dropdown or grid of seasons; episode list with titles.  
- **File Mapping Screen:** Two-column layout: “Files” and “Episodes”; drag-and-drop or auto-match.  
- **Preview Modal:** Table of old vs. new filenames; Confirm/Cancel buttons.  
- **Status Notifications:** Toasts for success/failure messages.
- **All Pages:** Should contain a return to main/home button and a back button

---

## 8. API Integration

- **Search Movies:**  
  `GET https://api.themoviedb.org/3/search/movie?api_key={API_KEY}&query={query}&page={page}`

- **Search TV Shows:**  
  `GET https://api.themoviedb.org/3/search/tv?api_key={API_KEY}&query={query}&page={page}`

- **Movie Details:**  
  `GET https://api.themoviedb.org/3/movie/{movie_id}?api_key={API_KEY}`

- **Season Details (Episodes):**  
  `GET https://api.themoviedb.org/3/tv/{tv_id}/season/{season_number}?api_key={API_KEY}`

- **Normalize Response Fields:**  
  **TV Shows:** `season`, `episode_number`, `name`, `air_date`  
  **Movies:** `title`, `release_date` (year), `id`, `overview`, `poster_path`  

---

## 9. File Renaming Logic & Directory Naming Logic

1. **Validate** file existence and permissions.  
2. **Generate target filename for TV shows/episodes**:   S{season:02d}E{episode:02d} - {Episode Title} ({File format}).{ext}
3. **Generate target directories for TV shows/episodes**:   {Show Title} [{TV Network}]({File Format})/Season{season:02d} ({File format})
4. **Generate target filename for Movies**:   S{Movie Title} [{Year of Release}]({File format}).{ext}