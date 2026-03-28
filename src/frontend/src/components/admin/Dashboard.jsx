import { useState, useEffect } from "react"
import { Users, Link2, Activity, TrendingUp, Play, CheckCircle2, XCircle, Clock, RefreshCw, Eye } from "lucide-react"
import { api } from "../../services/api"

const STATUS_MAP = {
  completed: { label: "Termine", color: "#4ade80", Icon: CheckCircle2 },
  failed: { label: "Echoue", color: "#f87171", Icon: XCircle },
  pending: { label: "En attente", color: "#fbbf24", Icon: Clock },
  collecting: { label: "Collecte...", color: "#60a5fa", Icon: RefreshCw },
  processing: { label: "Traitement...", color: "#60a5fa", Icon: RefreshCw },
  fetching_posters: { label: "Affiches...", color: "#60a5fa", Icon: RefreshCw },
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recaps, setRecaps] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genYear, setGenYear] = useState(new Date().getFullYear())

  useEffect(() => {
    api("/admin/dashboard").then(setStats).catch(() => {})
    api("/recaps").then(setRecaps).catch(() => {})
  }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      await api("/recaps/generate", { method: "POST", body: { year: genYear } })
      // Poll
      const poll = setInterval(async () => {
        const all = await api("/recaps")
        setRecaps(all)
        const target = all.find((r) => r.year === genYear)
        if (target && (target.status === "completed" || target.status === "failed")) {
          clearInterval(poll)
          setGenerating(false)
        }
      }, 2000)
    } catch (e) {
      alert(e.message)
      setGenerating(false)
    }
  }

  const cards = stats ? [
    { label: "Utilisateurs", value: stats.user_count, color: "#E5A00D", Icon: Users },
    { label: "Services actifs", value: stats.active_services, color: "#34d399", Icon: Link2 },
    { label: "Jobs en cours", value: stats.running_jobs, color: "#60a5fa", Icon: Activity },
    { label: "Recaps generes", value: recaps.filter((r) => r.status === "completed").length, color: "#c084fc", Icon: CheckCircle2 },
  ] : []

  return (
    <div>
      <h2 style={h2}>Tableau de bord</h2>

      {/* Metrics */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 28 }}>
          {cards.map((c) => (
            <div key={c.label} style={{ padding: "16px 14px", borderRadius: 12, background: `${c.color}08`, border: `1px solid ${c.color}15` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <c.Icon size={16} color={c.color} strokeWidth={1.5} />
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: c.color, lineHeight: 1 }}>{c.value}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Generate recap */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, margin: 0 }}>Generer un recap</h3>
        <input type="number" value={genYear} onChange={(e) => setGenYear(parseInt(e.target.value) || 2024)}
          style={{ width: 80, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, fontFamily: "JetBrains Mono,monospace", textAlign: "center", outline: "none" }} />
        <button onClick={generate} disabled={generating} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none",
          background: generating ? "rgba(229,160,13,0.2)" : "#E5A00D", color: generating ? "#E5A00D" : "#05050e",
          fontSize: 12, fontWeight: 700, cursor: generating ? "wait" : "pointer",
        }}>
          {generating ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Generation...</> : <><Play size={13} /> Lancer</>}
        </button>
      </div>

      {/* Recap list */}
      <h3 style={{ color: "white", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recaps generes</h3>
      {recaps.length === 0 && (
        <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, padding: 24, textAlign: "center", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          Aucun recap. Configurez vos services puis lancez la generation.
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {recaps.map((r) => {
          const st = STATUS_MAP[r.status] || STATUS_MAP.pending
          return (
            <div key={r.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
              borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#E5A00D", fontFamily: "JetBrains Mono,monospace", width: 50 }}>{r.year}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <st.Icon size={13} color={st.color} strokeWidth={1.5} />
                  <span style={{ fontSize: 12, color: st.color }}>{st.label}</span>
                </div>
                {r.completed_at && (
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", marginTop: 2 }}>
                    {new Date(r.completed_at).toLocaleDateString("fr-FR")} {new Date(r.completed_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                )}
              </div>
              {r.status === "completed" && (
                <a href={`/recap/${r.year}`} style={{
                  display: "flex", alignItems: "center", gap: 4, padding: "5px 12px",
                  borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)", fontSize: 11, textDecoration: "none",
                }}>
                  <Eye size={12} /> Voir
                </a>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, marginBottom: 20 }
