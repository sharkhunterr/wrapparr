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

const STEPS = ["Bienvenue", "Service media", "Utilisateurs", "Compte admin", "Services optionnels", "Authentification", "Termine"]

const OPTIONAL_SERVICES = [
  { type: "tmdb", label: "TMDB", icon: "🎬", color: "#01b4e4", desc: "Enrichit les films avec affiches, budgets, notes, acteurs, realisateurs, pays", placeholder_url: "https://api.themoviedb.org/3", placeholder_key: "Cle API TMDB (v3)", fixedUrl: true },
  { type: "overseerr", label: "Overseerr", icon: "📋", color: "#6366f1", desc: "Ajoute les demandes media au recap : ce que tu as demande, regarde ou non", placeholder_url: "http://overseerr:5055", placeholder_key: "Cle API Overseerr" },
]

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0)
  const [error, setError] = useState("")

  // Step 1 — Service media
  const [serviceType, setServiceType] = useState("tautulli")
  const [baseUrl, setBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [tested, setTested] = useState(false)
  const [testing, setTesting] = useState(false)

  // Step 2 — Users (from service)
  const [serviceUsers, setServiceUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [fetching, setFetching] = useState(false)

  // Step 3 — Admin credentials
  const [adminPassword, setAdminPassword] = useState("")
  const [adminPassword2, setAdminPassword2] = useState("")
  const [adminEmail, setAdminEmail] = useState("")

  // Step 4 — Optional services
  const [optServices, setOptServices] = useState({})
  const [optTesting, setOptTesting] = useState({})
  const [optTested, setOptTested] = useState({})

  // Step 5 — Auth method
  const [authMethod, setAuthMethod] = useState("password")

  const [finishing, setFinishing] = useState(false)

  const admins = selectedUsers.filter(u => u.role === "admin")
  const hasAdmin = admins.length > 0

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
      setSelectedUsers(users.map(u => ({ service_username: u.name, display_name: u.name, email: u.email || "", role: "user" })))
    } catch (e) { setError(e.message) }
    setFetching(false)
  }

  const testOptService = async (svc) => {
    const cfg = optServices[svc.type]
    if (!cfg?.api_key) return
    setOptTesting(p => ({ ...p, [svc.type]: true }))
    try {
      const res = await post("/test-service", {
        service_type: svc.type,
        base_url: svc.fixedUrl ? svc.placeholder_url : (cfg.base_url || svc.placeholder_url),
        api_key: cfg.api_key,
      })
      setOptTested(p => ({ ...p, [svc.type]: res.ok ? "ok" : res.error || "Erreur" }))
    } catch (e) {
      setOptTested(p => ({ ...p, [svc.type]: e.message }))
    }
    setOptTesting(p => ({ ...p, [svc.type]: false }))
  }

  const finish = async () => {
    if (!hasAdmin) { setError("Selectionnez au moins un administrateur"); return }
    if (adminPassword !== adminPassword2) { setError("Les mots de passe ne correspondent pas"); return }
    if (!adminPassword || adminPassword.length < 4) { setError("Le mot de passe doit faire au moins 4 caracteres"); return }
    if (!adminEmail) { setError("Email requis pour le compte admin"); return }

    // Build optional services list
    const optional_services = []
    for (const svc of OPTIONAL_SERVICES) {
      const cfg = optServices[svc.type]
      if (cfg?.api_key && optTested[svc.type] === "ok") {
        optional_services.push({
          service_type: svc.type,
          base_url: svc.fixedUrl ? svc.placeholder_url : (cfg.base_url || svc.placeholder_url),
          api_key: cfg.api_key,
          display_name: svc.label,
        })
      }
    }

    setFinishing(true); setError("")
    try {
      const firstAdmin = admins[0]
      const res = await post("/finish", {
        service_type: serviceType, service_base_url: baseUrl, service_api_key: apiKey,
        service_display_name: serviceType.charAt(0).toUpperCase() + serviceType.slice(1),
        users: selectedUsers, auth_method: authMethod,
        admin_email: adminEmail, admin_password: adminPassword,
        admin_display_name: firstAdmin.display_name,
        optional_services,
      })
      setAccessToken(res.access_token)
      setStep(6)
      setTimeout(() => onComplete(), 2500)
    } catch (e) { setError(e.message) }
    setFinishing(false)
  }

  const goNext = () => {
    if (step === 1 && !tested) return
    if (step === 2 && !hasAdmin) { setError("Definissez au moins un utilisateur comme admin"); return }
    if (step === 3) {
      if (!adminEmail) { setError("Email requis"); return }
      if (!adminPassword || adminPassword.length < 4) { setError("Le mot de passe doit faire au moins 4 caracteres"); return }
      if (adminPassword !== adminPassword2) { setError("Les mots de passe ne correspondent pas"); return }
    }
    if (step === 1) fetchUsers()
    setStep(s => s + 1); setError("")
  }
  const goBack = () => { setStep(s => s - 1); setError("") }

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "#05050e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
      <div style={{ maxWidth: 520, width: "92%", padding: "30px 28px", borderRadius: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(14px)" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>WRAP<span style={{ color: "#E5A00D" }}>PARR</span></div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", marginTop: 4 }}>CONFIGURATION INITIALE</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", gap: 3, marginBottom: 24, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              width: i === step ? 22 : 7, height: 7, borderRadius: 4,
              background: i < step ? "#22c55e" : i === step ? "#E5A00D" : "rgba(255,255,255,0.08)",
              transition: "all 0.3s ease",
            }} />
          ))}
        </div>

        {/* Step title */}
        {step > 0 && step < 6 && <>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{STEPS[step]}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 16 }}>
            {step === 1 && "Connectez votre serveur media principal"}
            {step === 2 && "Selectionnez les utilisateurs et definissez l'admin"}
            {step === 3 && "Definissez les identifiants de l'admin"}
            {step === 4 && "Enrichissez votre recap avec des services additionnels"}
            {step === 5 && "Comment les utilisateurs se connecteront-ils ?"}
          </div>
        </>}

        {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12, marginBottom: 14 }}>{error}</div>}

        {/* ═══ Step 0: Welcome ═══ */}
        {step === 0 && (
          <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
            <div style={{ fontSize: 52, marginBottom: 16, filter: "drop-shadow(0 0 20px rgba(229,160,13,0.4))" }}>🎬</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "white", marginBottom: 8 }}>
              Bienvenue sur <span style={{ color: "#E5A00D" }}>Wrapparr</span>
            </h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, maxWidth: 380, margin: "0 auto 20px" }}>
              Wrapparr genere un recap annuel de vos habitudes media, inspire de Spotify Wrapped. Films, series, jeux, livres — tout y passe.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "left", maxWidth: 340, margin: "0 auto" }}>
              {[
                { icon: "📡", text: "Connectez votre serveur media (Tautulli, Jellyfin...)" },
                { icon: "👥", text: "Importez vos utilisateurs automatiquement" },
                { icon: "🎬", text: "Enrichissez avec TMDB, Overseerr..." },
                { icon: "🔐", text: "Configurez l'authentification" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{item.text}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 16 }}>
              Cette configuration prend environ 2 minutes
            </div>
          </div>
        )}

        {/* ═══ Step 1: Service media ═══ */}
        {step === 1 && (
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

        {/* ═══ Step 2: Users ═══ */}
        {step === 2 && (
          <div>
            {fetching ? (
              <div style={{ textAlign: "center", padding: 20, color: "rgba(255,255,255,0.4)" }}>Recuperation des utilisateurs...</div>
            ) : serviceUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20 }}>
                <button onClick={fetchUsers} style={btn}>Charger les utilisateurs</button>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                  Cochez les utilisateurs a importer. L'utilisateur marque "Admin" sera le compte administrateur.
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 320, overflowY: "auto" }}>
                  {serviceUsers.map((u) => {
                    const sel = selectedUsers.find(s => s.service_username === u.name)
                    const isSelected = !!sel
                    const isAdmin = sel?.role === "admin"
                    return (
                      <div key={u.id} style={{
                        display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                        borderRadius: 8,
                        background: isAdmin ? "rgba(229,160,13,0.08)" : isSelected ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.01)",
                        border: "1px solid " + (isAdmin ? "rgba(229,160,13,0.25)" : isSelected ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"),
                      }}>
                        <input type="checkbox" checked={isSelected} onChange={() => {
                          if (isSelected) setSelectedUsers(selectedUsers.filter(s => s.service_username !== u.name))
                          else setSelectedUsers([...selectedUsers, { service_username: u.name, display_name: u.name, email: u.email || "", role: "user" }])
                        }} style={{ accentColor: "#E5A00D" }} />
                        <div style={{ flex: 1, minWidth: 100 }}>
                          <input value={sel?.display_name || u.name} disabled={!isSelected}
                            onChange={e => setSelectedUsers(selectedUsers.map(s => s.service_username === u.name ? { ...s, display_name: e.target.value } : s))}
                            style={{ ...inp, opacity: isSelected ? 1 : 0.3, padding: "4px 8px", fontSize: 12 }} />
                          {u.email && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 2, paddingLeft: 8 }}>{u.email}</div>}
                        </div>
                        <button disabled={!isSelected} onClick={() => {
                          const newUsers = selectedUsers.map(s => s.service_username === u.name
                            ? { ...s, role: s.role === "admin" ? "user" : "admin" }
                            : s.role === "admin" && s.service_username !== u.name ? { ...s, role: "user" } : s
                          )
                          setSelectedUsers(newUsers)
                          const newAdmin = newUsers.find(s => s.role === "admin")
                          if (newAdmin?.email && !adminEmail) setAdminEmail(newAdmin.email)
                        }} style={{
                          padding: "3px 10px", borderRadius: 6, border: "none", cursor: isSelected ? "pointer" : "default",
                          fontSize: 10, fontWeight: 700, fontFamily: "Nunito,sans-serif",
                          background: isAdmin ? "#E5A00D" : "rgba(255,255,255,0.06)",
                          color: isAdmin ? "#000" : "rgba(255,255,255,0.3)",
                          opacity: isSelected ? 1 : 0.3,
                        }}>
                          {isAdmin ? "★ Admin" : "User"}
                        </button>
                      </div>
                    )
                  })}
                </div>
                {hasAdmin && (
                  <div style={{ marginTop: 8, fontSize: 10, color: "#E5A00D" }}>
                    Admin : {admins[0].display_name}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ═══ Step 3: Admin credentials ═══ */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(229,160,13,0.06)", border: "1px solid rgba(229,160,13,0.15)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#E5A00D" }}>★ {admins[0]?.display_name || "Admin"}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Definissez les identifiants de connexion pour ce compte</div>
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

        {/* ═══ Step 4: Optional services ═══ */}
        {step === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              Ces services sont optionnels mais enrichissent considerablement votre recap. Vous pourrez les configurer plus tard dans l'admin.
            </div>
            {OPTIONAL_SERVICES.map(svc => {
              const cfg = optServices[svc.type] || {}
              const isTesting = optTesting[svc.type]
              const testResult = optTested[svc.type]
              const isOk = testResult === "ok"
              const isExpanded = !!cfg._expanded

              return (
                <div key={svc.type} style={{
                  borderRadius: 10, overflow: "hidden",
                  border: "1px solid " + (isOk ? svc.color + "40" : "rgba(255,255,255,0.06)"),
                  background: isOk ? svc.color + "08" : "rgba(255,255,255,0.02)",
                  transition: "all 0.2s ease",
                }}>
                  <button onClick={() => setOptServices(p => ({ ...p, [svc.type]: { ...cfg, _expanded: !isExpanded } }))} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    background: "none", border: "none", cursor: "pointer", textAlign: "left",
                  }}>
                    <span style={{ fontSize: 22 }}>{svc.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isOk ? svc.color : "white" }}>
                        {svc.label}
                        {isOk && <span style={{ fontSize: 10, marginLeft: 6, color: "#22c55e" }}>✓ connecte</span>}
                      </div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{svc.desc}</div>
                    </div>
                    <span style={{ fontSize: 14, color: "rgba(255,255,255,0.2)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                  </button>
                  {isExpanded && (
                    <div style={{ padding: "0 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                      {!svc.fixedUrl && (
                        <div>
                          <label style={lbl}>URL</label>
                          <input value={cfg.base_url || ""} onChange={e => setOptServices(p => ({
                            ...p, [svc.type]: { ...cfg, base_url: e.target.value, _expanded: true }
                          }))} placeholder={svc.placeholder_url} style={inp} />
                        </div>
                      )}
                      <div>
                        <label style={lbl}>{svc.type === "tmdb" ? "Cle API" : "Cle API"}</label>
                        <input value={cfg.api_key || ""} onChange={e => {
                          setOptServices(p => ({ ...p, [svc.type]: { ...cfg, api_key: e.target.value, _expanded: true } }))
                          setOptTested(p => ({ ...p, [svc.type]: undefined }))
                        }} placeholder={svc.placeholder_key} style={inp} type="password" />
                      </div>
                      <button onClick={() => testOptService(svc)} disabled={isTesting || !cfg.api_key} style={{
                        ...btn, fontSize: 12, padding: "8px 16px",
                        background: isOk ? "#22c55e" : svc.color,
                        opacity: isTesting || !cfg.api_key ? 0.5 : 1,
                      }}>
                        {isTesting ? "Test..." : isOk ? "✓ Connecte" : "Tester"}
                      </button>
                      {testResult && testResult !== "ok" && (
                        <div style={{ fontSize: 11, color: "#f87171" }}>{testResult}</div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ═══ Step 5: Auth Method ═══ */}
        {step === 5 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
              Comment les autres utilisateurs se connecteront-ils a Wrapparr ?
            </div>
            {[
              { value: "password", label: "Mot de passe", desc: "L'admin definit un mot de passe pour chaque utilisateur", icon: "🔑" },
              { value: "sso", label: "SSO / OIDC", desc: "Connexion via un fournisseur externe (configurable dans l'admin)", icon: "🔗" },
              { value: "plex", label: "Plex Auth", desc: "Les utilisateurs se connectent avec leur compte Plex", icon: "🎬" },
              { value: "later", label: "Configurer plus tard", desc: "Passer cette etape et configurer l'authentification dans l'admin", icon: "⏭️" },
            ].map(opt => (
              <button key={opt.value}
                onClick={() => setAuthMethod(opt.value)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                  borderRadius: 8, cursor: "pointer", textAlign: "left",
                  background: authMethod === opt.value ? "rgba(229,160,13,0.08)" : "rgba(255,255,255,0.02)",
                  border: "1px solid " + (authMethod === opt.value ? "rgba(229,160,13,0.3)" : "rgba(255,255,255,0.06)"),
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

        {/* ═══ Step 6: Done ═══ */}
        {step === 6 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎬</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E5A00D" }}>Configuration terminee !</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              {selectedUsers.length} utilisateur{selectedUsers.length > 1 ? "s" : ""} importe{selectedUsers.length > 1 ? "s" : ""}
              {Object.values(optTested).filter(v => v === "ok").length > 0 && (
                <> · {Object.values(optTested).filter(v => v === "ok").length} service{Object.values(optTested).filter(v => v === "ok").length > 1 ? "s" : ""} optionnel{Object.values(optTested).filter(v => v === "ok").length > 1 ? "s" : ""}</>
              )}
              <span style={{ display: "block", marginTop: 4 }}>Redirection...</span>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step < 6 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, gap: 10 }}>
            {step > 0 ? (
              <button onClick={goBack} style={{ ...btn, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", flex: 1 }}>Retour</button>
            ) : <div />}
            {step === 0 ? (
              <button onClick={goNext} style={{ ...btn, flex: 1 }}>Commencer</button>
            ) : step < 5 ? (
              <button onClick={goNext} disabled={step === 1 && !tested} style={{
                ...btn, flex: 1,
                opacity: (step === 1 && !tested) || (step === 2 && !hasAdmin) ? 0.4 : 1,
              }}>
                {step === 4 ? "Suivant (ou passer)" : "Suivant"}
              </button>
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
