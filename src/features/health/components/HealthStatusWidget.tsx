import { useNavigate } from 'react-router-dom'
import {
  Activity,
  Database,
  Cpu,
  Clock,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react'
import { useSystemHealth } from '@/features/health/hooks/useSystemHealth'
import { Badge, Spinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface HealthStatusWidgetProps {
  variant?: 'compact' | 'badge' | 'card'
  interactive?: boolean
  className?: string
  showLatency?: boolean
}

export function HealthStatusWidget({
  variant = 'compact',
  interactive = true,
  className,
  showLatency = true,
}: HealthStatusWidgetProps) {
  const navigate = useNavigate()
  const {
    isLoading,
    isError,
    supabaseLatencyMs,
    latencyRating,
    formattedUptime,
    memoryMb,
    overallStatus,
  } = useSystemHealth({ defaultInterval: 20000 })

  const handleClick = () => {
    if (interactive) {
      navigate('/health')
    }
  }

  const statusColorConfig = {
    pass: {
      dot: 'bg-emerald-500 dark:bg-emerald-400',
      text: 'text-emerald-800 dark:text-emerald-300',
      bg: 'bg-emerald-50/70 dark:bg-emerald-950/30',
      border: 'border-emerald-200/50 dark:border-emerald-800/40',
      label: 'Hệ thống trực tuyến',
    },
    warn: {
      dot: 'bg-amber-500 dark:bg-amber-400',
      text: 'text-amber-800 dark:text-amber-300',
      bg: 'bg-amber-50/70 dark:bg-amber-950/30',
      border: 'border-amber-200/50 dark:border-amber-800/40',
      label: 'Hệ thống cảnh báo',
    },
    fail: {
      dot: 'bg-red-500 dark:bg-red-400',
      text: 'text-red-800 dark:text-red-300',
      bg: 'bg-red-50/70 dark:bg-red-950/30',
      border: 'border-red-200/50 dark:border-red-800/40',
      label: 'Hệ thống suy giảm',
    },
  }

  const currentConfig = isError
    ? statusColorConfig.fail
    : overallStatus === 'warn'
      ? statusColorConfig.warn
      : overallStatus === 'fail'
        ? statusColorConfig.fail
        : statusColorConfig.pass

  // 1. Variant: Minimal Badge
  if (variant === 'badge') {
    return (
      <Badge
        variant={overallStatus === 'pass' && !isError ? 'pass' : overallStatus === 'warn' ? 'warn' : 'fail'}
        dot
        className={cn(interactive && 'cursor-pointer hover:opacity-90', className)}
        onClick={handleClick}
      >
        {isLoading ? 'Đang kiểm tra...' : isError ? 'MẤT KẾT NỐI' : overallStatus.toUpperCase()}
      </Badge>
    )
  }

  // 2. Variant: Compact Pill for Header
  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer select-none shadow-xs font-sans',
          currentConfig.bg,
          currentConfig.text,
          currentConfig.border,
          interactive && 'hover:shadow-md active:scale-98',
          className,
        )}
        title="Nhấn để xem trung tâm giám sát sức khỏe chi tiết"
        aria-label="Trạng thái hệ thống"
      >
        <div className="relative flex items-center justify-center">
          <span
            className={cn(
              'w-2 h-2 rounded-full',
              currentConfig.dot,
              !isLoading && 'animate-ping opacity-75 absolute inline-flex h-full w-full',
            )}
          />
          <span className={cn('relative inline-flex rounded-full w-2 h-2', currentConfig.dot)} />
        </div>

        {isLoading ? (
          <span className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
            <Spinner size="xs" className="text-zinc-400 dark:text-zinc-300" />
            <span>Đang kiểm tra...</span>
          </span>
        ) : isError ? (
          <span className="flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>Mất kết nối API</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 opacity-80" />
            <span>{currentConfig.label}</span>
            {showLatency && supabaseLatencyMs !== undefined && (
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] opacity-80 border-l border-current/20 pl-1.5">
                <Database className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                <span>{supabaseLatencyMs}ms</span>
              </span>
            )}
          </span>
        )}
      </button>
    )
  }

  // 3. Variant: Full Card for Dashboard or Embeds
  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-white/80 dark:bg-zinc-900/30 shadow-xs font-sans transition-all duration-200',
        interactive && 'cursor-pointer hover:shadow-sm hover:border-zinc-300/80 dark:hover:border-zinc-700/60',
        className,
      )}
    >
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span
              className={cn(
                'w-2.5 h-2.5 rounded-full',
                currentConfig.dot,
                'animate-ping opacity-75 absolute inline-flex h-full w-full',
              )}
            />
            <span className={cn('relative inline-flex rounded-full w-2.5 h-2.5', currentConfig.dot)} />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {currentConfig.label}
          </span>
        </div>

        {interactive && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 hover:text-zinc-800 dark:hover:text-zinc-200">
            Chi tiết <ExternalLink className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3 pt-1">
        <div className="space-y-0.5">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> Supabase
          </span>
          <p
            className={cn(
              'text-xs font-mono font-bold',
              latencyRating === 'excellent' && 'text-emerald-700 dark:text-emerald-400',
              latencyRating === 'good' && 'text-emerald-600 dark:text-emerald-300',
              latencyRating === 'fair' && 'text-amber-700 dark:text-amber-400',
              latencyRating === 'slow' && 'text-red-700 dark:text-red-400',
            )}
          >
            {supabaseLatencyMs ? `${supabaseLatencyMs}ms` : '—'}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> Heap RAM
          </span>
          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
            {memoryMb ? `${memoryMb} MB` : '—'}
          </p>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-zinc-400 dark:text-zinc-500" /> Uptime
          </span>
          <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200 truncate">
            {formattedUptime}
          </p>
        </div>
      </div>
    </div>
  )
}
