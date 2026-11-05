import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  User as UserIcon,
  Activity,
  Users,
  Layers,
  ExternalLink,
  X,
  Server,
  Lock,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { useSidebarStore } from '@/stores/sidebar.store'
import {
  Badge,
  Avatar,
  AvatarFallback,
  BrandCrest,
  ThemeToggle,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui'
import { cn } from '@/lib/utils'

export interface SidebarProps {
  /** Trạng thái mở menu mobile (nếu truyền vào sẽ ưu tiên hơn store) */
  isOpen?: boolean
  /** Hàm callback đóng menu mobile */
  onClose?: () => void
  /** Trạng thái thu gọn trên desktop (nếu truyền vào sẽ ưu tiên hơn store) */
  isCollapsed?: boolean
  /** Hàm callback chuyển đổi thu gọn / mở rộng */
  onToggleCollapse?: () => void
}

export function Sidebar({
  isOpen: propIsOpen,
  onClose: propOnClose,
  isCollapsed: propIsCollapsed,
  onToggleCollapse: propOnToggleCollapse,
}: SidebarProps = {}) {
  const { user, isAdmin } = useAuthStore()
  const store = useSidebarStore()

  // Cho phép ghi đè từ props hoặc dùng trực tiếp từ zustand store
  const isMobileOpen = propIsOpen !== undefined ? propIsOpen : store.isMobileOpen
  const closeMobile = propOnClose || store.closeMobile
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : store.isCollapsed
  const toggleCollapse = propOnToggleCollapse || store.toggleCollapse

  const userIsAdmin = isAdmin() || user?.role === 'admin'
  const apiUrl = import.meta.env.VITE_API_URL || 'https://render1-api.onrender.com'

  const navItems = [
    {
      to: '/dashboard',
      label: 'Tổng quan Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/profile',
      label: 'Hồ sơ cá nhân',
      icon: UserIcon,
      badge: null,
    },
    {
      to: '/health',
      label: 'Giám sát hệ thống',
      icon: Activity,
      badge: 'Live',
    },
    // Mục chỉ dành cho Admin
    ...(userIsAdmin
      ? [
          {
            to: '/admin/users',
            label: 'Quản trị người dùng',
            icon: Users,
            badge: 'Admin',
          },
        ]
      : []),
    {
      to: '/showcase',
      label: 'UI & API Showcase',
      icon: Layers,
      badge: 'Dev',
    },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          data-testid="sidebar-backdrop"
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs md:hidden transition-opacity"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        data-testid="sidebar"
        data-collapsed={isCollapsed}
        aria-label="Thanh bên điều hướng"
        className={cn(
          'fixed inset-y-0 left-0 z-50 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex flex-col transition-all duration-300 ease-in-out font-sans select-none',
          // Mobile: trượt ra vào màn hình
          isMobileOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: static, không lệch translate, thay đổi độ rộng theo trạng thái thu gọn
          'md:static md:translate-x-0 shadow-2xl md:shadow-none',
          isCollapsed ? 'w-72 md:w-[72px]' : 'w-72 md:w-72',
        )}
      >
        {/* Brand Header */}
        <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3.5 bg-white dark:bg-zinc-950 shrink-0 overflow-hidden">
          {isCollapsed ? (
            /* Brand Header khi thu gọn trên Desktop */
            <div className="w-full flex items-center justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 transition-colors focus:outline-hidden"
                    aria-label="Mở rộng menu thanh bên (Ctrl+B)"
                  >
                    <BrandCrest size="sm" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p className="font-semibold text-zinc-900 dark:text-zinc-100">Render I Portal</p>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Mở rộng menu thanh bên (Ctrl+B)
                  </p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Brand Header khi mở rộng */
            <>
              <div className="flex items-center gap-3 min-w-0">
                <BrandCrest size="md" />
                <div className="min-w-0">
                  <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 truncate">
                    Render I Portal
                    <span className="text-[10px] font-mono font-medium tracking-wider px-1.5 py-0.5 rounded border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      SPA
                    </span>
                  </span>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                    Nền Tảng Quản Trị Hệ Thống
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Nút thu gọn trên Desktop */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={toggleCollapse}
                      data-testid="sidebar-collapse-btn"
                      className="hidden md:flex p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      aria-label="Thu gọn menu thanh bên"
                    >
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={8}>
                    <p>Thu gọn menu thanh bên (Ctrl+B)</p>
                  </TooltipContent>
                </Tooltip>

                {/* Nút đóng menu trên Mobile */}
                <button
                  type="button"
                  onClick={closeMobile}
                  data-testid="sidebar-close-mobile-btn"
                  className="md:hidden p-1.5 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  aria-label="Đóng menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </div>

        {/* User Card Summary in Sidebar */}
        {user &&
          (isCollapsed ? (
            /* User Card thu gọn */
            <div className="my-3 flex justify-center px-2 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/profile"
                    onClick={closeMobile}
                    className="p-0.5 rounded-full ring-1 ring-zinc-300 dark:ring-zinc-700 hover:ring-zinc-500 dark:hover:ring-zinc-400 transition-all cursor-pointer focus:outline-hidden"
                    aria-label={`Hồ sơ cá nhân: ${user.name}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-200 font-semibold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-zinc-100">{user.name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                    <div className="pt-1 flex items-center gap-1.5">
                      <Badge variant={user.role === 'admin' ? 'admin' : 'user'} size="sm" dot>
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* User Card mở rộng */
            <div className="p-3 mx-3 my-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30 shrink-0 overflow-hidden">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0 ring-1 ring-zinc-200/80 dark:ring-zinc-700/60">
                  <AvatarFallback className="bg-zinc-200/70 text-zinc-900 dark:bg-zinc-800/80 dark:text-zinc-200 font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant={user.role === 'admin' ? 'admin' : 'user'} size="sm" dot>
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Navigation items */}
        <nav
          className={cn(
            'flex-1 py-2 space-y-1 overflow-y-auto overflow-x-hidden',
            isCollapsed ? 'px-2' : 'px-3',
          )}
        >
          {isCollapsed ? (
            /* Dải phân cách khi thu gọn */
            <div
              className="my-1.5 border-t border-zinc-200 dark:border-zinc-800 mx-1"
              aria-hidden="true"
            />
          ) : (
            /* Tiêu đề mục điều hướng khi mở rộng */
            <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-wider uppercase text-zinc-500 dark:text-zinc-400">
              Điều Hướng Hệ Thống
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon

            if (isCollapsed) {
              /* Mục điều hướng dạng Icon thu gọn có Tooltip */
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.to}
                      onClick={closeMobile}
                      aria-label={item.label}
                      className={({ isActive }) =>
                        cn(
                          'relative flex items-center justify-center h-10 w-10 mx-auto rounded-md transition-colors',
                          isActive
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={cn(
                              'w-5 h-5 transition-colors',
                              isActive
                                ? 'text-zinc-950 dark:text-zinc-100'
                                : 'text-zinc-500 dark:text-zinc-400',
                            )}
                          />
                          {/* Chấm tròn biểu thị huy hiệu khi thu gọn */}
                          {item.badge && (
                            <span
                              className={cn(
                                'absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-zinc-950',
                                item.badge === 'Admin'
                                  ? 'bg-purple-500'
                                  : item.badge === 'Live'
                                    ? 'bg-emerald-500'
                                    : 'bg-zinc-400',
                              )}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <div className="flex items-center gap-2">
                      <span>{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border uppercase',
                            item.badge === 'Admin'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/60'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            }

            /* Mục điều hướng dạng Đầy đủ khi mở rộng */
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  cn(
                    'group flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors',
                    isActive
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-semibold'
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={cn(
                          'w-4 h-4 shrink-0 transition-colors',
                          isActive
                            ? 'text-zinc-950 dark:text-zinc-100'
                            : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200',
                        )}
                      />
                      <span className="tracking-wide truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={cn(
                          'text-[10px] font-mono font-medium px-1.5 py-0.5 rounded border uppercase shrink-0',
                          isActive
                            ? 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 border-zinc-300 dark:border-zinc-600'
                            : item.badge === 'Admin'
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-200 dark:border-purple-800/60'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
                        )}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}

          {/* Admin Protected Note if normal user */}
          {!userIsAdmin &&
            (isCollapsed ? (
              <div className="pt-2 flex justify-center">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 cursor-help"
                      aria-label="Khu vực Quản trị viên được bảo vệ"
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    <p className="font-semibold text-zinc-100">Khu vực Bảo Mật Admin</p>
                    <p className="text-[11px] text-zinc-400">
                      Phân khu chỉ dành riêng cho Quản trị viên
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <div className="pt-4 px-2">
                <div className="p-3 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-900 dark:text-zinc-200">
                    <Lock className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
                    Khu vực Bảo Mật Admin
                  </div>
                  <p className="text-[11px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                    Phân khu dành riêng cho Quản trị viên (bảo vệ bởi <code>AdminRoute</code>).
                  </p>
                </div>
              </div>
            ))}
        </nav>

        {/* Footer info in Sidebar */}
        <div
          className={cn(
            'border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0',
            isCollapsed ? 'p-2 space-y-2' : 'p-3 space-y-2.5',
          )}
        >
          {isCollapsed ? (
            /* Footer khi thu gọn */
            <div className="flex flex-col items-center gap-2">
              {/* Nút đổi Theme dạng icon */}
              <ThemeToggle variant="icon" size="sm" />

              {/* Trạng thái Server gọn có chấm sáng */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer text-zinc-500"
                    aria-label="Trạng thái máy chủ API"
                  >
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <div className="space-y-0.5">
                    <p className="font-semibold text-emerald-400 flex items-center gap-1">
                      <Server className="w-3.5 h-3.5" />
                      Máy chủ API đang hoạt động
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      {apiUrl.replace('https://', '')}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>

              {/* Tài liệu Scalar gọn */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={`${apiUrl}/scalar`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Tài liệu API (Scalar)"
                    className="flex items-center justify-center p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p>Tài Liệu API (Scalar)</p>
                </TooltipContent>
              </Tooltip>

              {/* Nút mở rộng menu thanh bên từ cuối sidebar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={toggleCollapse}
                    data-testid="sidebar-expand-bottom-btn"
                    className="w-full flex items-center justify-center p-2 rounded-md text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    aria-label="Mở rộng menu thanh bên (Ctrl+B)"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={12}>
                  <p>Mở rộng menu thanh bên (Ctrl+B)</p>
                </TooltipContent>
              </Tooltip>
            </div>
          ) : (
            /* Footer khi mở rộng */
            <>
              {/* Quick theme segmented control in sidebar */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] text-zinc-600 dark:text-zinc-400 font-medium">
                  Giao diện:
                </span>
                <ThemeToggle variant="segmented" />
              </div>

              {/* Server info widget */}
              <div className="p-2.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30">
                <div className="flex items-center justify-between text-[11px] text-zinc-600 dark:text-zinc-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Server className="w-3 h-3 text-zinc-500 dark:text-zinc-400" />
                    Dịch Vụ Máy Chủ
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Hoạt động
                  </span>
                </div>
                <p className="font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-300 truncate">
                  {apiUrl.replace('https://', '')}
                </p>
              </div>

              {/* Scalar Link */}
              <a
                href={`${apiUrl}/scalar`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-md text-xs text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                  Tài Liệu API (Scalar)
                </span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </a>

              {/* Nút thu gọn thanh bên tiện lợi ở chân Sidebar */}
              <button
                type="button"
                onClick={toggleCollapse}
                data-testid="sidebar-collapse-bottom-btn"
                className="hidden md:flex w-full items-center justify-between px-3 py-2 rounded-md text-xs text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
                aria-label="Thu gọn menu thanh bên"
              >
                <span className="flex items-center gap-2">
                  <PanelLeftClose className="w-4 h-4" />
                  <span>Thu gọn menu</span>
                </span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400">
                  Ctrl+B
                </kbd>
              </button>
            </>
          )}
        </div>
      </aside>
    </>
  )
}
