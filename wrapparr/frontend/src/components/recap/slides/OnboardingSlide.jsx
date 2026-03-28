import { useLabels } from "../ThemeContext"
import { getAllThemes } from "../themes"

const allThemes = getAllThemes()

function Toggle({ active, onToggle, accent }) {
  return <div onClick={onToggle} style={{
    width: 36, height: 20, borderRadius: 11, padding: 2, cursor: "pointer",
    background: active ? accent : "var(--th-surface)", border: "1px solid " + (active ? accent + "60" : "var(--th-border-dim)"),
    transition: "background 0.2s ease",
  }}>
    <div style={{
      width: 16, height: 16, borderRadius: "50%", background: "white",
      transform: active ? "translateX(16px)" : "translateX(0)",
      transition: "transform 0.2s ease",
    }} />
  </div>
}

export default function OnboardingSlide({
  accent, year, slideCount, hasComparison, hasMusic,
  comparisonActive, onToggleComparison, allowUserThemes,
  currentThemeId, onSelectTheme, musicPlaying, onToggleMusic,
  hasFilms, hasSeries, hasCommunity,
  availableYears, onChangeYear,
}) {
  const L = useLabels()
  const estimatedMin = Math.max(1, Math.round(slideCount * 0.12))

  return (
    <div style={{ maxWidth: "clamp(320px, 88vw, 500px)", width: "100%" }}>
      <div className="s0">
        <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: accent, letterSpacing: "0.3em", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)", textTransform: "uppercase", marginBottom: 7, opacity: 0.8 }}>{L.brand} · {year}</div>
        <h2 style={{ fontSize: "clamp(20px, 5.5vw, 30px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.1, marginBottom: 6 }}>
          Ton recap <span style={{ color: accent }}>{year}</span> est pret
        </h2>
        <p style={{ fontSize: "clamp(11px, 1.4vw, 13px)", color: "var(--th-text-secondary)", lineHeight: 1.5, marginBottom: 16 }}>
          Decouvre ton annee en images, stats et classements.
        </p>
      </div>

      {/* Stats du recap */}
      <div className="s1" style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--th-radius-sm)", background: accent + "10", border: "1px solid " + accent + "25", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>{slideCount}</div>
          <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginTop: 2 }}>slides</div>
        </div>
        <div style={{ flex: 1, padding: "10px 14px", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface)", border: "1px solid var(--th-border-dim)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>~{estimatedMin}</div>
          <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginTop: 2 }}>minutes</div>
        </div>
      </div>

      {/* Contenu */}
      <div className="s2 glass" style={{ padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Au programme</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {hasFilms && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>🎬</span>
              <span style={{ fontSize: "clamp(11px, 1.3vw, 13px)", color: "var(--th-text)", fontWeight: 600 }}>Recap Films</span>
              <span style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>Podium, stats, genres, notes...</span>
            </div>
          )}
          {hasSeries && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>📺</span>
              <span style={{ fontSize: "clamp(11px, 1.3vw, 13px)", color: "var(--th-text)", fontWeight: 600 }}>Recap Series</span>
              <span style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>Top series, habitudes, acteurs...</span>
            </div>
          )}
          {hasCommunity && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>👥</span>
              <span style={{ fontSize: "clamp(11px, 1.3vw, 13px)", color: "var(--th-text)", fontWeight: 600 }}>Recap Communaute</span>
              <span style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>Classements, tendances...</span>
            </div>
          )}
        </div>
      </div>

      {/* Parametres */}
      <div className="s3" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: "var(--th-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Parametres</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Comparison toggle */}
          {hasComparison && (
            <div onClick={onToggleComparison} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--th-radius-xs)", cursor: "pointer",
              border: "1px solid " + (comparisonActive ? accent + "40" : "var(--th-border-dim)"),
              background: comparisonActive ? accent + "08" : "var(--th-surface-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={comparisonActive ? accent : "var(--th-text-muted)"} strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: comparisonActive ? accent : "var(--th-text)", fontWeight: 600 }}>Comparaison {year - 1}</div>
              </div>
              <Toggle active={comparisonActive} onToggle={onToggleComparison} accent={accent} />
            </div>
          )}

          {/* Music toggle */}
          {hasMusic && (
            <div onClick={onToggleMusic} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--th-radius-xs)", cursor: "pointer",
              border: "1px solid " + (musicPlaying ? accent + "40" : "var(--th-border-dim)"),
              background: musicPlaying ? accent + "08" : "var(--th-surface-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={musicPlaying ? accent : "var(--th-text-muted)"} strokeWidth="2" strokeLinecap="round"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: musicPlaying ? accent : "var(--th-text)", fontWeight: 600 }}>Musique</div>
              </div>
              <Toggle active={musicPlaying} onToggle={onToggleMusic} accent={accent} />
            </div>
          )}

          {/* Theme select */}
          {allowUserThemes && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--th-radius-xs)",
              border: "1px solid var(--th-border-dim)", background: "var(--th-surface-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: "var(--th-text)", fontWeight: 600 }}>Theme visuel</div>
              </div>
              <select value={currentThemeId || "glass-dark"} onChange={(e) => onSelectTheme && onSelectTheme(e.target.value)} style={{
                padding: "4px 8px", borderRadius: 4, fontSize: 10,
                background: "var(--th-surface)", border: "1px solid var(--th-border)",
                color: "var(--th-text)", fontFamily: "var(--th-font-mono)",
                outline: "none", cursor: "pointer",
              }}>
                {allThemes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          )}

          {/* Year select */}
          {availableYears && availableYears.length > 1 && (
            <div style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--th-radius-xs)",
              border: "1px solid var(--th-border-dim)", background: "var(--th-surface-dim)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: "var(--th-text)", fontWeight: 600 }}>Annee</div>
              </div>
              <select value={year} onChange={(e) => onChangeYear && onChangeYear(parseInt(e.target.value))} style={{
                padding: "4px 8px", borderRadius: 4, fontSize: 10,
                background: "var(--th-surface)", border: "1px solid var(--th-border)",
                color: "var(--th-text)", fontFamily: "var(--th-font-mono)",
                outline: "none", cursor: "pointer",
              }}>
                {availableYears.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {/* Navigation info */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            borderRadius: "var(--th-radius-xs)", background: "var(--th-surface-dim)",
            border: "1px solid var(--th-border-dim)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round"><path d="M5 15l7-7 7 7" /></svg>
            <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: "var(--th-text)", fontWeight: 600 }}>Navigation</div>
            <div style={{ fontSize: "clamp(8px, 1vw, 9px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>Fleches ↑↓ ou swipe</div>
          </div>
        </div>
      </div>
    </div>
  )
}
