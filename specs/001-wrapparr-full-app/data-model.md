# Data Model: Wrapparr

**Branch**: `001-wrapparr-full-app` | **Date**: 2026-03-22

## Entities

### User

| Field              | Type         | Constraints                        |
|--------------------|--------------|------------------------------------|
| id                 | UUID         | PK, auto-generated                 |
| email              | String(255)  | UNIQUE, NOT NULL                   |
| hashed_password    | String(255)  | NULL si SSO-only                   |
| display_name       | String(100)  | NOT NULL                           |
| role               | Enum         | admin / user / viewer, default=user|
| oidc_provider_id   | UUID         | FK → OIDCProvider, NULL            |
| oidc_sub           | String(255)  | NULL, identifiant OIDC             |
| allow_comparison   | Boolean      | default=true                       |
| theme_pack_id      | UUID         | FK → ThemePack, NULL               |
| created_at         | DateTime     | auto                               |
| updated_at         | DateTime     | auto                               |
| is_active          | Boolean      | default=true                       |

**State transitions**: active → inactive (soft delete).
Les recaps historiques sont conservés même après désactivation.

### OIDCProvider

| Field          | Type         | Constraints                 |
|----------------|--------------|-----------------------------|
| id             | UUID         | PK                          |
| name           | String(100)  | UNIQUE, NOT NULL            |
| issuer_url     | String(500)  | NOT NULL                    |
| client_id      | String(255)  | NOT NULL                    |
| client_secret  | Text         | NOT NULL, chiffré AES-256   |
| scopes         | String(500)  | default="openid email profile"|
| is_active      | Boolean      | default=true                |
| created_at     | DateTime     | auto                        |

### RefreshToken

| Field      | Type         | Constraints                      |
|------------|--------------|----------------------------------|
| id         | UUID         | PK                               |
| user_id    | UUID         | FK → User, NOT NULL              |
| token_hash | String(255)  | UNIQUE, NOT NULL (SHA-256 du token)|
| expires_at | DateTime     | NOT NULL                         |
| created_at | DateTime     | auto                             |
| revoked    | Boolean      | default=false                    |

### ServiceConnector

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| user_id        | UUID         | FK → User, NOT NULL               |
| service_type   | Enum         | tautulli / jellyfin / romm /      |
|                |              | audiobookshelf / komga / booklore  |
| display_name   | String(100)  | NOT NULL                          |
| base_url       | String(500)  | NOT NULL                          |
| api_key_enc    | Text         | NOT NULL, chiffré AES-256         |
| is_active      | Boolean      | default=true                      |
| last_test_at   | DateTime     | NULL                              |
| last_test_ok   | Boolean      | NULL                              |
| created_at     | DateTime     | auto                              |
| updated_at     | DateTime     | auto                              |

**Unicité**: (user_id, service_type) — un seul connecteur par
type par utilisateur.

### YearlyRecap

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| user_id        | UUID         | FK → User, NOT NULL               |
| year           | Integer      | NOT NULL                          |
| status         | Enum         | pending / collecting / processing /|
|                |              | fetching_posters / completed /     |
|                |              | failed                            |
| progress       | Integer      | 0-100, default=0                  |
| progress_msg   | String(255)  | NULL, message étape en cours       |
| data           | JSONB        | NULL, données calculées            |
| error_message  | Text         | NULL                              |
| started_at     | DateTime     | NULL                              |
| completed_at   | DateTime     | NULL                              |
| created_at     | DateTime     | auto                              |

**Unicité**: (user_id, year).

**State transitions**:
```
pending → collecting → processing → fetching_posters → completed
    ↘         ↘            ↘              ↘
     → failed  → failed     → failed       → failed
```
En cas d'échec, le recap peut être relancé (retour à pending).

### HistorySnapshot

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| recap_id       | UUID         | FK → YearlyRecap, UNIQUE          |
| user_id        | UUID         | FK → User, NOT NULL               |
| year           | Integer      | NOT NULL                          |
| recap_data     | JSONB        | NOT NULL, copie complète données   |
| slide_config   | JSONB        | NOT NULL, config slides de l'époque|
| theme_pack     | JSONB        | NOT NULL, thème complet de l'époque|
| created_at     | DateTime     | auto (immuable après création)     |

