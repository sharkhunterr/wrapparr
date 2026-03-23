import { useState, useEffect, useRef, useCallback } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
         Cell, AreaChart, Area, LineChart, Line } from "recharts"

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
::-webkit-scrollbar{display:none}

@keyframes float       {0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)}}
@keyframes slide-up    {from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)}}
@keyframes orb-drift   {0%{transform:translate(0,0) scale(1)} 40%{transform:translate(26px,-16px) scale(1.06)} 75%{transform:translate(-18px,22px) scale(0.94)} 100%{transform:translate(0,0) scale(1)}}
@keyframes pulse-ring  {0%{transform:scale(0.82);opacity:0.9} 100%{transform:scale(2.6);opacity:0}}
@keyframes bar-grow    {from{transform:scaleX(0)} to{transform:scaleX(1)}}
@keyframes shimmer-t   {0%{background-position:-200% center} 100%{background-position:200% center}}
@keyframes cpop        {0%{transform:scale(0.4);opacity:0} 65%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1}}
@keyframes flash-n     {0%{filter:brightness(1)} 28%{filter:brightness(4.5) saturate(3)} 100%{filter:brightness(1)}}
@keyframes star-tw     {0%,100%{opacity:0;transform:scale(0.3)} 50%{opacity:0.85;transform:scale(1)}}
@keyframes blink-c     {0%,100%{opacity:1} 50%{opacity:0}}
@keyframes badge-p     {0%{transform:scale(0) rotate(-14deg);opacity:0} 68%{transform:scale(1.1) rotate(2deg)} 100%{transform:scale(1) rotate(0);opacity:1}}
@keyframes confetti-f  {0%{transform:translateY(-20px) rotate(0deg);opacity:1} 80%{opacity:1} 100%{transform:translateY(110vh) rotate(780deg) scale(0.3);opacity:0}}
@keyframes holo-idle   {0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%}}
@keyframes scan-mv     {0%{transform:translateY(-100%)} 100%{transform:translateY(400%)}}
@keyframes lens-f      {0%{transform:scale(0);opacity:0.9} 100%{transform:scale(4);opacity:0}}

/* SPOTLIGHT with rotation + depth */
@keyframes beam-1 {
  0%   {transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}
  20%  {transform:rotate(-12deg) scaleX(1.3)  translateX(10%); opacity:0.9}
  45%  {transform:rotate( 6deg) scaleX(0.7)  translateX(30%); opacity:0.55}
  70%  {transform:rotate(-20deg) scaleX(1.1)  translateX(-5%); opacity:0.8}
  100% {transform:rotate(-32deg) scaleX(0.55) translateX(-40%);opacity:0.3}
}
@keyframes beam-2 {
  0%   {transform:rotate( 28deg) scaleX(0.6)  translateX(35%); opacity:0.25}
  25%  {transform:rotate( 8deg) scaleX(1.25) translateX(-5%); opacity:0.85}
  55%  {transform:rotate(-5deg) scaleX(0.75) translateX(-25%);opacity:0.5}
  80%  {transform:rotate( 18deg) scaleX(1.0)  translateX(15%); opacity:0.7}
  100% {transform:rotate( 28deg) scaleX(0.6)  translateX(35%); opacity:0.25}
}
@keyframes beam-3 {
  0%   {transform:rotate(-8deg)  scaleX(0.9)  translateX(5%);  opacity:0.2}
  30%  {transform:rotate( 15deg) scaleX(0.5)  translateX(20%); opacity:0.5}
  60%  {transform:rotate(-22deg) scaleX(1.4)  translateX(-15%);opacity:0.75}
  100% {transform:rotate(-8deg)  scaleX(0.9)  translateX(5%);  opacity:0.2}
}
@keyframes flare-pulse {
  0%,100%{transform:translate(-50%,-50%) scale(0.6);opacity:0.3}
  50%{transform:translate(-50%,-50%) scale(1.8);opacity:0.85}
}

/* CATEGORY SLIDE */
@keyframes cat-icon-in  {0%{transform:scale(0) rotate(-180deg);opacity:0;filter:brightness(8)} 60%{transform:scale(1.15) rotate(6deg);opacity:1} 100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes cat-title-in {0%{clip-path:inset(0 100% 0 0);opacity:0} 100%{clip-path:inset(0 0% 0 0);opacity:1}}
@keyframes cat-bar-in   {0%{transform:scaleX(0);transform-origin:left} 100%{transform:scaleX(1);transform-origin:left}}
@keyframes cat-glow     {0%,100%{opacity:0.6} 50%{opacity:1}}
@keyframes stat-in      {from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)}}

/* PODIUM */
@keyframes platform-rise {0%{transform:translateY(180px);opacity:0} 60%{transform:translateY(-8px);opacity:1} 80%{transform:translateY(4px)} 100%{transform:translateY(0);opacity:1}}
@keyframes poster-appear {0%{transform:scale(0.3) translateY(20px) rotate(-8deg);opacity:0;filter:brightness(3)} 60%{transform:scale(1.08) translateY(-4px) rotate(1deg);opacity:1} 100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes rank-stamp    {0%{transform:scale(3) rotate(-20deg);opacity:0;filter:brightness(5)} 50%{transform:scale(0.9) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(0);filter:brightness(1)}}
@keyframes podium-flash  {0%{opacity:0} 15%{opacity:1} 35%{opacity:0} 50%{opacity:0.6} 100%{opacity:0}}
@keyframes crown-bounce  {0%,100%{transform:translateY(0) rotate(-5deg) scale(1)} 30%{transform:translateY(-12px) rotate(5deg) scale(1.2)} 60%{transform:translateY(-6px) rotate(-3deg) scale(1.1)}}
@keyframes spotlight-pulse{0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)}}
@keyframes joke-in       {0%{opacity:0;transform:translateY(14px)} 100%{opacity:1;transform:translateY(0)}}
@keyframes joke-out      {0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-10px)}}
@keyframes drum-roll     {0%,100%{transform:scaleX(1)} 50%{transform:scaleX(1.04)}}
@keyframes countdown-num {0%{transform:scale(2);opacity:0;filter:brightness(5)} 40%{transform:scale(0.95);opacity:1} 100%{transform:scale(1);filter:brightness(1)}}
@keyframes stat-count    {from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)}}

/* FINALE */
@keyframes finale-bg-pulse{0%,100%{opacity:0.7} 50%{opacity:1}}
@keyframes trophy-spin   {0%{transform:rotateY(0deg) scale(1)} 50%{transform:rotateY(180deg) scale(1.1)} 100%{transform:rotateY(360deg) scale(1)}}
@keyframes stat-row-in   {from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)}}
@keyframes poster-strip  {0%{transform:translateX(0)} 100%{transform:translateX(-50%)}}

.s0{animation:slide-up .5s ease .00s both} .s1{animation:slide-up .5s ease .10s both}
.s2{animation:slide-up .5s ease .20s both} .s3{animation:slide-up .5s ease .30s both}
.s4{animation:slide-up .5s ease .40s both} .s5{animation:slide-up .5s ease .50s both}

