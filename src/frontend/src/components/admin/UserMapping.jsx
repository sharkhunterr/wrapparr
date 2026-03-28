import { useState, useEffect } from "react"
import { Users2, ArrowRight, Check, X, RefreshCw, Link2 } from "lucide-react"
import { api } from "../../services/api"

const SVC_META = {
  tautulli: { icon: "🎬", label: "Tautulli", color: "#E5A00D" },
  plex: { icon: "🎬", label: "Plex", color: "#E5A00D" },
  jellyfin: { icon: "📺", label: "Jellyfin", color: "#00a4dc" },
  romm: { icon: "🎮", label: "ROMM", color: "#34d399" },
  audiobookshelf: { icon: "🎧", label: "Audiobookshelf", color: "#fb923c" },
  komga: { icon: "📚", label: "Komga", color: "#c084fc" },
  booklore: { icon: "📖", label: "Booklore", color: "#a78bfa" },
}

export default function UserMapping() {
  const [wrapparrUsers, setWrapparrUsers] = useState([])
  const [serviceUsers, setServiceUsers] = useState({})
  const [mappings, setMappings] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedSvcUser, setSelectedSvcUser] = useState(null) // {serviceType, name}

  const load = async () => {
    setLoading(true)
    try {
      const [users, svcUsers, maps] = await Promise.all([
        api("/admin/users"),
        api("/admin/service-users"),
        api("/admin/mapping"),
      ])
      setWrapparrUsers(users)
      setServiceUsers(svcUsers)
      setMappings(maps)
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const mapUser = (wrapparrUserId) => {
    if (!selectedSvcUser) return
    setMappings((prev) => ({
      ...prev,
      [wrapparrUserId]: {
        ...(prev[wrapparrUserId] || {}),
        [selectedSvcUser.serviceType]: selectedSvcUser.name,
      },
    }))
    setSelectedSvcUser(null)
    setSaved(false)
  }

  const removeMapping = (userId, serviceType) => {
    setMappings((prev) => {
      const next = { ...prev, [userId]: { ...(prev[userId] || {}) } }
      next[userId][serviceType] = ""
      return next
    })
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await api("/admin/mapping", { method: "PUT", body: mappings })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const serviceTypes = Object.keys(serviceUsers)

  if (loading) return <div style={{ color: "rgba(255,255,255,0.3)", padding: 40, textAlign: "center" }}>Chargement...</div>

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Users2 size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Mapping utilisateurs</h2>
        <button onClick={load} style={btnIcon}><RefreshCw size={13} /></button>
      </div>
      <p style={desc}>
        Cliquez sur un compte de service puis sur "Mapper" a cote de l'utilisateur Wrapparr pour les associer.
      </p>

      {serviceTypes.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(255,255,255,0.2)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.08)" }}>
          Aucun service avec des utilisateurs detectes.
        </div>
      )}

      <div style={{ display: "flex", gap: 16 }}>
        {/* Left: Service users */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Comptes services</div>
          {serviceTypes.map((st) => {
            const meta = SVC_META[st] || { icon: "🔌", label: st, color: "#888" }
            const users = serviceUsers[st] || []
            return (
              <div key={st} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <span style={{ fontSize: 14 }}>{meta.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: meta.color }}>{meta.label}</span>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)" }}>{users.length} comptes</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  {users.map((u) => {
                    const isSelected = selectedSvcUser?.serviceType === st && selectedSvcUser?.name === u.name
                    const isMapped = Object.values(mappings).some((m) => m[st] === u.name)
                    return (
                      <div key={u.id} onClick={() => !isMapped && setSelectedSvcUser(isSelected ? null : { serviceType: st, name: u.name })} style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "8px 12px", borderRadius: 8, cursor: isMapped ? "default" : "pointer",
                        background: isSelected ? meta.color + "18" : "rgba(255,255,255,0.02)",
                        border: `1px solid ${isSelected ? meta.color + "40" : isMapped ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)"}`,
                        opacity: isMapped && !isSelected ? 0.5 : 1,
                        transition: "all 0.2s",
                      }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: meta.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: meta.color }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: isSelected ? meta.color : "white" }}>{u.name}</div>
                        </div>
                        {isMapped && <Check size={14} color="#4ade80" />}
                        {isSelected && <div style={{ padding: "2px 8px", borderRadius: 10, background: meta.color, color: "#000", fontSize: 9, fontWeight: 700 }}>Selectionne</div>}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Arrow */}
        {selectedSvcUser && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 4px" }}>
            <ArrowRight size={20} color="#E5A00D" style={{ animation: "pulse-arrow 1s ease-in-out infinite" }} />
          </div>
        )}

        {/* Right: Wrapparr users */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 8 }}>Utilisateurs Wrapparr</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {wrapparrUsers.map((u) => {
              const userMappings = mappings[u.id] || {}
              const mappedServices = Object.entries(userMappings).filter(([, v]) => v)
              return (
                <div key={u.id} style={{
                  padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: mappedServices.length > 0 ? 8 : 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E5A00D15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#E5A00D" }}>
                      {(u.display_name || u.email).charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{u.display_name}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{u.email}</div>
                    </div>
                    {selectedSvcUser && (
                      <button onClick={() => mapUser(u.id)} style={{
                        display: "flex", alignItems: "center", gap: 4,
                        padding: "5px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                        background: "#E5A00D", color: "#000", fontSize: 11, fontWeight: 700,
                        animation: "pulse-arrow 1s ease-in-out infinite",
                      }}>
                        <Link2 size={12} /> Mapper
                      </button>
                    )}
                  </div>

                  {/* Mapped services */}
                  {mappedServices.length > 0 && (
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {mappedServices.map(([st, name]) => {
                        const meta = SVC_META[st] || { icon: "🔌", color: "#888" }
                        return (
                          <div key={st} style={{
                            display: "flex", alignItems: "center", gap: 5,
                            padding: "3px 8px 3px 6px", borderRadius: 6,
                            background: meta.color + "12", border: "1px solid " + meta.color + "25",
                          }}>
                            <span style={{ fontSize: 11 }}>{meta.icon}</span>
                            <span style={{ fontSize: 10, color: meta.color, fontWeight: 600 }}>{name}</span>
                            <button onClick={() => removeMapping(u.id, st)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", padding: 0, display: "flex" }}>
                              <X size={11} />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Save */}
      {wrapparrUsers.length > 0 && serviceTypes.length > 0 && (
        <button onClick={save} disabled={saving} style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 20,
          padding: "10px 20px", borderRadius: 8, border: "none", cursor: saving ? "wait" : "pointer",
          background: saved ? "#22c55e" : "#E5A00D", color: saved ? "white" : "#05050e",
          fontSize: 13, fontWeight: 700, transition: "background 0.3s",
        }}>
          {saved ? <><Check size={14} /> Enregistre</> : saving ? "Sauvegarde..." : <><Link2 size={14} /> Enregistrer le mapping</>}
        </button>
      )}

      <style>{`
        @keyframes pulse-arrow { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }
const btnIcon = { background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.3)", padding: 5, cursor: "pointer", display: "flex" }
