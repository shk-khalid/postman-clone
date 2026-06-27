import { HTTPMethod } from "@/store/tabStore"

export interface RequestPayload {
  method: HTTPMethod
  url: string
  headers: Record<string, string>
  params: Record<string, string>
  bodyType: "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded"
  body: string
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
    // Simulate real network request delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // 1. Centralized request validation
    if (!payload.url) {
      throw new Error("Invalid URL: Target address cannot be empty")
    }

    try {
      const cleanUrl = payload.url.startsWith("http://") || payload.url.startsWith("https://")
        ? payload.url
        : `http://${payload.url}`
      new URL(cleanUrl)
    } catch {
      throw new Error("Invalid URL: Malformed address or unsupported protocol format")
    }

    // 2. Validate JSON payloads
    if (payload.bodyType === "json" && payload.body.trim()) {
      try {
        JSON.parse(payload.body)
      } catch (err: any) {
        throw new Error(`Invalid JSON payload: ${err.message}`)
      }
    }

    // 3. Generate mock response
    const mockResponseBody = {
      timestamp: new Date().toISOString(),
      method: payload.method,
      resolvedUrl: payload.url,
      headersReceived: payload.headers,
      queryParametersReceived: payload.params,
      response: "Mock transmission completed. Decoupled services are fully operational.",
      data: {
        id: Math.floor(Math.random() * 100) + 1,
        status: "active",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
    }

    const bodyStr = JSON.stringify(mockResponseBody, null, 2)
    
    return {
      status: 200,
      statusText: "OK",
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-powered-by": "FastAPI Mock Adapter",
        "access-control-allow-origin": "*",
        "cache-control": "no-cache",
      },
      body: bodyStr,
      duration: Math.floor(Math.random() * 180) + 20,
      size: bodyStr.length,
      timestamp: new Date().toLocaleTimeString(),
    }
  },
}
export default requestApi
