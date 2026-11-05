import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  iconPrefix?: React.ReactNode
  iconSuffix?: React.ReactNode
  containerClassName?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      iconPrefix,
      iconSuffix,
      containerClassName,
      className,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const effectiveLeftIcon = leftIcon || iconPrefix
    const effectiveRightIcon = rightIcon || iconSuffix

    const generatedId = React.useId()
    const inputId = id || (label ? `input-${generatedId}` : undefined)

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-zinc-700 dark:text-zinc-300 tracking-wide select-none"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {effectiveLeftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500 z-10 [&_svg]:size-4">
              {effectiveLeftIcon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            disabled={disabled}
            className={cn(
              'flex h-9 w-full rounded-md border bg-white dark:bg-zinc-900/60 px-3 py-1 text-sm text-zinc-900 dark:text-zinc-100 shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
              'focus-visible:outline-none focus-visible:ring-1',
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-zinc-100 dark:disabled:bg-zinc-900',
              effectiveLeftIcon && 'pl-9',
              effectiveRightIcon && 'pr-9',
              error
                ? 'border-red-500 focus-visible:ring-red-500 text-red-600 dark:text-red-200'
                : 'border-zinc-300 dark:border-zinc-800 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-700 focus-visible:ring-zinc-400',
              className,
            )}
            {...props}
          />

          {effectiveRightIcon && (
            <div className="absolute right-3 flex items-center text-zinc-400 dark:text-zinc-500 z-10 [&_svg]:size-4">
              {effectiveRightIcon}
            </div>
          )}
        </div>

        {error ? (
          <p className="text-xs text-red-500 dark:text-red-400 font-medium flex items-center gap-1 mt-0.5">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{helperText}</p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
