import { useEffect, useRef } from "react"

const CHALK_TEXTS = [
  // Equations & formules
  "E = mc²", "2x + 3y = 12", "H₂O", "π ≈ 3.14159", "a² + b² = c²",
  "∑(n=1→∞) 1/n²", "f(x) = 2x³ - 5x + 1", "∞", "1 + 1 = 2",
  "∫ sin(x) dx = -cos(x)", "y = mx + b", "V = 4/3 πr³", "F = ma",
  "cos²θ + sin²θ = 1", "12 × 8 = 96", "√144 = 12", "log₂(8) = 3",
  "x² - 4 = 0  →  x = ±2", "42", "dx/dt = v", "lim x→0",
  "C₆H₁₂O₆", "NaCl", "Fe₂O₃", "pH = 7",
  // Notes & apreciations
  "BRAVO !!", "★★★★★", "100/100", "SUPER!", "EXCELLENT", "A+",
  "NOTE: 18/20", "★ TOP ★", "MERCI", "Tableau d'honneur",
  "Tres bien, continue comme ca!", "Peut mieux faire...",
  "Bon travail mais attention aux fautes",
  // Phrases longues
  "La Terre tourne autour du Soleil\nen 365 jours et 6 heures",
  "Les dinosaures ont disparu\nil y a 65 millions d'annees",
  "Victor Hugo a ecrit\nLes Miserables en 1862",
  "Le theoreme de Pythagore:\nDans un triangle rectangle,\nle carre de l'hypotenuse\nest egal a la somme\ndes carres des deux\nautres cotes.",
  "ATTENTION:\nControle de maths\nvendredi prochain !!!",
  "Il etait une fois,\ndans un pays lointain,\nun roi tres sage...",
  "Les 3 mousquetaires\netaient en fait 4:\nAthos, Porthos,\nAramis et d'Artagnan",
  "La photosynthese:\n6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂\n(lumiere necessaire)",
  // Listes
  "Courses:\n- cahier\n- stylos\n- gomme\n- regle\n- compas",
  "Les planetes:\n1. Mercure\n2. Venus\n3. Terre\n4. Mars\n5. Jupiter\n6. Saturne",
  "A retenir:\n• la gravite\n• la vitesse\n• l'acceleration\n• la force",
  "Menu cantine:\n- Entree: salade\n- Plat: poulet frites\n- Dessert: pomme",
  "Emploi du temps:\nLundi: maths, francais\nMardi: histoire, SVT\nJeudi: sport, anglais",
  // Conjugaison & grammaire
  "Conjugaison du verbe ETRE:\nje suis\ntu es\nil/elle est\nnous sommes\nvous etes\nils/elles sont",
  "Verbe: etre, avoir, aller",
  "Conjugaison: je suis, tu es, il est",
  "Les temps:\n- present\n- imparfait\n- futur\n- passe compose",
  // Histoire & geo
  "1789: Revolution francaise",
  "GEOGRAPHIE:\nles 5 continents:\nEurope, Asie, Afrique,\nAmerique, Oceanie",
  "HISTOIRE:\nLouis XIV, le Roi Soleil\na regne 72 ans\n(1643 - 1715)",
  "La Revolution industrielle\na commence en Angleterre\nau XVIIIe siecle",
  // Maths
  "Table de 7:\n7×1=7  7×2=14\n7×3=21  7×4=28\n7×5=35  7×6=42\n7×7=49  7×8=56",
  "Perimetre du cercle:\nP = 2 × π × r\nAire du cercle:\nA = π × r²",
  "Les fractions:\n1/2 + 1/4 = 3/4\n2/3 × 3/5 = 6/15 = 2/5",
  // Divers ecole
  "Le chat mange la souris",
  "Ici c'est la classe de CM2",
  "Jeudi = piscine !!!", "Vendredi = sortie scolaire",
  "10h15: RECREATION !!!", "Ne pas oublier !!!",
  "ABCDEFGHIJKLM\nNOPQRSTUVWXYZ",
  "DEVOIRS:\n1) ex 3 p.47\n2) apprendre lecon\n3) lire chap. 5",
  "Regle de trois:\nsi 3 → 12\nalors 5 → ??\n5 × 12 / 3 = 20",
]
const CHALK_COLORS = ["#e8e8d0", "#d0d0c0", "#ffccaa", "#aaddcc", "#ddbbee", "#ffddaa", "#ccddff", "#ffd0d0"]
const CHALK_FONTS = ["'Caveat',cursive", "'Indie Flower',cursive", "serif", "monospace"]

