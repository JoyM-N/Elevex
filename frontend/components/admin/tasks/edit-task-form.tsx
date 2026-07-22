'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import {
  editableTaskStatusValues,
  taskPriorityValues,
  updateTaskSchema,
  type UpdateTaskFormData,
} from '@/lib/validations/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const STATUS_LABELS: Record<(typeof editableTaskStatusValues)[number], string> =
  {
    todo: 'To do',
    in_progress: 'In progress',
    in_review: 'In review',
    blocked: 'Blocked',
    cancelled: 'Cancelled',
  }

const PRIORITY_LABELS: Record<(typeof taskPriorityValues)[number], string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export function EditTaskForm({
  defaultValues,
  onSubmit,
  isSubmitting,
}: {
  defaultValues: UpdateTaskFormData
  onSubmit: (data: UpdateTaskFormData) => void | Promise<void>
  isSubmitting?: boolean
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateTaskFormData>({
    resolver: zodResolver(updateTaskSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" {...register('title')} />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...register('description')} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('status')}
          >
            {editableTaskStatusValues.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            {...register('priority')}
          >
            {taskPriorityValues.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="estimated_hours">Estimated hours</Label>
          <Input
            id="estimated_hours"
            type="number"
            step="0.5"
            min="0.5"
            {...register('estimated_hours', {
              setValueAs: (v) =>
                v === '' || v == null ? null : Number(v),
            })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" type="date" {...register('deadline')} />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="gap-2">
        {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  )
}
