import React, { useState } from "react"
import { Send, Eye, ShieldAlert, Cpu } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { MonacoWrapper } from "@/components/ui/MonacoWrapper"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { cn } from "@/lib/utils"

export const ResponseViewerFeature: React.FC = () => {
  const { activeTabId, tabs } = useTabStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  const [activeSubTab, setActiveSubTab] = useState<"body" | "headers">("body")

  if (!activeTab) {
    return (
      <EmptyState
        icon={Send}
        title="No active request"
        description="Select or create a request to inspect its workspace."
      />
    )
  }

  if (activeTab.loading) {
    return <LoadingState message="Sending request to mock server..." />
  }

  if (!activeTab.response) {
    return (
      <EmptyState
        icon={Eye}
        title="No response received"
        description="Click 'Send' above to dispatch the HTTP transaction and review parameters."
      />
    )
  }

  const { response } = activeTab

  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    if (status >= 300 && status < 400) return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-500 border border-amber-500/20"
    return "bg-rose-500/10 text-rose-500 border border-rose-500/20"
  }

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-3 select-none gap-3 overflow-hidden">
      {/* Response Header / Meta Badges */}
      <div className="flex items-center justify-between border-b border-border/20 pb-2">
        <span className="text-xs font-semibold text-foreground tracking-tight">Response Details</span>

        <div className="flex items-center gap-2">
          {/* Status */}
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wide",
            getStatusBadgeColor(response.status)
          )}>
            Status: {response.status} {response.statusText}
          </span>

          {/* Latency */}
          <span className="text-[10px] font-bold bg-zinc-800 text-muted-foreground border border-border/30 px-2 py-0.5 rounded-full font-mono">
            Time: {response.timeMs} ms
          </span>

          {/* Size */}
          <span className="text-[10px] font-bold bg-zinc-800 text-muted-foreground border border-border/30 px-2 py-0.5 rounded-full font-mono">
            Size: {(response.sizeBytes / 1024).toFixed(2)} KB
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/30">
        {(["body", "headers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-medium border-b-2 transition-all capitalize -mb-px",
              activeSubTab === tab
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Panel viewport */}
      <div className="flex-1 overflow-auto bg-zinc-950/20 border border-border/20 rounded-lg p-2.5">
        {activeSubTab === "body" && (
          <div className="w-full h-full min-h-[140px]">
            <MonacoWrapper
              value={response.body}
              language="json"
              readOnly
            />
          </div>
        )}

        {activeSubTab === "headers" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Response Headers</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-medium">
                    <th className="p-2 border-r border-border/30 w-1/3">Header Key</th>
                    <th className="p-2">Header Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(response.headers).map(([key, val]) => (
                    <tr key={key} className="border-b border-border/20 hover:bg-white/[0.02]">
                      <td className="p-2 border-r border-border/30 font-medium text-foreground">{key}</td>
                      <td className="p-2 text-muted-foreground font-mono">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
