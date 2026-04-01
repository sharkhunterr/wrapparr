import { useLabels } from "../ThemeContext"
import { useActive, AN, Tag, Lbl } from "../SharedUI"

const DEFAULT_PROFILES = [
  { min: 0, max: 15, name: "Collectionneur fantome", desc: "Tu demandes mais tu ne regardes pas", emoji: "👻" },
  { min: 15, max: 35, name: "Demandeur distrait", desc: "Ta wishlist deborde un peu", emoji: "🫣" },
  { min: 35, max: 55, name: "Demandeur equilibre", desc: "Tu regardes une bonne partie de tes demandes", emoji: "⚖️" },
  { min: 55, max: 75, name: "Demandeur assidu", desc: "Tu honores la plupart de tes demandes", emoji: "🎯" },
  { min: 75, max: 90, name: "Demandeur exemplaire", desc: "Presque tout est regarde", emoji: "🏅" },
  { min: 90, max: 101, name: "Demandeur parfait", desc: "Tu regardes tout ce que tu demandes", emoji: "👑" },
]

function CheckIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
}

function ClockIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
}

export default function OverseerrMatchSlide({ accent, data, year, config = {} }) {
  const L = useLabels()
  const active = useActive()
  const ov = data?.overseerr
  if (!ov || (!ov.matched?.length && !ov.not_watched?.length)) return null

  const matchRate = ov.match_rate || 0
  const matched = ov.matched || []
  const notWatched = ov.not_watched || []

  // Real totals from backend (not truncated list lengths)
  const realMatched = ov.matched_count || matched.length
  const realUnwatched = ov.not_watched_count || notWatched.length

  // Profile based on match rate
  const profiles = config.categories?.length > 0 ? config.categories : DEFAULT_PROFILES
  const profile = profiles.find(p => matchRate >= p.min && matchRate < p.max) || profiles[profiles.length - 1]

  const gaugeColor = matchRate >= 70 ? "#4ade80" : matchRate >= 40 ? accent : "#f87171"

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Demande vs <span style={{ color: accent }}>regarde</span>
        </h2>
        <div style={{ fontSize: 11, color: "var(--th-text-muted)", marginTop: 4 }}>
          As-tu vraiment regarde ce que tu as demande ?
        </div>
      </div>

      {/* Match rate gauge */}
      <div className="glass s1" style={{ padding: "14px 16px", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 800, color: gaugeColor, fontFamily: "var(--th-font-mono)" }}>
              {active ? <AN t={matchRate} s="%" /> : "0%"}
            </div>
            <div style={{ fontSize: 9, color: "var(--th-text-secondary)", marginTop: 2 }}>
              de visionnage
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 8, borderRadius: 4, background: "var(--th-surface-subtle)", overflow: "hidden", display: "flex" }}>
              <div style={{ height: "100%", background: "#4ade80", borderRadius: "4px 0 0 4px", width: (active ? matchRate : 0) + "%", transition: "width 1.5s ease" }} />
              <div style={{ height: "100%", background: "rgba(255,255,255,0.08)", width: (active ? 100 - matchRate : 100) + "%", transition: "width 1.5s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ fontSize: 9, color: "#4ade80", display: "flex", alignItems: "center", gap: 3 }}>
                <CheckIcon size={10} color="#4ade80" /> {realMatched} regarde{realMatched > 1 ? "s" : ""}
              </span>
              <span style={{ fontSize: 9, color: "var(--th-text-dim)", display: "flex", alignItems: "center", gap: 3 }}>
                <ClockIcon size={10} color="var(--th-text-dim)" /> {realUnwatched} en attente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile badge */}
      <div className="s1" style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: "var(--th-radius)", background: gaugeColor + "0c", border: "1px solid " + gaugeColor + "25", marginBottom: 12, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${gaugeColor}18 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
        {profile.emoji && <span style={{ fontSize: 24, position: "relative" }}>{profile.emoji}</span>}
        <div style={{ position: "relative" }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: gaugeColor }}>{profile.name}</div>
          <div style={{ fontSize: 10, color: "var(--th-text-secondary)", marginTop: 2 }}>{profile.desc}</div>
        </div>
      </div>

      {/* Matched list */}
      {matched.length > 0 && (
        <div className="s2" style={{ marginBottom: 10 }}>
          <Lbl c="#4ade80" size={8}>Demande et regarde</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {matched.slice(0, 5).map((item, i) => (
              <MatchItem key={item.title + i} item={item} accent={accent} watched i={i} />
            ))}
            {realMatched > 5 && <div style={{ fontSize: 9, color: "var(--th-text-dim)", textAlign: "center", marginTop: 2 }}>+{realMatched - 5} autres</div>}
          </div>
        </div>
      )}

      {/* Not watched list */}
      {notWatched.length > 0 && (
        <div className="s3">
          <Lbl c="var(--th-text-dim)" size={8}>En attente de visionnage</Lbl>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
            {notWatched.slice(0, 5).map((item, i) => (
              <MatchItem key={item.title + i} item={item} accent={accent} watched={false} i={i} />
            ))}
            {realUnwatched > 5 && <div style={{ fontSize: 9, color: "var(--th-text-dim)", textAlign: "center", marginTop: 2 }}>+{realUnwatched - 5} autres</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function MatchItem({ item, accent, watched, i }) {
  return (
    <div style={{
      display: "flex", gap: 8, alignItems: "center", padding: "5px 10px", borderRadius: 8,
      background: watched ? "rgba(34,197,94,0.06)" : "var(--th-surface-dim)",
      border: "1px solid " + (watched ? "rgba(34,197,94,0.15)" : "var(--th-border-dim)"),
      animation: "slide-up .35s ease " + (0.08 + i * 0.05) + "s both",
    }}>
      {item.poster && <img src={item.poster} alt="" style={{ width: 24, height: 34, borderRadius: 3, objectFit: "cover", flexShrink: 0 }} onError={e => { e.target.style.display = "none" }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--th-text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
        <span style={{ fontSize: 9, color: accent + "80" }}>{item.type === "movie" ? "Film" : "Serie"}</span>
      </div>
      <div style={{ flexShrink: 0 }}>
        {watched
          ? <CheckIcon size={14} color="#4ade80" />
          : <ClockIcon size={14} color="var(--th-text-dim)" />
        }
      </div>
    </div>
  )
}
