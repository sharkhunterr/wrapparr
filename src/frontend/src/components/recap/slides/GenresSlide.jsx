import { useState, useEffect, useRef } from "react"
import { useComparison } from "../SharedUI"
import { useLabels } from "../ThemeContext"

// Generate a palette of colors derived from the accent
function buildPalette(accent) {
  // Parse hex to HSL, then generate variations
  const hex = accent.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  const hsl = (hue, sat, lit) => {
    sat = Math.min(1, Math.max(0, sat)); lit = Math.min(1, Math.max(0, lit))
    const c = (1 - Math.abs(2 * lit - 1)) * sat, x = c * (1 - Math.abs(((hue * 6) % 2) - 1)), m = lit - c / 2
    let r1, g1, b1
    const i = Math.floor(hue * 6) % 6
    if (i === 0) { r1 = c; g1 = x; b1 = 0 } else if (i === 1) { r1 = x; g1 = c; b1 = 0 } else if (i === 2) { r1 = 0; g1 = c; b1 = x }
    else if (i === 3) { r1 = 0; g1 = x; b1 = c } else if (i === 4) { r1 = x; g1 = 0; b1 = c } else { r1 = c; g1 = 0; b1 = x }
    return "#" + [r1 + m, g1 + m, b1 + m].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")
  }
  // Generate 8 colors by rotating hue and varying saturation/lightness
  const offsets = [0, 0.08, 0.18, 0.33, 0.48, 0.62, 0.75, 0.88]
  return offsets.map((off) => hsl((h + off) % 1, Math.min(1, s * (0.7 + off * 0.4)), Math.min(0.65, l * (0.85 + off * 0.2))))
}

