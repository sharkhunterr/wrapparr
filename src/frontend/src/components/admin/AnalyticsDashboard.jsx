import { useState, useEffect } from "react"
import { api } from "../../services/api"
import { BarChart2, Users, Clock, Eye, MessageCircle, Music, GitCompare, Palette, ChevronDown, ChevronUp } from "lucide-react"

const card = { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }
const h2 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }
const mono = { fontFamily: "JetBrains Mono,monospace" }
const dim = { color: "rgba(255,255,255,0.35)", fontSize: 11 }
const accent = "#E5A00D"

function StatCard({ icon: Icon, label, value, sub, color = accent }) {
  return (
    <div style={{ ...card, display: "flex", alignItems: "center", gap: 12, flex: "1 1 140px", minWidth: 140 }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "15", border: "1px solid " + color + "30", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "white", ...mono }}>{value}</div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{label}</div>
        {sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

function UserRow({ user, onExpand, expanded }) {
  return (
    <div style={{ ...card, marginBottom: 4, cursor: "pointer" }} onClick={onExpand}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: "50%", background: accent + "15", border: "1px solid " + accent + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: accent }}>{user.name?.[0]?.toUpperCase() || "?"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{user.name}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{user.sessions} session{user.sessions > 1 ? "s" : ""}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: accent, ...mono }}>{formatTime(user.total_time)}</div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>moy. {formatTime(user.avg_time)}</div>
        </div>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", ...mono }}>{Math.round(user.avg_slides)} slides</div>
        {expanded ? <ChevronUp size={14} color="rgba(255,255,255,0.2)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.2)" />}
      </div>
    </div>
  )
}

function SessionDetail({ session }) {
  const slideData = session.slide_data || []
  const topSlides = [...slideData].sort((a, b) => b.timeSpent - a.timeSpent).slice(0, 5)

  return (
    <div style={{ ...card, marginBottom: 4, marginLeft: 20, background: "rgba(255,255,255,0.015)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
          {session.started_at ? new Date(session.started_at).toLocaleString("fr-FR") : "?"}
        </span>
        <span style={{ fontSize: 10, color: accent, ...mono }}>{formatTime(session.duration_seconds)}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
        <Tag label={`${session.slides_viewed}/${session.total_slides} slides`} />
        {session.theme_id && <Tag label={session.theme_id} color="#a78bfa" />}
        {session.music_enabled && <Tag label="Musique" color="#34d399" />}
        {session.comparison_enabled && <Tag label="Comparaison" color="#60a5fa" />}
      </div>
      {topSlides.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Top slides (temps)</div>
          {topSlides.map((s, i) => (
            <div key={s.slideId} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 2, background: accent, width: (topSlides[0]?.timeSpent > 0 ? s.timeSpent / topSlides[0].timeSpent * 100 : 0) + "%" }} />
              </div>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", minWidth: 90, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.slideId}</span>
              <span style={{ fontSize: 9, color: accent, ...mono, minWidth: 30, textAlign: "right" }}>{s.timeSpent}s</span>
            </div>
          ))}
        </div>
      )}
      {session.interactions && Object.keys(session.interactions).length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginBottom: 4 }}>Interactions</div>
          {Object.entries(session.interactions).map(([slideId, data]) => (
            <div key={slideId} style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>{slideId}</span>
              {data.score != null && <span style={{ color: accent, ...mono, marginLeft: 6 }}>{data.score}/{data.total}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Tag({ label, color = accent }) {
  return <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 4, background: color + "15", border: "1px solid " + color + "25", color }}>{label}</span>
}

function SlideStatsTable({ slides }) {
  if (!slides.length) return null
  const maxTime = slides[0]?.avg_time || 1

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {slides.slice(0, 20).map((s) => (
        <div key={s.slide_id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px", borderRadius: 6, background: "rgba(255,255,255,0.015)" }}>
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.slide_id}</span>
            <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.04)", overflow: "hidden", minWidth: 40 }}>
              <div style={{ height: "100%", borderRadius: 2, background: accent, width: (s.avg_time / maxTime * 100) + "%" }} />
            </div>
          </div>
          <span style={{ fontSize: 9, color: accent, ...mono, minWidth: 35, textAlign: "right" }}>{s.avg_time}s</span>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", ...mono, minWidth: 25, textAlign: "right" }}>{s.view_count}x</span>
          {s.interaction_count > 0 && <span style={{ fontSize: 9, color: "#34d399", ...mono, minWidth: 20, textAlign: "right" }}>{s.interaction_count}</span>}
        </div>
      ))}
    </div>
  )
}

