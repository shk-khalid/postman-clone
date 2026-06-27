import React, { useState } from "react"
import { History, Search, Trash2, Globe } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { cn } from "@/lib/utils"

interface HistoryItem {
  id: string
  method: string
  url: string
  time: string
  statusCode: number
  latencyMs: number
}

const mockHistory: HistoryItem[] = [
  { id: "h1", method: "GET", url: "https://api.example.com/v1/auth/me", time: "Today, 4:21 PM", statusCode: 200, latencyMs: 142 },
  { id: "h2", method: "POST", url: "https://api.example.com/v1/auth/login", time: "Today, 4:18 PM", statusCode: 201, latencyMs: 384 },
  { id: "h3", method: "GET", url: "https://api.example.com/v1/users?page=1", time: "Yesterday, 11:42 AM", statusCode: 200, latencyMs: 219 },
  { id: "h4", method: "PATCH", url: "https://api.example.com/v1/users/usr_99812", time: "June 25, 6:12 PM", statusCode: 400, latencyMs: 98 },
  { id: "h5", method: "DELETE", url: "https://api.example.com/v1/users/usr_empty", time: "June 24, 3:05 PM", statusCode: 404, latencyMs: 310 },
]

export const HistoryFeature: React.FC = () => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>(mockHistory)
  const [search, setSearch] = useState("")
  const { addTab } = useTabStore()

  const handleSelectHistory = (item: HistoryItem) => {
    addTab({
      name: item.url.replace("https://", "").split("/").pop() || "History Request",
      method: item.method as any,
      url: item.url,
      response: {
        status: item.statusCode,
        statusText: item.statusCode === 200 || item.statusCode === 201 ? "OK" : "Error",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "History playback mock response", originalUrl: item.url }, null, 2),
        timeMs: item.latencyMs,
        sizeBytes: 154,
      },
    })
  }

  const clearHistory = () => {
    setHistoryList([])
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method) {
      case "GET": return "text-emerald-500 bg-emerald-500/10"
      case "POST": return "text-amber-500 bg-amber-500/10"
      case "PUT": return "text-blue-500 bg-blue-500/10"
      case "DELETE": return "text-rose-500 bg-rose-500/10"
      default: return "text-indigo-500 bg-indigo-500/10"
    }
  }

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-500"
    if (code >= 300 && code < 400) return "text-blue-400"
    if (code >= 400 && code < 500) return "text-amber-500"
    return "text-rose-500"
  }

  const filtered = historyList.filter((item) =>
    item.url.toLowerCase().includes(search.toLowerCase()) ||
    item.method.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border-r border-border/40 select-none">
      <div className="p-3 border-b border-border/40 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">History</span>
          {historyList.length > 0 && (
            <button
              onClick={clearHistory}
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-zinc-900 border border-border/30 rounded-md py-1.5 pl-8 pr-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground flex flex-col items-center gap-1.5 mt-8">
            <History className="w-6 h-6 opacity-30 animate-pulse" />
            <span>No requests in history</span>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectHistory(item)}
              className="flex flex-col gap-1 p-2 rounded-md hover:bg-white/5 cursor-pointer border border-transparent hover:border-border/30 transition-all group"
            >
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-bold text-[9px] px-1.5 py-0.5 rounded font-mono",
                  getMethodBadgeColor(item.method)
                )}>
                  {item.method}
                </span>
                <span className="text-[11px] font-medium text-foreground truncate flex-1">{item.url}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground pl-1">
                <span className={cn("font-medium font-mono", getStatusColor(item.statusCode))}>
                  {item.statusCode}
                </span>
                <span className="font-mono text-muted-foreground/60">{item.latencyMs}ms</span>
                <span className="text-muted-foreground/40 text-[9px]">{item.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
