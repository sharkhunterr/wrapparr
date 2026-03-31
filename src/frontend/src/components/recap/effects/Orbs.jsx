export default function Orbs({ accent }) {
  return <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {[{ s: 680, x: "-18%", y: "-22%", d: "0s", o: 0.17 }, { s: 360, x: "60%", y: "56%", d: "5s", o: 0.09 }, { s: 220, x: "12%", y: "72%", d: "9s", o: 0.06 }].map((o, i) => (
      <div key={i} style={{ position: "absolute", borderRadius: "50%", width: o.s, height: o.s, left: o.x, top: o.y, background: `radial-gradient(circle,${accent} 0%,transparent 70%)`, opacity: o.o, filter: "blur(58px)", animation: `orb-drift ${10 + i * 3}s ease-in-out ${o.d} infinite`, transition: "background 0.8s ease" }} />
    ))}
  </div>
}
