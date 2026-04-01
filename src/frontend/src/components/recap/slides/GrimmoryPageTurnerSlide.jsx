import { useState } from "react"
import { useActive, AN, Tag, Lbl } from "../SharedUI"

function PosterImg({ src, size = 36 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: 5, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.3, color: "rgba(255,255,255,0.15)" }}>?</div>
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: 5, objectFit: "cover", flexShrink: 0, boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }} />
}

export default function GrimmoryPageTurnerSlide({ accent, data, year }) {
  const active = useActive()
  const pageTurners = data.extra?.page_turners || []
  if (!pageTurners.length) return null

  const maxScore = pageTurners[0]?.score || 1

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Livres <span style={{ color: accent }}>addictifs</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          Les livres que tu n'as pas pu lacher
        </div>
      </div>

      <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {pageTurners.map((pt, i) => {
          const scorePercent = maxScore > 0 ? Math.round(pt.score / maxScore * 100) : 0
          return (
            <div key={pt.title + i} style={{
              display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 10,
              background: i === 0 ? accent + "0c" : "var(--th-surface-dim)",
              border: "1px solid " + (i === 0 ? accent + "30" : "var(--th-border-dim)"),
              animation: "slide-up .4s ease " + (0.08 + i * 0.06) + "s both",
              position: "relative", overflow: "hidden",
            }}>
              {i === 0 && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 30%, ${accent}15 50%, transparent 70%)`, animation: "badge-shine 4s ease-in-out 2s infinite", pointerEvents: "none" }} />}
              <PosterImg src={pt.cover} size={34} />
              <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.2 }}>{pt.title}</div>
                <div style={{ fontSize: 9, color: "var(--th-text-tertiary)", marginTop: 2 }}>{pt.author} · {pt.sessions} sessions</div>
                {/* Score bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <div style={{ flex: 1, height: 4, borderRadius: 2, background: "var(--th-surface-subtle)", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 2, background: accent, width: scorePercent + "%", transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both" }} />
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0, position: "relative" }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: i === 0 ? accent : "var(--th-text-secondary)", fontFamily: "var(--th-font-mono)" }}>{pt.score}</span>
                <span style={{ fontSize: 7, color: "var(--th-text-dim)" }}>score</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="s2" style={{ fontSize: 9, color: "var(--th-text-dim)", marginTop: 8, textAlign: "center" }}>
        Score base sur l'acceleration des sessions, la regularite et la vitesse de completion
      </div>
    </div>
  )
}
