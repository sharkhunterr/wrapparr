import { useState, useEffect, useRef } from "react"

const MUTHUR_LINES = [
  "INTERFACE MUTHUR 6000 v2.4.1",
  "WEYLAND-YUTANI CORP // ACCES AUTORISE",
  "CHARGEMENT DONNEES SUJET...",
  "ANALYSE EN COURS ███████░░ 78%",
  "PROTOCOLE DE SURVEILLANCE ACTIF",
  "PRIORITE: SPECIMEN // EQUIPAGE DISPENSABLE",
  "SIGNAL RECU // COORDONNEES LV-426",
  "QUARANTAINE RECOMMANDEE",
  "RAPPORT SPECIAL ORDER 937",
  "COLLECTE DONNEES TERMINEE",
  "TRANSMISSION VERS STATION RELAIS...",
  "ALERTE: FORME DE VIE DETECTEE",
  "NIVEAU DE MENACE: INCONNU",
  "RECOMMANDATION: CONTINUER OBSERVATION",
]

export default function TerminalOverlay() {
  const [lines, setLines] = useState([])
  const [currentText, setCurrentText] = useState("")
  const lineIdx = useRef(0)
  const charIdx = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    const tick = () => {
      const fullLine = MUTHUR_LINES[lineIdx.current % MUTHUR_LINES.length]
      if (charIdx.current <= fullLine.length) {
        setCurrentText(fullLine.slice(0, charIdx.current))
        charIdx.current++
        timerRef.current = setTimeout(tick, 30 + Math.random() * 50)
      } else {
        // Line complete -- pause then move to next
        timerRef.current = setTimeout(() => {
          setLines(prev => {
            const next = [...prev, fullLine]
            return next.length > 6 ? next.slice(-6) : next
          })
          setCurrentText("")
          charIdx.current = 0
          lineIdx.current++
          timerRef.current = setTimeout(tick, 800 + Math.random() * 1500)
        }, 1200)
      }
    }
    timerRef.current = setTimeout(tick, 500)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, pointerEvents: "none",
      padding: "6px 12px", fontFamily: "'VT323',monospace", fontSize: 13,
      background: "linear-gradient(180deg, rgba(0,4,0,0.85) 0%, rgba(0,4,0,0.5) 70%, transparent 100%)",
    }}>
      <div style={{ color: "rgba(0,255,65,0.12)", fontSize: 10, letterSpacing: "0.2em", marginBottom: 3 }}>
        MUTHUR 6000 // TERMINAL ACTIF
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ color: "rgba(0,255,65,0.15)", fontSize: 11, lineHeight: 1.4 }}>
          {">"} {l}
        </div>
      ))}
      {currentText && (
        <div style={{ color: "rgba(0,255,65,0.3)", fontSize: 11, lineHeight: 1.4 }}>
          {">"} {currentText}<span style={{ animation: "th-blink-cursor 0.8s step-end infinite", borderRight: "1px solid rgba(0,255,65,0.5)" }}>&nbsp;</span>
        </div>
      )}
    </div>
  )
}
