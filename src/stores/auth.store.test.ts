import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './auth.store'
import { getStoredToken, getStoredUser } from '@/utils/token'
import type { User } from '@/types/api'

describe('useAuthStore & token storage', () => {
  const mockUser: User = {
    id: 'user-uuid-123',
    email: 'user@example.com',
    name: 'Nguyễn Văn A',
    role: 'user',
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  }

  const mockAdmin: User = {
    ...mockUser,
    id: 'admin-uuid-456',
    email: 'admin@example.com',
    role: 'admin',
  }

  const mockToken = 'mock-bearer-access-token'

  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().clearAuth()
  })

  it('khởi tạo với trạng thái chưa đăng nhập', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()
    expect(state.isAdmin()).toBe(false)
  })

  it('setAuth lưu thông tin user, token vào store và localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, mockToken)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
    expect(state.isAdmin()).toBe(false)

    expect(getStoredToken()).toBe(mockToken)
    expect(getStoredUser()).toEqual(mockUser)
  })

  it('isAdmin() trả về true khi user có role admin', () => {
    useAuthStore.getState().setAuth(mockAdmin, mockToken)

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.isAdmin()).toBe(true)
  })

  it('clearAuth xóa sạch thông tin khỏi store và localStorage', () => {
    useAuthStore.getState().setAuth(mockUser, mockToken)
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.token).toBeNull()

    expect(getStoredToken()).toBeNull()
    expect(getStoredUser()).toBeNull()
  })

  it('initAuth khôi phục phiên đăng nhập khi có dữ liệu trong storage', () => {
    useAuthStore.getState().setAuth(mockUser, mockToken)

    // Reset store state nhưng giữ localStorage
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false })

    useAuthStore.getState().initAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(mockUser)
    expect(state.token).toBe(mockToken)
  })

  it('initAuth dọn sạch nếu dữ liệu storage bị khuyết thiếu', () => {
    localStorage.setItem('access_token', 'orphan-token')
    // Không có user_info

    useAuthStore.getState().initAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(getStoredToken()).toBeNull()
  })
})
