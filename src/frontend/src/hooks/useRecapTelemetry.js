import { useRef, useCallback, useEffect } from "react"
import { api } from "../services/api"

/**
 * Hook to track user behavior during recap viewing.
 * Collects time per slide, interactions, and sends to backend on unmount/finish.
 */
export default function useRecapTelemetry({ year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled }) {
  const startTime = useRef(Date.now())
  const slideEntries = useRef({}) // {slideId: {enterTime, totalTime, interacted}}
  const currentSlide = useRef(null)
  const interactions = useRef([]) // [{slideId, slideType, score, total, answers}]
  const sent = useRef(false)

  // Track slide change
  const onSlideChange = useCallback((slideId) => {
    const now = Date.now()

    // Close previous slide
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
    }

    // Open new slide
    if (!slideEntries.current[slideId]) {
      slideEntries.current[slideId] = { totalTime: 0, interacted: false, enterTime: now }
    } else {
      slideEntries.current[slideId].enterTime = now
    }
    currentSlide.current = slideId
  }, [])

  // Record interaction from interactive slides
  const onInteraction = useCallback((slideId, data) => {
    if (slideEntries.current[slideId]) {
      slideEntries.current[slideId].interacted = true
    }
    interactions.current.push({ slideId, ...data })
  }, [])

  // Build and send telemetry payload
  const flush = useCallback(async () => {
    if (sent.current) return
    sent.current = true

    const now = Date.now()

    // Close current slide
    if (currentSlide.current && slideEntries.current[currentSlide.current]) {
      slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
    }

    const durationSeconds = (now - startTime.current) / 1000
    const slideData = Object.entries(slideEntries.current).map(([slideId, entry]) => ({
      slideId,
      timeSpent: Math.round(entry.totalTime / 100) / 10, // round to 0.1s
      interacted: entry.interacted,
    }))

    const payload = {
      year,
      duration_seconds: Math.round(durationSeconds * 10) / 10,
      total_slides: totalSlides,
      slides_viewed: slideData.length,
      theme_id: themeId,
      palette_slug: paletteSlug,
      music_enabled: musicEnabled,
      comparison_enabled: comparisonEnabled,
      slide_data: slideData,
      interactions: interactions.current,
      device: navigator.userAgent.substring(0, 200),
    }

    try {
      await api("/analytics/sessions", { method: "POST", body: payload })
    } catch (e) {
      // Silent fail — telemetry is non-critical
      console.warn("[telemetry] Failed to send session:", e)
    }
  }, [year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled])

  // Send on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (sent.current) return
      sent.current = true
      const now = Date.now()
      if (currentSlide.current && slideEntries.current[currentSlide.current]) {
        slideEntries.current[currentSlide.current].totalTime += now - slideEntries.current[currentSlide.current].enterTime
      }
      const durationSeconds = (now - startTime.current) / 1000
      const slideData = Object.entries(slideEntries.current).map(([slideId, entry]) => ({
        slideId,
        timeSpent: Math.round(entry.totalTime / 100) / 10,
        interacted: entry.interacted,
      }))
      const payload = {
        year,
        duration_seconds: Math.round(durationSeconds * 10) / 10,
        total_slides: totalSlides,
        slides_viewed: slideData.length,
        theme_id: themeId,
        palette_slug: paletteSlug,
        music_enabled: musicEnabled,
        comparison_enabled: comparisonEnabled,
        slide_data: slideData,
        interactions: interactions.current,
        device: navigator.userAgent.substring(0, 200),
      }
      // Use sendBeacon for reliability on page close
      const token = localStorage.getItem("wrapparr_token")
      const blob = new Blob([JSON.stringify(payload)], { type: "application/json" })
      navigator.sendBeacon?.("/api/v1/analytics/sessions/beacon?_token=" + encodeURIComponent(token || ""), blob)
    }

    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("beforeunload", handleUnload)
      // Component unmount (SPA navigation) — send via flush
      if (!sent.current) flush()
    }
  }, [year, totalSlides, themeId, paletteSlug, musicEnabled, comparisonEnabled, flush])

  return { onSlideChange, onInteraction, flush }
}
