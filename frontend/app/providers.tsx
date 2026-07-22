'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/query-client'

/**
 * Providers
 *
 * Wraps the entire app with all required context providers.
 * Added to the root layout so every page has access.
 *
 * Providers:
 *   QueryClientProvider — TanStack Query for server state
 *   Toaster            — Sonner toast notifications
 *   ReactQueryDevtools — Dev tools (only in development)
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
      />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}