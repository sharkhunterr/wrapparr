import { Tag, Lbl, DayChart, TimeChart, AreaG, useComparison, CompBadge, CompLegend } from "../SharedUI"

export default function ServiceDeepSlide({ accent, label, icon, data, me, year }) {
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
  const prevSvc = comp.active ? (comp.data?.tautulli || comp.data?.plex || comp.data?.jellyfin || null) : null
  const prevFilms = prevSvc?.films || {}
  const prevItems = prevFilms.previous
  const prevHours = prevFilms.hours?.previous
  const prevMonthly = prevFilms.monthly || prevSvc?.monthly || null
  const prevDayOfWeek = prevFilms.day_of_week || null
  const prevTimeOfDay = prevFilms.time_of_day || null

  return <div style={{ maxWidth: "clamp(320px, 85vw, 540px)", width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} year={year} /><Lbl c={accent} size={9}>{icon} {label} · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 4 }}>Quand tu <span style={{ color: accent }}>consommes</span></h2>

      {/* Badges totaux */}
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        {totalItems > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: accent + "10", border: "1px solid " + accent + "25" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: accent, fontFamily: "JetBrains Mono,monospace" }}>{totalItems}</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>vus</span>
            <CompBadge current={totalItems} previous={prevItems} />
          </div>
        )}
        {totalHours > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: "white", fontFamily: "JetBrains Mono,monospace" }}>{totalHours}h</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>passees</span>
            <CompBadge current={totalHours} previous={prevHours} suffix="h" />
          </div>
        )}
      </div>
    </div>

    {monthly.length > 0 && <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Activite mensuelle</Lbl><AreaG data={monthly} dataKey="v" accent={accent} height={90} unit=" vues" id={"deep-" + label} prevData={prevMonthly} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}
    {dayData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour prefere</Lbl><DayChart data={dayData} accent={accent} height={90} prevData={prevDayOfWeek} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}
    {timeData.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={90} prevData={prevTimeOfDay} prevDataKey="previous" /><CompLegend accent={accent} year={year} /></div>}

    {/* Peak stats: best specific day + best month */}
    {(bestDay || bestMonth) && (
      <div className="s4" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
        {bestMonth && (
          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: accent + "08", border: "1px solid " + accent + "20" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Mois en or</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: accent, lineHeight: 1 }}>{bestMonth.month}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>{bestMonth.views} vues</span>
              <CompBadge current={bestMonth.views} previous={prevSvc?.peak?.previous?.best_month?.views} />
            </div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{bestMonth.hours}h · {totalViews > 0 ? Math.round(bestMonth.views / totalViews * 100) : 0}% du total</div>
          </div>
        )}
        {bestDay && (
          <div style={{ flex: 1, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 }}>Journee record</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "white", lineHeight: 1.1 }}>
              {bestDay.day_name} {bestDay.day} {bestDay.month}
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, color: accent, marginTop: 4 }}>{bestDay.views} vues</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{bestDay.hours}h de visionnage</div>
          </div>
        )}
      </div>
    )}
  </div>
}
