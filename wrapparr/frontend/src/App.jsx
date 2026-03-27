import { BrowserRouter, Routes, Route, Navigate, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  LayoutDashboard, Link2, Users2, Film, Palette, UserCog,
  KeyRound, Settings, Menu, X, LogOut, ChevronRight, Clapperboard, Music,
} from "lucide-react"
import LoginPage from "./components/auth/LoginPage"
import RecapPlayer from "./components/recap/RecapPlayer"
import ShareView from "./components/ShareView"
import useAuthStore from "./stores/authStore"
import { api } from "./services/api"

import Dashboard from "./components/admin/Dashboard"
import UserManagement from "./components/admin/UserManagement"
import ConfigPanel from "./components/admin/ConfigPanel"
import ThemeManager from "./components/admin/ThemeManager"
import ServiceConfig from "./components/admin/ServiceConfig"
import UserMapping from "./components/admin/UserMapping"
import SlideManager from "./components/admin/SlideManager"
import ConnectionConfig from "./components/admin/ConnectionConfig"
import RecapManager from "./components/admin/RecapManager"
import MusicManager from "./components/admin/MusicManager"

/* ── Auth guard ── */
function useRequireAuth({ requireAdmin = false } = {}) {
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && loading) fetchMe()
  }, [user, loading, fetchMe])

  useEffect(() => {
    if (loading) return
    if (!user) navigate("/login", { replace: true })
    else if (requireAdmin && user.role !== "admin") navigate("/", { replace: true })
  }, [user, loading, requireAdmin, navigate])

  return { user, loading }
}

/* ── User: recap ── */
function UserHome() {
  const { user, loading } = useRequireAuth()
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [availableRecaps, setAvailableRecaps] = useState([])

  useEffect(() => {
    if (!user?.id) return
    api("/recaps").then((recaps) => {
      // Show all completed recaps, sorted by year descending
      const visible = recaps
        .filter((r) => r.status === "completed")
        .sort((a, b) => b.year - a.year)
      setAvailableRecaps(visible)
    }).catch((e) => console.warn("Failed to load recaps list:", e))
  }, [user?.id])

  // Determine currently viewed year from URL or first available (most recent)
  const paramYear = location.pathname.startsWith("/recap/") ? location.pathname.split("/recap/")[1] : null
  const currentYear = paramYear ? parseInt(paramYear, 10) : (availableRecaps[0]?.year || null)

  const handleYearChange = (e) => {
    const y = e.target.value
    if (y) navigate(`/recap/${y}`)
    else navigate("/")
  }

  if (loading || !user) return null
  return (
    <>
      <RecapPlayer />
      <div style={{ position: "fixed", top: 12, right: 44, zIndex: 9999, display: "flex", gap: 6, alignItems: "center" }}>
        <span id="recap-topbar-extra" style={{ display: "contents" }} />
        {availableRecaps.length > 0 && (
          <select
            value={currentYear || ""}
            onChange={handleYearChange}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 6, color: "rgba(255,255,255,0.5)", fontSize: 9, padding: "4px 6px",
              cursor: "pointer", fontFamily: "Nunito,sans-serif", outline: "none",
              appearance: "none", WebkitAppearance: "none",
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.3)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
              backgroundRepeat: "no-repeat", backgroundPosition: "right 4px center",
              paddingRight: 16,
            }}
          >
            {availableRecaps.map((r) => (
              <option key={r.year} value={r.year} style={{ background: "#15151e", color: "white" }}>
                {r.year}
              </option>
            ))}
          </select>
        )}
        {user.role === "admin" && (
          <button onClick={() => navigate("/admin")} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 9, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <Settings size={11} /> Admin
          </button>
        )}
        <button onClick={async () => { await logout(); navigate("/login") }} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "rgba(255,255,255,0.4)", fontSize: 9, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
          <LogOut size={11} />
        </button>
      </div>
    </>
  )
}

/* ── Icon size for nav ── */
const IC = 16
const IC_M = 20

/* ── Admin nav items ── */
const NAV_ITEMS = [
  { section: "Général", items: [
    { to: "/admin", end: true, icon: LayoutDashboard, label: "Dashboard", short: "Dashboard" },
  ]},
  { section: "Services", items: [
    { to: "/admin/services", icon: Link2, label: "Connecteurs", short: "Services" },
    { to: "/admin/mapping", icon: Users2, label: "Mapping utilisateurs", short: "Mapping" },
  ]},
  { section: "Recap", items: [
    { to: "/admin/recaps", icon: Clapperboard, label: "Gestion recaps", short: "Recaps" },
    { to: "/admin/slides", icon: Film, label: "Slides & paramètres", short: "Slides" },
    { to: "/admin/themes", icon: Palette, label: "Thèmes", short: "Thèmes" },
    { to: "/admin/music", icon: Music, label: "Musique", short: "Musique" },
  ]},
  { section: "Système", items: [
    { to: "/admin/users", icon: UserCog, label: "Utilisateurs", short: "Users" },
    { to: "/admin/connections", icon: KeyRound, label: "Connexions & SSO", short: "SSO" },
    { to: "/admin/config", icon: Settings, label: "Configuration", short: "Config" },
  ]},
]

const ALL_NAV = NAV_ITEMS.flatMap((s) => s.items)

