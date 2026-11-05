import { useState } from 'react'
import {
  User as UserIcon,
  Mail,
  Calendar,
  Key,
  RefreshCw,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Shield,
  Fingerprint,
  Hourglass,
  Sparkles,
  Sun,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Skeleton,
  ThemeToggle,
} from '@/components/ui'
import { useProfile } from '@/features/profile/hooks/useProfile'
import { useAuthStore } from '@/stores/auth.store'
import { getTokenSessionMeta } from '@/utils/token'

export function ProfilePage() {
  const { token } = useAuthStore()
  const { user, isLoading, isRefetching, isError, errorMessage, refetch } = useProfile()
  const [isCopiedToken, setIsCopiedToken] = useState<boolean>(false)
  const [isCopiedId, setIsCopiedId] = useState<boolean>(false)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)

  // Phân tích metadata của JWT session
  const sessionMeta = getTokenSessionMeta(token)

  const handleManualRefetch = async () => {
    setFeedbackMessage(null)
    const result = await refetch()
    if (result.isSuccess) {
      setFeedbackMessage('Đã đồng bộ thông tin hồ sơ mới nhất từ máy chủ!')
      setTimeout(() => setFeedbackMessage(null), 4000)
    }
  }

  const handleCopyToken = () => {
    if (!token) return
    navigator.clipboard.writeText(token)
    setIsCopiedToken(true)
    setTimeout(() => setIsCopiedToken(false), 2000)
  }

  const handleCopyId = () => {
    if (!user?.id) return
    navigator.clipboard.writeText(user.id)
    setIsCopiedId(true)
    setTimeout(() => setIsCopiedId(false), 2000)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Hồ Sơ Cá Nhân
            </h2>
            <Badge variant={user?.role === 'admin' ? 'admin' : 'user'} dot size="md" className="rounded-sm">
              {user?.role?.toUpperCase() || 'USER'}
            </Badge>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Xem chi tiết thông tin định danh người dùng và kiểm tra thời hạn phiên làm việc JWT 24h.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleManualRefetch}
          isLoading={isRefetching}
          iconPrefix={<RefreshCw className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />}
        >
          Làm Mới Từ Máy Chủ
        </Button>
      </div>

      {/* FEEDBACK NOTIFICATION */}
      {feedbackMessage && (
        <div
          role="status"
          className="p-3.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-xs transition-all animate-fadeIn"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="font-medium">{feedbackMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackMessage(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-xs ml-4"
          >
            Đóng
          </button>
        </div>
      )}

      {/* ERROR BANNER */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-800 dark:text-red-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-200">Không thể tải thông tin hồ sơ mới nhất từ máy chủ</p>
              <p className="text-red-600 dark:text-red-400/80 mt-0.5">{errorMessage || 'Lỗi không xác định'}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs shrink-0 self-start sm:self-auto border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Thử Lại
          </Button>
        </div>
      )}

      {/* SKELETON LOADING STATE */}
      {isLoading ? (
        <div className="space-y-6" data-testid="profile-skeleton">
          <Card className="border-zinc-200/50 dark:border-zinc-800/40 bg-white/80 dark:bg-zinc-900/30">
            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/40">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 shrink-0 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <Skeleton className="h-4 w-64" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/50 dark:border-zinc-800/40 bg-white/80 dark:bg-zinc-900/30">
            <CardHeader>
              <Skeleton className="h-6 w-60" />
              <Skeleton className="h-4 w-96 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full rounded-xl" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* MAIN PROFILE CARD */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-5 border-b border-zinc-100 dark:border-zinc-800/40 bg-zinc-50/40 dark:bg-zinc-950/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-xl bg-zinc-100/90 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 font-bold text-2xl flex items-center justify-center shadow-xs border border-zinc-200/50 dark:border-zinc-700/40 select-none">
                      {user?.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-8 h-8" />
                      )}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-zinc-900" />
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        {user?.name || 'Chưa cập nhật họ tên'}
                      </CardTitle>
                      <Badge variant={user?.role === 'admin' ? 'admin' : 'user'} dot size="md" className="rounded-sm">
                        {user?.role === 'admin' ? 'QUẢN TRỊ VIÊN' : 'NGƯỜI DÙNG'}
                      </Badge>
                    </div>

                    <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      <Mail className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      <span className="font-mono text-zinc-700 dark:text-zinc-300 font-medium select-all">
                        {user?.email}
                      </span>
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant="pass" size="sm" dot className="rounded-sm">
                    Đang hoạt động
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {/* ID Card with Copy */}
                <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-1.5 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                      <Fingerprint className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                      Mã Định Danh (UUID)
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sao chép UUID"
                    >
                      {isCopiedId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px] font-medium">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200 select-all truncate">
                    {user?.id || '—'}
                  </p>
                </div>

                {/* Role Card */}
                <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-1.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    Quyền Hạn Hệ Thống
                  </span>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-700 dark:text-zinc-200 text-xs">
                      {user?.role === 'admin'
                        ? 'Toàn quyền Quản trị (Truy cập /admin/*, quản lý Users)'
                        : 'Thành viên tiêu chuẩn (Truy cập Dashboard, Profile, Health)'}
                    </p>
                  </div>
                </div>

                {/* Created At */}
                <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-1.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                    Ngày khởi tạo tài khoản
                  </span>
                  <p className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
                    {formatDate(user?.createdAt)}
                  </p>
                </div>

                {/* Updated At */}
                <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-1.5">
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    Cập nhật lần cuối
                  </span>
                  <p className="font-medium text-xs text-zinc-700 dark:text-zinc-300">
                    {formatDate(user?.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CARD TÙY CHỌN GIAO DIỆN (THEME SETTINGS) */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" />
                    Tùy Chọn Giao Diện (Theme Settings)
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    Cá nhân hóa giao diện theo ý muốn: Sáng, Tối hoặc Tự động đồng bộ với hệ điều hành.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  Chế độ hiển thị màu sắc
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Tùy chọn được lưu tự động trên trình duyệt và áp dụng tức thì mà không cần nạp lại trang.
                </p>
              </div>
              <ThemeToggle variant="segmented" />
            </CardContent>
          </Card>

          {/* JWT SESSION DETAILS & LIFETIME CARD */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                      Phiên Xác Thực JWT (Thời Hạn 24 Giờ)
                    </CardTitle>
                    <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                      JWT Access Token được ký bởi backend NestJS và lưu trong LocalStorage.
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <Badge variant={sessionMeta.isValid ? 'pass' : 'fail'} dot size="sm" className="rounded-sm">
                    {sessionMeta.isValid ? 'Token Hợp Lệ' : 'Đã Hết Hạn'}
                  </Badge>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToken}
                    iconPrefix={
                      isCopiedToken ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-xs"
                  >
                    {isCopiedToken ? 'Đã sao chép' : 'Sao chép Token'}
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-5 space-y-5">
              {/* Session Lifetime Progress */}
              <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-zinc-700 dark:text-zinc-200">
                    <Hourglass className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Thời hạn còn lại của phiên làm việc:</span>
                  </div>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
                    {sessionMeta.remainingFormatted}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-200/80 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sessionMeta.percentRemaining > 30
                        ? 'bg-zinc-900 dark:bg-zinc-100'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${sessionMeta.percentRemaining}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>
                    Phát hành:{' '}
                    <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                      {sessionMeta.issuedAt ? formatDate(sessionMeta.issuedAt.toISOString()) : '—'}
                    </strong>
                  </span>
                  <span>
                    Hết hạn:{' '}
                    <strong className="text-zinc-700 dark:text-zinc-300 font-mono">
                      {sessionMeta.expiresAt ? formatDate(sessionMeta.expiresAt.toISOString()) : '—'}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Decoded Claims Summary */}
              {sessionMeta.payload && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    Payload Giải Mã Từ Token (Decoded Claims)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30">
                      <span className="text-[10px] text-zinc-500 block uppercase">
                        sub (User ID)
                      </span>
                      <span className="truncate block font-semibold text-zinc-800 dark:text-zinc-200" title={sessionMeta.payload.sub}>
                        {sessionMeta.payload.sub}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30">
                      <span className="text-[10px] text-zinc-500 block uppercase">
                        email
                      </span>
                      <span
                        className="truncate block font-semibold text-zinc-800 dark:text-zinc-200"
                        title={sessionMeta.payload.email}
                      >
                        {sessionMeta.payload.email}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30">
                      <span className="text-[10px] text-zinc-500 block uppercase">
                        role
                      </span>
                      <span className="block font-semibold uppercase text-zinc-800 dark:text-zinc-200">
                        {sessionMeta.payload.role}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-zinc-50/60 dark:bg-zinc-950/40 border border-zinc-200/40 dark:border-zinc-800/30">
                      <span className="text-[10px] text-zinc-500 block uppercase">
                        exp (Unix)
                      </span>
                      <span className="block font-semibold text-zinc-800 dark:text-zinc-200">{sessionMeta.payload.exp}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Raw Bearer Token String */}
              <div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1.5">
                  Chuỗi Token Thô (Raw Access Token):
                </span>
                <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/40 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] break-all leading-relaxed max-h-28 overflow-y-auto select-all border border-zinc-200/40 dark:border-zinc-800/30 shadow-2xs">
                  {token || 'Không tìm thấy access token'}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
