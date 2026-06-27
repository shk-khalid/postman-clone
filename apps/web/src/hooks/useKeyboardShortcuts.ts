import { useEffect } from "react"

interface ShortcutActions {
  onSend?: () => void
  onSave?: () => void
  onNewTab?: () => void
  onCloseTab?: () => void
  onSearchResponse?: () => void
  onEscape?: () => void
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey

      if (isMeta && e.key === "Enter") {
        e.preventDefault()
        actions.onSend?.()
      } else if (isMeta && e.key.toLowerCase() === "s") {
        e.preventDefault()
        actions.onSave?.()
      } else if (isMeta && e.key.toLowerCase() === "t") {
        e.preventDefault()
        actions.onNewTab?.()
      } else if (isMeta && e.key.toLowerCase() === "w") {
        e.preventDefault()
        actions.onCloseTab?.()
      } else if (isMeta && e.key.toLowerCase() === "f") {
        e.preventDefault()
        actions.onSearchResponse?.()
      } else if (e.key === "Escape") {
        actions.onEscape?.()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [actions])
}
export default useKeyboardShortcuts
