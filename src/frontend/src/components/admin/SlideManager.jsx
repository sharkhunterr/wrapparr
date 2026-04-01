import { useState, useEffect } from "react"
import { Clapperboard, MonitorPlay, Gamepad2, Headphones, Library, BarChart3, Trophy, Search, Layers, ArrowDownUp, Sparkles, Lock, ChevronDown, ChevronRight, ChevronUp, Save, Tv, PieChart, RotateCcw, ArrowUp, ArrowDown } from "lucide-react"
import { api } from "../../services/api"
import { expandRegistry } from "../recap/slideRegistry"

// ── Sub-components (ProfilesEditor, CommentaryEditor) ──

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
  const remove = (idx) => onChange(items.filter((_, i) => i !== idx))

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
  const updatePhrase = (gIdx, pIdx, text) => { onChange(groups.map((g, i) => i === gIdx ? { ...g, phrases: g.phrases.map((p, j) => j === pIdx ? text : p) } : g)) }
  const addPhrase = (gIdx) => { onChange(groups.map((g, i) => i === gIdx ? { ...g, phrases: [...g.phrases, ""] } : g)) }
  const removePhrase = (gIdx, pIdx) => { onChange(groups.map((g, i) => i === gIdx ? { ...g, phrases: g.phrases.filter((_, j) => j !== pIdx) } : g)) }

  return (
    <div style={{ width: "100%", marginTop: 8, display: "flex", flexDirection: "column", gap: 10 }}>
      {groups.map((group, gIdx) => (
        <div key={group.trigger} style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>{group.label || group.trigger}</span>
            {group.vars && <div style={{ display: "flex", gap: 3 }}>{group.vars.map((v) => <span key={v} style={{ fontSize: 8, padding: "1px 5px", borderRadius: 4, background: "rgba(229,160,13,0.1)", color: "#E5A00D", fontFamily: "JetBrains Mono,monospace" }}>{v}</span>)}</div>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {group.phrases.map((phrase, pIdx) => (
              <div key={pIdx} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <input value={phrase} onChange={(e) => updatePhrase(gIdx, pIdx, e.target.value)} placeholder="Phrase..." style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "white", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
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

// ── Icon + accent helpers ──

const ICON_MAP = { "intro": Sparkles, "onboarding": MonitorPlay, "overview": BarChart3, "compare": ArrowDownUp, "ranking": Layers, "finale": Sparkles }
function getSlideIcon(id) {
  if (ICON_MAP[id]) return ICON_MAP[id]
  if (id.includes("cat-")) return Clapperboard
  if (id.includes("-pod")) return Trophy
  if (id.includes("-stats") || id.includes("-bilan")) return BarChart3
  if (id.includes("-deep")) return Search
  if (id.includes("-genres") || id.includes("-favorites")) return PieChart
  return Tv
}

const SLIDE_ACCENT_KEY = { "intro": "primary", "overview": "films", "compare": null, "ranking": null, "finale": "primary" }
function getSlideAccentKey(slideId) {
  if (SLIDE_ACCENT_KEY[slideId] !== undefined) return SLIDE_ACCENT_KEY[slideId]
  if (slideId.includes("-series")) return "series"
  if (slideId.startsWith("overseerr") || slideId.startsWith("cat-overseerr")) return "overseerr"
  const svc = slideId.replace(/^cat-/, "").split("-")[0]
  const map = { tautulli: "films", plex: "films", jellyfin: "films", romm: "romm", audiobookshelf: "audio", komga: "komga", booklore: "booklore" }
  return map[svc] || null
}

// ── Section detection ──

function getSection(s) {
  if (s.id === "intro" || s.id === "onboarding") return "intro"
  if (s.id === "finale") return "finale"
  if (s.id?.startsWith("cat-overseerr") || s.id?.startsWith("overseerr-")) return "demandes"
  if (s.id?.startsWith("cat-community") || s.id?.startsWith("community-")) return "communaute"
  if (s.id === "compare" || s.id === "ranking" || s.id === "classement-serveur") return "global"
  // tautulli films vs series
  if (s._service === "tautulli" || s._service === "plex") {
    if (s.id?.includes("-series")) return s._service + "-series"
    return s._service + "-films"
  }
  if (s._service) return s._service
  return "global"
}

const SECTION_META = {
  intro: { label: "Introduction", icon: "✨", locked: true },
  "tautulli-films": { label: "Films", icon: "🎬" },
  "tautulli-series": { label: "Series", icon: "📺" },
  "plex-films": { label: "Films", icon: "🎬" },
  "plex-series": { label: "Series", icon: "📺" },
  jellyfin: { label: "Jellyfin", icon: "📺" },
  romm: { label: "Jeux Video", icon: "🎮" },
  audiobookshelf: { label: "Livres Audio", icon: "🎧" },
  komga: { label: "Manga", icon: "📚" },
  booklore: { label: "Livres", icon: "📖" },
  communaute: { label: "Communaute", icon: "👥" },
  demandes: { label: "Demandes", icon: "📋" },
  global: { label: "Global", icon: "🌐" },
  finale: { label: "Finale", icon: "🎆", locked: true },
}

// ── Main component ──

export default function SlideManager() {
  const [slides, setSlides] = useState([])
  const [expanded, setExpanded] = useState(null)
  const [collapsedSections, setCollapsedSections] = useState({})
  const [saving, setSaving] = useState(false)
  const [services, setServices] = useState([])
  const [themeAccents, setThemeAccents] = useState({})
  const [themePrimary, setThemePrimary] = useState("#E5A00D")

  const hasTmdb = services.includes("tmdb")

  useEffect(() => {
    Promise.all([
      api("/admin/all-services").catch(() => api("/services").catch(() => [])),
      api("/admin/config").catch(() => ({})),
      api("/themes").catch(() => []),
      api("/auth/me").catch(() => ({})),
    ]).then(([svcs, globalConfig, themes, me]) => {
      const activeTheme = themes.find((t) => t.id === me.theme_pack_id) || themes[0]
      const palette = activeTheme?.config?.palette || {}
      setThemePrimary(palette.primary || "#E5A00D")
      setThemeAccents(palette.accents || {})

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

      if (savedOrder.length > 0) {
        const currentIds = new Set(ordered.map((s) => s.id))
        const savedIds = new Set(savedOrder)
        const allPresent = [...currentIds].every((id) => savedIds.has(id))
        if (allPresent) {
          const byId = {}
          for (const s of ordered) byId[s.id] = s
          const reordered = []
          for (const id of savedOrder) { if (byId[id]) reordered.push(byId[id]) }
          for (const s of ordered) { if (!reordered.find((r) => r.id === s.id)) reordered.push(s) }
          ordered = reordered
        }
      }
      setSlides(ordered)
    })
  }, [])

  const toggle = (id) => {
    setSlides(slides.map((s) => {
      if (s.id !== id || s.locked) return s
      if (s.tmdb && !hasTmdb) return s
      return { ...s, enabled: !s.enabled }
    }))
  }

  const updateParam = (slideId, key, value) => {
    setSlides(slides.map((s) => s.id === slideId ? { ...s, settings: { ...s.settings, [key]: value } } : s))
  }

  const moveUp = (idx) => {
    if (idx <= 0 || slides[idx - 1]?.locked) return
    const next = [...slides]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    setSlides(next)
  }

  const moveDown = (idx) => {
    if (idx >= slides.length - 1 || slides[idx + 1]?.locked) return
    const next = [...slides]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    setSlides(next)
  }

  // Build section groups
  const sections = []
  let currentSection = null
  for (const s of slides) {
    const sec = getSection(s)
    if (sec !== currentSection) {
      currentSection = sec
      sections.push({ key: sec, slides: [s] })
    } else {
      sections[sections.length - 1].slides.push(s)
    }
  }

  const moveSectionUp = (secIdx) => {
    if (secIdx <= 0) return
    const prev = sections[secIdx - 1]
    const curr = sections[secIdx]
    if (SECTION_META[prev.key]?.locked || SECTION_META[curr.key]?.locked) return
    // Swap all slides of both sections
    const newSlides = [...slides]
    const prevStart = newSlides.indexOf(prev.slides[0])
    const currStart = newSlides.indexOf(curr.slides[0])
    const prevSlides = newSlides.splice(prevStart, prev.slides.length)
    // After splice, currStart shifted
    const newCurrStart = newSlides.indexOf(curr.slides[0])
    newSlides.splice(newCurrStart + curr.slides.length, 0, ...prevSlides)
    setSlides(newSlides)
  }

  const moveSectionDown = (secIdx) => {
    if (secIdx >= sections.length - 1) return
    const curr = sections[secIdx]
    const next = sections[secIdx + 1]
    if (SECTION_META[curr.key]?.locked || SECTION_META[next.key]?.locked) return
    moveSectionUp(secIdx + 1)
  }

  const resetOrder = () => {
    const registry = expandRegistry(services)
    const savedMap = {}
    for (const s of slides) savedMap[s.id] = { enabled: s.enabled, settings: s.settings }
    setSlides(registry.map((s) => ({ ...s, enabled: savedMap[s.id]?.enabled ?? true, settings: savedMap[s.id]?.settings ?? {} })))
  }

  const save = async () => {
    setSaving(true)
    const settings = {}
    for (const s of slides) settings[s.id] = { enabled: s.enabled, ...s.settings }
    const order = slides.map((s) => s.id)
    try { await api("/admin/config", { method: "PATCH", body: { slide_settings: settings, slide_order: order } }) } catch {}
    setSaving(false)
  }

  const toggleSection = (key) => setCollapsedSections(p => ({ ...p, [key]: !p[key] }))

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
        <h2 style={h2}>Configuration des slides</h2>
        <button onClick={resetOrder} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", background: "none", color: "rgba(255,255,255,0.35)", fontSize: 11, cursor: "pointer" }}>
          <RotateCcw size={12} /> Reset ordre
        </button>
      </div>
      <p style={desc}>Organisez les slides par section. Deplacez les sections ou les slides individuellement.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {sections.map((sec, secIdx) => {
          const meta = SECTION_META[sec.key] || { label: sec.key, icon: "📦" }
          const isCollapsed = collapsedSections[sec.key]
          const isLocked = meta.locked
          const nonLockedSlides = sec.slides.filter(s => !s.locked)
          const enabledCount = sec.slides.filter(s => s.enabled).length
          const allOn = nonLockedSlides.length > 0 && nonLockedSlides.every(s => s.enabled)

          const toggleAllSection = (e) => {
            e.stopPropagation()
            if (isLocked) return
            const newEnabled = !allOn
            const ids = new Set(nonLockedSlides.map(s => s.id))
            setSlides(slides.map(s => ids.has(s.id) ? { ...s, enabled: newEnabled } : s))
          }

          return (
            <div key={sec.key + secIdx} style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
              {/* Section header */}
              <div
                onClick={() => toggleSection(sec.key)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
                  background: "rgba(255,255,255,0.03)", cursor: "pointer",
                  borderBottom: isCollapsed ? "none" : "1px solid rgba(255,255,255,0.04)",
                }}
              >
                {!isLocked ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                    <button onClick={(e) => { e.stopPropagation(); moveSectionUp(secIdx) }} style={arrowBtn}><ArrowUp size={10} /></button>
                    <button onClick={(e) => { e.stopPropagation(); moveSectionDown(secIdx) }} style={arrowBtn}><ArrowDown size={10} /></button>
                  </div>
                ) : <Lock size={13} color="rgba(255,255,255,0.1)" style={{ flexShrink: 0 }} />}
                <span style={{ fontSize: 16 }}>{meta.icon}</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{meta.label}</span>
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginLeft: 8 }}>{enabledCount}/{sec.slides.length}</span>
                </div>
                {!isLocked && (
                  <button onClick={toggleAllSection} style={{
                    padding: "3px 10px", borderRadius: 5, border: "none", fontSize: 9, fontFamily: "JetBrains Mono,monospace", flexShrink: 0, cursor: "pointer",
                    background: allOn ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                    color: allOn ? "#4ade80" : "#f87171",
                  }}>{allOn ? "on" : "off"}</button>
                )}
                {isCollapsed ? <ChevronRight size={14} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={14} color="rgba(255,255,255,0.3)" />}
              </div>

              {/* Section slides */}
              {!isCollapsed && (
                <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "4px" }}>
                  {sec.slides.map((s) => {
                    const globalIdx = slides.indexOf(s)
                    const isExp = expanded === s.id
                    const hasParams = s.params && s.params.length > 0
                    const hasAccent = !!getSlideAccentKey(s.id)
                    const isExpandable = hasParams || hasAccent
                    const Icon = getSlideIcon(s.id)

                    return (
                      <div key={s.id}>
                        <div
                          onClick={() => isExpandable && setExpanded(isExp ? null : s.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "8px 10px",
                            borderRadius: isExp && isExpandable ? "8px 8px 0 0" : 8,
                            background: s.enabled ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.005)",
                            border: "1px solid " + (isExp ? "rgba(255,255,255,0.08)" : "transparent"),
                            borderBottom: isExp && isExpandable ? "none" : undefined,
                            opacity: s.enabled ? 1 : 0.4, cursor: isExpandable ? "pointer" : "default",
                          }}
                        >
                          {!s.locked ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                              <button onClick={(e) => { e.stopPropagation(); moveUp(globalIdx) }} style={arrowBtnSm}><ArrowUp size={8} /></button>
                              <button onClick={(e) => { e.stopPropagation(); moveDown(globalIdx) }} style={arrowBtnSm}><ArrowDown size={8} /></button>
                            </div>
                          ) : <Lock size={11} color="rgba(255,255,255,0.08)" style={{ flexShrink: 0, width: 16 }} />}
                          <Icon size={13} color={s.cat ? "#E5A00D" : s.pod ? "#fb923c" : "rgba(255,255,255,0.25)"} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <span style={{ fontSize: 11, fontWeight: 600, color: "white" }}>{s.label}</span>
                              {s.cat && <span style={badge("#E5A00D")}>section</span>}
                              {s.pod && <span style={badge("#fb923c")}>podium</span>}
                              {s.tmdb && <span style={badge(hasTmdb ? "#06b6d4" : "#ef4444")}>{hasTmdb ? "TMDB" : "TMDB requis"}</span>}
                            </div>
                            <div style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.desc}</div>
                          </div>
                          {isExpandable && (isExp ? <ChevronDown size={12} color="rgba(255,255,255,0.25)" /> : <ChevronRight size={12} color="rgba(255,255,255,0.12)" />)}
                          <button onClick={(e) => { e.stopPropagation(); toggle(s.id) }} disabled={s.locked || (s.tmdb && !hasTmdb)} style={{
                            padding: "3px 8px", borderRadius: 4, border: "none", fontSize: 9, fontFamily: "JetBrains Mono,monospace", flexShrink: 0,
                            background: s.enabled ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)",
                            color: s.enabled ? "#4ade80" : "#f87171",
                            cursor: (s.locked || (s.tmdb && !hasTmdb)) ? "default" : "pointer",
                            opacity: s.locked ? 0.3 : 1,
                          }}>{s.enabled ? "on" : "off"}</button>
                        </div>

                        {/* Expanded params */}
                        {isExp && isExpandable && (
                          <div style={{
                            padding: "10px 12px", borderRadius: "0 0 8px 8px",
                            background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "none",
                            display: "flex", flexDirection: "column", gap: 8,
                          }}>
                            {/* Accent color */}
                            {(() => {
                              const accentKey = getSlideAccentKey(s.id)
                              if (!accentKey) return null
                              const themeColor = accentKey === "primary" ? themePrimary : (themeAccents[accentKey] || themePrimary)
                              const override = s.settings.accentOverride || ""
                              const isCustom = !!override
                              return (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, paddingBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Couleur</label>
                                    <div style={{ width: 18, height: 18, borderRadius: 4, background: isCustom ? override : themeColor, border: "1px solid rgba(255,255,255,0.15)", flexShrink: 0 }} />
                                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "JetBrains Mono,monospace" }}>{isCustom ? override : `theme: ${accentKey}`}</span>
                                  </div>
                                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                    <input type="color" value={isCustom ? override : themeColor} onChange={(e) => updateParam(s.id, "accentOverride", e.target.value)} style={{ width: 24, height: 20, border: "none", background: "none", cursor: "pointer", padding: 0 }} />
                                    {isCustom && <button onClick={() => updateParam(s.id, "accentOverride", "")} style={{ background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.3)", fontSize: 8, padding: "2px 6px", cursor: "pointer", fontFamily: "JetBrains Mono,monospace" }}>reset</button>}
                                  </div>
                                </div>
                              )
                            })()}
                            {/* Params */}
                            {s.params.filter((p) => {
                              if (!p.showWhen) return true
                              return (s.settings[p.showWhen.key] ?? s.params.find((x) => x.key === p.showWhen.key)?.default) === p.showWhen.value
                            }).map((p) => (
                              <div key={p.key} style={(p.type === "commentary" || p.type === "profiles") ? { display: "flex", flexDirection: "column", gap: 4 } : { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                                <label style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", flex: (p.type === "commentary" || p.type === "profiles") ? undefined : 1 }}>{p.label}</label>
                                {p.type === "number" && <input type="number" value={s.settings[p.key] ?? p.default} onChange={(e) => updateParam(s.id, p.key, parseInt(e.target.value) || 0)} style={inputNum} />}
                                {p.type === "text" && <input type="text" value={s.settings[p.key] ?? p.default} onChange={(e) => updateParam(s.id, p.key, e.target.value)} placeholder={p.default || p.label} style={{ ...inputNum, width: 160, textAlign: "left" }} />}
                                {p.type === "bool" && <button onClick={() => updateParam(s.id, p.key, !(s.settings[p.key] ?? p.default))} style={{ padding: "3px 10px", borderRadius: 5, border: "none", fontSize: 10, fontFamily: "JetBrains Mono,monospace", cursor: "pointer", background: (s.settings[p.key] ?? p.default) ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.08)", color: (s.settings[p.key] ?? p.default) ? "#4ade80" : "#f87171" }}>{(s.settings[p.key] ?? p.default) ? "on" : "off"}</button>}
                                {p.type === "select" && <select value={s.settings[p.key] ?? p.default} onChange={(e) => updateParam(s.id, p.key, e.target.value)} style={selectStyle}>{p.options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>}
                                {p.type === "commentary" && <CommentaryEditor value={s.settings[p.key] || p.default} onChange={(val) => updateParam(s.id, p.key, val)} />}
                                {p.type === "profiles" && <ProfilesEditor value={s.settings[p.key] || p.default} onChange={(val) => updateParam(s.id, p.key, val)} />}
                                {p.type === "phrases" && (() => {
                                  const items = s.settings[p.key] || p.default || []
                                  return (
                                    <div style={{ width: "100%", marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                                      {items.map((phrase, pi) => (
                                        <div key={pi} style={{ display: "flex", gap: 4, alignItems: "center" }}>
                                          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "JetBrains Mono,monospace", width: 16, textAlign: "center", flexShrink: 0 }}>{pi + 1}</span>
                                          <input value={phrase} onChange={(e) => { const next = [...items]; next[pi] = e.target.value; updateParam(s.id, p.key, next) }} placeholder="Phrase..." style={{ flex: 1, padding: "5px 8px", borderRadius: 5, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "white", fontSize: 11, outline: "none", boxSizing: "border-box" }} />
                                          <button onClick={() => updateParam(s.id, p.key, items.filter((_, i) => i !== pi))} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.2)", cursor: "pointer", fontSize: 14, padding: "0 4px", flexShrink: 0 }}>×</button>
                                        </div>
                                      ))}
                                      <button onClick={() => updateParam(s.id, p.key, [...items, ""])} style={{ background: "none", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 5, color: "rgba(255,255,255,0.25)", fontSize: 10, padding: "3px 10px", cursor: "pointer", width: "100%" }}>+ ajouter une phrase</button>
                                    </div>
                                  )
                                })()}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
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
const arrowBtn = { background: "none", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 4, color: "rgba(255,255,255,0.3)", padding: "2px 4px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
const arrowBtnSm = { background: "none", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 3, color: "rgba(255,255,255,0.2)", padding: "1px 3px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }
