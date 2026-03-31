export default function NavChevron({ direction, onClick }) {
  const isDown = direction === "down"
  const chevron = (opacity) => (
    <svg width="18" height="10" viewBox="0 0 18 10" style={{ opacity }}>
      <path d={isDown ? "M2 2l7 6 7-6" : "M2 8l7-6 7 6"} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return (
    <div onClick={onClick} style={{
      position: "fixed", [isDown ? "bottom" : "top"]: isDown ? 14 : 42, left: 0, right: 0,
      cursor: "pointer", zIndex: 100, display: "flex", flexDirection: "column", alignItems: "center",
      animation: (isDown ? "bounce-down" : "bounce-up") + " 2s ease-in-out infinite",
      pointerEvents: "none",
    }}>
      <div style={{ pointerEvents: "auto" }}>
        {!isDown && chevron(0.2)}
        {isDown && chevron(0.12)}
        {isDown && <div style={{ marginTop: -3 }}>{chevron(0.22)}</div>}
        {!isDown && <div style={{ marginTop: -3 }}>{chevron(0.12)}</div>}
      </div>
    </div>
  )
}
