import { useState, useEffect, useCallback, useRef, cloneElement } from "react"
import { createPortal } from "react-dom"
import { useParams } from "react-router-dom"
import { api } from "../../services/api"
import useAuthStore from "../../stores/authStore"
import { RECAP_CSS } from "./recapStyles"
import IntroSlide from "./slides/IntroSlide"
import OnboardingSlide from "./slides/OnboardingSlide"
import { ComparisonProvider } from "./SharedUI"
import { useResponsive } from "./responsive"
import { THEMES, getTheme, getAllThemes } from "./themes"
import { ThemeProvider } from "./ThemeContext"
import ThemeEffects from "./effects"
import buildSlides from "./buildSlides.jsx"
import MusicPlayer from "./player/MusicPlayer"
import ThemeSelector from "./player/ThemeSelector"
import useRecapTelemetry from "../../hooks/useRecapTelemetry"
import FullscreenButton from "./player/FullscreenButton"
import ComparisonButton from "./player/ComparisonButton"
import NavChevron from "./player/NavChevron"

const SERVICE_META = {
  tautulli: { key: "plex", icon: "🎬", label: "FILMS & SERIES", sub: "Cinema · Series TV" },
  plex: { key: "plex", icon: "🎬", label: "FILMS & SERIES", sub: "Cinema · Series TV" },
  jellyfin: { key: "jellyfin", icon: "📺", label: "JELLYFIN", sub: "Films · Series" },
  romm: { key: "romm", icon: "🎮", label: "JEUX VIDEO", sub: "Switch · PC · Retrogaming" },
  audiobookshelf: { key: "audiobookshelf", icon: "🎧", label: "LIVRES AUDIO", sub: "Sci-Fi · Thriller · Fantasy" },
  komga: { key: "komga", icon: "📚", label: "MANGA", sub: "Shonen · Seinen · Dark Fantasy" },
  booklore: { key: "booklore", icon: "📖", label: "LIVRES", sub: "Romans · Essais · BD" },
}

const toUuidDash = (id) => id && id.length === 32 ? id.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5") : id

function extractUserData(fullData, userOrId) {
  if (!fullData?.users) return { data: fullData, userId: null }
  // If userOrId is a string (uid), use directly; otherwise extract from user object
  const rawId = typeof userOrId === "string" ? userOrId : (userOrId?.id ? String(userOrId.id) : null)
  const displayName = typeof userOrId === "string" ? null : userOrId?.display_name

  // Try exact, dashed, undashed
  const tryIds = rawId ? [rawId, toUuidDash(rawId), rawId.replace(/-/g, "")] : []
  let userId = null
  for (const id of tryIds) {
    if (fullData.users[id]) { userId = id; break }
  }

  // Fallback by display_name
  if (!userId && displayName) {
    const norm = displayName.toLowerCase().trim()
    for (const [uid, udata] of Object.entries(fullData.users)) {
      if (udata.name && udata.name.toLowerCase().trim() === norm) { userId = uid; break }
    }
  }

  if (userId && fullData.users[userId]) {
    const userData = fullData.users[userId]
    const data = { ...userData, users: fullData.users, comparison: userData.comparison || fullData.comparison, server_ranking: fullData.server_ranking }
    delete data.name
    return { data, userId }
  }

  return { data: fullData, userId: null }
}

function getSlideDelay(slideId, slideConfigs) {
  if (!slideId) return 3000
  // Read config for this slide's animation speed
  const cfg = slideConfigs?.settings?.[slideId] || {}
  const customSpeed = cfg.animationSpeed

  if (slideId.includes("-pod")) {
    const phaseWait = cfg.phaseWait || 1800
    const jokeDuration = cfg.jokeDuration || 2200
    const jokes = (cfg.jokes?.length || 3)
    return phaseWait + jokes * jokeDuration + 6000 // jokes + reveals
  }
  if (slideId.startsWith("cat-")) return 2500
  if (slideId.includes("-genres")) return customSpeed ? customSpeed + 2000 : 14000
  if (slideId.includes("-timeline")) return customSpeed ? customSpeed + 2000 : 10000
  if (slideId.includes("-ratings")) return customSpeed ? customSpeed + 1000 : 8000
  if (slideId.includes("-actors") || slideId.includes("-directors")) return customSpeed ? customSpeed + 1000 : 10000
  if (slideId.includes("-thisorthat") || slideId.includes("-estimation")) return 20000
  if (slideId.includes("-stats-enriched") || slideId.includes("-bilan")) return 6000
  if (slideId.includes("-compare") || slideId === "compare") return customSpeed ? customSpeed + 1000 : 10000
  if (slideId.includes("-worldmap")) return 6000
  if (slideId.startsWith("community-")) return 5000
  if (slideId.startsWith("overseerr-")) return 5000
  return 4000
}

