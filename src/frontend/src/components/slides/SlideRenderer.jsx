import { useState, useEffect, useCallback } from "react"
import IntroSlide from "./IntroSlide"
import OverviewSlide from "./OverviewSlide"
import CategorySlide from "./CategorySlide"
import PodiumSlide from "./PodiumSlide"
import StatsSlide from "./StatsSlide"
import DeepSlide from "./DeepSlide"
import CompareSlide from "./CompareSlide"
import RankingSlide from "./RankingSlide"
import FinaleSlide from "./FinaleSlide"
import Grain from "../ambient/Grain"

const SERVICE_META = {
  tautulli: { icon: "🎬", label: "Films & Séries", sub: "Tes stats Plex cette année", catAccent: "#E5A00D", catBg: "#0c0600" },
  plex: { icon: "🎬", label: "Films & Séries", sub: "Tes stats Plex cette année", catAccent: "#E5A00D", catBg: "#0c0600" },
  jellyfin: { icon: "📺", label: "Jellyfin", sub: "Tes stats Jellyfin", catAccent: "#00a4dc", catBg: "#000a14" },
  romm: { icon: "🎮", label: "Jeux", sub: "Tes stats gaming cette année", catAccent: "#34d399", catBg: "#010a05" },
  audiobookshelf: { icon: "🎧", label: "Livres Audio", sub: "Tes écoutes cette année", catAccent: "#fb923c", catBg: "#0a0300" },
  komga: { icon: "📚", label: "Manga", sub: "Tes lectures cette année", catAccent: "#c084fc", catBg: "#060012" },
  booklore: { icon: "📖", label: "Livres", sub: "Tes lectures cette année", catAccent: "#a78bfa", catBg: "#050010" },
}

const CSS_ANIMATIONS = `
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes slide-up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes orb-drift{0%{transform:translate(0,0) scale(1)}40%{transform:translate(26px,-16px) scale(1.06)}75%{transform:translate(-18px,22px) scale(0.94)}100%{transform:translate(0,0) scale(1)}}
@keyframes pulse-ring{0%{transform:scale(0.82);opacity:0.9}100%{transform:scale(2.6);opacity:0}}
@keyframes bar-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes cpop{0%{transform:scale(0.4);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes flash-n{0%{filter:brightness(1)}28%{filter:brightness(4.5) saturate(3)}100%{filter:brightness(1)}}
@keyframes star-tw{0%,100%{opacity:0;transform:scale(0.3)}50%{opacity:0.85;transform:scale(1)}}
@keyframes badge-p{0%{transform:scale(0) rotate(-14deg);opacity:0}68%{transform:scale(1.1) rotate(2deg)}100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes confetti-f{0%{transform:translateY(-20px) rotate(0deg);opacity:1}80%{opacity:1}100%{transform:translateY(110vh) rotate(780deg) scale(0.3);opacity:0}}
@keyframes holo-idle{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
@keyframes cat-icon-in{0%{transform:scale(0) rotate(-180deg);opacity:0;filter:brightness(8)}60%{transform:scale(1.15) rotate(6deg);opacity:1}100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes cat-title-in{0%{clip-path:inset(0 100% 0 0);opacity:0}100%{clip-path:inset(0 0% 0 0);opacity:1}}
@keyframes cat-bar-in{0%{transform:scaleX(0);transform-origin:left}100%{transform:scaleX(1);transform-origin:left}}
@keyframes cat-glow{0%,100%{opacity:0.6}50%{opacity:1}}
@keyframes platform-rise{0%{transform:translateY(180px);opacity:0}60%{transform:translateY(-8px);opacity:1}80%{transform:translateY(4px)}100%{transform:translateY(0);opacity:1}}
@keyframes poster-appear{0%{transform:scale(0.3) translateY(20px) rotate(-8deg);opacity:0;filter:brightness(3)}60%{transform:scale(1.08) translateY(-4px) rotate(1deg);opacity:1}100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes rank-stamp{0%{transform:scale(3) rotate(-20deg);opacity:0;filter:brightness(5)}50%{transform:scale(0.9) rotate(3deg);opacity:1}100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes crown-bounce{0%,100%{transform:translateY(0) rotate(-5deg) scale(1)}30%{transform:translateY(-12px) rotate(5deg) scale(1.2)}60%{transform:translateY(-6px) rotate(-3deg) scale(1.1)}}
@keyframes joke-in{0%{opacity:0;transform:translateY(14px)}100%{opacity:1;transform:translateY(0)}}
@keyframes trophy-spin{0%{transform:rotateY(0deg) scale(1)}50%{transform:rotateY(180deg) scale(1.1)}100%{transform:rotateY(360deg) scale(1)}}
@keyframes beam-1{0%{transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}20%{transform:rotate(-12deg) scaleX(1.3) translateX(10%);opacity:0.9}45%{transform:rotate(6deg) scaleX(0.7) translateX(30%);opacity:0.55}70%{transform:rotate(-20deg) scaleX(1.1) translateX(-5%);opacity:0.8}100%{transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}}
@keyframes beam-2{0%{transform:rotate(28deg) scaleX(0.6) translateX(35%);opacity:0.25}25%{transform:rotate(8deg) scaleX(1.25) translateX(-5%);opacity:0.85}55%{transform:rotate(-5deg) scaleX(0.75) translateX(-25%);opacity:0.5}80%{transform:rotate(18deg) scaleX(1.0) translateX(15%);opacity:0.7}100%{transform:rotate(28deg) scaleX(0.6) translateX(35%);opacity:0.25}}
@keyframes beam-3{0%{transform:rotate(-8deg) scaleX(0.9) translateX(5%);opacity:0.2}30%{transform:rotate(15deg) scaleX(0.5) translateX(20%);opacity:0.5}60%{transform:rotate(-22deg) scaleX(1.4) translateX(-15%);opacity:0.75}100%{transform:rotate(-8deg) scaleX(0.9) translateX(5%);opacity:0.2}}
@keyframes flare-pulse{0%,100%{transform:translate(-50%,-50%) scale(0.6);opacity:0.3}50%{transform:translate(-50%,-50%) scale(1.8);opacity:0.85}}
.s0{animation:slide-up .5s ease .00s both}.s1{animation:slide-up .5s ease .10s both}
.s2{animation:slide-up .5s ease .20s both}.s3{animation:slide-up .5s ease .30s both}
.glass{background:rgba(255,255,255,0.037);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.07);border-radius:14px}
`

