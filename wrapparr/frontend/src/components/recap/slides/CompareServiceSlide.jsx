import { useState, useEffect, useRef } from "react"

function buildPalette(accent) {
  const hex = accent.replace("#", "")
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2
  if (max !== min) {
    const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }
  const hsl = (hue, sat, lit) => {
    sat = Math.min(1, Math.max(0, sat)); lit = Math.min(1, Math.max(0, lit))
    const c2 = (1 - Math.abs(2 * lit - 1)) * sat, x = c2 * (1 - Math.abs(((hue * 6) % 2) - 1)), m = lit - c2 / 2
    let r1, g1, b1; const i = Math.floor(hue * 6) % 6
    if (i === 0) { r1 = c2; g1 = x; b1 = 0 } else if (i === 1) { r1 = x; g1 = c2; b1 = 0 } else if (i === 2) { r1 = 0; g1 = c2; b1 = x }
    else if (i === 3) { r1 = 0; g1 = x; b1 = c2 } else if (i === 4) { r1 = x; g1 = 0; b1 = c2 } else { r1 = c2; g1 = 0; b1 = x }
    return "#" + [r1 + m, g1 + m, b1 + m].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("")
  }
  return [accent, hsl((h + 0.5) % 1, s, l)]
}

export default function CompareServiceSlide({ accent, compareData, year, config = {} }) {
  const compareMode = config.compareMode || "year_vs_year"
  const displayMode = config.displayMode || "horizontal_bars"
  const dataMetric = config.dataMetric || "total_items"
  const speed = config.animationSpeed || 12000

  const data = compareData?.[compareMode]
  if (!data) return null

  const [colors] = useState(() => buildPalette(accent))

  // Prepare comparison items
  let items = []
  let title = ""

  if (compareMode === "year_vs_year") {
    const yvy = data
    if (dataMetric === "genres" && yvy.genres) {
      items = yvy.genres.map((g) => ({ label: g.n, a: g.current, b: g.previous }))
      title = "Genres : cette annee vs la precedente"
    } else if (dataMetric === "monthly" && yvy.monthly) {
      items = yvy.monthly.map((m) => ({ label: m.m, a: m.current, b: m.previous }))
      title = "Activite mensuelle comparee"
    } else if (dataMetric === "total_hours" && yvy.total_hours) {
      items = [{ label: "Heures", a: yvy.total_hours.current, b: yvy.total_hours.previous }]
      title = "Heures d'ecoute comparees"
    } else if (yvy.total_items) {
      items = [{ label: "Contenus", a: yvy.total_items.current, b: yvy.total_items.previous }]
      title = "Contenus compares"
    }
  } else if (compareMode === "user_vs_users") {
    const me = data.me || {}
    const others = data.others || []
    const metric = dataMetric === "total_hours" ? "total_hours" : "total_items"
    items = [{ label: "Toi", a: me[metric] || 0, b: 0, isMe: true }]
    for (const o of others) {
      items.push({ label: o.name, a: 0, b: o[metric] || 0 })
    }
    title = metric === "total_hours" ? "Heures : toi vs les autres" : "Contenus : toi vs les autres"
  }

  if (!items.length) return null

  return (
    <div style={{ maxWidth: 460, width: "100%" }}>
      <div className="s0" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
          {title.split(":")[0]}<span style={{ color: accent }}>{title.includes(":") ? ":" + title.split(":")[1] : ""}</span>
        </h2>
        {compareMode === "year_vs_year" && (
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors[0] }}><span style={{ width: 10, height: 10, borderRadius: 3, background: colors[0] }} />{year}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: colors[1] }}><span style={{ width: 10, height: 10, borderRadius: 3, background: colors[1] }} />{year - 1}</span>
          </div>
        )}
      </div>

      {displayMode === "horizontal_bars" && <HorizontalBars items={items} colors={colors} speed={speed} compareMode={compareMode} accent={accent} />}
      {displayMode === "vertical_bars" && <VerticalBars items={items} colors={colors} speed={speed} compareMode={compareMode} accent={accent} />}
      {displayMode === "donut" && <DonutChart items={items} colors={colors} speed={speed} accent={accent} />}
      {displayMode === "radar" && <RadarChart items={items} colors={colors} speed={speed} accent={accent} />}
      {displayMode === "race" && <RaceMode items={items} colors={colors} speed={speed} accent={accent} />}
      {displayMode === "gauge" && <GaugeCompare items={items} colors={colors} speed={speed} accent={accent} />}
      {displayMode === "linechart" && <LineChartCompare items={items} colors={colors} speed={speed} accent={accent} year={year} />}
    </div>
  )
}