function useSlideReady(slideId, slideConfigs) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setReady(false)
    const delay = getSlideDelay(slideId, slideConfigs)
    const t = setTimeout(() => setReady(true), delay)
    return () => clearTimeout(t)
  }, [slideId])
  return ready
}

const REACTION_EMOJIS = ["🔥", "😍", "👏", "😂", "🤯", "❤️", "💀", "🥳"]

function ReactionPanel({ accent, year }) {
  const [selected, setSelected] = useState(null)
  const [particles, setParticles] = useState([])
  const idCounter = useRef(0)

  const handleReaction = (emoji) => {
    setSelected(emoji)
    // Spawn particles across the full page
    const newParticles = Array.from({ length: 16 }, () => ({
      id: idCounter.current++,
      emoji,
      x: 10 + Math.random() * 80,
      startY: 70 + Math.random() * 25,
      scale: 0.7 + Math.random() * 1.2,
      rotation: (Math.random() - 0.5) * 60,
      duration: 1.5 + Math.random() * 1.5,
      delay: Math.random() * 0.4,
      drift: (Math.random() - 0.5) * 30,
    }))
    setParticles(prev => [...prev, ...newParticles])
    setTimeout(() => setParticles(prev => prev.filter(p => !newParticles.includes(p))), 3500)

    // Send to backend
    try {
      const token = localStorage.getItem("wrapparr_token")
      if (token) {
        fetch("/api/v1/analytics/reactions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ session_id: "00000000-0000-0000-0000-000000000000", year, slide_id: "finale", reaction_type: "emoji", value: emoji }),
        }).catch(() => {})
      }
    } catch {}
  }

  return (
    <>
      {/* Particles floating across the full page */}
      {particles.map(p => (
        <div key={p.id} style={{
          position: "fixed", left: p.x + "%", top: p.startY + "%",
          fontSize: 28 * p.scale, pointerEvents: "none", zIndex: 200,
          opacity: 0,
          animation: `reaction-burst ${p.duration}s ease-out ${p.delay}s both`,
          "--drift": p.drift + "px",
          "--rot": p.rotation + "deg",
        }}>
          {p.emoji}
        </div>
      ))}

      {/* Inline emoji bar — rendered inside FinaleSlide via portal or inline */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4, padding: "4px 8px", borderRadius: 20,
        background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      }}>
        {REACTION_EMOJIS.map(emoji => (
          <button key={emoji} onClick={() => handleReaction(emoji)} style={{
            background: selected === emoji ? accent + "25" : "transparent",
            border: selected === emoji ? `1px solid ${accent}40` : "1px solid transparent",
            borderRadius: 10, padding: "3px 5px", cursor: "pointer",
            fontSize: 16, lineHeight: 1,
            transform: selected === emoji ? "scale(1.3)" : "scale(1)",
            transition: "all .2s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
            onMouseEnter={e => { if (!selected) e.target.style.transform = "scale(1.2)" }}
            onMouseLeave={e => { if (selected !== emoji) e.target.style.transform = "scale(1)" }}
          >
            {emoji}
          </button>
        ))}
      </div>

      <style>{`
        @keyframes reaction-burst {
          0% { transform: translateY(0) translateX(0) rotate(0deg) scale(0.3); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(-40vh) translateX(var(--drift)) rotate(var(--rot)) scale(1.3); opacity: 0; }
        }
        @keyframes bounce-arrow { 0%,100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
      `}</style>
    </>
  )
}

function AdminUserSelect({ recapUsers, currentUid, originalUid, impersonating, accent, onSelect }) {
  const [el, setEl] = useState(null)
  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])

  const content = (
    <select
      value={currentUid || ""}
      onChange={e => onSelect(e.target.value === originalUid ? null : e.target.value)}
      style={{
        padding: "3px 6px", borderRadius: 6, fontSize: 9,
        background: impersonating ? accent + "20" : "rgba(255,255,255,0.06)",
        color: impersonating ? accent : "rgba(255,255,255,0.4)",
        border: "1px solid " + (impersonating ? accent + "40" : "rgba(255,255,255,0.1)"),
        cursor: "pointer", outline: "none",
        fontFamily: "JetBrains Mono,monospace",
        transition: "all .2s ease",
      }}
    >
      {recapUsers.map(u => (
        <option key={u.uid} value={u.uid} style={{ background: "#111", color: "#ccc" }}>
          {u.name}{u.uid === originalUid ? " (moi)" : ""}
        </option>
      ))}
    </select>
  )

  return el ? createPortal(content, el) : null
}

