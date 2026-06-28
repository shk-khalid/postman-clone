import React, { useState, useEffect } from "react"
import { Send, Plus, Trash2, Key, Info, HelpCircle, Save } from "lucide-react"
import { useTabStore, HTTPMethod, Tab, RequestHeader, RequestParam } from "@/store/tabStore"
import { useHistoryStore } from "@/store/historyStore"
import { useToastStore } from "@/store/toastStore"
import { useCollectionStore } from "@/store/collectionStore"
import { MonacoWrapper } from "@/components/ui/MonacoWrapper"
import { resolveVariables, getUrlPreview } from "@/lib/variableResolver"
import { requestService } from "@/services/request/requestService"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { parseCurl } from "@/lib/curlParser"
import { cn } from "@/lib/utils"

export const RequestBuilderFeature: React.FC = () => {
  const { activeTabId, tabs, updateTab, addTab, closeTab } = useTabStore()
  const { addToHistory } = useHistoryStore()
  const { showToast } = useToastStore()
  const { collections, addRequestToCollection } = useCollectionStore()

  const activeTab = tabs.find((t) => t.id === activeTabId)

  const [activeSubTab, setActiveSubTab] = useState<"params" | "authorization" | "headers" | "body">("params")
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [resolvedUrl, setResolvedUrl] = useState("")

  // Save Modal/Dropdown trigger
  const [showSaveDropdown, setShowSaveDropdown] = useState(false)

  useEffect(() => {
    if (activeTab) {
      const { preview } = getUrlPreview(activeTab.url)
      setResolvedUrl(preview)
    }
  }, [activeTab?.url, activeTabId])

  // 1. Keyboard Shortcuts Hook integration
  useKeyboardShortcuts({
    onSend: () => {
      if (activeTab && !activeTab.loading) {
        handleSend()
      }
    },
    onSave: () => {
      if (activeTab) {
        setShowSaveDropdown(prev => !prev)
      }
    },
    onNewTab: () => {
      addTab()
    },
    onCloseTab: () => {
      if (activeTabId) {
        closeTab(activeTabId)
      }
    },
    onEscape: () => {
      setShowSaveDropdown(false)
    }
  })

  if (!activeTab) return null

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateTab(activeTab.id, { method: e.target.value as HTTPMethod })
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const trimmed = value.trim()
    
    // Check if it's a cURL command
    if (trimmed.toLowerCase().startsWith("curl ")) {
      const parsed = parseCurl(value)
      if (parsed) {
        updateTab(activeTab.id, {
          method: parsed.method,
          url: parsed.url,
          headers: parsed.headers,
          body: parsed.body,
          bodyType: parsed.bodyType,
          isDirty: true,
        })
        showToast("Imported cURL", "success")
        return
      }
    }
    
    // Check if it's a raw HTTP method + URL (e.g., "POST http://localhost:8000/api")
    const rawMatch = trimmed.match(/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+([^\s]+)$/i)
    if (rawMatch) {
      const method = rawMatch[1].toUpperCase() as HTTPMethod
      const url = rawMatch[2]
      updateTab(activeTab.id, {
        method,
        url,
        isDirty: true,
      })
      showToast("Imported request", "success")
      return
    }

    updateTab(activeTab.id, { url: value })
  }

  // Params updates
  const handleParamChange = (id: string, field: keyof RequestParam, val: any) => {
    const updated = activeTab.params.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    const last = updated[updated.length - 1]
    if (last && (last.key || last.value) && field !== "active") {
      updated.push({ id: crypto.randomUUID(), key: "", value: "", description: "", active: true })
    }
    updateTab(activeTab.id, { params: updated })
  }

  const handleParamDelete = (id: string) => {
    updateTab(activeTab.id, { params: activeTab.params.filter((p) => p.id !== id) })
  }

  // Headers updates
  const handleHeaderChange = (id: string, field: keyof RequestHeader, val: any) => {
    const updated = activeTab.headers.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    const last = updated[updated.length - 1]
    if (last && (last.key || last.value) && field !== "active") {
      updated.push({ id: crypto.randomUUID(), key: "", value: "", description: "", active: true })
    }
    updateTab(activeTab.id, { headers: updated })
  }

  const handleHeaderDelete = (id: string) => {
    updateTab(activeTab.id, { headers: activeTab.headers.filter((h) => h.id !== id) })
  }

  // Body changes
  const handleBodyChange = (body: string) => {
    updateTab(activeTab.id, { body })

    if (activeTab.bodyType === "json" && body.trim()) {
      try {
        JSON.parse(body)
        setJsonError(null)
      } catch (err: any) {
        setJsonError(err.message)
      }
    } else {
      setJsonError(null)
    }
  }

  // Save to Collection Action
  const handleSaveToCollection = (collectionId: string) => {
    addRequestToCollection(collectionId, {
      id: activeTab.id,
      name: activeTab.name === "New Request" ? `${activeTab.method} ${resolvedUrl.replace("https://", "").replace("http://", "").slice(0, 20)}` : activeTab.name,
      method: activeTab.method,
      url: activeTab.url,
      headers: activeTab.headers,
      params: activeTab.params,
      bodyType: activeTab.bodyType,
      body: activeTab.body,
      authType: activeTab.authType,
      bearerToken: activeTab.bearerToken,
      basicUsername: activeTab.basicUsername,
      basicPassword: activeTab.basicPassword,
    })
    updateTab(activeTab.id, { isDirty: false })
    setShowSaveDropdown(false)
    showToast("Request saved to collection", "success")
  }

  const handleSend = async () => {
    if (jsonError) {
      showToast("Cannot dispatch request with malformed JSON body", "error")
      return
    }

    updateTab(activeTab.id, { loading: true, response: null })
    showToast(`Sending ${activeTab.method} request...`, "info")

    try {
      // Execute request through requestService (validation + resolving)
      const res = await requestService.execute(activeTab)

      updateTab(activeTab.id, {
        loading: false,
        response: res,
        isDirty: false,
      })

      // Add to local history list
      addToHistory({
        method: activeTab.method,
        url: activeTab.url,
        statusCode: res.status,
        durationMs: res.duration,
        sizeBytes: res.size,
        requestData: {
          ...activeTab,
          response: res,
        },
      })
      showToast("Response resolved successfully", "success")
    } catch (err: any) {
      updateTab(activeTab.id, { loading: false })
      showToast(err.message || "Failed to execute request", "error")
    }
  }

  const methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"]
  const commonHeaders = [
    "Content-Type",
    "Authorization",
    "Accept",
    "User-Agent",
    "Cache-Control",
    "Connection",
    "Host",
  ]

  return (
    <div className="flex flex-col h-full bg-zinc-900/10 p-3 select-none gap-3 overflow-hidden">
      {/* Target Address Input */}
      <div className="flex flex-col gap-1 shrink-0">
        <div className="flex gap-2">
          <select
            disabled={activeTab.loading}
            value={activeTab.method}
            onChange={handleMethodChange}
            className="bg-zinc-900 border border-border/30 rounded-md px-3 text-xs font-bold text-primary focus:outline-none focus:border-primary/60 cursor-pointer h-9 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
              disabled={activeTab.loading}
              placeholder="Enter request URL (e.g. https://{{base_url}}/users)"
              value={activeTab.url}
              onChange={handleUrlChange}
              className="w-full bg-zinc-900 border border-border/30 rounded-md px-3 text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 transition-colors h-9 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {/* Save Button */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowSaveDropdown(prev => !prev)}
              disabled={activeTab.loading}
              className="flex items-center justify-center p-2.5 bg-zinc-900 border border-border/30 text-muted-foreground hover:text-foreground rounded-md transition-colors disabled:opacity-50 h-9"
              title="Save Request"
            >
              <Save className="w-4 h-4" />
            </button>

            {showSaveDropdown && (
              <div className="absolute right-0 mt-1.5 w-56 bg-zinc-950 border border-border/30 rounded-lg shadow-xl py-1 z-50 text-xs">
                <span className="block px-3 py-1.5 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Save to Collection</span>
                <div className="max-h-40 overflow-y-auto">
                  {collections.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => handleSaveToCollection(col.id)}
                      className="w-full text-left px-3 py-1.5 hover:bg-white/5 text-foreground truncate"
                    >
                      {col.name}
                    </button>
                  ))}
                  {collections.length === 0 && (
                    <span className="block px-3 py-1.5 text-muted-foreground">No collections created.</span>
                  )}
                </div>
              </div>
            )}
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

        {/* Resolved URL Preview */}
        {activeTab.url && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-border/20 rounded text-[10px] text-muted-foreground font-mono truncate leading-normal">
            <span className="font-bold text-primary">Preview:</span>
            <span>{resolvedUrl}</span>
          </div>
        )}
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-border/30 shrink-0">
        {(["params", "authorization", "headers", "body"] as const).map((tab) => (
          <button
            key={tab}
            disabled={activeTab.loading}
            onClick={() => setActiveSubTab(tab)}
            className={cn(
              "px-4 py-2 text-xs font-semibold border-b-2 transition-all capitalize -mb-px disabled:opacity-50",
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
      <div className={cn(
        "flex-1 overflow-auto bg-zinc-950/20 border border-border/20 rounded-lg p-2.5 transition-opacity duration-250",
        activeTab.loading ? "opacity-45 pointer-events-none" : "opacity-100"
      )}>
        {/* PARAMS TAB */}
        {activeSubTab === "params" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Query Parameters</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-semibold">
                    <th className="p-2 w-8 text-center">Active</th>
                    <th className="p-2 border-r border-border/30 w-1/4">Key</th>
                    <th className="p-2 border-r border-border/30 w-1/3">Value</th>
                    <th className="p-2">Description</th>
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
                          className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900 cursor-pointer"
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
                      <td className="p-1 border-r border-border/30">
                        <input
                          type="text"
                          placeholder="Parameter value..."
                          value={param.value}
                          onChange={(e) => handleParamChange(param.id, "value", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="Description..."
                          value={param.description || ""}
                          onChange={(e) => handleParamChange(param.id, "description", e.target.value)}
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

        {/* AUTHORIZATION TAB */}
        {activeSubTab === "authorization" && (
          <div className="space-y-4 max-w-lg p-1.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-foreground">Auth Type</label>
              <select
                value={activeTab.authType}
                onChange={(e) => updateTab(activeTab.id, { authType: e.target.value as any })}
                className="bg-zinc-900 border border-border/30 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
              >
                <option value="none">No Auth</option>
                <option value="bearer">Bearer Token</option>
                <option value="basic">Basic Auth</option>
              </select>
            </div>

            {activeTab.authType === "none" && (
              <div className="flex items-center gap-2 p-3 bg-white/5 border border-border/20 rounded-lg text-xs text-muted-foreground">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <span>No authorization header will be attached to the request.</span>
              </div>
            )}

            {activeTab.authType === "bearer" && (
              <div className="flex flex-col gap-2 border border-border/20 p-3 rounded-lg bg-zinc-900/40">
                <label className="text-[11px] font-semibold text-muted-foreground">Token</label>
                <input
                  type="text"
                  placeholder="Bearer token or {{token}}"
                  value={activeTab.bearerToken}
                  onChange={(e) => updateTab(activeTab.id, { bearerToken: e.target.value })}
                  className="bg-zinc-900 border border-border/30 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary/50"
                />
              </div>
            )}

            {activeTab.authType === "basic" && (
              <div className="grid grid-cols-2 gap-3 border border-border/20 p-3 rounded-lg bg-zinc-900/40">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Username</label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={activeTab.basicUsername}
                    onChange={(e) => updateTab(activeTab.id, { basicUsername: e.target.value })}
                    className="bg-zinc-900 border border-border/30 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-muted-foreground">Password</label>
                  <input
                    type="password"
                    placeholder="Password"
                    value={activeTab.basicPassword}
                    onChange={(e) => updateTab(activeTab.id, { basicPassword: e.target.value })}
                    className="bg-zinc-900 border border-border/30 rounded-md px-3 py-1.5 text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* HEADERS TAB */}
        {activeSubTab === "headers" && (
          <div className="space-y-2">
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider pl-1">Request Headers</span>
            <div className="border border-border/30 rounded-md overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-border/30 text-muted-foreground font-semibold">
                    <th className="p-2 w-8 text-center">Active</th>
                    <th className="p-2 border-r border-border/30 w-1/4">Key</th>
                    <th className="p-2 border-r border-border/30 w-1/3">Value</th>
                    <th className="p-2">Description</th>
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
                          className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900 cursor-pointer"
                        />
                      </td>
                      <td className="p-1 border-r border-border/30 relative">
                        <input
                          type="text"
                          list="header-suggestions"
                          placeholder="Header key..."
                          value={header.key}
                          onChange={(e) => handleHeaderChange(header.id, "key", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                        <datalist id="header-suggestions">
                          {commonHeaders.map((h) => (
                            <option key={h} value={h} />
                          ))}
                        </datalist>
                      </td>
                      <td className="p-1 border-r border-border/30">
                        <input
                          type="text"
                          placeholder="Header value..."
                          value={header.value}
                          onChange={(e) => handleHeaderChange(header.id, "value", e.target.value)}
                          className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          placeholder="Description..."
                          value={header.description || ""}
                          onChange={(e) => handleHeaderChange(header.id, "description", e.target.value)}
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

        {/* BODY TAB */}
        {activeSubTab === "body" && (
          <div className="flex flex-col h-full gap-2 min-h-[160px]">
            <div className="flex items-center gap-4 text-xs shrink-0">
              <span className="text-muted-foreground font-semibold">Body Type:</span>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                <input
                  type="radio"
                  checked={activeTab.bodyType === "none"}
                  onChange={() => updateTab(activeTab.id, { bodyType: "none" })}
                  className="text-primary w-3 h-3 bg-zinc-900 border-border/50"
                />
                None
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                <input
                  type="radio"
                  checked={activeTab.bodyType === "json"}
                  onChange={() => updateTab(activeTab.id, { bodyType: "json" })}
                  className="text-primary w-3 h-3 bg-zinc-900 border-border/50"
                />
                JSON (Application/JSON)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-foreground font-medium">
                <input
                  type="radio"
                  checked={activeTab.bodyType === "raw"}
                  onChange={() => updateTab(activeTab.id, { bodyType: "raw" })}
                  className="text-primary w-3 h-3 bg-zinc-900 border-border/50"
                />
                Text (Plaintext)
              </label>
            </div>

            {jsonError && (
              <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-semibold bg-rose-500/5 border border-rose-500/10 px-2 py-1 rounded">
                <span>Invalid JSON: {jsonError}</span>
              </div>
            )}

            {activeTab.bodyType === "none" && (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <span className="text-xs text-muted-foreground font-medium">This request has no body payload.</span>
              </div>
            )}

            {activeTab.bodyType === "json" && (
              <div className="flex-1 min-h-[120px]">
                <MonacoWrapper
                  value={activeTab.body}
                  onChange={handleBodyChange}
                  language="json"
                />
              </div>
            )}

            {activeTab.bodyType === "raw" && (
              <div className="flex-1 min-h-[120px]">
                <MonacoWrapper
                  value={activeTab.body}
                  onChange={handleBodyChange}
                  language="plaintext"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
export default RequestBuilderFeature
