'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { listInternLogbooks } from '@/lib/api/intern/logbooks'
import { logbookStatusValues } from '@/lib/validations/logbooks'
import { LogbookStatusBadge } from '@/components/shared/logbooks/badges'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { LogbookStatus } from '@/types'

export default function InternLogbooksPage() {
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<LogbookStatus | ''>('')

  const queryKey = useMemo(
    () => ['intern', 'logbooks', { status, page }],
    [status, page]
  )

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      listInternLogbooks({
        page,
        per_page: 15,
        status: status || undefined,
      }),
  })

  return (
    <div className="page-enter space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold tracking-tight">
            My logbooks
          </h2>
          <p className="text-sm text-muted-foreground">
            Daily work logs for your assigned tasks
          </p>
        </div>
        <Button render={<Link href="/intern/logbooks/new" />} className="gap-1">
          <Plus className="size-4" />
          New entry
        </Button>
      </div>

      <select
        className="flex h-9 w-fit rounded-lg border border-input bg-transparent px-2.5 text-sm"
        value={status}
        onChange={(e) => {
          setPage(1)
          setStatus(e.target.value as LogbookStatus | '')
        }}
      >
        <option value="">All statuses</option>
        {logbookStatusValues.map((s) => (
          <option key={s} value={s}>
            {s.replaceAll('_', ' ')}
          </option>
        ))}
      </select>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load logbooks</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data?.data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-16 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No logbooks yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create an entry after you work on a task.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).map((logbook) => (
                  <TableRow key={logbook.id} className="hover:bg-muted/40">
                    <TableCell>
                      <Link
                        href={`/intern/logbooks/${logbook.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {logbook.date}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {logbook.task?.title ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {logbook.hours_worked}h
                    </TableCell>
                    <TableCell>
                      <LogbookStatusBadge
                        status={logbook.status}
                        label={logbook.status_label}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {data?.meta && data.meta.last_page > 1 ? (
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">
                Page {data.meta.current_page} of {data.meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
