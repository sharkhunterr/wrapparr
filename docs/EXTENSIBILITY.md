# Guide d'extensibilite Wrapparr

Ce document explique comment ajouter des themes visuels, effets, slides, et palettes de couleurs au recap Wrapparr.

## Architecture

```
src/frontend/src/components/recap/
├── RecapPlayer.jsx          # Orchestrateur principal (373 lignes)
├── buildSlides.jsx          # Construction dynamique des slides
├── slideRegistry.js         # Registre declaratif des slides
├── ThemeContext.jsx          # Context React pour les labels/theme
├── SharedUI.jsx              # Composants partages (Tag, Lbl, AN, charts...)
├── recapStyles.js            # CSS global du recap
├── responsive.js             # Breakpoints responsive
├── themes/                   # Themes visuels (16 fichiers)
│   ├── index.js              # Registre + exports
│   ├── glass-dark.js
│   ├── starwars.js
│   └── ...
├── effects/                  # Effets visuels (28 fichiers)
│   ├── index.jsx             # Rendu conditionnel de tous les effets
│   ├── Snow.jsx
│   ├── Stars.jsx
│   └── ...
├── slides/                   # Slides individuelles (27 fichiers)
│   ├── CategorySlide.jsx
│   ├── PodiumSlide.jsx
│   ├── community/            # Slides communaute (6 fichiers)
│   │   ├── index.js
│   │   ├── shared.jsx
│   │   ├── CommunityActivitySlide.jsx
│   │   └── ...
│   └── ...
└── player/                   # Sous-composants du player (5 fichiers)
    ├── MusicPlayer.jsx
    ├── ThemeSelector.jsx
    ├── FullscreenButton.jsx
    ├── ComparisonButton.jsx
    └── NavChevron.jsx
```

---

## 1. Ajouter un theme visuel

Un theme definit l'apparence globale du recap : couleurs CSS, polices, effets actifs, labels, et CSS supplementaire.

### Etape 1 — Creer le fichier theme

Creer `src/frontend/src/components/recap/themes/mon-theme.js` :

