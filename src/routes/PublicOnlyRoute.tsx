import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth.store'
import { Spinner } from '@/components/ui'

interface PublicOnlyRouteProps {
  children?: React.ReactNode
}

/**
 * Route Guard dành riêng cho trang công khai như /login, /register.
 * Nếu người dùng đã đăng nhập, tự động chuyển hướng thẳng vào /dashboard.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return children ? <>{children}</> : <Outlet />
}
