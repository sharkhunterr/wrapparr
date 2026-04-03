import { useState, useEffect, useCallback, useRef } from "react"
import { useActive, Tag } from "../SharedUI"

const ANIM_DURATION = 600

function OptionCard({ label, value, unit, thumb, accent, side, selected, revealed, isCorrect, onClick, winner }) {
  const bg = revealed
    ? (isCorrect ? accent + "18" : "var(--th-surface-dim)")
    : (selected === side ? accent + "10" : "var(--th-surface)")
  const border = revealed
    ? (isCorrect ? accent + "45" : "var(--th-border-dim)")
    : (selected === side ? accent + "35" : "var(--th-border)")

  return (
    <button onClick={() => !revealed && onClick(side)} disabled={revealed} style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
      padding: "14px 10px", borderRadius: 12, cursor: revealed ? "default" : "pointer",
      background: bg, border: "1px solid " + border,
      transition: "all .35s ease", transform: revealed && isCorrect ? "scale(1.03)" : "scale(1)",
      position: "relative", overflow: "hidden", minWidth: 0,
    }}>
      {/* Shine on correct */}
      {revealed && isCorrect && (
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 30%, ${accent}20 50%, transparent 70%)`, animation: "badge-shine 2s ease-in-out infinite", pointerEvents: "none" }} />
      )}

      {thumb && <img src={thumb} alt="" style={{
        width: 52, height: 75, borderRadius: 6, objectFit: "cover",
        boxShadow: revealed && isCorrect ? `0 4px 16px ${accent}30` : "0 2px 8px rgba(0,0,0,0.3)",
        transition: "box-shadow .4s ease",
      }} onError={e => { e.target.style.display = "none" }} />}

      <div style={{ fontSize: 12, fontWeight: 700, color: "var(--th-text)", textAlign: "center", lineHeight: 1.2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", position: "relative" }}>
        {label}
      </div>

      {/* Revealed value */}
      {revealed && (
        <div style={{
          fontSize: 18, fontWeight: 800, fontFamily: "var(--th-font-mono)",
          color: isCorrect ? accent : "var(--th-text-muted)",
          animation: "slide-up .4s ease both", position: "relative",
        }}>
          {value}{unit}
        </div>
      )}

      {/* Correct/wrong indicator */}
      {revealed && (
        <div style={{
          position: "absolute", top: 6, right: 6,
          width: 20, height: 20, borderRadius: "50%",
          background: isCorrect ? "#4ade80" : "#f87171",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "slide-up .3s ease .1s both",
        }}>
          {isCorrect
            ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
            : <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
          }
        </div>
      )}
    </button>
  )
}

function buildQuestions(data, section) {
  const questions = []

  if (section === "films" || section === "series") {
    const svcData = data.tautulli || data.plex || data.jellyfin || {}
    const mediaKey = section === "series" ? "series" : "films"
    const extra = svcData.extra?.[mediaKey] || svcData.extra || {}
    const top = extra.top || svcData.top || []
    const genres = extra.genres || svcData.genres || []
    const monthly = extra.monthly || svcData.monthly || []

    // Q: Which film/series did you watch more?
    if (top.length >= 2) {
      for (let i = 0; i < Math.min(top.length - 1, 2); i++) {
        const a = top[i], b = top[i + 1 + Math.floor(Math.random() * Math.min(2, top.length - i - 1))] || top[i + 1]
        if (a && b && a.t !== b.t) {
          const aVal = a.plays || a.h || 1, bVal = b.plays || b.h || 1
          questions.push({
            question: section === "series" ? "Quelle serie as-tu le plus regardee ?" : "Quel film as-tu le plus regarde ?",
            a: { label: a.t, value: aVal, unit: a.plays ? "x" : "h", thumb: a.thumb },
            b: { label: b.t, value: bVal, unit: b.plays ? "x" : "h", thumb: b.thumb },
            winner: aVal >= bVal ? "a" : "b",
          })
        }
      }
    }

    // Q: Which genre dominated?
    if (genres.length >= 2) {
      const g1 = genres[0], g2 = genres[Math.min(1, genres.length - 1)]
      questions.push({
        question: "Quel genre a domine cette annee ?",
        a: { label: g1.n, value: g1.v, unit: "" },
        b: { label: g2.n, value: g2.v, unit: "" },
        winner: g1.v >= g2.v ? "a" : "b",
      })
    }

    // Q: Which month was busier?
    const nonZero = monthly.filter(m => m.v > 0)
    if (nonZero.length >= 2) {
      const sorted = [...nonZero].sort((a, b) => b.v - a.v)
      const m1 = sorted[0], m2 = sorted[Math.min(1, sorted.length - 1)]
      if (m1.m !== m2.m) {
        questions.push({
          question: "Quel mois as-tu ete le plus actif ?",
          a: { label: m1.m, value: m1.v, unit: "" },
          b: { label: m2.m, value: m2.v, unit: "" },
          winner: m1.v >= m2.v ? "a" : "b",
        })
      }
    }
  }

  if (section === "audiobook") {
    const svcData = data.audiobookshelf || {}
    const top = svcData.top || []
    const genres = svcData.genres || []

    if (top.length >= 2) {
      const a = top[0], b = top[1]
      questions.push({
        question: "Quel livre as-tu le plus ecoute ?",
        a: { label: a.t, value: a.h, unit: a.h_unit || "h", thumb: a.thumb },
        b: { label: b.t, value: b.h, unit: b.h_unit || "h", thumb: b.thumb },
        winner: (a.h || 0) >= (b.h || 0) ? "a" : "b",
      })
    }

    if (genres.length >= 2) {
      questions.push({
        question: "Quel genre audio as-tu prefere ?",
        a: { label: genres[0].n, value: genres[0].v, unit: "" },
        b: { label: genres[1].n, value: genres[1].v, unit: "" },
        winner: genres[0].v >= genres[1].v ? "a" : "b",
      })
    }
  }

  if (section === "demandes") {
    const ov = data.overseerr || {}
    questions.push({
      question: "Qu'as-tu le plus demande ?",
      a: { label: "Films", value: ov.movies || 0, unit: "" },
      b: { label: "Series", value: ov.series || 0, unit: "" },
      winner: (ov.movies || 0) >= (ov.series || 0) ? "a" : "b",
    })
  }

  if (section === "community") {
    const users = data.users || {}
    const entries = Object.values(users).filter(u => u && typeof u === "object" && u.name)
    if (entries.length >= 2) {
      const sorted = [...entries].sort((a, b) => {
        const ah = (a.tautulli?.total_hours || a.plex?.total_hours || 0)
        const bh = (b.tautulli?.total_hours || b.plex?.total_hours || 0)
        return bh - ah
      })
      const u1 = sorted[0], u2 = sorted[1]
      const u1h = Math.round(u1.tautulli?.total_hours || u1.plex?.total_hours || 0)
      const u2h = Math.round(u2.tautulli?.total_hours || u2.plex?.total_hours || 0)
      questions.push({
        question: "Qui a regarde le plus cette annee ?",
        a: { label: u1.name, value: u1h, unit: "h" },
        b: { label: u2.name, value: u2h, unit: "h" },
        winner: u1h >= u2h ? "a" : "b",
      })
    }
  }

  return questions.slice(0, 3)
}

export default function ThisOrThatSlide({ accent, data, year, section = "films", config = {}, onInteraction }) {
  const active = useActive()
  const questions = buildQuestions(data, section)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const answers = useRef([])

  const q = questions[current]

  const handleSelect = useCallback((side) => {
    if (revealed || !q) return
    setSelected(side)
    answers.current.push({ question: q.question, chosen: side, correct: q.winner, isCorrect: side === q.winner })
    setTimeout(() => {
      setRevealed(true)
      if (side === q.winner) setScore(s => s + 1)
    }, 300)
  }, [revealed, q])

  const handleNext = useCallback(() => {
    if (current + 1 >= questions.length) {
      setDone(true)
      const finalScore = answers.current.filter(a => a.isCorrect).length
      onInteraction?.({ slideType: "thisorthat", score: finalScore, total: questions.length, answers: answers.current })
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setRevealed(false)
    }
  }, [current, questions.length])

  // Auto-advance after reveal
  useEffect(() => {
    if (!revealed) return
    const t = setTimeout(handleNext, 2200)
    return () => clearTimeout(t)
  }, [revealed, handleNext])

  if (!questions.length) return null

  const sectionLabels = {
    films: "Films", series: "Series", audiobook: "Livres Audio",
    demandes: "Demandes", community: "Communaute", grimmory: "Lecture",
  }

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 480px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 14 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          This or <span style={{ color: accent }}>That</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          {sectionLabels[section] || section} — Teste tes connaissances
        </div>
      </div>

      {!done ? (
        <>
          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 12 }}>
            {questions.map((_, i) => (
              <div key={i} style={{
                width: i === current ? 18 : 6, height: 6, borderRadius: 3,
                background: i < current ? accent : i === current ? accent : "var(--th-surface)",
                transition: "all .3s ease",
              }} />
            ))}
          </div>

          {/* Question */}
          {q && (
            <div className="s1">
              <div style={{
                fontSize: 14, fontWeight: 700, color: "var(--th-text)", textAlign: "center",
                marginBottom: 14, lineHeight: 1.3,
              }}>
                {q.question}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <OptionCard {...q.a} accent={accent} side="a" selected={selected} revealed={revealed}
                  isCorrect={q.winner === "a"} onClick={handleSelect} winner={q.winner} />
                <div style={{
                  display: "flex", alignItems: "center", fontSize: 14, fontWeight: 800,
                  color: accent, fontFamily: "var(--th-font-mono)",
                }}>VS</div>
                <OptionCard {...q.b} accent={accent} side="b" selected={selected} revealed={revealed}
                  isCorrect={q.winner === "b"} onClick={handleSelect} winner={q.winner} />
              </div>
            </div>
          )}
        </>
      ) : (
        /* Score final */
        <div className="glass s2" style={{
          padding: "24px 20px", textAlign: "center",
          animation: "slide-up .5s ease both",
        }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>
            {score === questions.length ? "🏆" : score >= questions.length / 2 ? "👏" : "🤔"}
          </div>
          <div style={{
            fontSize: "clamp(28px, 8vw, 38px)", fontWeight: 800,
            color: accent, fontFamily: "var(--th-font-mono)",
          }}>
            {score}/{questions.length}
          </div>
          <div style={{ fontSize: 13, color: "var(--th-text-secondary)", marginTop: 4 }}>
            {score === questions.length ? "Parfait ! Tu connais tes habitudes !"
              : score >= questions.length / 2 ? "Pas mal ! Tu te connais bien."
              : "Surpris ? Tes habitudes te reservent des surprises !"}
          </div>

          {/* Score bar */}
          <div style={{ height: 6, borderRadius: 3, background: "var(--th-surface-subtle)", marginTop: 14, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3, background: accent,
              width: (score / questions.length * 100) + "%",
              transition: "width 1s ease",
            }} />
          </div>
        </div>
      )}
    </div>
  )
}
