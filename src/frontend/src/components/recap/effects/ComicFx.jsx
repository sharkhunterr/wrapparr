import { useState, useEffect } from "react"

const COMIC_WORDS = ["POW!", "BAM!", "BOOM!", "ZAP!", "WHAM!", "CRACK!", "SPLASH!", "BANG!"]
const COMIC_COLORS = ["#ff3366", "#ffcc00", "#33ccff", "#ff6633", "#66ff33", "#ff33cc"]

export default function ComicFx() {
  const [word, setWord] = useState(null)
  useEffect(() => {
    const show = () => {
      const w = COMIC_WORDS[Math.floor(Math.random() * COMIC_WORDS.length)]
      const c = COMIC_COLORS[Math.floor(Math.random() * COMIC_COLORS.length)]
      const x = 15 + Math.random() * 70
      const y = 15 + Math.random() * 60
      const rot = (Math.random() - 0.5) * 30
      setWord({ w, c, x, y, rot, key: Date.now() })
      setTimeout(() => setWord(null), 800)
    }
    const id = setInterval(show, 4000 + Math.random() * 3000)
    return () => clearInterval(id)
  }, [])
  if (!word) return null
  return <div key={word.key} style={{
    position: "fixed", left: word.x + "%", top: word.y + "%", zIndex: 48, pointerEvents: "none",
    transform: `translate(-50%,-50%) rotate(${word.rot}deg) scale(0)`,
    animation: "th-comic-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards",
    fontFamily: "'Bangers',cursive", fontSize: "clamp(40px, 10vw, 80px)",
    color: word.c, textShadow: `3px 3px 0 #000, -1px -1px 0 #000, 0 0 20px ${word.c}50`,
    WebkitTextStroke: "2px #000",
  }}>
    <style>{`@keyframes th-comic-pop{0%{transform:translate(-50%,-50%) rotate(${word.rot}deg) scale(0);opacity:0}50%{transform:translate(-50%,-50%) rotate(${word.rot}deg) scale(1.2);opacity:1}70%{transform:translate(-50%,-50%) rotate(${word.rot}deg) scale(0.95)}100%{transform:translate(-50%,-50%) rotate(${word.rot}deg) scale(1);opacity:0}}`}</style>
    {word.w}
  </div>
}
