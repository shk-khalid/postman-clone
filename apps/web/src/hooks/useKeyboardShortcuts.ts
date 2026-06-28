import { useEffect, useRef } from "react"

interface ShortcutActions {
  onSend?: () => void
  onSave?: () => void
  onNewTab?: () => void
  onCloseTab?: () => void
  onSearchResponse?: () => void
  onFocusUrl?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  const actionsRef = useRef(actions)
  actionsRef.current = actions

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key === "Enter") {
        e.preventDefault()
        actionsRef.current.onSend?.()
      } else if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault()
        actionsRef.current.onSave?.()
      } else if (e.altKey && e.key.toLowerCase() === "n") {
        e.preventDefault()
        actionsRef.current.onNewTab?.()
      } else if (e.altKey && e.key.toLowerCase() === "w") {
        e.preventDefault()
        actionsRef.current.onCloseTab?.()
      } else if (e.altKey && e.key.toLowerCase() === "l") {
        e.preventDefault()
        actionsRef.current.onFocusUrl?.()
      } else if (isMeta && e.key.toLowerCase() === "f") {
        e.preventDefault()
        actionsRef.current.onSearchResponse?.()
      } else if (e.key === "Escape") {
        actionsRef.current.onEscape?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [])
}
export default useKeyboardShortcuts
