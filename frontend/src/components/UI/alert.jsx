import * as React from "react"
import { cn } from "../../lib/utils"

function Alert({ className, children, ...props }) {
  return (
    <div className={cn("rounded-lg border border-[#822727]/40 bg-[#822727]/10 p-3 text-white", className)} {...props}>
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }) {
  return <p className={cn("mb-1 text-sm font-semibold", className)} {...props} />
}

function AlertDescription({ className, ...props }) {
  return <p className={cn("text-xs text-white/60", className)} {...props} />
}

export { Alert, AlertTitle, AlertDescription }
