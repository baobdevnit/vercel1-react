import { create } from 'zustand'
import type { User } from '@/types/api'
import {
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
  clearAuthStorage,
} from '@/utils/token'

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  initAuth: () => void

  // Computed / Selectors
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user: User, token: string) => {
    setStoredToken(token)
    setStoredUser(user)
    set({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    })
  },

  setUser: (user: User) => {
    setStoredUser(user)
    set({ user })
  },

  clearAuth: () => {
    clearAuthStorage()
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  initAuth: () => {
    const token = getStoredToken()
    const user = getStoredUser()

    if (token && user) {
      set({
        token,
        user,
        isAuthenticated: true,
        isLoading: false,
      })
    } else {
      // Dữ liệu không đồng bộ, dọn sạch storage
      clearAuthStorage()
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  isAdmin: () => {
    return get().user?.role === 'admin'
  },
}))
