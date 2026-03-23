import MiniRank from "../ui/MiniRank"
import Orbs from "../ambient/Orbs"

export default function RankingSlide({ accent = "#f87171", bg = "#130000", globalRanking = [], userName = "" }) {
  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden", padding: "40px 20px" }}>
      <Orbs accent={accent} />
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 380 }}>
        <div style={{ fontSize: 9, color: accent, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
          Classement global
        </div>
        {globalRanking.length > 0 && (
          <MiniRank data={globalRanking} accent={accent} me={userName} label="Classement global" unit="h" />
        )}
      </div>
    </div>
  )
}
