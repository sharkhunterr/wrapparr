import { useState, useEffect } from "react"
import { KeyRound, ShieldCheck, Clapperboard, ToggleLeft, ToggleRight, Save, Trash2, Plus, Pencil, Plug, CheckCircle, XCircle, Copy } from "lucide-react"
import { api } from "../../services/api"

export default function ConnectionConfig() {
  const [config, setConfig] = useState({})
  const [saving, setSaving] = useState(false)
  const [providers, setProviders] = useState([])
  const [editingProvider, setEditingProvider] = useState(null)
  const [providerForm, setProviderForm] = useState({ name: "", issuer_url: "", client_id: "", client_secret: "" })
  const [providerError, setProviderError] = useState("")
  const [testResult, setTestResult] = useState(null)
  const [testedProviderId, setTestedProviderId] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    api("/admin/config").then(setConfig).catch(() => {})
    loadProviders()
  }, [])

  const loadProviders = () => {
    api("/admin/oidc-providers").then(setProviders).catch(() => {})
  }

  const save = async (key, value) => {
    setSaving(true)
    await api("/admin/config", { method: "PATCH", body: { [key]: value } })
    setConfig({ ...config, [key]: value })
    setSaving(false)
  }

  const resetForm = () => {
    setProviderForm({ name: "", issuer_url: "", client_id: "", client_secret: "" })
    setEditingProvider(null)
    setProviderError("")
    setTestResult(null)
  }

  const saveProvider = async () => {
    setProviderError("")
    setTestResult(null)
    if (!providerForm.name || !providerForm.issuer_url || !providerForm.client_id) {
      setProviderError("Nom, Issuer URL et Client ID sont requis")
      return
    }
    setSaving(true)
    try {
      if (editingProvider) {
        const body = { ...providerForm }
        if (!body.client_secret) delete body.client_secret
        await api(`/admin/oidc-providers/${editingProvider}`, { method: "PATCH", body })
      } else {
        if (!providerForm.client_secret) {
          setProviderError("Client Secret est requis pour un nouveau provider")
          setSaving(false)
          return
        }
        await api("/admin/oidc-providers", { method: "POST", body: providerForm })
      }
      resetForm()
      loadProviders()
    } catch (err) {
      setProviderError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteProvider = async (id) => {
    if (!confirm("Supprimer ce provider SSO ?")) return
    await api(`/admin/oidc-providers/${id}`, { method: "DELETE" })
    if (editingProvider === id) resetForm()
    loadProviders()
  }

  const startEdit = (p) => {
    setEditingProvider(p.id)
    setProviderForm({ name: p.name, issuer_url: p.issuer_url, client_id: p.client_id, client_secret: "" })
    setProviderError("")
    setTestResult(null)
  }

  const toggleProvider = async (p) => {
    await api(`/admin/oidc-providers/${p.id}`, { method: "PATCH", body: { is_active: !p.is_active } })
    loadProviders()
  }

  const testProvider = async (id) => {
    setTesting(true)
    setTestResult(null)
    setTestedProviderId(id)
    try {
      const res = await api(`/admin/oidc-providers/${id}/test`, { method: "POST" })
      setTestResult(res)
    } catch (err) {
      setTestResult({ status: "error", detail: err.message })
    } finally {
      setTesting(false)
    }
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

        {/* Existing providers */}
        {providers.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
            {providers.map(p => (
              <div key={p.id} style={{
                padding: "12px 14px", borderRadius: 10,
                background: editingProvider === p.id ? "rgba(96,165,250,0.06)" : "rgba(255,255,255,0.03)",
                border: editingProvider === p.id ? "1px solid rgba(96,165,250,0.2)" : "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: 14, fontFamily: "Nunito,sans-serif", fontWeight: 600 }}>{p.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "JetBrains Mono,monospace", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.issuer_url}</div>
                    <CallbackUrl providerId={p.id} />
                  </div>
                  <button onClick={() => toggleProvider(p)} style={{
                    ...miniBtn, flexShrink: 0,
                    background: p.is_active ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.08)",
                    color: p.is_active ? "#4ade80" : "#f87171",
                  }}>
                    {p.is_active ? "Actif" : "Inactif"}
                  </button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => testProvider(p.id)} disabled={testing} style={{ ...miniBtn, background: "rgba(96,165,250,0.1)", color: "#60a5fa" }} title="Tester la connexion">
                    <Plug size={12} /> Tester
                  </button>
                  <button onClick={() => startEdit(p)} style={{ ...miniBtn, background: "rgba(229,160,13,0.1)", color: "#E5A00D" }} title="Modifier">
                    <Pencil size={12} /> Modifier
                  </button>
                  <button onClick={() => deleteProvider(p.id)} style={{ ...miniBtn, background: "rgba(239,68,68,0.08)", color: "#f87171" }} title="Supprimer">
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>

                {/* Test result inline */}
                {testResult && testedProviderId === p.id && (
                  <div style={{
                    marginTop: 8, padding: "8px 10px", borderRadius: 8,
                    background: testResult.status === "ok" ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                    border: `1px solid ${testResult.status === "ok" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}`,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {testResult.status === "ok"
                        ? <CheckCircle size={14} color="#4ade80" />
                        : <XCircle size={14} color="#f87171" />}
                      <span style={{ color: testResult.status === "ok" ? "#4ade80" : "#f87171", fontSize: 12, fontFamily: "Nunito,sans-serif" }}>
                        {testResult.status === "ok"
                          ? <>Connexion reussie — issuer: {testResult.issuer}{!testResult.ssl_verified && <span style={{ color: "#fbbf24" }}> (SSL non verifie)</span>}</>
                          : testResult.detail}
                      </span>
                    </div>
                    {testResult.tried && (
                      <div style={{ marginTop: 6, fontSize: 10, fontFamily: "JetBrains Mono,monospace", color: "rgba(255,255,255,0.25)", lineHeight: 1.6 }}>
                        {testResult.tried.map((t, i) => <div key={i}>{t}</div>)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Provider form */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 10,
          padding: editingProvider ? "16px" : 0,
          borderRadius: editingProvider ? 10 : 0,
          background: editingProvider ? "rgba(96,165,250,0.04)" : "transparent",
          border: editingProvider ? "1px solid rgba(96,165,250,0.12)" : "none",
        }}>
          {editingProvider && (
            <div style={{ color: "#60a5fa", fontSize: 12, fontWeight: 700, fontFamily: "Nunito,sans-serif", marginBottom: 4 }}>
              Modification du provider
            </div>
          )}
          <div style={inputGroup}>
            <label style={inputLabel}>Nom du provider (affiche sur le bouton de connexion)</label>
            <input
              placeholder="Authentik, Keycloak, Authelia..."
              value={providerForm.name}
              onChange={e => setProviderForm({ ...providerForm, name: e.target.value })}
              style={input}
            />
          </div>
          <div style={inputGroup}>
            <label style={inputLabel}>URL de l'emetteur (Issuer URL)</label>
            <input
              placeholder="https://auth.example.com/application/o/wrapparr/"
              value={providerForm.issuer_url}
              onChange={e => setProviderForm({ ...providerForm, issuer_url: e.target.value })}
              style={input}
            />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div style={inputGroup}>
              <label style={inputLabel}>Client ID</label>
              <input
                placeholder="wrapparr-client-id"
                value={providerForm.client_id}
                onChange={e => setProviderForm({ ...providerForm, client_id: e.target.value })}
                style={input}
              />
            </div>
            <div style={inputGroup}>
              <label style={inputLabel}>Client Secret</label>
              <input
                type="password"
                placeholder={editingProvider ? "(inchange si vide)" : "............"}
                value={providerForm.client_secret}
                onChange={e => setProviderForm({ ...providerForm, client_secret: e.target.value })}
                style={input}
              />
            </div>
          </div>

          {providerError && (
            <div style={{
              background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 8, padding: "8px 12px", color: "#f87171", fontSize: 12,
            }}>
              {providerError}
            </div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={saveProvider} disabled={saving} style={{ ...btnAccent, display: "flex", alignItems: "center", gap: 8, width: "fit-content" }}>
              {editingProvider ? <Save size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
              {editingProvider ? "Mettre a jour" : "Ajouter le provider SSO"}
            </button>
            {editingProvider && (
              <button onClick={resetForm} style={{ ...btnSecondary, width: "fit-content" }}>Annuler</button>
            )}
          </div>
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

function CallbackUrl({ providerId }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/api/v1/auth/sso/${providerId}/callback`

  const copy = () => {
    try {
      const ta = document.createElement("textarea")
      ta.value = url
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <span style={{ color: "rgba(255,255,255,0.15)", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}>Redirect URI :</span>
      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontFamily: "JetBrains Mono,monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{url}</span>
      <button onClick={copy} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, flexShrink: 0, display: "flex", alignItems: "center" }} title="Copier l'URL">
        <Copy size={11} color={copied ? "#4ade80" : "rgba(255,255,255,0.3)"} />
      </button>
      {copied && <span style={{ color: "#4ade80", fontSize: 10, fontFamily: "Nunito,sans-serif" }}>copie !</span>}
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
const btnSecondary = { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "rgba(255,255,255,0.5)", fontSize: 13, fontWeight: 600, padding: "10px 20px", cursor: "pointer", fontFamily: "Nunito,sans-serif" }
const miniBtn = { padding: "5px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontFamily: "Nunito,sans-serif", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }
