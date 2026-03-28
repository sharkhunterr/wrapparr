import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"
import { useParams } from "react-router-dom"
import { api } from "../../services/api"
import useAuthStore from "../../stores/authStore"
import { RECAP_CSS } from "./recapStyles"
import IntroSlide from "./slides/IntroSlide"
// OverviewSlide removed
import CategorySlide from "./slides/CategorySlide"
import PodiumSlide from "./slides/PodiumSlide"
import ServiceStatsSlide from "./slides/ServiceStatsSlide"
import ServiceDeepSlide from "./slides/ServiceDeepSlide"
import FilmTimelineSlide from "./slides/FilmTimelineSlide"
import WorldMapSlide from "./slides/WorldMapSlide"
import RatingsSlide from "./slides/RatingsSlide"
import BudgetSlide from "./slides/BudgetSlide"
// BilanFilmsSlide + FilmDigestSlide removed (merged into FilmStatsEnrichedSlide)
import FilmStatsEnrichedSlide from "./slides/FilmStatsEnrichedSlide"
import FavoriteActorsSlide from "./slides/FavoriteActorsSlide"
import FavoriteDirectorsSlide from "./slides/FavoriteDirectorsSlide"
import GenresSlide from "./slides/GenresSlide"
import CompareSlide from "./slides/CompareSlide"
import CompareServiceSlide from "./slides/CompareServiceSlide"
import RankingSlide from "./slides/RankingSlide"
import FinaleSlide from "./slides/FinaleSlide"
import { CommunityActivitySlide, CommunityTopSlide, CommunityMostViewedSlide, CommunityRankingsSlide, CommunityGenresSlide, CommunityCompareSlide } from "./slides/CommunitySlides"
import { ComparisonProvider } from "./SharedUI"
import { useResponsive } from "./responsive"
import { THEMES, getTheme, getAllThemes, themeToCSS } from "./themes"
import { ThemeProvider } from "./ThemeContext"

// ── AMBIENT EFFECTS (from prototype) ──
function Orbs({ accent }) {
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {[{ s: 680, x: "-18%", y: "-22%", d: "0s", o: 0.17 }, { s: 360, x: "60%", y: "56%", d: "5s", o: 0.09 }, { s: 220, x: "12%", y: "72%", d: "9s", o: 0.06 }].map((o, i) => (
      <div key={i} style={{ position: "absolute", borderRadius: "50%", width: o.s, height: o.s, left: o.x, top: o.y, background: `radial-gradient(circle,${accent} 0%,transparent 70%)`, opacity: o.o, filter: "blur(58px)", animation: `orb-drift ${10 + i * 3}s ease-in-out ${o.d} infinite`, transition: "background 0.8s ease" }} />
    ))}
  </div>
}

function Stars() {
  const s = useRef(Array.from({ length: 50 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, sz: 0.8 + Math.random() * 2.2, d: Math.random() * 7, dur: 2 + Math.random() * 4 }))).current
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
    {s.map((p, i) => <div key={i} style={{ position: "absolute", left: `${p.x}%`, top: `${p.y}%`, width: p.sz, height: p.sz, borderRadius: "50%", background: "white", opacity: 0, animation: `star-tw ${p.dur}s ease-in-out ${p.d}s infinite` }} />)}
  </div>
}

