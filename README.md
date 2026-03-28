<div align="center">

<img src="branding/banner-github.png" alt="Wrapparr Banner" width="800"/>

[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org)

**[Quick Start](#-quick-start)** •
**[Features](#-features)** •
**[Screenshots](#-screenshots)** •
**[Configuration](#-configuration)**

</div>

---

## 🚀 What is Wrapparr?

Wrapparr generates a beautiful, interactive **Spotify Wrapped-style recap** for your media server. It collects data from your homelab services and creates a cinematic, slide-by-slide experience showing your year in films, series, books, games, and more.

**Perfect for:**
- 🏠 Homelab owners sharing media with family & friends
- 🎬 Plex/Jellyfin users wanting a year-end recap
- 📊 Media enthusiasts who love data visualization
- 👥 Multi-user setups with community comparisons

> [!WARNING]
> **Vibe Coded Project** - This application was built **100% using AI-assisted development** with [Claude Code](https://claude.ai/code).

---

## ✨ Features

<table>
<tr>
<td width="33%" valign="top">

### 🎬 Multi-Source Integration
**6+ homelab services**
- **Tautulli** - Plex statistics
- **Jellyfin** - Direct integration
- **TMDB** - Metadata enrichment
- **ROMM** - Game library
- **Audiobookshelf** - Audiobooks
- **Komga** - Comics & manga

</td>
<td width="33%" valign="top">

### 🎭 Cinematic Experience
**Spotify Wrapped for media**
- Animated slide transitions
- Podium reveals with effects
- Genre race animations
- Confetti & fireworks finale
- Ambient spotlights & stars
- Background music (YouTube)

</td>
<td width="33%" valign="top">

### 📊 Rich Analytics
**Deep data insights**
- Top films & series rankings
- Genre distribution & trends
- Viewing habits (day/hour)
- Budget analysis
- Actor & director stats
- Cinema profile & timeline

</td>
</tr>
<tr>
<td width="33%" valign="top">

### 📈 Year-over-Year Comparison
**Compare with previous year**
- Inline comparison toggle
- Overlay charts (current vs N-1)
- Diff badges on every metric
- Per-media comparison data
- Community comparison slides

</td>
<td width="33%" valign="top">

### 👥 Multi-User & Community
**Social features**
- Per-user personalized recaps
- Community activity charts
- Top films/series across users
- User rankings & leaderboards
- Genre comparison by user

</td>
<td width="33%" valign="top">

### 🎨 Fully Customizable
**Admin control panel**
- Theme engine (colors, palette)
- Slide ordering & toggling
- Per-slide parameters
- Custom categories & profiles
- Music management (YouTube)
- Confetti/fireworks toggles

</td>
</tr>
</table>

---

## 🖼️ Screenshots

<div align="center">

| Intro | Top Films | Habitudes |
|:---:|:---:|:---:|
| Slide intro avec logo animé | Podium avec effet lumière | Graphiques d'activité |

| Comparaison | Budget | Finale |
|:---:|:---:|:---:|
| Overlay année vs année | Analyse budgets films | Résumé avec mur d'affiches |

</div>

---

## 🏁 Quick Start

### Docker Compose

```yaml
version: "3.8"
services:
  wrapparr:
    image: wrapparr:latest
    ports:
      - "8000:8000"  # Backend API
      - "5173:5173"  # Frontend
    environment:
      - DATABASE_URL=sqlite+aiosqlite:///./wrapparr.db
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=your-secret-key
    volumes:
      - ./data:/app/data
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

### Manual Setup

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuration

### Admin Panel

Access the admin panel at `/admin` after first login:

| Section | Description |
|---------|------------|
| **Dashboard** | Overview of services & recaps |
| **Connectors** | Configure Tautulli, Jellyfin, TMDB, etc. |
| **User Mapping** | Map service users to Wrapparr accounts |
| **Recap Management** | Generate & manage year recaps |
| **Slides & Parameters** | Order, toggle, and configure each slide |
| **Themes** | Color palettes & visual customization |
| **Music** | YouTube music library & section assignment |
| **Configuration** | Global settings (SSO, registration, etc.) |

### Services Supported

| Service | Data Collected |
|---------|---------------|
| **Tautulli** | Films, series, play history, ratings, actors, directors |
| **Jellyfin** | Direct media server integration |
| **TMDB** | Posters, metadata, budgets, countries, credits |
| **ROMM** | Game library statistics |
| **Audiobookshelf** | Audiobook listening stats |
| **Komga** | Comics & manga reading stats |

### Authentication

- Local accounts (username/password)
- SSO via OIDC (Authentik, Keycloak, etc.)
- Secure token exchange (no JWT in URLs)

---

## 🏗️ Architecture

```
wrapparr/
├── backend/          # FastAPI + SQLAlchemy + Redis
│   ├── app/
│   │   ├── api/v1/   # REST endpoints
│   │   ├── collectors/  # Service data collectors
│   │   ├── services/    # Pipeline & processing
│   │   └── models/      # Database models
│   └── requirements.txt
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── recap/      # Slide components
│   │   │   ├── admin/      # Admin panels
│   │   │   └── auth/       # Login/SSO
│   │   └── services/       # API client
│   └── package.json
└── branding/         # Logo, icons, banners
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with [Claude Code](https://claude.ai/code)** 🤖

<img src="branding/icon-512.png" alt="Wrapparr Logo" width="80"/>

</div>
