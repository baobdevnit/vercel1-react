import { useState } from 'react'
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Zap,
  Info,
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, BrandCrest } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema'
import type { User as UserType } from '@/types/api'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const isSessionExpired = searchParams.get('expired') === 'true'

  const { setAuth } = useAuthStore()
  const { login, isSubmitting, authError, setAuthError } = useAuth()

  const [showPassword, setShowPassword] = useState<boolean>(false)

  // Redirect target
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@example.com',
      password: 'Admin@123456',
    },
    mode: 'onTouched',
  })

  const onSubmit = async (data: LoginFormData) => {
    await login(data, from)
  }

  // Tiện ích tự động điền nhanh tài khoản Admin mẫu
  const handleFillAdmin = () => {
    setValue('email', 'admin@example.com', { shouldValidate: true })
    setValue('password', 'Admin@123456', { shouldValidate: true })
    setAuthError(null)
  }

  // Tiện ích tự động điền nhanh tài khoản User mẫu
  const handleFillUser = () => {
    setValue('email', 'user@example.com', { shouldValidate: true })
    setValue('password', 'Password123!', { shouldValidate: true })
    setAuthError(null)
  }

  // Giả lập đăng nhập nhanh ngoại tuyến (Mock) để test UI & Route Guards
  const handleMockLogin = (role: 'admin' | 'user') => {
    const mockUser: UserType = {
      id: role === 'admin' ? 'mock-admin-001' : 'mock-user-002',
      name: role === 'admin' ? 'System Administrator (Mock)' : 'Normal Member (Mock)',
      email: role === 'admin' ? 'admin@example.com' : 'user@example.com',
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const mockToken = `mock-token-${role}-${Date.now()}`
    setAuth(mockUser, mockToken)
    navigate(from, { replace: true })
  }

  return (
    <Card className="w-full max-w-md border border-zinc-200/60 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-950/80 shadow-xl relative backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1.5 pb-4 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs tracking-wider uppercase mb-1">
          <BrandCrest size="sm" />
          <span>Hệ Thống Xác Thực JWT</span>
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Đăng Nhập Hệ Thống
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
          Nhập thông tin xác thực để truy cập bảng điều khiển Render I.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Banner thông báo khi phiên đăng nhập hết hạn hoặc bị blacklist */}
        {isSessionExpired && (
          <div className="p-3.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Phiên đăng nhập đã hết hạn hoặc token đã bị thu hồi qua Token Blacklist phía máy chủ. Vui lòng đăng nhập lại.
            </span>
          </div>
        )}

        {/* Banner thông báo lỗi từ backend */}
        {authError && (
          <div className="p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{authError}</span>
          </div>
        )}

        {/* Form Đăng nhập sử dụng react-hook-form + zodResolver */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="login-email"
            label="Địa chỉ Email"
            type="email"
            placeholder="admin@example.com"
            iconPrefix={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            required
            autoComplete="email"
            {...register('email')}
          />

          <div className="space-y-1.5">
            <Input
              id="login-password"
              label="Mật khẩu bí mật"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              iconPrefix={<Lock className="w-4 h-4" />}
              iconSuffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password?.message}
              required
              autoComplete="current-password"
              {...register('password')}
            />
          </div>

          <Button
            type="submit"
            variant="default"
            isLoading={isSubmitting}
            iconPrefix={<LogIn className="w-4 h-4" />}
            className="w-full mt-2 text-sm font-medium"
          >
            Đăng Nhập Máy Chủ
          </Button>
        </form>

        {/* Hộp gợi ý tài khoản mẫu từ Database */}
        <div className="p-3.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              Tài khoản mẫu từ Database:
            </span>
            <span className="text-[10px] text-zinc-500 font-normal">Nhấn để điền</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="p-2 rounded-lg border border-purple-200/50 dark:border-purple-800/30 bg-purple-50/60 dark:bg-purple-950/20 text-purple-900 dark:text-purple-200 hover:bg-purple-100/70 dark:hover:bg-purple-950/40 transition-colors text-left"
            >
              <div className="font-medium text-xs flex items-center gap-1">
                <span>👑</span> Admin
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                admin@example.com
              </p>
            </button>

            <button
              type="button"
              onClick={handleFillUser}
              className="p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-700/40 bg-zinc-100/70 dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800/70 transition-colors text-left"
            >
              <div className="font-medium text-xs flex items-center gap-1">
                <span>👤</span> User
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                user@example.com
              </p>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
            <Info className="w-3 h-3 text-zinc-500 shrink-0" />
            <span>Mật khẩu: Admin: <code className="text-zinc-800 dark:text-zinc-200 font-medium">Admin@123456</code> | User: <code className="text-zinc-800 dark:text-zinc-200 font-medium">Password123!</code></span>
          </div>
        </div>

        {/* Chế độ Mock test nhanh */}
        <div className="flex items-center justify-between pt-1 text-xs text-zinc-500 dark:text-zinc-400">
          <span>Chế độ kiểm thử nhanh:</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleMockLogin('admin')}
              className="text-[11px] text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-zinc-100 hover:underline"
            >
              Mock Admin
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => handleMockLogin('user')}
              className="text-[11px] text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 hover:underline"
            >
              Mock User
            </button>
          </div>
        </div>

        {/* Liên kết đến trang Đăng ký */}
        <div className="text-center pt-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/30">
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            className="font-semibold text-zinc-900 dark:text-zinc-200 hover:underline underline-offset-2 ml-1"
          >
            Đăng ký tài khoản mới
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
