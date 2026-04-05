import { useActive, AN, Tag, Lbl } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"

export function CommunityGenresSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const L = useLabels()
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"

  // Aggregate genres across all users
  const genreMap = new Map()
  for (const u of allUsers) {
    const genres = isSeries
      ? (u.data?.extra?.series?.genres || u.data?.extra?.series_genres || [])
      : (u.data?.extra?.films?.genres || u.data?.extra?.top_genres || u.data?.genres || [])
    for (const g of genres) {
      const key = (g.n || "").trim()
      if (!key) continue
      if (!genreMap.has(key)) genreMap.set(key, { n: key, v: 0, users: new Set() })
      const entry = genreMap.get(key)
      entry.v += (g.v || 1)
      entry.users.add(u.name)
    }
  }
  const topGenres = [...genreMap.values()].sort((a, b) => b.v - a.v).slice(0, 8)
  const maxGenre = topGenres[0]?.v || 1

  // Per-user top genre
  const userTopGenre = allUsers.map((u) => {
    const genres = isSeries
      ? (u.data?.extra?.series?.genres || u.data?.extra?.series_genres || [])
      : (u.data?.extra?.films?.genres || u.data?.extra?.top_genres || u.data?.genres || [])
    const top = genres.sort((a, b) => (b.v || 0) - (a.v || 0))[0]
    return { name: u.name, genre: top?.n || "—", isMe: u.isMe || u.name === me }
  })

  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
        Genres préférés <span style={{ color: accent }}>{label}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{allUsers.length} utilisateurs</div>
    </div>

    {/* Genre bars */}
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {topGenres.map((g, i) => (
        <div key={g.n} style={{ animation: "slide-up .4s ease " + (0.1 + i * 0.05) + "s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? accent : "rgba(255,255,255,0.7)", flex: 1 }}>{g.n}</span>
            <span style={{ fontSize: 9, color: "var(--th-text-muted)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{g.users.size} user{g.users.size > 1 ? "s" : ""}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", width: 30, textAlign: "right" }}>{g.v}</span>
          </div>
          <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: accent, opacity: opacities[i] || 0.15,
              width: (g.v / maxGenre * 100) + "%",
              transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.05) + "s both",
            }} />
          </div>
        </div>
      ))}
    </div>

    {/* Genre favori par utilisateur */}
    {userTopGenre.length > 0 && (
      <div className="s2" style={{ marginTop: 12, padding: "10px 12px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
        <Lbl c={accent} size={8}>Genre préféré par utilisateur</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {userTopGenre.map((u) => {
            return <div key={u.name} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: "var(--th-radius-xs)",
              background: u.isMe ? accent + "12" : "var(--th-surface-dim)",
              border: u.isMe ? "1px solid " + accent + "30" : "1px solid var(--th-border-dim)",
            }}>
              <span style={{ fontSize: 10, fontWeight: u.isMe ? 700 : 400, color: u.isMe ? accent : "rgba(255,255,255,0.6)" }}>{u.name}</span>
              <span style={{ fontSize: 9, color: "var(--th-text-muted)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{u.genre}</span>
            </div>
          })}
        </div>
      </div>
    )}
  </div>
}
