import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/features/auth/services/auth.api'
import { getErrorMessage } from '@/api/client'
import type { LoginDto, RegisterDto, AuthResponse } from '@/types/api'

export interface AuthActionResult {
  success: boolean
  data?: AuthResponse
  error?: string
}

export function useAuth() {
  const navigate = useNavigate()
  const { user, token, isAuthenticated, isLoading, isAdmin, setAuth, clearAuth } = useAuthStore()

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [authError, setAuthError] = useState<string | null>(null)

  /**
   * Đăng nhập với email và password
   */
  const login = useCallback(
    async (dto: LoginDto, redirectTo: string = '/dashboard'): Promise<AuthActionResult> => {
      setIsSubmitting(true)
      setAuthError(null)

      try {
        const response = await authApi.login(dto)
        const userProfile = response.user ?? (await authApi.getMe())

        setAuth(userProfile, response.access_token)
        navigate(redirectTo, { replace: true })
        return { success: true, data: response }
      } catch (err) {
        const message = getErrorMessage(err, 'Đăng nhập không thành công. Vui lòng thử lại.')
        setAuthError(message)
        return { success: false, error: message }
      } finally {
        setIsSubmitting(false)
      }
    },
    [navigate, setAuth],
  )

  /**
   * Đăng ký tài khoản người dùng mới
   */
  const register = useCallback(
    async (dto: RegisterDto, redirectTo: string = '/dashboard'): Promise<AuthActionResult> => {
      setIsSubmitting(true)
      setAuthError(null)

      try {
        const response = await authApi.register(dto)
        const userProfile = response.user ?? (await authApi.getMe())

        setAuth(userProfile, response.access_token)
        navigate(redirectTo, { replace: true })
        return { success: true, data: response }
      } catch (err) {
        const message = getErrorMessage(
          err,
          'Đăng ký tài khoản không thành công. Vui lòng kiểm tra lại thông tin.',
        )
        setAuthError(message)
        return { success: false, error: message }
      } finally {
        setIsSubmitting(false)
      }
    },
    [navigate, setAuth],
  )

  /**
   * Đăng xuất và thu hồi JWT Bearer Token qua blacklist trên backend
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsSubmitting(true)

    try {
      await authApi.logout()
    } catch (err) {
      console.warn('Lỗi khi thu hồi token phía máy chủ (Token Blacklist):', err)
    } finally {
      clearAuth()
      setIsSubmitting(false)
      navigate('/login')
    }
  }, [clearAuth, navigate])

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    isAdmin,
    isSubmitting,
    authError,
    setAuthError,
    login,
    register,
    logout,
  }
}
