import { useWorkspaceStore } from "@/store/workspaceStore"

/**
 * Resolves environmental variables styled like {{variable_key}}
 * from the currently selected environment.
 */
export function resolveVariables(text: string): string {
  if (!text) return ""
  
  const { environments, activeEnvironmentId } = useWorkspaceStore.getState()
  const activeEnv = environments.find((env) => env.id === activeEnvironmentId)
  
  if (!activeEnv) return text

  let resolved = text
  const matches = text.match(/\{\{([^}]+)\}\}/g)
  
  if (!matches) return text

  for (const match of matches) {
    const key = match.replace(/\{\{|\}\}/g, "").trim()
    const variable = activeEnv.variables.find((v) => v.key === key && v.enabled)
    if (variable) {
      resolved = resolved.replace(match, variable.value)
    }
  }

  return resolved
}

/**
 * Validates a URL and resolves variables, returning both the preview and validation status
 */
export function getUrlPreview(url: string): { preview: string; isValid: boolean } {
  const preview = resolveVariables(url)
  let isValid = false
  
  try {
    // If it contains unresolved variables, it might fail standard URL parser.
    // Clean it up for basic test, or use regex:
    const cleanUrl = preview.startsWith("http://") || preview.startsWith("https://") 
      ? preview 
      : `http://${preview}`
    new URL(cleanUrl)
    isValid = true
  } catch {
    isValid = false
  }

  return { preview, isValid }
}
