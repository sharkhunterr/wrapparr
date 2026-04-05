import { useActive, AN, Tag, Lbl } from "../SharedUI"

function FlameIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none"><path d="M12 23c-3.9 0-7-3.1-7-7 0-3.2 2.7-6.5 5-9.5.4-.5 1.2-.5 1.6 0C14.3 9.5 19 12.8 19 16c0 3.9-3.1 7-7 7zm0-12.5C10.2 13 7 15.5 7 16c0 2.8 2.2 5 5 5s5-2.2 5-5c0-.5-3.2-3-5-5.5z"/></svg>
}

function CalendarIcon({ size = 14, color = "currentColor" }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}

export default function GrimmoryStreakSlide({ accent, data, year }) {
  const active = useActive()
  const streak = data.extra?.streak
  if (!streak || (!streak.current && !streak.longest && !streak.total_days)) return null

  return (
    <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
      <div className="s0" style={{ marginBottom: 12 }}>
        <Tag accent={accent} year={year} />
        <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05 }}>
          Ta <span style={{ color: accent }}>régularité</span>
        </h2>
      </div>

      {/* Main streak stats */}
      <div className="s1" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {/* Current streak */}
        <div style={{ flex: 1, padding: "16px 14px", borderRadius: "var(--th-radius)", background: accent + "0c", border: "1px solid " + accent + "25", textAlign: "center" }}>
          <FlameIcon size={24} color={accent} />
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono)", lineHeight: 1, marginTop: 6 }}>
            {active ? <AN t={streak.current} /> : 0}
          </div>
          <div style={{ fontSize: 10, color: "var(--th-text-secondary)", marginTop: 4 }}>jours de suite</div>
          <div style={{ fontSize: 8, color: "var(--th-text-dim)", marginTop: 2 }}>streak actuel</div>
        </div>

        {/* Longest streak */}
        <div style={{ flex: 1, padding: "16px 14px", borderRadius: "var(--th-radius)", background: "var(--th-surface-hover)", border: "1px solid var(--th-border-strong)", textAlign: "center" }}>
          <div style={{ fontSize: 24 }}>🏆</div>
          <div style={{ fontSize: "clamp(28px, 8vw, 40px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)", lineHeight: 1, marginTop: 6 }}>
            {active ? <AN t={streak.longest} /> : 0}
          </div>
          <div style={{ fontSize: 10, color: "var(--th-text-secondary)", marginTop: 4 }}>record personnel</div>
          <div style={{ fontSize: 8, color: "var(--th-text-dim)", marginTop: 2 }}>meilleur streak</div>
        </div>
      </div>

      {/* Total days */}
      <div className="glass s2" style={{ padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
        <CalendarIcon size={20} color={accent} />
        <div>
          <div style={{ fontSize: "clamp(18px, 5vw, 24px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono)" }}>
            {active ? <AN t={streak.total_days} /> : 0} <span style={{ fontSize: 12, color: "var(--th-text-secondary)" }}>jours de lecture</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--th-text-dim)", marginTop: 2 }}>
            {streak.total_days > 0 ? Math.round(streak.total_days / 365 * 100) + "% de l'année" : ""}
          </div>
        </div>
      </div>
    </div>
  )
}
