import { useRef } from "react"

export default function Stars() {
  const s = useRef(
    Array.from({ length: 50 }, () => ({
      x: Math.random() * 100, y: Math.random() * 100,
      sz: 0.8 + Math.random() * 2.2, d: Math.random() * 7, dur: 2 + Math.random() * 4,
    }))
  ).current

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {s.map((p, i) => (
        <div key={i} style={{
          position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
          width: p.sz, height: p.sz, borderRadius: "50%", background: "white", opacity: 0,
          animation: `star-tw ${p.dur}s ease-in-out ${p.d}s infinite`,
        }} />
      ))}
    </div>
  )
}
