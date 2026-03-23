import { useState } from "react"
import { useActive, AN, Tag, Lbl, BigNum, VsB, Pill, AreaG } from "../SharedUI"

function PosterImg({ src, size = 52, radius = 7 }) {
  const [err, setErr] = useState(false)
  if (!src || err) return <div style={{ width: size, height: size * 1.45, borderRadius: radius, flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, color: "rgba(255,255,255,0.15)" }}>?</div>
  return <img src={src} alt="" onError={() => setErr(true)} style={{ width: size, height: size * 1.45, borderRadius: radius, objectFit: "cover", flexShrink: 0, boxShadow: "0 4px 14px rgba(0,0,0,0.4)" }} />
}

export default function ServiceStatsSlide({ accent, label, icon, data, year }) {
  const active = useActive()
  const top = data.top || []
  const monthly = data.monthly || []

  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} year={year} /><Lbl c={accent} size={9}>{icon} {label}</Lbl>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginTop: 4 }}>
        <div><BigNum value={data.total_items || 0} accent={accent} active={active} /><Lbl>total</Lbl></div>
        {(data.total_hours || 0) > 0 && <div style={{ marginBottom: 3 }}><div style={{ fontSize: 22, fontWeight: 700, color: accent + "bb" }}>{active ? <AN t={Math.round(data.total_hours)} s="h" /> : "0h"}</div><Lbl>heures</Lbl></div>}
      </div>
      {data.vs_last_year ? <div style={{ display: "flex", gap: 6, marginTop: 7, flexWrap: "wrap" }}><VsB value={data.vs_last_year} /></div> : null}
    </div>

    {top.length > 0 && <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 9 }}>
      {top.slice(0, 4).map((item, i) => (
        <div key={item.t || i} className="glass" style={{ padding: "10px 12px", display: "flex", gap: 10, animation: "slide-up .5s ease " + (0.2 + i * 0.1) + "s both" }}>
          <PosterImg src={item.thumb} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: accent, fontSize: 8, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 3 }}>#{i + 1} · {item.y || year}</div>
            <div style={{ color: "white", fontWeight: 800, fontSize: 12, lineHeight: 1.25, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{item.t}</div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
              {item.g && <Pill accent={accent}>{item.g}</Pill>}
              {item.r > 0 && <Pill accent="#fbbf24">★ {item.r}</Pill>}
              {item.plays > 1 && <Pill accent="rgba(255,255,255,0.3)">{item.plays}x vus</Pill>}
              {item.h > 0 && <Pill accent="rgba(255,255,255,0.3)">{item.h}h</Pill>}
              {item.ep > 0 && <Pill accent="rgba(255,255,255,0.3)">{item.ep} ep</Pill>}
            </div>
          </div>
        </div>
      ))}
    </div>}

    {data.genres?.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}>
      <Lbl c={accent} size={8}>Genres favoris</Lbl>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}>
        {data.genres.slice(0, 5).map((g) => <Pill key={g.n} accent={accent}>{g.n}</Pill>)}
      </div>
    </div>}

    {monthly.length > 0 && <div className="glass s3" style={{ padding: "10px 12px" }}>
      <Lbl c={accent} size={8}>Activite mensuelle</Lbl>
      <AreaG data={monthly} dataKey="v" accent={accent} height={50} unit=" items" id={"m-" + label} />
    </div>}
  </div>
}
