import { apiClient } from "./apiClient"
import { HistoryItem } from "@/store/historyStore"

const mapHistoryItemToFrontend = (item: any): HistoryItem => {
  const snapshot = item.request_snapshot || {}
  const headersList = Object.entries(snapshot.headers || {}).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: String(value),
    active: true
  }))
  const paramsList = Object.entries(snapshot.params || {}).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: String(value),
    active: true
  }))
  return {
    id: String(item.id),
    method: item.method,
    url: item.url,
    statusCode: item.status || 0,
    durationMs: Math.round((item.duration || 0) * 1000),
    sizeBytes: item.response_size || 0,
    timestamp: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    requestData: {
      id: String(item.id),
      name: `Logged: ${item.method}`,
      method: item.method,
      url: item.url,
      headers: headersList,
      params: paramsList,
      bodyType: snapshot.body ? "raw" : "none",
      body: snapshot.body || "",
      authType: "none",
      bearerToken: "",
      basicUsername: "",
      basicPassword: "",
      formData: [],
      urlEncoded: [],
      response: null,
      loading: false,
      isDirty: false
    }
  }
}

export const historyApi = {
  async getAll(params?: { search?: string; method?: string; status?: number }): Promise<HistoryItem[]> {
    // Call GET /api/history with filters
    const res = await apiClient.get<any>("/api/history", {
      params: {
        page: 1,
        limit: 50,
        ...params
      }
    })
    // data.items holds the history items in the paginated response
    const items = res.data?.items || []
    return items.map(mapHistoryItemToFrontend)
  },

  async clear(): Promise<void> {
    await apiClient.delete("/api/history")
  },

  async deleteItem(id: string): Promise<void> {
    await apiClient.delete(`/api/history/${id}`)
  }
}
export default historyApi
