import React, { useState } from "react"
import { Send, Plus, Trash2, Code } from "lucide-react"
import { useTabStore, HTTPMethod, Tab } from "@/store/tabStore"
import { MonacoWrapper } from "@/components/ui/MonacoWrapper"
import { cn } from "@/lib/utils"

export const RequestBuilderFeature: React.FC = () => {
  const { activeTabId, tabs, updateTab } = useTabStore()
  const activeTab = tabs.find((t) => t.id === activeTabId)

  const [activeSubTab, setActiveSubTab] = useState<"params" | "headers" | "body">("params")

  if (!activeTab) return null

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTab(activeTab.id, { method: e.target.value as HTTPMethod })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTab(activeTab.id, { url: e.target.value })
  }

  // Params updates
  const handleParamChange = (id: string, field: "key" | "value" | "active", val: any) => {
    const updated = activeTab.params.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    const last = updated[updated.length - 1]
    if (last && (last.key || last.value) && field !== "active") {
      updated.push({ id: crypto.randomUUID(), key: "", value: "", active: true })
    }
    updateTab(activeTab.id, { params: updated })
  }

  const handleParamDelete = (id: string) => {
    updateTab(activeTab.id, { params: activeTab.params.filter((p) => p.id !== id) })
  }

  // Headers updates
  const handleHeaderChange = (id: string, field: "key" | "value" | "active", val: any) => {
    const updated = activeTab.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    const last = updated[updated.length - 1]
    if (last && (last.key || last.value) && field !== "active") {
      updated.push({ id: crypto.randomUUID(), key: "", value: "", active: true })
    }
    updateTab(activeTab.id, { headers: updated })
  }

  const handleHeaderDelete = (id: string) => {
    updateTab(activeTab.id, { headers: activeTab.headers.filter((h) => h.id !== id) })
  }

  // Body changes
  const handleBodyChange = (body: string) => {
    updateTab(activeTab.id, { body })
  }

  const handleSend = () => {
    updateTab(activeTab.id, { loading: true, response: null })

    // Simulate standard HTTP server responding back
    setTimeout(() => {
      let responseBody = {
        message: "Mock API response payload loaded successfully",
        request: {
          url: activeTab.url || "https://api.example.com/v1",
          method: activeTab.method,
          headers: activeTab.headers.filter(h => h.key && h.active).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
          params: activeTab.params.filter(p => p.key && p.active).reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
        },
        serverTime: new Date().toISOString(),
        origin: "127.0.0.1",
        status: "success",
      }

      if (activeTab.body && activeTab.bodyType === "json") {
        try {
          Object.assign(responseBody, { payload: JSON.parse(activeTab.body) })
        } catch {
          Object.assign(responseBody, { payloadRaw: activeTab.body, error: "Invalid JSON payload" })
        }
      }

      updateTab(activeTab.id, {
        loading: false,
        response: {
          status: 200,
          statusText: "OK",
          headers: {
            "content-type": "application/json; charset=utf-8",
            "x-powered-by": "Express",
            "cache-control": "no-cache",
          },
          body: JSON.stringify(responseBody, null, 2),
          timeMs: Math.floor(Math.random() * 280) + 40,
          sizeBytes: JSON.stringify(responseBody).length,
        },
      })
    }, 1000)
  }

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-3 select-none gap-3 overflow-hidden">
      {/* Target Address Input */}
      <div className="flex gap-2">
        <select
          value={activeTab.method}
          onChange={handleMethodChange}
          className="bg-zinc-900 border border-border/30 rounded-md px-3 text-xs font-bold text-primary focus:outline-none focus:border-primary/60 cursor-pointer h-9 shrink-0"
        >
          {methods.map((m) => (
            <option key={m} value={m} className="bg-zinc-950 text-foreground font-semibold">
              {m}
            </option>
          ))}
        </select>

        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Enter request URL (e.g. https://api.example.com/v1/auth/me)"
            value={activeTab.url}
            onChange={handleUrlChange}
            className="w-full bg-zinc-900 border border-border/30 rounded-md px-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors h-9"
          />
        </div>

        <button
          onClick={handleSend}
          disabled={activeTab.loading}
          className="flex items-center gap-1.5 px-4 h-9 bg-primary text-primary-foreground font-semibold text-xs rounded-md hover:bg-primary/95 transition-colors disabled:opacity-50"
        >
          {activeTab.loading ? (
            <div className="w-3.5 h-3.5 border-2 border-primary-foreground/35 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          <span>Send</span>
        </button>
      </div>

      {/* Tabs list (Params, Headers, Body) */}
      <div className="flex border-b border-border/30">
        {(["params", "headers", "body"] as const).map((tab) => (
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

      {/* Tab Panels */}
      <div className="flex-1 overflow-auto bg-zinc-950/20 border border-border/20 rounded-lg p-2.5">
        {activeSubTab === "params" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Query Parameters</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-medium">
                    <th className="p-2 w-8 text-center">Active</th>
                    <th className="p-2 border-r border-border/30 w-1/3">Key</th>
                    <th className="p-2">Value</th>
                    <th className="p-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab.params.map((param) => (
                    <tr key={param.id} className="border-b border-border/20 hover:bg-white/[0.02]">
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={param.active}
                          onChange={(e) => handleParamChange(param.id, "active", e.target.checked)}
                          className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900"
                        />
                      </td>
                      <td className="p-1 border-r border-border/30">
                        <input
                          type="text"
                          placeholder="Parameter key..."
                          value={param.key}
                          onChange={(e) => handleParamChange(param.id, "key", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="Parameter value..."
                          value={param.value}
                          onChange={(e) => handleParamChange(param.id, "value", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1 text-center">
                        {(param.key || param.value) && (
                          <button
                            onClick={() => handleParamDelete(param.id)}
                            className="text-muted-foreground hover:text-rose-400 p-0.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === "headers" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Request Headers</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-medium">
                    <th className="p-2 w-8 text-center">Active</th>
                    <th className="p-2 border-r border-border/30 w-1/3">Key</th>
                    <th className="p-2">Value</th>
                    <th className="p-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab.headers.map((header) => (
                    <tr key={header.id} className="border-b border-border/20 hover:bg-white/[0.02]">
                      <td className="p-1 text-center">
                        <input
                          type="checkbox"
                          checked={header.active}
                          onChange={(e) => handleHeaderChange(header.id, "active", e.target.checked)}
                          className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900"
                        />
                      </td>
                      <td className="p-1 border-r border-border/30">
                        <input
                          type="text"
                          placeholder="Header key..."
                          value={header.key}
                          onChange={(e) => handleHeaderChange(header.id, "key", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="Header value..."
                          value={header.value}
                          onChange={(e) => handleHeaderChange(header.id, "value", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1 text-center">
                        {(header.key || header.value) && (
                          <button
                            onClick={() => handleHeaderDelete(header.id)}
                            className="text-muted-foreground hover:text-rose-400 p-0.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === "body" && (
          <div className="flex flex-col h-full gap-2 min-h-[160px]">
            <div className="flex items-center gap-4 text-xs">
              <span className="text-muted-foreground font-semibold">Body Type:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                <input
                  type="radio"
                  checked={activeTab.bodyType === "none"}
                  onChange={() => updateTab(activeTab.id, { bodyType: "none" })}
                  className="text-primary w-3 h-3 focus:ring-primary/20 bg-zinc-900 border-border/50"
                />
                None
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                <input
                  type="radio"
                  checked={activeTab.bodyType === "json"}
                  onChange={() => updateTab(activeTab.id, { bodyType: "json" })}
                  className="text-primary w-3 h-3 focus:ring-primary/20 bg-zinc-900 border-border/50"
                />
                JSON (Application/JSON)
              </label>
            </div>

            {activeTab.bodyType === "none" ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <span className="text-xs text-muted-foreground font-medium">This request has no body payload.</span>
              </div>
            ) : (
              <div className="flex-1 min-h-[120px]">
                <MonacoWrapper
                  value={activeTab.body}
                  onChange={handleBodyChange}
                  language="json"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
