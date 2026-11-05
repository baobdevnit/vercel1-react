import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { AuthResponse, LoginDto, LogoutResponse, RegisterDto, User } from '@/types/api'

export const authApi = {
  /**
   * Đăng nhập người dùng bằng email và mật khẩu
   */
  login: async (dto: LoginDto): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, dto)
    return res.data
  },

  /**
   * Đăng ký tài khoản người dùng mới
   */
  register: async (dto: RegisterDto): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, dto)
    return res.data
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT access_token
   */
  getMe: async (): Promise<User> => {
    const res = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME)
    return res.data
  },

  /**
   * Đăng xuất và đưa token vào Blacklist trên máy chủ backend
   */
  logout: async (): Promise<LogoutResponse> => {
    const res = await apiClient.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)
    return res.data
  },
}