export default function GenresSlide({ accent, genres = [], year, config = {}, serviceType }) {
  const L = useLabels()
  const mode = config.displayMode || "race"
  const maxGenres = config.maxGenres || 6
  const speed = config.animationSpeed || 25000
  const data = genres.slice(0, maxGenres)

  const COLORS = buildPalette(accent)

  // Comparison data — previous year genres
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.[serviceType] || comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevGenres = (prevSvc?.films?.genres || prevSvc?.genres || [])
    .filter((g) => (g.previous || 0) > 0)
    .sort((a, b) => (b.previous || 0) - (a.previous || 0))
    .slice(0, 6)

  if (!data.length) return null

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textTransform: "uppercase", marginBottom: 6 }}>{L.brand} · {year}</div>
        <h2 style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Tes genres <span style={{ color: accent }}>préférés</span>
        </h2>
      </div>

      {mode === "race" && <RaceMode data={data} accent={accent} speed={speed} config={config} colors={COLORS} />}
      {mode === "bubbles" && <BubblesMode data={data} accent={accent} speed={speed} colors={COLORS} />}
      {mode === "orbit" && <OrbitMode data={data} accent={accent} speed={speed} colors={COLORS} />}
      {mode === "podium" && <PodiumMode data={data} accent={accent} speed={speed} colors={COLORS} />}

      {/* Previous year top 6 genres */}
      {prevGenres.length > 0 && (
        <>
          <div style={{ height: 1, background: "var(--th-border-dim)", margin: "14px 0 10px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, color: "var(--th-text-dim)", textTransform: "uppercase", letterSpacing: ".05em" }}>{year - 1}</span>
            {prevGenres.map((g, i) => (
              <span key={g.n + i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: "var(--th-radius-xs)",
                background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)",
                fontSize: 9, color: "var(--th-text-tertiary)", fontWeight: i === 0 ? 600 : 400,
              }}>
                {g.n} <span style={{ fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontWeight: 700, fontSize: 8, color: "var(--th-text-muted)" }}>{g.previous}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/*
 * RACE MODE — Formula 1 style race with speed trails, engine glow,
 * smooth position swaps, checkered flag finish.
 */
// Default race commentary phrases — configurable in slide settings
const DEFAULT_RACE_PHRASES = [
  { trigger: "leader_change", phrases: ["{name} prend la tete !", "{name} depasse tout le monde !", "Incroyable, {name} passe devant !"] },
  { trigger: "last_place", phrases: ["{name} bon dernier... ca m'etonne pas", "{name} ferme la marche, courage !", "Aie, {name} est largue"] },
  { trigger: "close_race", phrases: ["Ecart minimal entre {name1} et {name2} !", "C'est serre ! {name1} et {name2} au coude a coude", "Photo finish entre {name1} et {name2} ?"] },
  { trigger: "mid_race", phrases: ["La course bat son plein !", "Tout peut encore changer !", "Les positions bougent sans arret", "Qui va l'emporter ?"] },
  { trigger: "near_end", phrases: ["Derniere ligne droite !", "On approche de la fin...", "Les jeux sont presque faits !"] },
  { trigger: "start", phrases: ["C'est parti !", "Les genres s'elancent !", "Et c'est le depart !"] },
]

function pickPhrase(phrases) {
  return phrases[Math.floor(Math.random() * phrases.length)]
}

function RaceMode({ data, accent, speed, config = {}, colors: COLORS }) {
  const max = data[0]?.v || 1
  const ROW_H = 48
  const medals = ["🥇", "🥈", "🥉"]
  const N = data.length
  const phrases = config.raceCommentary || DEFAULT_RACE_PHRASES

  // Each genre has a "score" that grows at different speeds with noise
  // Position = sorted by current score descending (highest on top)
  // Width = proportional to current score
  // Displayed count = proportional to current score

  // Pre-compute growth curves with randomness (stable)
  const [curves] = useState(() =>
    data.map((g, rank) => {
      const finalVal = g.v
      // Each genre gets a unique speed profile: random acceleration/deceleration phases
      const numPhases = 3 + Math.floor(Math.random() * 3)
      const phases = []
      for (let p = 0; p < numPhases; p++) {
        phases.push({
          start: p / numPhases,
          end: (p + 1) / numPhases,
          speed: 0.3 + Math.random() * 2.0, // relative speed multiplier
        })
      }
      return { finalVal, phases, rank }
    })
  )

  // Get interpolated score for a genre at time t (0..1)
  function getScore(curveIdx, t) {
    const curve = curves[curveIdx]
    // Base progress with easing
    let effective = 0
    for (const phase of curve.phases) {
      if (t >= phase.end) {
        effective += (phase.end - phase.start) * phase.speed
      } else if (t >= phase.start) {
        effective += (t - phase.start) * phase.speed
      }
    }
    // Normalize so at t=1 we get finalVal
    const totalSpeed = curve.phases.reduce((s, p) => s + (p.end - p.start) * p.speed, 0)
    const normalized = effective / totalSpeed
    return curve.finalVal * Math.min(1, normalized)
  }

  const [phase, setPhase] = useState(0) // 0=idle, 1=countdown, 2=racing, 3=finished
  const [countdown, setCountdown] = useState(3)
  const [progress, setProgress] = useState(0) // 0..1
  const [flashes, setFlashes] = useState([])
  const [commentary, setCommentary] = useState("")
  const flashRef = useRef(null)
  const rafRef = useRef(null)
  const startTimeRef = useRef(null)
  const lastLeaderRef = useRef(null)
  const commentaryRef = useRef(null)

  const racing = phase === 2
  const finished = phase === 3

  // Countdown + start
  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 300))
    t.push(setTimeout(() => setCountdown(2), 1100))
    t.push(setTimeout(() => setCountdown(1), 1900))
    t.push(setTimeout(() => { setPhase(2) }, 2700))
    return () => t.forEach(clearTimeout)
  }, [])

  // RAF loop for smooth animation
  useEffect(() => {
    if (phase !== 2) return
    startTimeRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startTimeRef.current
      const p = Math.min(elapsed / speed, 1)
      setProgress(p)
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        setPhase(3)
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, speed])

  // Flashes — full page
  useEffect(() => {
    if (!racing) { clearInterval(flashRef.current); return }
    const spawn = () => {
      setFlashes((f) => [...f.slice(-10), {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 2 + Math.random() * 4,
      }])
    }
    flashRef.current = setInterval(spawn, 500 + Math.random() * 700)
    return () => clearInterval(flashRef.current)
  }, [racing])

  // Compute current state from progress
  const t = finished ? 1 : progress
  const currentScores = data.map((g, i) => ({
    ...g, rank: i, color: COLORS[i % COLORS.length],
    score: getScore(i, t),
    finalVal: g.v,
  }))

  // Sort by current score descending to determine positions (highest = top = position 0)
  const sorted = [...currentScores].sort((a, b) => b.score - a.score)
  const positionMap = {}
  sorted.forEach((item, pos) => { positionMap[item.rank] = pos })

  // Commentary — react to position changes
  useEffect(() => {
    if (!racing || !sorted.length) return
    const leader = sorted[0]
    const last = sorted[sorted.length - 1]
    const p = progress

    const getPhrase = (trigger) => {
      const group = phrases.find((g) => g.trigger === trigger)
      return group ? pickPhrase(group.phrases) : ""
    }

    // Update commentary every ~2.5 seconds
    const now = Date.now()
    if (commentaryRef.current && now - commentaryRef.current < 2500) return
    commentaryRef.current = now

    let text = ""
    if (p < 0.05) {
      text = getPhrase("start")
    } else if (p > 0.85) {
      text = getPhrase("near_end")
    } else if (leader.n !== lastLeaderRef.current) {
      text = getPhrase("leader_change").replace("{name}", leader.n)
      lastLeaderRef.current = leader.n
    } else if (Math.random() < 0.3 && sorted.length >= 2) {
      const gap = sorted[0].score - sorted[1].score
      if (gap < max * 0.05) {
        text = getPhrase("close_race").replace("{name1}", sorted[0].n).replace("{name2}", sorted[1].n)
      } else {
        text = getPhrase("last_place").replace("{name}", last.n)
      }
    } else {
      text = getPhrase("mid_race")
    }
    if (text) setCommentary(text)
  }, [progress, racing, sorted])

  const items = currentScores.map((g) => ({
    ...g,
    top: positionMap[g.rank] * ROW_H,
    width: max > 0 ? (g.score / max) * 95 : 0,
    displayCount: Math.round(g.score),
  }))

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes engine-glow { 0%,100%{filter:brightness(1)} 50%{filter:brightness(1.6)} }
        @keyframes flash-burst { 0%{opacity:0.9;transform:scale(0)} 100%{opacity:0;transform:scale(4)} }
        @keyframes confetti-burst { 0%{transform:scale(0) rotate(0deg);opacity:1} 100%{transform:scale(1.5) rotate(180deg);opacity:0} }
      `}</style>

      {/* Full-page flashes */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 150, overflow: "hidden" }}>
        {flashes.map((f) => (
          <div key={f.id} style={{ position: "absolute", left: f.x + "%", top: f.y + "%", width: f.size, height: f.size, borderRadius: "50%", background: "white", animation: "flash-burst 1.2s ease-out forwards", boxShadow: "0 0 30px 12px rgba(255,255,255,0.2), 0 0 60px 25px rgba(255,255,255,0.06)" }} />
        ))}
      </div>

      {/* Status / Commentary */}
      <div style={{ textAlign: "center", marginBottom: 14, minHeight: 40 }}>
        {phase === 1 && <div style={{ fontSize: 34, fontWeight: 800, color: countdown > 1 ? "#f87171" : countdown === 1 ? "#fbbf24" : "#4ade80", animation: "cpop .4s ease both" }} key={countdown}>{countdown}</div>}
        {racing && (
          <div key={commentary} style={{ animation: "slide-up 0.3s ease both" }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 500, lineHeight: 1.4 }}>{commentary}</div>
          </div>
        )}
        {finished && <div style={{ fontSize: 9, letterSpacing: "0.2em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", color: accent, animation: "slide-up .4s ease both" }}>RESULTATS FINAUX</div>}
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: N * ROW_H }}>
        {data.map((_, i) => <div key={"l" + i} style={{ position: "absolute", left: 36, right: 0, top: i * ROW_H + ROW_H / 2, height: 1, background: "var(--th-surface-dim)" }} />)}
        {items.map((g) => {
          const isWinner = finished && g.rank === 0
          return (
            <div key={g.n} style={{
              position: "absolute", left: 0, right: 0, height: ROW_H - 6,
              top: g.top,
              display: "flex", alignItems: "center", gap: 8, padding: "0 4px",
              transition: "top 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: isWinner ? 2 : 1,
            }}>
              <div style={{ width: 26, textAlign: "center", flexShrink: 0 }}>
                {finished ? <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 7, fontSize: 10, fontWeight: 800, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", background: g.rank < 3 ? g.color + "20" : "var(--th-surface-subtle)", border: "1.5px solid " + (g.rank < 3 ? g.color + "50" : "var(--th-border-subtle)"), color: g.rank < 3 ? g.color : "var(--th-text-dim)", boxShadow: g.rank === 0 ? "0 0 10px " + g.color + "40" : "none" }}>{g.rank + 1}</span> : <span style={{ fontSize: 11, fontWeight: 700, color: (racing || finished) ? g.color : "rgba(255,255,255,0.1)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>P{positionMap[g.rank] + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: isWinner ? 700 : 500, color: isWinner ? "var(--th-text)" : "var(--th-text-secondary)" }}>{g.n}</span>
                  <span style={{ fontSize: 10, color: g.color, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", opacity: (racing || finished) ? 1 : 0.12 }}>{g.displayCount}</span>
                </div>
                <div style={{ height: 12, background: "var(--th-surface-dim)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    height: "100%", borderRadius: 6, position: "relative",
                    background: isWinner ? "linear-gradient(90deg," + g.color + "," + accent + ",#fff)" : "linear-gradient(90deg," + g.color + "15," + g.color + (finished ? "bb" : "55") + ")",
                    width: g.width + "%",
                    boxShadow: isWinner ? "0 0 20px " + g.color + "70" : racing ? "0 0 4px " + g.color + "20" : "none",
                  }}>
                    <div style={{
                      position: "absolute", right: -2, top: "50%", transform: "translateY(-50%)",
                      width: finished ? 0 : 14, height: finished ? 0 : 8, borderRadius: "2px 6px 6px 2px",
                      background: g.color, transition: "width 0.5s, height 0.5s",
                      boxShadow: racing ? "-6px 0 12px " + g.color + "80, -14px 0 24px " + g.color + "25" : "none",
                      animation: racing ? "engine-glow 0.25s ease infinite" : "none",
                    }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Finish celebration */}
      {finished && <>
        {/* Full-page continuous confetti rain */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 200, overflow: "hidden" }}>
          {[...Array(60)].map((_, i) => {
            const c = COLORS[i % COLORS.length], x = Math.random() * 100, sz = 3 + Math.random() * 7
            const dur = 2.5 + Math.random() * 4, dl = Math.random() * 3, round = Math.random() > 0.5
            return <div key={"cf" + i} style={{ position: "absolute", left: x + "%", top: -15, width: sz, height: sz * (round ? 1 : 0.38), background: c, borderRadius: round ? "50%" : 2, animation: "confetti-f " + dur + "s ease-in " + dl + "s infinite" }} />
          })}
        </div>
        {/* Firework bursts */}
        {[...Array(8)].map((_, i) => {
          const c = COLORS[i % COLORS.length], x = 10 + Math.random() * 80, y = Math.random() * 50
          return <div key={"fw" + i} style={{ position: "absolute", left: x + "%", top: y + "%", width: 6, height: 6, borderRadius: "50%", background: c, zIndex: 18, pointerEvents: "none", boxShadow: "0 0 15px 8px " + c + "50", animation: "confetti-burst " + (1 + Math.random()) + "s ease " + (0.2 + Math.random()) + "s forwards" }} />
        })}
      </>}
    </div>
  )
}

/* ═══ BUBBLES — all start small, grow fluidly to final size, bigger overlaps smaller ═══ */
function BubblesMode({ data, accent, speed, colors: COLORS }) {
  const max = data[0]?.v || 1
  const N = data.length
  const [progress, setProgress] = useState(0)
  const [finished, setFinished] = useState(false)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  const [positions] = useState(() => {
    const pts = [
      { x: 50, y: 38 }, { x: 24, y: 54 }, { x: 76, y: 54 },
      { x: 18, y: 26 }, { x: 82, y: 28 }, { x: 50, y: 74 },
      { x: 34, y: 74 }, { x: 66, y: 74 },
    ]
    return data.map((_, i) => pts[i] || { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 })
  })

  useEffect(() => {
    const t = setTimeout(() => {
      startRef.current = performance.now()
      const tick = (now) => {
        const p = Math.min((now - startRef.current) / speed, 1)
        setProgress(p)
        if (p < 1) { rafRef.current = requestAnimationFrame(tick) }
        else { setFinished(true) }
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 600)
    return () => { clearTimeout(t); cancelAnimationFrame(rafRef.current) }
  }, [speed])

  const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

  return (
    <div>
      <style>{`
        @keyframes bb-beat { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.06);filter:brightness(1.2)} }
        @keyframes bb-beat-winner { 0%,100%{transform:scale(1);filter:brightness(1)} 50%{transform:scale(1.08);filter:brightness(1.4)} }
      `}</style>

      <div style={{ position: "relative", width: "100%", height: 310 }}>
        {data.map((g, rank) => {
          const color = COLORS[rank % COLORS.length]
          const pos = positions[rank]
          const ratio = g.v / max
          const finalSize = 38 + ratio * 75
          const offset = rank * 0.08
          const t = Math.max(0, Math.min(1, (progress - offset) / (1 - offset)))
          const currentSize = 8 + (finalSize - 8) * ease(t)
          const isFirst = rank === 0
          const showLabel = currentSize > 28

          return (
            <div key={g.n} style={{
              position: "absolute",
              left: pos.x + "%", top: pos.y + "%",
              marginLeft: -currentSize / 2, marginTop: -currentSize / 2,
              zIndex: Math.round(currentSize),
            }}>
              <div style={{
                width: currentSize, height: currentSize, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%," + color + "50," + color + "12)",
                border: "1.5px solid " + color + (finished ? "70" : "30"),
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                padding: 4, overflow: "hidden",
                boxShadow: finished
                  ? "0 0 " + (isFirst ? 30 : 15) + "px " + color + (isFirst ? "50" : "25")
                  : "0 0 " + Math.round(currentSize * 0.12) + "px " + color + "15",
                animation: finished ? (isFirst ? "bb-beat-winner 1.8s ease-in-out infinite" : "bb-beat 2.5s ease-in-out " + (rank * 0.3) + "s infinite") : "none",
                transition: "box-shadow 0.5s ease, border 0.5s ease",
              }}>
                {showLabel && <>
                  {finished && <div style={{ position: "absolute", top: -5, right: -5, width: 18, height: 18, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 800, color: "#000" }}>{rank + 1}</div>}
                  <div style={{ fontSize: currentSize > 65 ? 12 : currentSize > 45 ? 9 : 7, fontWeight: 700, color: "var(--th-text)", lineHeight: 1.1, textAlign: "center", opacity: Math.min(1, (currentSize - 28) / 15) }}>{g.n}</div>
                  <div style={{ fontSize: currentSize > 55 ? 10 : 7, color: color, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", marginTop: 1, opacity: Math.min(1, (currentSize - 32) / 15) }}>{Math.round(g.v * t)}</div>
                </>}
              </div>
            </div>
          )
        })}
      </div>

      {finished && (
        <div style={{ textAlign: "center", marginTop: 4, animation: "slide-up 0.5s ease 0.3s both" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[0] }}>{data[0].n}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{data[0].v} vues — genre dominant</div>
        </div>
      )}
    </div>
  )
}

/* ═══ ORBIT — SVG circle with spinning dots that stop and trace colored arcs ═══ */
function OrbitMode({ data, accent, speed, colors: COLORS }) {
  const total = data.reduce((s, g) => s + g.v, 0)
  const N = data.length
  const R = 42 // SVG radius
  const SVG_SIZE = 100 // viewBox

  const [elapsed, setElapsed] = useState(0)
  const [stoppedCount, setStoppedCount] = useState(0)
  const rafRef = useRef(null)
  const startRef = useRef(null)

  // Pre-compute arcs (final positions on the circle)
  const [arcs] = useState(() => {
    let cum = -90
    return data.map((g, i) => {
      const pct = total > 0 ? g.v / total : 1 / N
      const deg = pct * 360
      const start = cum
      cum += deg
      return { pct, deg, startAngle: start, endAngle: cum, midAngle: start + deg / 2, color: COLORS[i % COLORS.length] }
    })
  })

  // Spin config per dot
  const [spins] = useState(() => data.map(() => ({
    speed: 120 + Math.random() * 200,
    dir: Math.random() > 0.5 ? 1 : -1,
  })))

  // Spin for 30%, then stop one by one — last one stops at exactly 100%
  const spinPhase = speed * 0.3
  const stopInterval = (speed * 0.7 - 500) / Math.max(1, N) // 500ms buffer before end

  useEffect(() => {
    const t = setTimeout(() => {
      startRef.current = performance.now()
      const tick = (now) => {
        const el = now - startRef.current
        setElapsed(el)
        if (el >= speed) {
          setStoppedCount(N)
          return
        }
        // Stop one by one, evenly spaced, last one at speed - 300ms
        const stopStart = spinPhase
        const stopEnd = speed - 300
        const stopRange = Math.max(1, stopEnd - stopStart)
        const sc = Math.min(N, Math.floor(Math.max(0, el - stopStart) / (stopRange / N) + 1))
        setStoppedCount(Math.min(sc, N))
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
    }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(rafRef.current) }
  }, [speed, spinPhase, stopInterval, N])

  const finished = stoppedCount >= N
  // Stop order: smallest first (reverse)
  const stopOrder = [...data].map((_, i) => i).reverse()

  const toXY = (angleDeg, r) => ({
    x: SVG_SIZE / 2 + r * Math.cos(angleDeg * Math.PI / 180),
    y: SVG_SIZE / 2 + r * Math.sin(angleDeg * Math.PI / 180),
  })

  const arcPath = (startDeg, endDeg, r) => {
    const s = toXY(startDeg, r)
    const e = toXY(endDeg, r)
    const large = (endDeg - startDeg) > 180 ? 1 : 0
    return "M " + s.x + " " + s.y + " A " + r + " " + r + " 0 " + large + " 1 " + e.x + " " + e.y
  }

  return (
    <div>
      <div style={{ position: "relative", width: "100%", maxWidth: 320, margin: "0 auto", aspectRatio: "1" }}>
        <svg viewBox={"0 0 " + SVG_SIZE + " " + SVG_SIZE} style={{ width: "100%", height: "100%" }}>
          {/* Base circle — thin line */}
          <circle cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={R} fill="none" stroke="var(--th-border-dim)" strokeWidth="1" />

          {/* Colored arcs + white separator ticks at end of each arc */}
          {arcs.map((arc, i) => {
            const si = stopOrder.indexOf(i)
            if (si >= stoppedCount) return null
            const gap = 1
            const endPt = toXY(arc.endAngle, R)
            // Small tick line extending outward at end of arc
            const tickOuter = toXY(arc.endAngle, R + 3)
            const tickInner = toXY(arc.endAngle, R - 3)
            return <g key={"arc" + i}>
              <path d={arcPath(arc.startAngle + gap, arc.endAngle - gap, R)} fill="none" stroke={arc.color} strokeWidth="4" strokeLinecap="round" opacity="0.7" style={{ transition: "opacity 0.5s" }} />
              {/* White separator tick */}
              <line x1={tickInner.x} y1={tickInner.y} x2={tickOuter.x} y2={tickOuter.y} stroke="white" strokeWidth="1" opacity="0.6" />
            </g>
          })}

          {/* Dots */}
          {data.map((g, rank) => {
            const arc = arcs[rank]
            const si = stopOrder.indexOf(rank)
            const isStopped = si < stoppedCount
            const dotR = 2.5

            let angle
            if (isStopped) {
              angle = arc.endAngle
            } else {
              const sec = elapsed / 1000
              angle = sec * spins[rank].speed * spins[rank].dir
            }
            const pos = toXY(angle, R)

            // Label position = middle of arc, pushed outward
            const labelPos = toXY(arc.midAngle, R + 10)

            return (
              <g key={g.n}>
                {/* Dot at end of arc */}
                <circle cx={pos.x} cy={pos.y} r={dotR} fill={isStopped ? "white" : arc.color + "60"} stroke={arc.color} strokeWidth={isStopped ? "0.8" : "0.5"} style={{ transition: isStopped ? "cx 0.8s cubic-bezier(0.34,1.56,0.64,1), cy 0.8s cubic-bezier(0.34,1.56,0.64,1), fill 0.5s" : "" }}>
                  {!isStopped && elapsed > 0 && <animate attributeName="opacity" values="0.5;1;0.5" dur="0.4s" repeatCount="indefinite" />}
                </circle>
                {/* Label at middle of arc, outside the circle */}
                {isStopped && (
                  <g style={{ opacity: 0.9 }}>
                    <text x={labelPos.x} y={labelPos.y - 2} textAnchor="middle" fill="var(--th-text)" fontSize="3.5" fontWeight="700">{g.n}</text>
                    <text x={labelPos.x} y={labelPos.y + 3} textAnchor="middle" fill={arc.color} fontSize="3" fontFamily="var(--th-font-mono, JetBrains Mono,monospace)">{Math.round(arc.pct * 100)}%</text>
                  </g>
                )}
              </g>
            )
          })}

          {/* Center text */}
          <text x={SVG_SIZE / 2} y={SVG_SIZE / 2 - 2} textAnchor="middle" fill="var(--th-text)" fontSize="8" fontWeight="800">
            {finished ? total : Math.round(total * Math.min(1, elapsed / speed))}
          </text>
          <text x={SVG_SIZE / 2} y={SVG_SIZE / 2 + 6} textAnchor="middle" fill="var(--th-text-muted)" fontSize="3" fontFamily="var(--th-font-mono, JetBrains Mono,monospace)" letterSpacing="0.1em">
            TOTAL VUES
          </text>
        </svg>
      </div>

      {finished && (
        <div style={{ textAlign: "center", marginTop: 8, animation: "slide-up 0.5s ease 0.3s both" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            {data.slice(0, 3).map((g, i) => (
              <div key={g.n} style={{ textAlign: "center" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i], margin: "0 auto 4px" }} />
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS[i] }}>{g.n}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{Math.round(arcs[i].pct * 100)}% — {g.v}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ═══ PODIUM ═══ */
function PodiumMode({ data, accent, speed, colors: COLORS }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 500); return () => clearTimeout(t) }, [])

  const medals = ["🥇", "🥈", "🥉"]

  return (
    <div>
      {data.length >= 3 && (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          {[data[1], data[0], data[2]].map((g, i) => {
            const isFirst = i === 1
            const heights = [80, 120, 60]
            const color = COLORS[i === 1 ? 0 : i === 0 ? 1 : 2]
            const delay = 0.3 + i * 0.25
            return (
              <div key={g.n} style={{
                flex: isFirst ? 1.2 : 1, display: "flex", flexDirection: "column", alignItems: "center",
                opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(40px)",
                transition: "all 0.6s ease " + delay + "s",
              }}>
                <div style={{ fontSize: isFirst ? 28 : 20, marginBottom: 4 }}>{medals[i === 1 ? 0 : i === 0 ? 1 : 2]}</div>
                <div style={{ fontSize: isFirst ? 14 : 12, fontWeight: 700, color: "var(--th-text)", textAlign: "center", marginBottom: 2 }}>{g.n}</div>
                <div style={{ fontSize: 10, color: color, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", marginBottom: 8 }}>{g.v}</div>
                <div style={{
                  width: "100%", height: heights[i], borderRadius: "8px 8px 0 0",
                  background: "linear-gradient(180deg," + color + "35 0%," + color + "12 100%)",
                  border: "1px solid " + color + "45", borderBottom: "none",
                  boxShadow: isFirst ? "0 -4px 25px " + color + "25" : "none",
                }} />
              </div>
            )
          })}
        </div>
      )}
      {data.slice(3).map((g, i) => {
        const color = COLORS[(i + 3) % COLORS.length]
        return (
          <div key={g.n} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", marginBottom: 4,
            background: "var(--th-surface-dim)", borderRadius: "var(--th-radius-xs)", border: "1px solid var(--th-border-dim)",
            opacity: revealed ? 1 : 0, transition: "opacity 0.4s ease " + (1 + i * 0.1) + "s",
          }}>
            <div style={{ width: 20, textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--th-text-dim)" }}>{i + 4}</div>
            <span style={{ flex: 1, fontSize: 12, color: "var(--th-text-secondary)" }}>{g.n}</span>
            <span style={{ fontSize: 10, color: color, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{g.v}</span>
          </div>
        )
      })}
    </div>
  )
}
