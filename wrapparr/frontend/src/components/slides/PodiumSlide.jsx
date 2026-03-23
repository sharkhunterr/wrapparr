import { useState, useEffect } from "react"
import Spotlights from "../ambient/Spotlights"
import PosterImg from "../ui/PosterImg"

const PODIUM_DELAYS = [400, 1100, 2000]
const PODIUM_H = [88, 110, 132]

const DEFAULT_JOKES = {
  films: ["67 films cette année...", "Soit 5 jours sans dormir.", "Il a ri, pleuré, et mangé des chips.", "Voici le podium officiel 🎬"],
  series: ["312 épisodes. En une seule année.", "C'est 8 binges complets.", "Sa série préférée ? Suspense.", "Le verdict tombe 🎭"],
  romm: ["24 jeux. 186 heures.", "Sa session la plus longue : 11h.", "Les voisins ont entendu.", "Voici le top 🎮"],
  audio: ["11 livres audio en 2024.", "Mode sci-fi hardcore.", "3 univers différents.", "Le palmarès s'affiche 🎧"],
  komga: ["89 volumes de manga.", "7 volumes par mois.", "4 arcs qui font pleurer.", "Le podium s'illumine 📚"],
}

export default function PodiumSlide({ accent, bg, category, top = [], jokes, customPhrases }) {
  const [phase, setPhase] = useState("waiting")
  const [jokeIdx, setJokeIdx] = useState(0)
  const [revealed, setRevealed] = useState([false, false, false])

  const jokeList = customPhrases || jokes || DEFAULT_JOKES[category] || []

  useEffect(() => {
    // Phase 1: jokes
    const t1 = setTimeout(() => setPhase("jokes"), 800)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (phase !== "jokes") return
    if (jokeIdx < jokeList.length - 1) {
      const t = setTimeout(() => setJokeIdx((i) => i + 1), 2200)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => setPhase("reveal"), 2000)
      return () => clearTimeout(t)
    }
  }, [phase, jokeIdx, jokeList.length])

  useEffect(() => {
    if (phase !== "reveal") return
    PODIUM_DELAYS.forEach((delay, i) => {
      setTimeout(() => setRevealed((r) => { const n = [...r]; n[i] = true; return n }), delay)
    })
  }, [phase])

  const order = [2, 0, 1] // #3, #1, #2 display order

  return (
    <div style={{ width: "100%", height: "100vh", background: bg, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", overflow: "hidden" }}>
      <Spotlights accent={accent} intensity={phase === "reveal" ? 1 : 0.3} />

      {/* Jokes */}
      {phase === "jokes" && (
        <div style={{ position: "absolute", top: "35%", left: 0, right: 0, textAlign: "center", zIndex: 10 }}>
          <div style={{ fontSize: 22, color: "white", fontFamily: "Nunito,sans-serif", fontWeight: 500, padding: "0 40px", animation: "joke-in .5s ease both" }} key={jokeIdx}>
            {jokeList[jokeIdx]}
          </div>
        </div>
      )}

      {/* Podium */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "0 20px 0", width: "100%", maxWidth: 420, zIndex: 10, marginBottom: 0 }}>
        {order.map((rankIdx) => {
          const item = top[rankIdx === 0 ? 0 : rankIdx === 1 ? 1 : 2]
          if (!item) return null
          const isOne = rankIdx === 0
          const realRank = 3 - rankIdx
          const platH = PODIUM_H[rankIdx]

          return (
            <div key={rankIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: revealed[rankIdx] ? 1 : 0, transition: "opacity .1s", flex: isOne ? 1.15 : 1 }}>
              {isOne && revealed[rankIdx] && <div style={{ fontSize: 24, marginBottom: 4, animation: "crown-bounce 1.8s ease-in-out infinite", filter: `drop-shadow(0 0 12px ${accent})` }}>👑</div>}
              {revealed[rankIdx] && <div style={{ fontSize: isOne ? 38 : 28, fontWeight: 800, marginBottom: 6, fontFamily: "Nunito,sans-serif", color: accent, lineHeight: 1, textShadow: `0 0 30px ${accent}`, animation: "rank-stamp .5s cubic-bezier(0.34,1.56,0.64,1) both" }}>#{realRank}</div>}
              {revealed[rankIdx] && <div style={{ animation: "poster-appear .65s cubic-bezier(0.34,1.3,0.64,1) both", marginBottom: 8 }}>
                <PosterImg src={item.poster} width={isOne ? 74 : 56} height={isOne ? 108 : 82} />
              </div>}
              <div style={{
                width: "100%", borderRadius: "6px 6px 0 0", height: platH,
                background: revealed[rankIdx] ? `linear-gradient(180deg,${accent}38 0%,${accent}18 100%)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${revealed[rankIdx] ? accent + "55" : "rgba(255,255,255,0.05)"}`, borderBottom: "none",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "10px 6px",
                animation: revealed[rankIdx] ? "platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both" : "none",
              }}>
                {revealed[rankIdx] && <>
                  <div style={{ color: "white", fontWeight: 700, fontFamily: "Nunito,sans-serif", fontSize: isOne ? 11 : 9, textAlign: "center", lineHeight: 1.2, marginBottom: 4 }}>
                    {item.t?.length > 16 ? item.t.slice(0, 14) + "…" : item.t}
                  </div>
                </>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