.glass{background:rgba(255,255,255,0.037);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border:1px solid rgba(255,255,255,0.07);border-radius:14px}
`

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ME = "Jérémie"
const TMDB = "https://image.tmdb.org/t/p"
const OL   = "https://covers.openlibrary.org/b/isbn"
const IMG = {
  "Dune: Part Two":         {p:`${TMDB}/w300/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg`,b:`${TMDB}/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg`},
  "Oppenheimer":            {p:`${TMDB}/w300/8Gxv8giaFIzmZDZnBFJFTaOFGHa.jpg`,b:`${TMDB}/w780/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg`},
  "Poor Things":            {p:`${TMDB}/w300/kCGlIMHnOm8JPXSupN8Bk5h0dvn.jpg`,b:`${TMDB}/w780/bkpPTZUdq31UGDovmszsg2CchiI.jpg`},
  "Civil War":              {p:`${TMDB}/w300/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg`,b:`${TMDB}/w780/ugS5FVNDkoO1xurqRgLRDxjJIGH.jpg`},
  "Shōgun":                 {p:`${TMDB}/w300/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg`,b:`${TMDB}/w780/zKi90VqzZYJTnBsEBShb6oMzJ2t.jpg`},
  "The Bear":               {p:`${TMDB}/w300/sHFlbKS3WLqMnp9t2ghADIJFnuQ.jpg`,b:`${TMDB}/w780/bDqSjsYm5ONQNH9C3xTGDplywOj.jpg`},
  "Fallout":                {p:`${TMDB}/w300/AnsSKR7UBsFOFpCGJ7fviJBdGgp.jpg`,b:`${TMDB}/w780/98B5BXV0PKqXiNWLpYVHW7AZLhS.jpg`},
  "House of Dragon":        {p:`${TMDB}/w300/z2yahl2uefxDCl0nogcRBstwruJ.jpg`,b:`${TMDB}/w780/etj8E2o0Bud0HkONVQPjyCkIvpN.jpg`},
  "Le Problème à 3 corps":  {p:`${OL}/9782290349137-L.jpg`,b:null},
  "Dune":                   {p:`${OL}/9782207249123-L.jpg`,b:null},
  "Foundation":             {p:`${OL}/9780553803730-L.jpg`,b:null},
  "The Road":               {p:`${OL}/9780307387899-L.jpg`,b:null},
  "Zelda: TotK":            {p:null,b:null,emoji:"🗡️",grad:["#3a7bd5","#00d2ff"]},
  "Baldur's Gate 3":        {p:null,b:null,emoji:"🧙",grad:["#7b2ff7","#f107a3"]},
  "Metroid Dread":          {p:null,b:null,emoji:"🤖",grad:["#f7971e","#ffd200"]},
  "Hollow Knight":          {p:null,b:null,emoji:"🦋",grad:["#4facfe","#00f2fe"]},
  "Vinland Saga":           {p:null,b:null,emoji:"⛵",grad:["#396afc","#2948ff"]},
  "Berserk":                {p:null,b:null,emoji:"⚔️",grad:["#c0392b","#8e44ad"]},
  "Chainsaw Man":           {p:null,b:null,emoji:"🪚",grad:["#f7971e","#fc4a1a"]},
  "Dungeon Meshi":          {p:null,b:null,emoji:"🍲",grad:["#11998e","#38ef7d"]},
}

const D = {
  plex:{
    films:{total:67,hours:412,avgRuntime:108,rewatched:14,vsLastYear:23,
      top:[{t:"Dune: Part Two",y:2024,g:"Sci-Fi",r:9.2,h:2.7,rank:1},{t:"Oppenheimer",y:2023,g:"Histoire",r:8.9,h:3.0,rank:2},{t:"Poor Things",y:2023,g:"Drame",r:8.7,h:2.1,rank:3},{t:"Civil War",y:2024,g:"Thriller",r:8.1,h:1.8,rank:4}],
      genres:[{n:"Sci-Fi",v:18},{n:"Thriller",v:14},{n:"Drame",v:12},{n:"Action",v:10},{n:"Horreur",v:8}],
      dayOfWeek:[{d:"Lun",v:4},{d:"Mar",v:6},{d:"Mer",v:8},{d:"Jeu",v:5},{d:"Ven",v:12},{d:"Sam",v:20},{d:"Dim",v:12}],
      timeOfDay:[{h:"8h",v:2},{h:"12h",v:6},{h:"16h",v:12},{h:"18h",v:18},{h:"20h",v:32},{h:"22h",v:14},{h:"0h",v:5}],
      monthly:[{m:"J",v:4},{m:"F",v:6},{m:"M",v:7},{m:"A",v:4},{m:"M",v:8},{m:"J",v:5},{m:"J",v:7},{m:"A",v:9},{m:"S",v:5},{m:"O",v:6},{m:"N",v:4},{m:"D",v:2}],
    },
    series:{episodes:312,hours:435,avgPerSession:3.2,longestBinge:8,vsLastYear:19,
      top:[{t:"Shōgun",ep:10,g:"Histoire",seasons:1,rank:1},{t:"The Bear",ep:8,g:"Drame",seasons:2,rank:2},{t:"Fallout",ep:8,g:"Sci-Fi",seasons:1,rank:3},{t:"House of Dragon",ep:8,g:"Fantasy",seasons:2,rank:4}],
      dayOfWeek:[{d:"Lun",v:42},{d:"Mar",v:38},{d:"Mer",v:51},{d:"Jeu",v:45},{d:"Ven",v:68},{d:"Sam",v:94},{d:"Dim",v:87}],
      timeOfDay:[{h:"12h",v:14},{h:"16h",v:19},{h:"18h",v:34},{h:"20h",v:79},{h:"22h",v:95},{h:"0h",v:44}],
      genres:[{n:"Sci-Fi",v:38},{n:"Drame",v:30},{n:"Histoire",v:25},{n:"Thriller",v:22},{n:"Fantasy",v:18}],
      monthly:[{m:"J",v:30},{m:"F",v:38},{m:"M",v:44},{m:"A",v:28},{m:"M",v:52},{m:"J",v:36},{m:"J",v:48},{m:"A",v:62},{m:"S",v:40},{m:"O",v:54},{m:"N",v:46},{m:"D",v:45}],
    },
    ranking:[{n:"Marc",v:1102},{n:ME,v:847},{n:"Sophie",v:634},{n:"Léa",v:521}],
  },
  romm:{hours:186,games:24,completionRate:67,avgSession:4.2,longestSession:11,vsLastYear:8,
    top:[{t:"Zelda: TotK",platform:"Switch",g:"Aventure",hours:42,rank:1},{t:"Baldur's Gate 3",platform:"PC",g:"RPG",hours:38,rank:2},{t:"Metroid Dread",platform:"Switch",g:"Metroidvania",hours:22,rank:3},{t:"Hollow Knight",platform:"PC",g:"Action",hours:18,rank:4}],
    consoles:[{n:"Switch",v:94},{n:"PC",v:48},{n:"SNES",v:24},{n:"GBA",v:20}],
    genres:[{n:"RPG",v:8},{n:"Aventure",v:5},{n:"Plateforme",v:4},{n:"FPS",v:4}],
    decades:[{d:"80s",v:2},{d:"90s",v:6},{d:"2000s",v:4},{d:"2010s",v:7},{d:"2020s",v:5}],
    monthly:[{m:"J",v:10},{m:"F",v:18},{m:"M",v:14},{m:"A",v:22},{m:"M",v:16},{m:"J",v:12},{m:"J",v:24},{m:"A",v:28},{m:"S",v:16},{m:"O",v:12},{m:"N",v:8},{m:"D",v:6}],
    ranking:[{n:"Tom",v:312},{n:ME,v:186},{n:"Marc",v:142},{n:"Léa",v:98}],
  },
  audio:{hours:134,books:11,avgDuration:12.2,longestBook:28,vsLastYear:45,
    top:[{t:"Le Problème à 3 corps",author:"Liu Cixin",g:"Sci-Fi",h:34,rank:1},{t:"Dune",author:"Frank Herbert",g:"Sci-Fi",h:21,rank:2},{t:"Foundation",author:"Isaac Asimov",g:"Sci-Fi",h:18,rank:3},{t:"The Road",author:"C. McCarthy",g:"Post-Apo",h:11,rank:4}],
    genres:[{n:"Sci-Fi",v:6},{n:"Thriller",v:2},{n:"Post-Apo",v:2},{n:"Fantasy",v:1}],
    monthly:[{m:"J",v:8},{m:"F",v:14},{m:"M",v:18},{m:"A",v:12},{m:"M",v:9},{m:"J",v:11},{m:"J",v:16},{m:"A",v:14},{m:"S",v:10},{m:"O",v:12},{m:"N",v:8},{m:"D",v:2}],
    timeOfDay:[{h:"7h",v:12},{h:"12h",v:8},{h:"18h",v:22},{h:"20h",v:48},{h:"22h",v:28}],
    dayOfWeek:[{d:"Lun",v:16},{d:"Mar",v:18},{d:"Mer",v:14},{d:"Jeu",v:20},{d:"Ven",v:24},{d:"Sam",v:28},{d:"Dim",v:14}],
    ranking:[{n:ME,v:134},{n:"Sophie",v:89},{n:"Marc",v:45},{n:"Léa",v:18}],
  },
  komga:{volumes:89,series:12,avgPerWeek:7.4,longestSession:12,vsLastYear:34,
    top:[{t:"Vinland Saga",vols:27,g:"Historique",rank:1},{t:"Berserk",vols:18,g:"Dark Fantasy",rank:2},{t:"Chainsaw Man",vols:14,g:"Action",rank:3},{t:"Dungeon Meshi",vols:11,g:"Fantasy",rank:4}],
    genres:[{n:"Historique",v:32},{n:"Dark Fantasy",v:24},{n:"Action",v:18},{n:"Fantasy",v:15}],
    dayOfWeek:[{d:"Lun",v:8},{d:"Mar",v:6},{d:"Mer",v:11},{d:"Jeu",v:9},{d:"Ven",v:14},{d:"Sam",v:22},{d:"Dim",v:19}],
    monthly:[{m:"J",v:4},{m:"F",v:6},{m:"M",v:10},{m:"A",v:8},{m:"M",v:7},{m:"J",v:6},{m:"J",v:9},{m:"A",v:12},{m:"S",v:7},{m:"O",v:8},{m:"N",v:6},{m:"D",v:6}],
    ranking:[{n:"Léa",v:124},{n:ME,v:89},{n:"Sophie",v:67},{n:"Tom",v:34}],
  },
  comparison:{monthly:[{m:"Jan",a:78,b:62},{m:"Fév",a:92,b:71},{m:"Mar",a:105,b:88},{m:"Avr",a:88,b:79},{m:"Mai",a:115,b:95},{m:"Jun",a:98,b:82},{m:"Jul",a:124,b:108},{m:"Aoû",a:142,b:119},{m:"Sep",a:108,b:91},{m:"Oct",a:131,b:103},{m:"Nov",a:119,b:97},{m:"Déc",a:140,b:115}]},
  global:{users:[{n:"Marc",v:1580},{n:ME,v:1240},{n:"Sophie",v:980},{n:"Léa",v:842},{n:"Tom",v:721},{n:"Paul",v:534}]},
}

// Joke sequences per category
const JOKES = {
  films:[
    "Jérémie a regardé 67 films cette année...",
    "Soit l'équivalent de 5 jours sans dormir.",
    "Il a ri, pleuré, et probablement mangé des chips.",
    "Voici son podium officiel 2024 🎬",
  ],
  series:[
    "312 épisodes. En une seule année.",
    "C'est 8 binges complets de 8 épisodes.",
    "Sa serie préférée ? Il a failli spoiler tout le monde.",
    "Le verdict tombe maintenant 🎭",
  ],
  romm:[
    "24 jeux. 186 heures. Des doigts endoloris.",
    "Sa session la plus longue : 11h d'affilée.",
    "Les voisins ont entendu les victoires.",
    "Voici le top du gamepad 🎮",
  ],
  audio:[
    "11 livres audio en 2024.",
    "Principalement en mode sci-fi hardcore.",
    "Son cerveau a voyagé dans 3 univers différents.",
    "Le palmarès littéraire s'affiche 🎧",
  ],
  komga:[
    "89 volumes de manga lus cette année.",
    "Soit environ 7 volumes par mois. Respect.",
    "Il a pleuré sur au moins 4 arcs scénaristiques.",
    "Le podium des cases s'illumine 📚",
  ],
}

const SLIDES_DEF = [
  {id:"intro",      accent:"#E5A00D", bg:"#05050e"},
  {id:"overview",   accent:"#a78bfa", bg:"#080618"},
  // ── FILMS ──
  {id:"cat-films",  accent:"#E5A00D", bg:"#0c0600", cat:true},
  {id:"films-pod",  accent:"#E5A00D", bg:"#070400", pod:true},
  {id:"films",      accent:"#E5A00D", bg:"#100900"},
  {id:"films-deep", accent:"#E5A00D", bg:"#100900"},
  // ── SÉRIES ──
  {id:"cat-series", accent:"#E87C2A", bg:"#0a0400", cat:true},
  {id:"series-pod", accent:"#E87C2A", bg:"#060300", pod:true},
  {id:"series",     accent:"#E87C2A", bg:"#100600"},
  {id:"series-deep",accent:"#E87C2A", bg:"#100600"},
  // ── ROMM ──
  {id:"cat-romm",   accent:"#34d399", bg:"#010a05", cat:true},
  {id:"romm-pod",   accent:"#34d399", bg:"#010806", pod:true},
  {id:"romm",       accent:"#34d399", bg:"#020f08"},
  {id:"romm-deep",  accent:"#34d399", bg:"#020f08"},
  // ── AUDIO ──
  {id:"cat-audio",  accent:"#fb923c", bg:"#0a0300", cat:true},
  {id:"audio-pod",  accent:"#fb923c", bg:"#080300", pod:true},
  {id:"audio",      accent:"#fb923c", bg:"#110500"},
  {id:"audio-deep", accent:"#fb923c", bg:"#110500"},
  // ── MANGA ──
  {id:"cat-komga",  accent:"#c084fc", bg:"#060012", cat:true},
  {id:"komga-pod",  accent:"#c084fc", bg:"#050010", pod:true},
  {id:"komga",      accent:"#c084fc", bg:"#0a0018"},
  // ── FIN ──
  {id:"compare",    accent:"#60a5fa", bg:"#00091a"},
  {id:"ranking",    accent:"#f87171", bg:"#130000"},
  {id:"finale",     accent:"#E5A00D", bg:"#05050e"},
]

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useActive(){const[a,setA]=useState(false);useEffect(()=>{const t=setTimeout(()=>setA(true),60);return()=>clearTimeout(t)},[]);return a}
function useCounter(target,active,dur=1400){
  const[v,setV]=useState(0)
  useEffect(()=>{if(!active){setV(0);return}let c=0;const inc=target/(dur/16);const t=setInterval(()=>{c+=inc;if(c>=target){setV(target);clearInterval(t)}else setV(Math.floor(c))},16);return()=>clearInterval(t)},[active,target,dur])
  return v
}

// ─── AMBIENT ─────────────────────────────────────────────────────────────────
function Orbs({accent}){
  return <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
    {[{s:680,x:"-18%",y:"-22%",d:"0s",o:.17},{s:360,x:"60%",y:"56%",d:"5s",o:.09},{s:220,x:"12%",y:"72%",d:"9s",o:.06}].map((o,i)=>(
      <div key={i} style={{position:"absolute",borderRadius:"50%",width:o.s,height:o.s,left:o.x,top:o.y,
        background:`radial-gradient(circle,${accent} 0%,transparent 70%)`,opacity:o.o,filter:"blur(58px)",
        animation:`orb-drift ${10+i*3}s ease-in-out ${o.d} infinite`,transition:"background 0.8s ease"}}/>
    ))}
  </div>
}
function Stars(){
  const s=useRef(Array.from({length:50},()=>({x:Math.random()*100,y:Math.random()*100,sz:.8+Math.random()*2.2,d:Math.random()*7,dur:2+Math.random()*4}))).current
  return <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
    {s.map((p,i)=><div key={i} style={{position:"absolute",left:`${p.x}%`,top:`${p.y}%`,
      width:p.sz,height:p.sz,borderRadius:"50%",background:"white",opacity:0,
      animation:`star-tw ${p.dur}s ease-in-out ${p.d}s infinite`}}/>)}
  </div>
}
function Grain(){
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:50,opacity:.045,mixBlendMode:"overlay",
    backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`}}/>
}

