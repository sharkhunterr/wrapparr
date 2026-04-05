import { useState, useEffect } from "react"
import { Clapperboard, MonitorPlay, Gamepad2, Headphones, BookOpen, Library, CircleCheck, CircleX, Trash2, Plug, Film, Pencil, X, Bell } from "lucide-react"
import { api } from "../../services/api"
import useI18n from "../../i18n/index.jsx"

const SERVICE_TYPES = [
  { type: "tautulli", label: "Tautulli (Plex)", Icon: Clapperboard, color: "#E5A00D", placeholder_url: "http://tautulli:8181", authMode: "apikey", placeholder_key: "services.apiKeys.tautulli" },
  { type: "jellyfin", label: "Jellyfin", Icon: MonitorPlay, color: "#00a4dc", placeholder_url: "http://jellyfin:8096", authMode: "apikey", placeholder_key: "services.apiKeys.jellyfin" },
  { type: "romm", label: "ROMM", Icon: Gamepad2, color: "#34d399", placeholder_url: "http://romm:8080", authMode: "login", placeholder_user: "admin", placeholder_pass: "common.password" },
  { type: "audiobookshelf", label: "Audiobookshelf", Icon: Headphones, color: "#fb923c", placeholder_url: "http://audiobookshelf:13378", authMode: "apikey", placeholder_key: "services.apiKeys.tautulli" },
  { type: "komga", label: "Komga", Icon: Library, color: "#c084fc", placeholder_url: "http://komga:25600", authMode: "login", placeholder_user: "email", placeholder_pass: "common.password" },
  { type: "booklore", label: "Booklore", Icon: BookOpen, color: "#a78bfa", placeholder_url: "http://booklore:8080", authMode: "apikey", placeholder_key: "services.apiKeys.tautulli" },
  { type: "grimmory", label: "Grimmory", Icon: BookOpen, color: "#10b981", placeholder_url: "http://grimmory:6060", authMode: "apikey", placeholder_key: "services.apiKeys.tautulli" },
  { type: "tmdb", label: "TMDB", Icon: Film, color: "#01b4e4", placeholder_url: "https://api.themoviedb.org/3", authMode: "apikey", placeholder_key: "services.apiKeys.tmdb" },
  { type: "overseerr", label: "Overseerr", Icon: Bell, color: "#6366f1", placeholder_url: "http://overseerr:5055", authMode: "apikey", placeholder_key: "services.apiKeys.overseerr" },
]

function getMeta(type) {
  return SERVICE_TYPES.find((s) => s.type === type) || {}
}

function ServiceForm({ meta, initial, onSubmit, onCancel, submitLabel, t }) {
  const isLogin = meta.authMode === "login"

  // Parse existing credentials for login-type services
  const existingKey = initial?.api_key_clear || ""
  const [existingUser, existingPass] = isLogin && existingKey.includes(":")
    ? [existingKey.split(":")[0], existingKey.split(":").slice(1).join(":")]
    : ["", ""]

  const [form, setForm] = useState({
    display_name: initial?.display_name || "",
    base_url: initial?.base_url || "",
    api_key: isLogin ? "" : existingKey,
    username: existingUser,
    password: existingPass,
  })

  const handleSubmit = () => {
    const apiKey = isLogin ? `${form.username}:${form.password}` : form.api_key
    onSubmit({
      display_name: form.display_name || meta.label,
      base_url: form.base_url,
      api_key: apiKey || undefined,
    })
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <input value={form.display_name} onChange={(e) => setForm({ ...form, display_name: e.target.value })}
        placeholder={t("services.displayName")} style={input} />
      <input value={form.base_url} onChange={(e) => setForm({ ...form, base_url: e.target.value })}
        placeholder={meta.placeholder_url} style={input} />

      {isLogin ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder={meta.placeholder_user || t("services.identifier")} style={{ ...input, flex: 1 }} />
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            type="password" placeholder={t(meta.placeholder_pass || "common.password")} style={{ ...input, flex: 1 }} />
        </div>
      ) : (
        <input value={form.api_key} onChange={(e) => setForm({ ...form, api_key: e.target.value })}
          type="password" placeholder={t(meta.placeholder_key)} style={input} />
      )}

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={handleSubmit} style={btnAccent}>{submitLabel}</button>
        <button onClick={onCancel} style={btnSmall}>{t("common.cancel")}</button>
      </div>
    </div>
  )
}

