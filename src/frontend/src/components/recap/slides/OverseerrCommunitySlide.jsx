import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl } from "../SharedUI"

export default function OverseerrCommunitySlide({ accent, data, year, userName }) {
  const L = useLabels()
  const active = useActive()
  const ov = data?.overseerr
  const comm = ov?.community
  if (!comm || !comm.total) return null

  const requesters = comm.top_requesters || []
  const topRequests = comm.top || []
  const myRank = requesters.findIndex(r => r.name === userName) + 1
  const maxCount = requesters[0]?.count || 1

  // Find most popular requests (those watched by most users)
  // Cross-ref with all users data
  const allUsersData = data?.users || {}
  const popularRequests = computePopularity(topRequests, allUsersData)

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", marginBottom: 6, fontSize: 9, color: accent, fontWeight: 700 }}>
          📋 OVERSEERR · COMMUNAUTE
        </div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Les plus gros <span style={{ color: accent }}>demandeurs</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          {comm.total} demande{comm.total > 1 ? "s" : ""} au total · {requesters.length} utilisateur{requesters.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* My rank badge */}
      {myRank > 0 && (
        <div className="s0" style={{ display: "flex", gap: 6, marginBottom: 12 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "5px 12px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", overflow: "hidden" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}25 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
            <span style={{ fontSize: 14, fontWeight: 900, color: accent, fontFamily: "var(--th-font-mono)", position: "relative" }}>#{myRank}</span>
            <span style={{ fontSize: 9, fontWeight: 600, color: accent, position: "relative" }}>en demandes</span>
          </div>
        </div>
      )}

      {/* Top requesters ranking */}
      {requesters.length > 0 && (
        <div className="s1" style={{ marginBottom: 14 }}>
          <Lbl c={accent} size={8}>Classement des demandeurs</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
            {requesters.map((r, i) => {
              const isMe = r.name === userName
              const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]
              return (
                <div key={r.name} style={{
                  animation: "slide-up .4s ease " + (0.1 + i * 0.05) + "s both",
                  padding: "5px 10px", borderRadius: "var(--th-radius-xs)",
                  background: isMe ? accent + "10" : "transparent",
                  border: isMe ? "1px solid " + accent + "20" : "1px solid transparent",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)", fontFamily: "var(--th-font-mono)", width: 22, flexShrink: 0 }}>#{i + 1}</span>
                    <span style={{
                      fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      fontWeight: isMe ? 800 : 500, color: isMe ? accent : (i === 0 ? accent : "var(--th-text-secondary)"),
                    }}>
                      {r.name}{isMe && <span style={{ fontSize: 8, color: accent, marginLeft: 4, opacity: 0.7 }}>· moi</span>}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isMe ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>
                      {r.count}
                    </span>
                  </div>
                  <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 3, background: accent,
                      opacity: isMe ? 1 : (opacities[i] || 0.15),
                      width: (r.count / maxCount * 100) + "%",
                      transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.05) + "s both",
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Most popular requests (watched by most users) */}
      {popularRequests.length > 0 && (
        <div className="s2">
          <Lbl c={accent} size={8}>Demandes les plus populaires</Lbl>
          <div style={{ fontSize: 9, color: "var(--th-text-dim)", marginBottom: 6 }}>Demandes qui ont eu le plus de succes aupres des utilisateurs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {popularRequests.map((item, i) => (
              <div key={item.title + i} style={{
                display: "flex", gap: 8, alignItems: "center", padding: "6px 10px", borderRadius: 8,
                background: i === 0 ? accent + "0c" : "var(--th-surface-dim)",
                border: "1px solid " + (i === 0 ? accent + "25" : "var(--th-border-dim)"),
                animation: "slide-up .4s ease " + (0.15 + i * 0.06) + "s both",
              }}>
                {item.poster && <img src={item.poster} alt="" style={{ width: 28, height: 40, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ fontSize: 9, color: accent + "80" }}>{item.type === "movie" ? "Film" : "Serie"} · demande par {item.requested_by}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>{item.viewers}</span>
                  <span style={{ fontSize: 7, color: "var(--th-text-dim)" }}>ont vu</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function computePopularity(topRequests, allUsersData) {
  if (!topRequests.length || !Object.keys(allUsersData).length) return []

  // Build per-user watched sets (titles lowercase)
  // User data structure: { tautulli: { top: [...], extra: { films: { top: [...] }, series: { top: [...] } } } }
  const userWatched = {}
  for (const [uid, udata] of Object.entries(allUsersData)) {
    if (!udata || typeof udata !== "object") continue
    const titles = new Set()
    // Search in all service data (tautulli, jellyfin, etc.)
    for (const svcData of Object.values(udata)) {
      if (!svcData || typeof svcData !== "object") continue
      // Direct top array
      for (const item of (svcData?.top || [])) {
        if (item?.t) titles.add(item.t.toLowerCase().trim())
      }
      // Nested extra.films.top / extra.series.top
      for (const section of ["films", "series"]) {
        for (const item of (svcData?.extra?.[section]?.top || [])) {
          if (item?.t) titles.add(item.t.toLowerCase().trim())
        }
      }
    }
    if (titles.size > 0) userWatched[udata?.name || uid] = titles
  }

  const totalUsers = Object.keys(userWatched).length
  if (!totalUsers) return []

  // Count how many users watched each request
  const results = topRequests.map(req => {
    const reqTitle = (req.title || "").toLowerCase().trim()
    let viewers = 0
    for (const titles of Object.values(userWatched)) {
      for (const wt of titles) {
        if (reqTitle === wt || reqTitle.includes(wt) || wt.includes(reqTitle)) {
          viewers++
          break
        }
      }
    }
    return { ...req, viewers, totalUsers }
  })

  return results.filter(r => r.viewers > 0).sort((a, b) => b.viewers - a.viewers).slice(0, 8)
}
