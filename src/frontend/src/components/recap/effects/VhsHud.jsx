import { useState, useEffect } from "react"

export default function VhsHud() {
  const [time, setTime] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTime(t => t + 1), 1000)
    return () => clearInterval(id)
  }, [])
  const h = String(Math.floor(time / 3600)).padStart(2, "0")
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, "0")
  const s = String(time % 60).padStart(2, "0")
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 201, fontFamily: "'Share Tech Mono',monospace" }}>
    <div style={{ position: "absolute", top: 36, left: 16, fontSize: 10, color: "rgba(255,255,255,0.15)", letterSpacing: "0.15em" }}>CH-03 · SP · HI-FI STEREO</div>
    <div style={{ position: "absolute", top: 36, right: 80, fontSize: 12, color: "rgba(255,255,255,0.18)", letterSpacing: "0.15em" }}>{h}:{m}:{s}</div>
    <div style={{ position: "absolute", bottom: 50, right: 16, display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,0,0,0.5)" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#ff0000", animation: "th-blink-cursor 1s step-end infinite" }} />REC
    </div>
    <div style={{ position: "absolute", bottom: 50, left: 16, fontSize: 13, color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em" }}>▶ PLAY</div>
    <div style={{ position: "absolute", bottom: 30, left: 16, fontSize: 8, color: "rgba(255,255,255,0.08)", letterSpacing: "0.1em" }}>WRAPPARR HOME VIDEO</div>
  </div>
}
