import { useLabels } from "../ThemeContext"
import { Tag, Lbl, useActive, useComparison } from "../SharedUI"

export default function AllTimeRankingSlide({ accent, allUsers, year, me, prevAllUsers }) {
  const L = useLabels()
  const active = useActive()
  const comp = useComparison()

  // Build rankings — total across films + series
  const byViews = allUsers.map(u => {
    const films = u.data?.extra?.films?.total || u.data?.total_items || 0
    const series = u.data?.extra?.series?.episodes || 0
    return { n: u.name, v: films + series, isMe: u.isMe || u.name === me }
  }).filter(u => u.v > 0).sort((a, b) => b.v - a.v)

  const byHours = allUsers.map(u => {
    const films = u.data?.extra?.films?.hours || u.data?.total_hours || 0
    const series = u.data?.extra?.series?.hours || 0
    return { n: u.name, v: Math.round(films + series), isMe: u.isMe || u.name === me }
  }).filter(u => u.v > 0).sort((a, b) => b.v - a.v)

  // Previous year rankings for comparison
  let prevByViews = null, prevByHours = null
  if (comp.active && prevAllUsers?.length > 0) {
    prevByViews = prevAllUsers.map(u => {
      const films = u.data?.extra?.films?.total || u.data?.total_items || 0
      const series = u.data?.extra?.series?.episodes || 0
      return { n: u.name, v: films + series }
    }).filter(u => u.v > 0).sort((a, b) => b.v - a.v)

    prevByHours = prevAllUsers.map(u => {
      const films = u.data?.extra?.films?.hours || u.data?.total_hours || 0
      const series = u.data?.extra?.series?.hours || 0
      return { n: u.name, v: Math.round(films + series) }
    }).filter(u => u.v > 0).sort((a, b) => b.v - a.v)
  }

  // Rank diff badge
  function RankDiff({ name, prevRanking }) {
    if (!prevRanking || !comp.active) return null
    const prevIdx = prevRanking.findIndex(u => u.n === name)
    const currIdx = byViews.findIndex(u => u.n === name)
    if (prevIdx < 0 || currIdx < 0) return null
    const diff = prevIdx - currIdx // positive = gained places
    if (diff === 0) return <span style={{ fontSize: 8, color: "var(--th-text-muted)", marginLeft: 4 }}>=</span>
    return (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 2, fontSize: 8, fontWeight: 700, marginLeft: 4,
        padding: "1px 5px", borderRadius: 8,
        background: diff > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
        color: diff > 0 ? "#4ade80" : "#f87171",
      }}>
        {diff > 0 ? "↑" : "↓"}{Math.abs(diff)}
      </span>
    )
  }

  const myRankViews = byViews.findIndex(u => u.isMe) + 1
  const myRankHours = byHours.findIndex(u => u.isMe) + 1
  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 8 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Classement <span style={{ color: accent }}>general</span>
        </h2>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: "var(--th-text-muted)", marginTop: 4 }}>
          Films + Series · {allUsers.length} utilisateurs
        </div>
      </div>

      {/* Position badges */}
      <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--th-radius-pill)", background: accent + "18", border: "1px solid " + accent + "35", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
          <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono)", position: "relative" }}>{myRankViews > 0 ? `#${myRankViews}` : "—"}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: accent, position: "relative" }}>en {L.viewsUnit}</span>
          {prevByViews && <RankDiff name={me} prevRanking={prevByViews} />}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: "var(--th-radius-pill)", background: accent + "18", border: "1px solid " + accent + "35", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
          <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono)", position: "relative" }}>{myRankHours > 0 ? `#${myRankHours}` : "—"}</span>
          <span style={{ fontSize: 9, fontWeight: 700, color: accent, position: "relative" }}>en heures</span>
          {prevByHours && (() => {
            const prev = prevByHours.findIndex(u => u.n === me)
            const curr = byHours.findIndex(u => u.isMe)
            if (prev < 0 || curr < 0) return null
            const diff = prev - curr
            if (diff === 0) return <span style={{ fontSize: 8, color: "var(--th-text-muted)", marginLeft: 4 }}>=</span>
            return <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 8, fontWeight: 700, marginLeft: 4, padding: "1px 5px", borderRadius: 8, background: diff > 0 ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", color: diff > 0 ? "#4ade80" : "#f87171" }}>{diff > 0 ? "↑" : "↓"}{Math.abs(diff)}</span>
          })()}
        </div>
      </div>

      {/* By views */}
      {byViews.length > 0 && <>
        <Lbl c={accent} size={8}>Total {L.viewsUnit}</Lbl>
        <div style={{ marginTop: 4, marginBottom: 12 }}>
          {byViews.map((u, i) => {
            const max = byViews[0]?.v || 1
            return (
              <div key={u.n} style={{
                animation: "slide-up .4s ease " + (0.1 + i * 0.05) + "s both",
                padding: "4px 8px", borderRadius: "var(--th-radius-xs)",
                background: u.isMe ? accent + "10" : "transparent",
                border: u.isMe ? "1px solid " + accent + "25" : "1px solid transparent",
                marginBottom: 3,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: u.isMe ? 800 : (i === 0 ? 800 : 500),
                    color: u.isMe ? accent : (i === 0 ? accent : "var(--th-text-secondary)"),
                  }}>
                    {u.n}{u.isMe && <span style={{ fontSize: 9, color: accent, marginLeft: 4 }}>· moi</span>}
                    <RankDiff name={u.n} prevRanking={prevByViews} />
                  </span>
                  <span style={{ fontSize: 9, color: u.isMe ? accent + "80" : "var(--th-text-muted)", fontFamily: "var(--th-font-mono)" }}>#{i + 1}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: u.isMe ? accent : (i === 0 ? accent : "var(--th-text-tertiary)"), fontFamily: "var(--th-font-mono)", width: 45, textAlign: "right" }}>{u.v.toLocaleString("fr-FR")}</span>
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: u.isMe ? 1 : (opacities[i] || 0.15),
                    width: (u.v / max * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.05) + "s both",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </>}

      {/* By hours */}
      {byHours.length > 0 && <>
        <Lbl c={accent} size={8}>Heures {L.hours}</Lbl>
        <div style={{ marginTop: 4 }}>
          {byHours.map((u, i) => {
            const max = byHours[0]?.v || 1
            return (
              <div key={u.n} style={{
                animation: "slide-up .4s ease " + (0.15 + i * 0.05) + "s both",
                padding: "4px 8px", borderRadius: "var(--th-radius-xs)",
                background: u.isMe ? accent + "10" : "transparent",
                border: u.isMe ? "1px solid " + accent + "25" : "1px solid transparent",
                marginBottom: 3,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: u.isMe ? 800 : (i === 0 ? 800 : 500),
                    color: u.isMe ? accent : (i === 0 ? accent : "var(--th-text-secondary)"),
                  }}>
                    {u.n}{u.isMe && <span style={{ fontSize: 9, color: accent, marginLeft: 4 }}>· moi</span>}
                  </span>
                  <span style={{ fontSize: 9, color: u.isMe ? accent + "80" : "var(--th-text-muted)", fontFamily: "var(--th-font-mono)" }}>#{i + 1}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: u.isMe ? accent : (i === 0 ? accent : "var(--th-text-tertiary)"), fontFamily: "var(--th-font-mono)", width: 45, textAlign: "right" }}>{u.v.toLocaleString("fr-FR")}h</span>
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: u.isMe ? 1 : (opacities[i] || 0.15),
                    width: (u.v / max * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.35 + i * 0.05) + "s both",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </>}
    </div>
  )
}
