import { Tab } from "@/store/tabStore"
import { resolveVariables } from "@/lib/variableResolver"
import { requestApi, RequestPayload, NormalizedResponse } from "../api/requestApi"

export const requestService = {
  /**
   * Prepares and dispatches a request using the tab state definitions,
   * resolving environment variables and serializing parameters.
   */
  async execute(tab: Tab): Promise<NormalizedResponse> {
    // 1. Substitution on URL
    let resolvedUrl = resolveVariables(tab.url)

    // 2. Query parameter serialization & attachment
    const activeParams = tab.params.filter((p) => p.key && p.active)
    if (activeParams.length > 0) {
      const searchParams = new URLSearchParams()
      activeParams.forEach((p) => {
        searchParams.append(resolveVariables(p.key), resolveVariables(p.value))
      })
      const connector = resolvedUrl.includes("?") ? "&" : "?"
      resolvedUrl = `${resolvedUrl}${connector}${searchParams.toString()}`
    }

    // 3. Header formatting and variable resolution
    const resolvedHeaders: Record<string, string> = {}
    tab.headers
      .filter((h) => h.key && h.active)
      .forEach((h) => {
        resolvedHeaders[h.key] = resolveVariables(h.value)
      })

    // 4. Authorization injection
    if (tab.authType === "bearer" && tab.bearerToken) {
      resolvedHeaders["Authorization"] = `Bearer ${resolveVariables(tab.bearerToken)}`
    } else if (tab.authType === "basic") {
      const u = resolveVariables(tab.basicUsername)
      const p = resolveVariables(tab.basicPassword)
      resolvedHeaders["Authorization"] = `Basic ${btoa(`${u}:${p}`)}`
    }

    // 5. Body payload resolution
    let resolvedBody = tab.body
    if (tab.bodyType === "json" || tab.bodyType === "raw") {
      resolvedBody = resolveVariables(tab.body)
    } else if (tab.bodyType === "form-data") {
      // Serialize Form Data parameters
      const fields = (tab.formData || [])
        .filter((f) => f.key && f.active)
        .reduce((acc, curr) => ({ ...acc, [curr.key]: resolveVariables(curr.value) }), {})
      resolvedBody = JSON.stringify(fields)
      resolvedHeaders["Content-Type"] = "multipart/form-data"
    } else if (tab.bodyType === "x-www-form-urlencoded") {
      // Serialize URL Encoded parameters
      const fields = (tab.urlEncoded || [])
        .filter((f) => f.key && f.active)
        .map((f) => `${encodeURIComponent(f.key)}=${encodeURIComponent(resolveVariables(f.value))}`)
        .join("&")
      resolvedBody = fields
      resolvedHeaders["Content-Type"] = "application/x-www-form-urlencoded"
    }

    // Prepare standardized RequestPayload
    const payload: RequestPayload = {
      method: tab.method,
      url: resolvedUrl,
      headers: resolvedHeaders,
      params: activeParams.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}),
      bodyType: tab.bodyType,
      body: resolvedBody,
    }

    // Dispatch via API Client adapter
    return await requestApi.send(payload)
  },
}
export default requestService
