import { useState, useEffect, useRef } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line } from "recharts"

// ── Hooks ──
function useActive() { const [a, setA] = useState(false); useEffect(() => { const t = setTimeout(() => setA(true), 60); return () => clearTimeout(t) }, []); return a }
function useCounter(target, active, dur = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => { if (!active) { setV(0); return }; let c = 0; const inc = target / (dur / 16); const t = setInterval(() => { c += inc; if (c >= target) { setV(target); clearInterval(t) } else setV(Math.floor(c)) }, 16); return () => clearInterval(t) }, [active, target, dur])
  return v
}
function AN({ t, s = "" }) { const [v, setV] = useState(0); useEffect(() => { let c = 0; const inc = t / 80; const tm = setInterval(() => { c += inc; if (c >= t) { setV(t); clearInterval(tm) } else setV(Math.floor(c)) }, 16); return () => clearInterval(tm) }, [t]); return <>{v.toLocaleString("fr-FR")}{s}</> }

// ── Shared UI ──
const Lbl = ({ c = "rgba(255,255,255,0.32)", size = 10, children, upper = true }) => <div style={{ color: c, fontSize: size, textTransform: upper ? "uppercase" : "none", letterSpacing: "0.12em" }}>{children}</div>
const Tag = ({ accent }) => <div style={{ color: accent, fontSize: 9, letterSpacing: "0.3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 7, opacity: 0.8 }}>WRAPPARR · 2024</div>
const Pill = ({ children, accent }) => <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 18, background: accent + "1e", border: "1px solid " + accent + "38", color: accent, fontSize: 10 }}>{children}</span>
const VsB = ({ value, label = "vs année préc." }) => { const p = value > 0; return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 18, background: p ? "#22c55e16" : "#ef444416", border: "1px solid " + (p ? "#22c55e" : "#ef4444") + "40", color: p ? "#4ade80" : "#f87171", fontSize: 11, fontWeight: 600, animation: "badge-p .5s ease .6s both" }}>{p ? "↑" : "↓"} {p ? "+" : ""}{value}% {label}</span> }
function BigNum({ value, suffix = "", accent, active, delay = 0.05 }) { const v = useCounter(value, active); return <div style={{ fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em", animation: "cpop .55s ease " + delay + "s both,flash-n .9s ease " + (delay + 0.45) + "s both" }}>{v.toLocaleString("fr-FR")}{suffix}</div> }
function CTip({ active, payload, label, unit = "h" }) { if (!active || !payload?.length) return null; return <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}><div style={{ color: "rgba(255,255,255,.4)", marginBottom: 2 }}>{label}</div>{payload.map((p) => <div key={p.dataKey} style={{ color: p.color || "white", fontWeight: 600 }}>{p.value}{unit}</div>)}</div> }

function AreaG({ data, dataKey, accent, height = 52, unit = "h", id }) {
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit} />} /><Area type="monotone" dataKey={dataKey || "v"} stroke={accent} strokeWidth={2} fill={"url(#" + id + ")"} dot={false} /></AreaChart></ResponsiveContainer>
}
function DayChart({ data, accent, height = 55, unit }) {
  return <ResponsiveContainer width="100%" height={height}><BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}><XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} /><Bar dataKey="v" radius={[3, 3, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={d.d === "Sam" || d.d === "Dim" || d.d === "Ven" ? accent : accent + "45"} />)}</Bar></BarChart></ResponsiveContainer>
}
function TimeChart({ data, accent, height = 50, unit }) {
  const gId = "tg" + accent.replace(/[^a-f0-9]/gi, "")
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} /><Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill={"url(#" + gId + ")"} dot={false} /></AreaChart></ResponsiveContainer>
}
function MiniRank({ data, accent, unit = "h", label = "Classement", me = "" }) {
  if (!data?.length) return null
  const max = data[0].v; const medals = ["🥇", "🥈", "🥉"]
  return <div className="glass" style={{ padding: "12px 14px" }}>
    <Lbl c={accent} size={9}>{label}</Lbl>
    <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 5 }}>
      {data.map((u, i) => { const isMe = u.n === me; return (
        <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 7, animation: "slide-up .4s ease " + (0.08 + i * 0.07) + "s both" }}>
          <div style={{ width: 20, textAlign: "center", fontSize: 12, flexShrink: 0, color: i < 3 ? "transparent" : "rgba(255,255,255,.22)", fontWeight: 700 }}>{i < 3 ? medals[i] : i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 11, fontWeight: isMe ? 700 : 400, color: isMe ? accent : "rgba(255,255,255,.65)" }}>{u.n}{isMe && <span style={{ fontSize: 9, opacity: 0.5 }}> · moi</span>}</span>
              <span style={{ fontSize: 10, color: isMe ? accent : "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono,monospace" }}>{(u.v || 0).toLocaleString("fr-FR")}{unit}</span>
            </div>
            <div style={{ height: 2, background: "rgba(255,255,255,.05)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", background: isMe ? "linear-gradient(90deg," + accent + "," + accent + "80)" : "rgba(255,255,255,.16)", width: (u.v / max * 100) + "%", borderRadius: 2, transformOrigin: "left", animation: "bar-grow .7s ease " + (0.28 + i * 0.07) + "s both" }} />
            </div>
          </div>
        </div>
      ) })}
    </div>
  </div>
}

