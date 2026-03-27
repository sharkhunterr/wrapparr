import { useState, useEffect } from "react"
import { useComparison } from "../SharedUI"

const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Crect fill='%23222' width='80' height='80'/%3E%3Ccircle cx='40' cy='30' r='14' fill='%23444'/%3E%3Cellipse cx='40' cy='70' rx='22' ry='18' fill='%23444'/%3E%3C/svg%3E"

function PersonCard({ person, index, accent, revealed, rank }) {
  return (
    <div style={{
      perspective: 800,
      width: "100%",
    }}>
      <div style={{
        position: "relative",
        transformStyle: "preserve-3d",
        transform: revealed ? "rotateY(0deg)" : "rotateY(90deg)",
        transition: `transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${index * 0.15}s`,
        backfaceVisibility: "hidden",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", borderRadius: 12,
          background: rank === 0
            ? `linear-gradient(135deg, ${accent}12, ${accent}06)`
            : "rgba(255,255,255,0.02)",
          border: `1px solid ${rank === 0 ? accent + "30" : "rgba(255,255,255,0.05)"}`,
        }}>
          {/* Photo */}
          <div style={{
            width: 52, height: 52, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
            border: `2px solid ${rank === 0 ? accent : "rgba(255,255,255,0.08)"}`,
            boxShadow: rank === 0 ? `0 0 16px ${accent}30` : "none",
          }}>
            <img
              src={person.photo || FALLBACK_AVATAR}
              alt={person.name}
              onError={(e) => { e.target.src = FALLBACK_AVATAR }}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{
                fontSize: 13, fontWeight: 700,
                color: rank === 0 ? accent : "white",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{person.name}</span>
              {rank === 0 && <span style={{ fontSize: 14 }}>⭐</span>}
            </div>
            <div style={{
              fontSize: 9, color: "rgba(255,255,255,0.35)",
              marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {person.films.join(" · ")}
            </div>
          </div>

          {/* Count badge */}
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "4px 10px", borderRadius: 8, flexShrink: 0,
            background: rank === 0 ? accent + "15" : "rgba(255,255,255,0.03)",
            border: `1px solid ${rank === 0 ? accent + "25" : "rgba(255,255,255,0.04)"}`,
          }}>
            <div style={{
              fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, lineHeight: 1,
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

export default function FavoriteActorsSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 12000
  const minAppearances = config.minAppearances || 2
  const maxCards = config.maxCards || 6
  const actors = (data?.extra?.actors || []).filter((a) => a.count >= minAppearances).slice(0, maxCards)
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevActors = (prevSvc?.films?.actors?.previous || prevSvc?.actors?.previous || []).slice(0, 3)

  const [phase, setPhase] = useState(0) // 0=idle, 1=reveal cards, 2=done
  const [revealedCount, setRevealedCount] = useState(0)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 500))
    // Stagger card reveals
    const perCard = (animSpeed * 0.5) / Math.max(1, actors.length)
    for (let i = 0; i < actors.length; i++) {
      t.push(setTimeout(() => setRevealedCount(i + 1), 500 + i * perCard))
    }
    t.push(setTimeout(() => setPhase(2), 500 + animSpeed * 0.7))
    return () => t.forEach(clearTimeout)
  }, [animSpeed, actors.length])

  if (!actors.length) return null

  const done = phase >= 2

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 560px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes acteurs <span style={{ color: accent }}>favoris</span>
        </h2>
        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
          Les visages que tu as le plus vus cette annee
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {actors.map((actor, i) => (
          <PersonCard
            key={actor.id}
            person={actor}
            index={i}
            accent={accent}
            revealed={i < revealedCount}
            rank={i}
          />
        ))}
      </div>

      {done && (
        <div style={{ marginTop: 12, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center", animation: "slide-up 0.4s ease both" }}>
          {actors.length} acteurs presents dans plusieurs de tes films
        </div>
      )}

      {/* Previous year top 3 actors */}
      {done && prevActors.length > 0 && (<>
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 6 }}>{year - 1}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {prevActors.map((a, i) => (
            <div key={a.n + i} style={{ display: "flex", alignItems: "center", gap: 8, animation: "slide-up 0.4s ease " + (i * 0.1) + "s both" }}>
              <span style={{ width: 16, fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", textAlign: "center", flexShrink: 0 }}>{i + 1}</span>
              <img src={a.photo || FALLBACK_AVATAR} alt="" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", flexShrink: 0, opacity: 0.6 }} onError={(e) => { e.target.src = FALLBACK_AVATAR }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.n}</div>
              </div>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{a.count} films</span>
            </div>
          ))}
        </div>
      </>)}
    </div>
  )
}
