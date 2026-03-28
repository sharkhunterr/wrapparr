import Confetti from "../ambient/Confetti"
import Fireworks from "../ambient/Fireworks"

export default function FinaleSlide({ accent = "#E5A00D", bg = "#05050e", userName = "", year = 2024, globalStats = {} }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <Fireworks active={true} />
      <Confetti />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: "trophy-spin 3s ease-in-out infinite" }}>🏆</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, fontFamily: "Nunito,sans-serif", color: "white", marginBottom: 8, animation: "slide-up .5s ease .2s both" }}>
          C'est un <span style={{ color: accent }}>wrap</span> !
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", fontFamily: "Nunito,sans-serif", marginBottom: 32, animation: "slide-up .5s ease .4s both" }}>
          {userName}, ton année {year} en chiffres
        </p>

        <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", animation: "slide-up .5s ease .6s both" }}>
          {globalStats.total_hours != null && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: "Nunito,sans-serif" }}>
                {Math.round(globalStats.total_hours).toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif" }}>heures</div>
            </div>
          )}
          {globalStats.total_items != null && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: "Nunito,sans-serif" }}>
                {globalStats.total_items.toLocaleString("fr-FR")}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif" }}>contenus</div>
            </div>
          )}
          {globalStats.services_count != null && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: "Nunito,sans-serif" }}>
                {globalStats.services_count}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Nunito,sans-serif" }}>services</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
