import { Tag, Lbl, DayChart, TimeChart, AreaG, MiniRank } from "../SharedUI"

export default function ServiceDeepSlide({ accent, label, icon, data, me, year }) {
  const dayData = data.day_of_week || []
  const timeData = data.time_of_day || []
  const monthly = data.monthly || []
  const ranking = data.ranking || []

  return <div style={{ maxWidth: 430, width: "100%" }}>
    <div className="s0" style={{ marginBottom: 12 }}><Tag accent={accent} year={year} /><Lbl c={accent} size={9}>{icon} {label} · Habitudes</Lbl>
      <h2 style={{ fontSize: "clamp(18px, 5vw, 26px)", fontWeight: 800, color: "white", lineHeight: 1.05, marginTop: 4 }}>Quand tu <span style={{ color: accent }}>consommes</span></h2>
    </div>
    {dayData.length > 0 && <div className="glass s1" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Jour prefere</Lbl><DayChart data={dayData} accent={accent} height={54} /></div>}
    {timeData.length > 0 && <div className="glass s2" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Heure de consommation</Lbl><TimeChart data={timeData} accent={accent} height={52} /></div>}
    {monthly.length > 0 && <div className="glass s3" style={{ padding: "10px 12px", marginBottom: 8 }}><Lbl c={accent} size={8}>Par mois</Lbl><AreaG data={monthly} dataKey="v" accent={accent} height={50} unit=" items" id={"deep-" + label} /></div>}
    {ranking.length > 0 && <div className="s4"><MiniRank data={ranking} accent={accent} me={me} label={"Classement " + label} /></div>}
  </div>
}
