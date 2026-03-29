import { useState } from "react"
import { setAccessToken } from "../../services/api"

const API = "/api/v1/setup"

async function post(path, body) {
  const res = await fetch(API + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `Erreur ${res.status}`)
  }
  return res.json()
}

const STEPS = ["Service", "Utilisateurs", "Authentification", "Admin", "Terminé"]

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")

  // Step 1 — Service
  const [serviceType, setServiceType] = useState("tautulli")
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [tested, setTested] = useState(false)
  const [testing, setTesting] = useState(false)

  // Step 2 — Users
  const [serviceUsers, setServiceUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [fetching, setFetching] = useState(false)

  // Step 3 — Auth
  const [authMethod, setAuthMethod] = useState("password")

  // Step 4 — Admin
  const [adminEmail, setAdminEmail] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [adminPassword2, setAdminPassword2] = useState("")
  const [adminName, setAdminName] = useState("")

  const [finishing, setFinishing] = useState(false)

  const testConnection = async () => {
    setTesting(true); setError("")
    try {
      const res = await post("/test-service", { service_type: serviceType, base_url: baseUrl, api_key: apiKey })
      if (res.ok) { setTested(true); setError("") }
      else setError(res.error || "Connexion echouee")
    } catch (e) { setError(e.message) }
    setTesting(false)
  }

  const fetchUsers = async () => {
    setFetching(true); setError("")
    try {
      const users = await post("/fetch-users", { service_type: serviceType, base_url: baseUrl, api_key: apiKey })
      setServiceUsers(users)
      setSelectedUsers(users.map(u => ({ service_username: u.name, display_name: u.name, role: "user" })))
    } catch (e) { setError(e.message) }
    setFetching(false)
  }

  const finish = async () => {
    if (adminPassword !== adminPassword2) { setError("Les mots de passe ne correspondent pas"); return }
    if (!adminPassword || adminPassword.length < 4) { setError("Le mot de passe doit faire au moins 4 caracteres"); return }
    if (!adminEmail) { setError("Email requis"); return }
    setFinishing(true); setError("")
    try {
      const res = await post("/finish", {
        service_type: serviceType, service_base_url: baseUrl, service_api_key: apiKey,
        service_display_name: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
        users: selectedUsers, auth_method: authMethod,
        admin_email: adminEmail, admin_password: adminPassword, admin_display_name: adminName || "Admin",
      })
      setAccessToken(res.access_token)
      setStep(4)
      setTimeout(() => onComplete(), 2000)
    } catch (e) { setError(e.message) }
    setFinishing(false)
  }

  const goNext = () => {
    if (step === 1 && serviceUsers.length === 0) fetchUsers()
    setStep(s => s + 1); setError("")
  }
  const goBack = () => { setStep(s => s - 1); setError("") }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#05050e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
      <div style={{ maxWidth: 480, width: "90%", padding: "30px 28px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>WRAP<span style={{ color: "#E5A00D" }}>PARR</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginTop: 4 }}>CONFIGURATION INITIALE</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: i === step ? 24 : 8, height: 8, borderRadius: 4,
                background: i <= step ? "#E5A00D" : "rgba(255,255,255,0.1)",
                transition: "all 0.3s ease",
              }} />
            </div>
          ))}
        </div>

        {/* Step title */}
        <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{STEPS[step]}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
          {step === 0 && "Connectez votre serveur media"}
          {step === 1 && "Selectionnez les utilisateurs a importer"}
          {step === 2 && "Choisissez le mode d'authentification"}
          {step === 3 && "Configurez le compte administrateur"}
          {step === 4 && "Configuration terminee !"}
        </div>

        {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12, marginBottom: 14 }}>{error}</div>}

        {/* ═══ Step 0: Service ═══ */}
        {step === 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={lbl}>Type de service</label>
              <select value={serviceType} onChange={e => { setServiceType(e.target.value); setTested(false) }} style={inp}>
                <option value="tautulli">Tautulli (Plex)</option>
                <option value="jellyfin">Jellyfin</option>
              </select>
            </div>
            <div>
              <label style={lbl}>URL du serveur</label>
              <input value={baseUrl} onChange={e => { setBaseUrl(e.target.value); setTested(false) }} placeholder="http://192.168.1.x:8181" style={inp} />
            </div>
            <div>
              <label style={lbl}>Cle API</label>
              <input value={apiKey} onChange={e => { setApiKey(e.target.value); setTested(false) }} placeholder="Votre cle API" style={inp} type="password" />
            </div>
            <button onClick={testConnection} disabled={testing || !baseUrl || !apiKey} style={{ ...btn, background: tested ? "#22c55e" : "#E5A00D", opacity: testing ? 0.6 : 1 }}>
              {testing ? "Test en cours..." : tested ? "✓ Connexion reussie" : "Tester la connexion"}
            </button>
          </div>
        )}

        {/* ═══ Step 1: Users ═══ */}
        {step === 1 && (
          <div>
            {fetching ? (
              <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>Recuperation des utilisateurs...</div>
            ) : serviceUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <button onClick={fetchUsers} style={btn}>Charger les utilisateurs</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                {serviceUsers.map((u, i) => {
                  const sel = selectedUsers.find(s => s.service_username === u.name)
                  const isSelected = !!sel
                  return (
                    <div key={u.id} style={{
                      display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                      borderRadius: 8, background: isSelected ? "rgba(229,160,13,0.06)" : "rgba(255,255,255,0.02)",
                      border: "1px solid " + (isSelected ? "rgba(229,160,13,0.2)" : "rgba(255,255,255,0.05)"),
                    }}>
                      <input type="checkbox" checked={isSelected} onChange={() => {
                        if (isSelected) setSelectedUsers(selectedUsers.filter(s => s.service_username !== u.name))
                        else setSelectedUsers([...selectedUsers, { service_username: u.name, display_name: u.name, role: "user" }])
                      }} style={{ accentColor: "#E5A00D" }} />
                      <input value={sel?.display_name || u.name} disabled={!isSelected}
                        onChange={e => setSelectedUsers(selectedUsers.map(s => s.service_username === u.name ? { ...s, display_name: e.target.value } : s))}
                        style={{ ...inp, flex: 1, opacity: isSelected ? 1 : 0.3, padding: "4px 8px" }} />
                      <select value={sel?.role || "user"} disabled={!isSelected}
                        onChange={e => setSelectedUsers(selectedUsers.map(s => s.service_username === u.name ? { ...s, role: e.target.value } : s))}
                        style={{ ...inp, width: 80, opacity: isSelected ? 1 : 0.3, padding: "4px 6px", fontSize: 10 }}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ═══ Step 2: Auth Method ═══ */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { value: "password", label: "Mot de passe", desc: "Chaque utilisateur se connecte avec email + mot de passe", icon: "🔑" },
              { value: "sso", label: "SSO (bientot)", desc: "Connexion via un fournisseur externe (OIDC)", icon: "🔗", disabled: true },
              { value: "plex", label: "Plex Auth (bientot)", desc: "Connexion avec le compte Plex", icon: "🎬", disabled: true },
            ].map(opt => (
              <button key={opt.value} disabled={opt.disabled}
                onClick={() => !opt.disabled && setAuthMethod(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  borderRadius: 8, cursor: opt.disabled ? "not-allowed" : "pointer", textAlign: "left",
                  background: authMethod === opt.value ? "rgba(229,160,13,0.08)" : "rgba(255,255,255,0.02)",
                  border: "1px solid " + (authMethod === opt.value ? "rgba(229,160,13,0.3)" : "rgba(255,255,255,0.06)"),
                  opacity: opt.disabled ? 0.4 : 1,
                }}>
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: authMethod === opt.value ? "#E5A00D" : "white" }}>{opt.label}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{opt.desc}</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ═══ Step 3: Admin Account ═══ */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <label style={lbl}>Nom d'affichage</label>
              <input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Admin" style={inp} />
            </div>
            <div>
              <label style={lbl}>Email</label>
              <input value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@example.com" style={inp} type="email" />
            </div>
            <div>
              <label style={lbl}>Mot de passe</label>
              <input value={adminPassword} onChange={e => setAdminPassword(e.target.value)} style={inp} type="password" />
            </div>
            <div>
              <label style={lbl}>Confirmer le mot de passe</label>
              <input value={adminPassword2} onChange={e => setAdminPassword2(e.target.value)} style={inp} type="password" />
            </div>
          </div>
        )}

        {/* ═══ Step 4: Done ═══ */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E5A00D" }}>Configuration terminee !</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? "s" : ""} importe{selectedUsers.length > 1 ? "s" : ""} · Redirection...
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 4 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
            {step > 0 ? (
              <button onClick={goBack} style={{ ...btn, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", flex: 1 }}>Retour</button>
            ) : <div />}
            {step < 3 ? (
              <button onClick={goNext} disabled={step === 0 && !tested} style={{ ...btn, flex: 1, opacity: step === 0 && !tested ? 0.4 : 1 }}>Suivant</button>
            ) : (
              <button onClick={finish} disabled={finishing} style={{ ...btn, flex: 1, opacity: finishing ? 0.6 : 1 }}>
                {finishing ? "Configuration..." : "Terminer"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const lbl = { display: "block", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }
const inp = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif", outline: "none", boxSizing: "border-box" }
const btn = { padding: "10px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#E5A00D", color: "#000", fontSize: 13, fontWeight: 700, fontFamily: "Nunito,sans-serif" }
