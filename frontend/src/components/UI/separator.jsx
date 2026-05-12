import * as React from "react"
import { cn } from "../../lib/utils"

function Separator({ className, ...props }) {
  return <div className={cn("h-px bg-white/10", className)} {...props} />
}

export { Separator }
