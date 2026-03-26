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

  // Auto-detect year range from data (oldest film year, floored to decade)
  const dataYears = Object.keys(yearCounts).map(Number).filter((y) => y > 1890)
  const oldestDataYear = dataYears.length > 0 ? Math.floor(Math.min(...dataYears) / 10) * 10 : 1990
  const minYearCfg = config.minYear || oldestDataYear
  const maxYearCfg = new Date().getFullYear()

  // Build all years array from minYear to maxYear
  const allYears = []
  for (let y = minYearCfg; y <= maxYearCfg; y++) allYears.push(y)
  const maxBucket = Math.max(1, ...Object.values(yearCounts).map(Number))

  // Comparison data
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevYearDist = prevSvc?.films?.year_dist?.previous || null
  const prevYearBuckets = prevYearDist?.years || {}
  const prevAvgYear = prevYearDist?.avg_year || 0
  const prevProfile = prevAvgYear > 0 ? getProfile(prevAvgYear, profiles) : null
  const maxBucketAll = comp.active ? Math.max(maxBucket, ...Object.values(prevYearBuckets).map(Number)) : maxBucket

  const range = maxYearCfg - minYearCfg

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
      const targetPos = ((avgYear - minYearCfg) / range) * 100
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: accent }}>{profile.name}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.3 }}>{profile.desc}</div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace", lineHeight: 1 }}>{avgYear}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>annee moy.</div>
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
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>{prevProfile.name} <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>({year - 1})</span></div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono,monospace", lineHeight: 1 }}>{prevAvgYear}</div>
              <div style={{ fontSize: 7, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: ".05em", marginTop: 2 }}>annee moy.</div>
            </div>
          </div>
        </div>
      )}

      {/* Timeline with vertical bars */}
      <div className="glass" style={{ padding: "10px 12px", marginBottom: 10 }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.32)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Films par annee de sortie</div>

        {/* Vertical bars area — one thin bar per year */}
        {/* Chart area with Y labels on left */}
        <div style={{ display: "flex", gap: 0 }}>
          {/* Y axis labels */}
          <div style={{ width: 22, position: "relative", height: TIMELINE_H, flexShrink: 0 }}>
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <div key={pct} style={{ position: "absolute", right: 4, bottom: (pct * TIMELINE_H - 5) + "px", fontSize: 7, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace" }}>{Math.round(maxBucketAll * pct)}</div>
            ))}
          </div>

          {/* Bars + grid + vertical indicators */}
          <div style={{ flex: 1, position: "relative", height: TIMELINE_H }}>
            {/* Horizontal grid lines */}
            {[0.25, 0.5, 0.75, 1].map((pct) => (
              <div key={pct} style={{ position: "absolute", left: 0, right: 0, bottom: (pct * TIMELINE_H) + "px", height: 1, background: "rgba(255,255,255,0.04)" }} />
            ))}
            {/* Average year vertical line + label */}
            {phase >= 2 && avgYear >= minYearCfg && avgYear <= maxYearCfg && (
              <div style={{ position: "absolute", left: ((avgYear - minYearCfg) / range * 100) + "%", top: 0, bottom: 0, zIndex: 3, pointerEvents: "none" }}>
                <div style={{ position: "absolute", left: -1, top: 0, bottom: 0, width: 2, background: accent + "50", animation: "pulse-line 2s ease-in-out infinite" }} />
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 8, fontWeight: 700, color: accent, fontFamily: "JetBrains Mono,monospace", whiteSpace: "nowrap", textShadow: "0 0 8px rgba(0,0,0,0.8)" }}>{avgYear}</div>
              </div>
            )}
            {/* Previous avg year vertical line */}
            {comp.active && prevAvgYear > 0 && phase >= 2 && prevAvgYear >= minYearCfg && prevAvgYear <= maxYearCfg && (
              <div style={{ position: "absolute", left: ((prevAvgYear - minYearCfg) / range * 100) + "%", top: 0, bottom: 0, zIndex: 2, pointerEvents: "none" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.15)", borderLeft: "1px dashed rgba(255,255,255,0.25)" }} />
                <div style={{ position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)", fontSize: 7, fontWeight: 600, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", whiteSpace: "nowrap" }}>{prevAvgYear}</div>
              </div>
            )}
            {/* Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 1, position: "relative", zIndex: 1 }}>
              {allYears.map((yr, i) => {
                const count = yearCounts[yr] || 0
                const prevCount = comp.active ? (parseInt(prevYearBuckets[String(yr)]) || 0) : 0
                const effectiveMax = comp.active ? maxBucketAll : maxBucket
                const pct = count > 0 ? (count / effectiveMax) * 100 : 0
                const prevPct = prevCount > 0 ? (prevCount / effectiveMax) * 100 : 0
                const isAvgYear = yr === avgYear
                const color = isAvgYear ? accent : (count > 0 ? accent + "70" : "transparent")
                const delay = Math.min(i * 0.008, 0.8)
                const showPrev = comp.active && prevYearDist

                return (
                  <div key={yr} style={{ flex: 1, display: "flex", gap: 0, alignItems: "flex-end", height: "100%" }}>
                    <div style={{
                      flex: 1, borderRadius: "1px 1px 0 0",
                      background: color,
                      height: (barsGrowing || done) ? Math.max(count > 0 ? 2 : 0, pct * TIMELINE_H / 100) + "px" : "0px",
                      transition: "height 0.6s ease " + delay + "s",
                      boxShadow: isAvgYear ? "0 0 6px " + accent + "50" : "none",
                    }} />
                    {showPrev && (
                      <div style={{
                        flex: 1, borderRadius: "1px 1px 0 0",
                        background: prevCount > 0 ? "rgba(255,255,255,0.2)" : "transparent",
                        height: (barsGrowing || done) ? Math.max(prevCount > 0 ? 2 : 0, prevPct * TIMELINE_H / 100) + "px" : "0px",
                        transition: "height 0.6s ease " + (delay + 0.05) + "s",
                      }} />
                    )}
                  </div>
                )
              })}
            </div>

            {/* X axis = track line + ticks + labels — unified */}
            <div style={{ position: "relative", marginTop: 2 }}>
              {/* The line itself */}
              <div style={{ height: 2, background: "rgba(255,255,255,0.08)", borderRadius: 1, position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, borderRadius: 1,
                  width: cursorPos + "%",
                  background: "linear-gradient(90deg, " + accent + "30, " + accent + ")",
                }} />
                {comp.active && prevAvgYear > 0 && phase >= 2 && (
                  <div style={{
                    position: "absolute", top: "50%", left: ((prevAvgYear - minYearCfg) / range * 100) + "%",
                    transform: "translate(-50%, -50%)",
                    width: 10, height: 10, borderRadius: "50%",
                    background: "rgba(255,255,255,0.25)", border: "2px solid rgba(255,255,255,0.4)",
                    zIndex: 4,
                  }} />
                )}
                <div style={{
                  position: "absolute", top: "50%", left: cursorPos + "%",
                  transform: "translate(-50%, -50%)",
                  width: 12, height: 12, borderRadius: "50%",
                  background: accent, border: "2px solid white",
                  boxShadow: "0 0 10px " + accent + "80",
                  zIndex: 5,
                }} />
              </div>
              {/* Ticks below the line */}
              {ALL_DECADES.filter((d) => d >= minYearCfg && d <= maxYearCfg).map((decade) => {
                const left = ((decade - minYearCfg) / range) * 100
                return <div key={decade} style={{ position: "absolute", left: left + "%", top: 0, display: "flex", flexDirection: "column", alignItems: "center", transform: "translateX(-50%)" }}>
                  <div style={{ width: 1, height: 5, background: "rgba(255,255,255,0.15)" }} />
                  <div style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", marginTop: 1 }}>{decade}</div>
                </div>
              })}
            </div>
          </div>
        </div>

        {/* Spacer for ticks labels */}
        <div style={{ height: 16 }} />

        {/* Legend */}
        {comp.active && prevYearDist && done && (
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 4 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: accent }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: accent }} />{year}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
              <span style={{ width: 10, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)" }} />{year - 1}
            </span>
          </div>
        )}

      </div>

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
