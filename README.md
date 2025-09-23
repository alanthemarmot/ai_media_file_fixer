# Media File Renamer

A powerful Electron desktop application and web app for searching The Movie Database (TMDb), exploring filmographies, and organizing media files with consistent naming. Features an enhanced search experience with autocomplete, dark/light mode themes, and bulk file renaming capabilities.

---

## ✨ Features

### 🔍 **Enhanced Search Experience**
- **Smart Search with Autocomplete**: Real-time search suggestions with fuzzy matching using Fuse.js
- **Universal Search**: Query TMDb for TV shows, movies, or people (actors/directors) by name
- **Enhanced Results**: Keyboard navigation, search history, and intelligent result ranking
- **Multi-Tab Results**: Organized results with separate tabs for TV Shows, Movies, and People

### 🎭 **Person & Filmography**
- **Complete Filmography**: Browse actor's or director's filmography with chronological sorting
- **Cast & Crew Details**: View detailed cast information with up to 15 actors displayed
- **Smart Navigation**: Navigate from person filmography to specific shows/movies with breadcrumb navigation
- **Professional Categories**: Filter by acting, directing, producing, and other roles

### 📁 **File Management & Renaming**
- **Bulk File Renaming**: Select and rename multiple files at once with consistent naming
- **Directory Support**: Rename entire TV show directories with proper formatting
- **Smart Naming**: Generate formatted names for:
  - TV Episodes: `S{{season:02d}}E{{episode:02d}} - {{Episode Title}} ({{Quality}})`
  - Movies: `{{Movie Title}} [{{Year}}] ({{Quality}})`
  - Directories: `{{Show Title}} [{{Network}}]`
- **Quality Selection**: Choose between 720p, 1080p, and 2160p for file naming

### 🎨 **Modern Interface**
- **Dark/Light Mode**: Toggle between themes with persistent settings
- **Responsive Design**: Clean, modern UI built with Tailwind CSS
- **Electron Desktop App**: Native desktop experience with file system access
- **Web Browser Support**: Also works as a traditional web application

### 🔐 **Security & Privacy**
- **API Key Management**: Secure local storage of TMDb API keys
- **Server-Side Protection**: API keys never exposed to the client
- **Local-Only**: Runs entirely on your machine for privacy

---

## 🏗️ Architecture

- **Frontend**: React 19.1, TypeScript, Tailwind CSS 3.4, Vite 6.3
- **Desktop**: Electron 38.1 with native file system access
- **Backend**: Python 3.12+, FastAPI, httpx, uvicorn
- **Search**: Fuse.js for fuzzy search and autocomplete
- **Styling**: Tailwind CSS with dark/light mode support
- **API**: Backend proxies all TMDb requests to keep your API key secure

---

## 🚀 How It Works

### Web Browser Mode
1. **Start the app**: Run `./start.sh` for web browser access
2. **Search with autocomplete**: Start typing - see live suggestions appear
3. **Explore results**: Browse organized tabs for TV Shows, Movies, and People
4. **Navigate seamlessly**: Use breadcrumbs to move between search, filmography, and details
5. **Generate file names**: Get properly formatted names for your media files

### Electron Desktop Mode
1. **Launch desktop app**: Run `./start-electron.sh` for native desktop experience
2. **File system access**: Browse and select actual files from your computer
3. **Bulk renaming**: Select multiple files and rename them all at once
4. **Quality selection**: Choose video quality (720p/1080p/2160p) for proper naming
5. **Theme preference**: Toggle between dark and light modes with persistent settings

### Search Features
- **Real-time suggestions**: Get instant autocomplete as you type
- **Fuzzy matching**: Find results even with typos or partial names
- **Keyboard navigation**: Use arrow keys and Enter to navigate suggestions
- **Enhanced search**: Try variations automatically for better results

---

## 📦 Installation & Usage

