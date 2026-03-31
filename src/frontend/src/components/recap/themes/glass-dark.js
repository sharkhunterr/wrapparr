export const glassDark = {
  id: "glass-dark",
  name: "Glass Dark",
  defaultPalette: null,
  description: "Effet verre depoli sur fond sombre",
  preview: "linear-gradient(135deg, #0a0a1a, #15152a)",

  // CSS custom properties (injected on .recap-root)
  css: {
    // Surfaces
    "--th-surface": "rgba(255,255,255,0.08)",
    "--th-surface-hover": "rgba(255,255,255,0.12)",
    "--th-surface-dim": "rgba(255,255,255,0.03)",
    "--th-surface-subtle": "rgba(255,255,255,0.04)",
    "--th-surface-faint": "rgba(255,255,255,0.015)",
    // Borders
    "--th-border": "rgba(255,255,255,0.12)",
    "--th-border-dim": "rgba(255,255,255,0.06)",
    "--th-border-subtle": "rgba(255,255,255,0.08)",
    "--th-border-strong": "rgba(255,255,255,0.18)",
    // Text
    "--th-text": "white",
    "--th-text-secondary": "rgba(255,255,255,0.5)",
    "--th-text-tertiary": "rgba(255,255,255,0.4)",
    "--th-text-muted": "rgba(255,255,255,0.3)",
    "--th-text-dim": "rgba(255,255,255,0.25)",
    "--th-text-faint": "rgba(255,255,255,0.2)",
    // Effects
    "--th-blur": "14px",
    "--th-radius": "14px",
    "--th-radius-sm": "10px",
    "--th-radius-xs": "6px",
    "--th-radius-pill": "20px",
    // Bar graphs
    "--th-bar-bg": "rgba(255,255,255,0.03)",
    "--th-bar-prev": "rgba(255,255,255,0.12)",
    // Fonts
    "--th-font-body": "Nunito,sans-serif",
    "--th-font-mono": "JetBrains Mono,monospace",
    // Glass
    "--th-glass-bg": "rgba(255,255,255,0.08)",
    "--th-glass-border": "rgba(255,255,255,0.12)",
    "--th-glass-blur": "blur(14px)",
    // Tooltip
    "--th-tooltip-bg": "#0d0d1a",
    "--th-tooltip-border": "rgba(255,255,255,0.1)",
  },

  effects: {
    stars: true,
    orbs: true,
    grain: true,
    spotlights: true,
    confetti: true,
    fireworks: true,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: false,
  },

  // Extra CSS to inject (theme-specific animations/overlays)
  cssExtra: "",

  // Labels — French casual (default)
  labels: {
    brand: "WRAPPARR",
    viewed: "vus",
    episodes: "ep.",
    hours: "passees",
    monthlyActivity: "Activite mensuelle",
    favoriteDay: "Jour prefere",
    consumptionTime: "Heure de consommation",
    goldenMonth: "Mois en or",
    recordDay: "Journee record",
    whenYouConsume: "Quand tu",
    consume: "consommes",
    budgetTitle: "Le budget de",
    yourFilms: "tes films",
    ratingsTitle: "Tes notes",
    worldTitle: "a travers",
    theWorld: "le monde",
    countriesRepresented: "pays representes",
    bestNote: "Meilleure note",
    worstNote: "Pire note",
    mostExpensive: "Les plus chers",
    leastExpensive: "Les moins chers",
    bestROI: "Meilleur retour sur investissement",
    avgBudget: "Budget moyen des films vus",
    totalCumulated: "total cumule",
    distributionTitle: "Repartition par budget",
    budgetPerFilm: "Budget par film",
    on: "sur",
    films: "films",
    rated: "notes",
    average: "moyenne",
    viewsUnit: "vues",
    hoursUnit: "h",
    ofTotal: "du total",
    viewing: "de visionnage",
  },
}
