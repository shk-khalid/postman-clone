import React from "react"
import { Plus, X } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { cn } from "@/lib/utils"

export const TabsBar: React.FC = () => {
  const { tabs, activeTabId, setActiveTabId, closeTab, addTab } = useTabStore()

  const handleAddNewTab = () => {
    addTab()
  }

  const getMethodColorClass = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-500"
      case "POST": return "text-amber-500"
      case "PUT": return "text-blue-500"
      case "DELETE": return "text-rose-500"
      default: return "text-indigo-500"
    }
  }

  return (
    <div className="flex items-center bg-zinc-950/80 border-b border-border/40 overflow-x-auto h-9 select-none shrink-0 no-scrollbar">
      {/* Tabs scroll viewport */}
      <div className="flex items-center h-full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId

          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={cn(
                "flex items-center gap-1.5 h-full px-3 text-xs border-r border-border/30 cursor-pointer transition-all relative shrink-0",
                isActive
                  ? "bg-zinc-900 text-foreground border-b-2 border-b-primary"
                  : "text-muted-foreground hover:bg-white/[0.02] hover:text-foreground"
              )}
            >
              {/* Method Verb */}
              <span className={cn("font-bold text-[9px] font-mono", getMethodColorClass(tab.method))}>
                {tab.method}
              </span>

              {/* Title */}
              <span className="truncate max-w-[100px] font-medium">{tab.name}</span>

              {/* Close Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                className="p-0.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          )
        })}
      </div>

      {/* Add Tab trigger */}
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
