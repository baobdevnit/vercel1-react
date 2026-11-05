import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from './Header'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { healthApi } from '@/features/health/services/health.api'
import { TooltipProvider } from '@/components/ui'
import type { User, HealthResponse } from '@/types/api'

const mockUser: User = {
  id: 'usr-123',
  name: 'Tran Van A',
  email: 'tranvana@example.com',
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

function renderHeader(props = {}, initialPath = '/dashboard') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <MemoryRouter initialEntries={[initialPath]}>
          <Header {...props} />
        </MemoryRouter>
      </TooltipProvider>
    </QueryClientProvider>,
  )
}

describe('Header Component', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(healthApi, 'getHealth').mockResolvedValue(mockHealthData)
    useAuthStore.getState().setAuth(mockUser, 'test-jwt')
    useSidebarStore.setState({
      isCollapsed: false,
      isMobileOpen: false,
    })
  })

  it('hiển thị đúng tiêu đề theo đường dẫn URL', () => {
    renderHeader({}, '/dashboard')
    expect(screen.getByText('Tổng Quan Dashboard')).toBeDefined()
  })

  it('nút toggle sidebar trong header thay đổi aria-label theo trạng thái isCollapsed', () => {
    const { rerender } = renderHeader()
    const toggleBtn = screen.getByTestId('header-sidebar-toggle-btn')

    expect(toggleBtn.getAttribute('aria-label')).toBe('Thu gọn menu thanh bên (Ctrl+B)')
    expect(toggleBtn.getAttribute('aria-expanded')).toBe('true')

    // Bấm nút chuyển sang thu gọn
    fireEvent.click(toggleBtn)
    expect(useSidebarStore.getState().isCollapsed).toBe(true)

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    rerender(
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={0}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <Header />
          </MemoryRouter>
        </TooltipProvider>
      </QueryClientProvider>,
    )

    const updatedToggleBtn = screen.getByTestId('header-sidebar-toggle-btn')
    expect(updatedToggleBtn.getAttribute('aria-label')).toBe('Mở rộng menu thanh bên (Ctrl+B)')
    expect(updatedToggleBtn.getAttribute('aria-expanded')).toBe('false')
  })

  it('gọi callback onToggleSidebar khi được truyền vào props', () => {
    const onToggleMock = vi.fn()
    renderHeader({ onToggleSidebar: onToggleMock })

    const toggleBtn = screen.getByTestId('header-sidebar-toggle-btn')
    fireEvent.click(toggleBtn)

    expect(onToggleMock).toHaveBeenCalledTimes(1)
  })
})
