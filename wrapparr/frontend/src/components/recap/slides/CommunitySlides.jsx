import { useState, useEffect } from "react"
import { useActive, AN, Tag, Lbl, DayChart, TimeChart, AreaG } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const USER_COLORS = ["#E5A00D", "#60a5fa", "#f472b6", "#4ade80", "#a78bfa", "#fb923c", "#38bdf8", "#f87171", "#34d399", "#fbbf24"]

function PosterImg({ src, size = 50 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 6, flexShrink: 0, background: "rgba(255,255,255,0.06)" }} />
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 6, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 12px rgba(0,0,0,0.5)" }} />
}

/* ═══════════════════════════════════════════════════════
   1. COMMUNITY ACTIVITY — Activite mensuelle superposee
   ═══════════════════════════════════════════════════════ */
export function CommunityActivitySlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"

  // Stats aggregees
  const totalAll = allUsers.reduce((s, u) => s + (isSeries ? (u.data?.extra?.series?.episodes || 0) : (u.data?.extra?.films?.total || u.data?.total_items || 0)), 0)
  const totalHours = allUsers.reduce((s, u) => s + (isSeries ? (u.data?.extra?.series?.hours || 0) : (u.data?.extra?.films?.hours || u.data?.total_hours || 0)), 0)

  // Aggregate day_of_week across all users
  const dayAgg = {}
  for (const u of allUsers) {
    const days = isSeries ? (u.data?.extra?.series?.day_of_week || []) : (u.data?.extra?.films?.day_of_week || u.data?.day_of_week || [])
    for (const d of days) { dayAgg[d.d] = (dayAgg[d.d] || 0) + d.v }
  }
  const dayData = Object.entries(dayAgg).map(([d, v]) => ({ d, v }))

  // Aggregate time_of_day across all users
  const hourAgg = {}
  for (const u of allUsers) {
    const hours = isSeries ? (u.data?.extra?.series?.time_of_day || []) : (u.data?.extra?.films?.time_of_day || u.data?.time_of_day || [])
    for (const h of hours) { hourAgg[h.h] = (hourAgg[h.h] || 0) + h.v }
  }
  const timeData = Object.entries(hourAgg).map(([h, v]) => ({ h, v })).sort((a, b) => Number(a.h) - Number(b.h))

  // Aggregate monthly
  const monthlyAgg = {}
  for (const u of allUsers) {
    const monthly = isSeries ? (u.data?.extra?.series?.monthly || []) : (u.data?.extra?.films?.monthly || u.data?.monthly || [])
    for (const m of monthly) { monthlyAgg[m.m] = (monthlyAgg[m.m] || 0) + m.v }
  }
  const monthlyData = Object.entries(monthlyAgg).map(([m, v]) => ({ m, v }))

  // Peak stats: best month + best day
  const bestMonthEntry = monthlyData.length > 0 ? monthlyData.reduce((a, b) => a.v > b.v ? a : b) : null
  const totalViews = monthlyData.reduce((s, m) => s + m.v, 0)

  // Best specific day: aggregate peak_stats from all users
  let bestDayEntry = null
  for (const u of allUsers) {
    const peak = isSeries ? (u.data?.extra?.series?.peak_stats || {}) : (u.data?.extra?.films?.peak_stats || u.data?.extra?.peak_stats || {})
    const bd = peak.best_day
    if (bd && (!bestDayEntry || bd.views > bestDayEntry.views)) bestDayEntry = bd
  }

  // Multi-user monthly chart data
  const months = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"]
  const multiMonthlyData = months.map((m, i) => {
    const entry = { m }
    for (const u of allUsers) {
      const monthly = isSeries ? (u.data?.extra?.series?.monthly || []) : (u.data?.extra?.films?.monthly || u.data?.monthly || [])
      entry[u.name] = monthly.find((d) => d.m === m)?.v || monthly[i]?.v || 0
    }
    return entry
  })

  const gId = "comm-act-" + mediaType

  return <div style={{ maxWidth: 440, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <Lbl c={accent} size={9}>👥 Communaute · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 4 }}>
        Quand la communaute <span style={{ color: accent }}>{isSeries ? "binge" : "regarde"}</span>
      </h2>

      {/* Badges totaux */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {totalAll > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: accent + "10", border: "1px solid " + accent + "25" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{active ? <AN t={totalAll} /> : 0}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{label} vus</span>
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{active ? <AN t={Math.round(totalHours)} s="h" /> : "0h"}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>au total</span>
          </div>
        )}
      </div>
    </div>

    {/* Activite mensuelle superposee */}
    <div className="s1" style={{ padding: "10px 10px 6px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
      <Lbl c={accent} size={8}>Activite mensuelle par utilisateur</Lbl>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={multiMonthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            {allUsers.map((u, i) => (
              <linearGradient key={u.name} id={gId + i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={USER_COLORS[i % USER_COLORS.length]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={USER_COLORS[i % USER_COLORS.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
          <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<MultiUserTooltip />} />
          {allUsers.map((u, i) => (
            <Area key={u.name} type="monotone" dataKey={u.name} stroke={USER_COLORS[i % USER_COLORS.length]} strokeWidth={1.5}
              fill={`url(#${gId + i})`} dot={false} animationBegin={200 + i * 100} animationDuration={1200} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4, justifyContent: "center" }}>
        {allUsers.map((u, i) => (
          <div key={u.name} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 3, borderRadius: 2, background: USER_COLORS[i % USER_COLORS.length] }} />
            <span style={{ fontSize: 9, color: u.name === me ? "white" : "rgba(255,255,255,0.4)", fontWeight: u.name === me ? 700 : 400 }}>{u.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Jour prefere (DayChart) */}
    {dayData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour prefere</Lbl><DayChart data={dayData} accent={accent} height={70} /></div>}

    {/* Heure de consommation (TimeChart) */}
    {timeData.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={70} /></div>}

    {/* Peak stats: mois en or + journee record */}
    {(bestMonthEntry || bestDayEntry) && (
      <div className="s4" style={{ display: "flex", gap: 8 }}>
        {bestMonthEntry && (
          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: accent + "08", border: "1px solid " + accent + "20" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Mois en or</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1 }}>{bestMonthEntry.m}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "white", marginTop: 4 }}>{bestMonthEntry.v} vues</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{totalViews > 0 ? Math.round(bestMonthEntry.v / totalViews * 100) : 0}% du total</div>
          </div>
        )}
        {bestDayEntry && (
          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Journee record</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", lineHeight: 1.1 }}>
              {bestDayEntry.day_name} {bestDayEntry.day} {bestDayEntry.month}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginTop: 4 }}>{bestDayEntry.views} vues</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{bestDayEntry.hours}h de visionnage</div>
          </div>
        )}
      </div>
    )}
  </div>
}

/* ═══════════════════════════════════════════════════════
   2. TOP MOST WATCHED — Films/series les plus vus
   ═══════════════════════════════════════════════════════ */
export function CommunityTopSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"
  const [expanded, setExpanded] = useState(null)

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
  const topItems = [...itemMap.values()].sort((a, b) => b.userCount - a.userCount || b.viewCount - a.viewCount).slice(0, 8)

  return <div style={{ maxWidth: 440, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        {isSeries ? "Series" : "Films"} les plus <span style={{ color: accent }}>populaires</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{allUsers.length} utilisateurs</div>
    </div>

    {/* Poster wall scrolling */}
    {topItems.filter((f) => f.thumb).length >= 4 && (
      <div className="s0" style={{ overflow: "hidden", borderRadius: 12, marginBottom: 10, height: 70 }}>
        <div style={{ display: "flex", gap: 6, animation: "pse-scroll-l 20s linear infinite", width: "max-content" }}>
          {[...topItems, ...topItems, ...topItems].filter((f) => f.thumb).map((f, i) => (
            <img key={i} src={f.thumb} alt="" style={{ width: 46, height: 68, borderRadius: 5, objectFit: "cover", flexShrink: 0, opacity: 0.7 }} onError={(e) => { e.target.style.display = "none" }} />
          ))}
        </div>
        <style>{`@keyframes pse-scroll-l { 0% { transform: translateX(0); } 100% { transform: translateX(-33.33%); } }`}</style>
      </div>
    )}

    {/* Top items list */}
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {topItems.map((item, i) => {
        const isExpanded = expanded === i
        return <div key={item.t + i} onClick={() => setExpanded(isExpanded ? null : i)} style={{
          padding: "8px 10px", borderRadius: 11,
          background: i === 0 ? accent + "0c" : "rgba(255,255,255,0.03)",
          border: `1px solid ${i === 0 ? accent + "30" : "rgba(255,255,255,0.06)"}`,
          cursor: "pointer", animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both",
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: i < 3 ? accent : "rgba(255,255,255,0.25)", width: 20, textAlign: "center", flexShrink: 0 }}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : "#" + (i + 1)}
            </div>
            <PosterImg src={item.thumb} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.t}</div>
              <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 9, color: accent, fontWeight: 700 }}>{item.userCount} utilisateur{item.userCount > 1 ? "s" : ""}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{item.viewCount} vue{item.viewCount > 1 ? "s" : ""}</span>
                {item.r > 0 && <span style={{ fontSize: 9, color: "#fbbf24" }}>★{item.r}</span>}
                {item.y && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{item.y}</span>}
              </div>
            </div>
          </div>
          {isExpanded && (
            <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 4, flexWrap: "wrap" }}>
              {item.users.map((name) => (
                <span key={name} style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: name === me ? accent + "20" : "rgba(255,255,255,0.05)", color: name === me ? accent : "rgba(255,255,255,0.5)", border: name === me ? "1px solid " + accent + "30" : "1px solid rgba(255,255,255,0.06)" }}>{name}</span>
              ))}
            </div>
          )}
        </div>
      })}
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════
   3. RANKINGS — Classements vues + heures
   ═══════════════════════════════════════════════════════ */
