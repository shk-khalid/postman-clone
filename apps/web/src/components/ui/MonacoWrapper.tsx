import React from "react"
import Editor, { type Monaco } from "@monaco-editor/react"
import { useWorkspaceStore } from "@/store/workspaceStore"

interface MonacoWrapperProps {
  value: string
  onChange?: (value: string) => void
  language?: "json" | "html" | "xml" | "plaintext"
  readOnly?: boolean
  height?: string
}

export const MonacoWrapper: React.FC<MonacoWrapperProps> = ({
  value,
  onChange,
  language = "json",
  readOnly = false,
  height = "100%",
}) => {
  const theme = useWorkspaceStore((state) => state.theme)

  const handleEditorWillMount = (monaco: Monaco) => {
    // Configure Monaco dark/light themes to match the slate/anthracite app background
    monaco.editor.defineTheme("customDark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "string", foreground: "a5d6ff" },
        { token: "keyword", foreground: "ff7b72" },
        { token: "number", foreground: "79c0ff" },
      ],
      colors: {
        "editor.background": "#0b0c10",
        "editor.foreground": "#f0f6fc",
        "editorLineNumber.foreground": "#8b949e",
        "editorLineNumber.activeForeground": "#f0f6fc",
      },
    })
  }

  return (
    <div className="w-full h-full border border-border/40 rounded-md overflow-hidden bg-background">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange?.(val || "")}
        theme={theme === "light" ? "vs-light" : "vs-dark"}
        beforeMount={handleEditorWillMount}
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 20,
          scrollBeyondLastLine: false,
          readOnly,
          wordWrap: "on",
          padding: { top: 8, bottom: 8 },
          automaticLayout: true,
        }}
      />
    </div>
  )
}
