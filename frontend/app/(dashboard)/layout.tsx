'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/use-auth'
import { isAdminRole } from '@/lib/auth/roles'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { AppTopbar } from '@/components/layout/app-topbar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardShellSkeleton() {
  return (
    <div className="flex min-h-svh w-full">
      <div className="hidden w-64 border-r border-border bg-card p-4 md:block">
        <Skeleton className="mb-6 h-8 w-32" />
        <div className="space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-5 w-40" />
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="mb-4 h-8 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard Layout
 *
 * Shared shell for admin, super_admin, and intern routes.
 * Sidebar + topbar + role gate.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isError, isIntern, isAdmin } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading || !user) return

    const onAdmin = pathname.startsWith('/admin')
    const onIntern = pathname.startsWith('/intern')

    if (isIntern && onAdmin) {
      router.replace('/intern/dashboard')
      return
    }

    if (isAdminRole(user.role) && onIntern) {
      router.replace('/admin/dashboard')
    }
  }, [isLoading, user, pathname, router, isIntern])

  if (isLoading) {
    return <DashboardShellSkeleton />
  }

  if (isError || !user) {
    return <DashboardShellSkeleton />
  }

  // Avoid flash of wrong shell while redirecting
  if (isIntern && pathname.startsWith('/admin')) {
    return <DashboardShellSkeleton />
  }
  if (isAdmin && pathname.startsWith('/intern')) {
    return <DashboardShellSkeleton />
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="dashboard-canvas min-h-svh">
        <AppTopbar />
        <main className="page-enter flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
