import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useSystemHealth,
  formatUptime,
  getLatencyRating,
} from './useSystemHealth'
import { healthApi } from '@/features/health/services/health.api'
import type { HealthResponse } from '@/types/api'

describe('useSystemHealth hook & helpers', () => {
  let queryClient: QueryClient

  const mockHealth: HealthResponse = {
    status: 'pass',
    version: '1',
    releaseId: '4f589f9cba3819ddad63720029f3c16becf3b9a6',
    notes: ['Tất cả hệ thống hoạt động bình thường.'],
    serviceId: 'my-first-api',
    description: 'Health status for my-first-api',
    checks: {
      'system:uptime': [
        {
          componentId: 'node-process',
          componentType: 'system',
          status: 'pass',
          observedValue: 3720,
          observedUnit: 's',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Tiến trình hoạt động ổn định',
        },
      ],
      'system:memory': [
        {
          componentId: 'node-heap',
          componentType: 'system',
          status: 'pass',
          observedValue: 34.2,
          observedUnit: 'MB',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Bộ nhớ sử dụng bình thường: 34.2MB / 40.0MB',
        },
      ],
      'datastore:supabase': [
        {
          componentId: 'supabase-database',
          componentType: 'datastore',
          status: 'pass',
          observedValue: 185,
          observedUnit: 'ms',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Kết nối Supabase phản hồi trong 185ms',
        },
      ],
    },
  }

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
    vi.restoreAllMocks()
  })

  describe('formatUptime helper', () => {
    it('trả về "—" khi seconds null, undefined hoặc số âm', () => {
      expect(formatUptime(undefined)).toBe('—')
      expect(formatUptime(-5)).toBe('—')
    })

    it('trả về "0 giây" khi seconds = 0', () => {
      expect(formatUptime(0)).toBe('0 giây')
    })

    it('định dạng đúng số giây nhỏ hơn 1 phút', () => {
      expect(formatUptime(45)).toBe('45 giây')
    })

    it('định dạng đúng phút và giây', () => {
      expect(formatUptime(75)).toBe('1 phút 15 giây')
    })

    it('định dạng đúng giờ, phút, giây', () => {
      expect(formatUptime(3665)).toBe('1 giờ 1 phút 5 giây')
    })

    it('định dạng đúng ngày, giờ, phút', () => {
      expect(formatUptime(90000)).toBe('1 ngày 1 giờ')
    })
  })

  describe('getLatencyRating helper', () => {
    it('phân loại chính xác các ngưỡng độ trễ', () => {
      expect(getLatencyRating(undefined)).toBe('unknown')
      expect(getLatencyRating(120)).toBe('excellent')
      expect(getLatencyRating(350)).toBe('good')
      expect(getLatencyRating(800)).toBe('fair')
      expect(getLatencyRating(1500)).toBe('slow')
    })
  })

  describe('useSystemHealth execution', () => {
    it('bóc tách đầy đủ các chỉ số từ backend', async () => {
      vi.spyOn(healthApi, 'getHealth').mockResolvedValueOnce(mockHealth)

      const { result } = renderHook(() => useSystemHealth({ initialAutoRefresh: false }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.overallStatus).toBe('pass')
      expect(result.current.isHealthy).toBe(true)
      expect(result.current.supabaseLatencyMs).toBe(185)
      expect(result.current.latencyRating).toBe('excellent')
      expect(result.current.memoryMb).toBe(34.2)
      expect(result.current.uptimeSeconds).toBe(3720)
      expect(result.current.formattedUptime).toBe('1 giờ 2 phút')
    })

    it('quản lý bật/tắt auto-refetch và khoảng thời gian refreshInterval', async () => {
      vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealth)

      const { result } = renderHook(
        () => useSystemHealth({ defaultInterval: 20000, initialAutoRefresh: true }),
        { wrapper: createWrapper() },
      )

      expect(result.current.isAutoRefresh).toBe(true)
      expect(result.current.refreshInterval).toBe(20000)

      act(() => {
        result.current.toggleAutoRefresh()
      })
      expect(result.current.isAutoRefresh).toBe(false)

      act(() => {
        result.current.setRefreshInterval(30000)
      })
      expect(result.current.refreshInterval).toBe(30000)
    })

    it('ghi nhận lịch sử kiểm tra và hỗ trợ xóa lịch sử', async () => {
      vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealth)

      const { result } = renderHook(() => useSystemHealth({ initialAutoRefresh: false }), {
        wrapper: createWrapper(),
      })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
        expect(result.current.history.length).toBeGreaterThan(0)
      })

      expect(result.current.history[0].supabaseLatencyMs).toBe(185)

      act(() => {
        result.current.clearHistory()
      })
      expect(result.current.history.length).toBe(0)
    })
  })
})
