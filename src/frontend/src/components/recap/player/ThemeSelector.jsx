import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { getAllThemes } from "../themes"

export default function ThemeSelector({ currentThemeId, onSelect }) {
  const [el, setEl] = useState(null)
  const [open, setOpen] = useState(false)
  const allThemes = getAllThemes()
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])
  const current = allThemes.find((t) => t.id === currentThemeId) || allThemes[0]

  const picker = <div style={{ position: "relative" }}>
    <button
      onClick={() => setOpen(!open)}
      title="Changer le theme"
      style={{
        background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: "1px solid " + (open ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"),
        borderRadius: 6, color: "rgba(255,255,255,0.4)",
        fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
        transition: "all .2s ease",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    </button>
    {open && <div style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 300,
      background: "rgba(10,10,15,0.95)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: 6, minWidth: 160,
      backdropFilter: "blur(12px)", boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    }}>
      {allThemes.map((t) => (
        <button key={t.id} onClick={() => { onSelect(t); setOpen(false) }} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "7px 10px", borderRadius: 5, border: "none", cursor: "pointer",
          background: t.id === currentThemeId ? "rgba(255,255,255,0.08)" : "transparent",
          color: t.id === currentThemeId ? "white" : "rgba(255,255,255,0.5)",
          fontSize: 11, fontFamily: "Nunito,sans-serif", textAlign: "left",
          transition: "background 0.15s ease",
        }}>
          <div style={{ width: 18, height: 10, borderRadius: 2, background: t.preview, flexShrink: 0 }} />
          {t.name}
        </button>
      ))}
    </div>}
  </div>

  if (el) return createPortal(picker, el)
  return null
}
