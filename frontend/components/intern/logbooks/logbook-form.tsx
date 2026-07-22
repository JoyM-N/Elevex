'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { listInternTasks } from '@/lib/api/intern/tasks'
import {
  logbookFormSchema,
  logbookUpdateSchema,
  type LogbookFormData,
  type LogbookUpdateData,
} from '@/lib/validations/logbooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

function SharedFields({
  register,
  errors,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any
  errors: Partial<
    Record<
      'date' | 'hours_worked' | 'description' | 'blockers' | 'learning_outcome',
      { message?: string }
    >
  >
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input id="date" type="date" {...register('date')} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="hours_worked">Hours worked</Label>
          <Input
            id="hours_worked"
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            {...register('hours_worked', { valueAsNumber: true })}
          />
          {errors.hours_worked && (
            <p className="text-sm text-destructive">
              {errors.hours_worked.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">What did you work on?</Label>
        <Textarea id="description" rows={5} {...register('description')} />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="blockers">Blockers (optional)</Label>
        <Textarea id="blockers" rows={3} {...register('blockers')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="learning_outcome">Learning outcome (optional)</Label>
        <Textarea
          id="learning_outcome"
          rows={3}
          {...register('learning_outcome')}
        />
      </div>
    </>
  )
}

export function CreateLogbookForm({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (data: LogbookFormData) => void | Promise<void>
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogbookFormData>({
    resolver: zodResolver(logbookFormSchema),
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      description: '',
      blockers: '',
      learning_outcome: '',
    },
  })

  const { data: tasksData } = useQuery({
    queryKey: ['intern', 'tasks', { per_page: 100 }],
    queryFn: () => listInternTasks({ per_page: 100 }),
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="task_id">Task</Label>
        <select
          id="task_id"
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          {...register('task_id', { valueAsNumber: true })}
        >
          <option value="">Select a task…</option>
          {(tasksData?.data ?? []).map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
        {errors.task_id && (
          <p className="text-sm text-destructive">{errors.task_id.message}</p>
        )}
      </div>

      <SharedFields register={register} errors={errors} />

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Create draft
      </Button>
    </form>
  )
}

export function EditLogbookForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: LogbookUpdateData
  onSubmit: (data: LogbookUpdateData) => void | Promise<void>
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LogbookUpdateData>({
    resolver: zodResolver(logbookUpdateSchema),
    defaultValues,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-xl space-y-4"
    >
      <SharedFields register={register} errors={errors} />

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  )
}