**Immuabilité**: Aucun endpoint de modification. Une fois créé,
le snapshot ne change jamais.

### SlideConfig

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| user_id        | UUID         | FK → User, NOT NULL               |
| slide_id       | String(50)   | NOT NULL (ex: "films-pod")        |
| enabled        | Boolean      | default=true                      |
| sort_order     | Integer      | NOT NULL                          |
| created_at     | DateTime     | auto                              |
| updated_at     | DateTime     | auto                              |

**Unicité**: (user_id, slide_id).

**Contraintes métier**: `intro` toujours en première position,
`finale` toujours en dernière position — non modifiables.

### ThemePack

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| name           | String(100)  | UNIQUE, NOT NULL                  |
| slug           | String(100)  | UNIQUE, NOT NULL                  |
| is_builtin     | Boolean      | default=false                     |
| config         | JSONB        | NOT NULL                          |
| created_at     | DateTime     | auto                              |
| updated_at     | DateTime     | auto                              |

**Structure JSONB `config`**:
```json
{
  "palette": {
    "primary": "#E5A00D",
    "background": "#05050e",
    "accents": { "films": "#E5A00D", "series": "#E87C2A", ... }
  },
  "card_style": "glass",
  "transition": "slide-up",
  "particles": true,
  "orbs": true,
  "grain": true,
  "spotlights": true,
  "finale_effect": "fireworks",
  "fonts": {
    "heading": "Syne",
    "body": "Outfit",
    "mono": "DM Mono"
  }
}
```

**Packs builtin**: cinematic (défaut), neon-arcade, editorial,
galaxy, ember. Non supprimables (`is_builtin=true`).

### CustomPhrase

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| user_id        | UUID         | FK → User, NOT NULL               |
| category       | String(50)   | NOT NULL (films, series, romm,    |
|                |              | audio, komga)                     |
| text           | String(500)  | NOT NULL                          |
| sort_order     | Integer      | NOT NULL                          |
| mode           | Enum         | mix / replace, default=mix        |
| created_at     | DateTime     | auto                              |

**Unicité**: (user_id, category, sort_order).

**Variables disponibles dans `text`**: `{user}`, `{count}`,
`{hours}`, `{year}`, `{top1}`.

### ShareLink

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| id             | UUID         | PK                                |
| user_id        | UUID         | FK → User, NOT NULL               |
| recap_id       | UUID         | FK → YearlyRecap, NOT NULL        |
| token          | String(64)   | UNIQUE, NOT NULL                  |
| expires_at     | DateTime     | NOT NULL                          |
| created_at     | DateTime     | auto                              |

### GlobalConfig

| Field          | Type         | Constraints                       |
|----------------|--------------|-----------------------------------|
| key            | String(100)  | PK                                |
| value          | JSONB        | NOT NULL                          |
| updated_at     | DateTime     | auto                              |

**Clés prédéfinies**: `allow_registration`, `allow_user_themes`,
`allow_user_comparison`, `recap_schedule`, `smtp_config`,
`max_history_years`, `public_share_expiry_days`.

## Relationships

```
User 1──N RefreshToken
User 1──N ServiceConnector
User 1──N YearlyRecap
User 1──N SlideConfig
User 1──N CustomPhrase
User 1──N ShareLink
User N──1 ThemePack (optional)
User N──1 OIDCProvider (optional)
YearlyRecap 1──1 HistorySnapshot
YearlyRecap 1──N ShareLink
```

## Indexes

- `User.email` : UNIQUE index
- `RefreshToken.token_hash` : UNIQUE index
- `ServiceConnector(user_id, service_type)` : UNIQUE composite
- `YearlyRecap(user_id, year)` : UNIQUE composite
- `ShareLink.token` : UNIQUE index
- `HistorySnapshot.recap_id` : UNIQUE index
- `SlideConfig(user_id, slide_id)` : UNIQUE composite