export default function SlideRenderer({ recapData, userName = "", year = 2024 }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Build slides list from recap data
  const slides = buildSlides(recapData, userName, year)

  const handleScroll = useCallback((e) => {
    if (e.deltaY > 0 && currentSlide < slides.length - 1) {
      setCurrentSlide((s) => s + 1)
    } else if (e.deltaY < 0 && currentSlide > 0) {
      setCurrentSlide((s) => s - 1)
    }
  }, [currentSlide, slides.length])

  useEffect(() => {
    window.addEventListener("wheel", handleScroll, { passive: true })
    return () => window.removeEventListener("wheel", handleScroll)
  }, [handleScroll])

  if (!slides.length) return null

  return (
    <>
      <style>{CSS_ANIMATIONS}</style>
      <Grain />
      <div style={{ transition: "transform 0.6s cubic-bezier(0.25,0.1,0.25,1)", transform: `translateY(-${currentSlide * 100}vh)` }}>
        {slides.map((slide, i) => (
          <div key={i} style={{ height: "100vh", width: "100vw" }}>
            {slide}
          </div>
        ))}
      </div>
    </>
  )
}

function buildSlides(data, userName, year) {
  if (!data) return []

  const slides = []
  const globalStats = data.global || {}

  // Intro
  slides.push(<IntroSlide accent="#E5A00D" bg="#05050e" userName={userName} year={year} />)

  // Overview
  slides.push(<OverviewSlide accent="#a78bfa" bg="#080618" globalStats={globalStats} />)

  // Per-service slides
  const serviceOrder = ["tautulli", "plex", "jellyfin", "romm", "audiobookshelf", "komga", "booklore"]
  for (const svc of serviceOrder) {
    const svcData = data[svc]
    if (!svcData) continue
    const meta = SERVICE_META[svc] || {}

    // Category announcement
    slides.push(<CategorySlide accent={meta.catAccent} bg={meta.catBg} icon={meta.icon} label={meta.label} sub={meta.sub} />)

    // Podium
    if (svcData.top?.length > 0) {
      slides.push(<PodiumSlide accent={meta.catAccent} bg={meta.catBg} category={svc} top={svcData.top} />)
    }

    // Stats
    slides.push(<StatsSlide accent={meta.catAccent} bg={meta.catBg} serviceData={svcData} serviceName={meta.label} />)

    // Deep dive
    slides.push(<DeepSlide accent={meta.catAccent} bg={meta.catBg} serviceData={svcData} serviceName={meta.label} userName={userName} />)
  }

  // Compare (if data available)
  if (data.comparison) {
    slides.push(<CompareSlide compareData={data.comparison} />)
  }

  // Global ranking (if data available)
  if (data.global?.users) {
    slides.push(<RankingSlide globalRanking={data.global.users} userName={userName} />)
  }

  // Finale
  slides.push(<FinaleSlide accent="#E5A00D" bg="#05050e" userName={userName} year={year} globalStats={globalStats} />)

  return slides
}
