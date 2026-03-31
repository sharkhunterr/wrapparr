// Pre-compute hyperspace star shadows (Vite can't parse complex template literals)
const _hyperspaceShadows = Array.from({length:80},()=>{const a=Math.random()*360;const d=Math.random()*50+5;const x=Math.cos(a*Math.PI/180)*d;const y=Math.sin(a*Math.PI/180)*d;return `${x}vw ${y}vh 0 0 rgba(200,230,255,${(0.03+Math.random()*0.06).toFixed(3)})`}).join(',')

export const starwars = {
  id: "starwars",
  defaultPalette: "republique",
  name: "Galaxie lointaine",
  description: "Hyperespace, hologrammes, Force et Rebellion",
  preview: "linear-gradient(180deg, #000005 0%, #000820 50%, #000005 100%)",

  css: {
    "--th-surface": "rgba(100,180,255,0.06)",
    "--th-surface-hover": "rgba(100,180,255,0.1)",
    "--th-surface-dim": "rgba(100,180,255,0.02)",
    "--th-surface-subtle": "rgba(100,180,255,0.035)",
    "--th-surface-faint": "rgba(100,180,255,0.015)",
    "--th-border": "rgba(100,180,255,0.16)",
    "--th-border-dim": "rgba(100,180,255,0.06)",
    "--th-border-subtle": "rgba(100,180,255,0.1)",
    "--th-border-strong": "rgba(100,180,255,0.25)",
    "--th-text": "#c8e0ff",
    "--th-text-secondary": "rgba(200,224,255,0.6)",
    "--th-text-tertiary": "rgba(200,224,255,0.45)",
    "--th-text-muted": "rgba(200,224,255,0.3)",
    "--th-text-dim": "rgba(200,224,255,0.2)",
    "--th-text-faint": "rgba(200,224,255,0.13)",
    "--th-blur": "10px",
    "--th-radius": "6px",
    "--th-radius-sm": "4px",
    "--th-radius-xs": "3px",
    "--th-radius-pill": "14px",
    "--th-bar-bg": "rgba(100,180,255,0.04)",
    "--th-bar-prev": "rgba(255,200,50,0.1)",
    "--th-font-body": "'Orbitron',sans-serif",
    "--th-font-mono": "'Share Tech Mono',monospace",
    "--th-glass-bg": "rgba(0,5,20,0.85)",
    "--th-glass-border": "rgba(100,180,255,0.16)",
    "--th-glass-blur": "blur(10px)",
    "--th-tooltip-bg": "#000510",
    "--th-tooltip-border": "rgba(100,180,255,0.16)",
  },

  effects: {
    stars: true,
    orbs: false,
    grain: false,
    spotlights: true,
    confetti: false,
    fireworks: false,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: false,
    hyperspace: true,
    holoScan: true,
    starStreaks: true,
    sabers: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Share+Tech+Mono&display=swap');
.th-hyperspace{position:fixed;inset:0;pointer-events:none;z-index:0;overflow:hidden}
.th-hyperspace::before{content:'';position:absolute;top:50%;left:50%;width:2px;height:2px;background:white;border-radius:50%;box-shadow:${_hyperspaceShadows};animation:th-hyper-pulse 8s ease-in-out infinite}
@keyframes th-hyper-pulse{0%,100%{opacity:0.6;transform:translate(-50%,-50%) scale(1)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}}
.recap-root h2,.recap-root h1,.recap-root h3{text-shadow:0 0 15px rgba(100,180,255,0.4),0 0 35px rgba(100,180,255,0.1)!important}
.glass{box-shadow:0 0 12px rgba(100,180,255,0.05),inset 0 0 20px rgba(100,180,255,0.02)!important}
.th-holo-scan .glass{position:relative;overflow:hidden}
.th-holo-scan .glass::after{content:'';position:absolute;top:-100%;left:0;right:0;height:40%;background:linear-gradient(180deg,transparent,rgba(100,180,255,0.04),transparent);animation:th-holo-line 4s linear infinite;pointer-events:none}
@keyframes th-holo-line{0%{top:-40%}100%{top:140%}}
/* starStreaks + sabers rendered as React components */
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "visionnes",
    episodes: "ep.",
    hours: "dans l'hyperespace",
    monthlyActivity: "Transmissions mensuelles",
    favoriteDay: "Jour de la Force",
    consumptionTime: "Heure du Conseil",
    goldenMonth: "Mois de la Republique",
    recordDay: "Bataille decisive",
    whenYouConsume: "Quand tu",
    consume: "explores la galaxie",
    budgetTitle: "Les credits de",
    yourFilms: "la Rebellion",
    ratingsTitle: "Tes holocrons",
    worldTitle: "a travers",
    theWorld: "la galaxie",
    countriesRepresented: "systemes visites",
    bestNote: "Voie de la Force",
    worstNote: "Cote obscur",
    mostExpensive: "Flotte imperiale",
    leastExpensive: "Chasseurs rebelles",
    bestROI: "Meilleur ratio credits/parsec",
    avgBudget: "Credits moyens par mission",
    totalCumulated: "credits totaux",
    distributionTitle: "Repartition des credits",
    budgetPerFilm: "Credits par mission",
    on: "sur",
    films: "missions",
    rated: "evaluees",
    average: "score moyen",
    viewsUnit: "transmissions",
    hoursUnit: "h",
    ofTotal: "de la flotte",
    viewing: "en hyperespace",
  },
}
