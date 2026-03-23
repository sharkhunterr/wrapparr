export default function IntroSlide({ accent, userName, year, onStart }) {
  return <div style={{ textAlign: "center", maxWidth: 380, width: "100%" }}>
    <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 26px" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid " + accent, animation: "pulse-ring 3s ease-out " + (i * 0.8) + "s infinite" }} />)}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, filter: "drop-shadow(0 0 40px " + accent + "90)" }}>🎬</div>
    </div>
    <div className="s0" style={{ fontSize: 9, color: accent, letterSpacing: ".35em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase" }}>WRAPPARR · RECAP ANNUEL</div>
    <h1 className="s1" style={{ fontSize: "clamp(32px, 10vw, 72px)", fontWeight: 800, color: "white", lineHeight: 0.88, margin: "10px 0 6px", textShadow: "0 0 120px " + accent + "55" }}>
      WRAP<span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARR</span>
    </h1>
    <p className="s2" style={{ fontSize: 16, color: "rgba(255,255,255,.42)", margin: "14px 0 4px" }}>Bienvenue, <span style={{ color: "white", fontWeight: 600 }}>{userName}</span></p>
    <p className="s3" style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginBottom: 34, fontFamily: "JetBrains Mono,monospace" }}>Ton annee {year}<span style={{ animation: "blink-c 1s step-end infinite" }}>|</span></p>
    <button className="s4" onClick={onStart} style={{ padding: "14px 42px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 15, fontWeight: 800, boxShadow: "0 0 70px " + accent + "55" }}>Decouvrir →</button>
  </div>
}
