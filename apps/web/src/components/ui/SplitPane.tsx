import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SplitPaneProps {
  direction: "horizontal" | "vertical"
  minSize?: number
  defaultSize?: number
  firstPane: React.ReactNode
  secondPane: React.ReactNode
  className?: string
}

export const SplitPane: React.FC<SplitPaneProps> = ({
  direction,
  minSize = 150,
  defaultSize = 350,
  firstPane,
  secondPane,
  className,
}) => {
  const [size, setSize] = useState<number>(defaultSize)
  const isResizingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    isResizingRef.current = true
    document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
    document.body.style.userSelect = "none"
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      if (direction === "horizontal") {
        const newSize = e.clientX - containerRect.left
        if (newSize >= minSize && newSize <= containerRect.width - minSize) {
          setSize(newSize)
        }
      } else {
        const newSize = e.clientY - containerRect.top
        if (newSize >= minSize && newSize <= containerRect.height - minSize) {
          setSize(newSize)
        }
      }
    }

    const handleMouseUp = () => {
      if (isResizingRef.current) {
        isResizingRef.current = false
        document.body.style.cursor = ""
        document.body.style.userSelect = ""
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [direction, minSize])

  const isHoriz = direction === "horizontal"

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex w-full h-full overflow-hidden select-none",
        isHoriz ? "flex-row" : "flex-col",
        className
      )}
    >
      <div
        style={{
          width: isHoriz ? `${size}px` : "100%",
          height: isHoriz ? "100%" : `${size}px`,
        }}
        className="overflow-auto select-text"
      >
        {firstPane}
      </div>

      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "bg-border/60 hover:bg-primary/50 transition-colors cursor-pointer select-none z-10 flex items-center justify-center",
          isHoriz ? "w-1 h-full cursor-col-resize" : "h-1 w-full cursor-row-resize"
        )}
      />

      <div className="flex-1 overflow-auto select-text">
        {secondPane}
      </div>
    </div>
  )
}
