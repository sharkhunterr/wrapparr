import { useActive, AN, Tag, Lbl } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"
import { PosterImg } from "./shared"

export function CommunityMostViewedSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const L = useLabels()
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"

  // Aggregate: count total views per item + views per user
  const itemMap = new Map()
  for (const u of allUsers) {
    const top = isSeries
      ? (u.data?.extra?.series?.top || [])
      : (u.data?.extra?.films?.top || u.data?.top || [])
    for (const item of top) {
      const key = (item.t || "").toLowerCase().trim()
      if (!key) continue
      if (!itemMap.has(key)) {
        itemMap.set(key, { t: item.t, thumb: item.thumb, y: item.y, r: item.r, totalViews: 0, perUser: [] })
      }
      const entry = itemMap.get(key)
      const views = isSeries ? (item.ep || item.plays || item.v || 1) : (item.plays || item.v || 1)
      entry.totalViews += views
      entry.perUser.push({ name: u.name, views, isMe: u.isMe || u.name === me })
      if (!entry.thumb && item.thumb) entry.thumb = item.thumb
      if (!entry.y && item.y) entry.y = item.y
      if (!entry.r && item.r) entry.r = item.r
    }
  }
  const topItems = [...itemMap.values()].sort((a, b) => b.totalViews - a.totalViews).slice(0, 10)

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
        {isSeries ? "Series" : "Films"} les plus <span style={{ color: accent }}>{L.viewed}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Top 10 par {isSeries ? "episodes vus" : "nombre de vues"} · {allUsers.length} utilisateurs</div>
    </div>

    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {topItems.map((item, i) => (
        <div key={item.t + i} style={{
          display: "flex", gap: 10, padding: "8px 10px", borderRadius: 12,
          background: i === 0 ? accent + "0c" : "var(--th-surface-dim)",
          border: `1px solid ${i === 0 ? accent + "30" : "var(--th-border-dim)"}`,
          animation: "slide-up .4s ease " + (0.08 + i * 0.05) + "s both",
        }}>
          {/* Rank */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 20, flexShrink: 0 }}>
            <span style={{ fontSize: i < 3 ? 14 : 11, fontWeight: 800, color: i === 0 ? accent : "var(--th-text-dim)" }}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : "#" + (i + 1)}
            </span>
          </div>

          {/* Poster */}
          <PosterImg src={item.thumb} size={38} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{item.t}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
              {item.y && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{item.y}</span>}
              {item.r > 0 && <span style={{ fontSize: 9, color: "#fbbf24", fontWeight: 600 }}>★ {item.r}</span>}
              <span style={{ fontSize: 10, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{item.totalViews} {isSeries ? L.episodes : "vue"}{!isSeries && item.totalViews > 1 ? "s" : ""}</span>
            </div>

            {/* Per-user view badges */}
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {item.perUser.map((pu) => (
                <span key={pu.name} style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: "var(--th-radius-xs)",
                  background: pu.isMe ? accent + "20" : "rgba(255,255,255,0.05)",
                  border: pu.isMe ? "1px solid " + accent + "30" : "1px solid var(--th-border-dim)",
                  color: pu.isMe ? accent : "var(--th-text-secondary)",
                  fontWeight: pu.isMe ? 700 : 400,
                }}>
                  {pu.name} · {pu.views}{isSeries ? " " + L.episodes : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
}
