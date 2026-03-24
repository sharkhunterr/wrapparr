import { useState, useEffect, useRef } from "react"

function formatBudget(n) {
  if (!n) return "0"
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "Md$"
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + "M$"
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K$"
  return n + "$"
}

function formatMultiplier(budget, revenue) {
  if (!budget || budget <= 0) return null
  const mult = revenue / budget
  if (mult >= 100) return "x" + Math.round(mult)
  if (mult >= 10) return "x" + mult.toFixed(0)
  return "x" + mult.toFixed(1)
}

function AnimatedCounter({ target, accent, duration = 2000 }) {
  const [val, setVal] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration)
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target))
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    const t = setTimeout(() => { raf.current = requestAnimationFrame(tick) }, 400)
    return () => { clearTimeout(t); cancelAnimationFrame(raf.current) }
  }, [target, duration])
  return <span style={{ fontSize: 32, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{formatBudget(val)}</span>
}

// Falling money effect — coins spinning + bills floating
function MoneyRain({ active, accent }) {
  const items = useRef(Array.from({ length: 30 }, () => ({
    x: Math.random() * 100,
    dur: 2.5 + Math.random() * 3,
    delay: Math.random() * 3,
    size: 12 + Math.random() * 14,
    type: Math.random() > 0.5 ? "coin" : "bill",
    rotStart: Math.random() * 360,
    rotSpeed: 200 + Math.random() * 500,
    wobble: 10 + Math.random() * 20,
    wobbleSpeed: 1 + Math.random() * 2,
  }))).current

  if (!active) return null

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
      {items.map((item, i) => {
        const isCoin = item.type === "coin"
        return (
          <div key={i} style={{
            position: "absolute",
            left: `${item.x}%`,
            top: -30,
            fontSize: item.size,
            animation: `money-fall ${item.dur}s ease-in ${item.delay}s infinite`,
            filter: isCoin ? `drop-shadow(0 2px 4px ${accent}40)` : "none",
          }}>
            <div style={{
              animation: isCoin
                ? `coin-spin ${0.4 + Math.random() * 0.6}s linear infinite`
                : `bill-float ${item.wobbleSpeed}s ease-in-out infinite alternate`,
            }}>
              {isCoin ? "🪙" : "💵"}
            </div>
          </div>
        )
      })}
      <style>{`
        @keyframes money-fall {
          0% { transform: translateY(-30px); opacity: 0.8; }
          85% { opacity: 0.6; }
          100% { transform: translateY(110vh); opacity: 0; }
        }
        @keyframes coin-spin {
          0% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(0.8); }
          100% { transform: rotateY(360deg) scale(1); }
        }
        @keyframes bill-float {
          0% { transform: rotate(-15deg) translateX(-8px); }
          100% { transform: rotate(15deg) translateX(8px); }
        }
      `}</style>
    </div>
  )
}

function BracketBar({ label, count, maxCount, accent, delay, animated }) {
  const pct = (count / Math.max(1, maxCount)) * 100
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, animation: animated ? `slide-up 0.4s ease ${delay}s both` : "none" }}>
      <div style={{ width: 55, fontSize: 9, color: "rgba(255,255,255,0.4)", textAlign: "right", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 24, background: "rgba(255,255,255,0.03)", borderRadius: 6, overflow: "hidden", position: "relative" }}>
        <div style={{
          height: "100%", borderRadius: 6,
          background: `linear-gradient(90deg, ${accent}50, ${accent})`,
          width: animated ? pct + "%" : "0%",
          transition: `width 1s cubic-bezier(0.25,0.46,0.45,0.94) ${delay}s`,
          boxShadow: `0 0 12px ${accent}25`,
        }} />
        <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 700, color: "white", fontFamily: "JetBrains Mono,monospace", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
          {count} film{count > 1 ? "s" : ""}
        </div>
      </div>
    </div>
  )
}

