import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ShieldCheck } from "lucide-react"
import useAuthStore from "../../stores/authStore"
import { api, setAccessToken } from "../../services/api"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [ssoProviders, setSsoProviders] = useState([])
  const { login, fetchMe } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Load SSO providers
  useEffect(() => {
    api("/auth/sso/providers")
      .then(setSsoProviders)
      .catch(() => {})
  }, [])

  // Handle SSO callback
  useEffect(() => {
    const ssoCode = searchParams.get("sso_code")
    if (ssoCode) {
      window.history.replaceState({}, "", "/login")
      fetch("/api/v1/auth/sso/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ssoCode }),
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.access_token) {
            setAccessToken(data.access_token)
            fetchMe().then(() => navigate("/", { replace: true }))
          } else {
            setError("Erreur SSO : code invalide ou expire")
          }
        })
        .catch(() => setError("Erreur SSO"))
    }
  }, [searchParams, fetchMe, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSsoLogin = (providerId) => {
    window.location.href = `/api/v1/auth/sso/${providerId}/authorize?origin=${encodeURIComponent(window.location.origin)}`
  }

  const accent = "#E5A00D"

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", background: "#05050e", fontFamily: "Nunito, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        width: 360, padding: 36, borderRadius: 16,
        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(18px)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "Nunito, sans-serif", letterSpacing: -1 }}>
            <span style={{ color: accent }}>W</span><span style={{ color: "white" }}>rap</span><span style={{ background: "linear-gradient(135deg, #E5A00D, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>parr</span>
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
          Connectez-vous pour voir votre recap
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 8, padding: "8px 12px", marginBottom: 16,
            color: "#f87171", fontSize: 12,
          }}>
            {error}
          </div>
        )}

        {/* SSO Buttons */}
        {ssoProviders.length > 0 && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {ssoProviders.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSsoLogin(p.id)}
                  style={{
                    width: "100%", padding: "11px 0", borderRadius: 10,
                    border: "1px solid rgba(96,165,250,0.25)", background: "rgba(96,165,250,0.08)",
                    color: "#93c5fd", fontWeight: 600, fontSize: 14,
                    fontFamily: "Nunito, sans-serif", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(96,165,250,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(96,165,250,0.08)"}
                >
                  <ShieldCheck size={16} strokeWidth={2} />
                  Se connecter avec {p.name}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, fontFamily: "JetBrains Mono,monospace" }}>ou</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>
          </>
        )}

        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={inputStyle()}
        />
        <input
          type="password" placeholder="Mot de passe" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={inputStyle()}
        />

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
          background: accent, color: "#05050e", fontWeight: 700, fontSize: 14,
          fontFamily: "Nunito, sans-serif", cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1, marginTop: 8,
        }}>
          {loading ? "..." : "Se connecter"}
        </button>
      </form>
    </div>
  )
}

function inputStyle() {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)", color: "white", fontSize: 14,
    fontFamily: "Nunito, sans-serif", outline: "none", marginBottom: 12,
    boxSizing: "border-box",
  }
}
