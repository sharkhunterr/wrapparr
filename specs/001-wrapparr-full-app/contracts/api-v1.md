# API Contracts: Wrapparr v1

**Base path**: `/api/v1`
**Format**: JSON
**Auth**: Bearer JWT (sauf mention contraire)

## Auth

### POST /auth/register
Créer un compte utilisateur.
- **Body**: `{ email, password, display_name }`
- **Response 201**: `{ access_token, token_type, user }`
- **Response 400**: email invalide ou déjà existant
- **Auth**: Aucune (si `allow_registration=true`)

### POST /auth/login
Connexion email + mot de passe.
- **Body**: `{ email, password }`
- **Response 200**: `{ access_token, token_type, user }`
- **Set-Cookie**: `refresh_token` (httpOnly, Secure, 7j)
- **Response 401**: identifiants invalides

### POST /auth/refresh
Renouveler l'access token.
- **Cookie**: `refresh_token`
- **Response 200**: `{ access_token, token_type }`
- **Response 401**: refresh token invalide ou expiré

### POST /auth/logout
Révoquer le refresh token.
- **Cookie**: `refresh_token`
- **Response 204**

### GET /auth/sso/{provider}/authorize
Redirection vers le provider OIDC.
- **Response 302**: redirect vers `issuer_url/authorize`
- **Auth**: Aucune

### GET /auth/sso/{provider}/callback
Callback OIDC, échange code → tokens.
- **Query**: `code`, `state`
- **Response 302**: redirect vers frontend avec access_token
- **Auth**: Aucune

### GET /auth/me
Profil de l'utilisateur connecté.
- **Response 200**: `{ id, email, display_name, role, theme_pack_id, allow_comparison }`

## Users (admin)

### GET /admin/users
Liste des utilisateurs.
- **Response 200**: `[{ id, email, display_name, role, is_active, created_at }]`
- **Auth**: admin

### POST /admin/users
Créer un utilisateur.
- **Body**: `{ email, password, display_name, role }`
- **Response 201**: `{ id, email, display_name, role }`
- **Auth**: admin

### PATCH /admin/users/{id}
Modifier un utilisateur (rôle, actif, reset password).
- **Body**: `{ role?, is_active?, password? }`
- **Response 200**: `{ id, email, display_name, role, is_active }`
- **Auth**: admin

## Services (connecteurs)

### GET /services
Liste des connecteurs de l'utilisateur.
- **Response 200**: `[{ id, service_type, display_name, base_url, is_active, last_test_ok }]`

### POST /services
Ajouter un connecteur.
- **Body**: `{ service_type, display_name, base_url, api_key }`
- **Response 201**: `{ id, service_type, display_name, base_url }`

### PUT /services/{id}
Modifier un connecteur.
- **Body**: `{ display_name?, base_url?, api_key?, is_active? }`
- **Response 200**: connecteur mis à jour

### DELETE /services/{id}
Supprimer un connecteur.
- **Response 204**

### POST /services/{id}/test
Tester la connexion à un service.
- **Response 200**: `{ ok: true, details: "..." }`
- **Response 422**: `{ ok: false, error: "..." }`

## Recaps

### GET /recaps
Liste des recaps de l'utilisateur.
- **Response 200**: `[{ id, year, status, progress, completed_at }]`

### GET /recaps/{year}
Données du recap pour une année.
- **Response 200**: `{ year, status, data, slide_config, theme_pack }`
- **Response 404**: pas de recap pour cette année

### POST /recaps/generate
Déclencher la génération d'un recap.
- **Body**: `{ year? }` (défaut: année en cours)
- **Response 202**: `{ recap_id, status: "pending" }`
- **Response 409**: génération déjà en cours

### GET /recaps/{year}/progress
Progression de la génération (polling alternatif au WebSocket).
- **Response 200**: `{ status, progress, progress_msg }`

