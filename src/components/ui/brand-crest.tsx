import React from 'react'
import { cn } from '@/lib/utils'

export interface BrandCrestProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showText?: boolean
  subtitle?: string
}

export const BrandCrest: React.FC<BrandCrestProps> = ({
  size = 'md',
  className,
  showText = false,
  subtitle = 'SYSTEM OPERATIONS · CLOUD PLATFORM',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  }

  const iconPx = {
    sm: 28,
    md: 36,
    lg: 48,
    xl: 64,
  }[size]

  return (
    <div className={cn('inline-flex items-center gap-3 select-none', className)}>
      {/* Sleek Minimal Geometric Tech Mark */}
      <div className={cn('relative shrink-0 flex items-center justify-center', sizeMap[size])}>
        <svg
          width={iconPx}
          height={iconPx}
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Subtle Outer Tech Hexagon Container */}
          <rect
            x="3"
            y="3"
            width="42"
            height="42"
            rx="4"
            className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-300 dark:stroke-zinc-800"
            strokeWidth="1.5"
          />
          {/* Inner Accent Layer */}
          <path
            d="M16 14L32 14L36 24L32 34L16 34L12 24L16 14Z"
            className="stroke-zinc-300 dark:stroke-zinc-700/60 fill-zinc-50 dark:fill-zinc-950"
            strokeWidth="1.2"
          />
          {/* Central Monogram Core */}
          <path
            d="M20 18H28M24 18V30M20 30H28"
            className="stroke-zinc-900 dark:stroke-zinc-100"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Glowing Tech Dot */}
          <circle cx="36" cy="12" r="2.5" className="fill-emerald-400" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 font-sans">
              RENDER I
            </span>
            <span className="text-[10px] font-mono font-medium tracking-wider px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300">
              v1.0
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase mt-0.5">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  )
}