function HorizontalBars({ items, colors, speed, compareMode, accent }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPhase(1), 400); return () => clearTimeout(t) }, [])

  const maxVal = Math.max(1, ...items.flatMap((i) => [i.a, i.b]))
  const isVsUsers = compareMode === "user_vs_users"

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: isVsUsers ? 6 : 10 }}>
      {items.map((item, i) => {
        const delay = i * 0.1
        if (isVsUsers) {
          const val = item.a || item.b
          const pct = (val / maxVal) * 100
          const color = item.isMe ? colors[0] : colors[1]
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, animation: `slide-up 0.4s ease ${delay}s both` }}>
              <div style={{ width: 60, fontSize: 10, color: item.isMe ? accent : "rgba(255,255,255,0.5)", fontWeight: item.isMe ? 700 : 400, textAlign: "right" }}>{item.label}</div>
              <div style={{ flex: 1, height: 22, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${color}80, ${color})`, width: phase ? pct + "%" : "0%", transition: `width 1s ease ${delay}s`, boxShadow: item.isMe ? `0 0 12px ${color}40` : "none" }} />
                <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: "white", fontFamily: "JetBrains Mono,monospace", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{Math.round(val)}</span>
              </div>
            </div>
          )
        }
        return (
          <div key={i} style={{ animation: `slide-up 0.4s ease ${delay}s both` }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{item.label}</div>
            {[{ val: item.a, color: colors[0] }, { val: item.b, color: colors[1] }].map((bar, bi) => (
              <div key={bi} style={{ height: 18, background: "rgba(255,255,255,0.03)", borderRadius: 4, overflow: "hidden", position: "relative", marginBottom: 3 }}>
                <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(90deg, ${bar.color}80, ${bar.color})`, width: phase ? (bar.val / maxVal * 100) + "%" : "0%", transition: `width 1s ease ${delay + bi * 0.1}s` }} />
                <span style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", fontSize: 9, fontWeight: 700, color: "white", fontFamily: "JetBrains Mono,monospace", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{Math.round(bar.val)}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function VerticalBars({ items, colors, speed, compareMode, accent }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPhase(1), 400); return () => clearTimeout(t) }, [])
  const maxVal = Math.max(1, ...items.flatMap((i) => [i.a, i.b]))
  const H = 140

  return (
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: H + 30, justifyContent: "center" }}>
      {items.map((item, i) => {
        const delay = i * 0.1
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1, maxWidth: 60 }}>
            <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: H }}>
              <div style={{ width: 18, borderRadius: "4px 4px 0 0", background: colors[0], height: phase ? (item.a / maxVal * H) + "px" : "0px", transition: `height 1s ease ${delay}s`, boxShadow: `0 0 8px ${colors[0]}30` }} />
              <div style={{ width: 18, borderRadius: "4px 4px 0 0", background: colors[1], height: phase ? (item.b / maxVal * H) + "px" : "0px", transition: `height 1s ease ${delay + 0.1}s`, opacity: 0.7 }} />
            </div>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.35)", textAlign: "center", marginTop: 4 }}>{item.label}</div>
          </div>
        )
      })}
    </div>
  )
}

function DonutChart({ items, colors, speed, accent }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPhase(1), 400); return () => clearTimeout(t) }, [])

  const totalA = items.reduce((s, i) => s + i.a, 0)
  const totalB = items.reduce((s, i) => s + i.b, 0)
  const pctA = totalA + totalB > 0 ? totalA / (totalA + totalB) : 0.5
  const r = 70, cx = 100, cy = 100, stroke = 20
  const circ = 2 * Math.PI * r

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={200} height={200} viewBox="0 0 200 200" style={{ display: "block", margin: "0 auto" }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={colors[1] + "40"} strokeWidth={stroke} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={colors[0]} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={phase ? circ * (1 - pctA) : circ}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: "stroke-dashoffset 1.5s ease 0.3s", filter: `drop-shadow(0 0 6px ${colors[0]}50)` }} />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={24} fontWeight={800}>{Math.round(pctA * 100)}%</text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={10}>vs {Math.round((1 - pctA) * 100)}%</text>
      </svg>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", marginTop: 8 }}>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: colors[0] }}>{Math.round(totalA)}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>actuel</div></div>
        <div style={{ textAlign: "center" }}><div style={{ fontSize: 18, fontWeight: 800, color: colors[1] }}>{Math.round(totalB)}</div><div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>precedent</div></div>
      </div>
    </div>
  )
}

