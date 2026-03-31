export const silentFilm = {
  id: "silent-film",
  defaultPalette: "muet",
  name: "Cinema Muet",
  description: "Chaplin, pellicule, ardoises, noir et blanc",
  preview: "linear-gradient(135deg, #0a0a0a 0%, #222222 50%, #111111 100%)",

  css: {
    "--th-surface": "rgba(255,255,255,0.07)",
    "--th-surface-hover": "rgba(255,255,255,0.11)",
    "--th-surface-dim": "rgba(255,255,255,0.03)",
    "--th-surface-subtle": "rgba(255,255,255,0.04)",
    "--th-surface-faint": "rgba(255,255,255,0.02)",
    "--th-border": "rgba(255,255,255,0.15)",
    "--th-border-dim": "rgba(255,255,255,0.06)",
    "--th-border-subtle": "rgba(255,255,255,0.09)",
    "--th-border-strong": "rgba(255,255,255,0.22)",
    "--th-text": "#e8e0d0",
    "--th-text-secondary": "rgba(232,224,208,0.65)",
    "--th-text-tertiary": "rgba(232,224,208,0.5)",
    "--th-text-muted": "rgba(232,224,208,0.35)",
    "--th-text-dim": "rgba(232,224,208,0.22)",
    "--th-text-faint": "rgba(232,224,208,0.14)",
    "--th-blur": "0px",
    "--th-radius": "2px",
    "--th-radius-sm": "2px",
    "--th-radius-xs": "1px",
    "--th-radius-pill": "2px",
    "--th-bar-bg": "rgba(255,255,255,0.06)",
    "--th-bar-prev": "rgba(255,255,255,0.12)",
    "--th-font-body": "'Special Elite',monospace",
    "--th-font-mono": "'Special Elite',monospace",
    "--th-glass-bg": "rgba(25,22,18,0.88)",
    "--th-glass-border": "rgba(255,255,255,0.12)",
    "--th-glass-blur": "blur(0px)",
    "--th-tooltip-bg": "#141210",
    "--th-tooltip-border": "rgba(255,255,255,0.12)",
  },

  effects: {
    stars: false,
    orbs: false,
    grain: false,
    spotlights: true,
    confetti: false,
    fireworks: false,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: true,
    filmStrip: true,
    silentSlate: false,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Special+Elite&display=swap');
.th-film-grain{position:fixed;inset:0;pointer-events:none;z-index:44;opacity:0.15;mix-blend-mode:overlay;animation:th-sf-grain 0.08s steps(1) infinite}
@keyframes th-sf-grain{0%{opacity:0.12;transform:translate(0,0)}25%{opacity:0.16;transform:translate(-1px,1px)}50%{opacity:0.1;transform:translate(1px,-1px)}75%{opacity:0.15;transform:translate(-1px,-1px)}100%{opacity:0.13;transform:translate(1px,1px)}}
.th-vignette{position:fixed;inset:0;pointer-events:none;z-index:43;background:radial-gradient(ellipse at center,transparent 25%,rgba(0,0,0,0.75) 100%)}
.recap-root{filter:saturate(0) sepia(0.25)!important}
.th-film-strip{position:fixed;top:0;height:100vh;z-index:46;pointer-events:none;width:22px;background:rgba(15,12,8,0.95);overflow:hidden}
.th-film-strip.left{left:0;border-right:1px solid rgba(255,255,255,0.08)}
.th-film-strip.right{right:0;border-left:1px solid rgba(255,255,255,0.08)}
.th-film-hole{width:12px;height:9px;margin:4px auto;border-radius:1px;background:rgba(40,35,28,0.9);border:1px solid rgba(255,255,255,0.06)}
.th-slate{position:fixed;inset:0;z-index:100;pointer-events:none;display:flex;align-items:center;justify-content:center;background:rgba(12,10,8,0.97);transition:opacity 0.08s ease}
.th-slate-inner{text-align:center;font-family:'Special Elite',monospace;color:#d8d0c0;padding:40px 60px;border:4px double rgba(200,190,170,0.25);border-radius:4px;background:rgba(20,18,14,0.95);max-width:80vw;position:relative;box-shadow:0 0 60px rgba(0,0,0,0.5)}
.recap-root h2,.recap-root h1{position:relative!important;display:inline-block!important}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "projetes",
    episodes: "actes",
    hours: "en salle",
    monthlyActivity: "Programme mensuel",
    favoriteDay: "Jour de seance",
    consumptionTime: "Horaire de projection",
    goldenMonth: "Saison d'or",
    recordDay: "Seance marathon",
    whenYouConsume: "Quand tu",
    consume: "assistes",
    budgetTitle: "Le budget de",
    yourFilms: "la production",
    ratingsTitle: "Les critiques de",
    worldTitle: "a travers",
    theWorld: "le monde",
    countriesRepresented: "salles dans le monde",
    bestNote: "Chef d'oeuvre",
    worstNote: "Navet",
    mostExpensive: "Superproductions",
    leastExpensive: "Courts-metrages",
    bestROI: "Meilleur succes public",
    avgBudget: "Budget moyen par production",
    totalCumulated: "budget total",
    distributionTitle: "Repartition des productions",
    budgetPerFilm: "Budget par film",
    on: "sur",
    films: "bobines",
    rated: "critiquees",
    average: "note moyenne",
    viewsUnit: "seances",
    hoursUnit: "h",
    ofTotal: "de la saison",
    viewing: "de projection",
  },
}
