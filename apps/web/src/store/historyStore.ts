import { create } from "zustand"
import { historyApi } from "@/services/api/historyApi"
import { HTTPMethod, Tab } from "./tabStore"

export interface HistoryItem {
  id: string
  method: HTTPMethod
  url: string
  timestamp: string
  statusCode: number
  durationMs: number
  sizeBytes: number
  requestData: Partial<Tab>
}

interface HistoryStore {
  history: HistoryItem[]
  loading: boolean
  fetchHistory: (filters?: { search?: string; method?: string; status?: number }) => Promise<void>
  addToHistory: (item: any) => void  // Kept for backward compatibility but delegates to refresh
  clearHistory: () => Promise<void>
  deleteHistoryItem: (id: string) => Promise<void>
}

export const useHistoryStore = create<HistoryStore>((set, get) => ({
  history: [],
  loading: false,

  fetchHistory: async (filters) => {
    set({ loading: true })
    try {
      const data = await historyApi.getAll(filters)
      set({ history: data })
    } catch (e) {
      console.error("Failed to load history", e)
    } finally {
      set({ loading: false })
    }
  },

  addToHistory: () => {
    // History is logged automatically on the backend during Request execution.
    // Simply fetch latest to refresh
    get().fetchHistory()
  },

  clearHistory: async () => {
    try {
      await historyApi.clear()
      set({ history: [] })
    } catch (e) {
      console.error("Failed to clear history", e)
    }
  },

  deleteHistoryItem: async (id) => {
    try {
      await historyApi.deleteItem(id)
      set((state) => ({
        history: state.history.filter((h) => h.id !== id)
      }))
    } catch (e) {
      console.error("Failed to delete history item", e)
    }
  }
}))
export default useHistoryStore
