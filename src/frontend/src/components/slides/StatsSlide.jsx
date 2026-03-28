import BigNum from "../ui/BigNum"
import { AreaG, DayChart } from "../ui/Charts"
import Orbs from "../ambient/Orbs"

export default function StatsSlide({ accent, bg, serviceData = {}, serviceName = "" }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "40px 20px" }}>
      <Orbs accent={accent} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 12 }}>
          {serviceName} · Statistiques
        </div>

        <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
          {serviceData.total_items != null && (
            <div>
              <BigNum value={serviceData.total_items} accent={accent} />
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif" }}>total</div>
            </div>
          )}
          {serviceData.total_hours != null && (
            <div>
              <BigNum value={Math.round(serviceData.total_hours)} suffix="h" accent={accent} delay={0.1} />
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif" }}>heures</div>
            </div>
          )}
        </div>

        {serviceData.monthly?.length > 0 && (
          <div className="glass" style={{ padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", marginBottom: 6 }}>ACTIVITÉ MENSUELLE</div>
            <AreaG data={serviceData.monthly} dataKey="v" accent={accent} id={`monthly-${serviceName}`} />
          </div>
        )}

        {serviceData.day_of_week?.length > 0 && (
          <div className="glass" style={{ padding: 12 }}>
            <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.2em", marginBottom: 6 }}>PAR JOUR</div>
            <DayChart data={serviceData.day_of_week} accent={accent} />
          </div>
        )}
      </div>
    </div>
  )
}
