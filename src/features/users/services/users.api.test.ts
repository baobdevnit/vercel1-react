import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usersApi } from './users.api'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/types/api'

vi.mock('@/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}))

describe('usersApi service', () => {
  const mockUsers: User[] = [
    {
      id: 'user-uuid-1',
      name: 'Admin System',
      email: 'admin@example.com',
      role: 'admin',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
    },
    {
      id: 'user-uuid-2',
      name: 'Nguyen Van A',
      email: 'user@example.com',
      role: 'user',
      createdAt: '2026-11-02T10:00:00.000Z',
      updatedAt: '2026-11-02T10:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gọi GET /users và trả về danh sách users thành công', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUsers })

    const result = await usersApi.getAllUsers()

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.USERS.LIST)
    expect(result).toHaveLength(2)
    expect(result[0].email).toBe('admin@example.com')
    expect(result[1].role).toBe('user')
  })

  it('bắt lỗi khi server phản hồi mã 403 Forbidden (không có quyền admin)', async () => {
    const error403 = {
      response: {
        status: 403,
        data: {
          statusCode: 403,
          message: 'Không có quyền truy cập (Yêu cầu tài khoản có cờ Admin).',
          error: 'Forbidden',
        },
      },
    }
    vi.mocked(apiClient.get).mockRejectedValueOnce(error403)

    await expect(usersApi.getAllUsers()).rejects.toEqual(error403)
  })

  it('bắt lỗi khi token hết hạn mã 401 Unauthorized', async () => {
    const error401 = {
      response: {
        status: 401,
        data: {
          statusCode: 401,
          message: 'Chưa xác thực hoặc token không hợp lệ.',
        },
      },
    }
    vi.mocked(apiClient.get).mockRejectedValueOnce(error401)

    await expect(usersApi.getAllUsers()).rejects.toEqual(error401)
  })
})
