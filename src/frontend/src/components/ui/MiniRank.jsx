const Lbl = ({ c = "rgba(255,255,255,0.32)", size = 10, children, upper = true }) => (
  <div style={{ color: c, fontSize: size, fontFamily: "Nunito,sans-serif", textTransform: upper ? "uppercase" : "none", letterSpacing: "0.12em" }}>{children}</div>
)

export default function MiniRank({ data, accent, unit = "h", label = "Classement", me = "" }) {
  const max = data[0]?.v || 1
  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div className="glass" style={{ padding: "12px 14px" }}>
      <Lbl c={accent} size={9}>{label}</Lbl>
      <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
        {data.map((u, i) => {
          const isMe = u.n === me
          return (
            <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 7, animation: `slide-up .4s ease ${0.08 + i * 0.07}s both` }}>
              <div style={{ width: 20, textAlign: "center", fontSize: 12, flexShrink: 0, color: i < 3 ? "transparent" : "rgba(255,255,255,.22)", fontWeight: 700 }}>
                {i < 3 ? medals[i] : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 11, fontFamily: isMe ? "Nunito,sans-serif" : "Nunito,sans-serif", fontWeight: isMe ? 700 : 400, color: isMe ? accent : "rgba(255,255,255,.65)" }}>
                    {u.n}{isMe && <span style={{ fontSize: 9, opacity: 0.5 }}> · moi</span>}
                  </span>
                  <span style={{ fontSize: 10, color: isMe ? accent : "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono,monospace" }}>
                    {u.v.toLocaleString("fr-FR")}{unit}
                  </span>
                </div>
                <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: isMe ? `linear-gradient(90deg,${accent},${accent}80)` : "rgba(255,255,255,.16)",
                    width: `${(u.v / max) * 100}%`, borderRadius: 2, transformOrigin: "left",
                    animation: `bar-grow .7s ease ${0.28 + i * 0.07}s both`,
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { Lbl }
