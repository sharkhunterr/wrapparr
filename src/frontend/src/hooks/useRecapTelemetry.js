import { useRef, useCallback, useEffect } from "react"
import { api } from "../services/api"

const HEARTBEAT_INTERVAL = 5000

export default function useRecapTelemetry({ year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled, enabled = true, idleTimeoutMin = 30 }) {
  const IDLE_TIMEOUT = idleTimeoutMin * 60 * 1000
  const slideEntries = useRef({})
  const currentSlide = useRef(null)
  const interactions = useRef([])
  const sent = useRef(false)
  const started = useRef(false)
  const startTime = useRef(0)
  const lastActivity = useRef(Date.now())
  const slideEnterTime = useRef(0)

  // Store latest values in refs (preserve manually set fields like totalSlides, reaction)
  const latestRef = useRef({ year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled, reaction: null })
  useEffect(() => {
    const prev = latestRef.current
    latestRef.current = {
      ...prev,
      year, themeId, paletteSlug, musicEnabled, comparisonEnabled,
      // Keep totalSlides from setTotalSlides if it was set, otherwise use prop
      totalSlides: prev.totalSlides || totalSlides,
    }
  })

  // Track user activity (mouse, touch, keyboard, scroll)
  useEffect(() => {
    const mark = () => { lastActivity.current = Date.now() }
    const events = ["mousemove", "mousedown", "touchstart", "keydown", "scroll", "wheel"]
    events.forEach(e => window.addEventListener(e, mark, { passive: true }))
    return () => events.forEach(e => window.removeEventListener(e, mark))
  }, [])

  // Heartbeat: pause time tracking if idle > 30min on same slide
  useEffect(() => {
    const interval = setInterval(() => {
      if (!started.current || !currentSlide.current) return
      const entry = slideEntries.current[currentSlide.current]
      if (!entry) return
      const now = Date.now()
      const idleDuration = now - lastActivity.current
      if (idleDuration > IDLE_TIMEOUT) {
        // Cap slide time at IDLE_TIMEOUT from last activity
        entry.totalTime += Math.max(0, lastActivity.current - slideEnterTime.current)
        slideEnterTime.current = now // Reset so we don't double-count
      }
    }, HEARTBEAT_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  const onSlideChange = useCallback((slideId) => {
    const now = Date.now()

    // Start tracking on slide 2 (skip intro)
    if (!started.current) {
      if (slideId === "intro" || slideId === "onboarding") return
      started.current = true
      startTime.current = now
    }

    // Close previous slide
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      const entry = slideEntries.current[currentSlide.current]
      const elapsed = now - slideEnterTime.current
      const idleDuration = now - lastActivity.current
      // If idle > 30min, only count up to last activity
      if (idleDuration > IDLE_TIMEOUT) {
        entry.totalTime += Math.max(0, lastActivity.current - slideEnterTime.current)
      } else {
        entry.totalTime += elapsed
      }
    }

    // Open new slide
    if (!slideEntries.current[slideId]) {
      slideEntries.current[slideId] = { totalTime: 0, interacted: false }
    }
    slideEnterTime.current = now
    lastActivity.current = now
    currentSlide.current = slideId
  }, [])

  const onInteraction = useCallback((slideId, data) => {
    if (slideEntries.current[slideId]) {
      slideEntries.current[slideId].interacted = true
    }
    interactions.current.push({ slideId, ...data })
  }, [])

  const setReaction = useCallback((emoji) => {
    latestRef.current.reaction = emoji
  }, [])

  const buildPayload = useCallback(() => {
    const now = Date.now()
    // Close current slide
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      const entry = slideEntries.current[currentSlide.current]
      const elapsed = now - slideEnterTime.current
      const idleDuration = now - lastActivity.current
      if (idleDuration > IDLE_TIMEOUT) {
        entry.totalTime += Math.max(0, lastActivity.current - slideEnterTime.current)
      } else {
        entry.totalTime += elapsed
      }
      slideEnterTime.current = now
    }

    const vals = latestRef.current
    const durationSeconds = startTime.current > 0 ? (now - startTime.current) / 1000 : 0
    const slideData = Object.entries(slideEntries.current).map(([slideId, entry]) => ({
      slideId,
      timeSpent: Math.round(entry.totalTime / 100) / 10,
      interacted: entry.interacted,
    }))

    return {
      year: vals.year,
      duration_seconds: Math.round(durationSeconds * 10) / 10,
      total_slides: vals.totalSlides,
      slides_viewed: slideData.length,
      theme_id: vals.themeId,
      palette_slug: vals.paletteSlug,
      music_enabled: vals.musicEnabled,
      comparison_enabled: vals.comparisonEnabled,
      slide_data: slideData,
      interactions: interactions.current,
      reaction: vals.reaction || null,
      device: navigator.userAgent.substring(0, 200),
    }
  }, [])

  const flush = useCallback(async () => {
    if (sent.current || !started.current || !enabled) return
    if (Object.keys(slideEntries.current).length === 0) return
    sent.current = true
    try {
      await api("/analytics/sessions", { method: "POST", body: buildPayload() })
    } catch (e) {
      console.warn("[telemetry] Failed:", e)
      sent.current = false
    }
  }, [buildPayload])

  const flushBeacon = useCallback(() => {
    if (sent.current || !started.current || !enabled) return
    if (Object.keys(slideEntries.current).length === 0) return
    sent.current = true
    const token = localStorage.getItem("wrapparr_token")
    const blob = new Blob([JSON.stringify(buildPayload())], { type: "application/json" })
    navigator.sendBeacon?.("/api/v1/analytics/sessions/beacon?_token=" + encodeURIComponent(token || ""), blob)
  }, [buildPayload])

  // beforeunload
  useEffect(() => {
    const handleUnload = () => flushBeacon()
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [flushBeacon])

  // Unmount (SPA navigation) — use fetch with Auth header (not beacon)
  useEffect(() => {
    return () => {
      if (!sent.current && started.current && Object.keys(slideEntries.current).length > 0) {
        sent.current = true
        const payload = buildPayload()
        const token = localStorage.getItem("wrapparr_token")
        // Use fetch (SPA navigation keeps JS alive long enough)
        if (token) {
          fetch("/api/v1/analytics/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(payload),
            keepalive: true, // Ensures request completes even during navigation
          }).catch(() => {})
        } else {
          // Fallback to beacon if no token in header format
          const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
          navigator.sendBeacon?.("/api/v1/analytics/sessions/beacon?_token=", blob)
        }
      }
    }
  }, [])

  const setTotalSlides = useCallback((n) => { latestRef.current.totalSlides = n }, [])

  return { onSlideChange, onInteraction, flush, setTotalSlides, setReaction }
}
