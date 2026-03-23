import Orbs from "../ambient/Orbs"
import Stars from "../ambient/Stars"

export default function IntroSlide({ accent = "#E5A00D", bg = "#05050e", userName = "", year = 2024 }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Orbs accent={accent} />
      <Stars />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <div style={{ fontSize: 14, color: `${accent}cc`, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12, animation: "slide-up .5s ease .1s both" }}>
          XENOCLOUD · {year}
        </div>
        <h1 style={{ fontSize: 72, fontWeight: 800, fontFamily: "Nunito,sans-serif", color: "white", lineHeight: 0.95, letterSpacing: "-0.02em", marginBottom: 16, animation: "slide-up .5s ease .2s both" }}>
          Ton année<br /><span style={{ color: accent }}>en replay</span>
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif", animation: "slide-up .5s ease .4s both" }}>
          {userName ? `Prêt, ${userName} ?` : "C'est parti"} — Scroll pour commencer ↓
        </p>
      </div>
    </div>
  )
}
