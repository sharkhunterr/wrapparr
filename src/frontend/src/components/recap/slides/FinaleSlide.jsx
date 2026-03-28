import { useState, useRef, useCallback } from "react"
import { useActive, AN } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts"
import html2canvas from "html2canvas"
import { useLabels } from "../ThemeContext"

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

const FILM_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", emoji: "🍿" },
  { min: 20, max: 50, name: "Cinephile du dimanche", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro du cinema", emoji: "🎬" },
  { min: 100, max: 200, name: "Machine a films", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien supreme", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende vivante", emoji: "👑" },
]
const SERIES_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", emoji: "📺" },
  { min: 20, max: 50, name: "Binge watcher debutant", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro aux series", emoji: "📺" },
  { min: 100, max: 200, name: "Machine a episodes", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien des series", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende du binge", emoji: "👑" },
]
function findCat(hours, cats) { return cats.find((c) => hours >= c.min && hours < c.max) || cats[cats.length - 1] }

function MiniPoster({ src, size = 32 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 5, flexShrink: 0, background: "var(--th-surface-dim, rgba(255,255,255,0.06))" }} />
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 5, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
}

export default function FinaleSlide({ accent, userName, year, globalStats, recapData, activeServices, onRestart }) {
  const active = useActive()
  const L = useLabels()
  const posters = collectPosters(recapData, activeServices)
  const contentRef = useRef(null)
  const [sharing, setSharing] = useState(false)

  const [shareMenu, setShareMenu] = useState(false)
  const [shareBlob, setShareBlob] = useState(null)

  const captureImage = useCallback(async () => {
    if (!contentRef.current) return null
    setSharing(true)
    try {
      const canvas = await html2canvas(contentRef.current, {
        backgroundColor: "#05050e",
        scale: 2,
        useCORS: true,
        logging: false,
      })
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"))
      setShareBlob(blob)
      setSharing(false)
      return blob
    } catch (e) {
      console.warn("Capture error:", e)
      setSharing(false)
      return null
    }
  }, [])

  const handleShare = useCallback(async () => {
    const blob = await captureImage()
    if (!blob) return
    const file = new File([blob], `wrapparr-${year}.png`, { type: "image/png" })

    // Try Web Share API with files (Android/iOS native share sheet)
    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: `Mon Wrapparr ${year}`,
          text: `Mon recap ${year} sur Wrapparr !`,
          files: [file],
        })
        return
      }
    } catch (e) {
      if (e.name === "AbortError") return
    }

    // Try Web Share API without files (share text/url)
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Mon Wrapparr ${year}`,
          text: `Mon recap ${year} sur Wrapparr !`,
        })
        return
      }
    } catch (e) {
      if (e.name === "AbortError") return
    }

    // Fallback (HTTP or desktop without Web Share API)
    setShareMenu(true)
  }, [year, captureImage])

  const downloadImage = () => {
    if (!shareBlob) return
    const url = URL.createObjectURL(shareBlob)
    const a = document.createElement("a")
    a.href = url
    a.download = `wrapparr-${year}.png`
    a.click()
    URL.revokeObjectURL(url)
    setShareMenu(false)
  }

  const copyImage = async () => {
    if (!shareBlob) return
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/png": shareBlob })])
      setShareMenu(false)
    } catch { downloadImage() }
  }

  // Extract film/series data from first available service
  const svcData = recapData?.tautulli || recapData?.plex || recapData?.jellyfin || {}
  const filmsExtra = svcData.extra?.films || {}
  const seriesExtra = svcData.extra?.series || {}
  const totalFilms = filmsExtra.total || 0
  const totalSeries = seriesExtra.episodes || 0
  const filmsHours = filmsExtra.hours || 0
  const seriesHours = seriesExtra.hours || 0
  const filmsTop = (filmsExtra.top || []).slice(0, 3)
  const seriesTop = (seriesExtra.top || []).slice(0, 3)
  const filmsGenres = (svcData.extra?.top_genres || svcData.genres || []).slice(0, 3)
  const filmsCat = findCat(filmsHours, FILM_CATEGORIES)
  const seriesCat = findCat(seriesHours, SERIES_CATEGORIES)
  const avgPerMonth = totalFilms > 0 ? (totalFilms / 12).toFixed(1) : "0"

  // Monthly combined (films + series)
  const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
  const filmsMonthly = filmsExtra.monthly || svcData.monthly || []
  const seriesMonthly = seriesExtra.monthly || []
  const combinedMonthly = months.map((m, i) => ({
    m,
    films: filmsMonthly[i]?.v || 0,
    series: seriesMonthly[i]?.v || 0,
  }))

  // Average year
  const allFilmsWithYear = (filmsExtra.top || []).filter((f) => f.y && f.y > 1890)
  const avgYear = allFilmsWithYear.length > 0 ? Math.round(allFilmsWithYear.reduce((s, f) => s + f.y * (f.plays || 1), 0) / allFilmsWithYear.reduce((s, f) => s + (f.plays || 1), 0)) : null

  // Genre max for bars
  const genreMax = Math.max(1, ...(filmsGenres.map((g) => g.v || 0)))

  const seriesGenres = (seriesExtra.genres || []).slice(0, 3)
  const seriesGenreMax = Math.max(1, ...seriesGenres.map((g) => g.v || 0))
  const seriesAccent = "#fb923c"

  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>

      <PosterWall posters={posters} />

      {/* Scrollable content */}
      <div ref={contentRef} style={{ position: "relative", zIndex: 5, width: "100%", maxWidth: "clamp(340px, 85vw, 520px)", padding: "clamp(12px, 2vw, 20px) clamp(10px, 2vw, 16px) 40px", overflowY: "auto", maxHeight: "100vh" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <div style={{ fontSize: 36, marginBottom: 6, animation: "float 2.5s ease-in-out infinite", filter: "drop-shadow(0 0 20px " + accent + "90)" }}>🏆</div>
          <div style={{ fontSize: 8, color: "var(--th-text-faint, rgba(255,255,255,.2))", letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", marginBottom: 4 }}>{L.brand} · {year}</div>
          <h1 style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text, white)", lineHeight: 1.0, marginBottom: 8 }}>
            Ton recap <span style={{ backgroundImage: "linear-gradient(90deg,#E5A00D,#fb923c,#c084fc,#34d399,#60a5fa,#E5A00D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "300% auto", animation: "shimmer-t 4s linear infinite" }}>{year}</span>
          </h1>
        </div>

        {/* Monthly activity — line chart films + series */}
        {combinedMonthly.some((m) => m.films + m.series > 0) && (
          <div style={{ padding: "8px 10px 4px", borderRadius: "var(--th-radius-sm, 12px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>Activite mensuelle</div>
            <ResponsiveContainer width="100%" height={100}>
              <AreaChart data={combinedMonthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fin-films" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.35} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} /></linearGradient>
                  <linearGradient id="fin-series" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={seriesAccent} stopOpacity={0.25} /><stop offset="100%" stopColor={seriesAccent} stopOpacity={0.02} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
                <XAxis dataKey="m" tick={{ fill: "var(--th-text-muted, rgba(255,255,255,.3))", fontSize: 7 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--th-text-muted, rgba(255,255,255,.15))", fontSize: 6 }} axisLine={false} tickLine={false} width={24} />
                {totalFilms > 0 && <Area type="monotone" dataKey="films" stroke={accent} strokeWidth={2} fill="url(#fin-films)" dot={false} animationBegin={200} animationDuration={1200} />}
                {totalSeries > 0 && <Area type="monotone" dataKey="series" stroke={seriesAccent} strokeWidth={2} fill="url(#fin-series)" dot={false} animationBegin={400} animationDuration={1200} />}
              </AreaChart>
            </ResponsiveContainer>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 2 }}>
              {totalFilms > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: accent }}><span style={{ width: 10, height: 2.5, borderRadius: 2, background: accent }} />Films</span>}
              {totalSeries > 0 && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 9, color: seriesAccent }}><span style={{ width: 10, height: 2.5, borderRadius: 2, background: seriesAccent }} />Series</span>}
            </div>
          </div>
        )}

        {/* Category badges — shared shine that crosses both */}
        {(totalFilms > 0 || totalSeries > 0) && (
          <div style={{ display: "flex", gap: 8, marginBottom: 10, position: "relative", overflow: "hidden", borderRadius: "var(--th-radius-pill, 20px)" }}>
            {/* Single shine layer crossing both badges */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.25) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.25) 55%, transparent 65%)", animation: "badge-shine 4s ease-in-out infinite", pointerEvents: "none", zIndex: 2 }} />
            {totalFilms > 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 10px", borderRadius: "var(--th-radius-pill, 20px)", background: `${accent}15`, border: `1px solid ${accent}35`, backdropFilter: "blur(10px)", position: "relative" }}>
                <span style={{ fontSize: 14, position: "relative", zIndex: 1 }}>{filmsCat.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: accent, position: "relative", zIndex: 1 }}>{filmsCat.name}</span>
              </div>
            )}
            {totalSeries > 0 && (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "8px 10px", borderRadius: "var(--th-radius-pill, 20px)", background: seriesAccent + "15", border: `1px solid ${seriesAccent}35`, backdropFilter: "blur(10px)", position: "relative" }}>
                <span style={{ fontSize: 14, position: "relative", zIndex: 1 }}>{seriesCat.emoji}</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: seriesAccent, position: "relative", zIndex: 1 }}>{seriesCat.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Two columns: Films | Series */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>

          {/* FILMS column */}
          {totalFilms > 0 && (
            <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>

              {/* Stats */}
              <div style={{ display: "flex", gap: 4 }}>
                <div style={{ flex: 1, padding: "6px 8px", borderRadius: "var(--th-radius-xs, 8px)", background: accent + "12", border: "1px solid " + accent + "25", backdropFilter: "blur(8px)", textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={totalFilms} /> : 0}</div>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>films</div>
                </div>
                <div style={{ flex: 1, padding: "6px 8px", borderRadius: "var(--th-radius-xs, 8px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text, white)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={Math.round(filmsHours)} s="h" /> : "0h"}</div>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>heures</div>
                </div>
              </div>
              {/* Top 3 films */}
              {filmsTop.length > 0 && (
                <div style={{ padding: "8px 8px", borderRadius: "var(--th-radius-sm, 10px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 9, color: accent, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, fontWeight: 700 }}>Top films</div>
                  {filmsTop.map((f, i) => (
                    <div key={f.t + i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                      <span style={{ width: 14, fontSize: 10, fontWeight: 800, color: i === 0 ? accent : "var(--th-text-faint, rgba(255,255,255,0.2))", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                      <MiniPoster src={f.thumb} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? "var(--th-text, white)" : "var(--th-text-secondary, rgba(255,255,255,0.5))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{f.t}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 1, alignItems: "center" }}>
                          {f.plays > 0 && <span style={{ fontSize: 8, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{f.plays}x</span>}
                          {f.y > 0 && <span style={{ fontSize: 8, color: "var(--th-text-dim, rgba(255,255,255,0.25))" }}>{f.y}</span>}
                          {f.r > 0 && <span style={{ fontSize: 8, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>★{f.r}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Genres films */}
              {filmsGenres.length > 0 && (
                <div style={{ padding: "8px 8px", borderRadius: "var(--th-radius-sm, 10px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Genres</div>
                  {filmsGenres.map((g, i) => (
                    <div key={g.n} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                      <span style={{ width: 44, fontSize: 9, color: i === 0 ? accent : "var(--th-text-tertiary, rgba(255,255,255,0.4))", fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.n}</span>
                      <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: i === 0 ? accent : accent + "50", width: ((g.v / genreMax) * 100) + "%" }} />
                      </div>
                      <span style={{ fontSize: 9, color: "var(--th-text-dim, rgba(255,255,255,0.25))", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", width: 16, textAlign: "right" }}>{g.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SERIES column */}
          {totalSeries > 0 && (
            <div style={{ flex: "1 1 200px", minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>

              {/* Stats */}
              <div style={{ display: "flex", gap: 4 }}>
                <div style={{ flex: 1, padding: "6px 8px", borderRadius: "var(--th-radius-xs, 8px)", background: seriesAccent + "12", border: "1px solid " + seriesAccent + "25", backdropFilter: "blur(8px)", textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: seriesAccent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={totalSeries} /> : 0}</div>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>episodes</div>
                </div>
                <div style={{ flex: 1, padding: "6px 8px", borderRadius: "var(--th-radius-xs, 8px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", textAlign: "center" }}>
                  <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text, white)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={Math.round(seriesHours)} s="h" /> : "0h"}</div>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>heures</div>
                </div>
              </div>

              {/* Top 3 series */}
              {seriesTop.length > 0 && (
                <div style={{ padding: "8px 8px", borderRadius: "var(--th-radius-sm, 10px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 9, color: seriesAccent, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5, fontWeight: 700 }}>Top series</div>
                  {seriesTop.map((s, i) => (
                    <div key={s.t + i} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                      <span style={{ width: 14, fontSize: 10, fontWeight: 800, color: i === 0 ? seriesAccent : "var(--th-text-faint, rgba(255,255,255,0.2))", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
                      <MiniPoster src={s.thumb} size={28} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: i === 0 ? "var(--th-text, white)" : "var(--th-text-secondary, rgba(255,255,255,0.5))", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{s.t}</div>
                        <div style={{ display: "flex", gap: 4, marginTop: 1, alignItems: "center" }}>
                          {(s.ep || s.plays) > 0 && <span style={{ fontSize: 8, color: seriesAccent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{s.ep || s.plays} ep.</span>}
                          {s.y > 0 && <span style={{ fontSize: 8, color: "var(--th-text-dim, rgba(255,255,255,0.25))" }}>{s.y}</span>}
                          {s.r > 0 && <span style={{ fontSize: 8, color: "var(--th-text-muted, rgba(255,255,255,0.3))" }}>★{s.r}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Genres series */}
              {seriesGenres.length > 0 && (
                <div style={{ padding: "8px 8px", borderRadius: "var(--th-radius-sm, 10px)", background: "var(--th-surface, rgba(255,255,255,0.08))", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
                  <div style={{ fontSize: 9, color: "var(--th-text-muted, rgba(255,255,255,0.3))", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 4 }}>Genres</div>
                  {seriesGenres.map((g, i) => (
                    <div key={g.n} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3 }}>
                      <span style={{ width: 44, fontSize: 9, color: i === 0 ? seriesAccent : "var(--th-text-tertiary, rgba(255,255,255,0.4))", fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.n}</span>
                      <div style={{ flex: 1, height: 7, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, background: i === 0 ? seriesAccent : seriesAccent + "50", width: ((g.v / seriesGenreMax) * 100) + "%" }} />
                      </div>
                      <span style={{ fontSize: 9, color: "var(--th-text-dim, rgba(255,255,255,0.25))", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", width: 16, textAlign: "right" }}>{g.v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", position: "relative" }}>
          <button onClick={handleShare} disabled={sharing} style={{ padding: "10px 24px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 13, fontWeight: 800, boxShadow: "0 0 40px " + accent + "40", opacity: sharing ? 0.6 : 1 }}>
            {sharing ? "Capture..." : "Partager"}
          </button>
          {onRestart && <button onClick={onRestart} style={{ padding: "10px 24px", borderRadius: 40, cursor: "pointer", background: "transparent", color: "var(--th-text-muted, rgba(255,255,255,.35))", fontSize: 12, border: "1px solid rgba(255,255,255,.1)" }}>Rejouer</button>}

          {/* Share menu fallback (desktop) */}
          {shareMenu && (
            <div style={{
              position: "absolute", bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)",
              padding: "8px", borderRadius: "var(--th-radius-sm, 12px)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)",
              backdropFilter: "blur(16px)", display: "flex", flexDirection: "column", gap: 4, minWidth: 160,
              animation: "slide-up 0.3s ease both", zIndex: 20,
            }}>
              <button onClick={copyImage} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--th-radius-xs, 8px)", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.05)", color: "var(--th-text, white)", fontSize: 11, fontWeight: 500, textAlign: "left" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                Copier l'image
              </button>
              <button onClick={downloadImage} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: "var(--th-radius-xs, 8px)", border: "none", cursor: "pointer", background: "rgba(255,255,255,0.05)", color: "var(--th-text, white)", fontSize: 11, fontWeight: 500, textAlign: "left" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>
                Telecharger
              </button>
              <button onClick={() => setShareMenu(false)} style={{ padding: "4px 12px", borderRadius: "var(--th-radius-xs, 8px)", border: "none", cursor: "pointer", background: "none", color: "var(--th-text-muted, rgba(255,255,255,0.3))", fontSize: 9 }}>
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