// ── CATEGORY SLIDE ──
export function SlideCat({ accent, bg, icon, label, sub }) {
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 10, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 80% 60% at 50% 50%," + accent + "18 0%,transparent 70%)", animation: "cat-glow 3s ease-in-out infinite" }} />
      <div style={{ position: "absolute", top: "22%", left: "5%", right: "5%", height: 1, background: "linear-gradient(90deg,transparent," + accent + "60," + accent + "90," + accent + "60,transparent)", animation: "cat-bar-in 1s ease .3s both" }} />
      <div style={{ fontSize: "clamp(48px, 14vw, 100px)", marginBottom: 18, filter: "drop-shadow(0 0 48px " + accent + "90)", animation: "cat-icon-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both" }}>{icon}</div>
      <h1 style={{ fontSize: "clamp(28px, 10vw, 76px)", fontWeight: 800, color: "white", lineHeight: 0.9, letterSpacing: "-0.02em", marginBottom: 10, textAlign: "center", textShadow: "0 0 90px " + accent + "70", animation: "cat-title-in 0.9s ease 0.5s both" }}>{label}</h1>
      <div style={{ fontSize: "clamp(12px, 3vw, 15px)", color: accent + "cc", fontWeight: 300, letterSpacing: "0.06em", textAlign: "center", animation: "slide-up .6s ease .9s both" }}>{sub}</div>
      <div style={{ position: "absolute", bottom: "22%", left: "5%", right: "5%", height: 1, background: "linear-gradient(90deg,transparent," + accent + "60," + accent + "90," + accent + "60,transparent)", animation: "cat-bar-in 1s ease .5s both" }} />
      <div style={{ position: "absolute", bottom: "11%", left: "50%", transform: "translateX(-50%)", fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", letterSpacing: ".3em", textTransform: "uppercase", animation: "slide-up .5s ease 1.2s both" }}>SWIPE POUR COMMENCER ↓</div>
    </div>
  )
}

// ── PODIUM ──
const PODIUM_DELAYS = [400, 1100, 2000]
const PODIUM_H = [88, 110, 132]

