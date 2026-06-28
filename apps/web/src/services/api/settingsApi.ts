import { apiClient } from "./apiClient"

export interface BackendSettings {
  follow_redirects: boolean
  verify_ssl: boolean
  default_timeout: number
  max_response_size: number
}

export const settingsApi = {
  async get(): Promise<BackendSettings | null> {
    try {
      const res = await apiClient.get<BackendSettings>("/api/settings")
      return res.data
    } catch {
      return null
    }
  },

  async save(settings: Partial<BackendSettings>): Promise<BackendSettings> {
    const res = await apiClient.patch<BackendSettings>("/api/settings", settings)
    return res.data
  },
}
export default settingsApi