### GET /recaps/compare
Comparaison multi-années.
- **Query**: `years=2024,2023,2022`
- **Response 200**: `{ years: [{ year, monthly, totals }] }`

## WebSocket

### WS /ws/recap-progress
Progression en temps réel de la génération.
- **Auth**: token JWT en query param `?token=...`
- **Messages serveur**: `{ type: "progress", recap_id, progress, progress_msg, status }`

### WS /ws/admin-logs (admin)
Logs temps réel pour l'admin.
- **Auth**: token JWT admin en query param
- **Messages serveur**: `{ type: "log", level, message, timestamp }`

## Slides

### GET /slides/config
Configuration des slides de l'utilisateur.
- **Response 200**: `[{ slide_id, enabled, sort_order }]`

### PUT /slides/config
Mettre à jour la configuration des slides.
- **Body**: `[{ slide_id, enabled, sort_order }]`
- **Response 200**: config mise à jour
- **Validation**: intro toujours sort_order=0, finale toujours
  dernier

## Phrases (podiums)

### GET /phrases
Phrases custom de l'utilisateur.
- **Query**: `category?`
- **Response 200**: `[{ id, category, text, sort_order, mode }]`

### POST /phrases
Ajouter une phrase custom.
- **Body**: `{ category, text, sort_order, mode }`
- **Response 201**: phrase créée

### PUT /phrases/{id}
Modifier une phrase.
- **Body**: `{ text?, sort_order?, mode? }`
- **Response 200**: phrase mise à jour

### DELETE /phrases/{id}
Supprimer une phrase.
- **Response 204**

### GET /phrases/defaults
Phrases par défaut par catégorie.
- **Response 200**: `{ films: [...], series: [...], ... }`

## Themes

### GET /themes
Liste des theme packs disponibles.
- **Response 200**: `[{ id, name, slug, is_builtin, config }]`

### GET /themes/{slug}
Détails d'un theme pack.
- **Response 200**: `{ id, name, slug, is_builtin, config }`

### PUT /users/me/theme
Sélectionner un thème personnel.
- **Body**: `{ theme_pack_id, overrides? }`
- **Response 200**: préférences mises à jour
- **Condition**: `allow_user_themes=true`

### POST /admin/themes (admin)
Créer un theme pack custom.
- **Body**: `{ name, config }`
- **Response 201**

### PUT /admin/themes/{id} (admin)
Modifier un theme pack.
- **Body**: `{ name?, config? }`
- **Response 200**

### DELETE /admin/themes/{id} (admin)
Supprimer un theme pack (non-builtin uniquement).
- **Response 204**
- **Response 403**: ne peut pas supprimer un pack builtin

## Share

### POST /share
Créer un lien de partage.
- **Body**: `{ recap_id }`
- **Response 201**: `{ token, url, expires_at }`

### DELETE /share/{token}
Révoquer un lien de partage.
- **Response 204**

### GET /share/{token} (public)
Accéder à un recap partagé.
- **Auth**: Aucune
- **Response 200**: `{ year, data, theme_pack }` (données filtrées:
  pas de classement inter-users, données personnelles minimales)
- **Response 410**: lien expiré

## Admin

### GET /admin/dashboard
Métriques du dashboard admin.
- **Response 200**: `{ user_count, active_services, running_jobs, recent_logs }`

### GET /admin/config
Configuration globale.
- **Response 200**: `{ allow_registration, allow_user_themes, allow_user_comparison, recap_schedule, max_history_years, public_share_expiry_days }`

### PATCH /admin/config
Modifier la configuration globale.
- **Body**: `{ key: value, ... }`
- **Response 200**: config mise à jour

## Media (proxy)

### GET /media/poster
Proxy pour les affiches TMDB / OpenLibrary.
- **Query**: `type=tmdb|openlibrary`, `id=...`, `size=w300|w780`
- **Response 200**: image binaire (avec cache Redis)
- **Response 404**: affiche introuvable
