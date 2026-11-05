import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DashboardLayout } from './DashboardLayout'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { healthApi } from '@/features/health/services/health.api'
import type { User, HealthResponse } from '@/types/api'

const mockUser: User = {
  id: 'usr-dash-01',
  name: 'Le Thi B',
  email: 'lethib@example.com',
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockHealthData: HealthResponse = {
  status: 'pass',
  version: '1',
  releaseId: '0.0.1',
  serviceId: 'render1-api',
  description: 'Health status',
  checks: {},
}

function renderDashboardLayout() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route
              path="/dashboard"
              element={
                <div>
                  <h2 data-testid="dashboard-page-content">Trang Nội Dung Dashboard</h2>
                  <input data-testid="test-input" placeholder="Ô nhập liệu" />
                </div>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('DashboardLayout Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)
    useAuthStore.getState().setAuth(mockUser, 'mock-token')
    useSidebarStore.setState({
      isCollapsed: false,
      isMobileOpen: false,
    })
  })

  it('render thành công Sidebar, Header và nội dung Outlet', () => {
    renderDashboardLayout()

    expect(screen.getByTestId('sidebar')).toBeDefined()
    expect(screen.getByTestId('header-sidebar-toggle-btn')).toBeDefined()
    expect(screen.getByTestId('dashboard-page-content')).toBeDefined()
  })

  it('nhấn phím tắt Ctrl+B để thu gọn và mở rộng menu sidebar', () => {
    renderDashboardLayout()

    expect(useSidebarStore.getState().isCollapsed).toBe(false)

    // Bấm Ctrl+B để thu gọn
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(useSidebarStore.getState().isCollapsed).toBe(true)

    // Bấm Ctrl+B lần nữa để mở rộng
    fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
    expect(useSidebarStore.getState().isCollapsed).toBe(false)
  })

  it('nhấn phím tắt Meta+B (Cmd+B trên Mac) cũng thu gọn mở rộng sidebar', () => {
    renderDashboardLayout()

    expect(useSidebarStore.getState().isCollapsed).toBe(false)

    fireEvent.keyDown(window, { key: 'b', metaKey: true })
    expect(useSidebarStore.getState().isCollapsed).toBe(true)

    fireEvent.keyDown(window, { key: 'b', metaKey: true })
    expect(useSidebarStore.getState().isCollapsed).toBe(false)
  })

  it('không kích hoạt phím tắt Ctrl+B khi người dùng đang nhập trong thẻ input', () => {
    renderDashboardLayout()

    const input = screen.getByTestId('test-input')
    input.focus()

    // Bấm Ctrl+B ngay trong thẻ input
    fireEvent.keyDown(input, { key: 'b', ctrlKey: true })

    // Trạng thái sidebar không bị đổi
    expect(useSidebarStore.getState().isCollapsed).toBe(false)
  })

  it('nhấn phím Escape sẽ đóng mobile drawer nếu đang mở', () => {
    renderDashboardLayout()

    act(() => {
      useSidebarStore.getState().openMobile()
    })
    expect(useSidebarStore.getState().isMobileOpen).toBe(true)

    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' })
    })
    expect(useSidebarStore.getState().isMobileOpen).toBe(false)
  })
})
