import { useState, useEffect } from "react"
import { KeyRound, ShieldCheck, Clapperboard, ToggleLeft, ToggleRight, Save } from "lucide-react"
import { api } from "../../services/api"

export default function ConnectionConfig() {
  const [config, setConfig] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api("/admin/config").then(setConfig).catch(() => {})
  }, [])

  const save = async (key, value) => {
    setSaving(true)
    await api("/admin/config", { method: "PATCH", body: { [key]: value } })
    setConfig({ ...config, [key]: value })
    setSaving(false)
  }

  return (
    <div>
      <h2 style={h2}>Connexions & SSO</h2>
      <p style={desc}>Configurez les methodes d'authentification disponibles pour vos utilisateurs.</p>

      <div style={section}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <KeyRound size={18} color="#E5A00D" strokeWidth={1.5} />
          <h3 style={h3}>Authentification locale</h3>
        </div>
        <div style={row}>
          <div style={{ flex: 1 }}>
            <div style={label}>Inscription ouverte</div>
            <div style={hint}>Permettre aux utilisateurs de creer leur propre compte</div>
          </div>
          <button onClick={() => save("allow_registration", !config.allow_registration)} style={{
            ...toggle, background: config.allow_registration ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)",
            color: config.allow_registration ? "#4ade80" : "#f87171",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            {config.allow_registration ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
            {config.allow_registration ? "Active" : "Desactive"}
          </button>
        </div>
      </div>

      <div style={section}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <ShieldCheck size={18} color="#60a5fa" strokeWidth={1.5} />
          <h3 style={h3}>SSO / OIDC</h3>
        </div>
        <p style={{ ...hint, marginBottom: 16 }}>Connectez un provider OIDC (Authentik, Keycloak, Authelia) pour le SSO.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={inputGroup}>
            <label style={inputLabel}>Provider</label>
            <select style={input}>
              <option value="">Selectionner un provider...</option>
              <option value="authentik">Authentik</option>
              <option value="keycloak">Keycloak</option>
              <option value="authelia">Authelia</option>
              <option value="custom">Provider OIDC personnalise</option>
            </select>
          </div>
          <div style={inputGroup}>
            <label style={inputLabel}>URL de l'emetteur (Issuer URL)</label>
            <input placeholder="https://auth.example.com/application/o/wrapparr/" style={input} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={inputGroup}>
              <label style={inputLabel}>Client ID</label>
              <input placeholder="wrapparr-client-id" style={input} />
            </div>
            <div style={inputGroup}>
              <label style={inputLabel}>Client Secret</label>
              <input type="password" placeholder="............" style={input} />
            </div>
          </div>
          <button style={{ ...btnAccent, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
            <Save size={14} strokeWidth={2} /> Enregistrer le provider SSO
          </button>
        </div>
      </div>

      <div style={section}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <Clapperboard size={18} color="#E5A00D" strokeWidth={1.5} />
          <h3 style={h3}>Connexion Plex</h3>
        </div>
        <p style={hint}>Les utilisateurs pourront se connecter avec leur compte Plex.</p>
        <div style={{ ...row, marginTop: 12 }}>
          <div style={{ flex: 1 }}><div style={label}>Auth Plex</div></div>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.06)" }}>
            bientot
          </span>
        </div>
      </div>

      {saving && <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 8, fontFamily: "JetBrains Mono,monospace" }}>sauvegarde...</div>}
    </div>
  )
}

const h2 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6 }
const h3 = { color: "white", fontFamily: "Nunito,sans-serif", fontSize: 16, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontFamily: "Nunito,sans-serif", fontSize: 13, marginBottom: 24 }
const section = { padding: "20px 22px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", marginBottom: 16 }
const row = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "8px 0", flexWrap: "wrap" }
const label = { color: "white", fontSize: 14, fontFamily: "Nunito,sans-serif", fontWeight: 500 }
const hint = { color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "Nunito,sans-serif" }
const toggle = { padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Nunito,sans-serif" }
const inputGroup = { display: "flex", flexDirection: "column", gap: 4 }
const inputLabel = { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase", letterSpacing: "0.05em" }
const input = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", boxSizing: "border-box", outline: "none" }
const btnAccent = { background: "#E5A00D", border: "none", borderRadius: 8, color: "#05050e", fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer", fontFamily: "Nunito,sans-serif" }
