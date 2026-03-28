import { createContext, useContext, useEffect, useState } from "react"
import { api } from "../services/api"

const ThemeContext = createContext(null)

export function useTheme() {
  return useContext(ThemeContext)
}

export default function ThemeProvider({ children, themeOverride }) {
  const [theme, setTheme] = useState(null)

  useEffect(() => {
    if (themeOverride) {
      setTheme(themeOverride)
      return
    }
    api("/themes/cinematic").then((t) => setTheme(t.config)).catch(() => {})
  }, [themeOverride])

  useEffect(() => {
    if (!theme?.palette) return
    const root = document.documentElement
    const p = theme.palette
    root.style.setProperty("--color-primary", p.primary || "#E5A00D")
    root.style.setProperty("--color-background", p.background || "#05050e")
    if (p.accents) {
      for (const [key, val] of Object.entries(p.accents)) {
        root.style.setProperty(`--accent-${key}`, val)
      }
    }
  }, [theme])

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
}
