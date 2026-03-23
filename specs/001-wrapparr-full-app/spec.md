# Feature Specification: Wrapparr — Application Complète

**Feature Branch**: `001-wrapparr-full-app`
**Created**: 2026-03-22
**Status**: Draft
**Input**: Application web self-hosted générant des récapitulatifs annuels visuels et animés (style Spotify Wrapped) pour un homelab, agrégeant Plex, Jellyfin, ROMM, Audiobookshelf, Komga et Booklore.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Squelette Docker fonctionnel (Priority: P1)

Un administrateur clone le dépôt, copie `.env.example` en `.env`,
lance `docker compose up` et obtient les 5 services opérationnels
(API, frontend, worker, PostgreSQL, Redis) sans erreur.

**Why this priority**: Sans infrastructure Docker fonctionnelle,
aucun autre module ne peut être développé ni testé.

**Independent Test**: Exécuter `docker compose up` sur une machine
vierge et vérifier que chaque service répond (healthcheck).

**Acceptance Scenarios**:

1. **Given** un `.env` correctement rempli, **When** l'admin
   exécute `docker compose up`, **Then** les 5 services démarrent
   et passent leurs healthchecks en moins de 60 secondes
2. **Given** une variable d'environnement manquante, **When**
   l'admin lance le compose, **Then** un message d'erreur clair
   indique la variable absente

---

### User Story 2 — Authentification et gestion des rôles (Priority: P1)

Un utilisateur peut créer un compte, se connecter (email + mot
de passe ou SSO OIDC), recevoir un token d'accès, et accéder
aux fonctionnalités correspondant à son rôle (admin, user,
viewer).

**Why this priority**: L'authentification est le socle de toutes
les interactions protégées de l'application.

**Independent Test**: Créer un compte, se connecter, vérifier
le token JWT reçu, accéder à une route protégée, tester le
refresh token.

**Acceptance Scenarios**:

1. **Given** un email et mot de passe valides, **When**
   l'utilisateur soumet le formulaire d'inscription, **Then**
   le compte est créé et un JWT est retourné
2. **Given** un compte existant, **When** l'utilisateur se
   connecte, **Then** un access token (15 min) et un refresh
   token (httpOnly, 7 jours) sont émis
3. **Given** un access token expiré, **When** le client appelle
   `/refresh`, **Then** un nouveau access token est émis si le
   refresh token est valide
4. **Given** un provider OIDC configuré, **When** l'utilisateur
   clique sur "Se connecter avec [provider]", **Then** le flux
   authorize → callback s'exécute et un JWT local est émis
5. **Given** un utilisateur avec le rôle "user", **When** il
   tente d'accéder à une route admin, **Then** une erreur 403
   est retournée

---

### User Story 3 — Connexion et collecte des données (Priority: P2)

Un administrateur configure les connexions aux services de son
homelab (Plex/Tautulli, Jellyfin, ROMM, Audiobookshelf, Komga,
Booklore). Le système collecte les données d'activité annuelle
pour chaque service connecté.

**Why this priority**: Sans données collectées, aucun
récapitulatif ne peut être généré.

**Independent Test**: Configurer un connecteur Tautulli avec une
URL et clé API valides, lancer un test de connexion, puis
déclencher une collecte et vérifier que les données sont
stockées.

**Acceptance Scenarios**:

1. **Given** une URL et clé API Tautulli, **When** l'admin
   clique "Tester la connexion", **Then** un statut
   succès/échec est affiché avec détails
2. **Given** un connecteur configuré et validé, **When** le job
   de collecte s'exécute, **Then** les données (films, séries,
   durées, genres, habitudes) sont normalisées et stockées
3. **Given** un service non configuré, **When** le recap est
   généré, **Then** les slides de ce service sont
   automatiquement ignorées
4. **Given** une clé API enregistrée, **When** elle est stockée
   en base, **Then** elle est chiffrée (AES-256) et jamais
   exposée en clair