// ─── SPOTLIGHTS — 3 origins: left / center / right ───────────────────────────
function Spotlights({accent, intensity=1}){
  const a=(v)=>Math.round(v*intensity).toString(16).padStart(2,"0")
  // Each beam has its own fixed anchor point at the top
  const beams=[
    // left beam  — narrow, fast, strong rotation outward
    {left:"12%",  w:"18vw", anim:"beam-1", dur:"11s", delay:"0s",   op:a(38)},
    // center beam — widest, slowest, sweeps both sides
    {left:"50%",  w:"26vw", anim:"beam-3", dur:"17s", delay:"3.5s", op:a(30)},
    // right beam — medium, medium speed, mirror of left
    {left:"88%",  w:"20vw", anim:"beam-2", dur:"9s",  delay:"1.2s", op:a(34)},
  ]
  return <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:1}}>
    {beams.map((b,i)=>(
      <div key={i} style={{
        position:"absolute",top:"-4%",left:b.left,
        width:b.w,height:"145%",
        transformOrigin:"top center",
        transform:"translateX(-50%)",   /* anchor beam base to the left% point */
        background:`linear-gradient(180deg,${accent}${b.op} 0%,${accent}07 50%,transparent 75%)`,
        animation:`${b.anim} ${b.dur} ease-in-out ${b.delay} infinite`,
        mixBlendMode:"screen",
      }}/>
    ))}
    {/* Lens flares anchored at each beam origin */}
    {[12,50,88].map((x,i)=>(
      <div key={i} style={{
        position:"absolute",top:0,left:`${x}%`,
        width:70+i*18,height:70+i*18,borderRadius:"50%",
        background:`radial-gradient(circle,${accent}65 0%,${accent}22 45%,transparent 72%)`,
        transform:"translate(-50%,-50%)",
        animation:`flare-pulse ${4.5+i*2.5}s ease-in-out ${i*2}s infinite`,
      }}/>
    ))}
  </div>
}

// ─── CONFETTI + FIREWORKS ─────────────────────────────────────────────────────
const CC=["#E5A00D","#34d399","#c084fc","#f87171","#60a5fa","#fb923c","#fff","#fbbf24","#f472b6"]
function Confetti(){
  const p=useRef(Array.from({length:80},()=>({x:Math.random()*100,dur:2+Math.random()*3.5,delay:Math.random()*4,size:4+Math.random()*9,color:CC[Math.floor(Math.random()*CC.length)],round:Math.random()>.5}))).current
  return <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:2,overflow:"hidden"}}>
    {p.map((c,i)=><div key={i} style={{position:"absolute",left:`${c.x}%`,top:"-20px",
      width:c.size,height:c.size*(c.round?1:.38),background:c.color,borderRadius:c.round?"50%":2,
      animation:`confetti-f ${c.dur}s ease-in ${c.delay}s infinite`}}/>)}
  </div>
}
const FW_P=[["#E5A00D","#fb923c","#fbbf24"],["#34d399","#60a5fa","#a78bfa"],["#f87171","#c084fc","#fb923c"],["#fff","#60a5fa","#a78bfa"]]
function Fireworks({active}){
  const cv=useRef(null);const pts=useRef([]);const raf=useRef(null)
  useEffect(()=>{
    if(!active)return
    const c=cv.current;const ctx=c.getContext("2d")
    const rz=()=>{c.width=window.innerWidth;c.height=window.innerHeight}
    rz();window.addEventListener("resize",rz)
    const launch=()=>{
      const pal=FW_P[Math.floor(Math.random()*FW_P.length)]
      const x=c.width*(.15+Math.random()*.7),y=c.height*(.05+Math.random()*.5)
      const count=60+Math.floor(Math.random()*60),type=Math.floor(Math.random()*3)
      for(let i=0;i<count;i++){
        const angle=(Math.PI*2/count)*i+(Math.random()-.5)*.4
        const speed=(3.5+Math.random()*2)*(type===1?.65:1)
        pts.current.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,
          alpha:1,decay:.011+Math.random()*.009,size:2.2+Math.random()*2.4,
          color:pal[Math.floor(Math.random()*pal.length)],gravity:type===0?.065:.042})
        if(type===2){const a2=angle+(Math.random()-.5)*.3,s2=speed*(.35+Math.random()*.4)
          pts.current.push({x,y,vx:Math.cos(a2)*s2,vy:Math.sin(a2)*s2,alpha:.6,decay:.026,size:1.2,color:pal[0],gravity:.085})}
      }
    }
    let last=0
    const draw=(now)=>{
      ctx.fillStyle="rgba(0,0,0,0.075)";ctx.fillRect(0,0,c.width,c.height)
      if(now-last>650){launch();last=now}
      pts.current=pts.current.filter(p=>p.alpha>.012)
      pts.current.forEach(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=p.gravity;p.vx*=.97;p.alpha-=p.decay;p.size*=.977
        ctx.save();ctx.globalAlpha=Math.max(0,p.alpha);ctx.fillStyle=p.color
        ctx.shadowBlur=10;ctx.shadowColor=p.color
        ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.1,p.size),0,Math.PI*2);ctx.fill()
        ctx.restore()
      })
      raf.current=requestAnimationFrame(draw)
    }
    raf.current=requestAnimationFrame(draw)
    launch();setTimeout(launch,180);setTimeout(launch,420)
    return()=>{cancelAnimationFrame(raf.current);window.removeEventListener("resize",rz);ctx.clearRect(0,0,c.width,c.height);pts.current=[]}
  },[active])
  return <canvas ref={cv} style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:3}}/>
}

// ─── POKÉMON HOLO CARD ────────────────────────────────────────────────────────
function PokeCard({children,accent,style}){
  const ref=useRef(null)
  const[m,setM]=useState({x:50,y:50,on:false})
  const[sparks,setSparks]=useState([])
  const st=useRef(null)
  const onMove=e=>{const r=ref.current.getBoundingClientRect();setM(p=>({...p,x:((e.clientX-r.left)/r.width)*100,y:((e.clientY-r.top)/r.height)*100}))}
  const onEnter=()=>{setM(p=>({...p,on:true}));st.current=setInterval(()=>setSparks(s=>[...s.filter(p=>p.age<1.1),{id:Date.now()+Math.random(),x:8+Math.random()*84,y:8+Math.random()*84,age:0,size:3+Math.random()*5,color:CC[Math.floor(Math.random()*CC.length)]}]),170)}
  const onLeave=()=>{setM(p=>({...p,on:false}));clearInterval(st.current);setSparks([])}
  useEffect(()=>{if(!sparks.length)return;const t=requestAnimationFrame(()=>setSparks(s=>s.map(p=>({...p,age:p.age+.09})).filter(p=>p.age<1.1)));return()=>cancelAnimationFrame(t)},[sparks])
  const tX=((m.y-50)/50)*-8,tY=((m.x-50)/50)*9,hue=(m.x/100)*360
  return(
    <div ref={ref} onMouseMove={onMove} onMouseEnter={onEnter} onMouseLeave={onLeave}
      style={{position:"relative",overflow:"hidden",borderRadius:14,
        border:`1px solid rgba(255,255,255,${m.on?.24:.07})`,background:"rgba(255,255,255,0.04)",
        transform:m.on?`perspective(700px) rotateX(${tX}deg) rotateY(${tY}deg) scale(1.04)`:"perspective(700px) scale(1)",
        transition:m.on?"transform 0.07s,box-shadow 0.1s":"transform 0.5s ease,box-shadow 0.3s",
        boxShadow:m.on?`0 24px 65px ${accent}45,0 0 0 1px ${accent}30`:`0 4px 18px ${accent}18`,...style}}>
      <div style={{position:"absolute",inset:0,zIndex:1,pointerEvents:"none",borderRadius:"inherit",
        background:m.on?`linear-gradient(${hue}deg,rgba(255,0,80,.12) 0%,rgba(255,165,0,.12) 16%,rgba(255,240,0,.12) 32%,rgba(0,255,120,.12) 48%,rgba(0,200,255,.12) 64%,rgba(120,0,255,.12) 80%,rgba(255,0,200,.12) 100%)`
          :"linear-gradient(135deg,rgba(255,0,80,.04) 0%,rgba(0,200,255,.04) 50%,rgba(180,0,255,.04) 100%)",
        backgroundSize:"200% 200%",animation:m.on?"none":"holo-idle 6s ease infinite",mixBlendMode:"screen"}}/>
      {m.on&&<div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",borderRadius:"inherit",
        background:`radial-gradient(ellipse 55% 45% at ${m.x}% ${m.y}%,rgba(255,230,100,.28) 0%,rgba(200,80,255,.18) 35%,rgba(0,200,255,.14) 60%,transparent 78%)`,mixBlendMode:"screen"}}/>}
      <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none",borderRadius:"inherit",
        backgroundImage:m.on?`repeating-linear-gradient(${40+tY}deg,transparent 0px,transparent 5px,rgba(255,255,255,.025) 5px,rgba(255,255,255,.025) 6px)`:"none"}}/>
      {m.on&&<div style={{position:"absolute",left:0,right:0,height:"30%",zIndex:3,pointerEvents:"none",
        background:"linear-gradient(180deg,transparent 0%,rgba(255,255,255,.055) 50%,transparent 100%)",animation:"scan-mv 2.5s linear infinite"}}/>}
      {sparks.map(s=><div key={s.id} style={{position:"absolute",left:`${s.x}%`,top:`${s.y}%`,zIndex:5,
        pointerEvents:"none",transform:"translate(-50%,-50%)",opacity:Math.max(0,1-s.age),
        fontSize:s.size+6,filter:`drop-shadow(0 0 4px ${s.color})`}}>✦</div>)}
      <div style={{position:"relative",zIndex:6}}>{children}</div>
    </div>
  )
}

// ─── POSTER IMAGE ─────────────────────────────────────────────────────────────
function PosterImg({title,width=52,height=76,radius=7,style={}}){
  const[e,setE]=useState(false);const img=IMG[title]
  if(!img?.p||e)return <div style={{width,height,borderRadius:radius,flexShrink:0,
    background:img?.grad?`linear-gradient(135deg,${img.grad[0]},${img.grad[1]})`:"rgba(255,255,255,0.08)",
    display:"flex",alignItems:"center",justifyContent:"center",fontSize:height*.3,...style}}>{img?.emoji||"🎬"}</div>
  return <img src={img.p} alt={title} onError={()=>setE(true)}
    style={{width,height,borderRadius:radius,objectFit:"cover",flexShrink:0,...style}}/>
}

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const Lbl=({c="rgba(255,255,255,0.32)",size=10,children,upper=true})=>
  <div style={{color:c,fontSize:size,fontFamily:"Outfit,sans-serif",textTransform:upper?"uppercase":"none",letterSpacing:"0.12em"}}>{children}</div>
const Tag=({accent})=>
  <div style={{color:accent,fontSize:9,letterSpacing:"0.3em",fontFamily:"DM Mono,monospace",textTransform:"uppercase",marginBottom:7,opacity:.8}}>XENOCLOUD · 2024</div>
const Pill=({children,accent})=>
  <span style={{display:"inline-block",padding:"3px 10px",borderRadius:18,background:`${accent}1e`,border:`1px solid ${accent}38`,color:accent,fontSize:10,fontFamily:"Outfit,sans-serif"}}>{children}</span>
