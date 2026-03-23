import { create } from "zustand"
import { api, setAccessToken, clearAccessToken, getAccessToken } from "../services/api"

const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  login: async (email, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email, password },
    })
    setAccessToken(data.access_token)
    set({ user: data.user, loading: false })
    return data.user
  },

  register: async (email, password, display_name) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: { email, password, display_name },
    })
    setAccessToken(data.access_token)
    set({ user: data.user, loading: false })
    return data.user
  },

  logout: async () => {
    try {
      await api("/auth/logout", { method: "POST" })
    } catch {
      // ignore
    }
    clearAccessToken()
    set({ user: null, loading: false })
  },

  fetchMe: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ user: null, loading: false })
      return
    }
    try {
      const user = await api("/auth/me")
      set({ user, loading: false })
    } catch {
      clearAccessToken()
      set({ user: null, loading: false })
    }
  },
}))

export default useAuthStore
