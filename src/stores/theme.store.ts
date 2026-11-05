import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'theme-preference'

/**
 * Phát hiện theme của hệ điều hành / trình duyệt
 */
export function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'dark'
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch {
    return 'dark'
  }
}

/**
 * Chuyển ThemeMode ('light' | 'dark' | 'system') thành ResolvedTheme ('light' | 'dark')
 */
export function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'system') {
    return getSystemTheme()
  }
  return mode
}

/**
 * Cập nhật thuộc tính DOM trên phần tử gốc <html>
 */
export function applyThemeToDOM(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (resolved === 'dark') {
    root.classList.add('dark')
    root.classList.remove('light')
  } else {
    root.classList.remove('dark')
    root.classList.add('light')
  }
  root.setAttribute('data-theme', resolved)
  root.style.colorScheme = resolved
}

export interface ThemeState {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
  initTheme: () => void
}

let systemListenerAttached = false

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'system',
  resolvedTheme: 'dark',

  setTheme: (newTheme: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch {
      // Bỏ qua lỗi lưu trữ trong môi trường bị chặn hoặc sandbox
    }

    const resolved = resolveTheme(newTheme)
    applyThemeToDOM(resolved)
    set({ theme: newTheme, resolvedTheme: resolved })
  },

  toggleTheme: () => {
    const currentResolved = get().resolvedTheme
    // Đảo ngược giữa sáng và tối
    const nextTheme: ThemeMode = currentResolved === 'dark' ? 'light' : 'dark'
    get().setTheme(nextTheme)
  },

  initTheme: () => {
    let savedTheme: ThemeMode = 'system'
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        savedTheme = stored
      }
    } catch {
      // Fallback mặc định system
    }

    const resolved = resolveTheme(savedTheme)
    applyThemeToDOM(resolved)
    set({ theme: savedTheme, resolvedTheme: resolved })

    // Lắng nghe sự thay đổi giao diện từ hệ điều hành nếu đang ở chế độ 'system'
    if (typeof window !== 'undefined' && window.matchMedia && !systemListenerAttached) {
      try {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        const handleSystemChange = () => {
          if (get().theme === 'system') {
            const updatedResolved = mediaQuery.matches ? 'dark' : 'light'
            applyThemeToDOM(updatedResolved)
            set({ resolvedTheme: updatedResolved })
          }
        }

        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener('change', handleSystemChange)
          systemListenerAttached = true
        } else if (mediaQuery.addListener) {
          mediaQuery.addListener(handleSystemChange)
          systemListenerAttached = true
        }
      } catch {
        // matchMedia có thể bị giới hạn trong môi trường kiểm thử
      }
    }
  },
}))

/**
 * Custom hook tiện ích để thao tác với giao diện sáng/tối
 */
export function useTheme() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useThemeStore()

  return {
    theme,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
    setTheme,
    toggleTheme,
    setLight: () => setTheme('light'),
    setDark: () => setTheme('dark'),
    setSystem: () => setTheme('system'),
  }
}