const VsB=({value,label="vs 2023"})=>{const p=value>0;return(
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:"4px 11px",borderRadius:18,
    background:p?"#22c55e16":"#ef444416",border:`1px solid ${p?"#22c55e":"#ef4444"}40`,
    color:p?"#4ade80":"#f87171",fontSize:11,fontWeight:600,fontFamily:"Outfit,sans-serif",animation:"badge-p .5s ease .6s both"}}>
    {p?"↑":"↓"} {p?"+":""}{value}% {label}
  </span>
)}
function BigNum({value,suffix="",accent,active,delay=.05}){
  const v=useCounter(value,active)
  return <div style={{fontSize:56,fontWeight:800,color:accent,lineHeight:1,fontFamily:"Syne,sans-serif",
    letterSpacing:"-0.02em",animation:`cpop .55s ease ${delay}s both,flash-n .9s ease ${delay+.45}s both`}}>
    {v.toLocaleString("fr-FR")}{suffix}
  </div>
}
function AN({t,s=""}){
  const[v,setV]=useState(0)
  useEffect(()=>{let c=0;const inc=t/80;const tm=setInterval(()=>{c+=inc;if(c>=t){setV(t);clearInterval(tm)}else setV(Math.floor(c))},16);return()=>clearInterval(tm)},[t])
  return <>{v.toLocaleString("fr-FR")}{s}</>
}
function CTip({active,payload,label,unit="h"}){
  if(!active||!payload?.length)return null
  return <div style={{background:"#0d0d1a",border:"1px solid rgba(255,255,255,.1)",borderRadius:8,padding:"5px 10px",fontSize:10,fontFamily:"DM Mono,monospace"}}>
    <div style={{color:"rgba(255,255,255,.4)",marginBottom:2}}>{label}</div>
    {payload.map(p=><div key={p.dataKey} style={{color:p.color||"white",fontWeight:600}}>{p.value}{unit}</div>)}
  </div>
}
function MiniRank({data,accent,unit="h",label="Classement"}){
  const max=data[0].v;const medals=["🥇","🥈","🥉"]
  return <div className="glass" style={{padding:"12px 14px"}}>
    <Lbl c={accent} size={9}>{label}</Lbl>
    <div style={{marginTop:7,display:"flex",flexDirection:"column",gap:5}}>
      {data.map((u,i)=>{const isMe=u.n===ME;return(
        <div key={u.n} style={{display:"flex",alignItems:"center",gap:7,animation:`slide-up .4s ease ${.08+i*.07}s both`}}>
          <div style={{width:20,textAlign:"center",fontSize:12,flexShrink:0,color:i<3?"transparent":"rgba(255,255,255,.22)",fontWeight:700}}>{i<3?medals[i]:i+1}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
              <span style={{fontSize:11,fontFamily:isMe?"Syne,sans-serif":"Outfit,sans-serif",fontWeight:isMe?700:400,color:isMe?accent:"rgba(255,255,255,.65)"}}>
                {u.n}{isMe&&<span style={{fontSize:9,opacity:.5}}> · moi</span>}
              </span>
              <span style={{fontSize:10,color:isMe?accent:"rgba(255,255,255,.3)",fontFamily:"DM Mono,monospace"}}>{u.v.toLocaleString("fr-FR")}{unit}</span>
            </div>
            <div style={{height:2,background:"rgba(255,255,255,.05)",borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:isMe?`linear-gradient(90deg,${accent},${accent}80)`:"rgba(255,255,255,.16)",
                width:`${(u.v/max)*100}%`,borderRadius:2,transformOrigin:"left",animation:`bar-grow .7s ease ${.28+i*.07}s both`}}/>
            </div>
          </div>
        </div>
      )})}
    </div>
  </div>
}
function AreaG({data,dataKey,accent,height=52,unit="h",id}){
  return <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity={.5}/><stop offset="100%" stopColor={accent} stopOpacity={.02}/>
      </linearGradient></defs>
      <XAxis dataKey="m" tick={{fill:"rgba(255,255,255,.35)",fontSize:8}} axisLine={false} tickLine={false}/>
      <YAxis hide/><Tooltip content={<CTip unit={unit}/>}/>
      <Area type="monotone" dataKey={dataKey} stroke={accent} strokeWidth={2} fill={`url(#${id})`} dot={false}/>
    </AreaChart>
  </ResponsiveContainer>
}
function DayChart({data,accent,height=55,unit}){
  return <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{left:0,right:0,top:0,bottom:0}}>
      <XAxis dataKey="d" tick={{fill:"rgba(255,255,255,.4)",fontSize:9}} axisLine={false} tickLine={false}/>
      <YAxis hide/><Tooltip content={<CTip unit={unit||" items"}/>}/>
      <Bar dataKey="v" radius={[3,3,0,0]}>
        {data.map((d,i)=><Cell key={i} fill={d.d==="Sam"||d.d==="Dim"||d.d==="Ven"?accent:`${accent}45`}/>)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
}
function TimeChart({data,accent,height=50,unit}){
  const gId=`tg${accent.replace(/[^a-f0-9]/gi,"")}`
  return <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{top:2,right:0,left:0,bottom:0}}>
      <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={accent} stopOpacity={.5}/><stop offset="100%" stopColor={accent} stopOpacity={.02}/>
      </linearGradient></defs>
      <XAxis dataKey="h" tick={{fill:"rgba(255,255,255,.35)",fontSize:8}} axisLine={false} tickLine={false}/>
      <YAxis hide/><Tooltip content={<CTip unit={unit||" items"}/>}/>
      <Area type="monotone" dataKey="v" stroke={accent} strokeWidth={2} fill={`url(#${gId})`} dot={false}/>
    </AreaChart>
  </ResponsiveContainer>
}

// Poster list card with holo
function PosterCard({item,accent,rank,statLine,style}){
  const[e,setE]=useState(false);const img=IMG[item.t]
  return(
    <PokeCard accent={accent} style={style}>
      <div style={{display:"flex",gap:10,padding:"10px 12px"}}>
        {img?.p&&!e
          ?<img src={img.p} alt={item.t} onError={()=>setE(true)} style={{width:52,height:75,borderRadius:7,objectFit:"cover",flexShrink:0,boxShadow:`0 4px 14px ${accent}30`}}/>
          :<div style={{width:52,height:75,borderRadius:7,flexShrink:0,
            background:img?.grad?`linear-gradient(135deg,${img.grad[0]},${img.grad[1]})`:`${accent}22`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{img?.emoji||"🎬"}</div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{color:accent,fontSize:8,fontFamily:"DM Mono,monospace",letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:3}}>#{rank} · 2024</div>
          <div style={{color:"white",fontWeight:800,fontFamily:"Syne,sans-serif",fontSize:11,lineHeight:1.25,marginBottom:5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.t}</div>
          {item.author&&<div style={{color:"rgba(255,255,255,0.38)",fontSize:9,fontFamily:"Outfit,sans-serif",marginBottom:4}}>{item.author}</div>}
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <Pill accent={accent}>{item.g}</Pill>
            {statLine&&<Pill accent="rgba(255,255,255,0.3)">{statLine}</Pill>}
          </div>
        </div>
      </div>
    </PokeCard>
  )
}

// ─── CATEGORY SLIDE ───────────────────────────────────────────────────────────
function SlideCat({accent,bg,icon,label,sub}){
  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",position:"relative",zIndex:10,overflow:"hidden"}}>

      {/* Full-bleed background glow */}
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse 80% 60% at 50% 50%,${accent}18 0%,transparent 70%)`,
        animation:"cat-glow 3s ease-in-out infinite"}}/>

      {/* Horizontal rule top */}
      <div style={{position:"absolute",top:"22%",left:"5%",right:"5%",height:1,
        background:`linear-gradient(90deg,transparent,${accent}60,${accent}90,${accent}60,transparent)`,
        animation:"cat-bar-in 1s ease .3s both"}}/>

      {/* Icon */}
      <div style={{fontSize:100,marginBottom:18,filter:`drop-shadow(0 0 48px ${accent}90)`,
        animation:"cat-icon-in 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.1s both"}}>
        {icon}
      </div>

      {/* Label */}
      <h1 style={{fontSize:76,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",
        lineHeight:0.9,letterSpacing:"-0.02em",marginBottom:10,textAlign:"center",
        textShadow:`0 0 90px ${accent}70`,animation:"cat-title-in 0.9s ease 0.5s both"}}>
        {label}
      </h1>

      {/* Subtitle */}
      <div style={{fontSize:15,color:`${accent}cc`,fontFamily:"Outfit,sans-serif",
        fontWeight:300,letterSpacing:"0.06em",textAlign:"center",
        animation:"slide-up .6s ease .9s both"}}>
        {sub}
      </div>

      {/* Horizontal rule bottom */}
      <div style={{position:"absolute",bottom:"22%",left:"5%",right:"5%",height:1,
        background:`linear-gradient(90deg,transparent,${accent}60,${accent}90,${accent}60,transparent)`,
        animation:"cat-bar-in 1s ease .5s both"}}/>

      {/* NEXT hint */}
      <div style={{position:"absolute",bottom:"11%",left:"50%",transform:"translateX(-50%)",
        fontSize:9,color:"rgba(255,255,255,0.2)",fontFamily:"DM Mono,monospace",letterSpacing:".3em",
        textTransform:"uppercase",animation:"slide-up .5s ease 1.2s both"}}>
        SWIPE POUR COMMENCER ↓
      </div>
    </div>
  )
}

// ─── DRAMATIC PODIUM ─────────────────────────────────────────────────────────
const PODIUM_DELAYS=[400,1100,2000]
const PODIUM_H=[88,110,132]

function PodiumPlatform({item,rankIdx,accent,revealed,isOne,statLabel,statValue}){
  const realRank=3-rankIdx
  const platH=PODIUM_H[rankIdx]
  const img=IMG[item.t]
  const[imgErr,setImgErr]=useState(false)

  return(
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",opacity:revealed?1:0,transition:"opacity .1s",flex:isOne?1.15:1}}>
      {isOne&&revealed&&<div style={{fontSize:24,marginBottom:4,animation:"crown-bounce 1.8s ease-in-out infinite",filter:`drop-shadow(0 0 12px ${accent})`}}>👑</div>}
      {revealed&&<div style={{fontSize:isOne?38:28,fontWeight:800,marginBottom:6,fontFamily:"Syne,sans-serif",color:accent,lineHeight:1,
        textShadow:`0 0 30px ${accent}`,animation:"rank-stamp .5s cubic-bezier(0.34,1.56,0.64,1) both"}}>#{realRank}</div>}
      {revealed&&(
        <div style={{animation:"poster-appear .65s cubic-bezier(0.34,1.3,0.64,1) both",marginBottom:8,position:"relative"}}>
          {img?.p&&!imgErr
            ?<img src={img.p} alt={item.t} onError={()=>setImgErr(true)} style={{width:isOne?74:56,height:isOne?108:82,borderRadius:8,objectFit:"cover",boxShadow:`0 8px 32px ${accent}55,0 0 0 2px ${accent}40`}}/>
            :<div style={{width:isOne?74:56,height:isOne?108:82,borderRadius:8,background:img?.grad?`linear-gradient(135deg,${img.grad[0]},${img.grad[1]})`:`${accent}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isOne?34:25,boxShadow:`0 8px 32px ${accent}55,0 0 0 2px ${accent}40`}}>{img?.emoji||"🎬"}</div>}
          <div style={{position:"absolute",inset:0,borderRadius:8,background:"linear-gradient(135deg,rgba(255,255,255,0) 30%,rgba(255,255,255,0.15) 50%,rgba(255,255,255,0) 70%)",backgroundSize:"200% 200%",animation:"holo-idle 3s ease infinite",pointerEvents:"none"}}/>
        </div>
      )}
      <div style={{width:"100%",borderRadius:"6px 6px 0 0",
        background:revealed?`linear-gradient(180deg,${accent}38 0%,${accent}18 100%)`:"rgba(255,255,255,0.04)",
        border:`1px solid ${revealed?accent+"55":"rgba(255,255,255,0.05)"}`,borderBottom:"none",height:platH,
        display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-start",padding:"10px 6px",
        boxShadow:revealed?`0 -4px 30px ${accent}35,inset 0 1px 0 ${accent}45`:"none",
        transition:"background .4s,border-color .4s,box-shadow .4s",
        animation:revealed?"platform-rise .7s cubic-bezier(0.34,1.3,0.64,1) both":"none"}}>
        {revealed&&<>
          <div style={{color:"white",fontWeight:700,fontFamily:"Syne,sans-serif",fontSize:isOne?11:9,textAlign:"center",lineHeight:1.2,marginBottom:4,animation:"stat-count .4s ease .3s both"}}>
            {item.t.length>16?item.t.slice(0,14)+"…":item.t}
          </div>
          <div style={{color:accent,fontWeight:800,fontFamily:"DM Mono,monospace",fontSize:isOne?15:11,animation:"stat-count .4s ease .45s both"}}>
            {statValue}
          </div>
          <div style={{color:"rgba(255,255,255,0.4)",fontSize:8,fontFamily:"Outfit,sans-serif",textTransform:"uppercase",letterSpacing:"0.1em",animation:"stat-count .4s ease .55s both"}}>
            {statLabel}
          </div>
        </>}
      </div>
      {revealed&&<div style={{position:"absolute",inset:"-20px",borderRadius:"50%",
        background:`radial-gradient(circle,${accent}55 0%,transparent 70%)`,
        animation:"podium-flash .8s ease-out both",pointerEvents:"none"}}/>}
    </div>
  )
}

