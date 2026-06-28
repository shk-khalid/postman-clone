import React from "react"
import { ShieldCheck, Trash2 } from "lucide-react"
import { useWorkspaceStore, EnvVar } from "@/store/workspaceStore"
import { useToastStore } from "@/store/toastStore"

interface EnvironmentEditorProps {
  envId: string
}

export const EnvironmentEditor: React.FC<EnvironmentEditorProps> = ({ envId }) => {
  const { environments, updateEnvironment } = useWorkspaceStore()
  const { showToast } = useToastStore()

  const activeEnv = environments.find((e) => e.id === envId)

  if (!activeEnv) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-background">
        <span className="text-sm text-muted-foreground font-semibold">Environment not found</span>
      </div>
    )
  }

  const handleVarChange = (varId: string, field: keyof EnvVar, val: any) => {
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
    const updatedVars = activeEnv.variables.filter((v) => v.id !== varId)
    updateEnvironment(activeEnv.id, activeEnv.name, updatedVars)
    showToast("Variable removed", "info")
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background p-5 gap-4">
      <div className="flex items-center justify-between border-b border-border/20 pb-3.5 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            {activeEnv.name} variables
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Use variables in request fields using double curly brackets: <code>{"{{key}}"}</code></p>
        </div>
      </div>

      {activeEnv.id === "no-env" ? (
        <div className="flex-1 flex items-center justify-center text-center p-8 bg-card border border-border/25 rounded-lg">
          <span className="text-xs text-muted-foreground">Global defaults environment has no editable variables.</span>
        </div>
      ) : (
        <div className="flex-1 overflow-auto border border-border rounded-lg bg-card">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border text-muted-foreground font-semibold">
                <th className="p-3 w-16 text-center">Active</th>
                <th className="p-3 border-r border-border w-1/3">Variable Key</th>
                <th className="p-3 border-r border-border">Value</th>
                <th className="p-3 w-16 text-center"></th>
              </tr>
            </thead>
            <tbody>
              {activeEnv.variables.map((item) => (
                <tr key={item.id} className="border-b border-border/20 hover:bg-muted/10 transition-colors">
                  <td className="p-2 text-center">
                    <input
                      type="checkbox"
                      checked={item.enabled}
                      onChange={(e) => handleVarChange(item.id, "enabled", e.target.checked)}
                      className="rounded border border-border text-primary w-3.5 h-3.5 bg-background cursor-pointer"
                    />
                  </td>
                  <td className="p-2 border-r border-border">
                    <input
                      type="text"
                      placeholder="Add key..."
                      value={item.key}
                      onChange={(e) => handleVarChange(item.id, "key", e.target.value)}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground font-mono"
                    />
                  </td>
                  <td className="p-2 border-r border-border">
                    <input
                      type="text"
                      placeholder="Add value..."
                      value={item.value}
                      onChange={(e) => handleVarChange(item.id, "value", e.target.value)}
                      className="w-full bg-transparent border-0 focus:ring-0 focus:outline-none p-1 text-foreground font-mono"
                    />
                  </td>
                  <td className="p-2 text-center">
                    {(item.key || item.value) && (
                      <button
                        onClick={() => handleDeleteVar(item.id)}
                        className="text-muted-foreground hover:text-rose-400 p-1 rounded transition-colors cursor-pointer"
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
      )}
    </div>
  )
}
export default EnvironmentEditor
