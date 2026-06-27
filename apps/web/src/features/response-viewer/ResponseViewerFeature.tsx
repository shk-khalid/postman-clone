import React, { useState } from "react"
import { Send, Eye, Copy, Download, Check, Search, Info } from "lucide-react"
import { useTabStore } from "@/store/tabStore"
import { useToastStore } from "@/store/toastStore"
import { MonacoWrapper } from "@/components/ui/MonacoWrapper"
import { EmptyState } from "@/components/ui/EmptyState"
import { LoadingState } from "@/components/ui/LoadingState"
import { cn } from "@/lib/utils"

export const ResponseViewerFeature: React.FC = () => {
  const { activeTabId, tabs } = useTabStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)
  const { showToast } = useToastStore()

  const [activeSubTab, setActiveSubTab] = useState<"body" | "headers">("body")
  const [formatMode, setFormatMode] = useState<"pretty" | "raw">("pretty")
  
  // Search state inside body
  const [searchTerm, setSearchTerm] = useState("")
  const [copiedBody, setCopiedBody] = useState(false)
  const [copiedHeaders, setCopiedHeaders] = useState(false)

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

  const handleCopyBody = () => {
    try {
      navigator.clipboard.writeText(response.body)
      setCopiedBody(true)
      showToast("Response body copied", "success")
      setTimeout(() => setCopiedBody(false), 2000)
    } catch {
      showToast("Failed to copy body", "error")
    }
  }

  const handleCopyHeaders = () => {
    try {
      const headersStr = Object.entries(response.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
      navigator.clipboard.writeText(headersStr)
      setCopiedHeaders(true)
      showToast("Response headers copied", "success")
      setTimeout(() => setCopiedHeaders(false), 2000)
    } catch {
      showToast("Failed to copy headers", "error")
    }
  }

  const handleDownload = () => {
    try {
      const blob = new Blob([response.body], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `response-${activeTab.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showToast("Downloaded response payload", "success")
    } catch {
      showToast("Failed to download payload", "error")
    }
  }

  const getStatusBadgeColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
    if (status >= 300 && status < 400) return "bg-blue-500/10 text-blue-400 border border-blue-500/20"
    if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-500 border border-amber-500/20"
    return "bg-rose-500/10 text-rose-500 border border-rose-500/20"
  }

  // Simple highlight calculator count
  const getSearchMatchCount = () => {
    if (!searchTerm.trim()) return null
    try {
      const regex = new RegExp(searchTerm.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "gi")
      const matches = response.body.match(regex)
      return matches ? matches.length : 0
    } catch {
      return 0
    }
  }

  const matchCount = getSearchMatchCount()

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-3 select-none gap-3 overflow-hidden">
      {/* Response metadata header */}
      <div className="flex items-center justify-between border-b border-border/20 pb-2 shrink-0">
        <span className="text-xs font-semibold text-foreground tracking-tight">Response Details</span>

        <div className="flex items-center gap-2">
          {/* Status */}
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono uppercase tracking-wide",
            getStatusBadgeColor(response.status)
          )}>
            Status: {response.status} {response.statusText}
          </span>

          {/* Duration */}
          <span className="text-[10px] font-bold bg-zinc-800 text-muted-foreground border border-border/30 px-2 py-0.5 rounded-full font-mono">
            Time: {response.duration} ms
          </span>

          {/* Size */}
          <span className="text-[10px] font-bold bg-zinc-800 text-muted-foreground border border-border/30 px-2 py-0.5 rounded-full font-mono">
            Size: {(response.size / 1024).toFixed(2)} KB
          </span>
        </div>
      </div>

      {/* Tabs / Tools Bar */}
      <div className="flex items-center justify-between border-b border-border/30 shrink-0">
        <div className="flex">
          {(["body", "headers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={cn(
                "px-4 py-2 text-xs font-semibold border-b-2 transition-all capitalize -mb-px",
                activeSubTab === tab
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-1">
          {activeSubTab === "body" && (
            <>
              {/* Internal Search */}
              <div className="relative flex items-center bg-zinc-900 border border-border/30 rounded-md px-2 h-7 w-44">
                <Search className="w-3.5 h-3.5 text-muted-foreground mr-1.5 shrink-0" />
                <input
                  type="text"
                  placeholder="Find in body..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-0 text-[10px] text-foreground focus:ring-0 focus:outline-none placeholder-muted-foreground"
                />
                {matchCount !== null && (
                  <span className="text-[9px] font-mono text-muted-foreground shrink-0 bg-white/5 px-1 rounded ml-1">
                    {matchCount}
                  </span>
                )}
              </div>

              {/* Format Toggle */}
              <div className="flex bg-zinc-900 border border-border/30 rounded-md p-0.5 text-[10px]">
                <button
                  onClick={() => setFormatMode("pretty")}
                  className={cn(
                    "px-2 py-0.5 rounded font-medium",
                    formatMode === "pretty" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Pretty
                </button>
                <button
                  onClick={() => setFormatMode("raw")}
                  className={cn(
                    "px-2 py-0.5 rounded font-medium",
                    formatMode === "raw" ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Raw
                </button>
              </div>

              {/* Copy Body */}
              <button
                onClick={handleCopyBody}
                className="p-1.5 rounded-md border border-border/30 bg-zinc-900 text-muted-foreground hover:text-foreground"
                title="Copy body payload"
              >
                {copiedBody ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </>
          )}

          {activeSubTab === "headers" && (
            <button
              onClick={handleCopyHeaders}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-semibold rounded border border-border/30 bg-zinc-900 text-muted-foreground hover:text-foreground h-7"
              title="Copy all headers"
            >
              {copiedHeaders ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy Headers</span>
            </button>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1.5 rounded-md border border-border/30 bg-zinc-900 text-muted-foreground hover:text-foreground h-7 flex items-center justify-center"
            title="Download payload"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Viewport content */}
      <div className="flex-1 overflow-auto bg-zinc-950/20 border border-border/20 rounded-lg p-2.5">
        {activeSubTab === "body" && (
          <div className="w-full h-full min-h-[140px]">
            {formatMode === "pretty" ? (
              <MonacoWrapper
                value={response.body}
                language="json"
                readOnly
              />
            ) : (
              <MonacoWrapper
                value={response.body}
                language="plaintext"
                readOnly
              />
            )}
          </div>
        )}

        {activeSubTab === "headers" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Response Headers</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-semibold">
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
export default ResponseViewerFeature
