import { useEffect, useRef } from "react"

export default function TypingTitles() {
  // Observes h1/h2/h3 in recap-root and types them character by character
  const processed = useRef(new WeakSet())
  const observer = useRef(null)

  useEffect(() => {
    const animateEl = (el) => {
      if (processed.current.has(el)) return
      processed.current.add(el)

      // Collect all text nodes recursively, preserving structure
      const walk = (node) => {
        const parts = []
        for (const child of node.childNodes) {
          if (child.nodeType === 3) { // text node
            parts.push({ type: "text", node: child, full: child.textContent })
            child.textContent = ""
          } else if (child.nodeType === 1) { // element
            const sub = walk(child)
            parts.push({ type: "el", node: child, children: sub })
          }
        }
        return parts
      }
      const parts = walk(el)

      // Flatten to chars with refs
      const chars = []
      const flatten = (items) => {
        for (const p of items) {
          if (p.type === "text") {
            for (let i = 0; i < p.full.length; i++) {
              chars.push({ textNode: p.node, char: p.full[i], idx: i })
            }
          } else {
            flatten(p.children)
          }
        }
      }
      flatten(parts)

      // Add cursor
      const cursor = document.createElement("span")
      cursor.className = "th-typing-cursor"
      el.appendChild(cursor)

      // Type chars one by one
      let i = 0
      const type = () => {
        if (i >= chars.length) {
          // Done -- remove cursor after a moment
          setTimeout(() => cursor.remove(), 1500)
          return
        }
        const c = chars[i]
        c.textNode.textContent += c.char
        i++
        setTimeout(type, 25 + Math.random() * 35)
      }
      setTimeout(type, 200)
    }

    // Observe for new headings appearing (slide changes)
    const root = document.querySelector(".recap-root")
    if (!root) return

    const scan = () => {
      root.querySelectorAll("h1, h2, h3").forEach(animateEl)
    }

    observer.current = new MutationObserver(() => {
      // Reset processed set on DOM changes (new slide)
      scan()
    })
    observer.current.observe(root, { childList: true, subtree: true })
    scan()

    return () => observer.current?.disconnect()
  }, [])

  return null
}
