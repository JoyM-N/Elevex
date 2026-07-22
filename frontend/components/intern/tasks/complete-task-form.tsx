'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { completeTask } from '@/lib/api/intern/tasks'
import {
  completeTaskSchema,
  type CompleteTaskFormData,
} from '@/lib/validations/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export function CompleteTaskForm({ taskId }: { taskId: number }) {
  const queryClient = useQueryClient()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompleteTaskFormData>({
    resolver: zodResolver(completeTaskSchema),
    defaultValues: { actual_hours: undefined, notes: '' },
  })

  const mutation = useMutation({
    mutationFn: (data: CompleteTaskFormData) => completeTask(taskId, data),
    onSuccess: () => {
      toast.success('Task marked complete')
      queryClient.invalidateQueries({ queryKey: ['intern', 'tasks'] })
      queryClient.invalidateQueries({ queryKey: ['intern', 'tasks', taskId] })
      queryClient.invalidateQueries({ queryKey: ['intern', 'dashboard'] })
    },
    onError: (error: unknown) => {
      const msg =
        (error as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to complete task'
      toast.error(msg)
    },
  })

  return (
    <form
      onSubmit={handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4 rounded-xl bg-card p-4 ring-1 ring-border/80"
    >
      <div>
        <h3 className="font-heading text-base font-semibold">Mark complete</h3>
        <p className="text-xs text-muted-foreground">
          Record the hours you spent so performance metrics stay accurate.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="actual_hours">Actual hours</Label>
        <Input
          id="actual_hours"
          type="number"
          step="0.5"
          min="0.5"
          {...register('actual_hours', { valueAsNumber: true })}
        />
        {errors.actual_hours && (
          <p className="text-sm text-destructive">
            {errors.actual_hours.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea id="notes" rows={3} {...register('notes')} />
      </div>
      <Button type="submit" disabled={mutation.isPending} className="gap-2">
        {mutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <CheckCircle2 className="size-4" />
        )}
        Complete task
      </Button>
    </form>
  )
}
