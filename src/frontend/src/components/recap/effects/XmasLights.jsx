import { useState, useEffect, useRef } from "react"

const XMAS_WORDS = ["RUN", "HELP", "HERE", "HIDE", "WILL", "MIKE", "TRAP", "DARK", "GATE", "LOST", "FIND", "DEMO"]

export default function XmasLights() {
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const bulbColors = ["#ff2020", "#ffdd00", "#20ff40", "#2080ff", "#ff8800", "#ff20aa", "#20ddff", "#aaff20"]
  const rows = [ALPHA.slice(0, 9), ALPHA.slice(9, 18), ALPHA.slice(18)]
  const rowBulbs = useRef(rows.map((letters, row) =>
    letters.split("").map((letter, i) => ({
      letter, color: bulbColors[(row * 9 + i) % bulbColors.length],
      droopY: 5 + Math.sin((row * 9 + i) * 0.6) * 4 + Math.random() * 3,
    }))
  )).current

  const [litLetter, setLitLetter] = useState(-1)

  useEffect(() => {
    let wordIdx = 0, charIdx = 0, timer
    const nextChar = () => {
      const word = XMAS_WORDS[wordIdx % XMAS_WORDS.length]
      if (charIdx < word.length) {
        setLitLetter(word.charCodeAt(charIdx) - 65)
        charIdx++
        timer = setTimeout(nextChar, 350 + Math.random() * 200)
      } else {
        setLitLetter(-1)
        charIdx = 0
        wordIdx++
        timer = setTimeout(nextChar, 1200 + Math.random() * 800)
      }
    }
    timer = setTimeout(nextChar, 500)
    return () => clearTimeout(timer)
  }, [])

  const [intensities, setIntensities] = useState(() => Array(26).fill(0.02))
  useEffect(() => {
    const id = setInterval(() => {
      setIntensities(prev => prev.map((v, i) => {
        const target = i === litLetter ? 1 : 0.02
        return v + (target - v) * 0.15
      }))
    }, 33)
    return () => clearInterval(id)
  }, [litLetter])

  return (
    <div style={{ position: "fixed", top: 30, left: 0, right: 0, zIndex: 200, pointerEvents: "none" }}>
      {rowBulbs.map((bulbs, row) => {
        const offset = row === 0 ? 0 : row === 1 ? 9 : 18
        const count = bulbs.length
        return (
          <div key={row} style={{ position: "relative", height: 52, marginBottom: -8 }}>
            <svg width="100%" height="22" viewBox="0 0 1000 22" preserveAspectRatio="none" style={{ position: "absolute", top: 0 }}>
              <path d={bulbs.map((b, i) => {
                const pad = 50
                const x = pad + (i / Math.max(1, count - 1)) * (1000 - pad * 2)
                const nx = pad + (Math.min(i + 1, count - 1) / Math.max(1, count - 1)) * (1000 - pad * 2)
                return i === 0 ? `M${x},4 Q${(x + nx) / 2},${b.droopY + 4} ${nx},4` : `Q${(x + nx) / 2},${b.droopY + 4} ${nx},4`
              }).join(" ")} fill="none" stroke="rgba(100,100,80,0.25)" strokeWidth="1" />
            </svg>
            {bulbs.map((b, i) => {
              const gi = offset + i
              const x = 5 + ((i + 0.5) / count) * 90
              const intensity = intensities[gi] || 0.02
              const bright = intensity > 0.15
              return (
                <div key={gi} style={{
                  position: "absolute", left: x + "%", top: b.droopY, transform: "translateX(-50%)",
                  display: "flex", flexDirection: "column", alignItems: "center",
                }}>
                  <div style={{ width: 1, height: 5, background: "rgba(100,100,80,0.2)" }} />
                  <div style={{
                    width: 6, height: 8, borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%",
                    background: bright ? b.color : "rgba(60,55,40,0.12)",
                    opacity: 0.15 + intensity * 0.85,
                    boxShadow: bright ? `0 0 ${intensity * 12}px ${b.color}${Math.round(intensity * 40).toString(16).padStart(2, "0")}` : "none",
                    transition: "opacity 0.12s ease",
                  }} />
                  <div style={{
                    fontSize: 17, fontFamily: "'Indie Flower',cursive", fontWeight: 400,
                    marginTop: 2, lineHeight: 1,
                    background: `linear-gradient(to bottom, ${b.color} 0%, ${b.color}20 85%, transparent 100%)`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                    opacity: 0.03 + intensity * 0.95,
                    filter: bright ? `drop-shadow(0 -1px ${intensity * 5}px ${b.color}30)` : "none",
                    transition: "opacity 0.12s ease, filter 0.12s ease",
                  }}>{b.letter}</div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}
