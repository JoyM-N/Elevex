'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, RefreshCw, Trophy } from 'lucide-react'
import {
  getInternAchievements,
  getInternPerformance,
  recalculateInternPerformance,
} from '@/lib/api/admin/performance'
import { listInterns } from '@/lib/api/admin/projects'
import {
  OverallScoreCard,
  ScoreBars,
} from '@/components/shared/performance/metrics'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminInternPerformancePage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const queryClient = useQueryClient()

  const internsQuery = useQuery({
    queryKey: ['admin', 'interns', { per_page: 100 }],
    queryFn: () => listInterns({ per_page: 100 }),
  })

  const intern = internsQuery.data?.data.find((i) => i.id === id)

  const metricsQuery = useQuery({
    queryKey: ['admin', 'interns', id, 'performance'],
    queryFn: () => getInternPerformance(id),
    enabled: Number.isFinite(id),
  })

  const achievementsQuery = useQuery({
    queryKey: ['admin', 'interns', id, 'achievements'],
    queryFn: () => getInternAchievements(id),
    enabled: Number.isFinite(id),
  })

  const recalc = useMutation({
    mutationFn: () => recalculateInternPerformance(id),
    onSuccess: () => {
      toast.success('Performance recalculated')
      queryClient.invalidateQueries({
        queryKey: ['admin', 'interns', id, 'performance'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'interns', id, 'achievements'],
      })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Recalculation failed'
      toast.error(msg)
    },
  })

  if (internsQuery.isLoading || metricsQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  const metric = metricsQuery.data

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/interns" />}
            className="mb-2 gap-1 px-0"
          >
            <ArrowLeft className="size-3.5" />
            Interns
          </Button>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {intern?.name ?? 'Intern'} performance
          </h2>
          <p className="text-sm text-muted-foreground">{intern?.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/interns/${id}/achievements`} />}
            className="gap-1"
          >
            <Trophy className="size-3.5" />
            Achievements
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/admin/interns/${id}/skills`} />}
          >
            Skills
          </Button>
          <Button
            size="sm"
            className="gap-1"
            disabled={recalc.isPending}
            onClick={() => recalc.mutate()}
          >
            {recalc.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="size-3.5" />
            )}
            Recalculate
          </Button>
        </div>
      </div>

      {!metric ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">No metrics yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run recalculate after the intern has tasks, logbooks, or an
            evaluation.
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
            render={<Link href={`/admin/interns/${id}/achievements`} />}
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
