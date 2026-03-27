export default function IntroSlide({ accent, userName, year, onStart, hasComparison }) {
  const handleStart = () => {
    // Request fullscreen
    const el = document.documentElement
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {})
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    // Go to next slide
    if (onStart) onStart()
  }

  return <div style={{ textAlign: "center", maxWidth: "clamp(300px, 80vw, 400px)", width: "100%" }}>
    <div style={{ position: "relative", width: "clamp(80px, 22vw, 130px)", height: "clamp(80px, 22vw, 130px)", margin: "0 auto clamp(16px, 4vw, 26px)" }}>
      {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1.5px solid " + accent, animation: "pulse-ring 3s ease-out " + (i * 0.8) + "s infinite" }} />)}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", filter: "drop-shadow(0 0 40px " + accent + "90)" }}>
        <img src="/icon.svg" alt="Wrapparr" style={{ width: "55%", height: "55%" }} />
      </div>
    </div>
    <div className="s0" style={{ fontSize: 9, color: accent, letterSpacing: ".35em", fontFamily: "JetBrains Mono,monospace", textTransform: "uppercase" }}>WRAPPARR · RECAP ANNUEL</div>
    <h1 className="s1" style={{ fontSize: "clamp(32px, 10vw, 72px)", fontWeight: 800, color: "white", lineHeight: 0.88, margin: "10px 0 6px", textShadow: "0 0 120px " + accent + "55" }}>
      WRAP<span style={{ background: "linear-gradient(135deg," + accent + ",#fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PARR</span>
    </h1>
    <p className="s2" style={{ fontSize: 16, color: "rgba(255,255,255,.42)", margin: "14px 0 4px" }}>Bienvenue, <span style={{ color: "white", fontWeight: 600 }}>{userName}</span></p>
    <p className="s3" style={{ fontSize: 12, color: "rgba(255,255,255,.2)", marginBottom: 34, fontFamily: "JetBrains Mono,monospace" }}>Ton annee {year}<span style={{ animation: "blink-c 1s step-end infinite" }}>|</span></p>
    <button className="s4" onClick={handleStart} style={{ padding: "14px 42px", borderRadius: 40, border: "none", cursor: "pointer", background: "linear-gradient(135deg," + accent + ",#fb923c)", color: "#000", fontSize: 15, fontWeight: 800, boxShadow: "0 0 70px " + accent + "55" }}>Decouvrir →</button>

    {/* Hints */}
    <div className="s5" style={{ marginTop: 28, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
      {hasComparison && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: accent + "10", border: "1px solid " + accent + "25", backdropFilter: "blur(8px)", animation: "pulse-hint 2.5s ease-in-out infinite", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(105deg, transparent 40%, ${accent}20 50%, transparent 60%)`, animation: "badge-shine 3s ease-in-out infinite", pointerEvents: "none" }} />
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" style={{ position: "relative", flexShrink: 0 }}><path d="M18 20V10M12 20V4M6 20v-6" /></svg>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", position: "relative" }}>
            Compare avec <span style={{ color: accent, fontWeight: 700 }}>{year - 1}</span>
          </span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
          Change l'annee en haut
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 20, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0 }}><path d="M5 15l7-7 7 7" /><path d="M5 9l7 7 7-7" /></svg>
        <span style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
          Fleches ou swipe pour naviguer
        </span>
      </div>
    </div>
  </div>
}
