# Research: Wrapparr — Application Complète

**Branch**: `001-wrapparr-full-app` | **Date**: 2026-03-22

## R1 — Authentification JWT + OIDC avec FastAPI

**Decision**: python-jose pour JWT, authlib pour OIDC, bcrypt via
passlib.

**Rationale**: python-jose est imposé par la constitution. authlib
est le client OIDC le plus mature en Python async, supporte
nativement les providers Authentik, Keycloak, Authelia. passlib
fournit bcrypt avec une API stable.

**Alternatives considered**:
- PyJWT : plus simple mais pas dans la constitution
- python-social-auth : trop lourd pour du OIDC pur

## R2 — Chiffrement AES-256 des clés API

**Decision**: cryptography (Fernet) pour le chiffrement symétrique
des clés API en base.

**Rationale**: Fernet utilise AES-128-CBC par défaut, mais on
utilisera AES-256 via le module hazmat de cryptography avec une
clé dérivée de ENCRYPTION_KEY (PBKDF2). C'est la lib de
référence Python pour la crypto.

**Alternatives considered**:
- PyCryptodome : API moins ergonomique
- Fernet natif : limité à AES-128

## R3 — Collecteurs de données — Patterns d'intégration

**Decision**: Base class abstraite `BaseCollector` avec interface
commune `test_connection()`, `collect(year)`, `normalize()`.
Client httpx async pour tous les appels.

**Rationale**: httpx est imposé par la constitution. Le pattern
collecteur abstrait permet d'ajouter des services sans modifier
le pipeline. Chaque collecteur retourne un format normalisé
commun.

**Alternatives considered**:
- Adaptateurs par service sans classe de base : plus de
  duplication
- Appels synchrones requests : incompatible avec FastAPI async

## R4 — Pipeline de génération de recap

**Decision**: Pipeline séquentiel orchestré par APScheduler,
avec statut persisté en base et progression WebSocket.

**Rationale**: APScheduler est imposé par la constitution. Le
pipeline est naturellement séquentiel (collecte → normalisation →
calcul → affiches → snapshot). La progression est envoyée via
WebSocket pour le temps réel côté frontend.

**Alternatives considered**:
- Celery : trop lourd pour du self-hosted mono-worker
- Simple polling HTTP : moins réactif que WebSocket

## R5 — Frontend : intégration du prototype

**Decision**: Le prototype `Wrapparr.jsx` sera découpé en
composants React individuels dans `src/components/slides/`.
Le store Zustand remplacera les constantes `D` et `ME`. React
Router v6 gère les routes.

**Rationale**: Le prototype est un fichier monolithique (~1000
lignes). Le découpage en composants permet la maintenance et
l'activation/désactivation par slide. Les données mock (`const D`)
seront remplacées par les appels API via un hook `useRecap`.

**Alternatives considered**:
- Garder le monolithe : ingérable à terme
- Next.js SSR : hors constitution (Vite imposé)

## R6 — Theme packs — Structure et stockage

**Decision**: Chaque theme pack est un objet JSON stocké en base
avec la structure : `{ palette, card_style, transition, particles,
orbs, grain, spotlights, finale_effect, fonts }`. Les CSS
variables sont injectées via un ThemeProvider React.

**Rationale**: Conforme à la spec. Le prototype utilise déjà des
constantes de couleur par slide (`accent`, `bg`). Le
ThemeProvider injecte les CSS variables à partir du pack actif.

**Alternatives considered**:
- Fichiers CSS par thème : moins flexible pour le color picker
- Tailwind themes : hors constitution (CSS-in-JS imposé)

## R7 — Historique et snapshots immuables

**Decision**: Chaque recap généré produit un `HistorySnapshot`
contenant le JSON complet des données + la config slides + le
theme pack utilisé. Stocké en base PostgreSQL (JSONB).

**Rationale**: PostgreSQL JSONB permet des requêtes sur le
contenu sans désérialisation. L'immuabilité est garantie par
l'absence d'endpoint de modification sur les snapshots.

**Alternatives considered**:
- Stockage fichier JSON sur disque : plus dur à requêter
- Versioning soft en base : complexité inutile

## R8 — Partage public — Tokens opaques

**Decision**: Token opaque généré via `secrets.token_urlsafe(32)`,
stocké en base avec date d'expiration. Route `/share/{token}`
sans authentification, données filtrées (pas de classement
inter-users, données personnelles minimales).

**Rationale**: Simple, sécurisé, pas besoin de JWT pour un lien
public. L'expiration est configurable par l'admin
(`public_share_expiry_days`).

**Alternatives considered**:
- JWT signé dans l'URL : plus complexe, risque de leak
- Short URL externe : dépendance inutile

## R9 — Architecture Docker

**Decision**: 5 services Docker Compose conformes à la
constitution :
- `wrapparr-api` : FastAPI (uvicorn, port 8000)
- `wrapparr-frontend` : Nginx servant le build React (port 80)
- `wrapparr-worker` : APScheduler (même image que api, entrypoint
  différent)
- `postgres` : PostgreSQL 16
- `redis` : Redis 7

**Rationale**: Architecture imposée par la constitution. Le
worker partage l'image backend pour éviter la duplication.
Nginx sert les fichiers statiques et proxy les appels API.

**Alternatives considered**: Aucune — architecture imposée.

## R10 — Proxy TMDB et OpenLibrary

**Decision**: Le backend expose un endpoint proxy
`/api/v1/media/poster` qui récupère les affiches depuis TMDB
ou OpenLibrary côté serveur. Le frontend ne contacte jamais
directement ces APIs.

**Rationale**: Évite d'exposer la clé TMDB côté client. Permet
le cache Redis des affiches. OpenLibrary ne nécessite pas de clé
mais le proxy unifie l'interface.

**Alternatives considered**:
- Appels directs frontend : expose la clé TMDB
- Téléchargement et stockage local : consomme du disque