// Simple drawing functions for child-like shapes
function drawChalkShape(ctx, x, y, size, color, type) {
  ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.lineCap = "round"
  ctx.setLineDash([])
  if (type === "star") {
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const a = (i * 4 * Math.PI / 5) - Math.PI / 2
      ctx[i === 0 ? "moveTo" : "lineTo"](x + Math.cos(a) * size, y + Math.sin(a) * size)
      const a2 = a + 2 * Math.PI / 5
      ctx.lineTo(x + Math.cos(a2) * size * 0.4, y + Math.sin(a2) * size * 0.4)
    }
    ctx.closePath(); ctx.stroke()
  } else if (type === "house") {
    // Simple house
    ctx.beginPath()
    ctx.rect(x - size * 0.6, y - size * 0.3, size * 1.2, size * 0.8) // body
    ctx.moveTo(x - size * 0.7, y - size * 0.3) // roof
    ctx.lineTo(x, y - size)
    ctx.lineTo(x + size * 0.7, y - size * 0.3)
    ctx.rect(x - size * 0.15, y, size * 0.3, size * 0.5) // door
    ctx.stroke()
  } else if (type === "sun") {
    ctx.beginPath()
    ctx.arc(x, y, size * 0.4, 0, Math.PI * 2); ctx.stroke()
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(a) * size * 0.5, y + Math.sin(a) * size * 0.5)
      ctx.lineTo(x + Math.cos(a) * size, y + Math.sin(a) * size)
      ctx.stroke()
    }
  } else if (type === "tree") {
    ctx.beginPath()
    ctx.moveTo(x, y + size); ctx.lineTo(x, y + size * 0.3) // trunk
    ctx.moveTo(x - size * 0.6, y + size * 0.5); ctx.lineTo(x, y - size * 0.5); ctx.lineTo(x + size * 0.6, y + size * 0.5)
    ctx.stroke()
  } else if (type === "smiley") {
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.arc(x - size * 0.3, y - size * 0.2, size * 0.1, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x + size * 0.3, y - size * 0.2, size * 0.1, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(x, y + size * 0.1, size * 0.4, 0.1, Math.PI - 0.1); ctx.stroke()
  } else if (type === "arrow") {
    ctx.beginPath()
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y)
    ctx.moveTo(x + size * 0.5, y - size * 0.4); ctx.lineTo(x + size, y); ctx.lineTo(x + size * 0.5, y + size * 0.4)
    ctx.stroke()
  } else if (type === "graph") {
    // Axes + curve
    ctx.beginPath()
    ctx.moveTo(x - size, y + size); ctx.lineTo(x - size, y - size) // Y
    ctx.moveTo(x - size, y + size); ctx.lineTo(x + size, y + size) // X
    ctx.moveTo(x - size, y + size * 0.5)
    for (let i = 0; i <= 10; i++) {
      const px = x - size + (i / 10) * size * 2
      const py = y + size * 0.5 - Math.sin(i * 0.8) * size * 0.8
      ctx.lineTo(px, py)
    }
    ctx.stroke()
  } else if (type === "circle") {
    ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(x, y - size); ctx.lineTo(x, y + size)
    ctx.moveTo(x - size, y); ctx.lineTo(x + size, y); ctx.stroke()
  }
}
const SHAPE_TYPES = ["star", "house", "sun", "tree", "smiley", "arrow", "graph", "circle"]

