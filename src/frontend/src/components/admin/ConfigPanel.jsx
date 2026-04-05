import { useState, useEffect } from "react"
import { Settings, ToggleLeft, ToggleRight, Globe } from "lucide-react"
import { api } from "../../services/api"
import { useI18n, LANG_OPTIONS } from "../../i18n/index.jsx"

const CONFIG_FIELDS = [
  { key: "allow_registration", label: "config.openRegistration", type: "bool" },
  { key: "allow_user_themes", label: "config.userThemes", type: "bool" },
  { key: "allow_user_comparison", label: "config.userComparison", type: "bool" },
  { key: "comparison_default_on", label: "config.comparisonDefault", type: "bool" },
  { key: "recap_schedule", label: "config.recapSchedule", type: "text" },
  { key: "max_history_years", label: "config.maxHistory", type: "number" },
  { key: "public_share_expiry_days", label: "config.shareExpiry", type: "number" },
  { key: "telemetry_enabled", label: "config.telemetryEnabled", type: "bool" },
  { key: "telemetry_idle_timeout_min", label: "config.telemetryTimeout", type: "number" },
]

export default function ConfigPanel() {
  const [config, setConfig] = useState({})
  const [saving, setSaving] = useState(false)
  const { t, lang, setLang } = useI18n()

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
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>{t("config.title")}</h2>
      </div>

      {/* Language selector */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px", borderRadius: 10, marginBottom: 16,
        background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Globe size={15} color="#60a5fa" />
          <span style={{ fontSize: 12, color: "white", fontWeight: 600 }}>Langue / Language</span>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {LANG_OPTIONS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} style={{
              padding: "4px 10px", borderRadius: 6, fontSize: 10, fontWeight: 600, cursor: "pointer",
              background: lang === l.code ? "rgba(96,165,250,0.2)" : "rgba(255,255,255,0.03)",
              border: "1px solid " + (lang === l.code ? "rgba(96,165,250,0.4)" : "rgba(255,255,255,0.06)"),
              color: lang === l.code ? "#60a5fa" : "rgba(255,255,255,0.35)",
              transition: "all .15s",
            }}>{l.label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {CONFIG_FIELDS.map((f) => (
          <div key={f.key} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px",
            background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
            gap: 12, flexWrap: "wrap",
          }}>
            <span style={{ color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", fontWeight: 500 }}>{t(f.label)}</span>
            {f.type === "bool" ? (
              <button onClick={() => update(f.key, !config[f.key])} style={{
                padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12,
                fontFamily: "Nunito,sans-serif", display: "flex", alignItems: "center", gap: 6,
                background: config[f.key] ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                color: config[f.key] ? "#4ade80" : "#f87171",
              }}>
                {config[f.key] ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {config[f.key] ? t("common.enabled") : t("common.disabled")}
              </button>
            ) : (
              <input value={config[f.key] ?? ""} onChange={(e) => update(f.key, f.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                placeholder={f.key.includes("url") ? "https://youtube.com/watch?v=..." : ""}
                style={{ width: f.key.includes("url") ? 260 : 130, padding: "6px 10px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 12, fontFamily: "JetBrains Mono,monospace", textAlign: f.type === "number" ? "right" : "left", outline: "none" }} />
            )}
          </div>
        ))}
      </div>

      {saving && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8, fontFamily: "JetBrains Mono,monospace" }}>sauvegarde...</div>}

      {/* Reset Wrapparr */}
      <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(239,68,68,0.15)" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#f87171", marginBottom: 6 }}>Zone dangereuse</div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 12 }}>
          Reinitialiser Wrapparr supprime toutes les donnees : utilisateurs, services, recaps, themes, configuration.
          Le wizard de configuration initiale sera relance.
        </p>
        <button onClick={async () => {
          if (!confirm("Etes-vous sur de vouloir TOUT supprimer ? Cette action est irreversible.")) return
          if (!confirm("DERNIERE CONFIRMATION : toutes les donnees seront perdues. Continuer ?")) return
          try {
            await api("/admin/reset", { method: "POST", body: { confirm: "RESET_WRAPPARR" } })
            window.location.href = "/"
          } catch (e) { alert(e.message) }
        }} style={{
          padding: "8px 20px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)",
          background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 12, fontWeight: 700,
          cursor: "pointer",
        }}>
          Reinitialiser Wrapparr
        </button>
      </div>
    </div>
  )
}
