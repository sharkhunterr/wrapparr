import { useRef } from "react"

export default function AbyssBubbles() {
  const items = useRef(Array.from({ length: 18 }, () => ({
    x: Math.random() * 100, size: 2 + Math.random() * 5,
    dur: 8 + Math.random() * 14, delay: Math.random() * 10,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
    <style>{`@keyframes th-abubble{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:0.15}50%{opacity:0.1}100%{transform:translateY(-110vh) scale(0.5);opacity:0}}`}</style>
    {items.map((b, i) => (
      <div key={i} style={{
        position: "absolute", left: b.x + "%", bottom: -10,
        width: b.size, height: b.size, borderRadius: "50%",
        border: "1px solid rgba(0,180,255,0.15)",
        animation: `th-abubble ${b.dur}s ease-in ${b.delay}s infinite`,
        opacity: 0,
      }} />
    ))}
  </div>
}
