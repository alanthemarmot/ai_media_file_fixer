# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Python Backend (always use uv)
- `uv venv .venv` - Create virtual environment at project root
- `source .venv/bin/activate` - Activate virtual environment
- `uv pip install -r requirements.txt` - Install Python dependencies
- `uv run uvicorn app.main:app --reload --port 8000` - Start backend server (from backend/ directory)
- `uv run pytest` - Run Python tests (from backend/ directory)

### React Frontend
- `npm install` - Install dependencies (from frontend/ directory)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run electron` - Run Electron app (production build required)
- `npm run electron-dev` - Run Electron app in development mode
- `npm run build-electron` - Build Electron app
- `npm run dist` - Create distributable packages

### Quick Start Scripts
- `./start.sh` - Start web version (backend + frontend dev servers)
- `./start-electron.sh` - Start Electron desktop app with backend

## Architecture Overview

### Dual-Mode Application
This is an Electron/React application that runs in two modes:
1. **Web Mode**: Traditional web app accessed via browser
2. **Desktop Mode**: Native Electron app with file system access for bulk renaming

### Backend (FastAPI)
- **Entry Point**: `backend/app/main.py` - FastAPI application with CORS for frontend
- **API Routes**: `backend/app/api/routes.py` - All API endpoints including TMDb proxy and file operations
- **TMDb Integration**: `backend/app/services/tmdb.py` - TMDbService with caching, retry logic, and comprehensive error handling
- **File Operations**: `backend/app/services/file_service.py` - FileService for safe file renaming and validation
- **Configuration**: `backend/app/core/config.py` - Settings management with .env support

### Frontend (React 19 + TypeScript)
- **Main App**: `frontend/src/App.tsx` - Primary application logic with view state management
- **Search**: `frontend/src/components/EnhancedSearchBar.tsx` - Smart search with autocomplete using Fuse.js
- **Results**: `frontend/src/components/ResultsList.tsx` - Tabbed results (TV/Movies/People)
- **Navigation**: Multi-level navigation with breadcrumbs for TV shows → seasons → episodes
- **Filmography**: `frontend/src/components/Filmography.tsx` - Person filmography browser
- **File Operations**: `frontend/src/components/BulkRenamePanel.tsx` - Bulk file renaming interface
- **Theme**: Dark/light mode with persistent settings via `frontend/src/contexts/ThemeContext.tsx`

### Key Integration Points
- **API Key Management**: Dual system - server-side .env or client-side local storage
- **Electron Bridge**: `frontend/electron.js` provides file system access APIs
- **File Service Hook**: `frontend/src/hooks/useFileRename.ts` manages bulk rename operations
- **TMDb Caching**: Backend implements 1-hour response caching with retry logic

### Data Flow
1. **Search**: EnhancedSearchBar → TMDb API → ResultsList (tabbed by media type)
2. **TV Navigation**: Show selection → seasons → episodes with breadcrumb navigation
3. **Person Navigation**: Person selection → filmography → show/movie details
4. **File Operations**: File selection → suggested naming → bulk rename execution

### File Naming Patterns
- **TV Episodes**: `S{season:02d}E{episode:02d} - {Episode Title} ({Quality})`
- **Movies**: `{Movie Title} [{Year}] ({Quality})`
- **TV Directories**: `{Show Title} [{Network}]`

### Error Handling Strategy
- **Backend**: Comprehensive exception handling with specific error codes
- **Frontend**: User-friendly error messages with retry mechanisms
- **TMDb API**: Automatic retry with exponential backoff for rate limits and server errors

### Development Notes
- API keys can be provided via backend/.env (TMDB_API_KEY) or through frontend settings
- Backend serves as a proxy to keep API keys secure
- Electron mode provides native file system access for actual file renaming
- Web mode generates suggested filenames without file system access

## Claude bespok commands!
1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. Finally, add a review section to the todo.md file with a summary of the changes you made and any other relevant information.
8. DO NOT BE LAZY. NEVER BE LAZY. IF THERE IS A BUG FIND THE ROOT CAUSE AND FIX IT. NO TEMPORARY FIXES. YOU ARE A SENIOR DEVELOPER. NEVER BE LAZY
9. MAKE ALL FIXES AND CODE CHANGES AS SIMPLE AS HUMANLY POSSIBLE. THEY SHOULD ONLY IMPACT NECESSARY CODE RELEVANT TO THE TASK AND NOTHING ELSE. IT SHOULD IMPACT AS LITTLE CODE AS POSSIBLE. YOUR GOAL IS TO NOT INTRODUCE ANY BUGS. IT'S ALL ABOUT SIMPLICITY


CRITICAL: When debugging, you MUST trace through the ENTIRE code flow step by step. No assumptions. No shortcuts.
- Dont add and commit anything unless given instructions to do so.