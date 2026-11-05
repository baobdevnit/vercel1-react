import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui'

interface ProtectedRouteProps {
  children?: React.ReactNode
}

/**
 * Route Guard chặn người dùng chưa đăng nhập.
 * - Đang kiểm tra session ban đầu: Hiển thị Spinner.
 * - Chưa đăng nhập: Chuyển hướng đến /login kèm location state để quay lại sau khi đăng nhập.
 * - Đã đăng nhập: Cho phép truy cập vào Outlet hoặc children.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
        <Spinner size="lg" className="text-blue-600" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Đang xác thực phiên làm việc...
        </p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children ? <>{children}</> : <Outlet />
}
