export default function Spotlights({ accent, intensity = 1, fixed = false }) {
  const a = (v) => Math.round(v * intensity).toString(16).padStart(2, "0")
  const beams = [
    { left: "12%", w: "18vw", anim: "beam-1", dur: "11s", delay: "0s", op: a(38) },
    { left: "50%", w: "26vw", anim: "beam-3", dur: "17s", delay: "3.5s", op: a(30) },
    { left: "88%", w: "20vw", anim: "beam-2", dur: "9s", delay: "1.2s", op: a(34) },
  ]
  return (
    <div style={{ position: fixed ? "fixed" : "absolute", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: fixed ? 2 : 1 }}>
      {beams.map((b, i) => {
        const bg = "linear-gradient(180deg," + accent + b.op + " 0%," + accent + "07 50%,transparent 75%)"
        const anim = b.anim + " " + b.dur + " ease-in-out " + b.delay + " infinite"
        return <div key={i} style={{ position: "absolute", top: "-4%", left: b.left, width: b.w, height: "145%", transformOrigin: "top center", transform: "translateX(-50%)", background: bg, animation: anim, mixBlendMode: "screen" }} />
      })}
      {[12, 50, 88].map((x, i) => {
        const bg = "radial-gradient(circle," + accent + "65 0%," + accent + "22 45%,transparent 72%)"
        const anim = "flare-pulse " + (4.5 + i * 2.5) + "s ease-in-out " + (i * 2) + "s infinite"
        return <div key={i} style={{ position: "absolute", top: 0, left: x + "%", width: 70 + i * 18, height: 70 + i * 18, borderRadius: "50%", background: bg, transform: "translate(-50%,-50%)", animation: anim }} />
      })}
    </div>
  )
}
