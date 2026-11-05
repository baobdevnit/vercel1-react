import { create } from 'zustand'

export const SIDEBAR_STORAGE_KEY = 'sidebar-collapsed'

export interface SidebarState {
  /** Trạng thái thu gọn trên màn hình máy tính (desktop) */
  isCollapsed: boolean
  /** Trạng thái mở menu dạng drawer trên màn hình di động (mobile) */
  isMobileOpen: boolean

  // Actions
  toggleCollapse: () => void
  setCollapsed: (collapsed: boolean) => void
  openMobile: () => void
  closeMobile: () => void
  toggleMobile: () => void
  initSidebar: () => void
}

/**
 * Lấy trạng thái thu gọn thanh bên đã lưu trong localStorage
 */
export function getStoredSidebarCollapsed(): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false
  }
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/**
 * Lưu trạng thái thu gọn thanh bên vào localStorage
 */
export function setStoredSidebarCollapsed(collapsed: boolean): void {
  if (typeof window === 'undefined' || !window.localStorage) return
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
  } catch {
    // Bỏ qua lỗi lưu trữ trong môi trường bị chặn hoặc sandbox
  }
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  isCollapsed: getStoredSidebarCollapsed(),
  isMobileOpen: false,

  toggleCollapse: () => {
    const next = !get().isCollapsed
    setStoredSidebarCollapsed(next)
    set({ isCollapsed: next })
  },

  setCollapsed: (collapsed: boolean) => {
    setStoredSidebarCollapsed(collapsed)
    set({ isCollapsed: collapsed })
  },

  openMobile: () => {
    set({ isMobileOpen: true })
  },

  closeMobile: () => {
    set({ isMobileOpen: false })
  },

  toggleMobile: () => {
    set((state) => ({ isMobileOpen: !state.isMobileOpen }))
  },

  initSidebar: () => {
    const collapsed = getStoredSidebarCollapsed()
    set({ isCollapsed: collapsed, isMobileOpen: false })
  },
}))

/**
 * Custom hook tiện ích để thao tác với thanh bên sidebar
 */
export function useSidebar() {
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const isMobileOpen = useSidebarStore((s) => s.isMobileOpen)
  const toggleCollapse = useSidebarStore((s) => s.toggleCollapse)
  const setCollapsed = useSidebarStore((s) => s.setCollapsed)
  const openMobile = useSidebarStore((s) => s.openMobile)
  const closeMobile = useSidebarStore((s) => s.closeMobile)
  const toggleMobile = useSidebarStore((s) => s.toggleMobile)

  return {
    isCollapsed,
    isMobileOpen,
    toggleCollapse,
    setCollapsed,
    openMobile,
    closeMobile,
    toggleMobile,
  }
}
