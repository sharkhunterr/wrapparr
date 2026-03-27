import { useState, useEffect, useCallback } from "react"
import { useActive, AN, Tag, Lbl, DayChart, TimeChart, AreaG } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

const USER_COLORS = ["#E5A00D", "#60a5fa", "#f472b6", "#4ade80", "#a78bfa", "#fb923c", "#38bdf8", "#f87171", "#34d399", "#fbbf24"]

// Inject global keyframes once
if (typeof document !== "undefined" && !document.getElementById("community-keyframes")) {
  const style = document.createElement("style")
  style.id = "community-keyframes"
  style.textContent = `
    @keyframes badge-shine { 0%, 100% { transform: translateX(-100%); } 50% { transform: translateX(100%); } }
    @keyframes comm-scroll-l { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
    @keyframes comm-scroll-r { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
    @keyframes poster-fly-in {
      0% { transform: scale(0.3) translateY(40px); opacity: 0; filter: brightness(2); }
      40% { transform: scale(1.3) translateY(-10px); opacity: 1; filter: brightness(1.5); }
      100% { transform: scale(1) translateY(0); opacity: 1; filter: brightness(1); }
    }
  `
  document.head.appendChild(style)
}

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
    let total = 0
    for (const u of allUsers) {
      const monthly = isSeries ? (u.data?.extra?.series?.monthly || []) : (u.data?.extra?.films?.monthly || u.data?.monthly || [])
      const val = monthly.find((d) => d.m === m)?.v || monthly[i]?.v || 0
      entry[u.name] = val
      total += val
    }
    entry._total = total
    return entry
  })

  const gId = "comm-act-" + mediaType
  const [hidden, setHidden] = useState({})
  const toggleLine = useCallback((key) => setHidden((h) => ({ ...h, [key]: !h[key] })), [])

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
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
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{active ? <AN t={totalAll} /> : 0}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{label} vus</span>
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{active ? <AN t={Math.round(totalHours)} s="h" /> : "0h"}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>au total</span>
          </div>
        )}
      </div>
    </div>

    {/* Activite mensuelle superposee */}
    <div className="s1" style={{ padding: "10px 10px 6px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
      <Lbl c={accent} size={8}>Activite mensuelle par utilisateur</Lbl>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={multiMonthlyData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
          <defs>
            {allUsers.map((u, i) => (
              <linearGradient key={u.name} id={gId + i} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={USER_COLORS[i % USER_COLORS.length]} stopOpacity={0.3} />
                <stop offset="100%" stopColor={USER_COLORS[i % USER_COLORS.length]} stopOpacity={0.02} />
              </linearGradient>
            ))}
            <linearGradient id={gId + "-total"} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="white" stopOpacity={0.12} />
              <stop offset="100%" stopColor="white" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
          <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={28} />
          <Tooltip content={<MultiUserTooltip />} />
          {/* Total curve */}
          {!hidden._total && <Area type="monotone" dataKey="_total" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeDasharray="4 3"
            fill={`url(#${gId}-total)`} dot={false} animationBegin={100} animationDuration={1200} name="Total" />}
          {/* Per-user curves */}
          {allUsers.map((u, i) => (
            !hidden[u.name] && <Area key={u.name} type="monotone" dataKey={u.name} stroke={USER_COLORS[i % USER_COLORS.length]} strokeWidth={1.5}
              fill={`url(#${gId + i})`} dot={false} animationBegin={200 + i * 100} animationDuration={1200} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4, justifyContent: "center" }}>
        {/* Total legend */}
        <div onClick={() => toggleLine("_total")} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", opacity: hidden._total ? 0.3 : 1, transition: "opacity .2s" }}>
          <svg width="10" height="3" style={{ flexShrink: 0 }}><line x1="0" y1="1.5" x2="10" y2="1.5" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="3 2" /></svg>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Total</span>
        </div>
        {/* Per-user legends */}
        {allUsers.map((u, i) => (
          <div key={u.name} onClick={() => toggleLine(u.name)} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", opacity: hidden[u.name] ? 0.3 : 1, transition: "opacity .2s" }}>
            <div style={{ width: 8, height: 3, borderRadius: 2, background: USER_COLORS[i % USER_COLORS.length] }} />
            <span style={{ fontSize: 9, color: (u.isMe || u.name === me) ? "white" : "rgba(255,255,255,0.4)", fontWeight: (u.isMe || u.name === me) ? 700 : 400 }}>{u.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Jour prefere (DayChart) */}
    {dayData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour prefere</Lbl><DayChart data={dayData} accent={accent} height={100} /></div>}

    {/* Heure de consommation (TimeChart) */}
    {timeData.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={100} /></div>}

    {/* Peak stats: mois en or + journee record */}
    {(bestMonthEntry || bestDayEntry) && (
      <div className="s4" style={{ display: "flex", gap: 8 }}>
        {bestMonthEntry && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: 10, background: accent + "0a", border: "1px solid " + accent + "25" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Mois en or</div>
            <div style={{ fontSize: "clamp(18px, 4.5vw, 24px)", fontWeight: 800, color: accent, lineHeight: 1 }}>{bestMonthEntry.m}</div>
            <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: "white", marginTop: 4 }}>{bestMonthEntry.v} vues</div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "rgba(255,255,255,0.25)" }}>{totalViews > 0 ? Math.round(bestMonthEntry.v / totalViews * 100) : 0}% du total</div>
          </div>
        )}
        {bestDayEntry && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Journee record</div>
            <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "white", lineHeight: 1.1 }}>
              {bestDayEntry.day_name} {bestDayEntry.day} {bestDayEntry.month}
            </div>
            <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: accent, marginTop: 4 }}>{bestDayEntry.views} vues</div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "rgba(255,255,255,0.25)" }}>{bestDayEntry.hours}h de visionnage</div>
          </div>
        )}
      </div>
    )}
  </div>
}

