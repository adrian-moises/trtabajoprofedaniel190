import * as React from "react"
import { cn } from "../../lib/utils"

function AlertDialog({ open, onOpenChange, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

function AlertDialogContent({ className, children, ...props }) {
  return (
    <div className={cn("rounded-2xl border border-white/10 bg-[#161616] p-6 text-white shadow-2xl", className)} {...props}>
      {children}
    </div>
  )
}

function AlertDialogHeader({ className, ...props }) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />
}

function AlertDialogTitle({ className, ...props }) {
  return <h2 className={cn("text-lg font-semibold text-white", className)} {...props} />
}

function AlertDialogDescription({ className, ...props }) {
  return <p className={cn("text-sm text-white/55", className)} {...props} />
}

function AlertDialogFooter({ className, ...props }) {
  return <div className={cn("mt-6 flex items-center justify-end gap-2", className)} {...props} />
}

function AlertDialogCancel({ className, onClick, children, ...props }) {
  return (
    <button
      onClick={onClick}
      className={cn("h-10 rounded-lg border border-white/15 bg-transparent px-4 text-sm text-white/70 hover:bg-white/10 transition-colors", className)}
      {...props}
    >
      {children}
    </button>
  )
}

function AlertDialogAction({ className, children, ...props }) {
  return (
    <button
      className={cn("h-10 rounded-lg bg-[#822727] px-5 text-sm font-semibold text-white hover:bg-[#9b2f2f] transition-colors", className)}
      {...props}
    >
      {children}
    </button>
  )
}

export { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction }
