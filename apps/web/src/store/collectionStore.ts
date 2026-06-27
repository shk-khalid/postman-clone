import { create } from "zustand"
import { HTTPMethod, RequestHeader, RequestParam } from "./tabStore"

export interface CollectionRequest {
  id: string
  name: string
  method: HTTPMethod
  url: string
  headers: RequestHeader[]
  params: RequestParam[]
  bodyType: "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded"
  body: string
  authType: "none" | "bearer" | "basic"
  bearerToken: string
  basicUsername: string
  basicPassword: string
  formData?: { id: string; key: string; value: string; active: boolean; type: "text" | "file" }[]
  urlEncoded?: { id: string; key: string; value: string; active: boolean }[]
}

export interface Collection {
  id: string
  name: string
  description?: string
  requests: CollectionRequest[]
}

interface CollectionStore {
  collections: Collection[]
  createCollection: (name: string) => void
  renameCollection: (id: string, newName: string) => void
  deleteCollection: (id: string) => void
  addRequestToCollection: (collectionId: string, request: Partial<CollectionRequest>) => void
  deleteRequestFromCollection: (collectionId: string, requestId: string) => void
  renameRequestInCollection: (collectionId: string, requestId: string, newName: string) => void
}

const DEFAULT_COLLECTIONS: Collection[] = [
  {
    id: "col-auth",
    name: "Auth Service",
    description: "Authentication and token lifecycle endpoints",
    requests: [
      {
        id: "auth-login",
        name: "Login User",
        method: "POST",
        url: "https://{{base_url}}/auth/login",
        headers: [{ id: "h1", key: "Content-Type", value: "application/json", active: true }],
        params: [],
        bodyType: "json",
        body: JSON.stringify({ email: "admin@example.com", password: "secretPassword123" }, null, 2),
        authType: "none",
        bearerToken: "",
        basicUsername: "",
        basicPassword: "",
      },
      {
        id: "auth-me",
        name: "Get Current User Profile",
        method: "GET",
        url: "https://{{base_url}}/auth/me",
        headers: [{ id: "h2", key: "Authorization", value: "Bearer {{authToken}}", active: true }],
        params: [],
        bodyType: "none",
        body: "",
        authType: "none",
        bearerToken: "",
        basicUsername: "",
        basicPassword: "",
      },
    ],
  },
  {
    id: "col-users",
    name: "Users API",
    description: "User profile management operations",
    requests: [
      {
        id: "users-list",
        name: "List Paginated Users",
        method: "GET",
        url: "https://{{base_url}}/users",
        headers: [],
        params: [
          { id: "p1", key: "page", value: "1", active: true },
          { id: "p2", key: "limit", value: "10", active: true },
        ],
        bodyType: "none",
        body: "",
        authType: "none",
        bearerToken: "",
        basicUsername: "",
        basicPassword: "",
      },
    ],
  },
]

const loadCollections = (): Collection[] => {
  try {
    const raw = localStorage.getItem("postman_clone_collections")
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error("Failed to load collections", e)
  }
  return DEFAULT_COLLECTIONS
}

export const useCollectionStore = create<CollectionStore>((set) => ({
  collections: loadCollections(),

  createCollection: (name) =>
    set((state) => {
      const newCol: Collection = {
        id: crypto.randomUUID(),
        name,
        requests: [],
      }
      const updated = [...state.collections, newCol]
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),

  renameCollection: (id, newName) =>
    set((state) => {
      const updated = state.collections.map((c) => (c.id === id ? { ...c, name: newName } : c))
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),

  deleteCollection: (id) =>
    set((state) => {
      const updated = state.collections.filter((c) => c.id !== id)
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),

  addRequestToCollection: (collectionId, req) =>
    set((state) => {
      const newReq: CollectionRequest = {
        id: req.id || crypto.randomUUID(),
        name: req.name || "New Request",
        method: req.method || "GET",
        url: req.url || "",
        headers: req.headers || [],
        params: req.params || [],
        bodyType: req.bodyType || "none",
        body: req.body || "",
        authType: req.authType || "none",
        bearerToken: req.bearerToken || "",
        basicUsername: req.basicUsername || "",
        basicPassword: req.basicPassword || "",
        formData: req.formData || [],
        urlEncoded: req.urlEncoded || [],
      }
      const updated = state.collections.map((c) =>
        c.id === collectionId ? { ...c, requests: [...c.requests, newReq] } : c
      )
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),

  deleteRequestFromCollection: (collectionId, requestId) =>
    set((state) => {
      const updated = state.collections.map((c) =>
        c.id === collectionId
          ? { ...c, requests: c.requests.filter((r) => r.id !== requestId) }
          : c
      )
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),

  renameRequestInCollection: (collectionId, requestId, newName) =>
    set((state) => {
      const updated = state.collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              requests: c.requests.map((r) => (r.id === requestId ? { ...r, name: newName } : r)),
            }
          : c
      )
      localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
      return { collections: updated }
    }),
}))
