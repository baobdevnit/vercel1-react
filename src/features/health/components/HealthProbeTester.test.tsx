import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { HealthProbeTester } from './HealthProbeTester'
import { healthApi } from '@/features/health/services/health.api'

describe('HealthProbeTester component', () => {
  let mockWriteText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()

    mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      configurable: true,
      writable: true,
    })
  })

  it('hiển thị danh sách 4 probe endpoints và nút kiểm tra toàn bộ', () => {
    render(<HealthProbeTester />)

    expect(screen.getByText('Trung Tâm Kiểm Thử & Chẩn Đoán Probes')).toBeDefined()
    expect(screen.getAllByText('/health').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('/health/live')).toBeDefined()
    expect(screen.getByText('/health/ready')).toBeDefined()
    expect(screen.getByText('/healthz')).toBeDefined()
    expect(screen.getByRole('button', { name: /Kiểm Tra Toàn Bộ Probes/i })).toBeDefined()
  })

  it('chạy probe đơn lẻ khi nhấn nút "Chạy Probe Này"', async () => {
    const executeProbeSpy = vi.spyOn(healthApi, 'executeProbe').mockResolvedValueOnce({
      endpoint: '/health',
      status: 'pass',
      httpStatus: 200,
      latencyMs: 142,
      data: { status: 'pass', serviceId: 'my-first-api' },
      timestamp: '2026-11-05T08:00:00.000Z',
    })

    render(<HealthProbeTester />)

    const runBtn = screen.getByRole('button', { name: /Chạy Probe Này/i })
    fireEvent.click(runBtn)

    await waitFor(() => {
      expect(executeProbeSpy).toHaveBeenCalledWith('health')
    })

    expect(screen.getByText('HTTP 200')).toBeDefined()
    expect(screen.getAllByText('142ms').length).toBeGreaterThanOrEqual(1)
  })

  it('chạy toàn bộ 4 probes song song khi nhấn nút "Kiểm Tra Toàn Bộ Probes"', async () => {
    const executeProbeSpy = vi.spyOn(healthApi, 'executeProbe').mockResolvedValue({
      endpoint: '/health',
      status: 'pass',
      httpStatus: 200,
      latencyMs: 120,
      data: { status: 'pass' },
      timestamp: '2026-11-05T08:00:00.000Z',
    })

    render(<HealthProbeTester />)

    const runAllBtn = screen.getByRole('button', { name: /Kiểm Tra Toàn Bộ Probes/i })
    fireEvent.click(runAllBtn)

    await waitFor(() => {
      expect(executeProbeSpy).toHaveBeenCalledTimes(4)
    })
  })

  it('sao chép kết quả JSON probe vào clipboard', async () => {
    vi.spyOn(healthApi, 'executeProbe').mockResolvedValueOnce({
      endpoint: '/health',
      status: 'pass',
      httpStatus: 200,
      latencyMs: 150,
      data: { status: 'pass', note: 'test-data' },
      timestamp: '2026-11-05T08:00:00.000Z',
    })

    render(<HealthProbeTester />)

    const runBtn = screen.getByRole('button', { name: /Chạy Probe Này/i })
    fireEvent.click(runBtn)

    await waitFor(() => {
      expect(screen.getByText('HTTP 200')).toBeDefined()
    })

    const copyBtn = screen.getByRole('button', { name: /Sao Chép JSON/i })
    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(mockWriteText).toHaveBeenCalledWith(
      JSON.stringify({ status: 'pass', note: 'test-data' }, null, 2),
    )
  })
})
