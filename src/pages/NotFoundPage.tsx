import { Link, useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'
import { Button, Card, CardContent, ThemeToggle } from '@/components/ui'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex items-center justify-center p-4 relative transition-colors duration-200">
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle variant="icon" />
      </div>

      <div className="fixed inset-0 pointer-events-none dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.02),transparent_70%)]" />

      <Card className="max-w-md w-full border border-zinc-200/60 dark:border-zinc-800/50 bg-white/90 dark:bg-zinc-900/60 shadow-xl overflow-hidden text-center backdrop-blur-sm rounded-2xl">
        <CardContent className="p-8 sm:p-10 space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-300 mx-auto">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-medium bg-zinc-100/70 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-700/40">
              Error 404 · Page Not Found
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Không tìm thấy trang
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc đường dẫn đã thay đổi.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              iconPrefix={<ArrowLeft className="w-4 h-4 text-zinc-400" />}
              className="w-full sm:w-auto"
            >
              Quay lại
            </Button>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="default"
                iconPrefix={<Home className="w-4 h-4" />}
                className="w-full"
              >
                Về Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
