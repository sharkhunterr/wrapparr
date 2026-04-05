import { useState, useEffect } from "react"
import { Play, Eye, Trash2, ToggleLeft, ToggleRight, RefreshCw, Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Clapperboard, Timer } from "lucide-react"
import { api } from "../../services/api"

const STATUS = {
  completed: { label: "Terminé", color: "#4ade80", Icon: CheckCircle2 },
  failed: { label: "Échoué", color: "#f87171", Icon: XCircle },
  pending: { label: "En attente", color: "#fbbf24", Icon: Clock },
  collecting: { label: "Collecte...", color: "#60a5fa", Icon: RefreshCw },
  processing: { label: "Traitement...", color: "#60a5fa", Icon: RefreshCw },
  fetching_posters: { label: "Affiches...", color: "#60a5fa", Icon: RefreshCw },
}

const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"]

export default function RecapManager() {
  const [recaps, setRecaps] = useState([])
  const [generating, setGenerating] = useState(false)
  const [genYear, setGenYear] = useState(new Date().getFullYear())
  const [editing, setEditing] = useState(null)
  const [schedule, setSchedule] = useState(null) // { enabled, mode, month, day, hour, cron }
  const [scheduleSaving, setScheduleSaving] = useState(false)

  const load = () => api("/admin/recaps").then(setRecaps).catch(() => {})
  useEffect(() => {
    load()
    api("/admin/config").then(cfg => {
      setSchedule({
        enabled: cfg.recap_schedule_enabled || false,
        mode: cfg.recap_schedule_mode || "simple",
        month: cfg.recap_schedule_month ?? 12,
        day: cfg.recap_schedule_day ?? 1,
        hour: cfg.recap_schedule_hour ?? 9,
        cron: cfg.recap_schedule_cron || "0 9 1 12 *",
      })
    }).catch(() => {})
  }, [])

  const saveSchedule = async (s) => {
    setScheduleSaving(true)
    const cron = s.mode === "simple" ? `0 ${s.hour} ${s.day} ${s.month} *` : s.cron
    try {
      await api("/admin/config", { method: "PATCH", body: {
        recap_schedule_enabled: s.enabled,
        recap_schedule_mode: s.mode,
        recap_schedule_month: s.month,
        recap_schedule_day: s.day,
        recap_schedule_hour: s.hour,
        recap_schedule_cron: cron,
        recap_schedule: cron,
      }})
    } catch {}
    setScheduleSaving(false)
  }

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
    if (!confirm("Supprimer ce recap définitivement ?")) return
    await api(`/admin/recaps/${id}`, { method: "DELETE" })
    load()
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Clapperboard size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Gestion des recaps</h2>
      </div>
      <p style={desc}>Créez, configurez et diffusez les recaps annuels à vos utilisateurs.</p>

      {/* Generate */}
      <div style={{ ...card, marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 150 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "white", marginBottom: 4 }}>Nouveau recap</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Génère les données depuis tous les services connectés</div>
        </div>
        <input type="number" value={genYear} onChange={(e) => setGenYear(parseInt(e.target.value) || 2024)}
          style={yearInput} />
        <button onClick={generate} disabled={generating} style={{
          ...btn, background: generating ? "rgba(229,160,13,0.15)" : "#E5A00D",
          color: generating ? "#E5A00D" : "#05050e",
        }}>
          {generating ? <><RefreshCw size={13} className="spin" /> Génération...</> : <><Play size={13} /> Générer</>}
        </button>
      </div>

      {/* ── Schedule ── */}
      {schedule && (
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: schedule.enabled ? 14 : 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Timer size={15} color="#60a5fa" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "white" }}>Planification automatique</span>
            </div>
            <button onClick={() => {
              const next = { ...schedule, enabled: !schedule.enabled }
              setSchedule(next)
              saveSchedule(next)
            }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              {schedule.enabled ? <ToggleRight size={20} color="#4ade80" /> : <ToggleLeft size={20} color="rgba(255,255,255,0.25)" />}
            </button>
          </div>

          {schedule.enabled && (
            <div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
                Le recap sera généré automatiquement pour l'année en cours au moment de l'exécution.
              </div>

              {/* Mode toggle */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[{ v: "simple", l: "Simple" }, { v: "cron", l: "Expert (cron)" }].map(m => (
                  <button key={m.v} onClick={() => setSchedule({ ...schedule, mode: m.v })} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
                    background: schedule.mode === m.v ? "rgba(96,165,250,0.12)" : "rgba(255,255,255,0.02)",
                    border: "1px solid " + (schedule.mode === m.v ? "rgba(96,165,250,0.3)" : "rgba(255,255,255,0.06)"),
                    color: schedule.mode === m.v ? "#60a5fa" : "rgba(255,255,255,0.35)",
                  }}>{m.l}</button>
                ))}
              </div>

              {schedule.mode === "simple" ? (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div>
                    <div style={inputLabel}>Mois</div>
                    <select value={schedule.month} onChange={e => setSchedule({ ...schedule, month: parseInt(e.target.value) })}
                      style={{ ...input, minWidth: 110 }}>
                      {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <div style={inputLabel}>Jour</div>
                    <input type="number" min={1} max={31} value={schedule.day}
                      onChange={e => setSchedule({ ...schedule, day: parseInt(e.target.value) || 1 })}
                      style={{ ...input, width: 50, textAlign: "center" }} />
                  </div>
                  <div>
                    <div style={inputLabel}>Heure</div>
                    <input type="number" min={0} max={23} value={schedule.hour}
                      onChange={e => setSchedule({ ...schedule, hour: parseInt(e.target.value) || 0 })}
                      style={{ ...input, width: 50, textAlign: "center" }} />
                  </div>
                  <button onClick={() => saveSchedule(schedule)} disabled={scheduleSaving} style={{ ...btn, fontSize: 11, padding: "7px 14px" }}>
                    {scheduleSaving ? "..." : "Enregistrer"}
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 150 }}>
                    <div style={inputLabel}>Expression cron (min h jour mois dow)</div>
                    <input value={schedule.cron} onChange={e => setSchedule({ ...schedule, cron: e.target.value })}
                      placeholder="0 9 1 12 *" style={{ ...input, width: "100%", fontFamily: "JetBrains Mono,monospace" }} />
                  </div>
                  <button onClick={() => saveSchedule(schedule)} disabled={scheduleSaving} style={{ ...btn, fontSize: 11, padding: "7px 14px" }}>
                    {scheduleSaving ? "..." : "Enregistrer"}
                  </button>
                </div>
              )}

              {/* Preview */}
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", marginTop: 8, fontFamily: "JetBrains Mono,monospace" }}>
                {schedule.mode === "simple"
                  ? `Prochain : ${schedule.day} ${MONTHS[schedule.month - 1]} ${new Date().getFullYear()} à ${String(schedule.hour).padStart(2, "0")}:00 → recap ${new Date().getFullYear()}`
                  : `Cron : ${schedule.cron}`
                }
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recap list */}
      {recaps.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          Aucun recap. Générez-en un ci-dessus.
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
                  <button onClick={() => toggleActive(r)} style={btnSmall} title={r.is_active ? "Désactiver" : "Activer"}>
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
                    <div style={label}>Période de diffusion</div>
                    <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap" }}>
                      <div>
                        <div style={inputLabel}>Début</div>
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
                    <RefreshCw size={13} /> Régénérer les données
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
