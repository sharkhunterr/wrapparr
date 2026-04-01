import { useState, useEffect } from "react"
import { Music, Plus, Trash2, Play, ToggleLeft, ToggleRight } from "lucide-react"
import { api } from "../../services/api"

const MODE_OPTIONS = [
  { value: "single", label: "Une seule musique en fond" },
  { value: "per_section", label: "Une musique par section" },
]

const SECTION_LABELS = {
  _background: "Musique de fond (toutes les slides)",
  intro: "Intro",
  films: "Films",
  series: "Series",
  audiobook: "Livres Audio",
  grimmory: "Lecture (Grimmory)",
  demandes: "Demandes (Overseerr)",
  community: "Communaute",
  finale: "Finale",
}

function extractYouTubeId(url) {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

function formatDuration(seconds) {
  if (!seconds) return ""
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m${String(s).padStart(2, "0")}s`
  return `${m}m${String(s).padStart(2, "0")}s`
}

export default function MusicManager() {
  // config = { mode, tracks: { section: { url, enabled, name } }, pool: [{ url, name, id }] }
  const [config, setConfig] = useState({ mode: "single", tracks: {}, pool: [] })
  const [saving, setSaving] = useState(false)
  const [newUrl, setNewUrl] = useState("")

  useEffect(() => {
    api("/admin/config").then((cfg) => {
      if (cfg.recap_music) setConfig({ mode: "single", tracks: {}, pool: [], ...cfg.recap_music })
    }).catch(() => {})
  }, [])

  const save = async (newConfig) => {
    setConfig(newConfig)
    setSaving(true)
    await api("/admin/config", { method: "PATCH", body: { recap_music: newConfig } })
    setSaving(false)
  }

  const setMode = (mode) => save({ ...config, mode })

  const [downloading, setDownloading] = useState(false)

  // Pool management
  const addToPool = async () => {
    const videoId = extractYouTubeId(newUrl)
    if (!videoId || config.pool.some((p) => extractYouTubeId(p.url) === videoId)) return
    setDownloading(true)
    try {
      const result = await api("/admin/music/download", { method: "POST", body: { url: newUrl } })
      const audioPath = result.path || `/api/v1/media/music/${videoId}.mp3`
      const name = result.title || ""
      const duration = result.duration || 0
      await save({ ...config, pool: [...config.pool, { url: newUrl, audioPath, name, duration, id: Date.now().toString() }] })
      setNewUrl("")
    } catch (e) {
      alert("Erreur de telechargement : " + (e.message || e))
    }
    setDownloading(false)
  }

  const removeFromPool = (idx) => {
    const pool = config.pool.filter((_, i) => i !== idx)
    // Also remove from tracks if assigned
    const tracks = { ...config.tracks }
    const removedUrl = config.pool[idx]?.url
    for (const k of Object.keys(tracks)) {
      if (tracks[k]?.url === removedUrl) delete tracks[k]
    }
    save({ ...config, pool, tracks })
  }

  const updatePoolName = (idx, name) => {
    const pool = config.pool.map((p, i) => i === idx ? { ...p, name } : p)
    save({ ...config, pool })
  }

  // Track assignment
  const assignTrack = (section, poolIdx) => {
    const poolItem = config.pool[poolIdx]
    if (!poolItem) return
    save({ ...config, tracks: { ...config.tracks, [section]: { url: poolItem.url, audioPath: poolItem.audioPath, enabled: true } } })
  }

  const toggleTrack = (section) => {
    const t = config.tracks[section]
    if (!t) return
    save({ ...config, tracks: { ...config.tracks, [section]: { ...t, enabled: !t.enabled } } })
  }

  const removeTrack = (section) => {
    const tracks = { ...config.tracks }
    delete tracks[section]
    save({ ...config, tracks })
  }

  const sections = config.mode === "single" ? ["_background"] : ["intro", "films", "series", "audiobook", "grimmory", "demandes", "community", "finale"]

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <Music size={22} color="#E5A00D" strokeWidth={1.5} />
        <h2 style={{ color: "white", fontFamily: "Nunito,sans-serif", fontSize: 17, fontWeight: 700, margin: 0 }}>Musique du recap</h2>
      </div>

      <div style={{ marginBottom: 16, fontSize: 12, color: "rgba(255,255,255,0.35)", lineHeight: 1.5 }}>
        Ajoute des musiques YouTube a ta bibliotheque, puis assigne-les aux sections du recap. Le son demarre mute, l'utilisateur peut l'activer.
      </div>

      {/* Mode selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600 }}>Mode de lecture</div>
        <div style={{ display: "flex", gap: 6 }}>
          {MODE_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => setMode(opt.value)} style={{
              flex: 1, padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: config.mode === opt.value ? "rgba(229,160,13,0.1)" : "rgba(255,255,255,0.02)",
              border: "1px solid " + (config.mode === opt.value ? "rgba(229,160,13,0.3)" : "rgba(255,255,255,0.06)"),
              color: config.mode === opt.value ? "#E5A00D" : "rgba(255,255,255,0.4)",
              fontSize: 11, fontWeight: 600, textAlign: "left", transition: "all .15s ease",
            }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pool — music library */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 600 }}>Bibliotheque musicale</div>

        {/* Add new */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          <input
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addToPool()}
            placeholder="Coller un lien YouTube..."
            style={{
              flex: 1, padding: "8px 10px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)",
              color: "white", fontSize: 11, fontFamily: "JetBrains Mono,monospace", outline: "none",
            }}
          />
          <button onClick={addToPool} disabled={!extractYouTubeId(newUrl) || downloading} style={{
            padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer",
            background: extractYouTubeId(newUrl) ? "rgba(229,160,13,0.15)" : "rgba(255,255,255,0.02)",
            color: extractYouTubeId(newUrl) ? "#E5A00D" : "rgba(255,255,255,0.15)",
            fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4,
            border: "1px solid " + (extractYouTubeId(newUrl) ? "rgba(229,160,13,0.3)" : "rgba(255,255,255,0.06)"),
          }}>
            <Plus size={12} /> {downloading ? "Telechargement..." : "Ajouter"}
          </button>
        </div>

        {/* Pool list */}
        {config.pool.length === 0 ? (
          <div style={{ padding: "20px 16px", borderRadius: 10, background: "rgba(255,255,255,0.015)", border: "1px dashed rgba(255,255,255,0.06)", textAlign: "center" }}>
            <Music size={20} color="rgba(255,255,255,0.1)" style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>Aucune musique ajoutee</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {config.pool.map((p, i) => {
              const videoId = extractYouTubeId(p.url)
              return (
                <div key={p.id || i} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {videoId && <img src={`https://img.youtube.com/vi/${videoId}/default.jpg`} alt="" style={{ width: 48, height: 36, borderRadius: 4, objectFit: "cover", flexShrink: 0 }} onError={(e) => { e.target.style.display = "none" }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input value={p.name} onChange={(e) => updatePoolName(i, e.target.value)} placeholder="Nom de la musique..."
                      style={{ width: "100%", background: "none", border: "none", color: "white", fontSize: 11, fontWeight: 600, outline: "none", padding: 0 }} />
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
                      <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.url}</span>
                      {p.duration > 0 && <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0, padding: "1px 5px", borderRadius: 4, background: "rgba(255,255,255,0.04)" }}>{formatDuration(p.duration)}</span>}
                    </div>
                  </div>
                  <button onClick={() => removeFromPool(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.15)", padding: 2 }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Section assignments */}
      {config.pool.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 8, fontWeight: 600 }}>Assignation aux sections</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sections.map((section) => {
              const track = config.tracks?.[section]
              const poolItem = track ? config.pool.find((p) => p.url === track.url) : null
              const assignedName = poolItem?.name || extractYouTubeId(track?.url) || "?"
              const assignedDuration = poolItem?.duration || 0
              return (
                <div key={section} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 8,
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <Music size={13} color="rgba(255,255,255,0.2)" />
                  <span style={{ fontSize: 12, color: "white", fontWeight: 500, width: 140, flexShrink: 0 }}>{SECTION_LABELS[section]}</span>

                  {track ? (
                    <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, background: track.enabled ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.02)", border: "1px solid " + (track.enabled ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"), flex: 1, minWidth: 0 }}>
                        <Play size={9} color={track.enabled ? "#4ade80" : "rgba(255,255,255,0.15)"} />
                        <span style={{ fontSize: 10, color: track.enabled ? "#4ade80" : "rgba(255,255,255,0.25)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{assignedName}</span>
                        {assignedDuration > 0 && <span style={{ fontSize: 8, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", flexShrink: 0 }}>{formatDuration(assignedDuration)}</span>}
                      </div>
                      <button onClick={() => toggleTrack(section)} style={{
                        background: "none", border: "none", cursor: "pointer", padding: 2,
                        color: track.enabled ? "#4ade80" : "rgba(255,255,255,0.2)",
                      }}>
                        {track.enabled ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => removeTrack(section)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "rgba(255,255,255,0.15)" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ) : (
                    <select onChange={(e) => { if (e.target.value) assignTrack(section, parseInt(e.target.value)) }} value="" style={{
                      flex: 1, padding: "5px 8px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", fontSize: 10, outline: "none",
                      fontFamily: "Nunito,sans-serif",
                    }}>
                      <option value="">Choisir une musique...</option>
                      {config.pool.map((p, i) => (
                        <option key={i} value={i} style={{ background: "#15151e", color: "white" }}>{p.name || extractYouTubeId(p.url) || p.url}{p.duration ? ` (${formatDuration(p.duration)})` : ""}</option>
                      ))}
                    </select>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {saving && <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 8, fontFamily: "JetBrains Mono,monospace" }}>sauvegarde...</div>}
    </div>
  )
}
