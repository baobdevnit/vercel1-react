import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useUsers } from './useUsers'
import { usersApi } from '@/features/users/services/users.api'
import type { User } from '@/types/api'

describe('useUsers hook', () => {
  let queryClient: QueryClient

  const mockUsersList: User[] = [
    {
      id: 'uuid-1',
      name: 'System Admin',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'uuid-2',
      name: 'Nguyen Van B',
      email: 'user.b@example.com',
      role: 'user',
      createdAt: '2026-11-02T12:00:00.000Z',
      updatedAt: '2026-11-02T12:00:00.000Z',
    },
    {
      id: 'uuid-3',
      name: 'Tran Van C',
      email: 'user.c@example.com',
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
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('fetch thành công danh sách users và tính toán stats chính xác', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.users).toHaveLength(3)
    expect(result.current.stats.totalUsers).toBe(3)
    expect(result.current.stats.adminCount).toBe(1)
    expect(result.current.stats.userCount).toBe(2)
    expect(result.current.stats.filteredCount).toBe(3)
  })

  it('lọc danh sách theo từ khóa tìm kiếm (searchQuery)', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSearchQuery('tran van')
    })

    expect(result.current.filteredUsers).toHaveLength(1)
    expect(result.current.filteredUsers[0].name).toBe('Tran Van C')
    expect(result.current.stats.filteredCount).toBe(1)
  })

  it('lọc danh sách theo vai trò (roleFilter)', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Lọc admin
    act(() => {
      result.current.setRoleFilter('admin')
    })
    expect(result.current.filteredUsers).toHaveLength(1)
    expect(result.current.filteredUsers[0].role).toBe('admin')

    // Lọc user
    act(() => {
      result.current.setRoleFilter('user')
    })
    expect(result.current.filteredUsers).toHaveLength(2)
  })

  it('sắp xếp danh sách theo các trường và đảo chiều sortOrder', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Chuyển sang sort theo name
    act(() => {
      result.current.toggleSort('name')
    })

    expect(result.current.sortBy).toBe('name')
    expect(result.current.sortOrder).toBe('asc')
    expect(result.current.filteredUsers[0].name).toBe('Nguyen Van B')

    // Bấm lại name để đảo sang desc
    act(() => {
      result.current.toggleSort('name')
    })

    expect(result.current.sortOrder).toBe('desc')
    expect(result.current.filteredUsers[0].name).toBe('Tran Van C')
  })

  it('phân trang hoạt động chính xác khi thay đổi pageSize và page', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Đặt pageSize = 2
    act(() => {
      result.current.setPageSize(2)
    })

    expect(result.current.totalPages).toBe(2)
    expect(result.current.paginatedUsers).toHaveLength(2)

    // Chuyển sang trang 2
    act(() => {
      result.current.setPage(2)
    })

    expect(result.current.page).toBe(2)
    expect(result.current.paginatedUsers).toHaveLength(1)
  })

  it('resetFilters đưa toàn bộ trạng thái tìm kiếm về mặc định', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.setSearchQuery('admin')
      result.current.setRoleFilter('admin')
      result.current.setPage(2)
    })

    expect(result.current.searchQuery).toBe('admin')
    expect(result.current.roleFilter).toBe('admin')

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.searchQuery).toBe('')
    expect(result.current.roleFilter).toBe('all')
    expect(result.current.sortBy).toBe('createdAt')
    expect(result.current.sortOrder).toBe('desc')
    expect(result.current.page).toBe(1)
  })

  it('quản lý trạng thái chọn user để xem modal chi tiết', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.selectedUser).toBeNull()

    act(() => {
      result.current.setSelectedUser(mockUsersList[0])
    })

    expect(result.current.selectedUser).toEqual(mockUsersList[0])

    act(() => {
      result.current.setSelectedUser(null)
    })

    expect(result.current.selectedUser).toBeNull()
  })

  it('hỗ trợ xuất danh sách ra file CSV và JSON không bị lỗi', async () => {
    vi.spyOn(usersApi, 'getAllUsers').mockResolvedValueOnce(mockUsersList)

    // Mock URL.createObjectURL and URL.revokeObjectURL
    const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url')
    const mockRevokeObjectURL = vi.fn()
    window.URL.createObjectURL = mockCreateObjectURL
    window.URL.revokeObjectURL = mockRevokeObjectURL

    const { result } = renderHook(() => useUsers(), { wrapper })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    // Gọi exportToCsv
    expect(() => {
      act(() => {
        result.current.exportToCsv()
      })
    }).not.toThrow()

    // Gọi exportToJson
    expect(() => {
      act(() => {
        result.current.exportToJson()
      })
    }).not.toThrow()

    expect(mockCreateObjectURL).toHaveBeenCalled()
    expect(mockRevokeObjectURL).toHaveBeenCalled()
  })
})
