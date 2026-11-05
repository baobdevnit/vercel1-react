import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProfilePage } from './ProfilePage'
import { useAuthStore } from '@/stores/auth.store'
import { authApi } from '@/features/auth/services/auth.api'
import type { User } from '@/types/api'

describe('ProfilePage Component', () => {
  let queryClient: QueryClient
  let mockWriteText: ReturnType<typeof vi.fn>

  const mockUser: User = {
    id: '11111111-2222-3333-4444-555555555555',
    name: 'Nguyễn Văn Test',
    email: 'test@example.com',
    role: 'admin',
    createdAt: '2026-01-01T10:00:00.000Z',
    updatedAt: '2026-01-02T12:00:00.000Z',
  }

  // Token with sub: 11111111-2222-3333-4444-555555555555, email: test@example.com, role: admin, exp: 2000000000
  const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTExMTExMS0yMjIyLTMzMzMtNDQ0NC01NTU1NTU1NTU1NTUiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MjAwMDAwMDAwMH0.mock-sig'

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
    useAuthStore.getState().clearAuth()
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

  afterEach(() => {
    queryClient.clear()
  })

  const renderWithProviders = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ProfilePage />
        </MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('hiển thị đầy đủ thông tin hồ sơ và role badge khi có dữ liệu', async () => {
    useAuthStore.getState().setAuth(mockUser, sampleJwt)
    vi.spyOn(authApi, 'getMe').mockResolvedValue(mockUser)

    renderWithProviders()

    expect(screen.getByText('Hồ Sơ Cá Nhân')).toBeDefined()
    expect(screen.getByText('Nguyễn Văn Test')).toBeDefined()
    expect(screen.getAllByText('test@example.com').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('QUẢN TRỊ VIÊN')).toBeDefined()
    expect(screen.getAllByText('11111111-2222-3333-4444-555555555555').length).toBeGreaterThanOrEqual(1)
  })

  it('hiển thị skeleton loading khi đang tải và chưa có thông tin user', async () => {
    // Không có user trong store, đang fetch
    useAuthStore.setState({ user: null, token: sampleJwt, isAuthenticated: true })
    vi.spyOn(authApi, 'getMe').mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockUser), 100)),
    )

    renderWithProviders()

    expect(screen.getByTestId('profile-skeleton')).toBeDefined()
  })

  it('hiển thị thông tin phiên xác thực JWT 24h và decoded claims', async () => {
    useAuthStore.getState().setAuth(mockUser, sampleJwt)
    vi.spyOn(authApi, 'getMe').mockResolvedValue(mockUser)

    renderWithProviders()

    expect(screen.getByText('Phiên Xác Thực JWT (Thời Hạn 24 Giờ)')).toBeDefined()
    expect(screen.getByText('Token Hợp Lệ')).toBeDefined()
    expect(screen.getByText('Payload Giải Mã Từ Token (Decoded Claims)')).toBeDefined()
    expect(screen.getByText('sub (User ID)')).toBeDefined()
  })

  it('hỗ trợ sao chép Token và User ID vào Clipboard khi click', async () => {
    useAuthStore.getState().setAuth(mockUser, sampleJwt)
    vi.spyOn(authApi, 'getMe').mockResolvedValue(mockUser)

    renderWithProviders()

    // Click nút sao chép Token
    const copyTokenBtn = screen.getByText('Sao chép Token')
    fireEvent.click(copyTokenBtn)
    expect(mockWriteText).toHaveBeenCalledWith(sampleJwt)

    // Click nút sao chép UUID
    const copyIdBtn = screen.getByTitle('Sao chép UUID')
    fireEvent.click(copyIdBtn)
    expect(mockWriteText).toHaveBeenCalledWith(mockUser.id)
  })

  it('xử lý nút Làm Mới Từ Máy Chủ (Refetch) thành công', async () => {
    const updatedUser = { ...mockUser, name: 'Nguyễn Văn Đã Cập Nhật' }
    useAuthStore.getState().setAuth(mockUser, sampleJwt)
    vi.spyOn(authApi, 'getMe').mockResolvedValue(updatedUser)

    renderWithProviders()

    const refetchBtn = screen.getByText('Làm Mới Từ Máy Chủ')
    fireEvent.click(refetchBtn)

    await waitFor(() => {
      expect(screen.getByText('Nguyễn Văn Đã Cập Nhật')).toBeDefined()
    })
  })
})
