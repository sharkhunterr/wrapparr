export const vhs = {
  id: "vhs",
  defaultPalette: "videoclub",
  name: "VHS 90s",
  description: "Cassette video, tracking, static, PLAY/REC",
  preview: "linear-gradient(135deg, #0a0a0a 0%, #1a1020 50%, #0a0808 100%)",

  css: {
    "--th-surface": "rgba(255,255,255,0.06)",
    "--th-surface-hover": "rgba(255,255,255,0.1)",
    "--th-surface-dim": "rgba(255,255,255,0.025)",
    "--th-surface-subtle": "rgba(255,255,255,0.035)",
    "--th-surface-faint": "rgba(255,255,255,0.015)",
    "--th-border": "rgba(255,255,255,0.1)",
    "--th-border-dim": "rgba(255,255,255,0.04)",
    "--th-border-subtle": "rgba(255,255,255,0.06)",
    "--th-border-strong": "rgba(255,255,255,0.15)",
    "--th-text": "#e0e0e0",
    "--th-text-secondary": "rgba(224,224,224,0.6)",
    "--th-text-tertiary": "rgba(224,224,224,0.45)",
    "--th-text-muted": "rgba(224,224,224,0.3)",
    "--th-text-dim": "rgba(224,224,224,0.2)",
    "--th-text-faint": "rgba(224,224,224,0.12)",
    "--th-blur": "0px",
    "--th-radius": "0px",
    "--th-radius-sm": "0px",
    "--th-radius-xs": "0px",
    "--th-radius-pill": "0px",
    "--th-bar-bg": "rgba(255,255,255,0.04)",
    "--th-bar-prev": "rgba(255,255,255,0.08)",
    "--th-font-body": "'VCR OSD Mono','Share Tech Mono',monospace",
    "--th-font-mono": "'VCR OSD Mono','Share Tech Mono',monospace",
    "--th-glass-bg": "rgba(10,8,15,0.88)",
    "--th-glass-border": "rgba(255,255,255,0.08)",
    "--th-glass-blur": "blur(0px)",
    "--th-tooltip-bg": "#0a0810",
    "--th-tooltip-border": "rgba(255,255,255,0.08)",
  },

  effects: {
    stars: false, orbs: false, grain: false, spotlights: false,
    confetti: false, fireworks: false, scanlines: true, grid: false,
    vhs: true, filmGrain: false,
    vhsHud: true, vhsTracking: true, vhsChromatic: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
.th-scanlines{position:fixed;inset:0;pointer-events:none;z-index:45;opacity:0.04;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(255,255,255,0.03) 2px,rgba(255,255,255,0.03) 4px)}
.th-vhs{position:fixed;inset:0;pointer-events:none;z-index:44}
.th-vhs::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.5) 100%)}
.th-vhs::after{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.06);animation:th-crt-line 4s linear infinite;box-shadow:0 0 12px 2px rgba(255,255,255,0.04)}
@keyframes th-crt-line{0%{top:-2%}100%{top:102%}}
.recap-root.th-vhs-on{animation:th-vhs-jitter 0.1s steps(1) infinite!important}
@keyframes th-vhs-jitter{0%{transform:translate(0,0)}25%{transform:translate(-1px,0)}50%{transform:translate(0,1px)}75%{transform:translate(1px,0)}100%{transform:translate(0,0)}}
.recap-root h1,.recap-root h2,.recap-root h3{text-shadow:2px 0 #ff000030,-2px 0 #00ffff30!important}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "vus",
    episodes: "ep.",
    hours: "enregistrees",
    monthlyActivity: "Programme mensuel",
    favoriteDay: "Jour d'enregistrement",
    consumptionTime: "Heure de lecture",
    goldenMonth: "Mois en boucle",
    recordDay: "Journee marathon",
    whenYouConsume: "Quand tu",
    consume: "rembobines",
    budgetTitle: "Le prix de",
    yourFilms: "ta collection",
    ratingsTitle: "Tes cassettes",
    worldTitle: "a travers",
    theWorld: "le videoclub",
    countriesRepresented: "rayons explores",
    bestNote: "Selection du staff",
    worstNote: "Fond de bac",
    mostExpensive: "Editions collector",
    leastExpensive: "Bac a 1F",
    bestROI: "Meilleur rapport qualite/prix",
    avgBudget: "Prix moyen par cassette",
    totalCumulated: "total depense",
    distributionTitle: "Repartition du vid\u00e9oclub",
    budgetPerFilm: "Prix par K7",
    on: "sur",
    films: "cassettes",
    rated: "notees",
    average: "note moyenne",
    viewsUnit: "lectures",
    hoursUnit: "h",
    ofTotal: "de la collection",
    viewing: "de visionnage",
  },
}
