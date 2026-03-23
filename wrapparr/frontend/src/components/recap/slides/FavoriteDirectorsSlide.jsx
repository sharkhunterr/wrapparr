import { useState, useEffect } from "react"

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23222' width='80' height='80'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%23444'/%3E%3Cellipse cx='40' cy='70' rx='22' ry='18' fill='%23444'/%3E%3C/svg%3E"

function DirectorCard({ person, index, accent, revealed, rank }) {
  return (
    <div style={{ perspective: 800, width: "100%" }}>
      <div style={{
        position: "relative",
        transformStyle: "preserve-3d",
        transform: revealed ? "rotateX(0deg)" : "rotateX(-90deg)",
        transition: `transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.18}s`,
        transformOrigin: "top center",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: rank === 0 ? "14px 14px" : "10px 12px", borderRadius: 12,
          background: rank === 0
            ? `linear-gradient(135deg, ${accent}15, ${accent}05)`
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${rank === 0 ? accent + "35" : "rgba(255,255,255,0.05)"}`,
        }}>
          {/* Photo with film strip border */}
          <div style={{
            position: "relative", flexShrink: 0,
          }}>
            <div style={{
              width: rank === 0 ? 58 : 48, height: rank === 0 ? 58 : 48,
              borderRadius: 10, overflow: "hidden",
              border: `2px solid ${rank === 0 ? accent : "rgba(255,255,255,0.1)"}`,
              boxShadow: rank === 0 ? `0 0 20px ${accent}25` : "none",
            }}>
              <img
                src={person.photo || FALLBACK_AVATAR}
                alt={person.name}
                onError={(e) => { e.target.src = FALLBACK_AVATAR }}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </div>
            {rank === 0 && (
              <div style={{
                position: "absolute", top: -6, right: -6,
                fontSize: 16, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
              }}>🎬</div>
            )}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: rank === 0 ? 14 : 12, fontWeight: 700,
              color: rank === 0 ? accent : "white",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>{person.name}</div>
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 3, marginTop: 4,
            }}>
              {person.films.map((film, fi) => (
                <span key={fi} style={{
                  fontSize: 8, padding: "1px 6px", borderRadius: 4,
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis", maxWidth: 120,
                }}>{film}</span>
              ))}
            </div>
          </div>

          {/* Count */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "6px 12px", borderRadius: 8, flexShrink: 0,
            background: rank === 0 ? accent + "15" : "rgba(255,255,255,0.03)",
            border: `1px solid ${rank === 0 ? accent + "25" : "rgba(255,255,255,0.04)"}`,
          }}>
            <div style={{
              fontSize: rank === 0 ? 18 : 15, fontWeight: 800, lineHeight: 1,
              color: rank === 0 ? accent : "white",
              fontFamily: "JetBrains Mono,monospace",
            }}>{person.count}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>films</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FavoriteDirectorsSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 12000
  const minAppearances = config.minAppearances || 2
  const maxCards = config.maxCards || 6
  const directors = (data?.extra?.directors || []).filter((d) => d.count >= minAppearances).slice(0, maxCards)

  const [phase, setPhase] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 500))
    const perCard = (animSpeed * 0.5) / Math.max(1, directors.length)
    for (let i = 0; i < directors.length; i++) {
      t.push(setTimeout(() => setRevealedCount(i + 1), 500 + i * perCard))
    }
    t.push(setTimeout(() => setPhase(2), 500 + animSpeed * 0.7))
    return () => t.forEach(clearTimeout)
  }, [animSpeed, directors.length])

  if (!directors.length) return null

  const done = phase >= 2

  return (
    <div style={{ maxWidth: 460, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes realisateurs <span style={{ color: accent }}>favoris</span>
        </h2>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
          Les createurs derriere tes films preferes
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {directors.map((director, i) => (
          <DirectorCard
            key={director.id}
            person={director}
            index={i}
            accent={accent}
            revealed={i < revealedCount}
            rank={i}
          />
        ))}
      </div>

      {done && (
        <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", animation: "slide-up 0.4s ease both" }}>
          {directors.length} realisateurs presents dans plusieurs de tes films
        </div>
      )}
    </div>
  )
}
