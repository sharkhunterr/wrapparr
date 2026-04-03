import { useState, useEffect, useRef, useCallback } from "react"
import { useActive, Tag, AN } from "../SharedUI"

function SliderInput({ value, onChange, min, max, step, accent, disabled, label, unit }) {
  const trackRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const computeValue = useCallback((clientX) => {
    if (!trackRef.current) return value
    const rect = trackRef.current.getBoundingClientRect()
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const raw = min + pct * (max - min)
    return Math.round(raw / step) * step
  }, [min, max, step, value])

  const handleStart = (clientX) => {
    if (disabled) return
    setDragging(true)
    onChange(computeValue(clientX))
  }

  useEffect(() => {
    if (!dragging) return
    const handleMove = (e) => {
      const x = e.touches ? e.touches[0].clientX : e.clientX
      onChange(computeValue(x))
    }
    const handleEnd = () => setDragging(false)
    window.addEventListener("mousemove", handleMove)
    window.addEventListener("touchmove", handleMove, { passive: true })
    window.addEventListener("mouseup", handleEnd)
    window.addEventListener("touchend", handleEnd)
    return () => {
      window.removeEventListener("mousemove", handleMove)
      window.removeEventListener("touchmove", handleMove)
      window.removeEventListener("mouseup", handleEnd)
      window.removeEventListener("touchend", handleEnd)
    }
  }, [dragging, computeValue, onChange])

  const pct = ((value - min) / (max - min)) * 100

  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "var(--th-text-muted)" }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>
          {value}{unit}
        </span>
      </div>
      <div
        ref={trackRef}
        onMouseDown={e => handleStart(e.clientX)}
        onTouchStart={e => handleStart(e.touches[0].clientX)}
        style={{
          position: "relative", height: 32, cursor: disabled ? "default" : "pointer",
          display: "flex", alignItems: "center", touchAction: "none",
        }}
      >
        {/* Track */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 6, borderRadius: 3,
          background: "var(--th-surface-subtle)",
        }}>
          <div style={{
            height: "100%", borderRadius: 3, background: accent,
            width: pct + "%", transition: dragging ? "none" : "width .15s ease",
          }} />
        </div>

        {/* Thumb */}
        <div style={{
          position: "absolute", left: `calc(${pct}% - 10px)`,
          width: 20, height: 20, borderRadius: "50%",
          background: accent, border: "2px solid white",
          boxShadow: `0 2px 8px ${accent}50`,
          transition: dragging ? "none" : "left .15s ease",
          transform: dragging ? "scale(1.2)" : "scale(1)",
        }} />

        {/* Min/max labels */}
        <span style={{ position: "absolute", left: 0, top: 22, fontSize: 8, color: "var(--th-text-dim)" }}>{min}{unit}</span>
        <span style={{ position: "absolute", right: 0, top: 22, fontSize: 8, color: "var(--th-text-dim)" }}>{max}{unit}</span>
      </div>
    </div>
  )
}

function ResultReveal({ label, estimated, actual, unit, accent, delay = 0 }) {
  const diff = actual - estimated
  const pctDiff = actual > 0 ? Math.round(Math.abs(diff) / actual * 100) : 0
  const isClose = pctDiff <= 15
  const isExact = pctDiff <= 5

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
      background: isExact ? accent + "12" : isClose ? "rgba(74,222,128,0.06)" : "var(--th-surface-dim)",
      border: "1px solid " + (isExact ? accent + "35" : isClose ? "rgba(74,222,128,0.15)" : "var(--th-border-dim)"),
      animation: `slide-up .4s ease ${delay}s both`,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 10, color: "var(--th-text-muted)", marginBottom: 2 }}>{label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontSize: 9, color: "var(--th-text-dim)", textDecoration: "line-through" }}>
            {estimated}{unit}
          </span>
          <span style={{ fontSize: 8, color: "var(--th-text-dim)" }}>→</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>
            {actual}{unit}
          </span>
        </div>
      </div>
      <div style={{
        padding: "3px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700,
        background: isExact ? accent + "20" : isClose ? "rgba(74,222,128,0.12)" : "rgba(248,113,113,0.1)",
        color: isExact ? accent : isClose ? "#4ade80" : "#f87171",
      }}>
        {isExact ? "Exact !" : diff > 0 ? `+${Math.abs(diff)}${unit}` : `-${Math.abs(diff)}${unit}`}
      </div>
    </div>
  )
}