export default function ServiceConfig() {
  const { t } = useI18n()
  const [services, setServices] = useState([])
  const [testing, setTesting] = useState(null)
  const [testResult, setTestResult] = useState({})
  const [adding, setAdding] = useState(null)
  const [editing, setEditing] = useState(null)

  useEffect(() => {
    api("/services").then(setServices).catch(() => {})
  }, [])

  const testConnection = async (id) => {
    setTesting(id)
    try {
      const res = await api(`/services/${id}/test`, { method: "POST" })
      setTestResult({ ...testResult, [id]: res })
    } catch (e) {
      setTestResult({ ...testResult, [id]: { ok: false, error: e.message } })
    }
    setTesting(null)
  }

  const addService = async (type, formData) => {
    try {
      const created = await api("/services", {
        method: "POST",
        body: { service_type: type, ...formData },
      })
      setServices([...services, created])
      setAdding(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const updateService = async (id, formData) => {
    try {
      // Only send api_key if it was filled (don't erase with empty)
      const body = { display_name: formData.display_name, base_url: formData.base_url }
      if (formData.api_key) body.api_key = formData.api_key
      const updated = await api(`/services/${id}`, { method: "PUT", body })
      setServices(services.map((s) => s.id === id ? updated : s))
      setEditing(null)
    } catch (e) {
      alert(e.message)
    }
  }

  const deleteService = async (id) => {
    await api(`/services/${id}`, { method: "DELETE" })
    setServices(services.filter((s) => s.id !== id))
  }

  const configured = services.map((s) => s.service_type)

  return (
    <div>
      <h2 style={h2}>{t("services.title")}</h2>
      <p style={desc}>{t("services.desc")}</p>

      {/* Existing services */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {services.map((svc) => {
          const meta = getMeta(svc.service_type)
          const SvcIcon = meta.Icon || Plug
          const result = testResult[svc.id]
          const isEditing = editing === svc.id

          return (
            <div key={svc.id} style={card}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${meta.color || "#E5A00D"}12`, border: `1px solid ${meta.color || "#E5A00D"}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <SvcIcon size={20} color={meta.color || "#E5A00D"} strokeWidth={1.5} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{svc.display_name}</div>
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>{svc.base_url}</div>
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  {svc.last_test_ok === true && <span style={{ color: "#4ade80", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CircleCheck size={13} /> OK</span>}
                  {svc.last_test_ok === false && <span style={{ color: "#f87171", fontSize: 11, display: "flex", alignItems: "center", gap: 4 }}><CircleX size={13} /> {t("common.error")}</span>}
                  <button onClick={() => testConnection(svc.id)} disabled={testing === svc.id} style={btnSmall}>
                    {testing === svc.id ? "..." : t("common.test")}
                  </button>
                  <button onClick={() => setEditing(isEditing ? null : svc.id)} style={{ ...btnSmall, color: isEditing ? "#E5A00D" : "rgba(255,255,255,0.5)", display: "flex", alignItems: "center" }}>
                    {isEditing ? <X size={13} /> : <Pencil size={13} />}
                  </button>
                  <button onClick={() => deleteService(svc.id)} style={{ ...btnSmall, color: "#f87171", borderColor: "rgba(239,68,68,0.2)", display: "flex", alignItems: "center" }}><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Test result */}
              {result && !isEditing && (
                <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontFamily: "JetBrains Mono,monospace",
                  background: result.ok ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                  color: result.ok ? "#4ade80" : "#f87171" }}>
                  {result.ok ? result.details : result.error}
                </div>
              )}

              {/* Edit form */}
              {isEditing && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
                    {meta.authMode === "login" ? t("services.leaveEmptyAuth") : t("services.leaveEmpty")}
                  </div>
                  <ServiceForm
                    meta={meta}
                    initial={svc}
                    onSubmit={(formData) => updateService(svc.id, formData)}
                    onCancel={() => setEditing(null)}
                    submitLabel={t("common.edit")}
                    t={t}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add new service */}
      <h3 style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 12 }}>{t("services.addService")}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10 }}>
        {SERVICE_TYPES.filter((s) => !configured.includes(s.type)).map((s) => (
          <div key={s.type} onClick={() => setAdding(s.type)} style={{
            padding: 16, borderRadius: 12, cursor: "pointer", textAlign: "center",
            background: adding === s.type ? "rgba(229,160,13,0.06)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${adding === s.type ? "#E5A00D44" : "rgba(255,255,255,0.06)"}`,
            transition: "all 0.2s",
          }}>
            <div style={{ marginBottom: 8 }}><s.Icon size={28} color={s.color} strokeWidth={1.5} /></div>
            <div style={{ color: "white", fontSize: 13, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding && (
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ color: "#E5A00D", fontSize: 14, fontWeight: 700, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            {(() => { const m = getMeta(adding); return m.Icon ? <m.Icon size={18} strokeWidth={1.5} /> : null })()}
            {getMeta(adding).label}
          </div>
          <ServiceForm
            meta={getMeta(adding)}
            initial={{}}
            onSubmit={(formData) => addService(adding, formData)}
            onCancel={() => setAdding(null)}
            submitLabel={t("common.add")}
            t={t}
          />
        </div>
      )}
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, marginBottom: 6 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 13, marginBottom: 24 }
const card = { padding: "16px 20px", borderRadius: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }
const input = { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, boxSizing: "border-box", outline: "none" }
const btnSmall = { background: "none", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 11, padding: "5px 12px", cursor: "pointer" }
const btnAccent = { background: "#E5A00D", border: "none", borderRadius: 8, color: "#05050e", fontSize: 13, fontWeight: 700, padding: "10px 24px", cursor: "pointer" }
