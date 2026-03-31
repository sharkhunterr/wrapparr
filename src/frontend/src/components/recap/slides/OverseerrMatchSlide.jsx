import { useState } from "react"
import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl } from "../SharedUI"

export default function OverseerrMatchSlide({ accent, data, year }) {
  const L = useLabels()
  const active = useActive()
  const ov = data?.overseerr
  if (!ov || (!ov.matched?.length && !ov.not_watched?.length)) return null

  const matchRate = ov.match_rate || 0
  const matched = ov.matched || []
  const notWatched = ov.not_watched || []

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 10px", borderRadius: "var(--th-radius-pill)", background: accent + "15", border: "1px solid " + accent + "30", marginBottom: 6, fontSize: 9, color: accent, fontWeight: 700 }}>
          📋 OVERSEERR
        </div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Demande vs <span style={{ color: accent }}>regarde</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          As-tu vraiment regarde ce que tu as demande ?
        </div>
      </div>

      {/* Match rate gauge */}
      <div className="glass s1" style={{ padding: "14px 16px", marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 800, color: matchRate >= 70 ? "#4ade80" : matchRate >= 40 ? accent : "#f87171", fontFamily: "var(--th-font-mono)" }}>
          {active ? <AN t={matchRate} s="%" /> : "0%"}
        </div>
        <div style={{ fontSize: 11, color: "var(--th-text-secondary)", marginTop: 2 }}>
          de tes demandes regardees
        </div>
        <div style={{ height: 6, borderRadius: 3, background: "var(--th-surface-subtle)", marginTop: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 3,
            background: matchRate >= 70 ? "#4ade80" : matchRate >= 40 ? accent : "#f87171",
            width: (active ? matchRate : 0) + "%",
            transition: "width 1.5s ease",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span style={{ fontSize: 9, color: "#4ade80" }}>{matched.length} regarde{matched.length > 1 ? "s" : ""}</span>
          <span style={{ fontSize: 9, color: "var(--th-text-dim)" }}>{notWatched.length} pas encore {notWatched.length > 1 ? "vus" : "vu"}</span>
        </div>
      </div>

      {/* Matched list */}
      {matched.length > 0 && (
        <div className="s2" style={{ marginBottom: 10 }}>
          <Lbl c="#4ade80" size={8}>✓ Demande et regarde</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {matched.slice(0, 5).map((item, i) => (
              <MatchItem key={item.title + i} item={item} accent={accent} watched i={i} />
            ))}
          </div>
        </div>
      )}

      {/* Not watched list */}
      {notWatched.length > 0 && (
        <div className="s3">
          <Lbl c="var(--th-text-dim)" size={8}>En attente de visionnage</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {notWatched.slice(0, 5).map((item, i) => (
              <MatchItem key={item.title + i} item={item} accent={accent} watched={false} i={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchItem({ item, accent, watched, i }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center", padding: "5px 10px", borderRadius: 8,
      background: watched ? "rgba(34,197,94,0.06)" : "var(--th-surface-dim)",
      border: "1px solid " + (watched ? "rgba(34,197,94,0.15)" : "var(--th-border-dim)"),
      animation: "slide-up .35s ease " + (0.08 + i * 0.05) + "s both",
    }}>
      {item.poster && <img src={item.poster} alt="" style={{ width: 24, height: 34, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
        <span style={{ fontSize: 9, color: accent + "80" }}>{item.type === "movie" ? "Film" : "Serie"}</span>
      </div>
      <span style={{ fontSize: 12, flexShrink: 0 }}>{watched ? "✅" : "⏳"}</span>
    </div>
  )
}
