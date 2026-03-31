import { useRef } from "react"

export default function StarStreaks() {
  const streaks = useRef(Array.from({ length: 14 }, () => ({
    x: 5 + Math.random() * 90,
    len: 50 + Math.random() * 90,
    dur: 1.2 + Math.random() * 2.5,
    delay: Math.random() * 10,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
    <style>{`@keyframes th-shoot{0%{transform:translateY(-10%);opacity:0}8%{opacity:1}80%{opacity:0.5}100%{transform:translateY(115vh);opacity:0}}`}</style>
    {streaks.map((s, i) => (
      <div key={i} style={{
        position: "absolute", left: s.x + "%", top: 0,
        width: 1.5, height: s.len, borderRadius: 1,
        background: "linear-gradient(to bottom, transparent 0%, rgba(200,230,255,0.5) 70%, rgba(255,255,255,0.8) 100%)",
        boxShadow: "0 0 6px rgba(200,230,255,0.4)",
        animation: `th-shoot ${s.dur}s linear ${s.delay}s infinite`,
        opacity: 0,
      }} />
    ))}
  </div>
}
