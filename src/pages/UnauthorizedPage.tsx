import { Link, useLocation } from 'react-router-dom'
import { ShieldAlert, Home, LogOut, User } from 'lucide-react'
import { Button, Card, CardContent, Badge, ThemeToggle } from '@/components/ui'
import { useAuthStore } from '@/stores/auth.store'

export function UnauthorizedPage() {
  const location = useLocation()
  const { user, clearAuth } = useAuthStore()

  const attemptedUrl = (location.state as { attemptedUrl?: string })?.attemptedUrl || 'khu vực này'

  const handleLogout = () => {
    clearAuth()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 relative transition-colors duration-200">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="icon" />
      </div>

      <div className="fixed inset-0 pointer-events-none dark:bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.06),transparent_70%)] bg-[radial-gradient(ellipse_at_center,rgba(239,68,68,0.04),transparent_70%)]" />

      <Card className="max-w-lg w-full border border-zinc-200/60 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/60 shadow-xl overflow-hidden backdrop-blur-sm rounded-2xl">
        <CardContent className="p-8 sm:p-10 space-y-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-red-100/80 dark:bg-red-950/40 border border-red-200/50 dark:border-red-800/40 text-red-600 dark:text-red-400 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-red-100/70 dark:bg-red-950/60 border border-red-200/50 dark:border-red-800/40 text-red-800 dark:text-red-300">
              Error 403 · Access Denied
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Quyền truy cập bị từ chối
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              Bạn không có đặc quyền <strong>Quản trị viên (Admin)</strong> để truy cập đường dẫn{' '}
              <code className="px-1.5 py-0.5 rounded-md bg-zinc-100/80 dark:bg-zinc-950/80 text-zinc-800 dark:text-zinc-300 text-xs font-mono border border-zinc-200/50 dark:border-zinc-800/40">
                {attemptedUrl}
              </code>
              .
            </p>
          </div>

          {/* Current user session info */}
          {user && (
            <div className="p-4 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-200/40 dark:border-zinc-800/30 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400 font-medium">
                <span>Tài khoản hiện tại:</span>
                <Badge variant={user.role === 'admin' ? 'admin' : 'user'} dot className="rounded-sm">
                  {user.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between font-semibold text-zinc-800 dark:text-zinc-200">
                <span className="truncate">{user.name}</span>
                <span className="text-zinc-500 font-normal font-mono">{user.email}</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="default"
                iconPrefix={<Home className="w-4 h-4" />}
                className="w-full"
              >
                Về Dashboard
              </Button>
            </Link>
            <Link to="/profile" className="w-full sm:w-auto">
              <Button
                variant="outline"
                iconPrefix={<User className="w-4 h-4" />}
                className="w-full"
              >
                Hồ sơ cá nhân
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleLogout}
              iconPrefix={<LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />}
              className="w-full sm:w-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              Đăng xuất
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
