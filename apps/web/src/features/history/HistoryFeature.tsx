import React, { useState } from "react"
import { History, Search, Trash2, Globe, ArrowRight } from "lucide-react"
import { useHistoryStore, HistoryItem } from "@/store/historyStore"
import { useTabStore } from "@/store/tabStore"
import { useToastStore } from "@/store/toastStore"
import { cn } from "@/lib/utils"

export const HistoryFeature: React.FC = () => {
  const { history, clearHistory, deleteHistoryItem } = useHistoryStore()
  const { addTab } = useTabStore()
  const { showToast } = useToastStore()
  const [searchQuery, setSearchQuery] = useState("")

  const handleReopen = (item: HistoryItem) => {
    addTab({
      ...item.requestData,
      id: crypto.randomUUID(), // Open as new active tab
      isDirty: false,
    })
    showToast("Historical request loaded", "info")
  }

  const handleClearHistory = () => {
    clearHistory()
    showToast("History cleared", "warning")
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/10"
      case "POST": return "text-amber-500 bg-amber-500/10 border-amber-500/10"
      case "PUT": return "text-blue-500 bg-blue-500/10 border-blue-500/10"
      case "DELETE": return "text-rose-500 bg-rose-500/10 border-rose-500/10"
      default: return "text-indigo-500 bg-indigo-500/10 border-indigo-500/10"
    }
  }

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-500"
    if (code >= 300 && code < 400) return "text-blue-400"
    if (code >= 400 && code < 500) return "text-amber-500"
    return "text-rose-500"
  }

  const filtered = history.filter((item) =>
    item.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.method.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border-r border-border/40 select-none">
      <div className="p-3 border-b border-border/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</span>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="p-1 rounded-md text-muted-foreground hover:bg-white/5 hover:text-rose-400 transition-colors"
              title="Clear all history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-border/30 rounded-md py-1.5 pl-8 pr-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center gap-1.5 mt-8">
            <History className="w-6 h-6 opacity-30" />
            <span>No requests in history</span>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleReopen(item)}
              className="group flex flex-col gap-1 p-2 rounded-md hover:bg-white/5 cursor-pointer border border-transparent hover:border-border/30 transition-all relative"
            >
              <div className="flex items-center gap-2 pr-6">
                <span className={cn(
                  "w-10 text-[9px] font-bold text-center tracking-wide py-0.5 border rounded font-mono shrink-0",
                  getMethodBadgeColor(item.method)
                )}>
                  {item.method}
                </span>
                <span className="text-[11px] font-medium text-foreground truncate flex-1">{item.url || "New Request"}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-1">
                <div className="flex items-center gap-2">
                  <span className={cn("font-semibold font-mono", getStatusColor(item.statusCode))}>
                    {item.statusCode}
                  </span>
                  <span className="font-mono text-muted-foreground/60">{item.durationMs}ms</span>
                </div>
                <span className="text-muted-foreground/40 text-[9px]">{item.timestamp}</span>
              </div>

              {/* Action buttons */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteHistoryItem(item.id)
                  showToast("History log removed", "warning")
                }}
                className="absolute right-2 top-2 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-white/5 transition-opacity text-muted-foreground"
                title="Remove log"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
export default HistoryFeature
