import { useState, useEffect, useRef } from "react"
import { useComparison } from "../SharedUI"

const DEFAULT_PROFILES = [
  { min: 1900, max: 1949, name: "Cinephile classique", desc: "Tes films datent de l'age d'or du cinema", emoji: "🎩" },
  { min: 1950, max: 1979, name: "Nostalgique", desc: "Tu adores les grandes fresques et le cinema d'auteur", emoji: "📽️" },
  { min: 1980, max: 1999, name: "Enfant des 80s-90s", desc: "Action, aventure, et blockbusters — ton epoque", emoji: "📼" },
  { min: 2000, max: 2014, name: "Millenial", desc: "Tu as grandi avec les franchises et le cinema numerique", emoji: "🎬" },
  { min: 2015, max: 2030, name: "Ultra-moderne", desc: "Toujours a la pointe, tu regardes les sorties recentes", emoji: "🚀" },
]

const ALL_DECADES = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020]

function getProfile(avgYear, profiles) {
  return profiles.find((p) => avgYear >= p.min && avgYear <= p.max) || profiles[profiles.length - 1]
}

export default function FilmTimelineSlide({ accent, data, year, config = {}, mediaType = "films" }) {
  const isSeries = mediaType === "series"
  const animSpeed = config.animationSpeed || 8000
  const profiles = config.profiles || DEFAULT_PROFILES
  const extra = data?.extra || {}
  const allFilms = extra.films?.top || data?.top || []

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

  // Oldest and newest films
  const filmsWithYear = allFilms.filter((f) => (f.y || f.year) && (f.y || f.year) > 1890)
  const oldestFilm = filmsWithYear.length > 0 ? filmsWithYear.reduce((a, b) => ((a.y || a.year) < (b.y || b.year) ? a : b)) : null
  const newestFilm = filmsWithYear.length > 0 ? filmsWithYear.reduce((a, b) => ((a.y || a.year) > (b.y || b.year) ? a : b)) : null
  const profile = getProfile(avgYear, profiles)

  // Decade buckets
  const decadeBuckets = {}
  for (const [y, count] of Object.entries(yearCounts)) {
    const decade = Math.floor(parseInt(y) / 10) * 10
    decadeBuckets[decade] = (decadeBuckets[decade] || 0) + count
  }
  const maxBucket = Math.max(1, ...Object.values(decadeBuckets))

  const minYear = config.minYear || 1940
  const maxYear = Math.max(2030, new Date().getFullYear())
  const range = maxYear - minYear
  const DECADES = ALL_DECADES.filter((d) => d >= minYear)

  // Comparison data
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevDecades = prevSvc?.films?.decades?.previous || null
  const prevBuckets = prevDecades?.buckets || {}
  const prevAvgYear = prevDecades?.avg_year || 0
  const prevProfile = prevAvgYear > 0 ? getProfile(prevAvgYear, profiles) : null
  const maxBucketAll = comp.active ? Math.max(maxBucket, ...Object.values(prevBuckets).map(Number)) : maxBucket

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
          Ton profil <span style={{ color: accent }}>{isSeries ? "seriephile" : "cinephile"}</span>
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
              <div style={{ fontSize: 9, color: accent + "90", fontFamily: "JetBrains Mono,monospace", marginTop: 3 }}>Annee moyenne : {avgYear}</div>
            </div>
          </div>
        </div>
      )}

      {/* Previous year profile card (grey) */}
      {comp.active && prevProfile && phase >= 2 && (
        <div style={{
          padding: "8px 12px", borderRadius: 10, marginBottom: 10, marginTop: -6,
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          animation: "slide-up 0.4s ease 0.2s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 18, opacity: 0.5 }}>{prevProfile.emoji}</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{prevProfile.name} <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>({year - 1})</span></div>
              <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono,monospace", marginTop: 2 }}>Annee moyenne : {prevAvgYear}</div>
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
            const prevCount = comp.active ? (prevBuckets[String(decade)] || 0) : 0
            const effectiveMax = comp.active ? maxBucketAll : maxBucket
            const pct = count > 0 ? (count / effectiveMax) * 100 : 0
            const prevPct = prevCount > 0 ? (prevCount / effectiveMax) * 100 : 0
            const left = ((decade - minYear) / range) * 100
            const barW = (10 / range) * 100 // width = 10 years
            const isAvgDecade = Math.floor(avgYear / 10) * 10 === decade
            const color = isAvgDecade ? accent : (count > 0 ? accent + "70" : "rgba(255,255,255,0.04)")
            const delay = i * 0.06
            const showPrev = comp.active && prevDecades

            return (
              <div key={decade} style={{
                position: "absolute", bottom: 0, left: left + "%", width: Math.max(barW, 3) + "%",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                height: "100%",
              }}>
                <div style={{ display: "flex", gap: 1, alignItems: "flex-end", height: "100%", width: "100%" }}>
                  {/* Current year bar */}
                  <div style={{
                    flex: 1, borderRadius: "3px 3px 0 0",
                    background: color,
                    height: (barsGrowing || done) ? Math.max(count > 0 ? 3 : 0, pct * TIMELINE_H / 100) + "px" : "0px",
                    transition: "height 0.8s cubic-bezier(0.25,0.46,0.45,0.94) " + delay + "s",
                    boxShadow: isAvgDecade ? "0 0 8px " + accent + "40" : "none",
                  }} />
                  {/* Previous year bar */}
                  {showPrev && (
                    <div style={{
                      flex: 1, borderRadius: "3px 3px 0 0",
                      background: prevCount > 0 ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                      height: (barsGrowing || done) ? Math.max(prevCount > 0 ? 3 : 0, prevPct * TIMELINE_H / 100) + "px" : "0px",
                      transition: "height 0.8s cubic-bezier(0.25,0.46,0.45,0.94) " + (delay + 0.1) + "s",
                    }} />
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
          {/* Previous year cursor dot (grey) */}
          {comp.active && prevAvgYear > 0 && phase >= 2 && (
            <div style={{
              position: "absolute", top: "50%", left: ((prevAvgYear - minYear) / range * 100) + "%",
              transform: "translate(-50%, -50%)",
              width: 10, height: 10, borderRadius: "50%",
              background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)",
              zIndex: 4,
            }} />
          )}
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

        {/* Legend */}
        {comp.active && prevDecades && done && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: accent }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: accent }} />{year}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />{year - 1}
            </span>
          </div>
        )}

      </div>

      {/* Summary stat */}
      {done && totalCount > 0 && (
        <div style={{ marginTop: 14, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", animation: "slide-up 0.4s ease 0.3s both" }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
            {totalCount} {isSeries ? "series analysees" : "films analyses"} — annee moyenne <span style={{ color: accent, fontWeight: 700 }}>{avgYear}</span>
          </div>
        </div>
      )}

      {/* Oldest vs Newest film */}
      {done && oldestFilm && newestFilm && oldestFilm !== newestFilm && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, animation: "slide-up 0.4s ease 0.5s both" }}>
          {[{ film: oldestFilm, label: "Le plus ancien", icon: "🎞️" }, { film: newestFilm, label: "Le plus recent", icon: "🆕" }].map(({ film, label, icon }) => (
            <div key={label} style={{ flex: 1, display: "flex", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
              {film.thumb ? (
                <img src={film.thumb} alt="" style={{ width: 30, height: 44, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />
              ) : (
                <div style={{ width: 30, height: 44, borderRadius: 4, background: "rgba(255,255,255,0.05)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{icon}</div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{film.t}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{film.y || film.year}</span>
                  {film.r > 0 && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>★ {film.r}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
