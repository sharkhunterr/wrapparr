import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts"

function CTip({ active, payload, label, unit = "h" }) {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}>
      <div style={{ color: "rgba(255,255,255,.4)", marginBottom: 2 }}>{label}</div>
      {payload.map((p) => <div key={p.dataKey} style={{ color: p.color || "white", fontWeight: 600 }}>{p.value}{unit}</div>)}
    </div>
  )
}

export function AreaG({ data, dataKey, accent, height = 52, unit = "h", id }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} />
        </linearGradient></defs>
        <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
        <YAxis hide /><Tooltip content={<CTip unit={unit} />} />
        <Area type="monotone" dataKey={dataKey} stroke={accent} strokeWidth={2} fill={`url(#${id})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DayChart({ data, accent, height = 55, unit }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
        <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} />
        <Bar dataKey="v" radius={[3, 3, 0, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.d === "Sam" || d.d === "Dim" || d.d === "Ven" ? accent : `${accent}45`} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function TimeChart({ data, accent, height = 50, unit }) {
  const gId = `tg${accent.replace(/[^a-f0-9]/gi, "")}`
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} />
        </linearGradient></defs>
        <XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
        <YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} />
        <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill={`url(#${gId})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