function RadarChart({ items, colors, speed, accent }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPhase(1), 500); return () => clearTimeout(t) }, [])

  if (items.length < 3) return <HorizontalBars items={items} colors={colors} speed={speed} accent={accent} />

  const cx = 120, cy = 120, maxR = 90
  const n = items.length
  const maxVal = Math.max(1, ...items.flatMap((i) => [i.a, i.b]))

  const polygon = (getVal, color, opacity) => {
    const pts = items.map((item, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2
      const r = phase ? (getVal(item) / maxVal) * maxR : 0
      return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
    }).join(" ")
    return <polygon points={pts} fill={color + "20"} stroke={color} strokeWidth={2} opacity={opacity}
      style={{ transition: "all 1.2s ease 0.3s" }} />
  }

  return (
    <svg width={240} height={240} viewBox="0 0 240 240" style={{ display: "block", margin: "0 auto" }}>
      {/* Grid */}
      {[0.25, 0.5, 0.75, 1].map((pct) => (
        <polygon key={pct} points={items.map((_, i) => {
          const a = (Math.PI * 2 * i) / n - Math.PI / 2
          return `${cx + maxR * pct * Math.cos(a)},${cy + maxR * pct * Math.sin(a)}`
        }).join(" ")} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
      ))}
      {/* Axes */}
      {items.map((item, i) => {
        const a = (Math.PI * 2 * i) / n - Math.PI / 2
        const lx = cx + (maxR + 16) * Math.cos(a)
        const ly = cy + (maxR + 16) * Math.sin(a)
        return <g key={i}>
          <line x1={cx} y1={cy} x2={cx + maxR * Math.cos(a)} y2={cy + maxR * Math.sin(a)} stroke="rgba(255,255,255,0.06)" />
          <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.3)" fontSize={8}>{item.label}</text>
        </g>
      })}
      {polygon((i) => i.b, colors[1], 0.5)}
      {polygon((i) => i.a, colors[0], 1)}
    </svg>
  )
}

function RaceMode({ items, colors, speed, accent }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const dur = speed * 0.7
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      setProgress(1 - Math.pow(1 - p, 3))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 500)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [speed])

  const maxVal = Math.max(1, ...items.flatMap((i) => [i.a, i.b]))

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((item, i) => {
        const pctA = (item.a / maxVal) * progress * 100
        const pctB = (item.b / maxVal) * progress * 100
        return (
          <div key={i}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>{item.label}</div>
            {[{ pct: pctA, color: colors[0], val: item.a }, { pct: pctB, color: colors[1], val: item.b }].map((bar, bi) => (
              <div key={bi} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <div style={{ flex: 1, height: 20, background: "rgba(255,255,255,0.03)", borderRadius: 10, overflow: "hidden", position: "relative" }}>
                  <div style={{ height: "100%", borderRadius: 10, background: `linear-gradient(90deg, ${bar.color}60, ${bar.color})`, width: bar.pct + "%", boxShadow: `0 0 10px ${bar.color}40` }}>
                    <div style={{ position: "absolute", right: Math.max(0, 100 - bar.pct) + "%", top: "50%", transform: "translate(50%, -50%)", fontSize: 12 }}>{bi === 0 ? "🏃" : "🏃‍♂️"}</div>
                  </div>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: bar.color, fontFamily: "JetBrains Mono,monospace", width: 36, textAlign: "right" }}>{Math.round(bar.val * progress)}</span>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

function GaugeCompare({ items, colors, speed, accent }) {
  const [phase, setPhase] = useState(0)
  useEffect(() => { const t = setTimeout(() => setPhase(1), 400); return () => clearTimeout(t) }, [])

  const totalA = items.reduce((s, i) => s + i.a, 0)
  const totalB = items.reduce((s, i) => s + i.b, 0)
  const maxVal = Math.max(totalA, totalB, 1)
  const pctA = totalA / maxVal
  const pctB = totalB / maxVal
  const diff = totalA - totalB
  const diffPct = totalB > 0 ? Math.round(((totalA - totalB) / totalB) * 100) : 0

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-end", marginBottom: 20 }}>
        {[{ val: totalA, pct: pctA, color: colors[0], label: "Actuel" }, { val: totalB, pct: pctB, color: colors[1], label: "Precedent" }].map((g, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ width: 80, height: 120, position: "relative", background: "rgba(255,255,255,0.03)", borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: `linear-gradient(180deg, ${g.color}, ${g.color}80)`, height: phase ? (g.pct * 100) + "%" : "0%", transition: "height 1.5s ease 0.3s", borderRadius: "0 0 7px 7px" }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "white", textShadow: "0 2px 8px rgba(0,0,0,0.5)" }}>{Math.round(g.val)}</div>
              </div>
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>{g.label}</div>
          </div>
        ))}
      </div>
      {phase > 0 && (
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 16px", borderRadius: 20,
          background: diff >= 0 ? accent + "15" : "rgba(239,68,68,0.1)",
          border: `1px solid ${diff >= 0 ? accent + "30" : "rgba(239,68,68,0.2)"}`,
          animation: "slide-up 0.4s ease 1s both",
        }}>
          <span style={{ fontSize: 16 }}>{diff >= 0 ? "📈" : "📉"}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: diff >= 0 ? accent : "#f87171" }}>
            {diff >= 0 ? "+" : ""}{diffPct}%
          </span>
        </div>
      )}
    </div>
  )
}

