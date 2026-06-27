import { create } from "zustand"
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
  addToHistory: (item: Omit<HistoryItem, "id" | "timestamp">) => void
  clearHistory: () => void
  deleteHistoryItem: (id: string) => void
}

const loadHistory = (): HistoryItem[] => {
  try {
    const raw = localStorage.getItem("postman_clone_history")
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error("Failed to load history", e)
  }
  return []
}

export const useHistoryStore = create<HistoryStore>((set) => ({
  history: loadHistory(),

  addToHistory: (item) =>
    set((state) => {
      const newItem: HistoryItem = {
        ...item,
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      const updated = [newItem, ...state.history].slice(0, 50) // Limit to last 50 items
      localStorage.setItem("postman_clone_history", JSON.stringify(updated))
      return { history: updated }
    }),

  clearHistory: () =>
    set(() => {
      localStorage.removeItem("postman_clone_history")
      return { history: [] }
    }),

  deleteHistoryItem: (id) =>
    set((state) => {
      const updated = state.history.filter((h) => h.id !== id)
      localStorage.setItem("postman_clone_history", JSON.stringify(updated))
      return { history: updated }
    }),
}))
