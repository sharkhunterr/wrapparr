import { useState, useEffect } from "react"
import { api } from "../../services/api"

export default function LogsPanel() {
  const [logs, setLogs] = useState([])
  const [level, setLevel] = useState("")
  const [loading, setLoading] = useState(false)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ limit: "200" })
      if (level) params.set("level", level)
      const data = await api(`/admin/logs?${params}`)
      setLogs(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchLogs() }, [level])

  const levelColor = (l) => {
    if (l === "ERROR") return "#f87171"
    if (l === "WARNING") return "#fbbf24"
    if (l === "INFO") return "#60a5fa"
    if (l === "DEBUG") return "rgba(255,255,255,0.3)"
    return "white"
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Logs</h2>
        <select value={level} onChange={e => setLevel(e.target.value)} style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>
          <option value="">Tous</option>
          <option value="ERROR">ERROR</option>
          <option value="WARNING">WARNING</option>
          <option value="INFO">INFO</option>
          <option value="DEBUG">DEBUG</option>
        </select>
        <button onClick={fetchLogs} style={{ padding: "4px 12px", borderRadius: 6, border: "none", background: "#E5A00D", color: "#000", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Rafraichir</button>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{logs.length} entrees</span>
      </div>
      <div style={{ maxHeight: "70vh", overflowY: "auto", borderRadius: 8, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", padding: 8 }}>
        {loading ? (
          <div style={{ color: "rgba(255,255,255,0.3)", padding: 20, textAlign: "center", fontSize: 12 }}>Chargement...</div>
        ) : logs.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", padding: 20, textAlign: "center", fontSize: 12 }}>Aucun log</div>
        ) : (
          logs.map((l, i) => (
            <div key={i} style={{ display: "flex", gap: 8, padding: "3px 6px", borderBottom: "1px solid rgba(255,255,255,0.02)", fontSize: 10, fontFamily: "JetBrains Mono,monospace", lineHeight: 1.6 }}>
              <span style={{ color: "rgba(255,255,255,0.2)", flexShrink: 0, width: 55 }}>{l.ts?.split("T")[1]?.slice(0, 8)}</span>
              <span style={{ color: levelColor(l.level), flexShrink: 0, width: 50, fontWeight: 700 }}>{l.level}</span>
              <span style={{ color: "rgba(255,255,255,0.6)", wordBreak: "break-all" }}>{l.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
