'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Award, Sparkles } from 'lucide-react'
import {
  getMyAchievements,
  getMyPerformance,
} from '@/lib/api/intern/performance'
import {
  OverallScoreCard,
  ScoreBars,
} from '@/components/shared/performance/metrics'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternPerformancePage() {
  const metricsQuery = useQuery({
    queryKey: ['intern', 'performance'],
    queryFn: getMyPerformance,
  })
  const achievementsQuery = useQuery({
    queryKey: ['intern', 'achievements'],
    queryFn: getMyAchievements,
  })

  if (metricsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  const metric = metricsQuery.data

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            My performance
          </h2>
          <p className="text-sm text-muted-foreground">
            Scores from tasks, logbooks, and evaluations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/intern/achievements" />}
            className="gap-1"
          >
            <Award className="size-3.5" />
            Achievements
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href="/intern/skills" />}
            className="gap-1"
          >
            <Sparkles className="size-3.5" />
            Skills
          </Button>
        </div>
      </div>

      {!metric ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">No metrics yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Keep completing tasks and submitting logbooks — scores appear once
            calculated.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <OverallScoreCard metric={metric} />
          <div className="rounded-xl bg-card p-5 ring-1 ring-border/80 lg:col-span-2">
            <h3 className="font-heading text-base font-semibold">Breakdown</h3>
            <div className="mt-4">
              <ScoreBars metric={metric} />
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-base font-semibold">
            Recent achievements
          </h3>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/intern/achievements" />}
          >
            View all
          </Button>
        </div>
        {(achievementsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">No achievements yet</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {(achievementsQuery.data ?? []).slice(0, 4).map((a) => (
              <li
                key={a.id}
                className="rounded-lg border border-border/70 px-3 py-2"
              >
                <p className="text-sm font-medium">{a.name}</p>
                <p className="text-xs text-muted-foreground">{a.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
