import { create } from "zustand"
import { settingsApi } from "@/services/api/settingsApi"

export interface AppSettings {
  theme: "dark" | "light" | "system"
  fontSize: number
  wordWrap: "on" | "off"
  sidebarWidth: number
  sidebarCollapsed: boolean
  defaultEnvId: string
  // Backend execution settings
  follow_redirects: boolean
  verify_ssl: boolean
  default_timeout: number
  max_response_size: number
}

interface SettingsStore extends AppSettings {
  fetchSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  fontSize: 13,
  wordWrap: "on",
  sidebarWidth: 288,
  sidebarCollapsed: false,
  defaultEnvId: "no-env",
  follow_redirects: true,
  verify_ssl: true,
  default_timeout: 10.0,
  max_response_size: 10485760,
}

const loadLocalSettings = () => {
  try {
    const raw = localStorage.getItem("postman_clone_settings")
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error("Failed to load local settings", e)
  }
  return {}
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  ...DEFAULT_SETTINGS,
  ...loadLocalSettings(),

  fetchSettings: async () => {
    try {
      const data = await settingsApi.get()
      if (data) {
        set({
          follow_redirects: data.follow_redirects,
          verify_ssl: data.verify_ssl,
          default_timeout: data.default_timeout,
          max_response_size: data.max_response_size,
        })
      }
    } catch (e) {
      console.error("Failed to load backend settings", e)
    }
  },

  updateSettings: async (updates) => {
    // 1. Filter local vs backend updates
    const localKeys = ["theme", "fontSize", "wordWrap", "sidebarWidth", "sidebarCollapsed", "defaultEnvId"]
    const localUpdates: any = {}
    const backendUpdates: any = {}

    Object.entries(updates).forEach(([key, val]) => {
      if (localKeys.includes(key)) {
        localUpdates[key] = val
      } else {
        backendUpdates[key] = val
      }
    })

    // 2. Persist local updates in localStorage
    if (Object.keys(localUpdates).length > 0) {
      const currentState = get()
      const settingsToPersist = {
        theme: localUpdates.theme ?? currentState.theme,
        fontSize: localUpdates.fontSize ?? currentState.fontSize,
        wordWrap: localUpdates.wordWrap ?? currentState.wordWrap,
        sidebarWidth: localUpdates.sidebarWidth ?? currentState.sidebarWidth,
        sidebarCollapsed: localUpdates.sidebarCollapsed ?? currentState.sidebarCollapsed,
        defaultEnvId: localUpdates.defaultEnvId ?? currentState.defaultEnvId,
      }
      localStorage.setItem("postman_clone_settings", JSON.stringify(settingsToPersist))
      set(localUpdates)
    }

    // 3. Persist backend updates in SQLite
    if (Object.keys(backendUpdates).length > 0) {
      try {
        const data = await settingsApi.save(backendUpdates)
        set({
          follow_redirects: data.follow_redirects,
          verify_ssl: data.verify_ssl,
          default_timeout: data.default_timeout,
          max_response_size: data.max_response_size,
        })
      } catch (e) {
        console.error("Failed to save settings on server", e)
      }
    }
  },
}))
export default useSettingsStore
