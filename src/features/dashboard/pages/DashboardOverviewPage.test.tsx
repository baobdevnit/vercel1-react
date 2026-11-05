import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardOverviewPage } from './DashboardOverviewPage'
import { useAuthStore } from '@/stores/auth.store'
import { healthApi } from '@/features/health/services/health.api'
import type { User, HealthResponse } from '@/types/api'

describe('DashboardOverviewPage Component', () => {
  let queryClient: QueryClient

  const mockAdminUser: User = {
    id: 'admin-uuid-001',
    name: 'Admin Boss',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const mockNormalUser: User = {
    id: 'user-uuid-002',
    name: 'Standard User',
    email: 'user@example.com',
    role: 'user',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }

  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi11dWlkLTAwMSIsImVtYWlsIjoiYWRtaW5AZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.mock-sig'

  const mockHealthData: HealthResponse = {
    status: 'pass',
    version: '1',
    releaseId: '0.0.1',
    serviceId: 'render1-api',
    description: 'Health status',
    checks: {
      'database:status': [
        {
          componentId: 'supabase',
          componentType: 'datastore',
          status: 'pass',
          observedValue: 42,
          observedUnit: 'ms',
          time: new Date().toISOString(),
        },
      ],
      'system:memory': [
        {
          componentId: 'heap',
          componentType: 'system',
          status: 'pass',
          observedValue: '48.5 MB',
          time: new Date().toISOString(),
        },
      ],
    },
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
    useAuthStore.getState().clearAuth()
    vi.restoreAllMocks()
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <DashboardOverviewPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('hiển thị lời chào cá nhân hóa cho tài khoản Admin', () => {
    useAuthStore.getState().setAuth(mockAdminUser, sampleJwt)

    renderWithProviders()

    expect(screen.getByText(/Xin chào, Admin Boss!/)).toBeDefined()
    expect(screen.getAllByText('ADMIN').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/Bạn có quyền truy cập/)).toBeDefined()
  })

  it('hiển thị cảnh báo phù hợp cho tài khoản User thường', () => {
    useAuthStore.getState().setAuth(mockNormalUser, sampleJwt)

    renderWithProviders()

    expect(screen.getByText(/Xin chào, Standard User!/)).toBeDefined()
    expect(screen.getAllByText('USER').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/User thường sẽ bị chuyển về 403/)).toBeDefined()
  })

  it('hiển thị tóm tắt phiên làm việc JWT 24h và máy chủ Render', async () => {
    useAuthStore.getState().setAuth(mockAdminUser, sampleJwt)

    renderWithProviders()

    expect(screen.getByText('Phiên Xác Thực JWT')).toBeDefined()
    expect(screen.getByText('Thời hạn 24 giờ')).toBeDefined()
    expect(screen.getByText('Máy Chủ Render')).toBeDefined()
    expect(await screen.findByText('render1-api')).toBeDefined()
  })

  it('cho phép chuyển đổi vai trò nhanh trên giao diện để test Route Guards', () => {
    useAuthStore.getState().setAuth(mockAdminUser, sampleJwt)

    renderWithProviders()

    // Bấm nút đổi vai trò
    const toggleBtn = screen.getByTitle('Chuyển vai trò để test phân quyền tức thì')
    fireEvent.click(toggleBtn)

    // Role đổi sang user
    expect(useAuthStore.getState().user?.role).toBe('user')
  })
})
