import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { BarChart2, Users, Clock, Eye, Music, GitCompare, Palette, ChevronDown, ChevronUp, Filter, CheckCircle, Trash2 } from "lucide-react"

const mono = { fontFamily: "JetBrains Mono,monospace" }
const dim = { color: "rgba(255,255,255,0.35)", fontSize: 11 }
const accent = "#E5A00D"
const cardStyle = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }

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
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function StatCard({ icon: Icon, label, value, sub, color = accent }) {
  return (
    <div style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 10, flex: "1 1 120px", minWidth: 120 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "15", border: "1px solid " + color + "25", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "white", ...mono, lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{label}</div>
        {sub && <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)" }}>{sub}</div>}
      </div>
    </div>
  )
}

function Tag({ label, color = accent }) {
  return <span style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: color + "15", border: "1px solid " + color + "20", color, whiteSpace: "nowrap" }}>{label}</span>
}

function SortTh({ col, label, align = "left", sortCol, sortDir, onClick, pad = 6 }) {
  const active = sortCol === col
  return (
    <th onClick={() => onClick(col)} style={{
      padding: `7px ${pad}px`, textAlign: align, fontSize: 8, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: ".05em", cursor: "pointer",
      color: active ? accent : "rgba(255,255,255,0.25)", userSelect: "none",
    }}>
      {label}{active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
    </th>
  )
}

// ── Overview Cards ──
function OverviewSection({ summary }) {
  if (!summary) return null
  const completionRate = summary.total_sessions > 0
    ? Math.round((summary.users?.filter(u => u.avg_slides >= summary.avg_slides_viewed).length || 0) / (summary.users?.length || 1) * 100) : 0

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
      <StatCard icon={Eye} label="Sessions" value={summary.total_sessions} />
      <StatCard icon={Users} label="Spectateurs" value={summary.unique_viewers} />
      <StatCard icon={Clock} label="Duree moy." value={formatTime(summary.avg_duration)} />
      <StatCard icon={BarChart2} label="Slides moy." value={Math.round(summary.avg_slides_viewed)} />
      <StatCard icon={Music} label="Musique" value={summary.music_usage} color="#34d399" sub={`/ ${summary.total_sessions}`} />
      <StatCard icon={GitCompare} label="Comparaison" value={summary.comparison_usage} color="#60a5fa" sub={`/ ${summary.total_sessions}`} />
      {summary.themes?.[0] && <StatCard icon={Palette} label="Theme favori" value={summary.themes[0].theme} color="#a78bfa" sub={`${summary.themes[0].count}x`} />}
    </div>
  )
}

