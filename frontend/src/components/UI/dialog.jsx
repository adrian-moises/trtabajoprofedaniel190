import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

function Dialog({ open, onOpenChange, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-lg">
        {children}
      </div>
    </div>
  )
}

function DialogContent({ className, children, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-[#161616] p-6 text-white shadow-2xl", className)} {...props}>
      {children}
    </div>
  )
}

function DialogHeader({ className, ...props }) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />
}

function DialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold text-white", className)} {...props} />
}

function DialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-white/50", className)} {...props} />
}

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }
