/**
 * FilmDigestSlide.jsx — Combined habits + bilan slide.
 * Shows: day chart, time chart, best day/month, equivalent time, fun category,
 * with scrolling poster wall background.
 */

import { useState, useEffect, useRef } from "react"
import { DayChart, TimeChart } from "../SharedUI"

const DEFAULT_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
  { min: 20, max: 50, name: "Cinephile du dimanche", desc: "Tu aimes bien te poser devant un film", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro du cinema", desc: "Les salles obscures n'ont plus de secrets", emoji: "🎬" },
  { min: 100, max: 200, name: "Machine a films", desc: "Tu enchaines les films sans relache", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien supreme", desc: "Tu vis et respires cinema", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende vivante", desc: "Tu as probablement vu plus de films que Spielberg", emoji: "👑" },
]

function formatEquivalent(hours) {
  if (hours >= 720) return { value: (hours / 720).toFixed(1), unit: "mois", icon: "📅" }
  if (hours >= 168) return { value: (hours / 168).toFixed(1), unit: "semaines", icon: "🗓️" }
  if (hours >= 24) return { value: (hours / 24).toFixed(1), unit: "jours", icon: "☀️" }
  return { value: Math.round(hours), unit: "heures", icon: "⏱️" }
}

function AnimNum({ target, suffix = "", delay = 0, color }) {
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
  return <span style={{ color, fontFamily: "JetBrains Mono,monospace" }}>{val}{suffix}</span>
}

function PosterWall({ films }) {
  const posters = [...films, ...films, ...films].filter((f) => f.thumb)
  if (posters.length < 6) return null
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, opacity: 0.12, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
        <div key={row} style={{ display: "flex", gap: 8, padding: "4px 0", animation: `poster-scroll-${row % 2 === 0 ? "left" : "right"} ${20 + row * 3}s linear infinite`, width: "max-content" }}>
          {posters.concat(posters).slice(row * 5, row * 5 + 24).map((f, i) => (
            <img key={i} src={f.thumb} alt="" style={{ width: 65, height: 94, borderRadius: 5, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />
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

export default function FilmDigestSlide({ accent, data, year, config = {} }) {
  const categories = config.categories || DEFAULT_CATEGORIES
  const filmsExtra = data?.extra?.films || {}
  const allFilms = filmsExtra.top || data?.top || []
  const totalFilms = filmsExtra.total || allFilms.length
  const totalHours = filmsExtra.hours || 0
  const dayData = filmsExtra.day_of_week || data.day_of_week || []
  const timeData = filmsExtra.time_of_day || data.time_of_day || []
  const peak = filmsExtra.peak_stats || data.extra?.peak_stats || {}
  const bestDay = peak.best_day
  const bestMonth = peak.best_month
  const totalViews = peak.total_views || 0

  const [phase, setPhase] = useState(0)
  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 300))
    t.push(setTimeout(() => setPhase(2), 2000))
    t.push(setTimeout(() => setPhase(3), 3500))
    return () => t.forEach(clearTimeout)
  }, [])

  if (!totalFilms) return null

  const equiv = formatEquivalent(totalHours)
  const category = categories.find((c) => totalHours >= c.min && totalHours < c.max) || categories[categories.length - 1]

  return (
    <div style={{ maxWidth: 460, width: "100%", position: "relative" }}>
      <PosterWall films={allFilms} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="s0" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
          <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
            Ton digest <span style={{ color: accent }}>cinema</span>
          </h2>
        </div>

        {/* Badges */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: accent + "25", border: "1px solid " + accent + "40", backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}><AnimNum target={totalFilms} color={accent} delay={300} /></span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>films</span>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: 16, fontWeight: 800 }}><AnimNum target={Math.round(totalHours)} suffix="h" color="white" delay={300} /></span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)" }}>passees</span>
          </div>
        </div>

        {/* Day + Time charts */}
        {phase >= 1 && (
          <>
            {dayData.length > 0 && <div className="glass" style={{ padding: "8px 10px", marginBottom: 6, backdropFilter: "blur(8px)" }}><div style={{ fontSize: 8, color: accent, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Jour prefere</div><DayChart data={dayData} accent={accent} height={80} /></div>}
            {timeData.length > 0 && <div className="glass" style={{ padding: "8px 10px", marginBottom: 6, backdropFilter: "blur(8px)" }}><div style={{ fontSize: 8, color: accent, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Heure de consommation</div><TimeChart data={timeData} accent={accent} height={80} /></div>}
          </>
        )}

        {/* Best day + month + equivalent */}
        {phase >= 2 && (
          <div style={{ display: "flex", gap: 6, marginBottom: 8, animation: "slide-up 0.4s ease both" }}>
            {bestMonth && (
              <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: accent + "20", border: "1px solid " + accent + "30", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em" }}>Mois en or</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{bestMonth.month}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{bestMonth.views} vues · {bestMonth.hours}h</div>
              </div>
            )}
            {bestDay && (
              <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" }}>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em" }}>Journee record</div>
                <div style={{ fontSize: 11, fontWeight: 800, color: "white", lineHeight: 1.1 }}>{bestDay.day_name} {bestDay.day} {bestDay.month}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{bestDay.views} vues · {bestDay.hours}h</div>
              </div>
            )}
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, background: accent + "15", border: "1px solid " + accent + "25", backdropFilter: "blur(8px)", textAlign: "center" }}>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em" }}>Equivalent</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{equiv.value}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{equiv.unit} {equiv.icon}</div>
            </div>
          </div>
        )}

        {/* Fun category */}
        {phase >= 3 && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "10px 14px", borderRadius: 10,
            background: `linear-gradient(135deg, ${accent}22, ${accent}0a)`,
            border: `1px solid ${accent}30`,
            backdropFilter: "blur(8px)",
            animation: "slide-up 0.5s ease both",
          }}>
            <div style={{ fontSize: 32, filter: `drop-shadow(0 4px 12px ${accent}40)` }}>{category.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: accent }}>{category.name}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{category.desc}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
