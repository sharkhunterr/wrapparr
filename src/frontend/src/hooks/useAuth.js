import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuthStore from "../stores/authStore"

export default function useAuth({ requireAuth = true, requireAdmin = false } = {}) {
  const { user, loading, fetchMe } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user && loading) {
      fetchMe()
    }
  }, [user, loading, fetchMe])

  useEffect(() => {
    if (loading) return
    if (requireAuth && !user) {
      navigate("/login", { replace: true })
    }
    if (requireAdmin && user?.role !== "admin") {
      navigate("/", { replace: true })
    }
  }, [user, loading, requireAuth, requireAdmin, navigate])

  return { user, loading }
}
