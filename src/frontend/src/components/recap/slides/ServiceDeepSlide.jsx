import { Tag, Lbl, DayChart, TimeChart, AreaG, useComparison, CompBadge, CompLegend } from "../SharedUI"
import { useLabels } from "../ThemeContext"

export default function ServiceDeepSlide({ accent, label, icon, data, me, year, serviceType }) {
  const L = useLabels()

  // Use films-only data if available (for tautulli/plex), fallback to combined
  const filmsExtra = data.extra?.films || {}
  const dayData = filmsExtra.day_of_week || data.day_of_week || []
  const timeData = filmsExtra.time_of_day || data.time_of_day || []
  const monthly = filmsExtra.monthly || data.monthly || []
  const peak = filmsExtra.peak_stats || data.extra?.peak_stats || {}
  const bestDay = peak.best_day
  const bestMonth = peak.best_month
  const totalViews = peak.total_views || 0

  const totalItems = filmsExtra.total || data.total_items || 0
  const totalHours = Math.round(filmsExtra.hours || data.total_hours || 0)

  // Comparison data
  const comp = useComparison()
  const prevSvc = comp.active ? (comp.data?.[serviceType] || comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevFilms = prevSvc?.films || {}
  const prevItems = prevFilms.previous
  const prevHours = prevFilms.hours?.previous
  const prevMonthly = prevFilms.monthly || prevSvc?.monthly || null
  const prevDayOfWeek = prevFilms.day_of_week || null
  const prevTimeOfDay = prevFilms.time_of_day || null

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} year={year} /><Lbl c={accent} size={9}>{icon} {label} · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.05, marginTop: 4 }}>{L.whenYouConsume} <span style={{ color: accent }}>{L.consume}</span></h2>

      {/* Badges totaux */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {totalItems > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: accent + "10", border: "1px solid " + accent + "25" }}>
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: accent, fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{totalItems}</span>
            <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>{L.viewed}</span>
            <CompBadge current={totalItems} previous={prevItems} />
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "var(--th-surface-dim)", border: "1px solid var(--th-border-dim)" }}>
            <span style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text)", fontFamily: "var(--th-font-mono, JetBrains Mono,monospace)" }}>{totalHours}h</span>
            <span style={{ fontSize: 9, color: "var(--th-text-tertiary)" }}>{L.hours}</span>
            <CompBadge current={totalHours} previous={prevHours} suffix="h" />
          </div>
        )}
      </div>
    </div>

    {monthly.length > 0 && <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>{L.monthlyActivity}</Lbl><AreaG data={monthly} dataKey="v" accent={accent} height={90} unit={" " + L.viewsUnit} id={"deep-" + label} prevData={prevMonthly} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}
    {dayData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>{L.favoriteDay}</Lbl><DayChart data={dayData} accent={accent} height={90} prevData={prevDayOfWeek} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}
    {timeData.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>{L.consumptionTime}</Lbl><TimeChart data={timeData} accent={accent} height={90} prevData={prevTimeOfDay} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}

    {/* Peak stats: best specific day + best month */}
    {(bestDay || bestMonth) && (
      <div className="s4" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {bestMonth && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: "var(--th-radius-sm)", background: accent + "0a", border: "1px solid " + accent + "25" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{L.goldenMonth}</div>
            <div style={{ fontSize: "clamp(18px, 4.5vw, 24px)", fontWeight: 800, color: accent, lineHeight: 1 }}>{bestMonth.month}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: "var(--th-text)" }}>{bestMonth.views} {L.viewsUnit}</span>
              <CompBadge current={bestMonth.views} previous={prevSvc?.peak?.previous?.best_month?.views} />
            </div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "var(--th-text-dim)" }}>{bestMonth.hours}h · {totalViews > 0 ? Math.round(bestMonth.views / totalViews * 100) : 0}% {L.ofTotal}</div>
          </div>
        )}
        {bestDay && (
          <div style={{ flex: 1, padding: "clamp(8px, 1.5vw, 12px)", borderRadius: "var(--th-radius-sm)", background: "var(--th-surface-subtle)", border: "1px solid var(--th-border-subtle)" }}>
            <div style={{ fontSize: "clamp(8px, 1vw, 10px)", color: "var(--th-text-muted)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>{L.recordDay}</div>
            <div style={{ fontSize: "clamp(14px, 3.5vw, 18px)", fontWeight: 800, color: "var(--th-text)", lineHeight: 1.1 }}>
              {bestDay.day_name} {bestDay.day} {bestDay.month}
            </div>
            <div style={{ fontSize: "clamp(11px, 1.5vw, 14px)", fontWeight: 700, color: accent, marginTop: 4 }}>{bestDay.views} {L.viewsUnit}</div>
            <div style={{ fontSize: "clamp(9px, 1.2vw, 11px)", color: "var(--th-text-dim)" }}>{bestDay.hours}h {L.viewing}</div>
          </div>
        )}
      </div>
    )}
  </div>
}
