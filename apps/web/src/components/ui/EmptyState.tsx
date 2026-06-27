import React from "react"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 h-full min-h-[250px] border border-dashed border-border/40 rounded-xl bg-card/20 backdrop-blur-sm">
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/5 text-primary mb-4 border border-primary/10">
          <Icon className="w-6 h-6 animate-pulse" />
        </div>
      )}
      <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-1.5 leading-relaxed">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
