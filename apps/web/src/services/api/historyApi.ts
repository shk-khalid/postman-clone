import { apiClient } from "./apiClient"
import { HistoryItem } from "@/store/historyStore"

export const historyApi = {
  async getAll(): Promise<HistoryItem[]> {
    const res = await apiClient.get<HistoryItem[]>("/history")
    return res.data
  },

  async saveAll(history: HistoryItem[]): Promise<HistoryItem[]> {
    const res = await apiClient.put<HistoryItem[]>("/history", history)
    return res.data
  },

  async clear(): Promise<void> {
    await apiClient.delete("/history/clear")
  },
}
export default historyApi
