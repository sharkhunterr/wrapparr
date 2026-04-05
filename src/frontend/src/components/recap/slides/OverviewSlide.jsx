import { useActive, AN, Tag, Lbl } from "../SharedUI"

export default function OverviewSlide({ accent, globalStats, year }) {
  const active = useActive()
  const cards = [
    { v: Math.round(globalStats.total_hours || 0), s: "h", l: "heures totales" },
    { v: globalStats.total_items || 0, s: "", l: "contenus" },
  ]
  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 18 }}><Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(24px, 7vw, 38px)", fontWeight: 800, color: "white", lineHeight: 1 }}>Ton année<br /><span style={{ color: accent }}>en chiffres</span></h2>
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
