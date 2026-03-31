import { useEffect, useRef } from "react"

export default function Sabers({ intensity = 1 }) {
  const cv = useRef(null)
  const sparks = useRef([])
  // Combat state machine: idle -> approach -> clash -> retreat -> idle
  const combat = useRef({
    phase: "idle", // idle, approach, clash, retreat
    phaseEnd: 2,
    sab: [
      { ox: 0.15, oy: 0, angle: Math.PI * 0.45, targetAngle: Math.PI * 0.45, speed: 0.02 },
      { ox: 0.85, oy: 0, angle: Math.PI * 0.55, targetAngle: Math.PI * 0.55, speed: 0.02 },
    ],
    clashCount: 0,
  })
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    let time = 0
    const colors = [["#4488ff", "#aaccff"], ["#ff2020", "#ffaaaa"]]
    const opBase = 0.04 + intensity * 0.04
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      time += 1 / 60
      const st = combat.current
      const sb = st.sab
      // Phase transitions
      if (time > st.phaseEnd) {
        if (st.phase === "idle") {
          // After idling, start approaching
          st.phase = "approach"
          st.phaseEnd = time + 0.8 + Math.random() * 0.6
          // Both aim toward center for a clash
          const clashAngle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4
          sb[0].targetAngle = clashAngle - 0.05
          sb[1].targetAngle = Math.PI - clashAngle + 0.05
          sb[0].speed = 0.06 + Math.random() * 0.04
          sb[1].speed = 0.06 + Math.random() * 0.04
        } else if (st.phase === "approach") {
          st.phase = "clash"
          st.phaseEnd = time + 0.15 + Math.random() * 0.1
          st.clashCount++
        } else if (st.phase === "clash") {
          // Sometimes chain 2-3 quick clashes, sometimes retreat
          if (st.clashCount < 3 && Math.random() > 0.45) {
            st.phase = "approach"
            st.phaseEnd = time + 0.3 + Math.random() * 0.4
            const a = Math.PI * 0.25 + Math.random() * Math.PI * 0.5
            sb[0].targetAngle = a
            sb[1].targetAngle = Math.PI - a
            sb[0].speed = 0.08
            sb[1].speed = 0.08
          } else {
            st.phase = "retreat"
            st.phaseEnd = time + 0.6 + Math.random() * 0.8
            st.clashCount = 0
            // Swing wide apart
            sb[0].targetAngle = Math.PI * 0.1 + Math.random() * Math.PI * 0.25
            sb[1].targetAngle = Math.PI * 0.65 + Math.random() * Math.PI * 0.25
            sb[0].speed = 0.04
            sb[1].speed = 0.04
          }
        } else if (st.phase === "retreat") {
          st.phase = "idle"
          st.phaseEnd = time + 1.5 + Math.random() * 2.5
          // Slow random swinging
          sb[0].targetAngle = Math.PI * 0.2 + Math.random() * Math.PI * 0.3
          sb[1].targetAngle = Math.PI * 0.5 + Math.random() * Math.PI * 0.3
          sb[0].speed = 0.015
          sb[1].speed = 0.015
        }
      }
      // During idle, periodically pick new random angles
      if (st.phase === "idle" && Math.random() < 0.008) {
        const which = Math.random() > 0.5 ? 0 : 1
        sb[which].targetAngle = Math.PI * 0.15 + Math.random() * Math.PI * 0.7
      }
      // Interpolate angles
      for (const s of sb) {
        s.angle += (s.targetAngle - s.angle) * s.speed
      }
      const len = Math.max(c.width, c.height) * 0.7
      const tips = sb.map((s) => {
        const px = s.ox * c.width, py = s.oy * c.height
        return { ox: px, oy: py, tx: px + Math.cos(s.angle) * len, ty: py + Math.sin(s.angle) * len }
      })
      // Draw sabers
      for (let s = 0; s < 2; s++) {
        const { ox, oy, tx, ty } = tips[s]
        // Wide glow
        ctx.save()
        ctx.globalAlpha = opBase
        ctx.strokeStyle = colors[s][0]
        ctx.lineWidth = 28
        ctx.lineCap = "round"
        ctx.shadowBlur = 60
        ctx.shadowColor = colors[s][0]
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.restore()
        // Core
        ctx.save()
        ctx.globalAlpha = opBase * 2
        ctx.strokeStyle = colors[s][1]
        ctx.lineWidth = 4
        ctx.lineCap = "round"
        ctx.shadowBlur = 18
        ctx.shadowColor = colors[s][0]
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.restore()
      }
      // Check intersection -> sparks
      const dx = tips[0].tx - tips[1].tx, dy = tips[0].ty - tips[1].ty
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 80) {
        const mx = (tips[0].tx + tips[1].tx) / 2, my = (tips[0].ty + tips[1].ty) / 2
        const sparkCount = Math.max(1, Math.round(8 * (1 - dist / 80)))
        for (let i = 0; i < sparkCount; i++) {
          const a = Math.random() * Math.PI * 2
          const spd = 3 + Math.random() * 7
          sparks.current.push({
            x: mx + (Math.random() - 0.5) * 10, y: my + (Math.random() - 0.5) * 10,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
            life: 1, color: Math.random() > 0.5 ? colors[0][1] : colors[1][1],
            size: 1 + Math.random() * 2,
          })
        }
      }
      // Draw sparks
      sparks.current = sparks.current.filter(p => p.life > 0.01)
      for (const p of sparks.current) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.98; p.life -= 0.025; p.size *= 0.985
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life * 0.8)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8; ctx.shadowColor = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.2, p.size), 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [intensity])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}
