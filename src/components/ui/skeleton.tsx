import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded' | 'text'
  animationType?: 'pulse' | 'shimmer' | 'none'
}

export function Skeleton({
  className,
  variant = 'rounded',
  animationType = 'pulse',
  ...props
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Đang tải dữ liệu..."
      className={cn(
        'bg-zinc-200 dark:bg-zinc-800/60',
        animationType !== 'none' && 'animate-pulse',
        variant === 'circular' && 'rounded-md',
        variant === 'rounded' && 'rounded-md',
        variant === 'rectangular' && 'rounded-none',
        variant === 'text' && 'h-4 w-full rounded-sm',
        className,
      )}
      {...props}
    />
  )
}
