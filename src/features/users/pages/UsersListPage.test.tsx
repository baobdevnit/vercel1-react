import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UsersListPage } from './UsersListPage'
import { usersApi } from '@/features/users/services/users.api'
import type { User } from '@/types/api'

describe('UsersListPage Component', () => {
  let queryClient: QueryClient
  let mockWriteText: ReturnType<typeof vi.fn>

  const mockUsers: User[] = [
    {
      id: 'admin-id-1234-5678',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'user-id-5678-1234',
      name: 'Nguyen Van A',
      email: 'user.a@example.com',
      role: 'user',
      createdAt: '2026-11-02T12:00:00.000Z',
      updatedAt: '2026-11-02T12:00:00.000Z',
    },
    {
      id: 'user-id-9999-0000',
      name: 'Le Thi B',
      email: 'user.b@example.com',
      role: 'user',
      createdAt: '2026-11-03T15:00:00.000Z',
      updatedAt: '2026-11-03T15:00:00.000Z',
    },
  ]

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
      value: { writeText: mockWriteText },
      configurable: true,
      writable: true,
    })

    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:test')
    window.URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    queryClient.clear()
  })

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UsersListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('hiển thị tiêu đề trang, 4 thẻ thống kê và danh sách người dùng', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValue(mockUsers)

    renderComponent()

    // Chờ danh sách người dùng tải xong
    await waitFor(() => {
      expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    })

    // Kiểm tra tiêu đề trang
    expect(screen.getByText('Quản Trị Người Dùng')).toBeDefined()

    // Kiểm tra thẻ thống kê
    expect(screen.getByText('Tổng Thành Viên')).toBeDefined()
    expect(screen.getByText('Quản Trị Viên')).toBeDefined()
    expect(screen.getByText('Người Dùng Tiêu Chuẩn')).toBeDefined()

    // Kiểm tra thông tin các users hiển thị trong bảng
    expect(screen.getAllByText('admin@example.com').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Nguyen Van A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Le Thi B').length).toBeGreaterThanOrEqual(1)
  })

  it('lọc danh sách khi người dùng nhập từ khóa tìm kiếm', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValue(mockUsers)

    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên, email, UUID...')
    fireEvent.change(searchInput, { target: { value: 'Le Thi' } })

    // Chỉ còn Le Thi B
    expect(screen.getAllByText('Le Thi B').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('System Admin')).toBeNull()
    expect(screen.queryByText('Nguyen Van A')).toBeNull()
  })

  it('lọc danh sách theo vai trò (Role Filter Pills)', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValue(mockUsers)

    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    })

    // Bấm lọc Admin
    const adminPill = screen.getByRole('button', { name: /Admin \(1\)/i })
    fireEvent.click(adminPill)

    expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByText('Nguyen Van A')).toBeNull()

    // Bấm lọc User
    const userPill = screen.getByRole('button', { name: /User \(2\)/i })
    fireEvent.click(userPill)

    expect(screen.queryByText('System Admin')).toBeNull()
    expect(screen.getAllByText('Nguyen Van A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Le Thi B').length).toBeGreaterThanOrEqual(1)
  })

  it('mở modal chi tiết người dùng khi bấm vào dòng hoặc nút Chi tiết', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValue(mockUsers)

    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    })

    // Bấm vào nút chi tiết đầu tiên
    const detailButtons = screen.getAllByRole('button', { name: /Chi tiết/i })
    fireEvent.click(detailButtons[0])

    // Modal hiển thị
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeDefined()
    })

    expect(screen.getByText('Mã Định Danh (UUID)')).toBeDefined()
    expect(screen.getByText('admin-id-1234-5678')).toBeDefined()

    // Bấm đóng modal
    const closeBtn = screen.getByRole('button', { name: 'Đóng modal' })
    fireEvent.click(closeBtn)

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull()
    })
  })

  it('hiển thị thông báo rỗng khi tìm kiếm không có kết quả và hỗ trợ reset', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValue(mockUsers)

    renderComponent()

    await waitFor(() => {
      expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
    })

    const searchInput = screen.getByPlaceholderText('Tìm theo tên, email, UUID...')
    fireEvent.change(searchInput, { target: { value: 'KhôngTồnTại123' } })

    expect(screen.getByText('Không tìm thấy người dùng nào')).toBeDefined()

    // Bấm Xóa Bộ Lọc
    const resetBtn = screen.getByRole('button', { name: /Xóa Bộ Lọc/i })
    fireEvent.click(resetBtn)

    expect(screen.getAllByText('System Admin').length).toBeGreaterThanOrEqual(1)
  })

  it('hiển thị giao diện báo lỗi khi API thất bại và có nút Thử lại', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockRejectedValue(new Error('Server Error'))

    renderComponent()

    await waitFor(() => {
      expect(screen.getByText('Không thể tải danh sách người dùng')).toBeDefined()
    })

    expect(screen.getByRole('button', { name: /Thử Lại Ngay/i })).toBeDefined()
  })
})
