export const strangerThings = {
  id: "stranger-things",
  defaultPalette: "hawkins",
  name: "Upside Down",
  description: "Lumieres de Noel, Monde a l'envers, annees 80",
  preview: "linear-gradient(180deg, #0a0000 0%, #1a0505 50%, #0d0000 100%)",

  css: {
    "--th-surface": "rgba(255,50,50,0.06)",
    "--th-surface-hover": "rgba(255,50,50,0.1)",
    "--th-surface-dim": "rgba(255,50,50,0.02)",
    "--th-surface-subtle": "rgba(255,50,50,0.03)",
    "--th-surface-faint": "rgba(255,50,50,0.015)",
    "--th-border": "rgba(255,50,50,0.18)",
    "--th-border-dim": "rgba(255,50,50,0.07)",
    "--th-border-subtle": "rgba(255,50,50,0.1)",
    "--th-border-strong": "rgba(255,50,50,0.28)",
    "--th-text": "#ffe0e0",
    "--th-text-secondary": "rgba(255,224,224,0.6)",
    "--th-text-tertiary": "rgba(255,224,224,0.45)",
    "--th-text-muted": "rgba(255,224,224,0.3)",
    "--th-text-dim": "rgba(255,224,224,0.2)",
    "--th-text-faint": "rgba(255,224,224,0.13)",
    "--th-blur": "6px",
    "--th-radius": "4px",
    "--th-radius-sm": "3px",
    "--th-radius-xs": "2px",
    "--th-radius-pill": "4px",
    "--th-bar-bg": "rgba(255,50,50,0.05)",
    "--th-bar-prev": "rgba(255,200,50,0.12)",
    "--th-font-body": "'Libre Baskerville',Georgia,serif",
    "--th-font-mono": "'Courier Prime',Courier,monospace",
    "--th-glass-bg": "rgba(15,2,2,0.88)",
    "--th-glass-border": "rgba(255,50,50,0.18)",
    "--th-glass-blur": "blur(6px)",
    "--th-tooltip-bg": "#0a0000",
    "--th-tooltip-border": "rgba(255,50,50,0.18)",
  },

  effects: {
    stars: false,
    orbs: true,
    grain: true,
    spotlights: true,
    confetti: false,
    fireworks: false,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: true,
    xmasLights: true,
    spores: true,
    dimensionCrack: true,
    stBars: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&family=Courier+Prime:wght@400;700&family=Indie+Flower&display=swap');
.th-film-grain{position:fixed;inset:0;pointer-events:none;z-index:44;opacity:0.06;mix-blend-mode:overlay;animation:th-grain-flick 0.1s infinite}
@keyframes th-grain-flick{0%{opacity:0.05}50%{opacity:0.08}100%{opacity:0.06}}
.th-vignette{position:fixed;inset:0;pointer-events:none;z-index:43;background:radial-gradient(ellipse at center,transparent 45%,rgba(10,0,0,0.6) 100%)}
.recap-root h1,.recap-root h2,.recap-root h3{text-transform:uppercase!important;letter-spacing:0.06em!important;color:#dd1111!important;text-shadow:0 0 10px rgba(255,20,20,0.8),0 0 30px rgba(255,20,20,0.4),0 0 60px rgba(200,0,0,0.2),0 0 100px rgba(150,0,0,0.1)!important;animation:th-st-flicker 5s ease-in-out infinite!important}
.recap-root h1 span,.recap-root h2 span,.recap-root h3 span{color:inherit!important}
@keyframes th-st-flicker{0%,18%{text-shadow:0 0 10px rgba(255,20,20,0.8),0 0 30px rgba(255,20,20,0.4),0 0 60px rgba(200,0,0,0.2);opacity:1}19%{text-shadow:0 0 3px rgba(255,20,20,0.2);opacity:0.4}20%{text-shadow:0 0 14px rgba(255,20,20,1),0 0 40px rgba(255,20,20,0.6);opacity:1}21%{text-shadow:0 0 5px rgba(255,20,20,0.3);opacity:0.6}22%,48%{text-shadow:0 0 10px rgba(255,20,20,0.8),0 0 30px rgba(255,20,20,0.4),0 0 60px rgba(200,0,0,0.2);opacity:1}49%{opacity:0.35;text-shadow:none}50%{text-shadow:0 0 16px rgba(255,20,20,1),0 0 45px rgba(255,20,20,0.6),0 0 90px rgba(200,0,0,0.3);opacity:1}51%{opacity:0.5;text-shadow:0 0 4px rgba(255,20,20,0.3)}52%,78%{text-shadow:0 0 10px rgba(255,20,20,0.8),0 0 30px rgba(255,20,20,0.4),0 0 60px rgba(200,0,0,0.2);opacity:1}79%{opacity:0.3;text-shadow:none}80%{opacity:0.7;text-shadow:0 0 6px rgba(255,20,20,0.4)}81%{text-shadow:0 0 14px rgba(255,20,20,1),0 0 40px rgba(255,20,20,0.5);opacity:1}82%,100%{text-shadow:0 0 10px rgba(255,20,20,0.8),0 0 30px rgba(255,20,20,0.4),0 0 60px rgba(200,0,0,0.2);opacity:1}}
.recap-root.th-st-on .cat-bar{opacity:0!important}
.th-st-bar{height:1.5px;background:linear-gradient(90deg,transparent 0%,rgba(200,0,0,0.5) 30%,rgba(255,20,20,0.8) 50%,rgba(200,0,0,0.5) 70%,transparent 100%);animation:th-st-bar-grow 3s ease-out both;box-shadow:0 0 6px rgba(255,0,0,0.3)}
@keyframes th-st-bar-grow{0%{width:0;opacity:0}30%{opacity:1}100%{width:80%;opacity:0.6}}
.th-spore{position:absolute;border-radius:50%;background:radial-gradient(circle,rgba(255,200,150,0.6) 0%,rgba(255,150,100,0.1) 60%,transparent 100%);animation:th-spore-rise linear infinite;pointer-events:none}
@keyframes th-spore-rise{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:0.6}80%{opacity:0.3}100%{transform:translateY(-110vh) scale(0.3);opacity:0}}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "vus",
    episodes: "ep.",
    hours: "dans l'Upside Down",
    monthlyActivity: "Signaux mensuels",
    favoriteDay: "Jour de contact",
    consumptionTime: "Heure d'apparition",
    goldenMonth: "Mois du portail",
    recordDay: "Breche dimensionnelle",
    whenYouConsume: "Quand tu",
    consume: "explores",
    budgetTitle: "Le prix de",
    yourFilms: "la breche",
    ratingsTitle: "Tes decouvertes",
    worldTitle: "a travers",
    theWorld: "les dimensions",
    countriesRepresented: "portails ouverts",
    bestNote: "Chef d'oeuvre",
    worstNote: "Piege du Demogorgon",
    mostExpensive: "Grosses expeditions",
    leastExpensive: "Missions de recon",
    bestROI: "Meilleur retour de l'Upside Down",
    avgBudget: "Cout moyen par mission",
    totalCumulated: "budget total",
    distributionTitle: "Repartition des missions",
    budgetPerFilm: "Cout par expedition",
    on: "sur",
    films: "expeditions",
    rated: "evaluees",
    average: "note moyenne",
    viewsUnit: "contacts",
    hoursUnit: "h",
    ofTotal: "du portail",
    viewing: "d'exploration",
  },
}
