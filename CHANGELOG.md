# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.1.17](https://github.com/your-username/wrapparr/-/compare/v0.1.16...v0.1.17) (2026-04-09)

### [0.1.16](https://github.com/your-username/wrapparr/-/compare/v0.1.15...v0.1.16) (2026-04-09)


### Features

* admin peut visualiser le recap d'un autre utilisateur via select dans la barre d'actions ([4c1d928](https://github.com/your-username/wrapparr/-/commit/4c1d9288c0f81356dfde632f5e21d21934c7bb54))
* colonne et filtre annee dans le tableau statistiques admin ([52cdc14](https://github.com/your-username/wrapparr/-/commit/52cdc1461ac5c77c55b1cb5c825fe9f6f79a3336))
* emoji caca + picker etendu avec bouton + pour choisir parmi 29 emojis ([8a086f0](https://github.com/your-username/wrapparr/-/commit/8a086f0f0164aacb95bcca4c7e3e7ae3cb60844c))
* indicateur slide suivante + reactions emoji animees sur la finale ([87b98c5](https://github.com/your-username/wrapparr/-/commit/87b98c53ac54107e8505c6bb6bf398936f19fc76))
* planification automatique des recaps (mode simple + expert cron) ([0fea631](https://github.com/your-username/wrapparr/-/commit/0fea631b20856a1066f48a894cca324219d4cbd4))
* reaction emoji affichee dans le detail expandable des stats admin ([f65b612](https://github.com/your-username/wrapparr/-/commit/f65b61201d86f7a9d9b2a722b6f44470784cb6b3))
* remontee reponses slides interactives + badge interactif dans gestion slides ([7fc4389](https://github.com/your-username/wrapparr/-/commit/7fc438975efaedce8829afb61eacef6c78a4337f))
* scheduler intégré + auto-activation des recaps après génération ([e03cc97](https://github.com/your-username/wrapparr/-/commit/e03cc97d9b21835b70f27caf261f49d748ece677))
* selection et suppression de sessions dans les stats admin (unitaire + masse) ([02e291e](https://github.com/your-username/wrapparr/-/commit/02e291e98563ba2011206cb154bae773bd5d0b29))
* slides interactives This or That + Curseur Estimation ([17888cb](https://github.com/your-username/wrapparr/-/commit/17888cb37255019da2225002ca897a128f261ab1))
* systeme de telemetrie et page admin statistiques des recaps ([bfad409](https://github.com/your-username/wrapparr/-/commit/bfad409ad04bfb4cac5179314f7ec178ed8b5f35))
* systeme i18n avec 5 langues (FR, EN, DE, ES, IT) ([db8c837](https://github.com/your-username/wrapparr/-/commit/db8c837456c2e44b07183043cb7848a0fc63a939))
* telemetrie demarre a la slide 2, detection inactivite, parametres admin ([7d93095](https://github.com/your-username/wrapparr/-/commit/7d93095ceffbafcf90764e1bb196b541d3a7ae50))
* tri par colonne (asc/desc) dans le tableau statistiques admin ([59a1fb5](https://github.com/your-username/wrapparr/-/commit/59a1fb55dd247ae6e2829803861c0a8d08381be8))


### Bug Fixes

* axe Y des graphiques tronque pour les valeurs en dizaines/centaines (largeur dynamique) ([46b629a](https://github.com/your-username/wrapparr/-/commit/46b629aa867b4fd6258bdddde3d046e7cbba0793))
* axe Y tronque sur tous les graphiques (community, overseerr, compare) - largeur dynamique ([343cd04](https://github.com/your-username/wrapparr/-/commit/343cd0449c5aaf2b47180aa957831b85d778e01f))
* bouton suivant centre, timing adapte par type de slide, visible sur toutes les slides ([bd28c10](https://github.com/your-username/wrapparr/-/commit/bd28c10df065bcd0a0ebcbb91e3231460bac0861))
* comparaison utilise les donnees de l'utilisateur impersone au lieu de l'admin ([ec105d8](https://github.com/your-username/wrapparr/-/commit/ec105d89270031c83cf0e64a4c9cacb51fc1d9bb))
* correction de TOUS les accents manquants dans les slides, thèmes et effets ([6f33c5e](https://github.com/your-username/wrapparr/-/commit/6f33c5e82c4e53013059fcac2c3cfa07d0383ebc))
* correction de tous les accents manquants dans les textes français (13 fichiers) ([b438988](https://github.com/your-username/wrapparr/-/commit/b43898846b985a09982705da8b14b7ce42fbfb81))
* ecran noir cause par boucle infinie dans le tracking de slide telemetry ([fc3bc7b](https://github.com/your-username/wrapparr/-/commit/fc3bc7b1d6f0e12a03e83ebbb636bb22bb644592))
* ecran noir du recap cause par mismatch UUID avec/sans tirets (SQLite) ([9b11b79](https://github.com/your-username/wrapparr/-/commit/9b11b79b462ccccdf219470c456de8bd1c6f825e))
* fallback display_name ne chargeait pas les donnees utilisateur dans le recap ([24062e9](https://github.com/your-username/wrapparr/-/commit/24062e96abc4d488e510065daad299fb70494ec6))
* hooks appeles apres early return causaient crash React (rules of hooks) ([f07badf](https://github.com/your-username/wrapparr/-/commit/f07badf8fde685439863ee59d0ec9e4206779bd1))
* ne plus flush sur la finale pour laisser le temps a la reaction et compter le temps sur la slide ([ce8451c](https://github.com/your-username/wrapparr/-/commit/ce8451c822b2791a8214e79e6050f181016eb42b))
* ordre colonnes tableau stats: date, utilisateur, annee, duree, progression, options ([6eda305](https://github.com/your-username/wrapparr/-/commit/6eda305f5c6981916b7f82700cc2db3937dbf2d1))
* pipeline double commit causait statut bloqué sur fetching_posters (commit unique) ([1b10339](https://github.com/your-username/wrapparr/-/commit/1b10339f0dac23d6a7e7032c1d65b2ba4f8893d6))
* podium comparaison utilise le bon mediaType (films/series/audiobook) ([1cb6e8c](https://github.com/your-username/wrapparr/-/commit/1cb6e8ce7bd91e8b2bef4f7fa3af23e7573579f6))
* reaction emoji enregistree dans la session telemetrie + affichee dans les stats admin ([8e51515](https://github.com/your-username/wrapparr/-/commit/8e51515fb56a2cebbc0e563def1cc9d55fa554de))
* reaction manquante dans le payload sendBeacon (unmount SPA) ([354211e](https://github.com/your-username/wrapparr/-/commit/354211e60e4dca5b0b2b8e8fe3aaba4b0ed44994))
* recaps desactives invisibles pour les non-admin + suppression logs 200 ([65b7d22](https://github.com/your-username/wrapparr/-/commit/65b7d2245242d4e9f3cde0c16094de3007309d8d))
* select admin utilise portal topbar + nom utilisateur impersone dans les slides ([0f474f6](https://github.com/your-username/wrapparr/-/commit/0f474f6db39892c77e875b72723d076c1dfb0ae2))
* suppression bouton generer recap de la page recap (uniquement via admin recaps) ([69e49aa](https://github.com/your-username/wrapparr/-/commit/69e49aa8e27215e9403ea249348dcf76ee972b89))
* suppression console.log spam dans buildSlides + debug telemetrie ([0c0019e](https://github.com/your-username/wrapparr/-/commit/0c0019eb2e4944f04e92dece1b9b760ab19c0b8f))
* suppression generation recap du dashboard (uniquement via page recaps) ([d52dae4](https://github.com/your-username/wrapparr/-/commit/d52dae447762d483302fa1284ea97ed9a17b1101))
* suppression inscription depuis la page login (mode register, champ nom, lien s'inscrire) ([112d6cb](https://github.com/your-username/wrapparr/-/commit/112d6cba7171bfcd564fcd59ba37215226b47009))
* telemetrie envoyee au demontage du composant (navigation SPA) ([3571665](https://github.com/your-username/wrapparr/-/commit/3571665c82fb4835c5bad4db08510fbd8785f8e0))
* telemetrie utilisateur non-admin utilise fetch avec Auth header au lieu de sendBeacon sans token ([9cc437c](https://github.com/your-username/wrapparr/-/commit/9cc437cf413d6fa9856a2cc9f32726df94ff15ea))
* telemetrie utilise des refs pour eviter flush premature avec mauvaises valeurs ([d08d88d](https://github.com/your-username/wrapparr/-/commit/d08d88d08d5f8ffe489c67f6f935d738963d4e79))
* token capture dans une ref au mount pour survivre au logout avant le flush telemetrie ([09b9c8a](https://github.com/your-username/wrapparr/-/commit/09b9c8a251e69cdb699b2ed078e9db166ec786b4))
* total_slides toujours zero dans telemetrie (ref mise a jour apres buildSlides) ([09643db](https://github.com/your-username/wrapparr/-/commit/09643db2bd815c34dc23555dbb7cd1b3f12155ea))
* useEffect ecrasait totalSlides et reaction dans latestRef a chaque render ([9eab634](https://github.com/your-username/wrapparr/-/commit/9eab634586719d56e796e963d38e37960ff395f4))

### [0.1.15](https://github.com/your-username/wrapparr/-/compare/v0.1.14...v0.1.15) (2026-04-01)


### Bug Fixes

* slide presentation affiche toutes les sections presentes ([0d70db2](https://github.com/your-username/wrapparr/-/commit/0d70db23685e75510d48dccfd6aa77be6697b82a))
* slide presentation respecte l'ordre des sections defini dans l'admin ([ca98a3c](https://github.com/your-username/wrapparr/-/commit/ca98a3c0d037320d99275b6f7d4b6054545c884f))

### [0.1.14](https://github.com/your-username/wrapparr/-/compare/v0.1.13...v0.1.14) (2026-04-01)


### Bug Fixes

* CI se declenche uniquement sur les tags + GITHUB_RELEASES.md ([4ab4869](https://github.com/your-username/wrapparr/-/commit/4ab48690f8ea9533a597fd1f658f44ad1833db9d))

### [0.1.13](https://github.com/your-username/wrapparr/-/compare/v0.1.12...v0.1.13) (2026-04-01)


### Features

* bouton on/off par section dans page Gestion slides ([62aef2e](https://github.com/your-username/wrapparr/-/commit/62aef2ef62ed9417472dbc5c944443b0a3112db7))
* classement-general — nouvelle slide avec nouvel ID ([e78e31b](https://github.com/your-username/wrapparr/-/commit/e78e31b2b08d8c564ecff7abf447f09108c72b45))
* couleur overseerr distincte + separations par section dans admin ([1973ed3](https://github.com/your-username/wrapparr/-/commit/1973ed30495103fad53690ca23e15def25350ef3)), closes [#818cf8](https://github.com/your-username/wrapparr/-/issues/818cf8)
* coulures de sang Sin City + fix palette Glass Dark ([ac28e9f](https://github.com/your-username/wrapparr/-/commit/ac28e9fcb6dd0848558713af241c7dae8d6707ce))
* integration Grimmory — lecture + audiobooks avec stats riches ([e1146b6](https://github.com/your-username/wrapparr/-/commit/e1146b6ee605a9ef432a2f80ba2008bffaa33b12)), closes [#10b981](https://github.com/your-username/wrapparr/-/issues/10b981)
* integration Overseerr + refonte wizard setup ([d1a1ac0](https://github.com/your-username/wrapparr/-/commit/d1a1ac05a687ac070ca854b6114f9dd1115b1bcb)), closes [#6366f1](https://github.com/your-username/wrapparr/-/issues/6366f1)
* nouvelle slide classement general (films+series) avec progression ([2216d7a](https://github.com/your-username/wrapparr/-/commit/2216d7a61d566f6a8afc87a75cd2b9ae20d54157)), closes [#1](https://github.com/your-username/wrapparr/-/issues/1) [#2](https://github.com/your-username/wrapparr/-/issues/2)
* playlist multi-pistes en mode single + crossfade entre musiques ([d3ffffb](https://github.com/your-username/wrapparr/-/commit/d3ffffbacbb2c8578c842162fd0829a7daca62c7))
* playlist musique + sections manquantes dans le lecteur ([d8b33f6](https://github.com/your-username/wrapparr/-/commit/d8b33f61377b8f0750c50e04195454b8c15167b3))
* profils configurables pour slide demandes vs regarde ([4f58e2b](https://github.com/your-username/wrapparr/-/commit/4f58e2b7f961b49c100ae355ed99eb4280db661a))
* refonte complete slides Overseerr ([0598d13](https://github.com/your-username/wrapparr/-/commit/0598d1337ee4c9d351631236d619d226dd238091))
* refonte page Gestion slides — blocs par section + labels uniformises ([28d44ee](https://github.com/your-username/wrapparr/-/commit/28d44eede3f7506ff8992100373d6b3f77ebc100))
* slide bilan audiobook + slide auteurs/narrateurs favoris ([5d3b171](https://github.com/your-username/wrapparr/-/commit/5d3b1714f2627205b8095343398039ba9e508da6))
* slide classement serveur — cumul total depuis le debut ([cac1da0](https://github.com/your-username/wrapparr/-/commit/cac1da0b6cfd6b8b59369d070bea12d9b1e53f08)), closes [#1](https://github.com/your-username/wrapparr/-/issues/1) [#2](https://github.com/your-username/wrapparr/-/issues/2)
* systeme de backup export/import + wizard ameliore ([5ad6eb3](https://github.com/your-username/wrapparr/-/commit/5ad6eb389cbb0a8114f84453c2f6e4c16b3f86a5))


### Bug Fixes

* ajout log seeding palettes builtin + seed manquant dans PostgreSQL ([e44dfa3](https://github.com/your-username/wrapparr/-/commit/e44dfa3ca146a3151d030d0f54a64958ae2f1636))
* appel get_all_requests_for_year renomme en get_requests_for_year ([d43f498](https://github.com/your-username/wrapparr/-/commit/d43f4988e34d72a2e3aa47e6f6e05ff79ead22a3))
* audiobookshelf filtre par annee et par utilisateur ([d57a566](https://github.com/your-username/wrapparr/-/commit/d57a566c6f112a0dfa199c0a8063a021a7557edc))
* auteurs/narrateurs audiobookshelf a 0 min (divisaient par 3600 au lieu de 60) ([aa67cf0](https://github.com/your-username/wrapparr/-/commit/aa67cf0e18e7d4c9d80322856ed47fcb6eac7772))
* backup utilisait mauvaise cle localStorage pour le token (access_token -> wrapparr_token) ([1798e58](https://github.com/your-username/wrapparr/-/commit/1798e58438525a9a0e4a3c355d860b2ea54e4e1b))
* badges progression visibles, a droite des valeurs, toujours affichés ([34102e6](https://github.com/your-username/wrapparr/-/commit/34102e63ff48bc7b1b34c99f65f17772d13948d7))
* couleur overseerr adaptee par palette (23 palettes corrigees) ([bf7ebc1](https://github.com/your-username/wrapparr/-/commit/bf7ebc1bec70628fbfaad0ea692528e29ba130e6))
* doublons defaultPalette dans 4 themes (vhs, christmas, comic, chalkboard) ([63f3b3b](https://github.com/your-username/wrapparr/-/commit/63f3b3b9665737c3da07ef6de56ad315dc79fbb0))
* glass-dark associe a la palette "cinematic" par defaut ([bd2ac67](https://github.com/your-username/wrapparr/-/commit/bd2ac673b6779ac5f26f64a2364ac3eadcc479dd))
* graphiques audiobookshelf plats quand ecoute < 1h ([27d3a01](https://github.com/your-username/wrapparr/-/commit/27d3a015b3f82f41369839650dc6644c06132c8a))
* import backup dans wizard cree le compte admin avec mot de passe ([7e0cf6e](https://github.com/your-username/wrapparr/-/commit/7e0cf6e514e90d242a817ed6ccd3f9b068c0220d))
* import-restore recevait email/password comme query params au lieu de Form fields ([4442bdb](https://github.com/your-username/wrapparr/-/commit/4442bdb89a615a4e8fa85eec05bf75dfb0f8a733))
* IndentationError dans pipeline.py ([fb454f3](https://github.com/your-username/wrapparr/-/commit/fb454f34961ba6ba50b9f595a606183f5813705d))
* musique continue entre sections avec meme piste + crossfade propre ([3224656](https://github.com/your-username/wrapparr/-/commit/32246567a9bfe6719ce4c845e0bd27334bbd08ef))
* overseerr match intelligent + comparaison + slides communaute ([7ece3c1](https://github.com/your-username/wrapparr/-/commit/7ece3c1c5a878768d42eb80534c86858c78f3408))
* persister le choix de theme/palette depuis le recap player ([a84557d](https://github.com/your-username/wrapparr/-/commit/a84557d01475cff55bf7e9679fcf71c02ef799c0))
* pipeline resilient au dechiffrement — skip service si cle corrompue ([4f75c76](https://github.com/your-username/wrapparr/-/commit/4f75c764f6af4c7dee78d6d1e5a6bcebe0907c77))
* pipeline snapshot utilise recap_data au lieu de processed (variable non definie) ([6ba2e8b](https://github.com/your-username/wrapparr/-/commit/6ba2e8ba213951ee56891b5cc8a2eba45d6b4575))
* PodiumSlide comparaison utilisait toujours tautulli ([cb4f136](https://github.com/your-username/wrapparr/-/commit/cb4f1367fc672206a986938709e79d876ab936f2))
* reset utilise DELETE au lieu de drop_all (fonctionne avec PostgreSQL) ([f66c75e](https://github.com/your-username/wrapparr/-/commit/f66c75e51ad69542fa87543041c968822ae662bc))
* resolution titres Overseerr via API + match par tmdb_id ([b846c5f](https://github.com/your-username/wrapparr/-/commit/b846c5f15ef9cb609089c5469c1e5b9cff72e410))
* server_ranking preservé lors du spread userData ([5c5501a](https://github.com/your-username/wrapparr/-/commit/5c5501a9cda2297a05dbefe2455261761f95d192))
* slide classement general affichee meme avec 1 seul utilisateur ([bc1e0e1](https://github.com/your-username/wrapparr/-/commit/bc1e0e163a0e9e549772489bc374c7bf6bf9c6de))
* slide communaute Overseerr vide — mauvaise structure de donnees ([c34bc25](https://github.com/your-username/wrapparr/-/commit/c34bc25b1023b74275d972b87311bd5c8ac02a25))
* slide comparaison generique restreinte a romm/komga/booklore ([f143d69](https://github.com/your-username/wrapparr/-/commit/f143d691b2ea0328ad3a3caf738e5827311c4490))
* slide genres affichee des 1 genre (au lieu de 3 minimum) ([deb7500](https://github.com/your-username/wrapparr/-/commit/deb7500f4c5e30252eecd1391c8d59f1a91b2fc5))
* slide popularite affiche vues + filtre demandes utilisateur ([3259595](https://github.com/your-username/wrapparr/-/commit/3259595090c0d7699e555a48d809051e879eb3ea))
* slide Statistiques restreinte aux services sans bilan dedie ([368810f](https://github.com/your-username/wrapparr/-/commit/368810f556766d4af55fe87f65817b57664e88fe))
* slides desactivees apparaissaient quand meme dans le recap ([9d0443d](https://github.com/your-username/wrapparr/-/commit/9d0443dee9842732e776cf0f362e4a57ba6d798a))
* slides fantomes Overseerr + ordre non respecte ([2665b2a](https://github.com/your-username/wrapparr/-/commit/2665b2abc161c66ac4fbbb4f8695c3ca7f825464))
* slides generiques utilisaient comparaison tautulli pour tous services ([8a0bbb4](https://github.com/your-username/wrapparr/-/commit/8a0bbb4d117901ebccbb2b0f22c81fad9809a47e))
* supprime doublon 'sur X' dans slide popularite ([8cbf806](https://github.com/your-username/wrapparr/-/commit/8cbf806f8c1ce4cba04d8d72b627a247be7cc9bd))
* toutes les slides generees sont dans le registre et l'admin ([0aa8c7d](https://github.com/your-username/wrapparr/-/commit/0aa8c7d80e56867d183bc61374e6780da437c0d7))
* toutes les slides utilisent le bon service pour la comparaison ([8d4da54](https://github.com/your-username/wrapparr/-/commit/8d4da54a9fcf46cd441b650d520ffa3a6ffc6c41))
* wizard import appelait /setup/import-restore au lieu de /backup/import-restore ([dcd5f5f](https://github.com/your-username/wrapparr/-/commit/dcd5f5f79a992ed586056dc7253e28014a1f04f8))
* yt-dlp utilise python -m yt_dlp au lieu du binaire systeme (version trop ancienne) ([c87b5b9](https://github.com/your-username/wrapparr/-/commit/c87b5b9d4ff6ec634ee1c257a53c6ab9d00c0164))

## [0.2.0](https://github.com/your-username/wrapparr/-/compare/v0.1.12...v0.2.0) (2026-04-01)

### Architecture

* **Architecture modulaire** : RecapPlayer reduit de 2644 a 373 lignes. Themes (16 fichiers), effets (28 fichiers), slides communaute (6 fichiers), player (5 fichiers) extraits en modules independants
* **Documentation d'extensibilite** : guide complet pour ajouter themes, effets, slides et palettes (`docs/EXTENSIBILITY.md`)

### Nouvelles integrations

* **Overseerr** : integration complete du service de demandes media
  - Client API avec resolution des titres via TMDB ID
  - 5 slides : bilan demandes (progressbars statuts, courbe mensuelle avec comparaison), demandes vs regarde (match par tmdb_id, profils configurables), demandes a succes (popularite par utilisateurs), classement demandeurs, separation de section
  - Comparaison annee precedente sur toutes les slides
  - Couleur accent dediee par palette (23 palettes)
* **Grimmory** : integration du successeur de Booklore pour la lecture et les audiobooks
  - Collecteur utilisant 26 endpoints stats (reading + listening)
  - Filtrage natif par annee sur tous les endpoints
  - Slides : bilan lecture (profils configurables), auteurs favoris, streak de lecture (actuel/record/jours), livres addictifs (score page-turner)
  - Reutilise les slides AudiobookBilan et AudiobookFavorites

### Audiobookshelf

* **Filtrage par annee** : sessions filtrees par date (plus de stats globales toutes annees confondues)
* **Filtrage par utilisateur** : resolution du user ID via `/api/users` puis sessions specifiques
* **Stats annuelles** : utilise `/api/me/stats/year/{year}` pour les donnees pre-calculees
* **Slide bilan ecoute** : profils auditeur configurables, donut genres, top auteurs/narrateurs, graphique mensuel, tampon anime
* **Slide auteurs et narrateurs favoris** : classement avec barres de progression et temps d'ecoute
* **Unite adaptive** : minutes au lieu d'heures quand le total est < 1h

### Systeme de backup

* **Export** : telecharge un JSON contenant toute la configuration (utilisateurs, services avec cles dechiffrees, mappings, slides, musique, themes custom, OIDC, phrases)
* **Import admin** : restaure la configuration avec merge intelligent (met a jour les existants, cree les nouveaux)
* **Import setup** : import pendant le premier demarrage avec creation du compte admin et mot de passe
* **Page admin Sauvegarde** dans le menu Systeme

### Wizard setup

* **Page de bienvenue** avec 3 options : commencer, importer un backup, ignorer
* **Services optionnels** : configuration TMDB et Overseerr directement dans le wizard avec test de connexion inline
* **Import backup** : charge le fichier en memoire, redirige vers l'etape admin credentials, restaure tout en un clic

### Gestion des slides (admin)

* **Blocs par section** collapsibles : Films, Series, Livres Audio, Communaute, Demandes, Global, Introduction, Finale
* **Boutons monter/descendre** pour deplacer les sections entieres
* **Bouton on/off par section** pour activer/desactiver toutes les slides d'un groupe
* **Labels uniformises** : noms descriptifs clairs pour toutes les slides
* **pushSlide()** : les slides desactivees ne sont plus generees dans le recap

### Musique

* **Playlist multi-pistes** en mode single : les musiques s'enchainent automatiquement
* **Crossfade 1.5s** entre les pistes (fade out/fade in progressif sur 20 steps)
* **Continuite** : la musique ne coupe plus entre deux sections qui ont la meme piste
* **Sections ajoutees** : Livres Audio, Lecture (Grimmory), Demandes (Overseerr) dans le mode per-section

### Themes et palettes

* **Glass-dark** associe a la palette Cinematic par defaut
* **Doublons defaultPalette corriges** dans 4 themes (VHS, Christmas, Comic, Chalkboard)
* **Persistance** du choix de theme/palette depuis le recap player
* **Couleur overseerr** adaptee par palette (23 palettes avec couleurs harmonisees)
* **Couleur classement** Cinematic changee en teal pour eviter confusion avec communaute

### Comparaison et donnees

* **Toutes les slides** utilisent le bon service pour la comparaison (plus de donnees tautulli dans les slides audiobookshelf/romm/etc.)
* **tmdb_id** propage dans les items Tautulli (films et series) pour le matching Overseerr
* **Server ranking** preservee lors du spread userData
* **Slide genres** affichee des 1 genre (au lieu de 3 minimum)

### Bug Fixes

* reset utilise DELETE au lieu de drop_all (PostgreSQL)
* badges progression visibles et positionnes a droite des valeurs
* yt-dlp utilise `python -m yt_dlp` au lieu du binaire systeme
* pipeline resilient au dechiffrement (skip service si cle corrompue)
* seeding palettes builtin dans PostgreSQL (table vide corrigee)

### [0.1.12](https://github.com/your-username/wrapparr/-/compare/v0.1.11...v0.1.12) (2026-03-30)


### Features

* edition utilisateurs admin — nom, email, reset mot de passe ([daf7c82](https://github.com/your-username/wrapparr/-/commit/daf7c82faf4a7487818863516c51bfc8ef58e8f2))
* page utilisateurs unifiee + reset Wrapparr ([883450f](https://github.com/your-username/wrapparr/-/commit/883450fccd6daa2c34171aac0c9b15e1da5c2ccb))
* recupere email depuis Tautulli pour le setup wizard ([af20b50](https://github.com/your-username/wrapparr/-/commit/af20b50c7a17199dfcc0dd68ef42d805c9e3348e))


### Bug Fixes

* chemins fichiers centralises + yt-dlp Docker + select services fallback ([ac77a2a](https://github.com/your-username/wrapparr/-/commit/ac77a2a49d05aacebd56df43d32b44d3c3ee2bd9))

### [0.1.11](https://github.com/your-username/wrapparr/-/compare/v0.1.10...v0.1.11) (2026-03-29)


### Features

* MemoryStore remplace Redis quand non configure ([e4febf7](https://github.com/your-username/wrapparr/-/commit/e4febf7cc32cc9556681d169c545d563fcba1b72))


### Bug Fixes

* audit securite — corrections critiques et high ([dd812b6](https://github.com/your-username/wrapparr/-/commit/dd812b687d7f4394c562a195a9f2a9361840ba9e))
* Redis optionnel — guard sur tous les appels Redis (auth SSO + cache poster) ([70310f0](https://github.com/your-username/wrapparr/-/commit/70310f0a4e785dac1c8f79d038cc13de3ef8a77e))
* to_uuid() sur toutes les comparaisons UUID pour compatibilite SQLite ([c2e3326](https://github.com/your-username/wrapparr/-/commit/c2e332605d5e962c5272bad9be422e32cbca22c4))
* UUID string→uuid conversion pour SQLite + option configurer plus tard ([b4b8c0d](https://github.com/your-username/wrapparr/-/commit/b4b8c0d320b04fcca35ff5effc40cda787977cc9))

### [0.1.10](https://github.com/your-username/wrapparr/-/compare/v0.1.9...v0.1.10) (2026-03-29)


### Bug Fixes

* remplace passlib par bcrypt direct (bug passlib+bcrypt>=4.1) ([3a17e4d](https://github.com/your-username/wrapparr/-/commit/3a17e4d7e7072923da55b0b7ee657e04ddc299a0))

### [0.1.9](https://github.com/your-username/wrapparr/-/compare/v0.1.8...v0.1.9) (2026-03-29)


### Bug Fixes

* tronque mot de passe a 72 bytes (limite bcrypt) ([9abb7eb](https://github.com/your-username/wrapparr/-/commit/9abb7ebea69ac78d2507cea1108112577502115e))

### [0.1.8](https://github.com/your-username/wrapparr/-/compare/v0.1.7...v0.1.8) (2026-03-29)


### Features

* systeme de logs + health endpoint + page admin logs ([f79251b](https://github.com/your-username/wrapparr/-/commit/f79251bf9862fefbd43c047d6ccf3e59f07cee1f))

### [0.1.7](https://github.com/your-username/wrapparr/-/compare/v0.1.6...v0.1.7) (2026-03-29)


### Bug Fixes

* ignore src/backend/data/ (SQLite + cles) ([be8937d](https://github.com/your-username/wrapparr/-/commit/be8937d6ea8d5abd002a9b5381e60035fb415e80))
* models portables SQLite+PostgreSQL — Uuid et JSON natifs SQLAlchemy ([257c2b2](https://github.com/your-username/wrapparr/-/commit/257c2b2a38c5408d13538fd58f9fdb297845cb8a))

### [0.1.6](https://github.com/your-username/wrapparr/-/compare/v0.1.5...v0.1.6) (2026-03-29)


### Features

* wizard de configuration initiale (setup first-run) ([10f441e](https://github.com/your-username/wrapparr/-/commit/10f441e5f3be521233397b6b1370edcb025d71d2))


### Bug Fixes

* setup wizard — admin = utilisateur tautulli selectionne + mdp ([6b10ba9](https://github.com/your-username/wrapparr/-/commit/6b10ba9b77998626773e021dd44a65c1e3decd99))
* setup wizard — ordre des etapes: users → admin → auth ([fba5414](https://github.com/your-username/wrapparr/-/commit/fba541453e608229e5c91f6968058e68341f0334))

### [0.1.5](https://github.com/your-username/wrapparr/-/compare/v0.1.4...v0.1.5) (2026-03-28)


### Bug Fixes

* ajout email-validator (pydantic[email]) ([22776bc](https://github.com/your-username/wrapparr/-/commit/22776bcae8bc2bb43d7cc18330aa6569a078aad3))

### [0.1.4](https://github.com/your-username/wrapparr/-/compare/v0.1.3...v0.1.4) (2026-03-28)


### Features

* SQLite par defaut, Redis optionnel, cles auto-generees ([a011303](https://github.com/your-username/wrapparr/-/commit/a0113039af2e5770308756d165178fdecbcf6566))

### [0.1.3](https://github.com/your-username/wrapparr/-/compare/v0.1.2...v0.1.3) (2026-03-28)


### Bug Fixes

* test backend CI — rootdir explicite pour pytest ([dccf953](https://github.com/your-username/wrapparr/-/commit/dccf953e2593a79d3dc99a8ed384cbf4c614c6a8))

### [0.1.2](https://github.com/your-username/wrapparr/-/compare/v0.1.1...v0.1.2) (2026-03-28)

### 0.1.1 (2026-03-28)


### Features

* 4 nouveaux themes — VHS 90s, Comic Book, Tableau Noir, Noel ([fb1af59](https://github.com/your-username/wrapparr/commit/fb1af59f0b2e757a314c2491ce74c251afdbe8e9))
* bilan slide — badge profil et equivalent en dessous, plus gros ([18fd47a](https://github.com/your-username/wrapparr/commit/18fd47a33f20207b8838efc3c673213538eb0ba6))
* bouton plein ecran, soundbar, navigation tips, fullscreen on start ([be9338a](https://github.com/your-username/wrapparr/commit/be9338ac4119b28b877e3ad9955a6ebd7231a945))
* branding complet + README + integration site ([0ef8fe8](https://github.com/your-username/wrapparr/commit/0ef8fe83839f560906840f4fbcfcec982d213967))
* collecteur Audiobookshelf enrichi ([cbf9c67](https://github.com/your-username/wrapparr/commit/cbf9c6702de2b1f4d58d0f58fd7bdcf56bf58cd2))
* collecteur ROMM + edition services + parametres slides ([603ce11](https://github.com/your-username/wrapparr/commit/603ce114758bcacf11c64990aa9c56d8b2781b77))
* comparaison inline avec bouton toggle et overlay sur slides ([a187f19](https://github.com/your-username/wrapparr/commit/a187f19d093fc1eae79ddf8cb5f9ecf69465b51c))
* comparaison inline sur slide bilan (graphique + genres N-1) ([1a8cee2](https://github.com/your-username/wrapparr/commit/1a8cee2abb4974dbc43762accb88dc42bcc0354a))
* comparaison inline sur slide carte du monde ([bb0a880](https://github.com/your-username/wrapparr/commit/bb0a880a88cfed8fba037107a95cf2aaca840837))
* comparaison inline sur slide genres (top 6 N-1 en badges) ([29c0f42](https://github.com/your-username/wrapparr/commit/29c0f422d68d520d700bb24e4fbe29eb9a0621e5))
* comparaison inline sur slide podium top films ([9c539f6](https://github.com/your-username/wrapparr/commit/9c539f6b0f3a8cd34a278a7986b366bef18b8a76))
* comparaison inline sur slides acteurs et realisateurs ([1710550](https://github.com/your-username/wrapparr/commit/1710550cea90145206a6ccbd0d612dbf46f5eca9))
* comparaison inline sur slides budget et profil cinephile ([5d138bc](https://github.com/your-username/wrapparr/commit/5d138bc8817a4a93d0e5a1f4caf300c5408db441))
* couleurs theme appliquees sur les slides + override par slide ([759c161](https://github.com/your-username/wrapparr/commit/759c1618303c60a9b5d2fc69b6c401f8e43cff1c))
* courbe total + legende cliquable sur graphique communaute ([4594539](https://github.com/your-username/wrapparr/commit/4594539361692ded65fc837080090a2b97157c7d))
* effet lumiere tournante sur affiche [#1](https://github.com/your-username/wrapparr/issues/1) du podium ([c3ef3e8](https://github.com/your-username/wrapparr/commit/c3ef3e88e16d29125b2d52c9c7944b95b3f7917f))
* effets majeurs pour VHS, Comic, Tableau Noir et Noel ([dd094f8](https://github.com/your-username/wrapparr/commit/dd094f8ea1e2899912c9dbc87ded832366d703c2)), closes [#d0d8e8](https://github.com/your-username/wrapparr/issues/d0d8e8) [#ffcc44](https://github.com/your-username/wrapparr/issues/ffcc44)
* guirlande 3 lignes + titres rouge scintillant + barres LED Stranger Things ([4e5efe2](https://github.com/your-username/wrapparr/commit/4e5efe2caa6142266164fb52dbbdcbd1c0ca9fd8)), closes [#dd1111](https://github.com/your-username/wrapparr/issues/dd1111)
* guirlande 3 lignes avec lettres grosses et degradé d'intensite ([a7d424e](https://github.com/your-username/wrapparr/commit/a7d424e969cdd825c6cded54df4e2bf7afeecef3))
* guirlande Stranger Things avec ampoules + alphabet + effets Sin City ([e980f40](https://github.com/your-username/wrapparr/commit/e980f406faa10f1711a9deab0c33dc2f33c3e1de))
* hints intro slide + bouton comparaison renomme ([9fc7c5e](https://github.com/your-username/wrapparr/commit/9fc7c5e77030a9c80d7c55a65b1fe6577aa8a22a))
* implementation initiale de Wrapparr ([d74f81f](https://github.com/your-username/wrapparr/commit/d74f81fe8d4091a012252f7806d76002dce9e90b))
* initial release v0.1.0 ([26ed79b](https://github.com/your-username/wrapparr/commit/26ed79bf4bab5d1f72de66d3ff4b1d8a92234ff5))
* legendes sur bargraphs comparaison + stats ratings dans comparison ([0329abc](https://github.com/your-username/wrapparr/commit/0329abca64f79acae9d1dc1b910fcb361a6c2e6b))
* modes genres ameliores (bulles, orbite, course) ([89702d2](https://github.com/your-username/wrapparr/commit/89702d2ea83382e92448f035ac6f75cf73251892))
* navigation chevrons + uniformisation boutons top-right ([715d9af](https://github.com/your-username/wrapparr/commit/715d9afbd29f3a7a112a7a01e6b0ced728567aff))
* palettes de couleurs par theme + selecteur utilisateur + Sin City vif ([30fb600](https://github.com/your-username/wrapparr/commit/30fb6006bc03ae1356512a04427e50940f18f6af))
* projecteurs (spotlights) sur les slides top communaute films et series ([e866b79](https://github.com/your-username/wrapparr/commit/e866b79469f7263066b544ed09e1167601d13da2))
* recaps multi-utilisateurs + mapping moderne + gestion users ([b766683](https://github.com/your-username/wrapparr/commit/b766683bcd465c268834278e12a6070bd838435e))
* refonte graphique profil cinephile (barres par annee, axes, pulse) ([07e86c8](https://github.com/your-username/wrapparr/commit/07e86c896a94fcb8b50405fec0b6287504b3e767))
* refonte slide finale + params confettis/feux d'artifice ([ff88d71](https://github.com/your-username/wrapparr/commit/ff88d71ca7a82856939364a5d06e3fe2a712cfd8))
* refonte slides comparaison films/series avec profil complet ([1977eb1](https://github.com/your-username/wrapparr/commit/1977eb10e615be97259dbb5a7bf8551735341a74)), closes [#1](https://github.com/your-username/wrapparr/issues/1)
* responsive design pass 1 — maxWidth, fontSize, padding adaptatifs ([e93a087](https://github.com/your-username/wrapparr/commit/e93a08710dafa24f1f862c24d58747d356beba06))
* responsive design pass 2 — fontSize clamp, badges, layouts ([7962765](https://github.com/your-username/wrapparr/commit/79627652de39d3bed0c1237c9db0c03d0ee41a2a))
* responsive pass 3 — bilan slide badges/stats overflow fix ([f178f14](https://github.com/your-username/wrapparr/commit/f178f1446d869e34811d87ea68812d9b1e31fbd9))
* responsive pass 4 — genre donut layout + graphique mensuel ([8902bcd](https://github.com/your-username/wrapparr/commit/8902bcd2acc2ba94b0648e234245d8ee25e1432d))
* scintillement Stranger Things sur tous les titres (h1/h2/h3) ([39967dc](https://github.com/your-username/wrapparr/commit/39967dc6c634fc4096693c9b13e4a1200de80bef))
* scripts release:full + package-lock tracke ([a5311d1](https://github.com/your-username/wrapparr/commit/a5311d1f4c67de125130ab7b700c8126dff58de4))
* section communaute — activite, top populaires, classements, genres ([9295b46](https://github.com/your-username/wrapparr/commit/9295b46553c5bce6641bdfe8113fc9fb2bcb24cf))
* section series separee, acteurs/realisateurs favoris, feux d'artifice finale ([f8d9597](https://github.com/your-username/wrapparr/commit/f8d95972887d30755cf3a4762dfc730f46fb0c97))
* select annee recap en haut a droite + rechargement dynamique ([af082f4](https://github.com/your-username/wrapparr/commit/af082f4a1d4731a4c913fdf818109bce01dd8c72))
* select annee sur la slide onboarding ([3a5b48a](https://github.com/your-username/wrapparr/commit/3a5b48a9be67fda9cfac73c266a3542efa488a76))
* slide bilan films + ameliorations habitudes ([4570d7c](https://github.com/your-username/wrapparr/commit/4570d7c8d90980ac37a3e372be8ea89ebe658313))
* slide budget films (TMDB) avec deux modes d'affichage ([6944aa7](https://github.com/your-username/wrapparr/commit/6944aa7c0e3556a784f5c413f30947cfe375f8fb))
* slide carte du monde des pays de films (TMDB) ([c3bbe51](https://github.com/your-username/wrapparr/commit/c3bbe519764f5c71cc362a690a98dcbd26811334))
* slide comparaison annee vs annee (films + series, section communaute) ([dde2a2d](https://github.com/your-username/wrapparr/commit/dde2a2dc01f3948db801da43cf5ebdfbcfea65f4))
* slide comparaison par section avec 6 modes d'affichage ([8ad5e6c](https://github.com/your-username/wrapparr/commit/8ad5e6c420ce5fb81d9e4627e2d62634cbd2d4dd))
* slide comparaison series + mode linechart (courbe mensuelle) ([d3c8e4a](https://github.com/your-username/wrapparr/commit/d3c8e4a1482e9472777a45f9bde43bcde78faeb8))
* slide finale avec mur d'affiches et services actifs uniquement ([8f5d234](https://github.com/your-username/wrapparr/commit/8f5d23487c0aebdfe2a9cfdbf669206e64b6ba54))
* slide notes — gauge plus grande, affiches agrandies, titre series ([1880639](https://github.com/your-username/wrapparr/commit/1880639e1c228737ede9b24e23c99b9bf1772215))
* slide notes cinema + enrichissement TMDB unifie ([45f315f](https://github.com/your-username/wrapparr/commit/45f315fe5054d7a53e97f6315fc60c6b9a62af20))
* slide onboarding — select theme, toggle musique, contenu films/series/communaute ([8bd44b1](https://github.com/your-username/wrapparr/commit/8bd44b185bff157456bac28f7b0eca4c905ef957))
* slide onboarding apres l'intro — presentation du recap ([762649b](https://github.com/your-username/wrapparr/commit/762649b5a849a5ce1c9bed7094939fa2285414bb))
* slide profil cinephile avec timeline et barres verticales ([7e03e9e](https://github.com/your-username/wrapparr/commit/7e03e9e6b7bcde444277235e925fd80cdf3dac35))
* slide stats enrichies + digest cinema + ameliorations visuelles ([9c315c5](https://github.com/your-username/wrapparr/commit/9c315c567672b389f5e1ec6f32c4b0d0a451657f))
* slide top 10 films les plus vus (section communaute) ([c48a8da](https://github.com/your-username/wrapparr/commit/c48a8da11321c1e5c2fda0faa57edd375efb4d9b))
* slide top 10 series les plus vues (section communaute) ([992158f](https://github.com/your-username/wrapparr/commit/992158f24025e879a4a7b60c1b62a016d44cd5ef))
* slide top populaire avec mur affiches + reveal podium anime ([8e5c417](https://github.com/your-username/wrapparr/commit/8e5c417d9ecd3bc88e701132bfe5026f8d918815)), closes [#3](https://github.com/your-username/wrapparr/issues/3) [#2](https://github.com/your-username/wrapparr/issues/2) [#1](https://github.com/your-username/wrapparr/issues/1)
* SSO OIDC complet — config admin, flux authorize/callback, boutons login ([7e03fbf](https://github.com/your-username/wrapparr/commit/7e03fbfd5eed2c61caa5384bf417073733c5ecdc))
* systeme de themes visuels complet avec effets dynamiques ([2844e63](https://github.com/your-username/wrapparr/commit/2844e63e534eeb2a0a40a0fe4c88d600ec8f6a95))
* systeme musique YouTube complet + config comparaison par defaut ([233190c](https://github.com/your-username/wrapparr/commit/233190c09d0426733ca700655c1e0e5142a681f6))
* tableau noir — phrases longues, paragraphes, listes multilignes ([d925ad1](https://github.com/your-username/wrapparr/commit/d925ad1bf9cb5c08210e4f0ccb415a6fc80595ec))
* tableau noir dynamique — ecritures canvas en continu ([b9ab932](https://github.com/your-username/wrapparr/commit/b9ab9329d76868187a51f5b1657e48f85232c072))
* tableau noir vivant — dessins d'enfant, phrases, brosse qui efface ([fbdaf5d](https://github.com/your-username/wrapparr/commit/fbdaf5d44495ec453bdc243586d35e95a1d462d4))
* titre et duree auto des musiques YouTube ([b4319f4](https://github.com/your-username/wrapparr/commit/b4319f4514dda1becc175b0cc0a0086273ae1390))
* TMDB comme service configurable dans l'admin ([e00b8e9](https://github.com/your-username/wrapparr/commit/e00b8e9c220f1da8ab6c5564579ea8034e93bad6))
* typing effect sur titres + terminal MUTHUR pour theme Weyland-Yutani ([7101334](https://github.com/your-username/wrapparr/commit/71013343cd7d99185b3e8fd657cae386cf879e6d))


### Bug Fixes

* admin voit tous les services, pas seulement les siens ([2361284](https://github.com/your-username/wrapparr/commit/23612845e30ee6e25e2f036f274800f65b7c03b9))
* agrandir la carte du monde sans deformer les proportions ([a9aafa8](https://github.com/your-username/wrapparr/commit/a9aafa87d162709d51accff62083a3fe414b2084))
* ajoute keyframes badge-shine manquant dans CommunitySlides ([4272441](https://github.com/your-username/wrapparr/commit/4272441ee78ebf1d7f48f65cf6e6ef24ed3fc3fa))
* alignement frise/axe X sur slide profil cinephile ([f1e5a30](https://github.com/your-username/wrapparr/commit/f1e5a3059b228f41015482edd3515919e0142e91))
* ameliorations slides profil cinema, notes et habitudes ([9ea1ede](https://github.com/your-username/wrapparr/commit/9ea1ede95f84c94ef6288615e8bb0fdabe2682e1))
* badges et surbrillance visibles pour tous les utilisateurs (isMe via uid) ([2032ea8](https://github.com/your-username/wrapparr/commit/2032ea8109cdfba59524dfec3276d899a65b3b11))
* badges toujours visibles + nettoyage logs debug ([e9a98f8](https://github.com/your-username/wrapparr/commit/e9a98f872eeb42258b16dc106d77830f1c80b787))
* barres LED alignees sur le titre section + lettres guirlande Indie Flower ([41e8e17](https://github.com/your-username/wrapparr/commit/41e8e17c1f78f4834b7deaac5f2f579bf6ecfbe0))
* barres LED positionnees autour du titre (50% - 60px / + 50px) ([6e4efcf](https://github.com/your-username/wrapparr/commit/6e4efcf03f9b89f5ffb84ef607c1dc55af5a08e1))
* barres LED rapprochees du titre, traits originaux caches, guirlande reduite ([d812e37](https://github.com/your-username/wrapparr/commit/d812e37408ed9e058548a3f44cdaca54fa83ec5c))
* barres LED uniquement sur les slides de section (CategorySlide) ([53b2f5b](https://github.com/your-username/wrapparr/commit/53b2f5b4d0e4a22cc7d6b5a966b0c41a1b85fddc))
* bilan slide — MiniStats plus epais, badge equiv meme taille que profil ([d5740ea](https://github.com/your-username/wrapparr/commit/d5740eafaa8d92e6cd313aa4983389f3ae067306))
* blocs plus opaques sur toutes les slides (comme slide finale) ([e7cd45d](https://github.com/your-username/wrapparr/commit/e7cd45dc943597d5e51124a3758ef6f572014086))
* bouton musique + soundbar colores avec accent quand actif ([4691230](https://github.com/your-username/wrapparr/commit/469123066cd01e86ebf81707ab61feca1ce9c758))
* breche dimensionnelle plus large et realiste ([4915f0b](https://github.com/your-username/wrapparr/commit/4915f0b5aa01130ff9fb27d2e945726a42f512ca))
* carte du monde avec vrais contours (react-simple-maps) ([67e0ff5](https://github.com/your-username/wrapparr/commit/67e0ff5bdf9a7ab12d0d0a0e4fd4e9c8ba8043c2))
* changement de theme depuis le recap applique aussi la palette associee ([8fcfb5a](https://github.com/your-username/wrapparr/commit/8fcfb5a3df6ca2f714769f27a311d81461f5d36f))
* classement sans decalage + detection user SSO dans communaute ([fe04540](https://github.com/your-username/wrapparr/commit/fe045407a3f77ac2365b6af85e69ddb2d1c1f825))
* classements communaute — memes dimensions que genres, badges shine ([c6ce6f9](https://github.com/your-username/wrapparr/commit/c6ce6f987970bbe0a3193bf15bb506c533cc11d4))
* cleanup share debug log, note HTTPS required for native share ([a32fc04](https://github.com/your-username/wrapparr/commit/a32fc049d10ba1e423547410e045501bd1cb718d))
* collecte uniquement pour les utilisateurs mappes ([523c9e0](https://github.com/your-username/wrapparr/commit/523c9e0b3c86bfdc6d220042215af343fa9e2acd))
* communaute slide — graphiques plus hauts, peak stats uniformises ([f6bdcf1](https://github.com/your-username/wrapparr/commit/f6bdcf135a02c85e2ac0a4fe6c4035e735542bfe))
* comparison data ajoutee a la racine du recap pour la section communaute ([bf65870](https://github.com/your-username/wrapparr/commit/bf65870445a79ace80b8e126d1eadefdf774c321))
* couleurs slides derivees du theme + palettes distinctes ([b379c7e](https://github.com/your-username/wrapparr/commit/b379c7e87f5c3bcf75ac478254e4b24aea21024a))
* detection utilisateur courant par uid ET par nom (case-insensitive) ([2ae9ac7](https://github.com/your-username/wrapparr/commit/2ae9ac79c8c44e6a7b4677c1e481a8afbc3f246c))
* differencier donnees et vocabulaire films vs series dans les slides ([57afa66](https://github.com/your-username/wrapparr/commit/57afa66f84d7d28cd554f04e0d114816be782d73))
* guirlande avec scintillement doux et lettres lisibles ([b866f0e](https://github.com/your-username/wrapparr/commit/b866f0e7140c4a2b54585a8ed88069872612c607))
* guirlande ecrit des mots, faille plus rouge, typo Stranger Things, PARR sans bloc orange ([09545f2](https://github.com/your-username/wrapparr/commit/09545f200933c550a63fcb6d8a40a969be8add69))
* import manquant YearlyRecap dans recaps.py ([70f6acf](https://github.com/your-username/wrapparr/commit/70f6acfb96896ac67133c8f7a4647e42ca79af5f))
* keyframes injectes globalement au chargement du module ([a35b419](https://github.com/your-username/wrapparr/commit/a35b4196e50b76244e42d892f740174f0c2d72d0))
* label timeline en dessous, ordre slides corrige, fleches reorder ([5bf3de8](https://github.com/your-username/wrapparr/commit/5bf3de81e21a6b9d68fd4e4a23a5006ee003bdf6))
* logo texte centre (HTML inline au lieu de SVG externe) ([7de1b70](https://github.com/your-username/wrapparr/commit/7de1b70626f73eb4e9e180ffb5aa37bbdff51568))
* mur affiches et vignette en arriere-plan des projecteurs (zIndex -2/-1) ([498a344](https://github.com/your-username/wrapparr/commit/498a344577729420853114a7c365855c6f8ed7a5))
* musicPlaying synchronise au demarrage auto du son ([f4a8c63](https://github.com/your-username/wrapparr/commit/f4a8c632a5869c9734bcfa405ac5644bd9d45ad1))
* ordre des slides — bilan cinema en fin de section + ordre sauvegarde applique ([a2ea2fa](https://github.com/your-username/wrapparr/commit/a2ea2fa18d2c5083e669ea8d237a5a3135287dee))
* ordre slides respecte le registre par defaut ([4a25b72](https://github.com/your-username/wrapparr/commit/4a25b72bfea44ee75c9cd0cca2bf90e7b215d5d4))
* palette Nostromo — series bleu, communaute rouge, films jaune ([fa7ef61](https://github.com/your-username/wrapparr/commit/fa7ef61455a0451cb3f2dad643fdeadb6f4f2997))
* palette Sin City — communaute en vert ([91450ec](https://github.com/your-username/wrapparr/commit/91450ec851c336264e5b1a31f84b093b33da3dfd))
* palette Sin City — rouge, jaune, vert sur fond noir ([31c65b2](https://github.com/your-username/wrapparr/commit/31c65b24044cdbe06b15ef7071fd61151fb38c8d))
* palette Weyland-Yutani avec couleurs Nostromo (jaune, vert, bleu, rouge) ([2b9bfa7](https://github.com/your-username/wrapparr/commit/2b9bfa75026e34d4345e3d459e462b5fbc04bf4a))
* profil cinephile — graphique plus haut, affiches plus grandes ([7d7096f](https://github.com/your-username/wrapparr/commit/7d7096f1c5e63dedff4dde5ea87512647c3a6cac))
* projecteurs devant le mur d'affiches sur slides top communaute ([8f459d8](https://github.com/your-username/wrapparr/commit/8f459d8dc31ca281f9a4d2be3fe9613a31c4117f))
* refonte classements communaute — style barres comme genres ([51418b6](https://github.com/your-username/wrapparr/commit/51418b6d302a81e2d50776790fa5532451dcad78))
* reordonne slides communaute + refonte classements + fix zero series ([3156ead](https://github.com/your-username/wrapparr/commit/3156ead4a0416231a99f348b26ba1cdba872ecc2))
* retire animation shine des barres classement, garde uniquement sur badges ([56296cb](https://github.com/your-username/wrapparr/commit/56296cba43db9bc183036892d430035ed7c12366))
* securite SSO token + bouton partager natif ([b9a94b0](https://github.com/your-username/wrapparr/commit/b9a94b0d5adadb2b55e194b64b20ca10e627ee04))
* series les plus vues affiche episodes (ep.) au lieu de vues ([9961a8d](https://github.com/your-username/wrapparr/commit/9961a8d777d7526d0094bf929659aeaa1eb27be0))
* simplification slides films — suppression doublons ([c594749](https://github.com/your-username/wrapparr/commit/c59474969b3ac7537f91394ac92f96908fdc2e1a))
* simplifie matching user communaute — recherche uid unique en amont ([f516df8](https://github.com/your-username/wrapparr/commit/f516df8e106496b5833af95cbe21ea85ad4d8b82))
* slide onboarding visible + desactivable dans gestion slides ([064fdbf](https://github.com/your-username/wrapparr/commit/064fdbf7a880f82537641534f4c2eaf0ca7b2950))
* slide quand tu consommes — peak stats uniformises avec clamp() ([a12e305](https://github.com/your-username/wrapparr/commit/a12e3054212e9f03ece111e932ed29a345ab8118))
* SlideManager affiche toutes les slides pour tous les admins ([01405ab](https://github.com/your-username/wrapparr/commit/01405ab8e67cc9ba4631eb75ea1e5a3004d90fdb))
* slides comparaison communaute (donnees par media, genres en badges, tops) ([70689cf](https://github.com/your-username/wrapparr/commit/70689cf0662998c1940189c72693987c65ba33a5))
* suppression blocs podium resultat course genres + badges numeriques ([de537ff](https://github.com/your-username/wrapparr/commit/de537ff11463ad0c875a6748143a26037cedbc76))
* suppression code duplique ChalkboardBg (erreur parsing) ([a70cf76](https://github.com/your-username/wrapparr/commit/a70cf764e5263f614e665dbb02d609162fc6e3a5))
* suppression defaults secrets dans docker-compose (force .env) ([8334853](https://github.com/your-username/wrapparr/commit/8334853c7ab9af087f4a9bc3adb40558b343b488))
* suppression des 3 badges hints sous le bouton Decouvrir ([fd44cab](https://github.com/your-username/wrapparr/commit/fd44cab05b4929652bc109da94cf2ef2f163b2cb))
* suppression mapping envoie string vide au lieu de supprimer la cle ([cd5ae86](https://github.com/your-username/wrapparr/commit/cd5ae86fb6feb69b0af70e1fb1b88e82f4026c58))
* supprime pluie de pieces sur budget + meme effet flip sur realisateurs ([80979c8](https://github.com/your-username/wrapparr/commit/80979c854487c14a1272c3f5501122a891c917fd))
* surbrillance utilisateur visible + badges visibles dans classements ([ee1f2ab](https://github.com/your-username/wrapparr/commit/ee1f2ab36e09c68f2b107b143184ff7391d198b6))
* tableau noir — blocs glass plus opaques et blur pour lisibilite ([9325ea3](https://github.com/your-username/wrapparr/commit/9325ea3aca8ecb9e46e1cd1801b0dee018dc4938))
* tableau noir — blur sur badges et blocs avec border-radius ([c6af7de](https://github.com/your-username/wrapparr/commit/c6af7decf9539b1d7059b0ae8d72c12d31d808bf))
* tableau noir — blur uniquement sur .glass, pas sur tout l'ecran ([7243d19](https://github.com/your-username/wrapparr/commit/7243d1906cf1e3a90c585abdf3fd5917fc977ed5))
* tableau noir brosse seule + ecritures fond, neige douce + etoiles magiques, VHS texte ([10f63cf](https://github.com/your-username/wrapparr/commit/10f63cfa0b4ff88b78b9f25a22443504301ea3a2)), closes [#ffcc44](https://github.com/your-username/wrapparr/issues/ffcc44)
* tampon approuve plus gros, plus bas, tourne a droite ([d303aef](https://github.com/your-username/wrapparr/commit/d303aef71cd2d5d7675321a17411f8d6de755b7b))
* tampon rotation corrigee (22deg droite) + position plus haute (12%) ([a313af4](https://github.com/your-username/wrapparr/commit/a313af41dcf490bcaceab41cc9e1c15027d2b994))
* theme global admin pour tous les users + debug matching communaute ([bd872d1](https://github.com/your-username/wrapparr/commit/bd872d127e1326210c31445bd350f52b5291a0be))
* toggle comparaison double-clic — retire onToggle du Toggle enfant ([5e6b00a](https://github.com/your-username/wrapparr/commit/5e6b00adaadd918360ee24fea07a7393f0ea944e))
* uniformisation barres budget avec barres notes (18px/16px) ([1121923](https://github.com/your-username/wrapparr/commit/112192381967b9cc07259826ec061252b4c6514f))
* uniformisation boutons top-right (padding, icones, fontSize identiques) ([ee5880f](https://github.com/your-username/wrapparr/commit/ee5880f4978342db5573c22bb771d257b86dfe6e))
* update user accepte body JSON au lieu de query params ([1842992](https://github.com/your-username/wrapparr/commit/1842992241fac65f5679d122372d37376aa0bc20))
* vignette allegee — bords seulement, ne couvre plus les projecteurs ([faf6a76](https://github.com/your-username/wrapparr/commit/faf6a76476158a594307026265cb629880344148))
* WorldMapSlide titre adapte films/series ([11aa6a2](https://github.com/your-username/wrapparr/commit/11aa6a20d580eccef07c8693ff9684872f25d22b))


### Refactoring

* reorganisation projet structure ghostarr ([4d46937](https://github.com/your-username/wrapparr/commit/4d469377a2450905f1c4d19bd3d7717da8c29bfa))

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