function Spotlights({ accent, intensity = 1, fixed = false }) {
  const a = (v) => Math.round(v * intensity).toString(16).padStart(2, "0")
  const beams = [
    { left: "12%", w: "18vw", anim: "beam-1", dur: "11s", delay: "0s", op: a(38) },
    { left: "50%", w: "26vw", anim: "beam-3", dur: "17s", delay: "3.5s", op: a(30) },
    { left: "88%", w: "20vw", anim: "beam-2", dur: "9s", delay: "1.2s", op: a(34) },
  ]
  return (
    <div style={{ position: fixed ? "fixed" : "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: fixed ? 2 : 1 }}>
      {beams.map((b, i) => {
        const bg = "linear-gradient(180deg," + accent + b.op + " 0%," + accent + "07 50%,transparent 75%)"
        const anim = b.anim + " " + b.dur + " ease-in-out " + b.delay + " infinite"
        return <div key={i} style={{ position: "absolute", top: "-4%", left: b.left, width: b.w, height: "145%", transformOrigin: "top center", transform: "translateX(-50%)", background: bg, animation: anim, mixBlendMode: "screen" }} />
      })}
      {[12, 50, 88].map((x, i) => {
        const bg = "radial-gradient(circle," + accent + "65 0%," + accent + "22 45%,transparent 72%)"
        const anim = "flare-pulse " + (4.5 + i * 2.5) + "s ease-in-out " + (i * 2) + "s infinite"
        return <div key={i} style={{ position: "absolute", top: 0, left: x + "%", width: 70 + i * 18, height: 70 + i * 18, borderRadius: "50%", background: bg, transform: "translate(-50%,-50%)", animation: anim }} />
      })}
    </div>
  )
}

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

function TypingTitles() {
  // Observes h1/h2/h3 in recap-root and types them character by character
  const processed = useRef(new WeakSet())
  const observer = useRef(null)

  useEffect(() => {
    const animateEl = (el) => {
      if (processed.current.has(el)) return
      processed.current.add(el)

      // Collect all text nodes recursively, preserving structure
      const walk = (node) => {
        const parts = []
        for (const child of node.childNodes) {
          if (child.nodeType === 3) { // text node
            parts.push({ type: "text", node: child, full: child.textContent })
            child.textContent = ""
          } else if (child.nodeType === 1) { // element
            const sub = walk(child)
            parts.push({ type: "el", node: child, children: sub })
          }
        }
        return parts
      }
      const parts = walk(el)

      // Flatten to chars with refs
      const chars = []
      const flatten = (items) => {
        for (const p of items) {
          if (p.type === "text") {
            for (let i = 0; i < p.full.length; i++) {
              chars.push({ textNode: p.node, char: p.full[i], idx: i })
            }
          } else {
            flatten(p.children)
          }
        }
      }
      flatten(parts)

      // Add cursor
      const cursor = document.createElement("span")
      cursor.className = "th-typing-cursor"
      el.appendChild(cursor)

      // Type chars one by one
      let i = 0
      const type = () => {
        if (i >= chars.length) {
          // Done — remove cursor after a moment
          setTimeout(() => cursor.remove(), 1500)
          return
        }
        const c = chars[i]
        c.textNode.textContent += c.char
        i++
        setTimeout(type, 25 + Math.random() * 35)
      }
      setTimeout(type, 200)
    }

    // Observe for new headings appearing (slide changes)
    const root = document.querySelector(".recap-root")
    if (!root) return

    const scan = () => {
      root.querySelectorAll("h1, h2, h3").forEach(animateEl)
    }

    observer.current = new MutationObserver(() => {
      // Reset processed set on DOM changes (new slide)
      scan()
    })
    observer.current.observe(root, { childList: true, subtree: true })
    scan()

    return () => observer.current?.disconnect()
  }, [])

  return null
}

function TerminalOverlay() {
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
        // Line complete — pause then move to next
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

function NoirRain() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const drops = Array.from({ length: 120 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      len: 15 + Math.random() * 25, speed: 8 + Math.random() * 12,
      opacity: 0.03 + Math.random() * 0.06,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (const d of drops) {
        d.y += d.speed; d.x -= d.speed * 0.15
        if (d.y > c.height) { d.y = -d.len; d.x = Math.random() * c.width * 1.2 }
        ctx.save()
        ctx.globalAlpha = d.opacity
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(d.x, d.y)
        ctx.lineTo(d.x - d.len * 0.15, d.y - d.len)
        ctx.stroke()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}

function Bioluminescence() {
  const cv = useRef(null)
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const orbs = Array.from({ length: 20 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.3,
      size: 3 + Math.random() * 8, phase: Math.random() * Math.PI * 2,
      speed: 0.01 + Math.random() * 0.02,
      color: Math.random() > 0.6 ? "#00ffcc" : Math.random() > 0.5 ? "#0088ff" : "#00ccff",
    }))
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (const o of orbs) {
        o.phase += o.speed
        o.x += o.vx + Math.sin(o.phase) * 0.3
        o.y += o.vy + Math.cos(o.phase * 0.7) * 0.2
        if (o.x < -30) o.x = c.width + 30
        if (o.x > c.width + 30) o.x = -30
        if (o.y < -30) o.y = c.height + 30
        if (o.y > c.height + 30) o.y = -30
        const pulse = 0.3 + Math.sin(o.phase * 2) * 0.25
        const sz = o.size * (0.8 + Math.sin(o.phase) * 0.2)
        // Outer glow
        ctx.save()
        ctx.globalAlpha = pulse * 0.08
        const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, sz * 4)
        grad.addColorStop(0, o.color)
        grad.addColorStop(1, "transparent")
        ctx.fillStyle = grad
        ctx.beginPath(); ctx.arc(o.x, o.y, sz * 4, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
        // Core
        ctx.save()
        ctx.globalAlpha = pulse * 0.4
        ctx.fillStyle = o.color
        ctx.shadowBlur = 15; ctx.shadowColor = o.color
        ctx.beginPath(); ctx.arc(o.x, o.y, sz, 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1 }} />
}

function AbyssBubbles() {
  const items = useRef(Array.from({ length: 18 }, () => ({
    x: Math.random() * 100, size: 2 + Math.random() * 5,
    dur: 8 + Math.random() * 14, delay: Math.random() * 10,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
    <style>{`@keyframes th-abubble{0%{transform:translateY(0) scale(1);opacity:0}10%{opacity:0.15}50%{opacity:0.1}100%{transform:translateY(-110vh) scale(0.5);opacity:0}}`}</style>
    {items.map((b, i) => (
      <div key={i} style={{
        position: "absolute", left: b.x + "%", bottom: -10,
        width: b.size, height: b.size, borderRadius: "50%",
        border: "1px solid rgba(0,180,255,0.15)",
        animation: `th-abubble ${b.dur}s ease-in ${b.delay}s infinite`,
        opacity: 0,
      }} />
    ))}
  </div>
}

function Spores() {
  const items = useRef(Array.from({ length: 25 }, () => ({
    x: Math.random() * 100, size: 2 + Math.random() * 5,
    dur: 8 + Math.random() * 12, delay: Math.random() * 8,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
    {items.map((s, i) => (
      <div key={i} className="th-spore" style={{
        left: s.x + "%", bottom: -20, width: s.size, height: s.size,
        animationDuration: s.dur + "s", animationDelay: s.delay + "s",
      }} />
    ))}
  </div>
}


function Waves() {
  return <div className="th-waves">
    <div className="th-wave">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,30 C200,60 400,10 600,35 C800,60 1000,15 1200,40 L1200,80 L0,80 Z" fill="rgba(210,170,100,0.08)" />
      </svg>
    </div>
    <div className="th-wave">
      <svg viewBox="0 0 1200 80" preserveAspectRatio="none">
        <path d="M0,40 C150,15 350,55 550,30 C750,5 950,50 1200,25 L1200,80 L0,80 Z" fill="rgba(210,170,100,0.06)" />
      </svg>
    </div>
  </div>
}

function Compass() {
  return <div className="th-compass">
    <svg viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="23" stroke="rgba(210,170,100,0.3)" strokeWidth="1" />
      <circle cx="25" cy="25" r="18" stroke="rgba(210,170,100,0.15)" strokeWidth="0.5" />
      <path d="M25 2 L27 25 L25 48 L23 25 Z" fill="rgba(210,170,100,0.2)" />
      <path d="M2 25 L25 23 L48 25 L25 27 Z" fill="rgba(210,170,100,0.15)" />
      <text x="25" y="9" textAnchor="middle" fill="rgba(210,170,100,0.4)" fontSize="5" fontFamily="serif">N</text>
    </svg>
  </div>
}

function StarStreaks() {
  const streaks = useRef(Array.from({ length: 14 }, () => ({
    x: 5 + Math.random() * 90,
    len: 50 + Math.random() * 90,
    dur: 1.2 + Math.random() * 2.5,
    delay: Math.random() * 10,
  }))).current
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, overflow: "hidden" }}>
    <style>{`@keyframes th-shoot{0%{transform:translateY(-10%);opacity:0}8%{opacity:1}80%{opacity:0.5}100%{transform:translateY(115vh);opacity:0}}`}</style>
    {streaks.map((s, i) => (
      <div key={i} style={{
        position: "absolute", left: s.x + "%", top: 0,
        width: 1.5, height: s.len, borderRadius: 1,
        background: "linear-gradient(to bottom, transparent 0%, rgba(200,230,255,0.5) 70%, rgba(255,255,255,0.8) 100%)",
        boxShadow: "0 0 6px rgba(200,230,255,0.4)",
        animation: `th-shoot ${s.dur}s linear ${s.delay}s infinite`,
        opacity: 0,
      }} />
    ))}
  </div>
}

function DimensionCrack() {
  // Generate organic branching crack path
  const crack = useRef(() => {
    const segs = []
    let x = 50, y = 0
    const mainLen = 18 + Math.floor(Math.random() * 8)
    for (let i = 0; i < mainLen; i++) {
      const nx = x + (Math.random() - 0.5) * 14
      const ny = y + 3.5 + Math.random() * 3
      segs.push({ x1: x, y1: y, x2: nx, y2: ny, w: 5 - (i / mainLen) * 3, main: true })
      // Branches
      if (Math.random() > 0.45 && i > 1) {
        const bdir = Math.random() > 0.5 ? 1 : -1
        let bx = nx, by = ny
        const blen = 2 + Math.floor(Math.random() * 5)
        for (let j = 0; j < blen; j++) {
          const bnx = bx + bdir * (3 + Math.random() * 8)
          const bny = by + 1.5 + Math.random() * 3
          segs.push({ x1: bx, y1: by, x2: bnx, y2: bny, w: 3 - (j / blen) * 2, main: false })
          bx = bnx; by = bny
        }
      }
      x = nx; y = ny
    }
    return segs
  }).current()

  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, animation: "th-crack-anim 15s ease-in-out infinite", opacity: 0 }}>
    <style>{`
      @keyframes th-crack-anim{0%,82%,100%{opacity:0}84%{opacity:0.9}86%{opacity:0.3}87%{opacity:0.85}89%{opacity:0.5}91%{opacity:0}}
    `}</style>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ filter: "blur(0.3px)" }}>
      {/* Wide glow layer — deep red */}
      {crack.filter(s => s.main).map((s, i) => (
        <line key={"g2" + i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke="rgba(200,0,0,0.1)" strokeWidth={s.w * 3} strokeLinecap="round"
          style={{ filter: "blur(8px)" }}
        />
      ))}
      {/* Medium glow — red */}
      {crack.map((s, i) => (
        <line key={"g" + i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={s.main ? "rgba(220,20,20,0.25)" : "rgba(200,40,30,0.15)"}
          strokeWidth={s.w * 1.5} strokeLinecap="round"
          style={{ filter: "blur(3px)" }}
        />
      ))}
      {/* Core bright line — hot red/white */}
      {crack.map((s, i) => (
        <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}
          stroke={s.main ? "rgba(255,180,160,0.85)" : "rgba(255,80,60,0.5)"}
          strokeWidth={s.w * 0.4} strokeLinecap="round"
        />
      ))}
    </svg>
  </div>
}

function Sabers({ intensity = 1 }) {
  const cv = useRef(null)
  const sparks = useRef([])
  // Combat state machine: idle → approach → clash → retreat → idle
  const combat = useRef({
    phase: "idle", // idle, approach, clash, retreat
    phaseEnd: 2,
    sab: [
      { ox: 0.15, oy: 0, angle: Math.PI * 0.45, targetAngle: Math.PI * 0.45, speed: 0.02 },
      { ox: 0.85, oy: 0, angle: Math.PI * 0.55, targetAngle: Math.PI * 0.55, speed: 0.02 },
    ],
    clashCount: 0,
  })
  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    let time = 0
    const colors = [["#4488ff", "#aaccff"], ["#ff2020", "#ffaaaa"]]
    const opBase = 0.04 + intensity * 0.04
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      time += 1 / 60
      const st = combat.current
      const sb = st.sab
      // Phase transitions
      if (time > st.phaseEnd) {
        if (st.phase === "idle") {
          // After idling, start approaching
          st.phase = "approach"
          st.phaseEnd = time + 0.8 + Math.random() * 0.6
          // Both aim toward center for a clash
          const clashAngle = Math.PI * 0.3 + Math.random() * Math.PI * 0.4
          sb[0].targetAngle = clashAngle - 0.05
          sb[1].targetAngle = Math.PI - clashAngle + 0.05
          sb[0].speed = 0.06 + Math.random() * 0.04
          sb[1].speed = 0.06 + Math.random() * 0.04
        } else if (st.phase === "approach") {
          st.phase = "clash"
          st.phaseEnd = time + 0.15 + Math.random() * 0.1
          st.clashCount++
        } else if (st.phase === "clash") {
          // Sometimes chain 2-3 quick clashes, sometimes retreat
          if (st.clashCount < 3 && Math.random() > 0.45) {
            st.phase = "approach"
            st.phaseEnd = time + 0.3 + Math.random() * 0.4
            const a = Math.PI * 0.25 + Math.random() * Math.PI * 0.5
            sb[0].targetAngle = a
            sb[1].targetAngle = Math.PI - a
            sb[0].speed = 0.08
            sb[1].speed = 0.08
          } else {
            st.phase = "retreat"
            st.phaseEnd = time + 0.6 + Math.random() * 0.8
            st.clashCount = 0
            // Swing wide apart
            sb[0].targetAngle = Math.PI * 0.1 + Math.random() * Math.PI * 0.25
            sb[1].targetAngle = Math.PI * 0.65 + Math.random() * Math.PI * 0.25
            sb[0].speed = 0.04
            sb[1].speed = 0.04
          }
        } else if (st.phase === "retreat") {
          st.phase = "idle"
          st.phaseEnd = time + 1.5 + Math.random() * 2.5
          // Slow random swinging
          sb[0].targetAngle = Math.PI * 0.2 + Math.random() * Math.PI * 0.3
          sb[1].targetAngle = Math.PI * 0.5 + Math.random() * Math.PI * 0.3
          sb[0].speed = 0.015
          sb[1].speed = 0.015
        }
      }
      // During idle, periodically pick new random angles
      if (st.phase === "idle" && Math.random() < 0.008) {
        const which = Math.random() > 0.5 ? 0 : 1
        sb[which].targetAngle = Math.PI * 0.15 + Math.random() * Math.PI * 0.7
      }
      // Interpolate angles
      for (const s of sb) {
        s.angle += (s.targetAngle - s.angle) * s.speed
      }
      const len = Math.max(c.width, c.height) * 0.7
      const tips = sb.map((s) => {
        const px = s.ox * c.width, py = s.oy * c.height
        return { ox: px, oy: py, tx: px + Math.cos(s.angle) * len, ty: py + Math.sin(s.angle) * len }
      })
      // Draw sabers
      for (let s = 0; s < 2; s++) {
        const { ox, oy, tx, ty } = tips[s]
        // Wide glow
        ctx.save()
        ctx.globalAlpha = opBase
        ctx.strokeStyle = colors[s][0]
        ctx.lineWidth = 28
        ctx.lineCap = "round"
        ctx.shadowBlur = 60
        ctx.shadowColor = colors[s][0]
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.restore()
        // Core
        ctx.save()
        ctx.globalAlpha = opBase * 2
        ctx.strokeStyle = colors[s][1]
        ctx.lineWidth = 4
        ctx.lineCap = "round"
        ctx.shadowBlur = 18
        ctx.shadowColor = colors[s][0]
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(tx, ty); ctx.stroke()
        ctx.restore()
      }
      // Check intersection → sparks
      const dx = tips[0].tx - tips[1].tx, dy = tips[0].ty - tips[1].ty
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 80) {
        const mx = (tips[0].tx + tips[1].tx) / 2, my = (tips[0].ty + tips[1].ty) / 2
        const sparkCount = Math.max(1, Math.round(8 * (1 - dist / 80)))
        for (let i = 0; i < sparkCount; i++) {
          const a = Math.random() * Math.PI * 2
          const spd = 3 + Math.random() * 7
          sparks.current.push({
            x: mx + (Math.random() - 0.5) * 10, y: my + (Math.random() - 0.5) * 10,
            vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
            life: 1, color: Math.random() > 0.5 ? colors[0][1] : colors[1][1],
            size: 1 + Math.random() * 2,
          })
        }
      }
      // Draw sparks
      sparks.current = sparks.current.filter(p => p.life > 0.01)
      for (const p of sparks.current) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.98; p.life -= 0.025; p.size *= 0.985
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life * 0.8)
        ctx.fillStyle = p.color
        ctx.shadowBlur = 8; ctx.shadowColor = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.2, p.size), 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [intensity])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2 }} />
}

function MatrixRain() {
  const cols = useRef(Array.from({ length: 35 }, (_, i) => ({
    left: (i / 35) * 100 + Math.random() * 2,
    dur: 4 + Math.random() * 8,
    delay: Math.random() * 6,
    chars: Array.from({ length: 12 + Math.floor(Math.random() * 18) }, () =>
      String.fromCharCode(0x30A0 + Math.floor(Math.random() * 96))
    ).join(""),
    size: 10 + Math.random() * 6,
  }))).current
  return <div className="th-matrix-rain">
    {cols.map((c, i) => (
      <div key={i} className="th-matrix-col" style={{
        left: c.left + "%", fontSize: c.size,
        animationDuration: c.dur + "s", animationDelay: c.delay + "s",
      }}>{c.chars}</div>
    ))}
  </div>
}

const XMAS_WORDS = ["RUN", "HELP", "HERE", "HIDE", "WILL", "MIKE", "TRAP", "DARK", "GATE", "LOST", "DEMO", "FIND"]

function XmasLights() {
  const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const bulbColors = ["#ff2020", "#ffdd00", "#20ff40", "#2080ff", "#ff8800", "#ff20aa", "#20ddff", "#aaff20"]
  const bulbData = useRef(ALPHA.split("").map((letter, i) => ({
    letter, color: bulbColors[i % bulbColors.length],
    droopY: 6 + Math.sin(i * 0.6) * 5 + Math.random() * 3,
  }))).current

  const [litLetter, setLitLetter] = useState(-1) // index in alphabet currently lit

  useEffect(() => {
    let wordIdx = 0, charIdx = 0, timer
    const nextChar = () => {
      const word = XMAS_WORDS[wordIdx % XMAS_WORDS.length]
      if (charIdx < word.length) {
        const letterIndex = word.charCodeAt(charIdx) - 65
        setLitLetter(letterIndex)
        charIdx++
        timer = setTimeout(nextChar, 350 + Math.random() * 200)
      } else {
        // Pause between words
        setLitLetter(-1)
        charIdx = 0
        wordIdx++
        timer = setTimeout(nextChar, 1200 + Math.random() * 800)
      }
    }
    timer = setTimeout(nextChar, 500)
    return () => clearTimeout(timer)
  }, [])

  // Smooth intensity with lerp
  const [intensities, setIntensities] = useState(() => Array(26).fill(0.02))
  useEffect(() => {
    const id = setInterval(() => {
      setIntensities(prev => prev.map((v, i) => {
        const target = i === litLetter ? 1 : 0.02
        return v + (target - v) * 0.18
      }))
    }, 33)
    return () => clearInterval(id)
  }, [litLetter])

  return (
    <div style={{ position: "fixed", top: 35, left: 0, right: 0, zIndex: 200, pointerEvents: "none" }}>
      {/* Single wire */}
      <svg width="100%" height="22" viewBox="0 0 1000 22" preserveAspectRatio="none" style={{ position: "absolute", top: 0 }}>
        <path d={bulbData.map((b, i) => {
          const pad = 30
          const x = pad + (i / 25) * (1000 - pad * 2)
          const nx = pad + (Math.min(i + 1, 25) / 25) * (1000 - pad * 2)
          const midX = (x + nx) / 2
          return i === 0 ? `M${x},4 Q${midX},${b.droopY + 4} ${nx},4` : `Q${midX},${b.droopY + 4} ${nx},4`
        }).join(" ")} fill="none" stroke="rgba(100,100,80,0.3)" strokeWidth="1" />
      </svg>
      {bulbData.map((b, i) => {
        const pad = 3
        const x = pad + ((i + 0.5) / 26) * (100 - pad * 2)
        const intensity = intensities[i] || 0.02
        const bright = intensity > 0.15
        return (
          <div key={i} style={{
            position: "absolute", left: x + "%", top: b.droopY, transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
          }}>
            <div style={{ width: 1, height: 4, background: "rgba(100,100,80,0.2)" }} />
            <div style={{
              width: 5, height: 7, borderRadius: "50% 50% 50% 50% / 35% 35% 65% 65%",
              background: bright ? b.color : "rgba(60,55,40,0.15)",
              opacity: 0.2 + intensity * 0.8,
              boxShadow: bright ? `0 0 ${intensity * 10}px ${b.color}${Math.round(intensity * 50).toString(16).padStart(2,"0")}` : "none",
              transition: "opacity 0.1s ease",
            }} />
            <div style={{
              fontSize: 14, fontFamily: "'Special Elite','Courier Prime',monospace", fontWeight: 800,
              marginTop: 1, lineHeight: 1,
              background: `linear-gradient(to bottom, ${b.color} 0%, ${b.color}25 80%, transparent 100%)`,
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              opacity: 0.03 + intensity * 0.95,
              filter: bright ? `drop-shadow(0 -1px ${intensity * 6}px ${b.color}35)` : "none",
              transition: "opacity 0.1s ease, filter 0.1s ease",
            }}>{b.letter}</div>
          </div>
        )
      })}
    </div>
  )
}

function NoirBlinds() {
  return <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.06,
    background: "repeating-linear-gradient(170deg, transparent 0px, transparent 18px, rgba(255,255,255,0.15) 18px, rgba(255,255,255,0.15) 20px)",
    animation: "th-blinds-sway 8s ease-in-out infinite",
  }}>
    <style>{`@keyframes th-blinds-sway{0%,100%{transform:translateY(0) skewY(0deg)}50%{transform:translateY(3px) skewY(0.3deg)}}`}</style>
  </div>
}

