import { useEffect, useRef } from "react"

const FW_P = [
  ["#E5A00D", "#fb923c", "#fbbf24"],
  ["#34d399", "#60a5fa", "#a78bfa"],
  ["#f87171", "#c084fc", "#fb923c"],
  ["#fff", "#60a5fa", "#a78bfa"],
]

export default function Fireworks({ active }) {
  const cv = useRef(null)
  const pts = useRef([])
  const raf = useRef(null)

  useEffect(() => {
    if (!active) return
    const c = cv.current
    const ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)

    const launch = () => {
      const pal = FW_P[Math.floor(Math.random() * FW_P.length)]
      const x = c.width * (0.15 + Math.random() * 0.7), y = c.height * (0.05 + Math.random() * 0.5)
      const count = 60 + Math.floor(Math.random() * 60), type = Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4
        const speed = (3.5 + Math.random() * 2) * (type === 1 ? 0.65 : 1)
        pts.current.push({
          x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          alpha: 1, decay: 0.011 + Math.random() * 0.009, size: 2.2 + Math.random() * 2.4,
          color: pal[Math.floor(Math.random() * pal.length)], gravity: type === 0 ? 0.065 : 0.042,
        })
      }
    }

    let last = 0
    const draw = (now) => {
      ctx.fillStyle = "rgba(0,0,0,0.075)"; ctx.fillRect(0, 0, c.width, c.height)
      if (now - last > 650) { launch(); last = now }
      pts.current = pts.current.filter((p) => p.alpha > 0.012)
      pts.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= 0.97; p.alpha -= p.decay; p.size *= 0.977
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha); ctx.fillStyle = p.color
        ctx.shadowBlur = 10; ctx.shadowColor = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    launch(); setTimeout(launch, 180); setTimeout(launch, 420)

    return () => {
      cancelAnimationFrame(raf.current)
      window.removeEventListener("resize", rz)
      ctx.clearRect(0, 0, c.width, c.height)
      pts.current = []
    }
  }, [active])

  return <canvas ref={cv} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }} />
}
