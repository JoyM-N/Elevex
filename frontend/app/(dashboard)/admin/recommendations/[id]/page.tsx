'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Download, Loader2 } from 'lucide-react'
import {
  approveRecommendation,
  getRecommendation,
  rejectRecommendation,
} from '@/lib/api/admin/recommendations'
import { RecommendationStatusBadge } from '@/components/shared/recommendations/badges'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'

export default function AdminRecommendationDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState('')

  const { data: letter, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'recommendations', id],
    queryFn: () => getRecommendation(id),
    enabled: Number.isFinite(id),
  })

  const approve = useMutation({
    mutationFn: () => approveRecommendation(id),
    onSuccess: () => {
      toast.success('Letter approved and PDF generated')
      queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
      refetch()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Approval failed'
      toast.error(msg)
    },
  })

  const reject = useMutation({
    mutationFn: () => rejectRecommendation(id, notes),
    onSuccess: () => {
      toast.success('Request rejected')
      queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
      router.push('/admin/recommendations')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Rejection failed'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !letter) {
    return (
      <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
        <p className="font-medium">Couldn&apos;t load recommendation</p>
        <Button variant="outline" className="mt-3" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const pending = letter.status === 'pending'
  const busy = approve.isPending || reject.isPending

  return (
    <div className="page-enter mx-auto max-w-2xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/admin/recommendations" />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-heading text-2xl font-semibold tracking-tight">
              {letter.user?.name ?? 'Recommendation'}
            </h2>
            <RecommendationStatusBadge
              status={letter.status}
              label={letter.status_label}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {letter.user?.email}
            {letter.internship?.department
              ? ` · ${letter.internship.department}`
              : ''}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-xl bg-card p-5 ring-1 ring-border/80">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Requested</dt>
            <dd className="font-medium">
              {new Date(letter.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Internship</dt>
            <dd className="font-medium">
              {letter.internship?.university ?? '—'}
              {letter.internship?.start_date
                ? ` (${letter.internship.start_date} → ${letter.internship.end_date})`
                : ''}
            </dd>
          </div>
          {letter.approved_by ? (
            <div>
              <dt className="text-muted-foreground">Reviewed by</dt>
              <dd className="font-medium">{letter.approved_by.name}</dd>
            </div>
          ) : null}
          {letter.admin_notes ? (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Admin notes</dt>
              <dd className="font-medium whitespace-pre-wrap">
                {letter.admin_notes}
              </dd>
            </div>
          ) : null}
        </dl>

        {letter.pdf_url ? (
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            render={
              <a href={letter.pdf_url} target="_blank" rel="noreferrer" />
            }
          >
            <Download className="size-3.5" />
            Download PDF
          </Button>
        ) : null}
      </div>

      {pending ? (
        <div className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80">
          <div className="space-y-1.5">
            <Label htmlFor="reject_notes">Notes (optional, for rejection)</Label>
            <Textarea
              id="reject_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Reason for rejection…"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => approve.mutate()}>
              {approve.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Approve & generate PDF
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => reject.mutate()}
            >
              {reject.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Reject
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
