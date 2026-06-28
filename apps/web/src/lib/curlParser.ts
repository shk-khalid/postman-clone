import { HTTPMethod, RequestHeader, RequestParam, FormDataRow, UrlEncodedRow } from "@/store/tabStore"

export interface ParsedCurl {
  method: HTTPMethod
  url: string
  headers: RequestHeader[]
  params: RequestParam[]
  bodyType: "none" | "json" | "raw" | "form-data" | "x-www-form-urlencoded" | "binary"
  body: string
  authType: "none" | "bearer" | "basic"
  bearerToken: string
  basicUsername: string
  basicPassword: string
  formData: FormDataRow[]
  urlEncoded: UrlEncodedRow[]
}

/**
 * Splits a cURL command into shell-like arguments, correctly handling single/double quotes,
 * escaped quotes inside quotes, and line continuation backslashes.
 */
function splitShellArguments(cmd: string): string[] {
  const args: string[] = []
  let current = ""
  let inDoubleQuote = false
  let inSingleQuote = false
  let escaped = false

  // Normalize multi-line continuation backslashes
  const cleaned = cmd.replace(/\\\r?\n/g, " ")

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === "\\") {
      escaped = true
      continue
    }

    if (char === '"') {
      if (!inSingleQuote) {
        inDoubleQuote = !inDoubleQuote
      } else {
        current += char
      }
      continue
    }

    if (char === "'") {
      if (!inDoubleQuote) {
        inSingleQuote = !inSingleQuote
      } else {
        current += char
      }
      continue
    }

    if (/\s/.test(char)) {
      if (inDoubleQuote || inSingleQuote) {
        current += char
      } else if (current) {
        args.push(current)
        current = ""
      }
      continue
    }

    current += char
  }

  if (current) {
    args.push(current)
  }

  return args
}