function formatTime(seconds) {
  if (!seconds || seconds < 0) return "0s"
  if (seconds < 60) return Math.round(seconds) + "s"
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  if (m < 60) return m + "m" + (s > 0 ? s + "s" : "")
  const h = Math.floor(m / 60)
  return h + "h" + (m % 60) + "m"
}

export default function AnalyticsDashboard() {
  const [summary, setSummary] = useState(null)
  const [sessions, setSessions] = useState([])
  const [slideStats, setSlideStats] = useState([])
  const [expandedUser, setExpandedUser] = useState(null)
  const [userSessions, setUserSessions] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api("/analytics/admin/summary"),
      api("/analytics/admin/slide-stats"),
    ]).then(([sum, slides]) => {
      setSummary(sum)
      setSlideStats(slides)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const toggleUser = async (userId) => {
    if (expandedUser === userId) { setExpandedUser(null); return }
    setExpandedUser(userId)
    if (!userSessions[userId]) {
      const sessions = await api("/analytics/admin/sessions?user_id=" + userId + "&limit=10")
      setUserSessions(prev => ({ ...prev, [userId]: sessions }))
    }
  }

  if (loading) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Chargement...</div>
  if (!summary) return <div style={{ textAlign: "center", padding: 40, ...dim }}>Aucune donnee</div>

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <BarChart2 size={22} color={accent} strokeWidth={1.5} />
        <h2 style={h2}>Statistiques des recaps</h2>
      </div>

      {/* KPIs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon={Eye} label="Sessions totales" value={summary.total_sessions} />
        <StatCard icon={Users} label="Spectateurs uniques" value={summary.unique_viewers} />
        <StatCard icon={Clock} label="Duree moyenne" value={formatTime(summary.avg_duration)} />
        <StatCard icon={BarChart2} label="Slides vues (moy.)" value={Math.round(summary.avg_slides_viewed)} />
      </div>

      {/* Usage features */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard icon={Music} label="Musique activee" value={summary.music_usage} color="#34d399" sub={`sur ${summary.total_sessions} sessions`} />
        <StatCard icon={GitCompare} label="Comparaison activee" value={summary.comparison_usage} color="#60a5fa" sub={`sur ${summary.total_sessions} sessions`} />
        <StatCard icon={MessageCircle} label="Reactions" value={summary.total_reactions} color="#f472b6" />
        {summary.themes?.length > 0 && <StatCard icon={Palette} label="Theme favori" value={summary.themes[0].theme} color="#a78bfa" sub={`${summary.themes[0].count} sessions`} />}
      </div>

      {/* Per-user breakdown */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 600 }}>Par utilisateur</div>
        {summary.users.map((u) => (
          <div key={u.user_id}>
            <UserRow user={u} expanded={expandedUser === u.user_id} onExpand={() => toggleUser(u.user_id)} />
            {expandedUser === u.user_id && (userSessions[u.user_id] || []).map((s) => (
              <SessionDetail key={s.id} session={s} />
            ))}
          </div>
        ))}
        {summary.users.length === 0 && <div style={dim}>Aucune session enregistree</div>}
      </div>

      {/* Slide stats */}
      <div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 600 }}>Temps moyen par slide</div>
        <SlideStatsTable slides={slideStats} />
        {slideStats.length === 0 && <div style={dim}>Aucune donnee de slide</div>}
      </div>
    </div>
  )
}
