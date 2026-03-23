import { useState, useEffect, useRef } from "react"

const COLORS = ["#E5A00D", "#fb923c", "#c084fc", "#34d399", "#60a5fa", "#f87171", "#fbbf24", "#a78bfa"]

export default function GenresSlide({ accent, genres = [], year, config = {} }) {
  const mode = config.displayMode || "race"
  const maxGenres = config.maxGenres || 6
  const speed = config.animationSpeed || 25000
  const data = genres.slice(0, maxGenres)

  if (!data.length) return null

  return (
    <div style={{ maxWidth: 430, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes genres <span style={{ color: accent }}>preferes</span>
        </h2>
      </div>

      {mode === "race" && <RaceMode data={data} accent={accent} speed={speed} config={config} />}
      {mode === "bubbles" && <BubblesMode data={data} accent={accent} speed={speed} />}
      {mode === "podium" && <PodiumMode data={data} accent={accent} speed={speed} />}
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

function RaceMode({ data, accent, speed, config = {} }) {
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
        {finished && <div style={{ fontSize: 9, letterSpacing: "0.2em", fontFamily: "JetBrains Mono,monospace", color: accent, animation: "slide-up .4s ease both" }}>RESULTATS FINAUX</div>}
      </div>

      {/* Track */}
      <div style={{ position: "relative", height: N * ROW_H }}>
        {data.map((_, i) => <div key={"l" + i} style={{ position: "absolute", left: 36, right: 0, top: i * ROW_H + ROW_H / 2, height: 1, background: "rgba(255,255,255,0.02)" }} />)}
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
                {finished && g.rank < 3 ? <span style={{ fontSize: 16 }}>{medals[g.rank]}</span> : <span style={{ fontSize: 11, fontWeight: 700, color: (racing || finished) ? g.color : "rgba(255,255,255,0.1)", fontFamily: "JetBrains Mono,monospace" }}>P{positionMap[g.rank] + 1}</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: isWinner ? 700 : 500, color: isWinner ? "white" : "rgba(255,255,255,0.5)" }}>{g.n}</span>
                  <span style={{ fontSize: 10, color: g.color, fontFamily: "JetBrains Mono,monospace", opacity: (racing || finished) ? 1 : 0.12 }}>{g.displayCount}</span>
                </div>
                <div style={{ height: 12, background: "rgba(255,255,255,0.02)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
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
        <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8, animation: "slide-up 0.5s ease 0.3s both", position: "relative", zIndex: 25 }}>
          <div style={{ padding: "14px 16px", borderRadius: 12, textAlign: "center", background: "linear-gradient(135deg," + COLORS[0] + "18," + accent + "10)", border: "1px solid " + COLORS[0] + "35", boxShadow: "0 0 30px " + COLORS[0] + "15" }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{medals[0]}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: COLORS[0] }}>{data[0].n}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{data[0].v} vues</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {data.slice(1, 3).map((g, i) => (
              <div key={g.n} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, textAlign: "center", background: COLORS[i + 1] + "10", border: "1px solid " + COLORS[i + 1] + "20", animation: "slide-up 0.4s ease " + (0.6 + i * 0.15) + "s both" }}>
                <span style={{ fontSize: 14 }}>{medals[i + 1]}</span>
                <div style={{ fontSize: 11, fontWeight: 600, color: COLORS[i + 1], marginTop: 2 }}>{g.n}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{g.v}</div>
              </div>
            ))}
          </div>
        </div>
      </>}
    </div>
  )
}

