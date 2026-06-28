import { Tab } from "@/store/tabStore"
import { useWorkspaceStore } from "@/store/workspaceStore"
import { requestApi, RequestPayload, NormalizedResponse } from "../api/requestApi"

export const requestService = {
  /**
   * Prepares and dispatches a request to the backend.
   * Variables are resolved on the backend server based on environment_id.
   */
  async execute(tab: Tab): Promise<NormalizedResponse> {
    // Collect active params
    const activeParams = tab.params.filter((p) => p.key && p.active)
    const paramsMap = activeParams.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})

    // Collect headers
    const headersMap: Record<string, string> = {}
    tab.headers
      .filter((h) => h.key && h.active)
      .forEach((h) => {
        headersMap[h.key] = h.value
      })

    // Setup Auth values for backend validation
    let authMap: Record<string, string> | undefined = undefined
    if (tab.authType === "bearer" && tab.bearerToken) {
      authMap = { bearer: tab.bearerToken }
    } else if (tab.authType === "basic") {
      authMap = { username: tab.basicUsername, password: tab.basicPassword }
    }

    // Body content processing
    let bodyVal: string | undefined = undefined
    if (tab.bodyType === "json" || tab.bodyType === "raw") {
      bodyVal = tab.body
    } else if (tab.bodyType === "form-data") {
      const fields = (tab.formData || [])
        .filter((f) => f.key && f.active)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {})
      bodyVal = JSON.stringify(fields)
      headersMap["Content-Type"] = "multipart/form-data"
    } else if (tab.bodyType === "x-www-form-urlencoded") {
      const fields = (tab.urlEncoded || [])
        .filter((f) => f.key && f.active)
        .map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(f.value)}`)
        .join("&")
      bodyVal = fields
      headersMap["Content-Type"] = "application/x-www-form-urlencoded"
    }

    // Get selected environment ID
    const activeEnvId = useWorkspaceStore.getState().activeEnvironmentId
    // Parse environment ID as number if valid, otherwise pass null
    const environmentIdVal = (activeEnvId && activeEnvId !== "no-env") ? parseInt(activeEnvId, 10) : null

    const payload: RequestPayload = {
      method: tab.method,
      url: tab.url,
      headers: headersMap,
      params: paramsMap,
      body: bodyVal,
      auth: authMap,
      environment_id: environmentIdVal
    }

    return await requestApi.send(payload)
  },
}
export default requestService
