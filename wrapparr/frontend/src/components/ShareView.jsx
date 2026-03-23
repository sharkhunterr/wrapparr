import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import SlideRenderer from "./slides/SlideRenderer"

export default function ShareView() {
  const { token } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/v1/share/${token}`)
      .then(async (res) => {
        if (res.status === 410) throw new Error("Ce lien de partage a expiré")
        if (!res.ok) throw new Error("Lien introuvable")
        return res.json()
      })
      .then((d) => { setData(d); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [token])

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#05050e" }}>
      <div style={{ color: "#E5A00D", fontFamily: "Nunito,sans-serif", fontSize: 18 }}>Chargement...</div>
    </div>
  )

  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", background: "#05050e" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
      <div style={{ color: "#f87171", fontFamily: "Nunito,sans-serif", fontSize: 16 }}>{error}</div>
    </div>
  )

  return <SlideRenderer recapData={data.data} userName="" year={data.year} />
}
