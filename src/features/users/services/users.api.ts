import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import type { User } from '@/types/api'

export const usersApi = {
  /**
   * Lấy danh sách toàn bộ người dùng trong hệ thống (Yêu cầu role admin)
   */
  getAllUsers: async (): Promise<User[]> => {
    const res = await apiClient.get<User[]>(API_ENDPOINTS.USERS.LIST)
    return res.data
  },
}
