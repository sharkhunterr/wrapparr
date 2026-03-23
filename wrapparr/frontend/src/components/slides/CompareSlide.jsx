import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import Orbs from "../ambient/Orbs"

export default function CompareSlide({ accent = "#60a5fa", bg = "#00091a", compareData = {} }) {
  const monthly = compareData.monthly || []

  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "40px 20px" }}>
      <Orbs accent={accent} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 400 }}>
        <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
          Comparaison annuelle
        </div>

        {monthly.length > 0 && (
          <div className="glass" style={{ padding: 16 }}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={monthly} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="compA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accent} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={accent} stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="compB" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.3)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.0)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="a" stroke={accent} strokeWidth={2} fill="url(#compA)" dot={false} name="Cette année" />
                <Area type="monotone" dataKey="b" stroke="rgba(255,255,255,0.3)" strokeWidth={1.5} fill="url(#compB)" dot={false} name="Année précédente" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
