import { apiClient } from "./apiClient"

export interface AppSettings {
  theme: "dark" | "light" | "system"
  fontSize: number
  wordWrap: "on" | "off"
  sidebarWidth: number
  sidebarCollapsed: boolean
  defaultEnvId: string
}

export const settingsApi = {
  async get(): Promise<AppSettings | null> {
    try {
      const res = await apiClient.get<AppSettings>("/settings")
      return res.data
    } catch {
      return null
    }
  },

  async save(settings: AppSettings): Promise<AppSettings> {
    const res = await apiClient.put<AppSettings>("/settings", settings)
    return res.data
  },
}
export default settingsApi
