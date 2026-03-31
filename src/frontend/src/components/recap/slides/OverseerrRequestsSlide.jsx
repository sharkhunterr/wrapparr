import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl, useComparison, CompLegend } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function OverseerrRequestsSlide({ accent, data, year, config = {} }) {
  const L = useLabels()
  const active = useActive()
  const comp = useComparison()
  const ov = data?.overseerr
  if (!ov || !ov.total) return null

  const prev = ov.prev_year || {}
  const hasPrev = comp.active && prev.total > 0

  // Status counts
  const available = ov.by_status?.available || 0
  const partial = ov.by_status?.partial || 0
  const processing = ov.by_status?.processing || 0
  const pending = ov.by_status?.pending || 0
  const unknown = ov.by_status?.unknown || 0
  const totalStatused = available + partial + processing + pending + unknown || ov.total

  // Approval bar: approved vs refused/pending
  const approvedCount = available + partial
  const pendingCount = processing + pending + unknown
  const approvalRate = ov.total > 0 ? Math.round((approvedCount / ov.total) * 100) : 0

  // Availability bar: available / partial / processing / pending
  const statusSegments = [
    { key: "available", count: available, color: "#4ade80", label: "Disponible" },
    { key: "partial", count: partial, color: "#fbbf24", label: "Partiel" },
    { key: "processing", count: processing, color: accent, label: "En cours" },
    { key: "pending", count: pending + unknown, color: "rgba(255,255,255,0.15)", label: "En attente" },
  ].filter(s => s.count > 0)

  // Monthly comparison data
  const monthlyWithPrev = ov.monthly?.map(m => {
    const prevMonth = prev.monthly?.find(p => p.m === m.m)
    return { ...m, prev: prevMonth?.v || 0 }
  }) || []

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Bilan <span style={{ color: accent }}>demandes</span>
        </h2>
      </div>

      {/* Stats badges */}
      <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <StatBadge value={active ? ov.total : 0} label="demandes" accent={accent} primary prev={hasPrev ? prev.total : null} />
        <StatBadge value={active ? ov.movies : 0} label="films" accent={null} prev={hasPrev ? prev.movies : null} />
        <StatBadge value={active ? ov.series : 0} label="series" accent={null} prev={hasPrev ? prev.series : null} />
      </div>

      {/* Approval progress bar */}
      <div className="glass s1" style={{ padding: "10px 14px", marginBottom: 8 }}>
        <Lbl c={accent} size={8}>Taux d'approbation</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
          <span style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>
            {active ? <AN t={approvalRate} s="%" /> : "0%"}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, borderRadius: 4, background: "var(--th-surface-subtle)", overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", background: "#4ade80", width: (approvedCount / ov.total * 100) + "%", transition: "width 1.2s ease" }} />
              <div style={{ height: "100%", background: "rgba(239,68,68,0.4)", width: (pendingCount / ov.total * 100) + "%", transition: "width 1.2s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
              <span style={{ fontSize: 8, color: "#4ade80" }}>{approvedCount} approuvees</span>
              <span style={{ fontSize: 8, color: "rgba(239,68,68,0.6)" }}>{pendingCount} en attente</span>
            </div>
          </div>
        </div>
        {hasPrev && prev.approved > 0 && (() => {
          const prevRate = Math.round((prev.approved / prev.total) * 100)
          const diff = approvalRate - prevRate
          return diff !== 0 ? (
            <div style={{ fontSize: 9, color: "var(--th-text-dim)", marginTop: 4 }}>
              {year - 1} : {prevRate}%
              <span style={{ marginLeft: 6, fontWeight: 700, color: diff > 0 ? "#4ade80" : "#f87171", padding: "1px 6px", borderRadius: 6, background: diff > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
                {diff > 0 ? "+" : ""}{diff}pp
              </span>
            </div>
          ) : null
        })()}
      </div>

      {/* Availability status bar */}
      <div className="glass s1" style={{ padding: "10px 14px", marginBottom: 10 }}>
        <Lbl c={accent} size={8}>Disponibilite</Lbl>
        <div style={{ height: 10, borderRadius: 5, overflow: "hidden", display: "flex", marginTop: 6 }}>
          {statusSegments.map(s => (
            <div key={s.key} style={{ height: "100%", background: s.color, width: (s.count / totalStatused * 100) + "%", transition: "width 1s ease" }} />
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
          {statusSegments.map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: 2, background: s.color }} />
              <span style={{ fontSize: 8, color: "var(--th-text-tertiary)" }}>{s.label} ({s.count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly chart with comparison */}
      {ov.monthly?.length > 0 && (
        <div className="s2" style={{ padding: "10px 10px 6px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
          <Lbl c={accent} size={8}>Demandes par mois</Lbl>
          {hasPrev && (
            <div style={{ display: "flex", gap: 12, marginBottom: 4, marginTop: 2 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: accent }}>
                <span style={{ width: 14, height: 2.5, borderRadius: 2, background: accent }} />{year}
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                <svg width="14" height="3" style={{ flexShrink: 0 }}><line x1="0" y1="1.5" x2="14" y2="1.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" strokeDasharray="3 2" /></svg>
                {year - 1}
              </span>
            </div>
          )}
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={hasPrev ? monthlyWithPrev : ov.monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ov-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="ov-prev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.4)" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
              <Tooltip content={<OvTooltip hasPrev={hasPrev} year={year} />} />
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill="url(#ov-fill)" dot={false} animationBegin={200} animationDuration={1200} name={String(year)} />
              {hasPrev && <Area type="monotone" dataKey="prev" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" fill="url(#ov-prev)" dot={false} animationBegin={400} animationDuration={1200} name={String(year - 1)} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function StatBadge({ value, label, accent, primary, prev }) {
  const diff = prev != null && prev > 0 ? Math.round(((value - prev) / prev) * 100) : null
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
      borderRadius: "var(--th-radius-pill)",
      background: primary ? accent + "10" : "var(--th-surface-dim)",
      border: "1px solid " + (primary ? accent + "25" : "var(--th-border-dim)"),
    }}>
      <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: primary ? accent : "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>{value}</span>
      <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>{label}</span>
      {diff != null && diff !== 0 && (
        <span style={{ fontSize: 8, fontWeight: 700, color: diff > 0 ? "#4ade80" : "#f87171", padding: "1px 5px", borderRadius: 6, background: diff > 0 ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.1)" }}>
          {diff > 0 ? "+" : ""}{diff}%
        </span>
      )}
    </div>
  )
}

function OvTooltip({ active, payload, label, hasPrev, year }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: "var(--th-tooltip-bg)", border: "1px solid var(--th-tooltip-border)", borderRadius: "var(--th-radius-xs)", padding: "5px 8px", fontSize: 10, fontFamily: "var(--th-font-mono)" }}>
    <div style={{ color: "var(--th-text-tertiary)", marginBottom: 2 }}>{label}</div>
    {payload.map(p => (
      <div key={p.dataKey} style={{ color: p.stroke, display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span>{p.dataKey === "prev" ? year - 1 : year}</span>
        <span style={{ fontWeight: 700 }}>{p.value}</span>
      </div>
    ))}
  </div>
}
