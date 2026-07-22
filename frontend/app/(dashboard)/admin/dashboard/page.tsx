'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { getAdminDashboard } from '@/lib/api/admin/dashboard'
import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { ProjectsStatusChart } from '@/components/admin/dashboard/projects-status-chart'
import { TopPerformerWidget } from '@/components/admin/dashboard/top-performer-widget'
import { PendingLogbooksWidget } from '@/components/admin/dashboard/pending-logbooks-widget'
import { RecentTasksWidget } from '@/components/admin/dashboard/recent-tasks-widget'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-xl" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * Admin Dashboard
 *
 * Single-query overview: stats, projects chart, top performer,
 * pending logbooks, and recent tasks.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: getAdminDashboard,
    staleTime: 1000 * 60,
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">
          Couldn&apos;t load the dashboard
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Check that the API is running, then try again.
        </p>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={isFetching}
          className="gap-2"
        >
          {isFetching ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight text-foreground">
          Welcome back{firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Here&apos;s what needs your attention across Elevex today.
        </p>
      </div>

      <StatsCards data={data} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProjectsStatusChart byStatus={data.projects.by_status} />
        </div>
        <TopPerformerWidget performer={data.top_performer} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PendingLogbooksWidget items={data.pending_logbooks} />
        <RecentTasksWidget items={data.recent_tasks} />
      </div>
    </div>
  )
}
