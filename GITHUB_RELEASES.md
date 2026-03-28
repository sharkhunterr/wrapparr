# GitHub Releases - Wrapparr

> Release notes for GitHub releases

---

# v0.1.0

## 🎬 Wrapparr v0.1.0 - Initial Release

Your media year in review — Spotify Wrapped style for homelab servers.

### ✨ What's New

**🎭 26+ Slide Types**
- Intro, onboarding, podium, stats, genres race, timeline, world map
- Ratings, budget, actors, directors, community rankings, finale
- Each with cinematic animations and transitions

**🎨 15 Visual Themes**
- Glass Dark (default), Neon Retro, Cinema Classic, Weyland-Yutani
- Pirate, Arcade 8-bit, Matrix, Upside Down, Galaxie lointaine
- Cinema Muet, Sin City, Abysse, VHS 90s, Comic Book, Tableau Noir, Noel
- 40+ toggleable effects per theme (sabres laser, pluie matrix, etc.)
- 23 color palettes with per-theme association

**📊 Year Comparison**
- Inline comparison badges on all slides
- Previous year data overlay on charts
- Toggle on/off from recap or onboarding slide

**👥 Community Section**
- Rankings across users
- Activity comparison charts
- Most viewed films/series by the community

**🔧 Admin Panel**
- Dashboard, services config, user mapping
- Slide management with drag & drop ordering
- Theme & palette selector with effect toggles
- Music manager (YouTube download via yt-dlp)
- SSO configuration

**🔌 7 Integrations**
- Tautulli/Plex, Jellyfin, TMDB, ROMM
- Audiobookshelf, Komga, Booklore

### 🏗️ Architecture

- FastAPI (Python 3.12) + React 18 (Vite)
- PostgreSQL + Redis
- Multi-stage Docker (Node + Python + nginx + supervisor)
- GitLab CI/CD pipeline
- standard-version for semantic versioning

---
