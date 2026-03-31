import { useRef } from "react"

export default function MatrixRain() {
  const cols = useRef(Array.from({ length: 35 }, (_, i) => ({
    left: (i / 35) * 100 + Math.random() * 2,
    dur: 4 + Math.random() * 8,
    delay: Math.random() * 6,
    chars: Array.from({ length: 12 + Math.floor(Math.random() * 18) }, () =>
      String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
    ).join(""),
    size: 10 + Math.random() * 6,
  }))).current
  return <div className="th-matrix-rain">
    {cols.map((c, i) => (
      <div key={i} className="th-matrix-col" style={{
        left: c.left + "%", fontSize: c.size,
        animationDuration: c.dur + "s", animationDelay: c.delay + "s",
      }}>{c.chars}</div>
    ))}
  </div>
}
