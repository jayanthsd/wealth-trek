import * as React from "react"
import { cn } from "@/lib/utils"

type IconBadgeProps = {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
  label: string
  tone?: "primary" | "success" | "warning"
  className?: string
}

function IconBadge({ icon: Icon, label, tone = "primary", className }: IconBadgeProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1",
        tone === "primary" && "bg-primary/10 text-primary ring-primary/20",
        tone === "success" && "bg-success/15 text-success ring-success/30",
        tone === "warning" && "bg-amber-100 text-amber-700 ring-amber-200",
        className
      )}
    >
      <Icon className="h-6 w-6" aria-hidden />
    </span>
  )
}

export { IconBadge }
