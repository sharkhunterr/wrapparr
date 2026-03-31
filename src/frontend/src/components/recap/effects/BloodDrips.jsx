import { useRef } from "react"

export default function BloodDrips({ accent }) {
  const drips = useRef(Array.from({ length: 8 }, () => ({
    x: 5 + Math.random() * 90,
    width: 3 + Math.random() * 6,
    height: 40 + Math.random() * 120,
    delay: Math.random() * 15,
    dur: 6 + Math.random() * 8,
    bulge: 4 + Math.random() * 8,
  }))).current
  const color = accent || "#ff0033"
  return <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 3, pointerEvents: "none", height: "100vh", overflow: "hidden" }}>
    <style>{`@keyframes th-drip{0%{transform:translateY(-100%);opacity:0}5%{opacity:0.4}80%{opacity:0.3}100%{transform:translateY(100vh);opacity:0}}`}</style>
    {drips.map((d, i) => (
      <div key={i} style={{
        position: "absolute", left: d.x + "%", top: 0,
        width: d.width, display: "flex", flexDirection: "column", alignItems: "center",
        animation: `th-drip ${d.dur}s ease-in ${d.delay}s infinite`,
        opacity: 0,
      }}>
        {/* Drip trail */}
        <div style={{
          width: d.width * 0.6, height: d.height,
          background: `linear-gradient(to bottom, ${color}50, ${color}30, transparent)`,
          borderRadius: "0 0 2px 2px",
        }} />
        {/* Drip bulge at bottom */}
        <div style={{
          width: d.bulge, height: d.bulge * 1.2,
          borderRadius: "40% 40% 50% 50%",
          background: color + "40",
          marginTop: -2,
          boxShadow: `0 2px 6px ${color}20`,
        }} />
      </div>
    ))}
  </div>
}