function Grain() {
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: 0.045, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
}

const CC = ["#E5A00D", "#34d399", "#c084fc", "#f87171", "#60a5fa", "#fb923c", "#fff", "#fbbf24", "#f472b6"]
function ConfettiEffect() {
  const p = useRef(Array.from({ length: 80 }, () => ({ x: Math.random() * 100, dur: 2 + Math.random() * 3.5, delay: Math.random() * 4, size: 4 + Math.random() * 9, color: CC[Math.floor(Math.random() * CC.length)], round: Math.random() > 0.5 }))).current
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4, overflow: "hidden" }}>
    {p.map((c, i) => <div key={i} style={{ position: "absolute", left: `${c.x}%`, top: "-20px", width: c.size, height: c.size * (c.round ? 1 : 0.38), background: c.color, borderRadius: c.round ? "50%" : 2, animation: `confetti-f ${c.dur}s ease-in ${c.delay}s infinite` }} />)}
  </div>
}

const FW_P = [["#E5A00D", "#fb923c", "#fbbf24"], ["#34d399", "#60a5fa", "#a78bfa"], ["#f87171", "#c084fc", "#fb923c"], ["#fff", "#60a5fa", "#a78bfa"]]
function FireworksEffect({ active }) {
  const cv = useRef(null), pts = useRef([]), raf = useRef(null)
  useEffect(() => {
    if (!active) return
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)
    const launch = () => {
      const pal = FW_P[Math.floor(Math.random() * FW_P.length)]
      const x = c.width * (0.15 + Math.random() * 0.7), y = c.height * (0.05 + Math.random() * 0.5)
      const count = 60 + Math.floor(Math.random() * 60), type = Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4
        const speed = (3.5 + Math.random() * 2) * (type === 1 ? 0.65 : 1)
        pts.current.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, alpha: 1, decay: 0.011 + Math.random() * 0.009, size: 2.2 + Math.random() * 2.4, color: pal[Math.floor(Math.random() * pal.length)], gravity: type === 0 ? 0.065 : 0.042 })
        if (type === 2) { const a2 = angle + (Math.random() - 0.5) * 0.3, s2 = speed * (0.35 + Math.random() * 0.4); pts.current.push({ x, y, vx: Math.cos(a2) * s2, vy: Math.sin(a2) * s2, alpha: 0.6, decay: 0.026, size: 1.2, color: pal[0], gravity: 0.085 }) }
      }
    }
    let last = 0
    const draw = (now) => {
      ctx.clearRect(0, 0, c.width, c.height)
      if (now - last > 650) { launch(); last = now }
      pts.current = pts.current.filter((p) => p.alpha > 0.012)
      pts.current.forEach((p) => {
        p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= 0.97; p.alpha -= p.decay; p.size *= 0.977
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha); ctx.fillStyle = p.color
        ctx.shadowBlur = 10; ctx.shadowColor = p.color
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2); ctx.fill()
        ctx.restore()
      })
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    launch(); setTimeout(launch, 180); setTimeout(launch, 420)
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", rz); ctx.clearRect(0, 0, c.width, c.height); pts.current = [] }
  }, [active])
  return <canvas ref={cv} style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3 }} />
}

const SERVICE_META = {
  tautulli: { key: "plex", icon: "🎬", label: "FILMS & SERIES", sub: "Cinema · Series TV" },
  plex: { key: "plex", icon: "🎬", label: "FILMS & SERIES", sub: "Cinema · Series TV" },
  jellyfin: { key: "jellyfin", icon: "📺", label: "JELLYFIN", sub: "Films · Series" },
  romm: { key: "romm", icon: "🎮", label: "JEUX VIDEO", sub: "Switch · PC · Retrogaming" },
  audiobookshelf: { key: "audiobookshelf", icon: "🎧", label: "LIVRES AUDIO", sub: "Sci-Fi · Thriller · Fantasy" },
  komga: { key: "komga", icon: "📚", label: "MANGA", sub: "Shonen · Seinen · Dark Fantasy" },
  booklore: { key: "booklore", icon: "📖", label: "LIVRES", sub: "Romans · Essais · BD" },
}