function SlidePodium({accent,bg,data,title,icon,jokesKey,statLabel,statKey,statSuffix="",backdropTitle}){
  // Phases: 0=announce, 1=jokes cycling, 2=reveal
  const[phase,setPhase]=useState(0)
  const[jokeIdx,setJokeIdx]=useState(0)
  const[jokeVisible,setJokeVisible]=useState(true)
  const[revealed,setRevealed]=useState([false,false,false])
  const jokes=JOKES[jokesKey]||[]

  useEffect(()=>{
    setPhase(0);setJokeIdx(0);setJokeVisible(true);setRevealed([false,false,false])
    // Phase 0 → 1 after 1.8s
    const t1=setTimeout(()=>setPhase(1), 1800)
    return()=>clearTimeout(t1)
  },[])

  // Cycle jokes in phase 1
  useEffect(()=>{
    if(phase!==1)return
    let idx=0
    const advance=()=>{
      setJokeVisible(false)
      setTimeout(()=>{
        idx++
        if(idx>=jokes.length){setPhase(2);return}
        setJokeIdx(idx);setJokeVisible(true)
        setTimeout(advance,1800)
      },350)
    }
    const t=setTimeout(advance,1800)
    return()=>clearTimeout(t)
  },[phase])

  // Phase 2: podium reveals
  useEffect(()=>{
    if(phase!==2)return
    PODIUM_DELAYS.forEach((delay,i)=>{
      setTimeout(()=>setRevealed(prev=>{const n=[...prev];n[i]=true;return n}),delay)
    })
  },[phase])

  const img=backdropTitle?IMG[backdropTitle]:null

  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",padding:"16px 20px",position:"relative",zIndex:10}}>

      {/* Backdrop */}
      {img?.b&&<div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0,pointerEvents:"none"}}>
        <img src={img.b} alt="" style={{width:"100%",height:"100%",objectFit:"cover",opacity:.16}}/>
        <div style={{position:"absolute",inset:0,background:`linear-gradient(180deg,${bg}80 0%,${bg}20 40%,${bg}70 80%,${bg}ff 100%)`}}/>
      </div>}

      {/* Top spotlight */}
      <div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:"70vw",height:"55vh",
        pointerEvents:"none",zIndex:1,background:`radial-gradient(ellipse at 50% 0%,${accent}25 0%,transparent 70%)`,
        animation:"spotlight-pulse 3s ease-in-out infinite"}}/>

      {/* Header — always visible */}
      <div style={{textAlign:"center",marginBottom:phase>=2?16:24,position:"relative",zIndex:5,transition:"margin .4s"}}>
        <div style={{fontSize:34,marginBottom:6,filter:`drop-shadow(0 0 20px ${accent})`,animation:"float 3s ease-in-out infinite"}}>{icon}</div>
        <div style={{fontSize:9,color:accent,letterSpacing:".3em",fontFamily:"DM Mono,monospace",textTransform:"uppercase",marginBottom:4}}>XENOCLOUD · 2024</div>
        <h2 style={{fontSize:28,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05,animation:"slide-up .7s ease .2s both"}}>
          {title}
        </h2>
      </div>

      {/* PHASE 0 — pulse rings */}
      {phase===0&&(
        <div style={{position:"relative",width:80,height:80,zIndex:5}}>
          {[0,1,2].map(i=><div key={i} style={{position:"absolute",inset:0,borderRadius:"50%",
            border:`2px solid ${accent}`,animation:`pulse-ring 1.8s ease-out ${i*.6}s infinite`}}/>)}
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:36,filter:`drop-shadow(0 0 20px ${accent})`}}>🎭</div>
        </div>
      )}

      {/* PHASE 1 — jokes */}
      {phase===1&&(
        <div style={{zIndex:5,textAlign:"center",maxWidth:320,position:"relative"}}>
          {/* Drum roll bar */}
          <div style={{height:3,borderRadius:2,marginBottom:20,
            background:`linear-gradient(90deg,transparent,${accent},transparent)`,
            animation:"drum-roll 0.4s ease-in-out infinite"}}/>
          <div style={{
            fontSize:18,color:"white",fontFamily:"Outfit,sans-serif",fontWeight:400,
            lineHeight:1.5,minHeight:56,
            opacity:jokeVisible?1:0,
            transform:jokeVisible?"translateY(0)":"translateY(-10px)",
            transition:"opacity .3s ease,transform .3s ease",
          }}>
            {jokes[jokeIdx]}
          </div>
          {/* Progress dots */}
          <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:16}}>
            {jokes.map((_,i)=><div key={i} style={{width:i<=jokeIdx?20:6,height:6,borderRadius:3,
              background:i<=jokeIdx?accent:"rgba(255,255,255,0.15)",transition:"all .3s ease"}}/>)}
          </div>
        </div>
      )}

      {/* PHASE 2 — Podium */}
      {phase===2&&(
        <div style={{width:"100%",maxWidth:380,position:"relative",zIndex:5}}>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,width:"100%"}}>
            {[{item:data[2],rIdx:0,isOne:false},{item:data[0],rIdx:2,isOne:true},{item:data[1],rIdx:1,isOne:false}].map(({item,rIdx,isOne},col)=>(
              <div key={col} style={{flex:isOne?1.15:1,position:"relative"}}>
                <PodiumPlatform item={item} rankIdx={rIdx} accent={accent}
                  revealed={revealed[rIdx]} isOne={isOne}
                  statLabel={statLabel} statValue={`${item[statKey]}${statSuffix}`}/>
              </div>
            ))}
          </div>
          <div style={{height:6,borderRadius:4,marginTop:0,background:`linear-gradient(90deg,transparent,${accent}40,${accent}70,${accent}40,transparent)`,boxShadow:`0 0 20px ${accent}30`}}/>
          {revealed[2]&&data[3]&&(
            <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,padding:"8px 14px",borderRadius:10,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",animation:"slide-up .4s ease .2s both"}}>
              <PosterImg title={data[3].t} width={28} height={40} radius={4}/>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",fontFamily:"DM Mono,monospace"}}>4e · Mention honorable</div>
                <div style={{color:"white",fontWeight:600,fontFamily:"Syne,sans-serif",fontSize:12}}>{data[3].t}</div>
              </div>
              <div style={{marginLeft:"auto",color:accent,fontFamily:"DM Mono,monospace",fontSize:11}}>{data[3][statKey]}{statSuffix}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── CONTENT SLIDES (condensed) ───────────────────────────────────────────────
function SlideIntro({accent,onStart}){
  return <div style={{textAlign:"center",maxWidth:380,width:"100%"}}>
    <div style={{position:"relative",width:130,height:130,margin:"0 auto 26px"}}>
      {[0,1,2,3].map(i=><div key={i} style={{position:"absolute",inset:0,borderRadius:"50%",border:`1.5px solid ${accent}`,animation:`pulse-ring 3s ease-out ${i*.8}s infinite`}}/>)}
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:54,filter:`drop-shadow(0 0 40px ${accent}90)`}}>🎬</div>
    </div>
    <div className="s0" style={{fontSize:9,color:accent,letterSpacing:".35em",fontFamily:"DM Mono,monospace",textTransform:"uppercase"}}>XENOCLOUD · RECAP ANNUEL</div>
    <h1 className="s1" style={{fontSize:72,fontWeight:800,color:"white",lineHeight:.88,margin:"10px 0 6px",fontFamily:"Syne,sans-serif",textShadow:`0 0 120px ${accent}55`}}>
      WRAP<span style={{background:`linear-gradient(135deg,${accent},#fb923c)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>PARR</span>
    </h1>
    <p className="s2" style={{fontSize:16,color:"rgba(255,255,255,.42)",margin:"14px 0 4px",fontFamily:"Outfit,sans-serif"}}>Bienvenue, <span style={{color:"white",fontWeight:600}}>Jérémie</span></p>
    <p className="s3" style={{fontSize:12,color:"rgba(255,255,255,.2)",marginBottom:34,fontFamily:"Outfit,sans-serif"}}>Ton année 2024 · 24 slides<span style={{animation:"blink-c 1s step-end infinite"}}>|</span></p>
    <button className="s4" onClick={onStart} style={{padding:"14px 42px",borderRadius:40,border:"none",cursor:"pointer",background:`linear-gradient(135deg,${accent},#fb923c)`,color:"#000",fontSize:15,fontWeight:800,fontFamily:"Syne,sans-serif",boxShadow:`0 0 70px ${accent}55`}}>Découvrir →</button>
  </div>
}
function SlideOverview({accent}){
  const active=useActive()
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:18}}><Tag accent={accent}/>
      <h2 style={{fontSize:38,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1}}>Ton année<br/><span style={{color:accent}}>en chiffres</span></h2>
    </div>
    <div className="s1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      {[{v:1240,s:"h",l:"heures totales"},{v:312,s:"",l:"contenus"},{v:67,s:"",l:"films"},{v:11,s:"",l:"livres audio"}].map((c,i)=>(
        <div key={c.l} className="glass" style={{padding:"14px 16px",animation:`slide-up .5s ease ${.14+i*.09}s both`}}>
          <div style={{fontSize:32,fontWeight:800,color:accent,fontFamily:"Syne,sans-serif",lineHeight:1,animation:active?`flash-n .8s ease ${.38+i*.1}s both`:"none"}}>{active?<AN t={c.v} s={c.s}/>:`0${c.s}`}</div>
          <Lbl>{c.l}</Lbl>
        </div>
      ))}
    </div>
    <div className="s2" style={{display:"flex",gap:6,marginTop:9,flexWrap:"wrap"}}>{["🎬 Plex","🎮 ROMM","🎧 Audio","📚 Komga"].map(s=><Pill key={s} accent={accent}>{s}</Pill>)}</div>
    <div className="glass s3" style={{padding:"11px 14px",marginTop:9,display:"flex",alignItems:"center",gap:10}}>
      <span style={{fontSize:26,animation:"float 2s ease-in-out infinite"}}>🔥</span>
      <div><div style={{color:"white",fontWeight:700,fontSize:13,fontFamily:"Syne,sans-serif"}}>Streak record : 47 jours</div><Lbl>Meilleur mois : Décembre</Lbl></div>
      <div style={{marginLeft:"auto"}}><VsB value={12}/></div>
    </div>
  </div>
}
function SlideFilms({accent}){
  const active=useActive();const f=D.plex.films
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎬 Plex · Films</Lbl>
      <div style={{display:"flex",alignItems:"flex-end",gap:12,marginTop:4}}>
        <div><BigNum value={67} accent={accent} active={active}/><Lbl>films cette année</Lbl></div>
        <div style={{marginBottom:3}}><div style={{fontSize:22,fontWeight:700,color:`${accent}bb`,fontFamily:"Syne,sans-serif"}}>{active?<AN t={412} s="h"/>:"0h"}</div><Lbl>visionnés</Lbl></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}><VsB value={f.vsLastYear}/><Pill accent={accent}>108 min moy.</Pill><Pill accent="#fb923c">14 revus 🔄</Pill></div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:7,marginBottom:9}}>
      {f.top.slice(0,3).map((film,i)=><PosterCard key={film.t} item={film} accent={accent} rank={i+1} statLine={`★ ${film.r}`} style={{animation:`slide-up .5s ease ${.2+i*.1}s both`}}/>)}
    </div>
    <div className="glass s2" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Genres favoris</Lbl>
      <ResponsiveContainer width="100%" height={55} style={{marginTop:5}}>
        <BarChart data={f.genres} layout="vertical" margin={{left:0,right:4,top:0,bottom:0}}>
          <XAxis type="number" hide/>
          <YAxis dataKey="n" type="category" width={55} tick={{fill:"rgba(255,255,255,.45)",fontSize:9}} axisLine={false} tickLine={false}/>
          <Tooltip content={<CTip unit=" films"/>}/>
          <Bar dataKey="v" radius={[0,3,3,0]}>{f.genres.map((_,i)=><Cell key={i} fill={`${accent}${Math.max(22,80-i*12).toString(16).padStart(2,"0")}`}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
}
function SlideFilmsDeep({accent}){
  const f=D.plex.films
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎬 Films · Habitudes</Lbl>
      <h2 style={{fontSize:26,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05,marginTop:4}}>Quand tu regardes<br/><span style={{color:accent}}>des films</span></h2>
    </div>
    <div className="glass s1" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Jour préféré</Lbl><DayChart data={f.dayOfWeek} accent={accent} height={54} unit=" films"/><div style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"DM Mono,monospace",marginTop:3,textAlign:"right"}}>📅 Peak : samedi</div></div>
    <div className="glass s2" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Heure de démarrage</Lbl><TimeChart data={f.timeOfDay} accent={accent} height={52} unit=" films"/><div style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"DM Mono,monospace",marginTop:3,textAlign:"right"}}>🌙 Peak : 20h</div></div>
    <div className="glass s3" style={{padding:"10px 12px",marginBottom:9}}><Lbl c={accent} size={8}>Films par mois</Lbl><AreaG data={f.monthly} dataKey="v" accent={accent} height={50} unit=" films" id="filmm"/></div>
    <div className="glass s4" style={{padding:"12px 16px"}}>
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {[["2.3","/sem.","Films moy."],["108","min","Durée moy."],["14","revus","Reruns"]].map(([v,suf,l])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:20,color:accent,lineHeight:1}}>{v}<span style={{fontSize:11,opacity:.7}}>{suf}</span></div><Lbl size={9}>{l}</Lbl></div>
        ))}
      </div>
    </div>
  </div>
}
function SlideSeries({accent}){
  const active=useActive();const s=D.plex.series
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎭 Plex · Séries</Lbl>
      <div style={{display:"flex",alignItems:"flex-end",gap:12,marginTop:4}}>
        <div><BigNum value={312} accent={accent} active={active}/><Lbl>épisodes</Lbl></div>
        <div style={{marginBottom:3}}><div style={{fontSize:22,fontWeight:700,color:`${accent}bb`,fontFamily:"Syne,sans-serif"}}>{active?<AN t={435} s="h"/>:"0h"}</div><Lbl>de séries</Lbl></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}><VsB value={s.vsLastYear}/><Pill accent={accent}>3.2 ép/session</Pill><Pill accent="#f87171">Binge max : 8 ép 🔥</Pill></div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:7,marginBottom:9}}>
      {s.top.slice(0,3).map((sr,i)=><PosterCard key={sr.t} item={sr} accent={accent} rank={i+1} statLine={`${sr.ep}ep · S${sr.seasons}`} style={{animation:`slide-up .5s ease ${.2+i*.1}s both`}}/>)}
    </div>
    <div className="glass s2" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Épisodes par mois</Lbl><AreaG data={s.monthly} dataKey="v" accent={accent} height={50} unit=" épisodes" id="serm"/></div>
  </div>
}
function SlideSeriesDeep({accent}){
  const s=D.plex.series
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎭 Séries · Habitudes</Lbl>
      <h2 style={{fontSize:26,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05,marginTop:4}}>Quand tu regardes<br/><span style={{color:accent}}>des séries</span></h2>
    </div>
    <div className="glass s1" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Activité par jour</Lbl><DayChart data={s.dayOfWeek} accent={accent} height={58} unit=" épisodes"/><div style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"DM Mono,monospace",marginTop:3,textAlign:"right"}}>📅 Peak : week-end</div></div>
    <div className="glass s2" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Heure de visionnage</Lbl><TimeChart data={s.timeOfDay} accent={accent} height={52} unit=" épisodes"/><div style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"DM Mono,monospace",marginTop:3,textAlign:"right"}}>🌙 Peak : 22h — night owl</div></div>
    <div className="glass s3" style={{padding:"12px 16px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {[["3.2","ép/sess.","Session moy."],["8","ép","Binge record"],["4","séries","Terminées"]].map(([v,suf,l])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:accent,lineHeight:1}}>{v}<span style={{fontSize:11,opacity:.6}}>{suf}</span></div><Lbl size={9}>{l}</Lbl></div>
        ))}
      </div>
    </div>
    <div className="s4"><MiniRank data={D.plex.ranking} accent={accent} label="Classement Plex"/></div>
  </div>
}
function SlideRomm({accent}){
  const active=useActive();const r=D.romm
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎮 ROMM · Jeux Vidéo</Lbl>
      <div style={{display:"flex",alignItems:"flex-end",gap:14,marginTop:4}}>
        <div><BigNum value={24} accent={accent} active={active}/><Lbl>jeux joués</Lbl></div>
        <div style={{marginBottom:3}}><div style={{fontSize:22,fontWeight:700,color:`${accent}bb`,fontFamily:"Syne,sans-serif"}}>{active?<AN t={186} s="h"/>:"0h"}</div><Lbl>de jeu</Lbl></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}><VsB value={r.vsLastYear}/><Pill accent={accent}>67% complétés</Pill><Pill accent="#fb923c">Session max : 11h</Pill></div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:7,marginBottom:9}}>
      {r.top.slice(0,3).map((g,i)=><PosterCard key={g.t} item={g} accent={accent} rank={i+1} statLine={`${g.hours}h · ${g.platform}`} style={{animation:`slide-up .5s ease ${.2+i*.1}s both`}}/>)}
    </div>
    <div className="glass s2" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Heures par console</Lbl>
      <ResponsiveContainer width="100%" height={55} style={{marginTop:5}}>
        <BarChart data={r.consoles} margin={{left:0,right:4,top:0,bottom:0}}>
          <XAxis dataKey="n" tick={{fill:"rgba(255,255,255,.4)",fontSize:9}} axisLine={false} tickLine={false}/>
          <YAxis hide/><Tooltip content={<CTip unit="h"/>}/>
          <Bar dataKey="v" radius={[3,3,0,0]}>{r.consoles.map((_,i)=><Cell key={i} fill={i===0?accent:`${accent}${(55-i*12).toString(16).padStart(2,"0")}`}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="glass s3" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Activité mensuelle</Lbl><AreaG data={r.monthly} dataKey="v" accent={accent} height={50} unit="h" id="rommm"/></div>
  </div>
}
function SlideRommDeep({accent}){
  const r=D.romm
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎮 ROMM · Stats avancées</Lbl>
      <h2 style={{fontSize:26,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05,marginTop:4}}>Dans le <span style={{color:accent}}>détail</span></h2>
    </div>
    <div className="glass s1" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Jeux par décennie</Lbl>
      <ResponsiveContainer width="100%" height={58} style={{marginTop:5}}>
        <BarChart data={r.decades} margin={{left:0,right:4,top:0,bottom:0}}>
          <XAxis dataKey="d" tick={{fill:"rgba(255,255,255,.4)",fontSize:9}} axisLine={false} tickLine={false}/>
          <YAxis hide/><Tooltip content={<CTip unit=" jeux"/>}/>
          <Bar dataKey="v" radius={[3,3,0,0]}>{r.decades.map((d,i)=><Cell key={i} fill={d.v===Math.max(...r.decades.map(x=>x.v))?accent:`${accent}45`}/>)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="s2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
      <div className="glass" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Genres</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:4,marginTop:6}}>
          {r.genres.map((g,i)=><div key={g.n} style={{display:"flex",justifyContent:"space-between",animation:`slide-up .4s ease ${.3+i*.06}s both`}}>
            <span style={{fontSize:10,color:"rgba(255,255,255,.55)",fontFamily:"Outfit,sans-serif"}}>{g.n}</span>
            <span style={{color:accent,fontSize:10,fontFamily:"DM Mono,monospace"}}>×{g.v}</span>
          </div>)}
        </div>
      </div>
      <div className="glass" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Sessions</Lbl>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:8}}>
          {[["4.2h","Durée moy."],["11h","Plus longue"],["67%","Taux compl."]].map(([v,l])=>(
            <div key={l}><div style={{color:accent,fontWeight:800,fontSize:20,fontFamily:"Syne,sans-serif",lineHeight:1}}>{v}</div><Lbl size={9}>{l}</Lbl></div>
          ))}
        </div>
      </div>
    </div>
    <div className="s3"><MiniRank data={r.ranking} accent={accent} label="Classement ROMM"/></div>
  </div>
}
function SlideAudio({accent}){
  const active=useActive();const a=D.audio
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎧 Audiobookshelf</Lbl>
      <div style={{display:"flex",alignItems:"flex-end",gap:12,marginTop:4}}>
        <div><BigNum value={11} accent={accent} active={active}/><Lbl>livres audio</Lbl></div>
        <div style={{marginBottom:3}}><div style={{fontSize:22,fontWeight:700,color:`${accent}bb`,fontFamily:"Syne,sans-serif"}}>{active?<AN t={134} s="h"/>:"0h"}</div><Lbl>d'écoute</Lbl></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}><VsB value={a.vsLastYear}/><Pill accent={accent}>12.2h moy./livre</Pill></div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:7,marginBottom:9}}>
      {a.top.slice(0,3).map((b,i)=><PosterCard key={b.t} item={b} accent={accent} rank={i+1} statLine={`${b.h}h`} style={{animation:`slide-up .5s ease ${.2+i*.1}s both`}}/>)}
    </div>
    <div className="glass s2" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Heures d'écoute par mois</Lbl><AreaG data={a.monthly} dataKey="v" accent={accent} height={52} unit="h" id="audiom"/></div>
  </div>
}
function SlideAudioDeep({accent}){
  const a=D.audio
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>🎧 Audio · Habitudes</Lbl>
      <h2 style={{fontSize:26,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05,marginTop:4}}>Quand tu<br/><span style={{color:accent}}>écoutes</span></h2>
    </div>
    <div className="glass s1" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Heure d'écoute favorite</Lbl><TimeChart data={a.timeOfDay} accent={accent} height={54} unit="h"/><div style={{fontSize:9,color:"rgba(255,255,255,.25)",fontFamily:"DM Mono,monospace",marginTop:3,textAlign:"right"}}>🌙 Peak : 20h</div></div>
    <div className="glass s2" style={{padding:"10px 12px",marginBottom:8}}><Lbl c={accent} size={8}>Activité par jour</Lbl><DayChart data={a.dayOfWeek} accent={accent} height={54} unit="h"/></div>
    <div className="glass s3" style={{padding:"12px 16px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-around"}}>
        {[["12.2","h/livre","Durée moy."],["28","h","Plus long"],["1.2","h/j","Rythme moy."]].map(([v,suf,l])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:22,color:accent,lineHeight:1}}>{v}<span style={{fontSize:11,opacity:.6}}>{suf}</span></div><Lbl size={9}>{l}</Lbl></div>
        ))}
      </div>
    </div>
    <div className="s4"><MiniRank data={a.ranking} accent={accent} label="Classement Audiobookshelf"/></div>
  </div>
}
function SlideKomga({accent}){
  const active=useActive();const k=D.komga
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:12}}><Tag accent={accent}/><Lbl c={accent} size={9}>📚 Komga · Lecture</Lbl>
      <div style={{display:"flex",alignItems:"flex-end",gap:12,marginTop:4}}>
        <div><BigNum value={89} accent={accent} active={active}/><Lbl>volumes lus</Lbl></div>
        <div style={{marginBottom:3}}><div style={{fontSize:22,fontWeight:700,color:`${accent}bb`,fontFamily:"Syne,sans-serif"}}>{active?<AN t={12} s=" séries"/>:"0"}</div><Lbl>commencées</Lbl></div>
      </div>
      <div style={{display:"flex",gap:6,marginTop:7,flexWrap:"wrap"}}><VsB value={k.vsLastYear}/><Pill accent={accent}>7.4 vol/mois</Pill></div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:7,marginBottom:9}}>
      {k.top.slice(0,3).map((s,i)=><PosterCard key={s.t} item={s} accent={accent} rank={i+1} statLine={`${s.vols} vol`} style={{animation:`slide-up .5s ease ${.2+i*.1}s both`}}/>)}
    </div>
    <div className="s2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
      <div className="glass" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Genres lus</Lbl>
        <ResponsiveContainer width="100%" height={68} style={{marginTop:5}}>
          <BarChart data={k.genres} layout="vertical" margin={{left:0,right:4,top:0,bottom:0}}>
            <XAxis type="number" hide/>
            <YAxis dataKey="n" type="category" width={62} tick={{fill:"rgba(255,255,255,.4)",fontSize:8}} axisLine={false} tickLine={false}/>
            <Tooltip content={<CTip unit=" vol"/>}/>
            <Bar dataKey="v" radius={[0,3,3,0]}>{k.genres.map((_,i)=><Cell key={i} fill={`${accent}${(80-i*18).toString(16).padStart(2,"0")}`}/>)}</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="glass" style={{padding:"10px 12px"}}><Lbl c={accent} size={8}>Jour de lecture</Lbl><DayChart data={k.dayOfWeek} accent={accent} height={68} unit=" volumes"/></div>
    </div>
    <div className="s3" style={{marginTop:8}}><MiniRank data={k.ranking} accent={accent} unit=" vol" label="Classement"/></div>
  </div>
}
function SlideCompare({accent}){
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:16}}><Tag accent={accent}/>
      <h2 style={{fontSize:34,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.05}}>2024 vs <span style={{color:accent}}>2023</span></h2>
    </div>
    <div className="glass s1" style={{padding:"12px 12px",marginBottom:9}}>
      <div style={{display:"flex",gap:12,marginBottom:8}}>{[["2024",accent],["2023","rgba(255,255,255,.25)"]].map(([y,c])=>(
        <div key={y} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:c,fontFamily:"DM Mono,monospace"}}><div style={{width:16,height:2.5,background:c,borderRadius:2}}/>{y}</div>
      ))}</div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={D.comparison.monthly} margin={{top:2,right:4,left:0,bottom:0}}>
          <XAxis dataKey="m" tick={{fill:"rgba(255,255,255,.3)",fontSize:8}} axisLine={false} tickLine={false}/>
          <YAxis hide/><Tooltip content={<CTip/>}/>
          <Line type="monotone" dataKey="a" stroke={accent} strokeWidth={2.5} dot={false}/>
          <Line type="monotone" dataKey="b" stroke="rgba(255,255,255,.2)" strokeWidth={1.5} dot={false} strokeDasharray="4 3"/>
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="glass s2" style={{padding:"12px 14px",marginBottom:9}}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        {[["🎬","Films",23,"#E5A00D"],["🎭","Séries",19,"#E87C2A"],["🎮","ROMM",8,"#34d399"],["🎧","Audio",45,"#fb923c"],["📚","Komga",34,"#c084fc"]].map(([e,l,v,c])=>(
          <div key={l} style={{textAlign:"center"}}><div style={{fontSize:14}}>{e}</div><div style={{color:c,fontWeight:800,fontSize:16,fontFamily:"Syne,sans-serif"}}>+{v}%</div><Lbl size={8}>{l}</Lbl></div>
        ))}
      </div>
    </div>
    <div className="s3" style={{display:"flex",gap:8,flexWrap:"wrap"}}><VsB value={18} label="global vs 2023"/><Pill accent={accent}>🏆 Meilleure année</Pill></div>
  </div>
}
function SlideRanking({accent}){
  const medals=["🥇","🥈","🥉"];const max=D.global.users[0].v
  return <div style={{maxWidth:430,width:"100%"}}>
    <div className="s0" style={{marginBottom:16}}><Tag accent={accent}/>
      <h2 style={{fontSize:36,fontWeight:800,color:"white",fontFamily:"Syne,sans-serif",lineHeight:1.0}}>Tu es<br/><span style={{background:`linear-gradient(135deg,${accent},#fb923c)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>#2 sur 6</span></h2>
      <div style={{fontSize:12,color:"rgba(255,255,255,.3)",fontFamily:"Outfit,sans-serif",marginTop:4}}>utilisateurs Xenocloud</div>
    </div>
    <div className="s1" style={{display:"flex",flexDirection:"column",gap:6}}>
      {D.global.users.map((u,i)=>{const isMe=u.n===ME;return(
        <div key={u.n} style={{display:"flex",alignItems:"center",gap:9,padding:"9px 13px",
          background:isMe?`${accent}16`:"rgba(255,255,255,.022)",border:`1px solid ${isMe?accent+"55":"rgba(255,255,255,.05)"}`,borderRadius:11,
          boxShadow:isMe?`0 0 30px ${accent}22`:"none",animation:`slide-up .45s ease ${.08+i*.08}s both`}}>
          <div style={{width:24,textAlign:"center",fontSize:13,flexShrink:0,color:i<3?"transparent":"rgba(255,255,255,.2)",fontWeight:700}}>{i<3?medals[i]:i+1}</div>
          <div style={{flex:1}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12,fontFamily:isMe?"Syne,sans-serif":"Outfit,sans-serif",fontWeight:isMe?800:400,color:isMe?accent:"rgba(255,255,255,.7)"}}>
                {u.n}{isMe&&<span style={{fontSize:9,color:`${accent}70`,fontWeight:400}}> · moi</span>}
              </span>
              <span style={{fontSize:11,color:isMe?accent:"rgba(255,255,255,.3)",fontFamily:"DM Mono,monospace",fontWeight:isMe?700:400}}>{u.v.toLocaleString("fr-FR")}h</span>
            </div>
            <div style={{height:2.5,background:"rgba(255,255,255,.05)",borderRadius:2,marginTop:4,overflow:"hidden"}}>
              <div style={{height:"100%",background:isMe?`linear-gradient(90deg,${accent},#fb923c)`:"rgba(255,255,255,.14)",
                width:`${(u.v/max)*100}%`,borderRadius:2,transformOrigin:"left",animation:`bar-grow .8s ease ${.28+i*.08}s both`}}/>
            </div>
          </div>
        </div>
      )})}
    </div>
  </div>
}

