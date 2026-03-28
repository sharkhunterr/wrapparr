import { createContext, useContext } from "react"
import { THEMES } from "./themes"

const ThemeCtx = createContext(THEMES["glass-dark"])

export const ThemeProvider = ThemeCtx.Provider

// Hook to access the current visual theme
// Returns the full theme object with css, effects, labels, cssExtra
export function useTheme() {
  return useContext(ThemeCtx)
}

// Shortcut: get a label with fallback to glass-dark
export function useLabel(key) {
  const theme = useContext(ThemeCtx)
  return theme.labels?.[key] || THEMES["glass-dark"].labels[key] || key
}

// Shortcut: get all labels
export function useLabels() {
  const theme = useContext(ThemeCtx)
  return { ...THEMES["glass-dark"].labels, ...theme.labels }
}

// Shortcut: check if an effect is enabled
export function useEffect_(effectName) {
  const theme = useContext(ThemeCtx)
  return theme.effects?.[effectName] ?? THEMES["glass-dark"].effects[effectName] ?? false
}
