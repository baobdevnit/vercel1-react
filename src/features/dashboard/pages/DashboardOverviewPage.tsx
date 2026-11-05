import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  Shield,
  Activity,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileQuestion,
  Layers,
  KeyRound,
  CheckCircle2,
  ExternalLink,
  Hourglass,
  Server,
  Database,
  Radio,
  Cpu,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Skeleton,
} from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { healthApi } from '@/features/health/services/health.api'
import { getTokenSessionMeta } from '@/utils/token'

export function DashboardOverviewPage() {
  const { user, token, isAdmin, setUser } = useAuthStore()
  const userIsAdmin = isAdmin() || user?.role === 'admin'
  const apiUrl = import.meta.env.VITE_API_URL || 'https://render1-api.onrender.com'

  // Phân tích thời hạn phiên JWT
  const sessionMeta = getTokenSessionMeta(token)

  // Truy vấn trạng thái sức khỏe máy chủ theo thời gian thực
  const healthQuery = useQuery({
    queryKey: ['health', 'overview'],
    queryFn: healthApi.getHealth,
    staleTime: 1000 * 30, // 30 giây
    retry: 1,
  })

  // Lời chào buổi sáng / chiều / tối
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }

  // Tiện ích chuyển đổi vai trò nhanh để kiểm thử Route Guards
  const toggleRoleForTesting = () => {
    if (!user) return
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    setUser({ ...user, role: newRole })
  }

  // Dữ liệu Supabase latency từ health check nếu có
  const dbCheck =
    healthQuery.data?.checks?.['datastore:supabase']?.[0] ||
    healthQuery.data?.checks?.['database:status']?.[0]
  const memCheck = healthQuery.data?.checks?.['system:memory']?.[0]

  return (
    <div className="space-y-6 pb-10 font-sans">
      {/* 1. Personalized Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-50 via-white to-zinc-50 dark:from-zinc-900/70 dark:via-zinc-900/60 dark:to-zinc-950/80 p-6 sm:p-8 text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-800/40 shadow-xs backdrop-blur-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/40 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
            <span>{getGreeting()}, chào mừng trở lại bảng điều khiển</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Xin chào, {user?.name || 'Thành viên'}!
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
            {userIsAdmin
              ? 'Bạn đang đăng nhập với tư cách Quản trị viên (Administrator). Bạn có toàn quyền truy cập quản lý người dùng, theo dõi tiến trình hệ thống và kiểm thử API.'
              : 'Bạn đang đăng nhập với tài khoản Thành viên tiêu chuẩn. Bạn có thể xem hồ sơ cá nhân, giám sát trạng thái máy chủ và thử nghiệm các tính năng trong hệ thống.'}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <span className="text-xs text-zinc-600 dark:text-zinc-400">Vai trò hiện tại:</span>
            <Badge
              variant={userIsAdmin ? 'admin' : 'user'}
              dot
              className="rounded-sm"
            >
              {user?.role?.toUpperCase()}
            </Badge>

            <button
              type="button"
              onClick={toggleRoleForTesting}
              className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 underline transition-colors cursor-pointer ml-2"
              title="Chuyển vai trò để test phân quyền tức thì"
            >
              (Nhấn vào đây để đổi nhanh sang {userIsAdmin ? 'User' : 'Admin'} để test Guards)
            </button>
          </div>
        </div>

        {/* Decorative subtle ambient background */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-white/[0.03] blur-3xl pointer-events-none" />
      </div>

      {/* 2. Top Metrics & Session Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Phiên xác thực JWT 24h */}
        <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Hourglass className="w-4 h-4 text-zinc-400" />
                Phiên Xác Thực JWT
              </span>
              <Badge variant={sessionMeta.isValid ? 'pass' : 'fail'} dot size="sm" className="rounded-sm">
                {sessionMeta.isValid ? 'Hợp Lệ' : 'Hết Hạn'}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold mt-2 text-zinc-900 dark:text-zinc-100">
              Thời hạn 24 giờ
            </CardTitle>
            <CardDescription className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
              {sessionMeta.remainingFormatted}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="w-full bg-zinc-100/80 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden mb-2">
              <div
                className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
                style={{ width: `${sessionMeta.percentRemaining}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>Tiến trình phiên: {sessionMeta.percentRemaining}%</span>
              <Link to="/profile" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-100 hover:underline">
                Chi tiết &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Máy chủ Render Backend */}
        <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Máy Chủ Render
              </span>
              {healthQuery.isLoading ? (
                <Skeleton className="h-5 w-16" />
              ) : (
                <Badge
                  variant={healthQuery.data?.status === 'pass' ? 'pass' : 'warn'}
                  dot
                  size="sm"
                  className="rounded-sm"
                >
                  {healthQuery.data?.status === 'pass' ? 'Online' : 'Warning'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg font-semibold mt-2 flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              {healthQuery.isLoading ? (
                <Skeleton className="h-6 w-32" />
              ) : (
                <span>render1-api</span>
              )}
            </CardTitle>
            <CardDescription className="text-xs font-mono truncate text-zinc-500 dark:text-zinc-400" title={apiUrl}>
              {apiUrl}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Database className="w-3.5 h-3.5 text-zinc-400" />
                DB Latency:{' '}
                <strong className="text-zinc-800 dark:text-zinc-200 font-mono">
                  {dbCheck?.observedValue ? `${dbCheck.observedValue}ms` : '—'}
                </strong>
              </span>
              <Link to="/health" className="text-emerald-600 dark:text-emerald-400 hover:underline">
                Giám sát &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Hồ sơ người dùng */}
        <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-4 h-4 text-zinc-400" />
                Tài Khoản Hiện Tại
              </span>
              <Badge variant={userIsAdmin ? 'admin' : 'user'} size="sm" className="rounded-sm">
                {user?.role?.toUpperCase()}
              </Badge>
            </div>
            <CardTitle className="text-lg font-semibold mt-2 truncate text-zinc-900 dark:text-zinc-100" title={user?.name}>
              {user?.name || '—'}
            </CardTitle>
            <CardDescription className="text-xs truncate font-mono text-zinc-500 dark:text-zinc-400" title={user?.email}>
              {user?.email || '—'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>UUID: {user?.id ? `${user.id.slice(0, 8)}...` : '—'}</span>
              <Link to="/profile" className="text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-100 hover:underline">
                Xem hồ sơ &rarr;
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Quick Action Cards (Phân Quyền Theo Vai Trò) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-zinc-400" />
            Lối Tắt Tính Năng (Quick Actions)
          </h3>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Hiển thị theo quyền: <strong className="uppercase text-zinc-800 dark:text-zinc-200 font-mono">{user?.role}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: Quản Trị Người Dùng */}
          <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm flex flex-col justify-between transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <Badge variant={userIsAdmin ? 'admin' : 'default'} size="sm" className="rounded-sm">
                  {userIsAdmin ? 'Admin Only' : 'Yêu Cầu Admin'}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3 text-zinc-900 dark:text-zinc-100">Quản Trị Người Dùng</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Xem toàn bộ danh sách tài khoản được lưu trữ trong Supabase Database qua <code>GET /users</code>.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs mb-3 p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30">
                {userIsAdmin ? (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Bạn có quyền truy cập
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    User thường sẽ bị chuyển về 403
                  </span>
                )}
              </div>
              <Link to="/admin/users" className="block">
                <Button
                  variant={userIsAdmin ? 'default' : 'outline'}
                  size="sm"
                  iconSuffix={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  {userIsAdmin ? 'Mở Danh Sách Users' : 'Thử Truy Cập (Test 403)'}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 2: Giám Sát Sức Khỏe */}
          <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm flex flex-col justify-between transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <Badge variant="pass" size="sm" dot className="rounded-sm">
                  IETF Draft
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3 text-zinc-900 dark:text-zinc-100">Giám Sát Hệ Thống</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Theo dõi chi tiết Uptime máy chủ, RAM Heap Node.js và thời gian phản hồi DB.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs mb-3 p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                <Cpu className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                <span>Heap: {memCheck?.observedValue || 'Đang đọc'}</span>
              </div>
              <Link to="/health" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  iconSuffix={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Mở Health Monitor
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 3: Hồ Sơ Cá Nhân */}
          <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm flex flex-col justify-between transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center">
                  <UserIcon className="w-5 h-5" />
                </div>
                <Badge variant="user" size="sm" className="rounded-sm">
                  Cá Nhân
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3 text-zinc-900 dark:text-zinc-100">Hồ Sơ Cá Nhân</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Xem thông tin tài khoản, sao chép UUID, token JWT 24h và kiểm tra ngày tạo.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs mb-3 p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 truncate font-mono text-zinc-700 dark:text-zinc-300">
                {user?.email}
              </div>
              <Link to="/profile" className="block">
                <Button
                  variant="outline"
                  size="sm"
                  iconSuffix={<ArrowRight className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Xem Chi Tiết Hồ Sơ
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Action 4: Tài Liệu Scalar API */}
          <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm flex flex-col justify-between transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/40 flex items-center justify-center">
                  <ExternalLink className="w-5 h-5" />
                </div>
                <Badge variant="warn" size="sm" className="rounded-sm">
                  Tài Liệu Live
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold mt-3 text-zinc-900 dark:text-zinc-100">Tài Liệu Scalar API</CardTitle>
              <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                Giao diện kiểm thử API tương tác trực tiếp với máy chủ NestJS Render.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-xs mb-3 p-2.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 text-zinc-600 dark:text-zinc-400 font-mono truncate">
                {apiUrl}/scalar
              </div>
              <a
                href={`${apiUrl}/scalar`}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  size="sm"
                  iconSuffix={<ExternalLink className="w-3.5 h-3.5" />}
                  className="w-full text-xs"
                >
                  Mở Scalar API Docs
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 4. Route Guards & Navigation Testing Center */}
      <Card className="hover:border-zinc-300/70 dark:hover:border-zinc-700/50 transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-zinc-600 dark:text-zinc-300" />
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Khu Vực Kiểm Thử Định Tuyến (Route Guards Verification)</CardTitle>
          </div>
          <CardDescription className="text-zinc-500 dark:text-zinc-400">
            Bấm nhanh các nút dưới đây để kiểm tra hoạt động thực tế của các lớp bảo vệ tuyến đường và trang báo lỗi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Test 404 */}
            <Link to="/duong-dan-khong-ton-tai">
              <Button
                variant="outline"
                size="sm"
                iconPrefix={<FileQuestion className="w-4 h-4 text-zinc-400" />}
                className="w-full justify-start text-xs"
              >
                Thử nghiệm trang 404
              </Button>
            </Link>

            {/* Test 403 Direct */}
            <Link to="/unauthorized">
              <Button
                variant="outline"
                size="sm"
                iconPrefix={<ShieldAlert className="w-4 h-4 text-red-500 dark:text-red-400" />}
                className="w-full justify-start text-xs"
              >
                Thử nghiệm trang 403
              </Button>
            </Link>

            {/* Test Showcase */}
            <Link to="/showcase">
              <Button
                variant="outline"
                size="sm"
                iconPrefix={<Layers className="w-4 h-4 text-zinc-400" />}
                className="w-full justify-start text-xs"
              >
                Mở UI Showcase (shadcn/ui)
              </Button>
            </Link>

            {/* Toggle Role */}
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleRoleForTesting}
              iconPrefix={<KeyRound className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />}
              className="w-full justify-start text-xs"
            >
              Đổi vai trò ({user?.role})
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
