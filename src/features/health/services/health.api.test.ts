import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/api/client'
import { healthApi } from './health.api'
import type { HealthResponse } from '@/types/api'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

const mockHealthData: HealthResponse = {
  status: 'pass',
  version: '1',
  releaseId: '4f589f9cba3819ddad63720029f3c16becf3b9a6',
  serviceId: 'my-first-api',
  description: 'Health status conforming to IETF Draft',
  checks: {
    'system:uptime': [
      {
        componentId: 'node-process',
        componentType: 'system',
        status: 'pass',
        observedValue: 3620,
        observedUnit: 's',
        time: '2026-11-05T08:48:04.942Z',
        output: 'Tiến trình hoạt động ổn định',
      },
    ],
    'system:memory': [
      {
        componentId: 'node-heap',
        componentType: 'system',
        status: 'pass',
        observedValue: 33.5,
        observedUnit: 'MB',
        time: '2026-11-05T08:48:04.942Z',
        output: 'Bộ nhớ sử dụng bình thường',
      },
    ],
    'datastore:supabase': [
      {
        componentId: 'supabase-database',
        componentType: 'datastore',
        status: 'pass',
        observedValue: 144,
        observedUnit: 'ms',
        time: '2026-11-05T08:48:04.942Z',
        output: 'Kết nối Supabase phản hồi trong 144ms',
      },
    ],
  },
}

describe('healthApi service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi getHealth với endpoint /health và Accept header chuẩn IETF', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHealthData, status: 200 })

    const result = await healthApi.getHealth()

    expect(apiClient.get).toHaveBeenCalledWith('/health', {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    expect(result.status).toBe('pass')
    expect(result.serviceId).toBe('my-first-api')
    expect(result.checks['datastore:supabase'][0].observedValue).toBe(144)
  })

  it('gọi getLiveness với endpoint /health/live', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { status: 'pass', serviceId: 'my-first-api' },
      status: 200,
    })

    const result = await healthApi.getLiveness()

    expect(apiClient.get).toHaveBeenCalledWith('/health/live', {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    expect(result.status).toBe('pass')
  })

  it('gọi getReadiness với endpoint /health/ready', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: { status: 'pass', serviceId: 'my-first-api' },
      status: 200,
    })

    const result = await healthApi.getReadiness()

    expect(apiClient.get).toHaveBeenCalledWith('/health/ready', {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    expect(result.status).toBe('pass')
  })

  it('gọi getHealthz với endpoint /healthz', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockHealthData,
      status: 200,
    })

    const result = await healthApi.getHealthz()

    expect(apiClient.get).toHaveBeenCalledWith('/healthz', {
      headers: {
        Accept: 'application/health+json, application/json',
      },
    })
    expect(result.status).toBe('pass')
  })

  it('executeProbe đo đạc độ trễ roundtrip thành công', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({
      data: mockHealthData,
      status: 200,
    })

    const probeRes = await healthApi.executeProbe('health')

    expect(probeRes.endpoint).toBe('/health')
    expect(probeRes.status).toBe('pass')
    expect(probeRes.httpStatus).toBe(200)
    expect(typeof probeRes.latencyMs).toBe('number')
    expect(probeRes.data).toEqual(mockHealthData)
  })

  it('executeProbe bắt lỗi và trả về ProbeResult dạng error khi request thất bại', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce({
      response: { status: 503, data: { message: 'Service Unavailable' } },
      message: 'Network error 503',
    })

    const probeRes = await healthApi.executeProbe('ready')

    expect(probeRes.endpoint).toBe('/health/ready')
    expect(probeRes.status).toBe('error')
    expect(probeRes.httpStatus).toBe(503)
    expect(probeRes.error).toBe('Network error 503')
  })
})