export default function RecapPlayer() {
  const { year: paramYear } = useParams()
  const user = useAuthStore((s) => s.user)

  const [year, setYear] = useState(parseInt(paramYear, 10) || null)
  const [recapData, setRecapData] = useState(null)
  const [myRecapUserId, setMyRecapUserId] = useState(null)
  const [theme, setTheme] = useState(null)
  const [dbPalettes, setDbPalettes] = useState([])
  const [slideConfigs, setSlideConfigs] = useState(null)
  const [loading, setLoading] = useState(true)

  // Sync year state when URL param changes
  useEffect(() => {
    const newYear = parseInt(paramYear, 10) || null
    if (newYear && newYear !== year) {
      setYear(newYear)
      setSlide(0)
      setLoading(true)
      setRecapData(null)
    }
  }, [paramYear])
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [slide, setSlide] = useState(0)
  const [fade, setFade] = useState(false)
  const [dir, setDir] = useState(1)
  const [comparisonActive, setComparisonActive] = useState(false)
  const [recapConfig, setRecapConfig] = useState({})
  const [visualTheme, setVisualTheme] = useState(THEMES["glass-dark"])
  const touchY = useRef(null)

  // Load recap data — try active first, then specific year, then latest
  useEffect(() => {
    async function load() {
      try {
        const [themes, slideCfg] = await Promise.all([
          api("/themes"),
          api("/recaps/slide-config").catch(() => ({ settings: {}, order: [] })),
        ])
        const me = await api("/auth/me")
        // slideCfg is now { settings: {...}, order: [...], active_theme: ... }
        const parsedCfg = slideCfg?.settings ? slideCfg : { settings: slideCfg || {}, order: [] }
        // Theme: use admin-defined global theme, fallback to user's, fallback to first
        const adminThemeId = parsedCfg.active_theme || null
        const activeTheme = themes.find((t) => t.id === adminThemeId)
          || themes.find((t) => t.id === me.theme_pack_id)
          || themes[0]
        setTheme(activeTheme?.config || null)
        setDbPalettes(themes)
        setSlideConfigs(parsedCfg)

        // Apply admin defaults
        const recapCfg = parsedCfg.recap_config || {}
        if (recapCfg.comparison_default_on) setComparisonActive(true)
        setRecapConfig(recapCfg)

        // Visual theme + effect overrides
        const vThemeId = recapCfg.visual_theme || "glass-dark"
        const baseTheme = getTheme(vThemeId)
        const effOverrides = recapCfg.visual_theme_effects || {}
        setVisualTheme({ ...baseTheme, effects: { ...baseTheme.effects, ...effOverrides } })

        let recapResult = null

        if (year) {
          // Specific year requested
          recapResult = await api("/recaps/" + year).catch(() => null)
        } else {
          // Try active recap first
          recapResult = await api("/recaps/active").catch(() => null)
          if (recapResult && recapResult.year) {
            setYear(recapResult.year)
          } else {
            // Fallback to latest completed
            const allRecaps = await api("/recaps")
            const completed = allRecaps.find((r) => r.status === "completed")
            if (completed) {
              setYear(completed.year)
              recapResult = await api("/recaps/" + completed.year).catch(() => null)
            }
          }
        }

        if (recapResult && recapResult.data) {
          // Extract current user's data from multi-user recap
          let data = recapResult.data
          const userId = me?.id ? String(me.id) : null
          if (data.users && userId && data.users[userId]) {
            // Use this user's specific data, keep global/users for comparison
            const userData = data.users[userId]
            data = { ...userData, users: data.users, comparison: data.comparison }
            // Remove "name" field that's not needed for rendering
            delete data.name
            setMyRecapUserId(userId)
          } else if (data.users) {
            // Fallback: try to find by display_name match
            const meNameNorm = me?.display_name?.toLowerCase().trim()
            for (const [uid, udata] of Object.entries(data.users)) {
              if (udata.name && udata.name.toLowerCase().trim() === meNameNorm) {
                setMyRecapUserId(uid)
                break
              }
            }
          }
          setRecapData(data)
        }
      } catch (e) {
        setError(e.message)
      }
      setLoading(false)
    }
    load()
  }, [year])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const targetYear = year || new Date().getFullYear()
      await api("/recaps/generate", { method: "POST", body: { year: targetYear } })
      setYear(targetYear)
      // Poll for completion
      const poll = setInterval(async () => {
        try {
          const progress = await api(`/recaps/${targetYear}/progress`)
          if (progress.status === "completed") {
            clearInterval(poll)
            const recap = await api(`/recaps/${targetYear}`)
            setRecapData(recap.data)
            setGenerating(false)
          } else if (progress.status === "failed") {
            clearInterval(poll)
            setError(progress.progress_msg || "Erreur de generation")
            setGenerating(false)
          }
        } catch { /* continue polling */ }
      }, 2000)
    } catch (e) {
      setError(e.message)
      setGenerating(false)
    }
  }

  const R = useResponsive()

  // Build slide list from data + config
  const slides = buildSlides(recapData, theme, slideConfigs, user, year, myRecapUserId)

  const goTo = useCallback((n) => {
    if (n < 0 || n >= slides.length || fade) return
    setDir(n > slide ? 1 : -1)
    setFade(true)
    setTimeout(() => { setSlide(n); setFade(false) }, 230)
  }, [slide, fade, slides.length])

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goTo(slide + 1)
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goTo(slide - 1)
    }
    window.addEventListener("keydown", h)
    return () => window.removeEventListener("keydown", h)
  }, [slide, goTo])

  if (loading) return (
    <div style={{ width: "100%", height: "100vh", background: "#05050e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 16, animation: "pulse-ring 2s ease-out infinite" }}>🎬</div>
        <div style={{ color: "#E5A00D", fontFamily: "Nunito,sans-serif", fontSize: 14 }}>Chargement du recap {year}...</div>
      </div>
    </div>
  )

  if (generating) return (
    <div style={{ width: "100%", height: "100vh", background: "#05050e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid #E5A00D", animation: `pulse-ring 1.8s ease-out ${i * 0.6}s infinite` }} />)}
        </div>
        <div style={{ color: "#E5A00D", fontSize: 15, fontWeight: 600 }}>Generation en cours...</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>Collecte des donnees depuis tes services</div>
      </div>
    </div>
  )

  if (error || !recapData) return (
    <div style={{ width: "100%", height: "100vh", background: "#05050e", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", maxWidth: 340, padding: "0 20px" }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid #E5A00D30", animation: `pulse-ring 3s ease-out ${i * 0.8}s infinite` }} />)}
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, filter: "drop-shadow(0 0 20px #E5A00D90)" }}>🎬</div>
        </div>
        <div style={{ color: "white", fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
          {error ? "Erreur" : "Pas encore de recap"}
        </div>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }}>
          {error || "Lance la generation pour decouvrir ton annee en recap."}
        </div>
        <button onClick={handleGenerate} style={{
          padding: "12px 32px", borderRadius: 40, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #E5A00D, #fb923c)", color: "#000",
          fontSize: 14, fontWeight: 700, boxShadow: "0 0 40px #E5A00D40",
        }}>
          Generer mon recap {year || new Date().getFullYear()}
        </button>
      </div>
    </div>
  )

  const curr = slides[slide] || {}
  const accent = curr.accent || theme?.palette?.primary || "#E5A00D"
  const bg = curr.bg || theme?.palette?.background || "#05050e"
  const isCat = !!curr.cat
  const isPod = curr.id?.includes("-pod")
  const isFinale = curr.id === "finale"
  const isCommunityTop = curr.id?.startsWith("community-top-")
  const needSpotlights = isCat || isPod || isFinale || isCommunityTop
  const spotlightIntensity = isCat ? 0.9 : (isPod || isCommunityTop) ? 1.2 : isFinale ? 0.65 : 0.7

  // Inline comparison: available if comparison data exists
  const hasComparison = !!recapData?.comparison
  const comparisonCtx = { enabled: hasComparison, active: comparisonActive && hasComparison, data: recapData?.comparison, year }

  // Theme effects
  const eff = visualTheme.effects || {}

  return (
    <ThemeProvider value={visualTheme}>
    <div
      onTouchStart={(e) => { touchY.current = e.touches[0].clientY }}
      onTouchEnd={(e) => { if (touchY.current === null) return; const d = touchY.current - e.changedTouches[0].clientY; if (Math.abs(d) > 40) goTo(slide + (d > 0 ? 1 : -1)); touchY.current = null }}
      className={"recap-root" + (eff.holoScan ? " th-holo-scan" : "") + (eff.noirDesaturate ? " th-noir-on" : "")}
      style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", background: bg, transition: "background .75s ease", fontFamily: `var(--th-font-body, Nunito,sans-serif)`, userSelect: "none", ...Object.fromEntries(Object.entries(visualTheme.css || {}).map(([k, v]) => [k, v])) }}
    >
      <style>{RECAP_CSS}</style>
      {visualTheme.cssExtra && <style>{visualTheme.cssExtra}</style>}

      {/* ── AMBIENT EFFECTS (theme-driven) ── */}
      {eff.stars !== false && <Stars />}
      {eff.orbs !== false && <Orbs accent={accent} />}
      {needSpotlights && eff.sabers && <Sabers intensity={spotlightIntensity} />}
      {needSpotlights && !eff.sabers && eff.spotlights !== false && <Spotlights accent={accent} intensity={spotlightIntensity} fixed={isCommunityTop} />}
      {/* Music player */}
      {recapConfig.recap_music && <MusicPlayer musicConfig={recapConfig.recap_music} currentSlideId={curr.id} />}

      {isFinale && (slideConfigs?.settings?.finale?.confetti !== false) && eff.confetti !== false && <ConfettiEffect />}
      {isFinale && (slideConfigs?.settings?.finale?.fireworks !== false) && eff.fireworks !== false && <FireworksEffect active={true} />}
      {eff.grain !== false && <Grain />}

      {/* Theme overlays */}
      {eff.scanlines && <div className="th-scanlines" />}
      {eff.grid && <div className="th-grid" />}
      {eff.vhs && <div className="th-vhs" />}
      {eff.filmGrain && <><div className="th-film-grain" /><div className="th-vignette" /></>}
      {eff.matrixRain && <MatrixRain />}
      {eff.xmasLights && <XmasLights />}
      {eff.hyperspace && <div className="th-hyperspace" />}
      {/* Pirate */}
      {eff.waves && <Waves />}
      {eff.compass && <Compass />}
      {/* Upside Down */}
      {eff.spores && <Spores />}
      {eff.dimensionCrack && <DimensionCrack />}
      {/* Galaxie lointaine */}
      {/* holoScan applied via className on recap-root */}
      {eff.starStreaks && <StarStreaks />}
      {/* sabers rendered above in place of spotlights when needSpotlights */}
      {/* Matrix */}
      {eff.digitalGlitch && <div className="th-digital-glitch" />}
      {eff.greenPulse && <div className="th-green-pulse" />}
      {eff.screenOff && <div className="th-screen-off" />}
      {/* Weyland-Yutani */}
      {eff.terminalOverlay && <><TerminalOverlay /><TypingTitles /></>}
      {/* Arcade */}
      {eff.arcadeBorder && <div className="th-arcade-border" />}
      {/* Silent film */}
      {eff.filmStrip && <><div className="th-film-strip left">{Array.from({length:80},(_,i)=><div key={i} className="th-film-hole"/>)}</div><div className="th-film-strip right">{Array.from({length:80},(_,i)=><div key={i} className="th-film-hole"/>)}</div></>}
      {eff.silentSlate && fade && <div className="th-slate" style={{opacity:1}}><div className="th-slate-inner"><div style={{fontSize:10,letterSpacing:"0.2em",marginBottom:4,color:"rgba(255,255,255,0.4)"}}>WRAPPARR PICTURES PRESENTE</div><div style={{fontSize:18,fontWeight:700}}>Acte suivant...</div></div></div>}
      {/* Sin City */}
      {eff.noirRain && <NoirRain />}
      {eff.noirBlinds && <NoirBlinds />}
      {/* Abyss */}
      {eff.caustics && <div className="th-caustics" />}
      {eff.biolum && <Bioluminescence />}
      {eff.bubbles && <AbyssBubbles />}

      {/* Dot nav */}
      <div style={{ position: "fixed", right: R.dotRight, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 3.5, zIndex: 200 }}>
        {slides.map((s, i) => (
          <div key={i} onClick={() => goTo(i)} style={{
            width: i === slide ? 4 : s.cat ? 3.5 : 2.5,
            height: i === slide ? 16 : s.cat ? 6 : 2.5,
            borderRadius: 3, cursor: "pointer",
            background: i === slide ? accent : s.cat ? `${s.accent}80` : "rgba(255,255,255,.12)",
            transition: "all .3s ease",
            boxShadow: i === slide ? `0 0 8px ${accent}95` : "none",
          }} />
        ))}
      </div>

      {/* Counter */}
      <div style={{ position: "fixed", top: R.counterTop, left: R.counterLeft, zIndex: 100, fontSize: R.counterFs, color: "rgba(255,255,255,.22)", fontFamily: "JetBrains Mono,monospace", letterSpacing: ".15em", textTransform: "uppercase" }}>
        {slide + 1} / {slides.length}
        {isCat && <span style={{ color: accent, marginLeft: 8 }}>SECTION</span>}
        {isPod && <span style={{ color: accent, marginLeft: 8 }}>PODIUM</span>}
      </div>

      {/* Top-right bar buttons — emits to the slot in App.jsx */}
      <ComparisonButton active={comparisonActive} onToggle={() => setComparisonActive((v) => !v)} accent={accent} year={year} visible={hasComparison} />
      {recapConfig.allow_user_themes !== false && <ThemeSelector currentThemeId={visualTheme.id} dbPalettes={dbPalettes} onSelect={(t) => {
        setVisualTheme({ ...t, effects: { ...t.effects, ...(recapConfig.visual_theme_effects || {}) } })
        if (t.defaultPalette) {
          const pal = dbPalettes.find((p) => p.slug === t.defaultPalette)
          if (pal) setTheme(pal.config || null)
        }
      }} />}
      <FullscreenButton />

      {/* Slide content */}
      <ComparisonProvider value={comparisonCtx}>
        <div style={{
          position: "relative", zIndex: 10, width: "100%", height: "100vh",
          display: (isCat || isPod || isFinale) ? "block" : "flex",
          alignItems: "center", justifyContent: "center",
          padding: (isCat || isPod || isFinale) ? "0" : R.pad,
          opacity: fade ? 0 : 1, transform: fade ? `translateY(${dir * 16}px)` : "translateY(0)",
          transition: "opacity .23s ease, transform .23s ease",
          overflowY: (isCat || isPod || isFinale) ? "hidden" : "auto",
        }}>
          {curr._introProps
            ? <IntroSlide {...curr._introProps} onStart={() => goTo(1)} />
            : curr.component}
        </div>
      </ComparisonProvider>

      {/* Top chevron — go back */}
      {slide > 0 && <NavChevron direction="up" onClick={() => goTo(slide - 1)} />}

      {/* Bottom chevron — go next */}
      {slide < slides.length - 1 && <NavChevron direction="down" onClick={() => goTo(slide + 1)} />}
    </div>
    </ThemeProvider>
  )
}

