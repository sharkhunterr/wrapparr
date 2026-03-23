# Tasks: Wrapparr — Application Complète

**Input**: Design documents from `/specs/001-wrapparr-full-app/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/api-v1.md

**Tests**: Non demandés explicitement — non inclus.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, tooling configuration

- [x] T001 Create backend project structure with directories: backend/app/{api/v1,collectors,core,models,schemas,services,worker,websocket}/, backend/tests/{unit,integration}/, backend/alembic/versions/
- [x] T002 Create backend/requirements.txt with all Python dependencies: fastapi, uvicorn, sqlalchemy[asyncio], asyncpg, alembic, redis, apscheduler, python-jose[cryptography], passlib[bcrypt], httpx, pydantic, pydantic-settings, authlib, cryptography
- [x] T003 [P] Create frontend project with Vite: frontend/package.json, frontend/vite.config.js, frontend/index.html with dependencies: react, react-dom, react-router-dom, zustand, recharts
- [x] T004 [P] Create .env.example with all required variables: DATABASE_URL, REDIS_URL, SECRET_KEY, ENCRYPTION_KEY, TMDB_API_KEY, FIRST_ADMIN_EMAIL, FIRST_ADMIN_PASSWORD
- [x] T005 [P] Create backend/app/core/config.py with Pydantic Settings loading all env vars with validation

**Checkpoint**: Project skeleton ready — directories and dependencies in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create backend/app/core/database.py with async SQLAlchemy engine, sessionmaker, and Base declarative class
- [x] T007 [P] Create backend/app/core/security.py with JWT encode/decode (python-jose), password hashing (bcrypt via passlib), role dependency injectors (get_current_user, require_admin)
- [x] T008 [P] Create backend/app/core/encryption.py with AES-256 encrypt/decrypt functions using cryptography hazmat (ENCRYPTION_KEY derived via PBKDF2)
- [x] T009 Create backend/alembic/env.py configured for async SQLAlchemy with auto-migration on startup
- [x] T010 Create backend/app/main.py with FastAPI app, lifespan (DB init, Alembic auto-migrate, Redis connect, create first admin), CORS middleware, API router mounts
- [x] T011 [P] Create frontend/src/main.jsx and frontend/src/App.jsx with React Router v6 skeleton (routes: /, /login, /recap/:year, /settings, /admin)
- [x] T012 [P] Create frontend/src/services/api.js with axios/fetch wrapper, JWT interceptor (attach Bearer token, auto-refresh on 401)

**Checkpoint**: Foundation ready — database, auth helpers, encryption, frontend routing in place

---

## Phase 3: User Story 1 — Squelette Docker fonctionnel (Priority: P1)

**Goal**: `docker compose up` lance 5 services healthy en < 60s

**Independent Test**: Exécuter `docker compose up` sur machine vierge, vérifier healthchecks

### Implementation for User Story 1

- [x] T013 [US1] Create backend/Dockerfile (Python 3.12-slim, pip install requirements.txt, uvicorn entrypoint port 8000)
- [x] T014 [P] [US1] Create frontend/Dockerfile (node:20 build stage + nginx:alpine serve stage)
- [x] T015 [P] [US1] Create nginx.conf (serve frontend static, proxy /api/* to wrapparr-api:8000, proxy /ws/* WebSocket upgrade)
- [x] T016 [US1] Create docker-compose.yml with 5 services: wrapparr-api (build backend, port 8000, healthcheck /docs), wrapparr-frontend (build frontend, port 80, depends_on api), wrapparr-worker (same image as api, entrypoint python -m app.worker.scheduler), postgres (postgres:16, volume, healthcheck pg_isready), redis (redis:7, healthcheck redis-cli ping)
- [x] T017 [US1] Add Traefik labels to docker-compose.yml for wrapparr-frontend service
- [x] T018 [US1] Validate: run docker compose config, verify no errors, document env var validation on missing vars

**Checkpoint**: US1 complete — `docker compose up` starts 5 healthy services

---

## Phase 4: User Story 2 — Authentification et gestion des rôles (Priority: P1)

**Goal**: Login/register/refresh/SSO fonctionnels avec 3 rôles

**Independent Test**: Créer un compte, se connecter, vérifier JWT, accéder à route protégée, tester refresh

### Implementation for User Story 2

- [x] T019 [P] [US2] Create backend/app/models/user.py with User model (id UUID, email, hashed_password, display_name, role enum admin/user/viewer, oidc_provider_id FK, oidc_sub, allow_comparison, theme_pack_id FK, is_active, created_at, updated_at)
- [x] T020 [P] [US2] Create backend/app/models/auth.py with RefreshToken model (id, user_id FK, token_hash, expires_at, revoked, created_at) and OIDCProvider model (id, name, issuer_url, client_id, client_secret encrypted, scopes, is_active)
- [x] T021 [P] [US2] Create backend/app/schemas/auth.py with Pydantic v2 schemas: RegisterRequest, LoginRequest, TokenResponse, UserResponse, RefreshResponse
- [x] T022 [US2] Create backend/app/services/auth_service.py with register_user, authenticate_user, create_tokens, refresh_access_token, revoke_refresh_token, get_or_create_oidc_user
- [x] T023 [US2] Create backend/app/api/v1/auth.py with endpoints: POST /auth/register, POST /auth/login (set httpOnly cookie), POST /auth/refresh, POST /auth/logout, GET /auth/me, GET /auth/sso/{provider}/authorize, GET /auth/sso/{provider}/callback
- [x] T024 [US2] Generate Alembic migration for User, RefreshToken, OIDCProvider tables
- [x] T025 [US2] Add first admin creation logic in backend/app/main.py lifespan (FIRST_ADMIN_EMAIL + FIRST_ADMIN_PASSWORD from env)
- [x] T026 [P] [US2] Create frontend/src/stores/authStore.js with Zustand: user state, login/logout/register actions, token storage
- [x] T027 [P] [US2] Create frontend/src/hooks/useAuth.js with auth state, auto-refresh logic, redirect on 401
- [x] T028 [US2] Create frontend/src/components/auth/LoginPage.jsx with email+password form, SSO buttons, register link (textes en français)

**Checkpoint**: US2 complete — auth flow fully functional

---

## Phase 5: User Story 3 — Connexion et collecte des données (Priority: P2)

**Goal**: Configurer des connecteurs, tester la connexion, collecter des données

**Independent Test**: Configurer Tautulli, tester connexion, déclencher collecte, vérifier données stockées

### Implementation for User Story 3

- [x] T029 [P] [US3] Create backend/app/models/service.py with ServiceConnector model (id, user_id FK, service_type enum, display_name, base_url, api_key_enc, is_active, last_test_at, last_test_ok, unique constraint user_id+service_type)
- [x] T030 [P] [US3] Create backend/app/schemas/service.py with Pydantic v2: ServiceCreate, ServiceUpdate, ServiceResponse, TestConnectionResponse
- [x] T031 [US3] Create backend/app/collectors/base.py with abstract BaseCollector class: __init__(base_url, api_key), async test_connection() → bool, async collect(year) → NormalizedData, normalize(raw) → NormalizedData
- [x] T032 [P] [US3] Create backend/app/collectors/tautulli.py implementing BaseCollector: fetch films (total, hours, top, genres, dayOfWeek, timeOfDay, monthly), fetch series (episodes, hours, top, genres, dayOfWeek, timeOfDay, monthly), fetch ranking
- [x] T033 [P] [US3] Create backend/app/collectors/jellyfin.py implementing BaseCollector with native Jellyfin API (same metrics as Tautulli)
- [x] T034 [P] [US3] Create backend/app/collectors/romm.py implementing BaseCollector: fetch games (hours, top, consoles, genres, decades, monthly, ranking)
- [x] T035 [P] [US3] Create backend/app/collectors/audiobookshelf.py implementing BaseCollector: fetch audiobooks (hours, top, genres, timeOfDay, dayOfWeek, monthly, ranking)
- [x] T036 [P] [US3] Create backend/app/collectors/komga.py implementing BaseCollector: fetch manga (volumes, top, genres, dayOfWeek, monthly, ranking)
- [x] T037 [P] [US3] Create backend/app/collectors/booklore.py implementing BaseCollector: fetch books (total, authors, genres)
- [x] T038 [US3] Create backend/app/api/v1/services.py with endpoints: GET /services, POST /services (encrypt api_key before store), PUT /services/{id}, DELETE /services/{id}, POST /services/{id}/test
- [x] T039 [US3] Generate Alembic migration for ServiceConnector table
- [x] T040 [US3] Create backend/app/worker/scheduler.py with APScheduler: annual collection job (default Jan 1 02:00), per-user collection trigger, collector factory by service_type

**Checkpoint**: US3 complete — connectors configurable, test connection works, data collection runs

---

## Phase 6: User Story 4 — Génération et affichage du récapitulatif (Priority: P2)

**Goal**: Pipeline complet collecte→snapshot + slides animées dans le navigateur

**Independent Test**: Déclencher manuellement, vérifier snapshot JSON, slides s'affichent

### Backend — Pipeline & API

- [x] T041 [P] [US4] Create backend/app/models/recap.py with YearlyRecap model (id, user_id FK, year, status enum pending/collecting/processing/fetching_posters/completed/failed, progress 0-100, progress_msg, data JSONB, error_message, started_at, completed_at, unique constraint user_id+year) and HistorySnapshot model (id, recap_id FK unique, user_id FK, year, recap_data JSONB, slide_config JSONB, theme_pack JSONB, created_at)
- [x] T042 [P] [US4] Create backend/app/schemas/recap.py with Pydantic v2: RecapListItem, RecapDetail, GenerateRequest, ProgressResponse, CompareResponse
- [x] T043 [US4] Create backend/app/services/pipeline.py with RecapPipeline class: run(user_id, year) orchestrating steps: set status collecting → call each active collector → set processing → normalize + compute stats → set fetching_posters → proxy TMDB/OpenLibrary → set completed → create HistorySnapshot. Broadcast progress via WebSocket at each step.
- [x] T044 [US4] Create backend/app/services/recap_service.py with get_recaps(user_id), get_recap(user_id, year), trigger_generate(user_id, year), get_progress(recap_id)
- [x] T045 [US4] Create backend/app/api/v1/recaps.py with endpoints: GET /recaps, GET /recaps/{year}, POST /recaps/generate (return 202, enqueue pipeline), GET /recaps/{year}/progress
- [x] T046 [US4] Create backend/app/api/v1/media.py with GET /media/poster proxy endpoint (query: type=tmdb|openlibrary, id, size) with Redis cache TTL 7 days
- [x] T047 [US4] Create backend/app/websocket/handlers.py with WebSocket /ws/recap-progress (auth via token query param, broadcast progress updates per user)
- [x] T048 [US4] Generate Alembic migration for YearlyRecap and HistorySnapshot tables

### Frontend — Slides & affichage

- [x] T049 [P] [US4] Create frontend/src/stores/recapStore.js with Zustand: recapData, currentSlideIndex, loading, fetchRecap(year) action
- [x] T050 [P] [US4] Create frontend/src/hooks/useRecap.js fetching recap data from API, replacing mock const D
- [x] T051 [P] [US4] Create frontend/src/hooks/useWebSocket.js for real-time progress updates during generation
- [x] T052 [US4] Extract ambient components from prototype into frontend/src/components/ambient/: Orbs.jsx, Stars.jsx, Grain.jsx, Spotlights.jsx, Confetti.jsx, Fireworks.jsx (preserve exact visual behavior)
- [x] T053 [US4] Extract shared UI components from prototype into frontend/src/components/ui/: PokeCard.jsx, PosterImg.jsx (use /media/poster proxy), BigNum.jsx, MiniRank.jsx, Charts.jsx (AreaG, DayChart, TimeChart, CTip)
- [x] T054 [US4] Extract slide components from prototype into frontend/src/components/slides/: IntroSlide.jsx, OverviewSlide.jsx, CategorySlide.jsx (from SlideCat), PodiumSlide.jsx (from PodiumPlatform + jokes logic), StatsSlide.jsx, DeepSlide.jsx, CompareSlide.jsx, RankingSlide.jsx, FinaleSlide.jsx
- [x] T055 [US4] Create frontend/src/components/slides/SlideRenderer.jsx orchestrating slide sequence: load SLIDES_DEF from recapStore, render active slides in order, handle swipe/scroll navigation, skip slides for unconnected services
- [x] T056 [US4] Create recap page in frontend/src/App.jsx route /recap/:year rendering SlideRenderer with data from useRecap hook
- [x] T057 [US4] Add auth guard to frontend/src/App.jsx: redirect to /login if not authenticated, allow /share/* without auth

**Checkpoint**: US4 complete — recap generated and displayed with animated slides

---

## Phase 7: User Story 5 — Configuration des slides et podiums (Priority: P3)

**Goal**: Activation/désactivation slides, drag-and-drop ordre, phrases custom podiums

**Independent Test**: Désactiver slide, réordonner, ajouter phrase custom, vérifier recap

### Implementation for User Story 5

- [x] T058 [P] [US5] Create backend/app/models/slide.py with SlideConfig model (id, user_id FK, slide_id, enabled, sort_order, unique user_id+slide_id)
- [x] T059 [P] [US5] Create backend/app/models/phrase.py with CustomPhrase model (id, user_id FK, category, text, sort_order, mode enum mix/replace)
- [x] T060 [P] [US5] Create backend/app/schemas/slide.py with Pydantic v2: SlideConfigItem, SlideConfigUpdate
- [x] T061 [P] [US5] Create backend/app/schemas/phrase.py with Pydantic v2: PhraseCreate, PhraseUpdate, PhraseResponse, DefaultPhrasesResponse
- [x] T062 [US5] Create backend/app/api/v1/slides.py with endpoints: GET /slides/config, PUT /slides/config (validate intro always first, finale always last)
- [x] T063 [US5] Create backend/app/api/v1/phrases.py with endpoints: GET /phrases, POST /phrases, PUT /phrases/{id}, DELETE /phrases/{id}, GET /phrases/defaults (return JOKES constants from prototype)
- [x] T064 [US5] Generate Alembic migration for SlideConfig and CustomPhrase tables
- [x] T065 [US5] Create frontend/src/components/settings/SlideConfig.jsx with drag-and-drop list (intro locked first, finale locked last), toggle enabled per slide
- [x] T066 [US5] Create frontend/src/components/settings/PhraseEditor.jsx with CRUD interface per category, mode toggle (mélange/remplacement), variable insertion helper ({user}, {count}, {hours}, {year}, {top1})
- [x] T067 [US5] Update frontend/src/components/slides/PodiumSlide.jsx to load custom phrases from API (merge or replace with defaults based on mode)
- [x] T068 [US5] Update frontend/src/components/slides/SlideRenderer.jsx to respect SlideConfig (enabled + sort_order) from API

**Checkpoint**: US5 complete — slides configurable, custom phrases in podiums

---

## Phase 8: User Story 6 — Thèmes visuels (Priority: P3)

**Goal**: 5 theme packs, color picker, preview temps réel, ThemeProvider

**Independent Test**: Sélectionner neon-arcade, modifier couleur, preview, vérifier recap

### Implementation for User Story 6

- [x] T069 [P] [US6] Create backend/app/models/theme.py with ThemePack model (id, name, slug unique, is_builtin, config JSONB)
- [x] T070 [P] [US6] Create backend/app/schemas/theme.py with Pydantic v2: ThemePackResponse, ThemePackCreate, ThemePackUpdate, UserThemeUpdate
- [x] T071 [US6] Create backend/app/api/v1/themes.py with endpoints: GET /themes, GET /themes/{slug}, PUT /users/me/theme (check allow_user_themes), POST /admin/themes, PUT /admin/themes/{id}, DELETE /admin/themes/{id} (block builtin)
- [x] T072 [US6] Create seed data for 5 builtin theme packs in backend/app/main.py lifespan: cinematic (from prototype accents/bg), neon-arcade, editorial, galaxy, ember
- [x] T073 [US6] Generate Alembic migration for ThemePack table
- [x] T074 [P] [US6] Create frontend/src/theme/packs/cinematic.json (extract palette from prototype SLIDES_DEF), neon-arcade.json, editorial.json, galaxy.json, ember.json
- [x] T075 [US6] Create frontend/src/theme/ThemeProvider.jsx: load active theme from API, inject CSS variables (--accent-films, --bg-films, etc.), provide theme context to all slides
- [x] T076 [US6] Create frontend/src/stores/themeStore.js with Zustand: activePack, overrides, fetchTheme, updateOverride actions
- [x] T077 [US6] Create frontend/src/components/settings/ThemeSelector.jsx with theme pack grid, color picker for primary colors, live preview iframe rendering a sample slide
- [x] T078 [US6] Update all slide components in frontend/src/components/slides/ to read accent/bg from ThemeProvider context instead of hardcoded SLIDES_DEF values

**Checkpoint**: US6 complete — themes selectable, colors customizable, preview works

---

## Phase 9: User Story 9 — Administration (Priority: P3)

**Goal**: Dashboard admin, gestion users, config globale, theme packs, logs temps réel

**Independent Test**: Login admin, dashboard, créer user, modifier config, voir logs

### Implementation for User Story 9

- [x] T079 [P] [US9] Create backend/app/models/share.py with GlobalConfig model (key PK, value JSONB, updated_at) — shared entity needed by admin config
- [x] T080 [US9] Seed default GlobalConfig entries in backend/app/main.py lifespan: allow_registration=true, allow_user_themes=true, allow_user_comparison=true, recap_schedule="0 2 1 1 *", max_history_years=5, public_share_expiry_days=30
- [x] T081 [US9] Create backend/app/api/v1/admin.py with endpoints: GET /admin/dashboard (user_count, active_services, running_jobs, recent_logs), GET /admin/users, POST /admin/users, PATCH /admin/users/{id}, GET /admin/config, PATCH /admin/config
- [x] T082 [US9] Add WebSocket /ws/admin-logs in backend/app/websocket/handlers.py (admin-only auth, stream structured log entries in real time)
- [x] T083 [US9] Generate Alembic migration for GlobalConfig table
- [x] T084 [P] [US9] Create frontend/src/components/admin/Dashboard.jsx with metric cards: user count, connected services, active jobs, recent logs feed
- [x] T085 [P] [US9] Create frontend/src/components/admin/UserManagement.jsx with user table (list, create, toggle active, reset password, change role)
- [x] T086 [P] [US9] Create frontend/src/components/admin/ConfigPanel.jsx with form for all GlobalConfig keys, instant save via PATCH /admin/config
- [x] T087 [US9] Create frontend/src/components/admin/ThemeManager.jsx with theme pack CRUD (list builtin + custom, create custom via JSON upload, edit, delete non-builtin)
- [x] T088 [US9] Add /admin routes in frontend/src/App.jsx with admin role guard, sidebar navigation (Dashboard, Users, Config, Themes, Logs)

**Checkpoint**: US9 complete — admin dashboard fully functional

---

## Phase 10: User Story 7 — Historique, replay et comparaisons (Priority: P4)

**Goal**: Page /recap/{year} avec replay fidèle, comparaison multi-années

**Independent Test**: Générer 2 recaps, replay via /recap/{year}, consulter comparaison N vs N-1

### Implementation for User Story 7

- [x] T089 [US7] Add GET /recaps/compare endpoint in backend/app/api/v1/recaps.py (query years=2024,2023, return monthly data per year for overlay charts)
- [x] T090 [US7] Update frontend/src/hooks/useRecap.js to support loading HistorySnapshot data (theme + slide config from snapshot, not current)
- [x] T091 [US7] Update frontend/src/components/slides/SlideRenderer.jsx to accept snapshot theme and slide config overrides for replay mode
- [x] T092 [US7] Create frontend/src/components/slides/CompareSlide.jsx with multi-year overlay charts (AreaChart with multiple Area series, one per year)
- [x] T093 [US7] Add recap history list page in frontend/src/App.jsx route /recaps showing all available years with links to /recap/{year}

**Checkpoint**: US7 complete — replay faithful, comparison charts working

---

## Phase 11: User Story 8 — Partage public (Priority: P4)

**Goal**: Lien public token opaque, accès sans auth, données filtrées

**Independent Test**: Générer lien, ouvrir en privé, vérifier affichage sans auth

### Implementation for User Story 8

- [x] T094 [P] [US8] Create backend/app/models/share.py — add ShareLink model (id, user_id FK, recap_id FK, token unique, expires_at) to existing file
- [x] T095 [P] [US8] Create backend/app/schemas/share.py with Pydantic v2: ShareCreate, ShareResponse, SharedRecapResponse
- [x] T096 [US8] Create backend/app/services/share_service.py with create_share_link(user_id, recap_id) generating secrets.token_urlsafe(32), revoke_link(token), get_shared_recap(token) filtering out ranking data and personal info
- [x] T097 [US8] Create backend/app/api/v1/share.py with endpoints: POST /share (auth required), DELETE /share/{token} (auth required), GET /share/{token} (no auth, return filtered recap data, 410 if expired)
- [x] T098 [US8] Generate Alembic migration for ShareLink table
- [x] T099 [US8] Create frontend/src/components/ShareView.jsx rendering recap slides in read-only mode (no ranking slide, no personal data), loaded via /share/{token} route
- [x] T100 [US8] Add /share/:token route in frontend/src/App.jsx (no auth guard, load data from GET /share/{token})

**Checkpoint**: US8 complete — public links work, data properly filtered

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T101 [P] Add comprehensive error handling middleware in backend/app/main.py (catch all exceptions, return structured JSON errors with appropriate HTTP codes)
- [x] T102 [P] Add request validation error handler for Pydantic ValidationError → 422 with field-level details
- [x] T103 [P] Add rate limiting on auth endpoints (login, register) via Redis-based counter in backend/app/api/v1/auth.py
- [x] T104 Add concurrent collection guard in backend/app/services/pipeline.py (check YearlyRecap.status != collecting/processing before starting, return 409 if already running)
- [x] T105 [P] Add service unavailability handling in backend/app/collectors/base.py (3 retries with exponential backoff, then skip service and continue with partial data)
- [x] T106 Add soft-delete cascade for User in backend/app/services/auth_service.py (set is_active=false, preserve historical recaps and snapshots)
- [x] T107 [P] Add frontend loading/error/empty states in all pages: loading spinner during API calls, error boundary with retry button, empty state messages (textes en français)
- [x] T108 Run quickstart.md validation: verify complete flow from docker compose up through first recap generation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup
- **US1 Docker (Phase 3)**: Depends on Setup + Foundational
- **US2 Auth (Phase 4)**: Depends on Foundational
- **US3 Collectors (Phase 5)**: Depends on US2 (auth required for API)
- **US4 Recap (Phase 6)**: Depends on US3 (collectors required for pipeline)
- **US5 Slides Config (Phase 7)**: Depends on US4 (slides must exist first)
- **US6 Themes (Phase 8)**: Depends on US4 (slides must render themes)
- **US9 Admin (Phase 9)**: Depends on US2 + US6 (auth + theme management)
- **US7 History (Phase 10)**: Depends on US4 (needs existing recaps)
- **US8 Share (Phase 11)**: Depends on US4 (needs existing recaps)
- **Polish (Phase 12)**: Depends on all user stories

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no story dependencies
- **US2 (P1)**: Can start after Foundational — no story dependencies
- **US3 (P2)**: Depends on US2 (auth endpoints)
- **US4 (P2)**: Depends on US3 (collectors for pipeline)
- **US5 (P3)**: Depends on US4 (slides rendering)
- **US6 (P3)**: Depends on US4 (slides rendering)
- **US9 (P3)**: Depends on US2 + US6 (admin needs auth + themes)
- **US7 (P4)**: Depends on US4 (replay needs recap data)
- **US8 (P4)**: Depends on US4 (share needs recap data)

### Parallel Opportunities

- **Phase 1**: T003, T004, T005 can run in parallel
- **Phase 2**: T007, T008, T011, T012 can run in parallel
- **Phase 3**: T014, T015 can run in parallel
- **Phase 4**: T019, T020, T021, T026, T027 can run in parallel
- **Phase 5**: T029, T030, T032-T037 can run in parallel (all collectors)
- **Phase 6**: T041, T042, T049, T050, T051 can run in parallel
- **Phase 7**: T058, T059, T060, T061 can run in parallel
- **Phase 8**: T069, T070, T074 can run in parallel
- **Phase 9**: T084, T085, T086 can run in parallel
- **US5 and US6 can run in parallel** (both depend on US4, independent of each other)
- **US7 and US8 can run in parallel** (both depend on US4, independent of each other)

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 Docker skeleton
4. Complete Phase 4: US2 Auth
5. **STOP and VALIDATE**: Docker running, auth working
6. Deploy and verify

### Core Feature (Add US3 + US4)

7. Complete Phase 5: US3 Collectors
8. Complete Phase 6: US4 Recap generation + frontend
9. **STOP and VALIDATE**: Full recap flow working end-to-end
10. This is the true functional MVP

### Enrichment (US5 + US6 + US9 in parallel)

11. Complete Phase 7: US5 Slide config (can parallel with US6)
12. Complete Phase 8: US6 Themes (can parallel with US5)
13. Complete Phase 9: US9 Admin
14. **STOP and VALIDATE**: Customization and admin features

### Final (US7 + US8 in parallel)

15. Complete Phase 10: US7 History & replay (can parallel with US8)
16. Complete Phase 11: US8 Public sharing (can parallel with US7)
17. Complete Phase 12: Polish
18. **FINAL VALIDATION**: Run quickstart.md end-to-end

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Commit after each task or logical group (with user validation per constitution)
- All code in English, all UI text in French (per constitution)
- No AI attribution in any file (per constitution)
