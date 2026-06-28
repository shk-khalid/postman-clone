import React, { useState } from "react"
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Search, Trash2, Edit2, Check, X, Copy, ArrowRightLeft } from "lucide-react"
import { useCollectionStore, Collection, CollectionRequest } from "@/store/collectionStore"
import { useTabStore } from "@/store/tabStore"
import { useToastStore } from "@/store/toastStore"
import { cn } from "@/lib/utils"

export const CollectionsFeature: React.FC = () => {
  const {
    collections,
    createCollection,
    renameCollection,
    deleteCollection,
    addRequestToCollection,
    deleteRequestFromCollection,
    renameRequestInCollection,
  } = useCollectionStore()

  const { addTab, tabs, setActiveTabId } = useTabStore()
  const { showToast } = useToastStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [newColName, setNewColName] = useState("")
  const [isCreatingCol, setIsCreatingCol] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [expandedColIds, setExpandedColIds] = useState<Record<string, boolean>>({
    "col-auth": true,
    "col-users": true,
  })

  // Moving request workspace helpers
  const [movingRequestId, setMovingRequestId] = useState<string | null>(null)
  const [sourceCollectionId, setSourceCollectionId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedColIds((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleCreateCollection = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColName.trim()) return
    createCollection(newColName.trim())
    showToast(`Collection "${newColName.trim()}" created`, "success")
    setNewColName("")
    setIsCreatingCol(false)
  }

  const handleStartRename = (id: string, currentName: string) => {
    setEditingId(id)
    setEditName(currentName)
  }

  const handleSaveRename = (id: string, isRequest: boolean, collectionId?: string) => {
    if (!editName.trim()) return
    if (isRequest && collectionId) {
      renameRequestInCollection(collectionId, id, editName.trim())
      showToast("Request renamed", "success")
    } else {
      renameCollection(id, editName.trim())
      showToast("Collection renamed", "success")
    }
    setEditingId(null)
  }

  const handleAddRequest = (colId: string) => {
    const id = crypto.randomUUID()
    const name = "New Endpoint"
    addRequestToCollection(colId, {
      id,
      name,
      method: "GET",
      url: "https://{{base_url}}/resource",
      headers: [{ id: crypto.randomUUID(), key: "Content-Type", value: "application/json", active: true }],
      params: [],
      bodyType: "none",
      body: "",
      authType: "none",
      bearerToken: "",
      basicUsername: "",
      basicPassword: "",
    })
    showToast("Request added", "success")
    setExpandedColIds((prev) => ({ ...prev, [colId]: true }))
  }

  // Duplicate Collection
  const handleDuplicateCollection = (col: Collection) => {
    const newId = crypto.randomUUID()
    const duplicatedRequests = col.requests.map((r) => ({
      ...r,
      id: crypto.randomUUID(),
      name: `${r.name} Copy`,
    }))
    
    const storeState = useCollectionStore.getState()
    const updated = [...storeState.collections, {
      id: newId,
      name: `${col.name} Copy`,
      requests: duplicatedRequests,
    }]
    
    // Trigger update
    useCollectionStore.setState({ collections: updated })
    localStorage.setItem("postman_clone_collections", JSON.stringify(updated))
    showToast(`Duplicated collection "${col.name}"`, "success")
  }

  // Duplicate Request
  const handleDuplicateRequest = (colId: string, req: CollectionRequest) => {
    const dup: Partial<CollectionRequest> = {
      ...req,
      id: crypto.randomUUID(),
      name: `${req.name} Copy`,
    }
    addRequestToCollection(colId, dup)
    showToast(`Duplicated request "${req.name}"`, "success")
  }

  // Move request between collections
  const handleMoveRequest = (targetColId: string) => {
    if (!movingRequestId || !sourceCollectionId) return
    const storeState = useCollectionStore.getState()
    
    let requestToMove: CollectionRequest | undefined
    
    // Find request in source
    const updated = storeState.collections.map((col) => {
      if (col.id === sourceCollectionId) {
        requestToMove = col.requests.find((r) => r.id === movingRequestId)
        return { ...col, requests: col.requests.filter((r) => r.id !== movingRequestId) }
      }
      return col
    })

    if (requestToMove) {
      const final = updated.map((col) => {
        if (col.id === targetColId) {
          return { ...col, requests: [...col.requests, requestToMove!] }
        }
        return col
      })
      useCollectionStore.setState({ collections: final })
      localStorage.setItem("postman_clone_collections", JSON.stringify(final))
      showToast("Request moved successfully", "success")
    }

    setMovingRequestId(null)
    setSourceCollectionId(null)
  }

  const handleOpenRequest = (req: CollectionRequest) => {
    const openTab = tabs.find((t) => t.id === req.id)
    if (openTab) {
      setActiveTabId(openTab.id)
    } else {
      addTab({
        id: req.id,
        name: req.name,
        method: req.method,
        url: req.url,
        headers: req.headers,
        params: req.params,
        bodyType: req.bodyType,
        body: req.body,
        authType: req.authType,
        bearerToken: req.bearerToken,
        basicUsername: req.basicUsername,
        basicPassword: req.basicPassword,
        formData: req.formData || [],
        urlEncoded: req.urlEncoded || [],
        isDirty: false,
      })
    }
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/10"
      case "POST": return "text-amber-500 bg-amber-500/10 border-amber-500/10"
      case "PUT": return "text-blue-500 bg-blue-500/10 border-blue-500/10"
      case "DELETE": return "text-rose-500 bg-rose-500/10 border-rose-500/10"
      case "PATCH": return "text-indigo-500 bg-indigo-500/10 border-indigo-500/10"
      default: return "text-zinc-500 bg-zinc-500/10 border-zinc-500/10"
    }
  }

  // Highlight helper for searches
  const renderHighlightedText = (text: string, query: string) => {
    if (!query) return <span>{text}</span>
    const parts = text.split(new RegExp(`(${query.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")})`, "gi"))
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-primary/30 text-foreground px-0.5 rounded font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    )
  }

  const filtered = collections.map((col) => {
    const matchedRequests = col.requests.filter((r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.url.toLowerCase().includes(searchQuery.toLowerCase())
    )
    return { ...col, requests: matchedRequests }
  }).filter((col) =>
    col.name.toLowerCase().includes(searchQuery.toLowerCase()) || col.requests.length > 0
  )

  return (
    <div className="flex flex-col h-full bg-card border-r border-border select-none">
      {/* Header controls */}
      <div className="p-3 border-b border-border/45 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collections</span>
          <button
            onClick={() => setIsCreatingCol(true)}
            className="p-1 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
            title="Create collection"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreatingCol && (
          <form onSubmit={handleCreateCollection} className="flex gap-1.5 mt-1">
            <input
              type="text"
              autoFocus
              placeholder="Collection name..."
              value={newColName}
              onChange={(e) => setNewColName(e.target.value)}
              className="flex-1 bg-muted/40 border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              className="px-2.5 bg-primary text-primary-foreground text-xs rounded hover:bg-primary/90"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingCol(false)}
              className="p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-md py-1.5 pl-8 pr-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      {/* Move requests modal interface */}
      {movingRequestId && (
        <div className="p-3 bg-muted/10 border-b border-border flex flex-col gap-2">
          <span className="text-[10px] text-muted-foreground font-bold">Move request to:</span>
          <div className="flex gap-1">
            <select
              onChange={(e) => handleMoveRequest(e.target.value)}
              defaultValue=""
              className="flex-1 bg-background border border-border rounded text-xs p-1 text-foreground focus:outline-none"
            >
              <option value="" disabled>Select collection...</option>
              {collections.filter(c => c.id !== sourceCollectionId).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => { setMovingRequestId(null); setSourceCollectionId(null) }}
              className="p-1 text-rose-500 rounded hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Collections list tree */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No collections found.
          </div>
        ) : (
          filtered.map((col) => {
            const isExpanded = expandedColIds[col.id]
            const isEditing = editingId === col.id

            return (
              <div key={col.id} className="space-y-0.5">
                {/* Collection Row */}
                <div className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-xs font-medium text-foreground transition-all relative">
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        autoFocus
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-zinc-900 border border-primary/50 rounded-md px-1.5 py-0.5 text-xs text-foreground focus:outline-none flex-1"
                      />
                      <button
                        onClick={() => handleSaveRename(col.id, false)}
                        className="p-0.5 text-emerald-500 hover:bg-white/5 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-0.5 text-rose-500 hover:bg-white/5 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => toggleExpand(col.id)}>
                        <span className="text-muted-foreground shrink-0">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </span>
                        <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20 shrink-0" />
                        <span className="truncate">{renderHighlightedText(col.name, searchQuery)}</span>
                      </div>

                      {/* Collection Options */}
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleAddRequest(col.id) }}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                          title="Add Request"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateCollection(col) }}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                          title="Duplicate Collection"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartRename(col.id, col.name) }}
                          className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteCollection(col.id)
                            showToast("Collection removed", "warning")
                          }}
                          className="p-0.5 rounded text-muted-foreground hover:text-rose-400 hover:bg-white/5"
                          title="Delete Collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Collection Requests Sub-Tree */}
                {isExpanded && !isEditing && (
                  <div className="pl-4 border-l border-border/20 ml-3.5 space-y-0.5 mt-0.5">
                    {col.requests.map((req) => {
                      const isRequestEditing = editingId === req.id

                      return (
                        <div
                          key={req.id}
                          onClick={() => !isRequestEditing && handleOpenRequest(req)}
                          className="group flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {isRequestEditing ? (
                            <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="bg-zinc-900 border border-primary/50 rounded-md px-1.5 py-0.5 text-xs text-foreground focus:outline-none flex-1"
                              />
                              <button
                                onClick={() => handleSaveRename(req.id, true, col.id)}
                                className="p-0.5 text-emerald-500 hover:bg-white/5 rounded"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-0.5 text-rose-500 hover:bg-white/5 rounded"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={cn(
                                  "w-10 text-[9px] font-bold text-center tracking-wide py-0.5 border rounded font-mono shrink-0",
                                  getMethodBadgeColor(req.method)
                                )}>
                                  {req.method}
                                </span>
                                <span className="truncate flex-1">{renderHighlightedText(req.name, searchQuery)}</span>
                              </div>

                              {/* Request Actions */}
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setMovingRequestId(req.id)
                                    setSourceCollectionId(col.id)
                                  }}
                                  className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                                  title="Move Request"
                                >
                                  <ArrowRightLeft className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDuplicateRequest(col.id, req) }}
                                  className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                                  title="Duplicate Request"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleStartRename(req.id, req.name) }}
                                  className="p-0.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/5"
                                  title="Rename Request"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    deleteRequestFromCollection(col.id, req.id)
                                    showToast("Request removed", "warning")
                                  }}
                                  className="p-0.5 rounded text-muted-foreground hover:text-rose-400 hover:bg-white/5"
                                  title="Delete Request"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}

                    {col.requests.length === 0 && (
                      <div className="text-[10px] text-muted-foreground/50 py-1 pl-2">
                        Empty Collection
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
export default CollectionsFeature
