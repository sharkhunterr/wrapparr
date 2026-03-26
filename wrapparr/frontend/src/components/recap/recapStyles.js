// CSS animations extracted from prototype, injected once
export const RECAP_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes slide-up{from{opacity:0;transform:translateY(26px)}to{opacity:1;transform:translateY(0)}}
@keyframes orb-drift{0%{transform:translate(0,0) scale(1)}40%{transform:translate(26px,-16px) scale(1.06)}75%{transform:translate(-18px,22px) scale(0.94)}100%{transform:translate(0,0) scale(1)}}
@keyframes pulse-ring{0%{transform:scale(0.82);opacity:0.9}100%{transform:scale(2.6);opacity:0}}
@keyframes bar-grow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
@keyframes cpop{0%{transform:scale(0.4);opacity:0}65%{transform:scale(1.08)}100%{transform:scale(1);opacity:1}}
@keyframes flash-n{0%{filter:brightness(1)}28%{filter:brightness(4.5) saturate(3)}100%{filter:brightness(1)}}
@keyframes star-tw{0%,100%{opacity:0;transform:scale(0.3)}50%{opacity:0.85;transform:scale(1)}}
@keyframes blink-c{0%,100%{opacity:1}50%{opacity:0}}
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
@keyframes drum-roll{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.04)}}
@keyframes trophy-spin{0%{transform:rotateY(0deg) scale(1)}50%{transform:rotateY(180deg) scale(1.1)}100%{transform:rotateY(360deg) scale(1)}}
@keyframes shimmer-t{0%{background-position:-200% center}100%{background-position:200% center}}
@keyframes stat-row-in{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
@keyframes poster-strip{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
@keyframes beam-1{0%{transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}20%{transform:rotate(-12deg) scaleX(1.3) translateX(10%);opacity:0.9}45%{transform:rotate(6deg) scaleX(0.7) translateX(30%);opacity:0.55}70%{transform:rotate(-20deg) scaleX(1.1) translateX(-5%);opacity:0.8}100%{transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}}
@keyframes beam-2{0%{transform:rotate(28deg) scaleX(0.6) translateX(35%);opacity:0.25}25%{transform:rotate(8deg) scaleX(1.25) translateX(-5%);opacity:0.85}55%{transform:rotate(-5deg) scaleX(0.75) translateX(-25%);opacity:0.5}80%{transform:rotate(18deg) scaleX(1.0) translateX(15%);opacity:0.7}100%{transform:rotate(28deg) scaleX(0.6) translateX(35%);opacity:0.25}}
@keyframes beam-3{0%{transform:rotate(-8deg) scaleX(0.9) translateX(5%);opacity:0.2}30%{transform:rotate(15deg) scaleX(0.5) translateX(20%);opacity:0.5}60%{transform:rotate(-22deg) scaleX(1.4) translateX(-15%);opacity:0.75}100%{transform:rotate(-8deg) scaleX(0.9) translateX(5%);opacity:0.2}}
@keyframes flare-pulse{0%,100%{transform:translate(-50%,-50%) scale(0.6);opacity:0.3}50%{transform:translate(-50%,-50%) scale(1.8);opacity:0.85}}
.s0{animation:slide-up .5s ease .00s both}.s1{animation:slide-up .5s ease .10s both}
.s2{animation:slide-up .5s ease .20s both}.s3{animation:slide-up .5s ease .30s both}
.s4{animation:slide-up .5s ease .40s both}.s5{animation:slide-up .5s ease .50s both}
.glass{background:rgba(255,255,255,0.037);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.07);border-radius:14px}
@keyframes pulse-line{0%,100%{opacity:0.4}50%{opacity:1}}
`
