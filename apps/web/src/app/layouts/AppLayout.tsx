import React, { useEffect } from "react"
import { Folder, Shield, History, Settings, Sparkles, LogOut, Moon, Sun, Monitor, Plus } from "lucide-react"
import { useWorkspaceStore, SidebarFeature } from "@/store/workspaceStore"
import { useTabStore } from "@/store/tabStore"
import { CollectionsFeature } from "@/features/collections/CollectionsFeature"
import { EnvironmentsFeature } from "@/features/environments/EnvironmentsFeature"
import { HistoryFeature } from "@/features/history/HistoryFeature"
import { SettingsFeature } from "@/features/settings/SettingsFeature"
import { RequestBuilderFeature } from "@/features/request-builder/RequestBuilderFeature"
import { ResponseViewerFeature } from "@/features/response-viewer/ResponseViewerFeature"
import { TabsBar } from "./TabsBar"
import { SplitPane } from "@/components/ui/SplitPane"
import { EmptyState } from "@/components/ui/EmptyState"
import { cn } from "@/lib/utils"

export const AppLayout: React.FC = () => {
  const { activeFeature, setActiveFeature, environments, activeEnvironmentId, setActiveEnvironmentId, theme } = useWorkspaceStore()
  const { tabs, activeTabId, addTab } = useTabStore()

  // Apply default theme class on initial mount
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  const menuItems = [
    { id: "collections", label: "Collections", icon: Folder },
    { id: "environments", label: "Environments", icon: Shield },
    { id: "history", label: "History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  const renderSidebarContent = () => {
    switch (activeFeature) {
      case "collections":
        return <CollectionsFeature />
      case "environments":
        return <EnvironmentsFeature />
      case "history":
        return <HistoryFeature />
      case "settings":
        return <SettingsFeature />
      default:
        return <CollectionsFeature />
    }
  }

  // Find active env name
  const currentEnv = environments.find((env) => env.id === activeEnvironmentId)

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-foreground overflow-hidden font-sans antialiased">
      {/* Icon Sidebar */}
      <div className="w-14 bg-zinc-950 border-r border-border/30 flex flex-col items-center py-4 justify-between shrink-0 select-none">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-primary/10" />
          </div>

          {/* Navigation Items */}
          <nav className="flex flex-col gap-2.5 w-full px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeFeature === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveFeature(item.id)}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all group",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  
                  {/* Tooltip */}
                  <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all origin-left bg-zinc-900 border border-border/30 text-[10px] text-foreground font-semibold px-2 py-1 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="text-[10px] text-muted-foreground/35 font-mono select-none font-bold">
          v1.0
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Row */}
        <header className="h-12 bg-zinc-950/45 border-b border-border/40 flex items-center justify-between px-4 select-none shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span>REST Client</span>
            </h1>
            <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full font-semibold">
              Workspace Default
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Environment Dropdown Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-border/30 rounded-md px-2.5 py-1 text-xs">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <select
                value={activeEnvironmentId || "no-env"}
                onChange={(e) => setActiveEnvironmentId(e.target.value)}
                className="bg-transparent border-none text-[11px] font-medium text-foreground focus:outline-none cursor-pointer pr-1"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id} className="bg-zinc-950 text-foreground font-medium">
                    {env.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Dynamic Sidebar and Resizable Editor Panel split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Side Drawer details pane */}
          <div className="w-72 shrink-0 h-full overflow-hidden flex flex-col">
            {renderSidebarContent()}
          </div>

          {/* Main workspace section */}
          <div className="flex-1 h-full flex flex-col overflow-hidden bg-zinc-900/10">
            <TabsBar />

            <div className="flex-1 overflow-hidden">
              {tabs.length > 0 && activeTabId ? (
                <SplitPane
                  direction="vertical"
                  minSize={120}
                  defaultSize={260}
                  firstPane={<RequestBuilderFeature />}
                  secondPane={<ResponseViewerFeature />}
                  className="bg-zinc-950/20"
                />
              ) : (
                <div className="h-full flex items-center justify-center p-8">
                  <EmptyState
                    icon={Sparkles}
                    title="Welcome to REST API Client"
                    description="Create a new request tab, click an endpoint on your collection tree, or look through history to begin inspection."
                    action={
                      <button
                        onClick={() => addTab()}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-md hover:bg-primary/95 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Create New Tab
                      </button>
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default AppLayout
