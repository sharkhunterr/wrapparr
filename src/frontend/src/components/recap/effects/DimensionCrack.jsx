import { useRef } from "react"

export default function DimensionCrack() {
  // Generate organic branching crack path
  const crack = useRef(() => {
    const segs = []
    let x = 50, y = 0
    const mainLen = 18 + Math.floor(Math.random() * 8)
    for (let i = 0; i < mainLen; i++) {
      const nx = x + (Math.random() - 0.5) * 14
      const ny = y + 3.5 + Math.random() * 3
      segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: 5 - (i / mainLen) * 3, main: true })
      // Branches
      if (Math.random() > 0.45 && i > 1) {
        const bdir = Math.random() > 0.5 ? 1 : -1
        let bx = nx, by = ny
        const blen = 2 + Math.floor(Math.random() * 5)
        for (let j = 0; j < blen; j++) {
          const bnx = bx + bdir * (3 + Math.random() * 8)
          const bny = by + 1.5 + Math.random() * 3
          segs.push({ x1: bx, y1: by, x2: bnx, y2: bny, w: 3 - (j / blen) * 2, main: false })
          bx = bnx; by = bny
        }
      }
      x = nx; y = ny
    }
    return segs
  }).current()

  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, animation: "th-crack-anim 15s ease-in-out infinite", opacity: 0 }}>
    <style>{`
      @keyframes th-crack-anim{0%,82%,100%{opacity:0}84%{opacity:0.9}86%{opacity:0.3}87%{opacity:0.85}89%{opacity:0.5}91%{opacity:0}}
    `}</style>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: "blur(0.3px)" }}>
      {/* Wide glow layer -- deep red */}
      {crack.filter(s => s.main).map((s, i) => (
        <line key={"g2" + i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="rgba(200,0,0,0.1)" strokeWidth={s.w * 3} strokeLinecap="round"
          style={{ filter: "blur(8px)" }}
        />
      ))}
      {/* Medium glow -- red */}
      {crack.map((s, i) => (
        <line key={"g" + i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={s.main ? "rgba(220,20,20,0.25)" : "rgba(200,40,30,0.15)"}
          strokeWidth={s.w * 1.5} strokeLinecap="round"
          style={{ filter: "blur(3px)" }}
        />
      ))}
      {/* Core bright line -- hot red/white */}
      {crack.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={s.main ? "rgba(255,180,160,0.85)" : "rgba(255,80,60,0.5)"}
          strokeWidth={s.w * 0.4} strokeLinecap="round"
        />
      ))}
    </svg>
  </div>
}
