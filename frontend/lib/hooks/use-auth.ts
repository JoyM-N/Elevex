'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api/axios'
import type { User, ApiResponse } from '@/types'

/**
 * useAuth Hook
 *
 * Central authentication hook used across the entire app.
 *
 * Fetches the current user from GET /api/v1/auth/user.
 * If the request returns 401, the axios interceptor
 * redirects to /login automatically.
 *
 * Usage:
 *   const { user, isLoading, isAdmin, logout } = useAuth()
 */
export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  // Fetch current authenticated user
  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<User>>('/v1/auth/user')
      return response.data.data
    },
    retry: false, // Don't retry on 401
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiClient.post('/v1/auth/logout')
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
      router.push('/login')
    },
  })

  return {
    user,
    isLoading,
    isError,
    isAuthenticated: !!user,
    isSuperAdmin: user?.role === 'super_admin',
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin',
    isIntern: user?.role === 'intern',
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  }
}