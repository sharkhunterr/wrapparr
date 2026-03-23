import { Tag } from "../SharedUI"

export default function RankingSlide({ accent, users = [], me = "", year }) {
  const medals = ["🥇", "🥈", "🥉"]; const max = users[0]?.v || 1
  const myRank = users.findIndex((u) => u.n === me) + 1
  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 16 }}><Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 800, color: "white", lineHeight: 1.0 }}>Tu es<br /><span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>#{myRank || "?"} sur {users.length}</span></h2>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,.3)", marginTop: 4 }}>utilisateurs Wrapparr</div>
    </div>
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {users.map((u, i) => { const isMe = u.n === me; return (
        <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", background: isMe ? accent + "16" : "rgba(255,255,255,.022)", border: "1px solid " + (isMe ? accent + "55" : "rgba(255,255,255,.05)"), borderRadius: 11, boxShadow: isMe ? "0 0 30px " + accent + "22" : "none", animation: "slide-up .45s ease " + (0.08 + i * 0.08) + "s both" }}>
          <div style={{ width: 24, textAlign: "center", fontSize: 13, flexShrink: 0, color: i < 3 ? "transparent" : "rgba(255,255,255,.2)", fontWeight: 700 }}>{i < 3 ? medals[i] : i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: isMe ? 800 : 400, color: isMe ? accent : "rgba(255,255,255,.7)" }}>{u.n}{isMe && <span style={{ fontSize: 9, color: accent + "70" }}> · moi</span>}</span>
              <span style={{ fontSize: 11, color: isMe ? accent : "rgba(255,255,255,.3)", fontFamily: "JetBrains Mono,monospace" }}>{(u.v || 0).toLocaleString("fr-FR")}h</span>
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
