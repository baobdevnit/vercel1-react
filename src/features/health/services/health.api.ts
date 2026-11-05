import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { HealthResponse } from '@/types/api'

export interface ProbeResult {
  endpoint: string
  status: 'pass' | 'warn' | 'fail' | 'error'
  httpStatus: number
  latencyMs: number
  data?: HealthResponse | Record<string, unknown>
  error?: string
  timestamp: string
}

export const healthApi = {
  /**
   * Kiểm tra toàn diện tình trạng sức khỏe hệ thống (Uptime, Memory heap, Supabase Latency)
   * Chuẩn IETF Draft: application/health+json
   */
  getHealth: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH.ROOT, {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    return res.data
  },

  /**
   * Liveness Probe: Kiểm tra tiến trình backend có đang sống không
   */
  getLiveness: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH.LIVE, {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    return res.data
  },

  /**
   * Readiness Probe: Kiểm tra khả năng sẵn sàng phục vụ của các dịch vụ phụ thuộc (Supabase)
   */
  getReadiness: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH.READY, {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    return res.data
  },

  /**
   * Endpoint /healthz rút gọn
   */
  getHealthz: async (): Promise<HealthResponse> => {
    const res = await apiClient.get<HealthResponse>(API_ENDPOINTS.HEALTH.HEALTHZ, {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    return res.data
  },

  /**
   * Chạy probe và đo độ trễ Client Roundtrip (ms)
   */
  executeProbe: async (probeType: 'health' | 'live' | 'ready' | 'healthz'): Promise<ProbeResult> => {
    const endpointMap: Record<string, string> = {
      health: API_ENDPOINTS.HEALTH.ROOT,
      live: API_ENDPOINTS.HEALTH.LIVE,
      ready: API_ENDPOINTS.HEALTH.READY,
      healthz: API_ENDPOINTS.HEALTH.HEALTHZ,
    }

    const endpoint = endpointMap[probeType] || API_ENDPOINTS.HEALTH.ROOT
    const startTime = performance.now()
    const timestamp = new Date().toISOString()

    try {
      const res = await apiClient.get<HealthResponse>(endpoint, {
        headers: {
          Accept: 'application/health+json, application/json',
        },
      })
      const latencyMs = Math.round(performance.now() - startTime)

      return {
        endpoint,
        status: res.data?.status || 'pass',
        httpStatus: res.status,
        latencyMs,
        data: res.data,
        timestamp,
      }
    } catch (err: unknown) {
      const latencyMs = Math.round(performance.now() - startTime)
      const axiosErr = err as { response?: { status?: number; data?: Record<string, unknown> }; message?: string }
      return {
        endpoint,
        status: 'error',
        httpStatus: axiosErr.response?.status || 0,
        latencyMs,
        data: axiosErr.response?.data,
        error: axiosErr.message || 'Lỗi kết nối probe',
        timestamp,
      }
    }
  },
}
