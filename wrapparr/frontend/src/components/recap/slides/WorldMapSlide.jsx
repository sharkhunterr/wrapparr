import { useState, useEffect, useRef, memo } from "react"
import { ComposableMap, Geographies, Geography } from "react-simple-maps"

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// ISO numeric to alpha-2 mapping for common countries
const NUM_TO_ALPHA2 = {
  "840": "US", "124": "CA", "484": "MX", "076": "BR", "032": "AR",
  "826": "GB", "250": "FR", "276": "DE", "724": "ES", "380": "IT",
  "643": "RU", "156": "CN", "392": "JP", "410": "KR", "356": "IN",
  "036": "AU", "710": "ZA", "566": "NG", "818": "EG", "752": "SE",
  "578": "NO", "246": "FI", "616": "PL", "528": "NL", "056": "BE",
  "756": "CH", "620": "PT", "792": "TR", "554": "NZ", "152": "CL",
  "170": "CO", "208": "DK", "372": "IE", "040": "AT", "344": "HK",
  "158": "TW", "702": "SG", "764": "TH", "352": "IS", "804": "UA",
  "203": "CZ", "348": "HU", "642": "RO", "300": "GR", "376": "IL",
  "682": "SA", "784": "AE", "458": "MY", "360": "ID", "608": "PH",
  "704": "VN", "051": "AM", "268": "GE", "233": "EE", "428": "LV",
  "440": "LT", "191": "HR", "070": "BA", "688": "RS", "100": "BG",
  "858": "UY", "604": "PE", "862": "VE", "218": "EC",
}

const FLAGS = {
  US: "🇺🇸", CA: "🇨🇦", MX: "🇲🇽", BR: "🇧🇷", AR: "🇦🇷",
  GB: "🇬🇧", FR: "🇫🇷", DE: "🇩🇪", ES: "🇪🇸", IT: "🇮🇹",
  RU: "🇷🇺", CN: "🇨🇳", JP: "🇯🇵", KR: "🇰🇷", IN: "🇮🇳",
  AU: "🇦🇺", ZA: "🇿🇦", EG: "🇪🇬", SE: "🇸🇪", NO: "🇳🇴",
  NL: "🇳🇱", BE: "🇧🇪", CH: "🇨🇭", PT: "🇵🇹", TR: "🇹🇷",
  NZ: "🇳🇿", DK: "🇩🇰", IE: "🇮🇪", AT: "🇦🇹", PL: "🇵🇱",
  CZ: "🇨🇿", HU: "🇭🇺", GR: "🇬🇷", IL: "🇮🇱", TH: "🇹🇭",
  HK: "🇭🇰", TW: "🇹🇼", CO: "🇨🇴", CL: "🇨🇱", PE: "🇵🇪",
}

import { useComparison } from "../SharedUI"

