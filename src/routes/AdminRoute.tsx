import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui'

interface AdminRouteProps {
  children?: React.ReactNode
}

/**
 * Route Guard bảo vệ các tuyến đường chỉ dành riêng cho Quản trị viên (Admin).
 * - Chưa đăng nhập: Chuyển hướng về /login.
 * - Đã đăng nhập nhưng không phải admin (role !== 'admin'): Chuyển hướng về /unauthorized (403).
 * - Đã đăng nhập và là admin: Cho phép truy cập vào Outlet hoặc children.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
        <Spinner size="lg" className="text-blue-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Đang kiểm tra quyền Quản trị viên...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const hasAdminRole = isAdmin() || user?.role === 'admin'

  if (!hasAdminRole) {
    return (
      <Navigate
        to="/unauthorized"
        state={{ attemptedUrl: location.pathname, attemptedTitle: 'Quản trị hệ thống' }}
        replace
      />
    )
  }

  return children ? <>{children}</> : <Outlet />
}
