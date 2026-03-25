import { useState, useEffect, useCallback, useRef } from "react"
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
import { CommunityActivitySlide, CommunityTopSlide, CommunityRankingsSlide, CommunityGenresSlide } from "./slides/CommunitySlides"

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

function Spotlights({ accent, intensity = 1 }) {
  const a = (v) => Math.round(v * intensity).toString(16).padStart(2, "0")
  const beams = [
    { left: "12%", w: "18vw", anim: "beam-1", dur: "11s", delay: "0s", op: a(38) },
    { left: "50%", w: "26vw", anim: "beam-3", dur: "17s", delay: "3.5s", op: a(30) },
    { left: "88%", w: "20vw", anim: "beam-2", dur: "9s", delay: "1.2s", op: a(34) },
  ]
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 1 }}>
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

function Grain() {
  return <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50, opacity: 0.045, mixBlendMode: "overlay", backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
}

const CC = ["#E5A00D", "#34d399", "#c084fc", "#f87171", "#60a5fa", "#fb923c", "#fff", "#fbbf24", "#f472b6"]
function ConfettiEffect() {
  const p = useRef(Array.from({ length: 80 }, () => ({ x: Math.random() * 100, dur: 2 + Math.random() * 3.5, delay: Math.random() * 4, size: 4 + Math.random() * 9, color: CC[Math.floor(Math.random() * CC.length)], round: Math.random() > 0.5 }))).current
  return <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 2, overflow: "hidden" }}>
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
      ctx.fillStyle = "rgba(0,0,0,0.075)"; ctx.fillRect(0, 0, c.width, c.height)
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
  const [theme, setTheme] = useState(null)
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
        const activeTheme = themes.find((t) => t.id === me.theme_pack_id) || themes[0]
        setTheme(activeTheme?.config || null)
        // slideCfg is now { settings: {...}, order: [...] } or legacy plain object
        const parsedCfg = slideCfg?.settings ? slideCfg : { settings: slideCfg || {}, order: [] }
        setSlideConfigs(parsedCfg)

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
            data = { ...userData, users: data.users }
            // Remove "name" field that's not needed for rendering
            delete data.name
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

  // Build slide list from data + config
  const slides = buildSlides(recapData, theme, slideConfigs, user, year)

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
  const needSpotlights = isCat || isPod || isFinale
  const spotlightIntensity = isCat ? 0.9 : isPod ? 1.2 : isFinale ? 0.65 : 0.7

  return (
    <div
      onTouchStart={(e) => { touchY.current = e.touches[0].clientY }}
      onTouchEnd={(e) => { if (touchY.current === null) return; const d = touchY.current - e.changedTouches[0].clientY; if (Math.abs(d) > 40) goTo(slide + (d > 0 ? 1 : -1)); touchY.current = null }}
      style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", background: bg, transition: "background .75s ease", fontFamily: "Nunito,sans-serif", userSelect: "none" }}
    >
      <style>{RECAP_CSS}</style>

      {/* ── AMBIENT EFFECTS (like prototype) ── */}
      <Stars />
      <Orbs accent={accent} />
      {needSpotlights && <Spotlights accent={accent} intensity={spotlightIntensity} />}
      {isFinale && <ConfettiEffect />}
      {isFinale && <FireworksEffect active={true} />}
      <Grain />

      {/* Dot nav */}
      <div style={{ position: "fixed", right: 11, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 3.5, zIndex: 200 }}>
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
      <div style={{ position: "fixed", top: 14, left: 14, zIndex: 100, fontSize: 9, color: "rgba(255,255,255,.18)", fontFamily: "JetBrains Mono,monospace", letterSpacing: ".2em", textTransform: "uppercase" }}>
        {slide + 1} / {slides.length}
        {isCat && <span style={{ color: accent, marginLeft: 8 }}>SECTION</span>}
        {isPod && <span style={{ color: accent, marginLeft: 8 }}>PODIUM</span>}
      </div>

      {/* Arrows */}
      {slide > 0 && <button onClick={() => goTo(slide - 1)} style={arrowBtn({ top: "calc(50% - 44px)" })}>↑</button>}
      {slide < slides.length - 1 && <button onClick={() => goTo(slide + 1)} style={arrowBtn({ top: "calc(50% + 4px)" })}>↓</button>}

      {/* Slide content */}
      <div style={{
        position: "relative", zIndex: 10, width: "100%", height: "100vh",
        display: (isCat || isPod || isFinale) ? "block" : "flex",
        alignItems: "center", justifyContent: "center",
        padding: (isCat || isPod || isFinale) ? "0" : "20px 44px 20px 18px",
        opacity: fade ? 0 : 1, transform: fade ? `translateY(${dir * 16}px)` : "translateY(0)",
        transition: "opacity .23s ease, transform .23s ease",
        overflowY: (isCat || isPod || isFinale) ? "hidden" : "auto",
      }}>
        {curr.component}
      </div>

      {/* Swipe hint */}
      {!isCat && !isPod && !isFinale && slide > 0 && slide < slides.length - 1 && (
        <div style={{ position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)", color: "rgba(255,255,255,.12)", fontSize: 9, fontFamily: "JetBrains Mono,monospace", letterSpacing: ".15em", animation: "float 3s ease-in-out infinite", pointerEvents: "none", zIndex: 5 }}>
          swipe
        </div>
      )}
    </div>
  )
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

function buildSlides(data, theme, slideConfigs, user, year) {
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
    component: <IntroSlide accent={primary} userName={userName} year={year} onStart={null} />,
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
        slides.push({
          id: svc + "-compare", accent: svcAccent, bg: cfg.bgStats || baseBg,
          component: <CompareServiceSlide accent={svcAccent} compareData={filmCompare} year={year} config={getSlideConfig(sc, svc + "-compare")} />,
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
            component: <WorldMapSlide accent={seriesAccent} data={{ extra: { countries: seriesCountries } }} year={year} config={getSlideConfig(sc, svc + "-series-worldmap")} />,
          })
        }

        // Notes series
        const seriesRatings = seriesExtraData.ratings || []
        if (seriesRatings.length >= 2) {
          slides.push({
            id: svc + "-series-ratings", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <RatingsSlide accent={seriesAccent} data={{ extra: { ratings: seriesRatings, films: { top: seriesExtraData.top || [] } }, top: seriesTop }} year={year} config={getSlideConfig(sc, svc + "-series-ratings")} />,
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
          slides.push({
            id: svc + "-series-compare", accent: seriesAccent, bg: cfg.seriesBgStats || baseBg,
            component: <CompareServiceSlide accent={seriesAccent} compareData={seriesCompare} year={year} config={getSlideConfig(sc, svc + "-series-compare")} />,
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
  const allUsersData = data.users ? Object.entries(data.users).map(([uid, udata]) => ({
    name: udata.name || uid,
    data: udata.tautulli || udata.plex || udata.jellyfin || {},
  })).filter((u) => u.data && (u.data.total_items > 0 || u.data.total_hours > 0 || u.data.extra)) : []

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
        id: "community-activity-films", accent: communityAccent, bg: baseBg,
        component: <CommunityActivitySlide accent={communityAccent} allUsers={allUsersData} year={year} me={userName} mediaType="films" />,
      })
      slides.push({
        id: "community-top-films", accent: communityAccent, bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={communityAccent} allUsers={allUsersData} year={year} me={userName} mediaType="films" />,
      })
      slides.push({
        id: "community-rankings-films", accent: communityAccent, bg: baseBg,
        component: <CommunityRankingsSlide accent={communityAccent} allUsers={allUsersData} year={year} me={userName} mediaType="films" />,
      })
      slides.push({
        id: "community-genres-films", accent: communityAccent, bg: baseBg,
        component: <CommunityGenresSlide accent={communityAccent} allUsers={allUsersData} year={year} me={userName} mediaType="films" />,
      })
    }

    // Series community slides
    const hasSeriesData = allUsersData.some((u) => (u.data.extra?.series?.episodes || 0) > 0)
    if (hasSeriesData) {
      slides.push({
        id: "community-activity-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityActivitySlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={userName} mediaType="series" />,
      })
      slides.push({
        id: "community-top-series", accent: accents.series || "#fb923c", bg: baseBg, fullscreen: true,
        component: <CommunityTopSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={userName} mediaType="series" />,
      })
      slides.push({
        id: "community-rankings-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityRankingsSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={userName} mediaType="series" />,
      })
      slides.push({
        id: "community-genres-series", accent: accents.series || "#fb923c", bg: baseBg,
        component: <CommunityGenresSlide accent={accents.series || "#fb923c"} allUsers={allUsersData} year={year} me={userName} mediaType="series" />,
      })
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

  // Finale
  slides.push({
    id: "finale", accent: primary, bg: baseBg, fullscreen: true,
    component: <FinaleSlide accent={primary} userName={userName} year={year} globalStats={globalStats} recapData={data} onRestart={null} />,
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
