'use client'

import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Check, Loader2, RotateCcw, X } from 'lucide-react'
import { reviewLogbook } from '@/lib/api/admin/logbooks'
import {
  reviewLogbookSchema,
  type ReviewLogbookData,
} from '@/lib/validations/logbooks'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function ReviewLogbookForm({ logbookId }: { logbookId: number }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ReviewLogbookData>({
    resolver: zodResolver(reviewLogbookSchema),
    defaultValues: { action: 'approved', revision_note: '' },
  })

  const action = useWatch({ control, name: 'action' })
  const needsNote = action === 'rejected' || action === 'revision_needed'

  const mutation = useMutation({
    mutationFn: (data: ReviewLogbookData) => reviewLogbook(logbookId, data),
    onSuccess: (_, variables) => {
      const msg =
        variables.action === 'approved'
          ? 'Logbook approved'
          : variables.action === 'rejected'
            ? 'Logbook rejected'
            : 'Revision requested'
      toast.success(msg)
      queryClient.invalidateQueries({ queryKey: ['admin', 'logbooks'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'logbooks', logbookId],
      })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Review failed'
      toast.error(msg)
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border/80"
    >
      <div>
        <h3 className="font-heading text-base font-semibold">Review</h3>
        <p className="text-xs text-muted-foreground">
          Approve, reject, or request changes
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: 'approved', label: 'Approve', icon: Check },
            { value: 'revision_needed', label: 'Revision', icon: RotateCcw },
            { value: 'rejected', label: 'Reject', icon: X },
          ] as const
        ).map((opt) => (
          <Button
            key={opt.value}
            type="button"
            size="sm"
            variant={action === opt.value ? 'default' : 'outline'}
            className="gap-1.5"
            onClick={() => setValue('action', opt.value)}
          >
            <opt.icon className="size-3.5" />
            {opt.label}
          </Button>
        ))}
      </div>

      {needsNote ? (
        <div className="space-y-2">
          <Label htmlFor="revision_note">Feedback</Label>
          <Textarea
            id="revision_note"
            rows={4}
            placeholder="Explain what needs to change…"
            {...register('revision_note')}
          />
          {errors.revision_note && (
            <p className="text-sm text-destructive">
              {errors.revision_note.message}
            </p>
          )}
        </div>
      ) : null}

      <Button type="submit" disabled={mutation.isPending} className="w-full gap-2">
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : null}
        Submit review
      </Button>
    </form>
  )
}
