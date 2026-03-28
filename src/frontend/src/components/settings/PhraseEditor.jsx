import { useState, useEffect } from "react"
import { api } from "../../services/api"

const CATEGORIES = ["films", "series", "romm", "audio", "komga"]
const VARIABLES = ["{user}", "{count}", "{hours}", "{year}", "{top1}"]

export default function PhraseEditor() {
  const [category, setCategory] = useState("films")
  const [phrases, setPhrases] = useState([])
  const [defaults, setDefaults] = useState({})
  const [newText, setNewText] = useState("")
  const [mode, setMode] = useState("mix")

  useEffect(() => {
    api("/phrases/defaults").then(setDefaults).catch(() => {})
  }, [])

  useEffect(() => {
    api(`/phrases?category=${category}`).then((data) => {
      setPhrases(data)
      if (data.length > 0) setMode(data[0].mode)
    }).catch(() => setPhrases([]))
  }, [category])

  const addPhrase = async () => {
    if (!newText.trim()) return
    const created = await api("/phrases", { method: "POST", body: { category, text: newText, sort_order: phrases.length, mode } })
    setPhrases([...phrases, created])
    setNewText("")
  }

  const removePhrase = async (id) => {
    await api(`/phrases/${id}`, { method: "DELETE" })
    setPhrases(phrases.filter((p) => p.id !== id))
  }

  return (
    <div style={{ maxWidth: 440 }}>
      <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 20, marginBottom: 16 }}>Phrases des podiums</h2>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid",
            borderColor: c === category ? "#E5A00D" : "rgba(255,255,255,0.1)",
            background: c === category ? "#E5A00D1e" : "transparent",
            color: c === category ? "#E5A00D" : "rgba(255,255,255,0.4)",
            fontSize: 12, fontFamily: "Nunito,sans-serif", cursor: "pointer",
          }}>{c}</button>
        ))}
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "Nunito,sans-serif" }}>Mode : </label>
        <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ background: "#111", color: "white", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 8px", fontSize: 12 }}>
          <option value="mix">Mélange (défaut + custom)</option>
          <option value="replace">Remplacement (custom uniquement)</option>
        </select>
      </div>

      {defaults[category] && (
        <div style={{ marginBottom: 16, padding: 12, background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>Phrases par défaut :</div>
          {defaults[category].map((t, i) => (
            <div key={i} style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 2, fontFamily: "Nunito,sans-serif" }}>• {t}</div>
          ))}
        </div>
      )}

      {phrases.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ flex: 1, fontSize: 13, color: "white", fontFamily: "Nunito,sans-serif" }}>{p.text}</span>
          <button onClick={() => removePhrase(p.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer", fontSize: 14 }}>✕</button>
        </div>
      ))}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={newText} onChange={(e) => setNewText(e.target.value)} placeholder="Nouvelle phrase..."
          style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.04)", color: "white", fontSize: 13, fontFamily: "Nunito,sans-serif" }} />
        <button onClick={addPhrase} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#E5A00D", color: "#05050e", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>+</button>
      </div>

      <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
        {VARIABLES.map((v) => (
          <button key={v} onClick={() => setNewText((t) => t + v)} style={{ padding: "2px 8px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.3)", fontSize: 10, cursor: "pointer" }}>{v}</button>
        ))}
      </div>
    </div>
  )
}
