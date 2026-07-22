import { QueryClient } from '@tanstack/react-query'

/**
 * TanStack Query Client
 *
 * Global configuration for all server state management.
 *
 * staleTime: how long data is considered fresh before refetching
 * retry: how many times to retry failed requests
 * refetchOnWindowFocus: refetch when user switches back to tab
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})