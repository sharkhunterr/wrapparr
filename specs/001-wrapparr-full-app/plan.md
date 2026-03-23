# Implementation Plan: Wrapparr — Application Complète

**Branch**: `001-wrapparr-full-app` | **Date**: 2026-03-22 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-wrapparr-full-app/spec.md`

## Summary

Application web self-hosted générant des récapitulatifs annuels
visuels et animés (style Spotify Wrapped) pour homelab.
Backend FastAPI async + frontend React 18 intégrant le prototype
validé. Architecture Docker 5 services avec PostgreSQL et Redis.

## Technical Context

**Language/Version**: Python 3.12+ (backend), JavaScript ES2022 (frontend)
**Primary Dependencies**: FastAPI, SQLAlchemy 2.x async, React 18, Vite, Zustand, Recharts
**Storage**: PostgreSQL 16 (async via asyncpg), Redis 7 (cache + sessions)
**Testing**: pytest + httpx (backend), Vitest (frontend)
**Target Platform**: Docker Compose, Linux server, navigateurs desktop modernes
**Project Type**: web-service (fullstack)
**Performance Goals**: Génération recap < 5 min pour 3 services, slides 60fps
**Constraints**: Self-hosted, pas de dépendance cloud, clés API chiffrées AES-256
**Scale/Scope**: 1-50 utilisateurs (homelab), 6 services externes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle                      | Status | Notes                                    |
|--------------------------------|--------|------------------------------------------|
| I. Commits — Validation        | ✅     | Aucun commit sans ok utilisateur          |
| II. Attribution — Aucune IA    | ✅     | Pas de mention IA dans le code            |
| III. Langue — Bilingue         | ✅     | Code EN, UI FR, commits FR               |
| IV. Sécurité                   | ✅     | Env vars, Pydantic v2, AES-256           |
| V. Validation préalable        | ✅     | Plan montré avant implémentation         |

Aucune violation. Toutes les gates passent.

## Project Structure

### Documentation (this feature)

```text
specs/001-wrapparr-full-app/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart
├── contracts/
│   └── api-v1.md        # Phase 1 API contracts
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
backend/
├── alembic/
│   ├── versions/
│   └── env.py
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── auth.py
│   │       ├── services.py
│   │       ├── recaps.py
│   │       ├── slides.py
│   │       ├── phrases.py
│   │       ├── themes.py
│   │       ├── share.py
│   │       ├── admin.py
│   │       └── media.py
│   ├── collectors/
│   │   ├── base.py
│   │   ├── tautulli.py
│   │   ├── jellyfin.py
│   │   ├── romm.py
│   │   ├── audiobookshelf.py
│   │   ├── komga.py
│   │   └── booklore.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   ├── encryption.py
│   │   └── database.py
│   ├── models/
│   │   ├── user.py
│   │   ├── auth.py
│   │   ├── service.py
│   │   ├── recap.py
│   │   ├── slide.py
│   │   ├── theme.py
│   │   ├── phrase.py
│   │   └── share.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── service.py
│   │   ├── recap.py
│   │   ├── slide.py
│   │   ├── theme.py
│   │   ├── phrase.py
│   │   └── share.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── recap_service.py
│   │   ├── pipeline.py
│   │   └── share_service.py
│   ├── worker/
│   │   └── scheduler.py
│   ├── websocket/
│   │   └── handlers.py
│   └── main.py
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
├── Dockerfile
└── requirements.txt

frontend/
├── src/
│   ├── components/
│   │   ├── slides/
│   │   │   ├── IntroSlide.jsx
│   │   │   ├── OverviewSlide.jsx
│   │   │   ├── CategorySlide.jsx
│   │   │   ├── PodiumSlide.jsx
│   │   │   ├── StatsSlide.jsx
│   │   │   ├── DeepSlide.jsx
│   │   │   ├── CompareSlide.jsx
│   │   │   ├── RankingSlide.jsx
│   │   │   └── FinaleSlide.jsx
│   │   ├── ambient/
│   │   │   ├── Orbs.jsx
│   │   │   ├── Stars.jsx
│   │   │   ├── Grain.jsx
│   │   │   ├── Spotlights.jsx
│   │   │   ├── Confetti.jsx
│   │   │   └── Fireworks.jsx
│   │   ├── ui/
│   │   │   ├── PokeCard.jsx
│   │   │   ├── PosterImg.jsx
│   │   │   ├── BigNum.jsx
│   │   │   ├── MiniRank.jsx
│   │   │   └── Charts.jsx
│   │   ├── auth/
│   │   │   └── LoginPage.jsx
│   │   ├── admin/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── ConfigPanel.jsx
│   │   │   └── ThemeManager.jsx
│   │   └── settings/
│   │       ├── SlideConfig.jsx
│   │       ├── PhraseEditor.jsx
│   │       └── ThemeSelector.jsx
│   ├── hooks/
│   │   ├── useRecap.js
│   │   ├── useAuth.js
│   │   └── useWebSocket.js
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── recapStore.js
│   │   └── themeStore.js
│   ├── services/
│   │   └── api.js
│   ├── theme/
│   │   ├── ThemeProvider.jsx
│   │   └── packs/
│   │       ├── cinematic.json
│   │       ├── neon-arcade.json
│   │       ├── editorial.json
│   │       ├── galaxy.json
│   │       └── ember.json
│   ├── App.jsx
│   └── main.jsx
├── public/
├── index.html
├── vite.config.js
├── package.json
└── Dockerfile

