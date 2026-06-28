import React, { useState } from "react"
import { Plus, Trash2, CheckCircle2, Circle, Edit2, Check, X } from "lucide-react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useToastStore } from "@/store/toastStore"
import { useTabStore } from "@/store/tabStore"
import { cn } from "@/lib/utils"

export const EnvironmentsFeature: React.FC = () => {
  const {
    environments,
    activeEnvironmentId,
    setActiveEnvironmentId,
    addEnvironment,
    updateEnvironment,
    deleteEnvironment,
  } = useWorkspaceStore()

  const { tabs, activeTabId, addTab, setActiveTabId } = useTabStore()
  const { showToast } = useToastStore()

  const [newEnvName, setNewEnvName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const handleAddEnv = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEnvName.trim()) return
    addEnvironment(newEnvName.trim())
    showToast(`Environment "${newEnvName.trim()}" created`, "success")
    setNewEnvName("")
    setIsCreating(false)
  }

  const handleStartRename = (id: string, name: string) => {
    setEditingEnvId(id)
    setRenameValue(name)
  }

  const handleSaveRename = (id: string) => {
    if (!renameValue.trim()) return
    const env = environments.find((e) => e.id === id)
    if (env) {
      updateEnvironment(id, renameValue.trim(), env.variables)
      showToast("Environment renamed", "success")
    }
    setEditingEnvId(null)
  }

  const handleOpenEnvironment = (envId: string, envName: string) => {
    const existing = tabs.find((t) => t.id === envId && t.type === "environment")
    if (existing) {
      setActiveTabId(existing.id)
    } else {
      addTab({
        id: envId,
        name: envName,
        type: "environment"
      })
    }
  }

  return (
    <div className="flex flex-col h-full bg-card border-r border-border select-none overflow-hidden w-full">
      {/* Environments list */}
      <div className="p-3 border-b border-border/40 flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Environments</span>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleAddEnv} className="flex gap-1.5 mt-1">
            <input
              type="text"
              autoFocus
              placeholder="Env name..."
              value={newEnvName}
              onChange={(e) => setNewEnvName(e.target.value)}
              className="flex-1 bg-background border border-border rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              className="px-2 bg-primary text-primary-foreground text-[11px] rounded hover:bg-primary/90 cursor-pointer"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {environments.map((env) => {
          const isGlobalActive = activeEnvironmentId === env.id
          const isTabActive = activeTabId === env.id
          const isRenaming = editingEnvId === env.id

          return (
            <div
              key={env.id}
              onClick={() => {
                if (!isRenaming) {
                  handleOpenEnvironment(env.id, env.name)
                }
              }}
              className={cn(
                "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all border text-xs relative",
                isTabActive
                  ? "bg-white/5 border-border/40 text-foreground"
                  : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isRenaming ? (
                <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    className="bg-background border border-primary/50 rounded px-1 py-0.5 text-xs text-foreground focus:outline-none flex-1"
                  />
                  <button onClick={() => handleSaveRename(env.id)} className="p-0.5 text-emerald-500 rounded hover:bg-white/5 cursor-pointer">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingEnvId(null)} className="p-0.5 text-rose-500 rounded hover:bg-white/5 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="font-medium truncate mr-2">{env.name}</span>
                  <div className="flex items-center gap-1 ml-auto shrink-0">
                    {env.id !== "no-env" && (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartRename(env.id, env.name) }}
                          className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-white/5 text-muted-foreground transition-opacity cursor-pointer"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteEnvironment(env.id)
                            showToast("Environment deleted", "warning")
                          }}
                          className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-white/5 text-muted-foreground transition-opacity cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveEnvironmentId(isGlobalActive ? "no-env" : env.id)
                      }}
                      className="p-1 rounded text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                      title={isGlobalActive ? "Active" : "Activate"}
                    >
                      {isGlobalActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary fill-primary/10" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default EnvironmentsFeature
