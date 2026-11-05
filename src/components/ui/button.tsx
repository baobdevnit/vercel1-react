import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-zinc-900 text-zinc-50 shadow-xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200/90 active:scale-[0.99]',
        primary:
          'bg-zinc-900 text-zinc-50 shadow-xs hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200/90 active:scale-[0.99]',
        destructive:
          'bg-red-600 text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 active:scale-[0.99]',
        danger:
          'bg-red-600 text-white shadow-xs hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 active:scale-[0.99]',
        outline:
          'border border-zinc-300 dark:border-zinc-800 bg-transparent shadow-xs hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-700 dark:text-zinc-300',
        secondary:
          'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700/60 shadow-xs hover:bg-zinc-200 dark:hover:bg-zinc-800',
        ghost:
          'hover:bg-zinc-100 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100 text-zinc-600 dark:text-zinc-400',
        link:
          'text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        md: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-sm px-3 text-xs',
        lg: 'h-10 rounded-md px-8 text-base',
        icon: 'h-9 w-9 p-0',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariant = 'default' | 'primary' | 'destructive' | 'danger' | 'secondary' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'default' | 'md' | 'sm' | 'lg' | 'icon'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconPrefix?: React.ReactNode
  iconSuffix?: React.ReactNode
  isDisabled?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      iconPrefix,
      iconSuffix,
      fullWidth,
      disabled,
      isDisabled,
      children,
      ...props
    },
    ref,
  ) => {
    const effectivelyDisabled = disabled || isDisabled || isLoading
    const effectiveLeftIcon = leftIcon || iconPrefix
    const effectiveRightIcon = rightIcon || iconSuffix

    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Slot>
      )
    }

    return (
      <button
        ref={ref}
        disabled={effectivelyDisabled}
        aria-busy={isLoading}
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {effectiveLeftIcon && <span className="inline-flex shrink-0">{effectiveLeftIcon}</span>}
            {children}
            {effectiveRightIcon && <span className="inline-flex shrink-0">{effectiveRightIcon}</span>}
          </>
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