// ─── EPIC FINALE ─────────────────────────────────────────────────────────────
function SlideFinale({accent,onRestart}){
  const active=useActive()
  const POSTERS_ALL=["Dune: Part Two","Shōgun","Zelda: TotK","Le Problème à 3 corps","Vinland Saga","Oppenheimer","The Bear","Baldur's Gate 3","Dune","Berserk","Poor Things","Fallout"]

  return(
    <div style={{width:"100%",height:"100vh",overflow:"hidden",position:"relative",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",zIndex:10}}>

      {/* Scrolling poster strip */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:90,overflow:"hidden",zIndex:1,
        mask:"linear-gradient(90deg,transparent,black 15%,black 85%,transparent)",
        WebkitMask:"linear-gradient(90deg,transparent,black 15%,black 85%,transparent)"}}>
        <div style={{display:"flex",gap:8,animation:"poster-strip 22s linear infinite",width:"max-content",padding:"8px 0"}}>
          {[...POSTERS_ALL,...POSTERS_ALL].map((t,i)=>{const img=IMG[t];const[e,setE]=useState(false);return(
            <div key={i} style={{width:52,height:74,borderRadius:7,flexShrink:0,overflow:"hidden",
              boxShadow:`0 4px 18px ${accent}25`,opacity:.55,border:`1px solid rgba(255,255,255,0.1)`}}>
              {img?.p&&!e?<img src={img.p} alt={t} onError={()=>setE(true)} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                :<div style={{width:"100%",height:"100%",background:img?.grad?`linear-gradient(135deg,${img.grad[0]},${img.grad[1]})`:"#222",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{img?.emoji||"🎬"}</div>}
            </div>
          )})}
        </div>
      </div>

      {/* Content */}
      <div style={{position:"relative",zIndex:5,textAlign:"center",maxWidth:400,width:"100%",padding:"0 20px"}}>
        <div style={{fontSize:62,marginBottom:12,animation:"float 2.5s ease-in-out infinite",filter:`drop-shadow(0 0 30px ${accent}90)`}}>🏆</div>

        <div className="s0" style={{fontSize:8,color:"rgba(255,255,255,.2)",letterSpacing:".35em",textTransform:"uppercase",fontFamily:"DM Mono,monospace",marginBottom:10}}>
          MERCI POUR CETTE BELLE ANNÉE
        </div>
        <h1 className="s1" style={{fontSize:38,fontWeight:800,color:"white",lineHeight:1.0,marginBottom:14,fontFamily:"Syne,sans-serif"}}>
          C'était ton<br/>
          <span style={{backgroundImage:"linear-gradient(90deg,#E5A00D,#fb923c,#c084fc,#34d399,#60a5fa,#E5A00D)",
            WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",
            backgroundSize:"300% auto",animation:"shimmer-t 4s linear infinite"}}>Wrapparr 2024</span>
        </h1>

        {/* Big stats row */}
        <div className="s2" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6,marginBottom:12}}>
          {[{v:1240,s:"h",l:"Heures totales",c:accent},{v:312,s:"",l:"Contenus",c:"#a78bfa"},{v:4,s:" services",l:"Plateformes",c:"#34d399"},{v:47,s:" jours",l:"Streak max 🔥",c:"#fb923c"}].map((item,i)=>(
            <div key={item.l} style={{padding:"10px 12px",borderRadius:12,
              background:`${item.c}12`,border:`1px solid ${item.c}28`,
              animation:`stat-row-in .5s ease ${.2+i*.08}s both`}}>
              <div style={{fontSize:24,fontWeight:800,color:item.c,fontFamily:"Syne,sans-serif",lineHeight:1}}>
                {active?<AN t={item.v} s={item.s}/>:`0${item.s}`}
              </div>
              <div style={{fontSize:10,color:"rgba(255,255,255,.35)",fontFamily:"Outfit,sans-serif",textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>{item.l}</div>
            </div>
          ))}
        </div>

        {/* Service recap */}
        <div className="glass s3" style={{padding:"10px 14px",marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
            {[["🎬","847h","Plex","#E5A00D"],["🎮","186h","ROMM","#34d399"],["🎧","134h","Audio","#fb923c"],["📚","89v","Komga","#c084fc"]].map(([e,v,l,c])=>(
              <div key={l} style={{textAlign:"center"}}>
                <div style={{fontSize:22,filter:`drop-shadow(0 0 10px ${c}90)`}}>{e}</div>
                <div style={{color:c,fontWeight:800,fontSize:13,fontFamily:"Syne,sans-serif",marginTop:2}}>{v}</div>
                <div style={{fontSize:8,color:"rgba(255,255,255,.22)",fontFamily:"DM Mono,monospace",textTransform:"uppercase",letterSpacing:".1em"}}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Ranking badge */}
        <div className="s4" style={{display:"flex",justifyContent:"center",marginBottom:16}}>
          <div style={{padding:"8px 20px",borderRadius:40,
            background:`linear-gradient(135deg,${accent}25,#fb923c18)`,
            border:`1px solid ${accent}45`,
            boxShadow:`0 0 30px ${accent}30`}}>
            <span style={{color:accent,fontWeight:800,fontFamily:"Syne,sans-serif",fontSize:16}}>🥈 #2 Xenocloud </span>
            <span style={{color:"rgba(255,255,255,.4)",fontSize:12,fontFamily:"Outfit,sans-serif"}}>sur 6 utilisateurs</span>
          </div>
        </div>

        <div className="s5" style={{display:"flex",gap:10,justifyContent:"center"}}>
          <button style={{padding:"12px 28px",borderRadius:40,border:"none",cursor:"pointer",
            background:`linear-gradient(135deg,${accent},#fb923c)`,color:"#000",fontSize:14,fontWeight:800,
            fontFamily:"Syne,sans-serif",boxShadow:`0 0 60px ${accent}50`}}>📤 Partager</button>
          <button onClick={onRestart} style={{padding:"12px 28px",borderRadius:40,cursor:"pointer",
            background:"transparent",color:"rgba(255,255,255,.35)",fontSize:13,fontFamily:"Outfit,sans-serif",
            border:"1px solid rgba(255,255,255,.1)"}}>↩ Rejouer</button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function Wrapparr(){
  const[slide,setSlide]=useState(0)
  const[fade,setFade]=useState(false)
  const[dir,setDir]=useState(1)
  const touchY=useRef(null)

  const goTo=useCallback((n)=>{
    if(n<0||n>=SLIDES_DEF.length||fade)return
    setDir(n>slide?1:-1);setFade(true)
    setTimeout(()=>{setSlide(n);setFade(false)},230)
  },[slide,fade])

  useEffect(()=>{
    const h=e=>{if(e.key==="ArrowDown"||e.key==="ArrowRight")goTo(slide+1);if(e.key==="ArrowUp"||e.key==="ArrowLeft")goTo(slide-1)}
    window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)
  },[slide,goTo])

  const curr=SLIDES_DEF[slide]
  const isCat=curr.cat===true
  const isPod=curr.pod===true
  const isFinale=curr.id==="finale"
  const needSpotlights=isCat||isPod||isFinale

  // intensity: category = cinematic reveal, podium = dramatic, finale = festive softer
  const spotlightIntensity=isCat?0.9:isPod?1.2:isFinale?0.65:0.7

  const NODES=[
    /* 0  */ <SlideIntro key="i" accent={curr.accent} onStart={()=>goTo(1)}/>,
    /* 1  */ <SlideOverview key="o" accent={curr.accent}/>,
    /* 2  */ <SlideCat key="cf" accent={curr.accent} bg={curr.bg} icon="🎬" label="FILMS" sub="Cinéma · Documentaires · Courts-métrages"/>,
    /* 3  */ <SlidePodium key="fp" accent={curr.accent} bg={curr.bg} data={D.plex.films.top} title="Top Films 2024" icon="🎬" jokesKey="films" statLabel="note" statKey="r" backdropTitle="Dune: Part Two"/>,
    /* 4  */ <SlideFilms key="f" accent={curr.accent}/>,
    /* 5  */ <SlideFilmsDeep key="fd" accent={curr.accent}/>,
    /* 6  */ <SlideCat key="cs" accent={curr.accent} bg={curr.bg} icon="🎭" label="SÉRIES" sub="Drama · Sci-Fi · Documentaires TV"/>,
    /* 7  */ <SlidePodium key="sp" accent={curr.accent} bg={curr.bg} data={D.plex.series.top} title="Top Séries 2024" icon="🎭" jokesKey="series" statLabel="épisodes" statKey="ep" backdropTitle="Shōgun"/>,
    /* 8  */ <SlideSeries key="s" accent={curr.accent}/>,
    /* 9  */ <SlideSeriesDeep key="sd" accent={curr.accent}/>,
    /* 10 */ <SlideCat key="cr" accent={curr.accent} bg={curr.bg} icon="🎮" label="JEUX VIDÉO" sub="Switch · PC · Rétrogaming"/>,
    /* 11 */ <SlidePodium key="rp" accent={curr.accent} bg={curr.bg} data={D.romm.top} title="Top Jeux 2024" icon="🎮" jokesKey="romm" statLabel="heures" statKey="hours" statSuffix="h"/>,
    /* 12 */ <SlideRomm key="r" accent={curr.accent}/>,
    /* 13 */ <SlideRommDeep key="rd" accent={curr.accent}/>,
    /* 14 */ <SlideCat key="ca" accent={curr.accent} bg={curr.bg} icon="🎧" label="LIVRES AUDIO" sub="Sci-Fi · Thriller · Post-Apocalyptique"/>,
    /* 15 */ <SlidePodium key="ap" accent={curr.accent} bg={curr.bg} data={D.audio.top} title="Top Livres Audio 2024" icon="🎧" jokesKey="audio" statLabel="durée" statKey="h" statSuffix="h"/>,
    /* 16 */ <SlideAudio key="a" accent={curr.accent}/>,
    /* 17 */ <SlideAudioDeep key="ad" accent={curr.accent}/>,
    /* 18 */ <SlideCat key="ck" accent={curr.accent} bg={curr.bg} icon="📚" label="MANGA" sub="Shōnen · Seinen · Dark Fantasy"/>,
    /* 19 */ <SlidePodium key="kp" accent={curr.accent} bg={curr.bg} data={D.komga.top} title="Top Manga 2024" icon="📚" jokesKey="komga" statLabel="volumes" statKey="vols"/>,
    /* 20 */ <SlideKomga key="k" accent={curr.accent}/>,
    /* 21 */ <SlideCompare key="c" accent={curr.accent}/>,
    /* 22 */ <SlideRanking key="rk" accent={curr.accent}/>,
    /* 23 */ <SlideFinale key="fn" accent={curr.accent} onRestart={()=>goTo(0)}/>,
  ]

  return(
    <div
      onTouchStart={e=>{touchY.current=e.touches[0].clientY}}
      onTouchEnd={e=>{if(touchY.current===null)return;const d=touchY.current-e.changedTouches[0].clientY;if(Math.abs(d)>40)goTo(slide+(d>0?1:-1));touchY.current=null}}
      style={{width:"100%",height:"100vh",overflow:"hidden",position:"relative",
        background:curr.bg,transition:"background .75s ease",fontFamily:"Outfit,sans-serif",userSelect:"none"}}>

      <style>{CSS}</style>
      <Stars/>
      <Orbs accent={curr.accent}/>
      {needSpotlights&&<Spotlights accent={curr.accent} intensity={spotlightIntensity}/>}
      {isFinale&&<Confetti/>}
      {isFinale&&<Fireworks active={true}/>}
      <Grain/>

      {/* Dot nav */}
      <div style={{position:"fixed",right:11,top:"50%",transform:"translateY(-50%)",
        display:"flex",flexDirection:"column",gap:3.5,zIndex:200}}>
        {SLIDES_DEF.map((s,i)=>(
          <div key={i} onClick={()=>goTo(i)} style={{
            width:i===slide?4:s.cat?3.5:s.pod?3.5:2.5,
            height:i===slide?16:s.cat?6:s.pod?5:2.5,
            borderRadius:3,
            background:i===slide?curr.accent:s.cat?`${SLIDES_DEF[i].accent}80`:s.pod?`${SLIDES_DEF[i].accent}55`:"rgba(255,255,255,.12)",
            transition:"all .3s ease",cursor:"pointer",
            boxShadow:i===slide?`0 0 8px ${curr.accent}95`:"none"}}/>
        ))}
      </div>

      <div style={{position:"fixed",top:14,left:14,zIndex:100,fontSize:9,color:"rgba(255,255,255,.18)",fontFamily:"DM Mono,monospace",letterSpacing:".2em",textTransform:"uppercase"}}>
        {slide+1} / {SLIDES_DEF.length}
        {isCat&&<span style={{color:curr.accent,marginLeft:8}}>● SECTION</span>}
        {isPod&&<span style={{color:curr.accent,marginLeft:8}}>★ PODIUM</span>}
      </div>

      {slide>0&&<button onClick={()=>goTo(slide-1)} style={{position:"fixed",left:13,top:"calc(50% - 44px)",transform:"translateY(-50%)",background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"rgba(255,255,255,.35)",fontSize:13,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>↑</button>}
      {slide<SLIDES_DEF.length-1&&<button onClick={()=>goTo(slide+1)} style={{position:"fixed",left:13,top:"calc(50% + 4px)",transform:"translateY(-50%)",background:"rgba(255,255,255,.035)",border:"1px solid rgba(255,255,255,.07)",borderRadius:"50%",width:32,height:32,cursor:"pointer",color:"rgba(255,255,255,.35)",fontSize:13,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}}>↓</button>}

      <div style={{position:"relative",zIndex:10,width:"100%",height:"100vh",
        display:(isCat||isPod||isFinale)?"block":"flex",
        alignItems:"center",justifyContent:"center",
        padding:(isCat||isPod||isFinale)?"0":"20px 44px 20px 18px",
        opacity:fade?0:1,transform:fade?`translateY(${dir*16}px)`:"translateY(0)",
        transition:"opacity .23s ease,transform .23s ease",
        overflowY:(isCat||isPod||isFinale)?"hidden":"auto"}}>
        {NODES[slide]}
      </div>

      {!isCat&&!isPod&&!isFinale&&slide>0&&slide<SLIDES_DEF.length-1&&(
        <div style={{position:"fixed",bottom:12,left:"50%",transform:"translateX(-50%)",
          color:"rgba(255,255,255,.12)",fontSize:9,fontFamily:"DM Mono,monospace",
          letterSpacing:".15em",animation:"float 3s ease-in-out infinite",pointerEvents:"none",zIndex:5}}>
          swipe ↕
        </div>
      )}
    </div>
  )
}
