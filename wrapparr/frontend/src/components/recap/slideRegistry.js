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
    id: "overview", label: "Vue d'ensemble", group: "global",
    desc: "Statistiques globales toutes plateformes",
    params: [],
  },

  // Per-service slides — generated dynamically per service, but these define the templates
  {
    id: "cat-{service}", label: "Annonce {service}", group: "service", cat: true,
    desc: "Slide d'annonce plein ecran de la categorie",
    params: [],
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
    ],
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
    id: "{service}-deep", label: "Habitudes {service}", group: "service",
    desc: "Horaires, jours preferes, classement",
    params: [
      { key: "showDayChart", label: "Afficher jours", type: "bool", default: true },
      { key: "showTimeChart", label: "Afficher heures", type: "bool", default: true },
      { key: "showRanking", label: "Afficher classement", type: "bool", default: true },
    ],
  },
  {
    id: "{service}-genres", label: "Genres {service}", group: "service",
    desc: "Visualisation des genres les plus consommes",
    params: [
      { key: "displayMode", label: "Mode d'affichage", type: "select", default: "race", options: [
        { value: "race", label: "Course" },
        { value: "bubbles", label: "Bulles" },
        { value: "podium", label: "Podium classique" },
      ]},
      { key: "maxGenres", label: "Nombre de genres affiches", type: "number", default: 6 },
      { key: "animationSpeed", label: "Duree animation (ms)", type: "number", default: 25000 },
      { key: "commentaryEnabled", label: "Commentaires en direct", type: "bool", default: true },
      { key: "raceCommentary", label: "Phrases de commentaire", type: "commentary", default: [
        { trigger: "start", label: "Depart", phrases: ["C'est parti !", "Les genres s'elancent !", "Et c'est le depart !"] },
        { trigger: "leader_change", label: "Changement leader", phrases: ["{name} prend la tete !", "{name} depasse tout le monde !", "Incroyable, {name} passe devant !"], vars: ["{name}"] },
        { trigger: "last_place", label: "Dernier", phrases: ["{name} bon dernier... ca m'etonne pas", "{name} ferme la marche, courage !", "Aie, {name} est largue"], vars: ["{name}"] },
        { trigger: "close_race", label: "Course serree", phrases: ["C'est serre entre {name1} et {name2} !", "Photo finish entre {name1} et {name2} ?"], vars: ["{name1}", "{name2}"] },
        { trigger: "mid_race", label: "Mi-course", phrases: ["La course bat son plein !", "Tout peut encore changer !", "Qui va l'emporter ?"] },
        { trigger: "near_end", label: "Fin de course", phrases: ["Derniere ligne droite !", "On approche de la fin...", "Les jeux sont presque faits !"] },
      ]},
    ],
  },

  // Global slides
  {
    id: "compare", label: "Comparaison", group: "global",
    desc: "Annee en cours vs annee precedente",
    params: [],
  },
  {
    id: "ranking", label: "Classement global", group: "global",
    desc: "Classement inter-utilisateurs",
    params: [],
  },
  {
    id: "finale", label: "Finale", group: "global", locked: true,
    desc: "Ecran final avec recap global et feux d'artifice",
    params: [],
  },
]

/**
 * Expand registry templates for actual services present in recap data.
 * Returns concrete slide definitions with resolved ids.
 */
export function expandRegistry(dataServices = []) {
  const expanded = []
  const serviceTemplates = SLIDE_REGISTRY.filter((s) => s.group === "service")
  const globalBefore = SLIDE_REGISTRY.filter((s) => s.group === "global" && (s.id === "intro" || s.id === "overview"))
  const globalAfter = SLIDE_REGISTRY.filter((s) => s.group === "global" && s.id !== "intro" && s.id !== "overview")

  // 1. Global slides first (intro, overview)
  for (const tmpl of globalBefore) {
    expanded.push({ ...tmpl })
  }

  // 2. Per service — all slides for service1, then all for service2, etc.
  for (const svc of dataServices) {
    for (const tmpl of serviceTemplates) {
      const svcLabel = svc.charAt(0).toUpperCase() + svc.slice(1)
      expanded.push({
        ...tmpl,
        id: tmpl.id.replace("{service}", svc),
        label: tmpl.label.replace("{service}", svcLabel),
        desc: tmpl.desc,
        params: [...tmpl.params],
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
