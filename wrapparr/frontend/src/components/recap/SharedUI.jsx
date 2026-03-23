import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from "recharts"

// ── Hooks ──
export function useActive() {
  const [a, setA] = useState(false)
  useEffect(() => { const t = setTimeout(() => setA(true), 60); return () => clearTimeout(t) }, [])
  return a
}

export function useCounter(target, active, dur = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!active) { setV(0); return }
    let c = 0; const inc = target / (dur / 16)
    const t = setInterval(() => { c += inc; if (c >= target) { setV(target); clearInterval(t) } else setV(Math.floor(c)) }, 16)
    return () => clearInterval(t)
  }, [active, target, dur])
  return v
}

// ── Animated number ──
export function AN({ t, s = "" }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    let c = 0; const inc = t / 80
    const tm = setInterval(() => { c += inc; if (c >= t) { setV(t); clearInterval(tm) } else setV(Math.floor(c)) }, 16)
    return () => clearInterval(tm)
  }, [t])
  return <>{v.toLocaleString("fr-FR")}{s}</>
}

// ── Labels ──
export const Lbl = ({ c = "rgba(255,255,255,0.32)", size = 10, children, upper = true }) =>
  <div style={{ color: c, fontSize: size, textTransform: upper ? "uppercase" : "none", letterSpacing: "0.12em" }}>{children}</div>

export const Tag = ({ accent, year = 2024 }) =>
  <div style={{ color: accent, fontSize: 9, letterSpacing: "0.3em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", marginBottom: 7, opacity: 0.8 }}>WRAPPARR · {year}</div>

export const Pill = ({ children, accent }) =>
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 18, background: accent + "1e", border: "1px solid " + accent + "38", color: accent, fontSize: 10 }}>{children}</span>

export const VsB = ({ value, label = "vs annee prec." }) => {
  const p = value > 0
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 11px", borderRadius: 18, background: p ? "#22c55e16" : "#ef444416", border: "1px solid " + (p ? "#22c55e" : "#ef4444") + "40", color: p ? "#4ade80" : "#f87171", fontSize: 11, fontWeight: 600, animation: "badge-p .5s ease .6s both" }}>{p ? "↑" : "↓"} {p ? "+" : ""}{value}% {label}</span>
}

export function BigNum({ value, suffix = "", accent, active, delay = 0.05 }) {
  const v = useCounter(value, active)
  return <div style={{ fontSize: "clamp(28px, 8vw, 48px)", fontWeight: 800, color: accent, lineHeight: 1, letterSpacing: "-0.02em", animation: "cpop .55s ease " + delay + "s both,flash-n .9s ease " + (delay + 0.45) + "s both" }}>{v.toLocaleString("fr-FR")}{suffix}</div>
}

// ── Tooltip ──
function CTip({ active, payload, label, unit = "h" }) {
  if (!active || !payload?.length) return null
  return <div style={{ background: "#0d0d1a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "5px 10px", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}>
    <div style={{ color: "rgba(255,255,255,.4)", marginBottom: 2 }}>{label}</div>
    {payload.map((p) => <div key={p.dataKey} style={{ color: p.color || "white", fontWeight: 600 }}>{p.value}{unit}</div>)}
  </div>
}

// ── Charts ──
export function AreaG({ data, dataKey = "v", accent, height = 52, unit = "h", id }) {
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="m" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit} />} /><Area type="monotone" dataKey={dataKey} stroke={accent} strokeWidth={2} fill={"url(#" + id + ")"} dot={false} /></AreaChart></ResponsiveContainer>
}

export function DayChart({ data, accent, height = 55, unit }) {
  return <ResponsiveContainer width="100%" height={height}><BarChart data={data} margin={{ left: 0, right: 0, top: 0, bottom: 0 }}><XAxis dataKey="d" tick={{ fill: "rgba(255,255,255,.4)", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} /><Bar dataKey="v" radius={[3, 3, 0, 0]}>{data.map((d, i) => <Cell key={i} fill={d.d === "Sam" || d.d === "Dim" || d.d === "Ven" ? accent : accent + "45"} />)}</Bar></BarChart></ResponsiveContainer>
}

export function TimeChart({ data, accent, height = 50, unit }) {
  const gId = "tg" + accent.replace(/[^a-f0-9]/gi, "")
  return <ResponsiveContainer width="100%" height={height}><AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}><defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.5} /><stop offset="100%" stopColor={accent} stopOpacity={0.02} /></linearGradient></defs><XAxis dataKey="h" tick={{ fill: "rgba(255,255,255,.35)", fontSize: 8 }} axisLine={false} tickLine={false} /><YAxis hide /><Tooltip content={<CTip unit={unit || " items"} />} /><Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill={"url(#" + gId + ")"} dot={false} /></AreaChart></ResponsiveContainer>
}

export function MiniRank({ data, accent, unit = "h", label = "Classement", me = "" }) {
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