docker-compose.yml
nginx.conf
.env.example
```

**Structure Decision**: Web application avec séparation
backend/frontend. Le worker partage l'image Docker du backend
avec un entrypoint différent.

## Complexity Tracking

Aucune violation de constitution à justifier.

## Phases d'implémentation

### Phase 1 — Squelette Docker (US1, P1)

Créer l'infrastructure Docker complète avec les 5 services.
Fichiers : `docker-compose.yml`, `backend/Dockerfile`,
`frontend/Dockerfile`, `nginx.conf`, `.env.example`,
`backend/app/main.py` (hello world), `frontend/` (build Vite
minimal).

**Complexité** : Simple
**Dépendances** : Aucune
**Validation** : `docker compose up` → 5 services healthy

### Phase 2 — Backend Auth (US2, P1)

Modèles User, RefreshToken, OIDCProvider. Schémas Pydantic v2.
Helpers sécurité (bcrypt, JWT, AES-256). Endpoints auth.
Migrations Alembic auto-appliquées au démarrage.

**Complexité** : Complexe
**Dépendances** : Phase 1
**Validation** : Login/register/refresh/SSO fonctionnels

### Phase 3 — Connecteurs & collecte (US3, P2)

Base class `BaseCollector`. 6 collecteurs (Tautulli, Jellyfin,
ROMM, Audiobookshelf, Komga, Booklore). Endpoints CRUD services
+ test connexion. Job APScheduler.

**Complexité** : Complexe
**Dépendances** : Phase 2
**Validation** : Test connexion OK, collecte de données réussie

### Phase 4 — Génération du recap (US4, P2)

Pipeline complet : collecte → normalisation → calcul stats →
proxy TMDB/OpenLibrary → snapshot JSON. WebSocket progression.
Modèles YearlyRecap, HistorySnapshot.

**Complexité** : Complexe
**Dépendances** : Phase 3
**Validation** : Recap généré avec snapshot JSON valide

### Phase 5 — Frontend connecté (US4, P2)

Découpage du prototype `Wrapparr.jsx` en composants. Store
Zustand. Hook `useRecap`. Remplacement des données mock par
l'API. Page login. Guard de route.

**Complexité** : Complexe
**Dépendances** : Phase 2 + Phase 4
**Validation** : Slides affichées avec données réelles

### Phase 6 — Config slides & phrases (US5, P3)

Modèles SlideConfig, CustomPhrase. CRUD API. UI drag-and-drop
pour l'ordre des slides. Éditeur de phrases custom. Mode
mélange/remplacement.

**Complexité** : Moyen
**Dépendances** : Phase 5
**Validation** : Slides réordonnées, phrases custom dans podiums

### Phase 7 — Thèmes visuels (US6, P3)

Modèle ThemePack. 5 packs builtin. ThemeProvider React avec CSS
variables. Color picker + preview temps réel. Config admin.

**Complexité** : Moyen
**Dépendances** : Phase 5
**Validation** : Changement de thème reflété dans le recap

### Phase 8 — Admin (US9, P3)

Dashboard métriques. Gestion users CRUD. Config globale.
Gestion theme packs. Logs temps réel via WebSocket.

**Complexité** : Moyen
**Dépendances** : Phase 2 + Phase 7
**Validation** : Dashboard fonctionnel, config modifiable

### Phase 9 — Historique & replay (US7, P4)

Page `/recap/{year}`. Replay avec snapshot immuable (thème +
slides de l'époque). Comparaison multi-années avec graphiques
superposés.

**Complexité** : Moyen
**Dépendances** : Phase 4 + Phase 5
**Validation** : Replay fidèle, graphiques comparatifs

### Phase 10 — Partage public (US8, P4)

Token opaque, route `/share/{token}` sans auth. Données
filtrées. Expiration configurable. Révocation.

**Complexité** : Simple
**Dépendances** : Phase 4
**Validation** : Lien accessible sans auth, données filtrées

## Décisions techniques à valider

1. **WebSocket vs SSE** pour la progression de génération :
   WebSocket choisi (bidirectionnel, plus adapté aux logs admin
   temps réel aussi). Confirmer ?

2. **Proxy affiches** : Le backend cache les affiches TMDB dans
   Redis (TTL 7j). Les affiches ne sont pas stockées sur disque.
   Confirmer ?

3. **Worker séparé** : Même image Docker que l'API avec un
   entrypoint `python -m app.worker.scheduler`. Partage le code
   et les modèles. Confirmer ?