```javascript
export const monTheme = {
  id: "mon-theme",
  name: "Mon Theme",
  defaultPalette: null,           // ou slug d'une palette (ex: "synthwave")
  description: "Description courte du theme",
  preview: "linear-gradient(180deg, #000 0%, #1a1a2e 100%)",  // apercu dans le selecteur

  css: {
    // Surfaces (fonds des cartes, glass panels)
    "--th-surface":        "rgba(255,255,255,0.08)",
    "--th-surface-hover":  "rgba(255,255,255,0.12)",
    "--th-surface-dim":    "rgba(255,255,255,0.03)",
    "--th-surface-subtle": "rgba(255,255,255,0.05)",
    "--th-surface-faint":  "rgba(255,255,255,0.02)",

    // Bordures
    "--th-border":         "rgba(255,255,255,0.12)",
    "--th-border-dim":     "rgba(255,255,255,0.06)",
    "--th-border-subtle":  "rgba(255,255,255,0.08)",
    "--th-border-strong":  "rgba(255,255,255,0.2)",

    // Texte (du plus visible au plus subtil)
    "--th-text":           "#e8e8e8",
    "--th-text-secondary": "rgba(255,255,255,0.6)",
    "--th-text-tertiary":  "rgba(255,255,255,0.45)",
    "--th-text-muted":     "rgba(255,255,255,0.3)",
    "--th-text-dim":       "rgba(255,255,255,0.2)",
    "--th-text-faint":     "rgba(255,255,255,0.13)",

    // Rayons et blur
    "--th-blur":        "10px",
    "--th-radius":      "10px",
    "--th-radius-sm":   "6px",
    "--th-radius-xs":   "4px",
    "--th-radius-pill": "16px",

    // Barres de graphiques
    "--th-bar-bg":   "rgba(255,255,255,0.04)",
    "--th-bar-prev": "rgba(255,200,50,0.1)",

    // Polices
    "--th-font-body": "'Nunito', sans-serif",
    "--th-font-mono": "'JetBrains Mono', monospace",

    // Glass panels
    "--th-glass-bg":     "rgba(255,255,255,0.04)",
    "--th-glass-border": "rgba(255,255,255,0.08)",
    "--th-glass-blur":   "blur(12px)",

    // Tooltips
    "--th-tooltip-bg":     "#0d0d18",
    "--th-tooltip-border": "rgba(255,255,255,0.1)",
  },

  effects: {
    // Effets de base
    stars: true,           // Etoiles scintillantes
    orbs: true,            // Orbes de couleur floues
    grain: true,           // Grain de film
    spotlights: true,      // Faisceaux de lumiere

    // Finale
    confetti: true,        // Confettis sur la slide finale
    fireworks: true,       // Feux d'artifice finale

    // Tous les autres effets a false par defaut
    // (voir section "Effets disponibles" pour la liste complete)
  },

  // CSS supplementaire (animations, overlays, @import de polices)
  cssExtra: `
    @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
    /* animations, pseudo-elements, etc. */
  `,

  // Labels personnalises (toutes les cles sont optionnelles, fallback sur glass-dark)
  labels: {
    brand: "WRAPPARR",
    viewed: "vus",
    episodes: "ep.",
    hours: "heures de visionnage",
    monthlyActivity: "Activite mensuelle",
    favoriteDay: "Jour prefere",
    consumptionTime: "Heure de conso",
    goldenMonth: "Mois en or",
    recordDay: "Journee record",
    whenYouConsume: "Quand tu",
    consume: "consommes du contenu",
    budgetTitle: "Les budgets de",
    yourFilms: "tes films",
    ratingsTitle: "Tes notes",
    worldTitle: "A travers",
    theWorld: "le monde",
    countriesRepresented: "pays representes",
    bestNote: "Meilleure note",
    worstNote: "Pire note",
    mostExpensive: "Plus gros budget",
    leastExpensive: "Plus petit budget",
    bestROI: "Meilleur ratio budget/note",
    avgBudget: "Budget moyen par film",
    totalCumulated: "budget total",
    distributionTitle: "Repartition des budgets",
    budgetPerFilm: "Budget par film",
    on: "sur",
    films: "films",
    rated: "notes",
    average: "note moyenne",
    viewsUnit: "vues",
    hoursUnit: "h",
    ofTotal: "du total",
    viewing: "de visionnage",
  },
}
```

### Etape 2 — Enregistrer le theme

Dans `themes/index.js`, ajouter l'import et l'entree :

```javascript
import { monTheme } from "./mon-theme.js"

export const THEMES = {
  // ... themes existants
  "mon-theme": monTheme,
}
```

C'est tout. Le theme apparait automatiquement dans le selecteur de themes du recap.

### Lier un theme a une palette par defaut

Si `defaultPalette` est renseigne (ex: `"synthwave"`), quand l'utilisateur choisit ce theme, la palette de couleurs correspondante est automatiquement appliquee.

---

## 2. Ajouter un effet visuel

### Types d'effets

| Type | Rendu | Exemple |
|------|-------|---------|
| **CSS pur** | `<div className="th-xxx" />` | scanlines, grid, frost |
| **CSS + React** | Composant JSX avec `position: absolute/fixed` | Stars, Orbs, ChalkDust |
| **Canvas** | `<canvas>` avec `requestAnimationFrame` | Snow, MatrixRain, NoirRain |

### Etape 1 — Creer le composant

Creer `effects/MonEffet.jsx`. Trois patterns possibles :

**Pattern CSS (le plus simple)** :

```javascript
export default function MonEffet() {
  return <div style={{
    position: "fixed", inset: 0,
    pointerEvents: "none", zIndex: 1,
    background: "...",
    animation: "mon-anim 5s ease-in-out infinite",
  }} />
}
```

**Pattern React (avec accent)** :