export function SlidePodium({ accent, bg, data = [], title, icon, jokes = [], statLabel, statKey, statSuffix = "" }) {
  const [phase, setPhase] = useState(0)
  const [jokeIdx, setJokeIdx] = useState(0)
  const [jokeVisible, setJokeVisible] = useState(true)
  const [revealed, setRevealed] = useState([false, false, false])

  useEffect(() => { setPhase(0); setJokeIdx(0); setJokeVisible(true); setRevealed([false, false, false]); const t1 = setTimeout(() => setPhase(1), 1800); return () => clearTimeout(t1) }, [])
  useEffect(() => { if (phase !== 1) return; let idx = 0; const advance = () => { setJokeVisible(false); setTimeout(() => { idx++; if (idx >= jokes.length) { setPhase(2); return }; setJokeIdx(idx); setJokeVisible(true); setTimeout(advance, 1800) }, 350) }; const t = setTimeout(advance, 1800); return () => clearTimeout(t) }, [phase])
  useEffect(() => { if (phase !== 2) return; PODIUM_DELAYS.forEach((delay, i) => { setTimeout(() => setRevealed((prev) => { const n = [...prev]; n[i] = true; return n }), delay) }) }, [phase])

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 20px", position: "relative", zIndex: 10 }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "70vw", height: "55vh", pointerEvents: "none", zIndex: 1, background: "radial-gradient(ellipse at 50% 0%," + accent + "25 0%,transparent 70%)", animation: "spotlight-pulse 3s ease-in-out infinite" }} />

      <div style={{ textAlign: "center", marginBottom: phase >= 2 ? 16 : 24, position: "relative", zIndex: 5, transition: "margin .4s" }}>
        <div style={{ fontSize: 34, marginBottom: 6, filter: "drop-shadow(0 0 20px " + accent + ")", animation: "float 3s ease-in-out infinite" }}>{icon}</div>
        <div style={{ fontSize: 9, color: accent, letterSpacing: ".3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 4 }}>WRAPPARR · 2024</div>
        <h2 style={{ fontSize: "clamp(18px, 5vw, 28px)", fontWeight: 800, color: "white", lineHeight: 1.05, animation: "slide-up .7s ease .2s both" }}>{title}</h2>
      </div>

      {phase === 0 && <div style={{ position: "relative", width: 80, height: 80, zIndex: 5 }}>{[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "2px solid " + accent, animation: "pulse-ring 1.8s ease-out " + (i * 0.6) + "s infinite" }} />)}<div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, filter: "drop-shadow(0 0 20px " + accent + ")" }}>🎭</div></div>}

      {phase === 1 && <div style={{ zIndex: 5, textAlign: "center", maxWidth: 320, position: "relative" }}>
        <div style={{ height: 3, borderRadius: 2, marginBottom: 20, background: "linear-gradient(90deg,transparent," + accent + ",transparent)", animation: "drum-roll 0.4s ease-in-out infinite" }} />
        <div style={{ fontSize: "clamp(14px, 4vw, 18px)", color: "white", fontWeight: 400, lineHeight: 1.5, minHeight: 56, opacity: jokeVisible ? 1 : 0, transform: jokeVisible ? "translateY(0)" : "translateY(-10px)", transition: "opacity .3s ease,transform .3s ease" }}>{jokes[jokeIdx]}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 16 }}>{jokes.map((_, i) => <div key={i} style={{ width: i <= jokeIdx ? 20 : 6, height: 6, borderRadius: 3, background: i <= jokeIdx ? accent : "rgba(255,255,255,0.15)", transition: "all .3s ease" }} />)}</div>
      </div>}

      {phase === 2 && <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 5 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, width: "100%" }}>
          {[{ item: data[2], rIdx: 0, isOne: false }, { item: data[0], rIdx: 2, isOne: true }, { item: data[1], rIdx: 1, isOne: false }].map(({ item, rIdx, isOne }, col) => {
            if (!item) return <div key={col} style={{ flex: isOne ? 1.15 : 1 }} />
            const realRank = 3 - rIdx
            return (
              <div key={col} style={{ flex: isOne ? 1.15 : 1, display: "flex", flexDirection: "column", alignItems: "center", opacity: revealed[rIdx] ? 1 : 0, transition: "opacity .1s" }}>
                {isOne && revealed[rIdx] && <div style={{ fontSize: 24, marginBottom: 4, animation: "crown-bounce 1.8s ease-in-out infinite", filter: "drop-shadow(0 0 12px " + accent + ")" }}>👑</div>}
                {revealed[rIdx] && <div style={{ fontSize: isOne ? 38 : 28, fontWeight: 800, marginBottom: 6, color: accent, lineHeight: 1, textShadow: "0 0 30px " + accent, animation: "rank-stamp .5s cubic-bezier(0.34,1.56,0.64,1) both" }}>#{realRank}</div>}
                <div style={{ width: "100%", borderRadius: "6px 6px 0 0", height: PODIUM_H[rIdx], background: revealed[rIdx] ? "linear-gradient(180deg," + accent + "38 0%," + accent + "18 100%)" : "rgba(255,255,255,0.04)", border: "1px solid " + (revealed[rIdx] ? accent + "55" : "rgba(255,255,255,0.05)"), borderBottom: "none", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "10px 6px", boxShadow: revealed[rIdx] ? "0 -4px 30px " + accent + "35,inset 0 1px 0 " + accent + "45" : "none", animation: revealed[rIdx] ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none" }}>
                  {revealed[rIdx] && <>
                    <div style={{ color: "white", fontWeight: 700, fontSize: isOne ? 11 : 9, textAlign: "center", lineHeight: 1.2, marginBottom: 4, animation: "stat-count .4s ease .3s both" }}>{(item.t || "").length > 16 ? (item.t || "").slice(0, 14) + "…" : item.t}</div>
                    <div style={{ color: accent, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", fontSize: isOne ? 15 : 11, animation: "stat-count .4s ease .45s both" }}>{item[statKey]}{statSuffix}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", animation: "stat-count .4s ease .55s both" }}>{statLabel}</div>
                  </>}
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ height: 6, borderRadius: 4, marginTop: 0, background: "linear-gradient(90deg,transparent," + accent + "40," + accent + "70," + accent + "40,transparent)", boxShadow: "0 0 20px " + accent + "30" }} />
      </div>}
    </div>
  )
}

// ── INTRO ──
export function SlideIntro({ accent, userName, year, onStart }) {
  return <div style={{ textAlign: "center", maxWidth: 380, width: "100%" }}>
    <div style={{ position: "relative", width: 130, height: 130, margin: "0 auto 26px" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid " + accent, animation: "pulse-ring 3s ease-out " + (i * 0.8) + "s infinite" }} />)}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 54, filter: "drop-shadow(0 0 40px " + accent + "90)" }}>🎬</div>
    </div>
    <div className="s0" style={{ fontSize: 9, color: accent, letterSpacing: ".35em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase" }}>WRAPPARR · RECAP ANNUEL</div>
    <h1 className="s1" style={{ fontSize: "clamp(32px, 10vw, 72px)", fontWeight: 800, color: "white", lineHeight: 0.88, margin: "10px 0 6px", textShadow: "0 0 120px " + accent + "55" }}>
      WRAP<span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARR</span>
    </h1>
    <p className="s2" style={{ fontSize: 16, color: "rgba(255,255,255,.42)", margin: "14px 0 4px" }}>Bienvenue, <span style={{ color: "white", fontWeight: 600 }}>{userName}</span></p>
    <p className="s3" style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginBottom: 34, fontFamily: "JetBrains Mono,monospace" }}>Ton année {year}<span style={{ animation: "blink-c 1s step-end infinite" }}>|</span></p>
    <button className="s4" onClick={onStart} style={{ padding: "14px 42px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 15, fontWeight: 800, boxShadow: "0 0 70px " + accent + "55" }}>Découvrir →</button>
  </div>
}

// ── OVERVIEW ──
export function SlideOverview({ accent, globalStats }) {
  const active = useActive()
  const cards = [
    { v: Math.round(globalStats.total_hours || 0), s: "h", l: "heures totales" },
    { v: globalStats.total_items || 0, s: "", l: "contenus" },
  ]
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 18 }}><Tag accent={accent} />
      <h2 style={{ fontSize: "clamp(24px, 7vw, 38px)", fontWeight: 800, color: "white", lineHeight: 1 }}>Ton annee<br /><span style={{ color: accent }}>en chiffres</span></h2>
    </div>
    <div className="s1" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {cards.map((c, i) => (
        <div key={c.l} className="glass" style={{ padding: "14px 16px", animation: "slide-up .5s ease " + (0.14 + i * 0.09) + "s both" }}>
          <div style={{ fontSize: "clamp(22px, 6vw, 32px)", fontWeight: 800, color: accent, lineHeight: 1, animation: active ? "flash-n .8s ease " + (0.38 + i * 0.1) + "s both" : "none" }}>{active ? <AN t={c.v} s={c.s} /> : "0" + c.s}</div>
          <Lbl>{c.l}</Lbl>
        </div>
      ))}
    </div>
  </div>
}

// ── STATS SLIDE (films, series, romm, audio, komga) ──
export function SlideServiceStats({ accent, label, icon, data, statItems, topItems, chartData, chartId, chartUnit = " items" }) {
  const active = useActive()
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} /><Lbl c={accent} size={9}>{icon} {label}</Lbl>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
        {statItems.map((s, i) => (
          <div key={s.label} style={i > 0 ? { marginBottom: 3 } : {}}>
            {i === 0 ? <BigNum value={s.value} accent={accent} active={active} suffix={s.suffix} /> : <div style={{ fontSize: 22, fontWeight: 700, color: accent + "bb" }}>{active ? <AN t={s.value} s={s.suffix} /> : "0" + s.suffix}</div>}
            <Lbl>{s.label}</Lbl>
          </div>
        ))}
      </div>
      {data.vs_last_year ? <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}><VsB value={data.vs_last_year} /></div> : null}
    </div>
    {topItems.length > 0 && <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 9 }}>
      {topItems.slice(0, 3).map((item, i) => (
        <div key={item.t || i} className="glass" style={{ padding: "10px 12px", display: "flex", gap: 10, animation: "slide-up .5s ease " + (0.2 + i * 0.1) + "s both" }}>
          <div style={{ width: 28, textAlign: "center", color: accent, fontWeight: 800, fontFamily: "JetBrains Mono,monospace", fontSize: 14 }}>#{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ color: "white", fontWeight: 700, fontSize: 12 }}>{item.t}</div>
            {item.g && <div style={{ color: "rgba(255,255,255,.35)", fontSize: 10 }}>{item.g}</div>}
          </div>
          {item.statValue && <div style={{ color: accent, fontFamily: "JetBrains Mono,monospace", fontSize: 11, alignSelf: "center" }}>{item.statValue}</div>}
        </div>
      ))}
    </div>}
    {chartData?.length > 0 && <div className="glass s2" style={{ padding: "10px 12px" }}>
      <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
      <AreaG data={chartData} dataKey="v" accent={accent} height={50} unit={chartUnit} id={chartId} />
    </div>}
  </div>
}

