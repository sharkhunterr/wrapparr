import { useRef } from "react"

export default function Spores() {
  const items = useRef(Array.from({ length: 25 }, () => ({
    x: Math.random() * 100, size: 2 + Math.random() * 5,
    dur: 8 + Math.random() * 12, delay: Math.random() * 8,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
    {items.map((s, i) => (
      <div key={i} className="th-spore" style={{
        left: s.x + "%", bottom: -20, width: s.size, height: s.size,
        animationDuration: s.dur + "s", animationDelay: s.delay + "s",
      }} />
    ))}
  </div>
}
