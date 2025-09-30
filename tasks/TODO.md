# Media File Renamer - Consolidated TODO & Roadmap

## 🎯 PHASE 1: Core Improvements (High Priority)

### Data & Storage
- [ ] Add SQLite for local TMDb data caching and user preferences
- [ ] Implement persistent storage for naming templates and quality defaults
- [ ] Store batch renaming history with undo/redo operations
- [ ] Cache TMDb matches to reduce API calls

### File System Integration
- [ ] File system scanner to detect media files automatically
- [ ] Auto-match local files with TMDb entries using fuzzy matching
- [ ] Preview rename operations before applying
- [ ] Folder structure creation (Season folders for TV shows)
- [ ] Move files to organized directories based on media type
- [ ] Subtitle file handling (match and rename .srt files)

### Template System
- [ ] Customizable naming templates with variables
- [ ] Multiple template presets (Plex, Jellyfin, Kodi, Emby formats)
- [ ] Live preview as user types template
- [ ] Template validation with error messages
- [ ] Import/export templates for sharing
- [ ] Visual template builder with drag-and-drop
- [ ] Syntax highlighting for template strings

### User Experience - Critical
- [ ] Toast notifications for user feedback
- [ ] Batch operations UI with progress indicators
- [ ] Keyboard shortcuts for common actions
- [ ] Drag-and-drop for file matching
- [ ] Modal dialogs for confirmations and complex forms
- [ ] Context menus for right-click actions

---

## 🚀 PHASE 2: Enhanced UX & Performance (Medium Priority)

### Performance Optimization
- [ ] Virtual scrolling for large filmographies
- [ ] Lazy load images with intersection observer
- [ ] Pre-fetch likely next requests (e.g., season details)
- [ ] Request debouncing for search operations
- [ ] Code splitting and bundle size optimization
- [ ] React.memo and useMemo strategic implementation
- [ ] Parallel file processing for batch operations

### Advanced Search & Filtering
- [ ] Filters panel (year, genre, rating, runtime, country)
- [ ] Search history dropdown with auto-suggestions
- [ ] Search result sorting options
- [ ] Filter chips for active filters
- [ ] Clear all filters button
- [ ] Bulk search from CSV/text file input

### Workflow Enhancements
- [ ] Undo/redo functionality for all operations
- [ ] Operation history viewer with filtering
- [ ] Quick actions menu for frequent tasks
- [ ] Favorites/bookmarks for frequently accessed media
- [ ] Recent searches quick access

### Responsive & Mobile
- [ ] Touch-friendly interface with appropriate touch targets
- [ ] Swipe gestures for navigation
- [ ] Mobile-first responsive improvements
- [ ] Collapsible navigation for mobile
- [ ] Responsive images with appropriate sizing

---

## 🎨 PHASE 3: Polish & Architecture (Lower Priority)

### State Management
- [ ] Implement proper state management (Zustand recommended)
- [ ] Persistent state for user preferences
- [ ] Optimistic updates for better UX
- [ ] State hydration from cache/localStorage

### Testing & Quality
- [ ] Frontend unit tests with Vitest + React Testing Library
- [ ] E2E tests with Playwright for critical user journeys
- [ ] Component testing for all UI components
- [ ] Visual regression testing
- [ ] Accessibility testing automation with axe-core
- [ ] Cross-browser testing automation

### Accessibility
- [ ] ARIA labels throughout the application
- [ ] Complete keyboard navigation for all features
- [ ] Screen reader support improvements
- [ ] High contrast mode
- [ ] Adjustable font sizes
- [ ] Focus management for modals and dropdowns
- [ ] Color-blind friendly design choices

### Developer Experience
- [ ] Component storybook for UI development
- [ ] API documentation with OpenAPI/Swagger
- [ ] Pre-commit hooks for linting and formatting
- [ ] Automated dependency updates with security scanning
- [ ] Docker setup for consistent development

---

## 🔮 PHASE 4: Advanced Features & Integrations

### Media Server Integration - PLEX (Priority)

#### 🎬 Plex Core Integration (Phase 4A - High Priority)
- [ ] **Plex Authentication**: Implement X-Plex-Token authentication flow
  - User provides token via settings UI
  - Secure token storage (encrypted local storage)
  - Token validation and error handling

- [ ] **Plex Library Browser**: Import and display user's Plex library
  - Fetch all libraries (Movies, TV Shows, etc.)
  - Display in familiar grid/list view
  - Show Plex-specific metadata (watch status, ratings)
  - Filter by library section

- [ ] **Metadata Import from Plex**: Use Plex as metadata source
  - Extract existing Plex metadata for files
  - Parse GUIDs to get IMDb/TMDb IDs
  - Avoid duplicate TMDb API calls for matched content
  - Hybrid mode: Plex for library, TMDb for new searches

