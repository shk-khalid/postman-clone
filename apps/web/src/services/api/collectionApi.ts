import { apiClient } from "./apiClient"
import { Collection, CollectionRequest } from "@/store/collectionStore"

const mapRequestToBackend = (req: Partial<CollectionRequest>) => {
  const headersObj: Record<string, string> = {}
  if (req.headers) {
    req.headers.filter(h => h.key && h.active).forEach(h => {
      headersObj[h.key] = h.value
    })
  }
  const paramsObj: Record<string, string> = {}
  if (req.params) {
    req.params.filter(p => p.key && p.active).forEach(p => {
      paramsObj[p.key] = p.value
    })
  }
  return {
    name: req.name || "Untitled Request",
    method: req.method || "GET",
    url: req.url || "",
    headers: headersObj,
    params: paramsObj,
    body: req.body || "",
    body_type: req.bodyType || "none",
    auth_type: req.authType || "none",
    auth_data: {
      bearerToken: req.bearerToken || "",
      basicUsername: req.basicUsername || "",
      basicPassword: req.basicPassword || ""
    }
  }
}

const mapRequestToFrontend = (req: any): CollectionRequest => {
  const headersList = Object.entries(req.headers || {}).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: String(value),
    active: true
  }))
  const paramsList = Object.entries(req.params || {}).map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: String(value),
    active: true
  }))
  const authData = req.auth_data || {}
  return {
    id: String(req.id),
    name: req.name,
    method: req.method,
    url: req.url,
    headers: headersList,
    params: paramsList,
    bodyType: req.body_type || "none",
    body: req.body || "",
    authType: req.auth_type || "none",
    bearerToken: authData.bearerToken || "",
    basicUsername: authData.basicUsername || "",
    basicPassword: authData.basicPassword || ""
  }
}

export const collectionApi = {
  async getAll(): Promise<Collection[]> {
    const res = await apiClient.get<any[]>("/api/collections")
    return res.data.map((col: any) => ({
      id: String(col.id),
      name: col.name,
      description: col.description || "",
      requests: (col.requests || []).map(mapRequestToFrontend)
    }))
  },

  async createCollection(name: string, description?: string): Promise<Collection> {
    const res = await apiClient.post<any>("/api/collections", { name, description })
    return {
      id: String(res.data.id),
      name: res.data.name,
      description: res.data.description || "",
      requests: []
    }
  },

  async renameCollection(id: string, name: string): Promise<Collection> {
    const res = await apiClient.patch<any>(`/api/collections/${id}`, { name })
    return {
      id: String(res.data.id),
      name: res.data.name,
      description: res.data.description || "",
      requests: (res.data.requests || []).map(mapRequestToFrontend)
    }
  },

  async deleteCollection(id: string): Promise<void> {
    await apiClient.delete(`/api/collections/${id}`)
  },

  async saveRequest(collectionId: string, request: Partial<CollectionRequest>): Promise<CollectionRequest> {
    const payload = mapRequestToBackend(request)
    const res = await apiClient.post<any>(`/api/collections/${collectionId}/requests`, payload)
    return mapRequestToFrontend(res.data)
  },

  async updateRequest(requestId: string, request: Partial<CollectionRequest>): Promise<CollectionRequest> {
    const payload = mapRequestToBackend(request)
    const res = await apiClient.patch<any>(`/api/requests/${requestId}`, payload)
    return mapRequestToFrontend(res.data)
  },

  async deleteRequest(requestId: string): Promise<void> {
    await apiClient.delete(`/api/requests/${requestId}`)
  },

  async moveRequest(requestId: string, newCollectionId: string): Promise<CollectionRequest> {
    const res = await apiClient.patch<any>(`/api/requests/${requestId}/move`, { new_collection_id: parseInt(newCollectionId, 10) })
    return mapRequestToFrontend(res.data)
  },

  async duplicateRequest(requestId: string): Promise<CollectionRequest> {
    const res = await apiClient.patch<any>(`/api/requests/${requestId}/duplicate`)
    return mapRequestToFrontend(res.data)
  }
}
export default collectionApi
