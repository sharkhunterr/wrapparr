import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

export default function MusicPlayer({ musicConfig, currentSlideId, onPlayingChange, accent }) {
  const mode = musicConfig?.mode || "single"
  const tracks = musicConfig?.tracks || {}
  const pool = musicConfig?.pool || []
  const [playing, setPlaying] = useState(false)
  const [trackIdx, setTrackIdx] = useState(0)
  const audioRef = useRef(null)
  const [el, setEl] = useState(null)

  useEffect(() => {
    const slot = document.getElementById("recap-topbar-extra")
    if (slot) setEl(slot)
  }, [])

  // Determine section from current slide ID
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

  // Build playlist for single mode (pool or single track)
  const playlist = mode === "single"
    ? (pool.length > 1
      ? pool.filter(p => p.audioPath).map(p => p.audioPath)
      : [tracks._background?.audioPath].filter(Boolean))
    : []

  // Determine audio path
  let audioPath = ""
  if (mode === "single") {
    if (playlist.length > 0) {
      audioPath = playlist[trackIdx % playlist.length] || ""
    } else {
      const t = tracks._background
      audioPath = (t?.enabled !== false) ? (t?.audioPath || "") : ""
    }
  } else {
    const section = getSection(currentSlideId)
    const t = tracks[section]
    audioPath = (t?.enabled !== false ? t?.audioPath : "") || tracks._background?.audioPath || ""
  }

  const hasAnyTrack = mode === "single"
    ? (playlist.length > 0 || (tracks._background?.audioPath && tracks._background?.enabled !== false))
    : Object.values(tracks).some((t) => t?.audioPath && t?.enabled !== false)

  // Should loop? Only if single mode with 1 track (or no pool)
  const shouldLoop = mode === "single" && playlist.length <= 1

  const doPlay = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.volume = 0.3
    audioRef.current.play().catch(() => {})
  }, [])

  const doPause = useCallback(() => {
    if (!audioRef.current) return
    audioRef.current.pause()
  }, [])

  useEffect(() => {
    if (!audioRef.current || !audioPath) return
    if (playing) doPlay()
    else doPause()
  }, [playing, audioPath, doPlay, doPause])

  // Auto-start on first interaction
  useEffect(() => {
    if (!hasAnyTrack || !audioPath) return
    setPlaying(true)
    if (onPlayingChange) onPlayingChange(true)
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

  // Pause when tab hidden
  useEffect(() => {
    const handler = () => {
      if (!audioRef.current) return
      if (document.hidden) doPause()
      else if (playing) doPlay()
    }
    document.addEventListener("visibilitychange", handler)
    return () => document.removeEventListener("visibilitychange", handler)
  }, [playing, doPlay, doPause])

  // On track ended: next in playlist (single mode with pool)
  const onEnded = useCallback(() => {
    if (mode === "single" && playlist.length > 1) {
      setTrackIdx(prev => (prev + 1) % playlist.length)
    }
  }, [mode, playlist.length])

  if (!hasAnyTrack) return null

  const togglePlay = () => {
    const next = !playing
    setPlaying(next)
    if (onPlayingChange) onPlayingChange(next)
    if (next) doPlay()
    else doPause()
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

  return <>
    {audioPath && <audio ref={audioRef} src={audioPath} loop={shouldLoop} preload="auto" onEnded={onEnded} />}
    {el ? createPortal(musicGroup, el) : null}
  </>
}