export function parseCurl(curlCommand: string): ParsedCurl | null {
  const trimmed = curlCommand.trim()
  if (!trimmed.toLowerCase().startsWith("curl")) {
    return null
  }

  const tokens = splitShellArguments(trimmed)
  
  let method: HTTPMethod | null = null
  let rawUrl = ""
  const headers: RequestHeader[] = []
  const params: RequestParam[] = []
  const formData: FormDataRow[] = []
  const urlEncoded: UrlEncodedRow[] = []
  
  let body = ""
  let bodyType: ParsedCurl["bodyType"] = "none"
  let authType: ParsedCurl["authType"] = "none"
  let bearerToken = ""
  let basicUsername = ""
  let basicPassword = ""

  let hasData = false

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i]

    if (token === "-X" || token === "--request") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        method = nextToken.toUpperCase() as HTTPMethod
        i++
      }
    } else if (token === "-H" || token === "--header") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        const colonIndex = nextToken.indexOf(":")
        if (colonIndex !== -1) {
          const key = nextToken.slice(0, colonIndex).trim()
          const value = nextToken.slice(colonIndex + 1).trim()
          
          // Detect Authorization header shortcuts
          if (key.toLowerCase() === "authorization") {
            if (value.toLowerCase().startsWith("bearer ")) {
              authType = "bearer"
              bearerToken = value.slice(7).trim()
            } else if (value.toLowerCase().startsWith("basic ")) {
              authType = "basic"
              try {
                const decoded = atob(value.slice(6).trim())
                const colonIdx = decoded.indexOf(":")
                if (colonIdx !== -1) {
                  basicUsername = decoded.slice(0, colonIdx)
                  basicPassword = decoded.slice(colonIdx + 1)
                }
              } catch {}
            }
          }
          
          headers.push({ id: crypto.randomUUID(), key, value, active: true })
        }
        i++
      }
    } else if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary" || token === "--data-ascii" || token === "--data-urlencode") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        body = nextToken
        bodyType = "raw"
        hasData = true
        i++
      }
    } else if (token === "-F" || token === "--form") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        const eqIdx = nextToken.indexOf("=")
        if (eqIdx !== -1) {
          const key = nextToken.slice(0, eqIdx).trim()
          const value = nextToken.slice(eqIdx + 1).trim()
          const isFile = value.startsWith("@")
          formData.push({
            id: crypto.randomUUID(),
            key,
            value: isFile ? value.slice(1) : value,
            type: isFile ? "file" : "text",
            active: true,
          })
        }
        bodyType = "form-data"
        hasData = true
        i++
      }
    } else if (token === "-u" || token === "--user") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        authType = "basic"
        const colonIdx = nextToken.indexOf(":")
        if (colonIdx !== -1) {
          basicUsername = nextToken.slice(0, colonIdx)
          basicPassword = nextToken.slice(colonIdx + 1)
        } else {
          basicUsername = nextToken
        }
        i++
      }
    } else if (token === "-L" || token === "--location") {
      // Mock follow redirects alert (could append mock custom headers)
      headers.push({ id: crypto.randomUUID(), key: "X-Follow-Redirects", value: "true", active: true })
    } else if (token === "--max-time" || token === "-m") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        headers.push({ id: crypto.randomUUID(), key: "X-Timeout-Ms", value: String(parseInt(nextToken, 10) * 1000), active: true })
        i++
      }
    } else if (token === "--compressed") {
      headers.push({ id: crypto.randomUUID(), key: "Accept-Encoding", value: "gzip, deflate, br", active: true })
    } else if (!token.startsWith("-")) {
      if (!rawUrl) {
        rawUrl = token.replace(/^['"]|['"]$/g, "") // Strip trailing quotes
      }
    }
  }

  // 1. URL and Query parameter splitting
  let finalUrl = rawUrl
  if (rawUrl.includes("?")) {
    const qIdx = rawUrl.indexOf("?")
    finalUrl = rawUrl.slice(0, qIdx)
    const queryString = rawUrl.slice(qIdx + 1)
    
    // Parse query params
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => {
      params.push({ id: crypto.randomUUID(), key, value, description: "", active: true })
    })
  }

  // 2. Default HTTP method inference
  if (!method) {
    method = hasData ? "POST" : "GET"
  }

  // 3. Form url-encoded body parsing
  const isUrlEncoded = headers.some(h => h.key.toLowerCase() === "content-type" && h.value.toLowerCase() === "application/x-www-form-urlencoded")
  if (isUrlEncoded && body && bodyType === "raw") {
    bodyType = "x-www-form-urlencoded"
    const bodyParams = new URLSearchParams(body)
    bodyParams.forEach((value, key) => {
      urlEncoded.push({ id: crypto.randomUUID(), key, value, active: true })
    })
  }

  // 4. JSON body pretty printing (multiline indent)
  if (body && ((bodyType as string) === "raw" || (bodyType as string) === "json")) {
    try {
      const parsedJson = JSON.parse(body)
      body = JSON.stringify(parsedJson, null, 2)
      bodyType = "json"
    } catch {
      // Keep it as raw text
      bodyType = "raw"
    }
  }

  // Ensure trailing empty grids exist
  if (headers.length === 0 || headers[headers.length - 1].key !== "") {
    headers.push({ id: crypto.randomUUID(), key: "", value: "", active: true })
  }
  if (params.length === 0 || params[params.length - 1].key !== "") {
    params.push({ id: crypto.randomUUID(), key: "", value: "", description: "", active: true })
  }
  if (formData.length === 0 || formData[formData.length - 1].key !== "") {
    formData.push({ id: crypto.randomUUID(), key: "", value: "", type: "text", active: true })
  }
  if (urlEncoded.length === 0 || urlEncoded[urlEncoded.length - 1].key !== "") {
    urlEncoded.push({ id: crypto.randomUUID(), key: "", value: "", active: true })
  }

  return {
    method,
    url: finalUrl,
    headers,
    params,
    bodyType,
    body,
    authType,
    bearerToken,
    basicUsername,
    basicPassword,
    formData,
    urlEncoded,
  }
}
