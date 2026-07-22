'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowLeft } from 'lucide-react'
import { getInternLogbook, updateLogbook } from '@/lib/api/intern/logbooks'
import { EditLogbookForm } from '@/components/intern/logbooks/logbook-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { LogbookUpdateData } from '@/lib/validations/logbooks'

export default function EditLogbookPage() {
  const params = useParams<{ id: string }>()
  const id = Number(params.id)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: logbook, isLoading, isError } = useQuery({
    queryKey: ['intern', 'logbooks', id],
    queryFn: () => getInternLogbook(id),
    enabled: Number.isFinite(id),
  })

  const mutation = useMutation({
    mutationFn: (data: LogbookUpdateData) => updateLogbook(id, data),
    onSuccess: () => {
      toast.success('Logbook updated')
      queryClient.invalidateQueries({ queryKey: ['intern', 'logbooks'] })
      router.push(`/intern/logbooks/${id}`)
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to update logbook'
      toast.error(msg)
    },
  })

  if (isLoading) return <Skeleton className="h-96 w-full max-w-xl rounded-xl" />
  if (isError || !logbook) {
    return <p className="text-sm text-muted-foreground">Logbook not found.</p>
  }

  if (
    logbook.is_locked ||
    (logbook.status !== 'draft' && logbook.status !== 'revision_needed')
  ) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This logbook cannot be edited.
        </p>
        <Button render={<Link href={`/intern/logbooks/${id}`} />}>
          Back to logbook
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
          render={<Link href={`/intern/logbooks/${id}`} />}
          className="mb-3 gap-1 px-0"
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Button>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Edit logbook
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Task: {logbook.task?.title ?? '—'}
        </p>
      </div>

      <EditLogbookForm
        key={logbook.id}
        defaultValues={{
          date: logbook.date,
          hours_worked: Number(logbook.hours_worked),
          description: logbook.description,
          blockers: logbook.blockers ?? '',
          learning_outcome: logbook.learning_outcome ?? '',
        }}
        isSubmitting={mutation.isPending}
        onSubmit={(data) => mutation.mutate(data)}
      />
    </div>
  )
}
