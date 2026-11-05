import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import { TooltipProvider } from '@/components/ui'
import type { User } from '@/types/api'

const mockNormalUser: User = {
  id: 'usr-1',
  name: 'Bao Nguyen',
  email: 'bao@example.com',
  role: 'user',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const mockAdminUser: User = {
  id: 'adm-1',
  name: 'Admin Boss',
  email: 'admin@example.com',
  role: 'admin',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderSidebar(props = {}) {
  return render(
    <TooltipProvider delayDuration={0}>
      <MemoryRouter>
        <Sidebar {...props} />
      </MemoryRouter>
    </TooltipProvider>,
  )
}

describe('Sidebar Component', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().setAuth(mockNormalUser, 'token-123')
    useSidebarStore.setState({
      isCollapsed: false,
      isMobileOpen: false,
    })
  })

  it('hiển thị đầy đủ thông tin khi ở trạng thái mở rộng (expanded)', () => {
    renderSidebar()

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.getAttribute('data-collapsed')).toBe('false')

    // Tên thương hiệu và tiêu đề hiển thị
    expect(screen.getByText('Render I Portal')).toBeDefined()
    expect(screen.getByText('Nền Tảng Quản Trị Hệ Thống')).toBeDefined()

    // Tên người dùng và quyền
    expect(screen.getByText('Bao Nguyen')).toBeDefined()

    // Các mục menu chính
    expect(screen.getByText('Tổng quan Dashboard')).toBeDefined()
    expect(screen.getByText('Hồ sơ cá nhân')).toBeDefined()
    expect(screen.getByText('Giám sát hệ thống')).toBeDefined()
    expect(screen.getByText('UI & API Showcase')).toBeDefined()

    // Khu vực bảo mật admin xuất hiện với user thường
    expect(screen.getByText('Khu vực Bảo Mật Admin')).toBeDefined()

    // Nút thu gọn thanh bên có sẵn
    expect(screen.getByTestId('sidebar-collapse-btn')).toBeDefined()
    expect(screen.getByTestId('sidebar-collapse-bottom-btn')).toBeDefined()
  })

  it('chuyển sang giao diện thu gọn khi isCollapsed là true', () => {
    useSidebarStore.setState({ isCollapsed: true })
    renderSidebar()

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.getAttribute('data-collapsed')).toBe('true')
    expect(sidebar.className).toContain('md:w-[72px]')

    // Không còn text dài tiêu đề
    expect(screen.queryByText('Nền Tảng Quản Trị Hệ Thống')).toBeNull()
    expect(screen.queryByText('Tổng quan Dashboard')).toBeNull()

    // Nút mở rộng ở chân sidebar xuất hiện
    expect(screen.getByTestId('sidebar-expand-bottom-btn')).toBeDefined()
  })

  it('nhấn nút thu gọn ở đầu và cuối sidebar sẽ gọi toggleCollapse', () => {
    renderSidebar()

    const topCollapseBtn = screen.getByTestId('sidebar-collapse-btn')
    fireEvent.click(topCollapseBtn)

    expect(useSidebarStore.getState().isCollapsed).toBe(true)

    // Bấm nút mở rộng ở cuối sidebar
    const expandBottomBtn = screen.getByTestId('sidebar-expand-bottom-btn')
    fireEvent.click(expandBottomBtn)

    expect(useSidebarStore.getState().isCollapsed).toBe(false)
  })

  it('hỗ trợ điều khiển qua props isOpen, onClose, isCollapsed, onToggleCollapse', () => {
    let collapsedState = false
    const toggleMock = () => {
      collapsedState = !collapsedState
    }
    let mobileClosed = false
    const closeMock = () => {
      mobileClosed = true
    }

    const { rerender } = render(
      <TooltipProvider delayDuration={0}>
        <MemoryRouter>
          <Sidebar
            isOpen={true}
            isCollapsed={false}
            onToggleCollapse={toggleMock}
            onClose={closeMock}
          />
        </MemoryRouter>
      </TooltipProvider>,
    )

    // Backdrop mobile hiển thị khi isOpen = true
    const backdrop = screen.getByTestId('sidebar-backdrop')
    expect(backdrop).toBeDefined()
    fireEvent.click(backdrop)
    expect(mobileClosed).toBe(true)

    // Kiểm tra bấm nút thu gọn gọi callback prop
    const collapseBtn = screen.getByTestId('sidebar-collapse-btn')
    fireEvent.click(collapseBtn)
    expect(collapsedState).toBe(true)

    // Rerender với isCollapsed = true
    rerender(
      <TooltipProvider delayDuration={0}>
        <MemoryRouter>
          <Sidebar
            isOpen={false}
            isCollapsed={true}
            onToggleCollapse={toggleMock}
            onClose={closeMock}
          />
        </MemoryRouter>
      </TooltipProvider>,
    )

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar.getAttribute('data-collapsed')).toBe('true')
  })

  it('hiển thị menu Quản trị người dùng khi là Admin', () => {
    useAuthStore.getState().setAuth(mockAdminUser, 'admin-token')
    renderSidebar()

    expect(screen.getByText('Quản trị người dùng')).toBeDefined()
    expect(screen.queryByText('Khu vực Bảo Mật Admin')).toBeNull()
  })
})
