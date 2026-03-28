import { useState, useEffect } from "react"
import { Palette, Plus, Trash2, Check, Sparkles, ToggleLeft, ToggleRight } from "lucide-react"
import { api } from "../../services/api"
import { getAllThemes } from "../recap/themes"

const VISUAL_THEMES = getAllThemes()

const EFFECT_LABELS = {
  stars: "Etoiles", orbs: "Orbes", grain: "Grain", spotlights: "Projecteurs",
  confetti: "Confettis", fireworks: "Feux d'artifice", scanlines: "Scanlines",
  grid: "Grille", vhs: "VHS / CRT", filmGrain: "Grain pellicule",
  matrixRain: "Pluie de code", xmasLights: "Guirlande", hyperspace: "Hyperespace",
  waves: "Vagues", compass: "Boussole", spores: "Spores", dimensionCrack: "Breche",
  holoScan: "Scan hologramme", starStreaks: "Etoiles filantes", glitchText: "Glitch texte",
  arcadeBorder: "Bordure arcade", digitalGlitch: "Glitch digital", greenPulse: "Pulse vert",
  screenOff: "Ecran CRT", sabers: "Sabres laser",
  terminalOverlay: "Terminal MUTHUR",
  filmStrip: "Bandes pellicule", silentSlate: "Ardoise transition",
  noirRain: "Pluie noir", noirDesaturate: "Desaturation", noirBlinds: "Store venitien",
  stBars: "Barres LED rouges",
  caustics: "Caustiques", biolum: "Bioluminescence", bubbles: "Bulles",
}

