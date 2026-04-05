import { useState, useEffect } from "react"
import { useActive, AN, Tag, Lbl, Pill, AreaG, useComparison, CompBadge, CompLegend } from "../SharedUI"
import { useLabels } from "../ThemeContext"

const DEFAULT_CATEGORIES = [
  { min: 0, max: 1, name: "Curieux débutant", desc: "Tu as effleuré le monde des livres audio", emoji: "👂" },
  { min: 1, max: 10, name: "Auditeur occasionnel", desc: "Tu écoutes de temps en temps", emoji: "🎧" },
  { min: 10, max: 30, name: "Lecteur régulier", desc: "Les livres audio font partie de ton quotidien", emoji: "📖" },
  { min: 30, max: 80, name: "Dévoreur de livres", desc: "Tu enchaînes les chapitres sans relâche", emoji: "📚" },
  { min: 80, max: 200, name: "Marathonien littéraire", desc: "Tu vis et respires livres audio", emoji: "🏆" },
  { min: 200, max: 99999, name: "Légende de l'écoute", desc: "Tu as probablement écouté plus que ton narrateur préféré", emoji: "👑" },
]

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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--th-surface-subtle)" strokeWidth={stroke} />
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
            <span style={{ fontSize: "clamp(10px, 1.4vw, 13px)", color: i === 0 ? "var(--th-text)" : "var(--th-text-secondary)", fontWeight: i === 0 ? 700 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>{g.n}</span>
            <span style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "var(--th-text-muted)", fontFamily: "var(--th-font-mono)", flexShrink: 0 }}>{g.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const ICONS = {
  book: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  mic: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  pen: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  calendar: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>,
}

function MiniStat({ iconKey, value, label, accent }) {
  const iconFn = ICONS[iconKey] || ICONS.book
  return (
    <div style={{ flex: "1 1 auto", display: "flex", alignItems: "center", gap: "clamp(5px, 1vw, 8px)", padding: "clamp(6px, 1vw, 9px) clamp(7px, 1.2vw, 10px)", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface-hover)", border: "1px solid var(--th-border-strong)", backdropFilter: "var(--th-glass-blur)", minWidth: 0, overflow: "hidden" }}>
      <div style={{ flexShrink: 0 }}>{iconFn(accent)}</div>
      <div style={{ minWidth: 0, overflow: "hidden" }}>
        <div style={{ fontSize: "clamp(11px, 1.6vw, 14px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.15, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</div>
        <div style={{ fontSize: "clamp(8px, 1.1vw, 10px)", color: accent, lineHeight: 1.15, opacity: 0.8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</div>
      </div>
    </div>
  )
}

function formatEquiv(hours) {
  if (hours >= 720) return (hours / 720).toFixed(1) + " mois"
  if (hours >= 168) return (hours / 168).toFixed(1) + " sem."
  if (hours >= 24) return (hours / 24).toFixed(1) + " jours"
  if (hours >= 1) return Math.round(hours) + "h"
  return Math.round(hours * 60) + " min"
}

export default function AudiobookBilanSlide({ accent, data, year, config = {}, serviceType }) {
  const active = useActive()
  const L = useLabels()
  const [stamped, setStamped] = useState(false)
  useEffect(() => { const t = setTimeout(() => setStamped(true), 3500); return () => clearTimeout(t) }, [])

  const totalItems = data.total_items || 0
  const timeUnit = data.extra?.time_unit || "h"
  const totalHours = data.total_hours || 0
  const totalDisplay = timeUnit === "min" ? totalHours : totalHours // already in correct unit from backend
  const top = data.top || []
  const allBooks = data.extra?.all_books || top
  const genres = data.genres || []
  const topAuthors = data.extra?.top_authors || []
  const topNarrators = data.extra?.top_narrators || []
  const booksFinished = data.extra?.books_finished || 0
  const totalSessions = data.extra?.total_sessions || 0

  // Category based on hours (convert min to hours for thresholds)
  const hoursForCategory = timeUnit === "min" ? totalHours / 60 : totalHours
  const categories = config.categories || DEFAULT_CATEGORIES
  const category = categories.find((c) => hoursForCategory >= c.min && hoursForCategory < c.max) || categories[categories.length - 1]
  const equiv = formatEquiv(hoursForCategory)

  // Comparison
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.[serviceType] || null) : null
  const prevItems = prevSvc?.total_items?.previous
  const prevHours = prevSvc?.total_hours?.previous
  const prevMonthly = prevSvc?.monthly || null
  const prevGenres = (prevSvc?.genres || []).filter((g) => (g.previous || 0) > 0).sort((a, b) => (b.previous || 0) - (a.previous || 0)).slice(0, 4)

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%", position: "relative" }}>
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="s0" style={{ marginBottom: 8 }}>
        <Tag accent={accent} year={year} /><Lbl c={accent} size={9}>🎧 LIVRES AUDIO</Lbl>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05, marginTop: 4 }}>
          Ton bilan <span style={{ color: accent }}>écoute</span>
        </h2>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "clamp(6px, 1.5vw, 12px)", marginTop: 6, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)", lineHeight: 1 }}>{active ? <AN t={totalItems} s="" /> : "0"}</span>
            <span style={{ fontSize: "clamp(10px, 1.3vw, 13px)", fontWeight: 600, color: accent + "90" }}>livres</span>
            <CompBadge current={totalItems} previous={prevItems} />
          </div>
          <div style={{ height: 20, width: 1, background: "var(--th-surface)" }} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontSize: "clamp(26px, 7vw, 36px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)", lineHeight: 1 }}>{active ? <AN t={Math.round(totalDisplay)} s={timeUnit} /> : "0" + timeUnit}</span>
            <CompBadge current={totalHours} previous={prevHours} suffix={timeUnit} />
          </div>
        </div>

        {/* Category badge */}
        <div style={{ display: "flex", gap: "clamp(4px, 1vw, 8px)", marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "clamp(4px, 0.8vw, 8px)", padding: "clamp(6px, 1vw, 10px) clamp(10px, 2vw, 16px)", borderRadius: "var(--th-radius-pill)", background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 16px ${accent}20`, overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
            <span style={{ fontSize: "clamp(16px, 3.5vw, 22px)", position: "relative" }}>{category.emoji}</span>
            <span style={{ fontSize: "clamp(11px, 1.6vw, 14px)", fontWeight: 700, color: accent, position: "relative" }}>{category.name}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "clamp(4px, 0.8vw, 8px)", padding: "clamp(6px, 1vw, 10px) clamp(10px, 2vw, 16px)", borderRadius: "var(--th-radius-pill)", background: "var(--th-surface-hover)", border: "1px solid var(--th-border-strong)" }}>
            <span style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}>⏱️</span>
            <span style={{ fontSize: "clamp(11px, 1.6vw, 14px)", fontWeight: 700, color: "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>{equiv}</span>
          </div>
        </div>
      </div>

      {/* Genres donut + quick stats */}
      <div className="s1" style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "stretch", flexWrap: "wrap" }}>
        {genres.length > 0 && (
          <div style={{ flex: "1 1 100%", padding: "clamp(6px, 1.2vw, 10px)", borderRadius: "var(--th-radius)", background: "var(--th-surface-hover)", border: "1px solid var(--th-border-strong)" }}>
            <GenreDonut genres={genres} accent={accent} />
            {comp.active && prevGenres.length > 0 && (<>
              <div style={{ height: 1, background: "var(--th-border-dim)", margin: "8px 0 6px" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: "clamp(7px, 0.9vw, 9px)", color: "var(--th-text-dim)", textTransform: "uppercase", letterSpacing: ".05em" }}>{year - 1}</span>
                {prevGenres.map((g, i) => (
                  <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px", borderRadius: 7, fontSize: "clamp(8px, 1vw, 10px)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", color: "var(--th-text-tertiary)" }}>
                    {g.n} <span style={{ fontFamily: "var(--th-font-mono)", fontWeight: 700, fontSize: "clamp(7px, 0.9vw, 9px)", color: "var(--th-text-muted)" }}>{g.previous}</span>
                  </span>
                ))}
              </div>
            </>)}
          </div>
        )}
        <div style={{ flex: "1 1 100%", display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {totalSessions > 0 && <MiniStat iconKey="book" value={totalSessions} label="sessions d'écoute" accent={accent} />}
            {booksFinished > 0 && <MiniStat iconKey="check" value={booksFinished} label="livres terminés" accent={accent} />}
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
            {topAuthors[0] && <MiniStat iconKey="pen" value={topAuthors[0].name} label={topAuthors[0].hours + (timeUnit === "min" ? " min" : "h") + " d'écoute"} accent={accent} />}
            {topNarrators[0] && <MiniStat iconKey="mic" value={topNarrators[0].name} label={topNarrators[0].hours + (timeUnit === "min" ? " min" : "h") + " · narrateur"} accent={accent} />}
          </div>
        </div>
      </div>

      {/* Monthly */}
      {(() => {
        const monthly = data.monthly || []
        const hasData = monthly.some(m => m.v > 0)
        if (!hasData) return null
        return (
          <div style={{ padding: "clamp(6px, 1.2vw, 10px)", marginBottom: 6, borderRadius: "var(--th-radius)", background: "var(--th-surface-hover)", border: "1px solid var(--th-border-strong)" }}>
            <Lbl c={accent} size={8}>Écoute mensuelle ({timeUnit})</Lbl>
            <AreaG data={monthly} dataKey="v" accent={accent} height={80} unit={" " + timeUnit} id="abs-bilan-monthly" prevData={prevMonthly} prevDataKey="previous" />
            <CompLegend accent={accent} year={year} />
          </div>
        )
      })()}

      {/* Top books */}
      {top.length > 0 && (
        <div className="s2" style={{ display: "grid", gridTemplateColumns: top.length > 1 ? "1fr 1fr" : "1fr", gap: 6 }}>
          {top.slice(0, 4).map((item, i) => (
            <div key={item.t || i} style={{
              padding: "7px", display: "flex", gap: 7, borderRadius: "var(--th-radius-sm)",
              background: "var(--th-surface-hover)",
              animation: "slide-up .4s ease " + (0.15 + i * 0.08) + "s both",
              border: i === 0 ? `1px solid ${accent}35` : "1px solid var(--th-border-strong)",
              boxShadow: i === 0 ? `0 0 14px ${accent}12` : undefined,
              position: "relative", overflow: "hidden",
            }}>
              {i === 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 30%, ${accent}15 50%, transparent 70%)`, animation: "badge-shine 4s ease-in-out 2s infinite", pointerEvents: "none" }} />}
              <PosterImg src={item.thumb} size={34} />
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ fontSize: 9, color: accent, fontFamily: "var(--th-font-mono)" }}>#{i + 1}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--th-text)", lineHeight: 1.15, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.t}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 2, flexWrap: "wrap" }}>
                  {item.author && <span style={{ fontSize: 8, color: "var(--th-text-tertiary)" }}>{item.author}</span>}
                  {item.h > 0 && <span style={{ fontSize: 8, color: accent + "80" }}>{item.h}{item.h_unit || "h"}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stamp */}
      {stamped && (config.showStamp !== false) && (
        <div style={{
          position: "absolute", top: "12%", right: -8,
          transform: "rotate(22deg)", zIndex: 10, pointerEvents: "none",
          animation: "stamp-hit 0.4s cubic-bezier(0.17, 0.67, 0.21, 1.2) both",
        }}>
          <div style={{
            padding: "clamp(6px, 1.2vw, 10px) clamp(20px, 4vw, 30px)", borderRadius: "var(--th-radius-xs)",
            border: `3px solid ${accent}`, color: accent,
            fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, fontFamily: "var(--th-font-mono)",
            textTransform: "uppercase", letterSpacing: "0.15em",
            textShadow: `0 0 16px ${accent}50`, boxShadow: `0 0 20px ${accent}20`,
            background: accent + "0a", position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}35 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
            <span style={{ position: "relative" }}>{config.stampText || "Écouté"}</span>
          </div>
        </div>
      )}
      <style>{`
        @keyframes stamp-hit { 0% { transform: rotate(22deg) scale(3); opacity: 0; } 60% { transform: rotate(22deg) scale(0.95); opacity: 0.8; } 80% { transform: rotate(22deg) scale(1.02); opacity: 0.7; } 100% { transform: rotate(22deg) scale(1); opacity: 0.7; } }
        @keyframes badge-shine { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
      `}</style>
    </div>
  </div>
}
