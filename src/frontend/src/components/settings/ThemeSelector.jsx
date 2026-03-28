import { useState, useEffect } from "react"
import { api } from "../../services/api"

export default function ThemeSelector() {
  const [themes, setThemes] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api("/themes").then(setThemes).catch(() => {})
  }, [])

  const selectTheme = async (theme) => {
    setSelected(theme.id)
    try {
      await api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: theme.id } })
    } catch {}
  }

  return (
    <div style={{ maxWidth: 500 }}>
      <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 20, marginBottom: 16 }}>Thème visuel</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
        {themes.map((t) => {
          const primary = t.config?.palette?.primary || "#E5A00D"
          const bg = t.config?.palette?.background || "#05050e"
          const isSelected = selected === t.id

          return (
            <div key={t.id} onClick={() => selectTheme(t)} style={{
              padding: 16, borderRadius: 12, cursor: "pointer",
              background: bg, border: `2px solid ${isSelected ? primary : "rgba(255,255,255,0.06)"}`,
              transition: "border-color 0.2s",
            }}>
              <div style={{ width: "100%", height: 40, borderRadius: 6, marginBottom: 8,
                background: `linear-gradient(135deg, ${primary}, ${primary}66)` }} />
              <div style={{ fontSize: 13, fontWeight: 600, color: "white", fontFamily: "Nunito,sans-serif" }}>{t.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "Nunito,sans-serif", marginTop: 2 }}>
                {t.is_builtin ? "Intégré" : "Personnalisé"}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