/* ═══════════════════════════════════════════════════════
   2. TOP MOST WATCHED — Films/series les plus vus
      Mur d'affiches + reveal podium + liste
   ═══════════════════════════════════════════════════════ */
const PODIUM_H = [75, 95, 115]

export function CommunityTopSlide({ accent, allUsers, year, me, mediaType = "films" }) {
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

  const backdrop = top3[0]?.art || top3[0]?.thumb || ""

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

      {/* Subtle vignette — edges only, no center darkening */}
      <div style={{ position: "fixed", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, #05050e90 0%, transparent 15%, transparent 85%, #05050e90 100%)" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16, position: "relative", zIndex: 5 }}>
        <div style={{ fontSize: 34, marginBottom: 6, filter: "drop-shadow(0 0 20px " + accent + ")", animation: "float 3s ease-in-out infinite" }}>{isSeries ? "📺" : "🎬"}</div>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 4 }}>WRAPPARR · COMMUNAUTE</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
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
                    background: show ? "linear-gradient(180deg," + accent + "38 0%," + accent + "18 100%)" : "rgba(255,255,255,0.04)",
                    border: "1px solid " + (show ? accent + "55" : "rgba(255,255,255,0.05)"), borderBottom: "none",
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "8px 5px",
                    animation: show ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none",
                  }}>
                    {show && <>
                      <div style={{ color: "white", fontWeight: 700, fontSize: isOne ? 11 : 9, textAlign: "center", lineHeight: 1.2, marginBottom: 3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.t}</div>
                      <div style={{ color: accent, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", fontSize: isOne ? 13 : 10 }}>{item.userCount} user{item.userCount > 1 ? "s" : ""}</div>
                      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8 }}>{item.viewCount} vue{item.viewCount > 1 ? "s" : ""}</div>
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
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              animation: "slide-up .35s ease " + (i * 0.06) + "s both",
            }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", width: 16, textAlign: "center", flexShrink: 0 }}>{i + 4}</span>
              <PosterImg src={item.thumb} size={24} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.t}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: accent, fontWeight: 700 }}>{item.userCount} user{item.userCount > 1 ? "s" : ""}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{item.viewCount} vues</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════
   2b. MOST VIEWED — Top 10 films/series par nombre de vues
   ═══════════════════════════════════════════════════════ */
