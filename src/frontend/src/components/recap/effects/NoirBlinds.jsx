export default function NoirBlinds() {
  return <div style={{
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 2, opacity: 0.06,
    background: "repeating-linear-gradient(170deg, transparent 0px, transparent 18px, rgba(255,255,255,0.15) 18px, rgba(255,255,255,0.15) 20px)",
    animation: "th-blinds-sway 8s ease-in-out infinite",
  }}>
    <style>{`@keyframes th-blinds-sway{0%,100%{transform:translateY(0) skewY(0deg)}50%{transform:translateY(3px) skewY(0.3deg)}}`}</style>
  </div>
}
