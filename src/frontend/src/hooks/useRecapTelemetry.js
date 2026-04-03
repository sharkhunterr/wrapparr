import { useRef, useCallback, useEffect } from "react"
import { api } from "../services/api"

/**
 * Hook to track user behavior during recap viewing.
 * Collects time per slide, interactions, and sends to backend on unmount/finish.
 */
export default function useRecapTelemetry({ year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled }) {
  const startTime = useRef(Date.now())
  const slideEntries = useRef({})
  const currentSlide = useRef(null)
  const interactions = useRef([])
  const sent = useRef(false)

  // Store latest values in refs so flush always reads current state
  const latestRef = useRef({ year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled })
  useEffect(() => {
    latestRef.current = { year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled }
  })

  // Track slide change
  const onSlideChange = useCallback((slideId) => {
    const now = Date.now()
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
    }
    if (!slideEntries.current[slideId]) {
      slideEntries.current[slideId] = { totalTime: 0, interacted: false, enterTime: now }
    } else {
      slideEntries.current[slideId].enterTime = now
    }
    currentSlide.current = slideId
  }, [])

  const onInteraction = useCallback((slideId, data) => {
    if (slideEntries.current[slideId]) {
      slideEntries.current[slideId].interacted = true
    }
    interactions.current.push({ slideId, ...data })
  }, [])

  // Build payload from refs (always current)
  const buildPayload = useCallback(() => {
    const now = Date.now()
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
      slideEntries.current[currentSlide.current].enterTime = now
    }
    const vals = latestRef.current
    const durationSeconds = (now - startTime.current) / 1000
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
      device: navigator.userAgent.substring(0, 200),
    }
  }, [])

  // Flush via API (used on finale + unmount)
  const flush = useCallback(async () => {
    if (sent.current) return
    // Don't send if no slides were viewed
    if (Object.keys(slideEntries.current).length === 0) return
    sent.current = true
    try {
      await api("/analytics/sessions", { method: "POST", body: buildPayload() })
    } catch (e) {
      console.warn("[telemetry] Failed:", e)
      sent.current = false // Allow retry
    }
  }, [buildPayload])

  // Flush via sendBeacon (used on page close)
  const flushBeacon = useCallback(() => {
    if (sent.current) return
    if (Object.keys(slideEntries.current).length === 0) return
    sent.current = true
    const token = localStorage.getItem("wrapparr_token")
    const blob = new Blob([JSON.stringify(buildPayload())], { type: "application/json" })
    navigator.sendBeacon?.("/api/v1/analytics/sessions/beacon?_token=" + encodeURIComponent(token || ""), blob)
  }, [buildPayload])

  // beforeunload — no deps change, stable refs
  useEffect(() => {
    const handleUnload = () => flushBeacon()
    window.addEventListener("beforeunload", handleUnload)
    return () => window.removeEventListener("beforeunload", handleUnload)
  }, [flushBeacon])

  // Unmount — send on SPA navigation (empty deps = only on mount/unmount)
  useEffect(() => {
    return () => {
      if (!sent.current && Object.keys(slideEntries.current).length > 0) {
        // Use sendBeacon on unmount since async flush may not complete
        const token = localStorage.getItem("wrapparr_token")
        const now = Date.now()
        if (currentSlide.current && slideEntries.current[currentSlide.current]) {
          slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
        }
        const vals = latestRef.current
        const slideData = Object.entries(slideEntries.current).map(([slideId, entry]) => ({
          slideId, timeSpent: Math.round(entry.totalTime / 100) / 10, interacted: entry.interacted,
        }))
        const payload = {
          year: vals.year,
          duration_seconds: Math.round((now - startTime.current) / 100) / 10,
          total_slides: vals.totalSlides,
          slides_viewed: slideData.length,
          theme_id: vals.themeId,
          palette_slug: vals.paletteSlug,
          music_enabled: vals.musicEnabled,
          comparison_enabled: vals.comparisonEnabled,
          slide_data: slideData,
          interactions: interactions.current,
          device: navigator.userAgent.substring(0, 200),
        }
        sent.current = true
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
        navigator.sendBeacon?.("/api/v1/analytics/sessions/beacon?_token=" + encodeURIComponent(token || ""), blob)
      }
    }
  }, [])

  return { onSlideChange, onInteraction, flush }
}
