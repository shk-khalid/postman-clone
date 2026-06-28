import { create } from "zustand"
import { collectionApi } from "@/services/api/collectionApi"
import { HTTPMethod, RequestHeader, RequestParam } from "./tabStore"

export interface CollectionRequest {
  id: string
  name: string
  method: HTTPMethod
  url: string
  headers: RequestHeader[]
  params: RequestParam[]
  bodyType: "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded" | "binary"
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
  loading: boolean
  fetchCollections: () => Promise<void>
  createCollection: (name: string, description?: string) => Promise<void>
  renameCollection: (id: string, newName: string) => Promise<void>
  deleteCollection: (id: string) => Promise<void>
  addRequestToCollection: (collectionId: string, request: Partial<CollectionRequest>) => Promise<void>
  deleteRequestFromCollection: (collectionId: string, requestId: string) => Promise<void>
  renameRequestInCollection: (collectionId: string, requestId: string, newName: string) => Promise<void>
  moveRequest: (requestId: string, newCollectionId: string) => Promise<void>
  duplicateRequest: (collectionId: string, requestId: string) => Promise<void>
}

export const useCollectionStore = create<CollectionStore>((set, get) => ({
  collections: [],
  loading: false,

  fetchCollections: async () => {
    set({ loading: true })
    try {
      const data = await collectionApi.getAll()
      set({ collections: data })
    } catch (e) {
      console.error("Failed to load collections from API", e)
    } finally {
      set({ loading: false })
    }
  },

  createCollection: async (name, description) => {
    try {
      await collectionApi.createCollection(name, description)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to create collection", e)
    }
  },

  renameCollection: async (id, newName) => {
    try {
      await collectionApi.renameCollection(id, newName)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to rename collection", e)
    }
  },

  deleteCollection: async (id) => {
    try {
      await collectionApi.deleteCollection(id)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to delete collection", e)
    }
  },

  addRequestToCollection: async (collectionId, req) => {
    try {
      await collectionApi.saveRequest(collectionId, req)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to add request to collection", e)
    }
  },

  deleteRequestFromCollection: async (collectionId, requestId) => {
    try {
      await collectionApi.deleteRequest(requestId)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to delete request", e)
    }
  },

  renameRequestInCollection: async (collectionId, requestId, newName) => {
    try {
      await collectionApi.updateRequest(requestId, { name: newName })
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to rename request", e)
    }
  },

  moveRequest: async (requestId, newCollectionId) => {
    try {
      await collectionApi.moveRequest(requestId, newCollectionId)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to move request", e)
    }
  },

  duplicateRequest: async (collectionId, requestId) => {
    try {
      await collectionApi.duplicateRequest(requestId)
      await get().fetchCollections()
    } catch (e) {
      console.error("Failed to duplicate request", e)
    }
  }
}))
export default useCollectionStore
