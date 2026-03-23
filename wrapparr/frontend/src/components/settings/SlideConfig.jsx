import { useState, useEffect } from "react"
import { api } from "../../services/api"

export default function SlideConfigPanel() {
  const [slides, setSlides] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api("/slides/config").then(setSlides).catch(() => {})
  }, [])

  const toggle = (idx) => {
    const next = [...slides]
    if (next[idx].slide_id === "intro" || next[idx].slide_id === "finale") return
    next[idx] = { ...next[idx], enabled: !next[idx].enabled }
    setSlides(next)
  }

  const moveUp = (idx) => {
    if (idx <= 1) return // intro stays at 0
    const next = [...slides]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    next.forEach((s, i) => (s.sort_order = i))
    setSlides(next)
  }

  const moveDown = (idx) => {
    if (idx >= slides.length - 2) return // finale stays last
    const next = [...slides]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    next.forEach((s, i) => (s.sort_order = i))
    setSlides(next)
  }

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api("/slides/config", { method: "PUT", body: { slides } })
      setSlides(updated)
    } catch {}
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 20, marginBottom: 16 }}>Configuration des slides</h2>
      {slides.map((s, i) => (
        <div key={s.slide_id} style={{
          display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4,
          background: s.enabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)",
          borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
        }}>
          <span style={{ fontSize: 13, color: s.enabled ? "white" : "rgba(255,255,255,0.3)", flex: 1, fontFamily: "Nunito,sans-serif" }}>
            {s.slide_id}
          </span>
          <button onClick={() => moveUp(i)} style={btnStyle} disabled={i <= 1}>↑</button>
          <button onClick={() => moveDown(i)} style={btnStyle} disabled={i >= slides.length - 2}>↓</button>
          <button onClick={() => toggle(i)} style={{ ...btnStyle, color: s.enabled ? "#4ade80" : "#f87171" }}>
            {s.enabled ? "ON" : "OFF"}
          </button>
        </div>
      ))}
      <button onClick={save} disabled={saving} style={{
        marginTop: 12, padding: "10px 24px", borderRadius: 8, border: "none",
        background: "#E5A00D", color: "#05050e", fontWeight: 700, fontFamily: "Nunito,sans-serif",
        cursor: saving ? "wait" : "pointer",
      }}>
        {saving ? "..." : "Enregistrer"}
      </button>
    </div>
  )
}

const btnStyle = { background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 12, padding: "4px 8px", cursor: "pointer" }
