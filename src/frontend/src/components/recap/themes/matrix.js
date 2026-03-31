export const matrix = {
  id: "matrix",
  defaultPalette: "digital",
  name: "Matrix",
  description: "Pluie de code, pilule rouge, eveil numerique",
  preview: "linear-gradient(180deg, #000000 0%, #001500 60%, #000a00 100%)",

  css: {
    "--th-surface": "rgba(0,200,0,0.05)",
    "--th-surface-hover": "rgba(0,200,0,0.09)",
    "--th-surface-dim": "rgba(0,200,0,0.02)",
    "--th-surface-subtle": "rgba(0,200,0,0.03)",
    "--th-surface-faint": "rgba(0,200,0,0.012)",
    "--th-border": "rgba(0,200,0,0.15)",
    "--th-border-dim": "rgba(0,200,0,0.06)",
    "--th-border-subtle": "rgba(0,200,0,0.09)",
    "--th-border-strong": "rgba(0,200,0,0.25)",
    "--th-text": "#00dd00",
    "--th-text-secondary": "rgba(0,221,0,0.6)",
    "--th-text-tertiary": "rgba(0,221,0,0.45)",
    "--th-text-muted": "rgba(0,221,0,0.3)",
    "--th-text-dim": "rgba(0,221,0,0.2)",
    "--th-text-faint": "rgba(0,221,0,0.12)",
    "--th-blur": "0px",
    "--th-radius": "0px",
    "--th-radius-sm": "0px",
    "--th-radius-xs": "0px",
    "--th-radius-pill": "0px",
    "--th-bar-bg": "rgba(0,200,0,0.04)",
    "--th-bar-prev": "rgba(0,200,0,0.1)",
    "--th-font-body": "'Share Tech Mono',monospace",
    "--th-font-mono": "'Share Tech Mono',monospace",
    "--th-glass-bg": "rgba(0,5,0,0.9)",
    "--th-glass-border": "rgba(0,200,0,0.15)",
    "--th-glass-blur": "blur(0px)",
    "--th-tooltip-bg": "#000500",
    "--th-tooltip-border": "rgba(0,200,0,0.15)",
  },

  effects: {
    stars: false,
    orbs: false,
    grain: false,
    spotlights: false,
    confetti: false,
    fireworks: false,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: false,
    matrixRain: true,
    digitalGlitch: true,
    greenPulse: true,
    screenOff: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
.th-matrix-rain{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden;opacity:0.12}
.th-matrix-col{position:absolute;top:-100%;font-family:'Share Tech Mono',monospace;font-size:14px;color:#00ff00;writing-mode:vertical-lr;text-orientation:upright;line-height:1.1;animation:th-matrix-fall linear infinite;text-shadow:0 0 8px rgba(0,255,0,0.5)}
@keyframes th-matrix-fall{0%{transform:translateY(-100%)}100%{transform:translateY(calc(100vh + 100%))}}
.recap-root h2,.recap-root h1,.recap-root h3{text-shadow:0 0 12px rgba(0,255,0,0.6),0 0 30px rgba(0,255,0,0.2)!important}
.glass{box-shadow:0 0 10px rgba(0,200,0,0.05)!important}
.th-green-pulse{position:fixed;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle at 50% 50%,rgba(0,255,0,0.04) 0%,transparent 60%);animation:th-gpulse 5s ease-in-out infinite}
@keyframes th-gpulse{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.15)}}
.th-digital-glitch{position:fixed;inset:0;pointer-events:none;z-index:47;animation:th-dglitch 8s step-end infinite;opacity:0}
@keyframes th-dglitch{0%,94.5%,96%,97.5%,99%,100%{opacity:0}95%{opacity:1;background:linear-gradient(transparent 0%,rgba(0,255,0,0.03) 50%,transparent 50.5%,transparent 100%);transform:translateX(-2px)}96.5%{opacity:1;background:linear-gradient(transparent 0%,transparent 30%,rgba(0,255,0,0.04) 30.5%,transparent 31%,transparent 100%);transform:translateX(3px)}98%{opacity:1;background:linear-gradient(transparent 0%,transparent 70%,rgba(0,255,0,0.05) 70.5%,transparent 71%,transparent 100%);transform:translateX(-1px)}}
.th-screen-off{position:fixed;inset:0;pointer-events:none;z-index:48;background:#000;animation:th-crt-boot 20s ease-in-out infinite}
@keyframes th-crt-boot{0%,4%{opacity:0}4.5%{opacity:1}5%{opacity:1;clip-path:inset(49.5% 0 49.5% 0)}5.5%{opacity:1;clip-path:inset(40% 10% 40% 10%)}6%{opacity:0.8;clip-path:inset(0)}6.5%{opacity:0}93%{opacity:0}93.5%{opacity:0.3}94%{opacity:0.8;clip-path:inset(0)}94.5%{opacity:1;clip-path:inset(48% 5% 48% 5%)}95%{opacity:1;clip-path:inset(49.8% 0 49.8% 0)}95.5%{opacity:0}100%{opacity:0}}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "decryptes",
    episodes: "seq.",
    hours: "dans la Matrice",
    monthlyActivity: "Flux mensuel",
    favoriteDay: "Jour d'eveil",
    consumptionTime: "Heure de connexion",
    goldenMonth: "Le mois de l'Elu",
    recordDay: "Glitch temporel",
    whenYouConsume: "Quand tu",
    consume: "te branches",
    budgetTitle: "Le cout de",
    yourFilms: "la simulation",
    ratingsTitle: "Tes evaluations",
    worldTitle: "a travers",
    theWorld: "la Matrice",
    countriesRepresented: "noeuds infiltres",
    bestNote: "L'Elu",
    worstNote: "Erreur systeme",
    mostExpensive: "Pilule rouge",
    leastExpensive: "Pilule bleue",
    bestROI: "Meilleur ratio eveil/risque",
    avgBudget: "Cout moyen de la simulation",
    totalCumulated: "energie totale",
    distributionTitle: "Distribution des flux",
    budgetPerFilm: "Energie par cycle",
    on: "sur",
    films: "cycles",
    rated: "evalues",
    average: "score moyen",
    viewsUnit: "connexions",
    hoursUnit: "h",
    ofTotal: "du flux total",
    viewing: "de simulation",
  },
}
