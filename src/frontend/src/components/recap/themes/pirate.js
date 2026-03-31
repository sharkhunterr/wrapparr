export const pirate = {
  id: "pirate",
  defaultPalette: "tresor",
  name: "Pirate",
  description: "Parchemin, carte au tresor, butin et aventure",
  preview: "linear-gradient(135deg, #2a1a08 0%, #3d2810 50%, #1a0e04 100%)",

  css: {
    "--th-surface": "rgba(210,170,100,0.08)",
    "--th-surface-hover": "rgba(210,170,100,0.13)",
    "--th-surface-dim": "rgba(210,170,100,0.03)",
    "--th-surface-subtle": "rgba(210,170,100,0.05)",
    "--th-surface-faint": "rgba(210,170,100,0.02)",
    "--th-border": "rgba(210,170,100,0.2)",
    "--th-border-dim": "rgba(210,170,100,0.08)",
    "--th-border-subtle": "rgba(210,170,100,0.12)",
    "--th-border-strong": "rgba(210,170,100,0.3)",
    "--th-text": "#f5e6c8",
    "--th-text-secondary": "rgba(245,230,200,0.65)",
    "--th-text-tertiary": "rgba(245,230,200,0.5)",
    "--th-text-muted": "rgba(245,230,200,0.33)",
    "--th-text-dim": "rgba(245,230,200,0.22)",
    "--th-text-faint": "rgba(245,230,200,0.14)",
    "--th-blur": "4px",
    "--th-radius": "6px",
    "--th-radius-sm": "4px",
    "--th-radius-xs": "3px",
    "--th-radius-pill": "14px",
    "--th-bar-bg": "rgba(210,170,100,0.06)",
    "--th-bar-prev": "rgba(210,170,100,0.12)",
    "--th-font-body": "'Pirata One',Georgia,serif",
    "--th-font-mono": "'IM Fell English SC',serif",
    "--th-glass-bg": "rgba(42,26,8,0.85)",
    "--th-glass-border": "rgba(210,170,100,0.2)",
    "--th-glass-blur": "blur(4px)",
    "--th-tooltip-bg": "#1a0e04",
    "--th-tooltip-border": "rgba(210,170,100,0.2)",
  },

  effects: {
    stars: true,
    orbs: true,
    grain: true,
    spotlights: false,
    confetti: false,
    fireworks: false,
    scanlines: false,
    grid: false,
    vhs: false,
    filmGrain: true,
    waves: true,
    compass: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Pirata+One&family=IM+Fell+English+SC&display=swap');
.th-film-grain{position:fixed;inset:0;pointer-events:none;z-index:44;opacity:0.05;mix-blend-mode:overlay;animation:th-parch-flicker 8s ease-in-out infinite}
@keyframes th-parch-flicker{0%,100%{opacity:0.04}50%{opacity:0.07}}
.th-vignette{position:fixed;inset:0;pointer-events:none;z-index:43;background:radial-gradient(ellipse at center,transparent 40%,rgba(26,14,4,0.65) 100%)}
.recap-root::before{content:'\\2620';position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-size:min(60vw,400px);color:rgba(210,170,100,0.015);z-index:0;pointer-events:none}
.glass{border-style:dashed!important;border-width:1px!important}
.recap-root h2,.recap-root h1{text-shadow:1px 1px 0 rgba(0,0,0,0.5),0 0 15px rgba(210,170,100,0.15)!important}
.recap-root h2,.recap-root h1{animation:th-scroll-unroll 1.2s cubic-bezier(0.16,1,0.3,1) both!important}
.recap-root .s0 h2,.recap-root .s0 h1{animation-delay:0.1s!important}
@keyframes th-scroll-unroll{0%{clip-path:polygon(48% 0%,52% 0%,52% 100%,48% 100%);opacity:0;filter:blur(2px) sepia(0.5)}30%{opacity:1;filter:blur(0px) sepia(0.2)}100%{clip-path:polygon(0% 0%,100% 0%,100% 100%,0% 100%);filter:blur(0px) sepia(0)}}
.recap-root .glass{animation:th-parch-reveal 0.8s ease-out both!important}
.recap-root .s1 .glass{animation-delay:0.15s!important}
.recap-root .s2 .glass{animation-delay:0.25s!important}
.recap-root .s3 .glass{animation-delay:0.35s!important}
@keyframes th-parch-reveal{0%{clip-path:inset(0 50% 0 50%);opacity:0}100%{clip-path:inset(0 0% 0 0%);opacity:1}}
.th-waves{position:fixed;bottom:0;left:0;right:0;height:80px;z-index:1;pointer-events:none;overflow:hidden}
.th-wave{position:absolute;bottom:0;left:-5%;width:110%;height:100%}
.th-wave svg{width:100%;height:100%;display:block}
.th-wave:nth-child(1){animation:th-wave-drift 7s ease-in-out infinite;opacity:0.12}
.th-wave:nth-child(2){animation:th-wave-drift 5s ease-in-out infinite reverse;opacity:0.08;bottom:-8px}
@keyframes th-wave-drift{0%,100%{transform:translateX(0)}50%{transform:translateX(3%)}}
.th-compass{position:fixed;bottom:20px;right:20px;width:50px;height:50px;z-index:2;pointer-events:none;opacity:0.08;animation:th-compass-spin 30s linear infinite}
@keyframes th-compass-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "pilles",
    episodes: "chap.",
    hours: "en mer",
    monthlyActivity: "Journal de bord",
    favoriteDay: "Jour de pillage",
    consumptionTime: "Heure de maree",
    goldenMonth: "Lune d'or",
    recordDay: "Jour de butin",
    whenYouConsume: "Quand tu",
    consume: "pilles",
    budgetTitle: "Le tresor de",
    yourFilms: "ton equipage",
    ratingsTitle: "Tes butins",
    worldTitle: "a travers",
    theWorld: "les sept mers",
    countriesRepresented: "ports conquis",
    bestNote: "Perle rare",
    worstNote: "Fond de cale",
    mostExpensive: "Tresor du capitaine",
    leastExpensive: "Pieces de cuivre",
    bestROI: "Meilleur butin par doublons investis",
    avgBudget: "Doublons moyens par prise",
    totalCumulated: "tresor total",
    distributionTitle: "Repartition du butin",
    budgetPerFilm: "Doublons par prise",
    on: "sur",
    films: "prises",
    rated: "jugees",
    average: "note du quartier-maitre",
    viewsUnit: "abordages",
    hoursUnit: "h",
    ofTotal: "du butin",
    viewing: "de navigation",
  },
}
