'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import apiClient from '@/lib/api/axios'
import {
  clearSessionHint,
  shouldFetchAuthUser,
} from '@/lib/auth/session-hint'
import type { User, ApiResponse } from '@/types'

/**
 * useAuth Hook
 *
 * Fetches GET /api/v1/auth/user when a session is expected.
 * Skips the request on login/home when there is no session hint,
 * so logged-out visits do not spam 401 in the console.
 */
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const enabled = shouldFetchAuthUser()

  const {
    data: user,
    isLoading,
    isError,
    isFetching,
  } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    enabled,
    queryFn: async () => {
      try {
        const response = await apiClient.get<ApiResponse<User>>('/v1/auth/user')
        return response.data.data
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          clearSessionHint()
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  })

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/v1/auth/logout')
    },
    onSuccess: () => {
      clearSessionHint()
      queryClient.clear()
      router.push('/login')
    },
    onError: () => {
      clearSessionHint()
      queryClient.clear()
      router.push('/login')
    },
  })

  // When the query is disabled (logged-out public page), treat as settled
  const loading = enabled && (isLoading || (isFetching && !user))

  return {
    user: user ?? undefined,
    isLoading: loading,
    isError,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isIntern: user?.role === 'intern',
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}
