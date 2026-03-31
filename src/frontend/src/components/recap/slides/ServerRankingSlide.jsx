import { useLabels } from "../ThemeContext"
import { Tag, Lbl, useComparison } from "../SharedUI"

function RankBadge({ name, currentList, prevList }) {
  if (!prevList?.length) return null
  const currIdx = currentList.findIndex(u => u.name === name)
  const prevIdx = prevList.findIndex(u => u.name === name)
  if (currIdx < 0) return null
  if (prevIdx < 0) return <span style={{ display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, fontWeight: 700, marginLeft: 6, padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>NEW</span>
  const diff = prevIdx - currIdx
  if (diff === 0) return <span style={{ display: "inline-flex", alignItems: "center", fontSize: 9, fontWeight: 700, marginLeft: 6, padding: "2px 8px", borderRadius: 10, background: "rgba(100,180,255,0.1)", color: "rgba(100,180,255,0.6)" }}>=</span>
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 2, fontSize: 9, fontWeight: 800, marginLeft: 6,
      padding: "2px 8px", borderRadius: 10,
      background: diff > 0 ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.12)",
      color: diff > 0 ? "#4ade80" : "#f87171",
    }}>
      {diff > 0 ? "↑" : "↓"}{Math.abs(diff)}
    </span>
  )
}

export default function ServerRankingSlide({ accent, data, year, userName }) {
  const L = useLabels()
  const comp = useComparison()
  const ranking = data?.server_ranking
  if (!ranking) return null

  const byViews = ranking.by_views || []
  const byHours = ranking.by_hours || []
  const prevByViews = ranking.prev_by_views || []
  const prevByHours = ranking.prev_by_hours || []

  const myRankViews = byViews.findIndex(u => u.name === userName) + 1
  const myRankHours = byHours.findIndex(u => u.name === userName) + 1
  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 10 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Classement <span style={{ color: accent }}>serveur</span>
        </h2>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: "var(--th-text-muted)", marginTop: 4 }}>
          Cumul total depuis le debut · {byViews.length} utilisateur{byViews.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Position badges */}
      <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}25 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono)", position: "relative" }}>{myRankViews > 0 ? `#${myRankViews}` : "—"}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: accent, position: "relative" }}>en {L.viewsUnit}</span>
          {comp.active && <RankBadge name={userName} currentList={byViews} prevList={prevByViews} />}
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}25 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
          <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono)", position: "relative" }}>{myRankHours > 0 ? `#${myRankHours}` : "—"}</span>
          <span style={{ fontSize: 9, fontWeight: 600, color: accent, position: "relative" }}>en heures</span>
          {comp.active && <RankBadge name={userName} currentList={byHours} prevList={prevByHours} />}
        </div>
      </div>

      {/* By views */}
      {byViews.length > 0 && <>
        <Lbl c={accent} size={8}>Total {L.viewsUnit}</Lbl>
        <div className="s1" style={{ marginTop: 4, marginBottom: 14 }}>
          {byViews.map((u, i) => {
            const max = byViews[0]?.views || 1
            const isMe = u.name === userName
            return (
              <div key={u.name} style={{
                animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both",
                padding: "5px 10px", borderRadius: "var(--th-radius-xs)", marginBottom: 4,
                background: isMe ? accent + "10" : "transparent",
                border: isMe ? "1px solid " + accent + "20" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)",
                    fontFamily: "var(--th-font-mono)", width: 22, flexShrink: 0,
                  }}>#{i + 1}</span>
                  <span style={{
                    fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: isMe ? 800 : 500,
                    color: isMe ? accent : (i === 0 ? accent : "var(--th-text-secondary)"),
                  }}>
                    {u.name}{isMe && <span style={{ fontSize: 8, color: accent, marginLeft: 4, opacity: 0.7 }}>· moi</span>}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>
                    {u.views.toLocaleString("fr-FR")}
                  </span>
                  <RankBadge name={u.name} currentList={byViews} prevList={prevByViews} />
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: isMe ? 1 : (opacities[i] || 0.15),
                    width: (u.views / max * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both",
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </>}

      {/* By hours */}
      {byHours.length > 0 && <>
        <Lbl c={accent} size={8}>Heures totales</Lbl>
        <div className="s2" style={{ marginTop: 4 }}>
          {byHours.map((u, i) => {
            const max = byHours[0]?.hours || 1
            const isMe = u.name === userName
            return (
              <div key={u.name} style={{
                animation: "slide-up .4s ease " + (0.15 + i * 0.06) + "s both",
                padding: "5px 10px", borderRadius: "var(--th-radius-xs)", marginBottom: 4,
                background: isMe ? accent + "10" : "transparent",
                border: isMe ? "1px solid " + accent + "20" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{
                    fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)",
                    fontFamily: "var(--th-font-mono)", width: 22, flexShrink: 0,
                  }}>#{i + 1}</span>
                  <span style={{
                    fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    fontWeight: isMe ? 800 : 500,
                    color: isMe ? accent : (i === 0 ? accent : "var(--th-text-secondary)"),
                  }}>
                    {u.name}{isMe && <span style={{ fontSize: 8, color: accent, marginLeft: 4, opacity: 0.7 }}>· moi</span>}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>
                    {Math.round(u.hours).toLocaleString("fr-FR")}h
                  </span>
                  <RankBadge name={u.name} currentList={byHours} prevList={prevByHours} />
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: isMe ? 1 : (opacities[i] || 0.15),
                    width: (u.hours / max * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.35 + i * 0.06) + "s both",
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
