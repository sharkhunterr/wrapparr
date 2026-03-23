import { useState, useEffect } from "react"
import { Users2, ArrowRightLeft, Save, CheckCircle2 } from "lucide-react"
import { api } from "../../services/api"

export default function UserMapping() {
  const [users, setUsers] = useState([])
  const [services, setServices] = useState([])
  const [mappings, setMappings] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    Promise.all([
      api("/admin/users"),
      api("/services"),
      api("/admin/mapping"),
    ]).then(([u, s, m]) => {
      setUsers(u)
      setServices(s)
      setMappings(m)
    }).catch(() => {})
  }, [])

  const serviceTypes = [...new Set(services.map((s) => s.service_type))]

  const updateMapping = (userId, serviceType, value) => {
    setMappings((prev) => ({
      ...prev,
      [userId]: { ...(prev[userId] || {}), [serviceType]: value },
    }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await api("/admin/mapping", { method: "PUT", body: mappings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      alert(e.message)
    }
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Users2 size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Mapping utilisateurs</h2>
      </div>
      <p style={desc}>
        Associez chaque utilisateur Wrapparr a son nom d'utilisateur sur chaque service. Le recap utilisera ces correspondances pour collecter les bonnes donnees.
      </p>

      {serviceTypes.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.2)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          <ArrowRightLeft size={28} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 10 }} />
          <div>Aucun service configure. Ajoutez des connecteurs d'abord.</div>
        </div>
      )}

      {serviceTypes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} style={{
              padding: "16px 18px", borderRadius: 12,
              background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ color: "white", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{u.display_name}</div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "JetBrains Mono,monospace", marginBottom: 12 }}>{u.email}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 8 }}>
                {serviceTypes.map((st) => (
                  <div key={st} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <label style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", letterSpacing: "0.05em" }}>{st}</label>
                    <input
                      value={mappings[u.id]?.[st] || ""}
                      onChange={(e) => updateMapping(u.id, st, e.target.value)}
                      placeholder={`Username ${st}`}
                      style={{
                        padding: "8px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.025)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length > 0 && serviceTypes.length > 0 && (
        <button onClick={save} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 20,
          padding: "10px 20px", borderRadius: 8, border: "none", cursor: saving ? "wait" : "pointer",
          background: saved ? "#22c55e" : "#E5A00D", color: saved ? "white" : "#05050e",
          fontSize: 13, fontWeight: 700, transition: "background 0.3s",
        }}>
          {saved ? <><CheckCircle2 size={14} /> Enregistre</> : saving ? "Sauvegarde..." : <><Save size={14} /> Enregistrer le mapping</>}
        </button>
      )}
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }
