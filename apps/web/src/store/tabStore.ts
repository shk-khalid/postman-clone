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

export interface FormDataRow {
  id: string
  key: string
  value: string
  active: boolean
  type: "text" | "file"
}

export interface UrlEncodedRow {
  id: string
  key: string
  value: string
  active: boolean
}

export interface ResponseData {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  duration: number // Normalized property
  size: number // Normalized property
  timestamp: string // Normalized property
}

export interface Tab {
  id: string
  name: string
  type?: "request" | "environment"
  method: HTTPMethod
  url: string
  headers: RequestHeader[]
  params: RequestParam[]
  bodyType: "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded" | "binary"
  body: string
  authType: "none" | "bearer" | "basic"
  bearerToken: string
  basicUsername: string
  basicPassword: string
  formData: FormDataRow[]
  urlEncoded: UrlEncodedRow[]
  response: ResponseData | null
  loading: boolean
  isDirty: boolean
}

interface TabStore {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (tab?: Partial<Tab>) => void
  closeTab: (id: string) => void
  duplicateTab: (id: string) => void
  setActiveTabId: (id: string | null) => void
  updateTab: (id: string, updates: Partial<Tab>) => void
  updateActiveTab: (updates: Partial<Tab>) => void
  clearAllTabs: () => void
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
    authType: "none",
    bearerToken: "",
    basicUsername: "",
    basicPassword: "",
    formData: [{ id: crypto.randomUUID(), key: "", value: "", type: "text", active: true }],
    urlEncoded: [{ id: crypto.randomUUID(), key: "", value: "", active: true }],
    response: null,
    loading: false,
    isDirty: false,
  }
}

// 1. Session persistence helpers
const saveSession = (tabs: Tab[], activeTabId: string | null) => {
  try {
    localStorage.setItem("postman_clone_session_tabs", JSON.stringify(tabs))
    if (activeTabId) {
      localStorage.setItem("postman_clone_session_active_tab_id", activeTabId)
    } else {
      localStorage.removeItem("postman_clone_session_active_tab_id")
    }
  } catch (e) {
    console.error("Failed to save tabs session", e)
  }
}

const loadSessionTabs = (): Tab[] => {
  try {
    const raw = localStorage.getItem("postman_clone_session_tabs")
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

const loadSessionActiveTabId = (): string | null => {
  return localStorage.getItem("postman_clone_session_active_tab_id")
}

export const useTabStore = create<TabStore>((set) => ({
  tabs: loadSessionTabs(),
  activeTabId: loadSessionActiveTabId(),

  addTab: (tabUpdates) => {
    const newTab = { ...createDefaultTab(), ...tabUpdates }
    set((state) => {
      const tabs = [...state.tabs, newTab]
      saveSession(tabs, newTab.id)
      return { tabs, activeTabId: newTab.id }
    })
  },

  closeTab: (id) => {
    set((state) => {
      const remainingTabs = state.tabs.filter((t) => t.id !== id)
      let newActiveTabId = state.activeTabId

      if (state.activeTabId === id) {
        newActiveTabId = remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1].id : null
      }

      saveSession(remainingTabs, newActiveTabId)
      return {
        tabs: remainingTabs,
        activeTabId: newActiveTabId,
      }
    })
  },

  duplicateTab: (id) => {
    set((state) => {
      const target = state.tabs.find((t) => t.id === id)
      if (!target) return {}
      const duplicated: Tab = {
        ...target,
        id: crypto.randomUUID(),
        name: `${target.name} Copy`,
        isDirty: true,
      }
      const updatedTabs = [...state.tabs, duplicated]
      saveSession(updatedTabs, duplicated.id)
      return {
        tabs: updatedTabs,
        activeTabId: duplicated.id,
      }
    })
  },

  setActiveTabId: (id) =>
    set((state) => {
      saveSession(state.tabs, id)
      return { activeTabId: id }
    }),

  updateTab: (id, updates) => {
    set((state) => {
      const updated = state.tabs.map((tab) => {
        if (tab.id !== id) return tab
        const newTab = { ...tab, ...updates }
        
        let shouldBeDirty = tab.isDirty
        if (updates.url !== undefined && updates.url !== tab.url) shouldBeDirty = true
        if (updates.method !== undefined && updates.method !== tab.method) shouldBeDirty = true
        if (updates.body !== undefined && updates.body !== tab.body) shouldBeDirty = true
        if (updates.headers || updates.params || updates.authType) shouldBeDirty = true

        if (updates.isDirty !== undefined) {
          shouldBeDirty = updates.isDirty
        }

        return { ...newTab, isDirty: shouldBeDirty }
      })

      saveSession(updated, state.activeTabId)
      return { tabs: updated }
    })
  },

  updateActiveTab: (updates) => {
    set((state) => {
      if (!state.activeTabId) return {}
      const updated = state.tabs.map((tab) =>
        tab.id === state.activeTabId ? { ...tab, ...updates } : tab
      )
      saveSession(updated, state.activeTabId)
      return { tabs: updated }
    })
  },

  clearAllTabs: () => {
    localStorage.removeItem("postman_clone_session_tabs")
    localStorage.removeItem("postman_clone_session_active_tab_id")
    set({ tabs: [], activeTabId: null })
  },
}))
