import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiClient, getErrorMessage } from './client'
import { useAuthStore } from '@/stores/auth.store'
import { setStoredToken } from '@/utils/token'
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios'

describe('apiClient & getErrorMessage', () => {
  beforeEach(() => {
    localStorage.clear()
    useAuthStore.getState().clearAuth()
  })

  describe('getErrorMessage', () => {
    it('trích xuất mảng message lỗi từ NestJS validation DTO thành chuỗi nối', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            statusCode: 400,
            message: ['Email không đúng định dạng', 'Mật khẩu phải có ít nhất 6 ký tự'],
            error: 'Bad Request',
          },
        },
      }
      expect(getErrorMessage(error)).toBe(
        'Email không đúng định dạng, Mật khẩu phải có ít nhất 6 ký tự',
      )
    })

    it('trích xuất chuỗi message lỗi đơn lẻ từ backend', () => {
      const error = {
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            statusCode: 409,
            message: 'Email này đã được sử dụng',
          },
        },
      }
      expect(getErrorMessage(error)).toBe('Email này đã được sử dụng')
    })

    it('xử lý lỗi mất kết nối máy chủ / Network Error', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
      }
      expect(getErrorMessage(error)).toContain('Không thể kết nối đến máy chủ API')
    })

    it('xử lý lỗi quá thời gian chờ (Timeout)', () => {
      const error = {
        isAxiosError: true,
        code: 'ECONNABORTED',
        message: 'timeout of 15000ms exceeded',
      }
      expect(getErrorMessage(error)).toContain('Quá thời gian kết nối')
    })

    it('xử lý đối tượng Error thông thường', () => {
      const error = new Error('Lỗi logic ứng dụng')
      expect(getErrorMessage(error)).toBe('Lỗi logic ứng dụng')
    })

    it('trả về fallback mặc định khi gặp kiểu dữ liệu không xác định', () => {
      expect(getErrorMessage(null, 'Lỗi mặc định')).toBe('Lỗi mặc định')
    })
  })

  describe('apiClient Interceptors', () => {
    it('Request Interceptor tự động gắn Bearer Token nếu có trong storage', async () => {
      setStoredToken('my-test-bearer-token')

      const mockConfig = {
        headers: {},
      } as unknown as InternalAxiosRequestConfig

      // Tìm và thực thi fulfilled request handler
      const requestHandler = (
        apiClient.interceptors.request as unknown as {
          handlers: Array<{ fulfilled: (cfg: InternalAxiosRequestConfig) => InternalAxiosRequestConfig }>
        }
      ).handlers[0]

      const result = await requestHandler.fulfilled(mockConfig)
      expect(result.headers.Authorization).toBe('Bearer my-test-bearer-token')
    })

    it('Response Interceptor 401 tự động kích hoạt clearAuth', async () => {
      useAuthStore.setState({
        isAuthenticated: true,
        token: 'expiring-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test',
          role: 'user',
          createdAt: '',
          updatedAt: '',
        },
      })

      const clearAuthSpy = vi.spyOn(useAuthStore.getState(), 'clearAuth')

      const responseHandler = (
        apiClient.interceptors.response as unknown as {
          handlers: Array<{
            rejected: (err: unknown) => Promise<never>
            fulfilled: (res: AxiosResponse) => AxiosResponse
          }>
        }
      ).handlers[0]

      const error401 = {
        response: {
          status: 401,
          data: { message: 'Unauthorized' },
        },
        config: { url: '/auth/me' },
      }

      await expect(responseHandler.rejected(error401)).rejects.toBeDefined()
      expect(useAuthStore.getState().isAuthenticated).toBe(false)
      clearAuthSpy.mockRestore()
    })
  })
})
