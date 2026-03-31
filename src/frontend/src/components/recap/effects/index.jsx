import Orbs from "./Orbs"
import Stars from "./Stars"
import Spotlights from "./Spotlights"
import Grain from "./Grain"
import ConfettiEffect from "./ConfettiEffect"
import FireworksEffect from "./FireworksEffect"
import MatrixRain from "./MatrixRain"
import XmasLights from "./XmasLights"
import Sabers from "./Sabers"
import StarStreaks from "./StarStreaks"
import BloodDrips from "./BloodDrips"
import Snow from "./Snow"
import ChalkboardBg from "./ChalkboardBg"
import ChalkDust from "./ChalkDust"
import ComicFx from "./ComicFx"
import NoirRain from "./NoirRain"
import NoirBlinds from "./NoirBlinds"
import Bioluminescence from "./Bioluminescence"
import AbyssBubbles from "./AbyssBubbles"
import VhsHud from "./VhsHud"
import VhsTracking from "./VhsTracking"
import TerminalOverlay from "./TerminalOverlay"
import TypingTitles from "./TypingTitles"
import DimensionCrack from "./DimensionCrack"
import StrangerBars from "./StrangerBars"
import Spores from "./Spores"
import Waves from "./Waves"
import Compass from "./Compass"

export default function ThemeEffects({ eff, accent, fade, isCat, needSpotlights, spotlightIntensity, isCommunityTop, isFinale, slideConfigs }) {
  return <>
    {/* Ambient base effects */}
    {eff.stars !== false && <Stars />}
    {eff.orbs !== false && <Orbs accent={accent} />}
    {needSpotlights && eff.sabers && <Sabers intensity={spotlightIntensity} />}
    {needSpotlights && !eff.sabers && eff.spotlights !== false && <Spotlights accent={accent} intensity={spotlightIntensity} fixed={isCommunityTop} />}

    {/* Finale effects */}
    {isFinale && (slideConfigs?.settings?.finale?.confetti !== false) && eff.confetti !== false && <ConfettiEffect />}
    {isFinale && (slideConfigs?.settings?.finale?.fireworks !== false) && eff.fireworks !== false && <FireworksEffect active={true} />}
    {eff.grain !== false && <Grain />}

    {/* Theme overlays (CSS-only) */}
    {eff.scanlines && <div className="th-scanlines" />}
    {eff.grid && <div className="th-grid" />}
    {eff.vhs && <div className="th-vhs" />}
    {eff.filmGrain && <><div className="th-film-grain" /><div className="th-vignette" /></>}

    {/* Matrix */}
    {eff.matrixRain && <MatrixRain />}
    {eff.digitalGlitch && <div className="th-digital-glitch" />}
    {eff.greenPulse && <div className="th-green-pulse" />}
    {eff.screenOff && <div className="th-screen-off" />}

    {/* Stranger Things / Upside Down */}
    {eff.xmasLights && <XmasLights />}
    {eff.spores && <Spores />}
    {eff.dimensionCrack && <DimensionCrack />}
    {eff.stBars && isCat && <StrangerBars />}

    {/* Galaxie lointaine */}
    {eff.hyperspace && <div className="th-hyperspace" />}
    {/* holoScan applied via className on recap-root */}
    {eff.starStreaks && <StarStreaks />}
    {/* sabers rendered above in place of spotlights when needSpotlights */}

    {/* Weyland-Yutani */}
    {eff.terminalOverlay && <><TerminalOverlay /><TypingTitles /></>}

    {/* Arcade */}
    {eff.arcadeBorder && <div className="th-arcade-border" />}

    {/* Silent film */}
    {eff.filmStrip && <><div className="th-film-strip left">{Array.from({length:80},(_,i)=><div key={i} className="th-film-hole"/>)}</div><div className="th-film-strip right">{Array.from({length:80},(_,i)=><div key={i} className="th-film-hole"/>)}</div></>}
    {eff.silentSlate && fade && <div className="th-slate" style={{opacity:1}}><div className="th-slate-inner"><div style={{fontSize:10,letterSpacing:"0.2em",marginBottom:4,color:"rgba(255,255,255,0.4)"}}>WRAPPARR PICTURES PRESENTE</div><div style={{fontSize:18,fontWeight:700}}>Acte suivant...</div></div></div>}

    {/* Sin City / Noir */}
    {eff.noirRain && <NoirRain />}
    {eff.noirBlinds && <NoirBlinds />}
    {eff.bloodDrips && <BloodDrips accent={accent} />}

    {/* Abyss */}
    {eff.caustics && <div className="th-caustics" />}
    {eff.biolum && <Bioluminescence />}
    {eff.bubbles && <AbyssBubbles />}

    {/* VHS */}
    {eff.vhsHud && <VhsHud />}
    {eff.vhsTracking && <VhsTracking />}

    {/* Comic */}
    {eff.halftone && <div className="th-halftone" />}
    {eff.comicBorders && <ComicFx />}

    {/* Chalkboard */}
    {eff.chalkDust && <ChalkDust fade={fade} />}
    {eff.chalkTexture && <div className="th-chalk-texture" />}
    {eff.chalkboardBg && <ChalkboardBg />}

    {/* Christmas */}
    {eff.snow && <Snow />}
    {eff.frost && <div className="th-frost" />}

    {/* Pirate */}
    {eff.waves && <Waves />}
    {eff.compass && <Compass />}
  </>
}

export {
  Orbs, Stars, Spotlights, Grain, ConfettiEffect, FireworksEffect,
  MatrixRain, XmasLights, Sabers, StarStreaks, BloodDrips, Snow,
  ChalkboardBg, ChalkDust, ComicFx, NoirRain, NoirBlinds,
  Bioluminescence, AbyssBubbles, VhsHud, VhsTracking,
  TerminalOverlay, TypingTitles, DimensionCrack, StrangerBars,
  Spores, Waves, Compass,
}
