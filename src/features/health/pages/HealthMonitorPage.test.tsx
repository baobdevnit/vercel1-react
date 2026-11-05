import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HealthMonitorPage } from './HealthMonitorPage'
import { healthApi } from '@/features/health/services/health.api'
import type { HealthResponse } from '@/types/api'

describe('HealthMonitorPage', () => {
  let queryClient: QueryClient
  let mockWriteText: ReturnType<typeof vi.fn>

  const mockHealthData: HealthResponse = {
    status: 'pass',
    version: '1',
    releaseId: '4f589f9cba3819ddad63720029f3c16becf3b9a6',
    notes: ['Tất cả hệ thống và dịch vụ phụ thuộc đều hoạt động bình thường.'],
    serviceId: 'my-first-api',
    description: 'Health status for my-first-api conforming to IETF Draft specification',
    checks: {
      'system:uptime': [
        {
          componentId: 'node-process',
          componentType: 'system',
          status: 'pass',
          observedValue: 3600,
          observedUnit: 's',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Tiến trình hoạt động ổn định trong 3600 giây',
        },
      ],
      'system:memory': [
        {
          componentId: 'node-heap',
          componentType: 'system',
          status: 'pass',
          observedValue: 34.8,
          observedUnit: 'MB',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Bộ nhớ sử dụng bình thường: 34.8MB / 40.0MB',
        },
      ],
      'datastore:supabase': [
        {
          componentId: 'supabase-database',
          componentType: 'datastore',
          status: 'pass',
          observedValue: 165,
          observedUnit: 'ms',
          time: '2026-11-05T08:48:04.942Z',
          output: 'Kết nối Supabase phản hồi trong 165ms',
        },
      ],
    },
    links: {
      self: '/health',
      docs: '/scalar',
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

    mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      configurable: true,
      writable: true,
    })
  })

  it('kết nối và hiển thị đầy đủ các thẻ chỉ số sức khỏe hệ thống', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)

    renderWithProviders(<HealthMonitorPage />)

    await waitFor(() => {
      expect(screen.getByText('Cơ Sở Dữ Liệu Supabase')).toBeDefined()
    })

    // Status banner
    expect(screen.getByText(/Tất cả các dịch vụ đang vận hành ổn định/i)).toBeDefined()

    // 4 Key metric cards
    expect(screen.getByText('165')).toBeDefined()
    expect(screen.getByText('Rất Tốt')).toBeDefined()

    expect(screen.getByText('Node.js Heap Memory')).toBeDefined()
    expect(screen.getByText('34.8')).toBeDefined()

    expect(screen.getByText('Uptime Tiến Trình')).toBeDefined()
    expect(screen.getByText('1 giờ')).toBeDefined()

    expect(screen.getByText('Bản Phát Hành & Dịch Vụ')).toBeDefined()
    expect(screen.getAllByText(/4f589f9c/i).length).toBeGreaterThanOrEqual(1)

    // JSON Inspector
    expect(screen.getByText('Dữ Liệu Thô Chuẩn IETF application/health+json')).toBeDefined()
  })

  it('cho phép bật/tắt tự động làm mới (Auto Refresh)', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)

    renderWithProviders(<HealthMonitorPage />)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Bật' })).toBeDefined()
    })

    const toggleBtn = screen.getByRole('button', { name: 'Bật' })
    fireEvent.click(toggleBtn)

    expect(screen.getByRole('button', { name: 'Tắt' })).toBeDefined()
  })

  it('thực thi nút "Kiểm Tra Ngay" và refetch dữ liệu', async () => {
    const getHealthSpy = vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)

    renderWithProviders(<HealthMonitorPage />)

    await waitFor(() => {
      expect(screen.getByText('Cơ Sở Dữ Liệu Supabase')).toBeDefined()
    })

    const refetchBtn = screen.getByRole('button', { name: /Kiểm Tra Ngay/i })
    fireEvent.click(refetchBtn)

    expect(getHealthSpy).toHaveBeenCalledTimes(2)
  })

  it('sao chép JSON dữ liệu thô vào clipboard', async () => {
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)

    renderWithProviders(<HealthMonitorPage />)

    await waitFor(() => {
      expect(screen.getByText('Cơ Sở Dữ Liệu Supabase')).toBeDefined()
    })

    const copyJsonBtn = screen.getByRole('button', { name: /Sao Chép JSON/i })
    fireEvent.click(copyJsonBtn)

    expect(mockWriteText).toHaveBeenCalledWith(
      JSON.stringify(mockHealthData, null, 2),
    )
    await waitFor(() => {
      expect(screen.getByText('Đã Chép!')).toBeDefined()
    })
  })

  it('hiển thị banner lỗi khi không thể kết nối đến backend', async () => {
    vi.spyOn(healthApi, 'getHealth').mockRejectedValue(new Error('Connection timeout 5000ms'))

    renderWithProviders(<HealthMonitorPage />)

    await waitFor(() => {
      expect(
        screen.getByText(/Không thể kết nối đến máy chủ backend/i),
      ).toBeDefined()
    })

    expect(screen.getByRole('button', { name: 'Thử Lại' })).toBeDefined()
  })
})
