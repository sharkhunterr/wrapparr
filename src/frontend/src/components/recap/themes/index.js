// ── Theme system: design tokens + labels + effects ──
// Each theme defines CSS custom properties, effect flags, labels, and extra CSS

import { glassDark } from "./glass-dark.js"
import { neonRetro } from "./neon-retro.js"
import { cinemaClassic } from "./cinema-classic.js"
import { weylandYutani } from "./weyland-yutani.js"
import { pirate } from "./pirate.js"
import { arcade8bit } from "./arcade-8bit.js"
import { matrix } from "./matrix.js"
import { strangerThings } from "./stranger-things.js"
import { starwars } from "./starwars.js"
import { silentFilm } from "./silent-film.js"
import { sinCity } from "./sin-city.js"
import { abyss } from "./abyss.js"
import { vhs } from "./vhs.js"
import { comic } from "./comic.js"
import { chalkboard } from "./chalkboard.js"
import { christmas } from "./christmas.js"

export const THEMES = {
  "glass-dark": glassDark,
  "neon-retro": neonRetro,
  "cinema-classic": cinemaClassic,
  "weyland-yutani": weylandYutani,
  "pirate": pirate,
  "arcade-8bit": arcade8bit,
  "matrix": matrix,
  "stranger-things": strangerThings,
  "starwars": starwars,
  "silent-film": silentFilm,
  "sin-city": sinCity,
  "abyss": abyss,
  "vhs": vhs,
  "comic": comic,
  "chalkboard": chalkboard,
  "christmas": christmas,
}

// Get theme by ID, fallback to glass-dark
export function getTheme(id) {
  return THEMES[id] || THEMES["glass-dark"]
}

// Get all available themes as array
export function getAllThemes() {
  return Object.values(THEMES)
}

// Generate CSS variables string from theme
export function themeToCSS(theme) {
  if (!theme?.css) return ""
  return Object.entries(theme.css).map(([k, v]) => `${k}:${v}`).join(";")
}
