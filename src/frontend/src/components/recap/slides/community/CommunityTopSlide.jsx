import { useState, useEffect } from "react"
import { Tag } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"
import { PosterImg } from "./shared"

const PODIUM_H = [75, 95, 115]

export function CommunityTopSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const L = useLabels()
  const isSeries = mediaType === "series"
  const label = isSeries ? "Series" : "Films"

  // Aggregate top items across all users
  const itemMap = new Map()
  for (const u of allUsers) {
    const top = isSeries
      ? (u.data?.extra?.series?.top || [])
      : (u.data?.extra?.films?.top || u.data?.top || [])
    for (const item of top) {
      const key = (item.t || "").toLowerCase().trim()
      if (!key) continue
      if (!itemMap.has(key)) {
        itemMap.set(key, { ...item, viewCount: 0, userCount: 0, users: [] })
      }
      const entry = itemMap.get(key)
      entry.viewCount += (item.plays || item.v || 1)
      entry.userCount += 1
      entry.users.push(u.name)
      if (!entry.thumb && item.thumb) entry.thumb = item.thumb
      if (!entry.art && item.art) entry.art = item.art
    }
  }
  const topItems = [...itemMap.values()].sort((a, b) => b.userCount - a.userCount || b.viewCount - a.viewCount).slice(0, 10)
  const top3 = topItems.slice(0, 3)
  const rest = topItems.slice(3)
  const allPosters = topItems.filter((f) => f.thumb)

  // Phases: 0=wall, 1=reveal podium, 2=show list
  const [phase, setPhase] = useState(0)
  const [revealed, setRevealed] = useState([false, false, false])

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2200)
    const t2 = setTimeout(() => setRevealed((p) => { const n = [...p]; n[0] = true; return n }), 2800)   // #3
    const t3 = setTimeout(() => setRevealed((p) => { const n = [...p]; n[1] = true; return n }), 3800)   // #2
    const t4 = setTimeout(() => setRevealed((p) => { const n = [...p]; n[2] = true; return n }), 5000)   // #1
    const t5 = setTimeout(() => setPhase(2), 6200)
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout) }
  }, [])

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", position: "relative", zIndex: 10 }}>

      {/* Poster wall background */}
      {allPosters.length >= 4 && (
        <div style={{ position: "fixed", inset: 0, overflow: "hidden", zIndex: 0, opacity: phase >= 1 ? 0.06 : 0.15, transition: "opacity 1.5s ease", display: "flex", flexDirection: "column", justifyContent: "center", pointerEvents: "none" }}>
          {[0, 1, 2, 3, 4, 5].map((row) => (
            <div key={row} style={{ display: "flex", gap: 8, padding: "4px 0", animation: `comm-scroll-${row % 2 === 0 ? "l" : "r"} ${20 + row * 3}s linear infinite`, width: "max-content" }}>
              {[...allPosters, ...allPosters, ...allPosters, ...allPosters].slice(row * 3, row * 3 + 20).map((f, i) => (
                <img key={i} src={f.thumb} alt="" style={{ width: 70, height: 100, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Subtle vignette */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, #05050e90 0%, transparent 15%, transparent 85%, #05050e90 100%)" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16, position: "relative", zIndex: 5 }}>
        <div style={{ fontSize: 34, marginBottom: 6, filter: "drop-shadow(0 0 20px " + accent + ")", animation: "float 3s ease-in-out infinite" }}>{isSeries ? "📺" : "🎬"}</div>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textTransform: "uppercase", marginBottom: 4 }}>{L.brand} · COMMUNAUTE</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          {label} les plus <span style={{ color: accent }}>populaires</span>
        </h2>
      </div>

      {/* Podium reveal */}
      {phase >= 1 && top3.length >= 2 && (
        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 5 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
            {[{ item: top3[2], rIdx: 0, rank: 3 }, { item: top3[0], rIdx: 2, rank: 1 }, { item: top3[1], rIdx: 1, rank: 2 }].map(({ item, rIdx, rank }, col) => {
              if (!item) return <div key={col} style={{ flex: rank === 1 ? 1.15 : 1 }} />
              const isOne = rank === 1
              const posterSize = isOne ? 68 : 50
              const show = revealed[rIdx]
              return (
                <div key={col} style={{ flex: isOne ? 1.15 : 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: show ? 1 : 0, transition: "opacity .4s ease" }}>
                  {isOne && show && <div style={{ fontSize: 22, marginBottom: 3, animation: "crown-bounce 1.8s ease-in-out infinite", filter: "drop-shadow(0 0 12px " + accent + ")" }}>👑</div>}
                  {show && <div style={{ fontSize: isOne ? 32 : 22, fontWeight: 800, marginBottom: 4, color: accent, textShadow: "0 0 30px " + accent, animation: "rank-stamp .5s cubic-bezier(0.34,1.56,0.64,1) both" }}>#{rank}</div>}
                  {show && <div style={{ animation: "poster-fly-in .9s cubic-bezier(0.34,1.3,0.64,1) both", marginBottom: 6 }}>
                    <PosterImg src={item.thumb} size={posterSize} />
                  </div>}
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0", height: PODIUM_H[rIdx],
                    background: show ? "linear-gradient(180deg," + accent + "38 0%," + accent + "18 100%)" : "var(--th-surface-subtle)",
                    border: "1px solid " + (show ? accent + "55" : "rgba(255,255,255,0.05)"), borderBottom: "none",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "8px 5px",
                    animation: show ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none",
                  }}>
                    {show && <>
                      <div style={{ color: "var(--th-text)", fontWeight: 700, fontSize: isOne ? 11 : 9, textAlign: "center", lineHeight: 1.2, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.t}</div>
                      <div style={{ color: accent, fontWeight: 800, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontSize: isOne ? 13 : 10 }}>{item.userCount} user{item.userCount > 1 ? "s" : ""}</div>
                      <div style={{ color: "var(--th-text-tertiary)", fontSize: 8 }}>{item.viewCount} vue{item.viewCount > 1 ? "s" : ""}</div>
                      {item.r > 0 && <div style={{ color: "#fbbf24", fontSize: 8, marginTop: 1 }}>★ {item.r}</div>}
                    </>}
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ height: 5, borderRadius: 3, background: "linear-gradient(90deg,transparent," + accent + "40," + accent + "70," + accent + "40,transparent)", boxShadow: "0 0 20px " + accent + "30" }} />
        </div>
      )}

      {/* Rest of the list (4-10) */}
      {phase >= 2 && rest.length > 0 && (
        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 5, marginTop: 10, display: "flex", flexDirection: "column", gap: 4 }}>
          {rest.map((item, i) => (
            <div key={item.t + i} style={{
              display: "flex", gap: 8, alignItems: "center", padding: "6px 10px", borderRadius: 9,
              background: "var(--th-surface-dim)", border: "1px solid var(--th-border-dim)",
              animation: "slide-up .35s ease " + (i * 0.06) + "s both",
            }}>
              <span style={{ fontSize: 9, color: "var(--th-text-faint)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", width: 16, textAlign: "center", flexShrink: 0 }}>{i + 4}</span>
              <PosterImg src={item.thumb} size={24} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.t}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: accent, fontWeight: 700 }}>{item.userCount} user{item.userCount > 1 ? "s" : ""}</span>
                <span style={{ fontSize: 9, color: "var(--th-text-dim)" }}>{item.viewCount} {L.viewsUnit}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
