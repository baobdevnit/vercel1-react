import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { ApiErrorResponse } from '@/types/api'
import { getStoredToken } from '@/utils/token'
import { useAuthStore } from '@/stores/auth.store'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

/**
 * Axios instance gốc được cấu hình sẵn cho toàn bộ ứng dụng
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request Interceptor: Tự động đính kèm Token nếu người dùng đã đăng nhập
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor: Tự động bắt lỗi 401 (hết hạn / blacklist) và 403 (không đủ quyền)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response) {
      const status = error.response.status

      // 401 Unauthorized: Token không hợp lệ, hết hạn, hoặc đã bị thu hồi qua Token Blacklist
      if (status === 401) {
        useAuthStore.getState().clearAuth()

        // Tránh vòng lặp redirect vô tận nếu người dùng đang ở trang login / register
        if (
          typeof window !== 'undefined' &&
          !window.location.pathname.includes('/login') &&
          !window.location.pathname.includes('/register')
        ) {
          window.location.href = '/login?expired=true'
        }
      }

      // 403 Forbidden: Không đủ quyền truy cập (Người dùng thường truy cập tài nguyên Admin)
      if (status === 403) {
        console.warn(
          `[API 403 Forbidden] Người dùng không có quyền truy cập endpoint: ${error.config?.url}`,
        )
      }
    }

    return Promise.reject(error)
  },
)

/**
 * Tiện ích trích xuất thông báo lỗi thân thiện từ phản hồi API
 */
export function getErrorMessage(error: unknown, fallback: string = 'Đã có lỗi xảy ra'): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const responseData = error.response?.data
    if (responseData?.message) {
      if (Array.isArray(responseData.message)) {
        return responseData.message.join(', ')
      }
      return responseData.message
    }

    if (responseData?.error) {
      return responseData.error
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Quá thời gian kết nối đến máy chủ API (Timeout).'
    }

    if (error.message === 'Network Error' || !error.response) {
      return 'Không thể kết nối đến máy chủ API. Vui lòng kiểm tra lại kết nối mạng hoặc trạng thái máy chủ.'
    }

    if (error.response?.status === 401) {
      return 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
    }

    if (error.response?.status === 403) {
      return 'Bạn không có quyền thực hiện hành động này.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
