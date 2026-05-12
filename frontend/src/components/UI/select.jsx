import * as React from "react"
import { cn } from "../../lib/utils"

function Select({ value, onValueChange, children, ...props }) {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="h-10 w-full rounded-lg border border-white/10 bg-[#1a1a1a] px-3 text-white outline-none focus:border-[#822727] transition-colors"
      {...props}
    >
      {children}
    </select>
  )
}

function SelectItem({ value, children }) {
  return <option value={value}>{children}</option>
}

export { Select, SelectItem }
