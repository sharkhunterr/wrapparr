import { useEffect, useRef } from "react"

export default function ChalkDust({ fade }) {
  const cv = useRef(null)
  const eraserX = useRef(-200)
  const prevFade = useRef(false)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const chalkColors = ["#e8e8d0", "#d0d0c0", "#ffccaa", "#aaddcc", "#ddbbee", "#ffddaa"]
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      if (fade && !prevFade.current) eraserX.current = -200
      prevFade.current = fade
      if (fade) {
        eraserX.current += c.width * 0.08
        const ew = 140, eh = c.height * 0.7
        const ex = eraserX.current
        const ey = c.height * 0.15
        // Eraser body
        ctx.save()
        ctx.globalAlpha = 0.2
        ctx.fillStyle = "rgba(50,70,50,0.9)"
        ctx.fillRect(ex, ey, ew, eh)
        // Smear traces behind eraser
        for (let i = 0; i < 12; i++) {
          const col = chalkColors[Math.floor(Math.random() * chalkColors.length)]
          ctx.globalAlpha = 0.03 + Math.random() * 0.03
          ctx.fillStyle = col
          const ty = ey + Math.random() * eh
          ctx.fillRect(ex - 20 - Math.random() * 60, ty, 30 + Math.random() * 50, 1.5 + Math.random() * 2)
        }
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [fade])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 48 }} />
}
