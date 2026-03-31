import { useState, useEffect } from "react"

export default function VhsTracking() {
  const [lines, setLines] = useState([])
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.7) {
        setLines(Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => ({
          y: Math.random() * 100, h: 2 + Math.random() * 6, offset: (Math.random() - 0.5) * 8,
        })))
        setTimeout(() => setLines([]), 80 + Math.random() * 120)
      }
    }, 500 + Math.random() * 1500)
    return () => clearInterval(id)
  }, [])
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 47, overflow: "hidden" }}>
    {lines.map((l, i) => (
      <div key={i} style={{
        position: "absolute", left: 0, right: 0, top: l.y + "%", height: l.h,
        background: "rgba(255,255,255,0.04)", transform: `translateX(${l.offset}px)`,
        boxShadow: "0 0 10px rgba(255,255,255,0.03)",
      }} />
    ))}
  </div>
}