- [ ] **Watch Status Integration**: Display and filter by watch history
  - Show watched/unwatched indicators on media cards
  - Filter: "Only Watched" / "Only Unwatched" / "In Progress"
  - Display last watched date
  - Show watch count and progress percentage

- [ ] **Auto Library Refresh**: Trigger Plex scan after operations
  - Call Plex scan endpoint after bulk renames
  - Show scan progress/status
  - Optional: Auto-refresh on file changes

#### 🎬 Plex Advanced Features (Phase 4B - Medium Priority)
- [ ] **Plex-Style Naming Templates**: Auto-detect Plex's preferred format
  - Preset templates matching Plex conventions
  - Validate against Plex naming requirements
  - Preview how Plex will match the file

- [ ] **Duplicate Detector**: Find duplicate movies/episodes in Plex
  - Scan for same title + year with different files
  - Compare quality/resolution
  - Suggest which version to keep

- [ ] **Missing Media Finder**: Identify gaps in TV seasons
  - Compare local library against TMDb episode lists
  - Highlight missing episodes in UI
  - Generate download/search lists

- [ ] **Watch History Analytics**: Visualize viewing patterns
  - Most watched genres/actors/directors
  - Viewing timeline graphs
  - Binge-watching statistics

- [ ] **Plex Collections Sync**: Match and manage Plex collections
  - Import existing Plex collections
  - Create new collections from app
  - Sync collection changes back to Plex

#### 🎬 Plex Power Features (Phase 4C - Lower Priority)
- [ ] **Two-Way Metadata Sync**: Keep app and Plex in sync
  - Push metadata changes to Plex
  - Pull Plex edits back to app
  - Conflict resolution UI

- [ ] **Plex Webhooks**: Real-time updates from Plex
  - Listen for media.play, media.scrobble events
  - Auto-update watch status
  - Notifications for new media added

- [ ] **Multi-Server Support**: Handle multiple Plex servers
  - Connect to multiple servers simultaneously
  - Switch between servers in UI
  - Aggregate statistics across servers

- [ ] **Plex Recommendations**: Surface Plex's "similar content"
  - Show related movies/shows
  - "Because you watched..." feature
  - Integration with existing recommendation engine

#### 📋 Technical Implementation Notes
- **API Endpoint**: Use official plexapi.dev documentation
- **Python Library**: Consider python-plexapi for backend integration
- **Authentication**: X-Plex-Token in headers or JWT for new auth
- **Rate Limiting**: Respect Plex server performance
- **Offline Mode**: Cache Plex metadata for offline access
- **Error Handling**: Graceful fallback if Plex unavailable

---

### Other Media Server Integrations (Phase 4D - Future)
- [ ] Jellyfin API support (similar architecture to Plex)
- [ ] Kodi database compatibility
- [ ] Emby server connection
- [ ] Webhook support for automated workflows

### External Services
- [ ] Trakt.tv integration for watch history
- [ ] OMDB API as TMDb fallback
- [ ] TheTVDB integration for TV show data
- [ ] SubtitleDB for subtitle downloads
- [ ] Cloud storage support (Google Drive, Dropbox)

### PWA & Offline
- [ ] Service worker for offline functionality
- [ ] Cache strategies for different asset types
- [ ] Background sync when connection is restored
- [ ] App installation prompts
- [ ] Push notifications for updates

### Monitoring & Analytics
- [ ] Application metrics with Prometheus/Grafana
- [ ] Error tracking with Sentry
- [ ] Performance monitoring for API calls
- [ ] Feature usage analytics (privacy-respecting)
- [ ] Core Web Vitals monitoring

---

## 💡 INNOVATIVE FEATURES (New Suggestions)

### AI-Powered Features
- [ ] **Smart Duplicate Detection**: Use ML to identify duplicate/similar media files with different names/quality (🎬 Enhanced by Plex integration)
- [ ] **Quality Upgrade Suggestions**: AI analyzes your library and suggests which files to upgrade (e.g., 720p → 1080p available) (🎬 Uses Plex library data)
- [ ] **Watch History Analysis**: ML-based recommendations based on viewing patterns (🎬 Requires Plex/Jellyfin integration)
- [ ] **Auto-Categorization**: AI suggests custom collections/playlists based on themes, actors, directors (🎬 Can sync with Plex collections)
- [ ] **Subtitle Auto-Sync**: Use audio fingerprinting to auto-sync out-of-sync subtitles

### Social & Collaborative Features
- [ ] **Shared Libraries**: Share curated collections with friends (privacy-focused, no actual files shared)
- [ ] **Template Marketplace**: Community-driven template sharing with ratings and reviews
- [ ] **Watch Party Scheduler**: Coordinate watch parties with integrated calendars and notifications
- [ ] **Collaborative Watchlists**: Shared family/friend watchlists with voting system
- [ ] **Media Discovery Feed**: Curated feed of new releases based on your library preferences

