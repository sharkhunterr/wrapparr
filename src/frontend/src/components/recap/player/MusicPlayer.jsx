import { useState, useEffect, useCallback, useRef } from "react"
import { createPortal } from "react-dom"

export default function MusicPlayer({ musicConfig, currentSlideId, onPlayingChange, accent }) {
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
    if (onPlayingChange) onPlayingChange(next)
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
    {audioPath && <audio ref={audioRef} src={audioPath} loop preload="auto" />}
    {el ? createPortal(musicGroup, el) : null}
  </>
}