/* ═══ BUBBLES — suspense reveal ═══ */
function BubblesMode({ data, accent, speed }) {
  const max = data[0]?.v || 1
  const N = data.length
  const [revealedCount, setRevealedCount] = useState(0)
  const [showWinner, setShowWinner] = useState(false)

  // Reveal from last place to first, with pauses
  useEffect(() => {
    const perItem = speed / (N + 2) // time per reveal
    const timers = []
    // Reveal from worst to best (reverse order = suspense)
    for (let i = 0; i < N; i++) {
      timers.push(setTimeout(() => setRevealedCount(i + 1), 800 + i * perItem))
    }
    timers.push(setTimeout(() => setShowWinner(true), 800 + N * perItem + 500))
    return () => timers.forEach(clearTimeout)
  }, [speed, N])

  // Layout positions — winner center, others around
  const positions = [
    { x: 50, y: 38 },  // #1 center
    { x: 25, y: 52 },  // #2 left
    { x: 75, y: 52 },  // #3 right
    { x: 18, y: 28 },  // #4 top-left
    { x: 82, y: 30 },  // #5 top-right
    { x: 50, y: 72 },  // #6 bottom
    { x: 35, y: 75 },  // #7
    { x: 65, y: 75 },  // #8
  ]

  // Reveal order: last to first (most suspense for #1)
  const revealOrder = [...data].reverse()

  return (
    <div>
      <style>{`
        @keyframes bubble-in { 0%{transform:translate(-50%,-50%) scale(0);opacity:0} 60%{transform:translate(-50%,-50%) scale(1.15);opacity:1} 100%{transform:translate(-50%,-50%) scale(1)} }
        @keyframes bubble-pulse { 0%,100%{transform:translate(-50%,-50%) scale(1)} 50%{transform:translate(-50%,-50%) scale(1.06)} }
        @keyframes glow-winner { 0%,100%{box-shadow:0 0 20px var(--c)} 50%{box-shadow:0 0 40px var(--c),0 0 60px var(--c)} }
        @keyframes rank-reveal { 0%{opacity:0;transform:translateY(8px)} 100%{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Suspense counter */}
      <div style={{ textAlign: "center", marginBottom: 10, minHeight: 24 }}>
        {revealedCount > 0 && revealedCount < N && (
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.15em" }}>
            {N - revealedCount} restant{N - revealedCount > 1 ? "s" : ""}...
          </span>
        )}
        {showWinner && (
          <span style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.15em", animation: "rank-reveal 0.5s ease both" }}>
            RESULTATS
          </span>
        )}
      </div>

      <div style={{ position: "relative", width: "100%", height: 300 }}>
        {data.map((g, rank) => {
          const color = COLORS[rank % COLORS.length]
          const pos = positions[rank] || { x: 30 + Math.random() * 40, y: 30 + Math.random() * 40 }
          const ratio = g.v / max
          const size = 35 + ratio * 75
          const isFirst = rank === 0

          // This item is revealed when its reverse-order index < revealedCount
          const revealIdx = N - 1 - rank
          const isRevealed = revealIdx < revealedCount
          const justRevealed = revealIdx === revealedCount - 1

          return (
            <div key={g.n} style={{
              position: "absolute", left: pos.x + "%", top: pos.y + "%",
              zIndex: isRevealed ? (isFirst ? 10 : 5) : 0,
              animation: isRevealed ? "bubble-in 0.7s cubic-bezier(0.34,1.56,0.64,1) forwards" : "none",
              opacity: isRevealed ? 1 : 0,
            }}>
              <div style={{
                width: size, height: size, borderRadius: "50%",
                background: "radial-gradient(circle at 30% 30%," + color + "45," + color + "10)",
                border: (isFirst && showWinner) ? "2px solid " + color : "1.5px solid " + color + "50",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 4,
                boxShadow: (isFirst && showWinner) ? "0 0 30px " + color + "50, 0 0 60px " + color + "20" : justRevealed ? "0 0 20px " + color + "40" : "0 0 8px " + color + "15",
                animation: (isFirst && showWinner) ? "bubble-pulse 2s ease-in-out infinite, glow-winner 2s ease-in-out infinite" : isRevealed ? "bubble-pulse 3s ease-in-out " + (rank * 0.5) + "s infinite" : "none",
                "--c": color + "40",
                transition: "box-shadow 0.5s ease, border 0.5s ease",
              }}>
                {/* Rank badge */}
                {isRevealed && <div style={{
                  position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%",
                  background: color, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 9, fontWeight: 800, color: "#000",
                  animation: "rank-reveal 0.4s ease 0.3s both",
                }}>{rank + 1}</div>}

                <div style={{ fontSize: size > 65 ? 13 : size > 45 ? 10 : 8, fontWeight: 700, color: "white", lineHeight: 1.1, textAlign: "center" }}>{g.n}</div>
                <div style={{ fontSize: size > 65 ? 11 : 8, color: color, fontFamily: "JetBrains Mono,monospace", marginTop: 2 }}>{g.v}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Winner announcement */}
      {showWinner && (
        <div style={{ textAlign: "center", marginTop: 8, animation: "slide-up 0.5s ease 0.3s both" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS[0] }}>{data[0].n}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{data[0].v} vues — genre dominant</div>
        </div>
      )}
    </div>
  )
}

/* ═══ PODIUM ═══ */
function PodiumMode({ data, accent, speed }) {
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
                <div style={{ fontSize: isFirst ? 14 : 12, fontWeight: 700, color: "white", textAlign: "center", marginBottom: 2 }}>{g.n}</div>
                <div style={{ fontSize: 10, color: color, fontFamily: "JetBrains Mono,monospace", marginBottom: 8 }}>{g.v}</div>
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
            background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
            opacity: revealed ? 1 : 0, transition: "opacity 0.4s ease " + (1 + i * 0.1) + "s",
          }}>
            <div style={{ width: 20, textAlign: "center", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)" }}>{i + 4}</div>
            <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{g.n}</span>
            <span style={{ fontSize: 10, color: color, fontFamily: "JetBrains Mono,monospace" }}>{g.v}</span>
          </div>
        )
      })}
    </div>
  )
}