---

### User Story 4 — Génération et affichage du récapitulatif (Priority: P2)

Un utilisateur déclenche ou reçoit automatiquement son
récapitulatif annuel. Le système exécute le pipeline (collecte →
normalisation → calcul stats → récupération affiches → snapshot
JSON) et présente les slides animées dans le navigateur.

**Why this priority**: C'est la fonctionnalité cœur de
l'application — la raison d'être de Wrapparr.

**Independent Test**: Déclencher manuellement un recap avec des
données de test, vérifier que le snapshot JSON est créé et que
les slides s'affichent correctement dans le navigateur.

**Acceptance Scenarios**:

1. **Given** des données collectées pour l'année en cours,
   **When** l'utilisateur clique "Générer mon recap", **Then**
   le pipeline s'exécute avec progression en temps réel
2. **Given** un pipeline terminé, **When** l'utilisateur accède
   à son recap, **Then** les slides s'affichent dans l'ordre :
   intro → annonce catégorie → podium → stats → stats
   détaillées → finale
3. **Given** un service avec données insuffisantes, **When** le
   recap est généré, **Then** les slides de ce service sont
   sautées automatiquement
4. **Given** la config par défaut, **When** le 1er janvier à
   2h00 arrive, **Then** le recap est généré automatiquement
   pour tous les utilisateurs

---

### User Story 5 — Configuration des slides et podiums (Priority: P3)

Un utilisateur personnalise son expérience : activer/désactiver
des slides, réordonner les slides par drag-and-drop, et
personnaliser les phrases des podiums.

**Why this priority**: Améliore l'expérience utilisateur mais
n'est pas bloquante pour un MVP fonctionnel.

**Independent Test**: Désactiver une slide, changer l'ordre,
ajouter une phrase custom sur un podium, puis vérifier que le
recap reflète ces changements.

**Acceptance Scenarios**:

1. **Given** la liste des slides disponibles, **When**
   l'utilisateur désactive une slide, **Then** elle n'apparaît
   plus dans son recap
2. **Given** les slides actives, **When** l'utilisateur les
   réordonne par drag-and-drop, **Then** le nouvel ordre est
   respecté (sauf intro toujours 1er, finale toujours dernier)
3. **Given** un podium avec phrases par défaut, **When**
   l'utilisateur ajoute des phrases custom, **Then** il choisit
   entre mode "mélange" ou "remplacement"
4. **Given** un podium affiché, **When** le reveal se lance,
   **Then** les 3 phases s'enchaînent : attente (pulse rings) →
   phrases rigolotes → reveal #3/#2/#1

---

### User Story 6 — Thèmes visuels (Priority: P3)

Un utilisateur (si autorisé) ou l'admin sélectionne un thème
visuel parmi les packs disponibles (cinematic, neon-arcade,
editorial, galaxy, ember), personnalise les couleurs
principales et prévisualise le résultat en temps réel.

**Why this priority**: Enrichit l'expérience sans bloquer les
fonctionnalités cœur.

**Independent Test**: Sélectionner le thème "neon-arcade",
modifier une couleur principale, vérifier la preview, puis
lancer un recap et confirmer que le thème est appliqué.

**Acceptance Scenarios**:

1. **Given** les theme packs disponibles, **When** l'utilisateur
   en sélectionne un, **Then** la prévisualisation temps réel
   s'affiche
2. **Given** un thème sélectionné, **When** l'utilisateur
   modifie une couleur via le color picker, **Then** la preview
   se met à jour instantanément
3. **Given** `allow_user_themes = false`, **When** un
   utilisateur tente de changer de thème, **Then** l'option
   n'est pas disponible (seul l'admin contrôle le thème global)

---

### User Story 7 — Historique, replay et comparaisons (Priority: P4)

Un utilisateur consulte ses recaps passés, les rejoue avec le
thème et la configuration d'origine, et compare ses statistiques
d'une année à l'autre.