### Prerequisites
- **Python 3.12+**
- **Node.js 18+**
- **[uv](https://docs.astral.sh/uv/guides/)** (for Python environment management)
- **TMDb API key** (free from [The Movie Database](https://www.themoviedb.org/settings/api))

### 🚀 Quick Start

#### 1. **Clone the repository**
```bash
git clone <repository-url>
cd media_file_renamer
```

#### 2. **Set up your TMDb API key**
Create `backend/.env` file:
```env
TMDB_API_KEY=your_tmdb_api_key_here
```
*Note: You can also set the API key through the app's settings interface.*

#### 3. **Install uv (if not already installed)**
```bash
# Install uv using pipx (recommended)
pipx install uv

# Or with pip for user installation
pip install uv
```

#### 4. **Choose your deployment method:**

**🌐 Web Browser Mode** (for file name generation):
```bash
./start.sh
```
- Automatically sets up Python virtual environment
- Installs all dependencies
- Starts backend (port 8000) and frontend (port 5173)
- Open http://localhost:5173 in your browser

**🖥️ Electron Desktop Mode** (for file renaming):
```bash
./start-electron.sh
```
- Starts backend and frontend services
- Launches native Electron desktop application
- Provides file system access for bulk renaming

### 🛑 Stopping the App
Press `Ctrl+C` in your terminal to stop all services.

### 📱 Alternative Setup
If you prefer manual setup or need to customize the installation:

```bash
# Backend setup
cd backend
source ../.venv/bin/activate  # or create with: uv venv ../.venv
uv pip install -r ../requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend setup (in another terminal)
cd frontend
npm install
npm run dev              # For web mode
npm run electron-dev     # For desktop mode
```

---

## 📂 Project Structure
```
media_file_renamer/
├── backend/                    # FastAPI backend server
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py       # API endpoints & filmography
│   │   ├── services/
│   │   │   ├── tmdb.py         # TMDb API integration
│   │   │   ├── cache.py        # Response caching
│   │   │   └── file_service.py # File operations
│   │   └── main.py             # FastAPI application
│   └── tests/                  # Backend test suite
├── frontend/                   # React + Electron frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── EnhancedSearchBar.tsx    # Smart search with autocomplete
│   │   │   ├── ResultsList.tsx          # Organized result tabs
│   │   │   ├── Filmography.tsx          # Person filmography browser
│   │   │   ├── BulkRenamePanel.tsx      # File renaming interface
│   │   │   ├── ThemeToggle.tsx          # Dark/light mode toggle
│   │   │   ├── SettingsModal.tsx        # Configuration settings
│   │   │   └── ...                      # Additional components
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx         # Theme management
│   │   ├── services/
│   │   │   ├── apiKeyService.ts         # API key management
│   │   │   └── electronFileService.ts   # File system operations
│   │   └── hooks/
│   │       └── useFileRename.ts         # Bulk rename logic
│   ├── electron.js             # Electron main process
│   └── package.json            # Frontend dependencies & Electron config
├── scripts/                    # Utility scripts
│   ├── test_person_search.sh   # API testing script
│   └── update_dependencies.sh  # Dependency updater
├── start.sh                    # Web browser startup
├── start-electron.sh           # Electron desktop startup
├── requirements.txt            # Python dependencies
└── README.md                   # This documentation
```

---

## 🛠️ Development

### Backend Development
```bash
# Run backend in development mode
cd backend
source ../.venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Run tests
pytest backend/

# Update dependencies
./scripts/update_dependencies.sh
```

### Frontend Development
```bash
# Web development mode
cd frontend
npm run dev

# Electron development mode
npm run electron-dev

# Build for production
npm run build

# Lint code
npm run lint
```

### Electron Distribution
```bash
# Build Electron app for distribution
cd frontend
npm run build-electron

# Create distributable packages
npm run dist
```

### Testing API Endpoints
```bash
# Test person search and filmography endpoints
./scripts/test_person_search.sh
```

### Key Dependencies
- **Frontend**: React 19, TypeScript, Tailwind CSS, Fuse.js, Electron
- **Backend**: FastAPI, httpx, uvicorn, pytest
- **Development**: Vite, ESLint, uv (Python package manager)

---

## 🔒 Security & Privacy

- **API Key Protection**: TMDb API keys are stored securely and never exposed to the client
- **Local Operation**: All processing happens on your machine - no data sent to external servers
- **File System Safety**: Electron app operates with standard user permissions
- **No Tracking**: No analytics, telemetry, or user data collection
- **Open Source**: Full transparency with all code available for review

---

## 🚀 Recent Updates

### v1.0.0 - Enhanced Desktop Experience
- ✨ **Electron Desktop App**: Native desktop experience with file system access
- 🔍 **Smart Search**: Enhanced search with autocomplete and fuzzy matching
- 🎨 **Dark/Light Mode**: Toggle themes with persistent preferences
- 📁 **Bulk File Renaming**: Select and rename multiple files at once
- 🎯 **Quality Selection**: Choose video quality for proper file naming
- 🧹 **Code Cleanup**: Removed unused components and organized project structure
- 📊 **Enhanced Cast Display**: Show up to 15 cast members with improved layout
- 🔧 **Better Error Handling**: Improved API error messages and user feedback

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
1. Follow the installation instructions above
2. Make your changes in a feature branch
3. Test both web and Electron modes
4. Ensure all tests pass: `pytest backend/`
5. Submit a pull request

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Credits

- **[The Movie Database (TMDb)](https://www.themoviedb.org/)** - Free movie/TV metadata API
- **Built with**: FastAPI, React 19, TypeScript, Tailwind CSS, Vite, Electron
- **Search powered by**: Fuse.js for intelligent fuzzy matching
- **Icons**: Heroicons for beautiful UI icons