/* ── Responsive Admin Layout ── */
function AdminLayout() {
  const { user, loading } = useRequireAuth({ requireAdmin: true })
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading || !user) return null

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const activeItem = ALL_NAV.find((n) => n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)) || ALL_NAV[0]

  return (
    <div style={{ minHeight: "100vh", background: "#05050e", fontFamily: "Nunito,sans-serif" }}>
      <style>{`
        .admin-wrap { display: flex; min-height: 100vh; }
        .admin-sidebar {
          width: 230px; padding: 20px 12px; flex-shrink: 0;
          border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; gap: 2px;
          overflow-y: auto; max-height: 100vh;
        }
        .admin-main { flex: 1; padding: 32px; overflow-y: auto; max-height: 100vh; }
        .admin-mobile-header { display: none; }
        .admin-mobile-menu { display: none; }
        .nav-link { display: flex; align-items: center; gap: 10px; text-decoration: none; border-radius: 8px; transition: all 0.15s ease; }
        .nav-link:hover { background: rgba(255,255,255,0.03); }

        @media (max-width: 768px) {
          .admin-sidebar { display: none; }
          .admin-main { padding: 16px; max-height: calc(100vh - 56px); }
          .admin-mobile-header {
            display: flex; align-items: center; gap: 12px;
            padding: 14px 16px; background: rgba(5,5,14,0.85);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: sticky; top: 0; z-index: 100;
            backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          }
          .admin-mobile-menu {
            display: flex; flex-direction: column; gap: 2px;
            position: fixed; top: 56px; left: 0; right: 0; bottom: 0;
            background: rgba(5,5,14,0.97); z-index: 99;
            padding: 12px 16px; overflow-y: auto;
            backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            animation: slideDown 0.2s ease;
          }
          @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        }
      `}</style>

      {/* Mobile header */}
      <div className="admin-mobile-header">
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          background: menuOpen ? "rgba(229,160,13,0.1)" : "none",
          border: `1px solid ${menuOpen ? "rgba(229,160,13,0.25)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: 8, color: menuOpen ? "#E5A00D" : "white", width: 36, height: 36, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
        <span style={{ color: "#E5A00D", fontFamily: "Nunito,sans-serif", fontWeight: 800, fontSize: 16, flex: 1 }}>Wrapparr</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
          {activeItem && <activeItem.icon size={14} />}
          {activeItem?.short}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="admin-mobile-menu">
          {NAV_ITEMS.map((sec) => (
            <div key={sec.section}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", padding: "14px 16px 6px", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "JetBrains Mono,monospace" }}>{sec.section}</div>
              {sec.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMenuOpen(false)} className="nav-link"
                  style={({ isActive }) => ({
                    fontSize: 15, fontFamily: "Nunito,sans-serif", padding: "14px 16px",
                    color: isActive ? "#E5A00D" : "rgba(255,255,255,0.5)",
                    background: isActive ? "rgba(229,160,13,0.08)" : "transparent",
                  })}>
                  <item.icon size={IC_M} strokeWidth={isActive => 1.5} />
                  <span style={{ flex: 1 }}>{item.label}</span>
                  <ChevronRight size={14} style={{ opacity: 0.2 }} />
                </NavLink>
              ))}
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "none", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10,
            color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "14px 16px", cursor: "pointer",
            fontFamily: "Nunito,sans-serif", marginTop: 16, width: "100%",
          }}>
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      )}

      <div className="admin-wrap">
        {/* Desktop sidebar */}
        <nav className="admin-sidebar">
          <div style={{ color: "#E5A00D", fontFamily: "Nunito,sans-serif", fontWeight: 800, fontSize: 18, padding: "8px 16px", marginBottom: 24 }}>
            Wrapparr <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontWeight: 400, fontFamily: "JetBrains Mono,monospace" }}>admin</span>
          </div>

          {NAV_ITEMS.map((sec) => (
            <div key={sec.section}>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", padding: "14px 16px 6px", textTransform: "uppercase", letterSpacing: "0.18em", fontFamily: "JetBrains Mono,monospace" }}>{sec.section}</div>
              {sec.items.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className="nav-link"
                  style={({ isActive }) => ({
                    fontSize: 13, fontFamily: "Nunito,sans-serif", padding: "9px 14px",
                    color: isActive ? "#E5A00D" : "rgba(255,255,255,0.4)",
                    background: isActive ? "rgba(229,160,13,0.07)" : "transparent",
                  })}>
                  <item.icon size={IC} strokeWidth={1.5} style={{ opacity: 0.8 }} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

          <div style={{ flex: 1 }} />
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 8,
            color: "rgba(255,255,255,0.25)", fontSize: 12, padding: "9px 14px", cursor: "pointer",
            fontFamily: "Nunito,sans-serif", marginTop: 16, width: "100%",
          }}>
            <LogOut size={14} strokeWidth={1.5} /> Déconnexion
          </button>
        </nav>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

/* ── Login redirect ── */
function LoginRedirect() {
  const user = useAuthStore((s) => s.user)
  if (!user) return <LoginPage />
  if (user.role === "admin") return <Navigate to="/admin" replace />
  return <Navigate to="/" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/share/:token" element={<ShareView />} />
        <Route path="/" element={<UserHome />} />
        <Route path="/recap/:year" element={<UserHome />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="services" element={<ServiceConfig />} />
          <Route path="mapping" element={<UserMapping />} />
          <Route path="recaps" element={<RecapManager />} />
          <Route path="slides" element={<SlideManager />} />
          <Route path="themes" element={<ThemeManager />} />
          <Route path="music" element={<MusicManager />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="connections" element={<ConnectionConfig />} />
          <Route path="config" element={<ConfigPanel />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
