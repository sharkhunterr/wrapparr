import { useState, useEffect } from "react"
import { UserCog, Shield, Eye, User, ToggleLeft, ToggleRight, Plus, X, Pencil, KeyRound, Check } from "lucide-react"
import { api } from "../../services/api"

const ROLE_ICONS = { admin: Shield, user: User, viewer: Eye }
const ROLE_COLORS = { admin: "#E5A00D", user: "#60a5fa", viewer: "#a78bfa" }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ display_name: "", email: "", password: "", role: "user" })
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(null) // user id being edited
  const [editForm, setEditForm] = useState({})
  const [tempPassword, setTempPassword] = useState(null) // { userId, password }
  const [saving, setSaving] = useState(false)

  const load = () => api("/admin/users").then(setUsers).catch(() => {})
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

  const startEdit = (u) => {
    setEditing(u.id)
    setEditForm({ display_name: u.display_name, email: u.email })
    setTempPassword(null)
  }

  const saveEdit = async (u) => {
    setSaving(true)
    try {
      const updates = {}
      if (editForm.display_name !== u.display_name) updates.display_name = editForm.display_name
      if (editForm.email !== u.email) updates.email = editForm.email
      if (Object.keys(updates).length > 0) {
        await api(`/admin/users/${u.id}`, { method: "PATCH", body: updates })
      }
      setEditing(null)
      load()
    } catch (e) { alert(e.message) }
    setSaving(false)
  }

  const resetPassword = async (u) => {
    if (!confirm(`Reinitialiser le mot de passe de ${u.display_name} ?`)) return
    try {
      const res = await api(`/admin/users/${u.id}`, { method: "PATCH", body: { reset_password: true } })
      if (res.temp_password) {
        setTempPassword({ userId: u.id, password: res.temp_password })
      }
      load()
    } catch (e) { alert(e.message) }
  }

  const toggleActive = async (user) => {
    await api(`/admin/users/${user.id}`, { method: "PATCH", body: { is_active: !user.is_active } })
    setUsers(users.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u))
  }

  const changeRole = async (user, role) => {
    await api(`/admin/users/${user.id}`, { method: "PATCH", body: { role } })
    setUsers(users.map((u) => u.id === user.id ? { ...u, role } : u))
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <UserCog size={22} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={{ color: "white", fontSize: 17, fontWeight: 700, margin: 0 }}>Utilisateurs</h2>
      </div>
      <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 16 }}>Gerez les comptes utilisateurs de Wrapparr.</p>

      {/* Create form */}
      {showForm ? (
        <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(229,160,13,0.04)", border: "1px solid rgba(229,160,13,0.15)", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#E5A00D" }}>Nouvel utilisateur</span>
            <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer" }}><X size={16} /></button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Nom affiche" style={inp} />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" style={inp} />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mot de passe" type="password" style={inp} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inp}>
              <option value="user">Utilisateur</option>
              <option value="admin">Admin</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <button onClick={createUser} disabled={creating || !form.email || !form.password} style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            background: "#E5A00D", color: "#05050e", fontSize: 12, fontWeight: 700,
            opacity: (!form.email || !form.password) ? 0.4 : 1,
          }}>{creating ? "Creation..." : "Creer"}</button>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 16,
          padding: "8px 16px", borderRadius: 8, border: "1px dashed rgba(229,160,13,0.3)",
          background: "none", color: "#E5A00D", fontSize: 12, cursor: "pointer",
        }}><Plus size={14} /> Ajouter un utilisateur</button>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((u) => {
          const RoleIcon = ROLE_ICONS[u.role] || User
          const roleColor = ROLE_COLORS[u.role] || "#60a5fa"
          const isEditing = editing === u.id
          const hasTempPw = tempPassword?.userId === u.id

          return (
            <div key={u.id} style={{
              padding: "14px 16px", background: "rgba(255,255,255,0.02)", borderRadius: 12,
              border: isEditing ? "1px solid rgba(229,160,13,0.2)" : "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${roleColor}12`, border: `1px solid ${roleColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <RoleIcon size={16} color={roleColor} strokeWidth={1.5} />
                </div>

                {isEditing ? (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 150 }}>
                    <input value={editForm.display_name} onChange={e => setEditForm({ ...editForm, display_name: e.target.value })}
                      style={{ ...inp, fontSize: 13, fontWeight: 600, padding: "4px 8px" }} placeholder="Nom" />
                    <input value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                      style={{ ...inp, fontSize: 11, padding: "3px 8px" }} placeholder="Email" type="email" />
                  </div>
                ) : (
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{u.display_name}</div>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>{u.email}</div>
                  </div>
                )}

                {/* Role */}
                <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                  style={{ background: "rgba(255,255,255,0.03)", color: roleColor, border: `1px solid ${roleColor}30`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontFamily: "JetBrains Mono,monospace", cursor: "pointer", outline: "none" }}>
                  <option value="admin">admin</option>
                  <option value="user">user</option>
                  <option value="viewer">viewer</option>
                </select>

                {/* Active toggle */}
                <button onClick={() => toggleActive(u)} style={{
                  padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                  display: "flex", alignItems: "center", gap: 5,
                  background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                  color: u.is_active ? "#4ade80" : "#f87171",
                }}>
                  {u.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                  {u.is_active ? "Actif" : "Inactif"}
                </button>

                {/* Edit / Save */}
                {isEditing ? (
                  <button onClick={() => saveEdit(u)} disabled={saving} style={{ ...actionBtn, background: "rgba(34,197,94,0.1)", color: "#4ade80" }}>
                    <Check size={13} /> {saving ? "..." : "OK"}
                  </button>
                ) : (
                  <button onClick={() => startEdit(u)} style={{ ...actionBtn }}>
                    <Pencil size={13} />
                  </button>
                )}

                {/* Reset password */}
                <button onClick={() => resetPassword(u)} title="Reinitialiser le mot de passe" style={{ ...actionBtn }}>
                  <KeyRound size={13} />
                </button>
              </div>

              {/* Temp password display */}
              {hasTempPw && (
                <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(229,160,13,0.08)", border: "1px solid rgba(229,160,13,0.2)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>Mot de passe temporaire (a communiquer a l'utilisateur) :</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#E5A00D", fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.1em", userSelect: "all" }}>
                    {tempPassword.password}
                  </div>
                  <div style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", marginTop: 3 }}>Ce mot de passe ne sera plus affiche. Copiez-le maintenant.</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.2)" }}>
          Aucun utilisateur
        </div>
      )}
    </div>
  )
}

const inp = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "Nunito,sans-serif" }
const actionBtn = { padding: "5px 8px", borderRadius: 6, border: "none", cursor: "pointer", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }
