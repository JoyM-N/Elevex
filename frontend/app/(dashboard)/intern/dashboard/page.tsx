'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

/**
 * Intern Dashboard (placeholder)
 *
 * Confirms auth works after login.
 * Full dashboard UI comes in a later phase.
 */
export default function InternDashboardPage() {
  const { user, isLoading, logout, isLoggingOut } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Intern Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Placeholder — full UI coming soon</p>
          </div>
          <Button variant="outline" onClick={() => logout()} disabled={isLoggingOut}>
            {isLoggingOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>

        <div className="rounded-xl bg-white p-6 ring-1 ring-black/5 space-y-2">
          <p className="text-sm text-gray-500">Signed in as</p>
          <p className="text-lg font-medium text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-sm text-gray-500 capitalize">{user?.role_label ?? user?.role}</p>
        </div>
      </div>
    </div>
  )
}
