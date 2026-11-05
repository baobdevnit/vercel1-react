import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HealthStatusWidget } from './HealthStatusWidget'
import { healthApi } from '@/features/health/services/health.api'
import type { HealthResponse } from '@/types/api'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('HealthStatusWidget component', () => {
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
          observedValue: 3600,
          observedUnit: 's',
          time: '2026-11-05T08:48:04.942Z',
        },
      ],
      'system:memory': [
        {
          componentId: 'node-heap',
          componentType: 'system',
          status: 'pass',
          observedValue: 32.5,
          observedUnit: 'MB',
          time: '2026-11-05T08:48:04.942Z',
        },
      ],
      'datastore:supabase': [
        {
          componentId: 'supabase-database',
          componentType: 'datastore',
          status: 'pass',
          observedValue: 150,
          observedUnit: 'ms',
          time: '2026-11-05T08:48:04.942Z',
        },
      ],
    },
  }

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{ui}</BrowserRouter>
      </QueryClientProvider>,
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
    mockNavigate.mockReset()
  })

  it('hiển thị dạng compact (pill) với nhãn trực tuyến và độ trễ Supabase', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValueOnce(mockHealth)

    renderWithProviders(<HealthStatusWidget variant="compact" />)

    await waitFor(() => {
      expect(screen.getByText('Hệ thống trực tuyến')).toBeDefined()
    })

    expect(screen.getByText('150ms')).toBeDefined()

    // Click chuyển hướng đến /health
    const btn = screen.getByRole('button', { name: /Trạng thái hệ thống/i })
    fireEvent.click(btn)
    expect(mockNavigate).toHaveBeenCalledWith('/health')
  })

  it('hiển thị dạng badge', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValueOnce(mockHealth)

    renderWithProviders(<HealthStatusWidget variant="badge" />)

    await waitFor(() => {
      expect(screen.getByText('PASS')).toBeDefined()
    })
  })

  it('hiển thị dạng card đầy đủ số liệu Supabase, Heap RAM và Uptime', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValueOnce(mockHealth)

    renderWithProviders(<HealthStatusWidget variant="card" />)

    await waitFor(() => {
      expect(screen.getByText('150ms')).toBeDefined()
    })

    expect(screen.getByText('32.5 MB')).toBeDefined()
    expect(screen.getByText('1 giờ')).toBeDefined()
  })

  it('xử lý trạng thái lỗi API hiển thị banner/thông báo mất kết nối', async () => {
    vi.spyOn(healthApi, 'getHealth').mockRejectedValueOnce(new Error('Network error'))

    renderWithProviders(<HealthStatusWidget variant="compact" />)

    await waitFor(() => {
      expect(screen.getByText(/Mất kết nối API/i)).toBeDefined()
    })
  })
})
