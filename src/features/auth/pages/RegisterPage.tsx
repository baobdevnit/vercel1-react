import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Check,
} from 'lucide-react'
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardDescription, BrandCrest } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/features/auth/services/auth.api'
import { getErrorMessage } from '@/api/client'
import { registerSchema, type RegisterFormData } from '@/features/auth/schemas/auth.schema'

export function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
  })

  const passwordValue = useWatch({ control, name: 'password', defaultValue: '' })

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const authRes = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      setSuccessMessage('Đăng ký tài khoản thành công! Đang tự động đăng nhập vào hệ thống...')

      const token = authRes.access_token
      const userProfile = authRes.user ?? (await authApi.getMe())

      setAuth(userProfile, token)

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 900)
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-zinc-200/60 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-950/80 shadow-xl relative backdrop-blur-md rounded-2xl">
      <CardHeader className="space-y-1.5 pb-4 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 font-mono text-xs tracking-wider uppercase mb-1">
          <BrandCrest size="sm" />
          <span>Tạo Tài Khoản Mới</span>
        </div>
        <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Đăng Ký Thành Viên
        </CardTitle>
        <CardDescription className="text-zinc-500 dark:text-zinc-400 text-xs">
          Tạo tài khoản để trải nghiệm toàn bộ các tính năng bảo mật trên Render I Portal.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Banner thông báo đăng ký thành công */}
        {successMessage && (
          <div className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{successMessage}</span>
          </div>
        )}

        {/* Banner thông báo lỗi từ backend */}
        {errorMessage && (
          <div className="p-3.5 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form Đăng ký */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            id="register-name"
            label="Họ và tên"
            type="text"
            placeholder="Nguyễn Văn A"
            iconPrefix={<UserIcon className="w-4 h-4" />}
            error={errors.name?.message}
            required
            autoComplete="name"
            {...register('name')}
          />

          <Input
            id="register-email"
            label="Địa chỉ Email"
            type="email"
            placeholder="ban@example.com"
            iconPrefix={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            required
            autoComplete="email"
            {...register('email')}
          />

          <div className="space-y-1.5">
            <Input
              id="register-password"
              label="Mật khẩu bí mật (tối thiểu 6 ký tự)"
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
              autoComplete="new-password"
              {...register('password')}
            />

            {/* Password strength requirement indicators */}
            <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
              <span className="flex items-center gap-1 font-medium">
                {passwordValue.length >= 6 ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <span className="w-3.5 h-3.5 rounded-xs border border-zinc-300 dark:border-zinc-700 inline-block" />
                )}
                <span className={passwordValue.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                  Tối thiểu 6 ký tự
                </span>
              </span>
            </div>
          </div>

          <Input
            id="register-confirm-password"
            label="Xác nhận mật khẩu"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            iconPrefix={<ShieldCheck className="w-4 h-4" />}
            iconSuffix={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1"
                tabIndex={-1}
                aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.confirmPassword?.message}
            required
            autoComplete="new-password"
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            variant="default"
            isLoading={isSubmitting}
            iconPrefix={<UserPlus className="w-4 h-4" />}
            className="w-full mt-2 text-sm font-medium"
          >
            Đăng Ký Tài Khoản
          </Button>
        </form>

        {/* Liên kết quay lại Đăng nhập */}
        <div className="text-center pt-2 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-zinc-800/30">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            className="font-semibold text-zinc-900 dark:text-zinc-200 hover:underline underline-offset-2 ml-1"
          >
            Đăng nhập ngay
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
