import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl } from "../SharedUI"

function UsersIcon({ size = 12, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>
}

function EyeIcon({ size = 12, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
}

export default function OverseerrPopularSlide({ accent, data, year }) {
  const L = useLabels()
  const active = useActive()
  const ov = data?.overseerr
  if (!ov) return null

  // Only the current user's requests (ov.top = user's top, not community)
  const myRequests = ov.top || []
  if (!myRequests.length) return null

  const allUsersData = data?.users || {}

  // Build per-user watched data: { userName: { titles, tmdbIds, plays } }
  // plays maps tmdb_id/title -> play count for that user
  const userWatched = {}
  for (const [uid, udata] of Object.entries(allUsersData)) {
    if (!udata || typeof udata !== "object") continue
    const titles = new Set()
    const tmdbIds = new Set()
    const plays = {} // key -> play count
    for (const svcData of Object.values(udata)) {
      if (!svcData || typeof svcData !== "object") continue
      for (const item of (svcData?.top || [])) {
        if (item?.t) titles.add(item.t.toLowerCase().trim())
        if (item?.tmdb_id) tmdbIds.add(String(item.tmdb_id))
        const k = String(item?.tmdb_id || "") || item?.t?.toLowerCase().trim()
        if (k) plays[k] = (plays[k] || 0) + (item.plays || item.v || 1)
      }
      for (const section of ["films", "series"]) {
        for (const item of (svcData?.extra?.[section]?.top || [])) {
          if (item?.t) titles.add(item.t.toLowerCase().trim())
          if (item?.tmdb_id) tmdbIds.add(String(item.tmdb_id))
          const k = String(item?.tmdb_id || "") || item?.t?.toLowerCase().trim()
          if (k) plays[k] = (plays[k] || 0) + (item.plays || item.v || 1)
        }
      }
    }
    if (titles.size > 0 || tmdbIds.size > 0) {
      userWatched[udata?.name || uid] = { titles, tmdbIds, plays }
    }
  }

  const totalUsers = Object.keys(userWatched).length

  // For each of MY requests, count viewers + total plays
  const seen = new Set()
  const results = []
  for (const req of myRequests) {
    const key = String(req.tmdb_id || "") || req.title?.toLowerCase().trim()
    if (!key || seen.has(key)) continue
    seen.add(key)

    const reqTitle = (req.title || "").toLowerCase().trim()
    const reqTmdb = String(req.tmdb_id || "")

    let viewerCount = 0
    let totalPlays = 0

    for (const [uname, wdata] of Object.entries(userWatched)) {
      let matched = false
      let matchKey = null
      if (reqTmdb && wdata.tmdbIds.has(reqTmdb)) { matched = true; matchKey = reqTmdb }
      if (!matched && reqTitle) {
        for (const wt of wdata.titles) {
          if (reqTitle === wt || reqTitle.includes(wt) || wt.includes(reqTitle)) {
            matched = true
            matchKey = wt
            break
          }
        }
      }
      if (matched) {
        viewerCount++
        // Sum plays for this match
        const p = wdata.plays[reqTmdb] || wdata.plays[reqTitle] || wdata.plays[matchKey] || 0
        totalPlays += p
      }
    }

    if (viewerCount > 0) {
      results.push({ ...req, viewers: viewerCount, totalPlays, totalUsers })
    }
  }

  results.sort((a, b) => b.viewers - a.viewers || b.totalPlays - a.totalPlays)
  const topResults = results.slice(0, 8)

  if (!topResults.length) return null

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Tes demandes a <span style={{ color: accent }}>succes</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          Les contenus que tu as demandes et que d'autres ont regardes
        </div>
      </div>

      <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {topResults.map((item, i) => {
          const viewRate = totalUsers > 0 ? Math.round(item.viewers / totalUsers * 100) : 0
          return (
            <div key={item.title + i} style={{
              display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 10,
              background: i === 0 ? accent + "0c" : "var(--th-surface-dim)",
              border: "1px solid " + (i === 0 ? accent + "30" : "var(--th-border-dim)"),
              animation: "slide-up .4s ease " + (0.08 + i * 0.06) + "s both",
            }}>
              {item.poster && <img src={item.poster} alt="" style={{ width: 32, height: 46, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{item.title}</div>
                <div style={{ fontSize: 9, color: accent + "80", marginTop: 2 }}>{item.type === "movie" ? "Film" : "Serie"}{item.year ? " · " + item.year : ""}</div>
                {/* Viewer bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--th-surface-subtle)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: accent, width: viewRate + "%", transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both" }} />
                  </div>
                  <span style={{ fontSize: 8, color: "var(--th-text-dim)", flexShrink: 0, fontFamily: "var(--th-font-mono)" }}>{item.viewers}/{totalUsers}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, gap: 1, minWidth: 42 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <UsersIcon size={10} color={accent} />
                  <span style={{ fontSize: 12, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>{item.viewers}</span>
                </div>
                {item.totalPlays > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <EyeIcon size={9} color="var(--th-text-tertiary)" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>{item.totalPlays}</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
