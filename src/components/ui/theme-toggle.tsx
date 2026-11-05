import * as React from 'react'
import { Sun, Moon, Laptop, Check } from 'lucide-react'
import { useTheme, type ThemeMode } from '@/stores/theme.store'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export interface ThemeToggleProps {
  /**
   * Kiểu hiển thị của bộ chuyển đổi giao diện:
   * - `icon`: Nút icon gọn gàng (chuyển đổi nhanh Sáng <-> Tối)
   * - `dropdown`: Nút icon có menu popover chọn 3 chế độ (Sáng / Tối / Hệ thống)
   * - `segmented`: Thanh phân đoạn 3 nút (Sáng | Tối | Hệ thống)
   */
  variant?: 'icon' | 'dropdown' | 'segmented'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({
  variant = 'icon',
  size = 'default',
  className,
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, isDark } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Đóng dropdown khi nhấn ra ngoài hoặc bấm Escape
  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  // ==========================================
  // 1. Phân đoạn 3 nút (Segmented Control)
  // ==========================================
  if (variant === 'segmented') {
    const options: { mode: ThemeMode; label: string; icon: React.ReactNode }[] = [
      {
        mode: 'light',
        label: 'Sáng',
        icon: <Sun className="w-4 h-4 text-amber-500" />,
      },
      {
        mode: 'dark',
        label: 'Tối',
        icon: <Moon className="w-4 h-4 text-indigo-400" />,
      },
      {
        mode: 'system',
        label: 'Hệ thống',
        icon: <Laptop className="w-4 h-4 text-zinc-400" />,
      },
    ]

    return (
      <div
        role="radiogroup"
        aria-label="Chọn chủ đề giao diện"
        className={cn(
          'inline-flex items-center p-1 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400',
          className,
        )}
      >
        {options.map((opt) => {
          const isActive = theme === opt.mode
          return (
            <button
              key={opt.mode}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => setTheme(opt.mode)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-medium transition-all select-none',
                isActive
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-200',
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // ==========================================
  // 2. Dropdown Popover Menu (3 chế độ)
  // ==========================================
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
        <Button
          type="button"
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-haspopup="true"
          className="gap-2 border-zinc-200 dark:border-zinc-800"
          title="Chuyển đổi giao diện sáng/tối"
        >
          {resolvedTheme === 'dark' ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500" />
          )}
          {showLabel && (
            <span className="text-xs">
              {theme === 'system' ? 'Hệ thống' : theme === 'dark' ? 'Tối' : 'Sáng'}
            </span>
          )}
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-44 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-1 shadow-lg z-50 animate-in fade-in-0 zoom-in-95 text-xs">
            <button
              type="button"
              onClick={() => {
                setTheme('light')
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-left transition-colors',
                theme === 'light'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900',
              )}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Giao diện Sáng</span>
              </div>
              {theme === 'light' && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('dark')
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-left transition-colors',
                theme === 'dark'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900',
              )}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>Giao diện Tối</span>
              </div>
              {theme === 'dark' && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTheme('system')
                setIsOpen(false)
              }}
              className={cn(
                'w-full flex items-center justify-between px-2.5 py-1.5 rounded-sm text-left transition-colors',
                theme === 'system'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900',
              )}
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-4 h-4 text-zinc-400" />
                <span>Theo Hệ Thống</span>
              </div>
              {theme === 'system' && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100" />}
            </button>
          </div>
        )}
      </div>
    )
  }

  // ==========================================
  // 3. Nút Icon Chuyển Nhanh Sáng <-> Tối (Mặc định)
  // ==========================================
  const tooltipText = isDark
    ? 'Chuyển sang giao diện Sáng'
    : 'Chuyển sang giao diện Tối'

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={tooltipText}
            className={cn(
              'relative rounded-md text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
              size === 'sm' && 'h-8 w-8',
              className,
            )}
          >
            <Sun
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isDark ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100 text-amber-500',
              )}
            />
            <Moon
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                isDark ? 'rotate-0 scale-100 opacity-100 text-indigo-400' : '-rotate-90 scale-0 opacity-0 absolute',
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
