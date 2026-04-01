import { useState, useRef } from "react"
import { Download, Upload, Shield, AlertTriangle } from "lucide-react"
import { api } from "../../services/api"

export default function BackupManager() {
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState("")
  const fileRef = useRef(null)

  const handleExport = async () => {
    setExporting(true)
    setError("")
    try {
      const token = localStorage.getItem("wrapparr_token")
      const resp = await fetch("/api/v1/backup/export", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!resp.ok) throw new Error("Erreur export: " + resp.status)
      const data = await resp.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `wrapparr-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      setResult({ type: "export", message: "Backup exporte avec succes" })
    } catch (e) {
      setError(e.message)
    }
    setExporting(false)
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setError("")
    setResult(null)
    try {
      const token = localStorage.getItem("wrapparr_token")
      const formData = new FormData()
      formData.append("file", file)
      const resp = await fetch("/api/v1/backup/import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await resp.json()
      if (!resp.ok) throw new Error(data.detail || "Erreur import")
      setResult({ type: "import", message: "Import reussi", details: data.imported })
    } catch (e) {
      setError(e.message)
    }
    setImporting(false)
    if (fileRef.current) fileRef.current.value = ""
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Shield size={20} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={h2}>Sauvegarde et restauration</h2>
      </div>
      <p style={desc}>Exportez ou importez la configuration complete de Wrapparr : utilisateurs, services, mappings, slides, themes, musique, parametres.</p>

      {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: 12, marginBottom: 14 }}>{error}</div>}

      {result && (
        <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>{result.message}</div>
          {result.details && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
              {Object.entries(result.details).filter(([, v]) => v > 0).map(([k, v]) => (
                <span key={k} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 6, background: "rgba(34,197,94,0.1)", color: "#4ade80", fontFamily: "JetBrains Mono,monospace" }}>
                  {v} {k}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {/* Export */}
        <div style={{ flex: "1 1 200px", padding: "20px 18px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Download size={18} color="#E5A00D" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Exporter</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14, lineHeight: 1.5 }}>
            Telecharge un fichier JSON contenant toute la configuration. Les cles API sont incluses (chiffrees dans le backup).
          </p>
          <button onClick={handleExport} disabled={exporting} style={btnAccent}>
            <Download size={14} /> {exporting ? "Export..." : "Telecharger le backup"}
          </button>
        </div>

        {/* Import */}
        <div style={{ flex: "1 1 200px", padding: "20px 18px", borderRadius: 12, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Upload size={18} color="#60a5fa" />
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>Importer</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 8, lineHeight: 1.5 }}>
            Restaure la configuration depuis un fichier backup. Les donnees existantes sont mises a jour, les nouvelles sont ajoutees.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", marginBottom: 12 }}>
            <AlertTriangle size={12} color="#fbbf24" />
            <span style={{ fontSize: 9, color: "#fbbf24" }}>Les configurations existantes seront ecrasees</span>
          </div>
          <label style={{ ...btnBlue, cursor: importing ? "wait" : "pointer", opacity: importing ? 0.6 : 1 }}>
            <Upload size={14} /> {importing ? "Import..." : "Choisir un fichier"}
            <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* Contenu du backup */}
      <div style={{ marginTop: 20, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)" }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Contenu du backup</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {["Utilisateurs", "Services", "Mappings", "Configuration slides", "Musique", "Themes personnalises", "Parametres globaux", "OIDC", "Phrases"].map(item => (
            <span key={item} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.06)" }}>{item}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, margin: 0 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20, lineHeight: 1.5 }
const btnAccent = { display: "flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, border: "none", background: "#E5A00D", color: "#05050e", fontSize: 12, fontWeight: 700, cursor: "pointer" }
const btnBlue = { display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 18px", borderRadius: 8, border: "none", background: "rgba(96,165,250,0.15)", color: "#60a5fa", fontSize: 12, fontWeight: 700 }
