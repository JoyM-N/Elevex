'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { listMySickDays, requestSickDay } from '@/lib/api/intern/sick-days'
import {
  requestSickDaySchema,
  type RequestSickDayData,
} from '@/lib/validations/settings'
import { SickDayStatusBadge } from '@/components/shared/sick-days/badges'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function InternSickDaysPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['intern', 'sick-days', page],
    queryFn: () => listMySickDays({ page }),
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<RequestSickDayData>({
    resolver: zodResolver(requestSickDaySchema),
  })

  const mutation = useMutation({
    mutationFn: requestSickDay,
    onSuccess: () => {
      toast.success('Sick day request submitted')
      reset()
      queryClient.invalidateQueries({ queryKey: ['intern', 'sick-days'] })
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> }
        }
      }
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors?.date) {
        setError('date', { message: fieldErrors.date[0] })
        return
      }
      toast.error(err.response?.data?.message || 'Could not submit request')
    },
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="page-enter space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Sick days
        </h2>
        <p className="text-sm text-muted-foreground">
          Request time off for illness — approved days are excluded from
          attendance scoring
        </p>
      </div>

      <form
        className="mx-auto max-w-lg space-y-4 rounded-xl bg-card p-5 ring-1 ring-border/80 sm:mx-0"
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-1.5">
          <Label htmlFor="sick_date">Date</Label>
          <Input id="sick_date" type="date" {...register('date')} />
          {errors.date ? (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sick_reason">Reason</Label>
          <Textarea
            id="sick_reason"
            rows={3}
            placeholder="Optional"
            {...register('reason')}
          />
          {errors.reason ? (
            <p className="text-xs text-destructive">{errors.reason.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={mutation.isPending} className="gap-1">
          {mutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Submit request
        </Button>
      </form>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-8 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load requests</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No requests yet</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {row.date}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.reason || '—'}
                    </TableCell>
                    <TableCell>
                      <SickDayStatusBadge status={row.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {row.admin_notes || '—'}
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
