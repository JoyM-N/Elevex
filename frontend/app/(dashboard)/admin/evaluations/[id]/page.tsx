'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { getEvaluation } from '@/lib/api/admin/performance'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const SCORE_LABELS = [
  ['Communication', 'communication_score'],
  ['Professionalism', 'professionalism_score'],
  ['Initiative', 'initiative_score'],
  ['Problem solving', 'problem_solving_score'],
  ['Teamwork', 'teamwork_score'],
] as const

export default function EvaluationDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: evaluation, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'evaluations', id],
    queryFn: () => getEvaluation(id),
    enabled: Number.isFinite(id),
  })

  if (isLoading) return <Skeleton className="h-64 w-full rounded-xl" />
  if (isError || !evaluation) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Evaluation not found.</p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={<Link href="/admin/evaluations" />}
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Evaluations
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          {evaluation.user?.name ?? 'Intern'} evaluation
        </h2>
        <p className="text-sm text-muted-foreground">
          By {evaluation.evaluated_by?.name ?? '—'} ·{' '}
          {new Date(evaluation.created_at).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
          <p className="text-xs text-muted-foreground">Average</p>
          <p className="mt-1 font-heading text-3xl font-semibold">
            {Number(evaluation.average_score).toFixed(1)}
          </p>
          <p className="text-sm text-muted-foreground">
            {Number(evaluation.average_score_percentage).toFixed(0)}%
          </p>
        </div>
        {SCORE_LABELS.map(([label, key]) => (
          <div
            key={key}
            className="rounded-xl bg-card p-4 ring-1 ring-border/80"
          >
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 font-heading text-2xl font-semibold">
              {evaluation[key]} / 5
            </p>
          </div>
        ))}
      </div>

      {evaluation.remarks ? (
        <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
          <h3 className="font-heading text-base font-semibold">Remarks</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {evaluation.remarks}
          </p>
        </div>
      ) : null}

      {evaluation.user?.id ? (
        <Button
          variant="outline"
          render={
            <Link href={`/admin/interns/${evaluation.user.id}/performance`} />
          }
        >
          View performance
        </Button>
      ) : null}
    </div>
  )
}
