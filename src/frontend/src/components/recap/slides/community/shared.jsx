import { useState } from "react"

export const USER_COLORS = ["#E5A00D", "#60a5fa", "#f472b6", "#4ade80", "#a78bfa", "#fb923c", "#38bdf8", "#f87171", "#34d399", "#fbbf24"]

// Inject global keyframes once
if (typeof document !== "undefined" && !document.getElementById("community-keyframes")) {
  const style = document.createElement("style")
  style.id = "community-keyframes"
  style.textContent = `
    @keyframes badge-shine { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
    @keyframes comm-scroll-l { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes comm-scroll-r { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
    @keyframes poster-fly-in {
      0% { transform: scale(0.3) translateY(40px); opacity: 0; filter: brightness(2); }
      40% { transform: scale(1.3) translateY(-10px); opacity: 1; filter: brightness(1.5); }
      100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1); }
    }
  `
  document.head.appendChild(style)
}

export function PosterImg({ src, size = 50 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 6, flexShrink: 0, background: "var(--th-border-dim)" }} />
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 6, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 12px rgba(0,0,0,0.5)" }} />
}

export function MultiUserTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: "var(--th-radius-xs)", padding: "6px 10px", fontSize: 10, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>
    <div style={{ color: "var(--th-text-tertiary)", marginBottom: 3 }}>{label}</div>
    {payload.map((p) => (
      <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{p.dataKey}</span><span style={{ fontWeight: 700 }}>{p.value}</span>
      </div>
    ))}
  </div>
}
