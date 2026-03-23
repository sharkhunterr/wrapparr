import { useState, useEffect, useRef } from "react"

const DEFAULT_BRACKETS = [
  { min: 0, max: 4, label: "Navet", emoji: "🥬" },
  { min: 4, max: 6, label: "Passable", emoji: "😐" },
  { min: 6, max: 7, label: "Bon", emoji: "👍" },
  { min: 7, max: 8, label: "Tres bon", emoji: "🎬" },
  { min: 8, max: 10, label: "Excellent", emoji: "🏆" },
]

// Interpolate between two hex colors
function lerpColor(a, b, t) {
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)]
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)]
  return "#" + pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, "0")).join("")
}

function getBracket(rating, brackets) {
  return brackets.find((b) => rating >= b.min && rating < b.max) || brackets[brackets.length - 1]
}

// Semi-circular gauge SVG using strokeDasharray for smooth animation
function Gauge({ value, max = 10, accent, animated, size = 200 }) {
  const cx = size / 2
  const cy = size / 2 + 10
  const r = size / 2 - 18
  const halfCircumference = Math.PI * r
  const fillPct = Math.min(value / max, 1)
  const dashOffset = animated ? halfCircumference * (1 - fillPct) : halfCircumference

  // Counter animation
  const [displayVal, setDisplayVal] = useState(0)
  const rafRef = useRef(null)
  useEffect(() => {
    if (!animated) return
    const start = performance.now()
    const dur = 1800
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplayVal(eased * value)
      if (p < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animated, value])

  // Build semi-circle path (left to right)
  const path = `M ${cx - r} ${cy} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`

  return (
    <svg width={size} height={size / 2 + 30} viewBox={`0 0 ${size} ${size / 2 + 30}`} style={{ display: "block", margin: "0 auto" }}>
      {/* Background arc */}
      <path d={path} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} strokeLinecap="round" />
      {/* Tick marks */}
      {Array.from({ length: 11 }, (_, i) => {
        const angle = Math.PI - (i / max) * Math.PI
        const x1 = cx + (r - 12) * Math.cos(angle)
        const y1 = cy - (r - 12) * Math.sin(angle)
        const x2 = cx + (r + 12) * Math.cos(angle)
        const y2 = cy - (r + 12) * Math.sin(angle)
        const lx = cx + (r + 22) * Math.cos(angle)
        const ly = cy - (r + 22) * Math.sin(angle)
        return (
          <g key={i}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.2)" fontSize={8} fontFamily="JetBrains Mono,monospace">{i}</text>
          </g>
        )
      })}
      {/* Colored arc with dash animation */}
      <path
        d={path}
        fill="none" stroke={accent} strokeWidth={14} strokeLinecap="round"
        strokeDasharray={halfCircumference}
        strokeDashoffset={dashOffset}
        style={{ filter: `drop-shadow(0 0 8px ${accent}60)`, transition: "stroke-dashoffset 1.8s cubic-bezier(0.25,0.46,0.45,0.94)" }}
      />
      {/* Center value */}
      <text x={cx} y={cy - 18} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={38} fontWeight={800} fontFamily="Nunito,sans-serif"
        style={{ opacity: animated ? 1 : 0, transition: "opacity 0.4s ease 0.3s" }}
      >
        {displayVal.toFixed(1)}
      </text>
      <text x={cx} y={cy + 6} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.3)" fontSize={10} fontFamily="JetBrains Mono,monospace">
        / {max}
      </text>
    </svg>
  )
}

export default function RatingsSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 10000
  const rawBrackets = config.brackets || DEFAULT_BRACKETS
  // Generate bracket colors: gradient from muted to accent
  const brackets = rawBrackets.map((b, i) => ({
    ...b,
    color: b.color || lerpColor("#555555", accent, i / Math.max(1, rawBrackets.length - 1)),
  }))
  const ratings = data?.extra?.ratings || []

  const [phase, setPhase] = useState(0) // 0=idle, 1=gauge, 2=bars, 3=done

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 400))
    t.push(setTimeout(() => setPhase(2), 400 + animSpeed * 0.3))
    t.push(setTimeout(() => setPhase(3), 400 + animSpeed * 0.7))
    return () => t.forEach(clearTimeout)
  }, [animSpeed])

  if (!ratings.length) return null

  // Compute average
  const avg = ratings.reduce((s, r) => s + r.r, 0) / ratings.length

  // Build bracket distribution
  const distribution = brackets.map((b) => {
    const films = ratings.filter((r) => r.r >= b.min && r.r < (b.max === 10 ? 10.1 : b.max))
    return { ...b, count: films.length, films }
  })
  const maxCount = Math.max(1, ...distribution.map((d) => d.count))

  // Find dominant bracket for the average
  const avgBracket = getBracket(avg, brackets)

  const gaugeAnimated = phase >= 1
  const barsVisible = phase >= 2
  const done = phase >= 3

  return (
    <div style={{ maxWidth: 460, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes notes <span style={{ color: accent }}>cinema</span>
        </h2>
      </div>

      {/* Gauge */}
      <Gauge value={avg} accent={accent} animated={gaugeAnimated} />

      {/* Profile badge */}
      {gaugeAnimated && (
        <div style={{
          textAlign: "center", marginTop: -4, marginBottom: 14,
          animation: "slide-up 0.5s ease 0.6s both",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20,
            background: accent + "12", border: "1px solid " + accent + "30",
            fontSize: 12, fontWeight: 700, color: accent,
          }}>
            {avgBracket.emoji} {avgBracket.label}
          </span>
        </div>
      )}

      {/* Distribution bars */}
      {barsVisible && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {distribution.map((b, i) => {
            const pct = (b.count / maxCount) * 100
            const delay = i * 0.12
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 8,
                animation: "slide-up 0.4s ease " + delay + "s both",
              }}>
                <div style={{ width: 24, textAlign: "center", fontSize: 14 }}>{b.emoji}</div>
                <div style={{ width: 60, fontSize: 10, color: "rgba(255,255,255,0.5)", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {b.min}-{b.max}
                </div>
                <div style={{ flex: 1, height: 18, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    background: `linear-gradient(90deg, ${b.color}90, ${b.color})`,
                    width: done ? pct + "%" : "0%",
                    transition: "width 0.8s cubic-bezier(0.25,0.46,0.45,0.94) " + delay + "s",
                    boxShadow: b.count > 0 ? `0 0 8px ${b.color}30` : "none",
                  }} />
                  {done && b.count > 0 && (
                    <div style={{
                      position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                      fontSize: 9, fontWeight: 700, color: "white",
                      fontFamily: "JetBrains Mono,monospace",
                      textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                    }}>
                      {b.count} film{b.count > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Best & worst films */}
      {done && ratings.length >= 2 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, animation: "slide-up 0.4s ease 0.3s both" }}>
          <div style={{
            flex: 1, padding: "8px 10px", borderRadius: 10, textAlign: "center",
            background: accent + "0a", border: "1px solid " + accent + "25",
          }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>Meilleure note</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>{ratings[0].r}/10</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ratings[0].t}</div>
          </div>
          <div style={{
            flex: 1, padding: "8px 10px", borderRadius: 10, textAlign: "center",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 2 }}>Pire note</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{ratings[ratings.length - 1].r}/10</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ratings[ratings.length - 1].t}</div>
          </div>
        </div>
      )}

      {/* Summary */}
      {done && (
        <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          {ratings.length} films notes — moyenne <span style={{ color: accent, fontWeight: 700 }}>{avg.toFixed(1)}</span>/10
        </div>
      )}
    </div>
  )
}
