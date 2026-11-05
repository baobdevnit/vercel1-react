import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeToggle } from './theme-toggle'
import { useThemeStore } from '@/stores/theme.store'

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    useThemeStore.setState({ theme: 'system', resolvedTheme: 'dark' })
    vi.restoreAllMocks()
  })

  it('render nút icon mặc định và chuyển đổi qua lại khi click', () => {
    render(<ThemeToggle variant="icon" />)

    const button = screen.getByRole('button')
    expect(button).toBeDefined()

    // Đang dark -> click chuyển sang light
    fireEvent.click(button)
    expect(useThemeStore.getState().resolvedTheme).toBe('light')

    // Đang light -> click chuyển sang dark
    fireEvent.click(button)
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
  })

  it('render dạng segmented control với 3 lựa chọn Sáng, Tối, Hệ thống', () => {
    render(<ThemeToggle variant="segmented" />)

    const lightOption = screen.getByRole('radio', { name: /sáng/i })
    const darkOption = screen.getByRole('radio', { name: /tối/i })
    const systemOption = screen.getByRole('radio', { name: /hệ thống/i })

    expect(lightOption).toBeDefined()
    expect(darkOption).toBeDefined()
    expect(systemOption).toBeDefined()

    // Chọn Sáng
    fireEvent.click(lightOption)
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')

    // Chọn Tối
    fireEvent.click(darkOption)
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')

    // Chọn Hệ thống
    fireEvent.click(systemOption)
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('render dạng dropdown và mở menu chọn chế độ khi click', () => {
    render(<ThemeToggle variant="dropdown" showLabel />)

    const trigger = screen.getByRole('button')
    fireEvent.click(trigger)

    // Menu xuất hiện
    const lightItem = screen.getByText('Giao diện Sáng')
    expect(lightItem).toBeDefined()

    fireEvent.click(lightItem)
    expect(useThemeStore.getState().theme).toBe('light')
  })
})
