'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import {
  addAdminLogbookComment,
  getAdminLogbook,
} from '@/lib/api/admin/logbooks'
import { ReviewLogbookForm } from '@/components/admin/logbooks/review-form'
import { LogbookStatusBadge } from '@/components/shared/logbooks/badges'
import { CommentsSection } from '@/components/shared/logbooks/comments-section'
import { LogbookFiles } from '@/components/shared/logbooks/logbook-files'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLogbookDetailPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)

  const { data: logbook, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'logbooks', id],
    queryFn: () => getAdminLogbook(id),
    enabled: Number.isFinite(id),
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

  const canReview = logbook.status === 'submitted'

  return (
    <div className="page-enter space-y-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          render={
            <Link
              href={
                logbook.user?.id
                  ? `/admin/logbooks/interns/${logbook.user.id}`
                  : '/admin/logbooks'
              }
            />
          }
          className="mb-2 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          {logbook.user?.name
            ? `${logbook.user.name}'s logbook`
            : 'Logbooks'}
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
            {logbook.user?.name ?? 'Intern'} · {logbook.hours_worked}h ·{' '}
            {logbook.task?.title ?? 'Task'}
          </span>
        </div>
      </div>

      {logbook.revision_note ? (
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 text-sm">
          <p className="font-medium">Previous feedback</p>
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
            {logbook.approved_by ? (
              <p className="mt-4 text-xs text-muted-foreground">
                Reviewed by {logbook.approved_by.name}
                {logbook.reviewed_at
                  ? ` · ${new Date(logbook.reviewed_at).toLocaleString()}`
                  : ''}
              </p>
            ) : null}
          </div>

          <CommentsSection
            comments={logbook.comments ?? []}
            queryKeysToInvalidate={[['admin', 'logbooks', id]]}
            onSubmit={(data) => addAdminLogbookComment(id, data)}
          />
        </div>

        <div className="space-y-4">
          {canReview ? <ReviewLogbookForm logbookId={id} /> : null}
          <LogbookFiles
            logbookId={id}
            files={logbook.files ?? []}
            canUpload={false}
            queryKey={['admin', 'logbooks', id]}
          />
        </div>
      </div>
    </div>
  )
}
