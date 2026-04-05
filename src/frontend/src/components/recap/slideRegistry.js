/**
 * Slide Registry — single source of truth for all slides.
 * Each slide declares its id, label, params, and whether it's locked/category/etc.
 * The SlideManager reads this to build the config UI.
 * The RecapPlayer reads this to know what params each slide accepts.
 */

export const SLIDE_REGISTRY = [
  {
    id: "intro", label: "Introduction", group: "global", locked: true,
    desc: "Écran d'accueil avec le titre WRAPPARR",
    params: [],
  },
  {
    id: "onboarding", label: "Présentation", group: "global",
    desc: "Nombre de slides, services, paramètres rapides, navigation",
    params: [],
  },
  // Per-service slides — generated dynamically per service, but these define the templates
  {
    id: "cat-{service}", label: "Séparation de section", group: "service", cat: true,
    desc: "Slide d'annonce plein écran de la catégorie",
    // defaults are resolved per-service in expandRegistry
    params: [
      { key: "customIcon", label: "Icône (emoji)", type: "text", default: "" },
      { key: "customLabel", label: "Titre", type: "text", default: "" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "" },
    ],
    _defaults: {
      tautulli: { customIcon: "🎬", customLabel: "FILMS", customSub: "Cinéma · Documentaires" },
      plex: { customIcon: "🎬", customLabel: "FILMS", customSub: "Cinéma · Documentaires" },
      jellyfin: { customIcon: "📺", customLabel: "JELLYFIN", customSub: "Films · Séries" },
      romm: { customIcon: "🎮", customLabel: "JEUX VIDÉO", customSub: "Switch · PC · Retrogaming" },
      audiobookshelf: { customIcon: "🎧", customLabel: "LIVRES AUDIO", customSub: "Sci-Fi · Thriller · Post-Apo" },
      komga: { customIcon: "📚", customLabel: "MANGA", customSub: "Shonen · Seinen · Dark Fantasy" },
      booklore: { customIcon: "📖", customLabel: "LIVRES", customSub: "Romans · Essais · BD" },
    },
  },
  {
    id: "{service}-pod", label: "Top 3", group: "service", pod: true,
    desc: "Top 3 avec reveal animé, jokes, et backdrop",
    params: [
      { key: "phaseWait", label: "Attente avant jokes (ms)", type: "number", default: 1800 },
      { key: "jokeDuration", label: "Durée par joke (ms)", type: "number", default: 1800 },
      { key: "jokeTransition", label: "Transition entre jokes (ms)", type: "number", default: 350 },
      { key: "reveal1", label: "Délai reveal #3 (ms)", type: "number", default: 400 },
      { key: "reveal2", label: "Délai reveal #2 (ms)", type: "number", default: 1100 },
      { key: "reveal3", label: "Délai reveal #1 (ms)", type: "number", default: 2000 },
      { key: "jokes", label: "Phrases de présentation", type: "phrases", default: [] },
    ],
    _defaults: {
      tautulli: { jokes: ["Voyons combien de films cette année...", "Les popcorns étaient au rendez-vous.", "Il a ri, pleuré, et probablement mangé des chips.", "Voici le podium officiel"] },
      plex: { jokes: ["Voyons combien de films cette année...", "Les popcorns étaient au rendez-vous.", "Il a ri, pleuré, et probablement mangé des chips.", "Voici le podium officiel"] },
      jellyfin: { jokes: ["Jellyfin a tourné à plein régime cette année...", "Des heures de streaming en continu.", "Le serveur n'a pas chômé.", "Le verdict tombe"] },
      romm: { jokes: ["Les manettes ont chauffé cette année...", "Des sessions épiques en perspective.", "Les voisins ont entendu les victoires.", "Voici le top du gamepad"] },
      audiobookshelf: { jokes: ["Des heures d'écoute cette année...", "Principalement en mode concentration.", "Le cerveau a voyagé dans des univers différents.", "Le palmarès s'affiche"] },
      komga: { jokes: ["Des volumes de manga lus cette année.", "Plusieurs volumes par mois. Respect.", "Au moins 4 arcs qui font pleurer.", "Le podium des cases s'illumine"] },
      booklore: { jokes: ["Des livres dévorés cette année...", "La bibliothèque s'agrandit.", "Des histoires qui marquent.", "Le palmarès littéraire"] },
    },
  },
  {
    id: "{service}-stats", label: "Statistiques", group: "service",
    desc: "Données détaillées : top items, genres, graphe mensuel",
    params: [
      { key: "showTop", label: "Nombre d'items top", type: "number", default: 4 },
      { key: "showGenres", label: "Afficher genres", type: "bool", default: true },
      { key: "showMonthly", label: "Afficher graphe mensuel", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-stats-enriched", label: "Bilan cinéma", group: "service", onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Bilan films : top films, donut genres, profil cinéphile, temps équivalent, affiches",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Approuvé" },
      { key: "categories", label: "Catégories fun (par heures)", type: "profiles", default: [
        { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
        { min: 20, max: 50, name: "Cinéphile du dimanche", desc: "Tu aimes bien te poser devant un film", emoji: "🛋️" },
        { min: 50, max: 100, name: "Accro du cinéma", desc: "Les salles obscures n'ont plus de secrets", emoji: "🎬" },
        { min: 100, max: 200, name: "Machine à films", desc: "Tu enchaînes les films sans relâche", emoji: "🤖" },
        { min: 200, max: 500, name: "Marathonien suprême", desc: "Tu vis et respires cinéma", emoji: "🏆" },
        { min: 500, max: 99999, name: "Légende vivante", desc: "Tu as probablement vu plus de films que Spielberg", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-deep", label: "Stats et habitudes", group: "service",
    desc: "Horaires, jours préférés, classement",
    params: [
      { key: "showDayChart", label: "Afficher jours", type: "bool", default: true },
      { key: "showTimeChart", label: "Afficher heures", type: "bool", default: true },
      { key: "showRanking", label: "Afficher classement", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-budgets", label: "Budgets", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des budgets des films vus",
    params: [
      { key: "displayMode", label: "Mode d'affichage distribution", type: "select", default: "bars", options: [
        { value: "bars", label: "Barres horizontales" },
        { value: "linechart", label: "Courbe avec moyenne" },
      ]},
    ],
  },
  {
    id: "{service}-timeline", label: "Profil cinéphile", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des années de sortie — quel type de spectateur es-tu ?",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 8000 },
      { key: "profiles", label: "Profils cinéphiles", type: "profiles", default: [
        { min: 1900, max: 1949, name: "Cinéphile classique", desc: "Tes films datent de l'âge d'or du cinéma", emoji: "🎩" },
        { min: 1950, max: 1979, name: "Nostalgique", desc: "Tu adores les grandes fresques et le cinéma d'auteur", emoji: "📽️" },
        { min: 1980, max: 1999, name: "Enfant des 80s-90s", desc: "Action, aventure, et blockbusters — ton époque", emoji: "📼" },
        { min: 2000, max: 2014, name: "Millenial", desc: "Tu as grandi avec les franchises et le cinéma numérique", emoji: "🎬" },
        { min: 2015, max: 2030, name: "Ultra-moderne", desc: "Toujours à la pointe, tu regardes les sorties récentes", emoji: "🚀" },
      ]},
    ],
  },
  {
    id: "{service}-worldmap", label: "Carte du monde", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Pays d'origine des films vus",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 15000 },
    ],
  },
  {
    id: "{service}-ratings", label: "Notes et évaluations", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Moyenne des notes et distribution par tranches",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 10000 },
      { key: "brackets", label: "Tranches de notes", type: "profiles", default: [
        { min: 0, max: 4, name: "Navet", desc: "Films mal notés", emoji: "🥬" },
        { min: 4, max: 6, name: "Passable", desc: "Notes moyennes-basses", emoji: "😐" },
        { min: 6, max: 7, name: "Bon", desc: "Bons films", emoji: "👍" },
        { min: 7, max: 8, name: "Très bon", desc: "Films très bien notés", emoji: "🎬" },
        { min: 8, max: 10, name: "Excellent", desc: "Les pépites", emoji: "🏆" },
      ]},
    ],
  },
  {
    id: "{service}-actors", label: "Acteurs favoris", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Acteurs les plus présents dans tes films",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max d'acteurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-directors", label: "Réalisateurs favoris", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Réalisateurs les plus présents dans tes films",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max de réalisateurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-genres", label: "Genres favoris", group: "service",
    desc: "Visualisation des genres les plus consommés",
    params: [
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "race", options: [
        { value: "race", label: "Course" },
        { value: "bubbles", label: "Bulles" },
        { value: "orbit", label: "Orbite" },
        { value: "podium", label: "Podium classique" },
      ]},
      { key: "maxGenres", label: "Nombre de genres affichés", type: "number", default: 6 },
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 25000 },
      { key: "commentaryEnabled", label: "Commentaires en direct", type: "bool", default: true, showWhen: { key: "displayMode", value: "race" } },
      { key: "raceCommentary", label: "Phrases de commentaire", type: "commentary", showWhen: { key: "displayMode", value: "race" }, default: [
        { trigger: "start", label: "Départ", phrases: ["C'est parti !", "Les genres s'élancent !", "Et c'est le départ !"] },
        { trigger: "leader_change", label: "Changement leader", phrases: ["{name} prend la tête !", "{name} dépasse tout le monde !", "Incroyable, {name} passe devant !"], vars: ["{name}"] },
        { trigger: "last_place", label: "Dernier", phrases: ["{name} bon dernier... ça m'étonne pas", "{name} ferme la marche, courage !", "Aïe, {name} est largué"], vars: ["{name}"] },
        { trigger: "close_race", label: "Course serrée", phrases: ["C'est serré entre {name1} et {name2} !", "Photo finish entre {name1} et {name2} ?"], vars: ["{name1}", "{name2}"] },
        { trigger: "mid_race", label: "Mi-course", phrases: ["La course bat son plein !", "Tout peut encore changer !", "Qui va l'emporter ?"] },
        { trigger: "near_end", label: "Fin de course", phrases: ["Dernière ligne droite !", "On approche de la fin...", "Les jeux sont presque faits !"] },
      ]},
    ],
  },
  {
    id: "{service}-compare", label: "Comparaison annuelle", group: "service",
    desc: "Comparaison avec l'année précédente ou les autres utilisateurs",
    params: [
      { key: "compareMode", label: "Mode de comparaison", type: "select", default: "year_vs_year", options: [
        { value: "year_vs_year", label: "Année vs Année" },
        { value: "user_vs_users", label: "Toi vs les autres" },
      ]},
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "horizontal_bars", options: [
        { value: "horizontal_bars", label: "Barres horizontales" },
        { value: "vertical_bars", label: "Barres verticales" },
        { value: "donut", label: "Cercle / Donut" },
        { value: "radar", label: "Radar" },
        { value: "race", label: "Course animée" },
        { value: "gauge", label: "Jauge" },
        { value: "linechart", label: "Courbe mensuelle" },
      ]},
      { key: "dataMetric", label: "Donnée à comparer", type: "select", default: "total_items", options: [
        { value: "total_items", label: "Nombre total" },
        { value: "total_hours", label: "Heures totales" },
        { value: "genres", label: "Top genres" },
        { value: "monthly", label: "Activité mensuelle" },
      ]},
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
    ],
  },

  // ── Interactive slides (per service) ──
  {
    id: "{service}-thisorthat", label: "This or That", group: "service", interactive: true,
    desc: "Quiz interactif : devinez entre deux choix lequel domine",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-estimation", label: "A ton avis ?", group: "service", interactive: true,
    desc: "Estimez vos stats avant de découvrir la réalité (curseur interactif)",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },

  // ── Series-specific slides (for services that have separate series data) ──
  {
    id: "cat-{service}-series", label: "Annonce séries {service}", group: "service", cat: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Slide d'annonce plein écran de la section séries",
    params: [
      { key: "customIcon", label: "Icône (emoji)", type: "text", default: "📺" },
      { key: "customLabel", label: "Titre", type: "text", default: "SÉRIES" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "Séries TV · Sagas" },
    ],
  },
  {
    id: "{service}-series-pod", label: "Top 3", group: "service", pod: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Top séries avec reveal animé",
    params: [
      { key: "phaseWait", label: "Attente avant jokes (ms)", type: "number", default: 1800 },
      { key: "jokeDuration", label: "Durée par joke (ms)", type: "number", default: 1800 },
      { key: "jokeTransition", label: "Transition entre jokes (ms)", type: "number", default: 350 },
      { key: "reveal1", label: "Délai reveal #3 (ms)", type: "number", default: 400 },
      { key: "reveal2", label: "Délai reveal #2 (ms)", type: "number", default: 1100 },
      { key: "reveal3", label: "Délai reveal #1 (ms)", type: "number", default: 2000 },
      { key: "jokes", label: "Phrases de présentation", type: "phrases", default: ["Voyons quelles séries t'ont accroché...", "Des épisodes enchaînés sans fin.", "Le binge-watching, un art de vivre.", "Voici ton podium séries"] },
    ],
  },
  {
    id: "{service}-series-stats-enriched", label: "Bilan series", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Stats séries enrichies : donut genres, acteurs, records, affiches",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Approuvé" },
      { key: "categories", label: "Catégories fun (par heures)", type: "profiles", default: [
        { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
        { min: 20, max: 50, name: "Binge watcher débutant", desc: "Tu enchaînes quelques épisodes", emoji: "🛋️" },
        { min: 50, max: 100, name: "Accro aux séries", desc: "Tu ne peux plus t'arrêter", emoji: "📺" },
        { min: 100, max: 200, name: "Machine à épisodes", desc: "Les saisons défilent sous tes yeux", emoji: "🤖" },
        { min: 200, max: 500, name: "Marathonien des séries", desc: "Tu vis et respires séries", emoji: "🏆" },
        { min: 500, max: 99999, name: "Légende du binge", desc: "Tu as probablement vu plus de séries que Netflix", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-series-deep", label: "Stats et habitudes", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Quand tu regardes tes séries : jour, heure, mois record",
    params: [],
  },
  {
    id: "{service}-series-timeline", label: "Profil sériephile {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des années de sortie des séries vues",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 8000 },
    ],
  },
  {
    id: "{service}-series-worldmap", label: "Carte du monde", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Pays d'origine des séries vues",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 15000 },
    ],
  },
  {
    id: "{service}-series-ratings", label: "Notes et évaluations", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Moyenne des notes et distribution des séries",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 10000 },
    ],
  },
  {
    id: "{service}-series-directors", label: "Réalisateurs favoris", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Réalisateurs les plus présents dans tes séries",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max de réalisateurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-series-genres", label: "Genres favoris", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Genres les plus regardés en séries",
    params: [
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "race", options: [
        { value: "race", label: "Course" },
        { value: "bubbles", label: "Bulles" },
        { value: "orbit", label: "Orbite" },
        { value: "podium", label: "Podium classique" },
      ]},
      { key: "maxGenres", label: "Nombre de genres affichés", type: "number", default: 6 },
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 25000 },
      { key: "commentaryEnabled", label: "Commentaires en direct", type: "bool", default: true, showWhen: { key: "displayMode", value: "race" } },
      { key: "raceCommentary", label: "Phrases de commentaire", type: "commentary", showWhen: { key: "displayMode", value: "race" }, default: [
        { trigger: "start", label: "Départ", phrases: ["C'est parti !", "Les genres s'élancent !", "Et c'est le départ !"] },
        { trigger: "leader_change", label: "Changement leader", phrases: ["{name} prend la tête !", "{name} dépasse tout le monde !", "Incroyable, {name} passe devant !"], vars: ["{name}"] },
        { trigger: "last_place", label: "Dernier", phrases: ["{name} bon dernier...", "{name} ferme la marche, courage !"], vars: ["{name}"] },
        { trigger: "close_race", label: "Course serrée", phrases: ["C'est serré entre {name1} et {name2} !"], vars: ["{name1}", "{name2}"] },
        { trigger: "mid_race", label: "Mi-course", phrases: ["La course bat son plein !", "Tout peut encore changer !"] },
        { trigger: "near_end", label: "Fin de course", phrases: ["Dernière ligne droite !", "Les jeux sont presque faits !"] },
      ]},
    ],
  },
  {
    id: "{service}-series-actors", label: "Acteurs favoris", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Acteurs les plus vus dans tes séries",
    params: [
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max d'acteurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-series-compare", label: "Comparaison annuelle", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Comparaison séries avec l'année précédente",
    params: [
      { key: "compareMode", label: "Mode de comparaison", type: "select", default: "year_vs_year", options: [
        { value: "year_vs_year", label: "Année vs Année" },
        { value: "user_vs_users", label: "Toi vs les autres" },
      ]},
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "linechart", options: [
        { value: "horizontal_bars", label: "Barres horizontales" },
        { value: "vertical_bars", label: "Barres verticales" },
        { value: "donut", label: "Cercle / Donut" },
        { value: "radar", label: "Radar" },
        { value: "race", label: "Course animée" },
        { value: "gauge", label: "Jauge" },
        { value: "linechart", label: "Courbe mensuelle" },
      ]},
      { key: "dataMetric", label: "Donnée à comparer", type: "select", default: "monthly", options: [
        { value: "total_items", label: "Nombre total" },
        { value: "total_hours", label: "Heures totales" },
        { value: "genres", label: "Top genres" },
        { value: "monthly", label: "Activité mensuelle" },
      ]},
      { key: "animationSpeed", label: "Durée animation (ms)", type: "number", default: 12000 },
    ],
  },

  // ── Interactive slides (series) ──
  {
    id: "{service}-series-thisorthat", label: "This or That (series)", group: "service", interactive: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Quiz interactif séries : devinez entre deux choix",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-series-estimation", label: "A ton avis ? (series)", group: "service", interactive: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Estimez vos stats séries avant de découvrir la réalité",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },

  // Community slides
  {
    id: "cat-community", label: "Séparation de section", group: "global", cat: true,
    desc: "Slide d'annonce de la section comparaison entre utilisateurs",
    params: [
      { key: "customIcon", label: "Icône (emoji)", type: "text", default: "👥" },
      { key: "customLabel", label: "Titre", type: "text", default: "COMMUNAUTÉ" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "Comparaison entre utilisateurs" },
    ],
  },
  {
    id: "community-mostviewed-films", label: "Top vus (films)", group: "global",
    desc: "Top 10 films par nombre de vues avec détails par utilisateur",
    params: [],
  },
  {
    id: "community-activity-films", label: "Activité (films)", group: "global",
    desc: "Activité mensuelle de tous les utilisateurs superposée — films",
    params: [],
  },
  {
    id: "community-top-films", label: "Top populaires (films)", group: "global",
    desc: "Films les plus vus par la communauté avec affiches et détails",
    params: [],
  },
  {
    id: "community-rankings-films", label: "Classement (films)", group: "global",
    desc: "Classement des utilisateurs en nombre de vues et heures — films",
    params: [],
  },
  {
    id: "community-genres-films", label: "Genres (films)", group: "global",
    desc: "Genres préférés de la communauté avec classement — films",
    params: [],
  },
  {
    id: "community-mostviewed-series", label: "Top vues (series)", group: "global",
    desc: "Top 10 séries par nombre de vues avec détails par utilisateur",
    params: [],
  },
  {
    id: "community-activity-series", label: "Activité (séries)", group: "global",
    desc: "Activité mensuelle de tous les utilisateurs superposée — series",
    params: [],
  },
  {
    id: "community-top-series", label: "Top populaires (series)", group: "global",
    desc: "Series les plus vues par la communauté avec affiches et détails",
    params: [],
  },
  {
    id: "community-rankings-series", label: "Classement (series)", group: "global",
    desc: "Classement des utilisateurs en nombre de vues et heures — series",
    params: [],
  },
  {
    id: "community-genres-series", label: "Genres (series)", group: "global",
    desc: "Genres préférés de la communauté avec classement — series",
    params: [],
  },

  {
    id: "community-compare-films", label: "Comparaison (films)", group: "global",
    desc: "Comparaison films avec l'année précédente : activité, genres, totaux",
    params: [],
  },
  {
    id: "community-compare-series", label: "Comparaison (series)", group: "global",
    desc: "Comparaison séries avec l'année précédente : activité, genres, totaux",
    params: [],
  },

  // Audiobookshelf-specific slides
  {
    id: "{service}-bilan", label: "Bilan écoute", group: "service", onlyFor: ["audiobookshelf"],
    desc: "Bilan annuel : livres écoutés, temps, profil auditeur, genres, top livres",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Écouté" },
      { key: "categories", label: "Profils auditeur (par heures)", type: "profiles", default: [
        { min: 0, max: 1, name: "Curieux débutant", desc: "Tu as effleuré le monde des livres audio", emoji: "👂" },
        { min: 1, max: 10, name: "Auditeur occasionnel", desc: "Tu écoutes de temps en temps", emoji: "🎧" },
        { min: 10, max: 30, name: "Lecteur régulier", desc: "Les livres audio font partie de ton quotidien", emoji: "📖" },
        { min: 30, max: 80, name: "Dévoreur de livres", desc: "Tu enchaînes les chapitres sans relâche", emoji: "📚" },
        { min: 80, max: 200, name: "Marathonien littéraire", desc: "Tu vis et respires livres audio", emoji: "🏆" },
        { min: 200, max: 99999, name: "Légende de l'écoute", desc: "Tu as probablement écouté plus que ton narrateur préféré", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-favorites", label: "Auteurs et narrateurs", group: "service", onlyFor: ["audiobookshelf"],
    desc: "Classement des auteurs et narrateurs les plus écoutés",
    params: [],
  },

  // Grimmory-specific slides (reading + listening)
  {
    id: "{service}-bilan", label: "Bilan lecture", group: "service", onlyFor: ["grimmory"],
    desc: "Bilan annuel : livres lus, temps, profil lecteur, genres, top livres",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Lu" },
      { key: "categories", label: "Profils lecteur (par heures)", type: "profiles", default: [
        { min: 0, max: 5, name: "Lecteur curieux", desc: "Tu commences à découvrir la lecture", emoji: "📖" },
        { min: 5, max: 20, name: "Lecteur régulier", desc: "La lecture fait partie de ton quotidien", emoji: "📚" },
        { min: 20, max: 50, name: "Dévoreur de livres", desc: "Tu enchaînes les chapitres sans relâche", emoji: "🔥" },
        { min: 50, max: 100, name: "Rat de bibliothèque", desc: "Les librairies n'ont plus de secrets", emoji: "🐀" },
        { min: 100, max: 300, name: "Marathonien littéraire", desc: "Tu vis et respires lecture", emoji: "🏆" },
        { min: 300, max: 99999, name: "Légende de la lecture", desc: "Tu as probablement lu plus que ton auteur préféré", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-favorites", label: "Auteurs favoris", group: "service", onlyFor: ["grimmory"],
    desc: "Classement des auteurs les plus lus par temps de lecture",
    params: [],
  },
  {
    id: "{service}-streak", label: "Streak de lecture", group: "service", onlyFor: ["grimmory"],
    desc: "Streak actuel, record personnel, jours de lecture sur l'année",
    params: [],
  },
  {
    id: "{service}-page-turners", label: "Livres addictifs", group: "service", onlyFor: ["grimmory"],
    desc: "Les livres que tu n'as pas pu lâcher (score d'engagement)",
    params: [],
  },

  // Overseerr slides (shown only if service configured)
  {
    id: "cat-overseerr", label: "Séparation de section", group: "global", cat: true,
    desc: "Slide d'annonce de la section demandes Overseerr",
    params: [
      { key: "customIcon", label: "Icône (emoji)", type: "text", default: "📋" },
      { key: "customLabel", label: "Titre", type: "text", default: "DEMANDES" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "Overseerr · Requêtes media" },
    ],
  },
  {
    id: "overseerr-requests", label: "Bilan des demandes", group: "global",
    desc: "Nombre de demandes, répartition films/séries, statuts, courbe mensuelle avec comparaison",
    params: [],
  },
  {
    id: "overseerr-match", label: "Demandes vs regarde", group: "global",
    desc: "Match entre les demandes et ce qui a été regardé, avec profil demandeur",
    params: [
      { key: "categories", label: "Profils demandeur (par % de match)", type: "profiles", default: [
        { min: 0, max: 15, name: "Collectionneur fantôme", desc: "Tu demandes mais tu ne regardes pas", emoji: "👻" },
        { min: 15, max: 35, name: "Demandeur distrait", desc: "Ta wishlist déborde un peu", emoji: "🫣" },
        { min: 35, max: 55, name: "Demandeur équilibré", desc: "Tu regardes une bonne partie de tes demandes", emoji: "⚖️" },
        { min: 55, max: 75, name: "Demandeur assidu", desc: "Tu honores la plupart de tes demandes", emoji: "🎯" },
        { min: 75, max: 90, name: "Demandeur exemplaire", desc: "Presque tout est regardé", emoji: "🏅" },
        { min: 90, max: 101, name: "Demandeur parfait", desc: "Tu regardes tout ce que tu demandes", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "overseerr-popular", label: "Demandes à succès", group: "global",
    desc: "Demandes de l'utilisateur les plus vues par la communauté",
    params: [],
  },
  {
    id: "overseerr-community", label: "Top demandeurs", group: "global",
    desc: "Classement des plus gros demandeurs du serveur",
    params: [],
  },

  // ── Interactive slides (overseerr) ──
  {
    id: "overseerr-estimation", label: "A ton avis ? (demandes)", group: "global", interactive: true,
    desc: "Estimez vos stats demandes avant de découvrir la réalité",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },
  // ── Interactive slides (community) ──
  {
    id: "community-thisorthat", label: "This or That (communauté)", group: "global", interactive: true,
    desc: "Quiz interactif communauté : devinez qui regarde le plus",
    params: [
      { key: "enabled", label: "Activer la slide", type: "bool", default: true },
    ],
  },

  // Global slides
  {
    id: "compare", label: "Comparaison globale", group: "global",
    desc: "Année en cours vs année précédente",
    params: [],
  },
  {
    id: "ranking", label: "Classement (ancien)", group: "global",
    desc: "Ancien classement — désactiver",
    params: [],
  },
  {
    id: "classement-serveur", label: "Classement serveur", group: "global",
    desc: "Classement cumulé depuis le début avec badges de progression",
    params: [],
  },
  {
    id: "finale", label: "Finale", group: "global", locked: true,
    desc: "Écran final avec recap global et feux d'artifice",
    params: [
      { key: "confetti", label: "Confettis", type: "bool", default: true },
      { key: "fireworks", label: "Feux d'artifice", type: "bool", default: true },
    ],
  },
]

/**
 * Expand registry templates for actual services present in recap data.
 * Returns concrete slide definitions with resolved ids.
 */
export function expandRegistry(dataServices = []) {
  const expanded = []
  const serviceTemplates = SLIDE_REGISTRY.filter((s) => s.group === "service")
  const globalBefore = SLIDE_REGISTRY.filter((s) => s.group === "global" && (s.id === "intro" || s.id === "onboarding"))
  const globalAfter = SLIDE_REGISTRY.filter((s) => s.group === "global" && s.id !== "intro" && s.id !== "onboarding")

  // 1. Global slides first (intro, overview)
  for (const tmpl of globalBefore) {
    expanded.push({ ...tmpl })
  }

  // 2. Per service — all slides for service1, then all for service2, etc.
  // Skip non-collector services (tmdb is an enrichment source, not a data collector)
  const SKIP_SERVICES = new Set(["tmdb", "overseerr"])
  for (const svc of dataServices.filter((s) => !SKIP_SERVICES.has(s))) {
    for (const tmpl of serviceTemplates.filter((t) => !t.onlyFor || t.onlyFor.includes(svc))) {
      const svcLabel = svc.charAt(0).toUpperCase() + svc.slice(1)
      // Resolve per-service defaults for params
      const svcDefaults = tmpl._defaults?.[svc] || {}
      const resolvedParams = tmpl.params.map((p) => {
        if (svcDefaults[p.key] !== undefined) return { ...p, default: svcDefaults[p.key] }
        return { ...p }
      })
      expanded.push({
        ...tmpl,
        id: tmpl.id.replace("{service}", svc),
        label: tmpl.label.replace("{service}", svcLabel),
        desc: tmpl.desc,
        params: resolvedParams,
        _service: svc,
      })
    }
  }

  // 3. Global slides at the end (compare, ranking, finale)
  for (const tmpl of globalAfter) {
    expanded.push({ ...tmpl })
  }

  return expanded
}

/**
 * Get params for a specific slide id from the registry.
 */
export function getSlideParams(slideId) {
  // Try exact match first
  let def = SLIDE_REGISTRY.find((s) => s.id === slideId)
  if (def) return def.params

  // Try template match (e.g. "tautulli-pod" matches "{service}-pod")
  for (const tmpl of SLIDE_REGISTRY) {
    if (tmpl.id.includes("{service}")) {
      const pattern = tmpl.id.replace("{service}", "([a-z]+)")
      if (new RegExp("^" + pattern + "$").test(slideId)) {
        return tmpl.params
      }
    }
  }

  return []
}
