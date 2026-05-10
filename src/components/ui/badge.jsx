import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-violet-500/20 text-violet-300 border-violet-500/30",
        secondary:
          "border-transparent bg-white/8 text-slate-300 border-white/10",
        destructive:
          "border-transparent bg-red-500/20 text-red-300 border-red-500/30",
        outline:
          "border-white/15 text-slate-300 bg-transparent",
        success:
          "border-transparent bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        warning:
          "border-transparent bg-amber-500/20 text-amber-300 border-amber-500/30",
        cyan:
          "border-transparent bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className = '', variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