```javascript
import { useRef } from "react"

export default function MonEffet({ accent }) {
  const particles = useRef(
    Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 4,
    }))
  ).current

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
      {particles.map((p, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: "50%",
          background: accent,
          opacity: 0,
          animation: `mon-anim ${p.duration}s ease-in-out ${p.delay}s infinite`,
        }} />
      ))}
    </div>
  )
}
```

**Pattern Canvas (haute performance)** :

```javascript
import { useRef, useEffect } from "react"

export default function MonEffet() {
  const cvRef = useRef(null)

  useEffect(() => {
    const cv = cvRef.current
    const ctx = cv.getContext("2d")
    const resize = () => { cv.width = window.innerWidth; cv.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    // Initialiser les particules
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * cv.width,
      y: Math.random() * cv.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: 0.3 + Math.random() * 1,
      r: 1 + Math.random() * 2,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, cv.width, cv.height)
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        if (p.y > cv.height) { p.y = -5; p.x = Math.random() * cv.width }

        ctx.globalAlpha = 0.3
        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }
      return requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return <canvas ref={cvRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}
```

### Etape 2 — Enregistrer dans `effects/index.jsx`

```javascript
import MonEffet from "./MonEffet"

export default function ThemeEffects({ eff, accent, ... }) {
  return <>
    {/* ... effets existants ... */}

    {/* Mon theme */}
    {eff.monEffet && <MonEffet accent={accent} />}
  </>
}

export {
  // ... exports existants
  MonEffet,
}
```

### Etape 3 — Activer dans un theme

Dans le fichier theme qui utilise cet effet :

```javascript
effects: {
  monEffet: true,
  // desactiver les effets par defaut si besoin
  stars: false,
  orbs: false,
}
```

### Props disponibles dans ThemeEffects

| Prop | Type | Description |
|------|------|-------------|
| `eff` | `object` | Flags booleens depuis `theme.effects` |
| `accent` | `string` | Couleur accent hex de la slide courante |
| `fade` | `boolean` | `true` pendant la transition entre slides |
| `isCat` | `boolean` | Slide de categorie (annonce plein ecran) |
| `needSpotlights` | `boolean` | Slide qui beneficie de spotlights |
| `spotlightIntensity` | `number` | Intensite des spotlights (0-1.5) |
| `isCommunityTop` | `boolean` | Slide top communaute |
| `isFinale` | `boolean` | Slide finale |
| `slideConfigs` | `object` | Configuration admin des slides |

### Effets disponibles

| Flag | Composant | Description |
|------|-----------|-------------|
| `stars` | Stars | Etoiles scintillantes (CSS) |
| `orbs` | Orbs | Orbes flous colores (CSS) |
| `spotlights` | Spotlights | Faisceaux de lumiere |
| `grain` | Grain | Grain de film subtil |
| `confetti` | ConfettiEffect | Confettis (finale) |
| `fireworks` | FireworksEffect | Feux d'artifice (finale) |
| `snow` | Snow | Neige (canvas) |
| `frost` | div CSS | Givre sur les bords |
| `matrixRain` | MatrixRain | Pluie de caracteres verts (canvas) |
| `digitalGlitch` | div CSS | Glitch numerique |
| `greenPulse` | div CSS | Halo vert pulsant |
| `xmasLights` | XmasLights | Guirlande de Noel |
| `spores` | Spores | Spores flottantes |
| `dimensionCrack` | DimensionCrack | Fissure dimensionnelle |
| `stBars` | StrangerBars | Barres Stranger Things |
| `hyperspace` | div CSS | Hyperespace Star Wars |
| `holoScan` | classe CSS | Scan holographique |
| `starStreaks` | StarStreaks | Trainees d'etoiles (canvas) |
| `sabers` | Sabers | Sabres laser (canvas) |
| `terminalOverlay` | TerminalOverlay + TypingTitles | Terminal sci-fi |
| `scanlines` | div CSS | Lignes de scan CRT |
| `grid` | div CSS | Grille retro |
| `vhs` | div CSS | Distorsion VHS |
| `filmGrain` | div CSS | Grain cinema + vignette |
| `noirRain` | NoirRain | Pluie noir et blanc (canvas) |
| `noirBlinds` | NoirBlinds | Stores venitiens |
| `bloodDrips` | BloodDrips | Coulures de sang |
| `caustics` | div CSS | Reflets sous-marins |
| `biolum` | Bioluminescence | Bioluminescence (canvas) |
| `bubbles` | AbyssBubbles | Bulles sous-marines |
| `vhsHud` | VhsHud | HUD style VHS |
| `vhsTracking` | VhsTracking | Lignes de tracking VHS |
| `halftone` | div CSS | Trame demi-ton |
| `comicBorders` | ComicFx | Bordures bande dessinee |
| `chalkDust` | ChalkDust | Poussiere de craie |
| `chalkTexture` | div CSS | Texture tableau noir |
| `chalkboardBg` | ChalkboardBg | Fond tableau noir |
| `arcadeBorder` | div CSS | Bordure borne d'arcade |
| `filmStrip` | div CSS | Pellicule de film |
| `silentSlate` | div CSS | Carton de film muet (sur transitions) |
| `waves` | Waves | Vagues animees (canvas) |
| `compass` | Compass | Boussole pirate (canvas) |

