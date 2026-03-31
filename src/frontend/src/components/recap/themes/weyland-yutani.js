export const weylandYutani = {
  id: "weyland-yutani",
  defaultPalette: "phosphore",
  name: "Weyland-Yutani",
  description: "Terminal MUTHUR, phosphore vert, interface Nostromo",
  preview: "linear-gradient(180deg, #000800 0%, #001a00 50%, #000a00 100%)",

  css: {
    "--th-surface": "rgba(0,255,65,0.05)",
    "--th-surface-hover": "rgba(0,255,65,0.09)",
    "--th-surface-dim": "rgba(0,255,65,0.02)",
    "--th-surface-subtle": "rgba(0,255,65,0.03)",
    "--th-surface-faint": "rgba(0,255,65,0.012)",
    "--th-border": "rgba(0,255,65,0.18)",
    "--th-border-dim": "rgba(0,255,65,0.07)",
    "--th-border-subtle": "rgba(0,255,65,0.1)",
    "--th-border-strong": "rgba(0,255,65,0.28)",
    "--th-text": "#33ff66",
    "--th-text-secondary": "rgba(51,255,102,0.65)",
    "--th-text-tertiary": "rgba(51,255,102,0.48)",
    "--th-text-muted": "rgba(51,255,102,0.3)",
    "--th-text-dim": "rgba(51,255,102,0.2)",
    "--th-text-faint": "rgba(51,255,102,0.13)",
    "--th-blur": "0px",
    "--th-radius": "0px",
    "--th-radius-sm": "0px",
    "--th-radius-xs": "0px",
    "--th-radius-pill": "0px",
    "--th-bar-bg": "rgba(0,255,65,0.04)",
    "--th-bar-prev": "rgba(0,255,65,0.1)",
    "--th-font-body": "'VT323',monospace",
    "--th-font-mono": "'VT323',monospace",
    "--th-glass-bg": "rgba(0,8,0,0.92)",
    "--th-glass-border": "rgba(0,255,65,0.18)",
    "--th-glass-blur": "blur(0px)",
    "--th-tooltip-bg": "#000a00",
    "--th-tooltip-border": "rgba(0,255,65,0.2)",
  },

  effects: {
    stars: false,
    orbs: false,
    grain: false,
    spotlights: false,
    confetti: false,
    fireworks: false,
    scanlines: true,
    grid: false,
    vhs: true,
    filmGrain: false,
    terminalOverlay: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
.th-scanlines{position:fixed;inset:0;pointer-events:none;z-index:45;opacity:0.06;background:repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,255,65,0.04) 1px,rgba(0,255,65,0.04) 2px)}
.th-vhs{position:fixed;inset:0;pointer-events:none;z-index:44}
.th-vhs::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.55) 100%)}
.th-vhs::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:rgba(0,255,65,0.08);animation:th-crt-line 6s linear infinite;box-shadow:0 0 15px 3px rgba(0,255,65,0.06)}
@keyframes th-crt-line{0%{top:-2%}100%{top:102%}}
.recap-root{text-shadow:0 0 6px rgba(0,255,65,0.5)!important}
.recap-root h2,.recap-root h1,.recap-root h3{text-shadow:0 0 10px rgba(0,255,65,0.7),0 0 25px rgba(0,255,65,0.3)!important}
.th-typing-cursor{display:inline-block;width:2px;height:1em;background:rgba(0,255,65,0.7);margin-left:3px;vertical-align:text-bottom;animation:th-blink-cursor 0.6s step-end infinite}
@keyframes th-blink-cursor{0%,100%{opacity:1}50%{opacity:0}}
@keyframes th-terminal-glow{0%,100%{text-shadow:0 0 10px rgba(0,255,65,0.7),0 0 25px rgba(0,255,65,0.3)}50%{text-shadow:0 0 14px rgba(0,255,65,0.9),0 0 35px rgba(0,255,65,0.4)}}
.glass{box-shadow:0 0 12px rgba(0,255,65,0.05),inset 0 1px 0 rgba(0,255,65,0.08)!important}
`,

  labels: {
    brand: "W-Y CORP",
    viewed: "analyses",
    episodes: "seq.",
    hours: "logged",
    monthlyActivity: "Rapport mensuel",
    favoriteDay: "Jour d'activite primaire",
    consumptionTime: "Fenetre d'analyse",
    goldenMonth: "Mois optimal",
    recordDay: "Pic d'activite",
    whenYouConsume: "Sujet:",
    consume: "en observation",
    budgetTitle: "Cout d'exploitation",
    yourFilms: "des specimens",
    ratingsTitle: "Evaluation des",
    worldTitle: "deployes sur",
    theWorld: "le secteur",
    countriesRepresented: "zones couvertes",
    bestNote: "Specimen de classe A",
    worstNote: "Specimen defectueux",
    mostExpensive: "Budget eleve",
    leastExpensive: "Budget reduit",
    bestROI: "Meilleur retour sur investissement",
    avgBudget: "Cout moyen d'acquisition",
    totalCumulated: "budget total",
    distributionTitle: "Repartition par cout",
    budgetPerFilm: "Cout par specimen",
    on: "sur",
    films: "specimens",
    rated: "evalues",
    average: "note moyenne",
    viewsUnit: "analyses",
    hoursUnit: "h",
    ofTotal: "du programme",
    viewing: "d'observation",
  },
}
