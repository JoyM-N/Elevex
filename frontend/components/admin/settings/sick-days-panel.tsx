'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { listSickDays, reviewSickDay } from '@/lib/api/admin/sick-days'
import { SickDayStatusBadge } from '@/components/shared/sick-days/badges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SickDayStatus } from '@/types'

const FILTERS: Array<{ value: '' | SickDayStatus; label: string }> = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export function SickDaysPanel() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<'' | SickDayStatus>('pending')
  const [page, setPage] = useState(1)
  const [notesById, setNotesById] = useState<Record<number, string>>({})

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'sick-days', { status, page }],
    queryFn: () =>
      listSickDays({
        status: status || undefined,
        page,
      }),
  })

  const review = useMutation({
    mutationFn: ({
      id,
      action,
    }: {
      id: number
      action: 'approved' | 'rejected'
    }) =>
      reviewSickDay(id, {
        action,
        notes: notesById[id] || '',
      }),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.action === 'approved' ? 'Sick day approved' : 'Sick day rejected'
      )
      queryClient.invalidateQueries({ queryKey: ['admin', 'sick-days'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Review failed'
      toast.error(msg)
    },
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((filter) => (
          <Button
            key={filter.label}
            size="sm"
            variant={status === filter.value ? 'default' : 'outline'}
            onClick={() => {
              setPage(1)
              setStatus(filter.value)
            }}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-6 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load sick day requests</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No requests</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pending sick day requests will show up here.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Intern</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="min-w-[200px]">Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <p className="font-medium">{row.user?.name ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.user?.email}
                      </p>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {row.date}
                    </TableCell>
                    <TableCell className="max-w-[200px] text-sm text-muted-foreground">
                      {row.reason || '—'}
                    </TableCell>
                    <TableCell>
                      <SickDayStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell>
                      {row.status === 'pending' ? (
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <Label
                              htmlFor={`notes-${row.id}`}
                              className="sr-only"
                            >
                              Notes
                            </Label>
                            <Input
                              id={`notes-${row.id}`}
                              placeholder="Optional notes"
                              value={notesById[row.id] ?? ''}
                              onChange={(e) =>
                                setNotesById((prev) => ({
                                  ...prev,
                                  [row.id]: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            <Button
                              size="sm"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: row.id,
                                  action: 'approved',
                                })
                              }
                            >
                              {review.isPending ? (
                                <Loader2 className="size-3.5 animate-spin" />
                              ) : null}
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={review.isPending}
                              onClick={() =>
                                review.mutate({
                                  id: row.id,
                                  action: 'rejected',
                                })
                              }
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          {row.admin_notes ||
                            (row.approved_by
                              ? `By ${row.approved_by.name}`
                              : '—')}
                        </p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta && meta.last_page > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {meta.current_page} of {meta.last_page}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.last_page}
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