function NavChevron({ direction, onClick }) {
  const isDown = direction === "down"
  const chevron = (opacity) => (
    <svg width="18" height="10" viewBox="0 0 18 10" style={{ opacity }}>
      <path d={isDown ? "M2 2l7 6 7-6" : "M2 8l7-6 7 6"} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <div onClick={onClick} style={{
      position: "fixed", [isDown ? "bottom" : "top"]: isDown ? 14 : 42, left: 0, right: 0,
      cursor: "pointer", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center",
      animation: (isDown ? "bounce-down" : "bounce-up") + " 2s ease-in-out infinite",
      pointerEvents: "none",
    }}>
      <div style={{ pointerEvents: "auto" }}>
        {!isDown && chevron(0.2)}
        {isDown && chevron(0.12)}
        {isDown && <div style={{ marginTop: -3 }}>{chevron(0.22)}</div>}
        {!isDown && <div style={{ marginTop: -3 }}>{chevron(0.12)}</div>}
      </div>
    </div>
  )
}

function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function MusicPlayer({ musicConfig, currentSlideId }) {
  const mode = musicConfig?.mode || "single"
  const tracks = musicConfig?.tracks || {}
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const [el, setEl] = useState(null)

  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])

  // Determine audio path based on mode + current slide
  let audioPath = ""
  if (mode === "single") {
    const t = tracks._background
    audioPath = (t?.enabled !== false) ? (t?.audioPath || "") : ""
  } else {
    const section = currentSlideId?.startsWith("cat-") ? "films"
      : currentSlideId?.includes("-series") ? "series"
      : currentSlideId?.startsWith("community") ? "community"
      : currentSlideId === "finale" ? "finale"
      : currentSlideId === "intro" ? "intro"
      : currentSlideId?.includes("tautulli") || currentSlideId?.includes("plex") || currentSlideId?.includes("jellyfin") ? "films"
      : ""
    const t = tracks[section]
    audioPath = (t?.enabled !== false ? t?.audioPath : "") || tracks._background?.audioPath || ""
  }

  const hasAnyTrack = Object.values(tracks).some((t) => t?.audioPath && t?.enabled !== false)

  // Play/pause audio
  const doPlay = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.3
    audioRef.current.play().catch(() => {})
  }, [])

  const doPause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  // When playing state or audioPath changes
  useEffect(() => {
    if (!audioRef.current || !audioPath) return
    if (playing) doPlay()
    else doPause()
  }, [playing, audioPath, doPlay, doPause])

  // Start playing on first user interaction (click anywhere)
  useEffect(() => {
    if (!hasAnyTrack || !audioPath) return
    setPlaying(true)
    const startOnInteraction = () => {
      if (audioRef.current && audioRef.current.paused && playing) {
        audioRef.current.volume = 0.3
        audioRef.current.play().catch(() => {})
      }
    }
    document.addEventListener("click", startOnInteraction, { capture: true })
    document.addEventListener("touchstart", startOnInteraction, { capture: true })
    return () => {
      document.removeEventListener("click", startOnInteraction, { capture: true })
      document.removeEventListener("touchstart", startOnInteraction, { capture: true })
    }
  }, [hasAnyTrack, audioPath])

  // Pause when tab is hidden, resume when visible
  useEffect(() => {
    const handler = () => {
      if (!audioRef.current) return
      if (document.hidden) doPause()
      else if (playing) doPlay()
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [playing, doPlay, doPause])

  if (!hasAnyTrack) return null

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    if (next) doPlay()
    else doPause()
  }

  const musicGroup = <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {/* Sound bar animation */}
    {playing && (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 14, padding: "0 2px" }}>
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <div key={i} style={{
            width: 2, borderRadius: 1,
            background: "rgba(255,255,255,0.4)",
            animation: `soundbar ${0.4 + i * 0.15}s ease-in-out ${d}s infinite alternate`,
          }} />
        ))}
      </div>
    )}
    <button
      onClick={togglePlay}
      title={playing ? "Couper la musique" : "Activer la musique"}
      style={{
        background: playing ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: "1px solid " + (playing ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"),
        borderRadius: 6, color: playing ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)",
        fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)", cursor: "pointer",
        display: "flex", alignItems: "center",
        transition: "all .2s ease",
      }}
    >
      {playing ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 010 7.07" /></svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" /></svg>
      )}
    </button>
  </div>

  return <>
    {audioPath && <audio ref={audioRef} src={audioPath} loop preload="auto" />}
    {el ? createPortal(musicGroup, el) : null}
  </>
}