export function CommunityRankingsSlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const active = useActive()
  const isSeries = mediaType === "series"
  const label = isSeries ? "series" : "films"

  // Build rankings
  const byViews = allUsers.map((u) => ({
    n: u.name,
    v: isSeries ? (u.data?.extra?.series?.episodes || 0) : (u.data?.extra?.films?.total || u.data?.total_items || 0),
  })).sort((a, b) => b.v - a.v)

  const byHours = allUsers.map((u) => ({
    n: u.name,
    v: Math.round(isSeries ? (u.data?.extra?.series?.hours || 0) : (u.data?.extra?.films?.hours || u.data?.total_hours || 0)),
  })).sort((a, b) => b.v - a.v)

  const medals = ["🥇", "🥈", "🥉"]
  const myRankViews = byViews.findIndex((u) => u.n === me) + 1
  const myRankHours = byHours.findIndex((u) => u.n === me) + 1

  return <div style={{ maxWidth: 440, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        Classement <span style={{ color: accent }}>{label}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>
        Tu es <span style={{ color: accent, fontWeight: 700 }}>#{myRankViews}</span> en vues et <span style={{ color: accent, fontWeight: 700 }}>#{myRankHours}</span> en heures
      </div>
    </div>

    <div style={{ display: "flex", gap: 8 }}>
      {/* Ranking by views */}
      <div className="s1" style={{ flex: 1, padding: "10px 10px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Lbl c={accent} size={8}>{isSeries ? "Episodes vus" : "Films vus"}</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          {byViews.map((u, i) => {
            const isMe = u.n === me
            const max = byViews[0]?.v || 1
            return <div key={u.n} style={{ animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 10, width: 16, textAlign: "center", flexShrink: 0 }}>{i < 3 ? medals[i] : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>{i + 1}</span>}</span>
                <span style={{ fontSize: 10, color: isMe ? accent : "rgba(255,255,255,0.6)", fontWeight: isMe ? 700 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.n}</span>
                <span style={{ fontSize: 9, color: isMe ? accent : "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{u.v}</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", marginLeft: 20 }}>
                <div style={{ height: "100%", background: isMe ? accent : accent + "40", width: (u.v / max * 100) + "%", borderRadius: 2, transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both" }} />
              </div>
            </div>
          })}
        </div>
      </div>

      {/* Ranking by hours */}
      <div className="s1" style={{ flex: 1, padding: "10px 10px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Lbl c={accent} size={8}>Heures</Lbl>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          {byHours.map((u, i) => {
            const isMe = u.n === me
            const max = byHours[0]?.v || 1
            return <div key={u.n} style={{ animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <span style={{ fontSize: 10, width: 16, textAlign: "center", flexShrink: 0 }}>{i < 3 ? medals[i] : <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 9 }}>{i + 1}</span>}</span>
                <span style={{ fontSize: 10, color: isMe ? accent : "rgba(255,255,255,0.6)", fontWeight: isMe ? 700 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.n}</span>
                <span style={{ fontSize: 9, color: isMe ? accent : "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{u.v}h</span>
              </div>
              <div style={{ height: 2, background: "rgba(255,255,255,0.04)", borderRadius: 2, overflow: "hidden", marginLeft: 20 }}>
                <div style={{ height: "100%", background: isMe ? accent : accent + "40", width: (u.v / max * 100) + "%", borderRadius: 2, transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both" }} />
              </div>
            </div>
          })}
        </div>
      </div>
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════
   4. COMMUNITY GENRES — Genres preferes de la communaute
   ═══════════════════════════════════════════════════════ */
export function CommunityGenresSlide({ accent, allUsers, year, me, mediaType = "films" }) {
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
    return { name: u.name, genre: top?.n || "—" }
  })

  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  return <div style={{ maxWidth: 440, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        Genres preferes <span style={{ color: accent }}>{label}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{allUsers.length} utilisateurs</div>
    </div>

    {/* Genre bars */}
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {topGenres.map((g, i) => (
        <div key={g.n} style={{ animation: "slide-up .4s ease " + (0.1 + i * 0.05) + "s both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <span style={{ fontSize: 12, fontWeight: i === 0 ? 800 : 500, color: i === 0 ? accent : "rgba(255,255,255,0.7)", flex: 1 }}>{g.n}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace" }}>{g.users.size} user{g.users.size > 1 ? "s" : ""}</span>
            <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? accent : "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono,monospace", width: 30, textAlign: "right" }}>{g.v}</span>
          </div>
          <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
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
      <div className="s2" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <Lbl c={accent} size={8}>Genre prefere par utilisateur</Lbl>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
          {userTopGenre.map((u) => {
            const isMe = u.name === me
            return <div key={u.name} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8,
              background: isMe ? accent + "12" : "rgba(255,255,255,0.03)",
              border: isMe ? "1px solid " + accent + "30" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 10, fontWeight: isMe ? 700 : 400, color: isMe ? accent : "rgba(255,255,255,0.6)" }}>{u.name}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace" }}>{u.genre}</span>
            </div>
          })}
        </div>
      </div>
    )}
  </div>
}

/* ═══════════════════════════════════════════════════════
   TOOLTIP MULTI-USER
   ═══════════════════════════════════════════════════════ */
function MultiUserTooltip({ active, payload, label, users = [] }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "6px 10px", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}>
    <div style={{ color: "rgba(255,255,255,.4)", marginBottom: 3 }}>{label}</div>
    {payload.map((p) => (
      <div key={p.dataKey} style={{ color: p.color, display: "flex", justifyContent: "space-between", gap: 12 }}>
        <span>{p.dataKey}</span><span style={{ fontWeight: 700 }}>{p.value}</span>
      </div>
    ))}
  </div>
}

/* ═══════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════ */
const statPill = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid" }
