/**
 * Slide Registry — single source of truth for all slides.
 * Each slide declares its id, label, params, and whether it's locked/category/etc.
 * The SlideManager reads this to build the config UI.
 * The RecapPlayer reads this to know what params each slide accepts.
 */

export const SLIDE_REGISTRY = [
  {
    id: "intro", label: "Introduction", group: "global", locked: true,
    desc: "Ecran d'accueil avec le titre WRAPPARR",
    params: [],
  },
  {
    id: "onboarding", label: "Presentation du recap", group: "global",
    desc: "Nombre de slides, services, parametres rapides, navigation",
    params: [],
  },
  // Per-service slides — generated dynamically per service, but these define the templates
  {
    id: "cat-{service}", label: "Annonce {service}", group: "service", cat: true,
    desc: "Slide d'annonce plein ecran de la categorie",
    // defaults are resolved per-service in expandRegistry
    params: [
      { key: "customIcon", label: "Icone (emoji)", type: "text", default: "" },
      { key: "customLabel", label: "Titre", type: "text", default: "" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "" },
    ],
    _defaults: {
      tautulli: { customIcon: "🎬", customLabel: "FILMS", customSub: "Cinema · Documentaires" },
      plex: { customIcon: "🎬", customLabel: "FILMS", customSub: "Cinema · Documentaires" },
      jellyfin: { customIcon: "📺", customLabel: "JELLYFIN", customSub: "Films · Series" },
      romm: { customIcon: "🎮", customLabel: "JEUX VIDEO", customSub: "Switch · PC · Retrogaming" },
      audiobookshelf: { customIcon: "🎧", customLabel: "LIVRES AUDIO", customSub: "Sci-Fi · Thriller · Post-Apo" },
      komga: { customIcon: "📚", customLabel: "MANGA", customSub: "Shonen · Seinen · Dark Fantasy" },
      booklore: { customIcon: "📖", customLabel: "LIVRES", customSub: "Romans · Essais · BD" },
    },
  },
  {
    id: "{service}-pod", label: "Podium {service}", group: "service", pod: true,
    desc: "Top 3 avec reveal anime, jokes, et backdrop",
    params: [
      { key: "phaseWait", label: "Attente avant jokes (ms)", type: "number", default: 1800 },
      { key: "jokeDuration", label: "Duree par joke (ms)", type: "number", default: 1800 },
      { key: "jokeTransition", label: "Transition entre jokes (ms)", type: "number", default: 350 },
      { key: "reveal1", label: "Delai reveal #3 (ms)", type: "number", default: 400 },
      { key: "reveal2", label: "Delai reveal #2 (ms)", type: "number", default: 1100 },
      { key: "reveal3", label: "Delai reveal #1 (ms)", type: "number", default: 2000 },
      { key: "jokes", label: "Phrases de presentation", type: "phrases", default: [] },
    ],
    _defaults: {
      tautulli: { jokes: ["Voyons combien de films cette annee...", "Les popcorns etaient au rendez-vous.", "Il a ri, pleure, et probablement mange des chips.", "Voici le podium officiel"] },
      plex: { jokes: ["Voyons combien de films cette annee...", "Les popcorns etaient au rendez-vous.", "Il a ri, pleure, et probablement mange des chips.", "Voici le podium officiel"] },
      jellyfin: { jokes: ["Jellyfin a tourne a plein regime cette annee...", "Des heures de streaming en continu.", "Le serveur n'a pas chome.", "Le verdict tombe"] },
      romm: { jokes: ["Les manettes ont chauffees cette annee...", "Des sessions epiques en perspective.", "Les voisins ont entendu les victoires.", "Voici le top du gamepad"] },
      audiobookshelf: { jokes: ["Des heures d'ecoute cette annee...", "Principalement en mode concentration.", "Le cerveau a voyage dans des univers differents.", "Le palmares s'affiche"] },
      komga: { jokes: ["Des volumes de manga lus cette annee.", "Plusieurs volumes par mois. Respect.", "Au moins 4 arcs qui font pleurer.", "Le podium des cases s'illumine"] },
      booklore: { jokes: ["Des livres devores cette annee...", "La bibliotheque s'agrandit.", "Des histoires qui marquent.", "Le palmares litteraire"] },
    },
  },
  {
    id: "{service}-stats", label: "Stats {service}", group: "service",
    desc: "Donnees detaillees : top items, genres, graphe mensuel",
    params: [
      { key: "showTop", label: "Nombre d'items top", type: "number", default: 4 },
      { key: "showGenres", label: "Afficher genres", type: "bool", default: true },
      { key: "showMonthly", label: "Afficher graphe mensuel", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-stats-enriched", label: "Stats enrichies {service}", group: "service", onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Stats films enrichies : top films, donut genres, equivalent temps, categorie fun, affiches",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Approuve" },
      { key: "categories", label: "Categories fun (par heures)", type: "profiles", default: [
        { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
        { min: 20, max: 50, name: "Cinephile du dimanche", desc: "Tu aimes bien te poser devant un film", emoji: "🛋️" },
        { min: 50, max: 100, name: "Accro du cinema", desc: "Les salles obscures n'ont plus de secrets", emoji: "🎬" },
        { min: 100, max: 200, name: "Machine a films", desc: "Tu enchaines les films sans relache", emoji: "🤖" },
        { min: 200, max: 500, name: "Marathonien supreme", desc: "Tu vis et respires cinema", emoji: "🏆" },
        { min: 500, max: 99999, name: "Legende vivante", desc: "Tu as probablement vu plus de films que Spielberg", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-deep", label: "Habitudes {service}", group: "service",
    desc: "Horaires, jours preferes, classement",
    params: [
      { key: "showDayChart", label: "Afficher jours", type: "bool", default: true },
      { key: "showTimeChart", label: "Afficher heures", type: "bool", default: true },
      { key: "showRanking", label: "Afficher classement", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-budgets", label: "Budgets films {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des budgets des films vus",
    params: [
      { key: "displayMode", label: "Mode d'affichage distribution", type: "select", default: "bars", options: [
        { value: "bars", label: "Barres horizontales" },
        { value: "linechart", label: "Courbe avec moyenne" },
      ]},
    ],
  },
  {
    id: "{service}-timeline", label: "Profil cinephile {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des annees de sortie — quel type de spectateur es-tu ?",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 8000 },
      { key: "profiles", label: "Profils cinephiles", type: "profiles", default: [
        { min: 1900, max: 1949, name: "Cinephile classique", desc: "Tes films datent de l'age d'or du cinema", emoji: "🎩" },
        { min: 1950, max: 1979, name: "Nostalgique", desc: "Tu adores les grandes fresques et le cinema d'auteur", emoji: "📽️" },
        { min: 1980, max: 1999, name: "Enfant des 80s-90s", desc: "Action, aventure, et blockbusters — ton epoque", emoji: "📼" },
        { min: 2000, max: 2014, name: "Millenial", desc: "Tu as grandi avec les franchises et le cinema numerique", emoji: "🎬" },
        { min: 2015, max: 2030, name: "Ultra-moderne", desc: "Toujours a la pointe, tu regardes les sorties recentes", emoji: "🚀" },
      ]},
    ],
  },
  {
    id: "{service}-worldmap", label: "Carte du monde {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Pays d'origine des films vus",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 15000 },
    ],
  },
  {
    id: "{service}-ratings", label: "Notes {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Moyenne des notes et distribution par tranches",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 10000 },
      { key: "brackets", label: "Tranches de notes", type: "profiles", default: [
        { min: 0, max: 4, name: "Navet", desc: "Films mal notes", emoji: "🥬" },
        { min: 4, max: 6, name: "Passable", desc: "Notes moyennes-basses", emoji: "😐" },
        { min: 6, max: 7, name: "Bon", desc: "Bons films", emoji: "👍" },
        { min: 7, max: 8, name: "Tres bon", desc: "Films tres bien notes", emoji: "🎬" },
        { min: 8, max: 10, name: "Excellent", desc: "Les pepites", emoji: "🏆" },
      ]},
    ],
  },
  {
    id: "{service}-actors", label: "Acteurs favoris {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Acteurs les plus presents dans tes films",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max d'acteurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-directors", label: "Realisateurs favoris {service}", group: "service", tmdb: true, onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Realisateurs les plus presents dans tes films",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max de realisateurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-genres", label: "Genres {service}", group: "service",
    desc: "Visualisation des genres les plus consommes",
    params: [
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "race", options: [
        { value: "race", label: "Course" },
        { value: "bubbles", label: "Bulles" },
        { value: "orbit", label: "Orbite" },
        { value: "podium", label: "Podium classique" },
      ]},
      { key: "maxGenres", label: "Nombre de genres affiches", type: "number", default: 6 },
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 25000 },
      { key: "commentaryEnabled", label: "Commentaires en direct", type: "bool", default: true, showWhen: { key: "displayMode", value: "race" } },
      { key: "raceCommentary", label: "Phrases de commentaire", type: "commentary", showWhen: { key: "displayMode", value: "race" }, default: [
        { trigger: "start", label: "Depart", phrases: ["C'est parti !", "Les genres s'elancent !", "Et c'est le depart !"] },
        { trigger: "leader_change", label: "Changement leader", phrases: ["{name} prend la tete !", "{name} depasse tout le monde !", "Incroyable, {name} passe devant !"], vars: ["{name}"] },
        { trigger: "last_place", label: "Dernier", phrases: ["{name} bon dernier... ca m'etonne pas", "{name} ferme la marche, courage !", "Aie, {name} est largue"], vars: ["{name}"] },
        { trigger: "close_race", label: "Course serree", phrases: ["C'est serre entre {name1} et {name2} !", "Photo finish entre {name1} et {name2} ?"], vars: ["{name1}", "{name2}"] },
        { trigger: "mid_race", label: "Mi-course", phrases: ["La course bat son plein !", "Tout peut encore changer !", "Qui va l'emporter ?"] },
        { trigger: "near_end", label: "Fin de course", phrases: ["Derniere ligne droite !", "On approche de la fin...", "Les jeux sont presque faits !"] },
      ]},
    ],
  },
  {
    id: "{service}-compare", label: "Comparaison {service}", group: "service",
    desc: "Comparaison avec l'annee precedente ou les autres utilisateurs",
    params: [
      { key: "compareMode", label: "Mode de comparaison", type: "select", default: "year_vs_year", options: [
        { value: "year_vs_year", label: "Annee vs Annee" },
        { value: "user_vs_users", label: "Toi vs les autres" },
      ]},
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "horizontal_bars", options: [
        { value: "horizontal_bars", label: "Barres horizontales" },
        { value: "vertical_bars", label: "Barres verticales" },
        { value: "donut", label: "Cercle / Donut" },
        { value: "radar", label: "Radar" },
        { value: "race", label: "Course animee" },
        { value: "gauge", label: "Jauge" },
        { value: "linechart", label: "Courbe mensuelle" },
      ]},
      { key: "dataMetric", label: "Donnee a comparer", type: "select", default: "total_items", options: [
        { value: "total_items", label: "Nombre total" },
        { value: "total_hours", label: "Heures totales" },
        { value: "genres", label: "Top genres" },
        { value: "monthly", label: "Activite mensuelle" },
      ]},
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
    ],
  },

  // ── Series-specific slides (for services that have separate series data) ──
  {
    id: "cat-{service}-series", label: "Annonce series {service}", group: "service", cat: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Slide d'annonce plein ecran de la section series",
    params: [
      { key: "customIcon", label: "Icone (emoji)", type: "text", default: "📺" },
      { key: "customLabel", label: "Titre", type: "text", default: "SERIES" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "Series TV · Sagas" },
    ],
  },
  {
    id: "{service}-series-pod", label: "Podium series {service}", group: "service", pod: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Top series avec reveal anime",
    params: [
      { key: "phaseWait", label: "Attente avant jokes (ms)", type: "number", default: 1800 },
      { key: "jokeDuration", label: "Duree par joke (ms)", type: "number", default: 1800 },
      { key: "jokeTransition", label: "Transition entre jokes (ms)", type: "number", default: 350 },
      { key: "reveal1", label: "Delai reveal #3 (ms)", type: "number", default: 400 },
      { key: "reveal2", label: "Delai reveal #2 (ms)", type: "number", default: 1100 },
      { key: "reveal3", label: "Delai reveal #1 (ms)", type: "number", default: 2000 },
      { key: "jokes", label: "Phrases de presentation", type: "phrases", default: ["Voyons quelles series t'ont accroche...", "Des episodes enchaines sans fin.", "Le binge-watching, un art de vivre.", "Voici ton podium series"] },
    ],
  },
  {
    id: "{service}-series-stats-enriched", label: "Bilan series {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Stats series enrichies : donut genres, acteurs, records, affiches",
    params: [
      { key: "showStamp", label: "Afficher le tampon", type: "bool", default: true },
      { key: "stampText", label: "Texte du tampon", type: "text", default: "Approuve" },
      { key: "categories", label: "Categories fun (par heures)", type: "profiles", default: [
        { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
        { min: 20, max: 50, name: "Binge watcher debutant", desc: "Tu enchaines quelques episodes", emoji: "🛋️" },
        { min: 50, max: 100, name: "Accro aux series", desc: "Tu ne peux plus t'arreter", emoji: "📺" },
        { min: 100, max: 200, name: "Machine a episodes", desc: "Les saisons defilent sous tes yeux", emoji: "🤖" },
        { min: 200, max: 500, name: "Marathonien des series", desc: "Tu vis et respires series", emoji: "🏆" },
        { min: 500, max: 99999, name: "Legende du binge", desc: "Tu as probablement vu plus de series que Netflix", emoji: "👑" },
      ]},
    ],
  },
  {
    id: "{service}-series-deep", label: "Habitudes series {service}", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Quand tu regardes tes series : jour, heure, mois record",
    params: [],
  },
  {
    id: "{service}-series-timeline", label: "Profil seriephile {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Analyse des annees de sortie des series vues",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 8000 },
    ],
  },
  {
    id: "{service}-series-worldmap", label: "Carte du monde series {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Pays d'origine des series vues",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 15000 },
    ],
  },
  {
    id: "{service}-series-ratings", label: "Notes series {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Moyenne des notes et distribution des series",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 10000 },
    ],
  },
  {
    id: "{service}-series-directors", label: "Realisateurs series {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Realisateurs les plus presents dans tes series",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max de realisateurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-series-genres", label: "Genres series {service}", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Genres les plus regardes en series",
    params: [
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "race", options: [
        { value: "race", label: "Course" },
        { value: "bubbles", label: "Bulles" },
        { value: "orbit", label: "Orbite" },
        { value: "podium", label: "Podium classique" },
      ]},
      { key: "maxGenres", label: "Nombre de genres affiches", type: "number", default: 6 },
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 25000 },
      { key: "commentaryEnabled", label: "Commentaires en direct", type: "bool", default: true, showWhen: { key: "displayMode", value: "race" } },
      { key: "raceCommentary", label: "Phrases de commentaire", type: "commentary", showWhen: { key: "displayMode", value: "race" }, default: [
        { trigger: "start", label: "Depart", phrases: ["C'est parti !", "Les genres s'elancent !", "Et c'est le depart !"] },
        { trigger: "leader_change", label: "Changement leader", phrases: ["{name} prend la tete !", "{name} depasse tout le monde !", "Incroyable, {name} passe devant !"], vars: ["{name}"] },
        { trigger: "last_place", label: "Dernier", phrases: ["{name} bon dernier...", "{name} ferme la marche, courage !"], vars: ["{name}"] },
        { trigger: "close_race", label: "Course serree", phrases: ["C'est serre entre {name1} et {name2} !"], vars: ["{name1}", "{name2}"] },
        { trigger: "mid_race", label: "Mi-course", phrases: ["La course bat son plein !", "Tout peut encore changer !"] },
        { trigger: "near_end", label: "Fin de course", phrases: ["Derniere ligne droite !", "Les jeux sont presque faits !"] },
      ]},
    ],
  },
  {
    id: "{service}-series-actors", label: "Acteurs series {service}", group: "service", tmdb: true,
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Acteurs les plus vus dans tes series",
    params: [
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
      { key: "minAppearances", label: "Apparitions minimum", type: "number", default: 2 },
      { key: "maxCards", label: "Nombre max d'acteurs", type: "number", default: 6 },
    ],
  },
  {
    id: "{service}-series-compare", label: "Comparaison series {service}", group: "service",
    onlyFor: ["tautulli", "plex", "jellyfin"],
    desc: "Comparaison series avec l'annee precedente",
    params: [
      { key: "compareMode", label: "Mode de comparaison", type: "select", default: "year_vs_year", options: [
        { value: "year_vs_year", label: "Annee vs Annee" },
        { value: "user_vs_users", label: "Toi vs les autres" },
      ]},
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "linechart", options: [
        { value: "horizontal_bars", label: "Barres horizontales" },
        { value: "vertical_bars", label: "Barres verticales" },
        { value: "donut", label: "Cercle / Donut" },
        { value: "radar", label: "Radar" },
        { value: "race", label: "Course animee" },
        { value: "gauge", label: "Jauge" },
        { value: "linechart", label: "Courbe mensuelle" },
      ]},
      { key: "dataMetric", label: "Donnee a comparer", type: "select", default: "monthly", options: [
        { value: "total_items", label: "Nombre total" },
        { value: "total_hours", label: "Heures totales" },
        { value: "genres", label: "Top genres" },
        { value: "monthly", label: "Activite mensuelle" },
      ]},
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 12000 },
    ],
  },

  // Community slides
  {
    id: "cat-community", label: "Annonce communaute", group: "global", cat: true,
    desc: "Slide d'annonce de la section comparaison entre utilisateurs",
    params: [
      { key: "customIcon", label: "Icone (emoji)", type: "text", default: "👥" },
      { key: "customLabel", label: "Titre", type: "text", default: "COMMUNAUTE" },
      { key: "customSub", label: "Sous-titre", type: "text", default: "Comparaison entre utilisateurs" },
    ],
  },
  {
    id: "community-mostviewed-films", label: "Films les plus vus", group: "global",
    desc: "Top 10 films par nombre de vues avec details par utilisateur",
    params: [],
  },
  {
    id: "community-activity-films", label: "Activite communaute (films)", group: "global",
    desc: "Activite mensuelle de tous les utilisateurs superposee — films",
    params: [],
  },
  {
    id: "community-top-films", label: "Top films populaires", group: "global",
    desc: "Films les plus vus par la communaute avec affiches et details",
    params: [],
  },
  {
    id: "community-rankings-films", label: "Classement films", group: "global",
    desc: "Classement des utilisateurs en nombre de vues et heures — films",
    params: [],
  },
  {
    id: "community-genres-films", label: "Genres communaute (films)", group: "global",
    desc: "Genres preferes de la communaute avec classement — films",
    params: [],
  },
  {
    id: "community-mostviewed-series", label: "Series les plus vues", group: "global",
    desc: "Top 10 series par nombre de vues avec details par utilisateur",
    params: [],
  },
  {
    id: "community-activity-series", label: "Activite communaute (series)", group: "global",
    desc: "Activite mensuelle de tous les utilisateurs superposee — series",
    params: [],
  },
  {
    id: "community-top-series", label: "Top series populaires", group: "global",
    desc: "Series les plus vues par la communaute avec affiches et details",
    params: [],
  },
  {
    id: "community-rankings-series", label: "Classement series", group: "global",
    desc: "Classement des utilisateurs en nombre de vues et heures — series",
    params: [],
  },
  {
    id: "community-genres-series", label: "Genres communaute (series)", group: "global",
    desc: "Genres preferes de la communaute avec classement — series",
    params: [],
  },

  {
    id: "community-compare-films", label: "Comparaison films (annee vs annee)", group: "global",
    desc: "Comparaison films avec l'annee precedente : activite, genres, totaux",
    params: [],
  },
  {
    id: "community-compare-series", label: "Comparaison series (annee vs annee)", group: "global",
    desc: "Comparaison series avec l'annee precedente : activite, genres, totaux",
    params: [],
  },

  // Global slides
  {
    id: "compare", label: "Comparaison", group: "global",
    desc: "Annee en cours vs annee precedente",
    params: [],
  },
  {
    id: "ranking", label: "Classement global (ancien)", group: "global",
    desc: "Ancien classement — desactiver",
    params: [],
  },
  {
    id: "classement-serveur", label: "Classement serveur", group: "global",
    desc: "Classement cumule depuis le debut avec badges de progression",
    params: [],
  },
  {
    id: "finale", label: "Finale", group: "global", locked: true,
    desc: "Ecran final avec recap global et feux d'artifice",
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
  const SKIP_SERVICES = new Set(["tmdb"])
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
