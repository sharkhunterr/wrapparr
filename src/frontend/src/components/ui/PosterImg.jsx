import { useState } from "react"

export default function PosterImg({ src, fallbackEmoji = "🎬", width = 52, height = 76, radius = 7, style = {} }) {
  const [err, setErr] = useState(false)

  if (!src || err) {
    return (
      <div style={{
        width, height, borderRadius: radius, flexShrink: 0,
        background: "rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: height * 0.3, ...style,
      }}>
        {fallbackEmoji}
      </div>
    )
  }

  return (
    <img src={src} alt="" onError={() => setErr(true)}
      style={{ width, height, borderRadius: radius, objectFit: "cover", flexShrink: 0, ...style }} />
  )
}
