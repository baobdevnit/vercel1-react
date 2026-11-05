import { useState } from 'react'
import {
  Database,
  Cpu,
  Clock,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  GitCommit,
  Radio,
  History,
  Trash2,
  Activity,
  Layers,
  ArrowUpRight,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Spinner,
} from '@/components/ui'
import { useSystemHealth } from '@/features/health/hooks/useSystemHealth'
import { HealthProbeTester } from '@/features/health/components/HealthProbeTester'
import { getErrorMessage } from '@/api/client'
import { cn } from '@/lib/utils'

export function HealthMonitorPage() {
  const apiUrl = import.meta.env.VITE_API_URL || 'https://render1-api.onrender.com'
  const [copiedRelease, setCopiedRelease] = useState(false)
  const [copiedJson, setCopiedJson] = useState(false)

  const {
    health,
    isLoading,
    isFetching,
    error,
    refetch,
    dbCheck,
    memoryCheck,
    uptimeCheck,
    supabaseLatencyMs,
    memoryMb,
    uptimeSeconds,
    latencyRating,
    formattedUptime,
    overallStatus,
    isHealthy,
    isAutoRefresh,
    toggleAutoRefresh,
    refreshInterval,
    setRefreshInterval,
    history,
    clearHistory,
    lastCheckedFormatted,
  } = useSystemHealth({ defaultInterval: 15000, initialAutoRefresh: true })

  const copyToClipboard = async (text: string, type: 'release' | 'json') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'release') {
        setCopiedRelease(true)
        setTimeout(() => setCopiedRelease(false), 2000)
      } else {
        setCopiedJson(true)
        setTimeout(() => setCopiedJson(false), 2000)
      }
    } catch {
      // Fallback
    }
  }

  // Tỷ lệ heap ram sử dụng nếu bóc tách được từ text: "33.04MB / 38.49MB"
  const memoryPercent = (() => {
    if (!memoryCheck?.output) return null
    const match = memoryCheck.output.match(/([\d.]+)MB\s*\/\s*([\d.]+)MB/)
    if (match && match[1] && match[2]) {
      const used = parseFloat(match[1])
      const total = parseFloat(match[2])
      if (total > 0) return Math.min(Math.round((used / total) * 100), 100)
    }
    return null
  })()

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Bar with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Activity className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
              <span>Giám Sát Sức Khỏe Hệ Thống</span>
            </h1>
            <Badge
              variant={isHealthy ? 'pass' : overallStatus === 'warn' ? 'warn' : 'fail'}
              dot
              size="md"
            >
              {isLoading ? 'CHECKING' : isHealthy ? 'PASS (100%)' : overallStatus.toUpperCase()}
            </Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Theo dõi tình trạng vận hành của backend <strong>render1-api</strong>, tiến trình Node.js và độ trễ cơ sở dữ liệu Supabase theo chuẩn IETF RFC Draft.
          </p>
        </div>

        {/* Polling & Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800/50 bg-white/80 dark:bg-zinc-900/40 text-xs shadow-xs backdrop-blur-xs">
            <Radio
              className={cn(
                'w-3.5 h-3.5',
                isAutoRefresh ? 'text-emerald-600 dark:text-emerald-400 animate-pulse' : 'text-zinc-400 dark:text-zinc-500',
              )}
            />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">Tự động làm mới:</span>
            <button
              type="button"
              onClick={toggleAutoRefresh}
              className={cn(
                'px-2 py-0.5 rounded-sm font-semibold transition-colors cursor-pointer',
                isAutoRefresh
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200/60 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700/60',
              )}
            >
              {isAutoRefresh ? 'Bật' : 'Tắt'}
            </button>

            {isAutoRefresh && (
              <select
                aria-label="Chu kỳ làm mới"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-transparent text-xs text-zinc-800 dark:text-zinc-200 font-mono focus:outline-none cursor-pointer border-l border-zinc-200/60 dark:border-zinc-700/60 pl-1.5 ml-1"
              >
                <option value={10000} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">10s</option>
                <option value={15000} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">15s</option>
                <option value={30000} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">30s</option>
                <option value={60000} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">60s</option>
              </select>
            )}
          </div>

          {/* Test Now Button */}
          <Button
            variant="default"
            size="sm"
            onClick={() => refetch()}
            isLoading={isFetching}
            iconPrefix={<Activity className="w-4 h-4" />}
          >
            Kiểm Tra Ngay
          </Button>
        </div>
      </div>

      {/* 2. Loading State */}
      {isLoading && !health && (
        <Card className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-600 dark:text-zinc-400">
          <Spinner size="lg" className="text-zinc-700 dark:text-zinc-200" />
          <p className="text-sm font-medium">Đang kết nối và thu thập chỉ số sức khỏe từ {apiUrl}...</p>
        </Card>
      )}

      {/* 3. Error Banner */}
      {error && (
        <div className="p-4 sm:p-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-800/40 text-red-900 dark:text-red-300 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <span>Không thể kết nối đến máy chủ backend ({apiUrl})</span>
            </div>
            <Button variant="destructive" size="sm" onClick={() => refetch()} isLoading={isFetching}>
              Thử Lại
            </Button>
          </div>
          <p className="text-xs leading-relaxed font-mono">
            {getErrorMessage(error)}
          </p>
          <p className="text-xs text-red-700 dark:text-red-400/80">
            * Lưu ý: Nếu server Render ở chế độ Free Tier đang "ngủ đông" (Spin down), request đầu tiên có thể mất khoảng 30-50 giây để khởi động lại tiến trình.
          </p>
        </div>
      )}

      {health && (
        <>
          {/* 4. Overall Health Banner */}
          <div
            className={cn(
              'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 backdrop-blur-xs',
              isHealthy
                ? 'bg-emerald-50/70 dark:bg-emerald-950/25 border-emerald-200/50 dark:border-emerald-800/40 text-emerald-950 dark:text-emerald-200'
                : overallStatus === 'warn'
                  ? 'bg-amber-50/70 dark:bg-amber-950/25 border-amber-200/50 dark:border-amber-800/40 text-amber-950 dark:text-amber-200'
                  : 'bg-red-50/70 dark:bg-red-950/25 border-red-200/50 dark:border-red-800/40 text-red-950 dark:text-red-200',
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                  isHealthy
                    ? 'bg-emerald-100/80 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-300/50 dark:border-emerald-700/40'
                    : overallStatus === 'warn'
                      ? 'bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-300/50 dark:border-amber-700/40'
                      : 'bg-red-100/80 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-300/50 dark:border-red-700/40',
                )}
              >
                {isHealthy ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                  {isHealthy
                    ? 'Tất cả các dịch vụ đang vận hành ổn định (Status: PASS)'
                    : overallStatus === 'warn'
                      ? 'Hệ thống có cảnh báo về hiệu năng hoặc kết nối'
                      : 'Phát hiện sự cố suy giảm dịch vụ trên backend'}
                </h3>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 opacity-90 mt-0.5">
                  {health.notes?.[0] || health.description || 'Hệ thống đáp ứng tiêu chuẩn IETF RFC Draft.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto text-xs opacity-90 font-mono text-zinc-600 dark:text-zinc-300">
              <span>Lần kiểm tra gần nhất: {lastCheckedFormatted || 'Vừa xong'}</span>
            </div>
          </div>

          {/* 5. Four Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Metric 1: Supabase Database */}
            <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                    <Database className="w-5 h-5" />
                  </div>
                  <Badge variant={dbCheck?.status === 'pass' ? 'pass' : 'fail'} dot size="sm">
                    {dbCheck?.status ? dbCheck.status.toUpperCase() : 'UNKNOWN'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Cơ Sở Dữ Liệu Supabase</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Độ trễ truy vấn ping database</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {supabaseLatencyMs ?? '—'}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">ms</span>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-0.5 rounded-sm border uppercase',
                      latencyRating === 'excellent' &&
                        'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                      latencyRating === 'good' &&
                        'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
                      latencyRating === 'fair' &&
                        'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
                      latencyRating === 'slow' &&
                        'bg-red-100 text-red-900 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
                    )}
                  >
                    {latencyRating === 'excellent'
                      ? 'Rất Tốt'
                      : latencyRating === 'good'
                        ? 'Ổn Định'
                        : latencyRating === 'fair'
                          ? 'Trung Bình'
                          : 'Chậm'}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {dbCheck?.output || 'Kết nối PostgreSQL Supabase sẵn sàng.'}
                </p>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Loại: {dbCheck?.componentType || 'datastore'}</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{dbCheck?.componentId || 'supabase-database'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 2: Node.js Heap Memory */}
            <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <Badge variant={memoryCheck?.status === 'pass' ? 'pass' : 'fail'} dot size="sm">
                    {memoryCheck?.status ? memoryCheck.status.toUpperCase() : 'PASS'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Node.js Heap Memory</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Dung lượng RAM tiến trình backend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono">
                    {memoryMb ?? '—'}
                    <span className="text-sm font-normal text-zinc-500 dark:text-zinc-400 ml-1">MB</span>
                  </div>
                  {memoryPercent !== null && (
                    <span className="text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300">
                      {memoryPercent}%
                    </span>
                  )}
                </div>

                {memoryPercent !== null && (
                  <div className="w-full bg-zinc-100/80 dark:bg-zinc-800/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        memoryPercent > 85 ? 'bg-red-500' : 'bg-zinc-800 dark:bg-zinc-100',
                      )}
                      style={{ width: `${memoryPercent}%` }}
                    />
                  </div>
                )}

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {memoryCheck?.output || 'Bộ nhớ nằm trong định mức an toàn.'}
                </p>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Loại: {memoryCheck?.componentType || 'system'}</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">{memoryCheck?.componentId || 'node-heap'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 3: System Uptime */}
            <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <Badge variant="pass" dot size="sm">
                    ONLINE
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Uptime Tiến Trình</CardTitle>
                <CardDescription className="text-xs text-zinc-500 dark:text-zinc-400">Thời gian hoạt động liên tục</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 font-mono truncate" title={formattedUptime}>
                  {formattedUptime}
                </div>

                <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {uptimeCheck?.output || `Tiến trình hoạt động trong ${uptimeSeconds ?? 0}s`}
                </p>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Quan sát:</span>
                  <span className="font-mono font-medium text-zinc-700 dark:text-zinc-300">
                    {uptimeSeconds ? `${uptimeSeconds.toLocaleString()} giây` : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Metric 4: Service ID & Release Hash */}
            <Card className="hover:border-zinc-300/80 dark:hover:border-zinc-700/60 hover:shadow-sm transition-all duration-200">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg bg-zinc-100/80 dark:bg-zinc-800/50 border border-zinc-200/50 dark:border-zinc-700/40 text-zinc-700 dark:text-zinc-200 flex items-center justify-center">
                    <GitCommit className="w-5 h-5" />
                  </div>
                  <Badge variant="info" size="sm">
                    v{health.version || '1'}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-semibold mt-2 text-zinc-900 dark:text-zinc-100">Bản Phát Hành & Dịch Vụ</CardTitle>
                <CardDescription className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{health.serviceId}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold block mb-1">
                    Git Release Commit
                  </span>
                  <div className="flex items-center justify-between gap-1 p-1.5 rounded-lg bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/40 dark:border-zinc-800/30 font-mono text-xs">
                    <span className="truncate text-zinc-700 dark:text-zinc-300">
                      {health.releaseId ? health.releaseId.substring(0, 12) : '0.0.1'}
                    </span>
                    {health.releaseId && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(health.releaseId, 'release')}
                        className="p-1 rounded-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                        title="Sao chép Release Hash"
                      >
                        {copiedRelease ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800/40 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500 dark:text-zinc-400">Tiêu chuẩn:</span>
                  <span className="text-zinc-800 dark:text-zinc-300 font-medium font-mono">IETF RFC Draft</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 6. Recent Checks History Timeline */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/40">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <History className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Lịch Sử Kiểm Tra Gần Nhất</span>
                    <Badge variant="default" size="sm">
                      {history.length} mẫu
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                    Theo dõi biến thiên độ trễ Supabase và bộ nhớ RAM theo thời gian thực (tối đa 10 lần gần nhất).
                  </CardDescription>
                </div>

                {history.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearHistory}
                    iconPrefix={<Trash2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
                    className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                  >
                    Xóa Lịch Sử
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {history.length === 0 ? (
                <div className="py-6 text-center text-xs text-zinc-500">
                  Chưa có mẫu lịch sử kiểm tra nào. Lịch sử sẽ tự động ghi nhận khi làm mới.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-zinc-100 dark:border-zinc-800/40 text-zinc-600 dark:text-zinc-400 font-semibold uppercase tracking-wider text-[11px]">
                        <th className="py-2.5 px-3">Thời Điểm</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                        <th className="py-2.5 px-3">Độ Trễ Supabase</th>
                        <th className="py-2.5 px-3">Heap RAM</th>
                        <th className="py-2.5 px-3">Uptime</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/30 font-mono">
                      {history.map((item, idx) => (
                        <tr
                          key={item.id}
                          className={cn(
                            'hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition-colors',
                            idx === 0 && 'bg-zinc-100/60 dark:bg-zinc-800/40 font-semibold text-zinc-900 dark:text-zinc-100',
                          )}
                        >
                          <td className="py-2 px-3 text-zinc-800 dark:text-zinc-300">
                            {item.timeFormatted} {idx === 0 && <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase ml-1">(Mới nhất)</span>}
                          </td>
                          <td className="py-2 px-3">
                            <Badge
                              variant={item.status === 'pass' ? 'pass' : item.status === 'warn' ? 'warn' : 'fail'}
                              size="sm"
                              dot
                            >
                              {item.status.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-2 px-3">
                            {item.supabaseLatencyMs !== undefined ? (
                              <span
                                className={cn(
                                  item.supabaseLatencyMs < 200
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : item.supabaseLatencyMs < 600
                                      ? 'text-amber-700 dark:text-amber-300'
                                      : 'text-red-700 dark:text-red-400',
                                )}
                              >
                                {item.supabaseLatencyMs} ms
                              </span>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td className="py-2 px-3 text-zinc-800 dark:text-zinc-300">
                            {item.memoryMb ? `${item.memoryMb} MB` : '—'}
                          </td>
                          <td className="py-2 px-3 text-zinc-600 dark:text-zinc-400">
                            {item.uptimeSeconds ? `${item.uptimeSeconds}s` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7. Interactive Probes Diagnostic Panel */}
          <HealthProbeTester />

          {/* 8. Raw IETF Response Inspector */}
          <Card>
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800/40">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-base font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                    <span>Dữ Liệu Thô Chuẩn IETF application/health+json</span>
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-600 dark:text-zinc-400">
                    Cấu trúc phản hồi đầy đủ từ endpoint <code>GET /health</code> phục vụ giám sát và tích hợp tự động.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(JSON.stringify(health, null, 2), 'json')}
                    iconPrefix={
                      copiedJson ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {copiedJson ? 'Đã Chép!' : 'Sao Chép JSON'}
                  </Button>

                  <a
                    href={`${apiUrl}/health`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100/80 hover:bg-zinc-200 text-zinc-800 border border-zinc-200/60 dark:bg-zinc-800/60 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700/60 transition-colors"
                  >
                    <span>Mở /health</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`${apiUrl}/scalar`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-zinc-100/80 hover:bg-zinc-200 text-zinc-800 border border-zinc-200/60 dark:bg-zinc-800/60 dark:hover:bg-zinc-700 dark:text-zinc-200 dark:border-zinc-700/60 transition-colors"
                  >
                    <span>Scalar API Docs</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <pre className="p-4 rounded-xl bg-zinc-50/70 dark:bg-zinc-950/70 text-zinc-800 dark:text-zinc-200 text-xs font-mono overflow-x-auto max-h-96 leading-relaxed border border-zinc-200/40 dark:border-zinc-800/30">
                {JSON.stringify(health, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
