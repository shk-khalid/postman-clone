import { apiClient } from "./apiClient"
import { Collection } from "@/store/collectionStore"

export const collectionApi = {
  async getAll(): Promise<Collection[]> {
    const res = await apiClient.get<Collection[]>("/collections")
    return res.data
  },

  async saveAll(collections: Collection[]): Promise<Collection[]> {
    const res = await apiClient.put<Collection[]>("/collections", collections)
    return res.data
  },
}
export default collectionApi
