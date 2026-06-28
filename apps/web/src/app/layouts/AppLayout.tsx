import React, { useEffect, useRef, useState } from "react"
import { Folder, Shield, History, Settings, Sparkles, Plus, ChevronLeft, ChevronRight, Users, Server, BookOpen, Activity } from "lucide-react"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { useTabStore } from "@/store/tabStore"
import { useSettingsStore } from "@/store/settingsStore"
import { useCollectionStore } from "@/store/collectionStore"
import { useHistoryStore } from "@/store/historyStore"
import { CollectionsFeature } from "@/features/collections/CollectionsFeature"
import { EnvironmentsFeature } from "@/features/environments/EnvironmentsFeature"
import { EnvironmentEditor } from "@/features/environments/EnvironmentEditor"
import { HistoryFeature } from "@/features/history/HistoryFeature"
import { SettingsFeature } from "@/features/settings/SettingsFeature"
import { RequestBuilderFeature } from "@/features/request-builder/RequestBuilderFeature"
import { ResponseViewerFeature } from "@/features/response-viewer/ResponseViewerFeature"
import { TabsBar } from "./TabsBar"
import { SplitPane } from "@/components/ui/SplitPane"
import { EmptyState } from "@/components/ui/EmptyState"
import { ToastContainer } from "@/components/ui/ToastContainer"
import { cn } from "@/lib/utils"

