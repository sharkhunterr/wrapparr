import { useState, useEffect, useRef } from "react"

const DEFAULT_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
  { min: 20, max: 50, name: "Cinephile du dimanche", desc: "Tu aimes bien te poser devant un film", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro du cinema", desc: "Les salles obscures n'ont plus de secrets", emoji: "🎬" },
  { min: 100, max: 200, name: "Machine a films", desc: "Tu enchaines les films sans relache", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien supreme", desc: "Tu vis et respires cinema", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende vivante", desc: "Tu as probablement vu plus de films que Spielberg", emoji: "👑" },
]

function AnimNum({ target, suffix = "", duration = 1800, accent }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])
  return <span style={{ color: accent, fontFamily: "JetBrains Mono,monospace" }}>{val}{suffix}</span>
}

function formatEquivalent(hours) {
  if (hours >= 720) return { value: (hours / 720).toFixed(1), unit: "mois", icon: "📅" }
  if (hours >= 168) return { value: (hours / 168).toFixed(1), unit: "semaines", icon: "🗓️" }
  if (hours >= 24) return { value: (hours / 24).toFixed(1), unit: "jours", icon: "☀️" }
  return { value: Math.round(hours), unit: "heures", icon: "⏱️" }
}

// Scrolling poster wall behind the content
function PosterWall({ films, accent }) {
  if (!films || films.length < 3) return null
  // Duplicate films to fill the wall
  const posters = [...films, ...films, ...films].filter((f) => f.thumb)
  if (posters.length < 6) return null

  return (
    <div style={{
      position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, opacity: 0.14,
      display: "flex", flexDirection: "column", justifyContent: "center",
    }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
        <div key={row} style={{
          display: "flex", gap: 8, padding: "4px 0",
          animation: `poster-scroll-${row % 2 === 0 ? "left" : "right"} ${20 + row * 3}s linear infinite`,
          width: "max-content",
        }}>
          {posters.concat(posters).slice(row * 5, row * 5 + 24).map((f, i) => (
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

export default function BilanFilmsSlide({ accent, data, year, config = {} }) {
  const categories = config.categories || DEFAULT_CATEGORIES
  const filmsExtra = data?.extra?.films || {}
  const allFilms = filmsExtra.top || data?.top || []
  const totalFilms = filmsExtra.total || allFilms.length
  const totalHours = filmsExtra.hours || 0
  const avgPerMonth = totalFilms > 0 ? (totalFilms / 12).toFixed(1) : 0
  const avgDuration = totalFilms > 0 ? Math.round((totalHours / totalFilms) * 60) : 0

  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 300))
    t.push(setTimeout(() => setPhase(2), 2200))
    t.push(setTimeout(() => setPhase(3), 3500))
    t.push(setTimeout(() => setPhase(4), 4800))
    return () => t.forEach(clearTimeout)
  }, [])

  if (!totalFilms) return null

  const equiv = formatEquivalent(totalHours)
  const category = categories.find((c) => totalHours >= c.min && totalHours < c.max) || categories[categories.length - 1]

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 560px)", width: "100%", position: "relative", minHeight: 400 }}>
      <PosterWall films={allFilms} accent={accent} />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="s0" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
          <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
            Ton bilan <span style={{ color: accent }}>cinema</span>
          </h2>
        </div>

        {/* Big numbers */}
        {phase >= 1 && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{
              flex: 1, padding: "14px 16px", borderRadius: 14, textAlign: "center",
              background: `linear-gradient(135deg, ${accent}30, ${accent}15)`,
              border: `1px solid ${accent}40`, boxShadow: `0 0 30px ${accent}15`,
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                <AnimNum target={totalFilms} accent={accent} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>films vus</div>
            </div>
            <div style={{
              flex: 1, padding: "14px 16px", borderRadius: 14, textAlign: "center",
              background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(8px)",
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1 }}>
                <AnimNum target={Math.round(totalHours)} suffix="h" accent="white" />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>de visionnage</div>
            </div>
          </div>
        )}

        {/* Time equivalent */}
        {phase >= 2 && (
          <div style={{
            textAlign: "center", padding: "12px 16px", borderRadius: 12, marginBottom: 14,
            background: accent + "20", border: "1px solid " + accent + "35",
            backdropFilter: "blur(8px)",
            animation: "slide-up 0.5s ease both",
          }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>C'est l'equivalent de</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span style={{ fontSize: 28 }}>{equiv.icon}</span>
              <div>
                <span style={{ fontSize: 28, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{equiv.value}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>{equiv.unit}</span>
              </div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 4 }}>
              passes devant un ecran, non-stop
            </div>
          </div>
        )}

        {/* Fun category */}
        {phase >= 3 && (
          <div style={{
            padding: "14px 16px", borderRadius: 14, marginBottom: 14,
            background: `linear-gradient(135deg, ${accent}25, ${accent}12)`,
            border: `1px solid ${accent}35`,
            backdropFilter: "blur(8px)",
            animation: "slide-up 0.5s ease both",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ fontSize: 40, filter: `drop-shadow(0 4px 12px ${accent}40)` }}>{category.emoji}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: accent }}>{category.name}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{category.desc}</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick stats */}
        {phase >= 4 && (
          <div style={{ display: "flex", gap: 6, animation: "slide-up 0.4s ease both" }}>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, textAlign: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{avgPerMonth}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>films / mois</div>
            </div>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, textAlign: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{avgDuration}min</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>duree moyenne</div>
            </div>
            <div style={{ flex: 1, padding: "8px 10px", borderRadius: 8, textAlign: "center", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(8px)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{allFilms.filter((f) => (f.plays || 0) > 1).length}</div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)" }}>revus</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