function buildEstimations(data, section) {
  const estimations = []
  const svcData = data.tautulli || data.plex || data.jellyfin || {}
  const mediaKey = section === "series" ? "series" : "films"
  const extra = svcData.extra?.[mediaKey] || svcData.extra || {}

  if (section === "films" || section === "series") {
    const totalItems = extra.total || svcData.total_items || 0
    const totalHours = Math.round(extra.hours || svcData.total_hours || 0)
    const ratings = extra.ratings || svcData.extra?.ratings || []
    const avgRating = ratings.length > 0 ? +(ratings.reduce((s, r) => s + r.r, 0) / ratings.length).toFixed(1) : 0

    if (totalItems > 0) {
      estimations.push({
        key: "items",
        label: section === "series" ? "Combien d'episodes cette annee ?" : "Combien de films cette annee ?",
        unit: "",
        actual: totalItems,
        min: 0,
        max: Math.max(totalItems * 3, 50),
        step: 1,
        default: Math.round(totalItems * 0.6),
      })
    }

    if (totalHours > 0) {
      estimations.push({
        key: "hours",
        label: "Combien d'heures au total ?",
        unit: "h",
        actual: totalHours,
        min: 0,
        max: Math.max(totalHours * 3, 100),
        step: 1,
        default: Math.round(totalHours * 0.7),
      })
    }

    if (avgRating > 0) {
      estimations.push({
        key: "rating",
        label: "Ta note moyenne estimee ?",
        unit: "/10",
        actual: avgRating,
        min: 0,
        max: 10,
        step: 0.1,
        default: 6.5,
      })
    }
  }

  if (section === "audiobook") {
    const absData = data.audiobookshelf || {}
    const totalBooks = absData.total_items || 0
    const totalH = Math.round(absData.total_hours || 0)

    if (totalBooks > 0) {
      estimations.push({
        key: "books", label: "Combien de livres ecoutes ?", unit: "",
        actual: totalBooks, min: 0, max: Math.max(totalBooks * 3, 20), step: 1,
        default: Math.round(totalBooks * 0.5),
      })
    }
    if (totalH > 0) {
      estimations.push({
        key: "hours", label: "Combien d'heures d'ecoute ?", unit: "h",
        actual: totalH, min: 0, max: Math.max(totalH * 3, 50), step: 1,
        default: Math.round(totalH * 0.6),
      })
    }
  }

  if (section === "demandes") {
    const ov = data.overseerr || {}
    if (ov.total > 0) {
      estimations.push({
        key: "requests", label: "Combien de demandes cette annee ?", unit: "",
        actual: ov.total, min: 0, max: Math.max(ov.total * 3, 30), step: 1,
        default: Math.round(ov.total * 0.5),
      })
      if (ov.match_rate > 0) {
        estimations.push({
          key: "match", label: "Quel % de tes demandes as-tu regarde ?", unit: "%",
          actual: ov.match_rate, min: 0, max: 100, step: 1,
          default: 50,
        })
      }
    }
  }

  return estimations.slice(0, 3)
}

export default function EstimationSlide({ accent, data, year, section = "films", config = {}, onInteraction }) {
  const active = useActive()
  const estimations = buildEstimations(data, section)
  const [values, setValues] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  // Init default values
  useEffect(() => {
    const defaults = {}
    for (const est of estimations) defaults[est.key] = est.default
    setValues(defaults)
  }, [])

  const handleSubmit = () => {
    let pts = 0
    for (const est of estimations) {
      const v = values[est.key] ?? est.default
      const pct = est.actual > 0 ? Math.abs(v - est.actual) / est.actual : 0
      if (pct <= 0.05) pts += 3
      else if (pct <= 0.15) pts += 2
      else if (pct <= 0.30) pts += 1
    }
    setScore(pts)
    setSubmitted(true)
    const answers = estimations.map(est => ({
      label: est.label,
      estimated: Math.round((values[est.key] ?? est.default) * 10) / 10,
      actual: est.actual,
      unit: est.unit,
    }))
    onInteraction?.({ slideType: "estimation", score: pts, total: estimations.length * 3, answers })
  }

  if (!estimations.length) return null

  const maxScore = estimations.length * 3
  const sectionLabels = {
    films: "Films", series: "Series", audiobook: "Livres Audio",
    demandes: "Demandes", community: "Communaute",
  }

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 480px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 14 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          A ton <span style={{ color: accent }}>avis</span> ?
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          {sectionLabels[section] || section} — Estime tes stats avant de decouvrir la realite
        </div>
      </div>

      {!submitted ? (
        <div className="glass s1" style={{ padding: "16px 14px" }}>
          {estimations.map((est) => (
            <SliderInput
              key={est.key}
              value={values[est.key] ?? est.default}
              onChange={v => setValues(prev => ({ ...prev, [est.key]: v }))}
              min={est.min} max={est.max} step={est.step}
              accent={accent} disabled={false}
              label={est.label} unit={est.unit}
            />
          ))}

          <button onClick={handleSubmit} style={{
            width: "100%", padding: "10px 16px", borderRadius: 8, border: "none",
            background: accent, color: "white", fontSize: 13, fontWeight: 700,
            cursor: "pointer", marginTop: 10,
            transition: "transform .15s ease, box-shadow .15s ease",
            boxShadow: `0 4px 14px ${accent}40`,
          }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.02)" }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)" }}
          >
            Voir la realite
          </button>
        </div>
      ) : (
        <div className="s2" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {estimations.map((est, i) => (
            <ResultReveal
              key={est.key}
              label={est.label}
              estimated={Math.round((values[est.key] ?? est.default) * 10) / 10}
              actual={est.actual}
              unit={est.unit}
              accent={accent}
              delay={i * 0.15}
            />
          ))}

          {/* Score */}
          <div style={{
            textAlign: "center", padding: "14px", borderRadius: 10,
            background: accent + "0a", border: "1px solid " + accent + "20",
            animation: `slide-up .5s ease ${estimations.length * 0.15 + 0.1}s both`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>
              {score >= maxScore * 0.8 ? "🎯" : score >= maxScore * 0.5 ? "👏" : "😮"}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)" }}>
              {score}/{maxScore}
            </div>
            <div style={{ fontSize: 11, color: "var(--th-text-secondary)", marginTop: 2 }}>
              {score >= maxScore * 0.8 ? "Tu te connais par coeur !"
                : score >= maxScore * 0.5 ? "Pas mal du tout !"
                : "Tes habitudes t'ont surpris !"}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