export default function RecapPlayer() {
  const { year: paramYear } = useParams()
  const user = useAuthStore((s) => s.user)

  const [year, setYear] = useState(parseInt(paramYear, 10) || null)
  const [recapData, setRecapData] = useState(null)
  const [rawRecapData, setRawRecapData] = useState(null) // Full multi-user data for admin impersonation
  const [myRecapUserId, setMyRecapUserId] = useState(null)
  const [impersonateUserId, setImpersonateUserId] = useState(null)
  const [theme, setTheme] = useState(null)
  const [originalTheme, setOriginalTheme] = useState(null)
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
  const [musicPlaying, setMusicPlaying] = useState(false)
  const musicToggleRef = useRef(null)
  const [availableYears, setAvailableYears] = useState([])
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
        const initialThemeConfig = activeTheme?.config || null
        setTheme(initialThemeConfig)
        setOriginalTheme(initialThemeConfig)
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

        // Load available years
        const allRecapsList = await api("/recaps").catch(() => [])
        const years = allRecapsList.filter(r => r.status === "completed").map(r => r.year).sort((a, b) => b - a)
        setAvailableYears(years)

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
          const fullData = recapResult.data
          setRawRecapData(fullData)
          const extracted = extractUserData(fullData, me)
          setRecapData(extracted.data)
          setMyRecapUserId(extracted.userId)
        }
      } catch (e) {
        console.error("[RecapPlayer] load error:", e)
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

  // Telemetry (must be before buildSlides so onInteraction is available)
  const telemetryEnabled = recapConfig.telemetry_enabled !== false
  const telemetry = useRecapTelemetry({
    year, totalSlides: 0, themeId: visualTheme?.id,
    paletteSlug: theme?.slug || null, musicEnabled: musicPlaying, comparisonEnabled: comparisonActive,
    enabled: telemetryEnabled,
    idleTimeoutMin: recapConfig.telemetry_idle_timeout_min || 30,
  })

  // Build slide list from data + config
  // When impersonating, override user display_name for slides
  const effectiveUser = impersonateUserId && rawRecapData?.users?.[impersonateUserId]
    ? { ...user, display_name: rawRecapData.users[impersonateUserId].name || user.display_name }
    : user
  const slides = buildSlides(recapData, theme, slideConfigs, effectiveUser, year, myRecapUserId, telemetry.onInteraction)
  telemetry.setTotalSlides(slides.length)
  const currSlideId = slides[slide]?.id
  useEffect(() => {
    if (currSlideId) telemetry.onSlideChange(currSlideId)
    if (currSlideId === "finale") telemetry.flush()
  }, [currSlideId])

  // Slide ready hint (replaces bottom chevron when animations finish)
  const slideReady = useSlideReady(currSlideId, slideConfigs)

  const goTo = useCallback((n) => {
    if (n < 0 || n >= slides.length || fade) return
    setDir(n > slide ? 1 : -1)
    setFade(true)
    setTimeout(() => { setSlide(n); setFade(false) }, 230)
  }, [slide, fade, slides.length])

  // Admin impersonation: switch user view
  const handleImpersonate = useCallback((uid) => {
    if (!rawRecapData?.users) return
    setImpersonateUserId(uid || null)
    if (uid) {
      const extracted = extractUserData(rawRecapData, uid)
      setRecapData(extracted.data)
      setMyRecapUserId(extracted.userId)
    } else {
      // Back to self
      const extracted = extractUserData(rawRecapData, user)
      setRecapData(extracted.data)
      setMyRecapUserId(extracted.userId)
    }
    setSlide(0)
  }, [rawRecapData, user])

  // List of all users in recap (for admin selector)
  const recapUsers = rawRecapData?.users ? Object.entries(rawRecapData.users).map(([uid, u]) => ({ uid, name: u.name || uid })).sort((a, b) => a.name.localeCompare(b.name)) : []
  const isAdmin = user?.role === "admin"

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
      className={"recap-root" + (eff.holoScan ? " th-holo-scan" : "") + (eff.noirDesaturate ? " th-noir-on" : "") + (eff.stBars ? " th-st-on" : "") + (eff.vhsChromatic ? " th-vhs-on" : "")}
      style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", background: bg, transition: "background .75s ease", fontFamily: `var(--th-font-body, Nunito,sans-serif)`, userSelect: "none", ...Object.fromEntries(Object.entries(visualTheme.css || {}).map(([k, v]) => [k, v])) }}
    >
      <style>{RECAP_CSS}</style>
      {visualTheme.cssExtra && <style>{visualTheme.cssExtra}</style>}

      {/* ── ALL EFFECTS (theme-driven) ── */}
      <ThemeEffects eff={eff} accent={accent} fade={fade} isCat={isCat} needSpotlights={needSpotlights} spotlightIntensity={spotlightIntensity} isCommunityTop={isCommunityTop} isFinale={isFinale} slideConfigs={slideConfigs} />

      {/* Music player */}
      {recapConfig.recap_music && <MusicPlayer musicConfig={recapConfig.recap_music} currentSlideId={curr.id} onPlayingChange={setMusicPlaying} accent={accent} />}

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
        // Persist visual theme choice
        api("/admin/config", { method: "PATCH", body: { visual_theme: t.id } }).catch(() => {})
        if (t.defaultPalette) {
          const pal = dbPalettes.find((p) => p.slug === t.defaultPalette)
          if (pal) {
            setTheme(pal.config || null)
            // Persist palette choice
            api("/admin/config", { method: "PATCH", body: { active_theme: pal.id } }).catch(() => {})
            api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: pal.id } }).catch(() => {})
          }
        } else {
          setTheme(originalTheme)
        }
      }} />}
      <FullscreenButton />

      {/* Admin: impersonate user (portal to topbar, left of music) */}
      {isAdmin && recapUsers.length > 1 && <AdminUserSelect
        recapUsers={recapUsers}
        currentUid={impersonateUserId || myRecapUserId}
        originalUid={myRecapUserId}
        impersonating={!!impersonateUserId}
        accent={accent}
        onSelect={handleImpersonate}
      />}

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
            : curr.id === "onboarding" && curr.component
            ? <OnboardingSlide {...curr.component.props}
                comparisonActive={comparisonActive}
                onToggleComparison={() => setComparisonActive(v => !v)}
                hasMusic={!!recapConfig.recap_music}
                allowUserThemes={recapConfig.allow_user_themes !== false}
                currentThemeId={visualTheme.id}
                onSelectTheme={(id) => {
                  const t = getAllThemes().find(th => th.id === id)
                  if (t) {
                    setVisualTheme({ ...t, effects: { ...t.effects, ...(recapConfig.visual_theme_effects || {}) } })
                    api("/admin/config", { method: "PATCH", body: { visual_theme: t.id } }).catch(() => {})
                    if (t.defaultPalette) {
                      const pal = dbPalettes.find(p => p.slug === t.defaultPalette)
                      if (pal) {
                        setTheme(pal.config || null)
                        api("/admin/config", { method: "PATCH", body: { active_theme: pal.id } }).catch(() => {})
                        api("/themes/users/me/theme", { method: "PUT", body: { theme_pack_id: pal.id } }).catch(() => {})
                      }
                    } else {
                      setTheme(originalTheme)
                    }
                  }
                }}
                musicPlaying={musicPlaying}
                onToggleMusic={() => {
                  const btn = document.querySelector('[title*="musique"]')
                  if (btn) btn.click()
                }}
                availableYears={availableYears}
                onChangeYear={(y) => { window.location.href = "/recap/" + y }}
              />
            : isFinale && curr.component
            ? cloneElement(curr.component, { reactionSlot: <ReactionPanel accent={accent} year={year} /> })
            : curr.component}
        </div>
      </ComparisonProvider>

      {/* Top chevron — go back */}
      {slide > 0 && <NavChevron direction="up" onClick={() => goTo(slide - 1)} />}

      {/* Bottom: chevron OR ready button */}
      {slide < slides.length - 1 && (
        slideReady ? (
          <div onClick={() => goTo(slide + 1)} style={{
            position: "fixed", bottom: 16, left: 0, right: 0, zIndex: 90,
            display: "flex", justifyContent: "center", pointerEvents: "none",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 6, padding: "7px 18px", borderRadius: 20,
              background: accent + "18", border: "1px solid " + accent + "35",
              backdropFilter: "blur(12px)", cursor: "pointer", pointerEvents: "auto",
              animation: "slide-up .4s ease both",
              transition: "background .2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = accent + "30"}
              onMouseLeave={e => e.currentTarget.style.background = accent + "18"}
            >
              <span style={{ fontSize: 10, color: accent, fontWeight: 600 }}>Suivant</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" style={{ animation: "bounce-arrow 1.5s ease-in-out infinite" }} />
              </svg>
            </div>
          </div>
        ) : (
          <NavChevron direction="down" onClick={() => goTo(slide + 1)} />
        )
      )}
    </div>
    </ThemeProvider>
  )
}


