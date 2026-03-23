import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../../stores/authStore"

export default function LoginPage() {
  const [mode, setMode] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password, displayName)
      }
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
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
        <h1 style={{
          fontFamily: "Nunito, sans-serif", fontSize: 18, fontWeight: 700,
          color: accent, marginBottom: 6, textAlign: "center",
        }}>
          Wrapparr
        </h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center", marginBottom: 28 }}>
          {mode === "login" ? "Connectez-vous pour voir votre recap" : "Créez votre compte"}
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

        {mode === "register" && (
          <input
            type="text" placeholder="Nom affiché" value={displayName}
            onChange={(e) => setDisplayName(e.target.value)} required
            style={inputStyle(accent)}
          />
        )}
        <input
          type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} required
          style={inputStyle(accent)}
        />
        <input
          type="password" placeholder="Mot de passe" value={password}
          onChange={(e) => setPassword(e.target.value)} required
          style={inputStyle(accent)}
        />

        <button type="submit" disabled={loading} style={{
          width: "100%", padding: "12px 0", borderRadius: 10, border: "none",
          background: accent, color: "#05050e", fontWeight: 700, fontSize: 14,
          fontFamily: "Nunito, sans-serif", cursor: loading ? "wait" : "pointer",
          opacity: loading ? 0.6 : 1, marginTop: 8,
        }}>
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
        </button>

        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, textAlign: "center", marginTop: 18 }}>
          {mode === "login" ? (
            <>Pas encore de compte ?{" "}
              <span onClick={() => setMode("register")} style={{ color: accent, cursor: "pointer" }}>
                S'inscrire
              </span>
            </>
          ) : (
            <>Déjà un compte ?{" "}
              <span onClick={() => setMode("login")} style={{ color: accent, cursor: "pointer" }}>
                Se connecter
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

function inputStyle(accent) {
  return {
    width: "100%", padding: "11px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)", color: "white", fontSize: 14,
    fontFamily: "Nunito, sans-serif", outline: "none", marginBottom: 12,
    boxSizing: "border-box",
  }
}
