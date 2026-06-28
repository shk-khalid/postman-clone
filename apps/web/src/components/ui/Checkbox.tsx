import React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  className,
}) => {
  return (
    <button
      id={id}
      type="button"
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "w-3.5 h-3.5 rounded border flex items-center justify-center transition-all cursor-pointer select-none shrink-0",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-background border-border text-transparent hover:border-primary/50 focus:border-primary",
        disabled && "opacity-40 cursor-not-allowed",
        className
      )}
    >
      {checked && <Check className="w-2.5 h-2.5 stroke-[3.5] text-primary-foreground" />}
    </button>
  )
}

export default Checkbox
