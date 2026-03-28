import { useLabels } from "../ThemeContext"

export default function CategorySlide({ accent, icon, label, sub }) {
  const L = useLabels()
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 10, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% 50%," + accent + "18 0%,transparent 70%)", animation: "cat-glow 3s ease-in-out infinite" }} />
      <div className="cat-bar" style={{ position: "absolute", top: "22%", left: "5%", right: "5%", height: 1, background: "linear-gradient(90deg,transparent," + accent + "60," + accent + "90," + accent + "60,transparent)", animation: "cat-bar-in 1s ease .3s both" }} />
      <div style={{ fontSize: "clamp(48px, 14vw, 100px)", marginBottom: 18, filter: "drop-shadow(0 0 48px " + accent + "90)", animation: "cat-icon-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>{icon}</div>
      <h1 style={{ fontSize: "clamp(28px, 10vw, 76px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 10, textAlign: "center", textShadow: "0 0 90px " + accent + "70", animation: "cat-title-in 0.9s ease 0.5s both" }}>{label}</h1>
      <div style={{ fontSize: "clamp(12px, 3vw, 15px)", color: accent + "cc", fontWeight: 300, letterSpacing: "0.06em", textAlign: "center", animation: "slide-up .6s ease .9s both" }}>{sub}</div>
      <div className="cat-bar" style={{ position: "absolute", bottom: "22%", left: "5%", right: "5%", height: 1, background: "linear-gradient(90deg,transparent," + accent + "60," + accent + "90," + accent + "60,transparent)", animation: "cat-bar-in 1s ease .5s both" }} />
    </div>
  )
}
