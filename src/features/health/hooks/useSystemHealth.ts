import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { healthApi } from '@/features/health/services/health.api'
import type { HealthResponse, HealthCheckItem } from '@/types/api'

export interface HealthHistoryItem {
  id: string
  timestamp: number
  timeFormatted: string
  status: 'pass' | 'warn' | 'fail'
  supabaseLatencyMs?: number
  memoryMb?: number
  uptimeSeconds?: number
}

export type LatencyRating = 'excellent' | 'good' | 'fair' | 'slow' | 'unknown'

export interface UseSystemHealthOptions {
  /**
   * Thời gian chu kỳ tự động thăm dò (ms), mặc định 15000ms (15 giây)
   */
  defaultInterval?: number
  /**
   * Khởi tạo trạng thái tự động polling, mặc định true
   */
  initialAutoRefresh?: boolean
}

/**
 * Định dạng thời gian uptime dạng thân thiện (ngày, giờ, phút, giây)
 */
export function formatUptime(seconds?: number): string {
  if (seconds === undefined || seconds === null || seconds < 0) {
    return '—'
  }
  if (seconds === 0) {
    return '0 giây'
  }

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  const parts: string[] = []
  if (days > 0) parts.push(`${days} ngày`)
  if (hours > 0) parts.push(`${hours} giờ`)
  if (minutes > 0) parts.push(`${minutes} phút`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs} giây`)

  return parts.join(' ')
}

/**
 * Đánh giá mức độ phản hồi của cơ sở dữ liệu Supabase theo ms
 */
export function getLatencyRating(latencyMs?: number): LatencyRating {
  if (latencyMs === undefined || latencyMs === null || isNaN(latencyMs)) {
    return 'unknown'
  }
  if (latencyMs < 200) return 'excellent'
  if (latencyMs < 600) return 'good'
  if (latencyMs < 1200) return 'fair'
  return 'slow'
}

export function useSystemHealth(options: UseSystemHealthOptions = {}) {
  const { defaultInterval = 15000, initialAutoRefresh = true } = options

  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(initialAutoRefresh)
  const [refreshInterval, setRefreshInterval] = useState<number>(defaultInterval)
  const [history, setHistory] = useState<HealthHistoryItem[]>([])

  const query = useQuery<HealthResponse, Error>({
    queryKey: ['system-health-query'],
    queryFn: healthApi.getHealth,
    refetchInterval: isAutoRefresh ? refreshInterval : false,
    staleTime: 5000, // 5s
    refetchOnWindowFocus: true,
  })

  const { data: health, dataUpdatedAt } = query

  // Trích xuất các component check từ IETF RFC schema
  const dbCheck: HealthCheckItem | undefined = useMemo(() => {
    return health?.checks?.['datastore:supabase']?.[0] || health?.checks?.['database:status']?.[0]
  }, [health])

  const memoryCheck: HealthCheckItem | undefined = useMemo(() => {
    return health?.checks?.['system:memory']?.[0]
  }, [health])

  const uptimeCheck: HealthCheckItem | undefined = useMemo(() => {
    return health?.checks?.['system:uptime']?.[0]
  }, [health])

  // Giá trị đo đạc số học
  const supabaseLatencyMs: number | undefined = typeof dbCheck?.observedValue === 'number'
    ? dbCheck.observedValue
    : undefined

  const memoryMb: number | undefined = typeof memoryCheck?.observedValue === 'number'
    ? memoryCheck.observedValue
    : undefined

  const uptimeSeconds: number | undefined = typeof uptimeCheck?.observedValue === 'number'
    ? uptimeCheck.observedValue
    : undefined

  const latencyRating = getLatencyRating(supabaseLatencyMs)
  const formattedUptime = formatUptime(uptimeSeconds)
  const overallStatus = health?.status || (query.isError ? 'fail' : 'pass')
  const isHealthy = health?.status === 'pass' && !query.isError

  const lastRecordedRef = useRef<number>(0)

  // Cập nhật lịch sử kiểm tra khi có dữ liệu mới
  useEffect(() => {
    if (health && dataUpdatedAt && dataUpdatedAt !== lastRecordedRef.current) {
      lastRecordedRef.current = dataUpdatedAt
      const newItem: HealthHistoryItem = {
        id: `${dataUpdatedAt}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: dataUpdatedAt,
        timeFormatted: new Date(dataUpdatedAt).toLocaleTimeString('vi-VN'),
        status: health.status,
        supabaseLatencyMs,
        memoryMb,
        uptimeSeconds,
      }

      const timer = setTimeout(() => {
        setHistory((prev) => {
          if (prev.length > 0 && prev[0].timestamp === dataUpdatedAt) {
            return prev
          }
          return [newItem, ...prev].slice(0, 10)
        })
      }, 0)

      return () => clearTimeout(timer)
    }
  }, [health, dataUpdatedAt, supabaseLatencyMs, memoryMb, uptimeSeconds])

  const toggleAutoRefresh = useCallback(() => {
    setIsAutoRefresh((prev) => !prev)
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  return {
    ...query,
    health,
    // Parsed checks
    dbCheck,
    memoryCheck,
    uptimeCheck,
    // Values
    supabaseLatencyMs,
    memoryMb,
    uptimeSeconds,
    latencyRating,
    formattedUptime,
    overallStatus,
    isHealthy,
    // Polling controls
    isAutoRefresh,
    setIsAutoRefresh,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    // History
    history,
    clearHistory,
    // Formatted last check
    lastCheckedFormatted: dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString('vi-VN') : null,
  }
}
