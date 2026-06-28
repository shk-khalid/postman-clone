import { create } from "zustand"
import { environmentApi } from "@/services/api/environmentApi"

export type SidebarFeature = "collections" | "environments" | "history" | "settings" | "workspaces" | "mocks" | "docs" | "monitors"

export interface EnvVar {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface Environment {
  id: string
  name: string
  variables: EnvVar[]
}

interface WorkspaceStore {
  activeFeature: SidebarFeature
  setActiveFeature: (feature: SidebarFeature) => void
  environments: Environment[]
  activeEnvironmentId: string | null
  setActiveEnvironmentId: (id: string | null) => void
  fetchEnvironments: () => Promise<void>
  addEnvironment: (name: string) => Promise<void>
  updateEnvironment: (id: string, name: string, variables: EnvVar[]) => Promise<void>
  deleteEnvironment: (id: string) => Promise<void>
  theme: "dark" | "light" | "system"
  setTheme: (theme: "dark" | "light" | "system") => void
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  activeFeature: "collections",
  setActiveFeature: (feature) => set({ activeFeature: feature }),
  environments: [{ id: "no-env", name: "No Environment", variables: [] }],
  activeEnvironmentId: "no-env",
  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),

  fetchEnvironments: async () => {
    try {
      const data = await environmentApi.getAll()
      set({ environments: data })
      // Keep active environment id if it still exists, otherwise reset to no-env
      const currentActive = get().activeEnvironmentId
      if (currentActive && !data.some(e => e.id === currentActive)) {
        set({ activeEnvironmentId: "no-env" })
      }
    } catch (e) {
      console.error("Failed to load environments from API", e)
    }
  },

  addEnvironment: async (name) => {
    try {
      const newEnv = await environmentApi.create(name)
      await get().fetchEnvironments()
      set({ activeEnvironmentId: newEnv.id })
    } catch (e) {
      console.error("Failed to create environment", e)
    }
  },

  updateEnvironment: async (id, name, variables) => {
    try {
      const currentEnv = get().environments.find((e) => e.id === id)
      if (!currentEnv) return

      // 1. Rename environment if modified
      if (currentEnv.name !== name) {
        await environmentApi.rename(id, name)
      }

      // Filter out trailing empty rows from API updates
      const cleanVars = variables.filter(v => v.key.trim() || v.value.trim())

      // 2. Identify variables to delete
      const currentCleanVars = currentEnv.variables.filter(v => v.key.trim() || v.value.trim())
      for (const oldVar of currentCleanVars) {
        if (!cleanVars.some(v => v.id === oldVar.id)) {
          await environmentApi.deleteVariable(oldVar.id)
        }
      }

      // 3. Identify variables to add or update
      for (const newVar of cleanVars) {
        const existing = currentCleanVars.find(v => v.id === newVar.id)
        if (existing) {
          if (existing.key !== newVar.key || existing.value !== newVar.value) {
            await environmentApi.updateVariable(newVar.id, newVar.key, newVar.value)
          }
        } else {
          await environmentApi.addVariable(id, newVar.key, newVar.value)
        }
      }

      // Reload environments to sync latest values
      await get().fetchEnvironments()
    } catch (e) {
      console.error("Failed to update environment", e)
    }
  },

  deleteEnvironment: async (id) => {
    try {
      if (id === "no-env") return
      await environmentApi.delete(id)
      await get().fetchEnvironments()
    } catch (e) {
      console.error("Failed to delete environment", e)
    }
  },

  theme: (() => {
    try {
      const raw = localStorage.getItem("postman_clone_settings")
      if (raw) {
        return JSON.parse(raw).theme || "dark"
      }
    } catch {}
    return "dark"
  })(),
  setTheme: (theme) => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }
    set({ theme })
  },
}))
export default useWorkspaceStore
