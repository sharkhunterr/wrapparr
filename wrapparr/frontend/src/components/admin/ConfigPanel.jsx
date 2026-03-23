import { useState, useEffect } from "react"
import { Settings, ToggleLeft, ToggleRight } from "lucide-react"
import { api } from "../../services/api"

const CONFIG_FIELDS = [
  { key: "allow_registration", label: "Inscription ouverte", type: "bool" },
  { key: "allow_user_themes", label: "Themes personnels", type: "bool" },
  { key: "allow_user_comparison", label: "Comparaison inter-utilisateurs", type: "bool" },
  { key: "recap_schedule", label: "Planification recap (cron)", type: "text" },
  { key: "max_history_years", label: "Historique max (annees)", type: "number" },
  { key: "public_share_expiry_days", label: "Expiration partage (jours)", type: "number" },
]

export default function ConfigPanel() {
  const [config, setConfig] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api("/admin/config").then(setConfig).catch(() => {})
  }, [])

  const update = async (key, value) => {
    setConfig({ ...config, [key]: value })
    setSaving(true)
    await api("/admin/config", { method: "PATCH", body: { [key]: value } })
    setSaving(false)
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Settings size={22} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Configuration</h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CONFIG_FIELDS.map((f) => (
          <div key={f.key} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
            background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
            gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", fontWeight: 500 }}>{f.label}</span>
            {f.type === "bool" ? (
              <button onClick={() => update(f.key, !config[f.key])} style={{
                padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                fontFamily: "Nunito,sans-serif", display: "flex", alignItems: "center", gap: 6,
                background: config[f.key] ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                color: config[f.key] ? "#4ade80" : "#f87171",
              }}>
                {config[f.key] ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {config[f.key] ? "Active" : "Desactive"}
              </button>
            ) : (
              <input value={config[f.key] ?? ""} onChange={(e) => update(f.key, f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                style={{ width: 130, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 12, fontFamily: "JetBrains Mono,monospace", textAlign: "right", outline: "none" }} />
            )}
          </div>
        ))}
      </div>

      {saving && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8, fontFamily: "JetBrains Mono,monospace" }}>sauvegarde...</div>}
    </div>
  )
}
