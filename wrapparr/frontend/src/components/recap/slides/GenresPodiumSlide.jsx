import { useState, useEffect } from "react"
import { Lbl } from "../SharedUI"

const GENRE_COLORS = ["#E5A00D", "#fb923c", "#c084fc", "#34d399", "#60a5fa", "#f87171", "#fbbf24", "#a78bfa"]
const BAR_DELAYS = [0.3, 0.5, 0.7, 0.9, 1.1, 1.3]

export default function GenresPodiumSlide({ accent, genres = [], year }) {
  const [revealed, setRevealed] = useState(false)
  useEffect(() => { const t = setTimeout(() => setRevealed(true), 600); return () => clearTimeout(t) }, [])

  if (!genres.length) return null
  const max = genres[0]?.v || 1

  return (
    <div style={{ maxWidth: 430, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(20px, 6vw, 32px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes genres <span style={{ color: accent }}>preferes</span>
        </h2>
      </div>

      {/* Top 3 podium style */}
      {genres.length >= 3 && (
        <div className="s1" style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          {[genres[1], genres[0], genres[2]].map((g, i) => {
            const isFirst = i === 1
            const heights = [80, 110, 65]
            const ranks = ["🥈", "🥇", "🥉"]
            const color = GENRE_COLORS[i] || accent
            return (
              <div key={g.n} style={{
                flex: isFirst ? 1.2 : 1, display: "flex", flexDirection: "column", alignItems: "center",
                opacity: revealed ? 1 : 0, transform: revealed ? "translateY(0)" : "translateY(30px)",
                transition: "all 0.6s ease " + (0.3 + i * 0.2) + "s",
              }}>
                <div style={{ fontSize: isFirst ? 28 : 20, marginBottom: 6 }}>{ranks[i]}</div>
                <div style={{ fontSize: isFirst ? 14 : 12, fontWeight: 700, color: "white", textAlign: "center", marginBottom: 4 }}>{g.n}</div>
                <div style={{ fontSize: 10, color: accent, fontFamily: "JetBrains Mono,monospace", marginBottom: 8 }}>{g.v} vues</div>
                <div style={{
                  width: "100%", height: heights[i], borderRadius: "8px 8px 0 0",
                  background: "linear-gradient(180deg," + color + "40 0%," + color + "15 100%)",
                  border: "1px solid " + color + "50", borderBottom: "none",
                  boxShadow: isFirst ? "0 -4px 30px " + color + "30" : "none",
                  animation: revealed ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none",
                }} />
              </div>
            )
          })}
        </div>
      )}

      {/* Full list with bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {genres.map((g, i) => {
          const pct = Math.round((g.v / max) * 100)
          const color = GENRE_COLORS[i % GENRE_COLORS.length]
          return (
            <div key={g.n} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "8px 12px",
              background: "rgba(255,255,255,0.02)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.04)",
              animation: revealed ? "slide-up .4s ease " + BAR_DELAYS[i] + "s both" : "none",
            }}>
              <div style={{ width: 24, textAlign: "center", fontSize: 12, fontWeight: 700, color: color }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{g.n}</span>
                  <span style={{ fontSize: 10, color: color, fontFamily: "JetBrains Mono,monospace" }}>{g.v}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", background: "linear-gradient(90deg," + color + "," + color + "80)",
                    width: pct + "%", borderRadius: 2, transformOrigin: "left",
                    animation: revealed ? "bar-grow .8s ease " + BAR_DELAYS[i] + "s both" : "none",
                  }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
