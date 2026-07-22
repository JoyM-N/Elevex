'use client'

import { useQuery } from '@tanstack/react-query'
import { Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/lib/hooks/use-auth'
import { getInternDashboard } from '@/lib/api/intern/dashboard'
import { StatsCards } from '@/components/intern/dashboard/stats-cards'
import { TaskProgressWidget } from '@/components/intern/dashboard/task-progress-widget'
import { PerformanceWidget } from '@/components/intern/dashboard/performance-widget'
import { UpcomingDeadlinesWidget } from '@/components/intern/dashboard/upcoming-deadlines-widget'
import { ActiveProjectsWidget } from '@/components/intern/dashboard/active-projects-widget'
import { RecentAchievementsWidget } from '@/components/intern/dashboard/recent-achievements-widget'
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
        <Skeleton className="h-64 rounded-xl lg:col-span-2" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

/**
 * Intern Dashboard
 *
 * Single-query overview: task progress, hours, performance,
 * deadlines, projects, and achievements.
 */
export default function InternDashboardPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0]

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['intern', 'dashboard'],
    queryFn: getInternDashboard,
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
          Your tasks, hours, and progress for this week.
        </p>
      </div>

      <StatsCards data={data} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskProgressWidget tasks={data.tasks} />
        </div>
        <PerformanceWidget performance={data.performance} />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <UpcomingDeadlinesWidget items={data.upcoming_deadlines} />
        <ActiveProjectsWidget items={data.active_projects} />
        <RecentAchievementsWidget items={data.recent_achievements} />
      </div>
    </div>
  )
}
