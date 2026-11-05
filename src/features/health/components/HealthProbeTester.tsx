import { useState } from 'react'
import {
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Spinner } from '@/components/ui'
import { healthApi, type ProbeResult } from '@/features/health/services/health.api'

type ProbeType = 'health' | 'live' | 'ready' | 'healthz'

interface ProbeDefinition {
  type: ProbeType
  name: string
  path: string
  description: string
  probePurpose: 'Health tổng thể' | 'Liveness' | 'Readiness' | 'K8s Healthz'
}

const PROBE_LIST: ProbeDefinition[] = [
  {
    type: 'health',
    name: 'Full Health Check',
    path: '/health',
    description: 'Báo cáo chi tiết Uptime, RAM Heap và Latency Supabase theo chuẩn IETF RFC Draft.',
    probePurpose: 'Health tổng thể',
  },
  {
    type: 'live',
    name: 'Liveness Probe',
    path: '/health/live',
    description: 'Kiểm tra tiến trình Node.js có còn sống không (thường dùng cho Docker/K8s restart).',
    probePurpose: 'Liveness',
  },
  {
    type: 'ready',
    name: 'Readiness Probe',
    path: '/health/ready',
    description: 'Kiểm tra cơ sở dữ liệu Supabase đã sẵn sàng tiếp nhận truy vấn chưa (traffic routing).',
    probePurpose: 'Readiness',
  },
  {
    type: 'healthz',
    name: 'Healthz Endpoint',
    path: '/healthz',
    description: 'Endpoint quy chuẩn phổ biến cho các bộ cân bằng tải Load Balancer và Ingress.',
    probePurpose: 'K8s Healthz',
  },
]

export function HealthProbeTester() {
  const [selectedProbe, setSelectedProbe] = useState<ProbeType>('health')
  const [loadingProbes, setLoadingProbes] = useState<Record<string, boolean>>({})
  const [results, setResults] = useState<Partial<Record<ProbeType, ProbeResult>>>({})
  const [copied, setCopied] = useState<boolean>(false)

  const runProbe = async (type: ProbeType) => {
    setLoadingProbes((prev) => ({ ...prev, [type]: true }))
    try {
      const res = await healthApi.executeProbe(type)
      setResults((prev) => ({ ...prev, [type]: res }))
      setSelectedProbe(type)
    } finally {
      setLoadingProbes((prev) => ({ ...prev, [type]: false }))
    }
  }

  const runAllProbes = async () => {
    setLoadingProbes({
      health: true,
      live: true,
      ready: true,
      healthz: true,
    })
    try {
      const [rHealth, rLive, rReady, rHealthz] = await Promise.all([
        healthApi.executeProbe('health'),
        healthApi.executeProbe('live'),
        healthApi.executeProbe('ready'),
        healthApi.executeProbe('healthz'),
      ])
      setResults({
        health: rHealth,
        live: rLive,
        ready: rReady,
        healthz: rHealthz,
      })
    } finally {
      setLoadingProbes({})
    }
  }

  const currentResult = results[selectedProbe]
  const isAnyLoading = Object.values(loadingProbes).some(Boolean)

  const copyJson = async (data?: unknown) => {
    if (!data) return
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  return (
    <Card className="font-sans">
      <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>Trung Tâm Kiểm Thử & Chẩn Đoán Probes</span>
              <Badge variant="info" size="sm">
                Live Probes
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
              Thực thi và đo kiểm trực tiếp từng endpoint sức khỏe (Liveness, Readiness, Healthz) theo thời gian thực.
            </CardDescription>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={runAllProbes}
            isLoading={isAnyLoading}
            iconPrefix={<RefreshCw className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
          >
            Kiểm Tra Toàn Bộ Probes
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Probe Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROBE_LIST.map((probe) => {
            const isLoading = !!loadingProbes[probe.type]
            const result = results[probe.type]
            const isSelected = selectedProbe === probe.type

            return (
              <div
                key={probe.type}
                onClick={() => setSelectedProbe(probe.type)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'border-zinc-300 dark:border-zinc-600 bg-zinc-100/80 dark:bg-zinc-800/60 shadow-xs ring-1 ring-zinc-300/50 dark:ring-zinc-600/40'
                    : 'border-zinc-200/50 hover:border-zinc-300/70 dark:border-zinc-800/40 dark:hover:border-zinc-700/50 bg-zinc-50/50 hover:bg-zinc-100/50 dark:bg-zinc-900/30'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      {probe.path}
                    </span>
                    <Badge variant="default" size="sm" className="text-[10px] px-1.5 py-0">
                      {probe.probePurpose}
                    </Badge>
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {probe.name}
                  </p>
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1 line-clamp-2">
                    {probe.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/30 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                        <Spinner size="xs" className="text-zinc-400" /> Đang gửi...
                      </span>
                    ) : result ? (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold ${
                          result.status === 'pass'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-red-700 dark:text-red-400'
                        }`}
                      >
                        {result.status === 'pass' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{result.latencyMs}ms</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-500">Chưa kiểm tra</span>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation()
                      runProbe(probe.type)
                    }}
                    className="p-1 rounded-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    title={`Chạy ${probe.path}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Probe Details & Result Inspector */}
        <div className="rounded-xl border border-zinc-200/50 dark:border-zinc-800/40 bg-zinc-50/60 dark:bg-zinc-950/40 p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Chi Tiết Kết Quả:
              </span>
              <span className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-200">
                GET {PROBE_LIST.find((p) => p.type === selectedProbe)?.path}
              </span>
              {currentResult && (
                <Badge
                  variant={currentResult.status === 'pass' ? 'pass' : 'fail'}
                  size="sm"
                  dot
                >
                  HTTP {currentResult.httpStatus || 200}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {currentResult && (
                <>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-zinc-400" />
                    Độ trễ: <strong className="text-zinc-800 dark:text-zinc-200">{currentResult.latencyMs}ms</strong>
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyJson(currentResult.data)}
                    iconPrefix={
                      copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )
                    }
                    className="text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                  >
                    {copied ? 'Đã Chép!' : 'Sao Chép JSON'}
                  </Button>
                </>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => runProbe(selectedProbe)}
                isLoading={loadingProbes[selectedProbe]}
                iconPrefix={<Play className="w-3 h-3 fill-current text-zinc-700 dark:text-zinc-200" />}
              >
                Chạy Probe Này
              </Button>
            </div>
          </div>

          {currentResult ? (
            <div className="space-y-2">
              {currentResult.error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-800/40 text-red-900 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  <span>{currentResult.error}</span>
                </div>
              )}
              <pre className="p-3.5 rounded-lg bg-white/80 dark:bg-zinc-900/60 text-zinc-900 dark:text-zinc-200 text-xs font-mono overflow-x-auto max-h-72 leading-relaxed border border-zinc-200/40 dark:border-zinc-800/30">
                {JSON.stringify(currentResult.data, null, 2)}
              </pre>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-500">
              Nhấn <strong>"Chạy Probe Này"</strong> để kích hoạt request kiểm thử trực tiếp đến{' '}
              <code className="font-mono text-zinc-800 dark:text-zinc-300">
                {PROBE_LIST.find((p) => p.type === selectedProbe)?.path}
              </code>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
