import { useState, useEffect } from "react"
import { useActive, AN, Tag, Lbl, Pill, AreaG, useComparison, CompBadge, CompLegend } from "../SharedUI"

const DEFAULT_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "🍿" },
  { min: 20, max: 50, name: "Cinephile du dimanche", desc: "Tu aimes bien te poser devant un film", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro du cinema", desc: "Les salles obscures n'ont plus de secrets", emoji: "🎬" },
  { min: 100, max: 200, name: "Machine a films", desc: "Tu enchaines les films sans relache", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien supreme", desc: "Tu vis et respires cinema", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende vivante", desc: "Tu as probablement vu plus de films que Spielberg", emoji: "👑" },
]

const DEFAULT_SERIES_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", desc: "Tu regardes de temps en temps", emoji: "📺" },
  { min: 20, max: 50, name: "Binge watcher debutant", desc: "Tu enchaines quelques episodes", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro aux series", desc: "Tu ne peux plus t'arreter", emoji: "📺" },
  { min: 100, max: 200, name: "Machine a episodes", desc: "Les saisons defilent sous tes yeux", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien des series", desc: "Tu vis et respires series", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende du binge", desc: "Tu as probablement vu plus de series que Netflix", emoji: "👑" },
]

function formatEquiv(hours) {
  if (hours >= 720) return (hours / 720).toFixed(1) + " mois"
  if (hours >= 168) return (hours / 168).toFixed(1) + " sem."
  if (hours >= 24) return (hours / 24).toFixed(1) + " jours"
  return Math.round(hours) + "h"
}

function PosterImg({ src, size = 36 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, color: "rgba(255,255,255,0.15)" }}>?</div>
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 5, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }} />
}

