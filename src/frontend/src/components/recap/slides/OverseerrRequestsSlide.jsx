import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl, useComparison } from "../SharedUI"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

export default function OverseerrRequestsSlide({ accent, data, year }) {
  const L = useLabels()
  const active = useActive()
  const comp = useComparison()
  const ov = data?.overseerr
  if (!ov || !ov.total) return null

  const approvalRate = ov.total > 0 ? Math.round((ov.approved / ov.total) * 100) : 0
  const prevOv = comp.active ? comp.data?.overseerr : null

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", marginBottom: 6, fontSize: 9, color: accent, fontWeight: 700 }}>
          📋 OVERSEERR
        </div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Tes <span style={{ color: accent }}>demandes</span> media
        </h2>
      </div>

      {/* Stats badges */}
      <div className="s0" style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
        <StatBadge value={active ? ov.total : 0} label="demandes" accent={accent} primary prev={prevOv?.total} />
        <StatBadge value={active ? ov.movies : 0} label="films" accent={null} prev={prevOv?.movies} />
        <StatBadge value={active ? ov.series : 0} label="series" accent={null} prev={prevOv?.series} />
      </div>

      {/* Approval rate */}
      <div className="glass s1" style={{ padding: "12px 14px", marginBottom: 10 }}>
        <Lbl c={accent} size={8}>Taux d'approbation</Lbl>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 6 }}>
          <div style={{ fontSize: "clamp(22px, 6vw, 32px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>
            {active ? <AN t={approvalRate} s="%" /> : "0%"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, borderRadius: 4, background: "var(--th-surface-subtle)", overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4, background: accent,
                width: (active ? approvalRate : 0) + "%",
                transition: "width 1.2s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: "var(--th-text-muted)" }}>{ov.approved} disponible{ov.approved > 1 ? "s" : ""}</span>
              {ov.pending > 0 && <span style={{ fontSize: 9, color: "var(--th-text-dim)" }}>{ov.pending} en attente</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly chart */}
      {ov.monthly?.length > 0 && (
        <div className="s2" style={{ padding: "10px 10px 6px", borderRadius: "var(--th-radius)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)", marginBottom: 10 }}>
          <Lbl c={accent} size={8}>Demandes par mois</Lbl>
          <ResponsiveContainer width="100%" height={100}>
            <AreaChart data={ov.monthly} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="ov-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal vertical={false} />
              <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,.2)", fontSize: 7 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
              <Tooltip content={<OvTooltip />} />
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill="url(#ov-fill)" dot={false} animationBegin={200} animationDuration={1200} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top requested */}
      {ov.top?.length > 0 && (
        <div className="s3">
          <Lbl c={accent} size={8}>Les plus demandes</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 6 }}>
            {ov.top.slice(0, 5).map((item, i) => (
              <div key={item.title + i} style={{
                display: "flex", gap: 8, alignItems: "center", padding: "6px 10px", borderRadius: 8,
                background: i === 0 ? accent + "0c" : "var(--th-surface-dim)",
                border: "1px solid " + (i === 0 ? accent + "25" : "var(--th-border-dim)"),
                animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both",
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)", fontFamily: "var(--th-font-mono)", width: 16, textAlign: "center", flexShrink: 0 }}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : "#" + (i + 1)}
                </span>
                {item.poster && <img src={item.poster} alt="" style={{ width: 28, height: 40, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                  <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                    <span style={{ fontSize: 9, color: accent + "90", fontWeight: 600 }}>{item.type === "movie" ? "Film" : "Serie"}</span>
                    <span style={{ fontSize: 9, color: item.status === "available" ? "#4ade80" : item.status === "pending" ? "#fbbf24" : "var(--th-text-dim)" }}>
                      {item.status === "available" ? "✓ Disponible" : item.status === "pending" ? "⏳ En attente" : item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

function OvTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: "var(--th-tooltip-bg)", border: "1px solid var(--th-tooltip-border)", borderRadius: "var(--th-radius-xs)", padding: "5px 8px", fontSize: 10, fontFamily: "var(--th-font-mono)" }}>
    <div style={{ color: "var(--th-text-tertiary)" }}>{label}</div>
    <div style={{ fontWeight: 700, color: "var(--th-text)" }}>{payload[0].value} demande{payload[0].value > 1 ? "s" : ""}</div>
  </div>
}
