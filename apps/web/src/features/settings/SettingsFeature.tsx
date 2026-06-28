import React from "react"
import { Settings, Moon, Sun, Monitor, HardDrive } from "lucide-react"
import { useSettingsStore } from "@/store/settingsStore"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useToastStore } from "@/store/toastStore"
import { cn } from "@/lib/utils"

export const SettingsFeature: React.FC = () => {
  const { theme, fontSize, wordWrap, updateSettings } = useSettingsStore()
  const { setTheme } = useWorkspaceStore()
  const { showToast } = useToastStore()

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    updateSettings({ theme: newTheme })
    setTheme(newTheme)
    showToast(`Theme updated to ${newTheme}`, "success")
  }

  const handleFontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value, 10)
    updateSettings({ fontSize: size })
  }

  const handleWordWrapChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const wrap = e.target.checked ? "on" : "off"
    updateSettings({ wordWrap: wrap })
    showToast(`Editor word wrap set to ${wrap}`, "info")
  }

  const themeOptions = [
    { value: "dark", label: "Dark", icon: Moon },
    { value: "light", label: "Light", icon: Sun },
    { value: "system", label: "System", icon: Monitor },
  ] as const

  return (
    <div className="flex flex-col h-full bg-card border-r border-border p-4 select-none space-y-4">
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Settings className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Settings</span>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-1">
        {/* Theme Settings Selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Theme Mode</label>
          <div className="flex bg-muted p-0.5 rounded-lg border border-border">
            {themeOptions.map((opt) => {
              const Icon = opt.icon
              const isSelected = theme === opt.value

              return (
                <button
                  key={opt.value}
                  onClick={() => handleThemeChange(opt.value)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs transition-all cursor-pointer",
                    isSelected
                      ? "bg-background text-foreground border border-border/40 font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
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
              <span className="text-[11px] font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="11"
              max="20"
              value={fontSize}
              onChange={handleFontChange}
              className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Word Wrap</span>
            <input
              type="checkbox"
              checked={wordWrap === "on"}
              onChange={handleWordWrapChange}
              className="rounded border border-border text-primary w-3.5 h-3.5 bg-background cursor-pointer"
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
              className="w-full bg-muted/30 border border-border rounded-md px-2 py-1.5 text-xs text-muted-foreground/60 cursor-not-allowed opacity-50"
            />
          </div>
        </div>

        {/* Local Storage details */}
        <div className="pt-4 border-t border-border/20 flex items-start gap-2.5 text-[10px] text-muted-foreground leading-relaxed bg-muted/40 p-2 rounded-lg">
          <HardDrive className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <span>All configurations are persistent and saved in active workspace. API traffic runs securely.</span>
        </div>
      </div>
    </div>
  )
}
export default SettingsFeature
