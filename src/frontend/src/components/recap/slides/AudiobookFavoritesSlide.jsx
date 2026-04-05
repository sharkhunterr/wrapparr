import { useActive, AN, Tag, Lbl, useComparison } from "../SharedUI"

function PenIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
}
function MicIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" /><path d="M19 10v2a7 7 0 01-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
}

export default function AudiobookFavoritesSlide({ accent, data, year, serviceType }) {
  const active = useActive()
  const comp = useComparison()
  const topAuthors = data.extra?.top_authors || []
  const topNarrators = data.extra?.top_narrators || []
  const timeUnit = data.extra?.time_unit || "h"

  if (!topAuthors.length && !topNarrators.length) return null

  const maxAuthorHours = topAuthors[0]?.hours || 1
  const maxNarratorHours = topNarrators[0]?.hours || 1
  const opacities = [1, 0.8, 0.65, 0.5, 0.35]

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Tes voix <span style={{ color: accent }}>préférées</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          Les auteurs et narrateurs que tu as le plus écoutés
        </div>
      </div>

      {/* Top authors */}
      {topAuthors.length > 0 && (
        <div className="s1" style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <PenIcon size={14} color={accent} />
            <Lbl c={accent} size={9}>Auteurs favoris</Lbl>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {topAuthors.map((a, i) => (
              <div key={a.name} style={{
                animation: "slide-up .4s ease " + (0.1 + i * 0.06) + "s both",
                padding: "6px 10px", borderRadius: "var(--th-radius-xs)",
                background: i === 0 ? accent + "0c" : "transparent",
                border: i === 0 ? "1px solid " + accent + "25" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)", fontFamily: "var(--th-font-mono)", width: 18, flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: i === 0 ? 800 : 500, color: i === 0 ? accent : "var(--th-text-secondary)" }}>
                    {a.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>
                    {a.hours}{timeUnit}
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: opacities[i] || 0.2,
                    width: (a.hours / maxAuthorHours * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.3 + i * 0.06) + "s both",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top narrators */}
      {topNarrators.length > 0 && (
        <div className="s2">
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <MicIcon size={14} color={accent} />
            <Lbl c={accent} size={9}>Narrateurs favoris</Lbl>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {topNarrators.map((n, i) => (
              <div key={n.name} style={{
                animation: "slide-up .4s ease " + (0.15 + i * 0.06) + "s both",
                padding: "6px 10px", borderRadius: "var(--th-radius-xs)",
                background: i === 0 ? accent + "0c" : "transparent",
                border: i === 0 ? "1px solid " + accent + "25" : "1px solid transparent",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: i < 3 ? accent : "var(--th-text-dim)", fontFamily: "var(--th-font-mono)", width: 18, flexShrink: 0 }}>#{i + 1}</span>
                  <span style={{ fontSize: 12, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: i === 0 ? 800 : 500, color: i === 0 ? accent : "var(--th-text-secondary)" }}>
                    {n.name}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? accent : "var(--th-text-tertiary)", fontFamily: "var(--th-font-mono)" }}>
                    {n.hours}{timeUnit}
                  </span>
                </div>
                <div style={{ height: 5, background: "var(--th-surface-subtle)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: accent,
                    opacity: opacities[i] || 0.2,
                    width: (n.hours / maxNarratorHours * 100) + "%",
                    transformOrigin: "left", animation: "bar-grow .7s ease " + (0.35 + i * 0.06) + "s both",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
