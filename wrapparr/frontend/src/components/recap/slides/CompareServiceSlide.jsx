import { useState } from "react"
import { useActive, Tag, Lbl } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts"

function PosterImg({ src, size = 28 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.06)" }} />
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 5, objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }} />
}

function PersonImg({ src, size = 24 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)" }} />
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
}

function RankBadge({ pos, accent, isCurrent }) {
  return <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 18, height: 18, borderRadius: 6, fontSize: 9, fontWeight: 800,
    fontFamily: "JetBrains Mono,monospace", flexShrink: 0,
    background: pos === 0 ? (isCurrent ? accent + "20" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)",
    color: pos === 0 ? (isCurrent ? accent : "rgba(255,255,255,0.5)") : "rgba(255,255,255,0.3)",
    border: "1px solid " + (pos === 0 ? (isCurrent ? accent + "40" : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.06)"),
  }}>{pos + 1}</span>
}

const card = { padding: "10px 10px 8px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }

const DEFAULT_FILM_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", emoji: "🍿" },
  { min: 20, max: 50, name: "Cinephile du dimanche", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro du cinema", emoji: "🎬" },
  { min: 100, max: 200, name: "Machine a films", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien supreme", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende vivante", emoji: "👑" },
]

const DEFAULT_SERIES_CATEGORIES = [
  { min: 0, max: 20, name: "Spectateur occasionnel", emoji: "📺" },
  { min: 20, max: 50, name: "Binge watcher debutant", emoji: "🛋️" },
  { min: 50, max: 100, name: "Accro aux series", emoji: "📺" },
  { min: 100, max: 200, name: "Machine a episodes", emoji: "🤖" },
  { min: 200, max: 500, name: "Marathonien des series", emoji: "🏆" },
  { min: 500, max: 99999, name: "Legende du binge", emoji: "👑" },
]

export default function CompareServiceSlide({ accent, compareData, year, mediaType = "films", config = {}, bilanCategories }) {
  const active = useActive()

  // Support both { year_vs_year: {...} } and flat data
  const raw = compareData?.year_vs_year || compareData
  if (!raw) return null

  const isSeriesSlide = mediaType === "series"
  const label = isSeriesSlide ? "series" : "films"

  // Per-media data
  const mediaData = raw[mediaType] || {}
  const curItems = mediaData.current || raw.total_items?.current || 0
  const prevItems = mediaData.previous || raw.total_items?.previous || 0
  const curHours = mediaData.hours?.current || raw.total_hours?.current || 0
  const prevHours = mediaData.hours?.previous || raw.total_hours?.previous || 0
  const diffItems = prevItems > 0 ? Math.round(((curItems - prevItems) / prevItems) * 100) : 0
  const diffHours = prevHours > 0 ? Math.round(((curHours - prevHours) / prevHours) * 100) : 0

  const monthly = mediaData.monthly || raw.monthly || []
  const genres = (mediaData.genres || raw.genres || []).slice(0, 6)
  const curGenres = genres.filter(g => (g.current || 0) > 0).sort((a, b) => (b.current || 0) - (a.current || 0)).slice(0, 3)
  const prevGenres = genres.filter(g => (g.previous || 0) > 0).sort((a, b) => (b.previous || 0) - (a.previous || 0)).slice(0, 3)

  const topData = mediaData.top || {}
  const curTop = topData.current || []
  const prevTop = topData.previous || []

  // Per-media data first, fallback to root
  const actors = isSeriesSlide ? {} : (mediaData.actors || raw.actors || {})
  const directors = isSeriesSlide ? {} : (mediaData.directors || raw.directors || {})
  const topRated = mediaData.top_rated || raw.top_rated || {}
  const worstRated = mediaData.worst_rated || raw.worst_rated || {}
  const budgets = isSeriesSlide ? {} : (raw.budgets || {})
  const countries = raw.countries || {}

  // Compute category from bilan settings (same logic as FilmStatsEnrichedSlide)
  const cats = bilanCategories || (isSeriesSlide ? DEFAULT_SERIES_CATEGORIES : DEFAULT_FILM_CATEGORIES)
  const findCat = (hours) => cats.find((c) => hours >= c.min && hours < c.max) || cats[cats.length - 1]
  const category = (curHours > 0 || prevHours > 0) ? {
    current: { name: findCat(curHours).name, emoji: findCat(curHours).emoji },
    previous: { name: findCat(prevHours).name, emoji: findCat(prevHours).emoji },
  } : {}

  const peak = mediaData.peak || {}

  const prevColor = accent + "60"

  return <div style={{ maxWidth: 440, width: "100%" }}>
    {/* Header */}
    <div className="s0" style={{ marginBottom: 10 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        <span style={{ color: accent }}>{year}</span> vs {year - 1}
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Comparaison {label}</div>
    </div>

    {/* Totaux */}
    <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{active ? curItems : 0}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{isSeriesSlide ? "ep." : label}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>vs {prevItems}</span>
        {diffItems !== 0 && <DiffBadge value={diffItems} />}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{active ? Math.round(curHours) : 0}h</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>vs {Math.round(prevHours)}h</span>
        {diffHours !== 0 && <DiffBadge value={diffHours} />}
      </div>
    </div>

    {/* Legende */}
    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: accent }}>
        <span style={{ width: 14, height: 2.5, borderRadius: 2, background: accent }} />{year}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
        <svg width="14" height="3" style={{ flexShrink: 0 }}><line x1="0" y1="1.5" x2="14" y2="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
        {year - 1}
      </span>
    </div>

    {/* Activite mensuelle */}
    {monthly.length > 0 && (
      <div className="s1" style={card}>
        <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id={"svc-cur-" + mediaType} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={"svc-prev-" + mediaType} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
            <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={28} />
            <Area type="monotone" dataKey="current" stroke={accent} strokeWidth={2} fill={"url(#svc-cur-" + mediaType + ")"} dot={false} animationBegin={200} animationDuration={1200} />
            <Area type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" fill={"url(#svc-prev-" + mediaType + ")"} dot={false} animationBegin={400} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Profil — categorie, #1 film/serie, notes, acteur, realisateur, genres, budget, pays */}
    {(() => {
      const top1Film = { cur: curTop[0], prev: prevTop[0] }
      const top1Rated = { cur: (topRated.current || [])[0], prev: (topRated.previous || [])[0] }
      const top1Worst = { cur: (worstRated.current || [])[0], prev: (worstRated.previous || [])[0] }
      const top1Actor = { cur: (actors.current || [])[0], prev: (actors.previous || [])[0] }
      const top1Director = { cur: (directors.current || [])[0], prev: (directors.previous || [])[0] }
      const rows = [
        top1Film.cur || top1Film.prev ? { label: isSeriesSlide ? "Serie #1" : "Film #1", cur: top1Film.cur, prev: top1Film.prev, type: "media" } : null,
        top1Rated.cur || top1Rated.prev ? { label: "Mieux note", cur: top1Rated.cur, prev: top1Rated.prev, type: "rated" } : null,
        top1Worst.cur || top1Worst.prev ? { label: "Moins bien note", cur: top1Worst.cur, prev: top1Worst.prev, type: "rated" } : null,
        top1Actor.cur || top1Actor.prev ? { label: "Acteur #1", cur: top1Actor.cur, prev: top1Actor.prev, type: "person" } : null,
        top1Director.cur || top1Director.prev ? { label: "Realisateur #1", cur: top1Director.cur, prev: top1Director.prev, type: "person" } : null,
        curGenres.length > 0 || prevGenres.length > 0 ? { label: "Genres", type: "genres" } : null,
      ].filter(Boolean)
      const fmtBudget = (v) => { if (!v) return "—"; if (v >= 1e9) return (v / 1e9).toFixed(1) + "Md$"; if (v >= 1e6) return Math.round(v / 1e6) + "M$"; if (v >= 1e3) return Math.round(v / 1e3) + "k$"; return v + "$" }
      const catBadge = (cat, isCur) => cat ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: isCur ? `linear-gradient(135deg, ${accent}25, ${accent}12)` : "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))", border: `1px solid ${isCur ? accent + "35" : "rgba(255,255,255,0.08)"}`, backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 12, filter: isCur ? `drop-shadow(0 1px 4px ${accent}40)` : "none" }}>{cat.emoji}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: isCur ? accent : "rgba(255,255,255,0.45)", lineHeight: 1 }}>{cat.name}</span>
        </span>
      ) : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>—</span>

      // Add category row at top if available
      const allRows = [
        category.current || category.previous ? { label: "Categorie", type: "category" } : null,
        ...rows,
        !isSeriesSlide && (budgets.current?.average || budgets.previous?.average) ? { label: "Budget moy.", type: "budget" } : null,
      ].filter(Boolean)

      if (!allRows.length) return null
      return <div className="s3" style={card}>
        <Lbl c={accent} size={8}>Profil {label}</Lbl>
        {/* Column headers */}
        <div style={{ display: "flex", gap: 8, marginTop: 6, marginBottom: 6 }}>
          <div style={{ width: 75 }} />
          <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".05em" }}>{year}</div>
          <div style={{ flex: 1, fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em" }}>{year - 1}</div>
        </div>
        {allRows.map((row, ri) => (
          <div key={ri} style={{ display: "flex", gap: 8, alignItems: (row.type === "category" || row.type === "genres") ? "flex-start" : "center", marginBottom: 6, padding: "4px 0", borderTop: ri > 0 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
            <div style={{ width: 75, fontSize: 9, color: "rgba(255,255,255,0.35)", flexShrink: 0, paddingTop: (row.type === "category" || row.type === "genres") ? 4 : 0 }}>{row.label}</div>
            {row.type === "category" ? <>
              <div style={{ flex: 1, minWidth: 0 }}>{catBadge(category.current, true)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>{catBadge(category.previous, false)}</div>
            </> : row.type === "budget" ? <>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono,monospace", color: accent }}>{fmtBudget(budgets.current?.average)}</div>
              <div style={{ flex: 1, fontSize: 11, fontWeight: 700, fontFamily: "JetBrains Mono,monospace", color: "rgba(255,255,255,0.4)" }}>{fmtBudget(budgets.previous?.average)}</div>
            </> : row.type === "genres" ? <>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 3 }}>
                {curGenres.map((g, i) => (
                  <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 7, fontSize: 9, background: i === 0 ? accent + "18" : "rgba(255,255,255,0.04)", border: "1px solid " + (i === 0 ? accent + "30" : "rgba(255,255,255,0.08)"), color: i === 0 ? accent : "rgba(255,255,255,0.6)", fontWeight: i === 0 ? 700 : 500 }}>
                    {g.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: 8, color: accent }}>{g.current}</span>
                  </span>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0, display: "flex", flexWrap: "wrap", gap: 3 }}>
                {prevGenres.map((g, i) => (
                  <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 7, fontSize: 9, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.45)", fontWeight: i === 0 ? 600 : 400 }}>
                    {g.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: 8, color: "rgba(255,255,255,0.35)" }}>{g.previous}</span>
                  </span>
                ))}
              </div>
            </> : <>
              {[{ it: row.cur, isCur: true }, { it: row.prev, isCur: false }].map(({ it, isCur }, ci) => (
                <div key={ci} style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 5 }}>
                  {it ? <>
                    {row.type === "person"
                      ? <PersonImg src={it.photo} size={22} />
                      : <PosterImg src={it.thumb} size={20} />
                    }
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: isCur ? "white" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t || it.n}</div>
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>
                        {row.type === "rated" ? `${it.r}/10` : row.type === "person" ? `${it.count} ${isSeriesSlide ? "series" : "films"}` : `${it.plays} ${isSeriesSlide ? "ep." : "vue" + ((it.plays || 0) > 1 ? "s" : "")}`}
                      </div>
                    </div>
                  </> : <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)" }}>—</span>}
                </div>
              ))}
            </>}
          </div>
        ))}

        {/* Top 3 pays en badges */}
        {(countries.current?.length > 0 || countries.previous?.length > 0) && (
          <div style={{ display: "flex", gap: 8, padding: "4px 0", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ width: 75, fontSize: 9, color: "rgba(255,255,255,0.35)", flexShrink: 0, paddingTop: 2 }}>Pays</div>
            {[{ items: countries.current || [], isCur: true }, { items: countries.previous || [], isCur: false }].map(({ items, isCur }, ci) => (
              <div key={ci} style={{ flex: 1, display: "flex", flexWrap: "wrap", gap: 4 }}>
                {items.map((c, i) => (
                  <span key={c.n + i} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 7, fontSize: 9, background: i === 0 && isCur ? accent + "18" : "rgba(255,255,255,0.04)", border: "1px solid " + (i === 0 && isCur ? accent + "30" : "rgba(255,255,255,0.06)"), color: isCur ? (i === 0 ? accent : "rgba(255,255,255,0.55)") : "rgba(255,255,255,0.4)", fontWeight: i === 0 ? 600 : 400 }}>
                    {c.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 8, fontWeight: 700, color: isCur ? accent : "rgba(255,255,255,0.3)" }}>{c.v}</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    })()}

    {/* Peak hour */}
    {(peak.current?.hour != null || peak.previous?.hour != null) && (
      <div className="s8" style={{ ...card, display: "flex", gap: 8 }}>
        {[{ p: peak.current, yr: year, cur: true }, { p: peak.previous, yr: year - 1, cur: false }].map(({ p, yr, cur }) => (
          p?.hour != null && <div key={yr} style={{ flex: 1, padding: "8px 10px", borderRadius: 10, background: cur ? accent + "08" : "rgba(255,255,255,0.02)", border: "1px solid " + (cur ? accent + "20" : "rgba(255,255,255,0.06)") }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Heure de pointe {yr}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: cur ? accent : "rgba(255,255,255,0.5)", lineHeight: 1 }}>{p.hour}h</div>
            {p.count != null && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", marginTop: 2 }}>{p.count} {isSeriesSlide ? "ep." : "vues"}</div>}
          </div>
        ))}
      </div>
    )}
  </div>
}

function DiffBadge({ value }) {
  return <span style={{
    fontSize: 9, fontWeight: 700,
    color: value > 0 ? "#4ade80" : "#f87171",
    padding: "1px 6px", borderRadius: 8,
    background: value > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)",
  }}>{value > 0 ? "+" : ""}{value}%</span>
}

function TopColumn({ items, yearLabel, isCurrent, accent, isSeries }) {
  if (!items || items.length === 0) return null
  return <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: isCurrent ? accent : "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{yearLabel}</div>
    {items.map((it, i) => (
      <div key={it.t + i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <RankBadge pos={i} accent={accent} isCurrent={isCurrent} />
        <PosterImg src={it.thumb} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "white" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{it.plays} {isSeries ? "ep." : "vue" + (it.plays > 1 ? "s" : "")}</div>
        </div>
      </div>
    ))}
  </div>
}

function PersonColumn({ items, yearLabel, isCurrent, accent, unit = "films" }) {
  if (!items || items.length === 0) return null
  return <div style={{ flex: 1, minWidth: 0 }}>
    <div style={{ fontSize: 8, fontWeight: 700, color: isCurrent ? accent : "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{yearLabel}</div>
    {items.map((p, i) => (
      <div key={p.n + i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <RankBadge pos={i} accent={accent} isCurrent={isCurrent} />
        <PersonImg src={p.photo} size={24} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "white" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{p.n}</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{p.count} {unit}</div>
        </div>
      </div>
    ))}
  </div>
}