export default function ThemeManager() {
  const [themes, setThemes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)
  const [globalConfig, setGlobalConfig] = useState({})
  const [effectOverrides, setEffectOverrides] = useState({})

  useEffect(() => {
    api("/themes").then(setThemes).catch(() => {})
    api("/admin/config").then((cfg) => {
      setGlobalConfig(cfg)
      setEffectOverrides(cfg.visual_theme_effects || {})
      if (cfg.active_theme) setActiveId(cfg.active_theme)
      else api("/auth/me").then((u) => setActiveId(u.theme_pack_id)).catch(() => {})
    }).catch(() => {
      api("/auth/me").then((u) => setActiveId(u.theme_pack_id)).catch(() => {})
    })
  }, [])

  const selectTheme = async (id) => {
    setSaving(true)
    try {
      await api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: id } })
      await api("/admin/config", { method: "PATCH", body: { active_theme: id } })
      setActiveId(id)
    } catch (e) {
      alert(e.message)
    }
    setSaving(false)
  }

  const selectVisualTheme = async (id) => {
    setSaving(true)
    setGlobalConfig({ ...globalConfig, visual_theme: id })
    setEffectOverrides({})
    const vt = VISUAL_THEMES.find((t) => t.id === id)
    const updates = { visual_theme: id, visual_theme_effects: {} }
    // Auto-select matching palette if the theme has one
    if (vt?.defaultPalette) {
      const matchingPalette = themes.find((t) => t.slug === vt.defaultPalette || t.name?.toLowerCase() === vt.defaultPalette)
      if (matchingPalette) {
        await api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: matchingPalette.id } })
        await api("/admin/config", { method: "PATCH", body: { ...updates, active_theme: matchingPalette.id } })
        setActiveId(matchingPalette.id)
        setSaving(false)
        return
      }
    }
    await api("/admin/config", { method: "PATCH", body: updates })
    setSaving(false)
  }

  const toggleEffect = async (key, currentValue) => {
    const next = { ...effectOverrides, [key]: !currentValue }
    setEffectOverrides(next)
    setSaving(true)
    await api("/admin/config", { method: "PATCH", body: { visual_theme_effects: next } })
    setSaving(false)
  }

  const createTheme = async () => {
    if (!newName.trim()) return
    const created = await api("/themes/admin/themes", {
      method: "POST",
      body: {
        name: newName,
        config: {
          palette: { primary: "#E5A00D", background: "#05050e", accents: { films: "#E5A00D", series: "#E87C2A", romm: "#34d399", audio: "#fb923c", komga: "#c084fc", booklore: "#a78bfa" } },
          card_style: "glass", transition: "slide-up", particles: true, orbs: true,
          grain: true, spotlights: true, finale_effect: "fireworks",
        },
      },
    })
    setThemes([...themes, created])
    setNewName("")
  }

  const deleteTheme = async (id) => {
    await api(`/themes/admin/themes/${id}`, { method: "DELETE" })
    setThemes(themes.filter((t) => t.id !== id))
    if (activeId === id) setActiveId(null)
  }

  const activeVisualTheme = globalConfig.visual_theme || "glass-dark"
  const activeThemeObj = VISUAL_THEMES.find((t) => t.id === activeVisualTheme) || VISUAL_THEMES[0]

  // Merge theme defaults with user overrides
  const resolvedEffects = { ...activeThemeObj.effects, ...effectOverrides }

  return (
    <div>
      {/* ═══ SECTION 1: Theme visuel ═══ */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Sparkles size={20} color="#E5A00D" strokeWidth={1.5} />
          <h2 style={h2}>Style visuel</h2>
        </div>
        <p style={desc}>Definit l'ambiance globale du recap : effets, surfaces, bordures, typographie et vocabulaire des slides.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
          {VISUAL_THEMES.map((t) => {
            const isActive = activeVisualTheme === t.id
            return (
              <button key={t.id} onClick={() => selectVisualTheme(t.id)} style={{
                padding: "16px 14px", borderRadius: 12, cursor: "pointer", textAlign: "left",
                background: isActive ? "rgba(229,160,13,0.08)" : "rgba(255,255,255,0.02)",
                border: isActive ? "2px solid #E5A00D" : "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s ease", position: "relative",
              }}>
                {isActive && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 20, height: 20, borderRadius: "50%", background: "#E5A00D", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={12} color="#000" strokeWidth={2.5} />
                  </div>
                )}
                <div style={{ width: "100%", height: 36, borderRadius: 6, marginBottom: 10, background: t.preview }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#E5A00D" : "white", fontFamily: "Nunito,sans-serif" }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, fontFamily: "Nunito,sans-serif" }}>{t.description}</div>
                {t.defaultPalette && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 4, fontFamily: "JetBrains Mono,monospace" }}>palette: {t.defaultPalette}</div>}
              </button>
            )
          })}
        </div>
      </div>

      {/* ═══ Effect toggles for active theme ═══ */}
      <div style={{ marginBottom: 36, padding: "16px 18px", borderRadius: 12, background: "rgba(229,160,13,0.04)", border: "1px solid rgba(229,160,13,0.12)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#E5A00D", fontFamily: "Nunito,sans-serif", marginBottom: 4 }}>
          Effets — {activeThemeObj.name}
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 14, fontFamily: "Nunito,sans-serif" }}>
          Activez ou desactivez chaque effet independamment.
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(activeThemeObj.effects || {}).map(([key, defaultVal]) => {
            const isOn = effectOverrides[key] !== undefined ? effectOverrides[key] : defaultVal
            const label = EFFECT_LABELS[key] || key
            return (
              <button key={key} onClick={() => toggleEffect(key, isOn)} style={{
                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                fontFamily: "Nunito,sans-serif", transition: "all .15s ease",
                background: isOn ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.03)",
                color: isOn ? "#4ade80" : "rgba(255,255,255,0.3)",
              }}>
                {isOn ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 36 }} />

      {/* ═══ SECTION 2: Palette de couleurs ═══ */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Palette size={20} color="#E5A00D" strokeWidth={1.5} />
          <h2 style={h2}>Palette de couleurs</h2>
        </div>
        <p style={desc}>Definit les couleurs d'accent pour chaque section du recap. Independant du style visuel.</p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
          {themes.map((t) => {
            const primary = t.config?.palette?.primary || "#E5A00D"
            const bg = t.config?.palette?.background || "#05050e"
            const isActive = activeId === t.id
            return (
              <div key={t.id} onClick={() => selectTheme(t.id)} style={{
                padding: "16px 14px", borderRadius: 14, background: bg, cursor: "pointer",
                border: `2px solid ${isActive ? primary : "rgba(255,255,255,0.06)"}`,
                boxShadow: isActive ? `0 0 20px ${primary}30` : "none",
                transition: "all 0.2s", position: "relative",
              }}>
                {isActive && (
                  <div style={{ position: "absolute", top: 10, right: 10, width: 22, height: 22, borderRadius: "50%", background: primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Check size={13} color="#000" strokeWidth={2.5} />
                  </div>
                )}
                <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
                  {Object.values(t.config?.palette?.accents || { _: primary }).slice(0, 6).map((c, i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: c }} />
                  ))}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", fontFamily: "Nunito,sans-serif", marginBottom: 2 }}>{t.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono,monospace" }}>
                  {t.is_builtin ? "integre" : "personnalise"}
                </div>
                {!t.is_builtin && (
                  <button onClick={(e) => { e.stopPropagation(); deleteTheme(t.id) }} style={{
                    position: "absolute", bottom: 10, right: 10, background: "none", border: "none",
                    color: "rgba(255,255,255,0.15)", cursor: "pointer",
                  }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ display: "flex", gap: 8, maxWidth: 400 }}>
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom de la nouvelle palette..."
            style={input} />
          <button onClick={createTheme} style={btnAccent}>
            <Plus size={14} strokeWidth={2} /> Creer
          </button>
        </div>
      </div>

      {saving && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "JetBrains Mono,monospace", marginTop: 12 }}>sauvegarde...</div>}
    </div>
  )
}

const h2 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontFamily: "Nunito,sans-serif", fontSize: 12, marginBottom: 20 }
const input = { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", outline: "none" }
const btnAccent = { display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, border: "none", background: "#E5A00D", color: "#05050e", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Nunito,sans-serif" }
