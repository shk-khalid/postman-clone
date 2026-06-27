import React from "react"
import { Settings, Moon, Sun, Monitor, HelpCircle, HardDrive } from "lucide-react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { cn } from "@/lib/utils"

export const SettingsFeature: React.FC = () => {
  const { theme, setTheme } = useWorkspaceStore()

  const themeOptions = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <div className="flex flex-col h-full bg-zinc-950/60 border-r border-border/40 p-4 select-none space-y-4">
      <div className="flex items-center gap-2 border-b border-border/40 pb-3">
        <Settings className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {/* Theme Settings Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">Theme Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = theme === opt.value

              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-lg border text-xs transition-all",
                    isSelected
                      ? "bg-primary/5 border-primary text-foreground"
                      : "bg-zinc-900/60 border-border/30 text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Editor Preferences */}
        <div className="space-y-3 pt-3 border-t border-border/20">
          <h4 className="text-xs font-semibold text-foreground">Editor Preferences</h4>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-muted-foreground">Editor Font Size</label>
              <span className="text-[11px] font-mono bg-white/5 px-1.5 py-0.5 rounded text-foreground">13px</span>
            </div>
            <input
              type="range"
              min="10"
              max="20"
              defaultValue="13"
              disabled
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-not-allowed opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Word Wrap</span>
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Network Configurations */}
        <div className="space-y-3 pt-3 border-t border-border/20">
          <h4 className="text-xs font-semibold text-foreground">Network & Request</h4>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted-foreground">Request Timeout (ms)</label>
            <input
              type="number"
              defaultValue="30000"
              disabled
              className="w-full bg-zinc-900 border border-border/30 rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 cursor-not-allowed opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Follow Redirects</span>
            <input
              type="checkbox"
              defaultChecked
              disabled
              className="rounded border-border/50 text-primary w-3.5 h-3.5 bg-zinc-900 opacity-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Local Storage details */}
        <div className="pt-4 border-t border-border/20 flex items-start gap-2.5 text-[10px] text-muted-foreground/60 leading-relaxed bg-white/5 p-2 rounded-lg">
          <HardDrive className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>All configurations are persistent and saved in active workspace. API traffic runs securely.</span>
        </div>
      </div>
    </div>
  )
}
