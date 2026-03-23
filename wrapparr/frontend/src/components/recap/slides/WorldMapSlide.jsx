import { useState, useEffect, useRef } from "react"

// Simplified world map — ISO 3166-1 alpha-2 codes to SVG path data
// Using a minimal world map with major countries
const COUNTRY_PATHS = {
  US: "M55,145 L130,145 L135,165 L55,165Z",
  CA: "M55,100 L135,100 L135,145 L55,145Z",
  MX: "M60,165 L110,165 L105,185 L55,185Z",
  BR: "M140,195 L185,185 L190,240 L145,245Z",
  AR: "M140,245 L165,240 L160,290 L140,285Z",
  GB: "M245,115 L255,115 L255,130 L245,130Z",
  FR: "M245,135 L265,130 L270,150 L245,155Z",
  DE: "M265,120 L285,118 L285,140 L265,140Z",
  ES: "M235,150 L255,148 L258,165 L235,165Z",
  IT: "M270,145 L280,140 L285,170 L272,168Z",
  RU: "M290,70 L430,65 L430,130 L290,135Z",
  CN: "M360,140 L420,135 L425,175 L365,180Z",
  JP: "M430,145 L445,140 L445,165 L432,168Z",
  KR: "M420,150 L432,148 L432,162 L422,164Z",
  IN: "M345,170 L375,165 L380,210 L350,215Z",
  AU: "M390,240 L445,235 L450,275 L395,278Z",
  ZA: "M280,255 L310,252 L312,278 L282,280Z",
  NG: "M260,195 L278,193 L280,215 L262,217Z",
  EG: "M280,165 L300,163 L302,185 L282,187Z",
  SE: "M270,85 L280,82 L282,115 L272,118Z",
  NO: "M258,75 L268,72 L270,110 L260,112Z",
  FI: "M282,75 L295,72 L295,105 L284,108Z",
  PL: "M280,118 L300,116 L300,132 L280,134Z",
  NL: "M255,118 L263,117 L264,128 L256,129Z",
  BE: "M253,130 L262,129 L263,138 L254,139Z",
  CH: "M260,138 L272,137 L273,148 L261,149Z",
  PT: "M228,150 L236,149 L237,168 L229,169Z",
  TR: "M290,145 L325,142 L328,160 L292,162Z",
  NZ: "M455,275 L465,272 L466,290 L456,292Z",
  CL: "M130,250 L140,248 L142,295 L132,297Z",
  CO: "M115,185 L140,182 L142,205 L118,208Z",
  DK: "M262,108 L272,107 L272,118 L262,118Z",
  IE: "M235,115 L244,114 L244,130 L236,131Z",
  AT: "M270,135 L285,134 L285,143 L270,144Z",
  HK: "M400,175 L408,174 L408,182 L401,183Z",
  TW: "M415,172 L422,171 L422,180 L416,181Z",
  SG: "M385,205 L392,204 L392,210 L386,211Z",
  TH: "M380,180 L392,178 L394,200 L382,202Z",
  IS: "M225,85 L240,83 L240,95 L225,97Z",
}

const FLAGS = {
  US: "🇺🇸", CA: "🇨🇦", MX: "🇲🇽", BR: "🇧🇷", AR: "🇦🇷",
  GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", ES: "🇪🇸", IT: "🇮🇹",
  RU: "🇷🇺", CN: "🇨🇳", JP: "🇯🇵", KR: "🇰🇷", IN: "🇮🇳",
  AU: "🇦🇺", ZA: "🇿🇦", NG: "🇳🇬", EG: "🇪🇬", SE: "🇸🇪",
  NO: "🇳🇴", FI: "🇫🇮", PL: "🇵🇱", NL: "🇳🇱", BE: "🇧🇪",
  CH: "🇨🇭", PT: "🇵🇹", TR: "🇹🇷", NZ: "🇳🇿", CL: "🇨🇱",
  CO: "🇨🇴", DK: "🇩🇰", IE: "🇮🇪", AT: "🇦🇹", HK: "🇭🇰",
  TW: "🇹🇼", SG: "🇸🇬", TH: "🇹🇭", IS: "🇮🇸",
}

// Get center of a path for label placement
function getCenter(pathStr) {
  const nums = pathStr.match(/\d+/g)?.map(Number) || []
  if (nums.length < 4) return { x: 250, y: 150 }
  const xs = nums.filter((_, i) => i % 2 === 0)
  const ys = nums.filter((_, i) => i % 2 === 1)
  return { x: xs.reduce((a, b) => a + b, 0) / xs.length, y: ys.reduce((a, b) => a + b, 0) / ys.length }
}

