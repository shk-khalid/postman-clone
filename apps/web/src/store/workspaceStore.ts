import { create } from "zustand"

export type SidebarFeature = "collections" | "environments" | "history" | "settings"

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
  addEnvironment: (name: string) => void
  updateEnvironment: (id: string, name: string, variables: EnvVar[]) => void
  deleteEnvironment: (id: string) => void
  theme: "dark" | "light" | "system"
  setTheme: (theme: "dark" | "light" | "system") => void
}

const defaultEnvironments: Environment[] = [
  {
    id: "no-env",
    name: "No Environment",
    variables: [],
  },
  {
    id: "env-production",
    name: "Production API",
    variables: [
      { id: "1", key: "baseUrl", value: "https://api.production.com/v1", enabled: true },
      { id: "2", key: "authToken", value: "prod-bearer-token-123", enabled: true },
    ],
  },
  {
    id: "env-staging",
    name: "Staging Environment",
    variables: [
      { id: "1", key: "baseUrl", value: "https://api.staging.com/v1", enabled: true },
      { id: "2", key: "authToken", value: "staging-bearer-token-456", enabled: true },
    ],
  },
]

export const useWorkspaceStore = create<WorkspaceStore>((set) => ({
  activeFeature: "collections",
  setActiveFeature: (feature) => set({ activeFeature: feature }),
  environments: defaultEnvironments,
  activeEnvironmentId: "no-env",
  setActiveEnvironmentId: (id) => set({ activeEnvironmentId: id }),

  addEnvironment: (name) => {
    const newEnv: Environment = {
      id: crypto.randomUUID(),
      name,
      variables: [{ id: crypto.randomUUID(), key: "", value: "", enabled: true }],
    }
    set((state) => ({
      environments: [...state.environments, newEnv],
      activeEnvironmentId: newEnv.id,
    }))
  },

  updateEnvironment: (id, name, variables) => {
    set((state) => ({
      environments: state.environments.map((env) =>
        env.id === id ? { ...env, name, variables } : env
      ),
    }))
  },

  deleteEnvironment: (id) => {
    set((state) => {
      const filtered = state.environments.filter((env) => env.id !== id)
      return {
        environments: filtered,
        activeEnvironmentId: state.activeEnvironmentId === id ? "no-env" : state.activeEnvironmentId,
      }
    })
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
