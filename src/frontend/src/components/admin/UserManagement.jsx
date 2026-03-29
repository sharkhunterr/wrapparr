import { useState, useEffect } from "react"
import { UserCog, Shield, Eye, User, ToggleLeft, ToggleRight, Plus, X, Pencil, KeyRound, Check, Link2, Unlink } from "lucide-react"
import { api } from "../../services/api"

const ROLE_ICONS = { admin: Shield, user: User, viewer: Eye }
const ROLE_COLORS = { admin: "#E5A00D", user: "#60a5fa", viewer: "#a78bfa" }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [serviceUsers, setServiceUsers] = useState({})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ display_name: "", email: "", password: "", role: "user" })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [tempPassword, setTempPassword] = useState(null)
  const [saving, setSaving] = useState(false)
  const [addingMapping, setAddingMapping] = useState(null) // user id
  const [mappingForm, setMappingForm] = useState({ service_type: "", service_username: "" })

  const load = async () => {
    try {
      const data = await api("/admin/users-full")
      setUsers(data)
    } catch { }
    try {
      const svcUsers = await api("/admin/service-users")
      setServiceUsers(svcUsers)
    } catch { }
  }
  useEffect(() => { load() }, [])

  const createUser = async () => {
    if (!form.email || !form.password) return
    setCreating(true)
    try {
      await api("/admin/users", { method: "POST", body: form })
      setForm({ display_name: "", email: "", password: "", role: "user" })
      setShowForm(false)
      load()
    } catch (e) { alert(e.message) }
    setCreating(false)
  }

  const startEdit = (u) => { setEditing(u.id); setEditForm({ display_name: u.display_name, email: u.email }); setTempPassword(null) }

  const saveEdit = async (u) => {
    setSaving(true)
    try {
      const updates = {}
      if (editForm.display_name !== u.display_name) updates.display_name = editForm.display_name
      if (editForm.email !== u.email) updates.email = editForm.email
      if (Object.keys(updates).length > 0) await api(`/admin/users/${u.id}`, { method: "PATCH", body: updates })
      setEditing(null)
      load()
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const resetPassword = async (u) => {
    if (!confirm(`Reinitialiser le mot de passe de ${u.display_name} ?`)) return
    try {
      const res = await api(`/admin/users/${u.id}`, { method: "PATCH", body: { reset_password: true } })
      if (res.temp_password) setTempPassword({ userId: u.id, password: res.temp_password })
      load()
    } catch (e) { alert(e.message) }
  }

  const toggleActive = async (u) => {
    await api(`/admin/users/${u.id}`, { method: "PATCH", body: { is_active: !u.is_active } })
    setUsers(users.map(x => x.id === u.id ? { ...x, is_active: !x.is_active } : x))
  }

  const changeRole = async (u, role) => {
    await api(`/admin/users/${u.id}`, { method: "PATCH", body: { role } })
    setUsers(users.map(x => x.id === u.id ? { ...x, role } : x))
  }

  const addMapping = async (u) => {
    if (!mappingForm.service_type || !mappingForm.service_username) return
    try {
      // Use existing mapping endpoint
      const current = {}
      for (const m of u.mappings || []) current[m.service_type] = m.service_username
      current[mappingForm.service_type] = mappingForm.service_username
      await api("/admin/mapping", { method: "PUT", body: { [u.id]: current } })
      setAddingMapping(null)
      setMappingForm({ service_type: "", service_username: "" })
      load()
    } catch (e) { alert(e.message) }
  }

  const removeMapping = async (u, m) => {
    if (!confirm(`Supprimer le lien ${m.service_type}: ${m.service_username} ?`)) return
    try {
      const current = {}
      for (const mp of u.mappings || []) {
        if (mp.id !== m.id) current[mp.service_type] = mp.service_username
        else current[mp.service_type] = ""  // empty = delete
      }
      await api("/admin/mapping", { method: "PUT", body: { [u.id]: current } })
      load()
    } catch (e) { alert(e.message) }
  }

  // Available service types from connected services
  const availableServices = Object.keys(serviceUsers)

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <UserCog size={22} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: 0 }}>Utilisateurs</h2>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 16 }}>Gerez les comptes et les liens avec les services.</p>

      {/* Create form */}
      {showForm ? (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(229,160,13,0.04)", border: "1px solid rgba(229,160,13,0.15)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E5A00D" }}>Nouvel utilisateur</span>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={form.display_name} onChange={e => setForm({ ...form, display_name: e.target.value })} placeholder="Nom" style={inp} />
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" style={inp} />
            <input value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mot de passe" type="password" style={inp} />
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={inp}>
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button onClick={createUser} disabled={creating || !form.email || !form.password} style={{ ...btnPrimary, opacity: (!form.email || !form.password) ? 0.4 : 1 }}>
            {creating ? "Creation..." : "Creer"}
          </button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 16, padding: "8px 16px", borderRadius: 8, border: "1px dashed rgba(229,160,13,0.3)", background: "none", color: "#E5A00D", fontSize: 12, cursor: "pointer" }}>
          <Plus size={14} /> Ajouter un utilisateur
        </button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {users.map(u => {
          const RoleIcon = ROLE_ICONS[u.role] || User
          const roleColor = ROLE_COLORS[u.role] || "#60a5fa"
          const isEditing = editing === u.id
          const hasTempPw = tempPassword?.userId === u.id
          const isAddingMap = addingMapping === u.id

          return (
            <div key={u.id} style={{ padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: isEditing ? "1px solid rgba(229,160,13,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
              {/* User header */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <div style={{ width: 34, height: 34, borderRadius: 8, background: `${roleColor}12`, border: `1px solid ${roleColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <RoleIcon size={15} color={roleColor} strokeWidth={1.5} />
                </div>

                {isEditing ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, minWidth: 140 }}>
                    <input value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })} style={{ ...inp, fontSize: 13, fontWeight: 600, padding: "3px 8px" }} />
                    <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ ...inp, fontSize: 10, padding: "2px 8px" }} type="email" />
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 100 }}>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{u.display_name}</div>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontFamily: "JetBrains Mono,monospace" }}>{u.email}</div>
                  </div>
                )}

                <select value={u.role} onChange={e => changeRole(u, e.target.value)} style={{ background: "rgba(255,255,255,0.03)", color: roleColor, border: `1px solid ${roleColor}30`, borderRadius: 6, padding: "4px 8px", fontSize: 10, fontFamily: "JetBrains Mono,monospace", cursor: "pointer", outline: "none" }}>
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                  <option value="viewer">viewer</option>
                </select>

                <button onClick={() => toggleActive(u)} style={{ padding: "4px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", gap: 4, background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", color: u.is_active ? "#4ade80" : "#f87171" }}>
                  {u.is_active ? <ToggleRight size={13} /> : <ToggleLeft size={13} />}
                  {u.is_active ? "Actif" : "Inactif"}
                </button>

                {isEditing ? (
                  <button onClick={() => saveEdit(u)} disabled={saving} style={{ ...actionBtn, background: "rgba(34,197,94,0.1)", color: "#4ade80" }}><Check size={12} /></button>
                ) : (
                  <button onClick={() => startEdit(u)} style={actionBtn}><Pencil size={12} /></button>
                )}
                <button onClick={() => resetPassword(u)} title="Reinitialiser le mot de passe" style={actionBtn}><KeyRound size={12} /></button>
              </div>

              {/* Service mappings */}
              {(u.mappings?.length > 0 || isAddingMap) && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                  {u.mappings?.map(m => (
                    <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "3px 0" }}>
                      <Link2 size={11} color="rgba(255,255,255,0.2)" />
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "JetBrains Mono,monospace", minWidth: 70 }}>{m.service_type}</span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{m.service_username}</span>
                      <button onClick={() => removeMapping(u, m)} title="Supprimer ce lien" style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.15)", padding: 2 }}><Unlink size={11} /></button>
                    </div>
                  ))}

                  {isAddingMap && (
                    <div style={{ display: "flex", gap: 6, marginTop: 4, alignItems: "center" }}>
                      <select value={mappingForm.service_type} onChange={e => {
                        setMappingForm({ ...mappingForm, service_type: e.target.value, service_username: "" })
                      }} style={{ ...inp, width: 100, padding: "3px 6px", fontSize: 10 }}>
                        <option value="">Service...</option>
                        {availableServices.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {mappingForm.service_type && serviceUsers[mappingForm.service_type] ? (
                        <select value={mappingForm.service_username} onChange={e => setMappingForm({ ...mappingForm, service_username: e.target.value })} style={{ ...inp, flex: 1, padding: "3px 6px", fontSize: 10 }}>
                          <option value="">Utilisateur...</option>
                          {serviceUsers[mappingForm.service_type].map(su => <option key={su.id} value={su.name}>{su.name}</option>)}
                        </select>
                      ) : (
                        <input value={mappingForm.service_username} onChange={e => setMappingForm({ ...mappingForm, service_username: e.target.value })} placeholder="Nom utilisateur" style={{ ...inp, flex: 1, padding: "3px 6px", fontSize: 10 }} />
                      )}
                      <button onClick={() => addMapping(u)} disabled={!mappingForm.service_type || !mappingForm.service_username} style={{ ...actionBtn, background: "rgba(34,197,94,0.1)", color: "#4ade80" }}><Check size={11} /></button>
                      <button onClick={() => setAddingMapping(null)} style={actionBtn}><X size={11} /></button>
                    </div>
                  )}
                </div>
              )}

              {/* Add mapping button */}
              {!isAddingMap && (
                <button onClick={() => { setAddingMapping(u.id); setMappingForm({ service_type: "", service_username: "" }) }}
                  style={{ marginTop: 6, background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.15)", fontSize: 9, display: "flex", alignItems: "center", gap: 4, padding: "2px 0" }}>
                  <Plus size={10} /> Lier un service
                </button>
              )}

              {/* Temp password */}
              {hasTempPw && (
                <div style={{ marginTop: 8, padding: "8px 12px", borderRadius: 8, background: "rgba(229,160,13,0.08)", border: "1px solid rgba(229,160,13,0.2)" }}>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>Mot de passe temporaire :</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E5A00D", fontFamily: "JetBrains Mono,monospace", userSelect: "all" }}>{tempPassword.password}</div>
                  <div style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", marginTop: 2 }}>Ce mot de passe ne sera plus affiche.</div>
                </div>
              )}

              {/* No mapping warning */}
              {(!u.mappings || u.mappings.length === 0) && !isAddingMap && (
                <div style={{ marginTop: 6, fontSize: 9, color: "rgba(255,200,50,0.4)", display: "flex", alignItems: "center", gap: 4 }}>
                  ⚠ Aucun service lie — les recaps ne seront pas generes pour cet utilisateur
                </div>
              )}
            </div>
          )
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.2)" }}>Aucun utilisateur</div>
      )}
    </div>
  )
}

const inp = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "Nunito,sans-serif" }
const actionBtn = { padding: "4px 7px", borderRadius: 5, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 3, fontSize: 10 }
const btnPrimary = { padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "#E5A00D", color: "#05050e", fontSize: 12, fontWeight: 700 }
