import { useState, useEffect, useRef } from "react"

function AnimNum({ target, suffix = "", delay = 0 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const t = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - start) / 1500)
        setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
        if (p < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [target, delay])
  return <>{val}{suffix}</>
}

export default function SectionResumeSlide({ accent, data, year, section = "films" }) {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 300))
    t.push(setTimeout(() => setPhase(2), 1800))
    t.push(setTimeout(() => setPhase(3), 3000))
    return () => t.forEach(clearTimeout)
  }, [])

  const extra = data?.extra || {}
  const isFilms = section === "films"
  const sectionData = isFilms ? extra.films : extra.series

  if (!sectionData) return null

  const totalItems = isFilms ? (sectionData.total || 0) : (sectionData.episodes || 0)
  const totalHours = sectionData.hours || 0
  const top = (sectionData.top || []).slice(0, 3)
  const genres = (isFilms ? extra.top_genres : extra.series_genres) || []
  const countries = extra.countries || []
  const actors = (isFilms ? extra.actors : extra.series_actors) || []
  const ratings = extra.ratings || []
  const peak = (isFilms ? sectionData.peak_stats : extra.peak_stats) || {}
  const budgets = extra.budgets || {}

  // Compute highlights
  const topFilm = top[0]
  const topGenre = genres[0]
  const topActor = actors[0]
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.r, 0) / ratings.length).toFixed(1) : null
  const topCountry = countries[0]
  const bestMonth = peak.best_month
  const avgBudget = budgets.average

  const highlights = [
    totalItems > 0 && { icon: isFilms ? "🎬" : "📺", value: totalItems, label: isFilms ? "films" : "episodes", accent: true },
    totalHours > 0 && { icon: "⏱️", value: Math.round(totalHours) + "h", label: "de visionnage", accent: false },
    topFilm && { icon: "👑", value: topFilm.t, label: isFilms ? "#1 le plus vu" : "#1 serie", accent: true, isText: true },
    topGenre && { icon: "🎭", value: topGenre.n, label: topGenre.v + " " + (isFilms ? "films" : "series"), accent: false, isText: true },
    avgRating && { icon: "⭐", value: avgRating + "/10", label: "note moyenne", accent: true },
    topActor && { icon: "🎭", value: topActor.name, label: topActor.count + " apparitions", accent: false, isText: true },
    topCountry && { icon: "🌍", value: topCountry.name, label: topCountry.count + " films", accent: false, isText: true },
    bestMonth && { icon: "📅", value: bestMonth.month, label: bestMonth.views + " vues", accent: false, isText: true },
    avgBudget && { icon: "💰", value: avgBudget >= 1e6 ? Math.round(avgBudget / 1e6) + "M$" : Math.round(avgBudget / 1e3) + "K$", label: "budget moyen", accent: true },
  ].filter(Boolean)

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 560px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(20px, 6vw, 30px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          En resume<span style={{ color: accent }}>.</span>
        </h2>
      </div>

      {/* Animated highlight cards */}
      {phase >= 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {highlights.map((h, i) => {
            const delay = i * 0.12
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 10,
                background: h.accent
                  ? `linear-gradient(135deg, ${accent}18, ${accent}08)`
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${h.accent ? accent + "28" : "rgba(255,255,255,0.06)"}`,
                animation: `slide-up 0.4s ease ${delay}s both`,
                opacity: 0,
              }}>
                <div style={{ fontSize: 20, flexShrink: 0, width: 28, textAlign: "center" }}>{h.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: h.isText ? 13 : 22,
                    fontWeight: 800,
                    color: h.accent ? accent : "white",
                    fontFamily: h.isText ? "Nunito,sans-serif" : "JetBrains Mono,monospace",
                    lineHeight: 1.1,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
                    {typeof h.value === "number" ? <AnimNum target={h.value} delay={delay * 1000 + 300} /> : h.value}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{h.label}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Top 3 posters strip */}
      {phase >= 2 && top.length > 0 && (
        <div style={{ marginTop: 14, animation: "slide-up 0.5s ease both" }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
            Top {isFilms ? "films" : "series"}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {top.map((item, i) => (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  {item.thumb ? (
                    <img src={item.thumb} alt="" style={{
                      width: "100%", height: 90, borderRadius: 8, objectFit: "cover",
                      border: i === 0 ? `2px solid ${accent}` : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: i === 0 ? `0 4px 16px ${accent}30` : "none",
                    }} onError={(e) => { e.target.style.display = "none" }} />
                  ) : (
                    <div style={{ width: "100%", height: 90, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}
                    </div>
                  )}
                  <div style={{
                    position: "absolute", top: -6, left: -6,
                    width: 20, height: 20, borderRadius: "50%",
                    background: i === 0 ? accent : "rgba(255,255,255,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: i === 0 ? "#000" : "white",
                    boxShadow: i === 0 ? `0 2px 8px ${accent}50` : "none",
                  }}>{i + 1}</div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: i === 0 ? accent : "rgba(255,255,255,0.5)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.t}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing line */}
      {phase >= 3 && (
        <div style={{ marginTop: 16, textAlign: "center", animation: "slide-up 0.4s ease both" }}>
          <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${accent}40, transparent)`, marginBottom: 8 }} />
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
            {isFilms ? "Place aux series" : "La suite arrive"} →
          </div>
        </div>
      )}
    </div>
  )
}
