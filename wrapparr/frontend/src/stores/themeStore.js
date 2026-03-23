import { create } from "zustand"
import { api } from "../services/api"

const useThemeStore = create((set) => ({
  activePack: null,
  packs: [],
  overrides: {},

  fetchThemes: async () => {
    const packs = await api("/themes")
    set({ packs })
  },

  fetchActivePack: async (slug) => {
    const pack = await api(`/themes/${slug}`)
    set({ activePack: pack.config })
  },

  updateOverride: (key, value) => {
    set((state) => ({
      overrides: { ...state.overrides, [key]: value },
    }))
  },
}))

export default useThemeStore
