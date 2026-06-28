import { HTTPMethod } from "@/store/tabStore"

export interface ParsedCurl {
  method: HTTPMethod
  url: string
  headers: { id: string; key: string; value: string; active: boolean }[]
  body: string
  bodyType: "none" | "json" | "raw"
}

/**
 * Splits a cURL command into shell-like argument tokens, respecting single and double quotes.
 */
function splitShellArguments(cmd: string): string[] {
  const args: string[] = []
  let current = ""
  let inDoubleQuote = false
  let inSingleQuote = false
  let escaped = false

  // Clean line continuations
  const cleaned = cmd.replace(/\\\n/g, " ")

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
  
  let method: HTTPMethod = "GET"
  let url = ""
  const headers: { id: string; key: string; value: string; active: boolean }[] = []
  let body = ""
  let bodyType: "none" | "json" | "raw" = "none"

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
          headers.push({ id: crypto.randomUUID(), key, value, active: true })
        }
        i++
      }
    } else if (token === "-d" || token === "--data" || token === "--data-raw" || token === "--data-binary") {
      const nextToken = tokens[i + 1]
      if (nextToken) {
        body = nextToken
        bodyType = "raw"
        // Default to POST method if data is attached and no method was explicitly set
        if (method === "GET") {
          method = "POST"
        }
        i++
      }
    } else if (!token.startsWith("-")) {
      // Check if it's the URL (typically starts with http/https or is a host)
      // Only set it if we haven't found a URL yet
      if (!url) {
        url = token.replace(/^['"]|['"]$/g, "") // Clean trailing quotes
      }
    }
  }

  // Auto-detect JSON body types
  if (body) {
    try {
      JSON.parse(body)
      bodyType = "json"
    } catch {
      bodyType = "raw"
    }
  }

  // Ensure there is always a trailing empty row in headers
  headers.push({ id: crypto.randomUUID(), key: "", value: "", active: true })

  return {
    method,
    url,
    headers,
    body,
    bodyType,
  }
}
