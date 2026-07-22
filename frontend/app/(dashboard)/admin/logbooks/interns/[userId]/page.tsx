'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react'
import {
  finalizeInternLogbook,
  listAdminLogbooks,
  listLogbookInterns,
} from '@/lib/api/admin/logbooks'
import { logbookStatusValues } from '@/lib/validations/logbooks'
import { LogbookStatusBadge } from '@/components/shared/logbooks/badges'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Logbook, LogbookStatus } from '@/types'

function groupByTask(entries: Logbook[]) {
  const map = new Map<string, { taskTitle: string; entries: Logbook[] }>()
  for (const entry of entries) {
    const key = entry.task?.id != null ? `t-${entry.task.id}` : 'none'
    const title = entry.task?.title ?? 'No task'
    const group = map.get(key) ?? { taskTitle: title, entries: [] }
    group.entries.push(entry)
    map.set(key, group)
  }
  return Array.from(map.values())
}

export default function InternLogbookPage() {
  const params = useParams<{ userId: string }>()
  const userId = Number(params.userId)
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<LogbookStatus | ''>('')
  const [note, setNote] = useState('')

  const summaryQuery = useQuery({
    queryKey: ['admin', 'logbooks', 'interns'],
    queryFn: () => listLogbookInterns({ per_page: 100 }),
  })

  const intern = useMemo(
    () => summaryQuery.data?.data.find((i) => i.id === userId),
    [summaryQuery.data, userId]
  )

  const entriesQuery = useQuery({
    queryKey: ['admin', 'logbooks', { user_id: userId, status }],
    queryFn: () =>
      listAdminLogbooks({
        user_id: userId,
        status: status || undefined,
        per_page: 100,
      }),
    enabled: Number.isFinite(userId),
  })

  const finalizeMutation = useMutation({
    mutationFn: () => finalizeInternLogbook(userId, note || null),
    onSuccess: () => {
      toast.success('Logbook finalized')
      queryClient.invalidateQueries({ queryKey: ['admin', 'logbooks'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data?.errors?.logbook?.[0] ||
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ||
        'Failed to finalize logbook'
      toast.error(msg)
    },
  })

  const entries = entriesQuery.data?.data ?? []
  const groups = useMemo(() => groupByTask(entries), [entries])

  const canFinalize =
    intern &&
    !intern.is_finalized &&
    intern.pending_count === 0 &&
    intern.revision_count === 0 &&
    intern.approved_count > 0

  if (summaryQuery.isLoading || entriesQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!intern) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Intern not found.</p>
        <Button render={<Link href="/admin/logbooks" />}>Back</Button>
      </div>
    )
  }

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/admin/logbooks" />}
            className="mb-2 gap-1 px-0"
          >
            <ArrowLeft className="size-3.5" />
            All interns
          </Button>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            {intern.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {intern.email} · {intern.entries_count} entries · {intern.total_hours}
            h logged
          </p>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>{intern.pending_count} pending review</span>
            <span>{intern.approved_count} approved</span>
            <span>{intern.revision_count} need revision</span>
            <span>{intern.draft_count} drafts</span>
          </div>
        </div>
        {intern.is_finalized ? (
          <div className="rounded-xl bg-secondary/60 px-4 py-3 text-sm">
            <p className="font-medium text-primary">Logbook finalized</p>
            {intern.signoff?.approved_at ? (
              <p className="text-xs text-muted-foreground">
                {new Date(intern.signoff.approved_at).toLocaleString()}
                {intern.signoff.approved_by
                  ? ` · ${intern.signoff.approved_by.name}`
                  : ''}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <select
        className="flex h-9 w-fit rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={status}
        onChange={(e) => setStatus(e.target.value as LogbookStatus | '')}
      >
        <option value="">All entries</option>
        {logbookStatusValues.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll('_', ' ')}
          </option>
        ))}
      </select>

      {entries.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
          <p className="text-sm text-muted-foreground">No entries for this filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <section
              key={group.taskTitle}
              className="overflow-hidden rounded-xl bg-card ring-1 ring-border/80"
            >
              <div className="border-b border-border/70 bg-muted/40 px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Task
                </p>
                <h3 className="font-heading text-base font-semibold">
                  {group.taskTitle}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.entries.map((entry) => (
                      <TableRow key={entry.id} className="hover:bg-muted/40">
                        <TableCell>
                          <Link
                            href={`/admin/logbooks/${entry.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {entry.date}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm">
                          {entry.hours_worked}h
                        </TableCell>
                        <TableCell>
                          <LogbookStatusBadge
                            status={entry.status}
                            label={entry.status_label}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            render={
                              <Link href={`/admin/logbooks/${entry.id}`} />
                            }
                          >
                            {entry.status === 'submitted' ? 'Review' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          ))}
        </div>
      )}

      {!intern.is_finalized ? (
        <div className="rounded-xl bg-card p-4 ring-1 ring-border/80 space-y-3 max-w-xl">
          <div>
            <h3 className="font-heading text-base font-semibold">
              Finalize logbook
            </h3>
            <p className="text-xs text-muted-foreground">
              After all submitted entries are reviewed, sign off this intern&apos;s
              overall logbook.
            </p>
          </div>
          {!canFinalize ? (
            <p className="text-sm text-muted-foreground">
              {intern.pending_count > 0 || intern.revision_count > 0
                ? 'Clear pending reviews and revision requests first.'
                : intern.approved_count === 0
                  ? 'At least one approved entry is required.'
                  : 'Not ready to finalize yet.'}
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="finalize-note">Note (optional)</Label>
                <Textarea
                  id="finalize-note"
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Final comments on this intern’s logbook…"
                />
              </div>
              <Button
                className="gap-1.5"
                disabled={finalizeMutation.isPending}
                onClick={() => {
                  if (
                    confirm(
                      `Finalize ${intern.name}'s logbook? This cannot be undone.`
                    )
                  ) {
                    finalizeMutation.mutate()
                  }
                }}
              >
                {finalizeMutation.isPending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                Finalize entire logbook
              </Button>
            </>
          )}
        </div>
      ) : null}
    </div>
  )
}