// ── DEEP SLIDE (habitudes) ──
export function SlideServiceDeep({ accent, label, icon, dayData, timeData, monthlyData, ranking, me, extraStats }) {
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} /><Lbl c={accent} size={9}>{icon} {label} · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 4 }}>Quand tu<br /><span style={{ color: accent }}>consommes</span></h2>
    </div>
    {dayData?.length > 0 && <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour prefere</Lbl><DayChart data={dayData} accent={accent} height={54} /></div>}
    {timeData?.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={52} /></div>}
    {monthlyData?.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Par mois</Lbl><AreaG data={monthlyData} dataKey="v" accent={accent} height={50} unit=" items" id={"deep-" + label} /></div>}
    {extraStats?.length > 0 && <div className="glass s4" style={{ padding: "12px 16px", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {extraStats.map(([v, suf, l]) => <div key={l} style={{ textAlign: "center" }}><div style={{ fontWeight: 800, fontSize: 20, color: accent, lineHeight: 1 }}>{v}<span style={{ fontSize: 11, opacity: 0.6 }}>{suf}</span></div><Lbl size={9}>{l}</Lbl></div>)}
      </div>
    </div>}
    {ranking?.length > 0 && <div className="s5"><MiniRank data={ranking} accent={accent} me={me} label={"Classement " + label} /></div>}
  </div>
}

// ── COMPARE ──
export function SlideCompare({ accent, comparison }) {
  const monthly = comparison?.monthly || []
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 16 }}><Tag accent={accent} />
      <h2 style={{ fontSize: "clamp(20px, 6vw, 34px)", fontWeight: 800, color: "white", lineHeight: 1.05 }}>2024 vs <span style={{ color: accent }}>2023</span></h2>
    </div>
    {monthly.length > 0 && <div className="glass s1" style={{ padding: "12px 12px", marginBottom: 9 }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>{[["2024", accent], ["2023", "rgba(255,255,255,.25)"]].map(([y, c]) => <div key={y} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: c, fontFamily: "JetBrains Mono,monospace" }}><div style={{ width: 16, height: 2.5, background: c, borderRadius: 2 }} />{y}</div>)}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={monthly} margin={{ top: 2, right: 4, left: 0, bottom: 0 }}><XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.3)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip />} /><Line type="monotone" dataKey="a" stroke={accent} strokeWidth={2.5} dot={false} /><Line type="monotone" dataKey="b" stroke="rgba(255,255,255,.2)" strokeWidth={1.5} dot={false} strokeDasharray="4 3" /></LineChart>
      </ResponsiveContainer>
    </div>}
  </div>
}

