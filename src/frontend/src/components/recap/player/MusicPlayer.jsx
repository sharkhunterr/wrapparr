import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

const FADE_MS = 1500
const FADE_STEPS = 20

export default function MusicPlayer({ musicConfig, currentSlideId, onPlayingChange, accent }) {
  const mode = musicConfig?.mode || "single"
  const tracks = musicConfig?.tracks || {}
  const playlist = musicConfig?.playlist || []
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const audioRef = useRef(null)
  const fadeTimerRef = useRef(null)
  const [el, setEl] = useState(null)
  const currentPathRef = useRef("")

  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])

  const getSection = (slideId) => {
    if (!slideId) return ""
    if (slideId === "intro" || slideId === "onboarding") return "intro"
    if (slideId === "finale") return "finale"
    if (slideId.startsWith("cat-overseerr") || slideId.startsWith("overseerr-")) return "demandes"
    if (slideId.startsWith("cat-community") || slideId.startsWith("community-")) return "community"
    if (slideId.includes("audiobookshelf")) return "audiobook"
    if (slideId.includes("grimmory")) return "grimmory"
    if (slideId.includes("-series")) return "series"
    if (slideId.includes("tautulli") || slideId.includes("plex") || slideId.includes("jellyfin")) return "films"
    if (slideId.startsWith("cat-")) return "films"
    return ""
  }

  // Build paths for single mode
  const singlePaths = mode === "single"
    ? (playlist.length > 0
      ? playlist.map(p => p.audioPath).filter(Boolean)
      : [tracks._background?.audioPath].filter(Boolean))
    : []

  // Determine target audio path
  let targetPath = ""
  if (mode === "single") {
    targetPath = singlePaths.length > 0 ? (singlePaths[trackIdx % singlePaths.length] || "") : ""
  } else {
    const section = getSection(currentSlideId)
    const t = tracks[section]
    targetPath = (t?.enabled !== false ? t?.audioPath : "") || tracks._background?.audioPath || ""
  }

  const shouldLoop = mode === "single" && singlePaths.length <= 1
  const hasAnyTrack = mode === "single"
    ? singlePaths.length > 0
    : Object.values(tracks).some(t => t?.audioPath && t?.enabled !== false)

  // Crossfade to a new audio path
  const crossfadeTo = useCallback((newPath) => {
    const oldAudio = audioRef.current
    if (!oldAudio || !newPath) return

    const newAudio = new Audio(newPath)
    newAudio.volume = 0
    newAudio.preload = "auto"

    clearInterval(fadeTimerRef.current)

    let step = 0
    const oldVol = oldAudio.volume
    const stepMs = FADE_MS / FADE_STEPS

    newAudio.play().catch(() => {})

    fadeTimerRef.current = setInterval(() => {
      step++
      const progress = step / FADE_STEPS
      oldAudio.volume = Math.max(0, oldVol * (1 - progress))
      newAudio.volume = Math.min(0.3, 0.3 * progress)
      if (step >= FADE_STEPS) {
        clearInterval(fadeTimerRef.current)
        oldAudio.pause()
        oldAudio.src = ""
        audioRef.current = newAudio
        currentPathRef.current = newPath
      }
    }, stepMs)
  }, [])

  // React to target path changes — only crossfade when path actually differs
  useEffect(() => {
    if (!playing || !targetPath) return

    // Same path -> do nothing (music continues)
    if (currentPathRef.current === targetPath) return

    if (!currentPathRef.current) {
      // First play
      if (audioRef.current) {
        audioRef.current.src = targetPath
        audioRef.current.volume = 0.3
        audioRef.current.loop = shouldLoop
        audioRef.current.play().catch(() => {})
        currentPathRef.current = targetPath
      }
    } else {
      // Different path -> crossfade
      crossfadeTo(targetPath)
    }
  }, [targetPath, playing, crossfadeTo, shouldLoop])

  // On track ended: next in playlist (single mode)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const handler = () => {
      if (mode === "single" && singlePaths.length > 1) {
        const nextIdx = (trackIdx + 1) % singlePaths.length
        setTrackIdx(nextIdx)
      }
    }
    audio.addEventListener("ended", handler)
    return () => audio.removeEventListener("ended", handler)
  }, [mode, singlePaths.length, trackIdx])

  // Auto-start
  useEffect(() => {
    if (!hasAnyTrack || !targetPath) return
    setPlaying(true)
    if (onPlayingChange) onPlayingChange(true)
    const startOnInteraction = () => {
      if (audioRef.current && audioRef.current.paused) {
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
  }, [hasAnyTrack])

  // Pause when tab hidden
  useEffect(() => {
    const handler = () => {
      if (!audioRef.current) return
      if (document.hidden) audioRef.current.pause()
      else if (playing) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => {}) }
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [playing])

  // Cleanup
  useEffect(() => () => { clearInterval(fadeTimerRef.current) }, [])

  if (!hasAnyTrack) return null

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    if (onPlayingChange) onPlayingChange(next)
    if (next && audioRef.current) { audioRef.current.volume = 0.3; audioRef.current.play().catch(() => {}) }
    else if (audioRef.current) audioRef.current.pause()
  }

  const musicGroup = <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
    {playing && (
      <div style={{ display: "flex", alignItems: "flex-end", gap: 1, height: 14, padding: "0 2px" }}>
        {[0, 0.2, 0.4, 0.1].map((d, i) => (
          <div key={i} style={{
            width: 2, borderRadius: 1,
            background: accent || "rgba(255,255,255,0.4)",
            animation: `soundbar ${0.4 + i * 0.15}s ease-in-out ${d}s infinite alternate`,
          }} />
        ))}
      </div>
    )}
    <button
      onClick={togglePlay}
      title={playing ? "Couper la musique" : "Activer la musique"}
      style={{
        background: playing ? (accent + "15") : "rgba(255,255,255,0.06)",
        border: "1px solid " + (playing ? (accent + "40") : "rgba(255,255,255,0.1)"),
        borderRadius: 6, color: playing ? accent : "rgba(255,255,255,0.4)",
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

  // Initial audio element (managed via refs, not re-rendered on path change)
  return <>
    <audio ref={audioRef} preload="auto" />
    {el ? createPortal(musicGroup, el) : null}
  </>
}
