import { create } from "zustand"

export type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD"

export interface RequestHeader {
  id: string
  key: string
  value: string
  description?: string
  active: boolean
}

export interface RequestParam {
  id: string
  key: string
  value: string
  description?: string
  active: boolean
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  timeMs: number
  sizeBytes: number
  error?: string
}

export interface Tab {
  id: string
  name: string
  method: HTTPMethod
  url: string
  headers: RequestHeader[]
  params: RequestParam[]
  bodyType: "none" | "json" | "form-data" | "raw"
  body: string
  response: ResponseData | null
  loading: boolean
  isDirty: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab?: Partial<Tab>) => void
  closeTab: (id: string) => void
  setActiveTabId: (id: string | null) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  updateActiveTab: (updates: Partial<Tab>) => void
}

const createDefaultTab = (): Tab => {
  const id = crypto.randomUUID()
  return {
    id,
    name: "New Request",
    method: "GET",
    url: "",
    headers: [{ id: crypto.randomUUID(), key: "", value: "", active: true }],
    params: [{ id: crypto.randomUUID(), key: "", value: "", active: true }],
    bodyType: "none",
    body: "",
    response: null,
    loading: false,
    isDirty: false,
  }
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: [],
  activeTabId: null,

  addTab: (tabUpdates) => {
    const newTab = { ...createDefaultTab(), ...tabUpdates }
    set((state) => ({
      tabs: [...state.tabs, newTab],
      activeTabId: newTab.id,
    }))
  },

  closeTab: (id) => {
    set((state) => {
      const remainingTabs = state.tabs.filter((t) => t.id !== id)
      let newActiveTabId = state.activeTabId

      if (state.activeTabId === id) {
        newActiveTabId = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null
      }

      return {
        tabs: remainingTabs,
        activeTabId: newActiveTabId,
      }
    })
  },

  setActiveTabId: (id) => set({ activeTabId: id }),

  updateTab: (id, updates) => {
    set((state) => ({
      tabs: state.tabs.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab)),
    }))
  },

  updateActiveTab: (updates) => {
    set((state) => {
      if (!state.activeTabId) return {}
      return {
        tabs: state.tabs.map((tab) =>
          tab.id === state.activeTabId ? { ...tab, ...updates } : tab
        ),
      }
    })
  },
}))
