import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Sparkles,
  ArrowRight,
  Trash2,
  Send,
  Search,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Server,
  ShieldCheck,
  Users,
  Activity,
  CheckCircle2,
  LogIn,
  LogOut,
  RefreshCw,
  Key,
  UserCheck,
  AlertCircle,
  Clock,
  ExternalLink,
} from 'lucide-react'
import {
  Button,
  Input,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Spinner,
  Skeleton,
  Avatar,
  AvatarFallback,
  BrandCrest,
  ThemeToggle,
} from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/stores/theme.store'
import { healthApi } from '@/features/health/services/health.api'
import { getErrorMessage } from '@/api/client'
import type { User } from '@/types/api'
import { ACCESS_TOKEN_KEY, USER_INFO_KEY } from '@/utils/token'

export function ShowcasePage() {
  // Base UI Demo states (từ Phiên 1)
  const [count, setCount] = useState<number>(0)
  const [isLoadingDemo, setIsLoadingDemo] = useState<boolean>(false)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [samplePassword, setSamplePassword] = useState<string>('123')
  const [sampleEmail, setSampleEmail] = useState<string>('admin@example.com')

  // Auth Store state (từ Phiên 2)
  const { user, token, isAuthenticated, setAuth, clearAuth, isAdmin } = useAuthStore()

  // Theme state
  const { theme, resolvedTheme } = useTheme()

  // Local storage display state
  const [, setStorageRevision] = useState<number>(0)
  const refreshStorageView = () => setStorageRevision((r) => r + 1)

  // TanStack Query kiểm tra /health
  const {
    data: healthData,
    isLoading: isHealthLoading,
    isFetching: isHealthFetching,
    error: healthError,
    refetch: refetchHealth,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ['system-health'],
    queryFn: () => healthApi.getHealth(),
    enabled: false, // kích hoạt khi người dùng nhấn nút hoặc tự kiểm tra
  })

  // State test format lỗi
  const [testErrorResult, setTestErrorResult] = useState<string | null>(null)

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  const handleSimulateLoading = () => {
    setIsLoadingDemo(true)
    setTimeout(() => {
      setIsLoadingDemo(false)
    }, 1500)
  }

  // Giả lập đăng nhập Admin
  const handleMockAdminLogin = () => {
    const mockAdmin: User = {
      id: 'admin-uuid-001',
      name: 'System Administrator',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi0wMDEiLCJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwicm9sZSI6ImFkbWluIn0.mock_signature'
    setAuth(mockAdmin, mockToken)
    refreshStorageView()
  }

  // Giả lập đăng nhập User thường
  const handleMockUserLogin = () => {
    const mockUser: User = {
      id: 'user-uuid-999',
      name: 'Nguyễn Văn A',
      email: 'user@example.com',
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const mockToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTk5OSIsImVtYWlsIjoidXNlckBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0.mock_signature'
    setAuth(mockUser, mockToken)
    refreshStorageView()
  }

  // Đăng xuất
  const handleLogout = () => {
    clearAuth()
    refreshStorageView()
  }

  // Mô phỏng kiểm thử parser lỗi NestJS
  const handleTestErrorFormat = (type: 'array' | 'string' | 'network') => {
    if (type === 'array') {
      const mockNestError = {
        isAxiosError: true,
        response: {
          status: 400,
          data: {
            statusCode: 400,
            message: ['Email không đúng định dạng', 'Mật khẩu phải có ít nhất 6 ký tự'],
            error: 'Bad Request',
          },
        },
      }
      setTestErrorResult(getErrorMessage(mockNestError))
    } else if (type === 'string') {
      const mockNestError = {
        isAxiosError: true,
        response: {
          status: 409,
          data: {
            statusCode: 409,
            message: 'Email này đã được sử dụng',
            error: 'Conflict',
          },
        },
      }
      setTestErrorResult(getErrorMessage(mockNestError))
    } else {
      const mockNetworkError = {
        isAxiosError: true,
        message: 'Network Error',
      }
      setTestErrorResult(getErrorMessage(mockNetworkError))
    }
  }

  const rawStorageToken = typeof window !== 'undefined' ? localStorage.getItem(ACCESS_TOKEN_KEY) : null
  const rawStorageUser = typeof window !== 'undefined' ? localStorage.getItem(USER_INFO_KEY) : null

  const isPasswordTooShort = samplePassword.length > 0 && samplePassword.length < 6

  return (
    <div className="min-h-screen bg-[#12100d] text-[#ede5d8] pb-16 font-serif">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#161310]/90 backdrop-blur-md border-b border-[#2e261d]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandCrest size="sm" />
            <div>
              <h1 className="font-classic text-base font-bold text-amber-100 leading-tight">
                RENDER I · PHÒNG TRƯNG BÀY
              </h1>
              <p className="text-xs font-serif text-stone-400">
                Kiến Trúc Thành Phần Giao Diện Cổ Điển
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-[#1c1813] py-1 px-3 rounded-md border border-[#382f25]">
                <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#8c622b] to-[#4e3414] text-amber-100 font-serif font-bold text-xs flex items-center justify-center">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-serif font-semibold text-amber-100 leading-none">{user.name}</p>
                  <p className="text-[10px] text-stone-400 font-mono">{user.email}</p>
                </div>
                <Badge variant={user.role === 'admin' ? 'admin' : 'user'} size="sm">
                  {user.role}
                </Badge>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Đăng xuất"
                  className="p-1 hover:text-rose-400 text-stone-400 rounded-sm transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Badge variant="default" size="sm">
                  Chế độ Khách
                </Badge>
              </div>
            )}
            <Badge variant="pass" dot>
              Hệ Thống Sẵn Sàng
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="rounded-lg bg-gradient-to-br from-[#2c1c0e] via-[#3b2714] to-[#1e1308] text-amber-100 p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-amber-600/50">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-amber-950/60 text-xs font-classic font-semibold text-amber-300 border border-amber-600/40">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Bản Sắc Nhận Diện Di Sản & Thư Viện Cổ Điển
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-amber-50">
              Bộ Nhận Diện Và Màu Sắc Phong Cách Cổ Điển
            </h2>
            <p className="text-amber-200/80 text-sm sm:text-base leading-relaxed font-serif">
              Toàn bộ giao diện được khoác lên màu sắc sang trọng vượt thời gian với phong cách Atelier/Archive:
              bảng màu vàng đồng cổ (Antique Brass & Burnished Gold), nâu gỗ mun và da thuộc parchment,
              font chữ La Mã cổ điển Cinzel kết hợp EB Garamond quý phái.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs bg-black/40 px-3 py-1.5 rounded-md border border-amber-600/40">
                <Server className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-stone-400 font-serif">MÁY CHỦ:</span>
                <code className="text-amber-300 font-mono font-semibold">{apiUrl}</code>
              </div>
              <Badge variant="admin" size="sm">
                Phong Cách Cổ Điển
              </Badge>
              <Badge variant="pass" size="sm" dot>
                Di Sản & Vận Hành
              </Badge>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PHIÊN 2: BẢNG ĐIỀU KHIỂN & KIỂM THỬ TÍNH NĂNG TƯƠNG TÁC */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-blue-600" />
                Khu Vực Kiểm Thử Trực Quan: Phiên 2
              </h3>
              <p className="text-xs text-slate-500">
                Tương tác trực tiếp với Zustand Store, LocalStorage và Axios Interceptors.
              </p>
            </div>
            <Badge variant="pass" dot>
              Hoạt Động 100%
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Zustand Auth Store & Session */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    1. Zustand Auth Store
                  </CardTitle>
                  <CardDescription>
                    Quản lý phiên đăng nhập và phân quyền thời gian thực.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Trạng thái hiện tại */}
                  <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Trạng thái:</span>
                      {isAuthenticated ? (
                        <Badge variant="pass" size="sm" dot>
                          Đã Xác Thực
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Chưa Đăng Nhập
                        </Badge>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Người dùng:</span>
                      <span className="font-semibold text-slate-800">
                        {user ? user.name : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Email:</span>
                      <span className="font-mono text-slate-700">{user ? user.email : '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Store Token:</span>
                      <span className="font-mono text-slate-700 text-[10px]">
                        {token ? `${token.slice(0, 14)}...` : 'null'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Vai trò (Role):</span>
                      {user ? (
                        <Badge variant={user.role === 'admin' ? 'admin' : 'user'} size="sm">
                          {user.role}
                        </Badge>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Kiểm tra isAdmin():</span>
                      <span
                        className={`font-mono font-bold ${
                          isAdmin() ? 'text-purple-600' : 'text-slate-500'
                        }`}
                      >
                        {isAdmin() ? 'true' : 'false'}
                      </span>
                    </div>
                  </div>

                  {/* Inspector LocalStorage */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Trạng thái lưu trữ (LocalStorage)
                    </p>
                    <div className="p-2.5 rounded-md bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1 overflow-x-auto">
                      <div>
                        <span className="text-blue-400">access_token:</span>{' '}
                        {rawStorageToken ? (
                          <span className="text-emerald-400">
                            {rawStorageToken.slice(0, 18)}... (OK)
                          </span>
                        ) : (
                          <span className="text-slate-500">null</span>
                        )}
                      </div>
                      <div>
                        <span className="text-purple-400">user_info:</span>{' '}
                        {rawStorageUser ? (
                          <span className="text-emerald-400">Đã lưu trữ ({user?.role})</span>
                        ) : (
                          <span className="text-slate-500">null</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              <CardFooter className="flex flex-col gap-2 pt-2">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleMockAdminLogin}
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  >
                    Mock Admin
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleMockUserLogin}
                    leftIcon={<LogIn className="w-3.5 h-3.5" />}
                  >
                    Mock User
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  className="w-full"
                  disabled={!isAuthenticated}
                  onClick={handleLogout}
                  leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                >
                  Xóa Auth / Đăng Xuất
                </Button>
              </CardFooter>
            </Card>

            {/* Card 2: TanStack Query & Backend Health Probe */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    2. TanStack Query & /health API
                  </CardTitle>
                  <CardDescription>
                    Kết nối endpoint kiểm tra sức khỏe hệ thống từ backend.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3.5 rounded-md bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Trạng thái Query:</span>
                      {isHealthFetching ? (
                        <div className="flex items-center gap-1.5 text-blue-600 font-medium">
                          <Spinner size="xs" />
                          <span>Đang gửi yêu cầu...</span>
                        </div>
                      ) : healthData ? (
                        <Badge
                          variant={healthData.status === 'pass' ? 'pass' : 'fail'}
                          size="sm"
                          dot
                        >
                          {healthData.status.toUpperCase()}
                        </Badge>
                      ) : healthError ? (
                        <Badge variant="fail" size="sm" dot>
                          Lỗi Kết Nối
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Chưa kích hoạt
                        </Badge>
                      )}
                    </div>

                    {dataUpdatedAt > 0 && (
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Cập nhật lúc:
                        </span>
                        <span>{new Date(dataUpdatedAt).toLocaleTimeString()}</span>
                      </div>
                    )}

                    {healthData && (
                      <div className="pt-2 border-t border-slate-200 space-y-1 font-mono text-[11px]">
                        <div className="text-slate-700">
                          <span className="font-semibold text-slate-500">Service:</span>{' '}
                          {healthData.serviceId}
                        </div>
                        <div className="text-slate-700">
                          <span className="font-semibold text-slate-500">Version:</span>{' '}
                          {healthData.version}
                        </div>
                        <div className="text-slate-700">
                          <span className="font-semibold text-slate-500">Checks:</span>{' '}
                          {Object.keys(healthData.checks || {}).join(', ')}
                        </div>
                      </div>
                    )}

                    {healthError && (
                      <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-red-700 text-[11px] flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Thông báo từ Error Handler:</p>
                          <p className="mt-0.5">{getErrorMessage(healthError)}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    API Client được cấu hình tự động gửi header{' '}
                    <code className="text-blue-600 font-mono text-[11px]">Accept: application/health+json</code>
                    .
                  </p>
                </CardContent>
              </div>

              <CardFooter className="pt-2">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  isLoading={isHealthLoading || isHealthFetching}
                  loadingText="Đang kiểm tra..."
                  onClick={() => refetchHealth()}
                  leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                >
                  Gửi Yêu Cầu /health Ngay
                </Button>
              </CardFooter>
            </Card>

            {/* Card 3: Interceptor & Format Lỗi Chuẩn */}
            <Card className="flex flex-col justify-between">
              <div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    3. Interceptor & Bắt Lỗi
                  </CardTitle>
                  <CardDescription>
                    Kiểm tra phân tích lỗi mảng NestJS và thu hồi phiên 401.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-700">
                      Thử nghiệm hàm trích xuất lỗi (getErrorMessage):
                    </p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] px-2"
                        onClick={() => handleTestErrorFormat('array')}
                      >
                        Lỗi Mảng DTO
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] px-2"
                        onClick={() => handleTestErrorFormat('string')}
                      >
                        Lỗi Chuỗi Đơn
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[11px] px-2"
                        onClick={() => handleTestErrorFormat('network')}
                      >
                        Mất Mạng
                      </Button>
                    </div>
                  </div>

                  {testErrorResult ? (
                    <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      <div className="font-semibold text-amber-800 flex items-center gap-1.5 mb-1">
                        <AlertTriangleIcon className="w-3.5 h-3.5" />
                        Kết quả phân tích chuỗi lỗi:
                      </div>
                      <p className="font-mono text-[11px] break-words">{testErrorResult}</p>
                    </div>
                  ) : (
                    <div className="p-3 rounded-md bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-center text-xs">
                      Nhấn nút phía trên để kiểm tra phân tích lỗi
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-md border border-slate-200">
                    <span className="font-semibold text-slate-700">Quy tắc 401:</span> Khi nhận mã
                    401 từ backend (do token blacklist hoặc hết hạn), Interceptor tự động xóa
                    session và điều hướng sang <code className="text-blue-600">/login?expired=true</code>.
                  </div>
                </CardContent>
              </div>

              <CardFooter className="pt-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-slate-500"
                  onClick={() => window.open(`${apiUrl}/scalar`, '_blank')}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  Mở Scalar API Reference
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Overview Metric Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Backend API</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">NestJS v11</p>
              <Badge variant="pass" size="sm" dot className="mt-1">
                Port 3000 Sẵn Sàng
              </Badge>
            </div>
          </Card>

          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Xác Thực</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">JWT Token</p>
              <Badge variant="admin" size="sm" className="mt-1">
                Blacklist Thu Hồi
              </Badge>
            </div>
          </Card>

          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50/80 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cơ Sở Dữ Liệu</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Supabase</p>
              <Badge variant="user" size="sm" className="mt-1">
                PostgreSQL Auth
              </Badge>
            </div>
          </Card>

          <Card hoverable className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sức Khỏe Hệ Thống</p>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">IETF /health</p>
              <Badge variant="pass" size="sm" dot className="mt-1">
                Liveness: Pass
              </Badge>
            </div>
          </Card>
        </section>

        {/* ========================================================================= */}
        {/* PHIÊN 1: BASE UI COMPONENTS SHOWCASE */}
        {/* ========================================================================= */}
        <div className="border-t border-slate-200 pt-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              Thư Viện Base UI Components (Phiên 1)
            </h3>
            <p className="text-xs text-slate-500">
              Các thành phần giao diện nền tảng tái sử dụng xuyên suốt toàn bộ ứng dụng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Section: Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>1. Thư Viện Nút Bấm (Button)</CardTitle>
                <CardDescription>
                  Hỗ trợ 5 biến thể màu, 3 kích cỡ, trạng thái loading và icon prefix/suffix.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Các Biến Thể (Variants)</p>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="danger">Danger</Button>
                    <Button variant="ghost">Ghost</Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Kích Thước (Sizes)</p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Button size="sm">Nhỏ (sm)</Button>
                    <Button size="md">Vừa (md)</Button>
                    <Button size="lg">Lớn (lg)</Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Kèm Icons & Tương Tác</p>
                  <div className="flex flex-wrap gap-2.5 items-center">
                    <Button leftIcon={<Send className="w-4 h-4" />}>Gửi Yêu Cầu</Button>
                    <Button
                      variant="outline"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Xem Tiếp
                    </Button>
                    <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />}>
                      Xóa
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                    Tương Tác Loading & State
                  </p>
                  <div className="flex flex-wrap gap-3 items-center">
                    <Button
                      isLoading={isLoadingDemo}
                      loadingText="Đang xử lý..."
                      onClick={handleSimulateLoading}
                      variant="primary"
                    >
                      Bấm để thử Loading
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setCount((c) => c + 1)}
                    >
                      Bộ đếm: {count} lần bấm
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section: Inputs */}
            <Card>
              <CardHeader>
                <CardTitle>2. Ô Nhập Liệu (Input)</CardTitle>
                <CardDescription>
                  Tích hợp label, icon prefix/suffix, thông báo lỗi động và trợ giúp.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Địa chỉ Email"
                  required
                  type="email"
                  placeholder="name@company.com"
                  value={sampleEmail}
                  onChange={(e) => setSampleEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  helperText="Dùng để đăng nhập và nhận thông báo hệ thống"
                />

                <Input
                  label="Mật khẩu tài khoản"
                  required
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={samplePassword}
                  onChange={(e) => setSamplePassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="cursor-pointer hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  error={
                    isPasswordTooShort
                      ? 'Mật khẩu phải có ít nhất 6 ký tự (Quy chuẩn NestJS DTO)'
                      : undefined
                  }
                  helperText={
                    !isPasswordTooShort ? 'Gõ thử dưới 6 ký tự để thấy trạng thái báo lỗi' : undefined
                  }
                />

                <Input
                  label="Tìm kiếm người dùng"
                  placeholder="Tìm theo tên hoặc email..."
                  leftIcon={<Search className="w-4 h-4" />}
                />

                <Input
                  label="Trường bị vô hiệu hóa"
                  disabled
                  value="Tài khoản hệ thống (Read-only)"
                />
              </CardContent>
            </Card>

            {/* Section: Badges */}
            <Card>
              <CardHeader>
                <CardTitle>3. Huy Hiệu Trạng Thái (Badge)</CardTitle>
                <CardDescription>
                  Phục vụ hiển thị Role người dùng và trạng thái Health Check của hệ thống.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                    Vai Trò Người Dùng (Roles)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="admin" size="md">
                      Admin
                    </Badge>
                    <Badge variant="user" size="md">
                      User
                    </Badge>
                    <Badge variant="admin" size="sm">
                      Quản Trị Viên (sm)
                    </Badge>
                    <Badge variant="user" size="sm">
                      Người Dùng Thường (sm)
                    </Badge>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">
                    Trạng Thái Vận Hành & Health Check
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="pass" dot>
                      Database Pass (200 OK)
                    </Badge>
                    <Badge variant="warn" dot>
                      Memory Warn (85%)
                    </Badge>
                    <Badge variant="fail" dot>
                      Service Fail (503)
                    </Badge>
                    <Badge variant="info">Thông tin (Info)</Badge>
                    <Badge variant="default">Mặc định (Default)</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section: Spinners & Cards */}
            <Card>
              <CardHeader>
                <CardTitle>4. Con Xoay Tải Dữ Liệu (Spinner)</CardTitle>
                <CardDescription>
                  Con xoay nhẹ nhàng, mượt mà với nhiều kích cỡ khác nhau cho asynchronous states.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-3">Các Kích Thước</p>
                  <div className="flex items-center gap-6 text-blue-600">
                    <div className="flex flex-col items-center gap-1.5">
                      <Spinner size="xs" />
                      <span className="text-xs text-slate-400">xs</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Spinner size="sm" />
                      <span className="text-xs text-slate-400">sm</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Spinner size="md" />
                      <span className="text-xs text-slate-400">md</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Spinner size="lg" />
                      <span className="text-xs text-slate-400">lg</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <Spinner size="xl" />
                      <span className="text-xs text-slate-400">xl</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Spinner size="sm" className="text-indigo-600" />
                    <span className="text-sm font-medium text-slate-700">
                      Đang đồng bộ dữ liệu phiên làm việc...
                    </span>
                  </div>
                  <Badge variant="info" size="sm">
                    Đang chạy
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Section: shadcn/ui Avatars & Skeletons */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>5. shadcn/ui Avatar & Skeleton</CardTitle>
                <CardDescription>
                  Hệ thống Avatar đa màu sắc cùng Skeleton shimmer cao cấp từ shadcn/ui.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">shadcn/ui Avatars</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="rounded-md">
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-md">
                        AD
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="rounded-md">
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-md">
                        US
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="rounded-md">
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-md">
                        NV
                      </AvatarFallback>
                    </Avatar>
                    <Avatar className="rounded-md">
                      <AvatarFallback className="bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold text-xs rounded-md">
                        LT
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-zinc-400 uppercase">shadcn/ui Skeleton Loader</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div className="space-y-1.5 flex-1">
                        <Skeleton className="h-3.5 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section: Theme Mode */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>6. Chuyển Đổi Giao Diện Sáng / Tối (Theme Mode Switcher)</CardTitle>
                <CardDescription>
                  Hỗ trợ đầy đủ 3 chế độ: Giao diện Sáng (Light), Giao diện Tối (Dark) và Tự động theo Hệ điều hành (System) với hiệu ứng chuyển màu mượt mà và lưu trữ tức thì.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Demo 1: Segmented */}
                  <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Biến Thể Phân Đoạn (Segmented)</p>
                    <ThemeToggle variant="segmented" />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Thích hợp đặt tại Trang Cài đặt cá nhân hoặc Sidebar.
                    </p>
                  </div>

                  {/* Demo 2: Quick Icon Toggle */}
                  <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Biến Thể Nút Icon (Quick Toggle)</p>
                    <div className="flex items-center gap-3">
                      <ThemeToggle variant="icon" />
                      <span className="text-xs text-zinc-600 dark:text-zinc-400">Nhấn để đổi ngay</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Tối ưu cho thanh Header phía trên góc phải.
                    </p>
                  </div>

                  {/* Demo 3: Dropdown */}
                  <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 space-y-3">
                    <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Biến Thể Menu Thả Xuống (Dropdown)</p>
                    <ThemeToggle variant="dropdown" showLabel />
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Hỗ trợ hiển thị nhãn và menu chọn nhanh.
                    </p>
                  </div>
                </div>

                {/* Live Theme Meta */}
                <div className="p-4 rounded-md bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Cấu hình đã chọn:</span>
                    <Badge variant="default" size="sm">
                      {theme}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 dark:text-zinc-400">Chủ đề hiển thị thực tế:</span>
                    <Badge variant={resolvedTheme === 'dark' ? 'secondary' : 'default'} size="sm">
                      {resolvedTheme}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Step Banner */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">Phiên 2 Hoàn Thành Xuất Sắc</h4>
              <p className="text-xs text-emerald-800">
                Axios Client, TanStack Query, Zustand Auth Store và TypeScript Contracts đã sẵn sàng.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            Kế tiếp:{' '}
            <span className="font-semibold text-slate-700">
              Phiên 3 - Routing, Layout Shell & Route Guards
            </span>
          </div>
        </div>
      </main>
    </div>
  )
}

function AlertTriangleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}
