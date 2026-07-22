'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Pencil, Send, Trash2 } from 'lucide-react'
import {
  addInternLogbookComment,
  deleteLogbook,
  getInternLogbook,
  submitLogbook,
} from '@/lib/api/intern/logbooks'
import { LogbookStatusBadge } from '@/components/shared/logbooks/badges'
import { CommentsSection } from '@/components/shared/logbooks/comments-section'
import { LogbookFiles } from '@/components/shared/logbooks/logbook-files'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function InternLogbookDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: logbook, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'logbooks', id],
    queryFn: () => getInternLogbook(id),
    enabled: Number.isFinite(id),
  })

  const submitMutation = useMutation({
    mutationFn: () => submitLogbook(id),
    onSuccess: () => {
      toast.success('Submitted for review')
      queryClient.invalidateQueries({ queryKey: ['intern', 'logbooks'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to submit'
      toast.error(msg)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteLogbook(id),
    onSuccess: () => {
      toast.success('Logbook deleted')
      queryClient.invalidateQueries({ queryKey: ['intern', 'logbooks'] })
      router.push('/intern/logbooks')
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to delete'
      toast.error(msg)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !logbook) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Couldn&apos;t load logbook.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const canEdit =
    !logbook.is_locked &&
    (logbook.status === 'draft' || logbook.status === 'revision_needed')
  const canSubmit = canEdit
  const canDelete = logbook.status === 'draft'

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/intern/logbooks" />}
            className="mb-2 gap-1 px-0"
          >
            <ArrowLeft className="size-3.5" />
            My logbooks
          </Button>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {logbook.date}
          </h2>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <LogbookStatusBadge
              status={logbook.status}
              label={logbook.status_label}
            />
            <span className="text-sm text-muted-foreground">
              {logbook.hours_worked}h · {logbook.task?.title ?? 'Task'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <Button
              variant="outline"
              size="sm"
              render={<Link href={`/intern/logbooks/${id}/edit`} />}
              className="gap-1"
            >
              <Pencil className="size-3.5" />
              Edit
            </Button>
          ) : null}
          {canSubmit ? (
            <Button
              size="sm"
              className="gap-1"
              disabled={submitMutation.isPending}
              onClick={() => {
                if (confirm('Submit this logbook for admin review?')) {
                  submitMutation.mutate()
                }
              }}
            >
              {submitMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Send className="size-3.5" />
              )}
              Submit
            </Button>
          ) : null}
          {canDelete ? (
            <Button
              variant="destructive"
              size="sm"
              className="gap-1"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (confirm('Delete this draft logbook?')) {
                  deleteMutation.mutate()
                }
              }}
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          ) : null}
        </div>
      </div>

      {logbook.revision_note ? (
        <div className="rounded-xl border border-orange/30 bg-orange/10 p-4 text-sm">
          <p className="font-medium text-orange">Reviewer feedback</p>
          <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
            {logbook.revision_note}
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl bg-card p-4 ring-1 ring-border/80">
            <h3 className="font-heading text-base font-semibold">Work log</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {logbook.description}
            </p>
            {logbook.blockers ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Blockers
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {logbook.blockers}
                </p>
              </div>
            ) : null}
            {logbook.learning_outcome ? (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground">
                  Learning outcome
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">
                  {logbook.learning_outcome}
                </p>
              </div>
            ) : null}
          </div>

          <CommentsSection
            comments={logbook.comments ?? []}
            locked={logbook.is_locked}
            queryKeysToInvalidate={[['intern', 'logbooks', id]]}
            onSubmit={(data) => addInternLogbookComment(id, data)}
          />
        </div>

        <LogbookFiles
          logbookId={id}
          files={logbook.files ?? []}
          canUpload={canEdit}
          queryKey={['intern', 'logbooks', id]}
        />
      </div>
    </div>
  )
}