---

## 3. Ajouter une slide

### Etape 1 — Creer le composant

Creer `slides/MaSlide.jsx` :

```javascript
import { useLabels } from "../ThemeContext"
import { Tag, Lbl, useComparison } from "../SharedUI"

export default function MaSlide({ accent, data, year }) {
  const L = useLabels()
  const comp = useComparison()  // { active, data, year } pour la comparaison

  // Extraire les donnees specifiques
  const maData = data?.extra?.ma_section
  if (!maData) return null

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      {/* Header avec badge annee */}
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{
          fontSize: "clamp(18px, 5vw, 26px)",
          fontWeight: 800,
          color: "var(--th-text)",
          lineHeight: 1.05,
        }}>
          Mon titre <span style={{ color: accent }}>stylise</span>
        </h2>
      </div>

      {/* Contenu avec animation d'entree */}
      <div className="glass s1" style={{ padding: "12px 14px" }}>
        <Lbl c={accent} size={8}>Sous-titre</Lbl>
        {/* ... contenu ... */}
      </div>

      {/* Donnees de comparaison (optionnel) */}
      {comp.active && comp.data && (
        <div className="s2" style={{ marginTop: 8 }}>
          {/* Afficher les differences vs annee precedente */}
        </div>
      )}
    </div>
  )
}
```

**Conventions** :
- `className="s0"`, `"s1"`, `"s2"` ... : animations d'entree sequentielles (`slide-up` avec delai croissant)
- `className="glass"` : panel avec fond transparent, bordure et blur
- `<Tag>` : badge avec l'annee
- `<Lbl>` : petit label colore
- `<AN t={valeur} />` : nombre anime
- Toujours `maxWidth: "clamp(320px, 85vw, 540px)"` pour le conteneur principal

### Etape 2 — Declarer dans le registre

Dans `slideRegistry.js`, ajouter l'entree :

```javascript
export const SLIDE_REGISTRY = [
  // ... existant ...
  {
    id: "{service}-ma-slide",       // ou "ma-slide-globale" sans {service}
    label: "Ma Slide",
    group: "service",               // "service" ou "global"
    desc: "Description pour l'admin",
    params: [
      // Parametres configurables par l'admin
      { key: "showDetails", label: "Afficher les details", type: "toggle", default: true },
      { key: "maxItems", label: "Nombre max d'items", type: "number", default: 10 },
    ],
  },
]
```

**Types de params** : `text`, `number`, `toggle`, `phrases` (liste de textes), `color`.

### Etape 3 — Ajouter dans buildSlides.jsx

Importer le composant et l'ajouter dans la boucle de construction :

```javascript
import MaSlide from "./slides/MaSlide"

// Dans la fonction buildSlides(), a l'endroit voulu dans l'ordre :
if (isSlideEnabled(slideSettings, `${service}-ma-slide`)) {
  slides.push({
    id: `${service}-ma-slide`,
    accent: cfg.accent,
    bg: cfg.bgStats,
    component: <MaSlide accent={cfg.accent} data={sData} year={year} />,
  })
}
```

