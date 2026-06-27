import React from "react"
import { Plus, X, Copy, Circle } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { useToastStore } from "@/store/toastStore"
import { cn } from "@/lib/utils"

export const TabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, addTab, duplicateTab } = useTabStore()
  const { showToast } = useToastStore()

  const handleAddNewTab = () => {
    addTab()
  }

  const handleDuplicateTab = (id: string, name: string) => {
    duplicateTab(id)
    showToast(`Duplicated tab "${name}"`, "success")
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
    <div className="flex items-center bg-zinc-950/80 border-b border-border/40 overflow-x-auto h-10 select-none shrink-0 no-scrollbar">
      {/* Tabs list view */}
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "group flex items-center gap-2 h-full px-3.5 text-xs border-r border-border/30 cursor-pointer transition-all relative shrink-0",
                isActive
                  ? "bg-zinc-900 text-foreground border-b-2 border-b-primary font-semibold"
                  : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
              )}
            >
              {/* Method Label */}
              <span className={cn("font-bold text-[9px] font-mono shrink-0", getMethodColorClass(tab.method))}>
                {tab.method}
              </span>

              {/* Title */}
              <span className="truncate max-w-[100px]">{tab.name}</span>

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
