# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit conventions.

## [0.1.0] - 2026-03-28

### Features

* **Recap System** — 26+ slide types with cinematic animations (intro, podium, stats, genres race, timeline, world map, ratings, budget, actors, directors, community, finale)
* **15 Visual Themes** — Glass Dark, Neon Retro, Cinema Classic, Weyland-Yutani, Pirate, Arcade 8-bit, Matrix, Upside Down, Galaxie lointaine, Cinema Muet, Sin City, Abysse, VHS 90s, Comic Book, Tableau Noir, Noel
* **Dynamic Theme Effects** — Sabres laser, pluie Matrix, grille neon, breche dimensionnelle, spores, vagues, boussole, guirlande Stranger Things, bioluminescence, etoiles filantes, neige, poussiere de craie, onomatopees BD, tracking VHS, halftone
* **Toggleable Effects** — Each effect can be enabled/disabled per theme via admin panel
* **Color Palettes** — 23 palettes with default association per theme, fully customizable
* **Theme Selector** — Users can switch theme from the recap top bar (if allowed by admin)
* **Onboarding Slide** — Interactive settings (comparison toggle, theme select, music toggle, year select)
* **Year Comparison** — Inline CompBadge on all slides showing previous year data with % diff
* **Community Section** — Rankings, activity charts, most viewed, genres comparison across users
* **Music System** — YouTube download via yt-dlp, per-section tracks, admin panel
* **Share & Fullscreen** — html2canvas capture, Web Share API, fullscreen toggle
* **Responsive Design** — Phone, tablet, desktop, large desktop with CSS clamp() and custom properties
* **Admin Panel** — Dashboard, services, user mapping, slides config, themes, music, users, SSO, configuration
* **SSO Authentication** — Ephemeral code exchange via Redis (one-time use, 60s expiry)
* **7 Service Integrations** — Tautulli/Plex, Jellyfin, TMDB, ROMM, Audiobookshelf, Komga, Booklore

### Architecture

* FastAPI backend (Python 3.12) with SQLAlchemy, PostgreSQL, Redis
* React 18 frontend with Vite, Recharts, Zustand
* Multi-stage Docker build (Node + Python + nginx + supervisor)
* GitLab CI/CD pipeline (validate, test, build, release)
* standard-version for semantic versioning
