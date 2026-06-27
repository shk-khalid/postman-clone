import React, { useState } from "react"
import { ShieldCheck, Plus, Trash2, CheckCircle2, Circle, Edit2, Check, X } from "lucide-react"
import { useWorkspaceStore, Environment, EnvVar } from "@/store/workspaceStore"
import { useToastStore } from "@/store/toastStore"
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

  const { showToast } = useToastStore()

  const [selectedEnvId, setSelectedEnvId] = useState<string>(activeEnvironmentId || "no-env")
  const [newEnvName, setNewEnvName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingEnvId, setEditingEnvId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")

  const activeEnv = environments.find((e) => e.id === selectedEnvId)

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

  const handleVarChange = (varId: string, field: keyof EnvVar, val: any) => {
    if (!activeEnv) return
    const updatedVars = activeEnv.variables.map((v) =>
      v.id === varId ? { ...v, [field]: val } : v
    )

    // Add trailing row automatically if needed
    const lastVar = updatedVars[updatedVars.length - 1]
    if (lastVar && (lastVar.key || lastVar.value) && field !== "enabled") {
      updatedVars.push({ id: crypto.randomUUID(), key: "", value: "", enabled: true })
    }

    updateEnvironment(activeEnv.id, activeEnv.name, updatedVars)
  }

  const handleDeleteVar = (varId: string) => {
    if (!activeEnv) return
    const updatedVars = activeEnv.variables.filter((v) => v.id !== varId)
    updateEnvironment(activeEnv.id, activeEnv.name, updatedVars)
    showToast("Variable removed", "info")
  }

  return (
    <div className="flex h-full bg-zinc-950/60 border-r border-border/40 select-none overflow-hidden">
      {/* Environments list */}
      <div className="w-1/2 border-r border-border/30 flex flex-col h-full shrink-0 bg-zinc-950/40">
        <div className="p-3 border-b border-border/40 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Environments</span>
            <button
              onClick={() => setIsCreating(true)}
              className="p-1 rounded-md text-muted-foreground hover:bg-white/5 hover:text-foreground"
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
                className="flex-1 bg-zinc-900 border border-border/30 rounded-md px-2 py-1 text-xs text-foreground focus:outline-none focus:border-primary/50"
              />
              <button
                type="submit"
                className="px-2 bg-primary text-primary-foreground text-[11px] rounded hover:bg-primary/90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {environments.map((env) => {
            const isGlobalActive = activeEnvironmentId === env.id
            const isLocalSelect = selectedEnvId === env.id
            const isRenaming = editingEnvId === env.id

            return (
              <div
                key={env.id}
                onClick={() => !isRenaming && setSelectedEnvId(env.id)}
                className={cn(
                  "group flex items-center justify-between p-2 rounded-md cursor-pointer transition-all border text-xs relative",
                  isLocalSelect
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
                      className="bg-zinc-900 border border-primary/50 rounded px-1 py-0.5 text-xs text-foreground focus:outline-none flex-1"
                    />
                    <button onClick={() => handleSaveRename(env.id)} className="p-0.5 text-emerald-500 rounded hover:bg-white/5">
                      <Check className="w-3 h-3" />
                    </button>
                    <button onClick={() => setEditingEnvId(null)} className="p-0.5 text-rose-500 rounded hover:bg-white/5">
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
                            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-white/5 text-muted-foreground transition-opacity"
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
                            className="p-0.5 rounded opacity-0 group-hover:opacity-100 hover:text-rose-400 hover:bg-white/5 text-muted-foreground transition-opacity"
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
                        className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"
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

      {/* Selected env variables view */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950/40">
        {activeEnv ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-3 gap-3">
            <div>
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                {activeEnv.name} variables
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Use variables via double curly brackets: {"{{key}}"}</p>
            </div>

            {activeEnv.id === "no-env" ? (
              <div className="flex-1 flex items-center justify-center text-center p-4">
                <span className="text-[11px] text-muted-foreground">Global defaults environment has no variables.</span>
              </div>
            ) : (
              <div className="flex-1 overflow-auto border border-border/30 rounded-md">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-border/30 text-muted-foreground">
                      <th className="p-2 w-8 text-center">Active</th>
                      <th className="p-2 border-r border-border/30">Variable Key</th>
                      <th className="p-2">Value</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeEnv.variables.map((item) => (
                      <tr key={item.id} className="border-b border-border/20 hover:bg-white/[0.02]">
                        <td className="p-1 text-center">
                          <input
                            type="checkbox"
                            checked={item.enabled}
                            onChange={(e) => handleVarChange(item.id, "enabled", e.target.checked)}
                            className="rounded border-border/50 text-primary w-3 h-3 bg-zinc-900"
                          />
                        </td>
                        <td className="p-1 border-r border-border/30">
                          <input
                            type="text"
                            placeholder="Add key..."
                            value={item.key}
                            onChange={(e) => handleVarChange(item.id, "key", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            type="text"
                            placeholder="Add value..."
                            value={item.value}
                            onChange={(e) => handleVarChange(item.id, "value", e.target.value)}
                            className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground"
                          />
                        </td>
                        <td className="p-1 text-center">
                          {(item.key || item.value) && (
                            <button
                              onClick={() => handleDeleteVar(item.id)}
                              className="text-muted-foreground hover:text-rose-400 p-0.5 rounded"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-4">
            <span className="text-xs text-muted-foreground">Select an environment to view variables.</span>
          </div>
        )}
      </div>
    </div>
  )
}
export default EnvironmentsFeature
