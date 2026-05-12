import * as React from "react"
import { cn } from "../../lib/utils"

function Label({ className, ...props }) {
  return (
    <label className={cn("text-xs font-medium uppercase tracking-wider text-white/50", className)} {...props} />
  )
}

export { Label }
