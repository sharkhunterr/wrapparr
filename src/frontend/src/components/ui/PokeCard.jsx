import { useRef, useState } from "react"

const CC = ["#E5A00D", "#34d399", "#c084fc", "#f87171", "#60a5fa", "#fb923c", "#fff", "#fbbf24", "#f472b6"]

export default function PokeCard({ children, accent, style }) {
  const ref = useRef(null)
  const [m, setM] = useState({ x: 50, y: 50, on: false })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    setM((p) => ({ ...p, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }))
  }
  const onEnter = () => setM((p) => ({ ...p, on: true }))
  const onLeave = () => setM((p) => ({ ...p, on: false }))

  const tX = ((m.y - 50) / 50) * -8, tY = ((m.x - 50) / 50) * 9, hue = (m.x / 100) * 360

  return (
    <div ref={ref} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{
        position: "relative", overflow: "hidden", borderRadius: 14,
        border: `1px solid rgba(255,255,255,${m.on ? 0.24 : 0.07})`,
        background: "rgba(255,255,255,0.04)",
        transform: m.on ? `perspective(700px) rotateX(${tX}deg) rotateY(${tY}deg) scale(1.04)` : "perspective(700px) scale(1)",
        transition: m.on ? "transform 0.07s,box-shadow 0.1s" : "transform 0.5s ease,box-shadow 0.3s",
        boxShadow: m.on ? `0 24px 65px ${accent}45,0 0 0 1px ${accent}30` : `0 4px 18px ${accent}18`,
        ...style,
      }}>
      <div style={{
        position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", borderRadius: "inherit",
        background: m.on
          ? `linear-gradient(${hue}deg,rgba(255,0,80,.12) 0%,rgba(255,165,0,.12) 16%,rgba(255,240,0,.12) 32%,rgba(0,255,120,.12) 48%,rgba(0,200,255,.12) 64%,rgba(120,0,255,.12) 80%,rgba(255,0,200,.12) 100%)`
          : "linear-gradient(135deg,rgba(255,0,80,.04) 0%,rgba(0,200,255,.04) 50%,rgba(180,0,255,.04) 100%)",
        backgroundSize: "200% 200%", animation: m.on ? "none" : "holo-idle 6s ease infinite", mixBlendMode: "screen",
      }} />
      {m.on && <div style={{
        position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", borderRadius: "inherit",
        background: `radial-gradient(ellipse 55% 45% at ${m.x}% ${m.y}%,rgba(255,230,100,.28) 0%,rgba(200,80,255,.18) 35%,rgba(0,200,255,.14) 60%,transparent 78%)`,
        mixBlendMode: "screen",
      }} />}
      <div style={{ position: "relative", zIndex: 6 }}>{children}</div>
    </div>
  )
}
