import { useState, useEffect } from "react"

function useCounter(target, active, dur = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) { setV(0); return }
    let c = 0; const inc = target / (dur / 16)
    const t = setInterval(() => {
      c += inc; if (c >= target) { setV(target); clearInterval(t) } else setV(Math.floor(c))
    }, 16)
    return () => clearInterval(t)
  }, [active, target, dur])
  return v
}

export default function BigNum({ value, suffix = "", accent, active = true, delay = 0.05 }) {
  const v = useCounter(value, active)
  return (
    <div style={{
      fontSize: 56, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: "Nunito,sans-serif",
      letterSpacing: "-0.02em",
      animation: `cpop .55s ease ${delay}s both, flash-n .9s ease ${delay + 0.45}s both`,
    }}>
      {v.toLocaleString("fr-FR")}{suffix}
    </div>
  )
}

export { useCounter }