export default function WorldMapSlide({ accent, data, year, config = {} }) {
  const animSpeed = config.animationSpeed || 15000
  const countries = data?.extra?.countries || []
  const comp = useComparison()
  const prevCountries = comp.active ? (comp.data?.tautulli?.countries || comp.data?.plex?.countries || comp.data?.jellyfin?.countries || null) : null
  const prevTop3 = prevCountries?.previous?.slice(0, 3) || []
  const N = countries.length

  const [phase, setPhase] = useState(0)
  const [revealedCount, setRevealedCount] = useState(0)
  const [flickerCodes, setFlickerCodes] = useState({})
  const flickerRef = useRef(null)

  if (!countries.length) return null

  const maxCount = countries[0]?.count || 1
  const countryMap = {}
  for (const c of countries) countryMap[c.code] = c

  // Reveal order: smallest to largest
  const revealOrder = [...countries].reverse()

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 400))
    t.push(setTimeout(() => setPhase(2), 400 + animSpeed * 0.3))
    t.push(setTimeout(() => setPhase(3), 400 + animSpeed))
    return () => t.forEach(clearTimeout)
  }, [animSpeed])

  // Flicker random countries
  useEffect(() => {
    if (phase !== 1) { clearInterval(flickerRef.current); return }
    flickerRef.current = setInterval(() => {
      const codes = Object.keys(NUM_TO_ALPHA2).map((k) => NUM_TO_ALPHA2[k])
      const newFlicker = {}
      for (let i = 0; i < 5 + Math.floor(Math.random() * 5); i++) {
        newFlicker[codes[Math.floor(Math.random() * codes.length)]] = 0.08 + Math.random() * 0.35
      }
      setFlickerCodes(newFlicker)
    }, 250)
    return () => clearInterval(flickerRef.current)
  }, [phase])

  // Reveal one by one
  useEffect(() => {
    if (phase !== 2) return
    const perItem = (animSpeed * 0.6) / Math.max(1, N)
    const timers = []
    for (let i = 0; i < N; i++) {
      timers.push(setTimeout(() => setRevealedCount(i + 1), i * perItem))
    }
    return () => timers.forEach(clearTimeout)
  }, [phase, N, animSpeed])

  const done = phase === 3
  const revealedSet = new Set()
  for (let i = 0; i < revealedCount; i++) revealedSet.add(revealOrder[i]?.code)

  return (
    <div style={{ maxWidth: "clamp(320px, 92vw, 700px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          Tes films a travers <span style={{ color: accent }}>le monde</span>
        </h2>
      </div>

      {/* Map */}
      <div style={{ width: "100%", marginBottom: 12 }}>
        <ComposableMap
          projectionConfig={{ scale: 160, center: [10, 15] }}
          style={{ width: "100%", height: "auto" }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const numCode = geo.id || geo.properties?.["ISO_A3_EH"]
                const alpha2 = NUM_TO_ALPHA2[numCode] || geo.properties?.["ISO_A2"] || ""
                const cData = countryMap[alpha2]
                const isRevealed = revealedSet.has(alpha2)
                const flickerVal = flickerCodes[alpha2] || 0

                let fill, strokeW, opacity
                if (done && cData) {
                  const intensity = cData.count / maxCount
                  fill = accent
                  opacity = 0.15 + intensity * 0.85
                  strokeW = 0.4
                } else if (isRevealed && cData) {
                  const intensity = cData.count / maxCount
                  fill = accent
                  opacity = 0.15 + intensity * 0.85
                  strokeW = 0.4
                } else if (phase === 1 && flickerVal > 0) {
                  fill = accent
                  opacity = flickerVal
                  strokeW = 0.2
                } else {
                  fill = "white"
                  opacity = 0.04
                  strokeW = 0.15
                }

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    fillOpacity={opacity}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={strokeW}
                    style={{
                      default: { outline: "none", transition: "fill-opacity 0.6s ease, fill 0.4s ease" },
                      hover: { outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                )
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      {/* Top 3 countries */}
      {(done || revealedCount > 0) && (
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          {countries.slice(0, 3).map((c, i) => {
            const isShown = done || revealedSet.has(c.code)
            if (!isShown) return null
            return (
              <div key={c.code} style={{
                flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                background: i === 0 ? accent + "12" : "rgba(255,255,255,0.02)",
                border: "1px solid " + (i === 0 ? accent + "30" : "rgba(255,255,255,0.05)"),
                animation: "slide-up 0.4s ease " + (i * 0.15) + "s both",
              }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{FLAGS[c.code] || ""}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? accent : "white" }}>{c.name}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono,monospace" }}>{c.count} films</div>
              </div>
            )
          })}
        </div>
      )}

      {/* Remaining countries */}
      {done && countries.length > 3 && (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", animation: "slide-up 0.4s ease 0.3s both" }}>
          {countries.slice(3).map((c) => (
            <span key={c.code} style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 8px", borderRadius: 12,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
              fontSize: 10, color: "rgba(255,255,255,0.5)",
            }}>
              {FLAGS[c.code] || ""} {c.name} <span style={{ color: accent, fontFamily: "JetBrains Mono,monospace" }}>{c.count}</span>
            </span>
          ))}
        </div>
      )}

      {done && (
        <div style={{ marginTop: 10, fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          {countries.length} pays representes
        </div>
      )}

      {/* Previous year top 3 countries */}
      {done && prevTop3.length > 0 && (
        <>
          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "10px 0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 8, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: ".05em" }}>{year - 1}</span>
            {prevTop3.map((c, i) => (
              <span key={c.n + i} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 8px", borderRadius: 8,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 9, color: "rgba(255,255,255,0.4)",
              }}>
                {c.c && FLAGS[c.c] ? <span>{FLAGS[c.c]}</span> : null}{c.n} <span style={{ fontFamily: "JetBrains Mono,monospace", fontWeight: 700, fontSize: 8, color: "rgba(255,255,255,0.3)" }}>{c.v}</span>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
