import { apiClient } from "./apiClient"
import { HTTPMethod } from "@/store/tabStore"

export interface RequestPayload {
  method: HTTPMethod
  url: string
  headers: Record<string, string>
  params: Record<string, string>
  body?: string
  auth?: Record<string, string>
  environment_id?: number | null
}

export interface NormalizedResponse {
  status: number
  statusText: string
  headers: Record<string, string>
  body: string
  duration: number
  size: number
  timestamp: string
}

export const requestApi = {
  async send(payload: RequestPayload): Promise<NormalizedResponse> {
    const res = await apiClient.post<any>("/api/request/send", payload)
    const data = res.data
    return {
      status: data.status || 0,
      statusText: data.status_text || "Error",
      headers: data.headers || {},
      body: data.body || "",
      duration: Math.round((data.duration || 0) * 1000), // convert seconds to ms
      size: data.size || 0,
      timestamp: new Date().toLocaleTimeString(),
    }
  },
}
export default requestApi
