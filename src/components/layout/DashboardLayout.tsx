import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { useSidebar, useSidebarStore } from '@/stores/sidebar.store'
import { TooltipProvider } from '@/components/ui'

export function DashboardLayout() {
  const { toggleCollapse, closeMobile } = useSidebar()

  // Lắng nghe phím tắt Ctrl+B / Cmd+B để thu gọn / mở ra sidebar và Escape để đóng mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Không kích hoạt phím tắt khi người dùng đang nhập dữ liệu vào ô input/textarea
      const target = e.target as HTMLElement | null
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        if (!isInput) {
          e.preventDefault()
          toggleCollapse()
        }
      } else if (e.key === 'Escape') {
        if (useSidebarStore.getState().isMobileOpen) {
          closeMobile()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleCollapse, closeMobile])

  return (
    <TooltipProvider delayDuration={200}>
      <div className="min-h-screen flex bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-zinc-100 relative font-sans transition-colors duration-200">
        {/* Subtle modern ambient background glow */}
        <div className="fixed inset-0 pointer-events-none dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(255,255,255,0.03),transparent_80%)] bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(0,0,0,0.02),transparent_80%)] -z-10" />

        {/* Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300">
          <Header />

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
