'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { getDashboardHome } from '@/lib/auth/roles'
import { Loader2 } from 'lucide-react'

/**
 * Root redirect hub.
 *
 * Unauthenticated → /login
 * Authenticated → role dashboard
 */
export default function Home() {
  const { user, isLoading, isError, isAuthenticated } = useAuth()
  const router = useRouter()
  const redirected = useRef(false)

  useEffect(() => {
    if (isLoading || redirected.current) return

    if (isError || !isAuthenticated) {
      redirected.current = true
      router.replace('/login')
      return
    }

    redirected.current = true
    router.replace(getDashboardHome(user?.role))
  }, [isLoading, isError, isAuthenticated, user, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-primary" />
    </div>
  )
}