// ── RANKING ──
export function SlideRanking({ accent, users = [], me = "" }) {
  const medals = ["🥇", "🥈", "🥉"]; const max = users[0]?.v || 1
  const myRank = users.findIndex((u) => u.n === me) + 1
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 16 }}><Tag accent={accent} />
      <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 800, color: "white", lineHeight: 1.0 }}>Tu es<br /><span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>#{myRank || "?"} sur {users.length}</span></h2>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>utilisateurs Wrapparr</div>
    </div>
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {users.map((u, i) => { const isMe = u.n === me; return (
        <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", background: isMe ? accent + "16" : "rgba(255,255,255,.022)", border: "1px solid " + (isMe ? accent + "55" : "rgba(255,255,255,.05)"), borderRadius: 11, boxShadow: isMe ? "0 0 30px " + accent + "22" : "none", animation: "slide-up .45s ease " + (0.08 + i * 0.08) + "s both" }}>
          <div style={{ width: 24, textAlign: "center", fontSize: 13, flexShrink: 0, color: i < 3 ? "transparent" : "rgba(255,255,255,.2)", fontWeight: 700 }}>{i < 3 ? medals[i] : i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: isMe ? 800 : 400, color: isMe ? accent : "rgba(255,255,255,.7)" }}>{u.n}{isMe && <span style={{ fontSize: 9, color: accent + "70", fontWeight: 400 }}> · moi</span>}</span>
              <span style={{ fontSize: 11, color: isMe ? accent : "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono,monospace", fontWeight: isMe ? 700 : 400 }}>{(u.v || 0).toLocaleString("fr-FR")}h</span>
            </div>
            <div style={{ height: 2.5, background: "rgba(255,255,255,.05)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: isMe ? "linear-gradient(90deg," + accent + ",#fb923c)" : "rgba(255,255,255,.14)", width: (u.v / max * 100) + "%", borderRadius: 2, transformOrigin: "left", animation: "bar-grow .8s ease " + (0.28 + i * 0.08) + "s both" }} />
            </div>
          </div>
        </div>
      ) })}
    </div>
  </div>
}

// ── FINALE ──
export function SlideFinale({ accent, userName, year, globalStats, onRestart }) {
  const active = useActive()
  return (
    <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
      <div style={{ position: "relative", zIndex: 5, textAlign: "center", maxWidth: 400, width: "100%", padding: "0 20px" }}>
        <div style={{ fontSize: 62, marginBottom: 12, animation: "float 2.5s ease-in-out infinite", filter: "drop-shadow(0 0 30px " + accent + "90)" }}>🏆</div>
        <div className="s0" style={{ fontSize: 8, color: "rgba(255,255,255,.2)", letterSpacing: ".35em", textTransform: "uppercase", fontFamily: "JetBrains Mono,monospace", marginBottom: 10 }}>MERCI POUR CETTE BELLE ANNEE</div>
        <h1 className="s1" style={{ fontSize: "clamp(24px, 7vw, 38px)", fontWeight: 800, color: "white", lineHeight: 1.0, marginBottom: 14 }}>
          C'etait ton<br />
          <span style={{ backgroundImage: "linear-gradient(90deg,#E5A00D,#fb923c,#c084fc,#34d399,#60a5fa,#E5A00D)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", backgroundSize: "300% auto", animation: "shimmer-t 4s linear infinite" }}>Wrapparr {year}</span>
        </h1>
        <div className="s2" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 6, marginBottom: 12 }}>
          {[
            { v: Math.round(globalStats.total_hours || 0), s: "h", l: "Heures totales", c: accent },
            { v: globalStats.total_items || 0, s: "", l: "Contenus", c: "#a78bfa" },
            { v: globalStats.services_count || 0, s: " services", l: "Plateformes", c: "#34d399" },
          ].map((item, i) => (
            <div key={item.l} style={{ padding: "10px 12px", borderRadius: 12, background: item.c + "12", border: "1px solid " + item.c + "28", animation: "stat-row-in .5s ease " + (0.2 + i * 0.08) + "s both" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: item.c, lineHeight: 1 }}>{active ? <AN t={item.v} s={item.s} /> : "0" + item.s}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.35)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 2 }}>{item.l}</div>
            </div>
          ))}
        </div>
        <div className="s5" style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button style={{ padding: "12px 28px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 14, fontWeight: 800, boxShadow: "0 0 60px " + accent + "50" }}>Partager</button>
          {onRestart && <button onClick={onRestart} style={{ padding: "12px 28px", borderRadius: 40, cursor: "pointer", background: "transparent", color: "rgba(255,255,255,.35)", fontSize: 13, border: "1px solid rgba(255,255,255,.1)" }}>↩ Rejouer</button>}
        </div>
      </div>
    </div>
  )
}
