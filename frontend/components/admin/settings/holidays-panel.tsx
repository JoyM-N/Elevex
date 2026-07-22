'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import {
  createPublicHoliday,
  deletePublicHoliday,
  listPublicHolidays,
} from '@/lib/api/admin/holidays'
import {
  createHolidaySchema,
  type CreateHolidayData,
} from '@/lib/validations/settings'
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

export function HolidaysPanel() {
  const queryClient = useQueryClient()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(String(currentYear))
  const [activeYear, setActiveYear] = useState(currentYear)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'public-holidays', activeYear],
    queryFn: () => listPublicHolidays({ year: activeYear }),
  })

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateHolidayData>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: { country: 'KE' },
  })

  const createMutation = useMutation({
    mutationFn: createPublicHoliday,
    onSuccess: () => {
      toast.success('Holiday added')
      reset({ name: '', date: '', country: 'KE' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'public-holidays'] })
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: {
          data?: { message?: string; errors?: Record<string, string[]> }
        }
      }
      const fieldErrors = err.response?.data?.errors
      if (fieldErrors) {
        for (const [key, messages] of Object.entries(fieldErrors)) {
          setError(key as keyof CreateHolidayData, { message: messages[0] })
        }
        return
      }
      toast.error(err.response?.data?.message || 'Could not add holiday')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePublicHoliday,
    onSuccess: () => {
      toast.success('Holiday removed')
      queryClient.invalidateQueries({ queryKey: ['admin', 'public-holidays'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || 'Could not delete holiday'
      toast.error(msg)
    },
  })

  return (
    <div className="space-y-6">
      <form
        className="grid gap-3 rounded-xl bg-card p-4 ring-1 ring-border/80 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        onSubmit={handleSubmit((data) => createMutation.mutate(data))}
      >
        <div className="space-y-1.5">
          <Label htmlFor="holiday_date">Date</Label>
          <Input id="holiday_date" type="date" {...register('date')} />
          {errors.date ? (
            <p className="text-xs text-destructive">{errors.date.message}</p>
          ) : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="holiday_name">Name</Label>
          <Input
            id="holiday_name"
            placeholder="e.g. Madaraka Day"
            {...register('name')}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>
        <Button type="submit" disabled={createMutation.isPending} className="gap-1">
          {createMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Add holiday
        </Button>
      </form>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="holiday_year">Year</Label>
          <Input
            id="holiday_year"
            type="number"
            className="w-28"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setActiveYear(Number(year) || currentYear)}
        >
          Filter
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : isError ? (
        <div className="rounded-xl bg-card p-6 text-center ring-1 ring-border/80">
          <p className="font-medium">Couldn&apos;t load holidays</p>
          <Button variant="outline" className="mt-3" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : (data ?? []).length === 0 ? (
        <div className="rounded-xl bg-card px-6 py-12 text-center ring-1 ring-border/80">
          <p className="font-heading text-lg font-semibold">No holidays</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add public holidays so attendance scoring skips them.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-border/80">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(data ?? []).map((holiday) => (
                <TableRow key={holiday.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {holiday.date}
                  </TableCell>
                  <TableCell className="font-medium">{holiday.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {holiday.country}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (
                          confirm(
                            `Remove ${holiday.name} (${holiday.date})?`
                          )
                        ) {
                          deleteMutation.mutate(holiday.id)
                        }
                      }}
                    >
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
