import { Outlet, Link } from 'react-router-dom'
import { Activity, ExternalLink, Globe } from 'lucide-react'
import { BrandCrest, ThemeToggle } from '@/components/ui'

export function AuthLayout() {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://render1-api.onrender.com'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between relative overflow-hidden font-sans transition-colors duration-200">
      {/* Decorative background subtle glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_70%)] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.03),transparent_70%)] pointer-events-none blur-2xl -z-10" />

      {/* Top Navigation / Brand bar */}
      <header className="w-full border-b border-zinc-200/60 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <BrandCrest size="md" />
            <div>
              <div className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Render I Portal
                <span className="text-[10px] font-mono font-medium tracking-wider px-1.5 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60 bg-zinc-100/80 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  CORE
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Nền tảng Quản trị & Vận hành Hệ thống
              </p>
            </div>
          </Link>

          {/* Backend Connection Indicator & Theme Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs bg-zinc-100/70 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800/40">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-zinc-500">API:</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 font-medium truncate max-w-[160px]">
                {apiUrl.replace('https://', '')}
              </span>
            </div>

            <a
              href={`${apiUrl}/scalar`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors px-2.5 py-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
            >
              <Activity className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              <span className="hidden md:inline">Tài Liệu API</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            {/* Quick theme toggle */}
            <ThemeToggle variant="icon" />
          </div>
        </div>
      </header>

      {/* Main Form Slot */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Minimal Tech Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm py-4 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-zinc-500" />
            <span>Kết nối NestJS + Supabase + React 19 SPA trên Vercel</span>
          </div>
          <div>© 2026 Render I Portal. Bảo lưu mọi quyền.</div>
        </div>
      </footer>
    </div>
  )
}
