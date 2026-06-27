import { create } from "zustand"

interface Settings {
  theme: "dark" | "light" | "system"
  fontSize: number
  wordWrap: "on" | "off"
  sidebarWidth: number
  sidebarCollapsed: boolean
  defaultEnvId: string
}

interface SettingsStore extends Settings {
  updateSettings: (settings: Partial<Settings>) => void
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  fontSize: 13,
  wordWrap: "on",
  sidebarWidth: 288, // 72rem or similar
  sidebarCollapsed: false,
  defaultEnvId: "no-env",
}

const loadSettings = (): Settings => {
  try {
    const raw = localStorage.getItem("postman_clone_settings")
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
    }
  } catch (e) {
    console.error("Failed to load settings", e)
  }
  return DEFAULT_SETTINGS
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...loadSettings(),
  updateSettings: (updates) =>
    set((state) => {
      const newState = { ...state, ...updates }
      const settingsToPersist = {
        theme: newState.theme,
        fontSize: newState.fontSize,
        wordWrap: newState.wordWrap,
        sidebarWidth: newState.sidebarWidth,
        sidebarCollapsed: newState.sidebarCollapsed,
        defaultEnvId: newState.defaultEnvId,
      }
      localStorage.setItem("postman_clone_settings", JSON.stringify(settingsToPersist))
      return updates
    }),
}))
