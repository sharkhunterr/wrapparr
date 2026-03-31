import { useState, useEffect } from "react"
import { createPortal } from "react-dom"

export default function ComparisonButton({ active, onToggle, accent, year, visible }) {
  const [el, setEl] = useState(null)
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])
  if (!visible) return null
  const btn = <button
    onClick={onToggle}
    id="recap-compare-btn"
    title={active ? "Masquer la comparaison" : "Comparer avec " + (year - 1)}
    style={{
      background: active ? accent + "15" : "rgba(255,255,255,0.06)",
      border: `1px solid ${active ? accent + "40" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 6, color: active ? accent : "rgba(255,255,255,0.4)",
      fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 4,
      transition: "all .2s ease",
    }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
    Comparaison {year - 1}
  </button>
  if (el) return createPortal(btn, el)
  return null
}
