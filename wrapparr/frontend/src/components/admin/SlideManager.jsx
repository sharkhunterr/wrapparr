import { useState, useEffect } from "react"
import { Clapperboard, MonitorPlay, Gamepad2, Headphones, Library, BarChart3, Trophy, Search, Layers, ArrowDownUp, Sparkles, GripVertical, Lock, ChevronDown, ChevronRight, ChevronUp, Save, Tv, PieChart, RotateCcw, ArrowUp, ArrowDown } from "lucide-react"
import { api } from "../../services/api"
import { expandRegistry } from "../recap/slideRegistry"

// Icon map for slide types
const ICON_MAP = {
  "intro": Sparkles, "overview": BarChart3, "compare": ArrowDownUp, "ranking": Layers, "finale": Sparkles,
}
function getSlideIcon(id) {
  if (ICON_MAP[id]) return ICON_MAP[id]
  if (id.includes("cat-")) return Clapperboard
  if (id.includes("-pod")) return Trophy
  if (id.includes("-stats") || (!id.includes("-") && !ICON_MAP[id])) return BarChart3
  if (id.includes("-deep")) return Search
  if (id.includes("-genres")) return PieChart
  return Tv
}

function ProfilesEditor({ value, onChange }) {
  const items = Array.isArray(value) ? value : []

  const update = (idx, field, val) => {
    const next = items.map((p, i) => i === idx ? { ...p, [field]: field === "min" || field === "max" ? parseInt(val) || 0 : val } : p)
    onChange(next)
  }

  const add = () => {
    const last = items[items.length - 1]
    onChange([...items, { min: (last?.max || 2020) + 1, max: 2030, name: "Nouveau profil", desc: "Description", emoji: "🎬" }])
  }

  const remove = (idx) => {
    onChange(items.filter((_, i) => i !== idx))
  }

  return (
    <div style={{ width: "100%", marginTop: 6, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((p, i) => (
        <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input value={p.emoji} onChange={(e) => update(i, "emoji", e.target.value)} style={{ ...pInput, width: 32, textAlign: "center" }} />
            <input value={p.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Nom" style={{ ...pInput, flex: 1 }} />
            <button onClick={() => remove(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "0 4px" }}>×</button>
          </div>
          <input value={p.desc} onChange={(e) => update(i, "desc", e.target.value)} placeholder="Description" style={{ ...pInput, width: "100%" }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", width: 30 }}>De</span>
            <input type="number" value={p.min} onChange={(e) => update(i, "min", e.target.value)} style={{ ...pInput, width: 60, textAlign: "center" }} />
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", width: 15, textAlign: "center" }}>a</span>
            <input type="number" value={p.max} onChange={(e) => update(i, "max", e.target.value)} style={{ ...pInput, width: 60, textAlign: "center" }} />
          </div>
        </div>
      ))}
      <button onClick={add} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 6, color: "rgba(255,255,255,0.25)", fontSize: 10, padding: "4px 10px", cursor: "pointer", width: "100%" }}>+ ajouter un profil</button>
    </div>
  )
}

const pInput = { padding: "4px 6px", borderRadius: 4, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "white", fontSize: 11, outline: "none", boxSizing: "border-box" }

function CommentaryEditor({ value, onChange }) {
  const groups = Array.isArray(value) ? value : []

  const updatePhrase = (gIdx, pIdx, text) => {
    const next = groups.map((g, i) => i === gIdx ? { ...g, phrases: g.phrases.map((p, j) => j === pIdx ? text : p) } : g)
    onChange(next)
  }

  const addPhrase = (gIdx) => {
    const next = groups.map((g, i) => i === gIdx ? { ...g, phrases: [...g.phrases, ""] } : g)
    onChange(next)
  }

  const removePhrase = (gIdx, pIdx) => {
    const next = groups.map((g, i) => i === gIdx ? { ...g, phrases: g.phrases.filter((_, j) => j !== pIdx) } : g)
    onChange(next)
  }

  return (
    <div style={{ width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
      {groups.map((group, gIdx) => (
        <div key={group.trigger} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{group.label || group.trigger}</span>
            {group.vars && (
              <div style={{ display: "flex", gap: 3 }}>
                {group.vars.map((v) => (
                  <span key={v} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "rgba(229,160,13,0.1)", color: "#E5A00D", fontFamily: "JetBrains Mono,monospace" }}>{v}</span>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {group.phrases.map((phrase, pIdx) => (
              <div key={pIdx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input
                  value={phrase}
                  onChange={(e) => updatePhrase(gIdx, pIdx, e.target.value)}
                  placeholder="Phrase..."
                  style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "white", fontSize: 11, outline: "none", boxSizing: "border-box" }}
                />
                <button onClick={() => removePhrase(gIdx, pIdx)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={() => addPhrase(gIdx)} style={{ marginTop: 4, background: "none", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 5, color: "rgba(255,255,255,0.25)", fontSize: 10, padding: "3px 10px", cursor: "pointer", width: "100%" }}>+ ajouter</button>
        </div>
      ))}
    </div>
  )
}

export default function SlideManager() {
  const [slides, setSlides] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState([])

  // Load services + saved config, then build slide list from registry
  useEffect(() => {
    Promise.all([
      api("/services").catch(() => []),
      api("/admin/config").catch(() => ({})),
    ]).then(([svcs, globalConfig]) => {
      const svcTypes = svcs.map((s) => s.service_type)
      setServices(svcTypes)
      const registry = expandRegistry(svcTypes)
      const saved = globalConfig.slide_settings || {}
      const savedOrder = globalConfig.slide_order || []

      let ordered = registry.map((s) => {
        const savedSlide = saved[s.id] || {}
        const { enabled, ...savedSettings } = savedSlide
        return { ...s, enabled: enabled !== undefined ? enabled : true, settings: savedSettings }
      })

      // Apply saved order if exists
      if (savedOrder.length > 0) {
        const byId = {}
        for (const s of ordered) byId[s.id] = s
        const reordered = []
        for (const id of savedOrder) {
          if (byId[id]) { reordered.push(byId[id]); delete byId[id] }
        }
        // Append any new slides not in saved order
        for (const s of Object.values(byId)) reordered.push(s)
        ordered = reordered
      }

      setSlides(ordered)
    })
  }, [])

  const toggle = (id) => {
    setSlides(slides.map((s) => s.id === id && !s.locked ? { ...s, enabled: !s.enabled } : s))
  }

  const updateParam = (slideId, key, value) => {
    setSlides(slides.map((s) => s.id === slideId ? { ...s, settings: { ...s.settings, [key]: value } } : s))
  }

  const moveUp = (idx) => {
    if (idx <= 0) return
    // Don't move past locked intro
    if (slides[idx - 1]?.locked) return
    const next = [...slides]
    ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSlides(next)
  }

  const moveDown = (idx) => {
    if (idx >= slides.length - 1) return
    // Don't move past locked finale
    if (slides[idx + 1]?.locked) return
    const next = [...slides]
    ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSlides(next)
  }

  const resetOrder = () => {
    const registry = expandRegistry(services)
    // Keep current enabled/settings but reset order
    const savedMap = {}
    for (const s of slides) {
      savedMap[s.id] = { enabled: s.enabled, settings: s.settings }
    }
    setSlides(registry.map((s) => ({
      ...s,
      enabled: savedMap[s.id]?.enabled ?? true,
      settings: savedMap[s.id]?.settings ?? {},
    })))
  }

  const save = async () => {
    setSaving(true)
    const settings = {}
    for (const s of slides) {
      settings[s.id] = { enabled: s.enabled, ...s.settings }
    }
    const order = slides.map((s) => s.id)
    try {
      await api("/admin/config", { method: "PATCH", body: { slide_settings: settings, slide_order: order } })
    } catch {}
    setSaving(false)
  }

  let lastGroup = null

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <h2 style={h2}>Configuration des slides</h2>
        <button onClick={resetOrder} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>
          <RotateCcw size={12} /> Reset ordre
        </button>
      </div>
      <p style={desc}>
        Les slides sont detectees automatiquement selon les services connectes.
        Cliquez sur une slide pour voir et modifier ses parametres.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {slides.map((s) => {
          const isExpanded = expanded === s.id
          const hasParams = s.params && s.params.length > 0
          const Icon = getSlideIcon(s.id)

          // Show service group separator
          let separator = null
          const svcName = s._service || null
          if (svcName && svcName !== lastGroup) {
            lastGroup = svcName
            separator = (
              <div key={"sep-" + svcName} style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "14px 12px 4px", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "JetBrains Mono,monospace", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 8 }}>
                {svcName}
              </div>
            )
          } else if (!svcName && s.group === "global" && lastGroup !== "global") {
            lastGroup = "global"
            if (s.id === "compare") {
              separator = (
                <div key="sep-global-end" style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "14px 12px 4px", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "JetBrains Mono,monospace", borderTop: "1px solid rgba(255,255,255,0.04)", marginTop: 8 }}>
                  Global
                </div>
              )
            }
          }

          return (
            <div key={s.id}>
              {separator}
              {/* Slide row */}
              <div
                onClick={() => hasParams && setExpanded(isExpanded ? null : s.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
                  borderRadius: isExpanded ? "10px 10px 0 0" : 10,
                  background: s.enabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.005)",
                  border: "1px solid " + (s.cat ? "rgba(229,160,13,0.12)" : isExpanded ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)"),
                  borderBottom: isExpanded ? "none" : undefined,
                  opacity: s.enabled ? 1 : 0.45, cursor: hasParams ? "pointer" : "default",
                }}
              >
                {!s.locked ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); moveUp(slides.indexOf(s)) }} style={arrowBtn}><ArrowUp size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveDown(slides.indexOf(s)) }} style={arrowBtn}><ArrowDown size={10} /></button>
                  </div>
                ) : <Lock size={13} color="rgba(255,255,255,0.1)" style={{ flexShrink: 0 }} />}
                <Icon size={15} color={s.cat ? "#E5A00D" : s.pod ? "#fb923c" : "rgba(255,255,255,0.3)"} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "white" }}>{s.label}</span>
                    {s.cat && <span style={badge("#E5A00D")}>section</span>}
                    {s.pod && <span style={badge("#fb923c")}>podium</span>}
                    {hasParams && <span style={badge("rgba(255,255,255,0.15)")}>config</span>}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.desc}</div>
                </div>
                {hasParams && (isExpanded ? <ChevronDown size={14} color="rgba(255,255,255,0.3)" /> : <ChevronRight size={14} color="rgba(255,255,255,0.15)" />)}
                <button onClick={(e) => { e.stopPropagation(); toggle(s.id) }} disabled={s.locked} style={{
                  padding: "4px 10px", borderRadius: 5, border: "none", fontSize: 10, fontFamily: "JetBrains Mono,monospace", flexShrink: 0,
                  background: s.enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                  color: s.enabled ? "#4ade80" : "#f87171", cursor: s.locked ? "default" : "pointer", opacity: s.locked ? 0.3 : 1,
                }}>{s.enabled ? "on" : "off"}</button>
              </div>

              {/* Expanded params */}
              {isExpanded && hasParams && (
                <div style={{
                  padding: "12px 14px", borderRadius: "0 0 10px 10px",
                  background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.1)", borderTop: "none",
                  display: "flex", flexDirection: "column", gap: 8,
                }}>
                  {s.params.filter((p) => {
                    if (!p.showWhen) return true
                    return (s.settings[p.showWhen.key] ?? s.params.find((x) => x.key === p.showWhen.key)?.default) === p.showWhen.value
                  }).map((p) => (
                    <div key={p.key} style={(p.type === "commentary" || p.type === "profiles") ? { display: "flex", flexDirection: "column", gap: 4 } : { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                      <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", flex: (p.type === "commentary" || p.type === "profiles") ? undefined : 1 }}>{p.label}</label>

                      {p.type === "number" && (
                        <input type="number" value={s.settings[p.key] ?? p.default}
                          onChange={(e) => updateParam(s.id, p.key, parseInt(e.target.value) || 0)}
                          style={inputNum} />
                      )}

                      {p.type === "bool" && (
                        <button onClick={() => updateParam(s.id, p.key, !(s.settings[p.key] ?? p.default))} style={{
                          padding: "3px 10px", borderRadius: 5, border: "none", fontSize: 10, fontFamily: "JetBrains Mono,monospace", cursor: "pointer",
                          background: (s.settings[p.key] ?? p.default) ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                          color: (s.settings[p.key] ?? p.default) ? "#4ade80" : "#f87171",
                        }}>{(s.settings[p.key] ?? p.default) ? "on" : "off"}</button>
                      )}

                      {p.type === "select" && (
                        <select value={s.settings[p.key] ?? p.default}
                          onChange={(e) => updateParam(s.id, p.key, e.target.value)}
                          style={selectStyle}>
                          {p.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      )}

                      {p.type === "commentary" && (
                        <CommentaryEditor
                          value={s.settings[p.key] || p.default}
                          onChange={(val) => updateParam(s.id, p.key, val)}
                        />
                      )}

                      {p.type === "profiles" && (
                        <ProfilesEditor
                          value={s.settings[p.key] || p.default}
                          onChange={(val) => updateParam(s.id, p.key, val)}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button onClick={save} disabled={saving} style={{ ...btnAccent, marginTop: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <Save size={14} /> {saving ? "Sauvegarde..." : "Enregistrer"}
      </button>
    </div>
  )
}

const h2 = { color: "white", fontSize: 17, fontWeight: 700, marginBottom: 6 }
const desc = { color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 20 }
const btnAccent = { background: "#E5A00D", border: "none", borderRadius: 8, color: "#05050e", fontSize: 13, fontWeight: 700, padding: "10px 20px", cursor: "pointer" }
const inputNum = { width: 80, padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 12, fontFamily: "JetBrains Mono,monospace", textAlign: "center", outline: "none" }
const selectStyle = { padding: "4px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: 11, outline: "none" }
const badge = (color) => ({ fontSize: 8, color, background: color + "15", padding: "1px 5px", borderRadius: 4, fontFamily: "JetBrains Mono,monospace" })
const arrowBtn = { background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 3, color: "rgba(255,255,255,0.25)", padding: "1px 3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
