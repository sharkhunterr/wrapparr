## v0.2.0

> Le plus gros update de Wrapparr depuis sa creation. Architecture completement repensee, 3 nouvelles integrations, systeme de backup, et bien plus.

### Nouvelles integrations

#### 📋 Overseerr — Vos demandes media dans le recap

Overseerr est maintenant un service a part entiere dans Wrapparr. Toutes les demandes media de l'annee sont collectees et presentees dans une section dediee avec sa propre couleur d'accent.

**5 nouvelles slides :**
- **Bilan des demandes** — Total films/series demandes, taux d'approbation avec progressbar, statuts detailles (disponible, partiel, en cours, en attente), courbe mensuelle avec comparaison annee precedente
- **Demandes vs regarde** — Taux de match entre ce que tu as demande et ce que tu as vraiment regarde, avec profils configurables (Collectionneur fantome → Demandeur parfait)
- **Tes demandes a succes** — Top demandes vues par le plus d'utilisateurs, avec nombre de viewers et de vues
- **Classement des demandeurs** — Qui demande le plus sur le serveur, avec barres de progression et badge de rang
- **Separation de section** — Slide d'annonce configurable

Les titres et posters sont resolus automatiquement via l'API Overseerr. Le matching avec les films regardes utilise les tmdb_id pour un croisement fiable independant de la langue.

#### 📖 Grimmory — Lecture et audiobooks avec stats riches

Integration du successeur de Booklore, avec ses 26 endpoints de statistiques dediees.

**Slides specifiques :**
- **Bilan lecture** — Livres lus, temps, profils lecteur configurables (Lecteur curieux → Legende de la lecture), donut genres, top livres
- **Auteurs favoris** — Classement par temps de lecture avec barres de progression
- **Streak de lecture** — Streak actuel, record personnel, jours de lecture sur l'annee avec pourcentage
- **Livres addictifs** — Score d'engagement base sur l'acceleration des sessions (les livres que tu n'as pas pu lacher)

Plus les slides generiques : separation de section, podium, stats et habitudes, genres favoris.

#### 🎧 Audiobookshelf ameliore

- **Filtrage par annee** — Plus de stats globales toutes annees confondues, uniquement l'annee selectionnee
- **Filtrage par utilisateur** — Resolution automatique via l'endpoint admin `/api/users`
- **Bilan ecoute** — Meme qualite visuelle que le bilan cinema, avec profils auditeur configurables
- **Auteurs et narrateurs favoris** — Classement avec icones plume/micro et barres de progression

---

### Systeme de backup

#### Exporter toute sa configuration en un clic

La nouvelle page **Sauvegarde** dans l'admin permet d'exporter un fichier JSON contenant :
- Utilisateurs (roles, permissions)
- Services configures (avec cles API)
- Mappings utilisateurs
- Configuration des slides (ordre, activation, parametres)
- Musique (playlist, assignations)
- Themes personnalises
- Providers OIDC/SSO
- Phrases personnalisees

#### Importer depuis le wizard

Au premier demarrage, le wizard propose 3 options :
1. **Commencer** — Configuration guidee normale
2. **Importer une sauvegarde** — Charge un backup, demande le mot de passe admin, restaure tout
3. **Ignorer** — Acces direct avec creation du compte admin uniquement

---

### Architecture modulaire

Le coeur du recap a ete entierement refactorise pour la maintenabilite :

| Composant | Avant | Apres |
|-----------|-------|-------|
| RecapPlayer.jsx | 2 644 lignes | 373 lignes |
| Themes | 1 fichier monolithique | 16 fichiers individuels |
| Effets | dans RecapPlayer | 28 composants separes |
| Slides communaute | 1 fichier de 844 lignes | 6 fichiers + shared |
| Player | dans RecapPlayer | 5 sous-composants |

Un guide complet `docs/EXTENSIBILITY.md` documente comment ajouter des themes, effets, slides et palettes.

---

### Gestion des slides refaite

La page admin **Gestion slides** a ete entierement repensee :

- **Blocs par section** collapsibles (Films, Series, Livres Audio, Communaute, Demandes, Global)
- **Boutons monter/descendre** pour reordonner les sections entieres
- **Bouton on/off par section** pour activer/desactiver tout un groupe
- **Labels clairs** et uniformises pour toutes les slides
- Les slides desactivees ne sont plus generees dans le recap

---

### Musique

- **Playlist multi-pistes** — En mode fond unique, ajoutez plusieurs musiques qui s'enchainent automatiquement
- **Crossfade** — Transition smooth de 1.5s entre les pistes (fondu progressif)
- **Continuite** — La musique ne coupe plus quand deux sections consecutives ont la meme piste
- **Sections completes** — Livres Audio, Lecture, Demandes ajoutees au mode per-section

---

### Palettes et themes

- Chaque palette a maintenant une couleur **Overseerr** harmonisee avec son theme
- **Glass Dark** associe par defaut a la palette Cinematic
- Le choix de theme/palette est **persiste** depuis le recap player
- Correction des doublons `defaultPalette` dans 4 themes

---

### Corrections notables

- Toutes les slides utilisent le bon service pour les donnees de comparaison
- `tmdb_id` propage dans les items Tautulli pour le matching cross-service
- Pipeline resilient au dechiffrement (skip service si cle corrompue)
- Seeding des palettes builtin corrige pour PostgreSQL
- `yt-dlp` utilise le module Python au lieu du binaire systeme
