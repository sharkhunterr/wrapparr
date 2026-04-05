import { createContext, useContext, useState, useEffect, useCallback } from "react"
import fr from "./fr.json"
import en from "./en.json"
import de from "./de.json"
import es from "./es.json"
import it from "./it.json"

const LANGS = { fr, en, de, es, it }
export const LANG_OPTIONS = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
]

const I18nContext = createContext({ t: (k) => k, lang: "fr", setLang: () => {} })

export function I18nProvider({ children, initialLang = "fr" }) {
  const [lang, setLangState] = useState(initialLang)
  const strings = LANGS[lang] || LANGS.fr

  const setLang = useCallback((l) => {
    setLangState(l)
    localStorage.setItem("wrapparr_lang", l)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("wrapparr_lang")
    if (saved && LANGS[saved]) setLangState(saved)
  }, [])

  const t = useCallback((key, vars) => {
    let val = key.split(".").reduce((o, k) => o?.[k], strings)
    if (val === undefined) {
      // Fallback to French
      val = key.split(".").reduce((o, k) => o?.[k], LANGS.fr)
    }
    if (val === undefined) return key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => { val = val.replace(`{${k}}`, v) })
    }
    return val
  }, [strings])

  return <I18nContext.Provider value={{ t, lang, setLang }}>{children}</I18nContext.Provider>
}

export function useI18n() { return useContext(I18nContext) }
export default useI18n
