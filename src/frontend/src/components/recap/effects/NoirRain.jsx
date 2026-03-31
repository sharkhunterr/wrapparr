import { useEffect, useRef } from "react"

export default function NoirRain() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const drops = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      len: 15 + Math.random() * 25, speed: 8 + Math.random() * 12,
      opacity: 0.03 + Math.random() * 0.06,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (const d of drops) {
        d.y += d.speed; d.x -= d.speed * 0.15
        if (d.y > c.height) { d.y = -d.len; d.x = Math.random() * c.width * 1.2 }
        ctx.save()
        ctx.globalAlpha = d.opacity
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - d.len * 0.15, d.y - d.len)
        ctx.stroke()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}
