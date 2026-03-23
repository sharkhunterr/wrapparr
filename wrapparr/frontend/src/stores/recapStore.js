import { create } from "zustand"
import { api } from "../services/api"

const useRecapStore = create((set, get) => ({
  recapData: null,
  slideConfig: null,
  themePack: null,
  currentSlideIndex: 0,
  loading: false,
  error: null,
  progress: null,

  fetchRecap: async (year) => {
    set({ loading: true, error: null })
    try {
      const data = await api(`/recaps/${year}`)
      set({ recapData: data.data, slideConfig: data.slide_config, themePack: data.theme_pack, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  generateRecap: async (year) => {
    try {
      await api("/recaps/generate", { method: "POST", body: { year } })
    } catch (err) {
      set({ error: err.message })
    }
  },

  setSlideIndex: (index) => set({ currentSlideIndex: index }),

  setProgress: (progress) => set({ progress }),

  reset: () => set({ recapData: null, slideConfig: null, themePack: null, currentSlideIndex: 0, loading: false, error: null, progress: null }),
}))

export default useRecapStore