function GenreDonut({ genres, accent, maxShow = 4 }) {
  if (!genres || genres.length === 0) return null
  const total = genres.reduce((s, g) => s + g.v, 0)
  if (total === 0) return null
  const shown = genres.slice(0, maxShow)
  const restCount = genres.slice(maxShow).reduce((s, g) => s + g.v, 0)
  const items = restCount > 0 ? [...shown, { n: "Autres", v: restCount }] : shown
  const size = 100, cx = size / 2, cy = size / 2, r = 36, stroke = 15
  const circ = 2 * Math.PI * r
  let offset = 0
  const opacities = [1, 0.72, 0.5, 0.35, 0.2]

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "clamp(8px, 2vw, 14px)", width: "100%" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        {items.map((g, i) => {
          const pct = g.v / total
          const dashLen = circ * pct - 1.5
          const dashOff = circ * offset + 0.75
          offset += pct
          return <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={`${Math.max(0, dashLen)} ${circ}`} strokeDashoffset={-dashOff}
            transform={`rotate(-90 ${cx} ${cy})`} opacity={opacities[i] || 0.15} />
        })}
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1, minWidth: 0 }}>
        {items.map((g, i) => (
          <div key={g.n} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: accent, opacity: opacities[i] || 0.15, flexShrink: 0 }} />
            <span style={{ fontSize: "clamp(10px, 1.4vw, 13px)", color: i === 0 ? "white" : "rgba(255,255,255,0.5)", fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{g.n}</span>
            <span style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{g.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function PosterWall({ films }) {
  const posters = [...films, ...films, ...films].filter((f) => f.thumb)
  if (posters.length < 6) return null
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, opacity: 0.1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
        <div key={row} style={{ display: "flex", gap: 8, padding: "4px 0", animation: `pse-scroll-${row % 2 === 0 ? "l" : "r"} ${22 + row * 3}s linear infinite`, width: "max-content" }}>
          {posters.concat(posters).slice(row * 5, row * 5 + 24).map((f, i) => (
            <img key={i} src={f.thumb} alt="" style={{ width: 70, height: 100, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes pse-scroll-l { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes pse-scroll-r { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        @keyframes badge-shine { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}

// SVG mini icons
const ICONS = {
  chart: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/></svg>,
  calendar: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  user: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  film: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>,
  clapperboard: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20.2 6L3 11l-.9-2.7a1 1 0 0 1 .6-1.3L17.5 2a1 1 0 0 1 1.3.6Z"/><path d="M6.2 5.5 8 10"/><path d="m12 3.5 1.8 4.5"/><rect x="2" y="11" width="20" height="11" rx="2"/></svg>,
  star: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill={c} stroke={c} strokeWidth="1"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>,
}

function MiniStat({ iconKey, value, label, accent }) {
  const iconFn = ICONS[iconKey] || ICONS.chart
  return (
    <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", gap: "clamp(3px, 0.8vw, 6px)", padding: "clamp(3px, 0.6vw, 5px) clamp(5px, 1vw, 8px)", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", minWidth: 0, overflow: "hidden" }}>
      <div style={{ flexShrink: 0 }}>{iconFn(accent)}</div>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div style={{ fontSize: "clamp(10px, 1.4vw, 13px)", fontWeight: 800, color: "white", lineHeight: 1.1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
        <div style={{ fontSize: "clamp(7px, 0.9vw, 9px)", color: accent, lineHeight: 1.1, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      </div>
    </div>
  )
}

export default function FilmStatsEnrichedSlide({ accent, label, icon, data, year, config = {}, mediaType = "films" }) {
  const isSeries = mediaType === "series"
  const active = useActive()
  const [stamped, setStamped] = useState(false)
  useEffect(() => { const t = setTimeout(() => setStamped(true), 3500); return () => clearTimeout(t) }, [])
  const categories = config.categories || (isSeries ? DEFAULT_SERIES_CATEGORIES : DEFAULT_CATEGORIES)
  const top = data.top || []
  const genres = data.genres || []
  const totalItems = data.total_items || 0
  const totalHours = data.total_hours || 0
  const allFilms = data.extra?.films?.top || top
  const equiv = formatEquiv(totalHours)
  const category = categories.find((c) => totalHours >= c.min && totalHours < c.max) || categories[categories.length - 1]

  // Labels adaptes films vs series
  const itemLabel = isSeries ? "episodes" : "films"
  const bilanLabel = isSeries ? "series" : "cinema"
  const unitLabel = isSeries ? "ep." : "vus"
  const perMonthLabel = isSeries ? "ep. / mois" : "films / mois"

  // Quick stats
  const avgPerMonth = totalItems > 0 ? (totalItems / 12).toFixed(1) : "0"
  const peak = data.extra?.films?.peak_stats || data.extra?.peak_stats || {}
  const bestMonth = peak.best_month
  const bestDay = peak.best_day
  const topActor = (data.extra?.actors || [])[0]
  const topDirector = (data.extra?.directors || [])[0]
  const ratings = data.extra?.ratings || []
  const avgRating = ratings.length > 0 ? (ratings.reduce((s, r) => s + r.r, 0) / ratings.length).toFixed(1) : null
  const countries = data.extra?.countries || []
  const avgYear = allFilms.length > 0 ? Math.round(allFilms.filter((f) => f.y > 1900).reduce((s, f) => s + f.y, 0) / allFilms.filter((f) => f.y > 1900).length) : null

  // Comparison data
  const comp = useComparison()
  const mediaKey = isSeries ? "series" : "films"
  const prevSvc = comp.active ? (comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevMedia = prevSvc?.[mediaKey] || {}
  const prevItems = prevMedia.previous
  const prevHours = prevMedia.hours?.previous
  const prevMonthly = prevMedia.monthly || null
  const prevGenres = (prevMedia.genres || []).filter((g) => (g.previous || 0) > 0).sort((a, b) => (b.previous || 0) - (a.previous || 0)).slice(0, 4)

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%", position: "relative" }}>
    <PosterWall films={allFilms} />

    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="s0" style={{ marginBottom: 8 }}>
        <Tag accent={accent} year={year} /><Lbl c={accent} size={9}>{icon} {label}</Lbl>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 4 }}>
          Ton bilan <span style={{ color: accent }}>{bilanLabel}</span>
        </h2>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(6px, 1.5vw, 12px)", marginTop: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace", lineHeight: 1 }}>{active ? <AN t={totalItems} s="" /> : "0"}</span>
            <span style={{ fontSize: "clamp(10px, 1.3vw, 13px)", fontWeight: 600, color: accent + "90" }}>{unitLabel}</span>
            <CompBadge current={totalItems} previous={prevItems} />
          </div>
          <div style={{ height: 20, width: 1, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace", lineHeight: 1 }}>{active ? <AN t={Math.round(totalHours)} s="h" /> : "0h"}</span>
            <CompBadge current={totalHours} previous={prevHours} suffix="h" />
          </div>
        </div>

        {/* Category badge + equivalent — below stats, bigger */}
        <div style={{ display: "flex", gap: "clamp(4px, 1vw, 8px)", marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "clamp(4px, 0.8vw, 8px)", padding: "clamp(6px, 1vw, 10px) clamp(10px, 2vw, 16px)", borderRadius: 20, background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 16px ${accent}20`, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
            <span style={{ fontSize: "clamp(16px, 3.5vw, 22px)", position: "relative" }}>{category.emoji}</span>
            <span style={{ fontSize: "clamp(11px, 1.6vw, 14px)", fontWeight: 700, color: accent, position: "relative" }}>{category.name}</span>
          </div>
          <div style={{ padding: "clamp(5px, 0.8vw, 8px) clamp(10px, 1.5vw, 14px)", borderRadius: 16, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <span style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{equiv}</span>
          </div>
        </div>
      </div>

      {/* Genre donut + quick stats — stacks on mobile */}
      <div className="s1" style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "stretch", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 100%", padding: "clamp(6px, 1.2vw, 10px)", borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <GenreDonut genres={genres} accent={accent} />
          </div>
          {/* Previous year genres comparison */}
          {comp.active && prevGenres.length > 0 && (<>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0 6px" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: "clamp(7px, 0.9vw, 9px)", color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".05em" }}>{year - 1}</span>
              {prevGenres.map((g, i) => (
                <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 7, fontSize: "clamp(8px, 1vw, 10px)", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontWeight: i === 0 ? 600 : 400 }}>
                  {g.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: "clamp(7px, 0.9vw, 9px)", color: "rgba(255,255,255,0.3)" }}>{g.previous}</span>
                </span>
              ))}
            </div>
          </>)}
        </div>
        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {avgPerMonth > 0 && <MiniStat iconKey="chart" value={avgPerMonth} label={perMonthLabel} accent={accent} />}
            {ratings.length > 0 && <MiniStat iconKey="star" value={avgRating + "/10"} label="note moyenne" accent={accent} />}
            {avgYear && <MiniStat iconKey="film" value={avgYear} label="annee moyenne" accent={accent} />}
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {topActor && <MiniStat iconKey="user" value={topActor.name} label={topActor.count + " " + itemLabel} accent={accent} />}
            {topDirector && <MiniStat iconKey="clapperboard" value={topDirector.name} label={topDirector.count + " " + itemLabel} accent={accent} />}
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {bestMonth && <MiniStat iconKey="calendar" value={bestMonth.month} label={bestMonth.views + " vues"} accent={accent} />}
            {bestDay && <MiniStat iconKey="calendar" value={bestDay.day + " " + bestDay.month.slice(0, 3)} label={bestDay.views + " vues · " + bestDay.hours + "h"} accent={accent} />}
          </div>
          {countries.length > 0 && (
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
              <MiniStat iconKey="film" value={countries[0].name} label={countries[0].count + " " + itemLabel + " · pays principal"} accent={accent} />
            </div>
          )}
        </div>
      </div>

      {/* Activite mensuelle */}
      {(() => {
        const monthly = data.extra?.films?.monthly || data.monthly || []
        if (monthly.length < 3) return null
        return (
          <div style={{ padding: "clamp(6px, 1.2vw, 10px)", marginBottom: 6, borderRadius: 14, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
            <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
            <AreaG data={monthly} dataKey="v" accent={accent} height={80} unit=" vues" id={"stats-enriched-" + label} prevData={prevMonthly} prevDataKey="previous" />
            <CompLegend accent={accent} year={year} />
          </div>
        )
      })()}

      {/* Top films — compact 2-column grid */}
      {top.length > 0 && (
        <div className="s2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {top.slice(0, 4).map((item, i) => (
            <div key={item.t || i} style={{
              padding: "7px", display: "flex", gap: 7, borderRadius: 10,
              background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
              animation: "slide-up .4s ease " + (0.15 + i * 0.08) + "s both",
              border: i === 0 ? `1px solid ${accent}35` : "1px solid rgba(255,255,255,0.15)",
              boxShadow: i === 0 ? `0 0 14px ${accent}12` : undefined,
              position: "relative", overflow: "hidden",
            }}>
              {i === 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 30%, ${accent}15 50%, transparent 70%)`, animation: "badge-shine 4s ease-in-out 2s infinite", pointerEvents: "none" }} />}
              <PosterImg src={item.thumb} size={34} />
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace" }}>#{i + 1}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "white", lineHeight: 1.15, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.t}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 2 }}>
                  {item.r > 0 && <span style={{ fontSize: 9, color: "#fbbf24", fontWeight: 600 }}>★{item.r}</span>}
                  {item.y && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{item.y}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stamp animation */}
      {stamped && (config.showStamp !== false) && (
        <div style={{
          position: "absolute", top: 30, right: -5,
          transform: "rotate(15deg)",
          zIndex: 10, pointerEvents: "none",
          animation: "stamp-hit 0.4s cubic-bezier(0.17, 0.67, 0.21, 1.2) both",
        }}>
          <div style={{
            padding: "5px 18px", borderRadius: 6,
            border: `2px solid ${accent}`,
            color: accent,
            fontSize: 14, fontWeight: 900, fontFamily: "JetBrains Mono,monospace",
            textTransform: "uppercase", letterSpacing: "0.12em",
            textShadow: `0 0 12px ${accent}50`,
            boxShadow: `0 0 16px ${accent}20`,
            background: accent + "0a",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}35 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
            <span style={{ position: "relative" }}>{config.stampText || "Approuve"}</span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes stamp-hit {
          0% { transform: rotate(15deg) scale(3); opacity: 0; }
          60% { transform: rotate(15deg) scale(0.95); opacity: 0.8; }
          80% { transform: rotate(15deg) scale(1.02); opacity: 0.7; }
          100% { transform: rotate(15deg) scale(1); opacity: 0.7; }
        }
        @keyframes stamp-pulse {
          0%, 100% { transform: rotate(15deg) scale(1); opacity: 0.7; }
          50% { transform: rotate(15deg) scale(1.06); opacity: 0.9; }
        }
      `}</style>
    </div>
  </div>
}
