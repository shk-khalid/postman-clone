// Simulated base Axios-like client that wraps localStorage transactions.
// In the future, this can be swapped with axios.create() directly.
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

class ApiClient {
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    await this.delay(100)
    // Extract key from simulated routes (e.g. /collections -> postman_clone_collections)
    const key = this.getStorageKey(url)
    const data = JSON.parse(localStorage.getItem(key) || "[]")
    return {
      data: data as T,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
    }
  }

  async post<T>(url: string, data: any, config?: any): Promise<ApiResponse<T>> {
    await this.delay(150)
    const key = this.getStorageKey(url)
    const current = JSON.parse(localStorage.getItem(key) || "[]")
    const updated = Array.isArray(current) ? [...current, data] : data
    localStorage.setItem(key, JSON.stringify(updated))
    return {
      data: data as T,
      status: 201,
      statusText: "Created",
      headers: { "content-type": "application/json" },
    }
  }

  async put<T>(url: string, data: any, config?: any): Promise<ApiResponse<T>> {
    await this.delay(150)
    const key = this.getStorageKey(url)
    localStorage.setItem(key, JSON.stringify(data))
    return {
      data: data as T,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
    }
  }

  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    await this.delay(100)
    const key = this.getStorageKey(url)
    // In mockup mode, DELETE typically resets or deletes a key
    if (url.includes("/history/clear")) {
      localStorage.removeItem("postman_clone_history")
    }
    return {
      data: {} as T,
      status: 200,
      statusText: "OK",
      headers: { "content-type": "application/json" },
    }
  }

  private getStorageKey(url: string): string {
    if (url.includes("/collections")) return "postman_clone_collections"
    if (url.includes("/environments")) return "postman_clone_environments"
    if (url.includes("/history")) return "postman_clone_history"
    if (url.includes("/settings")) return "postman_clone_settings"
    return "postman_clone_default"
  }
}

export const apiClient = new ApiClient()
