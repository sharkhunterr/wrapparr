import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

export default function DeepSlide({ accent, data, serviceName, userName }) {
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div style={{ maxWidth: 430, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>{serviceName} · HABITUDES</div>
      </div>

      {data.day_of_week?.length > 0 && (
        <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>PAR JOUR</div>
          <ResponsiveContainer width="100%" height={55}>
            <BarChart data={data.day_of_week} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Bar dataKey="v" radius={[3, 3, 0, 0]}>
                {data.day_of_week.map((d, i) => <Cell key={i} fill={d.d === "Sam" || d.d === "Dim" || d.d === "Ven" ? accent : `${accent}45`} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.ranking?.length > 0 && (
        <div className="glass s2" style={{ padding: "12px 14px" }}>
          <div style={{ fontSize: 8, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 8 }}>CLASSEMENT</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {data.ranking.slice(0, 6).map((u, i) => {
              const isMe = u.n === userName
              const max = data.ranking[0]?.v || 1
              return (
                <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 7, animation: `slide-up .4s ease ${0.08 + i * 0.07}s both` }}>
                  <div style={{ width: 20, textAlign: "center", fontSize: 12, flexShrink: 0, color: i < 3 ? "transparent" : "rgba(255,255,255,.22)", fontWeight: 700 }}>{i < 3 ? medals[i] : i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <span style={{ fontSize: 11, fontWeight: isMe ? 700 : 400, color: isMe ? accent : "rgba(255,255,255,.65)" }}>{u.n}{isMe && <span style={{ fontSize: 9, opacity: 0.5 }}> · moi</span>}</span>
                      <span style={{ fontSize: 10, color: isMe ? accent : "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono,monospace" }}>{u.v?.toLocaleString("fr-FR")}h</span>
                    </div>
                    <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: isMe ? `linear-gradient(90deg,${accent},${accent}80)` : "rgba(255,255,255,.16)", width: `${(u.v / max) * 100}%`, borderRadius: 2, transformOrigin: "left", animation: `bar-grow .7s ease ${0.28 + i * 0.07}s both` }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
