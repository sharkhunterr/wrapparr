import { useState } from "react"
import { useActive, AN } from "../SharedUI"

function PosterStrip({ posters, accent }) {
  if (!posters.length) return null
  // Duplicate for seamless infinite scroll
  const items = [...posters, ...posters]

  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, height: 95, overflow: "hidden", zIndex: 1,
      mask: "linear-gradient(90deg,transparent,black 12%,black 88%,transparent)",
      WebkitMask: "linear-gradient(90deg,transparent,black 12%,black 88%,transparent)",
    }}>
      <div style={{
        display: "flex", gap: 8, animation: "poster-strip 25s linear infinite",
        width: "max-content", padding: "8px 0",
      }}>
        {items.map((p, i) => (
          <PosterCard key={i} src={p.thumb} title={p.t} accent={accent} emoji={p.emoji} />
        ))}
      </div>
    </div>
  )
}

function PosterCard({ src, title, accent, emoji }) {
  const [err, setErr] = useState(false)
  return (
    <div style={{
      width: 54, height: 76, borderRadius: 7, flexShrink: 0, overflow: "hidden",
      boxShadow: `0 4px 18px ${accent}25`, opacity: 0.6,
      border: "1px solid rgba(255,255,255,0.1)",
    }}>
      {src && !err ? (
        <img src={src} alt={title} onError={() => setErr(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{
          width: "100%", height: "100%", background: "linear-gradient(135deg,#1a1a2e,#16213e)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{emoji || "🎬"}</div>
      )}
    </div>
  )
}

function collectPosters(recapData) {
  if (!recapData) return []
  const posters = []
  const SERVICE_EMOJI = {
    tautulli: "🎬", plex: "🎬", jellyfin: "📺",
    romm: "🎮", audiobookshelf: "🎧", komga: "📚", booklore: "📖",
  }

  for (const [svc, data] of Object.entries(recapData)) {
    if (svc === "global" || !data || typeof data !== "object") continue
    const emoji = SERVICE_EMOJI[svc] || "🎬"

    // Films
    const filmsTop = data.extra?.films?.top || []
    for (const f of filmsTop.slice(0, 8)) {
      if (f.thumb) posters.push({ thumb: f.thumb, t: f.t, emoji })
    }

    // Series
    const seriesTop = data.extra?.series?.top || []
    for (const s of seriesTop.slice(0, 4)) {
      if (s.thumb) posters.push({ thumb: s.thumb, t: s.t, emoji })
    }

    // Top items (other services)
    if (!filmsTop.length && !seriesTop.length) {
      const top = data.top || []
      for (const t of top.slice(0, 4)) {
        if (t.thumb) posters.push({ thumb: t.thumb, t: t.t, emoji })
      }
    }
  }

  return posters
}

export default function FinaleSlide({ accent, userName, year, globalStats, recapData, onRestart }) {
  const active = useActive()
  const posters = collectPosters(recapData)

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>

      {/* Poster filmstrip */}
      <PosterStrip posters={posters} accent={accent} />

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
