import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useThemeStore,
  THEME_STORAGE_KEY,
  resolveTheme,
  applyThemeToDOM,
} from './theme.store'

describe('Theme Store & Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    document.documentElement.removeAttribute('data-theme')
    vi.restoreAllMocks()
  })

  it('phát hiện và chuyển đổi đúng theme hệ thống', () => {
    expect(resolveTheme('light')).toBe('light')
    expect(resolveTheme('dark')).toBe('dark')
    // Mặc định hoặc fallback system
    const system = resolveTheme('system')
    expect(['light', 'dark']).toContain(system)
  })

  it('áp dụng đúng class và data-theme trên DOM', () => {
    applyThemeToDOM('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')

    applyThemeToDOM('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('cho phép set theme sáng / tối và ghi vào localStorage', () => {
    const store = useThemeStore.getState()

    store.setTheme('light')
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)

    store.setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('toggleTheme đảo ngược trạng thái giữa sáng và tối', () => {
    const store = useThemeStore.getState()

    store.setTheme('dark')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')

    store.toggleTheme()
    expect(useThemeStore.getState().resolvedTheme).toBe('light')

    store.toggleTheme()
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
  })

  it('initTheme khôi phục lựa chọn đã lưu trong localStorage', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light')

    useThemeStore.getState().initTheme()
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
