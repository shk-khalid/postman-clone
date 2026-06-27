import React, { useState } from "react"
import { Folder, FileText, ChevronRight, ChevronDown, Plus, Search, HelpCircle } from "lucide-react"
import { mockCollections, Collection, CollectionItem, collectionItemToTab } from "./mockCollections"
import { useTabStore } from "@/store/tabStore"
import { cn } from "@/lib/utils"

export const CollectionsFeature: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "col-auth": true,
    "col-users": true,
    "col-billing": false,
  })
  
  const { addTab, setActiveTabId, tabs } = useTabStore()

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleSelectRequest = (item: CollectionItem) => {
    const existing = tabs.find((t) => t.id === item.id)
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      addTab(collectionItemToTab(item))
    }
  }

  const handleAddNewRequest = () => {
    addTab({
      name: "New Request",
      url: "https://api.example.com/v1/resource",
      method: "GET",
    })
  }

  const getMethodBadgeColor = (method?: string) => {
    switch (method) {
      case "GET":
        return "text-emerald-500 bg-emerald-500/10"
      case "POST":
        return "text-amber-500 bg-amber-500/10"
      case "PUT":
        return "text-blue-500 bg-blue-500/10"
      case "DELETE":
        return "text-rose-500 bg-rose-500/10"
      case "PATCH":
        return "text-indigo-500 bg-indigo-500/10"
      default:
        return "text-zinc-500 bg-zinc-500/10"
    }
  }

  const filteredCollections = mockCollections
    .map((col) => {
      const items = col.items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.url && item.url.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      return { ...col, items }
    })
    .filter((col) => col.items.length > 0 || col.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border-r border-border/40 select-none">
      <div className="p-3 border-b border-border/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Collections</span>
          <button
            onClick={handleAddNewRequest}
            className="p-1 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground transition-colors"
            title="Create new request"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Filter collections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-border/30 rounded-md py-1.5 pl-8 pr-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredCollections.length === 0 ? (
          <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center gap-1.5">
            <HelpCircle className="w-4 h-4 opacity-50" />
            <span>No collections match your query</span>
          </div>
        ) : (
          filteredCollections.map((col) => {
            const isExpanded = expandedFolders[col.id]
            return (
              <div key={col.id} className="space-y-0.5">
                <div
                  onClick={() => toggleFolder(col.id)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-xs font-medium text-foreground transition-all duration-150"
                >
                  <span className="text-muted-foreground">
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                  </span>
                  <Folder className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
                  <span className="truncate">{col.name}</span>
                  <span className="ml-auto text-[10px] text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded-full font-mono">
                    {col.items.length}
                  </span>
                </div>

                {isExpanded && (
                  <div className="pl-4 border-l border-border/20 ml-3.5 space-y-0.5 mt-0.5">
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectRequest(item)}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/5 cursor-pointer text-[11px] text-muted-foreground hover:text-foreground transition-colors group"
                      >
                        <span className={cn(
                          "w-10 font-bold text-[9px] text-center tracking-wide py-0.5 rounded font-mono shrink-0",
                          getMethodBadgeColor(item.method)
                        )}>
                          {item.method}
                        </span>
                        <span className="truncate flex-1">{item.name}</span>
                      </div>
                    ))}
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