function LineChartCompare({ items, colors, speed, accent, year }) {
  const [progress, setProgress] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    const start = performance.now()
    const dur = 1500
    const t = setTimeout(() => {
      const tick = (now) => {
        const p = Math.min(1, (now - start - 500) / dur)
        setProgress(Math.max(0, 1 - Math.pow(1 - p, 3)))
        if (p < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, 500)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [])

  if (items.length < 2) return <HorizontalBars items={items} colors={colors} speed={speed} accent={accent} />

  const W = 400, H = 140, padX = 30, padY = 10
  const n = items.length
  const maxVal = Math.max(1, ...items.flatMap((i) => [i.a, i.b]))

  const toX = (i) => padX + (i / (n - 1)) * (W - padX * 2)
  const toY = (val) => padY + (1 - val / maxVal) * (H - padY * 2)

  const pathA = items.map((item, i) => {
    const x = toX(i), y = toY(item.a * progress)
    return (i === 0 ? "M" : "L") + x + "," + y
  }).join(" ")

  const pathB = items.map((item, i) => {
    const x = toX(i), y = toY(item.b * progress)
    return (i === 0 ? "M" : "L") + x + "," + y
  }).join(" ")

  const areaA = pathA + ` L${toX(n - 1)},${H - padY} L${padX},${H - padY} Z`

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} style={{ display: "block" }}>
        {[0.25, 0.5, 0.75, 1].map((pct) => (
          <line key={pct} x1={padX} x2={W - padX} y1={toY(maxVal * pct)} y2={toY(maxVal * pct)}
            stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
        ))}
        <path d={areaA} fill={colors[0] + "12"} />
        <path d={pathB} fill="none" stroke={colors[1]} strokeWidth={2} strokeDasharray="5 4" opacity={0.4}
          style={{ filter: `drop-shadow(0 0 3px ${colors[1]}30)` }} />
        <path d={pathA} fill="none" stroke={colors[0]} strokeWidth={2.5}
          style={{ filter: `drop-shadow(0 0 6px ${colors[0]}50)` }} />
        {items.map((item, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(item.a * progress)} r={3.5} fill={colors[0]} stroke="white" strokeWidth={1.5} />
            <circle cx={toX(i)} cy={toY(item.b * progress)} r={2.5} fill={colors[1]} opacity={0.5} />
          </g>
        ))}
        {items.map((item, i) => (
          <text key={i} x={toX(i)} y={H + 12} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize={8}
            fontFamily="JetBrains Mono,monospace">{item.label}</text>
        ))}
      </svg>
      {progress > 0.9 && (
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, animation: "slide-up 0.4s ease both" }}>
          {[
            { label: year, val: items.reduce((s, i) => s + i.a, 0), color: colors[0] },
            { label: year - 1, val: items.reduce((s, i) => s + i.b, 0), color: colors[1] },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "JetBrains Mono,monospace" }}>{Math.round(s.val)}</div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
