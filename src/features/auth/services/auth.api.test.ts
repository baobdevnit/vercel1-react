import { describe, it, expect, vi, beforeEach } from 'vitest'
import { authApi } from './auth.api'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { AuthResponse, LogoutResponse, User } from '@/types/api'

vi.mock('@/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe('authApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('login gửi thông tin đăng nhập chính xác đến /auth/login', async () => {
    const mockAuthResponse: AuthResponse = {
      message: 'Đăng nhập thành công',
      access_token: 'fake-jwt-token',
      token_type: 'Bearer',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        createdAt: '2026-11-05',
        updatedAt: '2026-11-05',
      },
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockAuthResponse })

    const result = await authApi.login({
      email: 'admin@example.com',
      password: 'Admin@123456',
    })

    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGIN, {
      email: 'admin@example.com',
      password: 'Admin@123456',
    })
    expect(result).toEqual(mockAuthResponse)
  })

  it('register gửi thông tin đăng ký chính xác đến /auth/register', async () => {
    const mockRegisterResponse: AuthResponse = {
      message: 'Đăng ký tài khoản thành công',
      access_token: 'fake-jwt-token-register',
      token_type: 'Bearer',
      user: {
        id: 'user-new',
        email: 'new@example.com',
        name: 'New User',
        role: 'user',
        createdAt: '2026-11-05',
        updatedAt: '2026-11-05',
      },
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockRegisterResponse })

    const result = await authApi.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'Password123!',
    })

    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.REGISTER, {
      name: 'New User',
      email: 'new@example.com',
      password: 'Password123!',
    })
    expect(result).toEqual(mockRegisterResponse)
  })

  it('getMe gọi endpoint /auth/me để lấy hồ sơ người dùng', async () => {
    const mockUser: User = {
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: '2026-11-05',
      updatedAt: '2026-11-05',
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUser })

    const result = await authApi.getMe()

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.ME)
    expect(result).toEqual(mockUser)
  })

  it('logout gọi endpoint /auth/logout để đưa token vào blacklist', async () => {
    const mockLogoutResponse: LogoutResponse = {
      message: 'Đăng xuất thành công',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockLogoutResponse })

    const result = await authApi.logout()

    expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUTH.LOGOUT)
    expect(result).toEqual(mockLogoutResponse)
  })
})
