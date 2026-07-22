'use client'

import { useAuth } from '@/lib/hooks/use-auth'

/**
 * Slim dashboard welcome — widgets arrive in Phase 11.5.
 */
export default function InternDashboardPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-2">
      <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
        Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
      </h2>
      <p className="text-sm text-muted-foreground">
        Your intern overview widgets will land in the next phase. Use the
        sidebar to explore modules as they ship.
      </p>
      <div className="mt-6 rounded-xl border border-border/80 bg-card p-6 shadow-sm shadow-primary/5 ring-1 ring-primary/5">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="mt-1 font-medium text-foreground">{user?.email}</p>
        <p className="mt-1 text-xs font-medium text-primary">{user?.role_label}</p>
      </div>
    </div>
  )
}
