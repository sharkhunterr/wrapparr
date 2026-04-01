import { useState, useEffect } from "react"
import { useComparison } from "../SharedUI"
import { useLabels } from "../ThemeContext"

// Default timings (overridable via config)
const DEFAULT_CONFIG = {
  phaseWait: 1800,     // ms before jokes start
  jokeDuration: 1800,  // ms per joke
  jokeTransition: 350, // ms fade between jokes
  reveal1: 400,        // ms delay for #3
  reveal2: 1100,       // ms delay for #2
  reveal3: 2000,       // ms delay for #1
}

function PosterImg({ src, size = 56, accent, noFrame }) {
  const [err, setErr] = useState(false)
  const shadow = noFrame ? "0 8px 32px " + accent + "55" : "0 8px 32px " + accent + "55,0 0 0 2px " + accent + "40"
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: "var(--th-radius-xs)", background: accent + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, boxShadow: shadow }}>🎬</div>
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: "var(--th-radius-xs)", objectFit: "cover", display: "block", boxShadow: shadow }} />
}

const PODIUM_H = [88, 110, 132]

export default function PodiumSlide({ accent, bg, data = [], title, icon, jokes = [], statLabel, statKey, statSuffix = "", config = {}, backdrop, serviceType }) {
  const cfg = { ...DEFAULT_CONFIG, ...config }
  const comp = useComparison()
  const L = useLabels()
  // Use comparison data for the correct service
  const prevSvc = comp.active ? (comp.data?.[serviceType] || comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevTop = prevSvc?.films?.top?.previous || prevSvc?.top?.previous || []
  const [phase, setPhase] = useState(0)
  const [jokeIdx, setJokeIdx] = useState(0)
  const [jokeVisible, setJokeVisible] = useState(true)
  const [revealed, setRevealed] = useState([false, false, false])

  useEffect(() => {
    setPhase(0); setJokeIdx(0); setJokeVisible(true); setRevealed([false, false, false])
    const t = setTimeout(() => setPhase(1), cfg.phaseWait)
    return () => clearTimeout(t)
  }, [cfg.phaseWait])

  useEffect(() => {
    if (phase !== 1) return
    let idx = 0
    const advance = () => {
      setJokeVisible(false)
      setTimeout(() => {
        idx++
        if (idx >= jokes.length) { setPhase(2); return }
        setJokeIdx(idx); setJokeVisible(true)
        setTimeout(advance, cfg.jokeDuration)
      }, cfg.jokeTransition)
    }
    const t = setTimeout(advance, cfg.jokeDuration)
    return () => clearTimeout(t)
  }, [phase, jokes.length, cfg.jokeDuration, cfg.jokeTransition])

  useEffect(() => {
    if (phase !== 2) return
    const delays = [cfg.reveal1, cfg.reveal2, cfg.reveal3]
    delays.forEach((delay, i) => {
      setTimeout(() => setRevealed((prev) => { const n = [...prev]; n[i] = true; return n }), delay)
    })
  }, [phase, cfg.reveal1, cfg.reveal2, cfg.reveal3])

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", position: "relative", zIndex: 10 }}>
      {/* Backdrop art from #1 */}
      {backdrop && phase === 2 && <div style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <img src={backdrop} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.12, filter: "blur(2px)" }} />
        <div style={{ position: "absolute", inset: 0, background: (bg || "#05050e") + "cc" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg," + (bg || "#05050e") + "80 0%,transparent 30%,transparent 70%," + (bg || "#05050e") + "ff 100%)" }} />
      </div>}
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70vw", height: "55vh", pointerEvents: "none", zIndex: 1, background: "radial-gradient(ellipse at 50% 0%," + accent + "25 0%,transparent 70%)" }} />

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: phase >= 2 ? 16 : 24, position: "relative", zIndex: 5 }}>
        <div style={{ fontSize: 34, marginBottom: 6, filter: "drop-shadow(0 0 20px " + accent + ")", animation: "float 3s ease-in-out infinite" }}>{icon}</div>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textTransform: "uppercase", marginBottom: 4 }}>WRAPPARR</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05, animation: "slide-up .7s ease .2s both" }}>{title}</h2>
      </div>

      {/* Phase 0: pulse rings */}
      {phase === 0 && <div style={{ position: "relative", width: 80, height: 80, zIndex: 5 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + accent, animation: "pulse-ring 1.8s ease-out " + (i * 0.6) + "s infinite" }} />)}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, filter: "drop-shadow(0 0 20px " + accent + ")" }}>🎭</div>
      </div>}

      {/* Phase 1: jokes */}
      {phase === 1 && <div style={{ zIndex: 5, textAlign: "center", maxWidth: 320 }}>
        <div style={{ height: 3, borderRadius: 2, marginBottom: 20, background: "linear-gradient(90deg,transparent," + accent + ",transparent)", animation: "drum-roll 0.4s ease-in-out infinite" }} />
        <div style={{ fontSize: "clamp(14px, 4vw, 18px)", color: "var(--th-text)", fontWeight: 400, lineHeight: 1.5, minHeight: 56, opacity: jokeVisible ? 1 : 0, transform: jokeVisible ? "translateY(0)" : "translateY(-10px)", transition: "opacity .3s ease,transform .3s ease" }}>{jokes[jokeIdx]}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>{jokes.map((_, i) => <div key={i} style={{ width: i <= jokeIdx ? 20 : 6, height: 6, borderRadius: 3, background: i <= jokeIdx ? accent : "rgba(255,255,255,0.15)", transition: "all .3s ease" }} />)}</div>
      </div>}

      {/* Phase 2: podium */}
      {phase === 2 && <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
          {[{ item: data[2], rIdx: 0, isOne: false }, { item: data[0], rIdx: 2, isOne: true }, { item: data[1], rIdx: 1, isOne: false }].map(({ item, rIdx, isOne }, col) => {
            if (!item) return <div key={col} style={{ flex: isOne ? 1.15 : 1 }} />
            const rank = 3 - rIdx
            const posterSize = isOne ? 74 : 56
            return (
              <div key={col} style={{ flex: isOne ? 1.15 : 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: revealed[rIdx] ? 1 : 0 }}>
                {isOne && revealed[rIdx] && <div style={{ fontSize: 24, marginBottom: 4, animation: "crown-bounce 1.8s ease-in-out infinite", filter: "drop-shadow(0 0 12px " + accent + ")" }}>👑</div>}
                {revealed[rIdx] && <div style={{ fontSize: isOne ? 38 : 28, fontWeight: 800, marginBottom: 6, color: accent, textShadow: "0 0 30px " + accent, animation: "rank-stamp .5s cubic-bezier(0.34,1.56,0.64,1) both" }}>#{rank}</div>}
                {revealed[rIdx] && <div style={{ animation: "poster-appear .65s cubic-bezier(0.34,1.3,0.64,1) both", marginBottom: 8, position: "relative", width: posterSize, height: posterSize * 1.45 }}>
                  {isOne && <>
                    {/* Static accent border */}
                    <div style={{ position: "absolute", inset: -2, borderRadius: "var(--th-radius-sm)", border: `2px solid ${accent}60`, zIndex: 0 }} />
                    {/* Rotating white shine on border */}
                    <div style={{
                      position: "absolute", inset: -2, borderRadius: "var(--th-radius-sm)", zIndex: 0, overflow: "hidden",
                      WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                      WebkitMaskComposite: "xor", maskComposite: "exclude", padding: 2,
                    }}>
                      <div style={{ position: "absolute", inset: -40, background: "conic-gradient(from 0deg, transparent 0%, rgba(255,255,255,0.9) 4%, white 6%, rgba(255,255,255,0.9) 8%, transparent 12%, transparent 100%)", animation: "glow-spin 2.5s linear infinite" }} />
                    </div>
                  </>}
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <PosterImg src={item.thumb} size={posterSize} accent={accent} noFrame={isOne} />
                  </div>
                </div>}
                <div style={{ width: "100%", borderRadius: "6px 6px 0 0", height: PODIUM_H[rIdx], background: revealed[rIdx] ? "linear-gradient(180deg," + accent + "38 0%," + accent + "18 100%)" : "var(--th-surface-subtle)", border: "1px solid " + (revealed[rIdx] ? accent + "55" : "rgba(255,255,255,0.05)"), borderBottom: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "10px 6px", animation: revealed[rIdx] ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none" }}>
                  {revealed[rIdx] && <>
                    <div style={{ color: "var(--th-text)", fontWeight: 700, fontSize: isOne ? 11 : 9, textAlign: "center", lineHeight: 1.2, marginBottom: 4 }}>{(item.t || "").length > 16 ? (item.t || "").slice(0, 14) + "..." : item.t}</div>
                    {item[statKey] != null && <div style={{ color: accent, fontWeight: 800, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontSize: isOne ? 15 : 11 }}>{item[statKey]}{statSuffix}</div>}
                    <div style={{ color: "var(--th-text-tertiary)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>{statLabel}</div>
                  </>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ height: 6, borderRadius: 4, background: "linear-gradient(90deg,transparent," + accent + "40," + accent + "70," + accent + "40,transparent)", boxShadow: "0 0 20px " + accent + "30" }} />

        {/* 4th place mention */}
        {revealed[2] && data[3] && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, padding: "8px 14px", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface-subtle)", border: "1px solid rgba(255,255,255,0.07)", animation: "slide-up .4s ease .2s both" }}>
            <PosterImg src={data[3].thumb} size={28} accent={accent} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, color: "var(--th-text-muted)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>4e · Mention honorable</div>
              <div style={{ color: "var(--th-text)", fontWeight: 600, fontSize: 12 }}>{data[3].t}</div>
            </div>
            {data[3][statKey] != null && <div style={{ marginLeft: "auto", color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", fontSize: 11 }}>{data[3][statKey]}{statSuffix}</div>}
          </div>
        )}

        {/* Previous year top 3 */}
        {revealed[2] && prevTop.length > 0 && (
          <div style={{ marginTop: 14, animation: "slide-up .4s ease .4s both" }}>
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 10 }} />
            <div style={{ fontSize: 8, color: "var(--th-text-dim)", textTransform: "uppercase", letterSpacing: ".1em", textAlign: "center", marginBottom: 8 }}>Top {prevTop.length > 1 ? prevTop.length : ""} de {comp.year - 1}</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {prevTop.map((film, i) => (
                <div key={film.t + i} style={{
                  flex: 1, maxWidth: 110, textAlign: "center",
                  animation: "slide-up .3s ease " + (0.5 + i * 0.1) + "s both",
                }}>
                  <div style={{ position: "relative", display: "inline-block" }}>
                    {film.thumb ? (
                      <img src={film.thumb} alt="" style={{
                        width: "100%", height: 70, borderRadius: 6, objectFit: "cover",
                        border: "1px solid rgba(255,255,255,0.1)",
                        filter: "saturate(0.3) brightness(0.7)",
                      }} onError={(e) => { e.target.style.display = "none" }} />
                    ) : (
                      <div style={{ width: "100%", height: 70, borderRadius: 6, background: "var(--th-surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "rgba(255,255,255,0.15)" }}>🎬</div>
                    )}
                    <div style={{
                      position: "absolute", top: -5, left: -5,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "var(--th-surface)", border: "1px solid var(--th-text-faint)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, fontWeight: 800, color: "var(--th-text-secondary)",
                      fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)",
                    }}>{i + 1}</div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 600, color: "var(--th-text-muted)", marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{film.t}</div>
                  <div style={{ fontSize: 8, color: "var(--th-text-faint)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{film.plays} {statSuffix || L.viewsUnit}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>}
    </div>
  )
}
