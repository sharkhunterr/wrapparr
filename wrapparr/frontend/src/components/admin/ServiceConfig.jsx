import { useState, useEffect } from "react"
import { Clapperboard, MonitorPlay, Gamepad2, Headphones, BookOpen, Library, CircleCheck, CircleX, Trash2, Plug } from "lucide-react"
import { api } from "../../services/api"

const SERVICE_TYPES = [
  { type: "tautulli", label: "Tautulli (Plex)", Icon: Clapperboard, color: "#E5A00D", placeholder_url: "http://tautulli:8181", placeholder_key: "Clé API Tautulli" },
  { type: "jellyfin", label: "Jellyfin", Icon: MonitorPlay, color: "#00a4dc", placeholder_url: "http://jellyfin:8096", placeholder_key: "Clé API Jellyfin" },
  { type: "romm", label: "ROMM", Icon: Gamepad2, color: "#34d399", placeholder_url: "http://romm:8080", placeholder_key: "Token API ROMM" },
  { type: "audiobookshelf", label: "Audiobookshelf", Icon: Headphones, color: "#fb923c", placeholder_url: "http://audiobookshelf:13378", placeholder_key: "Token API" },
  { type: "komga", label: "Komga", Icon: Library, color: "#c084fc", placeholder_url: "http://komga:25600", placeholder_key: "email:password" },
  { type: "booklore", label: "Booklore", Icon: BookOpen, color: "#a78bfa", placeholder_url: "http://booklore:8080", placeholder_key: "Token API" },
]

export default function ServiceConfig() {
  const [services, setServices] = useState([])
  const [testing, setTesting] = useState(null)
  const [testResult, setTestResult] = useState({})
  const [adding, setAdding] = useState(null)
  const [form, setForm] = useState({ base_url: "", api_key: "", display_name: "" })

  useEffect(() => {
    api("/services").then(setServices).catch(() => {})
  }, [])

  const testConnection = async (id) => {
    setTesting(id)
    try {
      const res = await api(`/services/${id}/test`, { method: "POST" })
      setTestResult({ ...testResult, [id]: res })
    } catch (e) {
      setTestResult({ ...testResult, [id]: { ok: false, error: e.message } })
    }
    setTesting(null)
  }

  const addService = async (type) => {
    const meta = SERVICE_TYPES.find((s) => s.type === type)
    try {
      const created = await api("/services", {
        method: "POST",
        body: { service_type: type, display_name: form.display_name || meta.label, base_url: form.base_url, api_key: form.api_key },
      })
      setServices([...services, created])
      setAdding(null)
      setForm({ base_url: "", api_key: "", display_name: "" })
    } catch (e) {
      alert(e.message)
    }
  }

  const deleteService = async (id) => {
    await api(`/services/${id}`, { method: "DELETE" })
    setServices(services.filter((s) => s.id !== id))
  }

  const configured = services.map((s) => s.service_type)

  return (
    <div>
      <h2 style={h2}>Connecteurs de services</h2>
      <p style={desc}>Configurez les services de votre homelab pour collecter les données du recap annuel.</p>

      {/* Existing services */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {services.map((svc) => {
          const meta = SERVICE_TYPES.find((s) => s.type === svc.service_type) || {}
          const SvcIcon = meta.Icon || Plug
          const result = testResult[svc.id]
          return (
            <div key={svc.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color || "#E5A00D"}12`, border: `1px solid ${meta.color || "#E5A00D"}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvcIcon size={20} color={meta.color || "#E5A00D"} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Nunito,sans-serif" }}>{svc.display_name}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>{svc.base_url}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {svc.last_test_ok === true && <span style={{ color: "#4ade80", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CircleCheck size={13} /> Connecté</span>}
                  {svc.last_test_ok === false && <span style={{ color: "#f87171", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CircleX size={13} /> Erreur</span>}
                  <button onClick={() => testConnection(svc.id)} disabled={testing === svc.id} style={btnSmall}>
                    {testing === svc.id ? "..." : "Tester"}
                  </button>
                  <button onClick={() => deleteService(svc.id)} style={{ ...btnSmall, color: "#f87171", borderColor: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center" }}><Trash2 size={13} /></button>
                </div>
              </div>
              {result && (
                <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono,monospace",
                  background: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  color: result.ok ? "#4ade80" : "#f87171" }}>
                  {result.ok ? result.details : result.error}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new service */}
      <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, fontFamily: "Nunito,sans-serif", marginBottom: 12 }}>Ajouter un service</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {SERVICE_TYPES.filter((s) => !configured.includes(s.type)).map((s) => (
          <div key={s.type} onClick={() => setAdding(s.type)} style={{
            padding: 16, borderRadius: 12, cursor: "pointer", textAlign: "center",
            background: adding === s.type ? "rgba(229,160,13,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${adding === s.type ? "#E5A00D44" : "rgba(255,255,255,0.06)"}`,
            transition: "all 0.2s",
          }}>
            <div style={{ marginBottom: 8 }}><s.Icon size={28} color={s.color} strokeWidth={1.5} /></div>
            <div style={{ color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Nunito,sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ color: "#E5A00D", fontSize: 14, fontWeight: 700, fontFamily: "Nunito,sans-serif", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            {(() => { const m = SERVICE_TYPES.find((s) => s.type === adding); return m ? <m.Icon size={18} strokeWidth={1.5} /> : null })()}
            {SERVICE_TYPES.find((s) => s.type === adding)?.label}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Nom affiché (optionnel)" style={input} />
            <input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })}
              placeholder={SERVICE_TYPES.find((s) => s.type === adding)?.placeholder_url} style={input} />
            <input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })} type="password"
              placeholder={SERVICE_TYPES.find((s) => s.type === adding)?.placeholder_key} style={input} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => addService(adding)} style={btnAccent}>Ajouter</button>
              <button onClick={() => { setAdding(null); setForm({ base_url: "", api_key: "", display_name: "" }) }} style={btnSmall}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const h2 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6 }
const desc = { color: "rgba(255,255,255,0.35)", fontFamily: "Nunito,sans-serif", fontSize: 13, marginBottom: 24 }
const card = { padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }
const input = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", boxSizing: "border-box", outline: "none" }
const btnSmall = { background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 11, padding: "5px 12px", cursor: "pointer", fontFamily: "Nunito,sans-serif" }
const btnAccent = { background: "#E5A00D", border: "none", borderRadius: 8, color: "#05050e", fontSize: 13, fontWeight: 700, padding: "10px 24px", cursor: "pointer", fontFamily: "Nunito,sans-serif" }
