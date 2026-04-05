import { useLabels } from "../ThemeContext"

export default function IntroSlide({ accent, userName, year, onStart, hasComparison }) {
  const L = useLabels()

  const handleStart = () => {
    // Request fullscreen
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    // Go to next slide
    if (onStart) onStart()
  }

  return <div style={{ textAlign: "center", maxWidth: "clamp(300px, 80vw, 400px)", width: "100%" }}>
    <div style={{ position: "relative", width: "clamp(80px, 22vw, 130px)", height: "clamp(80px, 22vw, 130px)", margin: "0 auto clamp(16px, 4vw, 26px)" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid " + accent, animation: "pulse-ring 3s ease-out " + (i * 0.8) + "s infinite" }} />)}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 40px " + accent + "90)" }}>
        <img src="/icon.svg" alt="Wrapparr" style={{ width: "55%", height: "55%" }} />
      </div>
    </div>
    <div className="s0" style={{ fontSize: 9, color: accent, letterSpacing: ".35em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textTransform: "uppercase" }}>{L.brand} · RECAP ANNUEL</div>
    <h1 className="s1" style={{ fontSize: "clamp(32px, 10vw, 72px)", fontWeight: 800, color: "var(--th-text, white)", lineHeight: 0.88, margin: "10px 0 6px", textShadow: "0 0 120px " + accent + "55" }}>
      WRAP<span style={{ color: accent }}>PARR</span>
    </h1>
    <p className="s2" style={{ fontSize: 16, color: "var(--th-text-secondary, rgba(255,255,255,.42))", margin: "14px 0 4px" }}>Bienvenue, <span style={{ color: "var(--th-text, white)", fontWeight: 600 }}>{userName}</span></p>
    <p className="s3" style={{ fontSize: 12, color: "var(--th-text-faint, rgba(255,255,255,.2))", marginBottom: 34, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>Ton année {year}<span style={{ animation: "blink-c 1s step-end infinite" }}>|</span></p>
    <button className="s4" onClick={handleStart} style={{ padding: "14px 42px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 15, fontWeight: 800, boxShadow: "0 0 70px " + accent + "55" }}>Découvrir →</button>
  </div>
}
