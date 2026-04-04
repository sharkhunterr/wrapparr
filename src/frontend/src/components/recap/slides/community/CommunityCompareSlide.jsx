import { useActive, AN, Tag, Lbl } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts"
import { PosterImg } from "./shared"

export function CommunityCompareSlide({ accent, compareData, year, mediaType = "films" }) {
  const L = useLabels()
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"

  const yvy = compareData?.year_vs_year || compareData
  if (!yvy) return null

  // Use per-media data if available, fallback to global
  const mediaKey = isSeries ? "series" : "films"
  const mediaData = yvy[mediaKey] || {}
  const curItems = mediaData.current || yvy.total_items?.current || 0
  const prevItems = mediaData.previous || yvy.total_items?.previous || 0
  const curHours = mediaData.hours?.current || yvy.total_hours?.current || 0
  const prevHours = mediaData.hours?.previous || yvy.total_hours?.previous || 0
  const diffItems = prevItems > 0 ? Math.round(((curItems - prevItems) / prevItems) * 100) : 0
  const diffHours = prevHours > 0 ? Math.round(((curHours - prevHours) / prevHours) * 100) : 0

  // Per-media monthly and genres, fallback to global
  const monthly = mediaData.monthly || yvy.monthly || []
  const genres = (mediaData.genres || yvy.genres || []).slice(0, 6)
  const curGenres = genres.filter(g => (g.current || 0) > 0).sort((a, b) => (b.current || 0) - (a.current || 0)).slice(0, 5)
  const prevGenres = genres.filter(g => (g.previous || 0) > 0).sort((a, b) => (b.previous || 0) - (a.previous || 0)).slice(0, 5)

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 10 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
        {year} vs <span style={{ color: accent }}>{year - 1}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Comparaison {label}</div>
    </div>

    {/* Totaux avec diff badges */}
    <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
        <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? curItems : 0}</span>
        <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>{isSeries ? L.episodes : label}</span>
        <span style={{ fontSize: 9, color: "var(--th-text-dim)" }}>vs {prevItems}</span>
        {diffItems !== 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: diffItems > 0 ? "#4ade80" : "#f87171", padding: "1px 6px", borderRadius: "var(--th-radius-xs)", background: diffItems > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
            {diffItems > 0 ? "+" : ""}{diffItems}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
        <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? Math.round(curHours) : 0}h</span>
        <span style={{ fontSize: 9, color: "var(--th-text-dim)" }}>vs {Math.round(prevHours)}h</span>
        {diffHours !== 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: diffHours > 0 ? "#4ade80" : "#f87171", padding: "1px 6px", borderRadius: "var(--th-radius-xs)", background: diffHours > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
            {diffHours > 0 ? "+" : ""}{diffHours}%
          </span>
        )}
      </div>
    </div>

    {/* Legende */}
    <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: accent }}><span style={{ width: 14, height: 2.5, borderRadius: 2, background: accent }} />{year}</span>
      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
        <svg width="14" height="3" style={{ flexShrink: 0 }}><line x1="0" y1="1.5" x2="14" y2="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
        {year - 1}
      </span>
    </div>

    {/* Activite mensuelle comparee */}
    {monthly.length > 0 && (
      <div className="s1" style={{ padding: "10px 10px 6px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 8 }}>
        <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={monthly} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={"cmp-cur-" + mediaType} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id={"cmp-prev-" + mediaType} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.15} />
                <stop offset="100%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
            <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={(() => { const max = Math.max(...(monthly || []).map(d => Math.max(d?.current || 0, d?.previous || 0)), 0); if (max >= 1000) return 38; if (max >= 100) return 32; return 28 })()} />
            <Area type="monotone" dataKey="current" stroke={accent} strokeWidth={2} fill={"url(#cmp-cur-" + mediaType + ")"} dot={false} animationBegin={200} animationDuration={1200} />
            <Area type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" fill={"url(#cmp-prev-" + mediaType + ")"} dot={false} animationBegin={400} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Genres */}
    {(curGenres.length > 0 || prevGenres.length > 0) && (
      <div className="s2" style={{ padding: "10px 10px 8px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 8 }}>
        <Lbl c={accent} size={8}>Genres</Lbl>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          {/* Current year */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{year}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {curGenres.map((g, i) => (
                <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "var(--th-radius-xs)", background: i === 0 ? accent + "18" : "var(--th-surface-subtle)", border: "1px solid " + (i === 0 ? accent + "30" : "var(--th-border-subtle)"), fontSize: 10, color: i === 0 ? accent : "rgba(255,255,255,0.6)", fontWeight: i === 0 ? 700 : 500 }}>
                  {g.n} <span style={{ fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontWeight: 700, fontSize: 9, color: accent }}>{g.current}</span>
                </span>
              ))}
            </div>
          </div>
          {/* Previous year */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{year - 1}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {prevGenres.map((g, i) => (
                <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: "var(--th-radius-xs)", background: "var(--th-surface-dim)", border: "1px solid var(--th-border-dim)", fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: i === 0 ? 600 : 400 }}>
                  {g.n} <span style={{ fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontWeight: 700, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{g.previous}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Top 3 par vues — current vs previous */}
    {(() => {
      const topKey = isSeries ? "top_series" : "top_films"
      const topData = compareData?.[topKey]
      if (!topData) return null
      const curByViews = topData.current?.by_views || []
      const prevByViews = topData.previous?.by_views || []
      const curByUsers = topData.current?.by_users || []
      const prevByUsers = topData.previous?.by_users || []
      const rankBadge = (pos, isCurrent) => (
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 6, fontSize: 9, fontWeight: 800, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", flexShrink: 0, background: pos === 0 ? (isCurrent ? accent + "20" : "var(--th-surface)") : "var(--th-surface-subtle)", color: pos === 0 ? (isCurrent ? accent : "var(--th-text-secondary)") : "var(--th-text-muted)", border: "1px solid " + (pos === 0 ? (isCurrent ? accent + "40" : "var(--th-border)") : "var(--th-border-dim)") }}>
          {pos + 1}
        </span>
      )
      const renderTop = (items, yearLabel, isCurrent) => (
        items.length > 0 && <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8, color: isCurrent ? accent : "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{yearLabel}</div>
          {items.map((it, i) => (
            <div key={it.t + i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {rankBadge(i, isCurrent)}
              <PosterImg src={it.thumb} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "var(--th-text)" : "var(--th-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t}</div>
                <div style={{ fontSize: 8, color: "var(--th-text-muted)" }}>{it.total_views} {isSeries ? L.episodes : "vue" + (it.total_views > 1 ? "s" : "")}</div>
              </div>
            </div>
          ))}
        </div>
      )
      const renderTopUsers = (items, yearLabel, isCurrent) => (
        items.length > 0 && <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 8, color: isCurrent ? accent : "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{yearLabel}</div>
          {items.map((it, i) => (
            <div key={it.t + i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
              {rankBadge(i, isCurrent)}
              <PosterImg src={it.thumb} size={28} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "var(--th-text)" : "var(--th-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t}</div>
                <div style={{ fontSize: 8, color: "var(--th-text-muted)" }}>{it.user_count} utilisateur{it.user_count > 1 ? "s" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )
      return <>
        {(curByViews.length > 0 || prevByViews.length > 0) && (
          <div className="s3" style={{ padding: "10px 10px 8px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 8 }}>
            <Lbl c={accent} size={8}>Top {label} les plus {L.viewed}</Lbl>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {renderTop(curByViews, String(year), true)}
              {renderTop(prevByViews, String(year - 1), false)}
            </div>
          </div>
        )}
        {(curByUsers.length > 0 || prevByUsers.length > 0) && (
          <div className="s4" style={{ padding: "10px 10px 8px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 8 }}>
            <Lbl c={accent} size={8}>Top {label} vus par le plus d'utilisateurs</Lbl>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {renderTopUsers(curByUsers, String(year), true)}
              {renderTopUsers(prevByUsers, String(year - 1), false)}
            </div>
          </div>
        )}
      </>
    })()}
  </div>
}
