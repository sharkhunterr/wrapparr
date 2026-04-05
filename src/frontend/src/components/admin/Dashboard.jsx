import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Users, Link2, CheckCircle2, XCircle, Clock, RefreshCw, Eye, BarChart2, Music, GitCompare, Film, Palette, ArrowRight } from "lucide-react"
import { api } from "../../services/api"

const accent = "#E5A00D"
const mono = { fontFamily: "JetBrains Mono,monospace" }

const STATUS_MAP = {
  completed: { label: "Terminé", color: "#4ade80", Icon: CheckCircle2 },
  failed: { label: "Échoué", color: "#f87171", Icon: XCircle },
  pending: { label: "En attente", color: "#fbbf24", Icon: Clock },
  collecting: { label: "Collecte...", color: "#60a5fa", Icon: RefreshCw },
  processing: { label: "Traitement...", color: "#60a5fa", Icon: RefreshCw },
  fetching_posters: { label: "Affiches...", color: "#60a5fa", Icon: RefreshCw },
}

function formatTime(s) {
  if (!s || s < 0) return "0s"
  if (s < 60) return Math.round(s) + "s"
  const m = Math.floor(s / 60), sec = Math.round(s % 60)
  if (m < 60) return m + "m" + (sec > 0 ? sec + "s" : "")
  return Math.floor(m / 60) + "h" + (m % 60) + "m"
}

function KPI({ icon: Icon, label, value, sub, color = accent }) {
  return (
    <div style={{ padding: "14px 12px", borderRadius: 10, background: color + "08", border: "1px solid " + color + "15", flex: "1 1 120px", minWidth: 120 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon size={14} color={color} strokeWidth={1.5} />
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{label}</span>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1, ...mono }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function NavCard({ icon: Icon, label, desc, color, to }) {
  const navigate = useNavigate()
  return (
    <div onClick={() => navigate(to)} style={{
      padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      cursor: "pointer", transition: "border-color .2s, background .2s", flex: "1 1 160px", minWidth: 160,
      display: "flex", alignItems: "center", gap: 10,
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + "30"; e.currentTarget.style.background = color + "06" }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)" }}
    >
      <div style={{ width: 32, height: 32, borderRadius: 8, background: color + "15", border: "1px solid " + color + "20", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={14} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{label}</div>
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)" }}>{desc}</div>
      </div>
      <ArrowRight size={12} color="rgba(255,255,255,0.1)" />
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recaps, setRecaps] = useState([])
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    api("/admin/dashboard").then(setStats).catch(() => {})
    api("/recaps").then(setRecaps).catch(() => {})
    api("/analytics/admin/summary").then(setAnalytics).catch(() => {})
  }, [])

  const completedRecaps = recaps.filter(r => r.status === "completed")

  return (
    <div>
      <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Tableau de bord</h2>

      {/* ── KPIs ── */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <KPI icon={Users} label="Utilisateurs" value={stats?.user_count ?? "–"} color="#E5A00D" />
        <KPI icon={Link2} label="Services actifs" value={stats?.active_services ?? "–"} color="#34d399" />
        <KPI icon={Film} label="Recaps" value={completedRecaps.length} color="#c084fc" sub={recaps.length > completedRecaps.length ? `${recaps.length - completedRecaps.length} en cours/échec` : undefined} />
        {analytics && <>
          <KPI icon={Eye} label="Visionnages" value={analytics.total_sessions} color="#60a5fa" sub={`${analytics.unique_viewers} spectateur${analytics.unique_viewers > 1 ? "s" : ""}`} />
          <KPI icon={Clock} label="Durée moy." value={formatTime(analytics.avg_duration)} color="#fb923c" />
          <KPI icon={Music} label="Musique" value={analytics.music_usage} color="#34d399" sub={`/ ${analytics.total_sessions}`} />
          <KPI icon={GitCompare} label="Comparaison" value={analytics.comparison_usage} color="#60a5fa" sub={`/ ${analytics.total_sessions}`} />
        </>}
      </div>

      {/* ── Recaps list ── */}
      {recaps.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 8 }}>Recaps générés</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {recaps.map(r => {
              const st = STATUS_MAP[r.status] || STATUS_MAP.pending
              return (
                <div key={r.id} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: accent, ...mono, width: 44 }}>{r.year}</span>
                  <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5 }}>
                    <st.Icon size={12} color={st.color} strokeWidth={1.5} />
                    <span style={{ fontSize: 10, color: st.color }}>{st.label}</span>
                    {r.completed_at && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.15)", ...mono, marginLeft: 4 }}>
                      {new Date(r.completed_at).toLocaleDateString("fr-FR")}
                    </span>}
                  </div>
                  {r.status === "completed" && (
                    <a href={`/recap/${r.year}`} style={{
                      display: "flex", alignItems: "center", gap: 3, padding: "4px 10px", borderRadius: 5,
                      border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: 10, textDecoration: "none",
                    }}>
                      <Eye size={11} /> Voir
                    </a>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Viewers (top 5) ── */}
      {analytics?.users?.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 8 }}>Derniers spectateurs</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {analytics.users.slice(0, 5).map(u => (
              <div key={u.user_id} style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
              }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: accent + "15", border: "1px solid " + accent + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: accent, flexShrink: 0 }}>{u.name?.[0]?.toUpperCase() || "?"}</div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "white", flex: 1 }}>{u.name}</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", ...mono }}>{u.sessions}x</span>
                <span style={{ fontSize: 10, color: accent, ...mono }}>{formatTime(u.total_time)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Quick links ── */}
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, marginBottom: 8 }}>Accès rapide</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <NavCard icon={Link2} label="Services" desc="Configurer les connexions" color="#34d399" to="/admin/services" />
        <NavCard icon={Film} label="Slides" desc="Organiser les slides" color="#E5A00D" to="/admin/slides" />
        <NavCard icon={Palette} label="Themes" desc="Apparence du recap" color="#a78bfa" to="/admin/themes" />
        <NavCard icon={BarChart2} label="Statistiques" desc="Visionnages détaillés" color="#60a5fa" to="/admin/analytics" />
      </div>

    </div>
  )
}
