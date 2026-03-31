export default function Compass() {
  return <div className="th-compass">
    <svg viewBox="0 0 50 50" fill="none">
      <circle cx="25" cy="25" r="23" stroke="rgba(210,170,100,0.3)" strokeWidth="1" />
      <circle cx="25" cy="25" r="18" stroke="rgba(210,170,100,0.15)" strokeWidth="0.5" />
      <path d="M25 2 L27 25 L25 48 L23 25 Z" fill="rgba(210,170,100,0.2)" />
      <path d="M2 25 L25 23 L48 25 L25 27 Z" fill="rgba(210,170,100,0.15)" />
      <text x="25" y="9" textAnchor="middle" fill="rgba(210,170,100,0.4)" fontSize="5" fontFamily="serif">N</text>
    </svg>
  </div>
}
