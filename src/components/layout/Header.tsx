import { useNavigate, useLocation } from 'react-router-dom'
import {
  Menu,
  LogOut,
  User as UserIcon,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useSidebar } from '@/stores/sidebar.store'
import {
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  ThemeToggle,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui'
import { HealthStatusWidget } from '@/features/health/components/HealthStatusWidget'

export interface HeaderProps {
  /** Callback tùy chọn khi bấm nút chuyển đổi sidebar (nếu không truyền sẽ dùng useSidebar) */
  onToggleSidebar?: () => void
}

export function Header({ onToggleSidebar }: HeaderProps = {}) {
  const { user, logout, isSubmitting } = useAuth()
  const { isCollapsed, toggleCollapse, toggleMobile } = useSidebar()
  const navigate = useNavigate()
  const location = useLocation()

  // Map path to friendly breadcrumb title
  const getPageTitle = (path: string): string => {
    if (path.startsWith('/admin/users')) return 'Quản Trị Người Dùng'
    if (path.startsWith('/profile')) return 'Hồ Sơ Cá Nhân'
    if (path.startsWith('/health')) return 'Giám Sát Hệ Thống'
    if (path.startsWith('/showcase')) return 'UI & API Showcase'
    if (path.startsWith('/dashboard')) return 'Tổng Quan Dashboard'
    return 'Dashboard'
  }

  const handleToggle = () => {
    if (onToggleSidebar) {
      onToggleSidebar()
    } else if (typeof window !== 'undefined' && window.innerWidth < 768) {
      toggleMobile()
    } else {
      toggleCollapse()
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="h-16 border-b border-zinc-200/60 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between shadow-xs transition-colors duration-200">
      {/* Left: Sidebar Toggle Button & Page Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleToggle}
              data-testid="header-sidebar-toggle-btn"
              className="p-2 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-hidden"
              aria-label={
                isCollapsed
                  ? 'Mở rộng menu thanh bên (Ctrl+B)'
                  : 'Thu gọn menu thanh bên (Ctrl+B)'
              }
              aria-expanded={!isCollapsed}
            >
              {/* Icon trên Desktop: PanelLeftOpen hoặc PanelLeftClose */}
              <span className="hidden md:flex items-center justify-center">
                {isCollapsed ? (
                  <PanelLeftOpen className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                ) : (
                  <PanelLeftClose className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                )}
              </span>
              {/* Icon trên Mobile: Menu drawer toggle */}
              <span className="flex md:hidden items-center justify-center">
                <Menu className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" sideOffset={6}>
            <p className="hidden md:block">
              {isCollapsed
                ? 'Mở rộng menu thanh bên (Ctrl+B)'
                : 'Thu gọn menu thanh bên (Ctrl+B)'}
            </p>
            <p className="md:hidden">Mở menu</p>
          </TooltipContent>
        </Tooltip>

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 font-sans truncate">
            {getPageTitle(location.pathname)}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span>/</span>
            <span className="font-mono text-zinc-700 dark:text-zinc-400 font-medium">
              {location.pathname}
            </span>
          </span>
        </div>
      </div>

      {/* Right: Health quick pill, Theme toggle, User info, Logout */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Quick Health Status Live Indicator Widget */}
        <HealthStatusWidget variant="compact" className="hidden lg:flex" />

        {/* Nút chuyển đổi giao diện sáng / tối */}
        <ThemeToggle variant="icon" />

        {/* User preview with shadcn Avatar */}
        {user && (
          <div className="flex items-center gap-3 pl-2 sm:border-l border-zinc-200 dark:border-zinc-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 max-w-[140px] truncate">
                {user.name}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant={user.role === 'admin' ? 'admin' : 'user'} size="sm">
                  {user.role}
                </Badge>
              </div>
            </div>

            <Avatar
              onClick={() => navigate('/profile')}
              className="cursor-pointer hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-600 transition-all h-9 w-9"
              title={`${user.name} (${user.email}) - Xem hồ sơ`}
            >
              <AvatarFallback className="bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-semibold text-xs border border-zinc-300 dark:border-zinc-700">
                {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          isLoading={isSubmitting}
          iconPrefix={<LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
        >
          <span className="hidden sm:inline">Đăng xuất</span>
        </Button>
      </div>
    </header>
  )
}
