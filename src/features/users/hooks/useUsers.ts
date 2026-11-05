import { useState, useMemo, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/features/users/services/users.api'
import type { User, UserRole } from '@/types/api'

export type SortField = 'createdAt' | 'name' | 'email' | 'role'
export type SortOrder = 'asc' | 'desc'
export type RoleFilter = 'all' | UserRole

export interface UserStats {
  totalUsers: number
  adminCount: number
  userCount: number
  filteredCount: number
}

export function useUsers() {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [sortBy, setSortBy] = useState<SortField>('createdAt')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Fetch danh sách users từ backend GET /users
  const {
    data: users = [],
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: () => usersApi.getAllUsers(),
    staleTime: 3 * 60 * 1000, // Caching 3 phút
    gcTime: 10 * 60 * 1000,
  })

  // Thống kê tổng quan dựa trên toàn bộ dữ liệu backend
  const stats: UserStats = useMemo(() => {
    const totalUsers = users.length
    let adminCount = 0
    let userCount = 0

    users.forEach((u) => {
      if (u.role === 'admin') adminCount++
      else userCount++
    })

    return {
      totalUsers,
      adminCount,
      userCount,
      filteredCount: 0, // sẽ được cập nhật bên dưới
    }
  }, [users])

  // Lọc theo search input và role filter
  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()

    return users.filter((u: User) => {
      // 1. Lọc theo role
      if (roleFilter !== 'all' && u.role !== roleFilter) {
        return false
      }

      // 2. Lọc theo từ khóa tìm kiếm (tên, email, uuid)
      if (q) {
        const matchName = u.name.toLowerCase().includes(q)
        const matchEmail = u.email.toLowerCase().includes(q)
        const matchId = u.id.toLowerCase().includes(q)
        if (!matchName && !matchEmail && !matchId) {
          return false
        }
      }

      return true
    })
  }, [users, searchQuery, roleFilter])

  // Cập nhật filteredCount vào stats
  const finalStats: UserStats = useMemo(() => {
    return {
      ...stats,
      filteredCount: filteredUsers.length,
    }
  }, [stats, filteredUsers.length])

  // Sắp xếp danh sách đã lọc
  const sortedUsers = useMemo(() => {
    const sorted = [...filteredUsers]

    sorted.sort((a, b) => {
      let comparison: number

      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
          break
        case 'email':
          comparison = a.email.localeCompare(b.email, 'en', { sensitivity: 'base' })
          break
        case 'role':
          comparison = a.role.localeCompare(b.role)
          break
        case 'createdAt':
        default: {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          comparison = timeA - timeB
          break
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredUsers, sortBy, sortOrder])

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)

  const paginatedUsers = useMemo(() => {
    const start = (safePage - 1) * pageSize
    return sortedUsers.slice(start, start + pageSize)
  }, [sortedUsers, safePage, pageSize])

  // Helper chuyển đổi sắp xếp
  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      } else {
        setSortBy(field)
        // Mặc định createdAt là desc (mới nhất trước), các trường khác là asc
        setSortOrder(field === 'createdAt' ? 'desc' : 'asc')
      }
      setPage(1)
    },
    [sortBy],
  )

  // Reset bộ lọc
  const resetFilters = useCallback(() => {
    setSearchQuery('')
    setRoleFilter('all')
    setSortBy('createdAt')
    setSortOrder('desc')
    setPage(1)
  }, [])

  // Xuất file CSV (kèm UTF-8 BOM cho Excel hiển thị đúng tiếng Việt)
  const exportToCsv = useCallback(() => {
    if (!users || users.length === 0) return

    const headers = ['ID', 'Họ Và Tên', 'Email', 'Vai Trò', 'Ngày Tạo', 'Ngày Cập Nhật']
    const rows = sortedUsers.map((u) => [
      `"${u.id}"`,
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email}"`,
      `"${u.role}"`,
      `"${u.createdAt ? new Date(u.createdAt).toLocaleString('vi-VN') : ''}"`,
      `"${u.updatedAt ? new Date(u.updatedAt).toLocaleString('vi-VN') : ''}"`,
    ])

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `render1_users_${dateStr}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [sortedUsers, users])

  // Xuất file JSON
  const exportToJson = useCallback(() => {
    if (!users || users.length === 0) return

    const jsonContent = JSON.stringify(sortedUsers, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('href', url)
    link.setAttribute('download', `render1_users_${dateStr}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [sortedUsers, users])

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query)
    setPage(1)
  }, [])

  const handleSetRoleFilter = useCallback((role: RoleFilter) => {
    setRoleFilter(role)
    setPage(1)
  }, [])

  const handleSetPageSize = useCallback((size: number) => {
    setPageSize(size)
    setPage(1)
  }, [])

  return {
    // Data
    users,
    filteredUsers: sortedUsers,
    paginatedUsers,
    stats: finalStats,

    // Status
    isLoading,
    isFetching,
    error,
    refetch,

    // Filters & Sorting
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    roleFilter,
    setRoleFilter: handleSetRoleFilter,
    sortBy,
    sortOrder,
    toggleSort,
    resetFilters,

    // Pagination
    page: safePage,
    setPage,
    pageSize,
    setPageSize: handleSetPageSize,
    totalPages,

    // Modal Details
    selectedUser,
    setSelectedUser,

    // Export helpers
    exportToCsv,
    exportToJson,
  }
}
