import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  label?: string
  color?: 'accent' | 'success' | 'warning' | 'danger' | 'current'
}

const sizeClasses = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-9 w-9',
}

export function Spinner({
  size = 'md',
  label = 'Đang tải...',
  className,
  ...props
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('inline-flex items-center justify-center text-zinc-400', className)}
      {...props}
    >
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      <span className="sr-only">{label}</span>
    </span>
  )
}
