'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Download, Loader2, RefreshCw } from 'lucide-react'
import {
  approveRecommendation,
  getRecommendation,
  regenerateRecommendationDraft,
  rejectRecommendation,
  updateRecommendationDraft,
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
  const [body, setBody] = useState('')
  const [syncedLetterId, setSyncedLetterId] = useState<number | null>(null)

  const { data: letter, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'recommendations', id],
    queryFn: () => getRecommendation(id),
    enabled: Number.isFinite(id),
  })

  // Sync draft textarea when a new letter payload arrives (React prop→state pattern)
  if (letter && letter.id !== syncedLetterId) {
    setSyncedLetterId(letter.id)
    setBody(letter.body ?? '')
  }

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'recommendations'] })
    refetch()
  }

  const saveDraft = useMutation({
    mutationFn: () => updateRecommendationDraft(id, body),
    onSuccess: () => {
      toast.success('Draft saved')
      invalidate()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Could not save draft'
      toast.error(msg)
    },
  })

  const regenerate = useMutation({
    mutationFn: () => regenerateRecommendationDraft(id),
    onSuccess: (updated) => {
      toast.success('Draft rebuilt from performance metrics')
      setBody(updated.body ?? '')
      invalidate()
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Could not regenerate draft'
      toast.error(msg)
    },
  })

  const approve = useMutation({
    mutationFn: async () => {
      if (letter?.status === 'pending' && body !== (letter.body ?? '')) {
        await updateRecommendationDraft(id, body)
      }
      return approveRecommendation(id)
    },
    onSuccess: () => {
      toast.success('Letter approved — PDF is ready for the intern')
      invalidate()
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

  const isDraft = letter.status === 'pending'
  const busy =
    saveDraft.isPending ||
    regenerate.isPending ||
    approve.isPending ||
    reject.isPending
  const dirty = body !== (letter.body ?? '')

  return (
    <div className="page-enter mx-auto max-w-3xl space-y-6">
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

      <div className="rounded-xl bg-card p-5 ring-1 ring-border/80">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Created</dt>
            <dd className="font-medium">
              {new Date(letter.created_at).toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Internship</dt>
            <dd className="font-medium">
              {letter.internship?.start_date && letter.internship?.end_date
                ? `${letter.internship.start_date} → ${letter.internship.end_date}`
                : '—'}
            </dd>
          </div>
        </dl>
      </div>

      {isDraft ? (
        <div className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold">Draft letter</h3>
              <p className="text-sm text-muted-foreground">
                Auto-generated from performance — edit freely before approving
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              disabled={busy}
              onClick={() => {
                if (
                  dirty &&
                  !confirm(
                    'Regenerate from performance? Unsaved edits will be lost.'
                  )
                ) {
                  return
                }
                regenerate.mutate()
              }}
            >
              {regenerate.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Regenerate from metrics
            </Button>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="letter_body">Letter body</Label>
            <Textarea
              id="letter_body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={18}
              className="min-h-[320px] font-serif text-sm leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reject_notes">Rejection notes (optional)</Label>
            <Textarea
              id="reject_notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Only used if you reject…"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={busy || !dirty}
              onClick={() => saveDraft.mutate()}
            >
              {saveDraft.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Save draft
            </Button>
            <Button disabled={busy || !body.trim()} onClick={() => approve.mutate()}>
              {approve.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : null}
              Approve & create PDF
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
      ) : (
        <div className="space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80">
          <h3 className="font-heading text-lg font-semibold">Letter</h3>
          <div className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 font-serif text-sm leading-relaxed">
            {letter.body || '—'}
          </div>
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
          {letter.admin_notes ? (
            <p className="text-sm text-muted-foreground">
              Notes: {letter.admin_notes}
            </p>
          ) : null}
        </div>
      )}
    </div>
  )
}
