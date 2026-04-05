import { useState, useCallback } from "react"
import { useActive, AN, Tag, Lbl, DayChart, TimeChart } from "../../SharedUI"
import { useLabels } from "../../ThemeContext"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { USER_COLORS, MultiUserTooltip } from "./shared"

export function CommunityActivitySlide({ accent, allUsers, year, me, mediaType = "films" }) {
  const L = useLabels()
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
      <Lbl c={accent} size={9}>👥 Communauté · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05, marginTop: 4 }}>
        Quand la communauté <span style={{ color: accent }}>{isSeries ? "binge" : "regarde"}</span>
      </h2>

      {/* Badges totaux */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {totalAll > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "var(--th-radius-pill)", background: accent + "10", border: "1px solid " + accent + "25" }}>
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={totalAll} /> : 0}</span>
            <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>{label} {L.viewed}</span>
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: "var(--th-radius-pill)", background: "var(--th-surface-dim)", border: "1px solid var(--th-border-dim)" }}>
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{active ? <AN t={Math.round(totalHours)} s="h" /> : "0h"}</span>
            <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>au total</span>
          </div>
        )}
      </div>
    </div>

    {/* Activité mensuelle superposee */}
    <div className="s1" style={{ padding: "10px 10px 6px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 8 }}>
      <Lbl c={accent} size={8}>Activité mensuelle par utilisateur</Lbl>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={multiMonthlyData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
          <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={(() => { const max = Math.max(...(multiMonthlyData || []).map(d => d?._total || 0), 0); if (max >= 1000) return 38; if (max >= 100) return 32; return 28 })()} />
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
          <span style={{ fontSize: 9, color: "var(--th-text-secondary)", fontWeight: 600 }}>Total</span>
        </div>
        {/* Per-user legends */}
        {allUsers.map((u, i) => (
          <div key={u.name} onClick={() => toggleLine(u.name)} style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer", opacity: hidden[u.name] ? 0.3 : 1, transition: "opacity .2s" }}>
            <div style={{ width: 8, height: 3, borderRadius: 2, background: USER_COLORS[i % USER_COLORS.length] }} />
            <span style={{ fontSize: 9, color: (u.isMe || u.name === me) ? "var(--th-text)" : "var(--th-text-tertiary)", fontWeight: (u.isMe || u.name === me) ? 700 : 400 }}>{u.name}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Jour préféré (DayChart) */}
    {dayData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour préféré</Lbl><DayChart data={dayData} accent={accent} height={100} /></div>}

    {/* Heure de consommation (TimeChart) */}
    {timeData.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={100} /></div>}

    {/* Peak stats: mois en or + journee record */}
    {(bestMonthEntry || bestDayEntry) && (
      <div className="s4" style={{ display: "flex", gap: 8 }}>
        {bestMonthEntry && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: "var(--th-radius-sm)", background: accent + "0a", border: "1px solid " + accent + "25" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Mois en or</div>
            <div style={{ fontSize: "clamp(18px, 4.5vw, 24px)", fontWeight: 800, color: accent, lineHeight: 1 }}>{bestMonthEntry.m}</div>
            <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: "var(--th-text)", marginTop: 4 }}>{bestMonthEntry.v} {L.viewsUnit}</div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "var(--th-text-dim)" }}>{totalViews > 0 ? Math.round(bestMonthEntry.v / totalViews * 100) : 0}% du total</div>
          </div>
        )}
        {bestDayEntry && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Journée record</div>
            <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.1 }}>
              {bestDayEntry.day_name} {bestDayEntry.day} {bestDayEntry.month}
            </div>
            <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: accent, marginTop: 4 }}>{bestDayEntry.views} {L.viewsUnit}</div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "var(--th-text-dim)" }}>{bestDayEntry.hours}h de visionnage</div>
          </div>
        )}
      </div>
    )}
  </div>
}