### Proprietes d'une slide

| Propriete | Type | Description |
|-----------|------|-------------|
| `id` | `string` | Identifiant unique (ex: `"tautulli-ma-slide"`) |
| `accent` | `string` | Couleur hex de la slide |
| `bg` | `string` | Couleur de fond hex |
| `component` | `JSX` | Composant React a rendre |
| `cat` | `boolean` | Slide de categorie (plein ecran, spotlights) |
| `pod` | `boolean` | Slide podium |
| `fullscreen` | `boolean` | Affichage plein ecran |

### Ajouter une slide communaute

1. Creer `slides/community/MaCommunitySlide.jsx`
2. Exporter depuis `slides/community/index.js`
3. Importer dans `buildSlides.jsx`
4. Ajouter dans la section communaute (apres le check `allUsersData.length >= 2`)

---

## 4. Ajouter une palette de couleurs

Les palettes controlent les couleurs accent par service. Elles sont gerees cote backend.

### Via l'interface admin

L'admin peut creer des palettes dans l'onglet Themes du panneau d'administration.

### Via le code (palette builtin)

Dans `src/backend/app/main.py`, ajouter dans la liste `BUILTIN_THEMES` :

```python
{
    "name": "Ma Palette",
    "slug": "ma-palette",
    "config": {
        "palette": {
            "primary": "#E5A00D",          # Couleur principale
            "background": "#05050e",       # Fond des slides
            "accents": {
                "films": "#E5A00D",        # Accent pour les films
                "series": "#e05c9a",       # Accent pour les series
                "romm": "#34d399",         # Accent pour les jeux
                "audio": "#f97316",        # Accent pour les livres audio
                "komga": "#a78bfa",        # Accent pour les mangas
                "booklore": "#38bdf8",     # Accent pour les livres
                "compare": "#60a5fa",      # Accent pour la comparaison
                "ranking": "#f87171",      # Accent pour le classement
            },
        },
        "card_style": "glass",
        "transition": "slide-up",
        "particles": True,
        "orbs": True,
        "grain": True,
        "spotlights": True,
        "finale_effect": "fireworks",
        "fonts": {
            "heading": "Nunito",
            "body": "Nunito",
            "mono": "JetBrains Mono",
        },
    },
}
```

Les palettes builtin sont synchronisees automatiquement au demarrage du serveur.

### Lier une palette a un theme visuel

Dans le fichier theme, renseigner `defaultPalette` avec le slug :

```javascript
export const monTheme = {
  id: "mon-theme",
  defaultPalette: "ma-palette",  // slug de la palette
  // ...
}
```

Quand l'utilisateur selectionne ce theme, la palette associee est automatiquement appliquee.

### Priorite de resolution des palettes

1. Theme actif defini par l'admin (global)
2. Preference de l'utilisateur (`theme_pack_id`)
3. Premiere palette disponible
4. Fallback : `primary: "#E5A00D"`, `background: "#05050e"`

---

## 5. Recap : checklist rapide

### Nouveau theme
- [ ] Creer `themes/mon-theme.js` avec id, css, effects, labels
- [ ] Ajouter import + entree dans `themes/index.js`

### Nouvel effet
- [ ] Creer `effects/MonEffet.jsx`
- [ ] Importer et ajouter le rendu conditionnel dans `effects/index.jsx`
- [ ] Ajouter `monEffet: true` dans le `effects` du/des theme(s)

### Nouvelle slide
- [ ] Creer `slides/MaSlide.jsx`
- [ ] Declarer dans `slideRegistry.js`
- [ ] Importer et ajouter dans `buildSlides.jsx`

### Nouvelle palette
- [ ] Ajouter dans `BUILTIN_THEMES` de `main.py` (ou via l'interface admin)
- [ ] Optionnel : lier a un theme via `defaultPalette`
