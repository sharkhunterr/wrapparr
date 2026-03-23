import BigNum from "../ui/BigNum"
import Orbs from "../ambient/Orbs"

export default function OverviewSlide({ accent = "#a78bfa", bg = "#080618", globalStats = {} }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Orbs accent={accent} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <div style={{ fontSize: 11, color: `${accent}cc`, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 20, animation: "slide-up .5s ease .1s both" }}>
          Vue d'ensemble
        </div>
        <div style={{ display: "flex", gap: 40, justifyContent: "center", flexWrap: "wrap" }}>
          {globalStats.total_hours != null && (
            <div className="s1" style={{ textAlign: "center" }}>
              <BigNum value={Math.round(globalStats.total_hours)} suffix="h" accent={accent} />
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif", marginTop: 4 }}>heures totales</div>
            </div>
          )}
          {globalStats.total_items != null && (
            <div className="s2" style={{ textAlign: "center" }}>
              <BigNum value={globalStats.total_items} accent={accent} delay={0.15} />
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif", marginTop: 4 }}>contenus consommés</div>
            </div>
          )}
          {globalStats.services_count != null && (
            <div className="s3" style={{ textAlign: "center" }}>
              <BigNum value={globalStats.services_count} accent={accent} delay={0.25} />
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif", marginTop: 4 }}>services connectés</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
