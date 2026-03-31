import { useEffect, useRef } from "react"

export default function Snow() {
  const cv = useRef(null)
  const flakes = useRef([])
  const sparkles = useRef([])
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    for (let i = 0; i < 50; i++) {
      flakes.current.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        r: 0.8 + Math.random() * 2, vx: (Math.random() - 0.5) * 0.4,
        vy: 0.3 + Math.random() * 1, wobble: Math.random() * Math.PI * 2,
      })
    }
    // Magic sparkles -- golden dust floating
    for (let i = 0; i < 25; i++) {
      sparkles.current.push({
        x: Math.random() * c.width, y: Math.random() * c.height,
        phase: Math.random() * Math.PI * 2, speed: 0.015 + Math.random() * 0.02,
        size: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.15,
      })
    }
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      // Snow
      for (const f of flakes.current) {
        f.wobble += 0.008
        f.x += f.vx + Math.sin(f.wobble) * 0.25
        f.y += f.vy
        if (f.y > c.height) { f.y = -5; f.x = Math.random() * c.width }
        if (f.x < 0) f.x = c.width
        if (f.x > c.width) f.x = 0
        ctx.save()
        ctx.globalAlpha = 0.15 + f.r * 0.08
        ctx.fillStyle = "#d0d8e8"
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      // Magic sparkles -- golden dust
      for (const s of sparkles.current) {
        s.phase += s.speed
        s.x += s.vx + Math.sin(s.phase * 3) * 0.3
        s.y += s.vy + Math.cos(s.phase * 2) * 0.2
        if (s.y < -10 || s.y > c.height + 10) { s.y = Math.random() * c.height; s.x = Math.random() * c.width }
        if (s.x < -10 || s.x > c.width + 10) { s.x = Math.random() * c.width }
        const pulse = 0.3 + Math.sin(s.phase * 5) * 0.3
        const sz = s.size * (0.6 + Math.sin(s.phase * 2) * 0.4)
        // Star shape
        ctx.save()
        ctx.globalAlpha = pulse * 0.5
        ctx.fillStyle = "#ffdd88"
        ctx.shadowBlur = 8; ctx.shadowColor = "#ffcc44"
        ctx.translate(s.x, s.y)
        ctx.rotate(s.phase)
        ctx.beginPath()
        for (let p = 0; p < 4; p++) {
          const a = (p / 4) * Math.PI * 2 - Math.PI / 2
          ctx.lineTo(Math.cos(a) * sz * 1.5, Math.sin(a) * sz * 1.5)
          const a2 = ((p + 0.5) / 4) * Math.PI * 2 - Math.PI / 2
          ctx.lineTo(Math.cos(a2) * sz * 0.5, Math.sin(a2) * sz * 0.5)
        }
        ctx.closePath(); ctx.fill()
        ctx.restore()
      }
      // Soft accumulation
      ctx.save()
      ctx.globalAlpha = 0.03
      ctx.fillStyle = "#c0d0e0"
      ctx.beginPath(); ctx.moveTo(0, c.height)
      for (let x = 0; x <= c.width; x += 30) {
        ctx.lineTo(x, c.height - 4 - Math.sin(x * 0.015) * 3)
      }
      ctx.lineTo(c.width, c.height); ctx.closePath(); ctx.fill()
      ctx.restore()
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}
