import { useState, useEffect } from "react"
import { UserCog, Shield, Eye, User, ToggleLeft, ToggleRight, Plus, X } from "lucide-react"
import { api } from "../../services/api"

const ROLE_ICONS = { admin: Shield, user: User, viewer: Eye }
const ROLE_COLORS = { admin: "#E5A00D", user: "#60a5fa", viewer: "#a78bfa" }

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ display_name: "", email: "", password: "", role: "user" })
  const [creating, setCreating] = useState(false)

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
            <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })} placeholder="Nom affiche" style={input} />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" style={input} />
            <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Mot de passe" type="password" style={input} />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={input}>
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
          return (
            <div key={u.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "14px 16px",
              background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)",
              flexWrap: "wrap",
            }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: `${roleColor}12`, border: `1px solid ${roleColor}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <RoleIcon size={16} color={roleColor} strokeWidth={1.5} />
              </div>
              <div style={{ flex: 1, minWidth: 120 }}>
                <div style={{ color: "white", fontSize: 13, fontWeight: 600, fontFamily: "Nunito,sans-serif" }}>{u.display_name}</div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>{u.email}</div>
              </div>
              <select value={u.role} onChange={(e) => changeRole(u, e.target.value)}
                style={{ background: "rgba(255,255,255,0.03)", color: roleColor, border: `1px solid ${roleColor}30`, borderRadius: 6, padding: "5px 10px", fontSize: 11, fontFamily: "JetBrains Mono,monospace", cursor: "pointer", outline: "none" }}>
                <option value="admin">admin</option>
                <option value="user">user</option>
                <option value="viewer">viewer</option>
              </select>
              <button onClick={() => toggleActive(u)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11,
                fontFamily: "Nunito,sans-serif", display: "flex", alignItems: "center", gap: 5,
                background: u.is_active ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                color: u.is_active ? "#4ade80" : "#f87171",
              }}>
                {u.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                {u.is_active ? "Actif" : "Inactif"}
              </button>
            </div>
          )
        })}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: 48, color: "rgba(255,255,255,0.2)", fontFamily: "Nunito,sans-serif" }}>
          Aucun utilisateur
        </div>
      )}
    </div>
  )
}

const input = { width: "100%", padding: "8px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 12, outline: "none", boxSizing: "border-box" }
