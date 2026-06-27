import React from "react"

interface LoadingStateProps {
  message?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading configuration...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 rounded-full border-2 border-primary/25" />
        <div className="absolute inset-0 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
      </div>
      <p className="text-xs font-medium text-muted-foreground tracking-wide">{message}</p>
    </div>
  )
}
