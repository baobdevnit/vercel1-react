import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/features/auth/services/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { getErrorMessage } from '@/api/client'
import type { User } from '@/types/api'

export function useProfile() {
  const { user: storeUser, setUser, token, isAuthenticated } = useAuthStore()

  const query = useQuery<User, Error>({
    queryKey: ['auth', 'me'],
    queryFn: authApi.getMe,
    enabled: isAuthenticated && Boolean(token),
    staleTime: 1000 * 60 * 3, // Cache 3 phút
    retry: 1,
  })

  // Tự động đồng bộ thông tin hồ sơ mới nhất từ backend vào Zustand store
  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  const errorMessage = query.error ? getErrorMessage(query.error) : null

  return {
    ...query,
    user: query.data ?? storeUser,
    isLoading: query.isLoading && !storeUser,
    isRefetching: query.isFetching && !query.isLoading,
    errorMessage,
  }
}
