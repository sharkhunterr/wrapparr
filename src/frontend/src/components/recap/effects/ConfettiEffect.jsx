import { useRef } from "react"

const CC = ["#E5A00D", "#34d399", "#c084fc", "#f87171", "#60a5fa", "#fb923c", "#fff", "#fbbf24", "#f472b6"]

export default function ConfettiEffect() {
  const p = useRef(Array.from({ length: 80 }, () => ({ x: Math.random() * 100, dur: 2 + Math.random() * 3.5, delay: Math.random() * 4, size: 4 + Math.random() * 9, color: CC[Math.floor(Math.random() * CC.length)], round: Math.random() > 0.5 }))).current
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4, overflow: "hidden" }}>
    {p.map((c, i) => <div key={i} style={{ position: "absolute", left: `${c.x}%`, top: "-20px", width: c.size, height: c.size * (c.round ? 1 : 0.38), background: c.color, borderRadius: c.round ? "50%" : 2, animation: `confetti-f ${c.dur}s ease-in ${c.delay}s infinite` }} />)}
  </div>
}
