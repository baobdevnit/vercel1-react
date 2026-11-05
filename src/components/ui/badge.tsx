import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex items-center rounded-sm border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-zinc-900 text-zinc-50 shadow-xs dark:bg-zinc-100 dark:text-zinc-900',
        secondary:
          'border-transparent bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-800/80',
        destructive:
          'border-red-300 dark:border-red-800/60 bg-red-100 dark:bg-red-900/60 text-red-900 dark:text-red-200',
        outline: 'text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-800',
        admin:
          'border-purple-300 dark:border-purple-800/50 bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200 shadow-xs',
        user:
          'border-zinc-300 dark:border-zinc-700/60 bg-zinc-100 text-zinc-800 dark:bg-zinc-800/70 dark:text-zinc-300 shadow-xs',
        pass:
          'border-emerald-300 dark:border-emerald-800/50 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs',
        success:
          'border-emerald-300 dark:border-emerald-800/50 bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs',
        warn:
          'border-amber-300 dark:border-amber-800/50 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 shadow-xs',
        warning:
          'border-amber-300 dark:border-amber-800/50 bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 shadow-xs',
        fail:
          'border-red-300 dark:border-red-800/60 bg-red-100 text-red-900 dark:bg-red-950/70 dark:text-red-300 shadow-xs',
        info:
          'border-blue-300 dark:border-blue-800/50 bg-blue-100 text-blue-900 dark:bg-blue-950/60 dark:text-blue-300 shadow-xs',
      },
      size: {
        sm: 'text-[11px] px-2 py-0.5',
        md: 'text-xs px-2.5 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'outline'
  | 'admin'
  | 'user'
  | 'pass'
  | 'success'
  | 'warn'
  | 'warning'
  | 'fail'
  | 'info'
export type BadgeSize = 'sm' | 'md'

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

const dotColors: Record<string, string> = {
  admin: 'bg-purple-600 dark:bg-purple-400',
  user: 'bg-zinc-600 dark:bg-zinc-400',
  pass: 'bg-emerald-600 dark:bg-emerald-400',
  success: 'bg-emerald-600 dark:bg-emerald-400',
  warn: 'bg-amber-600 dark:bg-amber-400',
  warning: 'bg-amber-600 dark:bg-amber-400',
  fail: 'bg-red-600 dark:bg-red-400',
  destructive: 'bg-red-600 dark:bg-red-400',
  info: 'bg-blue-600 dark:bg-blue-400',
  default: 'bg-zinc-600 dark:bg-zinc-400',
  secondary: 'bg-zinc-600 dark:bg-zinc-400',
  outline: 'bg-zinc-600 dark:bg-zinc-400',
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const currentVariant = (variant as string) || 'default'
  const dotColor = dotColors[currentVariant] || 'bg-zinc-400'

  return (
    <div
      className={cn(badgeVariants({ variant, size }), dot && 'gap-1.5', className)}
      {...props}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dotColor)} />}
      {children}
    </div>
  )
}
