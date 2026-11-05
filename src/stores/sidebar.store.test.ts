import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  useSidebarStore,
  SIDEBAR_STORAGE_KEY,
  getStoredSidebarCollapsed,
  setStoredSidebarCollapsed,
} from './sidebar.store'

describe('useSidebarStore Suite', () => {
  beforeEach(() => {
    localStorage.clear()
    useSidebarStore.setState({
      isCollapsed: false,
      isMobileOpen: false,
    })
  })

  it('khởi tạo với trạng thái mặc định không thu gọn và mobile đóng', () => {
    const state = useSidebarStore.getState()
    expect(state.isCollapsed).toBe(false)
    expect(state.isMobileOpen).toBe(false)
  })

  it('toggleCollapse chuyển đổi isCollapsed và lưu vào localStorage', () => {
    expect(useSidebarStore.getState().isCollapsed).toBe(false)

    useSidebarStore.getState().toggleCollapse()
    expect(useSidebarStore.getState().isCollapsed).toBe(true)
    expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('true')

    useSidebarStore.getState().toggleCollapse()
    expect(useSidebarStore.getState().isCollapsed).toBe(false)
    expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('false')
  })

  it('setCollapsed thiết lập chính xác giá trị và lưu vào localStorage', () => {
    useSidebarStore.getState().setCollapsed(true)
    expect(useSidebarStore.getState().isCollapsed).toBe(true)
    expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('true')

    useSidebarStore.getState().setCollapsed(false)
    expect(useSidebarStore.getState().isCollapsed).toBe(false)
    expect(localStorage.getItem(SIDEBAR_STORAGE_KEY)).toBe('false')
  })

  it('openMobile, closeMobile, và toggleMobile hoạt động chính xác', () => {
    expect(useSidebarStore.getState().isMobileOpen).toBe(false)

    useSidebarStore.getState().openMobile()
    expect(useSidebarStore.getState().isMobileOpen).toBe(true)

    useSidebarStore.getState().closeMobile()
    expect(useSidebarStore.getState().isMobileOpen).toBe(false)

    useSidebarStore.getState().toggleMobile()
    expect(useSidebarStore.getState().isMobileOpen).toBe(true)

    useSidebarStore.getState().toggleMobile()
    expect(useSidebarStore.getState().isMobileOpen).toBe(false)
  })

  it('initSidebar khôi phục trạng thái từ localStorage', () => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, 'true')
    useSidebarStore.getState().initSidebar()

    expect(useSidebarStore.getState().isCollapsed).toBe(true)
    expect(useSidebarStore.getState().isMobileOpen).toBe(false)
  })

  it('xử lý an toàn khi localStorage bị lỗi trong getStoredSidebarCollapsed / setStoredSidebarCollapsed', () => {
    const originalGetItem = localStorage.getItem
    const originalSetItem = localStorage.setItem

    // Giả lập throw lỗi từ getItem
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Access denied')
    })
    expect(getStoredSidebarCollapsed()).toBe(false)

    // Giả lập throw lỗi từ setItem
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded')
    })
    expect(() => setStoredSidebarCollapsed(true)).not.toThrow()

    // Khôi phục
    Storage.prototype.getItem = originalGetItem
    Storage.prototype.setItem = originalSetItem
  })
})
