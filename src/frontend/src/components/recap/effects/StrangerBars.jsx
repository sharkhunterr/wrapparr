export default function StrangerBars() {
  const barCount = 4
  return <>
    {/* Above title -- closer to center */}
    <div style={{ position: "fixed", left: 0, right: 0, top: "32%", zIndex: 3, pointerEvents: "none", display: "flex", flexDirection: "column-reverse", gap: 3, alignItems: "center" }}>
      {Array.from({ length: barCount }, (_, i) => (
        <div key={i} className="th-st-bar" style={{ animationDelay: (i * 0.5) + "s", opacity: 0.25 + (1 - i / barCount) * 0.35 }} />
      ))}
    </div>
    {/* Below title -- closer to center */}
    <div style={{ position: "fixed", left: 0, right: 0, bottom: "32%", zIndex: 3, pointerEvents: "none", display: "flex", flexDirection: "column", gap: 3, alignItems: "center" }}>
      {Array.from({ length: barCount }, (_, i) => (
        <div key={i} className="th-st-bar" style={{ animationDelay: (i * 0.5) + "s", opacity: 0.25 + (1 - i / barCount) * 0.35 }} />
      ))}
    </div>
  </>
}
