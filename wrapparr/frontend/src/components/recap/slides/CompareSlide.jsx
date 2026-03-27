import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Tag } from "../SharedUI"

export default function CompareSlide({ accent, comparison, year }) {
  const monthly = comparison?.monthly || []
  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 16 }}><Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(20px, 6vw, 34px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>{year} vs <span style={{ color: accent }}>{year - 1}</span></h2>
    </div>
    {monthly.length > 0 && <div className="glass s1" style={{ padding: "12px 12px", marginBottom: 9 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>{[[String(year), accent], [String(year - 1), "rgba(255,255,255,.25)"]].map(([y, c]) => <div key={y} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: c, fontFamily: "JetBrains Mono,monospace" }}><div style={{ width: 16, height: 2.5, background: c, borderRadius: 2 }} />{y}</div>)}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={monthly} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}><XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Line type="monotone" dataKey="a" stroke={accent} strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="b" stroke="rgba(255,255,255,.2)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" /></LineChart>
      </ResponsiveContainer>
    </div>}
  </div>
}