// ── Users Summary ──
function UsersSummary({ users }) {
  if (!users?.length) return null
  const maxTime = Math.max(...users.map(u => u.total_time || 0), 1)
  return (
    <div style={{ ...cardStyle, marginBottom: 16 }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 10 }}>Par utilisateur</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {users.map(u => (
          <div key={u.user_id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: accent + "15", border: "1px solid " + accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: accent, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase() || "?"}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "white", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.name}</span>
                <span style={{ fontSize: 10, color: accent, ...mono, flexShrink: 0 }}>{u.sessions}x · {formatTime(u.total_time)}</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: accent + "60", width: (u.total_time / maxTime * 100) + "%" }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Sessions Table ──
function SessionsTable({ sessions, slideStats }) {
  const [expandedId, setExpandedId] = useState(null)
  const [filterUser, setFilterUser] = useState("")
  const [filterYear, setFilterYear] = useState("")
  const [filterCompleted, setFilterCompleted] = useState("all")
  const [sortCol, setSortCol] = useState("started_at")
  const [sortDir, setSortDir] = useState("desc")
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [deleting, setDeleting] = useState(false)
  const [data, setData] = useState(sessions)

  useEffect(() => setData(sessions), [sessions])

  const userNames = [...new Set(data.map(s => s.user_name))].sort()
  const years = [...new Set(data.map(s => s.year).filter(Boolean))].sort((a, b) => b - a)

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("desc") }
  }

  const filtered = data.filter(s => {
    if (filterUser && s.user_name !== filterUser) return false
    if (filterYear && s.year !== parseInt(filterYear)) return false
    if (filterCompleted === "completed" && (s.slides_viewed < s.total_slides || !s.total_slides)) return false
    if (filterCompleted === "incomplete" && s.slides_viewed >= s.total_slides && s.total_slides > 0) return false
    return true
  })

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

  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleSelectAll = () => { selectedIds.size === sorted.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(sorted.map(s => s.id))) }
  const deleteSelected = async () => {
    if (!selectedIds.size || !confirm(`Supprimer ${selectedIds.size} session(s) ?`)) return
    setDeleting(true)
    try {
      await api("/analytics/admin/sessions", { method: "DELETE", body: { ids: [...selectedIds] } })
      setData(prev => prev.filter(s => !selectedIds.has(s.id)))
      setSelectedIds(new Set())
    } catch {}
    setDeleting(false)
  }

  return (
    <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
      {/* Filters */}
      <div style={{ display: "flex", gap: 6, padding: "10px 12px", alignItems: "center", flexWrap: "wrap", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <Filter size={12} color="rgba(255,255,255,0.2)" />
        <select value={filterUser} onChange={e => setFilterUser(e.target.value)} style={{ padding: "3px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", fontSize: 9 }}>
          <option value="">Tous</option>
          {userNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={{ padding: "3px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", fontSize: 9 }}>
          <option value="">Annees</option>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={filterCompleted} onChange={e => setFilterCompleted(e.target.value)} style={{ padding: "3px 6px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.5)", fontSize: 9 }}>
          <option value="all">Tous</option>
          <option value="completed">Termines</option>
          <option value="incomplete">Non termines</option>
        </select>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", ...mono }}>{sorted.length}</span>
        {selectedIds.size > 0 && (
          <button onClick={deleteSelected} disabled={deleting} style={{
            display: "flex", alignItems: "center", gap: 3, padding: "2px 8px", borderRadius: 5,
            border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.06)",
            color: "#f87171", fontSize: 9, fontWeight: 600, cursor: "pointer", marginLeft: "auto",
          }}>
            <Trash2 size={10} /> {deleting ? "..." : selectedIds.size}
          </button>
        )}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <th style={{ padding: "6px 4px", width: 24, textAlign: "center" }}>
              <input type="checkbox" checked={sorted.length > 0 && selectedIds.size === sorted.length} onChange={toggleSelectAll} style={{ cursor: "pointer", accentColor: accent }} />
            </th>
            <SortTh col="started_at" label="Date" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
            <SortTh col="user_name" label="Utilisateur" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} pad={8} />
            <SortTh col="year" label="Recap" align="center" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
            <SortTh col="duration" label="Duree" align="right" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
            <SortTh col="progress" label="Progr." align="center" sortCol={sortCol} sortDir={sortDir} onClick={toggleSort} />
            <th style={{ padding: "6px", fontSize: 8, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>Options</th>
            <th style={{ width: 24 }} />
          </tr>
        </thead>
        <tbody>
          {sorted.map(s => <SessionRow key={s.id} session={s} expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)} selected={selectedIds.has(s.id)} onSelect={toggleSelect} />)}
          {sorted.length === 0 && <tr><td colSpan={8} style={{ padding: 20, textAlign: "center", ...dim }}>Aucune session</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

function SessionRow({ session, expanded, onToggle, selected, onSelect }) {
  const completed = session.slides_viewed >= session.total_slides && session.total_slides > 0
  const pct = session.total_slides > 0 ? Math.round(session.slides_viewed / session.total_slides * 100) : 0
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: "pointer", background: expanded ? "rgba(255,255,255,0.02)" : selected ? "rgba(229,160,13,0.02)" : "transparent" }}>
        <td style={{ padding: "6px 4px", textAlign: "center", width: 24 }}>
          <input type="checkbox" checked={selected} onChange={() => onSelect(session.id)} onClick={e => e.stopPropagation()} style={{ cursor: "pointer", accentColor: accent }} />
        </td>
        <td style={{ padding: "6px", fontSize: 9, color: "rgba(255,255,255,0.35)" }}>{formatDate(session.started_at)}</td>
        <td style={{ padding: "6px 8px", fontSize: 10, color: "white", fontWeight: 600 }}>{session.user_name}</td>
        <td style={{ padding: "6px", fontSize: 10, color: accent, ...mono, textAlign: "center" }}>{session.year}</td>
        <td style={{ padding: "6px", fontSize: 10, color: accent, ...mono, textAlign: "right" }}>{formatTime(session.duration_seconds)}</td>
        <td style={{ padding: "6px", textAlign: "center" }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", ...mono }}>{session.slides_viewed}/{session.total_slides}</span>
          {completed && <CheckCircle size={10} color="#4ade80" style={{ marginLeft: 3, verticalAlign: "middle" }} />}
        </td>
        <td style={{ padding: "6px", textAlign: "center" }}>
          <div style={{ display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
            {session.theme_id && <Tag label={session.theme_id} color="#a78bfa" />}
            {session.music_enabled && <Tag label="♫" color="#34d399" />}
            {session.comparison_enabled && <Tag label="⇋" color="#60a5fa" />}
            {session.reactions?.[0]?.value && <span style={{ fontSize: 13 }}>{session.reactions[0].value}</span>}
          </div>
        </td>
        <td style={{ padding: "6px", textAlign: "center" }}>
          {expanded ? <ChevronUp size={12} color="rgba(255,255,255,0.15)" /> : <ChevronDown size={12} color="rgba(255,255,255,0.15)" />}
        </td>
      </tr>
      {expanded && <tr><td colSpan={8} style={{ padding: "0 8px 10px 32px", background: "rgba(255,255,255,0.01)" }}><SessionDetail session={session} /></td></tr>}
    </>
  )
}

function SessionDetail({ session }) {
  const slideData = session.slide_data || []
  const topSlides = [...slideData].sort((a, b) => b.timeSpent - a.timeSpent)
  const maxTime = topSlides[0]?.timeSpent || 1
  const interactions = session.interactions || {}

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", paddingTop: 8 }}>
      {/* Slides */}
      <div style={{ flex: "1 1 220px", minWidth: 220 }}>
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>Temps par slide</div>
        <div style={{ maxHeight: 180, overflowY: "auto", display: "flex", flexDirection: "column", gap: 1 }}>
          {topSlides.map(s => (
            <div key={s.slideId} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 8, color: s.interacted ? "#34d399" : "rgba(255,255,255,0.3)", minWidth: 85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{s.slideId}</span>
              <div style={{ flex: 1, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.03)", overflow: "hidden", minWidth: 20 }}>
                <div style={{ height: "100%", borderRadius: 1, background: s.interacted ? "#34d399" : accent, width: (s.timeSpent / maxTime * 100) + "%" }} />
              </div>
              <span style={{ fontSize: 8, color: accent, ...mono, minWidth: 24, textAlign: "right" }}>{s.timeSpent}s</span>
            </div>
          ))}
        </div>
      </div>

      {/* Details */}
      <div style={{ flex: "0 1 180px", minWidth: 140 }}>
        {/* Interactions */}
        {Object.keys(interactions).length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>Interactions</div>
            {Object.entries(interactions).map(([sid, d]) => (
              <div key={sid} style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", marginBottom: 2 }}>
                {sid} {d.score != null && <span style={{ color: accent, ...mono }}>{d.score}/{d.total}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Reaction */}
        {session.reactions?.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Reaction</div>
            <span style={{ fontSize: 22 }}>{session.reactions[0].value}</span>
          </div>
        )}

        {/* Params */}
        <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 3 }}>Parametres</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1, fontSize: 9, color: "rgba(255,255,255,0.3)" }}>
          {session.theme_id && <div>Theme: <span style={{ color: "#a78bfa" }}>{session.theme_id}</span></div>}
          {session.palette_slug && <div>Palette: <span style={{ color: accent }}>{session.palette_slug}</span></div>}
          <div>Musique: {session.music_enabled ? <span style={{ color: "#34d399" }}>Oui</span> : "Non"}</div>
          <div>Comparaison: {session.comparison_enabled ? <span style={{ color: "#60a5fa" }}>Oui</span> : "Non"}</div>
        </div>
        {session.device && <div style={{ fontSize: 7, color: "rgba(255,255,255,0.1)", marginTop: 4, wordBreak: "break-all" }}>{session.device.substring(0, 60)}</div>}
      </div>
    </div>
  )
}

// ── Slide Stats (expandable) ──
function SlideStatsSection({ slides }) {
  const [open, setOpen] = useState(false)
  if (!slides.length) return null
  const maxTime = slides[0]?.avg_time || 1
  return (
    <div style={{ ...cardStyle, marginTop: 12 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Temps moyen par slide</span>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", ...mono }}>{slides.length}</span>
          {open ? <ChevronUp size={13} color="rgba(255,255,255,0.15)" /> : <ChevronDown size={13} color="rgba(255,255,255,0.15)" />}
        </div>
      </div>
      {open && (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 1 }}>
          {slides.map(s => (
            <div key={s.slide_id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "2px 0" }}>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 0 }}>{s.slide_id}</span>
              <div style={{ flex: 1, height: 2, borderRadius: 1, background: "rgba(255,255,255,0.03)", overflow: "hidden", minWidth: 30 }}>
                <div style={{ height: "100%", borderRadius: 1, background: accent, width: (s.avg_time / maxTime * 100) + "%" }} />
              </div>
              <span style={{ fontSize: 8, color: accent, ...mono, minWidth: 28, textAlign: "right" }}>{s.avg_time}s</span>
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", ...mono, minWidth: 20, textAlign: "right" }}>{s.view_count}x</span>
              {s.interaction_count > 0 && <span style={{ fontSize: 8, color: "#34d399", ...mono }}>⚡{s.interaction_count}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dashboard ──
export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null)
  const [sessions, setSessions] = useState([])
  const [slideStats, setSlideStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api("/analytics/admin/summary"),
      api("/analytics/admin/sessions?limit=200"),
      api("/analytics/admin/slide-stats"),
    ]).then(([sum, sess, slides]) => {
      setSummary(sum)
      setSessions(sess)
      setSlideStats(slides)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Chargement...</div>
  if (!summary) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Aucune donnee</div>

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <BarChart2 size={20} color={accent} strokeWidth={1.5} />
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }}>Statistiques des recaps</h2>
      </div>

      <OverviewSection summary={summary} />
      <UsersSummary users={summary.users} />
      <SessionsTable sessions={sessions} slideStats={slideStats} />
      <SlideStatsSection slides={slideStats} />
    </div>
  )
}
