# Functional Design Document: Media Renamer Web App

## 1. Overview

**Purpose:**  
Build a local web application that allows users to batch rename torrent media files (TV episodes, movies) into a consistent naming convention. The app searches and fetches metadata (episode titles, numbers) from a free online API, previews the renaming, and commits changes.

**Target Audience:**  
Tech-savvy users with downloaded media libraries who want consistent file naming for media server compatibility (e.g., Plex, Jellyfin).

**Key Goals:**
- Search for TV series/movies and retrieve metadata.
- Select local files and map them to metadata entries.
- Preview original vs. proposed filenames.
- Confirm and execute renaming operations on the filesystem.

---

## 2. Architecture

### 2.1. High-Level Components

- **Frontend (React):**
  - Search UI
  - File picker and mapping interface
  - Rename preview modal
  - Confirmation & status feedback

- **Backend (Python, FastAPI):**
  - API endpoints: search, metadata fetch, preview rename, execute rename
  - Metadata service integration (TVmaze, TMDb, etc.)
  - File system operations
  - Validation & 
  - Error Handling: Show an eror message depending on the issue -> * API rate limits or unavailability. * No search results found. * Files are locked or in use during renaming. * Invalid file types selected. * Duplicate episode numbers in metadata or local files. * Network connectivity issues. *
  - 


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
  - Python 3.10+
  - FastAPI
  - HTTP client: httpx or requests
  - Caching: functools LRU or SQLite

- **Metadata API Options (free tier):**
  - TVmaze API (no API key required)
  - TMDb (free API key)

- **Development Tools:**
  - VSCode with Copilot
  - `uv` for Python environment management and dependency installation
  - Pytest for backend tests, Jest/React Testing Library for frontend

- **Installation/setup:**
  - Shell script executable to create and start the python environment and run the Python/node code locally.
  - Dockerized startup once the application is fully created and deployable.

---

## 6. Component Design & Data Flow

1. **Search Screen**  
   - User enters query → React calls `GET /api/search?query=` → FastAPI fetches from metadata API → returns list of matching TV or Movie titles.

2. **Metadata Browser**  
   - On title select → `GET /api/series/{id}/episodes` → returns the Movie or TV seasons & episodes.

3. **File Picker & Mapping**  
   - User picks a directory → frontend reads filenames → displays list.  
   - Auto-map by parsing existing names or manual drag-and-drop.

4. **Preview Rename**  
   - Frontend builds rename map → displays “Current Name” vs. “Proposed Name”.

5. **Execute Rename**  
   - User confirms → POST `/api/rename` with map → backend performs atomic `os.rename` operations → returns success/errors.

---

## 7. UI Wireframes & Mockups (Described)

- **Search Page:** Centered search bar; list of results with posters, titles, years.  
- **Season Selector:** Dropdown or grid of seasons; episode list with titles.  
- **File Mapping Screen:** Two-column layout: “Files” and “Episodes”; drag-and-drop or auto-match.  
- **Preview Modal:** Table of old vs. new filenames; Confirm/Cancel buttons.  
- **Status Notifications:** Toasts for success/failure messages.
- **All Pages:* *Should contain a return to main/home button and a back button

---

## 8. API Integration

- **TVmaze Search:**  
  `GET https://api.tvmaze.com/search/shows?q={query}`

- **Episodes List:**  
  `GET https://api.tvmaze.com/shows/{id}/episodes`

> **Normalize Response Fields:**  
> `season`, `number`, `name`, `airdate`

---

## 9. File Renaming Logic & Directory Naming Logic

1. **Validate** file existence and permissions.  
2. **Generate target filename for TV shows/episodes**:   S{season:02d}E{episode:02d} - {Episode Title} ({File format}).{ext}
3. **Generate target directories for TV shows/episodes**:   {Show Title} [{TV Network}]({File Format})/Season{season:02d} ({File format})
4. **Generate target filename for Movies**:   S{Movie Title} [{Year of Release}]({File format}).{ext}