**Why this priority**: Fonctionnalité d'enrichissement qui
nécessite au moins un recap existant.

**Independent Test**: Après génération de 2 recaps (années
différentes), accéder à `/recap/{year}`, vérifier le replay,
puis consulter la comparaison N vs N-1.

**Acceptance Scenarios**:

1. **Given** un recap généré pour 2025, **When** l'utilisateur
   accède à `/recap/2025`, **Then** le recap est rejoué avec le
   thème et les slides de l'époque
2. **Given** des recaps 2024 et 2025, **When** l'utilisateur
   consulte la comparaison, **Then** les graphiques superposent
   l'activité mensuelle des deux années
3. **Given** `allow_user_comparison = true`, **When** un
   utilisateur consulte le classement inter-utilisateurs,
   **Then** seuls les utilisateurs n'ayant pas masqué leurs
   stats apparaissent

---

### User Story 8 — Partage public (Priority: P4)

Un utilisateur génère un lien de partage public pour son recap.
Ce lien permet à n'importe qui de consulter le recap sans
authentification, avec des données personnelles minimales.

**Why this priority**: Fonctionnalité sociale secondaire.

**Independent Test**: Générer un lien de partage, l'ouvrir en
navigation privée, vérifier l'affichage sans authentification
et l'absence de données sensibles.

**Acceptance Scenarios**:

1. **Given** un recap existant, **When** l'utilisateur clique
   "Partager", **Then** un lien avec token opaque est généré
2. **Given** un lien de partage valide, **When** un visiteur
   anonyme y accède, **Then** le recap s'affiche sans
   authentification
3. **Given** un lien expiré, **When** un visiteur y accède,
   **Then** une page d'erreur "Lien expiré" s'affiche
4. **Given** un recap partagé, **When** il s'affiche, **Then**
   le classement inter-utilisateurs est masqué et les données
   personnelles sont minimales

---

### User Story 9 — Administration (Priority: P3)

L'administrateur gère les utilisateurs, la configuration
globale, les theme packs, et consulte les logs en temps réel
depuis un dashboard dédié.

**Why this priority**: Nécessaire pour la gestion quotidienne
mais pas pour un MVP minimal.

**Independent Test**: Se connecter en admin, accéder au
dashboard, créer un utilisateur, modifier une config globale,
vérifier les logs.

**Acceptance Scenarios**:

1. **Given** un admin connecté, **When** il accède au dashboard,
   **Then** il voit les métriques : nombre d'utilisateurs,
   services connectés, jobs en cours, logs récents
2. **Given** le dashboard admin, **When** l'admin modifie
   `allow_registration`, **Then** le comportement de
   l'inscription change immédiatement
3. **Given** un job de collecte en cours, **When** l'admin
   consulte les logs, **Then** les entrées apparaissent en
   temps réel

---

### Edge Cases

- Que se passe-t-il si un service externe (Tautulli, Jellyfin)
  est temporairement indisponible pendant la collecte ?
- Comment le système gère-t-il un utilisateur supprimé qui
  avait des recaps historiques ?
- Que se passe-t-il si le pipeline de génération échoue à
  mi-parcours (ex. timeout TMDB) ?
- Comment le système réagit-il si la base de données est pleine
  lors de la sauvegarde d'un snapshot ?
- Que se passe-t-il si deux collectes sont déclenchées
  simultanément pour le même utilisateur ?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Le système DOIT permettre l'inscription et la
  connexion par email + mot de passe (bcrypt)
- **FR-002**: Le système DOIT émettre des JWT (access 15 min,
  refresh httpOnly 7 jours)
- **FR-003**: Le système DOIT supporter l'authentification SSO
  via tout provider OIDC standard
- **FR-004**: Le système DOIT gérer 3 rôles : admin (tout),
  user (son propre recap), viewer (lecture seule via lien
  partagé)
