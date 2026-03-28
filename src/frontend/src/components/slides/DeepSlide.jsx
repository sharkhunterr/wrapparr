import { TimeChart } from "../ui/Charts"
import MiniRank from "../ui/MiniRank"
import Orbs from "../ambient/Orbs"

export default function DeepSlide({ accent, bg, serviceData = {}, serviceName = "", userName = "" }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "40px 20px" }}>
      <Orbs accent={accent} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 4 }}>
          {serviceName} · Habitudes
        </div>

        {serviceData.genres?.length > 0 && (
          <div className="glass" style={{ padding: 12 }}>
            <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", marginBottom: 8 }}>GENRES</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {serviceData.genres.map((g) => (
                <span key={g.n} style={{ display: "inline-block", padding: "3px 10px", borderRadius: 18, background: `${accent}1e`, border: `1px solid ${accent}38`, color: accent, fontSize: 10, fontFamily: "Nunito,sans-serif" }}>
                  {g.n} ({g.v})
                </span>
              ))}
            </div>
          </div>
        )}

        {serviceData.time_of_day?.length > 0 && (
          <div className="glass" style={{ padding: 12 }}>
            <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", marginBottom: 6 }}>HEURES D'ÉCOUTE</div>
            <TimeChart data={serviceData.time_of_day} accent={accent} />
          </div>
        )}

        {serviceData.ranking?.length > 0 && (
          <MiniRank data={serviceData.ranking} accent={accent} me={userName} />
        )}
      </div>
    </div>
  )
}
