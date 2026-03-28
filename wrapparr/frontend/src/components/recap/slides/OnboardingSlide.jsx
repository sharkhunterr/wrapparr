import { useLabels } from "../ThemeContext"

export default function OnboardingSlide({
  accent, year, slideCount, services, hasComparison, hasMusic,
  comparisonActive, onToggleComparison, allowUserThemes,
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
          Decouvre ton annee en images, stats et classements a travers tes services preferes.
        </p>
      </div>

      {/* Stats du recap */}
      <div className="s1" style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 80, padding: "10px 14px", borderRadius: "var(--th-radius-sm)", background: accent + "10", border: "1px solid " + accent + "25", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>{slideCount}</div>
          <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginTop: 2 }}>slides</div>
        </div>
        <div style={{ flex: 1, minWidth: 80, padding: "10px 14px", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface)", border: "1px solid var(--th-border-dim)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>~{estimatedMin}</div>
          <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginTop: 2 }}>minutes</div>
        </div>
        <div style={{ flex: 1, minWidth: 80, padding: "10px 14px", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface)", border: "1px solid var(--th-border-dim)", textAlign: "center" }}>
          <div style={{ fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>{services.length}</div>
          <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginTop: 2 }}>{services.length > 1 ? "services" : "service"}</div>
        </div>
      </div>

      {/* Sections */}
      <div className="s2 glass" style={{ padding: "12px 14px", marginBottom: 12 }}>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Contenu du recap</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {services.map((s) => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>{s.icon}</span>
              <span style={{ fontSize: "clamp(11px, 1.3vw, 13px)", color: "var(--th-text)", fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>{s.sub}</span>
            </div>
          ))}
          {hasComparison && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2, paddingTop: 6, borderTop: "1px solid var(--th-border-dim)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              <span style={{ fontSize: "clamp(11px, 1.3vw, 13px)", color: "var(--th-text)", fontWeight: 600 }}>Comparaison {year - 1}</span>
              <span style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", marginLeft: "auto" }}>disponible</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions / parametres */}
      <div className="s3" style={{ marginBottom: 12 }}>
        <div style={{ fontSize: "clamp(9px, 1.1vw, 11px)", color: "var(--th-text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Parametres rapides</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Comparison toggle */}
          {hasComparison && (
            <button onClick={onToggleComparison} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
              borderRadius: "var(--th-radius-xs)", border: "1px solid " + (comparisonActive ? accent + "40" : "var(--th-border-dim)"),
              background: comparisonActive ? accent + "12" : "var(--th-surface-dim)",
              cursor: "pointer", width: "100%", textAlign: "left",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={comparisonActive ? accent : "var(--th-text-muted)"} strokeWidth="2" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: comparisonActive ? accent : "var(--th-text)", fontWeight: 600 }}>Comparaison avec {year - 1}</div>
                <div style={{ fontSize: "clamp(8px, 1vw, 9px)", color: "var(--th-text-muted)" }}>Affiche les donnees de l'annee precedente</div>
              </div>
              <div style={{
                width: 32, height: 18, borderRadius: 10, padding: 2,
                background: comparisonActive ? accent : "var(--th-surface)",
                transition: "background 0.2s ease",
              }}>
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", background: "white",
                  transform: comparisonActive ? "translateX(14px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                }} />
              </div>
            </button>
          )}

          {/* Info row: navigation */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            borderRadius: "var(--th-radius-xs)", background: "var(--th-surface-dim)",
            border: "1px solid var(--th-border-dim)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round"><path d="M5 15l7-7 7 7" /></svg>
            <div>
              <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: "var(--th-text)", fontWeight: 600 }}>Navigation</div>
              <div style={{ fontSize: "clamp(8px, 1vw, 9px)", color: "var(--th-text-muted)" }}>Fleches ↑↓ ou swipe pour naviguer entre les slides</div>
            </div>
          </div>

          {/* Info row: topbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
            borderRadius: "var(--th-radius-xs)", background: "var(--th-surface-dim)",
            border: "1px solid var(--th-border-dim)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--th-text-muted)" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            <div>
              <div style={{ fontSize: "clamp(10px, 1.2vw, 12px)", color: "var(--th-text)", fontWeight: 600 }}>Barre d'actions</div>
              <div style={{ fontSize: "clamp(8px, 1vw, 9px)", color: "var(--th-text-muted)" }}>
                En haut a droite : {allowUserThemes ? "theme, " : ""}
                {hasComparison ? "comparaison, " : ""}
                {hasMusic ? "musique, " : ""}
                plein ecran
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="s4" style={{ textAlign: "center", fontSize: "clamp(9px, 1.1vw, 11px)", color: "var(--th-text-dim)" }}>
        Tout est personnalisable par l'administrateur
      </div>
    </div>
  )
}