export default function ChalkboardBg() {
  const cv = useRef(null)
  const items = useRef([])
  const eraser = useRef({ active: false, x: -200, y: 0, targetY: 0 })

  useEffect(() => {
    const c = cv.current, ctx = c.getContext("2d")
    const rz = () => { c.width = window.innerWidth; c.height = window.innerHeight }
    rz(); window.addEventListener("resize", rz)

    let frame = 0, nextItem = 10, nextErase = 400

    const addItem = (preload) => {
      const isShape = Math.random() > 0.6
      const x = 0.03 + Math.random() * 0.88, y = 0.05 + Math.random() * 0.88
      if (isShape) {
        items.current.push({
          kind: "shape", shape: SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)],
          x, y, size: 12 + Math.random() * 22, rot: (Math.random() - 0.5) * 15,
          color: CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)],
          opacity: 0.13 + Math.random() * 0.12,
          progress: preload ? 1 : 0, state: preload ? "visible" : "drawing",
          visibleUntil: 0, eraseProgress: 0,
        })
      } else {
        const text = CHALK_TEXTS[Math.floor(Math.random() * CHALK_TEXTS.length)]
        items.current.push({
          kind: "text", text, x, y,
          size: 11 + Math.random() * 16, rot: (Math.random() - 0.5) * 10,
          color: CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)],
          font: CHALK_FONTS[Math.floor(Math.random() * CHALK_FONTS.length)],
          opacity: 0.14 + Math.random() * 0.14,
          charsDone: preload ? text.length : 0, totalChars: text.length,
          state: preload ? "visible" : "writing",
          visibleUntil: 0, eraseProgress: 0,
        })
      }
    }

    // Pre-fill the board
    for (let i = 0; i < 25; i++) addItem(true)
    // Set staggered visibleUntil
    items.current.forEach((it, i) => { it.visibleUntil = 300 + i * 40 + Math.random() * 400 })

    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      frame++

      // Spawn new items
      if (frame > nextItem) {
        addItem(false)
        nextItem = frame + 15 + Math.random() * 40
      }

      // Eraser sweep -- clears a horizontal band
      if (frame > nextErase && items.current.length > 15) {
        eraser.current = { active: true, x: -200, y: 0.15 + Math.random() * 0.6, h: 0.12 + Math.random() * 0.1 }
        nextErase = frame + 350 + Math.random() * 250
      }

      const er = eraser.current
      if (er.active) {
        er.x += c.width * 0.025
        if (er.x > c.width + 200) {
          er.active = false
        } else {
          // Mark items in eraser path as erasing
          for (const it of items.current) {
            if (it.state === "visible" || it.state === "writing") {
              const iy = it.y
              if (iy > er.y - er.h / 2 && iy < er.y + er.h / 2) {
                const ix = it.x * c.width
                if (ix < er.x + 60) it.state = "erasing"
              }
            }
          }
          // Draw eraser
          ctx.save()
          const ey = er.y * c.height, eh = er.h * c.height
          ctx.globalAlpha = 0.12
          ctx.fillStyle = "#3a4a3a"
          ctx.fillRect(er.x - 30, ey - eh / 2, 60, eh)
          // Smear behind
          for (let i = 0; i < 6; i++) {
            ctx.globalAlpha = 0.02
            ctx.fillStyle = CHALK_COLORS[Math.floor(Math.random() * CHALK_COLORS.length)]
            ctx.fillRect(er.x - 80 - Math.random() * 40, ey - eh / 2 + Math.random() * eh, 50 + Math.random() * 30, 2)
          }
          ctx.restore()
        }
      }

      items.current = items.current.filter(it => it.state !== "dead")

      for (const it of items.current) {
        const px = it.x * c.width, py = it.y * c.height

        // State transitions
        if (it.state === "writing") {
          it.charsDone += 0.4
          if (it.charsDone >= it.totalChars) {
            it.charsDone = it.totalChars; it.state = "visible"
            it.visibleUntil = frame + 400 + Math.random() * 800
          }
        } else if (it.state === "drawing") {
          it.progress += 0.02
          if (it.progress >= 1) {
            it.progress = 1; it.state = "visible"
            it.visibleUntil = frame + 400 + Math.random() * 800
          }
        } else if (it.state === "visible" && frame > it.visibleUntil) {
          it.state = "erasing"
        } else if (it.state === "erasing") {
          it.eraseProgress += 0.015
          if (it.eraseProgress >= 1) { it.state = "dead"; continue }
        }

        const alpha = it.state === "erasing" ? it.opacity * (1 - it.eraseProgress) : it.opacity

        if (it.kind === "text") {
          const displayText = it.text.slice(0, Math.floor(it.charsDone))
          const lines = displayText.split("\n")
          const lh = it.size * 1.3
          ctx.save()
          ctx.translate(px, py); ctx.rotate(it.rot * Math.PI / 180)
          ctx.font = `${it.size}px ${it.font}`
          ctx.fillStyle = it.color
          for (let li = 0; li < lines.length; li++) {
            ctx.globalAlpha = alpha
            ctx.fillText(lines[li], 0, li * lh)
            ctx.globalAlpha = alpha * 0.2
            ctx.fillText(lines[li], 0.5, li * lh - 0.5) // chalk texture
          }
          if (it.state === "writing" && Math.floor(frame / 12) % 2 === 0) {
            const lastLine = lines[lines.length - 1]
            const m = ctx.measureText(lastLine)
            ctx.globalAlpha = alpha * 0.5
            ctx.fillRect(m.width + 2, (lines.length - 1) * lh - it.size * 0.7, 2, it.size * 0.8)
          }
          ctx.restore()
        } else {
          ctx.save()
          ctx.translate(px, py); ctx.rotate(it.rot * Math.PI / 180)
          ctx.globalAlpha = alpha * (it.state === "drawing" ? it.progress : 1)
          ctx.fillStyle = it.color
          drawChalkShape(ctx, 0, 0, it.size, it.color, it.shape)
          ctx.restore()
        }
      }
      requestAnimationFrame(draw)
    }
    const raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", rz) }
  }, [])
  return <canvas ref={cv} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
}
