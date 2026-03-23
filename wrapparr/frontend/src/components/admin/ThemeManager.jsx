import { useState, useEffect } from "react"
import { Palette, Plus, Trash2, Check } from "lucide-react"
import { api } from "../../services/api"

export default function ThemeManager() {
  const [themes, setThemes] = useState([])
  const [activeId, setActiveId] = useState(null)
  const [newName, setNewName] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api("/themes").then(setThemes).catch(() => {})
    api("/auth/me").then((u) => setActiveId(u.theme_pack_id)).catch(() => {})
  }, [])

  const selectTheme = async (id) => {
    setSaving(true)
    try {
      await api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: id } })
      setActiveId(id)
    } catch (e) {
      alert(e.message)
    }
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

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Palette size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Themes</h2>
      </div>
      <p style={desc}>Selectionnez le theme actif pour le recap. Le theme definit les couleurs, effets et transitions de toutes les slides.</p>

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

      {saving && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "JetBrains Mono,monospace", marginBottom: 12 }}>application du theme...</div>}

      <div style={{ display: "flex", gap: 8, maxWidth: 400 }}>
        <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nom du nouveau theme..."
          style={input} />
        <button onClick={createTheme} style={btnAccent}>
          <Plus size={14} strokeWidth={2} /> Creer
        </button>
      </div>
    </div>
  )
}

const h2 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontFamily: "Nunito,sans-serif", fontSize: 12, marginBottom: 20 }
const input = { flex: 1, padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", outline: "none" }
const btnAccent = { display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, border: "none", background: "#E5A00D", color: "#05050e", fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "Nunito,sans-serif" }