- **FR-005**: Le système DOIT collecter les données depuis Plex
  (Tautulli), Jellyfin, ROMM, Audiobookshelf, Komga et
  Booklore
- **FR-006**: Le système DOIT chiffrer les clés API stockées en
  base avec AES-256
- **FR-007**: Le système DOIT générer un récapitulatif annuel
  sous forme de slides animées
- **FR-008**: Le pipeline de génération DOIT suivre : collecte →
  normalisation → calcul stats → récupération affiches →
  snapshot JSON
- **FR-009**: Le système DOIT permettre la planification
  automatique de la génération (défaut : 1er janvier 2h00)
- **FR-010**: Le système DOIT permettre le déclenchement manuel
  de la génération
- **FR-011**: Le système DOIT afficher la progression de la
  génération en temps réel
- **FR-012**: Le système DOIT respecter l'ordre des slides :
  annonce catégorie → podium → stats principales → stats
  détaillées
- **FR-013**: Le système DOIT sauter automatiquement les slides
  d'un service non connecté ou sans données suffisantes
- **FR-014**: Le système DOIT permettre l'activation/
  désactivation et le réordonnancement des slides par
  utilisateur
- **FR-015**: Les podiums DOIVENT suivre le reveal en 3 phases :
  attente → phrases → reveal #3/#2/#1
- **FR-016**: Le système DOIT fournir 5 theme packs : cinematic,
  neon-arcade, editorial, galaxy, ember
- **FR-017**: Le système DOIT permettre la personnalisation des
  couleurs avec prévisualisation temps réel
- **FR-018**: Le système DOIT sauvegarder chaque recap comme
  snapshot immuable
- **FR-019**: Le système DOIT permettre le replay d'un recap
  historique avec le thème d'origine
- **FR-020**: Le système DOIT permettre la comparaison de stats
  entre années (N vs N-1, N-2, N-3)
- **FR-021**: Le système DOIT permettre le partage via lien
  public avec token opaque et expiration configurable
- **FR-022**: Le système DOIT fournir un dashboard admin avec
  gestion des utilisateurs, config globale, theme packs et
  logs temps réel

### Key Entities

- **User**: Compte utilisateur avec rôle (admin/user/viewer),
  préférences de slides, thème personnel
- **ServiceConnector**: Configuration de connexion à un service
  (type, URL, clé API chiffrée, statut)
- **YearlyRecap**: Récapitulatif annuel d'un utilisateur
  (année, données calculées, statut de génération)
- **HistorySnapshot**: Copie immuable d'un recap avec la config
  et le thème de l'époque
- **SlideConfig**: Configuration des slides par utilisateur
  (ordre, activation, phrases custom)
- **ThemePack**: Pack de thème visuel (palette, effets,
  transitions, polices)
- **CustomPhrase**: Phrase personnalisée pour les podiums (par
  utilisateur, par catégorie)
- **ShareLink**: Lien de partage public (token opaque, date
  d'expiration, recap associé)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un administrateur peut déployer l'application
  complète en moins de 10 minutes avec Docker Compose
- **SC-002**: Un utilisateur peut se connecter et accéder à son
  premier recap en moins de 2 minutes après configuration des
  services
- **SC-003**: La génération d'un recap pour un utilisateur avec
  3 services connectés se termine en moins de 5 minutes
- **SC-004**: Les slides du recap s'affichent sans saccade sur
  un navigateur desktop moderne
- **SC-005**: 100% des clés API sont chiffrées en base — aucune
  n'est lisible en clair
- **SC-006**: Un lien de partage est utilisable sans
  authentification et n'expose pas les données personnelles
  sensibles
- **SC-007**: Le replay d'un recap historique reproduit
  fidèlement l'expérience d'origine (thème + slides)
- **SC-008**: Le prototype visuel de référence
  (`wrapparr-front/src/slides/Wrapparr.jsx`) est reproduit à
  l'identique dans l'application finale
