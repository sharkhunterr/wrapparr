import { useActive, AN } from "../SharedUI"

export default function FinaleSlide({ accent, userName, year, globalStats, onRestart }) {
  const active = useActive()
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 400, width: "100%", padding: "0 20px" }}>
        <div style={{ fontSize: 62, marginBottom: 12, animation: "float 2.5s ease-in-out infinite", filter: "drop-shadow(0 0 30px " + accent + "90)" }}>🏆</div>
        <div className="s0" style={{ fontSize: 8, color: "rgba(255,255,255,.2)", letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "JetBrains Mono,monospace", marginBottom: 10 }}>MERCI POUR CETTE BELLE ANNEE</div>
        <h1 className="s1" style={{ fontSize: "clamp(24px, 7vw, 38px)", fontWeight: 800, color: "white", lineHeight: 1.0, marginBottom: 14 }}>
          C'etait ton<br />
          <span style={{ backgroundImage: "linear-gradient(90deg,#E5A00D,#fb923c,#c084fc,#34d399,#60a5fa,#E5A00D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "300% auto", animation: "shimmer-t 4s linear infinite" }}>Wrapparr {year}</span>
        </h1>
        <div className="s2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { v: Math.round(globalStats.total_hours || 0), s: "h", l: "Heures totales", c: accent },
            { v: globalStats.total_items || 0, s: "", l: "Contenus", c: "#a78bfa" },
            { v: globalStats.services_count || 0, s: " services", l: "Plateformes", c: "#34d399" },
          ].map((item, i) => (
            <div key={item.l} style={{ padding: "10px 12px", borderRadius: 12, background: item.c + "12", border: "1px solid " + item.c + "28", animation: "stat-row-in .5s ease " + (0.2 + i * 0.08) + "s both" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.c, lineHeight: 1 }}>{active ? <AN t={item.v} s={item.s} /> : "0" + item.s}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div className="s5" style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ padding: "12px 28px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 14, fontWeight: 800, boxShadow: "0 0 60px " + accent + "50" }}>Partager</button>
          {onRestart && <button onClick={onRestart} style={{ padding: "12px 28px", borderRadius: 40, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.35)", fontSize: 13, border: "1px solid rgba(255,255,255,.1)" }}>Rejouer</button>}
        </div>
      </div>
    </div>
  )
}