function BudgetLineChart({ allBudgets, average, accent, animated }) {
  if (!allBudgets || allBudgets.length < 2) return null

  const W = 400, H = 130, padX = 10, padY = 15
  const maxB = Math.max(1, ...allBudgets.map((b) => b.budget))
  const n = allBudgets.length

  const toX = (i) => padX + (i / (n - 1)) * (W - padX * 2)
  const toY = (v) => padY + (1 - v / maxB) * (H - padY * 2)

  // Build path
  const path = allBudgets.map((b, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(b.budget)}`).join(" ")
  const areaPath = path + ` L${toX(n - 1)},${H - padY} L${padX},${H - padY} Z`

  // Average line position
  const avgY = toY(average)

  return (
    <div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 25}`} style={{ display: "block" }}>
        {/* Grid */}
        {[0.25, 0.5, 0.75].map((pct) => (
          <line key={pct} x1={padX} x2={W - padX} y1={toY(maxB * pct)} y2={toY(maxB * pct)} stroke="rgba(255,255,255,0.04)" />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={accent + "10"} style={{ opacity: animated ? 1 : 0, transition: "opacity 1s ease" }} />

        {/* Line */}
        <path d={path} fill="none" stroke={accent} strokeWidth={2.5}
          strokeDasharray={animated ? "none" : "2000"}
          strokeDashoffset={animated ? "0" : "2000"}
          style={{ transition: "stroke-dashoffset 2s ease", filter: `drop-shadow(0 0 4px ${accent}50)` }} />

        {/* Average line — vertical dashed */}
        <line x1={padX} x2={W - padX} y1={avgY} y2={avgY}
          stroke="rgba(255,255,255,0.3)" strokeWidth={1} strokeDasharray="4 3"
          style={{ opacity: animated ? 1 : 0, transition: "opacity 1s ease 1s" }} />
        <text x={W - padX - 2} y={avgY - 5} textAnchor="end" fill="rgba(255,255,255,0.4)" fontSize={8} fontFamily="JetBrains Mono,monospace"
          style={{ opacity: animated ? 1 : 0, transition: "opacity 1s ease 1s" }}>
          moy. {formatBudget(average)}
        </text>

        {/* Labels for first, last, and max — no dots */}
        {allBudgets.map((b, i) => (
          (i === 0 || i === n - 1 || b.budget === maxB) ? (
            <text key={i} x={toX(i)} y={H + 12} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} fill="rgba(255,255,255,0.3)" fontSize={7} fontFamily="JetBrains Mono,monospace"
              style={{ opacity: animated ? 1 : 0, transition: `opacity 0.4s ease ${0.5 + i * 0.05}s` }}>
              {b.t.length > 12 ? b.t.slice(0, 10) + ".." : b.t}
            </text>
          ) : null
        ))}

        {/* Y axis labels */}
        <text x={padX} y={padY - 4} fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="JetBrains Mono,monospace">{formatBudget(maxB)}</text>
        <text x={padX} y={H - padY + 10} fill="rgba(255,255,255,0.2)" fontSize={7} fontFamily="JetBrains Mono,monospace">0</text>
      </svg>
    </div>
  )
}

function FilmBudgetCard({ film, accent, rank, delay, animated }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
      background: rank === 0 ? `${accent}0a` : "rgba(255,255,255,0.015)",
      border: `1px solid ${rank === 0 ? accent + "25" : "rgba(255,255,255,0.04)"}`,
      animation: animated ? `slide-up 0.4s ease ${delay}s both` : "none",
    }}>
      {film.thumb ? (
        <img src={film.thumb} alt="" style={{ width: 28, height: 40, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />
      ) : (
        <div style={{ width: 28, height: 40, borderRadius: 4, background: "rgba(255,255,255,0.05)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🎬</div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: rank === 0 ? accent : "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{film.t}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{formatBudget(film.budget)}</div>
      </div>
    </div>
  )
}

export default function BudgetSlide({ accent, data, year, config = {} }) {
  const budgets = data?.extra?.budgets
  const displayMode = config.displayMode || "bars"
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const t = []
    t.push(setTimeout(() => setPhase(1), 400))
    t.push(setTimeout(() => setPhase(2), 2000))
    t.push(setTimeout(() => setPhase(3), 3500))
    t.push(setTimeout(() => setPhase(4), 5000))
    return () => t.forEach(clearTimeout)
  }, [])

  if (!budgets || !budgets.count) return null

  const maxBracket = Math.max(1, ...budgets.distribution.map((d) => d.count))

  return (
    <div style={{ maxWidth: 460, width: "100%", position: "relative" }}>
      {/* Money rain effect when done */}
      {/* MoneyRain removed */}

      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="s0" style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 6 }}>WRAPPARR · {year}</div>
          <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>
            Le budget de <span style={{ color: accent }}>tes films</span>
          </h2>
        </div>

        {/* Average budget counter */}
        <div style={{
          textAlign: "center", padding: "16px 20px", borderRadius: 14, marginBottom: 14,
          background: `linear-gradient(135deg, ${accent}08, ${accent}04)`,
          border: `1px solid ${accent}20`, boxShadow: `0 0 40px ${accent}08`,
        }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".15em", marginBottom: 6 }}>Budget moyen des films vus</div>
          {phase >= 1 ? <AnimatedCounter target={budgets.average} accent={accent} /> : <span style={{ fontSize: 32, color: "rgba(255,255,255,0.1)" }}>...</span>}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
            sur {budgets.count} films · total cumule {formatBudget(budgets.total)}
          </div>
        </div>

        {/* Distribution — bars or linechart */}
        {phase >= 2 && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6, fontWeight: 600 }}>
              {displayMode === "linechart" ? "Budget par film" : "Repartition par budget"}
            </div>
            {displayMode === "linechart" && budgets.all_budgets?.length >= 2 ? (
              <BudgetLineChart allBudgets={budgets.all_budgets} average={budgets.average} accent={accent} animated={phase >= 2} />
            ) : budgets.distribution.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {budgets.distribution.map((b, i) => (
                  <BracketBar key={b.label} label={b.label} count={b.count} maxCount={maxBracket} accent={accent} delay={i * 0.12} animated={phase >= 2} />
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Top expensive + cheap */}
        {phase >= 3 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {budgets.top_expensive?.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: accent, fontWeight: 600, marginBottom: 4 }}>Les plus chers</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {budgets.top_expensive.map((f, i) => (
                    <FilmBudgetCard key={f.t} film={f} accent={accent} rank={i} delay={i * 0.1} animated={phase >= 3} />
                  ))}
                </div>
              </div>
            )}
            {budgets.top_cheap?.length > 0 && (
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 4 }}>Les moins chers</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {budgets.top_cheap.map((f, i) => (
                    <FilmBudgetCard key={f.t} film={f} accent={accent} rank={-1} delay={i * 0.1 + 0.3} animated={phase >= 3} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Best ROI — multiplier format */}
        {phase >= 4 && budgets.best_roi?.length > 0 && (
          <div style={{ animation: "slide-up 0.4s ease both" }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600, marginBottom: 4 }}>Meilleur retour sur investissement</div>
            <div style={{ display: "flex", gap: 6 }}>
              {budgets.best_roi.map((f, i) => {
                const mult = formatMultiplier(f.budget, f.revenue)
                return (
                  <div key={f.t} style={{
                    flex: 1, padding: "8px 8px", borderRadius: 8, textAlign: "center",
                    background: i === 0 ? `${accent}0a` : "rgba(255,255,255,0.015)",
                    border: `1px solid ${i === 0 ? accent + "20" : "rgba(255,255,255,0.04)"}`,
                  }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: f.revenue > f.budget ? "#4ade80" : "#f87171", fontFamily: "JetBrains Mono,monospace" }}>
                      {mult || "?"}
                    </div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.t}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace" }}>
                      {formatBudget(f.budget)} → {formatBudget(f.revenue)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
