import * as React from "react"
import { cn } from "../../lib/utils"

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-white/10 bg-white/5 px-3 text-white placeholder:text-white/20 outline-none focus:border-[#822727] transition-colors disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
