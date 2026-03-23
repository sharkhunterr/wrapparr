import { useState, useEffect, useRef } from "react"

const DEFAULT_PROFILES = [
  { min: 1900, max: 1949, name: "Cinephile classique", desc: "Tes films datent de l'age d'or du cinema", emoji: "🎩" },
  { min: 1950, max: 1979, name: "Nostalgique", desc: "Tu adores les grandes fresques et le cinema d'auteur", emoji: "📽️" },
  { min: 1980, max: 1999, name: "Enfant des 80s-90s", desc: "Action, aventure, et blockbusters — ton epoque", emoji: "📼" },
  { min: 2000, max: 2014, name: "Millenial", desc: "Tu as grandi avec les franchises et le cinema numerique", emoji: "🎬" },
  { min: 2015, max: 2030, name: "Ultra-moderne", desc: "Toujours a la pointe, tu regardes les sorties recentes", emoji: "🚀" },
]

const DECADES = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]

function getProfile(avgYear, profiles) {
  return profiles.find((p) => avgYear >= p.min && avgYear <= p.max) || profiles[profiles.length - 1]
}

export default function FilmTimelineSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 8000
  const profiles = config.profiles || DEFAULT_PROFILES
  const top = data?.top || []
  const extra = data?.extra || {}
  const allFilms = [...(extra.films?.top || []), ...top]

  // Build year distribution
  const yearCounts = {}
  let totalWeighted = 0, totalCount = 0
  for (const film of allFilms) {
    const y = film.y || film.year
    if (y && y > 1890) {
      const plays = film.plays || 1
      yearCounts[y] = (yearCounts[y] || 0) + plays
      totalWeighted += y * plays
      totalCount += plays
    }
  }

  const avgYear = totalCount > 0 ? Math.round(totalWeighted / totalCount) : 2020
  const profile = getProfile(avgYear, profiles)

  // Decade buckets
  const decadeBuckets = {}
  for (const [y, count] of Object.entries(yearCounts)) {
    const decade = Math.floor(parseInt(y) / 10) * 10
    decadeBuckets[decade] = (decadeBuckets[decade] || 0) + count
  }
  const maxBucket = Math.max(1, ...Object.values(decadeBuckets))

  const minYear = 1900
  const maxYear = Math.max(2030, new Date().getFullYear())
  const range = maxYear - minYear

  // Animation
  const [phase, setPhase] = useState(0) // 0=idle, 1=cursor, 2=profile, 3=bars, 4=done
  const [cursorPos, setCursorPos] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => {
      setPhase(1)
      startRef.current = performance.now()
      const dur = animSpeed * 0.4
      const targetPos = ((avgYear - minYear) / range) * 100
      const tick = (now) => {
        const p = Math.min(1, (now - startRef.current) / dur)
        setCursorPos((1 - Math.pow(1 - p, 3)) * targetPos)
        if (p < 1) rafRef.current = requestAnimationFrame(tick)
        else setPhase(2)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 600))
    t.push(setTimeout(() => setPhase(3), 600 + animSpeed * 0.45))
    t.push(setTimeout(() => setPhase(4), 600 + animSpeed * 0.85))
    return () => { t.forEach(clearTimeout); cancelAnimationFrame(rafRef.current) }
  }, [animSpeed, avgYear, range])

  const barsGrowing = phase >= 3
  const done = phase >= 4
  const TIMELINE_H = 80 // max bar height in px

  return (
    <div style={{ maxWidth: 430, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Ton profil <span style={{ color: accent }}>cinephile</span>
        </h2>
      </div>

      {/* Profile card — shown after cursor arrives */}
      {phase >= 2 && (
        <div style={{
          padding: "12px 14px", borderRadius: 12, marginBottom: 16,
          background: accent + "0a", border: "1px solid " + accent + "20",
          animation: "slide-up 0.5s ease both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 26 }}>{profile.emoji}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{profile.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{profile.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline with vertical bars */}
      <div style={{ position: "relative", padding: "0 8px" }}>

        {/* Vertical bars area — positioned above the track line */}
        <div style={{ position: "relative", height: TIMELINE_H, marginBottom: 4 }}>
          {DECADES.map((decade, i) => {
            const count = decadeBuckets[decade] || 0
            const pct = count > 0 ? (count / maxBucket) * 100 : 0
            const left = ((decade - minYear) / range) * 100
            const barW = (10 / range) * 100 // width = 10 years
            const isAvgDecade = Math.floor(avgYear / 10) * 10 === decade
            const color = isAvgDecade ? accent : (count > 0 ? accent + "70" : "rgba(255,255,255,0.04)")
            const delay = i * 0.06

            return (
              <div key={decade} style={{
                position: "absolute", bottom: 0, left: left + "%", width: Math.max(barW, 3) + "%",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                height: "100%",
              }}>
                {/* Bar */}
                <div style={{
                  width: "70%", borderRadius: "3px 3px 0 0",
                  background: color,
                  height: (barsGrowing || done) ? (pct * TIMELINE_H / 100) + "px" : "0px",
                  transition: "height 0.8s cubic-bezier(0.25,0.46,0.45,0.94) " + delay + "s",
                  boxShadow: isAvgDecade ? "0 0 8px " + accent + "40" : "none",
                  position: "relative",
                }}>
                  {/* Count label on top of bar */}
                  {count > 0 && done && (
                    <div style={{
                      position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                      fontSize: 8, color: isAvgDecade ? accent : "rgba(255,255,255,0.35)",
                      fontFamily: "JetBrains Mono,monospace", fontWeight: 700, whiteSpace: "nowrap",
                      opacity: done ? 1 : 0, transition: "opacity 0.4s ease " + (delay + 0.5) + "s",
                    }}>{count}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Track line */}
        <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1, position: "relative" }}>
          {/* Colored fill */}
          <div style={{
            position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 1,
            width: cursorPos + "%",
            background: "linear-gradient(90deg, " + accent + "30, " + accent + ")",
          }} />
          {/* Cursor dot */}
          <div style={{
            position: "absolute", top: "50%", left: cursorPos + "%",
            transform: "translate(-50%, -50%)",
            width: 12, height: 12, borderRadius: "50%",
            background: accent, border: "2px solid white",
            boxShadow: "0 0 10px " + accent + "80",
            zIndex: 5,
          }} />
        </div>

        {/* Decade labels below track */}
        <div style={{ position: "relative", height: 16, marginTop: 4 }}>
          {DECADES.map((decade) => {
            const left = ((decade - minYear) / range) * 100
            return <div key={decade} style={{
              position: "absolute", left: left + "%", transform: "translateX(-50%)",
              fontSize: 7, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace",
            }}>{decade}</div>
          })}
        </div>

        {/* Average year badge — below the decade labels */}
        {phase >= 2 && (
          <div style={{
            position: "absolute", top: "100%", marginTop: 4, left: cursorPos + "%", transform: "translateX(-50%)",
            background: accent + "25", border: "1px solid " + accent + "50", borderRadius: 6,
            padding: "2px 8px", fontSize: 9, color: accent, fontWeight: 700,
            fontFamily: "JetBrains Mono,monospace", whiteSpace: "nowrap",
            animation: "slide-up 0.4s ease both", zIndex: 6,
          }}>
            moy. {avgYear}
          </div>
        )}
      </div>

      {/* Summary stat */}
      {done && totalCount > 0 && (
        <div style={{ marginTop: 14, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", animation: "slide-up 0.4s ease 0.3s both" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            {totalCount} films analyses — annee moyenne <span style={{ color: accent, fontWeight: 700 }}>{avgYear}</span>
          </div>
        </div>
      )}
    </div>
  )
}
