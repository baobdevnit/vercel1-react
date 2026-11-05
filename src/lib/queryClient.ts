import { QueryClient } from '@tanstack/react-query'

/**
 * Cấu hình chuẩn hóa cho TanStack Query Client
 * - staleTime 5 phút: Dữ liệu được coi là mới trong 5 phút, giảm tải requests thừa
 * - gcTime 15 phút: Dữ liệu cache trong bộ nhớ tối đa 15 phút
 * - Không retry với lỗi xác thực (401), cấm truy cập (403), hoặc không tồn tại (404)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 15,
      retry: (failureCount, error) => {
        const status = (error as { response?: { status?: number } })?.response?.status
        if (status === 401 || status === 403 || status === 404) {
          return false
        }
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
})