### Advanced Organization
- [ ] **Smart Collections**: Auto-updating collections (e.g., "Oscar Winners," "Christmas Movies," "90s Action") (🎬 Syncs with Plex collections)
- [ ] **Franchise Auto-Grouping**: Automatically detect and group franchises (MCU, Star Wars, etc.)
- [ ] **Watch Progress Sync**: Cross-device watch progress tracking (🎬 Powered by Plex API)
- [ ] **Multi-Version Management**: Handle multiple versions of same media (4K, 1080p, Director's Cut) (🎬 Enhanced by Plex duplicate detection)
- [ ] **Missing Media Detective**: Identify missing episodes/seasons in your TV show collection (🎬 Core Plex feature in Phase 4B)

### Automation & Intelligence
- [ ] **Auto-Download Manager**: Integration with download clients (SABnzbd, qBittorrent) for auto-organization
- [ ] **Release Calendar**: Track upcoming releases of shows you follow with notifications
- [ ] **Storage Optimizer**: Analyze library and suggest compression/upgrade opportunities to save space
- [ ] **Metadata Health Check**: Periodic scans to identify and fix incomplete/incorrect metadata
- [ ] **Bulk Quality Analyzer**: Scan video files and tag actual quality (detect upscales, bitrate issues)

### Visual Enhancements
- [ ] **Interactive Timeline View**: Visual timeline of your library by year/genre (🎬 Uses Plex library data)
- [ ] **Library Statistics Dashboard**: Beautiful visualizations of your collection (genres, years, actors, etc.) (🎬 Powered by Plex watch history)
- [ ] **3D Library Browser**: Immersive 3D poster wall navigation (WebGL)
- [ ] **Trailer Integration**: Inline trailer playback from YouTube/TMDb
- [ ] **Actor/Director Networks**: Interactive graph showing connections between people in your library (🎬 Enhanced by Plex metadata)

### Power User Features
- [ ] **Advanced Regex Builder**: Visual regex pattern builder for complex rename operations
- [ ] **Conditional Rename Logic**: If/else logic in templates (different naming for anime, documentaries, etc.)
- [ ] **Batch Metadata Editor**: Edit metadata for multiple files at once
- [ ] **Custom API Integrations**: Plugin system for custom metadata sources
- [ ] **Scripting Engine**: JavaScript/Python scripting for custom automation workflows

### Mobile-Specific Features
- [ ] **Barcode Scanner**: Scan physical media barcodes to add to digital library
- [ ] **Voice Commands**: "Hey app, find me action movies from 2020"
- [ ] **AR Library Browser**: Point camera at shelf, see digital metadata overlay
- [ ] **Offline Library Browser**: Full library browsing offline with cached metadata
- [ ] **Quick Share**: Generate shareable links to specific movies/shows (metadata only)

### Gamification & Engagement
- [ ] **Collection Challenges**: "Complete the MCU," "Watch all Kubrick films," etc.
- [ ] **Achievement System**: Unlock badges for library milestones
- [ ] **Library Stats & Leaderboards**: Compare collection size/diversity with friends (opt-in)
- [ ] **Watchlist Goals**: Set and track personal viewing goals
- [ ] **Discovery Streaks**: Encourage watching diverse genres/eras

---

## ✅ COMPLETED FEATURES

### Phase 1 Completions
- ✅ Dark/light theme toggle with system preference detection
- ✅ Error boundary components for crash prevention
- ✅ Loading states and skeletons for better perceived performance
- ✅ Advanced search filters (Randomizer feature)
  - Collapsible FilterPanel component
  - Media type selector (TV Shows/Movies)
  - Optional genre filter
  - New/Old release period toggle
  - Returns 10 random results based on filters
- ✅ Rating display on all media cards
  - Vote average with star icon on ResultsList
  - Vote average with star icon on Filmography
  - Consistent yellow star styling across app

---

## 📝 IMPLEMENTATION NOTES

### Priority Guidelines
1. Focus on features that enhance core functionality (file management, search, organization)
2. Prioritize performance and accessibility from the start
3. Measure performance impact of each feature
4. Maintain consistent design language throughout
5. Test on multiple devices and browsers
6. Consider progressive enhancement for complex features

### Feature Evaluation Criteria
- **User Impact**: How many users benefit?
- **Development Effort**: Time and complexity estimate
- **Dependencies**: What needs to exist first?
- **Maintenance**: Long-term support burden
- **Innovation**: Does it differentiate the product?

### Next Steps
1. Review innovative features and mark approved ones
2. Prioritize Phase 1 items based on immediate user needs
3. Begin with File System Integration (core functionality)
4. Implement Template System alongside file operations
5. Add Data & Storage layer to support features

---

**Last Updated**: 2025-09-30
