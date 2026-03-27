import { Tag } from "../SharedUI"
import { useLabels } from "../ThemeContext"

export default function RankingSlide({ accent, users = [], me = "", year }) {
  const L = useLabels()
  const medals = ["🥇", "🥈", "🥉"]; const max = users[0]?.v || 1
  const myRank = users.findIndex((u) => u.n === me) + 1
  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 16 }}><Tag accent={accent} year={year} />
      <h2 style={{ fontSize: "clamp(22px, 6vw, 36px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.0 }}>Tu es<br /><span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>#{myRank || "?"} sur {users.length}</span></h2>
      <div style={{ fontSize: 12, color: "var(--th-text-muted)", marginTop: 4 }}>utilisateurs {L.brand}</div>
    </div>
    <div className="s1" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {users.map((u, i) => { const isMe = u.n === me; return (
        <div key={u.n} style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 13px", background: isMe ? accent + "16" : "var(--th-surface-dim)", border: "1px solid " + (isMe ? accent + "55" : "var(--th-border-dim)"), borderRadius: "var(--th-radius-sm)", boxShadow: isMe ? "0 0 30px " + accent + "22" : "none", animation: "slide-up .45s ease " + (0.08 + i * 0.08) + "s both" }}>
          <div style={{ width: 24, textAlign: "center", fontSize: 13, flexShrink: 0, color: i < 3 ? "transparent" : "var(--th-text-faint)", fontWeight: 700 }}>{i < 3 ? medals[i] : i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, fontWeight: isMe ? 800 : 400, color: isMe ? accent : "var(--th-text-secondary)" }}>{u.n}{isMe && <span style={{ fontSize: 9, color: accent + "70" }}> · moi</span>}</span>
              <span style={{ fontSize: 11, color: isMe ? accent : "var(--th-text-muted)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{(u.v || 0).toLocaleString("fr-FR")}h</span>
            </div>
            <div style={{ height: 2.5, background: "var(--th-border-dim)", borderRadius: 2, marginTop: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: isMe ? "linear-gradient(90deg," + accent + ",#fb923c)" : "var(--th-text-dim)", width: (u.v / max * 100) + "%", borderRadius: 2, transformOrigin: "left", animation: "bar-grow .8s ease " + (0.28 + i * 0.08) + "s both" }} />
            </div>
          </div>
        </div>
      ) })}
    </div>
  </div>
}
