import { useActive, AN, Tag, Lbl } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"

export function CommunityRankingsSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const L = useLabels()
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"
  const viewLabel = isSeries ? "episodes" : "films"

  // Build rankings — filter out users with 0, propagate isMe
  const byViews = allUsers.map((u) => ({
    n: u.name,
    v: isSeries ? (u.data?.extra?.series?.episodes || 0) : (u.data?.extra?.films?.total || u.data?.total_items || 0),
    isMe: u.isMe || u.name === me,
  })).filter((u) => u.v > 0).sort((a, b) => b.v - a.v)

  const byHours = allUsers.map((u) => ({
    n: u.name,
    v: Math.round(isSeries ? (u.data?.extra?.series?.hours || 0) : (u.data?.extra?.films?.hours || u.data?.total_hours || 0)),
    isMe: u.isMe || u.name === me,
  })).filter((u) => u.v > 0).sort((a, b) => b.v - a.v)

  const myRankViews = byViews.findIndex((u) => u.isMe) + 1
  const myRankHours = byHours.findIndex((u) => u.isMe) + 1
  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  function RankBar({ data, unitSuffix, sectionClass, delayBase }) {
    const max = data[0]?.v || 1
    return (
      <div className={sectionClass} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {data.map((u, i) => (
          <div key={u.n} style={{
            animation: "slide-up .4s ease " + (delayBase + i * 0.05) + "s both",
            padding: "4px 8px", borderRadius: "var(--th-radius-xs)",
            background: u.isMe ? accent + "10" : "transparent",
            border: u.isMe ? "1px solid " + accent + "25" : "1px solid transparent",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{
                fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                fontWeight: u.isMe ? 800 : (i === 0 ? 800 : 500),
                color: u.isMe ? accent : (i === 0 ? accent : "rgba(255,255,255,0.7)"),
              }}>
                {u.n}{u.isMe && <span style={{ fontSize: 9, color: accent, marginLeft: 4, fontWeight: 700 }}>· moi</span>}
              </span>
              <span style={{ fontSize: 9, color: u.isMe ? accent + "80" : "var(--th-text-muted)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>#{i + 1}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: u.isMe ? accent : (i === 0 ? accent : "var(--th-text-tertiary)"), fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", width: 40, textAlign: "right" }}>{u.v.toLocaleString("fr-FR")}{unitSuffix}</span>
            </div>
            <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 3,
                background: accent, opacity: u.isMe ? 1 : (opacities[i] || 0.15),
                width: (u.v / max * 100) + "%",
                transformOrigin: "left", animation: "bar-grow .7s ease " + (delayBase + 0.2 + i * 0.05) + "s both",
              }} />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 8 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
        Qui regarde le plus de <span style={{ color: accent }}>{label}</span> ?
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{allUsers.length} utilisateurs</div>
    </div>

    {/* Position badges */}
    <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 12px ${accent}20`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
        <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", position: "relative" }}>{myRankViews > 0 ? `#${myRankViews}` : "—"}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: accent, position: "relative" }}>en {viewLabel}</span>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 12px ${accent}20`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
        <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", position: "relative" }}>{myRankHours > 0 ? `#${myRankHours}` : "—"}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: accent, position: "relative" }}>en heures</span>
      </div>
    </div>

    {/* Ranking by views */}
    {byViews.length > 0 && <>
      <Lbl c={accent} size={8}>{isSeries ? "Episodes vus" : "Films vus"}</Lbl>
      <div style={{ marginTop: 4, marginBottom: 12 }}>
        <RankBar data={byViews} unitSuffix="" sectionClass="s1" delayBase={0.1} />
      </div>
    </>}

    {/* Ranking by hours */}
    {byHours.length > 0 && <>
      <Lbl c={accent} size={8}>Heures passees</Lbl>
      <div style={{ marginTop: 4 }}>
        <RankBar data={byHours} unitSuffix="h" sectionClass="s2" delayBase={0.15} />
      </div>
    </>}
  </div>
}
