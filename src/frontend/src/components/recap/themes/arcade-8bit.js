export const arcade8bit = {
  id: "arcade-8bit",
  defaultPalette: "arcade",
  name: "Arcade 8-bit",
  description: "Borne d'arcade, pixels, couleurs saturees",
  preview: "linear-gradient(180deg, #000000 0%, #1a0030 50%, #000020 100%)",

  css: {
    "--th-surface": "rgba(255,255,0,0.06)",
    "--th-surface-hover": "rgba(255,255,0,0.1)",
    "--th-surface-dim": "rgba(255,255,0,0.02)",
    "--th-surface-subtle": "rgba(255,255,0,0.03)",
    "--th-surface-faint": "rgba(255,255,0,0.015)",
    "--th-border": "rgba(255,255,0,0.2)",
    "--th-border-dim": "rgba(255,255,0,0.08)",
    "--th-border-subtle": "rgba(255,255,0,0.12)",
    "--th-border-strong": "rgba(255,255,0,0.3)",
    "--th-text": "#ffffff",
    "--th-text-secondary": "rgba(255,255,255,0.7)",
    "--th-text-tertiary": "rgba(255,255,255,0.5)",
    "--th-text-muted": "rgba(255,255,255,0.35)",
    "--th-text-dim": "rgba(255,255,255,0.25)",
    "--th-text-faint": "rgba(255,255,255,0.15)",
    "--th-blur": "0px",
    "--th-radius": "0px",
    "--th-radius-sm": "0px",
    "--th-radius-xs": "0px",
    "--th-radius-pill": "0px",
    "--th-bar-bg": "rgba(255,255,0,0.05)",
    "--th-bar-prev": "rgba(0,200,255,0.15)",
    "--th-font-body": "'Press Start 2P',monospace",
    "--th-font-mono": "'Press Start 2P',monospace",
    "--th-glass-bg": "rgba(0,0,20,0.9)",
    "--th-glass-border": "rgba(255,255,0,0.2)",
    "--th-glass-blur": "blur(0px)",
    "--th-tooltip-bg": "#000010",
    "--th-tooltip-border": "rgba(255,255,0,0.2)",
  },

  effects: {
    stars: true,
    orbs: false,
    grain: false,
    spotlights: false,
    confetti: true,
    fireworks: false,
    scanlines: true,
    grid: false,
    vhs: false,
    filmGrain: false,
    glitchText: true,
    arcadeBorder: true,
  },

  cssExtra: `
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
.th-scanlines{position:fixed;inset:0;pointer-events:none;z-index:45;opacity:0.03;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.15) 3px,rgba(0,0,0,0.15) 4px)}
.recap-root h2,.recap-root h1,.recap-root h3{text-shadow:3px 3px 0 rgba(255,0,0,0.4),-1px -1px 0 rgba(0,100,255,0.3)!important;image-rendering:pixelated}
.glass{border:2px solid rgba(255,255,0,0.2)!important;box-shadow:4px 4px 0 rgba(0,0,0,0.5)!important}
.recap-root::after{content:'INSERT COIN';position:fixed;bottom:20px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:8px;color:rgba(255,255,0,0.12);letter-spacing:0.2em;z-index:200;pointer-events:none;animation:th-blink 1.2s step-end infinite}
@keyframes th-blink{0%,100%{opacity:1}50%{opacity:0}}
.recap-root h2,.recap-root h1{animation:th-glitch 6s ease-in-out infinite!important}
@keyframes th-glitch{0%,87%,91%,95%,100%{transform:translate(0,0) skew(0deg)}88%{transform:translate(-3px,1px) skew(2deg)}89%{transform:translate(3px,-1px) skew(-1deg)}90%{transform:translate(0,0)}92%{transform:translate(2px,2px) skew(-2deg)}93%{transform:translate(-2px,0) skew(1deg)}94%{transform:translate(0,0)}}
.th-arcade-border{position:fixed;inset:0;pointer-events:none;z-index:46;border:3px solid rgba(255,255,0,0.08);box-shadow:inset 0 0 30px rgba(255,255,0,0.03),inset 0 0 60px rgba(255,0,200,0.02)}
.th-arcade-border::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#ff0000 0 8px,#ffff00 8px 16px,#00ff00 16px 24px,#0080ff 24px 32px);opacity:0.15}
.th-arcade-border::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:repeating-linear-gradient(90deg,#0080ff 0 8px,#00ff00 8px 16px,#ffff00 16px 24px,#ff0000 24px 32px);opacity:0.15}
`,

  labels: {
    brand: "WRAPPARR",
    viewed: "clear",
    episodes: "lvl",
    hours: "de jeu",
    monthlyActivity: "Score mensuel",
    favoriteDay: "Jour de high score",
    consumptionTime: "Heure de partie",
    goldenMonth: "Boss final",
    recordDay: "Perfect run",
    whenYouConsume: "Quand tu",
    consume: "joues",
    budgetTitle: "Les credits de",
    yourFilms: "ta partie",
    ratingsTitle: "Tes scores",
    worldTitle: "a travers",
    theWorld: "les niveaux",
    countriesRepresented: "mondes explores",
    bestNote: "S-Rank",
    worstNote: "Game Over",
    mostExpensive: "Boss premium",
    leastExpensive: "Mob basique",
    bestROI: "Meilleur ratio XP/temps",
    avgBudget: "Credits moyens par run",
    totalCumulated: "credits total",
    distributionTitle: "Distribution des credits",
    budgetPerFilm: "Credits par run",
    on: "sur",
    films: "runs",
    rated: "rank",
    average: "score moyen",
    viewsUnit: "parties",
    hoursUnit: "h",
    ofTotal: "du total",
    viewing: "de gameplay",
  },
}
