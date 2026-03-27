import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

function AN({ t, s = "" }) {
  const [v, setV] = useState(0)
  useEffect(() => { let c = 0; const inc = t / 80; const tm = setInterval(() => { c += inc; if (c >= t) { setV(t); clearInterval(tm) } else setV(Math.floor(c)) }, 16); return () => clearInterval(tm) }, [t])
  return <>{v.toLocaleString("fr-FR")}{s}</>
}

export default function StatsSlide({ accent, data, serviceName }) {
  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>{serviceName}</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
          <div>
            <div style={{ fontSize: "clamp(24px, 7vw, 42px)", fontWeight: 800, color: accent, lineHeight: 1 }}>
              <AN t={data.total_items || 0} />
            </div>
            <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>total</div>
          </div>
          {data.total_hours > 0 && (
            <div style={{ marginBottom: 3 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: `${accent}bb`, lineHeight: 1 }}>
                <AN t={Math.round(data.total_hours)} s="h" />
              </div>
              <div style={{ color: "rgba(255,255,255,0.32)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.12em" }}>heures</div>
            </div>
          )}
        </div>
      </div>

      {data.genres?.length > 0 && (
        <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>GENRES</div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {data.genres.slice(0, 5).map((g) => (
              <span key={g.n} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 18, background: `${accent}1e`, border: `1px solid ${accent}38`, color: accent, fontSize: 10 }}>{g.n}</span>
            ))}
          </div>
        </div>
      )}

      {data.monthly?.length > 0 && (
        <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>ACTIVITE MENSUELLE</div>
          <ResponsiveContainer width="100%" height={52}>
            <AreaChart data={data.monthly} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
              <defs><linearGradient id={`sm-${serviceName}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} />
              </linearGradient></defs>
              <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill={`url(#sm-${serviceName})`} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