export function CommunityMostViewedSlide({ accent, allUsers, year, me, mediaType = "films" }) {
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
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        {isSeries ? "Series" : "Films"} les plus <span style={{ color: accent }}>vus</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Top 10 par {isSeries ? "episodes vus" : "nombre de vues"} · {allUsers.length} utilisateurs</div>
    </div>

    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {topItems.map((item, i) => (
        <div key={item.t + i} style={{
          display: "flex", gap: 10, padding: "8px 10px", borderRadius: 12,
          background: i === 0 ? accent + "0c" : "rgba(255,255,255,0.03)",
          border: `1px solid ${i === 0 ? accent + "30" : "rgba(255,255,255,0.06)"}`,
          animation: "slide-up .4s ease " + (0.08 + i * 0.05) + "s both",
        }}>
          {/* Rank */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 20, flexShrink: 0 }}>
            <span style={{ fontSize: i < 3 ? 14 : 11, fontWeight: 800, color: i === 0 ? accent : "rgba(255,255,255,0.25)" }}>
              {i < 3 ? ["🥇", "🥈", "🥉"][i] : "#" + (i + 1)}
            </span>
          </div>

          {/* Poster */}
          <PosterImg src={item.thumb} size={38} />

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{item.t}</div>
            <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
              {item.y && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", fontFamily: "JetBrains Mono,monospace" }}>{item.y}</span>}
              {item.r > 0 && <span style={{ fontSize: 9, color: "#fbbf24", fontWeight: 600 }}>★ {item.r}</span>}
              <span style={{ fontSize: 10, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{item.totalViews} {isSeries ? "ep." : "vue"}{!isSeries && item.totalViews > 1 ? "s" : ""}</span>
            </div>

            {/* Per-user view badges */}
            <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
              {item.perUser.map((pu) => (
                <span key={pu.name} style={{
                  fontSize: 8, padding: "2px 6px", borderRadius: 8,
                  background: pu.isMe ? accent + "20" : "rgba(255,255,255,0.05)",
                  border: pu.isMe ? "1px solid " + accent + "30" : "1px solid rgba(255,255,255,0.06)",
                  color: pu.isMe ? accent : "rgba(255,255,255,0.5)",
                  fontWeight: pu.isMe ? 700 : 400,
                }}>
                  {pu.name} · {pu.views}{isSeries ? " ep." : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
}

/* ═══════════════════════════════════════════════════════
   3. RANKINGS — Classements vues + heures
   Memes dimensions que CommunityGenresSlide
   ═══════════════════════════════════════════════════════ */
export function CommunityRankingsSlide({ accent, allUsers, year, me, mediaType = "films" }) {
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
            padding: "4px 8px", borderRadius: 8,
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
              <span style={{ fontSize: 9, color: u.isMe ? accent + "80" : "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace" }}>#{i + 1}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: u.isMe ? accent : (i === 0 ? accent : "rgba(255,255,255,0.4)"), fontFamily: "JetBrains Mono,monospace", width: 40, textAlign: "right" }}>{u.v.toLocaleString("fr-FR")}{unitSuffix}</span>
            </div>
            <div style={{ height: 5, background: "rgba(255,255,255,0.04)", borderRadius: 3, overflow: "hidden" }}>
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
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        Qui regarde le plus de <span style={{ color: accent }}>{label}</span> ?
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>{allUsers.length} utilisateurs</div>
    </div>

    {/* Position badges — shine effect like bilan cinema */}
    <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 12px ${accent}20`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
        <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "JetBrains Mono,monospace", position: "relative" }}>{myRankViews > 0 ? `#${myRankViews}` : "—"}</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: accent, position: "relative" }}>en {viewLabel}</span>
      </div>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 16, background: accent + "18", border: "1px solid " + accent + "35", boxShadow: `0 0 12px ${accent}20`, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}30 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out 1.5s infinite", pointerEvents: "none" }} />
        <span style={{ fontSize: 12, fontWeight: 900, color: accent, fontFamily: "JetBrains Mono,monospace", position: "relative" }}>{myRankHours > 0 ? `#${myRankHours}` : "—"}</span>
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
    return { name: u.name, genre: top?.n || "—", isMe: u.isMe || u.name === me }
  })

  const opacities = [1, 0.8, 0.65, 0.5, 0.4, 0.32, 0.25, 0.2]

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
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
            return <div key={u.name} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 8,
              background: u.isMe ? accent + "12" : "rgba(255,255,255,0.03)",
              border: u.isMe ? "1px solid " + accent + "30" : "1px solid rgba(255,255,255,0.06)",
            }}>
              <span style={{ fontSize: 10, fontWeight: u.isMe ? 700 : 400, color: u.isMe ? accent : "rgba(255,255,255,0.6)" }}>{u.name}</span>
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
/* ═══════════════════════════════════════════════════════
   5. YEAR COMPARISON — Comparaison annee vs annee
   ═══════════════════════════════════════════════════════ */
export function CommunityCompareSlide({ accent, compareData, year, mediaType = "films" }) {
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

  // Colors
  const prevColor = accent + "60"

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 10 }}>
      <Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
        {year} vs <span style={{ color: accent }}>{year - 1}</span>
      </h2>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4 }}>Comparaison {label}</div>
    </div>

    {/* Totaux avec diff badges */}
    <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{active ? curItems : 0}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{isSeries ? "ep." : label}</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>vs {prevItems}</span>
        {diffItems !== 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: diffItems > 0 ? "#4ade80" : "#f87171", padding: "1px 6px", borderRadius: 8, background: diffItems > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
            {diffItems > 0 ? "+" : ""}{diffItems}%
          </span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{active ? Math.round(curHours) : 0}h</span>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>vs {Math.round(prevHours)}h</span>
        {diffHours !== 0 && (
          <span style={{ fontSize: 9, fontWeight: 700, color: diffHours > 0 ? "#4ade80" : "#f87171", padding: "1px 6px", borderRadius: 8, background: diffHours > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
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

    {/* Activite mensuelle comparee — line chart */}
    {monthly.length > 0 && (
      <div className="s1" style={{ padding: "10px 10px 6px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
        <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
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
            <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={28} />
            <Area type="monotone" dataKey="current" stroke={accent} strokeWidth={2} fill={"url(#cmp-cur-" + mediaType + ")"} dot={false} animationBegin={200} animationDuration={1200} />
            <Area type="monotone" dataKey="previous" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" fill={"url(#cmp-prev-" + mediaType + ")"} dot={false} animationBegin={400} animationDuration={1200} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    )}

    {/* Genres — badges cote a cote : annee en cours a gauche, precedente a droite */}
    {(curGenres.length > 0 || prevGenres.length > 0) && (
      <div className="s2" style={{ padding: "10px 10px 8px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
        <Lbl c={accent} size={8}>Genres</Lbl>
        <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
          {/* Current year */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{year}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {curGenres.map((g, i) => (
                <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: i === 0 ? accent + "18" : "rgba(255,255,255,0.04)", border: "1px solid " + (i === 0 ? accent + "30" : "rgba(255,255,255,0.08)"), fontSize: 10, color: i === 0 ? accent : "rgba(255,255,255,0.6)", fontWeight: i === 0 ? 700 : 500 }}>
                  {g.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: 9, color: accent }}>{g.current}</span>
                </span>
              ))}
            </div>
          </div>
          {/* Previous year */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 2 }}>{year - 1}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
              {prevGenres.map((g, i) => (
                <span key={g.n} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: i === 0 ? 600 : 400 }}>
                  {g.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{g.previous}</span>
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
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 18, height: 18, borderRadius: 6, fontSize: 9, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", flexShrink: 0, background: pos === 0 ? (isCurrent ? accent + "20" : "rgba(255,255,255,0.08)") : "rgba(255,255,255,0.04)", color: pos === 0 ? (isCurrent ? accent : "rgba(255,255,255,0.5)") : "rgba(255,255,255,0.3)", border: "1px solid " + (pos === 0 ? (isCurrent ? accent + "40" : "rgba(255,255,255,0.12)") : "rgba(255,255,255,0.06)") }}>
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
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "white" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{it.total_views} {isSeries ? "ep." : "vue" + (it.total_views > 1 ? "s" : "")}</div>
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
                <div style={{ fontSize: 10, fontWeight: 600, color: isCurrent ? "white" : "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{it.t}</div>
                <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{it.user_count} utilisateur{it.user_count > 1 ? "s" : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )
      return <>
        {(curByViews.length > 0 || prevByViews.length > 0) && (
          <div className="s3" style={{ padding: "10px 10px 8px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
            <Lbl c={accent} size={8}>Top {label} les plus vus</Lbl>
            <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
              {renderTop(curByViews, String(year), true)}
              {renderTop(prevByViews, String(year - 1), false)}
            </div>
          </div>
        )}
        {(curByUsers.length > 0 || prevByUsers.length > 0) && (
          <div className="s4" style={{ padding: "10px 10px 8px", borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 8 }}>
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

const statPill = { display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid" }