export default function WorldMapSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 15000
  const countries = data?.extra?.countries || []
  const N = countries.length

  const [phase, setPhase] = useState(0) // 0=idle, 1=flickering, 2=revealing, 3=done
  const [revealedCount, setRevealedCount] = useState(0)
  const [flickerStates, setFlickerStates] = useState({})
  const flickerRef = useRef(null)

  if (!countries.length) return null

  const maxCount = countries[0]?.count || 1
  // Reveal order: smallest to largest (suspense)
  const revealOrder = [...countries].reverse()

  useEffect(() => {
    const t = []
    // Phase 1: flickering (40% of time)
    t.push(setTimeout(() => setPhase(1), 400))
    // Phase 2: start revealing (40%-90%)
    t.push(setTimeout(() => setPhase(2), 400 + animSpeed * 0.35))
    // Done
    t.push(setTimeout(() => setPhase(3), 400 + animSpeed))
    return () => t.forEach(clearTimeout)
  }, [animSpeed])

  // Flickering effect during phase 1
  useEffect(() => {
    if (phase !== 1) { clearInterval(flickerRef.current); return }
    flickerRef.current = setInterval(() => {
      const newStates = {}
      // Random countries flicker
      const allCodes = Object.keys(COUNTRY_PATHS)
      for (let i = 0; i < 4 + Math.floor(Math.random() * 4); i++) {
        const code = allCodes[Math.floor(Math.random() * allCodes.length)]
        newStates[code] = 0.1 + Math.random() * 0.5
      }
      setFlickerStates(newStates)
    }, 200)
    return () => clearInterval(flickerRef.current)
  }, [phase])

  // Reveal countries one by one during phase 2
  useEffect(() => {
    if (phase !== 2) return
    const perItem = (animSpeed * 0.55) / Math.max(1, N)
    const timers = []
    for (let i = 0; i < N; i++) {
      timers.push(setTimeout(() => setRevealedCount(i + 1), i * perItem))
    }
    return () => timers.forEach(clearTimeout)
  }, [phase, N, animSpeed])

  const done = phase === 3
  // Build set of revealed country codes
  const revealedSet = new Set()
  for (let i = 0; i < revealedCount; i++) {
    revealedSet.add(revealOrder[i]?.code)
  }

  // Country intensity map
  const intensityMap = {}
  for (const c of countries) {
    intensityMap[c.code] = c.count / maxCount
  }

  return (
    <div style={{ maxWidth: 430, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes films a travers <span style={{ color: accent }}>le monde</span>
        </h2>
      </div>

      {/* SVG World Map */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "500/320", marginBottom: 12 }}>
        <svg viewBox="0 0 500 320" style={{ width: "100%", height: "100%" }}>
          {/* All country shapes */}
          {Object.entries(COUNTRY_PATHS).map(([code, path]) => {
            const isRevealed = revealedSet.has(code)
            const isInData = intensityMap[code] !== undefined
            const intensity = intensityMap[code] || 0
            const flickerOpacity = flickerStates[code] || 0

            let fill, opacity
            if (done && isInData) {
              fill = accent
              opacity = 0.2 + intensity * 0.8
            } else if (isRevealed && isInData) {
              fill = accent
              opacity = 0.2 + intensity * 0.8
            } else if (phase === 1 && flickerOpacity > 0) {
              fill = accent
              opacity = flickerOpacity
            } else {
              fill = "white"
              opacity = 0.04
            }

            return (
              <path key={code} d={path} fill={fill} opacity={opacity}
                stroke={isRevealed && isInData ? accent : "rgba(255,255,255,0.06)"}
                strokeWidth={isRevealed && isInData ? "1" : "0.5"}
                style={{ transition: "fill 0.5s, opacity 0.8s, stroke 0.5s" }}
              />
            )
          })}
        </svg>
      </div>

      {/* Top 3 countries with flags */}
      {(done || revealedCount > 0) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8, animation: done ? "slide-up 0.5s ease both" : "none" }}>
          {countries.slice(0, 3).map((c, i) => {
            const isShown = done || revealedSet.has(c.code)
            if (!isShown) return null
            const medals = ["🥇", "🥈", "🥉"]
            return (
              <div key={c.code} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                background: i === 0 ? accent + "12" : "rgba(255,255,255,0.02)",
                border: "1px solid " + (i === 0 ? accent + "30" : "rgba(255,255,255,0.05)"),
                animation: "slide-up 0.4s ease " + (i * 0.15) + "s both",
              }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{FLAGS[c.code] || medals[i]}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? accent : "white" }}>{c.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono,monospace" }}>{c.count} films</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Remaining countries list */}
      {done && countries.length > 3 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", animation: "slide-up 0.4s ease 0.3s both" }}>
          {countries.slice(3).map((c) => (
            <span key={c.code} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              fontSize: 10, color: "rgba(255,255,255,0.5)",
            }}>
              {FLAGS[c.code] || ""} {c.name} <span style={{ color: accent, fontFamily: "JetBrains Mono,monospace" }}>{c.count}</span>
            </span>
          ))}
        </div>
      )}

      {done && (
        <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          {countries.length} pays representes dans tes films
        </div>
      )}
    </div>
  )
}
