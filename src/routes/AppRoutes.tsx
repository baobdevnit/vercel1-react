import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import { PublicOnlyRoute } from './PublicOnlyRoute'
import { AuthLayout, DashboardLayout } from '@/components/layout'
import { Spinner } from '@/components/ui'

// Route-level code-splitting (Lazy loading) cho production tối ưu bundle size & LCP
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const DashboardOverviewPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardOverviewPage').then((m) => ({
    default: m.DashboardOverviewPage,
  })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
)
const UsersListPage = lazy(() =>
  import('@/features/users/pages/UsersListPage').then((m) => ({ default: m.UsersListPage })),
)
const HealthMonitorPage = lazy(() =>
  import('@/features/health/pages/HealthMonitorPage').then((m) => ({
    default: m.HealthMonitorPage,
  })),
)
const ShowcasePage = lazy(() =>
  import('@/pages/ShowcasePage').then((m) => ({ default: m.ShowcasePage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)
const UnauthorizedPage = lazy(() =>
  import('@/pages/UnauthorizedPage').then((m) => ({ default: m.UnauthorizedPage })),
)

function PageLoader() {
  return (
    <div
      role="status"
      aria-label="Đang nạp dữ liệu trang"
      className="min-h-[50vh] w-full flex flex-col items-center justify-center p-8 text-zinc-400"
    >
      <Spinner size="lg" className="text-zinc-100 mb-3" />
      <p className="text-sm font-medium text-zinc-400 animate-pulse">Đang nạp dữ liệu trang...</p>
    </div>
  )
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 1. Các tuyến đường công khai (Public Only - nếu đã login sẽ vào thẳng /dashboard) */}
        <Route element={<PublicOnlyRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* 2. Các tuyến đường bảo vệ (Yêu cầu đăng nhập - ProtectedRoute) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardOverviewPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/health" element={<HealthMonitorPage />} />
            <Route path="/showcase" element={<ShowcasePage />} />

            {/* Tuyến đường chỉ dành cho Quản trị viên (AdminRoute) */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/users" element={<UsersListPage />} />
            </Route>
          </Route>
        </Route>

        {/* 3. Các tuyến đường xử lý lỗi & phân quyền */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
