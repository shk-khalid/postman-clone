import { apiClient } from "./apiClient"
import { Environment } from "@/store/workspaceStore"

export const environmentApi = {
  async getAll(): Promise<Environment[]> {
    const res = await apiClient.get<Environment[]>("/environments")
    return res.data
  },

  async saveAll(environments: Environment[]): Promise<Environment[]> {
    const res = await apiClient.put<Environment[]>("/environments", environments)
    return res.data
  },
}
export default environmentApi
