import { useEffect, useRef } from "react"
import { getAccessToken } from "../services/api"
import useRecapStore from "../stores/recapStore"

export default function useWebSocket() {
  const ws = useRef(null)
  const setProgress = useRecapStore((s) => s.setProgress)

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const url = `${protocol}//${window.location.host}/ws/recap-progress?token=${token}`

    ws.current = new WebSocket(url)

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === "progress") {
          setProgress(data)
        }
      } catch {
        // ignore parse errors
      }
    }

    ws.current.onclose = () => {
      // Auto-reconnect after 3s
      setTimeout(() => {
        if (ws.current?.readyState === WebSocket.CLOSED) {
          ws.current = new WebSocket(url)
        }
      }, 3000)
    }

    return () => {
      ws.current?.close()
    }
  }, [setProgress])
}
