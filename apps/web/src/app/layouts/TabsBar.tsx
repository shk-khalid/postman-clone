import React from "react"
import { Plus, X, Copy, Circle } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { useToastStore } from "@/store/toastStore"
import { cn } from "@/lib/utils"

export const TabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, addTab, duplicateTab, updateTab } = useTabStore()
  const { showToast } = useToastStore()

  const [editingTabId, setEditingTabId] = React.useState<string | null>(null)
  const [editingName, setEditingName] = React.useState("")

  const handleAddNewTab = () => {
    addTab()
  }

  const handleDuplicateTab = (id: string, name: string) => {
    duplicateTab(id)
    showToast(`Duplicated tab "${name}"`, "success")
  }

  const handleSaveRename = (id: string) => {
    if (editingName.trim()) {
      updateTab(id, { name: editingName.trim() })
    }
    setEditingTabId(null)
  }

  const getMethodColorClass = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-500"
      case "POST": return "text-amber-500"
      case "PUT": return "text-blue-500"
      case "DELETE": return "text-rose-500"
      case "PATCH": return "text-indigo-500"
      default: return "text-zinc-500"
    }
  }

  return (
    <div className="flex items-center bg-card border-b border-border overflow-x-auto h-10 select-none shrink-0 no-scrollbar">
      {/* Tabs list view */}
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const isEditing = editingTabId === tab.id

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "group flex items-center gap-2 h-full px-3.5 text-xs border-r border-border/30 cursor-pointer transition-all relative shrink-0",
                isActive
                  ? "bg-background text-foreground border-b-2 border-b-primary font-semibold"
                  : "text-muted-foreground hover:bg-white/2 hover:text-foreground"
              )}
            >
              {/* Method Label */}
              <span className={cn("font-bold text-[9px] font-mono shrink-0", getMethodColorClass(tab.method))}>
                {tab.method}
              </span>

              {/* Title */}
              {isEditing ? (
                <input
                  type="text"
                  autoFocus
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveRename(tab.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveRename(tab.id)
                    } else if (e.key === "Escape") {
                      setEditingTabId(null)
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-zinc-800 border border-primary/50 rounded px-1 py-0.5 text-xs text-foreground focus:outline-none max-w-[100px] font-normal"
                />
              ) : (
                <span
                  onClick={(e) => {
                    if (isActive) {
                      e.stopPropagation()
                      setEditingTabId(tab.id)
                      setEditingName(tab.name)
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    setEditingTabId(tab.id)
                    setEditingName(tab.name)
                  }}
                  className="truncate max-w-[100px]"
                  title="Click to rename"
                >
                  {tab.name}
                </span>
              )}

              {/* Dirty indicator */}
              {tab.isDirty && (
                <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0 animate-pulse" title="Unsaved changes" />
              )}

              {/* Actions Area (Duplicate & Close) */}
              <div className="flex items-center gap-0.5 ml-1">
                {/* Duplicate */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicateTab(tab.id, tab.name)
                  }}
                  className="p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  title="Duplicate Tab"
                >
                  <Copy className="w-2.5 h-2.5" />
                </button>

                {/* Close */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.id)
                  }}
                  className="p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Close Tab"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* New Tab Button */}
      <button
        onClick={handleAddNewTab}
        className="p-1.5 ml-1 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-md transition-all shrink-0"
        title="Add Request Tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}
export default TabsBar
