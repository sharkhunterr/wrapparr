import { useEffect, useRef } from "react"

export default function Bioluminescence() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const orbs = Array.from({ length: 20 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
      size: 3 + Math.random() * 8, phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      color: Math.random() > 0.6 ? "#00ffcc" : Math.random() > 0.5 ? "#0088ff" : "#00ccff",
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (const o of orbs) {
        o.phase += o.speed
        o.x += o.vx + Math.sin(o.phase) * 0.3
        o.y += o.vy + Math.cos(o.phase * 0.7) * 0.2
        if (o.x < -30) o.x = c.width + 30
        if (o.x > c.width + 30) o.x = -30
        if (o.y < -30) o.y = c.height + 30
        if (o.y > c.height + 30) o.y = -30
        const pulse = 0.3 + Math.sin(o.phase * 2) * 0.25
        const sz = o.size * (0.8 + Math.sin(o.phase) * 0.2)
        // Outer glow
        ctx.save()
        ctx.globalAlpha = pulse * 0.08
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, sz * 4)
        grad.addColorStop(0, o.color)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(o.x, o.y, sz * 4, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        // Core
        ctx.save()
        ctx.globalAlpha = pulse * 0.4
        ctx.fillStyle = o.color
        ctx.shadowBlur = 15; ctx.shadowColor = o.color
        ctx.beginPath(); ctx.arc(o.x, o.y, sz, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />
}