function ThemeSelector({ currentThemeId, onSelect }) {
  const [el, setEl] = useState(null)
  const [open, setOpen] = useState(false)
  const allThemes = getAllThemes()
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])
  const current = allThemes.find((t) => t.id === currentThemeId) || allThemes[0]

  const picker = <div style={{ position: "relative" }}>
    <button
      onClick={() => setOpen(!open)}
      title="Changer le theme"
      style={{
        background: open ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.06)",
        border: "1px solid " + (open ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)"),
        borderRadius: 6, color: "rgba(255,255,255,0.4)",
        fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
        transition: "all .2s ease",
      }}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
    </button>
    {open && <div style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 300,
      background: "rgba(10,10,15,0.95)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 8, padding: 6, minWidth: 160,
      backdropFilter: "blur(12px)", boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
    }}>
      {allThemes.map((t) => (
        <button key={t.id} onClick={() => { onSelect(t); setOpen(false) }} style={{
          display: "flex", alignItems: "center", gap: 8, width: "100%",
          padding: "7px 10px", borderRadius: 5, border: "none", cursor: "pointer",
          background: t.id === currentThemeId ? "rgba(255,255,255,0.08)" : "transparent",
          color: t.id === currentThemeId ? "white" : "rgba(255,255,255,0.5)",
          fontSize: 11, fontFamily: "Nunito,sans-serif", textAlign: "left",
          transition: "background 0.15s ease",
        }}>
          <div style={{ width: 18, height: 10, borderRadius: 2, background: t.preview, flexShrink: 0 }} />
          {t.name}
        </button>
      ))}
    </div>}
  </div>

  if (el) return createPortal(picker, el)
  return null
}

function FullscreenButton() {
  const [el, setEl] = useState(null)
  const [isFs, setIsFs] = useState(false)
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
    const handler = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])
  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
    else document.documentElement.requestFullscreen().catch(() => {})
  }
  const btn = <button onClick={toggle} title={isFs ? "Quitter le plein ecran" : "Plein ecran"} style={{
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)",
    cursor: "pointer", display: "flex", alignItems: "center", transition: "all .2s ease",
  }}>
    {isFs ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" /></svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" /></svg>
    )}
  </button>
  if (el) return createPortal(btn, el)
  return null
}

function ComparisonButton({ active, onToggle, accent, year, visible }) {
  const [el, setEl] = useState(null)
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])
  if (!visible) return null
  const btn = <button
    onClick={onToggle}
    id="recap-compare-btn"
    title={active ? "Masquer la comparaison" : "Comparer avec " + (year - 1)}
    style={{
      background: active ? accent + "15" : "rgba(255,255,255,0.06)",
      border: `1px solid ${active ? accent + "40" : "rgba(255,255,255,0.1)"}`,
      borderRadius: 6, color: active ? accent : "rgba(255,255,255,0.4)",
      fontSize: "clamp(9px, 1.2vw, 11px)", padding: "clamp(3px, 0.5vw, 5px) clamp(6px, 1vw, 9px)", cursor: "pointer",
      display: "flex", alignItems: "center", gap: 4,
      transition: "all .2s ease",
    }}
  >
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
    Comparaison {year - 1}
  </button>
  if (el) return createPortal(btn, el)
  return null
}

function arrowBtn(pos) {
  return {
    position: "fixed", left: 13, ...pos, transform: "translateY(-50%)",
    background: "rgba(255,255,255,.035)", border: "1px solid rgba(255,255,255,.07)",
    borderRadius: "50%", width: 32, height: 32, cursor: "pointer",
    color: "rgba(255,255,255,.35)", fontSize: 13, zIndex: 100,
    display: "flex", alignItems: "center", justifyContent: "center",
  }
}

// Default jokes per category (same as prototype)
const JOKES = {
  tautulli: [
    "Voyons combien de films et series cette annee...",
    "Les popcorns etaient au rendez-vous.",
    "Il a ri, pleure, et probablement mange des chips.",
    "Voici le podium officiel",
  ],
  jellyfin: [
    "Jellyfin a tourne a plein regime cette annee...",
    "Des heures de streaming en continu.",
    "Le serveur n'a pas chome.",
    "Le verdict tombe",
  ],
  romm: [
    "Les manettes ont chauffees cette annee...",
    "Des sessions epiques en perspective.",
    "Les voisins ont entendu les victoires.",
    "Voici le top du gamepad",
  ],
  audiobookshelf: [
    "Des heures d'ecoute cette annee...",
    "Principalement en mode concentration.",
    "Le cerveau a voyage dans des univers differents.",
    "Le palmares s'affiche",
  ],
  komga: [
    "Des volumes de manga lus cette annee.",
    "Plusieurs volumes par mois. Respect.",
    "Au moins 4 arcs qui font pleurer.",
    "Le podium des cases s'illumine",
  ],
  booklore: [
    "Des livres devores cette annee...",
    "La bibliotheque s'agrandit.",
    "Des histoires qui marquent.",
    "Le palmares litteraire",
  ],
}

// Service config for slide generation (matches prototype SLIDES_DEF colors)
const SERVICE_SLIDE_CONFIG = {
  tautulli: { icon: "🎬", label: "FILMS", sub: "Cinema · Documentaires", accent: "#E5A00D", bgCat: "#0c0600", bgPod: "#070400", bgStats: "#100900", statKey: "plays", statLabel: "vues", statSuffix: "", hasSeries: true, seriesIcon: "📺", seriesLabel: "SERIES", seriesSub: "Series TV · Sagas", seriesAccent: "#fb923c", seriesBgCat: "#0a0200", seriesBgPod: "#080200", seriesBgStats: "#120600" },
  plex: { icon: "🎬", label: "FILMS", sub: "Cinema · Documentaires", accent: "#E5A00D", bgCat: "#0c0600", bgPod: "#070400", bgStats: "#100900", statKey: "plays", statLabel: "vues", statSuffix: "", hasSeries: true, seriesIcon: "📺", seriesLabel: "SERIES", seriesSub: "Series TV · Sagas", seriesAccent: "#fb923c", seriesBgCat: "#0a0200", seriesBgPod: "#080200", seriesBgStats: "#120600" },
  jellyfin: { icon: "📺", label: "JELLYFIN", sub: "Films · Series", accent: "#00a4dc", bgCat: "#000a14", bgPod: "#000812", bgStats: "#000d18", statKey: "plays", statLabel: "vues", statSuffix: "" },
  romm: { icon: "🎮", label: "JEUX VIDEO", sub: "Switch · PC · Retrogaming", accent: "#34d399", bgCat: "#010a05", bgPod: "#010806", bgStats: "#020f08", statKey: "g", statLabel: "plateforme", statSuffix: "" },
  audiobookshelf: { icon: "🎧", label: "LIVRES AUDIO", sub: "Sci-Fi · Thriller · Post-Apo", accent: "#fb923c", bgCat: "#0a0300", bgPod: "#080300", bgStats: "#110500", statKey: "h", statLabel: "heures", statSuffix: "h" },
  komga: { icon: "📚", label: "MANGA", sub: "Shonen · Seinen · Dark Fantasy", accent: "#c084fc", bgCat: "#060012", bgPod: "#050010", bgStats: "#0a0018", statKey: "vols", statLabel: "volumes", statSuffix: "" },
  booklore: { icon: "📖", label: "LIVRES", sub: "Romans · Essais · BD", accent: "#a78bfa", bgCat: "#050010", bgPod: "#040008", bgStats: "#060012", statKey: "pages", statLabel: "pages", statSuffix: "" },
}

function getSlideConfig(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return {}
  const cfg = slideSettings[slideId] || {}
  const { enabled, ...rest } = cfg
  return rest
}

function isSlideEnabled(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return true
  const cfg = slideSettings[slideId]
  if (!cfg) return true
  return cfg.enabled !== false
}

function getAccentOverride(slideSettings, slideId) {
  if (!slideSettings || typeof slideSettings !== "object") return ""
  return slideSettings[slideId]?.accentOverride || ""
}

