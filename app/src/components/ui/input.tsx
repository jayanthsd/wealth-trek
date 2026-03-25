import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "min-h-11 w-full min-w-0 rounded-xl border border-input bg-card px-3 py-2 text-base shadow-sm transition-default outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground hover:border-primary/35 focus-ring focus:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-55 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/25 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
