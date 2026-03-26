import { useState } from "react"
import { useActive, AN } from "../SharedUI"

function PosterWall({ posters }) {
  if (!posters || posters.length < 3) return null
  const items = [...posters, ...posters, ...posters].filter((p) => p.thumb)
  if (items.length < 6) return null

  return (
    <div style={{
      position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, opacity: 0.1,
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
        <div key={row} style={{
          display: "flex", gap: 8, padding: "4px 0",
          animation: `poster-scroll-${row % 2 === 0 ? "left" : "right"} ${18 + row * 3}s linear infinite`,
          width: "max-content",
        }}>
          {items.concat(items).slice(row * 5, row * 5 + 24).map((f, i) => (
            <img key={i} src={f.thumb} alt="" style={{
              width: 70, height: 100, borderRadius: 6, objectFit: "cover", flexShrink: 0,
            }} onError={(e) => { e.target.style.display = "none" }} />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes poster-scroll-left { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes poster-scroll-right { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
      `}</style>
    </div>
  )
}

function collectPosters(recapData, activeServices) {
  if (!recapData) return []
  const posters = []
  // Map "plex" back to "tautulli" since data keys use tautulli
  const ACTIVE_MAP = { plex: "tautulli", films: "tautulli" }
  const activeSvcs = new Set((activeServices || []).flatMap((s) => [s, ACTIVE_MAP[s] || s]))

  for (const [svc, data] of Object.entries(recapData)) {
    if (svc === "global" || svc === "users" || svc === "comparison" || !data || typeof data !== "object") continue
    if (activeServices && !activeSvcs.has(svc)) continue

    // Films
    const filmsTop = data.extra?.films?.top || []
    for (const f of filmsTop.slice(0, 8)) {
      if (f.thumb) posters.push({ thumb: f.thumb, t: f.t })
    }

    // Series
    const seriesTop = data.extra?.series?.top || []
    for (const s of seriesTop.slice(0, 4)) {
      if (s.thumb) posters.push({ thumb: s.thumb, t: s.t })
    }

    // Top items (other services)
    if (!filmsTop.length && !seriesTop.length) {
      const top = data.top || []
      for (const t of top.slice(0, 4)) {
        if (t.thumb) posters.push({ thumb: t.thumb, t: t.t })
      }
    }
  }

  return posters
}

export default function FinaleSlide({ accent, userName, year, globalStats, recapData, activeServices, onRestart }) {
  const active = useActive()
  const posters = collectPosters(recapData, activeServices)

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>

      {/* Poster wall background */}
      <PosterWall posters={posters} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 400, width: "100%", padding: "0 20px" }}>
        <div style={{ fontSize: 62, marginBottom: 12, animation: "float 2.5s ease-in-out infinite", filter: "drop-shadow(0 0 30px " + accent + "90)" }}>🏆</div>
        <div className="s0" style={{ fontSize: 8, color: "rgba(255,255,255,.2)", letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "JetBrains Mono,monospace", marginBottom: 10 }}>MERCI POUR CETTE BELLE ANNEE</div>
        <h1 className="s1" style={{ fontSize: "clamp(24px, 7vw, 38px)", fontWeight: 800, color: "white", lineHeight: 1.0, marginBottom: 14 }}>
          C'etait ton<br />
          <span style={{ backgroundImage: "linear-gradient(90deg,#E5A00D,#fb923c,#c084fc,#34d399,#60a5fa,#E5A00D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "300% auto", animation: "shimmer-t 4s linear infinite" }}>Wrapparr {year}</span>
        </h1>
        <div className="s2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { v: Math.round(globalStats.total_hours || 0), s: "h", l: "Heures totales", c: accent },
            { v: globalStats.total_items || 0, s: "", l: "Contenus", c: "#a78bfa" },
            { v: globalStats.services_count || 0, s: " services", l: "Plateformes", c: "#34d399" },
          ].map((item, i) => (
            <div key={item.l} style={{ padding: "10px 12px", borderRadius: 12, background: item.c + "12", border: "1px solid " + item.c + "28", animation: "stat-row-in .5s ease " + (0.2 + i * 0.08) + "s both" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.c, lineHeight: 1 }}>{active ? <AN t={item.v} s={item.s} /> : "0" + item.s}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div className="s5" style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ padding: "12px 28px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 14, fontWeight: 800, boxShadow: "0 0 60px " + accent + "50" }}>Partager</button>
          {onRestart && <button onClick={onRestart} style={{ padding: "12px 28px", borderRadius: 40, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.35)", fontSize: 13, border: "1px solid rgba(255,255,255,.1)" }}>Rejouer</button>}
        </div>
      </div>
    </div>
  )
}