function buildSlides(data, theme, slideConfigs, user, year, myRecapUserId) {
  if (!data) return []
  const slideSettings = slideConfigs?.settings || slideConfigs || {}
  const slideOrder = slideConfigs?.order || []
  const sc = slideSettings

  // Helpers for reading slide config overrides
  const resolveAccent = (slideId, defaultAccent) => getAccentOverride(sc, slideId) || defaultAccent
  const catProps = (slideId, defaults) => {
    const cfg = getSlideConfig(sc, slideId)
    return {
      icon: cfg.customIcon || defaults.icon,
      label: cfg.customLabel || defaults.label,
      sub: cfg.customSub || defaults.sub,
    }
  }
  const podJokes = (slideId, defaultJokes) => {
    const cfg = getSlideConfig(sc, slideId)
    // jokes stored as commentary format [{trigger, phrases}] → flatten to string array
    const custom = cfg.jokes
    if (Array.isArray(custom) && custom.length > 0) {
      if (typeof custom[0] === "string") return custom
      return custom.flatMap((g) => g.phrases || []).filter(Boolean)
    }
    return defaultJokes
  }
  const palette = theme?.palette || {}
  const primary = palette.primary || "#E5A00D"
  const baseBg = palette.background || "#05050e"
  const accents = palette.accents || {}
  const userName = user?.display_name || ""
  const globalStats = data.global || {}

  const slides = []

  // 0 — Intro
  slides.push({
    id: "intro", accent: primary, bg: baseBg, fullscreen: false,
    _introProps: { accent: primary, userName, year, hasComparison: !!data.comparison },
  })

  // Per-service: Category → Podium → Stats → Deep
  const serviceOrder = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "komga", "booklore"]
  const seen = new Set()

  for (const svc of serviceOrder) {
    const svcData = data[svc]
    if (!svcData) continue
    // Skip if we already added plex-like slides (tautulli = plex)
    const svcKey = svc === "tautulli" ? "plex" : svc
    if (seen.has(svcKey)) continue
    seen.add(svcKey)

    // Map service to theme accent key
    const ACCENT_KEY_MAP = { tautulli: "films", plex: "films", jellyfin: "films", audiobookshelf: "audio" }
    const accentKey = ACCENT_KEY_MAP[svc] || svc

    const cfg = SERVICE_SLIDE_CONFIG[svc] || {}
    const svcAccent = accents[accentKey] || cfg.accent || primary
    const jokes = JOKES[svc] || []

    // ── For services with separate films+series (tautulli, plex): split into 2 sections ──
    if (cfg.hasSeries) {
      const filmsExtra = svcData.extra?.films || {}
      const seriesExtra = svcData.extra?.series || {}
      const filmsTop = (filmsExtra.top || []).slice(0, 4)
      const seriesTop = (seriesExtra.top || []).slice(0, 4)

      // Build a films-only data overlay for slides that read data.total_items etc.
      const filmsGenres = filmsExtra.genres || svcData.extra?.top_genres || svcData.genres || []
      const seriesGenres = seriesExtra.genres || svcData.extra?.series_genres || []
      const filmsData = { ...svcData, top: filmsTop, genres: filmsGenres, total_items: filmsExtra.total || 0, total_hours: filmsExtra.hours || 0 }
      const seriesData = { ...svcData, top: seriesTop, genres: seriesGenres, total_items: seriesExtra.episodes || 0, total_hours: seriesExtra.hours || 0,
        extra: { ...svcData.extra, films: seriesExtra, actors: seriesExtra.actors || [], directors: seriesExtra.directors || [], ratings: seriesExtra.ratings || [], countries: seriesExtra.countries || [], peak_stats: seriesExtra.peak_stats || {} },
      }

      // ═══ FILMS SECTION ═══
      slides.push({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const filmsBackdrop = svcData.extra?.backdrop || (filmsTop[0]?.art) || ""
      const filmsCat = catProps("cat-" + svc, cfg)
      if (filmsTop.length >= 2) {
        slides.push({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={filmsTop} title={"Top " + filmsCat.label + " " + year} icon={filmsCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={filmsBackdrop} config={getSlideConfig(sc, svc + "-pod")} />,
        })
      }

      // Deep slide (habitudes) — uses combined data
      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        slides.push({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} />,
        })
      }

      // Film-specific slides (timeline, worldmap, ratings, actors, directors)
      const hasYears = filmsTop.some((t) => t.y && t.y > 1890)
      if (hasYears) {
        slides.push({
          id: svc + "-timeline", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FilmTimelineSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-timeline")} />,
        })
      }

      const countryData = svcData.extra?.countries || []
      if (countryData.length > 0) {
        slides.push({
          id: svc + "-worldmap", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <WorldMapSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-worldmap")} />,
        })
      }

      const ratingsData = svcData.extra?.ratings || []
      if (ratingsData.length >= 2) {
        const ratingsBrackets = getSlideConfig(sc, svc + "-ratings")?.brackets
        const ratingsConfig = { ...getSlideConfig(sc, svc + "-ratings") }
        if (ratingsBrackets) {
          ratingsConfig.brackets = ratingsBrackets.map((b) => ({
            min: b.min, max: b.max, label: b.name, emoji: b.emoji,
          }))
        }
        slides.push({
          id: svc + "-ratings", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <RatingsSlide accent={svcAccent} data={svcData} year={year} config={ratingsConfig} />,
        })
      }

      // Budget slide (if budget data available)
      const budgetData = svcData.extra?.budgets
      if (budgetData && budgetData.count > 0) {
        slides.push({
          id: svc + "-budgets", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <BudgetSlide accent={svcAccent} data={svcData} year={year} config={getSlideConfig(sc, svc + "-budgets")} />,
        })
      }

      const actorsData = svcData.extra?.actors || []
      const actorsConfig = getSlideConfig(sc, svc + "-actors")
      if (actorsData.filter((a) => a.count >= (actorsConfig?.minAppearances || 2)).length > 0) {
        slides.push({
          id: svc + "-actors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteActorsSlide accent={svcAccent} data={svcData} year={year} config={actorsConfig} />,
        })
      }

      const directorsData = svcData.extra?.directors || []
      const directorsConfig = getSlideConfig(sc, svc + "-directors")
      if (directorsData.filter((d) => d.count >= (directorsConfig?.minAppearances || 2)).length > 0) {
        slides.push({
          id: svc + "-directors", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <FavoriteDirectorsSlide accent={svcAccent} data={svcData} year={year} config={directorsConfig} />,
        })
      }

      // Genres slide (films section)
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 3) {
        slides.push({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} />,
        })
      }

      // Comparison slide (films)
      const filmCompare = data.comparison?.[svc]
      if (filmCompare) {
        const bilanConfig = getSlideConfig(sc, svc + "-stats-enriched")
        slides.push({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={filmCompare} year={year} mediaType="films" config={getSlideConfig(sc, svc + "-compare")} bilanCategories={bilanConfig.categories} />,
        })
      }

      // Stats enriched / bilan cinema (fin de section films)
      slides.push({
        id: svc + "-stats-enriched", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <FilmStatsEnrichedSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={filmsData} year={year} config={getSlideConfig(sc, svc + "-stats-enriched")} />,
      })

      // ═══ SERIES SECTION ═══
      if (seriesTop.length >= 1) {
        const seriesAccent = accents.series || cfg.seriesAccent || "#fb923c"
        const seriesExtraData = svcData.extra?.series || {}

        // Category
        slides.push({
          id: "cat-" + svc + "-series", accent: seriesAccent, bg: cfg.seriesBgCat || baseBg, cat: true, fullscreen: true,
          component: <CategorySlide accent={seriesAccent} {...catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })} />,
        })

        // Podium
        const seriesCat = catProps("cat-" + svc + "-series", { icon: cfg.seriesIcon, label: cfg.seriesLabel, sub: cfg.seriesSub })
        if (seriesTop.length >= 2) {
          const seriesBackdrop = (seriesTop[0]?.art) || ""
          const defaultSeriesJokes = ["Voyons quelles series t'ont accroche...", "Des episodes enchaines sans fin.", "Le binge-watching, un art de vivre.", "Voici ton podium series"]
          slides.push({
            id: svc + "-series-pod", accent: seriesAccent, bg: cfg.seriesBgPod || baseBg, pod: true, fullscreen: true,
            component: <PodiumSlide accent={seriesAccent} bg={cfg.seriesBgPod || baseBg} data={seriesTop} title={"Top " + seriesCat.label + " " + year} icon={seriesCat.icon} jokes={podJokes(svc + "-series-pod", defaultSeriesJokes)} statLabel="episodes" statKey="ep" statSuffix="" backdrop={seriesBackdrop} config={getSlideConfig(sc, svc + "-series-pod")} />,
          })
        }

        // Habitudes series
        if (seriesExtraData.day_of_week?.length > 0 || seriesExtraData.time_of_day?.length > 0) {
          slides.push({
            id: svc + "-series-deep", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <ServiceDeepSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={{ ...svcData, ...seriesData, extra: { ...svcData.extra, films: seriesExtraData } }} me={userName} year={year} />,
          })
        }

        // Profil seriephile (timeline)
        const seriesHasYears = seriesTop.some((t) => t.y && t.y > 1890)
        if (seriesHasYears) {
          slides.push({
            id: svc + "-series-timeline", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FilmTimelineSlide accent={seriesAccent} data={{ ...svcData, top: seriesTop, extra: { ...svcData.extra, films: { top: (seriesExtraData.top || seriesTop) } } }} year={year} config={getSlideConfig(sc, svc + "-series-timeline")} mediaType="series" />,
          })
        }

        // Carte du monde series
        const seriesCountries = seriesExtraData.countries || []
        if (seriesCountries.length > 0) {
          slides.push({
            id: svc + "-series-worldmap", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <WorldMapSlide accent={seriesAccent} data={{ extra: { countries: seriesCountries } }} year={year} config={getSlideConfig(sc, svc + "-series-worldmap")} mediaType="series" />,
          })
        }

        // Notes series
        const seriesRatings = seriesExtraData.ratings || []
        if (seriesRatings.length >= 2) {
          slides.push({
            id: svc + "-series-ratings", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <RatingsSlide accent={seriesAccent} data={{ extra: { ratings: seriesRatings, films: { top: seriesExtraData.top || [] } }, top: seriesTop }} year={year} config={getSlideConfig(sc, svc + "-series-ratings")} mediaType="series" />,
          })
        }

        // Acteurs series
        const seriesActors = seriesExtraData.actors || svcData.extra?.series_actors || []
        const seriesActorsConfig = getSlideConfig(sc, svc + "-series-actors")
        if (seriesActors.filter((a) => a.count >= (seriesActorsConfig?.minAppearances || 2)).length > 0) {
          slides.push({
            id: svc + "-series-actors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteActorsSlide accent={seriesAccent} data={{ extra: { actors: seriesActors } }} year={year} config={seriesActorsConfig} />,
          })
        }

        // Realisateurs series
        const seriesDirectors = seriesExtraData.directors || []
        const seriesDirectorsConfig = getSlideConfig(sc, svc + "-series-directors")
        if (seriesDirectors.filter((d) => d.count >= (seriesDirectorsConfig?.minAppearances || 2)).length > 0) {
          slides.push({
            id: svc + "-series-directors", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <FavoriteDirectorsSlide accent={seriesAccent} data={{ extra: { directors: seriesDirectors } }} year={year} config={seriesDirectorsConfig} />,
          })
        }

        // Genres series
        const seriesGenres = seriesExtraData.genres || svcData.extra?.series_genres || []
        if (seriesGenres.length >= 3) {
          slides.push({
            id: svc + "-series-genres", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <GenresSlide accent={seriesAccent} genres={seriesGenres} year={year} config={{ displayMode: "race", ...getSlideConfig(sc, svc + "-series-genres") }} />,
          })
        }

        // Comparison series
        const seriesCompare = data.comparison?.[svc]
        if (seriesCompare) {
          const seriesBilanConfig = getSlideConfig(sc, svc + "-series-stats-enriched")
          slides.push({
            id: svc + "-series-compare", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <CompareServiceSlide accent={seriesAccent} compareData={seriesCompare} year={year} mediaType="series" config={getSlideConfig(sc, svc + "-series-compare")} bilanCategories={seriesBilanConfig.categories} />,
          })
        }

        // Bilan series (fin de section)
        slides.push({
          id: svc + "-series-stats-enriched", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
          component: <FilmStatsEnrichedSlide accent={seriesAccent} label={cfg.seriesLabel} icon={cfg.seriesIcon} data={seriesData} year={year} config={getSlideConfig(sc, svc + "-series-stats-enriched")} mediaType="series" />,
        })

      }
    } else {
      // ── Standard service (romm, audiobookshelf, komga, booklore) ──
      const top = svcData.top || []

      slides.push({
        id: "cat-" + svc, accent: svcAccent, bg: cfg.bgCat || baseBg, cat: true, fullscreen: true,
        component: <CategorySlide accent={svcAccent} {...catProps("cat-" + svc, cfg)} />,
      })

      const stdCat = catProps("cat-" + svc, cfg)
      const backdropUrl = (top[0]?.art) || ""
      if (top.length >= 2) {
        slides.push({
          id: svc + "-pod", accent: svcAccent, bg: cfg.bgPod || baseBg, pod: true, fullscreen: true,
          component: <PodiumSlide accent={svcAccent} bg={cfg.bgPod || baseBg} data={top} title={"Top " + stdCat.label + " " + year} icon={stdCat.icon} jokes={podJokes(svc + "-pod", jokes)} statLabel={cfg.statLabel} statKey={cfg.statKey} statSuffix={cfg.statSuffix} backdrop={backdropUrl} config={getSlideConfig(sc, svc + "-pod")} />,
        })
      }

      slides.push({
        id: svc + "-stats", accent: svcAccent, bg: cfg.bgStats || baseBg,
        component: <ServiceStatsSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} year={year} />,
      })

      if (svcData.day_of_week?.length > 0 || svcData.time_of_day?.length > 0 || svcData.ranking?.length > 0) {
        slides.push({
          id: svc + "-deep", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <ServiceDeepSlide accent={svcAccent} label={cfg.label} icon={cfg.icon} data={svcData} me={userName} year={year} />,
        })
      }
    }

    // Genres slide for standard services (non-hasSeries)
    if (!cfg.hasSeries) {
      const topGenres = svcData.extra?.top_genres || svcData.genres || []
      if (topGenres.length >= 3) {
        slides.push({
          id: svc + "-genres", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <GenresSlide accent={svcAccent} genres={topGenres} year={year} config={getSlideConfig(sc, svc + "-genres")} />,
        })
      }
    }

    // Comparison slide for all services (including standard)
    if (!cfg.hasSeries) {
      const svcCompare = data.comparison?.[svc]
      if (svcCompare) {
        slides.push({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={svcCompare} year={year} config={getSlideConfig(sc, svc + "-compare")} />,
        })
      }
    }
  }

  // ═══ COMMUNITY SECTION — Comparaison multi-utilisateurs ═══
  const communityAccent = accents.compare || "#60a5fa"

  // Match current user in data.users — all matching done here, no external state needed
  const _uid = user?.id ? String(user.id) : ""
  const _name = userName.toLowerCase().trim()
  const _email = (user?.email || "").toLowerCase().trim()
  // Also use myRecapUserId which was found during data loading
  const _recapUid = myRecapUserId || ""

  let foundMyUid = null
  if (data.users) {
    for (const [uid, udata] of Object.entries(data.users)) {
      const n = (udata.name || "").toLowerCase().trim()
      const e = (udata.email || "").toLowerCase().trim()
      const match = uid === _uid || uid === _recapUid
        || (_name && n === _name)
        || (_email && e && e === _email)
      if (match) { foundMyUid = uid; break }
    }
    if (!foundMyUid) {
      console.warn("[Community] Utilisateur non trouve dans le recap. Verifiez le mapping admin.", { uid: _uid, name: _name, email: _email, recapUsers: Object.keys(data.users) })
    }
  }

  const allUsersData = data.users ? Object.entries(data.users).map(([uid, udata]) => {
    const svcData = udata.tautulli || udata.plex || udata.jellyfin || {}
    return { name: udata.name || uid, uid, isMe: uid === foundMyUid, data: svcData }
  }).filter((u) => u.data && (u.data.total_items > 0 || u.data.total_hours > 0 || u.data.extra)) : []
  if (allUsersData.length > 0) {
    console.log("[Community] allUsersData:", allUsersData.map((u) => ({
      name: u.name, hasExtra: !!u.data.extra, totalItems: u.data.total_items,
      hasFilmsTop: u.data.extra?.films?.top?.length, hasSeriesTop: u.data.extra?.series?.top?.length,
      genres: u.data.genres?.length, monthly: u.data.monthly?.length,
    })))
  }
  const myNameInData = allUsersData.find((u) => u.isMe)?.name || userName

  if (allUsersData.length >= 2) {
    // Category slide for community section
    slides.push({
      id: "cat-community", accent: communityAccent, bg: baseBg, cat: true, fullscreen: true,
      component: <CategorySlide accent={communityAccent} icon="👥" label="COMMUNAUTE" sub="Comparaison entre utilisateurs" />,
    })

    // Films community slides
    const hasFilmsData = allUsersData.some((u) => (u.data.extra?.films?.total || u.data.total_items || 0) > 0)
    if (hasFilmsData) {
      slides.push({
        id: "community-top-films", accent: communityAccent, bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-mostviewed-films", accent: communityAccent, bg: baseBg,
        component: <CommunityMostViewedSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-activity-films", accent: communityAccent, bg: baseBg,
        component: <CommunityActivitySlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-rankings-films", accent: communityAccent, bg: baseBg,
        component: <CommunityRankingsSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      slides.push({
        id: "community-genres-films", accent: communityAccent, bg: baseBg,
        component: <CommunityGenresSlide accent={communityAccent} allUsers={allUsersData} year={year} me={myNameInData} mediaType="films" />,
      })
      // Comparison films year vs year
      const filmCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (filmCompareData) {
        slides.push({
          id: "community-compare-films", accent: communityAccent, bg: baseBg,
          component: <CommunityCompareSlide accent={communityAccent} compareData={filmCompareData} year={year} mediaType="films" />,
        })
      }
    }

    // Series community slides
    const hasSeriesData = allUsersData.some((u) => (u.data.extra?.series?.episodes || 0) > 0)
    if (hasSeriesData) {
      slides.push({
        id: "community-top-series", accent: accents.series || "#fb923c", bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-mostviewed-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityMostViewedSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-activity-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityActivitySlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-rankings-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityRankingsSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      slides.push({
        id: "community-genres-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityGenresSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={myNameInData} mediaType="series" />,
      })
      // Comparison series year vs year
      const seriesCompareData = data.comparison?.tautulli || data.comparison?.plex || data.comparison?.jellyfin
      if (seriesCompareData) {
        slides.push({
          id: "community-compare-series", accent: accents.series || "#fb923c", bg: baseBg,
          component: <CommunityCompareSlide accent={accents.series || "#fb923c"} compareData={seriesCompareData} year={year} mediaType="series" />,
        })
      }
    }
  }

  // Compare
  const compareAccent = accents.compare || "#60a5fa"
  if (data.comparison) {
    slides.push({
      id: "compare", accent: compareAccent, bg: baseBg,
      component: <CompareSlide accent={compareAccent} comparison={data.comparison} year={year} />,
    })
  }

  // Ranking
  const rankingAccent = accents.ranking || "#f87171"
  const ranking = data.global?.users || data.tautulli?.ranking || []
  if (ranking.length > 0) {
    slides.push({
      id: "ranking", accent: rankingAccent, bg: baseBg,
      component: <RankingSlide accent={rankingAccent} users={ranking} me={userName} year={year} />,
    })
  }

  // Finale — activeServices will be injected after slide filtering
  slides.push({
    id: "finale", accent: primary, bg: baseBg, fullscreen: true,
    _finaleProps: { accent: primary, userName, year, globalStats, recapData: data },
  })

  // ── Apply accent overrides from slide settings ──
  for (const s of slides) {
    const override = getAccentOverride(sc, s.id)
    if (override) {
      s.accent = override
      // Re-create component with overridden accent
      if (s.component && s.component.props) {
        const { accent: _oldAccent, ...restProps } = s.component.props
        s.component = { ...s.component, props: { ...s.component.props, accent: override } }
      }
    }
  }

  // ── Apply saved order + enabled filter ──
  const LOCKED = new Set(["intro", "finale"])

  // Filter out disabled slides (but keep locked: intro, finale)
  const enabledSlides = slides.filter((s) => LOCKED.has(s.id) || isSlideEnabled(sc, s.id))

  // Detect active services from enabled slide IDs (e.g. "tautulli-pod" -> "tautulli")
  const SVC_NAMES = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "komga", "booklore"]
  const detectedServices = [...new Set(enabledSlides.map((s) => SVC_NAMES.find((svc) => s.id.startsWith(svc))).filter(Boolean))]

  // Inject FinaleSlide component with activeServices
  for (const s of enabledSlides) {
    if (s.id === "finale" && s._finaleProps) {
      const p = s._finaleProps
      s.component = <FinaleSlide {...p} activeServices={detectedServices} onRestart={null} />
      delete s._finaleProps
    }
  }

  // Apply saved order if available
  if (slideOrder && slideOrder.length > 0) {
    const slideMap = new Map(enabledSlides.map((s) => [s.id, s]))
    const ordered = []

    // Intro always first
    if (slideMap.has("intro")) {
      ordered.push(slideMap.get("intro"))
      slideMap.delete("intro")
    }

    // Follow saved order for the rest
    for (const id of slideOrder) {
      if (id === "intro" || id === "finale") continue
      if (slideMap.has(id)) {
        ordered.push(slideMap.get(id))
        slideMap.delete(id)
      }
    }

    // Add any remaining slides not in the saved order (new slides)
    for (const s of enabledSlides) {
      if (slideMap.has(s.id) && s.id !== "finale") {
        ordered.push(s)
      }
    }

    // Finale always last
    if (slideMap.has("finale") || enabledSlides.find((s) => s.id === "finale")) {
      const finale = enabledSlides.find((s) => s.id === "finale")
      if (finale) ordered.push(finale)
    }

    return ordered
  }

  return enabledSlides
}
