import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { BarChart2, Users, Clock, Eye, Music, GitCompare, Palette, ChevronDown, ChevronUp, Filter, CheckCircle, XCircle } from "lucide-react"

const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }
const mono = { fontFamily: "JetBrains Mono,monospace" }
const dim = { color: "rgba(255,255,255,0.35)", fontSize: 11 }
const accent = "#E5A00D"

function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0s"
  if (seconds < 60) return Math.round(seconds) + "s"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m < 60) return m + "m" + (s > 0 ? s + "s" : "")
  const h = Math.floor(m / 60)
  return h + "h" + (m % 60) + "m"
}

function formatDate(iso) {
  if (!iso) return "?"
  const d = new Date(iso)
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function StatCard({ icon: Icon, label, value, sub, color = accent }) {
  return (
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, flex: "1 1 130px", minWidth: 130 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: color + "15", border: "1px solid " + color + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={15} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 18, fontWeight: 800, color: "white", ...mono }}>{value}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{label}</div>
        {sub && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Tag({ label, color = accent }) {
  return <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 4, background: color + "15", border: "1px solid " + color + "25", color, whiteSpace: "nowrap" }}>{label}</span>
}

function SessionRow({ session, expanded, onToggle }) {
  const completed = session.slides_viewed >= session.total_slides && session.total_slides > 0
  const pct = session.total_slides > 0 ? Math.round(session.slides_viewed / session.total_slides * 100) : 0

  return (
    <>
      <tr onClick={onToggle} style={{ cursor: "pointer", background: expanded ? "rgba(255,255,255,0.02)" : "transparent", transition: "background .15s" }}>
        <td style={{ padding: "8px 6px", fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{formatDate(session.started_at)}</td>
        <td style={{ padding: "8px 10px", fontSize: 11, color: "white", fontWeight: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", background: accent + "15", border: "1px solid " + accent + "25", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: accent, flexShrink: 0 }}>{session.user_name?.[0]?.toUpperCase() || "?"}</div>
            {session.user_name}
          </div>
        </td>
        <td style={{ padding: "8px 6px", fontSize: 11, color: accent, ...mono, textAlign: "center", fontWeight: 700 }}>{session.year}</td>
        <td style={{ padding: "8px 6px", fontSize: 11, color: accent, ...mono, textAlign: "right" }}>{formatTime(session.duration_seconds)}</td>
        <td style={{ padding: "8px 6px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "center" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", ...mono }}>{session.slides_viewed}/{session.total_slides}</span>
            {completed
              ? <CheckCircle size={12} color="#4ade80" />
              : <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", ...mono }}>{pct}%</span>
            }
          </div>
        </td>
        <td style={{ padding: "8px 6px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 3, justifyContent: "center", flexWrap: "wrap" }}>
            {session.theme_id && <Tag label={session.theme_id} color="#a78bfa" />}
            {session.music_enabled && <Tag label="♫" color="#34d399" />}
            {session.comparison_enabled && <Tag label="⇋" color="#60a5fa" />}
            {session.reactions?.[0]?.value && <span style={{ fontSize: 14 }}>{session.reactions[0].value}</span>}
          </div>
        </td>
        <td style={{ padding: "8px 6px", textAlign: "center" }}>
          {expanded ? <ChevronUp size={13} color="rgba(255,255,255,0.2)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.2)" />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={7} style={{ padding: "0 10px 10px 40px", background: "rgba(255,255,255,0.01)" }}>
            <SessionExpandedDetail session={session} />
          </td>
        </tr>
      )}
    </>
  )
}

function SessionExpandedDetail({ session }) {
  const slideData = session.slide_data || []
  const topSlides = [...slideData].sort((a, b) => b.timeSpent - a.timeSpent)
  const maxTime = topSlides[0]?.timeSpent || 1
  const interactions = session.interactions || {}
  const hasInteractions = Object.keys(interactions).length > 0

  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", paddingTop: 8 }}>
      {/* Slide times */}
      <div style={{ flex: "1 1 250px", minWidth: 250 }}>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Temps par slide</div>
        <div style={{ maxHeight: 200, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
          {topSlides.map((s) => (
            <div key={s.slideId} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{s.slideId}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden", minWidth: 30 }}>
                <div style={{ height: "100%", borderRadius: 2, background: s.interacted ? "#34d399" : accent, width: (s.timeSpent / maxTime * 100) + "%", transition: "width .3s" }} />
              </div>
              <span style={{ fontSize: 9, color: accent, ...mono, minWidth: 28, textAlign: "right" }}>{s.timeSpent}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Interactions + settings */}
      <div style={{ flex: "0 1 200px", minWidth: 160 }}>
        {hasInteractions && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Interactions</div>
            {Object.entries(interactions).map(([slideId, data]) => (
              <div key={slideId} style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{slideId}</span>
                {data.score != null && <span style={{ fontSize: 10, color: accent, ...mono, flexShrink: 0, marginLeft: 6 }}>{data.score}/{data.total}</span>}
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Parametres</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {session.theme_id && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Theme: <span style={{ color: "#a78bfa" }}>{session.theme_id}</span></div>}
          {session.palette_slug && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Palette: <span style={{ color: accent }}>{session.palette_slug}</span></div>}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Musique: {session.music_enabled ? <span style={{ color: "#34d399" }}>Oui</span> : <span style={{ color: "rgba(255,255,255,0.2)" }}>Non</span>}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Comparaison: {session.comparison_enabled ? <span style={{ color: "#60a5fa" }}>Oui</span> : <span style={{ color: "rgba(255,255,255,0.2)" }}>Non</span>}</div>
          {session.device && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", marginTop: 4, wordBreak: "break-all" }}>{session.device.substring(0, 80)}</div>}
        </div>
      </div>
    </div>
  )
}

function SlideStatsSection({ slides }) {
  const [expanded, setExpanded] = useState(false)
  if (!slides.length) return null
  const maxTime = slides[0]?.avg_time || 1

  return (
    <div style={{ ...card, marginTop: 16 }}>
      <div onClick={() => setExpanded(!expanded)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Temps moyen par slide</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", ...mono }}>{slides.length} slides</span>
          {expanded ? <ChevronUp size={14} color="rgba(255,255,255,0.2)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.2)" />}
        </div>
      </div>
      {expanded && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 2 }}>
          {slides.map((s) => (
            <div key={s.slide_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", minWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{s.slide_id}</span>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden", minWidth: 40 }}>
                <div style={{ height: "100%", borderRadius: 2, background: accent, width: (s.avg_time / maxTime * 100) + "%" }} />
              </div>
              <span style={{ fontSize: 9, color: accent, ...mono, minWidth: 32, textAlign: "right" }}>{s.avg_time}s</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", ...mono, minWidth: 22, textAlign: "right" }}>{s.view_count}x</span>
              {s.interaction_count > 0 && <span style={{ fontSize: 8, color: "#34d399", ...mono }}>⚡{s.interaction_count}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null)
  const [allSessions, setAllSessions] = useState([])
  const [slideStats, setSlideStats] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  // Filters
  const [filterUser, setFilterUser] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterCompleted, setFilterCompleted] = useState("all")
  // Sort
  const [sortCol, setSortCol] = useState("started_at")
  const [sortDir, setSortDir] = useState("desc")

  useEffect(() => {
    Promise.all([
      api("/analytics/admin/summary"),
      api("/analytics/admin/sessions?limit=200"),
      api("/analytics/admin/slide-stats"),
    ]).then(([sum, sess, slides]) => {
      setSummary(sum)
      setAllSessions(sess)
      setSlideStats(slides)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Chargement...</div>
  if (!summary) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Aucune donnee</div>

  // Unique users and years for filters
  const userNames = [...new Set(allSessions.map(s => s.user_name))].sort()
  const years = [...new Set(allSessions.map(s => s.year).filter(Boolean))].sort((a, b) => b - a)

  // Apply filters
  const filtered = allSessions.filter(s => {
    if (filterUser && s.user_name !== filterUser) return false
    if (filterYear && s.year !== parseInt(filterYear)) return false
    if (filterCompleted === "completed" && (s.slides_viewed < s.total_slides || !s.total_slides)) return false
    if (filterCompleted === "incomplete" && s.slides_viewed >= s.total_slides && s.total_slides > 0) return false
    return true
  })

  // Apply sort
  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("desc") }
  }
  const sorted = [...filtered].sort((a, b) => {
    let va, vb
    switch (sortCol) {
      case "started_at": va = a.started_at || ""; vb = b.started_at || ""; break
      case "user_name": va = (a.user_name || "").toLowerCase(); vb = (b.user_name || "").toLowerCase(); break
      case "year": va = a.year || 0; vb = b.year || 0; break
      case "duration": va = a.duration_seconds || 0; vb = b.duration_seconds || 0; break
      case "progress": va = a.total_slides > 0 ? a.slides_viewed / a.total_slides : 0; vb = b.total_slides > 0 ? b.slides_viewed / b.total_slides : 0; break
      default: va = a.started_at || ""; vb = b.started_at || ""
    }
    if (va < vb) return sortDir === "asc" ? -1 : 1
    if (va > vb) return sortDir === "asc" ? 1 : -1
    return 0
  })

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <BarChart2 size={22} color={accent} strokeWidth={1.5} />
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Statistiques des recaps</h2>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        <StatCard icon={Eye} label="Sessions" value={summary.total_sessions} />
        <StatCard icon={Users} label="Spectateurs" value={summary.unique_viewers} />
        <StatCard icon={Clock} label="Duree moy." value={formatTime(summary.avg_duration)} />
        <StatCard icon={Music} label="Musique" value={summary.music_usage} color="#34d399" sub={`/ ${summary.total_sessions}`} />
        <StatCard icon={GitCompare} label="Comparaison" value={summary.comparison_usage} color="#60a5fa" sub={`/ ${summary.total_sessions}`} />
        {summary.themes?.[0] && <StatCard icon={Palette} label="Theme favori" value={summary.themes[0].theme} color="#a78bfa" sub={`${summary.themes[0].count}x`} />}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
        <Filter size={13} color="rgba(255,255,255,0.25)" />
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{
          padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontSize: 10,
        }}>
          <option value="">Tous les utilisateurs</option>
          {userNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{
          padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontSize: 10,
        }}>
          <option value="">Toutes les annees</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCompleted} onChange={e => setFilterCompleted(e.target.value)} style={{
          padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.6)", fontSize: 10,
        }}>
          <option value="all">Tous</option>
          <option value="completed">Termines</option>
          <option value="incomplete">Non termines</option>
        </select>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", ...mono }}>{sorted.length} session{sorted.length > 1 ? "s" : ""}</span>
      </div>

      {/* Sessions table */}
      <div style={{ ...card, padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <SortTh col="started_at" label="Date" align="left" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
              <SortTh col="user_name" label="Utilisateur" align="left" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} pad={10} />
              <SortTh col="year" label="Annee" align="center" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
              <SortTh col="duration" label="Duree" align="right" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
              <SortTh col="progress" label="Progression" align="center" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
              <th style={{ padding: "8px 6px", textAlign: "center", fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em" }}>Options</th>
              <th style={{ padding: "8px 6px", width: 30 }}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s) => (
              <SessionRow key={s.id} session={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} />
            ))}
            {sorted.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: "center", ...dim }}>Aucune session</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide stats expandable */}
      <SlideStatsSection slides={slideStats} />
    </div>
  )
}

function SortTh({ col, label, align = "left", sortCol, sortDir, onClick, pad = 6 }) {
  const active = sortCol === col
  return (
    <th onClick={() => onClick(col)} style={{
      padding: `8px ${pad}px`, textAlign: align, fontSize: 9, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: ".05em", cursor: "pointer",
      color: active ? accent : "rgba(255,255,255,0.3)",
      userSelect: "none", transition: "color .15s",
    }}>
      {label}
      <span style={{ marginLeft: 3, fontSize: 8, opacity: active ? 1 : 0.3 }}>
        {active ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
      </span>
    </th>
  )
}