export const AppLayout: React.FC = () => {
  const { activeFeature, setActiveFeature, environments, activeEnvironmentId, setActiveEnvironmentId, theme } = useWorkspaceStore()
  const { tabs, activeTabId, addTab, setActiveTabId } = useTabStore()
  const { fetchCollections } = useCollectionStore()
  const { fetchEnvironments } = useWorkspaceStore()
  const { fetchHistory } = useHistoryStore()
  const { fetchSettings } = useSettingsStore()

  // Settings store parameters
  const { sidebarWidth, sidebarCollapsed, updateSettings } = useSettingsStore()
  const isResizingSidebar = useRef(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)

  // Fetch initial workspace data from API backend on mount
  useEffect(() => {
    fetchCollections()
    fetchEnvironments()
    fetchHistory()
    fetchSettings()
  }, [])

  // Global hotkeys (Alt + [1-9] for switching tabs)
  useEffect(() => {
    const handleGlobalShortcuts = (e: KeyboardEvent) => {
      if (e.altKey && e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key, 10) - 1
        if (index >= 0 && index < tabs.length) {
          e.preventDefault()
          setActiveTabId(tabs[index].id)
        }
      }
    }
    window.addEventListener("keydown", handleGlobalShortcuts)
    return () => window.removeEventListener("keydown", handleGlobalShortcuts)
  }, [tabs, setActiveTabId])

  const menuItems = [
    { id: "collections", label: "Collections", icon: Folder },
    { id: "environments", label: "Environments", icon: Shield },
    { id: "history", label: "History", icon: History },
    { id: "workspaces", label: "Team Workspaces", icon: Users },
    { id: "mocks", label: "Mock Servers", icon: Server },
    { id: "docs", label: "API Documentation", icon: BookOpen },
    { id: "monitors", label: "Monitors", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const

  // Apply visual theme classes
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

  // Mouse resizing handles for sidebar panel
  const handleSidebarMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingSidebar.current = true
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingSidebar.current) return
      // Calculate width from left of viewport minus logo/feature icon bar (56px)
      const newWidth = e.clientX - 56
      if (newWidth >= 200 && newWidth <= 450) {
        updateSettings({ sidebarWidth: newWidth })
      }
    }

    const handleMouseUp = () => {
      if (isResizingSidebar.current) {
        isResizingSidebar.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [updateSettings])

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
      case "workspaces":
        return (
          <div className="flex flex-col h-full bg-card border-r border-border p-5 select-none space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspaces</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Sharing & Collaboration</h4>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                Create shared workspaces, collaborate in real-time, and manage organization team permissions.
              </p>
              <span className="mt-4 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-full uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        )
      case "mocks":
        return (
          <div className="flex flex-col h-full bg-card border-r border-border p-5 select-none space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Server className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mock Servers</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Server className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Mock Endpoints</h4>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                Simulate API backend endpoints, returns static payloads, and test mock responses locally.
              </p>
              <span className="mt-4 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-full uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        )
      case "docs":
        return (
          <div className="flex flex-col h-full bg-card border-r border-border p-5 select-none space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <BookOpen className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API Docs</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Documentation Generator</h4>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                Instantly compile HTML reference documents and schema details from your collections automatically.
              </p>
              <span className="mt-4 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-full uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        )
      case "monitors":
        return (
          <div className="flex flex-col h-full bg-card border-r border-border p-5 select-none space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monitors</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <Activity className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Scheduled Runs</h4>
              <p className="text-[10px] text-muted-foreground mt-1 max-w-[180px]">
                Run automated testing checks, monitor backend uptime, and trigger webhook reports on regular schedules.
              </p>
              <span className="mt-4 px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-semibold rounded-full uppercase tracking-wider">
                Coming Soon
              </span>
            </div>
          </div>
        )
      default:
        return <CollectionsFeature />
    }
  }

  const toggleCollapse = () => {
    updateSettings({ sidebarCollapsed: !sidebarCollapsed })
  }

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden font-sans antialiased">
      {/* 1. Feature Icon Switcher Sidebar */}
      <div className="w-14 bg-card border-r border-border flex flex-col items-center py-4 justify-between shrink-0 select-none z-20">
        <div className="flex flex-col items-center gap-6 w-full">
          {/* Logo */}
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-primary/10" />
          </div>

          {/* Navigation icons */}
          <nav className="flex flex-col gap-2.5 w-full px-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = activeFeature === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveFeature(item.id)
                    if (sidebarCollapsed) {
                      updateSettings({ sidebarCollapsed: false })
                    }
                  }}
                  className={cn(
                    "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all group focus:outline-none focus:ring-1 focus:ring-primary/45",
                    isActive && !sidebarCollapsed
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                  <span className="absolute left-14 scale-0 group-hover:scale-100 transition-all origin-left bg-card border border-border text-[10px] text-foreground font-semibold px-2 py-1 rounded shadow-lg pointer-events-none z-50 whitespace-nowrap">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Collapse & User Account Toggle */}
        <div className="flex flex-col items-center gap-4 w-full relative">
          {/* User Account Trigger */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary cursor-pointer hover:scale-105 transition-transform"
              title="User Profile"
            >
              JD
            </button>

            {showUserDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                <div className="absolute bottom-10 left-4 w-52 bg-card border border-border rounded-lg shadow-xl p-3.5 z-50 text-xs text-foreground space-y-2">
                  <div className="font-bold text-foreground leading-none">John Doe</div>
                  <div className="text-[10px] text-muted-foreground">john.doe@example.com</div>
                  <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                    <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">Active User</span>
                    <span className="text-[8px] text-muted-foreground italic">Auth coming soon</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={toggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all focus:outline-none"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. Side drawer Details Pane */}
      {!sidebarCollapsed && (
        <div
          style={{ width: `${sidebarWidth}px` }}
          className="h-full overflow-hidden flex flex-col relative shrink-0 z-10"
        >
          {renderSidebarContent()}

          {/* Draggable handle divider */}
          <div
            onMouseDown={handleSidebarMouseDown}
            className="absolute right-0 top-0 w-[3px] h-full cursor-col-resize hover:bg-primary/40 bg-transparent transition-all z-50"
          />
        </div>
      )}

      {/* 3. Main REST Workspace Viewport */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Header bar */}
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4 select-none shrink-0 z-10">
          <div className="flex items-center gap-2">
            <h1 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5">
              <span>REST Client</span>
            </h1>
            <span className="text-[10px] text-muted-foreground bg-white/5 px-2 py-0.5 rounded-full font-semibold">
              Workspace Default
            </span>
          </div>

          {/* Environment variables switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-muted/40 border border-border rounded-md px-2.5 py-1 text-xs">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <select
                value={activeEnvironmentId || "no-env"}
                onChange={(e) => setActiveEnvironmentId(e.target.value)}
                className="bg-transparent border-none text-[11px] font-semibold text-foreground focus:outline-none cursor-pointer pr-1"
              >
                {environments.map((env) => (
                  <option key={env.id} value={env.id} className="bg-background text-foreground font-semibold">
                    {env.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Editor splits or welcomes */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TabsBar />

          <div className="flex-1 overflow-hidden">
            {tabs.length > 0 && activeTabId ? (
              tabs.find(t => t.id === activeTabId)?.type === "environment" ? (
                <EnvironmentEditor envId={activeTabId} />
              ) : (
                <SplitPane
                  direction="vertical"
                  minSize={120}
                  defaultSize={380}
                  firstPane={<RequestBuilderFeature />}
                  secondPane={<ResponseViewerFeature />}
                  className="bg-muted/10"
                />
              )
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-background">
                <EmptyState
                  icon={Sparkles}
                  title="Welcome to REST API Client"
                  description="Create a new request tab, click an endpoint on your collection tree, or look through history to begin inspection."
                  action={
                    <button
                      onClick={() => addTab()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-md hover:bg-primary/95 transition-all focus:ring-2 focus:ring-primary/30"
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

      {/* Floating dynamic Toast Notifications Container */}
      <ToastContainer />
    </div>
  )
}
export default AppLayout
