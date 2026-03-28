import { useState, useEffect } from "react"
import { Play, Eye, Trash2, ToggleLeft, ToggleRight, RefreshCw, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Clapperboard } from "lucide-react"
import { api } from "../../services/api"

const STATUS = {
  completed: { label: "Termine", color: "#4ade80", Icon: CheckCircle2 },
  failed: { label: "Echoue", color: "#f87171", Icon: XCircle },
  pending: { label: "En attente", color: "#fbbf24", Icon: Clock },
  collecting: { label: "Collecte...", color: "#60a5fa", Icon: RefreshCw },
  processing: { label: "Traitement...", color: "#60a5fa", Icon: RefreshCw },
  fetching_posters: { label: "Affiches...", color: "#60a5fa", Icon: RefreshCw },
}

export default function RecapManager() {
  const [recaps, setRecaps] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genYear, setGenYear] = useState(new Date().getFullYear())
  const [editing, setEditing] = useState(null) // recap id being edited

  const load = () => api("/admin/recaps").then(setRecaps).catch(() => {})
  useEffect(() => { load() }, [])

  const generate = async () => {
    setGenerating(true)
    try {
      await api("/recaps/generate", { method: "POST", body: { year: genYear } })
      const poll = setInterval(async () => {
        await load()
        const r = recaps.find((r) => r.year === genYear)
        if (r && (r.status === "completed" || r.status === "failed")) {
          clearInterval(poll)
          setGenerating(false)
        }
      }, 3000)
      // Also reload after poll
      setTimeout(() => { load(); setGenerating(false) }, 20000)
    } catch (e) {
      alert(e.message)
      setGenerating(false)
    }
  }

  const toggleActive = async (recap) => {
    await api(`/admin/recaps/${recap.id}`, { method: "PATCH", body: { is_active: !recap.is_active } })
    load()
  }

  const updateRecap = async (id, updates) => {
    await api(`/admin/recaps/${id}`, { method: "PATCH", body: updates })
    load()
  }

  const deleteRecap = async (id) => {
    if (!confirm("Supprimer ce recap definitivement ?")) return
    await api(`/admin/recaps/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Clapperboard size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Gestion des recaps</h2>
      </div>
      <p style={desc}>Creez, configurez et diffusez les recaps annuels a vos utilisateurs.</p>

      {/* Generate */}
      <div style={{ ...card, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4 }}>Nouveau recap</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Genere les donnees depuis tous les services connectes</div>
        </div>
        <input type="number" value={genYear} onChange={(e) => setGenYear(parseInt(e.target.value) || 2024)}
          style={yearInput} />
        <button onClick={generate} disabled={generating} style={{
          ...btn, background: generating ? "rgba(229,160,13,0.15)" : "#E5A00D",
          color: generating ? "#E5A00D" : "#05050e",
        }}>
          {generating ? <><RefreshCw size={13} className="spin" /> Generation...</> : <><Play size={13} /> Generer</>}
        </button>
      </div>

      {/* Recap list */}
      {recaps.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          Aucun recap. Generez-en un ci-dessus.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {recaps.map((r) => {
          const st = STATUS[r.status] || STATUS.pending
          const isEditing = editing === r.id
          return (
            <div key={r.id} style={{ ...card, border: r.is_active ? "1px solid rgba(34,197,94,0.25)" : card.border }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: isEditing ? 16 : 0, flexWrap: "wrap" }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#E5A00D", fontFamily: "JetBrains Mono,monospace", width: 50 }}>{r.year}</div>
                <div style={{ flex: 1, minWidth: 100 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <st.Icon size={13} color={st.color} strokeWidth={1.5} />
                    <span style={{ fontSize: 12, color: st.color }}>{st.label}</span>
                    {r.is_active && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 10, background: "rgba(34,197,94,0.12)", color: "#4ade80", fontFamily: "JetBrains Mono,monospace" }}>ACTIF</span>}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", marginTop: 2 }}>
                    {r.user_name} {r.completed_at && (" — " + new Date(r.completed_at).toLocaleDateString("fr-FR"))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => toggleActive(r)} style={btnSmall} title={r.is_active ? "Desactiver" : "Activer"}>
                    {r.is_active ? <ToggleRight size={14} color="#4ade80" /> : <ToggleLeft size={14} />}
                  </button>
                  {r.status === "completed" && (
                    <a href={`/recap/${r.year}`} target="_blank" rel="noopener" style={{ ...btnSmall, textDecoration: "none", display: "flex", alignItems: "center" }} title="Preview">
                      <Eye size={14} />
                    </a>
                  )}
                  <button onClick={() => setEditing(isEditing ? null : r.id)} style={btnSmall} title="Configurer">
                    <Calendar size={14} color={isEditing ? "#E5A00D" : undefined} />
                  </button>
                  <button onClick={() => deleteRecap(r.id)} style={{ ...btnSmall, color: "#f87171" }} title="Supprimer">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Edit panel */}
              {isEditing && (
                <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 12 }}>
                  {/* Diffusion */}
                  <div>
                    <div style={label}>Periode de diffusion</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                      <div>
                        <div style={inputLabel}>Debut</div>
                        <input type="datetime-local"
                          value={r.available_from ? r.available_from.slice(0, 16) : ""}
                          onChange={(e) => updateRecap(r.id, { available_from: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          style={input} />
                      </div>
                      <div>
                        <div style={inputLabel}>Fin</div>
                        <input type="datetime-local"
                          value={r.available_until ? r.available_until.slice(0, 16) : ""}
                          onChange={(e) => updateRecap(r.id, { available_until: e.target.value ? new Date(e.target.value).toISOString() : null })}
                          style={input} />
                      </div>
                    </div>
                  </div>

                  {/* Error */}
                  {r.error_message && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <AlertCircle size={14} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div style={{ fontSize: 11, color: "#f87171", fontFamily: "JetBrains Mono,monospace", wordBreak: "break-all" }}>{r.error_message}</div>
                    </div>
                  )}

                  {/* Regenerate */}
                  <button onClick={() => { generate(); setEditing(null) }} style={{ ...btn, width: "fit-content" }}>
                    <RefreshCw size={13} /> Regenerer les donnees
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }
const card = { padding: "16px 18px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }
const btn = { display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: "#E5A00D", color: "#05050e", fontSize: 12, fontWeight: 700, cursor: "pointer" }
const btnSmall = { background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.4)", padding: "6px 8px", cursor: "pointer", display: "flex", alignItems: "center" }
const yearInput = { width: 70, padding: "6px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 14, fontFamily: "JetBrains Mono,monospace", textAlign: "center", outline: "none" }
const label = { fontSize: 12, color: "white", fontWeight: 600 }
const inputLabel = { fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }
const input = { padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 12, outline: "none" }
