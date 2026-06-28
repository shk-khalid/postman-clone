import { apiClient } from "./apiClient"
import { Environment, EnvVar } from "@/store/workspaceStore"

const mapEnvironmentToFrontend = (env: any): Environment => ({
  id: String(env.id),
  name: env.name,
  variables: (env.variables || []).map((v: any) => ({
    id: String(v.id),
    key: v.key,
    value: v.value,
    enabled: true
  }))
})

export const environmentApi = {
  async getAll(): Promise<Environment[]> {
    const res = await apiClient.get<any[]>("/api/environments")
    // Prepend a default "No Environment" mock so it matches UI switcher options
    const list = res.data.map(mapEnvironmentToFrontend)
    return [
      { id: "no-env", name: "No Environment", variables: [] },
      ...list
    ]
  },

  async create(name: string): Promise<Environment> {
    const res = await apiClient.post<any>("/api/environments", { name })
    return mapEnvironmentToFrontend(res.data)
  },

  async rename(id: string, name: string): Promise<Environment> {
    const res = await apiClient.patch<any>(`/api/environments/${id}`, { name })
    return mapEnvironmentToFrontend(res.data)
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/environments/${id}`)
  },

  async addVariable(envId: string, key: string, value: string): Promise<EnvVar> {
    const res = await apiClient.post<any>(`/api/environments/${envId}/variables`, { key, value })
    return {
      id: String(res.data.id),
      key: res.data.key,
      value: res.data.value,
      enabled: true
    }
  },

  async updateVariable(varId: string, key: string, value: string): Promise<EnvVar> {
    const res = await apiClient.patch<any>(`/api/variables/${varId}`, { key, value })
    return {
      id: String(res.data.id),
      key: res.data.key,
      value: res.data.value,
      enabled: true
    }
  },

  async deleteVariable(varId: string): Promise<void> {
    await apiClient.delete(`/api/variables/${varId}`)
  }
}
export default environmentApi
